import { http } from "@/utils/http";

export interface BillStatisticsVo {
  income: number;
  expense: number;
  surplus: number;
}

export interface PieVo {
  percent: number;
  name: string;
  value: number;
}
export interface BarVo {
  name: string;
  value: number;
}

export interface LineVo {
  name: string;
  value: number;
}

export interface BaseQuery {
  groupId?: number;
  bookId?: number;
}

export interface IncomeTrendsQuery extends BaseQuery {
  timeGranularity?: number;
  timePoint?: Date;
}

export interface ExpenseTrendsQuery extends BaseQuery {
  timeGranularity?: number;
  timePoint?: Date;
}

export interface AssetsLiabilitiesVo {
  totalAssets: number;
  totalLiabilities: number;
  netAssets: number;
}

export interface BillReportQuery {
  bookId?: number;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  accountIds?: Array<number>;
  payeeIds?: Array<number>;
  categoryIds?: Array<number>;
  tagIds?: Array<number>;
}

export interface PayeeReportQuery {
  bookId?: number;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  accountIds?: Array<number>;
  payeeIds?: Array<number>;
  categoryIds?: Array<number>;
  tagIds?: Array<number>;
}

export interface TagReportQuery {
  bookId?: number;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  accountIds?: Array<number>;
  payeeIds?: Array<number>;
  categoryIds?: Array<number>;
  tagIds?: Array<number>;
}

export function getBillStatistics(params: object) {
  return http.request<ResponseData<BillStatisticsVo>>(
    "get",
    `/fortune/include/getBillStatistics`,
    {
      params
    }
  );
}

export function getTotalAssets(groupId: number) {
  return http.request<ResponseData<Array<PieVo>>>(
    "get",
    `/fortune/include/${groupId}/getTotalAssets`
  );
}

export function getTotalLiabilities(groupId: number) {
  return http.request<ResponseData<Array<PieVo>>>(
    "get",
    `/fortune/include/${groupId}/getTotalLiabilities`
  );
}

export function getIncomeTrends(params: IncomeTrendsQuery) {
  return http.request<ResponseData<Array<LineVo>>>(
    "get",
    `/fortune/include/getIncomeTrends`,
    { params }
  );
}

export function getExpenseTrends(params: ExpenseTrendsQuery) {
  return http.request<ResponseData<Array<LineVo>>>(
    "get",
    `/fortune/include/getExpenseTrends`,
    { params }
  );
}

export function getAssetsLiabilities(groupId: number) {
  return http.request<ResponseData<AssetsLiabilitiesVo>>(
    "get",
    `/fortune/include/${groupId}/getFortuneAssetsLiabilities`
  );
}

export function getCategoryExpenseApi(params: BillReportQuery) {
  return http.request<ResponseData<Array<PieVo>>>(
    "get",
    "/fortune/include/getCategoryExpense",
    { params }
  );
}

export function getCategoryIncomeApi(params: BillReportQuery) {
  return http.request<ResponseData<Array<PieVo>>>(
    "get",
    "/fortune/include/getCategoryIncome",
    { params }
  );
}

export function getPayeeExpenseApi(params: BillReportQuery) {
  return http.request<ResponseData<Array<PieVo>>>(
    "get",
    "/fortune/include/getPayeeExpense",
    { params }
  );
}

export function getPayeeIncomeApi(params: BillReportQuery) {
  return http.request<ResponseData<Array<PieVo>>>(
    "get",
    "/fortune/include/getPayeeIncome",
    { params }
  );
}

export function getTagExpenseApi(params: BillReportQuery) {
  return http.request<ResponseData<Array<PieVo>>>(
    "get",
    "/fortune/include/getTagExpense",
    { params }
  );
}

export function getTagIncomeApi(params: BillReportQuery) {
  return http.request<ResponseData<Array<PieVo>>>(
    "get",
    "/fortune/include/getTagIncome",
    { params }
  );
}

export function getDisplayConfig() {
  return http.request<ResponseData<boolean>>(
    "get",
    "/fortune/include/getDisplayConfig",
    {}
  );
}

/* ========== 统计模块扩展（Dashboard / 报表 / 资产负债 / 借贷理财） ========== */

