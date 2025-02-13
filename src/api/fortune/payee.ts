import { http } from "@/utils/http";

export interface PayeeVo {
  payeeId?: number;
  payeeName?: string;
  bookId?: number;
  sort?: number;
  remark?: string;
  enable?: boolean;
  recycleBin?: boolean;
}

//交易对象
export const getEnablePayeeList = (bookId: number, billType: number) => {
  return http.request<ResponseData<Array<PayeeVo>>>(
    "get",
    `/fortune/payee/${bookId}/${billType}/getEnableList`
  );
};
