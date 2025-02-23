<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <!--    TODO 放这里-->
    </div>
    <div class="dashboard-body">
      <el-card style="height: 100%">
        <template #header>
          <div class="card-header">
            <span>总收入</span>
          </div>
        </template>
        <TotalAssetsPie />
      </el-card>
      <el-card style="height: 100%">
        <template #header>
          <div class="card-header">
            <span>总支出</span>
          </div>
        </template>
        <TotalLiabilitiesPie />
      </el-card>
      <el-card style="height: 100%">
        <template #header>
          <div class="card-header">
            <span>支出趋势</span>
          </div>
        </template>
        <ExpenseTrends />
      </el-card>
      <el-card style="height: 100%">
        <template #header>
          <div class="card-header">
            <span>收入趋势</span>
          </div>
        </template>
        <IncomeTrends />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import TotalLiabilitiesPie from "./chart/TotalLiabilitiesPie.vue";
import TotalAssetsPie from "./chart/TotalAssetsPie.vue";
import ExpenseTrends from "./chart/ExpenseTrends.vue";
import IncomeTrends from "@/views/welcome/chart/IncomeTrends.vue";

defineOptions({
  name: "Welcome"
});
</script>

<style scoped lang="scss">
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 600px;

  .dashboard-header {
    flex: 0 0 100px; // 固定高度
  }

  .dashboard-body {
    display: grid;
    flex: 1;
    grid-template-rows: repeat(2, 1fr); // 固定2行
    grid-template-columns: repeat(2, 1fr); // 固定2列
    gap: 16px;
    min-height: 400px; // 保证最小可显示高度
    padding: 16px;

    // 保持2x2布局的响应式处理
    @media (width <= 1200px) {
      grid-template-columns: repeat(2, minmax(400px, 1fr));
      overflow: auto; // 小屏幕允许滚动
    }

    @media (width <= 900px) {
      grid-template-columns: 1fr;
      grid-auto-rows: minmax(300px, 1fr);

      > * {
        grid-column: span 1; // 强制单列时仍保持2x2结构
        &:nth-child(n + 3) {
          display: none; // 小屏只显示前两个
        }
      }
    }

    .el-card {
      height: 100%;

      :deep(.el-card__body) {
        height: calc(100% - 57px);
        overflow: auto;
      }
    }
  }
}
</style>
