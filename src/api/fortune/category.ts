import { http } from "@/utils/http";
import { Tree } from "@/utils/tree";

export interface CategoryVo extends Tree {
  categoryId?: number;
  categoryName?: string;
  categoryType?: number;
  bookId?: number;
  parentId?: number;
  sort?: number;
  remark?: string;
  enable?: boolean;
}

export interface CategoryQuery extends BasePageQuery {
  bookId?: number;
  categoryType?: number;
  recycleBin?: boolean;
  categoryName?: string;
}

export const getCategoryPageApi = (params: CategoryQuery) => {
  return http.request<ResponseData<PageDTO<CategoryVo>>>(
    "get",
    `/fortune/category/getPage`,
    {
      params
    }
  );
};

// 分类
export const getEnableCategoryList = (bookId: number, billType: number) => {
  return http.request<ResponseData<Array<CategoryVo>>>(
    "get",
    `/fortune/category/${bookId}/${billType}/getEnableList`
  );
};

export const categoryEnableApi = (bookId: number, categoryId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/category/${bookId}/${categoryId}/enable`
  );
};

export const categoryDisableApi = (bookId: number, categoryId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/category/${bookId}/${categoryId}/disable`
  );
};

export const moveCategory2RecycleBinApi = (
  bookId: number,
  categoryId: number
) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/category/${bookId}/${categoryId}/moveToRecycleBin`
  );
};
