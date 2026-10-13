/**
 * 单据管理固定契约（C01/C04）前端常量与合法组合矩阵。
 * 命名以服务端契约为准，不允许自改名：
 * 单据：1=费用报销单、2=债权单、3=债务单；
 * 流水：7垫付、8报销到账、9借出、10收回本金、11借入、12归还本金。
 */

/** 单据类型 */
export const ORDER_TYPE = {
  EXPENSE_CLAIM: 1,
  LOAN_OUT: 2,
  LOAN_IN: 3
} as const;
export type OrderType = (typeof ORDER_TYPE)[keyof typeof ORDER_TYPE];

export const ORDER_TYPE_OPTIONS: ReadonlyArray<{
  value: OrderType;
  label: string;
}> = [
  { value: ORDER_TYPE.EXPENSE_CLAIM, label: "费用报销单" },
  { value: ORDER_TYPE.LOAN_OUT, label: "债权单" },
  { value: ORDER_TYPE.LOAN_IN, label: "债务单" }
];

export const ORDER_TYPE_LABELS: Readonly<Record<OrderType, string>> = {
  [ORDER_TYPE.EXPENSE_CLAIM]: "费用报销单",
  [ORDER_TYPE.LOAN_OUT]: "债权单",
  [ORDER_TYPE.LOAN_IN]: "债务单"
};

