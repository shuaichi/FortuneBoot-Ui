<template>
  <div class="chart-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else ref="chartRef" class="pie-chart" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import { getTotalAssets, type PieVo } from "@/api/fortune/include";
import { sumBy } from "@/utils/decimal";

interface PieChartData {
  name: string;
  value: number;
}

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "TotalAssetsPie"
});

const props = defineProps<{
  groupId: number;
  showAmount: boolean;
}>();
const chartRef = ref<HTMLElement | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
let chartInstance: echarts.ECharts | null = null;
let chartData: PieChartData[] = [];
let selectedLegend: Record<string, boolean> = {};
let requestId = 0;

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function formatAmount(value: number) {
  return props.showAmount ? `${formatNumber(value)}元` : "****";
}

function getSelectedTotal(selected: Record<string, boolean>) {
  return sumBy(
    chartData.filter(item => selected[item.name]),
    "value"
  );
}

function createChartOption(totalValue: number): echarts.EChartsOption {
  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params: { data: PieChartData; percent: number }) =>
        `${params.data.name}<br/>金额: ${formatAmount(params.data.value)}<br/>占比: ${params.percent}%`
    },
    legend: {
      selected: selectedLegend,
      orient: "vertical",
      right: 10,
      top: 20,
      bottom: 20,
      type: "scroll",
      pageIconColor: "#409eff",
      pageIconInactiveColor: "#c0c4cc",
      pageTextStyle: { color: "#666" },
      formatter: name => {
        const item = chartData.find(data => data.name === name);
        return item ? `${name} ${formatAmount(item.value)}` : name;
      }
    },
    graphic: [
      {
        type: "group",
        left: "center",
        top: "center",
        children: [
          {
            type: "text",
            style: {
              text: formatAmount(totalValue),
              fontSize: window.innerWidth < 768 ? 18 : 24,
              fontWeight: "bold",
              fill: "#333",
              textAlign: "center",
              textVerticalAlign: "middle"
            },
            left: "center",
            top: "center",
            z: 100
          }
        ],
        z: 100
      }
    ],
    series: [
      {
        type: "pie",
        radius: ["57%", "90%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: (params: { percent: number }) => `${params.percent}%`,
          fontSize: 12,
          color: "#666",
          fontWeight: "bold"
        },
        labelLine: { show: true, length: 10, length2: 15 },
        emphasis: { label: { show: true, fontSize: 20 } },
        data: chartData
      }
    ]
  };
  return option as echarts.EChartsOption;
}

function updateChart(totalValue = getSelectedTotal(selectedLegend)) {
  chartInstance?.setOption(createChartOption(totalValue), true);
}

function initChart() {
  if (!chartRef.value) return;
  chartInstance?.dispose();
  chartInstance = echarts.init(chartRef.value);
  chartInstance.on(
    "legendselectchanged",
    (params: { selected: Record<string, boolean> }) => {
      selectedLegend = params.selected;
      updateChart();
    }
  );
  updateChart();
}

async function fetchData() {
  const currentRequestId = ++requestId;
  loading.value = true;
  error.value = null;
  try {
    const res = await getTotalAssets(props.groupId);
    if (currentRequestId !== requestId) return;
    chartData = [...(res.data || [])]
      .map((item: PieVo) => ({ name: item.name, value: item.value }))
      .sort((a, b) => b.value - a.value);
    selectedLegend = Object.fromEntries(
      chartData.map(item => [item.name, true])
    );
    await nextTick();
    if (currentRequestId === requestId) initChart();
  } catch (requestError) {
    if (currentRequestId === requestId) error.value = "加载失败";
  } finally {
    if (currentRequestId === requestId) loading.value = false;
  }
}

function handleResize() {
  chartInstance?.resize();
}

watch(
  () => props.groupId,
  () => fetchData()
);
watch(
  () => props.showAmount,
  () => updateChart()
);
onMounted(() => {
  window.addEventListener("resize", handleResize);
  fetchData();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chartInstance?.dispose();
  chartInstance = null;
});
</script>

<style scoped>
@media (width <= 768px) {
  .chart-container,
  .pie-chart {
    min-height: 350px;
  }
}

@media (width <= 480px) {
  .chart-container,
  .pie-chart {
    min-height: 320px;
  }
}

.chart-container,
.pie-chart,
.loading,
.error {
  width: 100%;
  height: 100%;
}

.chart-container {
  position: relative;
  min-height: 300px;
}

.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
}

.error {
  color: var(--el-color-danger);
}
</style>
