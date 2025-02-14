import { http } from "@/utils/http";

export interface AddBillCommand {
  bookId: number;
  tradeTime: string;
}

export interface ModifyBillCommand extends AddBillCommand {
  billId?: number;
}

export interface BillQuery extends BasePageQuery {
  groupId?: number;
  bookId?: number;
  bookType?: number;
  accountId?: number;
  billType?: number;
  title?: string;
  tradeTimeRange?: [Date, Date];
  tradeTimeStartTime?: Date;
  tradeTimeEndTime?: Date;
  amountMin?: number;
  amountMax?: number;
  categoryIds?: number[];
  tagIds?: number[];
  payeeId?: number;
  confirm?: boolean;
  include?: boolean;
  fileInclude?: boolean;
  remark?: string;
}

export interface BillVo extends ModifyBillCommand {
  categoryAmountPair?: [{ categoryName: string; amount: number }];
  tagList?: [{ tagName: string }];
  currencyCode?: string;
  payeeName?: string;
}

// 分页查询
export const getBillPage = (params?: BillQuery) => {
  return http.request<ResponseData<PageDTO<BillVo>>>(
    "get",
    "/fortune/bill/getPage",
    { params }
  );
};

// 新增账单
export const addBillApi = (data: AddBillCommand) => {
  return http.request("post", "/fortune/bill/add", { data });
};

// 修改账单
export const modifyBillApi = (data: Partial<AddBillCommand>) => {
  return http.request("put", "/fortune/bill/modify", { data });
};

// 删除账单
export const deleteBillApi = (billId: number) => {
  return http.request("delete", `/fortune/bill/${billId}/remove`);
};

// 状态操作接口
export const confirmBillApi = (billId: number) => {
  return http.request("patch", `/fortune/bill/${billId}/confirm`);
};

export const unConfirmBillApi = (billId: number) => {
  return http.request("patch", `/fortune/bill/${billId}/unConfirm`);
};

export const includeBillApi = (billId: number) => {
  return http.request("patch", `/fortune/bill/${billId}/include`);
};

export const excludeBillApi = (billId: number) => {
  return http.request("patch", `/fortune/bill/${billId}/exclude`);
};
