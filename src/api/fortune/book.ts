import { http } from "@/utils/http";

export function getBookByGroupId(groupId: number) {
  return http.request<ResponseData<any>>(
    "get",
    "/fortune/book/base/getByGroupId/" + groupId
  );
}
