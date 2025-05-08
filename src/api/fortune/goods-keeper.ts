import { http } from "@/utils/http";

export interface GoodsKeeperQuery extends BasePageQuery {
  pageNum?: number;
  pageSize?: number;
  groupId?: number;
  bookId?: number;
  goodsName?: string;
}

export interface GoodsKeeperVo {
  goodsName?: string;
  categoryName?: string;
  tagName?: string;
  price?: number;
  purchaseDate?: string;
  warrantyDate?: string;
  useByTimes?: boolean;
  usageNum?: boolean;
  statusDesc?: boolean;
  retiredDate?: boolean;
  soldPrice?: boolean;
  remark?: string;
  dailyAverageCost?: string;
}

export function getFortuneGroupPage(params: GoodsKeeperQuery) {
  return http.request<ResponseData<PageDTO<GoodsKeeperVo>>>(
    "get",
    "/fortune/goods/keeper/getPage",
    {
      params
    }
  );
}
