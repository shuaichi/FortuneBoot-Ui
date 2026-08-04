<template>
  <div class="stat-chart">
    <div v-show="loading" class="stat-chart__state">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-show="!loading && data.length === 0" class="stat-chart__state">
      <el-empty description="暂无数据" />
    </div>
    <div
      v-show="!loading && data.length > 0"
      ref="chartRef"
      class="stat-chart__canvas"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import * as echarts from "echarts";
import type { BillCompareVo } from "@/api/fortune/include";

const props = withDefaults(
  defineProps<{
    data: Array<BillCompareVo>;
    loading?: boolean;
    currency?: string;
  }>(),
  {
    loading: false,
    currency: "CNY"
  }
);

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: props.currency,
    minimumFractionDigits: 2
  }).format(value);

function updateChart() {
  if (!chartInstance) return;
  chartInstance.setOption(
    {
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const lines = params.map(
            (p: any) => `${p.marker}${p.seriesName}: ${formatCurrency(p.value)}`
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
        axisLabel: {
          interval: 0,
          rotate: props.data.length > 10 ? 45 : 0
        }
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) =>
            value >= 10000 ? value / 10000 + "万" : value
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

function initChart() {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  updateChart();
}

const handleResize = () => chartInstance?.resize();

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chartInstance?.dispose();
  chartInstance = null;
});

watch(
  () => [props.data, props.loading],
  async () => {
    if (props.loading) return;
    await nextTick();
    if (!chartInstance) initChart();
    else updateChart();
    setTimeout(() => chartInstance?.resize(), 0);
  },
  { deep: true }
);
</script>

<style scoped>
.stat-chart {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.stat-chart__canvas {
  width: 100%;
  height: 100%;
}

.stat-chart__state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
