<template>
  <div class="dashboard-container">
    <!-- 第一行 -->
    <div class="chart-row">
      <div class="chart-wrapper">
        <PieChart
          :data="assetsData"
          title="总资产"
          :radius="['45%', '60%']"
          :colors="['#FFC107', '#4CAF50', '#2196F3']"
        />
      </div>
      <div class="chart-wrapper">
        <PieChart
          :data="liabilitiesData"
          title="总负债"
          :radius="['35%', '50%']"
          :colors="['#F44336', '#9C27B0', '#3F51B5']"
        />
      </div>
    </div>

    <!-- 第二行 -->
    <div class="chart-row">
      <div class="chart-wrapper">
        <LineChart
          title="年度支出趋势"
          :data="expensesData"
          :x-axis-data="['2024-01-01', '2024-12-01']"
          color="#E91E63"
        />
      </div>
      <div class="chart-wrapper">
        <LineChart
          title="年度收入趋势"
          :data="incomeData"
          :x-axis-data="['2024-01-01', '2024-12-01']"
          color="#00BCD4"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import LineChart from "./chart/LineChart.vue";
import PieChart from "//chart/PieChart.vue";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { message } from "@/utils/message";
/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "Dashboard"
});

// 模拟数据
const assetsData = ref([]); // 资产数据
const liabilitiesData = ref([]); // 负债数据
const expensesData = ref([]); // 支出数据
const incomeData = ref([]); // 收入数据
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
});
</script>
<style scoped>
/* 响应式适配 */
@media (width <= 768px) {
  .dashboard-container {
    grid-template-rows: repeat(4, 50vh);
  }

  .chart-row {
    grid-template-rows: repeat(2, 50vh);
    grid-template-columns: 100vw;
  }
}

.dashboard-container {
  display: grid;
  grid-template-rows: 50vh 50vh;
  height: 100vh;
}

.chart-row {
  display: grid;
  grid-template-columns: 50vw 50vw;
}

.chart-wrapper {
  position: relative;
  box-sizing: border-box;
  height: 100%;
  padding: 15px;
}
</style>
