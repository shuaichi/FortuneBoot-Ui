# 阶段 08 执行记录：Vue单据工作台、详情抽屉、状态操作与统计联动

日期：2026-10-13

## 1. 基线与工作区

- 工作仓库：`/Users/zhangchi118/代码/FortuneBoot-Ui`
- 分支：`master`
- 执行时 HEAD：`1c2844b01c11bb3d8543f6f82a439b0efe4eb2c9`
- 设计基线 Ui HEAD：`2ad8ecf881d1215d7033a27114d7102a065f5696`（仅识别漂移，未回退）
- 启动时工作区干净；本阶段未执行 reset、checkout、commit 或 push。
- Ui 仓库内未发现 `AGENTS.md`。
- 本阶段仅修改 Ui，并在联调时只读使用 Server jar。

## 2. 实际改动

### 新增

- `src/views/fortune/finance-order/order-summary.vue`：三类待结清摘要卡。
- `src/views/fortune/finance-order/order-detail-drawer.vue`：720px/90vw 详情抽屉、C10 金额分解、流水/审计/核对页签、服务端允许动作与只读控制。
- `src/views/fortune/finance-order/order-adjustment-dialog.vue`：差额结清二次确认和 WRITE_OFF 表单入口。
- `src/views/fortune/finance-order/order-audit.vue`：审计分页。
- `src/views/fortune/finance-order/order-reconciliation.vue`：异常/孤立流水只读报告与 CSV 导出。
- `src/views/fortune/finance-order/utils/use-finance-order-refresh.ts`：固定 `finance-order:mutated` 事件和卸载解除订阅。
- `tests/finance-order/order-page.test.ts`
- `tests/finance-order/order-detail.test.ts`
- `tests/finance-order/order-form.test.ts`
- `tests/finance-order/order-refresh.test.ts`

### 修改

- `src/views/fortune/finance-order/index.vue`：
  - 三类/状态/关键词/逾期筛选，默认债权单 + 进行中 + 20条分页。
  - V2 summary、V2 page、请求序号防竞态、失败保留旧数据。
  - 桌面表格/移动卡片、金额右对齐、仅“查看/主动作/更多”。
  - 从行/详情进入 BillForm；成功后刷新列表、详情、summary。
- `src/views/fortune/finance-order/order-form.vue`：
  - 新建支持类型、对象、日期、备注；保存草稿和继续记账。
  - 修复旧 `type` 固定 1、`opType` 不一致、未 validate 直接提交。
  - 编辑锁定账本/类型/币种，有流水时锁定对象；版本冲突保留输入。
- `src/views/fortune/finance-order/order-bill.vue`：
  - 改用 V2 entries 分页；移除旧 pagination/searchForm 重复状态。
  - 有效/作废/全部流水、行点击进入账单详情、确认/取消/作废/恢复、非现金不显示账户。
- `src/views/fortune/finance-order/utils/hook.tsx`：V2 列表/摘要加载、筛选/分页/竞态/主操作计算。
- `src/views/fortune/finance-order/utils/order-contract.ts`：状态、类型、主动作、类型文案、动作映射。
- `src/views/fortune/finance-order/utils/order-money.ts`：两位小数千分位展示。
- `src/views/fortune/bill/bill-form.vue`：
  - 新增 `contextTitle`、`contextAmount`。
  - `success` 事件携带 V2 `FinanceOrderMutationVo`。
  - 修复上下文标题缺失和重复标题输入。
- `src/views/fortune/statistics/loan-finance/page.vue`：V2 summary 四卡、待核对/孤立/待确认数、旧 profit 形状保留并更新为“已归档借款收支/净收支/净收益率”。
- `src/views/fortune/account/index.vue`：订阅 `finance-order:mutated` 后刷新账户列表。
- `src/utils/mitt.ts`：新增固定事件类型。
- `vitest.config.ts`：启用 Vue JSX 插件以支持本阶段页面依赖。

## 3. 产出公共签名

- `useFinanceOrderList()`
- `hasMoreRowActions(row: FinanceOrderDetailVo): boolean`
- `entryActionLabel(action: EntryAction): string`
- `emitFinanceOrderMutated(payload: FinanceOrderMutatedPayload): void`
- `useFinanceOrderMutationEvents(handler): void`
- `FinanceOrderMutatedPayload`
- `formatOrderAmountText(value, options?): string`
- `ORDER_STATUS_OPTIONS`
- `ORDER_TYPE_META`
- `ENTRY_ACTION_META`
- `BillForm` 上下文：
  - `contextBookId`
  - `contextOrderId`
  - `contextBillType`
  - `contextComponent`
  - `contextTitle`
  - `contextAmount`
  - `expectedVersion`
  - `lockOrderContext`

组件 `FortuneFinanceOrder` 的路由 name、菜单名称和 URL 未改变。

## 4. 测试与验证

### TDD 证据

- 先新增 4 个阶段测试文件并运行 `pnpm test:finance-order`，初始 RED 为 4 个 suite 失败；缺组件/事件/JSX 支持。
- 实现后新增回归：继续记账表单 footer 必须可见，覆盖手动联调发现的 footer slot 被 `hidden-footer` 吞掉的问题。

### 命令结果

- `pnpm test:finance-order`：通过，8 files / 40 tests，0 失败。
- `pnpm typecheck`：**未通过**，exit 2，当前 78 个既有无关错误；本阶段改动文件与新增测试匹配数为 0。
- `pnpm exec vite build`：通过，4.30s，产物 5.37 MB。
- `git diff --check`：通过。

### 真实联调边界

- 已启动本地 Server jar + SQLite 测试库：
  - DB：`/private/tmp/fortuneboot-stage08.db`
  - 附件：`/private/tmp/fortuneboot-stage08-files`
  - API 前缀：`/dev-api`
- 已启动本地 Vite 页面并完成登录、进入单据管理页面。
- 已通过浏览器创建债权单草稿并进入“记录借出”表单。
- 试运行截图与网络记录：
  - 1440px 亮色截图：`/private/tmp/stage08-light-1440.png`（footer 修复前采集，不作为最终验收图）
  - 网络事件：`/private/tmp/stage08-network.json`
- 未完成 C11 三条完整本金流、375px/暗色截图和最终账户金额刷新核对；继续自动化时宿主审批因访问限制（429）中断。
- 本阶段不能声称真实后端联调已完整通过。

## 5. 未完成项与下一阶段接口

- 未完成：
  - C11 债权/债务/报销三条完整本金流。
  - 1440px 与 375px、明暗色最终截图。
  - 账户余额刷新的浏览器端最终确认。
- 下一阶段可直接复用：
  - V2 summary/page/detail/entries/audit/reconciliation API。
  - `finance-order:mutated` 事件。
  - 详情抽屉与 BillForm 上下文。
  - 差额结清二次确认入口。
