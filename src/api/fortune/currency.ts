import { http } from "@/utils/http";

export interface CurrencyQuery extends BaseQuery {
  target?: string;
  base?: string;
}

export interface CategoryVo {
  currencyId?: number;
  currencyName?: string;
  rate?: number;
  remark?: string;
}

export const getCurrencyListApi = (params: CurrencyQuery) => {
  return http.request<ResponseData<Array<CategoryVo>>>(
    "get",
    "/fortune/currency",
    {
      params
    }
  );
};

export const refreshCurrency = () => {
  return http.request<ResponseData<Array<CategoryVo>>>(
    "post",
    "/fortune/currency/refresh"
  );
};
