<template>
  <div class="order-bill">
    <el-table
      v-loading="loading"
      :data="rows"
      border
      size="small"
      show-overflow-tooltip
      class="entry-table"
      @row-click="handleRowClick"
    >
      <el-table-column label="标题" prop="title" min-width="140" />
      <el-table-column label="类型" width="110">
        <template #default="{ row }">
          <span :class="directionClass(row)">{{ billTypeLabel(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="组件" width="90">
        <template #default="{ row }">
          {{ componentLabel(row.orderComponent) }}
        </template>
      </el-table-column>
      <el-table-column label="金额" width="130" align="right">
        <template #default="{ row }">
          <span :class="directionClass(row)">
            {{ formatAmount(row.amount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="账户" min-width="120">
        <template #default="{ row }">
          {{ row.accountName || "非现金" }}
        </template>
      </el-table-column>
      <el-table-column label="交易时间" prop="tradeTime" width="170" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.recycleBin ? 'info' : 'success'" size="small">
            {{ row.recycleBin ? "已作废" : row.confirm ? "已确认" : "待确认" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="附件" width="70">
        <template #default="{ row }">
          {{ row.hasFile ? "有" : "-" }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="can(row, 'EDIT')"
            link
            type="primary"
            size="small"
            @click.stop="emit('edit', row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="can(row, 'CONFIRM')"
            link
            type="primary"
            size="small"
            @click.stop="handleAction(row, 'confirm')"
          >
            确认
          </el-button>
          <el-button
            v-if="can(row, 'UNCONFIRM')"
            link
            type="warning"
            size="small"
            @click.stop="handleAction(row, 'unconfirm')"
          >
            取消确认
          </el-button>
          <el-button
            v-if="can(row, 'VOID')"
            link
            type="danger"
            size="small"
            @click.stop="handleAction(row, 'void')"
          >
            作废
          </el-button>
          <el-button
            v-if="can(row, 'RESTORE')"
            link
            type="success"
            size="small"
            @click.stop="handleAction(row, 'restore')"
          >
            恢复
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      class="order-bill-pagination"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      @current-change="loadEntries"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { ElMessageBox } from "element-plus";
import {
  getFinanceOrderEntriesV2,
  orderEntryActionV2,
  type FinanceOrderEntryVo,
  type OrderIdLike
} from "@/api/fortune/finance-order-v2";
import { message } from "@/utils/message";
import {
  BILL_TYPE_LABELS,
  getCashDirection,
  ORDER_COMPONENT
} from "./utils/order-contract";
import { formatOrderAmountText } from "./utils/order-money";

const props = withDefaults(
  defineProps<{
    bookId: OrderIdLike;
    orderId: OrderIdLike;
    expectedVersion?: OrderIdLike;
    entryStatus?: "ACTIVE" | "VOIDED" | "ALL";
  }>(),
  {
    expectedVersion: 0,
    entryStatus: "ACTIVE"
  }
);

const emit = defineEmits<{
  (e: "entry-click", entry: FinanceOrderEntryVo): void;
  (e: "edit", entry: FinanceOrderEntryVo): void;
  (
    e: "mutated",
    payload: { bookId: OrderIdLike; orderId: OrderIdLike; billId?: OrderIdLike }
  ): void;
}>();

const loading = ref(false);
const rows = ref<Array<FinanceOrderEntryVo>>([]);
const requestSeq = ref(0);
const actionLoading = ref<Record<string, boolean>>({});
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

function createRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function billTypeLabel(row: FinanceOrderEntryVo) {
  return BILL_TYPE_LABELS[row.billType] ?? `未知类型(${row.billType})`;
}

function componentLabel(component?: string | null) {
  if (!component) return "-";
  return (
    {
      [ORDER_COMPONENT.PRINCIPAL]: "本金",
      [ORDER_COMPONENT.INTEREST]: "利息",
      [ORDER_COMPONENT.FEE]: "手续费",
      [ORDER_COMPONENT.WRITE_OFF]: "差额"
    }[component] ?? component
  );
}

function directionClass(row: FinanceOrderEntryVo) {
  const direction = getCashDirection(row.billType, row.orderComponent);
  if (direction === 1) return "is-income";
  if (direction === -1) return "is-expense";
  return "is-neutral";
}

function formatAmount(value: string | null | undefined) {
  return formatOrderAmountText(value, { emptyText: "-" });
}

function can(row: FinanceOrderEntryVo, action: string) {
  return (row.allowedActions ?? []).includes(action);
}

async function loadEntries() {
  const seq = ++requestSeq.value;
  loading.value = true;
  try {
    const page = await getFinanceOrderEntriesV2(props.bookId, props.orderId, {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      entryStatus: props.entryStatus
    });
    if (seq !== requestSeq.value) return;
    rows.value = page.rows ?? [];
    pagination.total = page.total ?? 0;
  } catch (e) {
    if (seq === requestSeq.value) {
      message((e as Error)?.message || "流水查询失败", { type: "error" });
    }
  } finally {
    if (seq === requestSeq.value) loading.value = false;
  }
}

function handleSizeChange(size: number) {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadEntries();
}

function handleRowClick(row: FinanceOrderEntryVo) {
  emit("entry-click", row);
}

async function confirmVoid(row: FinanceOrderEntryVo) {
  const nonCash = row.orderComponent === ORDER_COMPONENT.WRITE_OFF;
  const amountText = formatAmount(row.amount);
  const text = nonCash
    ? `确认作废这笔非现金差额流水？金额 ${amountText}，不会改变账户余额。`
    : `确认作废这笔流水？将回滚 ${amountText} ${row.currencyCode ?? ""} 的账户余额。`;
  await ElMessageBox.confirm(text, "作废流水", { type: "warning" });
}

async function handleAction(
  row: FinanceOrderEntryVo,
  action: "confirm" | "unconfirm" | "void" | "restore"
) {
  if (action === "void") {
    try {
      await confirmVoid(row);
    } catch {
      return;
    }
  }
  const key = String(row.billId);
  if (actionLoading.value[key]) return;
  actionLoading.value[key] = true;
  try {
    await orderEntryActionV2(props.bookId, props.orderId, row.billId, action, {
      requestId: createRequestId(),
      expectedVersion: props.expectedVersion
    });
    message("操作成功", { type: "success" });
    emit("mutated", {
      bookId: props.bookId,
      orderId: props.orderId,
      billId: row.billId
    });
    await loadEntries();
  } catch (e) {
    message((e as Error)?.message || "操作失败", { type: "error" });
  } finally {
    actionLoading.value[key] = false;
  }
}

watch(
  () => [props.bookId, props.orderId, props.entryStatus],
  () => {
    pagination.currentPage = 1;
    loadEntries();
  }
);

onMounted(loadEntries);
</script>

<style scoped lang="scss">
.order-bill {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry-table {
  cursor: pointer;
}

.order-bill-pagination {
  justify-content: flex-end;
}

.is-income {
  color: var(--el-color-danger);
}

.is-expense {
  color: var(--el-color-success);
}

.is-neutral {
  color: var(--el-text-color-primary);
}
</style>
