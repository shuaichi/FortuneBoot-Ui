import { http } from "@/utils/http";

export interface PayeeVo {
  payeeId?: number;
  payeeName?: string;
  bookId?: number;
  canExpense?: boolean;
  canIncome?: boolean;
  sort?: number;
  remark?: string;
  enable?: boolean;
  recycleBin?: boolean;
}

export interface PayeeQuery {
  bookId?: number;
  payeeId?: number;
  recycleBin?: boolean;
  payeeName?: string;
  canExpense?: boolean;
  canIncome?: boolean;
  enable?: boolean;
}

export interface AddPayeeCommand {
  payeeName?: string;
  bookId?: number;
  canExpense?: boolean;
  canIncome?: boolean;
  enable?: boolean;
  sort?: number;
  remark?: string;
}

export interface ModifyPayeeCommand extends AddPayeeCommand {
  bookId?: number;
}

export const getPayeeListApi = (params: PayeeQuery) => {
  return http.request<ResponseData<Array<PayeeVo>>>(
    "get",
    `/fortune/payee/getList`,
    {
      params
    }
  );
};

//交易对象
export const getEnablePayeeList = (bookId: number, billType: number) => {
  return http.request<ResponseData<Array<PayeeVo>>>(
    "get",
    `/fortune/payee/${bookId}/${billType}/getEnableList`
  );
};

export const addPayeeApi = (params: PayeeQuery) => {
  return http.request<ResponseData<any>>("post", `/fortune/payee/add`, {
    data: params
  });
};

export const modifyPayeeApi = (params: PayeeQuery) => {
  return http.request<ResponseData<any>>("put", `/fortune/payee/modify`, {
    data: params
  });
};

export const payeeCanExpenseApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/payee/${bookId}/${payeeId}/canExpense`
  );
};

export const payeeCannotExpenseApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/payee/${bookId}/${payeeId}/cannotExpense`
  );
};

export const payeeCanIncomeApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/payee/${bookId}/${payeeId}/canIncome`
  );
};

export const payeeCannotIncomeApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/payee/${bookId}/${payeeId}/cannotIncome`
  );
};

export const payeeEnableApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/payee/${bookId}/${payeeId}/enable`
  );
};

export const payeeDisableApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/payee/${bookId}/${payeeId}/disable`
  );
};
