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
            @click="$emit('refresh')"
          />
        </el-tooltip>
        <el-tooltip content="下载图表">
          <el-button
            :icon="Download"
            circle
            size="small"
            @click="downloadChart"
          />
        </el-tooltip>
        <el-dropdown @command="handleViewChange">
          <el-button size="small">
            图表视图
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
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

    <div v-show="loading" class="loading">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-show="error" class="error">{{ error }}</div>

    <div
      v-show="!loading && !error && currentView !== 'table'"
      ref="chartRef"
      class="bar-chart"
    />

    <div
      v-if="!loading && !error && currentView === 'table'"
      class="table-view"
    >
      <el-table :data="tableData" border stripe>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="value" label="金额">
          <template #default="scope">
            {{ formatCurrency(scope.row.value) }}
          </template>
        </el-table-column>
        <el-table-column prop="percent" label="占比">
          <template #default="scope"> {{ scope.row.percent }}%</template>
        </el-table-column>
      </el-table>
    </div>

    <div
      v-if="!loading && !error && data.length === 0"
      class="no-data flex justify-center items-center"
    >
      <el-empty description="暂无数据" />
    </div>
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
import { ArrowDown } from "@element-plus/icons-vue";
import { Download, Refresh } from "@element-plus/icons-vue";

interface BarVo {
  name: string;
  value: number;
}

const props = defineProps({
  data: {
    type: Array as PropType<BarVo[]>,
    default: () => []
  },
  title: {
    type: String,
    default: ""
  }
});

const chartRef = ref<HTMLElement | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const currentView = ref<"bar" | "line" | "table">("bar");
let chartInstance: echarts.ECharts | null = null;

// 计算表格数据，添加百分比
const tableData = computed(() => {
  if (!props.data || props.data.length === 0) return [];

  const total = props.data.reduce((sum, item) => sum + item.value, 0);

  return props.data.map(item => ({
    ...item,
    percent: ((item.value / total) * 100).toFixed(2)
  }));
});

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

watch(
  () => props.data,
  async () => {
    await fetchData();
  },
  { deep: true }
);

watch(
  () => currentView.value,
  () => {
    if (currentView.value !== "table") {
      nextTick(() => {
        updateChart();
      });
    }
  }
);

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chartInstance?.dispose();
});

const initChart = () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  updateChart();
  // 添加延时，确保在DOM渲染完成后再触发resize
  setTimeout(() => {
    chartInstance?.resize();
  }, 0);
};

const updateChart = () => {
  if (!chartInstance) return;

  const isLineChart = currentView.value === "line";

  chartInstance.setOption({
    tooltip: {
      trigger: "item",
      formatter: ({ data }: { data: { name: string; value: number } }) =>
        `${data.name}<br/>金额: ${formatCurrency(data.value)}`
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
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
        formatter: (value: number) => {
          if (value >= 10000) {
            return value / 10000 + "万";
          }
          return value;
        }
      }
    },
    series: [
      {
        type: isLineChart ? "line" : "bar",
        data: props.data.map(item => ({
          name: item.name,
          value: item.value
        })),
        itemStyle: isLineChart
          ? {}
          : {
              borderRadius: [5, 5, 0, 0],
              borderColor: "#fff",
              borderWidth: 0
            },
        label: {
          show: true,
          position: isLineChart ? "top" : "top",
          formatter: ({ value }: { value: number }) => formatCurrency(value)
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        // 折线图特有配置
        ...(isLineChart
          ? {
              smooth: true,
              symbolSize: 8,
              lineStyle: {
                width: 3
              }
            }
          : {})
      }
    ]
  });
};

const fetchData = async () => {
  try {
    loading.value = true;
    await nextTick();
    if (!chartInstance) initChart();
    else updateChart();
    loading.value = false;
  } catch (err) {
    error.value = "加载失败";
    loading.value = false;
  }
};

const handleResize = () => chartInstance?.resize();

const handleViewChange = (view: "bar" | "line" | "table") => {
  currentView.value = view;
};

const downloadChart = () => {
  if (!chartInstance) return;

  // 如果是表格视图，则导出表格数据
  if (currentView.value === "table") {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "名称,金额,占比\n" +
      tableData.value
        .map(row => `${row.name},${row.value},${row.percent}%`)
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${props.title || "数据统计"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 导出图表为图片
  const dataURL = chartInstance.getDataURL({
    pixelRatio: 2,
    backgroundColor: "#fff"
  });

  const link = document.createElement("a");
  link.download = `${props.title || "数据统计"}.png`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2
  }).format(value);
};
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

.bar-chart {
  width: 100%;
  height: calc(100% - 60px);
}

.table-view {
  width: 100%;
  height: calc(100% - 60px);
  overflow: auto;
}

.loading,
.error,
.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 60px);
  font-size: 18px;
}

.error {
  color: #f56c6c;
}
</style>
