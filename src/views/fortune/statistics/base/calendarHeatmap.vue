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
import { compare } from "@/utils/decimal";

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

const maxAmount = computed(() =>
  props.data.reduce(
    (max, item) => (compare(item.amount, max) > 0 ? item.amount : max),
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
  const heatData = props.data.map(item => [item.date, item.amount, item.count]);
  chartInstance.setOption(
    {
      tooltip: {
        formatter: (params: { data: [string, number, number] }) =>
          `${params.data[0]}<br/>金额: ${formatCurrency(params.data[1])}<br/>笔数: ${params.data[2]}`
      },
      visualMap: {
        min: 0,
        max: maxAmount.value || 1,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        inRange: { color: ["#e8f5e9", "#66bb6a", "#f56c6c"] }
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
        { type: "heatmap", coordinateSystem: "calendar", data: heatData }
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
