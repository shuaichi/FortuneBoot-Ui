import { http } from "@/utils/http";

export interface GroupQuery extends BasePageQuery {
  pageNum?: number;
  pageSize?: number;
}

export interface GroupVo {
  groupId?: number;
  groupName?: string;
  defaultCurrency?: string;
  enable?: boolean;
  defaultBookId?: number;
  remark?: string;
}

export interface AddGroupCommand {
  groupName?: string;
  defaultCurrency?: string;
  bookTemplate?: number;
  enable?: boolean;
  remark?: string;
}

export interface ModifyGroupCommand extends AddGroupCommand {
  groupId?: number;
  defaultBookId?: number;
}

export interface InviteUserCommand {
  groupId?: number;
  roleType?: number;
  username?: string;
}

export interface RolesBefore {
  [key: number]: string;
}

export interface RoleType {
  value: number;
  desc: string;
}

export interface GroupUserVo {
  userGroupRelationId?: number;
  groupId?: number;
  username?: string;
  nickname?: string;
  roleTpeDesc?: string;
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

export function enableGroup(groupId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/group/${groupId}/enable`
  );
}

export function disableGroup(groupId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/group/${groupId}/disable`
  );
}

export function getEnableGroupList() {
  return http.request<ResponseData<Array<GroupVo>>>(
    "get",
    "/fortune/group/getEnableList"
  );
}

export function getDefaultGroupId() {
  return http.request<ResponseData<number>>(
    "get",
    "/fortune/group/getDefaultGroupId"
  );
}

export function removeGroupApi(groupId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/group/${groupId}/remove`
  );
}

export function getRoleTypes() {
  return http.request<ResponseData<RolesBefore>>(
    "get",
    "/fortune/group/getRoleTypes"
  );
}

export function inviteUserApi(params: InviteUserCommand) {
  return http.request<ResponseData<any>>("post", "/fortune/group/inviteUser", {
    data: params
  });
}

export function getGroupUserApi(groupId: number) {
  return http.request<ResponseData<Array<GroupUserVo>>>(
    "get",
    `/fortune/group/${groupId}/getGroupUser`
  );
}

export function removeGroupUserApi(groupUserId: number) {
  return http.request<ResponseData<Array<GroupUserVo>>>(
    "delete",
    `/fortune/group/${groupUserId}/removeGroupUser`
  );
}

export function setGroupDefaultApi(groupId: number) {
  return http.request<ResponseData<Array<GroupUserVo>>>(
    "patch",
    `/fortune/group/${groupId}/setDefaultGroup`
  );
}
