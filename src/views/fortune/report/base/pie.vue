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
              <el-dropdown-item command="pie">饼图</el-dropdown-item>
              <el-dropdown-item command="rose">玫瑰图</el-dropdown-item>
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
      class="pie-chart"
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
          <template #default="scope"> {{ scope.row.percent }}% </template>
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

interface PieVo {
  name: string;
  value: number;
  percent?: string;
}

const props = defineProps({
  data: {
    type: Array as PropType<PieVo[]>,
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
const currentView = ref<"pie" | "rose" | "table">("pie");
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

// 计算总金额
const totalAmount = computed(() => {
  if (!props.data || props.data.length === 0) return 0;
  return props.data.reduce((sum, item) => sum + item.value, 0);
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

  const isRoseChart = currentView.value === "rose";
  const chartData = tableData.value;

  const colors = generateColors(chartData.length);

  chartInstance.setOption({
    tooltip: {
      trigger: "item",
      formatter: ({ data }: { data: PieVo }) =>
        `${data.name}<br/>金额: ${formatCurrency(data.value)}<br/>占比: ${
          data.percent
        }%`
    },
    legend: {
      type: "scroll",
      orient: "vertical",
      right: 10,
      top: "center",
      formatter: (name: string) => {
        const item = chartData.find(d => d.name === name);
        if (item) {
          return `${name} (${item.percent}%)`;
        }
        return name;
      }
    },
    color: colors,
    series: [
      {
        name: props.title || "数据统计",
        type: "pie",
        radius: isRoseChart ? ["20%", "70%"] : ["40%", "70%"],
        center: ["40%", "50%"],
        roseType: isRoseChart ? "area" : undefined,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: ({ percent }: { percent: number }) =>
            `${percent.toFixed(0)}%`,
          position: "inner"
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold"
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        data: chartData
      }
    ],
    graphic: [
      {
        type: "group",
        left: "40%",
        top: "50%",
        children: [
          {
            type: "text",
            z: 100,
            left: "center",
            top: "middle",
            style: {
              text: formatCurrency(totalAmount.value),
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
              fill: "#333"
            }
          },
          {
            type: "text",
            z: 100,
            left: "center",
            top: "middle",
            style: {
              text: "总金额",
              fontSize: 14,
              textAlign: "center",
              fill: "#666",
              y: 30
            }
          }
        ]
      }
    ]
  });
};

// 生成渐变色
const generateColors = (count: number) => {
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

  const colors = [];
  for (let i = 0; i < count; i++) {
    const colorPair = baseColors[i % baseColors.length];
    colors.push({
      type: "linear",
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: colorPair[0] },
        { offset: 1, color: colorPair[1] }
      ]
    });
  }

  return colors;
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

const handleViewChange = (view: "pie" | "rose" | "table") => {
  currentView.value = view;
};

const downloadChart = () => {
  if (!chartInstance && currentView.value !== "table") return;

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

.pie-chart {
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
