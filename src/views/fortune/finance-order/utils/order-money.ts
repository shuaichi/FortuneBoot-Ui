/**
 * V2 单据金额工具（C02）。
 * 复用仓库现有 decimal.js；所有提交金额统一 toFixed(2) 十进制字符串；
 * 输入拒绝三位及以上小数，绝不截断；响应解析允许任意合法十进制。
 */
import Decimal from "decimal.js";

/** 契约 C02 金额上限 */
export const ORDER_AMOUNT_MAX = new Decimal("999999999999.99");

export type MoneyParseFailure =
  | "EMPTY"
  | "INVALID"
  | "NOT_POSITIVE"
  | "TOO_MANY_DECIMALS"
  | "EXCEED_MAX";

export type MoneyParseResult =
  | { ok: true; value: string; decimal: Decimal }
  | { ok: false; reason: MoneyParseFailure };

export const MONEY_ERROR_MESSAGES: Readonly<Record<MoneyParseFailure, string>> =
  {
    EMPTY: "金额不能为空",
    INVALID: "金额格式不正确",
    NOT_POSITIVE: "金额必须大于0",
    TOO_MANY_DECIMALS: "金额最多支持两位小数",
    EXCEED_MAX: "金额不能超过999999999999.99"
  };

function toDecimal(
  input: string | number | Decimal | null | undefined
): Decimal | null {
  if (input == null) return null;
  if (input instanceof Decimal) return input;
  if (typeof input === "string" && input.trim() === "") return null;
  if (typeof input === "number" && !Number.isFinite(input)) return null;
  try {
    return new Decimal(input as Decimal.Value);
  } catch {
    return null;
  }
}

/** 新输入必须按原始文本判断小数位，1.230 虽然数值等于 1.23 仍属三位小数 */
function rawDecimalPlaces(input: string | number): number {
  const text = String(input).trim();
  const dotIndex = text.indexOf(".");
  if (dotIndex === -1) return 0;
  return text.length - dotIndex - 1;
}

/**
 * 解析用户输入金额：必须为正、最多两位小数、不超过上限。
 * 非法精度直接拒绝，不取整、不截断。
 */
export function parseOrderAmountInput(
  input: string | number | null | undefined
): MoneyParseResult {
  if (input == null || (typeof input === "string" && input.trim() === "")) {
    return { ok: false, reason: "EMPTY" };
  }
  const decimal = toDecimal(input);
  if (!decimal) return { ok: false, reason: "INVALID" };
  if (!decimal.isFinite() || decimal.lte(0)) {
    return { ok: false, reason: "NOT_POSITIVE" };
  }
  if (decimal.decimalPlaces() > 2 || rawDecimalPlaces(input) > 2) {
    return { ok: false, reason: "TOO_MANY_DECIMALS" };
  }
  if (decimal.gt(ORDER_AMOUNT_MAX)) {
    return { ok: false, reason: "EXCEED_MAX" };
  }
  return { ok: true, value: decimal.toFixed(2), decimal };
}

/**
 * 解析响应金额字符串；响应允许零/负数（例如净收支），
 * 但必须是有限十进制，否则返回 null。
 */
export function parseOrderAmountResponse(
  input: string | number | null | undefined
): Decimal | null {
  const decimal = toDecimal(input);
  if (!decimal || !decimal.isFinite()) return null;
  return decimal;
}

/** 统一两位小数字符串输出（提交/展示口径） */
export function toMoneyFixed2(
  input: string | number | Decimal | null | undefined
): string | null {
  const decimal = toDecimal(input);
  if (!decimal || !decimal.isFinite()) return null;
  return decimal.toFixed(2);
}

/** 展示金额：千分位 + 两位小数；异常/空值返回“待核对” */
export function formatOrderAmountText(
  input: string | number | Decimal | null | undefined,
  options: { emptyText?: string } = {}
): string {
  const value = toMoneyFixed2(input);
  if (value == null) return options.emptyText ?? "待核对";
  const [integer, decimal] = value.split(".");
  const sign = integer.startsWith("-") ? "-" : "";
  const digits = sign ? integer.slice(1) : integer;
  return `${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${decimal}`;
}

/** compareTo 语义：a<b 返回-1，相等返回0，a>b 返回1；非法输入返回 null */
export function compareMoney(
  a: string | number | null | undefined,
  b: string | number | null | undefined
): -1 | 0 | 1 | null {
  const da = toDecimal(a);
  const db = toDecimal(b);
  if (!da || !db) return null;
  return da.comparedTo(db) as -1 | 0 | 1;
}

/** a > b（任意一侧不可解析视为 false） */
export function isMoneyGreaterThan(
  a: string | number | null | undefined,
  b: string | number | null | undefined
): boolean {
  return compareMoney(a, b) === 1;
}

/** 分类金额求和（两位小数字符串输出），任意一项非法返回 null */
export function sumMoneyList(
  values: Array<string | number | null | undefined>
): string | null {
  let total = new Decimal(0);
  for (const v of values) {
    const d = toDecimal(v);
    if (!d || !d.isFinite()) return null;
    total = total.plus(d);
  }
  return total.toFixed(2);
}

/**
 * ID 归一化：接受 number 或 string，统一输出字符串保留 Long 精度。
 * 不安全的 number（超过 2^53-1 或非整数）抛错，避免静默丢精度。
 */
export function normalizeId(id: number | string): string {
  if (typeof id === "string") {
    const trimmed = id.trim();
    if (trimmed === "") throw new Error("ID不能为空字符串");
    return trimmed;
  }
  if (!Number.isSafeInteger(id)) {
    throw new Error(`ID超出安全整数范围：${id}`);
  }
  return String(id);
}

/** 可选 ID 归一化 */
export function normalizeOptionalId(
  id: number | string | null | undefined
): string | null {
  if (id == null || id === "") return null;
  return normalizeId(id);
}
