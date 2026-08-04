<template>
  <div class="statistics-page">
    <!-- 顶部筛选 -->
    <el-card class="statistics-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="所属分组">
          <el-select
            v-model="filterForm.groupId"
            placeholder="请选择分组"
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
            placeholder="请选择账本"
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
        <el-form-item label="理财时间">
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

    <!-- 借贷总览 -->
    <div class="summary-cards">
      <summary-card
        label="待收回"
        :value="loanOverview.totalReceivable"
        :icon="Sell"
        accent="#67c23a"
        :currency="currentCurrency"
      />
      <summary-card
        label="待归还"
        :value="loanOverview.totalPayable"
        :icon="ShoppingCart"
        accent="#f56c6c"
        :currency="currentCurrency"
      />
      <summary-card
        label="待收笔数"
        :value="`${loanOverview.receivableCount} 笔`"
        :icon="Tickets"
        accent="#409eff"
        plain
      />
      <summary-card
        label="待还笔数"
        :value="`${loanOverview.payableCount} 笔`"
        :icon="Tickets"
        accent="#e6a23c"
        plain
      />
    </div>

    <div class="grid-two">
      <!-- 待收回明细 -->
      <el-card class="statistics-card">
        <template #header>
          <div class="card-header"><span>待收回明细</span></div>
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
              {{ formatCurrency(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column label="最近交易时间" prop="lastTradeTime" />
        </pure-table>
      </el-card>

      <!-- 理财收益 -->
      <el-card class="statistics-card">
        <template #header>
          <div class="card-header"><span>理财收益</span></div>
        </template>
        <pure-table
          :data="financeProfit"
          border
          stripe
          :loading="financeLoading"
          align-whole="center"
        >
          <el-table-column label="单据" prop="title" show-overflow-tooltip />
          <el-table-column label="投入">
            <template #default="{ row }">
              {{ formatCurrency(row.outAmount) }}
            </template>
          </el-table-column>
          <el-table-column label="收回">
            <template #default="{ row }">
              {{ formatCurrency(row.inAmount) }}
            </template>
          </el-table-column>
          <el-table-column label="收益">
            <template #default="{ row }">
              <span :class="profitClass(row.profit)">
                {{ formatCurrency(row.profit) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="收益率">
            <template #default="{ row }">
              <span :class="profitClass(row.profit)"
                >{{ row.profitRate }}%</span
              >
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
import { Sell, ShoppingCart, Tickets } from "@element-plus/icons-vue";

const filterForm = reactive<{ groupId?: number; bookId?: number }>({});
const groupOptions = ref<Array<GroupVo>>([]);
const bookOptions = ref<Array<BookVo>>([]);
const financeRange = ref<[string, string]>(null);

const loanOverview = ref<LoanOverviewVo>({
  totalReceivable: 0,
  totalPayable: 0,
  receivableCount: 0,
  payableCount: 0,
  topReceivables: []
});
const loanLoading = ref<boolean>(false);
const financeProfit = ref<Array<FinanceProfitVo>>([]);
const financeLoading = ref<boolean>(false);

const currentCurrency = computed(() => {
  const currentGroup = groupOptions.value.find(
    group => group.groupId === filterForm.groupId
  );
  return currentGroup?.defaultCurrency || "CNY";
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currentCurrency.value,
    minimumFractionDigits: 2
  }).format(value);

function profitClass(profit: number) {
  return profit >= 0 ? "profit-up" : "profit-down";
}

async function loadLoanOverview() {
  if (!filterForm.bookId) return;
  loanLoading.value = true;
  try {
    const res = await getLoanOverview(filterForm.bookId);
    loanOverview.value = res.data;
  } finally {
    loanLoading.value = false;
  }
}

async function loadFinanceProfit() {
  if (!filterForm.bookId) return;
  financeLoading.value = true;
  try {
    const res = await getFinanceProfit(filterForm.bookId, {
      startDate: financeRange.value?.[0] as unknown as Date,
      endDate: financeRange.value?.[1] as unknown as Date
    });
    financeProfit.value = res.data || [];
  } finally {
    financeLoading.value = false;
  }
}

async function loadData() {
  await Promise.all([loadLoanOverview(), loadFinanceProfit()]);
}

async function onGroupChange() {
  if (!filterForm.groupId) return;
  const bookRes = await getEnableBookList(filterForm.groupId);
  bookOptions.value = bookRes.data || [];
  if (bookOptions.value.length === 0) {
    message("请先启用或创建账本", { type: "warning" });
    return;
  }
  const currentGroup = groupOptions.value.find(
    group => group.groupId === filterForm.groupId
  );
  filterForm.bookId =
    currentGroup?.defaultBookId || bookOptions.value[0].bookId;
  await loadData();
}

onMounted(async () => {
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
  color: #67c23a;
}

.profit-down {
  font-weight: 600;
  color: #f56c6c;
}
</style>
