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
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
  computed
} from "vue";
import * as echarts from "echarts";
import type { HeatmapVo } from "@/api/fortune/include";
import { compare } from "@/utils/decimal";

const props = withDefaults(
  defineProps<{
    data: Array<HeatmapVo>;
    year: number;
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

const maxAmount = computed(() =>
  props.data.reduce(
    (max, item) => (compare(item.amount, max) > 0 ? item.amount : max),
    0
  )
);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: props.currency,
    minimumFractionDigits: 2
  }).format(value);

function updateChart() {
  if (!chartInstance) return;
  const heatData = props.data.map(item => [item.date, item.amount, item.count]);
  chartInstance.setOption(
    {
      tooltip: {
        formatter: (p: any) =>
          `${p.data[0]}<br/>金额: ${formatCurrency(
            p.data[1]
          )}<br/>笔数: ${p.data[2]}`
      },
      visualMap: {
        min: 0,
        max: maxAmount.value || 1,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        inRange: {
          color: ["#e8f5e9", "#66bb6a", "#f56c6c"]
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
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: heatData
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
  () => [props.data, props.year, props.loading],
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
  min-height: 240px;
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
