import { defineStore } from "pinia";
import { store } from "@/store";
import { userType } from "./types";
import { routerArrays } from "@/layout/types";
import { router, resetRouter } from "@/router";
import { storageSession } from "@pureadmin/utils";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { removeToken, sessionKey } from "@/utils/auth";
import { DictionaryData, TokenDTO } from "@/api/common/login";
import { storageLocal } from "@pureadmin/utils";

const dictionaryListKey = "ag-dictionary-list";
const dictionaryMapKey = "ag-dictionary-map";

export const useUserStore = defineStore({
  id: "ag-user",
  state: (): userType => {
    // 尝试从sessionStorage或localStorage中获取用户信息
    let userInfo = storageSession().getItem<TokenDTO>(sessionKey)?.currentUser;
    if (!userInfo && localStorage.getItem(sessionKey)) {
      userInfo = JSON.parse(localStorage.getItem(sessionKey))?.currentUser;
    }

    return {
      // 用户名
      username: userInfo?.userInfo.username ?? "",
      // 页面级别权限
      roles: userInfo?.roleKey ? [userInfo.roleKey] : [],
      dictionaryList:
        storageLocal().getItem<Record<string, Array<DictionaryData>>>(
          dictionaryListKey
        ) ?? {},
      dictionaryMap:
        storageLocal().getItem<Record<string, Record<string, DictionaryData>>>(
          dictionaryMapKey
        ) ?? {},
      currentUserInfo: userInfo?.userInfo ?? {}
    };
  },
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      /** TODO 这里不是应该再进一步存到sessionStorage中吗 */
      this.username = username;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储系统内的字典值 并拆分为Map形式和List形式 */
    SET_DICTIONARY(
      dictionary:
        | Map<String, Array<DictionaryData>>
        | Record<string, Array<DictionaryData>>
    ) {
      /** 由于localStorage不能存储Map对象,所以用Obj来装载数据 */
      const dictionaryMapTmp: Record<
        string,
        Record<string, DictionaryData>
      > = {};
      const dictionaryObj: Record<string, Array<DictionaryData>> = {};

      // 将Map转换为Record对象
      if (dictionary instanceof Map) {
        dictionary.forEach((value, key) => {
          dictionaryObj[key as string] = value;
        });
      } else {
        Object.assign(dictionaryObj, dictionary);
      }

      for (const obj in dictionaryObj) {
        dictionaryMapTmp[obj] = dictionaryObj[obj].reduce((map, dict) => {
          map[dict.value] = dict;
          return map;
        }, {} as Record<string, DictionaryData>);
      }

      /** 将字典分成List形式和Map形式 List便于下拉框展示 Map便于匹配值 */
      this.dictionaryList = dictionaryObj;
      this.dictionaryMap = dictionaryMapTmp;

      storageLocal().setItem<Record<string, Array<DictionaryData>>>(
        dictionaryListKey,
        dictionaryObj
      );

      storageLocal().setItem<Record<string, Record<string, DictionaryData>>>(
        dictionaryMapKey,
        dictionaryMapTmp
      );
    },

    /** 前端登出（不调用接口） */
    logOut() {
      this.username = "";
      this.roles = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
