<template>
  <div class="dashboard-container">
    <div style="padding: 16px">
      <el-form
        ref="formRef"
        :inline="true"
        :model="searchForm"
        class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
      >
        <el-form-item label="所属分组：" prop="groupId">
          <el-select
            v-model="searchForm.groupId"
            placeholder="请选择分组"
            class="!w-[200px]"
            filterable
          >
            <el-option
              v-for="item in groupOptions"
              :key="item.groupId"
              :label="item.groupName"
              :value="item.groupId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属账本：" prop="bookId">
          <el-select
            v-model="searchForm.bookId"
            placeholder="请选择账本"
            class="!w-[200px]"
            filterable
          >
            <el-option
              v-for="item in bookOptions"
              :key="item.bookId"
              :label="item.bookName"
              :value="item.bookId"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="dashboard-header">
      <el-card style="max-width: 100%">
        <p>总资产：{{ assetsLiabilities.totalAssets }}</p>
      </el-card>
      <el-card style="max-width: 100%">
        <p>总负债：{{ assetsLiabilities.totalLiabilities }}</p>
      </el-card>
      <el-card style="max-width: 100%">
        <p>净资产：{{ assetsLiabilities.netAssets }}</p>
      </el-card>
    </div>
    <div class="dashboard-body">
      <el-card style="height: 100%">
        <template #header>
          <div class="card-header">
            <span>总收入</span>
          </div>
        </template>
        <TotalAssetsPie :group-id="searchForm.groupId" />
      </el-card>
      <el-card style="height: 100%">
        <template #header>
          <div class="card-header">
            <span>总支出</span>
          </div>
        </template>
        <TotalLiabilitiesPie :group-id="searchForm.groupId" />
      </el-card>
      <el-card style="height: 100%">
        <template #header>
          <div
            class="card-header"
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <span>支出趋势</span>
            <div style="display: flex; gap: 10px; align-items: center">
              <el-date-picker
                v-model="expenseSearchForm.timePoint"
                type="date"
                placeholder="选择日期"
                style="width: 150px; margin-right: 10px"
              />
              <el-radio-group
                v-model="expenseSearchForm.timeGranularity"
                class="full-width-group"
              >
                <el-radio-button :label="1"> 周</el-radio-button>
                <el-radio-button :label="2"> 月</el-radio-button>
                <el-radio-button :label="3"> 年</el-radio-button>
                <el-radio-button :label="4"> 全部</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>
        <ExpenseTrends
          :book-id="searchForm.bookId"
          :time-granularity="expenseSearchForm.timeGranularity"
          :time-point="expenseSearchForm.timePoint"
        />
      </el-card>
      <el-card style="height: 100%">
        <template #header>
          <div
            class="card-header"
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <span>收入趋势</span>
            <div style="display: flex; gap: 10px; align-items: center">
              <el-date-picker
                v-model="incomeSearchForm.timePoint"
                type="date"
                placeholder="选择日期"
                style="width: 150px; margin-right: 10px"
              />
              <!-- 所有按钮添加相同样式 -->
              <el-radio-group
                v-model="incomeSearchForm.timeGranularity"
                class="full-width-group"
              >
                <el-radio-button :label="1"> 周</el-radio-button>
                <el-radio-button :label="2"> 月</el-radio-button>
                <el-radio-button :label="3"> 年</el-radio-button>
                <el-radio-button :label="4"> 全部</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>
        <IncomeTrends
          :book-id="searchForm.bookId"
          :time-granularity="incomeSearchForm.timeGranularity"
          :time-point="incomeSearchForm.timePoint"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import TotalLiabilitiesPie from "./chart/TotalLiabilitiesPie.vue";
import TotalAssetsPie from "./chart/TotalAssetsPie.vue";
import ExpenseTrends from "./chart/ExpenseTrends.vue";
import IncomeTrends from "@/views/welcome/chart/IncomeTrends.vue";
import { onMounted, reactive, ref, watch } from "vue";
import {
  AssetsLiabilitiesVo,
  BaseQuery,
  ExpenseTrendsQuery,
  getAssetsLiabilities,
  IncomeTrendsQuery
} from "@/api/fortune/include";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { message } from "@/utils/message";
import { BookVo, getEnableBookList } from "@/api/fortune/book";

defineOptions({
  name: "Welcome"
});

const searchForm = reactive<BaseQuery>({});
const groupOptions = ref<Array<GroupVo>>();
const bookOptions = ref<Array<BookVo>>();
const assetsLiabilities = ref<AssetsLiabilitiesVo>({
  totalAssets: 0,
  totalLiabilities: 0,
  netAssets: 0
});
const incomeSearchForm = reactive<IncomeTrendsQuery>({
  timeGranularity: 1,
  timePoint: new Date()
});
const expenseSearchForm = reactive<ExpenseTrendsQuery>({
  timeGranularity: 1,
  timePoint: new Date()
});

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
  searchForm.groupId = defaultGroupId.data
    ? defaultGroupId.data
    : groupOptions.value[0].groupId;
  const bookRes = await getEnableBookList(searchForm.groupId);
  if (bookRes.data.length === 0) {
    message("请先启用或创建账本");
    return;
  }
  bookOptions.value = bookRes.data;
  searchForm.bookId = groupOptions.value.find(
    group => group.groupId === groupId.value
  ).defaultBookId;
});
watch(
  () => searchForm.groupId,
  async () => {
    const bookRes = await getEnableBookList(searchForm.groupId);
    if (bookRes.data.length === 0) {
      message("请先启用或创建账本");
      return;
    }
    bookOptions.value = bookRes.data;
    searchForm.bookId = groupOptions.value.find(
      group => group.groupId === groupId.value
    ).defaultBookId;
    // 计算资产负债
    const res = await getAssetsLiabilities(searchForm.groupId);
    assetsLiabilities.value = res.data;
  }
);
watch(
  () => searchForm.bookId,
  async () => {
    incomeSearchForm.bookId = searchForm.bookId;
    incomeSearchForm.groupId = searchForm.groupId;
    expenseSearchForm.bookId = searchForm.bookId;
    expenseSearchForm.groupId = searchForm.groupId;
  }
);
</script>

<style scoped lang="scss">
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 600px;

  .dashboard-header {
    display: grid;
    // 固定高度
    flex: 0 0 50px;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 16px;
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
