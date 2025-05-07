// import { http } from "@/utils/http";

export interface GoodsKeeperQuery extends BasePageQuery {
  pageNum?: number;
  pageSize?: number;
}

export interface GoodsKeeperVo {
  goodsKeeperId?: number;
  goodsName?: string;
  defaultCurrency?: string;
  enable?: boolean;
  defaultBookId?: number;
  remark?: string;
}