/** 通用筛选入参基类 */
export interface BillIncludeQuery {
  bookId?: number;
  startDate?: Date;
  endDate?: Date;
  title?: string;
  billType?: number;
  categoryIds?: Array<number>;
  tagIds?: Array<number>;
  payeeIds?: Array<number>;
  accountIds?: Array<number>;
  memberIds?: Array<number>;
  confirm?: boolean;
  include?: boolean;
}

/* ---------- 场景 A · 概览看板 ---------- */

export interface DashboardQuery {
  bookId?: number;
  groupId?: number;
  /** 1=本月（默认）2=本年 3=自定义 */
  periodType?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface DashboardVo {
  period: BillStatisticsVo;
  previous: BillStatisticsVo;
  ringIncomeRate: number;
  ringExpenseRate: number;
  totalAssets: number;
  totalLiabilities: number;
  netAssets: number;
  avgDailyExpense: number;
  maxSingleExpense: number;
  unconfirmedCount: number;
  pendingReceivable: number;
  recentTrend: Array<LineVo>;
}

export function getDashboard(params: DashboardQuery) {
  return http.request<ResponseData<DashboardVo>>(
    "get",
    "/fortune/include/dashboard",
    { params }
  );
}

/** 净资产趋势 periodType：3=近12月 / 4=近5年 */
export function getNetAssetsTrend(groupId: number, periodType: number) {
  return http.request<ResponseData<Array<LineVo>>>(
    "get",
    `/fortune/include/${groupId}/netAssetsTrend`,
    { params: { periodType } }
  );
}

/* ---------- 场景 B · 收支报表增强 ---------- */

export interface BillCompareVo {
  name: string;
  income: number;
  expense: number;
}

export interface BillCompareQuery extends BillIncludeQuery {
  /** 1=按月对比 / 2=按年对比 */
  compareType?: number;
}

export function getBillCompare(params: BillCompareQuery) {
  return http.request<ResponseData<Array<BillCompareVo>>>(
    "get",
    "/fortune/include/getBillCompare",
    { params }
  );
}

export interface BillRankQuery extends BillIncludeQuery {
  /** 1 支出 / 2 收入 */
  billType?: number;
  /** 默认 10 */
  topN?: number;
}

export function getBillRank(params: BillRankQuery) {
  return http.request<ResponseData<Array<BarVo>>>(
    "get",
    "/fortune/include/getBillRank",
    { params }
  );
}

/** 收支日历粒度：1=月度每日 / 2=年度每月 / 3=历史年度 */
export enum IncomeExpenseCalendarGranularity {
  MonthlyDaily = 1,
  YearlyMonthly = 2,
  HistoricalYearly = 3
}

export interface IncomeExpenseCalendarQuery extends BillIncludeQuery {
  bookId: number;
  granularity: IncomeExpenseCalendarGranularity;
  year?: number;
  month?: number;
  startYear?: number;
  endYear?: number;
}

export interface IncomeExpenseCalendarItemVo {
  period: string;
  income: number;
  expense: number;
  incomeCount: number;
  expenseCount: number;
}

export interface IncomeExpenseCalendarVo {
  startDate: string;
  endDate: string;
  granularity: IncomeExpenseCalendarGranularity;
  items: Array<IncomeExpenseCalendarItemVo>;
}

/** 收支日历：按日、月或历史年度聚合收支金额及笔数 */
export function getIncomeExpenseCalendar(params: IncomeExpenseCalendarQuery) {
  return http.request<ResponseData<IncomeExpenseCalendarVo>>(
    "get",
    "/fortune/include/getIncomeExpenseCalendar",
    { params }
  );
}

/** 日历热力图单日收支汇总 */
export interface HeatmapVo {
  date: string;
  income: number;
  expense: number;
  incomeCount: number;
  expenseCount: number;
}

/** 日历热力图：按日汇总收入和支出金额 */
export interface CalendarHeatmapQuery extends BillIncludeQuery {
  bookId: number;
  year: number;
}

export function getCalendarHeatmap(params: CalendarHeatmapQuery) {
  return http.request<ResponseData<Array<HeatmapVo>>>(
    "get",
    "/fortune/include/getCalendarHeatmap",
    { params }
  );
}

export interface DateIncludeQuery {
  bookId?: number;
  startDate?: Date;
  endDate?: Date;
}

/** 日期统计：每日金额 */
export function getDateInclude(params: DateIncludeQuery) {
  return http.request<ResponseData<Array<LineVo>>>(
    "get",
    "/fortune/include/getDateInclude",
    { params }
  );
}

/* ---------- 场景 C · 多维度统计扩展 ---------- */

export interface AccountIncludeVo {
  accountId: number;
  accountName: string;
  accountType: number;
  amount: number;
  percent: number;
}

export interface DimensionIncludeQuery extends BillIncludeQuery {
  /** 1 支出 / 2 收入 */
  billType?: number;
}

/** 账户维度统计 */
export function getAccountInclude(params: DimensionIncludeQuery) {
  return http.request<ResponseData<Array<AccountIncludeVo>>>(
    "get",
    "/fortune/include/getAccountInclude",
    { params }
  );
}

/** 成员维度统计 */
export function getMemberInclude(params: DimensionIncludeQuery) {
  return http.request<ResponseData<Array<BarVo>>>(
    "get",
    "/fortune/include/getMemberInclude",
    { params }
  );
}

/** 账单类型分布 */
export function getBillTypeDistribution(params: BillIncludeQuery) {
  return http.request<ResponseData<Array<PieVo>>>(
    "get",
    "/fortune/include/getBillTypeDistribution",
    { params }
  );
}

/* ---------- 场景 D · 资产负债增强 ---------- */

export interface AccountTypeAssetsVo {
  accountType: number;
  accountTypeName: string;
  assets: number;
  liabilities: number;
  accountCount: number;
}

/** 账户类型资产分布 */
export function getAssetsByAccountType(groupId: number) {
  return http.request<ResponseData<Array<AccountTypeAssetsVo>>>(
    "get",
    `/fortune/include/${groupId}/getAssetsByAccountType`
  );
}

export interface CreditCardVo {
  accountId: number;
  accountName: string;
  creditLimit: number;
  usedAmount: number;
  available: number;
  usageRate: number;
}

/** 信用卡额度看板 */
export function getCreditCardOverview(groupId: number) {
  return http.request<ResponseData<Array<CreditCardVo>>>(
    "get",
    `/fortune/include/${groupId}/getCreditCardOverview`
  );
}

/** 账户余额趋势 periodType：3=近12月 / 4=近5年 */
export function getAccountBalanceTrend(accountId: number, periodType: number) {
  return http.request<ResponseData<Array<LineVo>>>(
    "get",
    "/fortune/include/getAccountBalanceTrend",
    { params: { accountId, periodType } }
  );
}

/* ---------- 场景 E · 借贷与理财 ---------- */

export interface LoanDetailVo {
  payeeName: string;
  amount: number;
  lastTradeTime: string;
}

export interface LoanOverviewVo {
  totalReceivable: number;
  totalPayable: number;
  receivableCount: number;
  payableCount: number;
  topReceivables: Array<LoanDetailVo>;
}

/** 借贷总览 */
export function getLoanOverview(bookId: number) {
  return http.request<ResponseData<LoanOverviewVo>>(
    "get",
    `/fortune/include/${bookId}/getLoanOverview`
  );
}

export interface FinanceProfitVo {
  orderId: number;
  title: string;
  outAmount: number;
  inAmount: number;
  profit: number;
  profitRate: number;
}

/** 理财收益统计 */
export function getFinanceProfit(
  bookId: number,
  params: { startDate?: Date; endDate?: Date }
) {
  return http.request<ResponseData<Array<FinanceProfitVo>>>(
    "get",
    `/fortune/include/${bookId}/getFinanceProfit`,
    { params }
  );
}

/* ---------- 场景 F · 通用能力 ---------- */

export interface IncludePolicyVo {
  excludeTransferFromExpense: boolean;
  excludeLoanFromExpense: boolean;
  includeUnconfirmed: boolean;
}

/** 统计口径开关说明 */
export function getIncludePolicy() {
  return http.request<ResponseData<IncludePolicyVo>>(
    "get",
    "/fortune/include/getIncludePolicy"
  );
}
