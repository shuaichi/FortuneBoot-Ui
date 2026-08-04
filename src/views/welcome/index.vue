<template>
  <div class="dashboard-container">
    <!-- 顶部过滤器 -->
    <div class="filter-container">
      <div class="filter-title">
        <el-icon>
          <DataAnalysis />
        </el-icon>
        <span>数据概览</span>
      </div>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="所属分组">
          <el-select
            v-model="searchForm.groupId"
            placeholder="请选择分组"
            class="filter-select"
            filterable
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
            placeholder="请选择账本"
            class="filter-select"
            filterable
          >
            <el-option
              v-for="item in bookOptions"
              :key="item.bookId"
              :label="item.bookName"
              :value="item.bookId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="统计周期">
          <el-radio-group
            v-model="searchForm.periodType"
            @change="loadDashboard"
          >
            <el-radio-button
              v-for="item in periodTypeOptions.filter(o => o.value !== 3)"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>

    <!-- KPI 卡片 -->
    <div class="summary-cards">
      <summary-card
        label="本期结余"
        :value="dashboard.period.surplus"
        :icon="Wallet"
        accent="#409eff"
        :currency="currentCurrency"
      />
      <summary-card
        label="本期收入"
        :value="dashboard.period.income"
        :icon="TrendCharts"
        accent="#67c23a"
        :currency="currentCurrency"
        :ring-rate="dashboard.ringIncomeRate"
      />
      <summary-card
        label="本期支出"
        :value="dashboard.period.expense"
        :icon="Money"
        accent="#f56c6c"
        :currency="currentCurrency"
        :ring-rate="dashboard.ringExpenseRate"
      />
      <summary-card
        label="净资产"
        :value="dashboard.netAssets"
        :icon="Coin"
        accent="#e6a23c"
        :currency="currentCurrency"
      />
    </div>

    <!-- 辅助指标 -->
    <div class="metric-cards">
      <summary-card
        label="日均支出"
        :value="dashboard.avgDailyExpense"
        :icon="Histogram"
        accent="#909399"
        :currency="currentCurrency"
      />
      <summary-card
        label="最大单笔支出"
        :value="dashboard.maxSingleExpense"
        :icon="TopRight"
        accent="#909399"
        :currency="currentCurrency"
      />
      <summary-card
        label="待确认账单"
        :value="`${dashboard.unconfirmedCount} 笔`"
        :icon="Warning"
        accent="#909399"
        plain
      />
      <summary-card
        label="待收回笔数"
        :value="`${dashboard.pendingReceivable} 笔`"
        :icon="Sell"
        accent="#909399"
        plain
      />
    </div>

    <!-- 图表区 -->
    <div class="charts-container">
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <div class="chart-title">
              <el-icon><TrendCharts /></el-icon>
              <span>近7天支出趋势</span>
            </div>
          </div>
        </template>
        <div class="chart-content">
          <trend-chart
            :data="dashboard.recentTrend"
            :loading="loading"
            :currency="currentCurrency"
            color="#F56C6C"
          />
        </div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <div class="chart-title">
              <el-icon><PieChart /></el-icon>
              <span>资产账户</span>
            </div>
          </div>
        </template>
        <div class="chart-content">
          <TotalAssetsPie
            v-if="searchForm.groupId"
            :group-id="searchForm.groupId"
          />
        </div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <div class="chart-title">
              <el-icon><Histogram /></el-icon>
              <span>收支对比</span>
            </div>
          </div>
        </template>
        <div class="chart-content">
          <compare-chart
            :data="compareData"
            :loading="loading"
            :currency="currentCurrency"
          />
        </div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <div class="chart-title">
              <el-icon><Sell /></el-icon>
              <span>支出排行 TopN</span>
            </div>
          </div>
        </template>
        <div class="chart-content rank-content">
          <div v-if="loading" class="rank-state">
            <el-skeleton :rows="5" animated />
          </div>
          <el-empty v-else-if="rankData.length === 0" description="暂无数据" />
          <ul v-else class="rank-list">
            <li
              v-for="(item, index) in rankData"
              :key="item.name"
              class="rank-item"
            >
              <span class="rank-index" :class="{ 'is-top': index < 3 }">
                {{ index + 1 }}
              </span>
              <span class="rank-name">{{ item.name }}</span>
              <span class="rank-value">{{ formatCurrency(item.value) }}</span>
            </li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch, computed } from "vue";
import TotalAssetsPie from "./chart/TotalAssetsPie.vue";
import SummaryCard from "@/views/fortune/statistics/base/summaryCard.vue";
import TrendChart from "@/views/fortune/statistics/base/trendChart.vue";
import CompareChart from "@/views/fortune/statistics/base/compareChart.vue";
import { periodTypeOptions } from "@/views/fortune/statistics/base/constants";
import {
  type DashboardQuery,
  type DashboardVo,
  type BillCompareVo,
  type BarVo,
  getDashboard,
  getBillCompare,
  getBillRank
} from "@/api/fortune/include";
import {
  getDefaultGroupId,
  getEnableGroupList,
  type GroupVo
} from "@/api/fortune/group";
import { type BookVo, getEnableBookList } from "@/api/fortune/book";
import { message } from "@/utils/message";
import {
  DataAnalysis,
  Wallet,
  Money,
  Coin,
  TrendCharts,
  PieChart,
  Histogram,
  TopRight,
  Warning,
  Sell
} from "@element-plus/icons-vue";

