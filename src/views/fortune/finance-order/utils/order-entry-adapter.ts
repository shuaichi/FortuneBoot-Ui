/**
 * 单据关联流水适配层：兼容表单状态 -> V2 FinanceOrderEntryCommand -> multipart。
 * 这里的函数都是可测试的纯适配逻辑，bill-form.vue 直接复用，不为测试复制实现。
 */
import type {
  FinanceOrderEntryCommand,
  OrderIdLike
} from "@/api/fortune/finance-order-v2";
import {
  isLegalOrderAction,
  isMinimalPrincipalBillType,
  isOrderLinkedBillType,
  isSettleBillType,
  ORDER_COMPONENT,
  type OrderComponent,
  type OrderType
} from "@/views/fortune/finance-order/utils/order-contract";
import {
  type MoneyParseResult,
  isMoneyGreaterThan,
  MONEY_ERROR_MESSAGES,
  parseOrderAmountInput,
  sumMoneyList
} from "@/views/fortune/finance-order/utils/order-money";

export type EntrySubmitRoute =
  | "V2_ADD"
  | "V2_MODIFY"
  | "LEGACY_ADD"
  | "LEGACY_MODIFY";

function requireMoneyValue(parsed: MoneyParseResult): string {
  if ("value" in parsed) return parsed.value;
  throw new Error(MONEY_ERROR_MESSAGES[parsed.reason]);
}

function moneyFailureMessage(parsed: MoneyParseResult): string {
  if ("reason" in parsed) return MONEY_ERROR_MESSAGES[parsed.reason];
  throw new Error("金额校验结果异常");
}

/**
 * 分流规则（阶段07固定）：
 * - 有单据上下文（contextOrderId）一律走 V2；
 * - billType 7-12 或编辑行带 orderId 的关联流水走 V2；
 * - 普通 1/2/3 保持旧 /fortune/bill 接口。
 */
export function resolveEntrySubmitRoute(params: {
  mode: "add" | "edit";
  billType?: number | null;
  orderId?: OrderIdLike | null;
  hasOrderContext?: boolean;
}): EntrySubmitRoute {
  const v2 =
    params.hasOrderContext === true ||
    params.orderId != null ||
    isOrderLinkedBillType(params.billType);
  if (params.mode === "edit") {
    return v2 ? "V2_MODIFY" : "LEGACY_MODIFY";
  }
  return v2 ? "V2_ADD" : "LEGACY_ADD";
}

/** 指纹剔除字段：requestId / expectedVersion 的变化不更换 requestId */
const REQUEST_ID_EXCLUDED_KEYS = new Set(["requestId", "expectedVersion"]);

/** 稳定序列化：对象键排序，数组保留业务顺序 */
function canonicalStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(item => canonicalStringify(item)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter(
      key => !REQUEST_ID_EXCLUDED_KEYS.has(key) && record[key] !== undefined
    )
    .sort();
  const body = keys
    .map(key => `${JSON.stringify(key)}:${canonicalStringify(record[key])}`)
    .join(",");
  return `{${body}}`;
}

/** 幂等请求内容指纹（不含 requestId/expectedVersion） */
export function computeEntryFingerprint(
  command: Record<string, unknown>
): string {
  return canonicalStringify(command);
}

export interface EntryRequestIdState {
  fingerprint: string;
  requestId: string;
}

export interface EntryRequestIdResult {
  state: EntryRequestIdState;
  /** true=内容未变复用旧 UUID（超时重试场景），false=内容变化已重生成 */
  reused: boolean;
}

function randomRequestId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // 降级：理论上不会走到（现代浏览器/Node>=19）；保持 UUID 形态避免后端校验差异。
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 按 C06 规则取 requestId：
 * 同内容（含超时重试）复用 UUID；业务内容编辑后重新生成；
 * expectedVersion 变化本身不更换 requestId（从指纹中剔除）。
 */
export function ensureEntryRequestId(
  state: EntryRequestIdState | null | undefined,
  command: Record<string, unknown>
): EntryRequestIdResult {
  const fingerprint = computeEntryFingerprint(command);
  if (state && state.fingerprint === fingerprint) {
    return { state, reused: true };
  }
  const next: EntryRequestIdState = {
    fingerprint,
    requestId: randomRequestId()
  };
  return { state: next, reused: false };
}

/**
 * 组装 entries multipart：
 * - data part 必须是 application/json 类型的 Blob；
 * - files 逐个追加，内容编辑后调用方负责重新构建。
 */
