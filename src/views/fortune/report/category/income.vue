<template>
  <div>
    <category />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import Category from "@/views/fortune/report/category/category.vue";

export default defineComponent({
  name: "FortuneCategoryIncome", // 直接在这里定义 name
  components: { Category }
});
</script>
