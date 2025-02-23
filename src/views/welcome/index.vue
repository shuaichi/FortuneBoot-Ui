<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <!--    TODO 放这里-->
    </div>
    <div class="dashboard-body">
      <el-card style="height: 480px">
        <template #header>
          <div class="card-header">
            <span>总收入</span>
          </div>
        </template>
        <TotalAssetsPie />
      </el-card>
      <el-card style="height: 480px">
        <template #header>
          <div class="card-header">
            <span>总支出</span>
          </div>
        </template>
        <TotalLiabilitiesPie />
      </el-card>
      <el-card style="height: 480px">
        <template #header>
          <div class="card-header">
            <span>Card name</span>
          </div>
        </template>
        <TotalLiabilitiesPie />
      </el-card>
      <el-card style="height: 480px">
        <template #header>
          <div class="card-header">
            <span>Card name</span>
          </div>
        </template>
        <TotalLiabilitiesPie />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import TotalLiabilitiesPie from "./TotalLiabilitiesPie.vue";
import TotalAssetsPie from "@/views/welcome/TotalAssetsPie.vue";

defineOptions({
  name: "Welcome"
});
</script>

<style scoped lang="scss">
.dashboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 132px);
  overflow: hidden;
  text-align: center;

  .dashboard-header {
    z-index: 2;
    width: 100%;
    height: 200px;
  }

  .dashboard-body {
    display: grid;
    grid-template-rows: repeat(2, 1fr); // 2行等高
    grid-template-columns: repeat(2, 1fr); // 2列等宽
    gap: 10px; // 网格间隙
    width: 100%;
    height: calc(100vh - 332px);
    padding: 10px; // 容器内边距
    overflow: hidden; // 重要：隐藏溢出内容
    background: #f0f0f0;
  }
}
</style>