export function buildEntryFormData(
  command: Record<string, unknown>,
  files?: Array<File | Blob> | null
): FormData {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(command)], { type: "application/json" })
  );
  for (const file of files ?? []) {
    if (file) {
      formData.append("files", file);
    }
  }
  return formData;
}

/** 解析 multipart 中 data part 的 JSON（测试与调用方共用） */
export async function parseEntryFormDataJson(
  formData: FormData
): Promise<Record<string, unknown>> {
  const dataPart = formData.get("data");
  if (!(dataPart instanceof Blob)) {
    throw new Error("FormData缺少application/json类型的data part");
  }
  return JSON.parse(await dataPart.text());
}

/** 组装 V2 EntryCommand 的输入参数（表单提交视角） */
export interface BuildEntryCommandInput {
  requestId: string;
  expectedVersion: OrderIdLike;
  orderComponent: OrderComponent;
  billType: number;
  title: string;
  tradeTime: string;
  bookId?: OrderIdLike | null;
  orderId?: OrderIdLike | null;
  billId?: OrderIdLike | null;
  accountId?: OrderIdLike | null;
  /** 本金类 9-12 金额文本（表单原值，统一这里 toFixed(2)） */
  amount?: string | number | null;
  convertedAmount?: string | number | null;
  payeeId?: OrderIdLike | null;
  toAccountId?: OrderIdLike | null;
  confirm: boolean;
  include?: boolean | null;
  categoryAmountPair?: Array<{
    categoryId?: OrderIdLike | null;
    amount?: string | number | null;
  }> | null;
  remark?: string | null;
  tagIdList?: Array<OrderIdLike> | null;
  memberIdList?: Array<OrderIdLike> | null;
  /** 关联流水禁止 extras，输入会被强制移除 */
  extras?: unknown;
}

/**
 * 构建 FinanceOrderEntryCommand：
 * - 9-12 使用 amount 字符串（toFixed(2)），categoryAmountPair 强制空数组；
 * - WRITE_OFF 强制清除 accountId/toAccountId/extras 且 confirm=true；
 * - 其他组合金额来自 categoryAmountPair（金额逐一转两位小数字符串）；
 * - 关联流水一律不带 extras。
 */
export function buildEntryCommand(
  input: BuildEntryCommandInput
): FinanceOrderEntryCommand {
  const component = isOrderLinkedBillType(input.billType)
    ? ORDER_COMPONENT.PRINCIPAL
    : input.orderComponent;
  const isWriteOff = component === ORDER_COMPONENT.WRITE_OFF;
  const isPrincipalMinimal = isMinimalPrincipalBillType(input.billType);
  const isAccessory =
    component === ORDER_COMPONENT.INTEREST ||
    component === ORDER_COMPONENT.FEE ||
    isWriteOff;

  let amount: string | null = null;
  if (isPrincipalMinimal) {
    const parsed = parseOrderAmountInput(
      input.amount as string | number | null
    );
    if (!parsed.ok) throw new Error(moneyFailureMessage(parsed));
    amount = requireMoneyValue(parsed);
  }

  let categoryAmountPair: FinanceOrderEntryCommand["categoryAmountPair"] = [];
  if (!isPrincipalMinimal && Array.isArray(input.categoryAmountPair)) {
    categoryAmountPair = input.categoryAmountPair
      .filter(pair => pair && pair.categoryId != null)
      .map(pair => {
        const parsed = parseOrderAmountInput(
          pair.amount as string | number | null
        );
        if (!parsed.ok) throw new Error(moneyFailureMessage(parsed));
        return {
          categoryId: pair.categoryId ?? null,
          amount: requireMoneyValue(parsed)
        };
      });
  }

  const converted = input.convertedAmount;
  const convertedAmount =
    converted == null || converted === ("" as unknown)
      ? null
      : (() => {
          const parsed = parseOrderAmountInput(converted);
          if (!parsed.ok) throw new Error(moneyFailureMessage(parsed));
          return requireMoneyValue(parsed);
        })();

  return {
    requestId: input.requestId,
    expectedVersion: input.expectedVersion,
    orderComponent: component,
    bookId: input.bookId ?? null,
    orderId: input.orderId ?? null,
    billId: input.billId ?? null,
    title: input.title,
    tradeTime: input.tradeTime,
    accountId: isWriteOff ? null : (input.accountId ?? null),
    amount,
    convertedAmount,
    payeeId: input.payeeId ?? null,
    billType: input.billType,
    toAccountId: isWriteOff ? null : (input.toAccountId ?? null),
    confirm: isWriteOff ? true : input.confirm,
    include: isAccessory ? true : (input.include ?? null),
    categoryAmountPair,
    remark: input.remark ?? "",
    tagIdList: input.tagIdList ?? null,
    memberIdList: input.memberIdList ?? null,
    extras: null
  };
}

