import { http } from "@/utils/http";

export interface AddBillCommand {
  bookId: number;
  tradeTime: string;
}

export interface ModifyBillCommand extends AddBillCommand {
  billId?: number;
}

export interface BillQuery extends BaseQuery {
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

export type BillVo = ModifyBillCommand;

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
  return http.request("post", "/fortune/bill", { data });
};

// 修改账单
export const modifyBillApi = (data: Partial<AddBillCommand>) => {
  return http.request("put", "/fortune/bill", { data });
};

// 删除账单
export const deleteBillApi = (billId: number) => {
  return http.request("delete", `/fortune/bill/${billId}`);
};

// 状态操作接口
export const confirmBillApi = (billId: number) => {
  return http.request("put", `/fortune/bill/confirm/${billId}`);
};

export const unConfirmBillApi = (billId: number) => {
  return http.request("put", `/fortune/bill/unconfirm/${billId}`);
};

export const includeBillApi = (billId: number) => {
  return http.request("put", `/fortune/bill/include/${billId}`);
};

export const excludeBillApi = (billId: number) => {
  return http.request("put", `/fortune/bill/exclude/${billId}`);
};
