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
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import type { BillCompareVo } from "@/api/fortune/include";

const props = withDefaults(
  defineProps<{
    data: BillCompareVo[];
    loading?: boolean;
    error?: boolean;
    currency?: string;
  }>(),
  { loading: false, error: false, currency: "CNY" }
);
const emit = defineEmits<{ retry: [] }>();
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

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
  chartInstance.setOption(
    {
      tooltip: {
        trigger: "axis",
        formatter: (
          params: {
            marker: string;
            seriesName: string;
            value: number;
            name: string;
          }[]
        ) => {
          const lines = params.map(
            item =>
              `${item.marker}${item.seriesName}: ${formatCurrency(item.value)}`
          );
          return `${params[0].name}<br/>${lines.join("<br/>")}`;
        }
      },
      legend: { data: ["收入", "支出"], top: 0 },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: 40,
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: props.data.map(item => item.name),
        axisLabel: { interval: 0, rotate: props.data.length > 10 ? 45 : 0 }
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) =>
            value >= 10000 ? `${value / 10000}万` : value
        }
      },
      series: [
        {
          name: "收入",
          type: "bar",
          data: props.data.map(item => item.income),
          itemStyle: { color: "#67C23A", borderRadius: [4, 4, 0, 0] }
        },
        {
          name: "支出",
          type: "bar",
          data: props.data.map(item => item.expense),
          itemStyle: { color: "#F56C6C", borderRadius: [4, 4, 0, 0] }
        }
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

watch(() => [props.data, props.loading, props.error], renderChart, {
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
  min-height: 300px;
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
