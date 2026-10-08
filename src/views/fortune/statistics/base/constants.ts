/** 统计模块通用常量 */

/** 账户类型 com.fortuneboot.common.enums.fortune.AccountTypeEnum */
export const accountTypeOptions = [
  { value: 1, label: "活期" },
  { value: 2, label: "信用" },
  { value: 3, label: "资产" },
  { value: 4, label: "贷款" }
];

export function getAccountTypeName(accountType: number): string {
  return accountTypeOptions.find(t => t.value === accountType)?.label || "-";
}

/** 账单类型 com.fortuneboot.common.enums.fortune.BillTypeEnum */
export const billTypeOptions = [
  { value: 1, label: "支出" },
  { value: 2, label: "收入" },
  { value: 3, label: "转账" },
  { value: 4, label: "余额调整" },
  { value: 5, label: "盈利" },
  { value: 6, label: "亏损" },
  { value: 7, label: "垫付" },
  { value: 8, label: "报销" },
  { value: 9, label: "借出" },
  { value: 10, label: "收回" },
  { value: 11, label: "借入" },
  { value: 12, label: "归还" }
];

/** 支出与收入在统计报表中的语义颜色 */
export const EXPENSE_COLOR = "#67C23A";
export const EXPENSE_LIGHT_COLOR = "#E8F5E9";
export const INCOME_COLOR = "#F56C6C";
export const INCOME_LIGHT_COLOR = "#FDECEC";

/** 概览周期类型 */
export const periodTypeOptions = [
  { value: 1, label: "本月" },
  { value: 2, label: "本年" },
  { value: 3, label: "自定义" }
];

/** 趋势时间粒度：3=近12月 / 4=近5年 */
export const trendGranularityOptions = [
  { value: 3, label: "近12月" },
  { value: 4, label: "近5年" }
];

/** 首页收支趋势时间粒度 */
export const homeTrendGranularityOptions = [
  { value: 1, label: "近7天" },
  { value: 2, label: "月度" },
  { value: 3, label: "年度" },
  { value: 4, label: "历史年度" }
];
