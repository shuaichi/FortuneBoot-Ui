<template>
  <BaseChart :option="option" />
</template>
<script setup lang="ts">
import BaseChart from "./BaseChart.vue";
import { computed } from "vue";

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: "总资产"
  },
  radius: {
    type: Array,
    default: () => ["40%", "60%"]
  },
  colors: {
    type: Array,
    default: () => []
  }
});

const totalValue = computed(() =>
  props.data.reduce((sum: number, item: any) => sum + (item.value || 0), 0)
);

const option = computed(() => ({
  graphic: [
    {
      type: "group",
      left: "center",
      top: "center",
      children: [
        {
          type: "text",
          style: {
            text: props.title,
            fontSize: 16,
            fill: "#666"
          },
          left: "center",
          top: "40%"
        },
        {
          type: "text",
          style: {
            text: `¥${totalValue.value.toLocaleString()}`,
            fontSize: 20,
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
      type: "pie",
      radius: props.radius,
      data: props.data,
      color: props.colors,
      label: {
        formatter: "{b|{b}}\n{per|{d}%}",
        rich: {
          b: { fontSize: 12 },
          per: { fontSize: 10, color: "#999" }
        }
      }
    }
  ]
}));
</script>
