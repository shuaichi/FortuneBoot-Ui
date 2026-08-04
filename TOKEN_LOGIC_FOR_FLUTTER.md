# Web 端 Token 逻辑说明

本文档梳理 FortuneBoot Web 端（Vue3 + Axios）关于登录、Token 存取、请求鉴权、Token 过期处理、登出的完整实现，供 Flutter 端对照排查“Token 过期后登出异常”的问题。

---

## 一、后端 Token 数据结构

登录成功后，后端返回的核心结构（`TokenDTO`）：

```ts
type TokenDTO = {
  token: string;                 // 实际的 JWT token（注意：字段名是 token，不是 accessToken）
  currentUser: {
    userInfo: { username, nickname, roleId, ... };
    roleKey: string;             // 当前角色
    permissions: Set<string>;    // 权限集合
  };
};
```

> 关键点：这是「后端管理 Token」的实现，**前端没有本地的过期时间字段，也没有 refreshToken 刷新流程**。前端只保存 `token` 字符串，是否过期完全由后端返回的业务 code 判断。

---

## 二、Token 的存取（auth.ts）

存储介质：**Cookie（js-cookie） + sessionStorage + localStorage 三处同时保存**，key 说明：

- `authorized-token`（Cookie）：保存完整 `TokenDTO` 的 JSON 字符串
- `user-info`（sessionStorage + localStorage）：同样保存完整 `TokenDTO`

### 读取 Token（优先级）

```ts
getToken():
  1. 先读 Cookie["authorized-token"]
  2. 再读 sessionStorage["user-info"]
  3. 最后读 localStorage["user-info"]
  4. 都没有则返回 null
```

### 保存 Token

```ts
setTokenFromBackend(data):
  - Cookie 写入 authorized-token = JSON.stringify(data)
  - 更新内存中的 username / roles
  - sessionStorage["user-info"] = data
  - localStorage["user-info"] = data
```

### 删除 Token（登出核心）

```ts
removeToken():
  - Cookies.remove("authorized-token")
  - sessionStorage.clear()          // 清空整个 session
  - localStorage.removeItem("user-info")
```

> Flutter 对照点：登出时必须把**所有存储位置**的 token / 用户信息都清干净。若 Flutter 端只清了其中一处（比如只清内存没清持久化，或只清 SecureStorage 没清内存缓存），过期后就可能出现“登出后又被旧 token 恢复登录态”或“登出不彻底”的问题。

---

## 三、请求拦截（发起请求时带 Token）

请求拦截器逻辑（http/index.ts → httpInterceptorsRequest）：

1. **白名单接口不带 token**（避免过期后死循环）：
   ```
   /getApiVersion, /getIcp, /refreshToken, /login,
   /captchaImage, /getConfig, /getAllowRegisterRoles,
   /register, /getRsaPublicKey
   ```
2. 非白名单接口：
   ```ts
   const data = getToken();
   if (data && data.token) {
     config.headers["Authorization"] = "Bearer " + data.token; // formatToken
   } else {
     // 本地无 token → 直接清理并跳登录，避免无效请求
     removeToken();
     router.push("/login");
   }
   ```

> 关键点：请求头格式为 `Authorization: Bearer <token>`。
> Flutter 对照点：确认请求头拼接是否一致（`Bearer ` 后带空格），以及本地无 token 时是否也直接跳登录。

---

## 四、Token 过期处理（响应拦截，核心逻辑）

Web 端有**两条**过期判定路径：

### 路径 A：后端返回 HTTP 200，但业务 code 表示过期

响应拦截器 `httpInterceptorsResponse` 中：

```ts
if (response.data.code !== 0) {
  // 106 / 107 / 108 视为 Token 失效
  if (code === 106 || code === 107 || code === 108) {
    // 已在登录页 或 已弹过窗，则不再重复弹
    if (currentPath === "/login" || hasShownAuthModal) {
      return Promise.reject(msg);
    }
    hasShownAuthModal = true; // 防止重复弹窗
    弹窗("登录状态已过期，请重新登录").finally(() => {
      hasShownAuthModal = false;
      removeToken(); // ★ 清 token
      router.push("/login"); // ★ 跳登录
    });
  } else {
    // 其他业务错误：普通 error 提示
    message(msg, { type: "error" });
    return Promise.reject(msg);
  }
}
```

### 路径 B：后端直接返回 HTTP 401 / 403

在响应拦截器的 error 回调中：

```ts
if (error.response.status === 401 || status === 403) {
  if (currentPath !== "/login" && !hasShownAuthModal) {
    hasShownAuthModal = true;
    弹窗("登录状态已过期，请重新登录").finally(() => {
      hasShownAuthModal = false;
      removeToken(); // ★ 清 token
      router.push("/login"); // ★ 跳登录
    });
  }
}
```

> 过期判定标准（Flutter 必须与后端保持一致）：
>
> - **业务 code：106 / 107 / 108** 表示 token 失效
> - **HTTP 状态码：401 / 403** 表示鉴权失败
>   命中任一，都要：清 token → 跳登录页。

---

## 五、防重复弹窗机制

Web 端用一个静态标志 `hasShownAuthModal` 来避免并发请求同时过期时弹出多个“重新登录”窗：

- 弹窗前：`hasShownAuthModal = true`
- 已在登录页 或 标志为 true 时：直接跳过，不重复处理
- 弹窗关闭（finally）后：`hasShownAuthModal = false`，再执行清 token + 跳转

> Flutter 对照点（很可能是你的 bug 所在）：
> 移动端 App 首屏往往会**并发发起多个请求**，如果它们同时收到 401：
>
> 1. 没有类似 `hasShownAuthModal` 的加锁 → 会多次触发登出/多次跳转，导致路由错乱、页面白屏或登出失败；
> 2. 或者反过来，加锁后**没有在 finally 里复位标志** → 第一次过期处理后标志一直为 true，后续再也无法触发登出。
>    建议 Flutter 端实现一个全局单例的 `isHandlingAuthExpired` 标志，且**务必在处理完成后复位**。

---

## 六、登出逻辑（logOut）

Web 端登出是**纯前端操作，不调用后端登出接口**：

```ts
logOut() {
  this.username = "";        // 清内存用户信息
  this.nickname = "";
  this.roles = [];
  removeToken();             // 清所有本地存储（Cookie/session/local）
  重置多标签页;
  resetRouter();             // 重置动态路由
  router.push("/login");     // 跳登录
  __ensureProfilePromise = null;  // 重置用户资料缓存 Promise（防止复用旧数据）
}
```

> 登出的四个必做动作：
>
> 1. 清内存态（username / roles / 当前用户）
> 2. 清所有持久化存储（token + 用户信息）
> 3. 重置路由/导航状态
> 4. 跳转登录页 + 清理任何缓存的用户资料 Promise/单例

---

## 七、关键文件索引（Web 端）

- `src/utils/auth.ts`：token 存取（getToken / setTokenFromBackend / removeToken / formatToken）
- `src/utils/http/index.ts`：请求/响应拦截器，过期判定与登出触发
- `src/store/modules/user.ts`：用户状态与 `logOut()`
- `src/layout/hooks/useNav.ts`：导航栏「退出登录」按钮的 `logout()`
- `src/api/common/login.ts`：登录接口与 `TokenDTO` 结构

> 注意：Web 端**没有实现 refreshToken 刷新流程**（虽然代码里有 `refreshToken` 白名单占位和 `DataInfo` 类型残留，但实际未使用）。当前是「无感刷新缺失、纯靠过期后重新登录」的模式。若 Flutter 端指望用 refreshToken 续期，需与后端确认是否真有该接口。
