<div align="center">

# 🌟 FortuneBoot-Ui

**FortuneBoot 财务记账平台 —— 现代化 Vue3 极速前端工程**

<p align="center">
  <img src="https://img.shields.io/badge/Release-v1.6.1-green.svg" alt="Release">
  <img src="https://img.shields.io/badge/Vue-3.5+-brightgreen.svg" alt="Vue">
  <img src="https://img.shields.io/badge/Vite-8.0+-646CFF.svg" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-4.2-38B2AC.svg" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/Author-%E5%BC%9B%E7%A5%9E%E9%99%8D%E4%B8%B4-ff69b4.svg" alt="Author">
  <img src="https://img.shields.io/badge/Copyright-@shuaichi-%23ff3f59.svg" alt="Copyright">
</p>

[在线体验](https://demo.fortuneboot.com/) | [官方网站](https://www.fortuneboot.com/) | [后端源码](https://github.com/shuaichi/FortuneBoot-Server) | [提交 Issue](https://github.com/shuaichi/FortuneBoot-Ui/issues) | [部署文档](https://github.com/shuaichi/FortuneBoot-Deploy)

> 演示账号密码：`admin` / `admin123`

</div>

<br>

## 📖 项目简介

**FortuneBoot-Ui** 是 FortuneBoot 开源财务记账管理系统的专属前端工程。
本项目基于优秀的开源中后台框架 [Pure-Admin](https://github.com/pure-admin/vue-pure-admin) 深度定制与精简，全面拥抱最新的前端技术生态。我们不仅追求极致的交互体验和视觉美感，更注重财务系统必须具备的**数据严谨性与组件规范性**。

### ✨ 前端核心亮点

- ⚡ **极速驱动**：基于 **Vite 8** 与 **Vue 3.5+** 构建，享受极致的冷启动速度与毫秒级 HMR（热更新）。
- 🎨 **现代 UI 与排版**：采用 **Element Plus** 结合次世代 CSS 引擎 **Tailwind CSS v4**，提供高度定制化的暗黑模式与多套主题配色。
- 🧮 **金融级精度计算**：深度集成 **Decimal.js**，彻底解决 JavaScript 经典的 `0.1 + 0.2 != 0.3` 浮点数精度丢失问题，确保财务统计分毫不差。
- 🔐 **动态路由与权限**：对接后端 DDD 架构，实现按钮级/页面级的动态 RBAC 权限管控。
- 📊 **丰富的数据可视化**：集成 **ECharts 6**，提供资产看板、收支趋势折线图、资产分布玫瑰图等专业财务报表。
- 🛠️ **严格的工程规范**：配置了严苛的 ESLint、Prettier、Stylelint 以及 Git Hooks (Husky + Commitlint)，保证团队协作代码风格高度一致。

---

## 🛠️ 前端技术栈

| 技术组件                                                | 描述                                   | 版本      |
| ------------------------------------------------------- | -------------------------------------- | --------- |
| **[Vue](https://vuejs.org/)**                           | 渐进式 JavaScript 框架                 | `^3.5.31` |
| **[Vite](https://vitejs.dev/)**                         | 下一代前端构建工具                     | `^8.0.3`  |
| **[Element Plus](https://element-plus.org/)**           | 基于 Vue 3，面向设计师和开发者的组件库 | `^2.13.6` |
| **[Tailwind CSS](https://tailwindcss.com/)**            | 实用优先的 CSS 框架 (全新 v4 引擎)     | `^4.2.2`  |
| **[Pinia](https://pinia.vuejs.org/)**                   | 符合直觉的 Vue.js 状态管理库           | `^3.0.4`  |
| **[Vue Router](https://router.vuejs.org/)**             | Vue.js 的官方路由                      | `^5.0.4`  |
| **[ECharts](https://echarts.apache.org/)**              | 强大的声明式数据可视化库               | `^6.0.0`  |
| **[Decimal.js](https://mikemcl.github.io/decimal.js/)** | 任意精度的十进制算术运算库 (财务必备)  | `^10.6.0` |
| **[ExcelJS](https://github.com/exceljs/exceljs)**       | 纯前端读取/导出 Excel 文件             | `^4.4.0`  |

---

## 🧱 工程目录结构

```text
FortuneBoot-Ui
├── build/               // 📦 Vite 构建相关配置 (插件、CDN、压缩等)
├── mock/                // 🧲 Mock 模拟数据 (独立于后端开发时使用)
├── public/              // 🌐 静态资源 (favicon, 外部第三方库)
├── src/                 // 💻 源代码目录
│   ├── api/             // 接口请求统一定义 (fortune:记账业务, system:系统基础)
│   ├── assets/          // 图片、SVG 等静态资源
│   ├── components/      // 全局通用组件 (图表、上传、弹窗、裁剪器等)
│   ├── config/          // 全局静态配置
│   ├── directives/      // 自定义 Vue 指令 (如: v-auth 权限指令, v-optimize 防抖节流)
│   ├── layout/          // 页面整体布局架构 (侧边栏、顶栏、标签页)
│   ├── router/          // 路由配置与动态路由解析拦截
│   ├── store/           // Pinia 状态管理 (User, App, Permission, Tags)
│   ├── style/           // 全局样式 (Tailwind配置, SCSS 变量, 暗黑模式)
│   ├── utils/           // 🛠️ 通用工具类 (http请求封装, decimal高精度计算, auth认证等)
│   └── views/           // 📄 业务页面
│       ├── fortune/     // 💰 财务核心业务 (账单、账本、分类、报表、归物等)
│       ├── system/      // ⚙️ 系统管理业务 (用户、角色、菜单、配置等)
│       ├── login/       // 🔐 登录/注册模块
│       └── error/       // ❌ 403/404/500 异常页面
├── .env.*               // 环境变量配置 (开发、测试、生产)
└── package.json         // 依赖包与执行脚本配置
```

---

## 🚀 快速上手

### 1. 环境准备

- **Node.js**: `v20.19.0+` 或 `v22.13.0+`
- **包管理器**: 强烈推荐使用 **pnpm** `v9.0+` (项目已配置 `only-allow pnpm` 限制)

```bash
# 全局安装 pnpm (若已安装请忽略)
npm install -g pnpm
```

### 2. 克隆项目与安装依赖

```bash
git clone https://github.com/shuaichi/FortuneBoot-Ui.git
cd FortuneBoot-Ui

# 配置国内淘宝镜像（可选，加速下载）
npm config set registry https://registry.npmmirror.com

# 安装依赖
pnpm install
```

### 3. 配置服务端地址

开发环境下，若需联调本地后端，请修改 `vite.config.ts` 中的 `proxy` 配置，或在 `.env.development` 中修改基础请求路径：

```env
# 本地后端接口地址配置
VITE_APP_BASE_API = '/dev-api'
```

_(默认情况下，Vite 配置了代理，将 `/dev-api` 转发至 `http://localhost:8080`)_

### 4. 启动开发服务器

```bash
pnpm run dev
```

启动成功后，浏览器访问控制台输出的地址 (通常为 `http://localhost/`)。

### 5. 项目打包构建

```bash
# 构建生产环境代码
pnpm run build
```

打包产物将生成在 `dist` 目录下，可直接将其放入 Nginx 或后端静态资源目录下部署。

---

## 💡 开发者必读

### 财务高精度计算说明

在修改或新增与**“金额”**相关的页面时，**严禁使用原生 JavaScript 的 `+ - * /` 进行浮点数运算**。
请务必引入 `src/utils/decimal.ts` 中的高精度计算工具：

```typescript
import { add, subtract, multiply, divide, sumBy } from "@/utils/decimal";

// ❌ 错误做法： 0.1 + 0.2 === 0.30000000000000004
// ✅ 正确做法：
const total = add(0.1, 0.2); // 返回 0.3
```

### 代码规范与提交流程

本项目配置了严格的格式化工具。在发起 `git commit` 时，Husky 会自动拦截并校验代码规范：

- 如果遇到格式化报错，可手动执行一键修复：
  ```bash
  pnpm run lint
  ```
- 提交的 Commit Message 必须遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范（如：`feat: 新增周期记账页面`，`fix: 修复图表显示bug`）。

---

## 🤝 社区与支持

有任何问题或者建议，欢迎在 _Issues_ 中提出。我们期待与热爱前端与优雅 UI 的你共同完善这个项目！

- **官方交流 QQ 群**：[![加入QQ群](https://img.shields.io/badge/1009576058-blue.svg)](https://qm.qq.com/q/M2zyt7vxyG) （点击加群，获取前后端全栈开发指导）
- **Bug 反馈**：[提交 Issue](https://github.com/shuaichi/FortuneBoot-Ui/issues)
- **如果你觉得项目写得不错，可以给作者买杯咖啡支持一下服务器费用~ ☕**

## 📜 许可证

本项目基于 [MIT License](LICENSE) 开源。

_注意：原则上不收取任何费用及版权，可商用。不过如需二次开源（比如用此平台二次开发并开源，要求您的前端代码也必须开源免费），请联系作者获取许可（免费，仅作开源生态记录）。_
