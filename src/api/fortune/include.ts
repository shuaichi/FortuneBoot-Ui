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
  timePoint?: string;
}

export interface ExpenseTrendsQuery extends BaseQuery {
  timeGranularity?: number;
  timePoint?: string;
}

export interface AssetsLiabilitiesVo {
  totalAssets: number;
  totalLiabilities: number;
  netAssets: number;
}

export function getBillStatistics(bookId: number) {
  return http.request<ResponseData<BillStatisticsVo>>(
    "get",
    `/fortune/include/${bookId}/getBillStatistics`
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
