<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  option: {
    type: Object,
    required: true
  },
  theme: {
    type: String,
    default: "light"
  }
});

const chartEl = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

// 初始化图表
const initChart = () => {
  if (!chartEl.value) return;
  chartInstance = echarts.init(chartEl.value, props.theme);
  chartInstance.setOption(props.option);
};

// 响应式更新
watch(
  () => props.option,
  newVal => {
    chartInstance?.setOption(newVal);
  },
  { deep: true }
);

// 窗口自适应
const resizeHandler = () => chartInstance?.resize();
onMounted(() => {
  initChart();
  window.addEventListener("resize", resizeHandler);
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeHandler);
  chartInstance?.dispose();
});
</script>

<template>
  <div ref="chartEl" class="h-full w-full" />
</template>