/** 提交前置校验所需的单据上下文摘要（来自 V2 options/详情） */
export interface EntryValidationOrderInfo {
  orderId: OrderIdLike;
  type: OrderType;
  currencyCode?: string | null;
  pendingAmount?: string | number | null;
  status?: number | null;
  reconciliationStatus?: string | null;
}

export interface EntryValidationInput {
  mode: "add" | "edit";
  billType?: number | null;
  orderComponent?: OrderComponent | null;
  orderId?: OrderIdLike | null;
  amount?: string | number | null;
  categoryAmountPair?: Array<{
    categoryId?: OrderIdLike | null;
    amount?: string | number | null;
  }> | null;
  accountId?: OrderIdLike | null;
  accountCurrencyCode?: string | null;
  remark?: string | null;
  extrasCount?: number;
  order?: EntryValidationOrderInfo | null;
}

/**
 * 提交前业务校验（前端提示，后端终校验）。
 * 返回第一条违规文案；null 表示通过。
 */
export function validateOrderEntry(input: EntryValidationInput): string | null {
  const { billType } = input;
  if (billType == null) return "请选择交易类型";
  const component = isOrderLinkedBillType(billType)
    ? ORDER_COMPONENT.PRINCIPAL
    : (input.orderComponent ?? null);

  const linked = isOrderLinkedBillType(billType) || input.orderId != null;
  if (!linked) return null;

  if (input.orderId == null) return "请选择单据";

  // 合法动作矩阵（C04 白名单）
  if (input.order?.type != null) {
    if (!isLegalOrderAction(input.order.type, billType, component)) {
      return "当前单据类型不支持该流水类型";
    }
  }

  if (component === ORDER_COMPONENT.WRITE_OFF) {
    if (input.accountId != null) {
      return "差额结清为非现金操作，不能选择账户";
    }
    if ((input.extrasCount ?? 0) > 0) {
      return "差额结清不能包含附加费用/优惠";
    }
    if (!input.remark || input.remark.trim() === "") {
      return "差额结清必须填写原因";
    }
  } else if (input.accountId == null) {
    return "请选择账户";
  }

  // 金额：本金 9-12 用 amount；其余有单据流水用分类求和
  let submitAmount: string | null = null;
  if (isMinimalPrincipalBillType(billType)) {
    const parsed = parseOrderAmountInput(input.amount);
    if (!parsed.ok) return moneyFailureMessage(parsed);
    submitAmount = requireMoneyValue(parsed);
  } else {
    const pairs = (input.categoryAmountPair ?? []).filter(
      p => p && p.categoryId != null
    );
    if (pairs.length === 0) {
      return "请至少填写一条分类金额";
    }
    for (const pair of pairs) {
      const parsed = parseOrderAmountInput(pair.amount);
      if (!parsed.ok) return moneyFailureMessage(parsed);
    }
    submitAmount = sumMoneyList(pairs.map(p => p.amount));
    if (submitAmount == null) return MONEY_ERROR_MESSAGES.INVALID;
    const total = parseOrderAmountInput(submitAmount);
    if (!total.ok) return moneyFailureMessage(total);
    submitAmount = requireMoneyValue(total);
  }

  // 超额：结算类与差额结清不得超过单据待结清金额
  const pending = input.order?.pendingAmount;
  if (
    pending != null &&
    (isSettleBillType(billType) || component === ORDER_COMPONENT.WRITE_OFF)
  ) {
    if (isMoneyGreaterThan(submitAmount, pending)) {
      return "金额超过单据待结清金额，请核对后再提交";
    }
  }

  // 同币种：新现金流水账户币种必须与单据币种一致
  if (
    component !== ORDER_COMPONENT.WRITE_OFF &&
    input.order?.currencyCode &&
    input.accountCurrencyCode &&
    input.order.currencyCode !== input.accountCurrencyCode
  ) {
    return "账户币种必须与单据币种一致";
  }

  return null;
}
