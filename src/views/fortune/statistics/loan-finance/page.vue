<template>
  <div class="statistics-page">
    <el-card class="statistics-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="所属分组">
          <el-select
            v-model="filterForm.groupId"
            class="filter-select"
            filterable
            @change="onGroupChange"
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
            v-model="filterForm.bookId"
            class="filter-select"
            filterable
            @change="loadData"
          >
            <el-option
              v-for="item in bookOptions"
              :key="item.bookId"
              :label="item.bookName"
              :value="item.bookId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="归档时间">
          <el-date-picker
            v-model="financeRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="loadFinanceProfit"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="summary-cards">
      <summary-card
        label="待收回"
        :value="displayAmount(orderSummary?.receivableAmount)"
        :icon="Sell"
        accent="#67c23a"
        plain
      />
      <summary-card
        label="待归还"
        :value="displayAmount(orderSummary?.payableAmount)"
        :icon="ShoppingCart"
        accent="#f56c6c"
        plain
      />
      <summary-card
        label="待报销"
        :value="displayAmount(orderSummary?.reimbursementAmount)"
        :icon="Tickets"
        accent="#409eff"
        plain
      />
      <summary-card
        label="逾期"
        :value="displayAmount(overdueTotal)"
        :icon="Warning"
        accent="#e6a23c"
        plain
      />
    </div>

    <el-alert type="warning" show-icon :closable="false">
      待核对单据
      {{ displayCount(orderSummary?.reviewRequiredCount) }} 张，孤立流水
      {{ displayCount(orderSummary?.orphanLegacyBillCount) }} 笔，待确认流水
      {{ displayCount(orderSummary?.pendingEntryCount) }}
      笔；异常数据未计入上方汇总。
    </el-alert>

    <div class="grid-two">
      <el-card class="statistics-card">
        <template #header>
          <div class="card-header"><span>待收回对象</span></div>
        </template>
        <pure-table
          :data="loanOverview.topReceivables"
          border
          stripe
          :loading="loanLoading"
          align-whole="center"
        >
          <el-table-column label="交易对象" prop="payeeName" />
          <el-table-column label="待收金额">
            <template #default="{ row }">
              {{ formatLegacyCurrency(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column label="最近交易时间" prop="lastTradeTime" />
        </pure-table>
      </el-card>

      <el-card class="statistics-card">
        <template #header>
          <div class="card-header"><span>已归档借款收支</span></div>
        </template>
        <pure-table
          :data="financeProfit"
          border
          stripe
          :loading="financeLoading"
          align-whole="center"
        >
          <el-table-column label="单据" prop="title" show-overflow-tooltip />
          <el-table-column label="本金投入">
            <template #default="{ row }">
              {{ formatLegacyCurrency(row.outAmount) }}
            </template>
          </el-table-column>
          <el-table-column label="本金收回">
            <template #default="{ row }">
              {{ formatLegacyCurrency(row.inAmount) }}
            </template>
          </el-table-column>
          <el-table-column label="净收支">
            <template #default="{ row }">
              <span :class="profitClass(row.profit)">
                {{ formatLegacyCurrency(row.profit) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="净收益率">
            <template #default="{ row }">
              <span :class="profitClass(row.profit)">
                {{ formatRate(row.profitRate) }}
              </span>
            </template>
          </el-table-column>
        </pure-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import SummaryCard from "../base/summaryCard.vue";
import {
  getDefaultGroupId,
  getEnableGroupList,
  type GroupVo
} from "@/api/fortune/group";
import { type BookVo, getEnableBookList } from "@/api/fortune/book";
import {
  type LoanOverviewVo,
  type FinanceProfitVo,
  getLoanOverview,
  getFinanceProfit
} from "@/api/fortune/include";
import {
  getFinanceOrderSummaryV2,
  type FinanceOrderSummaryVo
} from "@/api/fortune/finance-order-v2";
import { Sell, ShoppingCart, Tickets, Warning } from "@element-plus/icons-vue";
import {
  formatOrderAmountText,
  sumMoneyList
} from "@/views/fortune/finance-order/utils/order-money";
import { useFinanceOrderMutationEvents } from "@/views/fortune/finance-order/utils/use-finance-order-refresh";

const filterForm = reactive<{ groupId?: number; bookId?: number }>({});
const groupOptions = ref<Array<GroupVo>>([]);
const bookOptions = ref<Array<BookVo>>([]);
const financeRange = ref<[string, string] | null>(null);

const orderSummary = ref<FinanceOrderSummaryVo | null>(null);
const loanOverview = ref<LoanOverviewVo>({
  totalReceivable: 0,
  totalPayable: 0,
  receivableCount: 0,
  payableCount: 0,
  topReceivables: []
});
const financeProfit = ref<Array<FinanceProfitVo>>([]);
const loanLoading = ref(false);
const financeLoading = ref(false);
const summaryLoading = ref(false);
const requestSeq = ref(0);

const currentCurrency = computed(
  () =>
    orderSummary.value?.currencyCode ??
    groupOptions.value.find(item => item.groupId === filterForm.groupId)
      ?.defaultCurrency ??
    "CNY"
);

const overdueTotal = computed(() => {
  if (!orderSummary.value) return null;
  return sumMoneyList([
    orderSummary.value.overdueReceivableAmount,
    orderSummary.value.overduePayableAmount,
    orderSummary.value.overdueReimbursementAmount
  ]);
});

function displayAmount(value: string | number | null | undefined) {
  return `${currentCurrency.value} ${formatOrderAmountText(value, {
    emptyText: "待核对"
  })}`;
}

function displayCount(value: number | null | undefined) {
  return value == null ? "待核对" : String(value);
}

function formatLegacyCurrency(value: number | null | undefined) {
  if (value == null) return "待核对";
  return `${currentCurrency.value} ${formatOrderAmountText(value)}`;
}

function formatRate(value: number | null | undefined) {
  if (value == null) return "待核对";
  return `${formatOrderAmountText(value)}%`;
}

function profitClass(profit: number | null | undefined) {
  if (profit == null) return "profit-unknown";
  return profit >= 0 ? "profit-up" : "profit-down";
}

async function loadSummary() {
  if (filterForm.bookId == null) return;
  const seq = ++requestSeq.value;
  summaryLoading.value = true;
  try {
    const result = await getFinanceOrderSummaryV2(filterForm.bookId);
    if (seq !== requestSeq.value) return;
    orderSummary.value = result;
  } catch (e) {
    if (seq === requestSeq.value) {
      message((e as Error)?.message || "单据汇总查询失败", { type: "error" });
    }
  } finally {
    if (seq === requestSeq.value) summaryLoading.value = false;
  }
}

async function loadLoanOverview() {
  if (filterForm.bookId == null) return;
  loanLoading.value = true;
  try {
    const res = await getLoanOverview(filterForm.bookId);
    loanOverview.value = res.data;
  } catch (e) {
    message((e as Error)?.message || "借贷对象查询失败", { type: "error" });
  } finally {
    loanLoading.value = false;
  }
}

async function loadFinanceProfit() {
  if (filterForm.bookId == null) return;
  financeLoading.value = true;
  try {
    const res = await getFinanceProfit(filterForm.bookId, {
      startDate: financeRange.value?.[0] as unknown as Date,
      endDate: financeRange.value?.[1] as unknown as Date
    });
    financeProfit.value = res.data || [];
  } catch (e) {
    message((e as Error)?.message || "已归档借款收支查询失败", {
      type: "error"
    });
  } finally {
    financeLoading.value = false;
  }
}

async function loadData() {
  await Promise.all([loadSummary(), loadLoanOverview(), loadFinanceProfit()]);
}

async function onGroupChange() {
  if (filterForm.groupId == null) return;
  try {
    const bookRes = await getEnableBookList(filterForm.groupId);
    bookOptions.value = bookRes.data || [];
    if (bookOptions.value.length === 0) {
      message("请先启用或创建账本", { type: "warning" });
      return;
    }
    const currentGroup = groupOptions.value.find(
      item => item.groupId === filterForm.groupId
    );
    filterForm.bookId =
      currentGroup?.defaultBookId || bookOptions.value[0].bookId;
    await loadData();
  } catch (e) {
    message((e as Error)?.message || "账本查询失败", { type: "error" });
  }
}

onMounted(async () => {
  try {
    const [groupRes, defaultGroupId] = await Promise.all([
      getEnableGroupList(),
      getDefaultGroupId()
    ]);
    groupOptions.value = groupRes.data || [];
    if (groupOptions.value.length === 0) {
      message("请先启用或创建分组", { type: "warning" });
      return;
    }
    filterForm.groupId = defaultGroupId.data || groupOptions.value[0].groupId;
    await onGroupChange();
  } catch (e) {
    message((e as Error)?.message || "统计数据初始化失败", { type: "error" });
  }
});

useFinanceOrderMutationEvents(payload => {
  if (payload.bookId == filterForm.bookId) {
    loadData();
  }
});
</script>

<style scoped lang="scss">
@media (width <= 992px) {
  .grid-two {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}

.statistics-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.statistics-card {
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);

  .card-header {
    font-weight: 600;
  }
}

.filter-form {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-select {
  width: 200px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.grid-two {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.profit-up {
  font-weight: 600;
  color: var(--el-color-success);
}

.profit-down {
  font-weight: 600;
  color: var(--el-color-danger);
}

.profit-unknown {
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
</style>
