# 阶段 07 执行记录：Vue 数据契约、精确金额和流水表单

日期：2026-10-13

## 1. 基线与工作区

- 工作仓库：`/Users/zhangchi118/代码/FortuneBoot-Ui`
- 分支：`master`
- 执行时 HEAD：`ac6af5eb475b73e3bd360e9cee4993bd038d8ff9`
- 设计基线 Ui HEAD：`2ad8ecf881d1215d7033a27114d7102a065f5696`（仅识别漂移，未回退）
- 启动时已有未提交内容：
  - 修改：`src/api/fortune/bill.ts`
  - 未跟踪草稿：`src/api/fortune/finance-order-v2.ts`、`src/views/fortune/finance-order/utils/order-contract.ts`、`order-money.ts`、`order-entry-adapter.ts`
- 已读取这些旧 diff/文件内容，并在原改动基础上增量实现，未 reset、checkout、commit 或 push。
- Ui 仓库内未发现 `AGENTS.md`。
- Server 仅只读核验，未写入：
  - 分支 `tmp`
  - HEAD `35f538bfbde98709e3050ba2ceef48d4ebcaeb7c`
  - 原脏文件 `.gitignore`、`fortuneboot-starter/src/main/resources/application.yml`
  - 核验了 `FortuneFinanceOrderV2Rest` 与 `FinanceOrderEntryCommand` 等 C08 契约。

## 2. 实际改动

### 新增

- `src/api/fortune/finance-order-v2.ts`：V2 HTTP 客户端、C08 模型、`ResponseDTO` 业务错误解析与全部端点封装。
- `src/views/fortune/finance-order/utils/order-contract.ts`：单据/组件/流水类型常量、标签与 C04 合法动作矩阵。
- `src/views/fortune/finance-order/utils/order-money.ts`：decimal.js 精确金额解析、两位小数输出、金额比较与 Long 精度 ID 归一化。
- `src/views/fortune/finance-order/utils/order-entry-adapter.ts`：提交分流、幂等 UUID 状态、multipart 组装、EntryCommand 构建与提交前业务校验。
- `tests/finance-order/order-money.test.ts`、`order-api.test.ts`、`order-entry-adapter.test.ts`、`bill-form.test.ts`。
- `vitest.config.ts`。

### 修改

- `src/views/fortune/bill/bill-form.vue`：
  - 新增 `contextBookId/contextOrderId/contextBillType/contextComponent/expectedVersion/lockOrderContext` props。
  - 锁定上下文时禁止切换账本、类型、单据。
  - 9-12 仅显示金额、账户、单据、日期等必要字段，无分类、转入账户和 extras。
  - WRITE_OFF 隐藏账户，强制 `confirm=true`、原因必填、无 extras。
  - 关联流水走 V2，普通 1/2/3 仍走旧账单 API。
  - V2 options 加载完成前不提交；版本冲突只提示刷新，不自动重提；失败保留表单与附件并解除 loading。
- `src/api/fortune/bill.ts`：旧接口保留；`BillVo` 增加金额、单据 ID、组件、规则版本、作废、允许动作与只读原因等展示字段。
- `src/views/fortune/bill/utils/hook.tsx`、`src/views/fortune/finance-order/order-bill.vue`：类型筛选和表格识别 9-12；未知类型不再回退为支出，并按组件识别非现金方向。
- `package.json` / `pnpm-lock.yaml`：新增本功能专用 `vitest`、`@vue/test-utils`、`jsdom` 与 `test:finance-order` 脚本；其他依赖版本保持原范围。
- `tsconfig.json`：纳入 `tests/**/*.ts`。

## 3. 产出公共签名

### V2 API

- `FinanceOrderV2Error`、`isFinanceOrderV2Error`、`isOrderVersionConflict`
- `unwrapFinanceOrderV2Response`
- `getFinanceOrderPageV2`
- `getFinanceOrderDetailV2`
- `getFinanceOrderEntriesV2`
- `getFinanceOrderAuditV2`
- `getFinanceOrderSummaryV2`
- `getFinanceOrderOptionsV2`
- `getFinanceOrderReconciliationV2`
- `createFinanceOrderV2`
- `modifyFinanceOrderV2`
- `transitionFinanceOrderV2`
- `addOrderEntryV2`
- `modifyOrderEntryV2`
- `orderEntryActionV2`

### 适配层

- `resolveEntrySubmitRoute`
- `computeEntryFingerprint`
- `ensureEntryRequestId`
- `buildEntryFormData`
- `parseEntryFormDataJson`
- `buildEntryCommand`
- `validateOrderEntry`

### 表单上下文

`BillForm` 新增同名 props，供阶段 08 详情页直接传递：

```text
contextBookId
contextOrderId
contextBillType
contextComponent
expectedVersion
lockOrderContext
```

## 4. 测试与验证

### TDD 证据

- 先建立测试后运行 `pnpm test:finance-order`，修正测试桩自身问题后 RED 为 20 条测试中 9 条失败。
- 失败点覆盖：`1.230` 三位小数、关联 1/2 ADD 未走 V2、`ResponseDTO.code` 业务错误、bill-form 上下文缺失、错误表单仍走旧 API、版本冲突未识别等。
- 实现后同一命令通过：4 个测试文件、20 条测试，0 失败、0 跳过。

### 命令结果

- `node --version`：`v22.23.1`
- `pnpm --version`：`10.33.0`
- `pnpm test:finance-order`：通过，4 files / 20 tests passed
- `pnpm typecheck`：**未通过**，exit 2；当前输出 81 个既有无关错误。逐项过滤后，本阶段改动文件与测试文件匹配数为 0。代表错误包括 `mock/*.ts` 缺少 `vite-plugin-mock`、`src/components/ReTypeit`、`src/layout`、`src/store/modules/multiTags` 等。按本阶段纪律未修改这些无关文件。
- `pnpm exec vite build`：通过，Vite 8.0.10，构建 4.42s，产物 5.32MB。
- `git diff --check`：通过，无空白错误。
- 仅对改动文件运行非全量 ESLint：通过，0 errors / 0 warnings。

## 5. 未完成与边界

- 全仓 `pnpm typecheck` 仍未通过；这不是本阶段改动文件错误，但按验证纪律不能声称全仓类型检查通过。
- 本阶段为 Ui 实现，未连接数据库，也未重跑 Server 数据库金额/并发测试；这些仍以 Server 前置阶段测试为边界。
- 未做浏览器手工/E2E 视觉验证；阶段 08 主页面完成后再做端到端界面回归。
- 未实现阶段 08 的单据主页面；本阶段只提供可复用表单、API 与上下文 props。
- 未自动 commit/push。

## 6. 阶段 08 可用接口

- 使用 `finance-order-v2.ts` 的查询、详情、summary、options 与写接口。
- 使用 `BillForm` 的六个显式上下文 props 锁定详情页发起的流水动作。
- 使用 `order-contract.ts` 的类型、组件、动作与标签常量渲染页面。
- 使用 `order-entry-adapter.ts` 构建命令和校验，不要在页面复制规则。
