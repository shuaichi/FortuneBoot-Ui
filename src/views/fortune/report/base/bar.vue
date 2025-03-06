<template>
  <div class="chart-container">
    <div v-show="loading" class="loading">加载中...</div>
    <div v-show="error" class="error">{{ error }}</div>
    <div ref="chartRef" class="bar-chart" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import * as echarts from "echarts";
import { BarVo } from "@/api/fortune/include";

const chartRef = ref<HTMLElement | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
let chartInstance: echarts.ECharts | null = null;
const props = defineProps({
  data: {
    type: Array as PropType<BarVo[]>,
    default: () => []
  }
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
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chartInstance?.dispose();
});
const initChart = () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption({
    tooltip: {
      trigger: "item",
      // 直接通过 data.name 和 data.value 访问
      formatter: ({ data }: { data: { name: string; value: number } }) =>
        `对象：${data.name}<br/>金额: ${data.value}`
    },
    xAxis: {
      type: "category",
      data: []
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        type: "bar",
        itemStyle: {
          borderRadius: [5, 5, 0, 0],
          borderColor: "#fff",
          borderWidth: 0
        },
        label: {
          show: true,
          position: "top",
          formatter: ({ value }: { value: number }) => `￥${value}`
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ]
  });
};

const fetchData = async () => {
  try {
    loading.value = true;
    const propData = [...props.data];
    await nextTick();
    if (!chartInstance) initChart();

    chartInstance?.setOption({
      xAxis: {
        data: propData.map(item => item.name)
      },
      series: [
        {
          // 确保 data 包含 name 和 value
          data: propData.map(item => ({
            name: item.name,
            value: item.value
          }))
        }
      ]
    });
    loading.value = false;
  } catch (err) {
    error.value = "加载失败";
    loading.value = false;
  }
};

const handleResize = () => chartInstance?.resize();
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 83vh;
}

.bar-chart {
  width: 100%;
  height: 100%;
}

.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 18px;
}

.error {
  color: #f56c6c;
}
</style>
