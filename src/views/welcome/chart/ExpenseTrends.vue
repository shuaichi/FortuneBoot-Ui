<template>
  <div class="chart-container">
    <VChart class="chart" :option="chartOptions" :autoresize="true" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { use } from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import {
  ExpenseTrendsQuery,
  getExpenseTrends,
  LineVo
} from "@/api/fortune/include";
import { message } from "@/utils/message";
import moment from "moment/moment";

use([
  SVGRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent
]);

const chartData = ref<Array<LineVo>>([]);
const props = defineProps<{
  bookId: number;
  timePoint: Date;
  timeGranularity: number;
}>();

const expenseTrendsQuery = reactive<ExpenseTrendsQuery>({});
watch(
  () => props.bookId,
  () => {
    onSearch();
  }
);
watch(
  () => props.timeGranularity,
  () => {
    onSearch();
  }
);
watch(
  () => props.timePoint,
  () => {
    onSearch();
  }
);

async function onSearch() {
  expenseTrendsQuery.bookId = props.bookId;
  expenseTrendsQuery.timePoint = moment(props.timePoint).format(
    "yyyy-MM-DD HH:mm:ss"
  );
  expenseTrendsQuery.timeGranularity = props.timeGranularity;
  try {
    const expenseRes = await getExpenseTrends(expenseTrendsQuery);
    chartData.value = expenseRes.data;
  } catch (e) {
    message(e.message || "查询失败", { type: "error" });
  }
}

// 处理原始数据格式
const processedData = computed(() => {
  return chartData.value.map(item => ({
    name: item.name,
    // 处理数字和字符串类型兼容
    value:
      typeof item.value === "string"
        ? parseFloat(item.value.replace(/,/g, ""))
        : item.value // 已经是数字直接使用
  }));
});

const chartOptions = computed(() => ({
  title: {
    text: "支出趋势图",
    left: "center"
  },
  tooltip: {
    trigger: "axis",
    formatter: params => {
      const date = params[0].name;
      const value = params[0].value.toLocaleString("en-US", {
        style: "currency",
        currency: "CNY",
        minimumFractionDigits: 2
      });
      return `${date}<br/>${value}`;
    }
  },
  xAxis: {
    type: "category",
    data: processedData.value.map(item => item.name),
    axisLabel: {
      formatter: value => {
        // 显示为 MM-DD 格式
        return value.split("-").slice(1).join("-");
      }
    }
  },
  yAxis: {
    type: "value",
    axisLabel: {
      formatter: value => {
        return value.toLocaleString("en-US") + "元";
      }
    }
  },
  series: [
    {
      name: "收入",
      type: "line",
      data: processedData.value.map(item => item.value),
      smooth: true,
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              // 渐变底色
              color: "rgba(64, 158, 255, 0.6)"
            },
            {
              offset: 1,
              color: "rgba(64, 158, 255, 0.01)"
            }
          ]
        }
      },
      itemStyle: {
        // 线条颜色
        color: "#409EFF"
      }
    }
  ],
  grid: {
    containLabel: true,
    left: "3%",
    right: "4%",
    bottom: "3%"
  }
}));
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
