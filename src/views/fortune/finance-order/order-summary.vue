<template>
  <div class="order-summary-grid">
    <el-card
      v-for="card in cards"
      :key="card.label"
      class="order-summary-card"
      :style="{ '--order-summary-accent': card.accent }"
      shadow="never"
    >
      <div class="summary-header">
        <span>{{ card.label }}</span>
        <span class="summary-count">{{ card.countText }}</span>
      </div>
      <div class="summary-amount">{{ card.amount }}</div>
      <div class="summary-sub">逾期 {{ card.overdueAmount }}</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { FinanceOrderSummaryVo } from "@/api/fortune/finance-order-v2";
import { formatOrderAmountText } from "./utils/order-money";

const props = defineProps<{
  summary?: FinanceOrderSummaryVo | null;
}>();

const cards = computed(() => [
  {
    label: "待收回",
    amount: formatOrderAmountText(props.summary?.receivableAmount),
    countText: `${props.summary?.receivableCount ?? 0} 单`,
    overdueAmount: formatOrderAmountText(
      props.summary?.overdueReceivableAmount,
      { emptyText: "待核对" }
    ),
    accent: "#409eff"
  },
  {
    label: "待归还",
    amount: formatOrderAmountText(props.summary?.payableAmount),
    countText: `${props.summary?.payableCount ?? 0} 单`,
    overdueAmount: formatOrderAmountText(props.summary?.overduePayableAmount, {
      emptyText: "待核对"
    }),
    accent: "#e6a23c"
  },
  {
    label: "待报销",
    amount: formatOrderAmountText(props.summary?.reimbursementAmount),
    countText: `${props.summary?.reimbursementCount ?? 0} 单`,
    overdueAmount: formatOrderAmountText(
      props.summary?.overdueReimbursementAmount,
      { emptyText: "待核对" }
    ),
    accent: "#67c23a"
  }
]);
</script>

<style scoped lang="scss">
.order-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.order-summary-card {
  --order-summary-accent: #409eff;

  :deep(.el-card__body) {
    padding: 16px;
  }

  .summary-header {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .summary-count {
    flex-shrink: 0;
  }

  .summary-amount {
    margin-top: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 28px;
    font-weight: 600;
    color: var(--order-summary-accent);
    white-space: nowrap;
  }

  .summary-sub {
    margin-top: 4px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

@media (width <= 768px) {
  .order-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
