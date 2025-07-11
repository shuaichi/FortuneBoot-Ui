import Cookies from "js-cookie";
import { storageSession } from "@pureadmin/utils";
import { useUserStoreHook } from "@/store/modules/user";
import { aesEncrypt, aesDecrypt } from "@/utils/crypt";
import { TokenDTO } from "@/api/common/login";

/**
 * 原版前端token实现
 */
export interface DataInfo<T> {
  /** token */
  accessToken: string;
  /** `accessToken`的过期时间（时间戳） */
  expires: T;
  /** 用于调用刷新accessToken的接口时所需的token */
  refreshToken: string;
  /** 用户名 */
  username?: string;
  /** 当前登陆用户的角色 */
  roles?: Array<string>;
}

export const sessionKey = "user-info";
export const tokenKey = "authorized-token";
export const isRememberMeKey = "ag-is-remember-me";
export const passwordKey = "ag-password";
export const usernameKey = "ag-username";

/** 获取`token` */
export function getToken(): TokenDTO | null {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  if (Cookies.get(tokenKey)) {
    return JSON.parse(Cookies.get(tokenKey));
  } else if (storageSession().getItem<TokenDTO>(sessionKey)) {
    return storageSession().getItem<TokenDTO>(sessionKey);
  } else if (localStorage.getItem(sessionKey)) {
    return JSON.parse(localStorage.getItem(sessionKey));
  }
  return null;
}

/**
 * 后端处理token
 */
export function setTokenFromBackend(data: TokenDTO): void {
  const cookieString = JSON.stringify(data);
  Cookies.set(tokenKey, cookieString);

  useUserStoreHook().SET_USERNAME(data.currentUser.userInfo.username);
  useUserStoreHook().SET_ROLES([data.currentUser.roleKey]);
  storageSession().setItem(sessionKey, data);
  // 同时将用户信息存储在localStorage中，以便在不同标签页之间共享
  localStorage.setItem(sessionKey, JSON.stringify(data));
}

/** 删除`token`以及key值为`user-info`的session信息和localStorage信息 */
export function removeToken() {
  Cookies.remove(tokenKey);
  sessionStorage.clear();
  localStorage.removeItem(sessionKey);
}

/** 将密码加密后 存入cookies中 */
export function savePassword(password: string) {
  const encryptPassword = aesEncrypt(password);
  Cookies.set(passwordKey, encryptPassword);
}

/** 将账号加密后 存入cookies中 */
export function saveUsername(username: string) {
  const encryptUsername = aesEncrypt(username);
  Cookies.set(usernameKey, encryptUsername);
}

/** 将密码从cookies中删除 */
export function removePassword() {
  Cookies.remove(passwordKey);
}

/** 将账号从cookies中删除 */
export function removeUsername() {
  Cookies.remove(usernameKey);
}

/** 获取密码 并解密 */
export function getPassword(): string {
  const encryptPassword = Cookies.get(passwordKey);
  if (
    encryptPassword !== null &&
    encryptPassword !== undefined &&
    encryptPassword.trim() !== ""
  ) {
    return aesDecrypt(encryptPassword);
  }
  return null;
}

/** 获取账号 并解密 */
export function getUsername(): string {
  const encryptUsername = Cookies.get(usernameKey);
  if (
    encryptUsername !== null &&
    encryptUsername !== undefined &&
    encryptUsername.trim() !== ""
  ) {
    return aesDecrypt(encryptUsername);
  }
  return null;
}

export function saveIsRememberMe(isRememberMe: boolean) {
  Cookies.set(isRememberMeKey, isRememberMe.toString());
}

export function getIsRememberMe() {
  const value = Cookies.get(isRememberMeKey);
  return value === "true";
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token;
};
