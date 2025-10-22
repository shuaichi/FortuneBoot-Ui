import { http } from "@/utils/http";
import { TagVo } from "@/api/fortune/tag";

export interface AddBillCommand {
  bookId?: number;
  title?: string;
  tradeTime?: string;
  accountId?: number;
  orderId?: number;
  amount?: number;
  convertedAmount?: number;
  tagIdList?: Array<number>;
  payeeId?: number;
  billType?: number;
  toAccountId?: number;
  confirm: boolean;
  include: boolean;
  categoryAmountPair?: Array<CategoryAmountPairVo>;
  remark?: string;
  fileList?: FormData;
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
  accountId?: number;
  bookId?: number;
  billType?: number;
  title?: string;
  tradeTimeStartTime?: Date;
  tradeTimeEndTime?: Date;
  amountMin?: number;
  amountMax?: number;
  categoryIds?: number[];
  tagIds?: number[];
  payeeId?: number;
  confirm?: boolean;
  include?: boolean;
  bookType?: number;
  tradeTimeRange?: [Date, Date];
  fileInclude?: boolean;
  remark?: string;
}

export interface BillVo {
  billId: number;
  bookId: number;
  tradeTime: string;
  billType?: number;
  categoryAmountPair?: [{ categoryName: string; amount: number }];
  tagList?: Array<TagVo>;
  currencyCode?: string;
  payeeName?: string;
  hasFile?: boolean;
  confirm?: boolean;
  include?: boolean;
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
export const addBillApi = (data: FormData) => {
  return http.request("post", "/fortune/bill/add", {
    data,
    headers: {
      "Content-Type": "multipart/form-data" // 必须设置
    }
  });
};

// 修改账单
export const modifyBillApi = (data: Partial<FormData>) => {
  return http.request("put", "/fortune/bill/modify", {
    data,
    headers: {
      "Content-Type": "multipart/form-data" // 必须设置
    }
  });
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

/** 批量导出用户 */
export const exportBillExcelApi = (params: BillQuery, fileName: string) => {
  return http.download("/fortune/bill/excel", fileName, {
    params
  });
};
