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

export function getBillStatistics(bookId: number) {
  return http.request<ResponseData<BillStatisticsVo>>(
    "get",
    `/fortune/include/${bookId}/getBillStatistics`
  );
}

export function getIncomeInclude(bookId: number) {
  return http.request<ResponseData<BillStatisticsVo>>(
    "get",
    `/fortune/include/${bookId}/getIncomeInclude`
  );
}

export function getTotalAssets(groupId: number) {
  return http.request<ResponseData<Array<PieVo>>>(
    "get",
    `/fortune/include/${groupId}/getTotalAssets`
  );
}
