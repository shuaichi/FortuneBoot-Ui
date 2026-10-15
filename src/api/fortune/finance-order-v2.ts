/**
 * 单据管理 V2 HTTP 客户端（C08）。
 * - GET 使用 params，JSON 命令使用 data；entries 走 multipart（data 为 application/json Blob）。
 * - V2 金额字段全部为十进制字符串。
 * - 业务错误（HTTP 200 但 ResponseDTO.code != 0）抛 FinanceOrderV2Error，保留 code。
 * - transport 可注入，便于测试替换；默认实现自带 token 头。
 */
import Axios, { type AxiosInstance } from "axios";
import { formatToken, getToken } from "@/utils/auth";
import type { BillExtraVo } from "@/api/fortune/bill";
import type {
  EntryAction,
  OrderComponent,
  ReconciliationStatus,
  SettlementState
} from "@/views/fortune/finance-order/utils/order-contract";

/** C08 业务错误码（30008-30020，写阶段占用固定区间） */
export const ORDER_ERROR_CODE = {
  ORDER_TYPE_MISMATCH: 30008,
  ORDER_OVER_SETTLED: 30009,
  ORDER_CHRONOLOGY_INVALID: 30010,
  ORDER_VERSION_CONFLICT: 30011,
  ORDER_CURRENCY_MISMATCH: 30012,
  ORDER_RECONCILIATION_REQUIRED: 30013,
  ORDER_HAS_PENDING_ENTRIES: 30014,
  ORDER_NOT_SETTLED: 30015,
  ORDER_REQUEST_CONFLICT: 30016,
  ORDER_ENTRY_IMMUTABLE: 30017,
  ORDER_HISTORY_EXISTS: 30018,
  ORDER_REFERENCE_INVALID: 30019,
  ORDER_AMOUNT_INVALID: 30020
} as const;
export type OrderErrorCode =
  (typeof ORDER_ERROR_CODE)[keyof typeof ORDER_ERROR_CODE];

const V2_BASE = "/fortune/finance/order/v2";

/** 业务错误：服务端 HTTP 200 但 code != 0 时抛出，保留 code/msg */
export class FinanceOrderV2Error extends Error {
  readonly code: number;

  constructor(code: number, msg: string) {
    super(msg || "单据操作失败");
    this.name = "FinanceOrderV2Error";
    this.code = code;
  }
}

export function isFinanceOrderV2Error(e: unknown): e is FinanceOrderV2Error {
  return e instanceof FinanceOrderV2Error;
}

export function isOrderVersionConflict(e: unknown): boolean {
  return (
    isFinanceOrderV2Error(e) &&
    e.code === ORDER_ERROR_CODE.ORDER_VERSION_CONFLICT
  );
}

/* ================= V2 数据模型（金额均为字符串） ================= */

/** ID 兼容服务端 Long 序列化：数字或数字字符串 */
export type OrderIdLike = number | string;

export interface FinanceOrderMutationVo {
  orderId: OrderIdLike;
  billId?: OrderIdLike | null;
  version: OrderIdLike;
  replayed?: boolean;
}

export interface FinanceOrderDetailVo {
  orderId: OrderIdLike;
  bookId: OrderIdLike;
  title: string;
  type: 1 | 2 | 3;
  typeDesc: string;
  status: number;
  statusDesc: string;
  counterpartyId?: OrderIdLike | null;
  counterpartyName?: string | null;
  currencyCode: string;
  dueDate?: string | null;
  submitTime?: string | null;
  closeTime?: string | null;
  remark?: string | null;
  version: OrderIdLike;
  reconciliationStatus?: ReconciliationStatus | null;
  reconciliationNote?: string | null;
  outAmount: string;
  inAmount: string;
  issuedAmount: string;
  settledAmount: string;
  adjustedAmount: string;
  /** 异常单据可能为 null（C09） */
  pendingAmount?: string | null;
  interestIncome: string;
  interestExpense: string;
  feeAmount: string;
  netCostOrIncome: string;
  settlementState?: SettlementState | null;
  pendingEntryCount: number;
  overdue: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canClose: boolean;
  canReopen: boolean;
  allowedEntryActions: EntryAction[];
  readOnlyReason?: string | null;
}

