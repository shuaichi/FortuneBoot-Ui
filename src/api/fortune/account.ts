import { http } from "@/utils/http";

export interface AddAccountCommand {
  groupId: number;
  accountName: string;
  currencyCode: string;
  balance: number;
  accountType: number;
  cardNo?: string;
  billDay?: string;
  repayDay?: string;
  canExpense: boolean;
  canIncome: boolean;
  canTransferOut: boolean;
  canTransferIn: boolean;
  include: boolean;
  creditLimit?: number;
  enable: boolean;
  apr?: number;
  initialBalance?: number;
  sort?: number;
  remark?: string;
}

export interface ModifyAccountCommand extends AddAccountCommand {
  accountId?: number;
}

export type AccountVo = ModifyAccountCommand;

export interface AccountQuery extends BasePageQuery {
  groupId?: number;
  accountName?: string;
  accountType?: number;
  recycleBin?: boolean;
}

export function getFortuneAccountPage(params: AccountQuery) {
  return http.request<ResponseData<PageDTO<AccountVo>>>(
    "get",
    "/fortune/account/getPage",
    {
      params
    }
  );
}

export function getEnableAccountList(groupId: number) {
  return http.request<ResponseData<Array<AccountVo>>>(
    "get",
    `/fortune/account/${groupId}/getEnableList`
  );
}

export function addAccountApi(param: AddAccountCommand) {
  return http.request<ResponseData<any>>("post", "/fortune/account/add", {
    data: param
  });
}

export function modifyAccountApi(param: ModifyAccountCommand) {
  return http.request<ResponseData<any>>("put", "/fortune/account/modify", {
    data: param
  });
}

export function canExpenseApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/canExpense`
  );
}

export function cannotExpenseApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/cannotExpense`
  );
}

export function canIncomeApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/canIncome`
  );
}

export function cannotIncomeApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/cannotIncome`
  );
}

export function canTransferOutApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/canTransferOut`
  );
}

export function cannotTransferOutApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/cannotTransferOut`
  );
}

export function canTransferInApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/canTransferIn`
  );
}

export function cannotTransferInApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/cannotTransferIn`
  );
}

export function includeAccountApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/includeAccount`
  );
}

export function excludeAccountApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/excludeAccount`
  );
}

export function enableAccountApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/enable`
  );
}

export function disableAccountApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/disable`
  );
}

export function move2RecycleBinApi(groupId: number, accountId: number) {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/account/${groupId}/${accountId}/moveToRecycleBin`
  );
}
