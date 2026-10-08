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
            :disabled="!hasData || !showAmount"
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
              <el-dropdown-item command="bar">柱状图</el-dropdown-item>
              <el-dropdown-item command="line">折线图</el-dropdown-item>
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
    <div v-else ref="chartRef" class="bar-chart" />
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
import {
  EXPENSE_COLOR,
  INCOME_COLOR
} from "@/views/fortune/statistics/base/constants";

interface BarVo {
  name: string;
  value: number;
}

const props = withDefaults(
  defineProps<{
    data: BarVo[];
    title?: string;
    currency?: string;
    loading?: boolean;
    error?: boolean;
    semantic?: "expense" | "income" | "neutral";
    showAmount?: boolean;
  }>(),
  {
    title: "",
    currency: "CNY",
    loading: false,
    error: false,
    semantic: "neutral",
    showAmount: true
  }
);
const emit = defineEmits<{ refresh: [] }>();
const chartRef = ref<HTMLElement | null>(null);
const currentView = ref<"bar" | "line" | "table">("bar");
let chartInstance: echarts.ECharts | null = null;

const hasData = computed(() => props.data.length > 0);
const tableData = computed(() => {
  const total = sumBy(props.data, "value");
  return props.data.map(item => ({
    ...item,
    percent: total ? ((item.value / total) * 100).toFixed(2) : "0.00"
  }));
});

const chartColor = computed(() => {
  if (props.semantic === "expense") return EXPENSE_COLOR;
  if (props.semantic === "income") return INCOME_COLOR;
  return "#4169E1";
});

function formatCurrency(value: number) {
  if (!props.showAmount) return "****";
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
  const isLineChart = currentView.value === "line";
  chartInstance.setOption(
    {
      tooltip: {
        trigger: "item",
        formatter: ({ data }: { data: BarVo }) =>
          `${data.name}<br/>金额: ${formatCurrency(data.value)}`
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        data: props.data.map(item => item.name),
        axisLabel: { interval: 0, rotate: props.data.length > 10 ? 45 : 0 }
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
          type: isLineChart ? "line" : "bar",
          data: props.data,
          itemStyle: {
            color: chartColor.value,
            borderRadius: [5, 5, 0, 0]
          },
          lineStyle: isLineChart
            ? { color: chartColor.value, width: 2 }
            : undefined,
          label: {
            show: true,
            position: "top",
            formatter: ({ value }: { value: number }) => formatCurrency(value)
          },
          ...(isLineChart
            ? { smooth: true, symbolSize: 8, areaStyle: { opacity: 0.3 } }
            : {})
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

function handleViewChange(view: "bar" | "line" | "table") {
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
  () => [
    props.data,
    props.loading,
    props.error,
    props.semantic,
    props.showAmount,
    currentView.value
  ],
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

.bar-chart,
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
