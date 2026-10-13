<template>
  <div class="finance-order-page">
    <order-summary :summary="summary" />

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="searchForm" class="filter-form">
        <el-form-item label="所属分组">
          <el-select
            v-model="searchForm.groupId"
            filterable
            class="filter-select"
            @change="handleGroupChange"
          >
            <el-option
              v-for="item in groupOptions"
              :key="item.groupId"
              :label="item.groupName"
              :value="item.groupId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属账本">
          <el-select
            v-model="searchForm.bookId"
            filterable
            class="filter-select"
          >
            <el-option
              v-for="item in bookOptions"
              :key="item.bookId"
              :label="item.bookName"
              :value="item.bookId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            clearable
            class="keyword-input"
            placeholder="搜索标题或对象"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="仅逾期">
          <el-switch v-model="searchForm.overdueOnly" @change="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="type-status-row">
        <el-radio-group
          v-model="searchForm.type"
          size="large"
          @change="handleTypeChange"
        >
          <el-radio-button
            v-for="item in ORDER_TYPE_TABS"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
        <el-radio-group
          v-model="searchForm.status"
          size="large"
          @change="handleStatusChange"
        >
          <el-radio-button
            v-for="item in ORDER_STATUS_OPTIONS"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <PureTableBar :columns="columns" @refresh="handleSearch">
        <template #buttons>
          <el-button type="primary" @click="openCreateForm">
            新建单据
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            border
            align-whole="center"
            show-overflow-tooltip
            table-layout="auto"
            :loading="loading"
            :size="size"
            adaptive
            :data="dataList"
            :columns="dynamicColumns"
            :pagination="pagination"
            :pagination-small="size === 'small'"
            :header-cell-style="{
              background: 'var(--el-table-row-hover-bg-color)',
              color: 'var(--el-text-color-primary)'
            }"
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
          >
            <template #operation="{ row }">
              <el-button
                v-if="hasMoreRowActions(row)"
                link
                type="primary"
                :size="size"
                @click="openDetail(row)"
              >
                查看
              </el-button>
              <el-button
                v-if="primaryRowAction(row)"
                link
                type="primary"
                :size="size"
                @click="openEntryFromRow(primaryRowAction(row)!, row)"
              >
                {{ entryActionLabel(primaryRowAction(row)!) }}
              </el-button>
              <el-button
                link
                type="primary"
                :size="size"
                @click="openDetail(row)"
              >
                更多
              </el-button>
            </template>
          </pure-table>
        </template>
      </PureTableBar>

      <div class="mobile-order-list">
        <el-empty v-if="dataList.length === 0" description="暂无单据" />
        <div
          v-for="row in dataList"
          :key="row.orderId"
          class="mobile-order-card"
          @click="openDetail(row)"
        >
          <div class="mobile-title">
            {{ row.counterpartyName }} · {{ row.title }}
          </div>
          <div class="mobile-amount">
            {{ typeMeta(row).pendingLabel }}：{{
              formatAmount(row.pendingAmount)
            }}
          </div>
          <div class="mobile-sub">
            {{ typeMeta(row).issuedLabel }}
            {{ formatAmount(row.issuedAmount) }} /
            {{ typeMeta(row).settledLabel }}
            {{ formatAmount(row.settledAmount) }}
          </div>
          <div class="mobile-tags">
            <el-tag size="small">{{ row.statusDesc }}</el-tag>
            <el-tag v-if="row.overdue" size="small" type="danger">逾期</el-tag>
            <el-tag
              v-if="row.pendingEntryCount > 0"
              size="small"
              type="warning"
            >
              待确认 {{ row.pendingEntryCount }}
            </el-tag>
          </div>
        </div>
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          layout="prev, pager, next"
          :total="pagination.total"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <order-detail-drawer
      ref="detailDrawerRef"
      v-model="detailVisible"
      :book-id="selectedOrder?.bookId ?? searchForm.bookId"
      :order-id="selectedOrder?.orderId"
      :group-id="searchForm.groupId ?? 0"
      @mutated="handleMutated"
      @open-bill="openBillFormForEntry"
      @edit-entry="openBillFormForEntry"
    />

    <order-form
      v-if="createFormVisible"
      v-model="createFormVisible"
      mode="add"
      :group-id="searchForm.groupId ?? 0"
      :book-id="searchForm.bookId ?? 0"
      @success="handleOrderFormSuccess"
      @continue="handleDraftContinue"
    />

    <bill-form
      v-if="entryFormVisible"
      v-model="entryFormVisible"
      :type="billFormMode"
      :row="billFormRow"
      :group-id="searchForm.groupId ?? 0"
      :book-id="Number(entryContext.contextBookId ?? searchForm.bookId)"
      v-bind="entryContext"
      @success="handleBillFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from "vue";
