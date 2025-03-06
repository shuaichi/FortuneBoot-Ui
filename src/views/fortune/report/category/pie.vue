<template>
  <div class="chart-container">
    <div v-show="loading" class="loading">加载中...</div>
    <div v-show="error" class="error">{{ error }}</div>
    <div ref="chartRef" class="pie-chart" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import * as echarts from "echarts";
import { PieVo } from "@/api/fortune/include";

defineOptions({
  name: "TotalAssetsPie"
});

const chartRef = ref<HTMLElement | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
let chartInstance: echarts.ECharts | null = null;
const props = defineProps<{
  data: PieVo[];
}>();

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
      formatter: ({ data }: { data: PieVo }) =>
        `${data.name}<br/>金额: ￥${data.value}<br/>占比: ${data.percent}%`
    },
    legend: {
      orient: "vertical",
      right: 10,
      top: "center"
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: ({ percent }: { percent: number }) => `${percent}%`,
          position: "inner"
        },
        emphasis: {
          label: { show: true, fontSize: 20 }
        }
      }
    ]
  });
};

const fetchData = async () => {
  try {
    loading.value = true;
    const propData = [...props.data];
    const totalValue = propData.reduce(
      (sum, item) => sum + (item.value || 0),
      0
    );
    await nextTick();
    if (!chartInstance) initChart();
    console.log("propData === ", propData);

    chartInstance?.setOption({
      graphic: [
        {
          type: "group",
          left: "center",
          top: "center",
          children: [
            {
              type: "text",
              style: {
                text: `${formatNumber(totalValue)}元`,
                fontSize: 24,
                fontWeight: "bold",
                fill: "#333"
              }
            }
          ]
        }
      ],
      series: [
        {
          data: propData.map(item => ({
            ...item,
            percent: ((item.value / totalValue) * 100).toFixed(2)
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

const formatNumber = (num: number) => num.toLocaleString("en-US");
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.pie-chart {
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
