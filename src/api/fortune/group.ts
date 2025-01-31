import { http } from "@/utils/http";

export type GroupQuery = BasePageQuery;

export interface GroupVo {
  groupId: number;
  groupName: string;
  defaultCurrency: string;
  enable: boolean;
  defaultBookId: number;
  remark: string;
}

export interface AddGroupCommand {
  groupName: string;
  defaultCurrency: string;
  bookTemplate: number;
  enable: boolean;
  remark: string;
}

export interface ModifyGroupCommand extends AddGroupCommand {
  groupId: number;
}

export function getFortuneGroupPage(params: GroupQuery) {
  return http.request<ResponseData<PageDTO<GroupVo>>>(
    "get",
    "/fortune/group/getPage",
    {
      params
    }
  );
}

export function getBookTemplate() {
  return http.request<ResponseData<any>>(
    "get",
    "/fortune/group/getBookTemplate"
  );
}

export function getCurrencyTemplate() {
  return http.request<ResponseData<any>>(
    "get",
    "/fortune/group/getCurrencyTemplate"
  );
}