/** 单据状态：100草稿 / 200进行中 / 1000已归档 */
export const ORDER_STATUS = {
  DRAFT: 100,
  ONGOING: 200,
  ARCHIVED: 1000
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** 单据组件 */
export const ORDER_COMPONENT = {
  PRINCIPAL: "PRINCIPAL",
  INTEREST: "INTEREST",
  FEE: "FEE",
  WRITE_OFF: "WRITE_OFF"
} as const;
export type OrderComponent =
  (typeof ORDER_COMPONENT)[keyof typeof ORDER_COMPONENT];

/** 结算状态（只读展示） */
export const SETTLEMENT_STATE = {
  EMPTY: "EMPTY",
  UNSETTLED: "UNSETTLED",
  PARTIAL: "PARTIAL",
  SETTLED: "SETTLED",
  REVIEW_REQUIRED: "REVIEW_REQUIRED"
} as const;
export type SettlementState =
  (typeof SETTLEMENT_STATE)[keyof typeof SETTLEMENT_STATE];

/** 对账状态 */
export const RECONCILIATION_STATUS = {
  READY: "READY",
  REVIEW_REQUIRED: "REVIEW_REQUIRED"
} as const;
export type ReconciliationStatus =
  (typeof RECONCILIATION_STATUS)[keyof typeof RECONCILIATION_STATUS];

/** 详情主按钮动作 */
export const ENTRY_ACTION = {
  ADVANCE: "ADVANCE",
  REIMBURSE: "REIMBURSE",
  LOAN_OUT: "LOAN_OUT",
  LOAN_RECOVER: "LOAN_RECOVER",
  LOAN_IN: "LOAN_IN",
  LOAN_REPAY: "LOAN_REPAY",
  INTEREST_IN: "INTEREST_IN",
  INTEREST_OUT: "INTEREST_OUT",
  FEE: "FEE",
  WRITE_OFF: "WRITE_OFF"
} as const;
export type EntryAction = (typeof ENTRY_ACTION)[keyof typeof ENTRY_ACTION];

/** 单据关联流水类型（7-12） */
export const ORDER_LINKED_BILL_TYPE = {
  ADVANCE: 7,
  REIMBURSE: 8,
  LOAN_OUT: 9,
  LOAN_RECOVER: 10,
  LOAN_IN: 11,
  LOAN_REPAY: 12
} as const;
export type OrderLinkedBillType =
  (typeof ORDER_LINKED_BILL_TYPE)[keyof typeof ORDER_LINKED_BILL_TYPE];

export const ORDER_LINKED_BILL_TYPES: ReadonlyArray<number> = [
  ORDER_LINKED_BILL_TYPE.ADVANCE,
  ORDER_LINKED_BILL_TYPE.REIMBURSE,
  ORDER_LINKED_BILL_TYPE.LOAN_OUT,
  ORDER_LINKED_BILL_TYPE.LOAN_RECOVER,
  ORDER_LINKED_BILL_TYPE.LOAN_IN,
  ORDER_LINKED_BILL_TYPE.LOAN_REPAY
];

/** 通用表单仅「金额+账户+单据+日期」的本金类流水类型 */
export const MINIMAL_PRINCIPAL_BILL_TYPES: ReadonlyArray<number> = [
  ORDER_LINKED_BILL_TYPE.LOAN_OUT,
  ORDER_LINKED_BILL_TYPE.LOAN_RECOVER,
  ORDER_LINKED_BILL_TYPE.LOAN_IN,
  ORDER_LINKED_BILL_TYPE.LOAN_REPAY
];

/** 结算类流水（结算金额不得超过待结清金额） */
export const SETTLE_BILL_TYPES: ReadonlyArray<number> = [
  ORDER_LINKED_BILL_TYPE.REIMBURSE,
  ORDER_LINKED_BILL_TYPE.LOAN_RECOVER,
  ORDER_LINKED_BILL_TYPE.LOAN_REPAY
];

/** 流水类型标签（含旧类型，列表/筛选/表单共用） */
export const BILL_TYPE_LABELS: Readonly<Record<number, string>> = {
  1: "支出",
  2: "收入",
  3: "转账",
  4: "余额调整",
  7: "垫付",
  8: "报销到账",
  9: "借出",
  10: "收回本金",
  11: "借入",
  12: "归还本金"
};

/** 列表/筛选/表单共用的类型选项；不在列表中的未知类型不得回退为支出 */
export const BILL_TYPE_OPTIONS: ReadonlyArray<{
  value: number;
  label: string;
}> = Object.entries(BILL_TYPE_LABELS).map(([value, label]) => ({
  value: Number(value),
  label
}));

export function isOrderLinkedBillType(
  billType?: number | null
): billType is OrderLinkedBillType {
  return billType != null && ORDER_LINKED_BILL_TYPES.includes(billType);
}

export function isMinimalPrincipalBillType(billType?: number | null): boolean {
  return billType != null && MINIMAL_PRINCIPAL_BILL_TYPES.includes(billType);
}

export function isSettleBillType(billType?: number | null): boolean {
  return billType != null && SETTLE_BILL_TYPES.includes(billType);
}

/**
 * 现金方向：-1 支出账户可用性（canExpense），+1 收入（canIncome）。
 * 转账/余额调整返回 0，由调用方走原有逻辑。
 */
export function getCashDirection(
  billType?: number | null,
  component?: OrderComponent | null
): -1 | 0 | 1 {
  if (component === ORDER_COMPONENT.WRITE_OFF) return 0;
  if (
    billType === 1 ||
    billType === ORDER_LINKED_BILL_TYPE.ADVANCE ||
    billType === ORDER_LINKED_BILL_TYPE.LOAN_OUT ||
    billType === ORDER_LINKED_BILL_TYPE.LOAN_REPAY
  ) {
    return -1;
  }
  if (
    billType === 2 ||
    billType === ORDER_LINKED_BILL_TYPE.REIMBURSE ||
    billType === ORDER_LINKED_BILL_TYPE.LOAN_RECOVER ||
    billType === ORDER_LINKED_BILL_TYPE.LOAN_IN
  ) {
    return 1;
  }
  return 0;
}

/** 各单据类型的本金类形成/结算流水类型 */
export function getPrincipalBillTypes(orderType: OrderType): {
  issue: OrderLinkedBillType;
  settle: OrderLinkedBillType;
} {
  switch (orderType) {
    case ORDER_TYPE.EXPENSE_CLAIM:
      return {
        issue: ORDER_LINKED_BILL_TYPE.ADVANCE,
        settle: ORDER_LINKED_BILL_TYPE.REIMBURSE
      };
    case ORDER_TYPE.LOAN_OUT:
      return {
        issue: ORDER_LINKED_BILL_TYPE.LOAN_OUT,
        settle: ORDER_LINKED_BILL_TYPE.LOAN_RECOVER
      };
    case ORDER_TYPE.LOAN_IN:
      return {
        issue: ORDER_LINKED_BILL_TYPE.LOAN_IN,
        settle: ORDER_LINKED_BILL_TYPE.LOAN_REPAY
      };
  }
}

/** C04 合法组合白名单 */
const LEGAL_ACTION_MATRIX: ReadonlyArray<{
  orderTypes: ReadonlyArray<OrderType>;
  component: OrderComponent;
  billTypes: ReadonlyArray<number>;
}> = [
  { orderTypes: [1], component: "PRINCIPAL", billTypes: [7, 8] },
  { orderTypes: [2], component: "PRINCIPAL", billTypes: [9, 10] },
  { orderTypes: [3], component: "PRINCIPAL", billTypes: [11, 12] },
  { orderTypes: [2], component: "INTEREST", billTypes: [2] },
  { orderTypes: [3], component: "INTEREST", billTypes: [1] },
  { orderTypes: [1, 2, 3], component: "FEE", billTypes: [1] },
  { orderTypes: [1, 2], component: "WRITE_OFF", billTypes: [1] },
  { orderTypes: [3], component: "WRITE_OFF", billTypes: [2] }
];

/**
 * 校验「单据类型 + 流水类型 + 组件」是否合法。
 * 7-12 的 component 服务端规范化为 PRINCIPAL，这里同样处理：
 * 传入空组件时本金类流水按 PRINCIPAL 判定。
 */
export function isLegalOrderAction(
  orderType: OrderType | null | undefined,
  billType: number | null | undefined,
  component?: OrderComponent | null
): boolean {
  if (orderType == null || billType == null) return false;
  const normalizedComponent =
    component ??
    (isOrderLinkedBillType(billType) ? ORDER_COMPONENT.PRINCIPAL : null);
  if (normalizedComponent == null) return false;
  return LEGAL_ACTION_MATRIX.some(
    rule =>
      rule.orderTypes.includes(orderType) &&
      rule.component === normalizedComponent &&
      rule.billTypes.includes(billType)
  );
}

/** 附属流水（INTEREST/FEE/WRITE_OFF 走 1/2） */
export function isAccessoryComponent(
  component?: OrderComponent | null
): boolean {
  return (
    component === ORDER_COMPONENT.INTEREST ||
    component === ORDER_COMPONENT.FEE ||
    component === ORDER_COMPONENT.WRITE_OFF
  );
}
