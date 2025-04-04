<template>
  <div class="chart-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else ref="chartRef" class="pie-chart" />
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  onBeforeUnmount,
  onUnmounted,
  nextTick,
  watch,
  onMounted
} from "vue";
import * as echarts from "echarts";
import { getTotalLiabilities } from "@/api/fortune/include";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "TotalLiabilitiesPie"
});

const chartRef = ref(null);
const loading = ref(true);
const error = ref(null);
let chartInstance = null;
const props = defineProps<{ groupId: number }>();

// 暴露刷新方法给父组件
const refresh = async () => {
  loading.value = true;
  await fetchData();
};
defineExpose({ refresh });

// 监听groupId变化
watch(
  () => props.groupId,
  async () => {
    await fetchData();
    window.addEventListener("resize", () => chartInstance?.resize());
  }
);

// 组件挂载时初始化数据
onMounted(async () => {
  if (props.groupId) {
    await fetchData();
    window.addEventListener("resize", handleResize);
  }
});
onUnmounted(() => chartInstance?.dispose());
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
      formatter: ({ data }) =>
        `${data.name}<br/>
        金额: ￥${data.value}<br/>
        占比: ${data.percent}%`
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
          formatter: ({ percent }) => `${percent}%`,
          position: "inner"
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20
          }
        },
        color: null,
        data: []
      }
    ]
  });
};
const fetchData = async () => {
  try {
    const res = await getTotalLiabilities(props.groupId);
    loading.value = false;
    const data = res.data.map((item: any) => ({
      value: -item.value,
      name: item.name,
      percent: item.percent
    }));
    // 计算总值（确保数据结构中包含value字段）
    const totalValue = data.reduce(
      (sum: number, item: any) => sum + (item.value || 0),
      0
    );
    await nextTick();
    initChart();
    chartInstance.setOption({
      graphic: [
        {
          // 中心文字容器
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
              },
              left: "center",
              top: "55%"
            }
          ]
        }
      ],
      series: [
        {
          data: data
        }
      ]
    });
  } catch (err) {
    error.value = "加载失败";
    loading.value = false;
  }
};

const handleResize = () => {
  chartInstance?.resize();
};

// 在<script setup>中添加汇总值计算
const formatNumber = (num: number) => {
  return num.toLocaleString("en-US"); // 添加千分位分隔符
};
</script>
<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
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
  color: #666;
}

.error {
  color: #f56c6c;
}
</style>
