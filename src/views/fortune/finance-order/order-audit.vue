<template>
  <div class="order-audit">
    <el-table
      v-loading="loading"
      :data="rows"
      border
      size="small"
      show-overflow-tooltip
    >
      <el-table-column label="操作" prop="action" width="120" />
      <el-table-column label="流水ID" prop="billId" width="120">
        <template #default="{ row }">{{ row.billId ?? "-" }}</template>
      </el-table-column>
      <el-table-column label="操作者" prop="creatorId" width="100">
        <template #default="{ row }">{{ row.creatorId ?? "-" }}</template>
      </el-table-column>
      <el-table-column label="时间" prop="createTime" width="170" />
      <el-table-column label="变更前" min-width="180">
        <template #default="{ row }">
          <span class="audit-json">{{ row.beforeJson || "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="变更后" min-width="180">
        <template #default="{ row }">
          <span class="audit-json">{{ row.afterJson || "-" }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      class="order-audit-pagination"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      @current-change="loadAudit"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import {
  getFinanceOrderAuditV2,
  type FinanceOrderAuditVo,
  type OrderIdLike
} from "@/api/fortune/finance-order-v2";
import { message } from "@/utils/message";

const props = defineProps<{
  bookId: OrderIdLike;
  orderId: OrderIdLike;
}>();

const loading = ref(false);
const rows = ref<Array<FinanceOrderAuditVo>>([]);
const requestSeq = ref(0);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

async function loadAudit() {
  const seq = ++requestSeq.value;
  loading.value = true;
  try {
    const page = await getFinanceOrderAuditV2(props.bookId, props.orderId, {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    });
    if (seq !== requestSeq.value) return;
    rows.value = page.rows ?? [];
    pagination.total = page.total ?? 0;
  } catch (e) {
    if (seq === requestSeq.value) {
      message((e as Error)?.message || "审计记录查询失败", { type: "error" });
    }
  } finally {
    if (seq === requestSeq.value) loading.value = false;
  }
}

function handleSizeChange(size: number) {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadAudit();
}

watch(
  () => [props.bookId, props.orderId],
  () => {
    pagination.currentPage = 1;
    loadAudit();
  }
);

onMounted(loadAudit);
</script>

<style scoped lang="scss">
.order-audit {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audit-json {
  display: block;
  max-height: 72px;
  overflow: hidden;
  font-family: monospace;
  font-size: 12px;
}

.order-audit-pagination {
  justify-content: flex-end;
}
</style>
