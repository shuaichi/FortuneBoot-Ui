<template>
  <div class="chart-container">
    <div class="chart-header flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold">{{ title || "数据统计" }}</h3>
      <div class="chart-actions flex gap-2">
        <el-tooltip content="刷新数据">
          <el-button
            :icon="Refresh"
            circle
            size="small"
            @click="emit('refresh')"
          />
        </el-tooltip>
        <el-tooltip content="下载图表">
          <el-button
            :icon="Download"
            circle
            size="small"
            :disabled="!hasData"
            @click="downloadChart"
          />
        </el-tooltip>
        <el-dropdown @command="handleViewChange">
          <el-button size="small">
            图表视图
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="pie">饼图</el-dropdown-item>
              <el-dropdown-item command="rose">玫瑰图</el-dropdown-item>
              <el-dropdown-item command="table">表格视图</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div v-if="loading" class="chart-state">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-else-if="error" class="chart-state">
      <el-empty description="加载失败">
        <el-button type="primary" @click="emit('refresh')">重试</el-button>
      </el-empty>
    </div>
    <div v-else-if="!hasData" class="chart-state">
      <el-empty description="暂无数据" />
    </div>
    <div v-else-if="currentView === 'table'" class="table-view">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="value" label="金额">
          <template #default="scope">{{
            formatCurrency(scope.row.value)
          }}</template>
        </el-table-column>
        <el-table-column prop="percent" label="占比">
          <template #default="scope">{{ scope.row.percent }}%</template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else ref="chartRef" class="pie-chart" />
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
import { ArrowDown, Download, Refresh } from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { sumBy } from "@/utils/decimal";

interface ChartPieItem {
  name: string;
  value: number;
}

const props = withDefaults(
  defineProps<{
    data: ChartPieItem[];
    title?: string;
    currency?: string;
    loading?: boolean;
    error?: boolean;
  }>(),
  { title: "", currency: "CNY", loading: false, error: false }
);
const emit = defineEmits<{ refresh: [] }>();
const chartRef = ref<HTMLElement | null>(null);
const currentView = ref<"pie" | "rose" | "table">("pie");
let chartInstance: echarts.ECharts | null = null;

const hasData = computed(() => props.data.length > 0);
const tableData = computed(() => {
  const total = sumBy(props.data, "value");
  return props.data.map(item => ({
    ...item,
    percent: total ? ((item.value / total) * 100).toFixed(2) : "0.00"
  }));
});
const totalAmount = computed(() => sumBy(props.data, "value"));

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

function generateColors(count: number): echarts.LinearGradientObject[] {
  const baseColors = [
    ["#83bff6", "#188df0"],
    ["#66e2da", "#23b7e5"],
    ["#ffb980", "#ff7c7c"],
    ["#5ab1ef", "#2ec7c9"],
    ["#d87a80", "#ffb980"],
    ["#8d98b3", "#e5cf0d"],
    ["#97b552", "#95706d"],
    ["#dc69aa", "#07a2a4"],
    ["#9a7fd1", "#588dd5"],
    ["#c1232b", "#27727b"]
  ];
  return Array.from({ length: count }, (_, index) => ({
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: baseColors[index % baseColors.length][0] },
      { offset: 1, color: baseColors[index % baseColors.length][1] }
    ]
  }));
}

function updateChart() {
  if (!chartInstance) return;
  const isRoseChart = currentView.value === "rose";
  chartInstance.setOption(
    {
      tooltip: {
        trigger: "item",
        formatter: ({ data }: { data: ChartPieItem & { percent?: string } }) =>
          `${data.name}<br/>金额: ${formatCurrency(data.value)}<br/>占比: ${data.percent}%`
      },
      legend: {
        type: "scroll",
        orient: "vertical",
        right: 10,
        top: "center",
        formatter: (name: string) => {
          const item = tableData.value.find(data => data.name === name);
          return item ? `${name} (${item.percent}%)` : name;
        }
      },
      color: generateColors(tableData.value.length),
      series: [
        {
          name: props.title || "数据统计",
          type: "pie",
          radius: isRoseChart ? ["20%", "70%"] : ["40%", "70%"],
          center: ["50%", "50%"],
          roseType: isRoseChart ? "area" : undefined,
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
          label: {
            show: true,
            formatter: ({ percent }: { percent: number }) =>
              `${percent.toFixed(0)}%`,
            position: "inner"
          },
          data: tableData.value
        }
      ],
      graphic: [
        {
          type: "group",
          left: "center",
          top: "50%",
          children: [
            {
              type: "text",
              z: 100,
              style: {
                text: formatCurrency(totalAmount.value),
                fontSize: 20,
                fontWeight: "bold",
                textAlign: "center",
                fill: "#333"
              }
            }
          ]
        }
      ]
    },
    true
  );
}

async function renderChart() {
  if (
    props.loading ||
    props.error ||
    !hasData.value ||
    currentView.value === "table"
  ) {
    disposeChart();
    return;
  }
  await nextTick();
  if (!chartRef.value) return;
  if (!chartInstance) chartInstance = echarts.init(chartRef.value);
  updateChart();
  chartInstance.resize();
}

function handleViewChange(view: "pie" | "rose" | "table") {
  currentView.value = view;
}

function handleResize() {
  chartInstance?.resize();
}

function downloadChart() {
  if (!hasData.value) return;
  if (currentView.value === "table") {
    const csvContent = `data:text/csv;charset=utf-8,名称,金额,占比\n${tableData.value
      .map(row => `${row.name},${row.value},${row.percent}%`)
      .join("\n")}`;
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `${props.title || "数据统计"}.csv`;
    link.click();
    return;
  }
  if (!chartInstance) return;
  const link = document.createElement("a");
  link.download = `${props.title || "数据统计"}.png`;
  link.href = chartInstance.getDataURL({
    pixelRatio: 2,
    backgroundColor: "#fff"
  });
  link.click();
}

watch(
  () => [props.data, props.loading, props.error, currentView.value],
  renderChart,
  { deep: true, immediate: true }
);
onMounted(() => window.addEventListener("resize", handleResize));
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  disposeChart();
});
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 83vh;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
}

.pie-chart,
.table-view,
.chart-state {
  width: 100%;
  height: calc(100% - 60px);
}

.table-view {
  overflow: auto;
}

.chart-state {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
