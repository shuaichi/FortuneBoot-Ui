<template>
  <div class="income-expense-trend">
    <div class="income-expense-trend__controls">
      <el-radio-group v-model="granularity" size="small" @change="loadTrend">
        <el-radio-button
          v-for="item in homeTrendGranularityOptions"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>
      <el-date-picker
        v-model="timePoint"
        :type="pickerType"
        :value-format="pickerFormat"
        :placeholder="pickerPlaceholder"
        :aria-label="pickerPlaceholder"
        size="small"
        :clearable="false"
        @change="loadTrend"
      />
    </div>

    <div v-if="loading" class="income-expense-trend__state">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="error" class="income-expense-trend__state">
      <el-empty description="加载失败">
        <el-button type="primary" @click="loadTrend">重试</el-button>
      </el-empty>
    </div>
    <div v-else-if="!hasData" class="income-expense-trend__state">
      <el-empty description="暂无数据" />
    </div>
    <div v-else ref="chartRef" class="income-expense-trend__canvas" />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from "vue";
import dayjs from "dayjs";
import * as echarts from "echarts";
import {
  getExpenseTrends,
  getIncomeTrends,
  type LineVo,
  TrendTimeGranularity
} from "@/api/fortune/include";
import {
  EXPENSE_COLOR,
  homeTrendGranularityOptions,
  INCOME_COLOR
} from "@/views/fortune/statistics/base/constants";

const props = withDefaults(
  defineProps<{
    bookId?: number;
    currency?: string;
    showAmount?: boolean;
  }>(),
  { currency: "CNY", showAmount: false }
);

const granularity = ref<TrendTimeGranularity>(TrendTimeGranularity.Weekly);
const timePoint = ref(dayjs().format("YYYY-MM-DD"));
const incomeData = ref<LineVo[]>([]);
const expenseData = ref<LineVo[]>([]);
const loading = ref(false);
const error = ref(false);
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let requestId = 0;

const pickerType = computed<"date" | "month" | "year">(() => {
  if (granularity.value === TrendTimeGranularity.Monthly) return "month";
  if (
    granularity.value === TrendTimeGranularity.Yearly ||
    granularity.value === TrendTimeGranularity.HistoricalYearly
  ) {
    return "year";
  }
  return "date";
});
const pickerFormat = computed(() => {
  if (pickerType.value === "month") return "YYYY-MM";
  if (pickerType.value === "year") return "YYYY";
  return "YYYY-MM-DD";
});
const pickerPlaceholder = computed(() => {
  if (pickerType.value === "month") return "选择统计月份";
  if (pickerType.value === "year") return "选择统计年份";
  return "选择统计日期";
});
const hasData = computed(
  () => incomeData.value.length > 0 || expenseData.value.length > 0
);

function normalizeTimePoint() {
  if (granularity.value === TrendTimeGranularity.Monthly) {
    timePoint.value = dayjs(timePoint.value).format("YYYY-MM");
    return;
  }
  if (
    granularity.value === TrendTimeGranularity.Yearly ||
    granularity.value === TrendTimeGranularity.HistoricalYearly
  ) {
    timePoint.value = dayjs(timePoint.value).format("YYYY");
    return;
  }
  timePoint.value = dayjs(timePoint.value).format("YYYY-MM-DD");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: props.currency,
    minimumFractionDigits: 2
  }).format(value);
}

function maskedAmount(value: number) {
  return props.showAmount ? formatCurrency(value) : "****";
}

function getValueMap(data: LineVo[]) {
  return new Map(data.map(item => [item.name, Number(item.value) || 0]));
}

