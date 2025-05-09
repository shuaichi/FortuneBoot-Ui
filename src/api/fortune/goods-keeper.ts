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

export interface AddGoodsKeeperCommand {
  groupName?: string;
  defaultCurrency?: string;
  bookTemplate?: number;
  enable?: boolean;
  remark?: string;
}

export interface ModifyGoodsKeeperCommand extends AddGoodsKeeperCommand {
  groupId?: number;
  defaultBookId?: number;
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
