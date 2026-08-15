<template>
  <div class="stat-chart">
    <div v-if="loading" class="stat-chart__state">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="error" class="stat-chart__state">
      <el-empty description="加载失败">
        <el-button type="primary" @click="emit('retry')">重试</el-button>
      </el-empty>
    </div>
    <div v-else-if="data.length === 0" class="stat-chart__state">
      <el-empty description="暂无数据" />
    </div>
    <div v-else ref="chartRef" class="stat-chart__canvas" />
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
import * as echarts from "echarts";
import type { HeatmapVo } from "@/api/fortune/include";
import { compare, subtract } from "@/utils/decimal";
import {
  EXPENSE_COLOR,
  EXPENSE_LIGHT_COLOR,
  INCOME_COLOR,
  INCOME_LIGHT_COLOR
} from "./constants";

type HeatmapData = [string, number, number, number, number, number];

const props = withDefaults(
  defineProps<{
    data: HeatmapVo[];
    year: number;
    loading?: boolean;
    error?: boolean;
    currency?: string;
  }>(),
  { loading: false, error: false, currency: "CNY" }
);
const emit = defineEmits<{ retry: [] }>();
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const heatData = computed<HeatmapData[]>(() =>
  props.data.map(item => [
    item.date,
    subtract(item.income || 0, item.expense || 0),
    item.income || 0,
    item.expense || 0,
    item.incomeCount || 0,
    item.expenseCount || 0
  ])
);

const maxAbsoluteNetAmount = computed(() =>
  heatData.value.reduce(
    (max, [, netAmount]) =>
      compare(Math.abs(netAmount), max) > 0 ? Math.abs(netAmount) : max,
    0
  )
);

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: props.currency,
    minimumFractionDigits: 2
  }).format(value);
}

function disposeChart() {
  chartInstance?.dispose();
  chartInstance = null;
}

function updateChart() {
  if (!chartInstance) return;
  const range = maxAbsoluteNetAmount.value || 1;
  chartInstance.setOption(
    {
      tooltip: {
        formatter: (params: { data: HeatmapData }) => {
          const [, netAmount, income, expense, incomeCount, expenseCount] =
            params.data;
          return `${params.data[0]}<br/>收入: ${formatCurrency(income)}（${incomeCount} 笔）<br/>支出: ${formatCurrency(expense)}（${expenseCount} 笔）<br/>净额: ${formatCurrency(netAmount)}`;
        }
      },
      visualMap: {
        min: -range,
        max: range,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        inRange: {
          color: [
            EXPENSE_COLOR,
            EXPENSE_LIGHT_COLOR,
            "#F5F7FA",
            INCOME_LIGHT_COLOR,
            INCOME_COLOR
          ]
        }
      },
      calendar: {
        top: 40,
        left: 40,
        right: 20,
        cellSize: ["auto", 16],
        range: String(props.year),
        itemStyle: { borderWidth: 1, borderColor: "#fff" },
        yearLabel: { show: true },
        dayLabel: { firstDay: 1, nameMap: "cn" },
        monthLabel: { nameMap: "cn" }
      },
      series: [
        { type: "heatmap", coordinateSystem: "calendar", data: heatData.value }
      ]
    },
    true
  );
}

async function renderChart() {
  if (props.loading || props.error || props.data.length === 0) {
    disposeChart();
    return;
  }
  await nextTick();
  if (!chartRef.value) return;
  if (!chartInstance) chartInstance = echarts.init(chartRef.value);
  updateChart();
  chartInstance.resize();
}

function handleResize() {
  chartInstance?.resize();
}

watch(() => [props.data, props.year, props.loading, props.error], renderChart, {
  deep: true,
  immediate: true
});
onMounted(() => window.addEventListener("resize", handleResize));
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  disposeChart();
});
</script>

<style scoped>
.stat-chart {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 240px;
}

.stat-chart__canvas,
.stat-chart__state {
  width: 100%;
  height: 100%;
}

.stat-chart__state {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
