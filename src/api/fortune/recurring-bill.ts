import { http } from "@/utils/http";

export interface RecurringBillVo {
  ruleName?: string;
  cronExpression?: string;
  enable?: boolean;
  startDate?: Date;
  endDate?: Date;
  maxExecutions?: number;
  executedCount?: number;
  lastExecutedTime?: Date;
  nextExecutionTime?: Date;
  recoveryStrategy?: string;
  maxRecoveryCount?: number;
  lastRecoveryCheck?: Date;
  remark?: string;
}

export interface RecurringBillQuery extends BasePageQuery {
  groupId?: number;
  bookId?: number;
  cronExpression?: string;
  enable?: boolean;
  remark?: string;
}

export const getRecurringBillPageApi = (params: RecurringBillQuery) => {
  return http.request<ResponseData<PageDTO<RecurringBillVo>>>(
    "get",
    `/fortune/recurring/bill/getPage`,
    {
      params
    }
  );
};
export const removeRecurringBillApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "delete",
    `/fortune/recurring/bill/${bookId}/${payeeId}/remove`
  );
};

export const recurringBillEnableApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/recurring/bill/${bookId}/${payeeId}/enable`
  );
};

export const recurringBillDisableApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/recurring/bill/${bookId}/${payeeId}/disable`
  );
};
