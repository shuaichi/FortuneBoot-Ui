<template>
  <div class="order-reconciliation">
    <div class="reconciliation-toolbar">
      <el-alert
        title="异常单据与孤立流水只读，未计入上方已核对汇总"
        type="warning"
        :closable="false"
        show-icon
      />
      <el-button size="small" @click="exportReport">导出核对报告</el-button>
    </div>
    <el-table
      v-loading="loading"
      :data="rows"
      border
      size="small"
      show-overflow-tooltip
    >
      <el-table-column label="单据ID" prop="orderId" width="100">
        <template #default="{ row }">{{ row.orderId ?? "-" }}</template>
      </el-table-column>
      <el-table-column label="流水ID" prop="billId" width="100">
        <template #default="{ row }">{{ row.billId ?? "-" }}</template>
      </el-table-column>
      <el-table-column label="异常代码" min-width="160">
        <template #default="{ row }">
          {{ (row.issueCodes || []).join(", ") || "-" }}
        </template>
      </el-table-column>
      <el-table-column label="原状态" prop="originalStatus" width="90" />
      <el-table-column label="原支出" width="110">
        <template #default="{ row }">
          {{ formatAmount(row.originalOutAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="原收入" width="110">
        <template #default="{ row }">
          {{ formatAmount(row.originalInAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="候选待结清" width="110">
        <template #default="{ row }">
          {{ formatAmount(row.candidatePendingAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="说明" prop="note" min-width="220" />
    </el-table>
    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      class="reconciliation-pagination"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      @current-change="loadReconciliation"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import {
  getFinanceOrderReconciliationV2,
  type FinanceOrderReconciliationVo,
  type OrderIdLike
} from "@/api/fortune/finance-order-v2";
import { message } from "@/utils/message";
import { formatOrderAmountText } from "./utils/order-money";

const props = defineProps<{
  bookId: OrderIdLike;
}>();

const loading = ref(false);
const rows = ref<Array<FinanceOrderReconciliationVo>>([]);
const requestSeq = ref(0);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

function formatAmount(value: string | null | undefined) {
  return formatOrderAmountText(value, { emptyText: "-" });
}

async function loadReconciliation() {
  const seq = ++requestSeq.value;
  loading.value = true;
  try {
    const page = await getFinanceOrderReconciliationV2(props.bookId, {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    });
    if (seq !== requestSeq.value) return;
    rows.value = page.rows ?? [];
    pagination.total = page.total ?? 0;
  } catch (e) {
    if (seq === requestSeq.value) {
      message((e as Error)?.message || "核对报告查询失败", { type: "error" });
    }
  } finally {
    if (seq === requestSeq.value) loading.value = false;
  }
}

function handleSizeChange(size: number) {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadReconciliation();
}

function exportReport() {
  const headers = [
    "生成时间",
    "bookId",
    "orderId",
    "billId",
    "issueCodes",
    "originalStatus",
    "originalOutAmount",
    "originalInAmount",
    "candidatePendingAmount",
    "note"
  ];
  const csvRows = rows.value.map(row => [
    new Date().toISOString(),
    props.bookId,
    row.orderId ?? "",
    row.billId ?? "",
    (row.issueCodes ?? []).join("|"),
    row.originalStatus ?? "",
    row.originalOutAmount ?? "",
    row.originalInAmount ?? "",
    row.candidatePendingAmount ?? "",
    row.note ?? ""
  ]);
  const csv = [headers, ...csvRows]
    .map(cols =>
      cols.map(col => `"${String(col).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `finance-order-reconciliation-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

watch(
  () => props.bookId,
  () => {
    pagination.currentPage = 1;
    loadReconciliation();
  }
);

onMounted(loadReconciliation);
</script>

<style scoped lang="scss">
.order-reconciliation {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reconciliation-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;

  .el-alert {
    flex: 1;
  }
}

.reconciliation-pagination {
  justify-content: flex-end;
}
</style>
