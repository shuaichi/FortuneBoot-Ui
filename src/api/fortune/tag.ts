import { http } from "@/utils/http";
import { Tree } from "@/utils/tree";

export interface TagVo extends Tree {
  tagId?: number;
  tagName?: string;
  bookId?: number;
  parentId?: number;
  canExpense?: boolean;
  canIncome?: boolean;
  canTransfer?: boolean;
  enable?: boolean;
  sort?: number;
  remark?: string;
  recycleBin?: boolean;
}

export interface TagQuery extends BasePageQuery {
  bookId?: number;
  tagId?: number;
  recycleBin?: boolean;
  tagName?: string;
  canExpense?: boolean;
  canIncome?: boolean;
  canTransfer?: boolean;
  enable?: boolean;
}

export interface AddTagCommand {
  tagName?: string;
  bookId?: number;
  parentId?: number;
  canExpense?: boolean;
  canIncome?: boolean;
  canTransfer?: boolean;
  enable?: boolean;
  sort?: number;
  remark?: string;
}

export interface ModifyTagCommand extends AddTagCommand {
  bookId?: number;
}

//标签
export const getEnableTagList = (bookId: number, billType: number) => {
  return http.request<ResponseData<Array<TagVo>>>(
    "get",
    `/fortune/tag/${bookId}/${billType}/getEnableList`
  );
};

export const getTagListApi = (params: TagQuery) => {
  return http.request<ResponseData<Array<TagVo>>>(
    "get",
    `/fortune/tag/getList`,
    {
      params
    }
  );
};

export const getTagPageApi = (params: TagQuery) => {
  return http.request<ResponseData<PageDTO<TagVo>>>(
    "get",
    `/fortune/tag/getPage`,
    {
      params
    }
  );
};

export const addTagApi = (params: TagQuery) => {
  return http.request<ResponseData<any>>("post", `/fortune/tag/add`, {
    data: params
  });
};

export const modifyTagApi = (params: TagQuery) => {
  return http.request<ResponseData<any>>("put", `/fortune/tag/modify`, {
    data: params
  });
};

export const tagCanExpenseApi = (bookId: number, tagId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/tag/${bookId}/${tagId}/canExpense`
  );
};

export const tagCannotExpenseApi = (bookId: number, tagId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/tag/${bookId}/${tagId}/cannotExpense`
  );
};

export const tagCanIncomeApi = (bookId: number, tagId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/tag/${bookId}/${tagId}/canIncome`
  );
};

export const tagCannotIncomeApi = (bookId: number, tagId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/tag/${bookId}/${tagId}/cannotIncome`
  );
};

export const tagCanTransferApi = (bookId: number, tagId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/tag/${bookId}/${tagId}/canTransfer`
  );
};

export const tagCannotTransferApi = (bookId: number, tagId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/tag/${bookId}/${tagId}/cannotTransfer`
  );
};

export const tagEnableApi = (bookId: number, tagId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/tag/${bookId}/${tagId}/enable`
  );
};

export const tagDisableApi = (bookId: number, tagId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/tag/${bookId}/${tagId}/disable`
  );
};

export const moveTag2RecycleBinApi = (bookId: number, tagId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/tag/${bookId}/${tagId}/moveToRecycleBin`
  );
};

export const moveTagPutBackApi = (bookId: number, tagId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/tag/${bookId}/${tagId}/putBack`
  );
};
