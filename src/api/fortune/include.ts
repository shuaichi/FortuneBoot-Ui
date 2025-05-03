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
