<template>
  <div>
    <page />
  </div>
</template>
<script>
import { defineComponent } from "vue";
import Page from "./page.vue";

export default defineComponent({
  name: "FortuneStatisticsBill", // 组件name最好和菜单表中的router_name一致
  components: { Page }
});
</script>
