import { http } from "@/utils/http";

export interface TagVo {
  tagId?: number;
  tagName?: string;
  bookId?: number;
  parentId?: number;
  sort?: number;
  remark?: string;
  enable?: boolean;
  recycleBin?: boolean;
  children?: TagVo;
}

//标签
export const getEnableTagList = (bookId: number, billType: number) => {
  return http.request<ResponseData<Array<TagVo>>>(
    "get",
    `/fortune/tag/${bookId}/${billType}/getEnableList`
  );
};