defineOptions({
  name: "Welcome"
});

const searchForm = reactive<DashboardQuery>({ periodType: 1 });
const groupOptions = ref<Array<GroupVo>>([]);
const bookOptions = ref<Array<BookVo>>([]);
const loading = ref(true);

function emptyStatistics() {
  return { income: 0, expense: 0, surplus: 0 };
}

const dashboard = ref<DashboardVo>({
  period: emptyStatistics(),
  previous: emptyStatistics(),
  ringIncomeRate: 0,
  ringExpenseRate: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  netAssets: 0,
  avgDailyExpense: 0,
  maxSingleExpense: 0,
  unconfirmedCount: 0,
  pendingReceivable: 0,
  recentTrend: []
});
const compareData = ref<Array<BillCompareVo>>([]);
const rankData = ref<Array<BarVo>>([]);

const currentCurrency = computed(() => {
  const currentGroup = groupOptions.value.find(
    group => group.groupId === searchForm.groupId
  );
  return currentGroup?.defaultCurrency || "CNY";
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currentCurrency.value,
    minimumFractionDigits: 2
  }).format(value);

async function loadDashboard() {
  if (!searchForm.bookId) return;
  loading.value = true;
  try {
    const [dashboardRes, compareRes, rankRes] = await Promise.all([
      getDashboard(searchForm),
      getBillCompare({ bookId: searchForm.bookId, compareType: 1 }),
      getBillRank({ bookId: searchForm.bookId, billType: 1, topN: 10 })
    ]);
    dashboard.value = dashboardRes.data;
    compareData.value = compareRes.data || [];
    rankData.value = rankRes.data || [];
  } catch (error) {
    message("加载数据失败，请稍后重试", { type: "error" });
  } finally {
    loading.value = false;
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
      loading.value = false;
      return;
    }
    searchForm.groupId = defaultGroupId.data || groupOptions.value[0].groupId;
    const bookRes = await getEnableBookList(searchForm.groupId);
    bookOptions.value = bookRes.data || [];
    if (bookOptions.value.length === 0) {
      message("请先启用或创建账本", { type: "warning" });
      loading.value = false;
      return;
    }
    const currentGroup = groupOptions.value.find(
      group => group.groupId === searchForm.groupId
    );
    searchForm.bookId =
      currentGroup?.defaultBookId || bookOptions.value[0].bookId;
    await loadDashboard();
  } catch (error) {
    message("初始化失败，请刷新页面重试", { type: "error" });
    loading.value = false;
  }
});

watch(
  () => searchForm.groupId,
  async (newGroupId, oldGroupId) => {
    if (!newGroupId || newGroupId === oldGroupId) return;
    const bookRes = await getEnableBookList(newGroupId);
    bookOptions.value = bookRes.data || [];
    if (bookOptions.value.length === 0) {
      message("请先启用或创建账本", { type: "warning" });
      return;
    }
    const currentGroup = groupOptions.value.find(
      group => group.groupId === newGroupId
    );
    searchForm.bookId =
      currentGroup?.defaultBookId || bookOptions.value[0].bookId;
  }
);

watch(
  () => searchForm.bookId,
  async (newBookId, oldBookId) => {
    if (!newBookId || newBookId === oldBookId) return;
    await loadDashboard();
  }
);
</script>

<style scoped lang="scss">
@media (width <= 1200px) {
  .charts-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 768px) {
  .filter-container {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .summary-cards,
  .metric-cards,
  .charts-container {
    grid-template-columns: 1fr;
  }
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100vh;
  padding: 16px;
  background-color: #f5f7fa;
}

.filter-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);

  .filter-title {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: #303133;

    .el-icon {
      font-size: 20px;
      color: #409eff;
    }
  }

  .search-form {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .filter-select {
    width: 200px;
  }
}

.summary-cards,
.metric-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: minmax(340px, auto);
  gap: 16px;

  .chart-card {
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: 0 4px 20px 0 rgb(0 0 0 / 10%);
    }

    :deep(.el-card__body) {
      height: calc(100% - 60px);
      padding: 0;
    }
  }

  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .chart-title {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 16px;
      font-weight: 600;

      .el-icon {
        color: #409eff;
      }
    }
  }

  .chart-content {
    height: 100%;
    padding: 16px;
  }

  .rank-content {
    overflow: auto;
  }

  .rank-state {
    padding: 16px;
  }

  .rank-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0;
    margin: 0;
    list-style: none;

    .rank-item {
      display: flex;
      align-items: center;
      padding: 8px 4px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .rank-index {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        margin-right: 12px;
        font-size: 12px;
        color: #909399;
        background-color: var(--el-fill-color-light);
        border-radius: 50%;

        &.is-top {
          color: #fff;
          background-color: #409eff;
        }
      }

      .rank-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .rank-value {
        margin-left: 12px;
        font-weight: 600;
        color: #f56c6c;
      }
    }
  }
}
</style>