import { ElButton, ElTag } from "element-plus";
import PureTable from "@pureadmin/table";
import { PureTableBar } from "@/components/RePureTableBar";
import BillForm from "@/views/fortune/bill/bill-form.vue";
import type {
  FinanceOrderDetailVo,
  FinanceOrderEntryVo,
  FinanceOrderMutationVo,
  OrderIdLike
} from "@/api/fortune/finance-order-v2";
import OrderDetailDrawer from "./order-detail-drawer.vue";
import OrderForm from "./order-form.vue";
import OrderSummary from "./order-summary.vue";
import {
  ENTRY_ACTION_META,
  ORDER_STATUS_OPTIONS,
  ORDER_TYPE,
  ORDER_TYPE_META,
  ORDER_TYPE_TABS,
  type EntryAction,
  type OrderComponent,
  type OrderType
} from "./utils/order-contract";
import { formatOrderAmountText } from "./utils/order-money";
import {
  emitFinanceOrderMutated,
  useFinanceOrderMutationEvents
} from "./utils/use-finance-order-refresh";
import { entryActionLabel, useFinanceOrderList } from "./utils/hook";

defineOptions({
  name: "FortuneFinanceOrder"
});

const detailVisible = ref(false);
const createFormVisible = ref(false);
const entryFormVisible = ref(false);
const selectedOrder = ref<FinanceOrderDetailVo | null>(null);
const detailDrawerRef = ref();
const billFormMode = ref<"add" | "edit">("add");
const billFormRow = ref<any>(null);

const entryContext = ref<{
  contextBookId: OrderIdLike;
  contextOrderId: OrderIdLike;
  contextBillType: number;
  contextComponent: OrderComponent;
  contextTitle: string;
  contextAmount: string | null;
  expectedVersion: OrderIdLike;
  lockOrderContext: boolean;
} | null>(null);

const {
  loading,
  dataList,
  summary,
  groupOptions,
  bookOptions,
  searchForm,
  pagination,
  loadPage,
  loadSummary,
  refreshData,
  handleGroupChange,
  handleTypeChange,
  handleStatusChange,
  handleSearch,
  resetFilters,
  handleSizeChange,
  handleCurrentChange,
  primaryRowAction,
  hasMoreRowActions,
  visibleRowActions
} = useFinanceOrderList();

const columns: TableColumnList = [
  {
    label: "对象 / 标题",
    minWidth: 220,
    align: "left",
    cellRenderer: ({ row }) =>
      h("div", { class: "order-title-cell" }, [
        h("div", { class: "order-counterparty" }, row.counterpartyName || "-"),
        h("div", { class: "order-title" }, row.title)
      ])
  },
  {
    label: "待结清",
    prop: "pendingAmount",
    minWidth: 130,
    align: "right",
    cellRenderer: ({ row }) =>
      h("strong", { class: "pending-amount" }, formatAmount(row.pendingAmount))
  },
  {
    label: "累计发生",
    prop: "issuedAmount",
    minWidth: 120,
    align: "right",
    cellRenderer: ({ row }) => formatAmount(row.issuedAmount)
  },
  {
    label: "已结算",
    prop: "settledAmount",
    minWidth: 120,
    align: "right",
    cellRenderer: ({ row }) => formatAmount(row.settledAmount)
  },
  {
    label: "差额结清",
    prop: "adjustedAmount",
    minWidth: 110,
    align: "right",
    cellRenderer: ({ row }) => formatAmount(row.adjustedAmount)
  },
  {
    label: "到期日",
    prop: "dueDate",
    minWidth: 110,
    cellRenderer: ({ row }) => row.dueDate || "-"
  },
  {
    label: "状态",
    prop: "statusDesc",
    minWidth: 150,
    cellRenderer: ({ row }) =>
      h("div", { class: "status-cell" }, [
        h(ElTag, { size: "small" }, () => row.statusDesc),
        row.overdue
          ? h(ElTag, { size: "small", type: "danger" }, () => "逾期")
          : null,
        row.pendingEntryCount > 0
          ? h(
              ElTag,
              { size: "small", type: "warning" },
              () => `待确认${row.pendingEntryCount}`
            )
          : null
      ])
  },
  {
    label: "操作",
    fixed: "right",
    width: 190,
    slot: "operation"
  }
];

function typeMeta(row: FinanceOrderDetailVo) {
  return ORDER_TYPE_META[row.type];
}

function formatAmount(value: string | null | undefined) {
  return formatOrderAmountText(value, { emptyText: "待核对" });
}

function openDetail(row: FinanceOrderDetailVo) {
  selectedOrder.value = row;
  detailVisible.value = true;
}

function openCreateForm() {
  createFormVisible.value = true;
}

