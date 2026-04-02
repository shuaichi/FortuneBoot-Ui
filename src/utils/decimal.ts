/**
 * 金额精确计算工具
 * 使用 decimal.js 解决 JavaScript 浮点数精度问题
 */
import Decimal from "decimal.js";

/**
 * 精确加法
 * @param a 第一个数
 * @param b 第二个数
 * @returns 精确求和结果
 */
export function add(a: number | string, b: number | string): number {
  return new Decimal(a).plus(b).toNumber();
}

/**
 * 精确减法
 * @param a 被减数
 * @param b 减数
 * @returns 精确差值结果
 */
export function subtract(a: number | string, b: number | string): number {
  return new Decimal(a).minus(b).toNumber();
}

/**
 * 精确乘法
 * @param a 第一个数
 * @param b 第二个数
 * @returns 精确乘积结果
 */
export function multiply(a: number | string, b: number | string): number {
  return new Decimal(a).times(b).toNumber();
}

/**
 * 精确除法
 * @param a 被除数
 * @param b 除数
 * @returns 精确商值结果
 */
export function divide(a: number | string, b: number | string): number {
  return new Decimal(a).dividedBy(b).toNumber();
}

/**
 * 精确求和（数组累加）
 * @param values 数值数组
 * @returns 精确求和结果
 */
export function sum(values: (number | string)[]): number {
  return values
    .reduce((acc, value) => acc.plus(value), new Decimal(0))
    .toNumber();
}

/**
 * 精确求和（对象数组，提取指定字段）
 * @param items 对象数组
 * @param field 要提取的字段名
 * @returns 精确求和结果
 */
export function sumBy<T>(items: T[], field: keyof T): number {
  return items
    .reduce(
      (acc, item) => acc.plus((item[field] as number | string) || 0),
      new Decimal(0)
    )
    .toNumber();
}

/**
 * 保留指定小数位数（四舍五入）
 * @param value 数值
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的数值
 */
export function round(value: number | string, decimals: number = 2): number {
  return new Decimal(value).toDecimalPlaces(decimals).toNumber();
}

/**
 * 比较两个数是否相等
 * @param a 第一个数
 * @param b 第二个数
 * @returns 是否相等
 */
export function equals(a: number | string, b: number | string): boolean {
  return new Decimal(a).equals(b);
}

/**
 * 比较两个数的大小
 * @param a 第一个数
 * @param b 第二个数
 * @returns 返回 1 (a > b), -1 (a < b), 0 (a == b)
 */
export function compare(a: number | string, b: number | string): number {
  return new Decimal(a).comparedTo(b);
}
