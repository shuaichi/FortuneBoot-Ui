import { http } from "@/utils/http";

export interface AddBillCommand {
  bookId?: number;
  title?: string;
  tradeTime?: Date;
  accountId?: number;
  amount?: number;
  tagIdList?: Array<number>;
  payeeId?: number;
  billType?: number;
  toAccountId?: number;
  confirm: boolean;
  include: boolean;
  categoryAmountPair?: Array<CategoryAmountPairVo>;
  remark?: string;
}

export interface CategoryAmountPairVo {
  categoryId?: number;
  amount?: number;
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

export interface BillVo {
  billId: number;
  bookId: number;
  tradeTime: string;
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
export const deleteBillApi = (bookId: number, billId: number) => {
  return http.request("delete", `/fortune/bill/${bookId}/${billId}/remove`);
};

// 状态操作接口
export const confirmBillApi = (bookId: number, billId: number) => {
  return http.request("patch", `/fortune/bill/${bookId}/${billId}/confirm`);
};

export const unConfirmBillApi = (bookId: number, billId: number) => {
  return http.request("patch", `/fortune/bill/${bookId}/${billId}/unConfirm`);
};

export const includeBillApi = (bookId: number, billId: number) => {
  return http.request("patch", `/fortune/bill/${bookId}/${billId}/include`);
};

export const excludeBillApi = (bookId: number, billId: number) => {
  return http.request("patch", `/fortune/bill/${bookId}/${billId}/exclude`);
};
