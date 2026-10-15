<template>
  <el-drawer
    v-model="visible"
    class="finance-order-drawer"
    size="720px"
    append-to-body
    destroy-on-close
  >
    <template #header>
      <div class="drawer-header">
        <div class="drawer-title">
          <span>{{ detail?.counterpartyName || detail?.title }}</span>
          <span class="drawer-subtitle">{{ detail?.title }}</span>
        </div>
        <div class="drawer-tags">
          <el-tag size="small">{{ detail?.typeDesc }}</el-tag>
          <el-tag size="small" type="info">{{ detail?.statusDesc }}</el-tag>
          <el-tag v-if="detail?.overdue" size="small" type="danger">
            已逾期
          </el-tag>
          <el-tag v-if="settlementStateText" size="small" type="warning">
            {{ settlementStateText }}
          </el-tag>
        </div>
      </div>
    </template>

    <div v-loading="loading" class="detail-body">
      <el-alert
        v-if="isReadOnly"
        :title="detail?.readOnlyReason || '单据待核对，当前只读'"
        type="warning"
        show-icon
        :closable="false"
      />

      <div class="amount-grid">
        <div class="pending-card">
          <span>{{ typeMeta?.pendingLabel || "待结清" }}</span>
          <strong>{{ formatAmount(detail?.pendingAmount) }}</strong>
          <small>{{ detail?.currencyCode }}</small>
        </div>
        <div class="amount-item">
          <span>{{ typeMeta?.issuedLabel || "累计发生" }}</span>
          <strong>{{ formatAmount(detail?.issuedAmount) }}</strong>
        </div>
        <div class="amount-item">
          <span>{{ typeMeta?.settledLabel || "已结算" }}</span>
          <strong>{{ formatAmount(detail?.settledAmount) }}</strong>
        </div>
        <div class="amount-item">
          <span>差额结清</span>
          <strong>{{ formatAmount(detail?.adjustedAmount) }}</strong>
        </div>
      </div>

      <el-descriptions :column="2" border size="small" class="detail-desc">
        <el-descriptions-item label="对象">
          {{ detail?.counterpartyName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="币种">
          {{ detail?.currencyCode || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="到期日">
          {{ detail?.dueDate || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="待确认流水">
          {{ detail?.pendingEntryCount ?? 0 }} 笔
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">
          {{ detail?.submitTime || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="关闭时间">
          {{ detail?.closeTime || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ detail?.remark || "-" }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="accessory-grid">
        <div>
          <span>利息收入</span>
          <strong>{{ formatAmount(detail?.interestIncome) }}</strong>
        </div>
        <div>
          <span>利息费用</span>
          <strong>{{ formatAmount(detail?.interestExpense) }}</strong>
        </div>
        <div>
          <span>手续费</span>
          <strong>{{ formatAmount(detail?.feeAmount) }}</strong>
        </div>
        <div>
          <span>净收支</span>
          <strong>{{ formatAmount(detail?.netCostOrIncome) }}</strong>
        </div>
      </div>

      <div class="detail-actions">
        <el-button
          v-if="primaryEntryAction"
          type="primary"
          @click="openEntryForm(primaryEntryAction)"
        >
          {{ entryActionLabel(primaryEntryAction) }}
        </el-button>

        <el-dropdown
          v-if="hasMoreActions"
          trigger="click"
          @command="handleMoreCommand"
        >
          <el-button>更多</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="action in secondaryEntryActions"
                :key="action"
                :command="`entry:${action}`"
              >
                {{ entryActionLabel(action) }}
              </el-dropdown-item>
              <el-dropdown-item v-if="canEditMetadata" command="metadata">
                编辑单据信息
              </el-dropdown-item>
              <el-dropdown-item v-if="canAdjust" command="adjustment">
                {{ typeMeta?.writeOffText || "差额结清" }}
              </el-dropdown-item>
              <el-dropdown-item v-if="canArchive" command="close">
                归档
              </el-dropdown-item>
              <el-dropdown-item v-if="canReopen" command="reopen">
                重开
              </el-dropdown-item>
              <el-dropdown-item v-if="canDelete" command="remove">
                删除空单据
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="流水" name="entries">
          <div class="entry-toolbar">
            <el-radio-group v-model="entryStatus" size="small">
              <el-radio-button label="ACTIVE">有效</el-radio-button>
              <el-radio-button label="VOIDED">作废</el-radio-button>
              <el-radio-button label="ALL">全部</el-radio-button>
            </el-radio-group>
          </div>
          <order-bill
            :book-id="bookId"
            :order-id="orderId"
            :expected-version="detail?.version"
            :entry-status="entryStatus"
            @entry-click="entry => emits('open-bill', entry)"
            @edit="entry => emits('edit-entry', entry)"
            @mutated="handleChildMutated"
          />
        </el-tab-pane>
        <el-tab-pane label="操作审计" name="audit">
          <order-audit :book-id="bookId" :order-id="orderId" />
        </el-tab-pane>
        <el-tab-pane label="核对报告" name="reconciliation">
          <order-reconciliation
            :book-id="bookId"
            @mutated="handleChildMutated"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <bill-form
      v-if="entryFormVisible && entryAction"
      v-model="entryFormVisible"
      type="add"
      :group-id="groupId"
      :book-id="bookId"
      v-bind="entryFormContext(entryAction)"
      @success="handleEntrySuccess"
    />

    <order-adjustment-dialog
      v-if="adjustmentVisible && detail"
      v-model="adjustmentVisible"
      :order="detail"
      :group-id="groupId"
      @success="handleEntrySuccess"
    />

    <order-form
      v-if="metadataFormVisible && detail"
      v-model="metadataFormVisible"
      mode="edit"
      :row="detail"
      :group-id="groupId"
      :book-id="bookId"
      :has-entry-history="entryHistoryTotal > 0"
      @success="handleMetadataSuccess"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessageBox } from "element-plus";
import BillForm from "@/views/fortune/bill/bill-form.vue";
import {
  getFinanceOrderDetailV2,
  getFinanceOrderEntriesV2,
  orderEntryActionV2,
  transitionFinanceOrderV2,
  type FinanceOrderDetailVo,
  type FinanceOrderEntryVo,
  type FinanceOrderMutationVo,
  type OrderIdLike
} from "@/api/fortune/finance-order-v2";
import { message } from "@/utils/message";
import OrderAdjustmentDialog from "./order-adjustment-dialog.vue";
import OrderAudit from "./order-audit.vue";
import OrderBill from "./order-bill.vue";
import OrderForm from "./order-form.vue";
import OrderReconciliation from "./order-reconciliation.vue";
import {
  ENTRY_ACTION_META,
  ORDER_TYPE_META,
  SETTLEMENT_STATE,
  type EntryAction
} from "./utils/order-contract";
import { formatOrderAmountText, isMoneyGreaterThan } from "./utils/order-money";

const props = defineProps<{
  modelValue: boolean;
  bookId: OrderIdLike;
  orderId: OrderIdLike;
  groupId: number;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (
    e: "mutated",
    payload: { bookId: OrderIdLike; orderId: OrderIdLike; billId?: OrderIdLike }
  ): void;
  (e: "open-bill", entry: FinanceOrderEntryVo): void;
  (e: "edit-entry", entry: FinanceOrderEntryVo): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});

const loading = ref(false);
const detail = ref<FinanceOrderDetailVo | null>(null);
const entryHistoryTotal = ref(0);
const activeTab = ref<"entries" | "audit" | "reconciliation">("entries");
const entryStatus = ref<"ACTIVE" | "VOIDED" | "ALL">("ACTIVE");
const entryFormVisible = ref(false);
const entryAction = ref<EntryAction | null>(null);
const adjustmentVisible = ref(false);
const metadataFormVisible = ref(false);
const lifecycleLoading = ref(false);

const typeMeta = computed(() =>
  detail.value ? ORDER_TYPE_META[detail.value.type] : null
);
const isReadOnly = computed(() => {
  if (!detail.value) return true;
  return (
    detail.value.readOnlyReason != null ||
    detail.value.reconciliationStatus === "REVIEW_REQUIRED"
  );
});
const settlementStateText = computed(() => {
  const state = detail.value?.settlementState;
  if (!state) return null;
  return {
    [SETTLEMENT_STATE.EMPTY]: "未记账",
    [SETTLEMENT_STATE.UNSETTLED]: "未结清",
    [SETTLEMENT_STATE.PARTIAL]: "部分结清",
    [SETTLEMENT_STATE.SETTLED]: "已结清",
    [SETTLEMENT_STATE.REVIEW_REQUIRED]: "待核对"
  }[state];
});
const hasPositivePending = computed(() => {
  const pending = detail.value?.pendingAmount;
  return pending != null && isMoneyGreaterThan(pending, "0");
});
const primaryEntryAction = computed<EntryAction | null>(() => {
  if (isReadOnly.value || !detail.value) return null;
  const settle = typeMeta.value?.settleAction;
  if (settle && hasPositivePending.value && isAllowed(settle)) return settle;
  return null;
});
const visibleEntryActions = computed<EntryAction[]>(() => {
  if (isReadOnly.value || !detail.value) return [];
  return detail.value.allowedEntryActions.filter(action => {
    if (action === typeMeta.value?.settleAction && !hasPositivePending.value) {
      return false;
    }
    return true;
  });
});
const secondaryEntryActions = computed(() =>
  visibleEntryActions.value.filter(
    action => action !== primaryEntryAction.value
  )
);
const canEditMetadata = computed(
  () => !!detail.value?.canEdit && !isReadOnly.value
);
const canAdjust = computed(
  () => !isReadOnly.value && isAllowed("WRITE_OFF") && hasPositivePending.value
);
const canArchive = computed(
  () => !!detail.value?.canClose && !isReadOnly.value
);
const canReopen = computed(
  () => !!detail.value?.canReopen && !isReadOnly.value
);
const canDelete = computed(
  () => !!detail.value?.canDelete && !isReadOnly.value
);
const hasMoreActions = computed(
  () =>
    secondaryEntryActions.value.length > 0 ||
    canEditMetadata.value ||
    canAdjust.value ||
    canArchive.value ||
    canReopen.value ||
    canDelete.value
);

function formatAmount(value: string | null | undefined) {
  return formatOrderAmountText(value, { emptyText: "待核对" });
}

function isAllowed(action: EntryAction) {
  return (detail.value?.allowedEntryActions ?? []).includes(action);
}

function entryActionLabel(action: EntryAction) {
  return ENTRY_ACTION_META[action].label;
}

function entryFormContext(action: EntryAction) {
  const meta = ENTRY_ACTION_META[action];
  const isSettlement =
    action === typeMeta.value?.settleAction || action === "WRITE_OFF";
  return {
    contextBookId: props.bookId,
    contextOrderId: props.orderId,
    contextBillType: meta.billType,
    contextComponent: meta.component,
    contextTitle: entryActionLabel(action),
    contextAmount: isSettlement ? (detail.value?.pendingAmount ?? null) : null,
    expectedVersion: detail.value?.version ?? 0,
    lockOrderContext: true
  };
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function loadDetail() {
  const target = detail.value;
  loading.value = true;
  try {
    const [detailRes, history] = await Promise.all([
      getFinanceOrderDetailV2(props.bookId, props.orderId),
      getFinanceOrderEntriesV2(props.bookId, props.orderId, {
        pageNum: 1,
        pageSize: 1,
        entryStatus: "ALL"
      })
    ]);
    detail.value = detailRes;
    entryHistoryTotal.value = history.total ?? 0;
  } catch (e) {
    message((e as Error)?.message || "单据详情查询失败", { type: "error" });
    if (target) detail.value = target;
  } finally {
    loading.value = false;
  }
}

function openEntryForm(action: EntryAction) {
  entryAction.value = action;
  entryFormVisible.value = true;
}

async function handleEntrySuccess(result: FinanceOrderMutationVo) {
  entryFormVisible.value = false;
  adjustmentVisible.value = false;
  emits("mutated", {
    bookId: props.bookId,
    orderId: props.orderId,
    billId: result.billId ?? undefined
  });
  await loadDetail();
}

function handleChildMutated(payload: {
  bookId: OrderIdLike;
  orderId: OrderIdLike;
  billId?: OrderIdLike;
}) {
  emits("mutated", payload);
  loadDetail();
}

async function handleMetadataSuccess() {
  metadataFormVisible.value = false;
  emits("mutated", {
    bookId: props.bookId,
    orderId: props.orderId
  });
  await loadDetail();
}

async function handleEntryAction(
  entry: FinanceOrderEntryVo,
  action: "confirm" | "unconfirm" | "void" | "restore"
) {
  if (isReadOnly.value) {
    message("当前单据只读，不能执行该操作", { type: "warning" });
    return;
  }
  try {
    await orderEntryActionV2(
      props.bookId,
      props.orderId,
      entry.billId,
      action,
      {
        requestId: createRequestId(),
        expectedVersion: detail.value?.version ?? 0
      }
    );
    emits("mutated", {
      bookId: props.bookId,
      orderId: props.orderId,
      billId: entry.billId
    });
    await loadDetail();
  } catch (e) {
    message((e as Error)?.message || "流水操作失败", { type: "error" });
  }
}

async function handleLifecycle(action: "close" | "reopen" | "remove") {
  if (isReadOnly.value) {
    message("当前单据只读，不能执行该操作", { type: "warning" });
    return;
  }
  if (lifecycleLoading.value) return;
  lifecycleLoading.value = true;
  try {
    await transitionFinanceOrderV2(props.bookId, props.orderId, action, {
      requestId: createRequestId(),
      expectedVersion: detail.value?.version ?? 0
    });
    emits("mutated", {
      bookId: props.bookId,
      orderId: props.orderId
    });
    if (action === "remove") {
      visible.value = false;
    } else {
      await loadDetail();
    }
  } catch (e) {
    message((e as Error)?.message || "单据状态操作失败", { type: "error" });
  } finally {
    lifecycleLoading.value = false;
  }
}

async function confirmLifecycle(action: "close" | "reopen" | "remove") {
  const text = {
    close: "归档后历史统计保持不变，单据和关联流水将只读。",
    reopen: "重开将清空关闭日期，允许继续补录或纠错，不会回滚资金。",
    remove: "仅允许删除没有任何流水历史的空单据，删除后不可恢复。"
  }[action];
  try {
    await ElMessageBox.confirm(text, "确认操作", { type: "warning" });
    await handleLifecycle(action);
  } catch {
    // 用户取消
  }
}

function handleMoreCommand(command: string | number | object) {
  const text = String(command);
  if (text.startsWith("entry:")) {
    openEntryForm(text.slice("entry:".length) as EntryAction);
    return;
  }
  if (text === "metadata") {
    metadataFormVisible.value = true;
    return;
  }
  if (text === "adjustment") {
    adjustmentVisible.value = true;
    return;
  }
  if (text === "close" || text === "reopen" || text === "remove") {
    confirmLifecycle(text);
  }
}

watch(
  () => [visible.value, props.bookId, props.orderId],
  ([nextVisible]) => {
    if (nextVisible) {
      activeTab.value = "entries";
      entryStatus.value = "ACTIVE";
      loadDetail();
    }
  },
  { immediate: true }
);

defineExpose({
  detail,
  isReadOnly,
  visibleEntryActions,
  primaryEntryAction,
  canArchive,
  canReopen,
  entryFormContext,
  openEntryForm,
  handleEntryAction,
  handleLifecycle,
  loadDetail
});
</script>

<style scoped lang="scss">
.finance-order-drawer {
  max-width: 90vw;

  @media (width <= 768px) {
    width: 100% !important;
    max-width: 100%;
  }
}

.drawer-header {
  min-width: 0;
}

.drawer-title {
  display: flex;
  flex-direction: column;
  min-width: 0;

  > span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 18px;
    font-weight: 600;
    white-space: nowrap;
  }

  .drawer-subtitle {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }
}

.drawer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  .pending-card {
    grid-column: span 2;
    padding: 16px;
    background: var(--el-color-primary-light-9);
    border-radius: 8px;

    span,
    small {
      color: var(--el-text-color-secondary);
    }

    strong {
      display: block;
      margin-top: 4px;
      font-size: 28px;
      color: var(--el-color-primary);
    }
  }

  .amount-item {
    padding: 12px;
    background: var(--el-fill-color-light);
    border-radius: 8px;

    span {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    strong {
      display: block;
      margin-top: 4px;
      text-align: right;
    }
  }
}

.accessory-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  > div {
    padding: 12px;
    background: var(--el-fill-color-light);
    border-radius: 8px;

    span {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    strong {
      display: block;
      margin-top: 4px;
      text-align: right;
    }
  }
}

.detail-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.entry-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

@media (width <= 768px) {
  .amount-grid,
  .accessory-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
