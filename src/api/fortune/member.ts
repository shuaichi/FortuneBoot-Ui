import { http } from "@/utils/http";

export interface MemberVo {
  memberId?: number;
  memberName?: string;
  bookId?: number;
  sort?: number;
  remark?: string;
  enable?: boolean;
  recycleBin?: boolean;
}

export interface MemberQuery extends BasePageQuery {
  bookId?: number;
  memberId?: number;
  recycleBin?: boolean;
  memberName?: string;
  enable?: boolean;
}

export interface AddMemberCommand {
  memberName?: string;
  bookId?: number;
  enable?: boolean;
  sort?: number;
  remark?: string;
}

export interface ModifyMemberCommand extends AddMemberCommand {
  memberId?: number;
}

export const getMemberPageApi = (params: MemberQuery) => {
  return http.request<ResponseData<PageDTO<MemberVo>>>(
    "get",
    `/fortune/member/getPage`,
    {
      params
    }
  );
};

// 交易对象
export const getEnableMemberList = (bookId: number) => {
  return http.request<ResponseData<Array<MemberVo>>>(
    "get",
    `/fortune/member/${bookId}/getEnableList`
  );
};

export const addMemberApi = (params: AddMemberCommand) => {
  return http.request<ResponseData<any>>("post", `/fortune/member/add`, {
    data: params
  });
};

export const modifyMemberApi = (params: ModifyMemberCommand) => {
  return http.request<ResponseData<any>>("put", `/fortune/member/modify`, {
    data: params
  });
};

export const memberEnableApi = (bookId: number, memberId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/member/${bookId}/${memberId}/enable`
  );
};

export const memberDisableApi = (bookId: number, memberId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/member/${bookId}/${memberId}/disable`
  );
};

export const moveMember2RecycleBinApi = (bookId: number, memberId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/member/${bookId}/${memberId}/moveToRecycleBin`
  );
};

export const memberPutBackApi = (bookId: number, memberId: number) => {
  return http.request<ResponseData<any>>(
    "patch",
    `/fortune/member/${bookId}/${memberId}/putBack`
  );
};

export const memberRemoveApi = (bookId: number, memberId: number) => {
  return http.request<ResponseData<any>>(
    "delete",
    `/fortune/member/${bookId}/${memberId}/remove`
  );
};
