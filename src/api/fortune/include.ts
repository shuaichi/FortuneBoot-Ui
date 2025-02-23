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

export interface IncomeQuery extends BaseQuery {
  timeGranularity?: number;
  timePoint?: Date;
}
export interface ExpenseQuery extends BaseQuery {
  timeGranularity?: number;
  timePoint?: Date;
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

export function getIncomeTrends(bookId: number) {
  return http.request<ResponseData<LineVo>>(
    "get",
    `/fortune/include/${bookId}/getIncomeTrends`
  );
}

export function getExpenseTrends(bookId: number) {
  return http.request<ResponseData<Array<LineVo>>>(
    "get",
    `/fortune/include/${bookId}/getExpenseTrends`
  );
}
