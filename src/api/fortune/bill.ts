import { http } from "@/utils/http";
import type { TagVo } from "@/api/fortune/tag";

// 账单数据模型
// 注意：文件上传需要单独处理，不包含在此接口中
// 如需上传文件，请将数据和文件一起组装成 FormData 后调用 addBillApi 或 modifyBillApi
export interface AddBillCommand {
  bookId?: number;
  title?: string;
  tradeTime?: string;
  accountId?: number;
  orderId?: number;
  amount?: number;
  convertedAmount?: number;
  tagIdList?: Array<number>;
  memberIdList?: Array<number>;
  payeeId?: number;
  billType?: number;
  toAccountId?: number;
  confirm: boolean;
  include: boolean;
  categoryAmountPair?: Array<CategoryAmountPairVo>;
  extras?: Array<BillExtraVo>;
  remark?: string;
}

export interface CategoryAmountPairVo {
  categoryId?: number;
  amount?: number;
}

// 附加费用/优惠
// extraType:   1=手续费，2=优惠
// accountSide: 账户方向，1=转出账户(from)，2=转入账户(to)
//              非转账账单默认 1；转账账单可指定从哪方扣/给
// categoryId:  所属分类（隐式继承所在分类金额组的 categoryId）
export interface BillExtraVo {
  extraType?: number;
  amount?: number;
  accountSide?: number;
  categoryId?: number;
  remark?: string;
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
  memberIds?: number[];
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
  memberList?: Array<{ memberId: number; memberName: string }>; // 新增成员
  currencyCode?: string;
  payeeName?: string;
  hasFile?: boolean;
  confirm?: boolean;
  include?: boolean;
  extras?: Array<BillExtraVo>;
}

// 分页查询
export const getBillPage = (params?: BillQuery) => {
  return http.request<ResponseData<PageDTO<BillVo>>>(
    "get",
    "/fortune/bill/getPage",
    { params }
  );
};

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