export interface FinanceOrderEntryCategoryAmountVo {
  categoryId?: OrderIdLike | null;
  categoryName?: string | null;
  icon?: string | null;
  amount: string;
}

export interface FinanceOrderEntryVo {
  billId: OrderIdLike;
  bookId: OrderIdLike;
  bookName?: string | null;
  title?: string | null;
  tradeTime: string;
  accountId?: OrderIdLike | null;
  orderId?: OrderIdLike | null;
  accountName?: string | null;
  amount: string;
  currencyCode?: string | null;
  toCurrencyCode?: string | null;
  convertedAmount?: string | null;
  payeeId?: OrderIdLike | null;
  payeeName?: string | null;
  billType: number;
  toAccountId?: OrderIdLike | null;
  toAccountName?: string | null;
  confirm?: boolean | null;
  include?: boolean | null;
  remark?: string | null;
  categoryAmountPair?: FinanceOrderEntryCategoryAmountVo[] | null;
  tagList?: Array<Record<string, unknown>> | null;
  memberList?: Array<Record<string, unknown>> | null;
  hasFile?: boolean;
  extras?: BillExtraVo[] | null;
  orderComponent?: OrderComponent | null;
  orderLedgerVersion?: number | null;
  recycleBin?: boolean | null;
  allowedActions: string[];
  readOnlyReason?: string | null;
}

export interface FinanceOrderAuditVo {
  id: OrderIdLike;
  orderId?: OrderIdLike | null;
  billId?: OrderIdLike | null;
  action: string;
  creatorId?: OrderIdLike | null;
  createTime: string;
  beforeJson?: string | null;
  afterJson?: string | null;
}

export interface FinanceOrderSummaryVo {
  currencyCode: string;
  receivableAmount: string;
  payableAmount: string;
  reimbursementAmount: string;
  overdueReceivableAmount: string;
  overduePayableAmount: string;
  overdueReimbursementAmount: string;
  receivableCount: number;
  payableCount: number;
  reimbursementCount: number;
  pendingEntryCount: number;
  reviewRequiredCount: number;
  orphanLegacyBillCount: number;
  asOfDate: string;
}

export interface FinanceOrderReconciliationVo {
  orderId?: OrderIdLike | null;
  billId?: OrderIdLike | null;
  bookId: OrderIdLike;
  version?: OrderIdLike | null;
  issueCodes: string[];
  originalStatus?: number | null;
  originalOutAmount?: string | null;
  originalInAmount?: string | null;
  candidateIssuedAmount?: string | null;
  candidateSettledAmount?: string | null;
  candidatePendingAmount?: string | null;
  accountIds: OrderIdLike[];
  currencyCodes: string[];
  cashEffectKnown: boolean;
  note?: string | null;
}

/* ================= 请求模型 ================= */

export interface FinanceOrderPageQuery {
  bookId: OrderIdLike;
  pageNum?: number;
  pageSize?: number;
  type?: 1 | 2 | 3 | null;
  status?: number | null;
  settlementState?: SettlementState | null;
  keyword?: string | null;
  overdueOnly?: boolean;
}

export interface FinanceOrderEntryQuery {
  pageNum?: number;
  pageSize?: number;
  entryStatus?: "ACTIVE" | "VOIDED" | "ALL";
}

export interface FinanceOrderOptionQuery {
  billType: number;
  keyword?: string | null;
  pageNum?: number;
  pageSize?: number;
}

export interface FinanceOrderCreateCommand {
  bookId: OrderIdLike;
  requestId: string;
  title: string;
  type: 1 | 2 | 3;
  counterpartyId?: OrderIdLike | null;
  counterpartyName: string;
  dueDate?: string | null;
  remark?: string;
}

export interface FinanceOrderMetadataCommand extends FinanceOrderCreateCommand {
  orderId: OrderIdLike;
  expectedVersion: OrderIdLike;
}

export interface FinanceOrderTransitionCommand {
  requestId: string;
  expectedVersion: OrderIdLike;
}

export type OrderTransitionAction = "close" | "reopen" | "remove";
export type OrderEntryAction = "confirm" | "unconfirm" | "void" | "restore";

