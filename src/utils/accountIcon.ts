/**
 * 账户图标工具
 *
 * 账户图标由用户在「账户管理」中自定义（Iconify 图标名，如 ep:wallet）。
 * 未自定义时按账户类型回退到默认图标，保证各业务页面展示一致。
 */

/** 账户类型默认图标：1-活期 2-信用 3-资产 4-贷款 */
export const ACCOUNT_TYPE_DEFAULT_ICON: Record<number, string> = {
  1: "ep:wallet",
  2: "ep:credit-card",
  3: "ep:coin",
  4: "ep:money"
};

/** 无法判断账户类型时的兜底图标 */
export const ACCOUNT_FALLBACK_ICON = "ep:credit-card";

interface AccountIconSource {
  /** 用户自定义图标 */
  icon?: string;
  /** 账户类型 */
  accountType?: number;
}

/**
 * 取账户展示图标：优先用户自定义图标，其次按账户类型回退，最后用兜底图标
 */
export function getAccountIcon(account?: AccountIconSource | null): string {
  if (!account) {
    return ACCOUNT_FALLBACK_ICON;
  }
  return (
    account.icon ||
    ACCOUNT_TYPE_DEFAULT_ICON[account.accountType] ||
    ACCOUNT_FALLBACK_ICON
  );
}
