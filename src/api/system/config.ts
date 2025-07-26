import { http } from "@/utils/http";

export interface ConfigQuery extends BasePageQuery {
  /**
   * 配置key
   */
  configKey?: string;
  /**
   * 配置名称
   */
  configName?: string;
  /**
   * 是否允许更改配置
   */
  isAllowChange?: string;
}

/**
 * ConfigDTO, 配置信息
 */
export interface ConfigDTO {
  configId?: string;
  configKey?: string;
  configName?: string;
  configOptions?: string[];
  configValue?: string;
  createTime?: Date;
  isAllowChange?: string;
  isAllowChangeStr?: string;
  remark?: string;
}

/**
 * configKeyDTO, 内置参数选项
 */
export interface configKeyDTO {
  value: string;
  description: string;
  option?: string | null;
  required: boolean;
}

export interface ConfigRequest {
  configName: string;
  configKey: string;
  configValue: string;
  configOptions: string;
  isAllowChange: boolean;
  remark: string;
  type: string;
}
/**
 * ConfigUpdateCommand
 */
export interface UpdateConfigRequest {
  configValue: string;
}

/** 获取配置列表 */
export const getConfigListApi = (params?: ConfigQuery) => {
  return http.request<ResponseData<PageDTO<ConfigDTO>>>(
    "get",
    "/system/configs", // 注意：与addConfig的basePath不同
    {
      params
    }
  );
};

/** 获取配置信息 */
export const getConfigInfoApi = (configId: string) => {
  return http.request<ResponseData<ConfigDTO>>(
    "get",
    `/system/config/${configId}`
  );
};

/** 刷新配置缓存 */
export const updateConfigApi = (
  configId: number,
  data: UpdateConfigRequest
) => {
  return http.request<ResponseData<PageDTO<ConfigDTO>>>(
    "put",
    `/system/config/${configId}`,
    {
      data
    }
  );
};

/** 刷新配置缓存 */
export const refreshConfigCacheApi = () => {
  return http.request<ResponseData<void>>("delete", "/system/configs/cache");
};

// 获取内置参数选项
export const getParamEnums = () => {
  return http.request<ResponseData<configKeyDTO[]>>(
    "get",
    "/system/config/getSystemConfigOptions"
  );
};

/** 新增参数 */
export const saveSystemConfig = (data: ConfigRequest) => {
  return http.request<ResponseData<void>>(
    "post",
    "/system/config/addSystemConfig",
    { data }
  );
};

/** 删除参数 */
export const deleteSystemConfig = (configId: string) => {
  return http.request<ResponseData<void>>(
    "delete",
    `/system/config/${configId}`
  );
};
