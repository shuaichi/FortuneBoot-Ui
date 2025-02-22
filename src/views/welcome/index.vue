<template>
  <div>
    <h1>好记-前端预览</h1>
    <div class="chart-container">
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else ref="chartRef" class="pie-chart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";
import { getTotalAssets } from "@/api/fortune/include";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { message } from "@/utils/message";

defineOptions({
  name: "Welcome"
});

const chartRef = ref(null);
const loading = ref(true);
const error = ref(null);
let chartInstance = null;
const groupOptions = ref<Array<GroupVo>>();
const defaultGroup = ref<number>();
const groupId = ref<number>();

onMounted(async () => {
  const [groupRes, defaultGroupId] = await Promise.all([
    getEnableGroupList(),
    getDefaultGroupId()
  ]);
  groupOptions.value = groupRes.data;
  if (groupRes.data.length === 0) {
    message("请先启用或创建分组");
    return;
  }
  defaultGroup.value = defaultGroupId.data
    ? defaultGroupId.data
    : groupOptions.value[0].groupId;
  groupId.value = defaultGroup.value;
  fetchData();
  window.addEventListener("resize", () => chartInstance?.resize());
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
    const res = await getTotalAssets(groupId.value);
    loading.value = false;
    // 计算总值（确保数据结构中包含value字段）
    const totalValue = res.data.reduce(
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
          data: res.data,
          color: generateColors(res.data.length)
        }
      ]
    });
  } catch (err) {
    error.value = "加载失败";
    loading.value = false;
  }
};
// 在<script setup> 中替换原有的colorPalette定义
const generateColors = (count: number) => {
  const colors: string[] = [];
  // 黄金分割色相分布（避免相邻色相似）
  const goldenRatio = 0.618033988749895;

  for (let i = 0; i < count; i++) {
    const hue = (i * goldenRatio * 360) % 360; // 色相均匀分布
    colors.push(
      // 使用固定饱和度和亮度保证颜色一致性
      `hsl(${hue.toFixed(2)}, 70%, 50%)`
    );
  }
  return colors;
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
  height: 600px;
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