function updateChart() {
  if (!chartInstance) return;
  const incomeByName = getValueMap(incomeData.value);
  const expenseByName = getValueMap(expenseData.value);
  const labels = Array.from(
    new Set([...incomeByName.keys(), ...expenseByName.keys()])
  );

  chartInstance.setOption(
    {
      aria: {
        enabled: true,
        description: props.showAmount
          ? "收入与支出趋势图，收入使用红色折线，支出使用绿色虚线。"
          : "收入与支出趋势图，金额已隐藏；收入使用红色折线，支出使用绿色虚线。"
      },
      tooltip: {
        trigger: "axis",
        formatter: (
          params: Array<{
            axisValue: string;
            seriesName: string;
            value: number;
            marker: string;
          }>
        ) =>
          `${params[0].axisValue}<br/>${params
            .map(
              item =>
                `${item.marker}${item.seriesName}: ${maskedAmount(item.value)}`
            )
            .join("<br/>")}`
      },
      legend: { data: ["收入", "支出"], top: 0 },
      grid: {
        left: "3%",
        right: "4%",
        top: 40,
        bottom: "3%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: { interval: 0, rotate: labels.length > 12 ? 45 : 0 }
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) =>
            props.showAmount
              ? value >= 10000
                ? `${value / 10000}万`
                : value
              : "****"
        }
      },
      series: [
        {
          name: "收入",
          type: "line",
          smooth: true,
          symbolSize: 7,
          data: labels.map(name => incomeByName.get(name) || 0),
          itemStyle: { color: INCOME_COLOR },
          lineStyle: { color: INCOME_COLOR, width: 2 },
          areaStyle: { color: INCOME_COLOR, opacity: 0.12 }
        },
        {
          name: "支出",
          type: "line",
          smooth: true,
          symbolSize: 7,
          data: labels.map(name => expenseByName.get(name) || 0),
          itemStyle: { color: EXPENSE_COLOR },
          lineStyle: { color: EXPENSE_COLOR, width: 2, type: "dashed" },
          areaStyle: { color: EXPENSE_COLOR, opacity: 0.08 }
        }
      ]
    },
    true
  );
}

async function renderChart() {
  if (loading.value || error.value || !hasData.value) {
    chartInstance?.dispose();
    chartInstance = null;
    return;
  }
  await nextTick();
  if (!chartRef.value) return;
  if (!chartInstance) chartInstance = echarts.init(chartRef.value);
  updateChart();
  chartInstance.resize();
}

async function loadTrend() {
  const currentRequestId = ++requestId;
  if (!props.bookId) {
    incomeData.value = [];
    expenseData.value = [];
    loading.value = false;
    error.value = false;
    return;
  }

  normalizeTimePoint();
  loading.value = true;
  error.value = false;
  try {
    const params = {
      bookId: props.bookId,
      timeGranularity: granularity.value,
      timePoint: dayjs(timePoint.value).format("YYYY-MM-DD HH:mm:ss")
    };
    const [incomeRes, expenseRes] = await Promise.all([
      getIncomeTrends(params),
      getExpenseTrends(params)
    ]);
    if (currentRequestId !== requestId) return;
    incomeData.value = incomeRes.data || [];
    expenseData.value = expenseRes.data || [];
  } catch (requestError) {
    if (currentRequestId === requestId) error.value = true;
  } finally {
    if (currentRequestId === requestId) loading.value = false;
  }
}

function handleResize() {
  chartInstance?.resize();
}

watch(
  () => props.bookId,
  () => loadTrend()
);
watch(
  () => props.showAmount,
  () => updateChart()
);
watch([incomeData, expenseData, loading, error], renderChart, { deep: true });
onMounted(() => {
  window.addEventListener("resize", handleResize);
  loadTrend();
});
onBeforeUnmount(() => {
  requestId += 1;
  window.removeEventListener("resize", handleResize);
  chartInstance?.dispose();
  chartInstance = null;
});
</script>

<style scoped lang="scss">
.income-expense-trend {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.income-expense-trend__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.income-expense-trend__canvas,
.income-expense-trend__state {
  flex: 1;
  min-height: 0;
}

.income-expense-trend__state {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (width <= 768px) {
  .income-expense-trend__controls :deep(.el-radio-group),
  .income-expense-trend__controls :deep(.el-date-editor) {
    width: 100%;
  }
}
</style>