export interface FinanceOrderEntryCategoryAmount {
  categoryId?: OrderIdLike | null;
  /** V2 金额字符串（toFixed(2)） */
  amount: string;
}

/** 单据关联流水 multipart data 部分 JSON（金额字符串） */
export interface FinanceOrderEntryCommand {
  requestId: string;
  expectedVersion: OrderIdLike;
  orderComponent: OrderComponent;
  bookId?: OrderIdLike | null;
  orderId?: OrderIdLike | null;
  billId?: OrderIdLike | null;
  title: string;
  tradeTime: string;
  accountId?: OrderIdLike | null;
  /** PRINCIPAL 9-12 必填；两位小数字符串 */
  amount?: string | null;
  convertedAmount?: string | null;
  payeeId?: OrderIdLike | null;
  billType: number;
  toAccountId?: OrderIdLike | null;
  confirm: boolean;
  include?: boolean | null;
  categoryAmountPair?: FinanceOrderEntryCategoryAmount[];
  remark?: string;
  tagIdList?: Array<OrderIdLike> | null;
  memberIdList?: Array<OrderIdLike> | null;
  extras?: BillExtraVo[] | null;
}

/* ================= 可注入 transport ================= */

export interface V2RequestSpec {
  method: "get" | "post" | "put" | "patch" | "delete";
  url: string;
  params?: unknown;
  data?: unknown;
}

/**
 * transport 返回值是 ResponseDTO.data 载荷。
 * 默认实现解析 {code,msg,data}：code===0 返回 data，否则抛 FinanceOrderV2Error。
 */
export type FinanceOrderV2Transport = (spec: V2RequestSpec) => Promise<unknown>;

interface FinanceOrderV2ResponseBody {
  code?: number;
  msg?: string | null;
  data?: unknown;
}

/** 统一解析 ResponseDTO：HTTP 200 但 code != 0 也必须识别为业务失败 */
export function unwrapFinanceOrderV2Response(
  body: FinanceOrderV2ResponseBody | null | undefined
): unknown {
  if (
    !body ||
    typeof body !== "object" ||
    typeof body.code !== "number" ||
    body.code !== 0
  ) {
    const code =
      body && typeof body === "object" && typeof body.code === "number"
        ? body.code
        : -1;
    throw new FinanceOrderV2Error(code, body?.msg || "单据操作失败");
  }
  return body.data;
}

let financeOrderV2AxiosInstance: AxiosInstance | null = null;

function getV2Axios(): AxiosInstance {
  if (financeOrderV2AxiosInstance) return financeOrderV2AxiosInstance;
  const instance = Axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
    timeout: 60000,
    headers: {
      Accept: "application/json, text/plain, */*",
      "X-Requested-With": "XMLHttpRequest"
    }
  });
  instance.interceptors.request.use(config => {
    const token = getToken()?.token;
    if (token) {
      config.headers.Authorization = formatToken(token);
    }
    return config;
  });
  financeOrderV2AxiosInstance = instance;
  return instance;
}

const defaultTransport: FinanceOrderV2Transport = async (
  spec: V2RequestSpec
) => {
  const isFormData =
    typeof FormData !== "undefined" && spec.data instanceof FormData;
  const response = await getV2Axios().request<FinanceOrderV2ResponseBody>({
    method: spec.method,
    url: spec.url,
    params: spec.params,
    data: spec.data,
    headers: isFormData
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" }
  });
  return unwrapFinanceOrderV2Response(response.data);
};

let activeTransport: FinanceOrderV2Transport = defaultTransport;

/** 仅测试使用：注入假 transport */
export function __setFinanceOrderV2TransportForTest(
  transport: FinanceOrderV2Transport
): void {
  activeTransport = transport;
}

/** 仅测试使用：恢复真实 transport */
export function __resetFinanceOrderV2TransportForTest(): void {
  activeTransport = defaultTransport;
}

async function callV2<T>(spec: V2RequestSpec): Promise<T> {
  return (await activeTransport(spec)) as T;
}

/* ================= REST 端点 ================= */

export function getFinanceOrderPageV2(
  params: FinanceOrderPageQuery
): Promise<PageDTO<FinanceOrderDetailVo>> {
  return callV2({ method: "get", url: `${V2_BASE}/page`, params });
}

