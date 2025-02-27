import { http } from "@/utils/http";

export interface FileVo {
  fileId: string;
  originalName: string;
  contentType: string;
  size: number;
  fileData: ArrayBuffer;
}

export const getFileByBillId = (billId: number) => {
  return http.request<ResponseData<Array<FileVo>>>(
    "get",
    `/fortune/file/${billId}/getByBillId`
  );
};
