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
import type { LineVo } from "@/api/fortune/include";

const props = withDefaults(
  defineProps<{
    data: Array<LineVo>;
    loading?: boolean;
    currency?: string;
    /** bar | line */
    chartType?: "bar" | "line";
    color?: string;
    /** 是否显示金额 */
    showAmount?: boolean;
  }>(),
  {
    loading: false,
    currency: "CNY",
    chartType: "line",
    color: "#409EFF"
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
  const isLine = props.chartType === "line";
  chartInstance.setOption(
    {
      tooltip: {
        trigger: "axis",
        formatter: (params: { name: string; value: number }[]) => {
          const item = params[0];
          const value =
            props.showAmount === false ? "****" : formatCurrency(item.value);
          return `${item.name}<br/>${value}`;
        }
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
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
            props.showAmount === false
              ? "****"
              : value >= 10000
                ? value / 10000 + "万"
                : value
        }
      },
      series: [
        {
          type: isLine ? "line" : "bar",
          data: props.data.map(item => item.value),
          smooth: isLine,
          symbolSize: 7,
          itemStyle: {
            color: props.color,
            borderRadius: isLine ? 0 : [5, 5, 0, 0]
          },
          areaStyle: isLine
            ? {
                opacity: 0.25,
                color: props.color
              }
            : undefined
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
  () => [props.data, props.chartType, props.loading, props.showAmount],
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
  min-height: 260px;
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
