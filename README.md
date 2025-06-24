<p align="center">
      <img src="https://img.shields.io/badge/Release-v1.1.6-green.svg" alt="Downloads">
      <img src="https://img.shields.io/badge/JDK-21+-green.svg" alt="Build Status">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Build Status">
   <img src="https://img.shields.io/badge/Spring%20Boot-3.3-blue.svg" alt="Downloads">
   <a target="_blank" href="https://bladex.vip">
   <img src="https://img.shields.io/badge/Author-弛神降临-ff69b4.svg" alt="Downloads">
 </a>
 <a target="_blank" href="https://bladex.vip">
   <img src="https://img.shields.io/badge/Copyright%20-@FortuneBoot-%23ff3f59.svg" alt="Downloads">
 </a>
 </p>  
<p align="center">

[//]: # '<img alt="logo" height="200" src="">'

</p>
<h1 align="center" style="margin: 30px 0 30px; font-weight: bold;">FortuneBoot v1.1.6</h1>

<h4 align="center">基于SpringBoot3+Vue3前后端分离的记账管理系统</h4>
<p align="center">
</p>

## ⚡ 平台简介 ⚡

- 本仓库是 FortuneBoot 好记记账的配套前端项目。
- 前端是基于优秀的开源项目[AgileBoot](https://github.com/valarchie/AgileBoot-Front-End)与[Pure-Admin](https://github.com/pure-admin/vue-pure-admin)开发而成。在此感谢 AgileBoot 和 Pure-Admin 作者。
- 本仓库前端技术栈 [Vue3](https://v3.cn.vuejs.org) + [Element Plus](https://element-plus.org/zh-CN) + [Vite](https://cn.vitejs.dev) 版本。
- 配套后端代码仓库地址[FortuneBoot](TODO 待配置)。
- 规范请参照该文档 [前端规范](https://gitee.com/MinJieLiu/web-standard#/MinJieLiu/web-standard)。
- 记账逻辑参考了[moneynote](https://github.com/getmoneynote/moneynote-pc)项目，不是基于它的代码，而是基于它的逻辑重写，在此感谢 moneynote 作者。

#### AgileBoot 维护者

- [valarchie](https://github.com/valarchie)

#### moneynote 维护者

- [getmonetnote](https://github.com/getmoneynote)

### 前端配套资料

#### 配套视频

- [点我查看教程](https://www.bilibili.com/video/BV1kg411v7QT)
- [点我查看 UI 设计](https://www.bilibili.com/video/BV17g411T7rq)

#### 配套保姆级文档

- [查看文档](https://yiming_chang.gitee.io/pure-admin-doc)

#### Pure-Admin 框架预览

- [查看预览](https://pure-admin-thin.netlify.app/#/login)

#### Pure-Admin 维护者

- [xiaoxian521](https://github.com/xiaoxian521)

## ✨ 使用 ✨

### 开发环境

Node.js 版本要求：16.0+
pnpm 版本要求：6.0+

优先选择 node=16, pnpm=7.30.5 的环境.

如果您还没安装 pnpm，请执行下面命令进行安装（mac 用户遇到安装报错请在命令前加上 sudo） 如果是 windows 用户，使用 power shell 管理员权限执行

```
npm install -g pnpm
```

安装依赖

```
pnpm install
```

启动平台

```
pnpm run dev
```

不管是什么源，我们都可以不用管，直接执行下面命令即可

npm config set registry https://registry.npmmirror.com

上面的命令是将本地的源换成国内源 npmmirror
(opens new window)，经过几轮测试，发现它的下载速度快且同步率高，同步频率 10 分钟一次，如果您之前的源是这个 http://registry.npm.taobao.org ，那您必须换成 npmmirror 啦，因为原淘宝 npm 域名即将停止解析

## 🙊 系统功能 🙊

```
额外新增的功能，我们使用 🚀 标记。
重新实现的功能，我们使用 ⭐️ 标记。
```

|     | 功能         | 描述                                                                                 |
| --- | ------------ | ------------------------------------------------------------------------------------ |
|     | 用户管理     | 用户是系统操作者，该功能主要完成系统用户配置                                         |
|     | 菜单管理     | 配置系统菜单、操作权限、按钮权限标识等，本地缓存提供性能                             |
|     | 角色管理     | 角色菜单权限分配、设置角色按机构进行数据范围权限划分                                 |
|     | 参数管理     | 对系统动态配置常用参数                                                               |
|     | 通知公告     | 系统通知公告信息发布维护                                                             |
|     | 操作日志     | 系统正常操作日志记录和查询；系统异常信息日志记录和查询                               |
|     | 登录日志     | 系统登录日志记录查询包含登录异常                                                     |
|     | 在线用户     | 当前系统中活跃用户状态监控                                                           |
|     | 系统接口     | 根据业务代码自动生成相关的 api 接口文档                                              |
|     | 服务监控     | 监视当前系统 CPU、内存、磁盘、堆栈等相关信息                                         |
|     | 缓存监控     | 对系统的缓存信息查询，命令统计等                                                     |
|     | 连接池监视   | 监视当前系统数据库连接池状态，可进行分析 SQL 找出系统性能瓶颈                        |
| 🚀  | 分组管理     | 记账的一个单位组织，一个组下面包含记账的用户，账户，账本                             |
| 🚀  | 账户管理     | 账户在现实生活中代表我们存钱的地方                                                   |
| 🚀  | 账本管理     | 账本跟生活中的账簿类似,一个账本下面包含分类、标签、交易对象、账单                    |
| 🚀  | 分类管理     | 划分和归集交易，它代表了我们记账的整体框架，是统计报表最重要的维度，账单必须包含分类 |
| 🚀  | 标签管理     | 给账单加上特征，可以方便筛选出某一特征的账单                                         |
| 🚀  | 交易对象管理 | 映射现实生活中的收款或付款对象，例如：京东商城                                       |
| 🚀  | 账单管理     | 真实的交易账单                                                                       |

## 💥 在线体验 💥

演示地址：

- <https://fortuneboot.com>
- <https://www.fortuneboot.com>
  > 管理员账密：admin/admin123  
  > 不定期清理数据，请勿存储真实数据。

## TODO

- 复制账本
- 预算管理
- 报表
- 日历账单
- 贷款、信用卡分期自动计息
- 周期自动记账

## 🎬 FortuneBoot 交流群 🎬

QQ 群： [![加入QQ群](https://img.shields.io/badge/1009576058-blue.svg)](https://qm.qq.com/q/M2zyt7vxyG) 点击按钮入群。

[//]: # "如果觉得该项目对您有帮助，可以小额捐赠支持本项目演示网站服务器等费用~"
[//]: # '<img alt="logo" height="200" src="">'

### 用法

#### 安装依赖

```
pnpm install
```

#### 安装一个包

```
pnpm add 包名
```

#### 卸载一个包

```
pnpm remove 包名
```

### 许可证

原则上不收取任何费用及版权，可商用，不过如需二次开源（比如用此平台二次开发并开源，要求前端代码必须开源免费）请联系作者获取许可！（免费，走个记录而已）
