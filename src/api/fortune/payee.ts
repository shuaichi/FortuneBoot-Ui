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

export interface PayeeQuery extends BasePageQuery {
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

export const getPayeePageApi = (params: PayeeQuery) => {
  return http.request<ResponseData<PageDTO<PayeeVo>>>(
    "get",
    `/fortune/payee/getPage`,
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

export const movePayee2RecycleBinApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/payee/${bookId}/${payeeId}/moveToRecycleBin`
  );
};

export const payeePutBackApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/payee/${bookId}/${payeeId}/putBack`
  );
};

export const payeeRemoveApi = (bookId: number, payeeId: number) => {
  return http.request<ResponseData<any>>(
    "delete",
    `/fortune/payee/${bookId}/${payeeId}/remove`
  );
};
