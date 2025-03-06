<template>
  <div>
    <page />
  </div>
</template>
<script>
import { defineComponent } from "vue";
import Page from "./page.vue";

export default defineComponent({
  name: "FortunePayeeExpense", // 直接在这里定义 name
  components: { Page }
});
</script>
