import { http } from "@/utils/http";

export interface CategoryVo {
  categoryId?: number;
  categoryName?: string;
  categoryType?: number;
  bookId?: number;
  parentId?: number;
  sort?: number;
  remark?: string;
  enable?: boolean;
  recycleBin?: boolean;
  children?: CategoryVo;
}

// 分类
export const getEnableCategoryList = (bookId: number, billType: number) => {
  return http.request<ResponseData<Array<CategoryVo>>>(
    "get",
    `/fortune/category/${bookId}/${billType}/getEnableList`
  );
};
