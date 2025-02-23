<template>
  <div>
    <h1>好记-前端预览</h1>
    <!-- 第一行 -->
    <div class="chart-row">
      <div class="chart-wrapper">
        <TotalAssetsPie />
      </div>
      <div class="chart-wrapper">
        <TotalLiabilitiesPie />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TotalAssetsPie from "./TotalAssetsPie.vue";
import TotalLiabilitiesPie from "./TotalLiabilitiesPie.vue";
defineOptions({
  name: "Welcome"
});
</script>
