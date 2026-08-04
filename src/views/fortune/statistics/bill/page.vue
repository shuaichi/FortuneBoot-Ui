<template>
  <div class="statistics-page">
    <statistics-search-form
      v-model:group-id="groupId"
      v-model:trade-time-range="tradeTimeRange"
      :search-form="searchForm"
      :group-options="groupOptions"
      :book-options="bookOptions"
      :account-options="accountOptions"
      :payee-options="payeeOptions"
      :category-options="categoryOptions"
      :tag-options="tagOptions"
      :member-options="memberOptions"
      @search="onSearch"
      @reset="resetForm"
    />

    <!-- 多维度分析 -->
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header">
          <span>多维度分析</span>
          <el-radio-group
            v-model="billType"
            size="small"
            @change="loadDimension"
          >
            <el-radio-button :value="1">支出</el-radio-button>
            <el-radio-button :value="2">收入</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <el-tabs v-model="activeDimension" @tab-change="loadDimension">
        <el-tab-pane label="分类" name="category" />
        <el-tab-pane label="标签" name="tag" />
        <el-tab-pane label="交易对象" name="payee" />
        <el-tab-pane label="账户" name="account" />
        <el-tab-pane label="成员" name="member" />
        <el-tab-pane label="类型" name="billType" />
      </el-tabs>
      <div class="dimension-chart">
        <bar
          v-if="activeDimension === 'member'"
          :data="dimensionData"
          :title="dimensionTitle"
          :currency="currentCurrency"
          @refresh="loadDimension"
        />
        <pie
          v-else
          :data="dimensionData"
          :title="dimensionTitle"
          :currency="currentCurrency"
          @refresh="loadDimension"
        />
      </div>
    </el-card>

    <!-- 收支对比 + 排行 -->
    <div class="grid-two">
      <el-card class="statistics-card">
        <template #header>
          <div class="card-header"><span>收支对比</span></div>
        </template>
        <div class="chart-box">
          <compare-chart
            :data="compareData"
            :loading="compareLoading"
            :currency="currentCurrency"
          />
        </div>
      </el-card>

      <el-card class="statistics-card">
        <template #header>
          <div class="card-header">
            <span>支出排行 TopN</span>
          </div>
        </template>
        <div class="chart-box">
          <bar
            :data="rankData"
            title="支出排行"
            :currency="currentCurrency"
            @refresh="loadRank"
          />
        </div>
      </el-card>
    </div>

    <!-- 日历热力图 -->
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header">
          <span>消费日历热力图</span>
          <el-date-picker
            v-model="heatmapYear"
            type="year"
            placeholder="选择年份"
            size="small"
            value-format="YYYY"
            :clearable="false"
            @change="loadHeatmap"
          />
        </div>
      </template>
      <div class="heatmap-box">
        <calendar-heatmap
          :data="heatmapData"
          :year="Number(heatmapYear)"
          :loading="heatmapLoading"
          :currency="currentCurrency"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { message } from "@/utils/message";
import StatisticsSearchForm from "../base/statisticsSearchForm.vue";
import CompareChart from "../base/compareChart.vue";
import CalendarHeatmap from "../base/calendarHeatmap.vue";
import Pie from "@/views/fortune/report/base/pie.vue";
import Bar from "@/views/fortune/report/base/bar.vue";
import { useStatisticsSearch } from "../base/useStatisticsSearch";
import {
  type PieVo,
  type BarVo,
  type BillCompareVo,
  type HeatmapVo,
  getCategoryExpenseApi,
  getCategoryIncomeApi,
  getTagExpenseApi,
  getTagIncomeApi,
  getPayeeExpenseApi,
  getPayeeIncomeApi,
  getAccountInclude,
  getMemberInclude,
  getBillTypeDistribution,
  getBillCompare,
  getBillRank,
  getCalendarHeatmap
} from "@/api/fortune/include";