export function getFinanceOrderDetailV2(
  bookId: OrderIdLike,
  orderId: OrderIdLike
): Promise<FinanceOrderDetailVo> {
  return callV2({ method: "get", url: `${V2_BASE}/${bookId}/${orderId}` });
}

export function getFinanceOrderEntriesV2(
  bookId: OrderIdLike,
  orderId: OrderIdLike,
  params?: FinanceOrderEntryQuery
): Promise<PageDTO<FinanceOrderEntryVo>> {
  return callV2({
    method: "get",
    url: `${V2_BASE}/${bookId}/${orderId}/entries`,
    params
  });
}

export function getFinanceOrderAuditV2(
  bookId: OrderIdLike,
  orderId: OrderIdLike,
  params?: { pageNum?: number; pageSize?: number }
): Promise<PageDTO<FinanceOrderAuditVo>> {
  return callV2({
    method: "get",
    url: `${V2_BASE}/${bookId}/${orderId}/audit`,
    params
  });
}

export function getFinanceOrderSummaryV2(
  bookId: OrderIdLike
): Promise<FinanceOrderSummaryVo> {
  return callV2({ method: "get", url: `${V2_BASE}/${bookId}/summary` });
}

export function getFinanceOrderOptionsV2(
  bookId: OrderIdLike,
  params: FinanceOrderOptionQuery
): Promise<PageDTO<FinanceOrderDetailVo>> {
  return callV2({
    method: "get",
    url: `${V2_BASE}/${bookId}/options`,
    params
  });
}

export function getFinanceOrderReconciliationV2(
  bookId: OrderIdLike,
  params?: { pageNum?: number; pageSize?: number }
): Promise<PageDTO<FinanceOrderReconciliationVo>> {
  return callV2({
    method: "get",
    url: `${V2_BASE}/${bookId}/reconciliation`,
    params
  });
}

export function confirmFinanceOrderReconciliationV2(
  bookId: OrderIdLike,
  orderId: OrderIdLike,
  data: FinanceOrderTransitionCommand
): Promise<FinanceOrderMutationVo> {
  return callV2({
    method: "post",
    url: `${V2_BASE}/${bookId}/${orderId}/reconciliation/confirm`,
    data
  });
}

export function createFinanceOrderV2(
  data: FinanceOrderCreateCommand
): Promise<FinanceOrderMutationVo> {
  return callV2({ method: "post", url: `${V2_BASE}/create`, data });
}

export function modifyFinanceOrderV2(
  data: FinanceOrderMetadataCommand
): Promise<FinanceOrderMutationVo> {
  return callV2({ method: "put", url: `${V2_BASE}/modify`, data });
}

export function transitionFinanceOrderV2(
  bookId: OrderIdLike,
  orderId: OrderIdLike,
  action: OrderTransitionAction,
  data: FinanceOrderTransitionCommand
): Promise<FinanceOrderMutationVo> {
  return callV2({
    method: "post",
    url: `${V2_BASE}/${bookId}/${orderId}/${action}`,
    data
  });
}

export function addOrderEntryV2(
  bookId: OrderIdLike,
  orderId: OrderIdLike,
  data: FormData
): Promise<FinanceOrderMutationVo> {
  return callV2({
    method: "post",
    url: `${V2_BASE}/${bookId}/${orderId}/entries`,
    data
  });
}

export function modifyOrderEntryV2(
  bookId: OrderIdLike,
  orderId: OrderIdLike,
  billId: OrderIdLike,
  data: FormData
): Promise<FinanceOrderMutationVo> {
  return callV2({
    method: "put",
    url: `${V2_BASE}/${bookId}/${orderId}/entries/${billId}`,
    data
  });
}

export function orderEntryActionV2(
  bookId: OrderIdLike,
  orderId: OrderIdLike,
  billId: OrderIdLike,
  action: OrderEntryAction,
  data: FinanceOrderTransitionCommand
): Promise<FinanceOrderMutationVo> {
  return callV2({
    method: "post",
    url: `${V2_BASE}/${bookId}/${orderId}/entries/${billId}/${action}`,
    data
  });
}
