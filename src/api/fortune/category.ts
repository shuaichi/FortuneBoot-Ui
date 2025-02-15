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
  enable?: boolean;
}

export interface AddCategoryCommand {
  bookId?: number;
  parentId?: number;
  categoryName?: string;
  categoryType?: number;
  enable?: boolean;
  sort?: number;
  remark?: string;
}

export interface ModifyCategoryCommand extends AddCategoryCommand {
  categoryId?: number;
}

export const getCategoryPageApi = (params: CategoryQuery) => {
  return http.request<ResponseData<PageDTO<CategoryVo>>>(
    "get",
    "/fortune/category/getPage",
    {
      params
    }
  );
};

export const getCategoryListApi = (params: CategoryQuery) => {
  return http.request<ResponseData<Array<CategoryVo>>>(
    "get",
    "/fortune/category/getList",
    {
      params
    }
  );
};

export const getEnableCategoryList = (bookId: number, billType: number) => {
  return http.request<ResponseData<Array<CategoryVo>>>(
    "get",
    `/fortune/category/${bookId}/${billType}/getEnableList`
  );
};

export const addCategoryApi = (params: AddCategoryCommand) => {
  return http.request<ResponseData<any>>("post", "/fortune/category/add", {
    data: params
  });
};
export const modifyCategoryApi = (params: ModifyCategoryCommand) => {
  return http.request<ResponseData<any>>("put", "/fortune/category/modify", {
    data: params
  });
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