const billType = ref<number>(1);
const activeDimension = ref<string>("category");
const dimensionData = ref<Array<PieVo | BarVo>>([]);
const compareData = ref<Array<BillCompareVo>>([]);
const compareLoading = ref<boolean>(false);
const rankData = ref<Array<BarVo>>([]);
const heatmapData = ref<Array<HeatmapVo>>([]);
const heatmapLoading = ref<boolean>(false);
const heatmapYear = ref<string>(String(new Date().getFullYear()));

const dimensionLabelMap: Record<string, string> = {
  category: "分类",
  tag: "标签",
  payee: "交易对象",
  account: "账户",
  member: "成员",
  billType: "类型"
};

const dimensionTitle = computed(() => {
  const typeLabel = billType.value === 1 ? "支出" : "收入";
  return `${typeLabel}${dimensionLabelMap[activeDimension.value]}统计`;
});

const currentCurrency = computed(() => {
  const currentGroup = groupOptions.value?.find(
    group => group.groupId === groupId.value
  );
  return currentGroup?.defaultCurrency || "CNY";
});

const {
  searchForm,
  groupId,
  tradeTimeRange,
  groupOptions,
  bookOptions,
  accountOptions,
  payeeOptions,
  tagOptions,
  categoryOptions,
  memberOptions,
  init,
  resetForm,
  syncTradeTimeRange
} = useStatisticsSearch(onSearch);

async function loadDimension() {
  if (!searchForm.bookId) return;
  const params = { ...searchForm, billType: billType.value };
  try {
    switch (activeDimension.value) {
      case "category":
        dimensionData.value = (
          billType.value === 1
            ? await getCategoryExpenseApi(params)
            : await getCategoryIncomeApi(params)
        ).data;
        break;
      case "tag":
        dimensionData.value = (
          billType.value === 1
            ? await getTagExpenseApi(params)
            : await getTagIncomeApi(params)
        ).data;
        break;
      case "payee":
        dimensionData.value = (
          billType.value === 1
            ? await getPayeeExpenseApi(params)
            : await getPayeeIncomeApi(params)
        ).data;
        break;
      case "account":
        dimensionData.value = (await getAccountInclude(params)).data.map(
          item => ({
            name: item.accountName,
            value: item.amount,
            percent: item.percent
          })
        );
        break;
      case "member":
        dimensionData.value = (await getMemberInclude(params)).data;
        break;
      case "billType":
        dimensionData.value = (await getBillTypeDistribution(params)).data;
        break;
    }
  } catch (error) {
    message("加载维度统计失败", { type: "error" });
  }
}

async function loadCompare() {
  if (!searchForm.bookId) return;
  compareLoading.value = true;
  try {
    const res = await getBillCompare({ ...searchForm, compareType: 1 });
    compareData.value = res.data || [];
  } finally {
    compareLoading.value = false;
  }
}

async function loadRank() {
  if (!searchForm.bookId) return;
  const res = await getBillRank({ ...searchForm, billType: 1, topN: 10 });
  rankData.value = res.data || [];
}

async function loadHeatmap() {
  if (!searchForm.bookId) return;
  heatmapLoading.value = true;
  try {
    const res = await getCalendarHeatmap({
      bookId: searchForm.bookId,
      year: Number(heatmapYear.value),
      billType: 1
    });
    heatmapData.value = res.data || [];
  } finally {
    heatmapLoading.value = false;
  }
}

async function onSearch() {
  syncTradeTimeRange();
  await Promise.all([
    loadDimension(),
    loadCompare(),
    loadRank(),
    loadHeatmap()
  ]);
}

onMounted(() => {
  init();
});
</script>

<style scoped lang="scss">
@media (width <= 992px) {
  .grid-two {
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }
}

.dimension-chart,
.chart-box {
  height: 420px;

  /* 复用的 report 图表组件默认高度为 83vh，这里约束到卡片内 */
  :deep(.chart-container) {
    height: 100%;
    padding: 0;
  }
}

.heatmap-box {
  height: 260px;
}

.grid-two {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
</style>
