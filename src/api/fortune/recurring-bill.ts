import { http } from "@/utils/http";
import { AddBillCommand } from "@/api/fortune/bill";

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

export interface AddRecurringBillCommand {
  bookId?: number;
  ruleName?: string;
  cronExpression?: string;
  startDate?: Date;
  endDate?: Date;
  recoveryStrategy?: number;
  maxRecoveryCount?: number;
  enable?: boolean;
  billRequest?: AddBillCommand;
  remark?: string;
}

export interface ModifyRecurringBillCommand extends AddRecurringBillCommand {
  ruleId?: number;
  lastRecoveryCheck?: Date;
  nextExecutionTime?: Date;
  lastExecutedTime?: Date;
}

export interface RecurringBillStrategyVo {
  value?: number;
  label?: string;
}

export const getRecurringBillPageApi = (params: RecurringBillQuery) => {
  return http.request<ResponseData<PageDTO<RecurringBillVo>>>(
    "get",
    `/fortune/recurring/bill/getRulePage`,
    {
      params
    }
  );
};
export const removeRecurringBillApi = (bookId: number, ruleId: number) => {
  return http.request<ResponseData<any>>(
    "delete",
    `/fortune/recurring/bill/${bookId}/${ruleId}/removeRule`
  );
};

export const recurringBillEnableApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/recurring/bill/${bookId}/${payeeId}/enableRule`
  );
};

export const recurringBillDisableApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/recurring/bill/${bookId}/${payeeId}/disableRule`
  );
};

export const getRecoveryStrategy = () => {
  return http.request<ResponseData<Array<RecurringBillStrategyVo>>>(
    "get",
    `/fortune/recurring/bill/getRecoveryStrategy`
  );
};

export const checkCronExpression = (cronExpression: string) => {
  return http.request<ResponseData<Boolean>>(
    "post",
    `/fortune/recurring/bill/checkCronExpression?cronExpression=${encodeURIComponent(
      cronExpression
    )}`
  );
};

export const addRecurringBillApi = (data: AddRecurringBillCommand) => {
  return http.request<ResponseData<void>>(
    "post",
    `/fortune/recurring/bill/addRule`,
    {
      data
    }
  );
};

export const modifyRecurringBillApi = (data: ModifyRecurringBillCommand) => {
  return http.request<ResponseData<void>>(
    "put",
    `/fortune/recurring/bill/modifyRule`,
    {
      data
    }
  );
};
