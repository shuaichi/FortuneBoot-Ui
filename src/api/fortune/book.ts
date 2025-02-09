import { http } from "@/utils/http";

export interface AddBookCommand {
  bookName: string;
  groupId: number;
  defaultCurrency: string;
  defaultExpenseAccountId?: number;
  defaultIncomeAccountId?: number;
  defaultTransferOutAccountId?: number;
  defaultTransferInAccountId?: number;
  sort: number;
  remark?: string;
  enable?: boolean;
  bookTemplate: string;
}

export interface ModifyBookCommand extends AddBookCommand {
  bookId?: number;
}

export interface BookVo extends ModifyBookCommand {
  groupName: string;
  createTime: string;
}

export interface BookQuery extends BasePageQuery {
  bookName?: string;
  groupId?: number;
  enable?: boolean;
  recycleBin?: boolean;
}

export function getBookByGroupId(groupId: number) {
  return http.request<ResponseData<BookVo>>(
    "get",
    `/fortune/book/base/${groupId}/getByGroupId`
  );
}

export function getFortuneBookPage(params: BookQuery) {
  return http.request<ResponseData<PageDTO<BookVo>>>(
    "get",
    "/fortune/book/base/getPage",
    {
      params
    }
  );
}

export function getEnableBookList(groupId: number) {
  return http.request<ResponseData<Array<BookVo>>>(
    "get",
    `/fortune/book/base/${groupId}/getEnableList`
  );
}

export function addBookApi(command: AddBookCommand) {
  return http.request<ResponseData<any>>("post", "/fortune/book/base/add", {
    data: command
  });
}

export function modifyBookApi(command: ModifyBookCommand) {
  return http.request<ResponseData<any>>("put", "/fortune/book/base/modify", {
    data: command
  });
}

export function removeBookApi(groupId: number, bookId: number) {
  return http.request<ResponseData<any>>(
    "delete",
    `/fortune/book/base/${groupId}/${bookId}/remove`
  );
}

export function enableBookApi(groupId: number, bookId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/book/base/${groupId}/${bookId}/enable`
  );
}

export function disableBookApi(groupId: number, bookId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/book/base/${groupId}/${bookId}/disable`
  );
}

export function bookMove2RecycleBinApi(groupId: number, bookId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/book/base/${groupId}/${bookId}/moveToRecycleBin`
  );
}

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

export interface PayeeVo {
  payeeId?: number;
  payeeName?: string;
  bookId?: number;
  sort?: number;
  remark?: string;
  enable?: boolean;
  recycleBin?: boolean;
}

export interface TagVo {
  tagId?: number;
  tagName?: string;
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
    `/fortune/book/config/category/${bookId}/${billType}/getEnableList`
  );
};

//交易对象
export const getEnablePayeeList = (bookId: number, billType: number) => {
  return http.request<ResponseData<Array<PayeeVo>>>(
    "get",
    `/fortune/book/config/payee/${bookId}/${billType}/getEnableList`
  );
};

//标签
export const getEnableTagList = (bookId: number, billType: number) => {
  return http.request<ResponseData<Array<TagVo>>>(
    "get",
    `/fortune/book/config/tag/${bookId}/${billType}/getEnableList`
  );
};
