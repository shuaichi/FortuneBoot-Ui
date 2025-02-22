<template>
  <BaseChart :option="option" />
</template>
<script setup lang="ts">
import BaseChart from "./BaseChart.vue";
import * as echarts from "echarts";
import { computed } from "vue";

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  xAxisData: {
    type: Array,
    required: true
  },
  color: {
    type: String,
    default: "#5470c6"
  }
});

const option = computed(() => ({
  title: {
    text: props.title,
    left: "center",
    top: 10,
    textStyle: {
      fontSize: 16,
      fontWeight: "normal"
    }
  },
  tooltip: {
    trigger: "axis",
    formatter: (params: any) => {
      const date = params[0].name;
      const value = params[0].value;
      return `${date}<br/>${props.title}: ¥${value.toLocaleString()}`;
    }
  },
  grid: {
    top: 60,
    bottom: 30,
    left: 40,
    right: 20
  },
  xAxis: {
    type: "category",
    data: props.xAxisData,
    axisLabel: {
      formatter: (value: string) => value.slice(5), // 显示MM-DD
      color: "#666"
    },
    axisLine: {
      lineStyle: {
        color: "#ddd"
      }
    }
  },
  yAxis: {
    type: "value",
    axisLabel: {
      formatter: (value: number) => `¥${(value / 1000).toFixed(0)}k`,
      color: "#666"
    },
    splitLine: {
      lineStyle: {
        color: "#eee"
      }
    }
  },
  series: [
    {
      data: props.data,
      type: "line",
      smooth: true,
      lineStyle: {
        width: 3,
        color: props.color
      },
      itemStyle: {
        color: props.color
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${props.color}40` },
          { offset: 1, color: `${props.color}10` }
        ])
      }
    }
  ]
}));
</script>
