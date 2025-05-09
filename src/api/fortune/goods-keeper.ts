import { http } from "@/utils/http";

export interface GoodsKeeperQuery extends BasePageQuery {
  pageNum?: number;
  pageSize?: number;
  groupId?: number;
  bookId?: number;
  goodsName?: string;
}

export interface GoodsKeeperVo {
  goodsKeeperId: number;
  bookId: number;
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
  bookId?: number;
  goodsName?: string;
  categoryId?: number;
  tagId?: number;
  price?: number;
  purchaseDate?: string;
  warrantyDate?: string;
  useByTimes?: boolean;
  usageNum?: number;
  status?: number;
  retiredDate?: string;
  soldPrice?: number;
  remark?: string;
}

export interface ModifyGoodsKeeperCommand extends AddGoodsKeeperCommand {
  goodsKeeperId?: number;
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

export function addGoodsKeeperApi(data: FormData) {
  return http.request("post", "/fortune/goods/keeper/add", {
    data,
    headers: {
      "Content-Type": "multipart/form-data" // 必须设置
    }
  });
}

export function modifyGoodsKeeperApi(data: FormData) {
  return http.request("put", "/fortune/goods/keeper/modify", {
    data,
    headers: {
      "Content-Type": "multipart/form-data" // 必须设置
    }
  });
}

export function removeGoodsKeeperApi(bookId: number, goodsKeeperId: number) {
  return http.request(
    "delete",
    `/fortune/goods/keeper/${bookId}/${goodsKeeperId}/remove`
  );
}
