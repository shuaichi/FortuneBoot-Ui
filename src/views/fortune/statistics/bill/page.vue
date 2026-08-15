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
          :loading="dimensionLoading"
          :error="dimensionError"
          :title="dimensionTitle"
          :currency="currentCurrency"
          @refresh="loadDimension"
        />
        <pie
          v-else
          :data="dimensionData"
          :loading="dimensionLoading"
          :error="dimensionError"
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
            :error="compareError"
            :currency="currentCurrency"
            @retry="loadCompare"
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
            :loading="rankLoading"
            :error="rankError"
            title="支出排行"
            :currency="currentCurrency"
            @refresh="loadRank"
          />
        </div>
      </el-card>
    </div>

    <!-- 收支日历 -->
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header calendar-header">
          <span>收支日历</span>
          <div class="calendar-header__controls">
            <el-radio-group
              v-model="calendarGranularity"
              size="small"
              @change="loadIncomeExpenseCalendar"
            >
              <el-radio-button
                :value="IncomeExpenseCalendarGranularity.MonthlyDaily"
              >
                月度每日
              </el-radio-button>
              <el-radio-button
                :value="IncomeExpenseCalendarGranularity.YearlyMonthly"
              >
                年度每月
              </el-radio-button>
              <el-radio-button
                :value="IncomeExpenseCalendarGranularity.HistoricalYearly"
              >
                历史年度
              </el-radio-button>
            </el-radio-group>
            <el-date-picker
              v-if="
                calendarGranularity ===
                IncomeExpenseCalendarGranularity.MonthlyDaily
              "
              v-model="calendarMonth"
              type="month"
              placeholder="选择月份"
              aria-label="统计月份"
              size="small"
              value-format="YYYY-MM"
              :clearable="false"
              @change="loadIncomeExpenseCalendar"
            />
            <el-date-picker
              v-else-if="
                calendarGranularity ===
                IncomeExpenseCalendarGranularity.YearlyMonthly
              "
              v-model="calendarYear"
              type="year"
              placeholder="选择年份"
              aria-label="统计年份"
              size="small"
              value-format="YYYY"
              :clearable="false"
              @change="loadIncomeExpenseCalendar"
            />
            <template v-else>
              <el-date-picker
                v-model="calendarStartYear"
                type="year"
                placeholder="开始年份"
                aria-label="历史开始年份"
                size="small"
                value-format="YYYY"
                :clearable="false"
                @change="loadIncomeExpenseCalendar"
              />
              <el-date-picker
                v-model="calendarEndYear"
                type="year"
                placeholder="结束年份"
                aria-label="历史结束年份"
                size="small"
                value-format="YYYY"
                :clearable="false"
                @change="loadIncomeExpenseCalendar"
              />
            </template>
          </div>
        </div>
      </template>
      <div class="income-expense-calendar-box">
        <income-expense-calendar
          :data="incomeExpenseCalendarData"
          :loading="incomeExpenseCalendarLoading"
          :error="incomeExpenseCalendarError"
          :currency="currentCurrency"
          @retry="loadIncomeExpenseCalendar"
        />
      </div>
    </el-card>

    <!-- 收支日历热力图 -->
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header">
          <span>收支日历热力图</span>
          <el-date-picker
            v-model="heatmapYear"
            type="year"
            placeholder="选择年份"
            aria-label="热力图年份"
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
          :error="heatmapError"
          :currency="currentCurrency"
          @retry="loadHeatmap"
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
import IncomeExpenseCalendar from "../base/incomeExpenseCalendar.vue";
import Pie from "@/views/fortune/report/base/pie.vue";
import Bar from "@/views/fortune/report/base/bar.vue";
import { useStatisticsSearch } from "../base/useStatisticsSearch";
import {
  type BarVo,
  type BillCompareVo,
  type HeatmapVo,
  type IncomeExpenseCalendarQuery,
  type IncomeExpenseCalendarVo,
  IncomeExpenseCalendarGranularity,
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
  getCalendarHeatmap,
  getIncomeExpenseCalendar
} from "@/api/fortune/include";

