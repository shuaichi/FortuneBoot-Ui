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
  return http.request<ResponseData<any>>(
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
