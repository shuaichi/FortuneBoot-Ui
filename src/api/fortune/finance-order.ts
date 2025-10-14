import { http } from "@/utils/http";

export interface FinanceOrderQuery extends BasePageQuery {
  groupId?: number;
  bookId?: number;
  title?: string;
  type?: number;
  status?: number;
  remark?: string;
}

export interface FinanceOrderVo {
  orderId: number;
  bookId: number;
  title: string;
  type?: number;
  typeDesc?: string;
  outAmount?: number;
  inAmount?: number;
  status?: number;
  statusDesc?: string;
  submitTime?: Date;
  closeTime?: Date;
  remark?: string;
}

export interface FinanceOrderAddCommand {
  bookId: number;
  title: string;
  type?: number;
  remark?: string;
}

export interface FinanceOrderModifyCommand extends FinanceOrderAddCommand {
  orderId: number;
}

// 分页查询
export const getFinanceOrderPage = (params?: FinanceOrderQuery) => {
  return http.request<ResponseData<PageDTO<FinanceOrderVo>>>(
    "get",
    "/fortune/finance/order/getPage",
    { params }
  );
};

// 查询使用中的单据
export const getUsingFinanceOrderApi = (bookId: number) => {
  return http.request<ResponseData<Array<FinanceOrderVo>>>(
    "get",
    `/fortune/finance/order/${bookId}/getUsingFinanceOrderList`
  );
};

// 新增单据
export const addFinanceOrderApi = (data: FinanceOrderAddCommand) => {
  return http.request<ResponseData<Boolean>>(
    "post",
    "/fortune/finance/order/add",
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data" // 必须设置
      }
    }
  );
};

// 修改单据
export const modifyFinanceOrderApi = (data: FinanceOrderModifyCommand) => {
  return http.request<ResponseData<Boolean>>(
    "put",
    "/fortune/finance/order/modify",
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data" // 必须设置
      }
    }
  );
};

export const usingFinanceOrderApi = (bookId: number, orderId: number) => {
  return http.request<ResponseData<Boolean>>(
    "patch",
    `/fortune/finance/order/${bookId}/${orderId}/using`
  );
};

// 关闭单据
export const closeFinanceOrderApi = (bookId: number, orderId: number) => {
  return http.request<ResponseData<Boolean>>(
    "patch",
    `/fortune/finance/order/${bookId}/${orderId}/close`
  );
};

// 重启单据
export const reopenFinanceOrderApi = (bookId: number, orderId: number) => {
  return http.request<ResponseData<Boolean>>(
    "patch",
    `/fortune/finance/order/${bookId}/${orderId}/reopen`
  );
};

// 删除单据
export const removeFinanceOrderApi = (bookId: number, orderId: number) => {
  return http.request<ResponseData<Boolean>>(
    "delete",
    `/fortune/finance/order/${bookId}/${orderId}/remove`
  );
};