const billType = ref<number>(1);
const activeDimension = ref<string>("category");
const dimensionData = ref<Array<BarVo>>([]);
const dimensionLoading = ref<boolean>(false);
const dimensionError = ref<boolean>(false);
let dimensionRequestId = 0;
const compareData = ref<Array<BillCompareVo>>([]);
const compareLoading = ref<boolean>(false);
const compareError = ref<boolean>(false);
let compareRequestId = 0;
const rankData = ref<Array<BarVo>>([]);
const rankLoading = ref<boolean>(false);
const rankError = ref<boolean>(false);
let rankRequestId = 0;
const heatmapData = ref<Array<HeatmapVo>>([]);
const heatmapLoading = ref<boolean>(false);
const heatmapError = ref<boolean>(false);
let heatmapRequestId = 0;
const heatmapYear = ref<string>(String(new Date().getFullYear()));
const currentYear = new Date().getFullYear();
const calendarGranularity = ref<IncomeExpenseCalendarGranularity>(
  IncomeExpenseCalendarGranularity.MonthlyDaily
);
const calendarMonth = ref<string>(
  `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
);
const calendarYear = ref<string>(String(currentYear));
const calendarStartYear = ref<string>(String(currentYear - 4));
const calendarEndYear = ref<string>(String(currentYear));
const incomeExpenseCalendarData = ref<IncomeExpenseCalendarVo | null>(null);
const incomeExpenseCalendarLoading = ref<boolean>(false);
const incomeExpenseCalendarError = ref<boolean>(false);
let incomeExpenseCalendarRequestId = 0;

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

function resetDimensionState() {
  dimensionData.value = [];
  dimensionLoading.value = false;
  dimensionError.value = false;
}

async function loadDimension() {
  const requestId = ++dimensionRequestId;
  if (!searchForm.bookId) {
    resetDimensionState();
    return;
  }

  const selectedBillType = billType.value;
  const params = { ...searchForm, billType: selectedBillType };
  const dimension = activeDimension.value;
  dimensionData.value = [];
  dimensionLoading.value = true;
  dimensionError.value = false;

  try {
    let data: BarVo[] = [];
    switch (dimension) {
      case "category":
        data =
          (selectedBillType === 1
            ? await getCategoryExpenseApi(params)
            : await getCategoryIncomeApi(params)
          ).data || [];
        break;
      case "tag":
        data =
          (selectedBillType === 1
            ? await getTagExpenseApi(params)
            : await getTagIncomeApi(params)
          ).data || [];
        break;
      case "payee":
        data =
          (selectedBillType === 1
            ? await getPayeeExpenseApi(params)
            : await getPayeeIncomeApi(params)
          ).data || [];
        break;
      case "account":
        data = ((await getAccountInclude(params)).data || []).map(item => ({
          name: item.accountName,
          value: item.amount,
          percent: item.percent
        }));
        break;
      case "member":
        data = (await getMemberInclude(params)).data || [];
        break;
      case "billType":
        data = (await getBillTypeDistribution(params)).data || [];
        break;
    }
    if (requestId === dimensionRequestId) dimensionData.value = data;
  } catch (error) {
    if (requestId === dimensionRequestId) {
      dimensionError.value = true;
      message("加载维度统计失败", { type: "error" });
    }
  } finally {
    if (requestId === dimensionRequestId) dimensionLoading.value = false;
  }
}

function resetCompareState() {
  compareData.value = [];
  compareLoading.value = false;
  compareError.value = false;
}

async function loadCompare() {
  const requestId = ++compareRequestId;
  if (!searchForm.bookId) {
    resetCompareState();
    return;
  }

  const params = { ...searchForm, compareType: 1 };
  compareData.value = [];
  compareLoading.value = true;
  compareError.value = false;
  try {
    const res = await getBillCompare(params);
    if (requestId === compareRequestId) compareData.value = res.data || [];
  } catch (error) {
    if (requestId === compareRequestId) {
      compareError.value = true;
      message("加载收支对比失败", { type: "error" });
    }
  } finally {
    if (requestId === compareRequestId) compareLoading.value = false;
  }
}

function resetRankState() {
  rankData.value = [];
  rankLoading.value = false;
  rankError.value = false;
}

async function loadRank() {
  const requestId = ++rankRequestId;
  if (!searchForm.bookId) {
    resetRankState();
    return;
  }

  const params = { ...searchForm, billType: 1, topN: 10 };
  rankData.value = [];
  rankLoading.value = true;
  rankError.value = false;
  try {
    const res = await getBillRank(params);
    if (requestId === rankRequestId) rankData.value = res.data || [];
  } catch (error) {
    if (requestId === rankRequestId) {
      rankError.value = true;
      message("加载支出排行失败", { type: "error" });
    }
  } finally {
    if (requestId === rankRequestId) rankLoading.value = false;
  }
}

async function loadHeatmap() {
  const requestId = ++heatmapRequestId;
  if (!searchForm.bookId) {
    heatmapData.value = [];
    heatmapLoading.value = false;
    heatmapError.value = false;
    return;
  }

  heatmapData.value = [];
  heatmapLoading.value = true;
  heatmapError.value = false;
  try {
    const res = await getCalendarHeatmap({
      ...searchForm,
      bookId: searchForm.bookId,
      year: Number(heatmapYear.value)
    });
    if (requestId === heatmapRequestId) heatmapData.value = res.data || [];
  } catch (error) {
    if (requestId === heatmapRequestId) {
      heatmapError.value = true;
      message("加载收支日历热力图失败", { type: "error" });
    }
  } finally {
    if (requestId === heatmapRequestId) heatmapLoading.value = false;
  }
}

function getIncomeExpenseCalendarQuery(): IncomeExpenseCalendarQuery | null {
  if (!searchForm.bookId) return null;

  if (
    calendarGranularity.value === IncomeExpenseCalendarGranularity.MonthlyDaily
  ) {
    const [year, month] = calendarMonth.value.split("-").map(Number);
    if (!year || month < 1 || month > 12) {
      message("请选择有效月份", { type: "warning" });
      return null;
    }
    return {
      ...searchForm,
      bookId: searchForm.bookId,
      granularity: IncomeExpenseCalendarGranularity.MonthlyDaily,
      year,
      month
    };
  }

  if (
    calendarGranularity.value === IncomeExpenseCalendarGranularity.YearlyMonthly
  ) {
    const year = Number(calendarYear.value);
    if (!year) {
      message("请选择有效年份", { type: "warning" });
      return null;
    }
    return {
      ...searchForm,
      bookId: searchForm.bookId,
      granularity: IncomeExpenseCalendarGranularity.YearlyMonthly,
      year
    };
  }

  const startYear = Number(calendarStartYear.value);
  const endYear = Number(calendarEndYear.value);
  if (!startYear || !endYear || startYear > endYear) {
    message("开始年份不能晚于结束年份", { type: "warning" });
    return null;
  }
  if (endYear - startYear + 1 > 10) {
    message("历史年度最多可查询 10 年", { type: "warning" });
    return null;
  }
  return {
    ...searchForm,
    bookId: searchForm.bookId,
    granularity: IncomeExpenseCalendarGranularity.HistoricalYearly,
    startYear,
    endYear
  };
}

async function loadIncomeExpenseCalendar() {
  const requestId = ++incomeExpenseCalendarRequestId;
  const params = getIncomeExpenseCalendarQuery();
  if (!params) {
    incomeExpenseCalendarData.value = null;
    incomeExpenseCalendarError.value = false;
    incomeExpenseCalendarLoading.value = false;
    return;
  }

  incomeExpenseCalendarLoading.value = true;
  incomeExpenseCalendarError.value = false;
  incomeExpenseCalendarData.value = null;
  try {
    const res = await getIncomeExpenseCalendar(params);
    if (requestId === incomeExpenseCalendarRequestId) {
      incomeExpenseCalendarData.value = res.data;
    }
  } catch (error) {
    if (requestId === incomeExpenseCalendarRequestId) {
      incomeExpenseCalendarError.value = true;
      message("加载收支日历失败，请稍后重试", { type: "error" });
    }
  } finally {
    if (requestId === incomeExpenseCalendarRequestId) {
      incomeExpenseCalendarLoading.value = false;
    }
  }
}

async function onSearch() {
  syncTradeTimeRange();
  await Promise.all([
    loadDimension(),
    loadCompare(),
    loadRank(),
    loadIncomeExpenseCalendar(),
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

.calendar-header {
  flex-wrap: wrap;
  gap: 12px;
}

.calendar-header__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

@media (width <= 768px) {
  .calendar-header {
    align-items: stretch !important;
  }

  .calendar-header__controls {
    align-items: stretch;
    width: 100%;
  }

  .calendar-header__controls :deep(.el-radio-group),
  .calendar-header__controls :deep(.el-date-editor) {
    width: 100%;
  }
}

.chart-box {
  height: 420px;

  /* 复用的 report 图表组件默认高度为 83vh，这里约束到卡片内 */
  :deep(.chart-container) {
    height: 100%;
    padding: 0;
  }
}

/* 维度区主图：舒展展示，对齐旧报表沉浸感但不占满整屏 */
.dimension-chart {
  height: 60vh;
  min-height: 420px;

  :deep(.chart-container) {
    height: 100%;
    padding: 0;
  }
}

.income-expense-calendar-box {
  min-height: 0;
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