function buildEntryContext(params: {
  order: Pick<
    FinanceOrderDetailVo,
    "bookId" | "orderId" | "version" | "pendingAmount"
  >;
  action: EntryAction;
  amount?: string | null;
}) {
  const meta = ENTRY_ACTION_META[params.action];
  const isSettlement =
    params.action ===
      ORDER_TYPE_META[(params.order as FinanceOrderDetailVo).type]
        ?.settleAction || params.action === "WRITE_OFF";
  return {
    contextBookId: params.order.bookId,
    contextOrderId: params.order.orderId,
    contextBillType: meta.billType,
    contextComponent: meta.component,
    contextTitle: meta.label,
    contextAmount: isSettlement
      ? (params.amount ?? params.order.pendingAmount ?? null)
      : null,
    expectedVersion: params.order.version,
    lockOrderContext: true
  };
}

function openEntryFromRow(action: EntryAction, row: FinanceOrderDetailVo) {
  billFormMode.value = "add";
  billFormRow.value = null;
  entryContext.value = buildEntryContext({
    order: row,
    action,
    amount: row.pendingAmount
  });
  entryFormVisible.value = true;
}

function openBillFormForEntry(entry: FinanceOrderEntryVo) {
  if (!selectedOrder.value) return;
  billFormMode.value = "edit";
  billFormRow.value = entry;
  entryContext.value = {
    contextBookId: selectedOrder.value.bookId,
    contextOrderId: selectedOrder.value.orderId,
    contextBillType: entry.billType,
    contextComponent: entry.orderComponent ?? "PRINCIPAL",
    contextTitle: entry.title ?? entryActionLabel("LOAN_OUT"),
    contextAmount: null,
    expectedVersion: selectedOrder.value.version,
    lockOrderContext: true
  };
  entryFormVisible.value = true;
}

function handleDraftContinue(
  result: FinanceOrderMutationVo,
  orderType: OrderType
) {
  const action = ORDER_TYPE_META[orderType].issueAction;
  const meta = ENTRY_ACTION_META[action];
  billFormMode.value = "add";
  billFormRow.value = null;
  entryContext.value = {
    contextBookId: searchForm.bookId ?? 0,
    contextOrderId: result.orderId,
    contextBillType: meta.billType,
    contextComponent: meta.component,
    contextTitle: meta.label,
    contextAmount: null,
    expectedVersion: result.version,
    lockOrderContext: true
  };
  entryFormVisible.value = true;
}

function handleMutated(payload?: {
  bookId: OrderIdLike;
  orderId?: OrderIdLike | null;
  billId?: OrderIdLike | null;
}) {
  emitFinanceOrderMutated({
    bookId: payload?.bookId ?? searchForm.bookId ?? 0,
    orderId: payload?.orderId ?? null,
    billId: payload?.billId ?? null
  });
}

function handleOrderFormSuccess(result: FinanceOrderMutationVo) {
  handleMutated({
    bookId: searchForm.bookId ?? 0,
    orderId: result.orderId,
    billId: result.billId ?? null
  });
}

function handleBillFormSuccess(result?: FinanceOrderMutationVo) {
  handleMutated({
    bookId: result?.orderId ? entryContext.value?.contextBookId : undefined,
    orderId: result?.orderId,
    billId: result?.billId ?? null
  });
}

useFinanceOrderMutationEvents(payload => {
  if (payload.bookId == searchForm.bookId) {
    refreshData();
  }
});

defineExpose({
  loading,
  summary,
  searchForm,
  pagination,
  dataList,
  loadPage,
  loadSummary,
  detailVisible,
  selectedOrder,
  handleTypeChange,
  handleStatusChange,
  openDetail,
  visibleRowActions,
  handleMutated
});
</script>

<style scoped lang="scss">
.finance-order-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-card,
.table-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-select {
  width: 180px;
}

.keyword-input {
  width: 220px;
}

.type-status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.order-title-cell {
  min-width: 0;
  text-align: left;

  .order-counterparty {
    font-weight: 600;
  }

  .order-title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }
}

.pending-amount {
  color: var(--el-color-primary);
}

.status-cell {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.mobile-order-list {
  display: none;
}

@media (width <= 768px) {
  .type-status-row {
    flex-direction: column;
    align-items: flex-start;
  }

  :deep(.el-table) {
    display: none;
  }

  .mobile-order-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .el-pagination {
      justify-content: center;
    }
  }

  .mobile-order-card {
    padding: 16px;
    cursor: pointer;
    background: var(--el-fill-color-light);
    border-radius: 8px;
  }

  .mobile-title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
    white-space: nowrap;
  }

  .mobile-amount {
    margin-top: 8px;
    font-size: 22px;
    font-weight: 600;
    color: var(--el-color-primary);
  }

  .mobile-sub {
    margin-top: 4px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .mobile-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
  }
}
</style>
