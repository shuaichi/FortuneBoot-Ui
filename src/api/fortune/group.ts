import { http } from "@/utils/http";

export interface GroupQuery extends BasePageQuery {
  pageNum?: number;
  pageSize?: number;
}

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
  defaultBookId: number;
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

export function addGroupApi(params: AddGroupCommand) {
  return http.request<ResponseData<AddGroupCommand>>(
    "post",
    "/fortune/group/add",
    {
      headers: {
        "Content-Type": "application/json" // 确保设置了正确的内容类型
      },
      data: params
    }
  );
}

export function modifyGroupApi(params: ModifyGroupCommand) {
  return http.request<ResponseData<ModifyGroupCommand>>(
    "put",
    "/fortune/group/modify",
    {
      headers: {
        "Content-Type": "application/json" // 确保设置了正确的内容类型
      },
      data: params
    }
  );
}
