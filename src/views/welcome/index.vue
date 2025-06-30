<template>
  <div class="dashboard-container">
    <!-- 顶部过滤器区域 -->
    <div class="filter-container">
      <div class="filter-title">
        <el-icon>
          <DataAnalysis />
        </el-icon>
        <span>财富仪表盘</span>
      </div>
      <el-form
        ref="formRef"
        :inline="true"
        :model="searchForm"
        class="search-form"
      >
        <el-form-item label="所属分组">
          <el-select
            v-model="searchForm.groupId"
            placeholder="请选择分组"
            class="filter-select"
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
        <el-form-item label="所属账本">
          <el-select
            v-model="searchForm.bookId"
            placeholder="请选择账本"
            class="filter-select"
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

    <!-- 资产概览卡片 -->
    <div class="summary-cards">
      <el-card class="summary-card assets-card">
        <div class="summary-icon">
          <el-icon>
            <Wallet />
          </el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">总资产</div>
          <div class="summary-value">
            <span v-if="showAssets">
              {{ formatCurrency(assetsLiabilities.totalAssets) }}
            </span>
            <el-icon @click="toggleShowAssets">
              <View />
            </el-icon>
          </div>
        </div>
      </el-card>

      <el-card class="summary-card liabilities-card">
        <div class="summary-icon">
          <el-icon>
            <Money />
          </el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">总负债</div>
          <div class="summary-value">
            <span v-if="showLiabilities">
              {{ formatCurrency(assetsLiabilities.totalLiabilities) }}
            </span>
            <el-icon @click="toggleShowLiabilities">
              <View />
            </el-icon>
          </div>
        </div>
      </el-card>

      <el-card class="summary-card net-assets-card">
        <div class="summary-icon">
          <el-icon>
            <TrendCharts />
          </el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">净资产</div>
          <div class="summary-value">
            <span v-if="showNetAssets">
              {{ formatCurrency(assetsLiabilities.netAssets) }}
            </span>
            <el-icon @click="toggleShowNetAssets">
              <View />
            </el-icon>
          </div>
        </div>
      </el-card>
    </div>
    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 总收入饼图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <div class="chart-title">
              <el-icon>
                <PieChart />
              </el-icon>
              <span>资产账户</span>
              <el-icon @click="toggleShowAssetsChart">
                <View />
              </el-icon>
            </div>
            <el-tooltip content="刷新数据">
              <el-button
                :icon="Refresh"
                circle
                size="small"
                @click="refreshAssetsPie"
              />
            </el-tooltip>
          </div>
        </template>
        <div class="chart-content">
          <div v-if="loading" class="chart-loading">
            <el-skeleton :rows="6" animated />
          </div>
          <div v-else-if="!hasData" class="chart-empty">
            <el-empty description="暂无数据" />
          </div>
          <TotalAssetsPie
            ref="assetsPieRef"
            v-if="showAssetsChart"
            :group-id="searchForm.groupId"
          />
        </div>
      </el-card>

      <!-- 总支出饼图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <div class="chart-title">
              <el-icon>
                <PieChart />
              </el-icon>
              <span>负债账户</span>
              <el-icon @click="toggleShowLiabilitiesChart">
                <View />
              </el-icon>
            </div>
            <el-tooltip content="刷新数据">
              <el-button
                :icon="Refresh"
                circle
                size="small"
                @click="refreshLiabilitiesPie"
              />
            </el-tooltip>
          </div>
        </template>
        <div class="chart-content">
          <div v-if="loading" class="chart-loading">
            <el-skeleton :rows="6" animated />
          </div>
          <div v-else-if="!hasData" class="chart-empty">
            <el-empty description="暂无数据" />
          </div>
          <TotalLiabilitiesPie
            ref="liabilitiesPieRef"
            v-if="showLiabilitiesChart"
            :group-id="searchForm.groupId"
          />
        </div>
      </el-card>

      <!-- 支出趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <div class="chart-title">
              <el-icon>
                <TrendCharts />
              </el-icon>
              <span>支出趋势</span>
            </div>
            <div class="chart-controls">
              <el-date-picker
                v-model="expenseSearchForm.timePoint"
                type="date"
                placeholder="选择日期"
                size="small"
              />
              <el-radio-group
                v-model="expenseSearchForm.timeGranularity"
                size="small"
              >
                <el-radio-button :label="1">周</el-radio-button>
                <el-radio-button :label="2">月</el-radio-button>
                <el-radio-button :label="3">年</el-radio-button>
                <el-radio-button :label="4">全部</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>
        <div class="chart-content">
          <div v-if="loading" class="chart-loading">
            <el-skeleton :rows="6" animated />
          </div>
          <div v-else-if="!hasData" class="chart-empty">
            <el-empty description="暂无数据" />
          </div>
          <ExpenseTrends
            ref="expenseTrendsRef"
            v-else
            :book-id="searchForm.bookId"
            :time-granularity="expenseSearchForm.timeGranularity"
            :time-point="expenseSearchForm.timePoint"
          />
        </div>
      </el-card>

      <!-- 收入趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <div class="chart-title">
              <el-icon>
                <TrendCharts />
              </el-icon>
              <span>收入趋势</span>
            </div>
            <div class="chart-controls">
              <el-date-picker
                v-model="incomeSearchForm.timePoint"
                type="date"
                placeholder="选择日期"
                size="small"
              />
              <el-radio-group
                v-model="incomeSearchForm.timeGranularity"
                size="small"
              >
                <el-radio-button :label="1">周</el-radio-button>
                <el-radio-button :label="2">月</el-radio-button>
                <el-radio-button :label="3">年</el-radio-button>
                <el-radio-button :label="4">全部</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>
        <div class="chart-content">
          <div v-if="loading" class="chart-loading">
            <el-skeleton :rows="6" animated />
          </div>
          <div v-else-if="!hasData" class="chart-empty">
            <el-empty description="暂无数据" />
          </div>
          <IncomeTrends
            ref="incomeTrendsRef"
            v-else
            :book-id="searchForm.bookId"
            :time-granularity="incomeSearchForm.timeGranularity"
            :time-point="incomeSearchForm.timePoint"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import TotalLiabilitiesPie from "./chart/TotalLiabilitiesPie.vue";
import TotalAssetsPie from "./chart/TotalAssetsPie.vue";
import ExpenseTrends from "./chart/ExpenseTrends.vue";
import IncomeTrends from "@/views/welcome/chart/IncomeTrends.vue";
import { onMounted, reactive, ref, watch, computed } from "vue";
import {
  AssetsLiabilitiesVo,
  BaseQuery,
  ExpenseTrendsQuery,
  getAssetsLiabilities,
  IncomeTrendsQuery,
  getDisplayConfig
} from "@/api/fortune/include";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { message } from "@/utils/message";
import { BookVo, getEnableBookList } from "@/api/fortune/book";
import {
  Refresh,
  DataAnalysis,
  Wallet,
  Money,
  TrendCharts,
  PieChart,
  View
} from "@element-plus/icons-vue";

defineOptions({
  name: "Welcome"
});

const searchForm = reactive<BaseQuery>({ groupId: 0, bookId: 0 });
const groupOptions = ref<Array<GroupVo>>([]);
const bookOptions = ref<Array<BookVo>>([]);
const assetsLiabilities = ref<AssetsLiabilitiesVo>({
  totalAssets: 0,
  totalLiabilities: 0,
  netAssets: 0
});
const incomeSearchForm = reactive<IncomeTrendsQuery>({
  timeGranularity: 2, // 默认显示月视图
  timePoint: new Date()
});
const expenseSearchForm = reactive<ExpenseTrendsQuery>({
  timeGranularity: 2, // 默认显示月视图
  timePoint: new Date()
});

// 新增状态
const loading = ref(true);
// 修改判断条件，只要不是初始加载状态就显示图表
const hasData = computed(() => {
  return !loading.value;
});

// 格式化货币
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2
  }).format(value);
};

// 图表组件引用
const assetsPieRef = ref(null);
const liabilitiesPieRef = ref(null);
const expenseTrendsRef = ref(null);
const incomeTrendsRef = ref(null);

// 全局缓存显示配置
let cachedDisplayConfig = null;

// 新增控制显示隐藏的变量
const showAssets = ref(false);
const showLiabilities = ref(false);
const showNetAssets = ref(false);

// 新增控制图表显示隐藏的变量
const showAssetsChart = ref(false);
const showLiabilitiesChart = ref(false);

// 新增切换图表显示隐藏的方法
const toggleShowAssetsChart = () => {
  showAssetsChart.value = !showAssetsChart.value;
};
const toggleShowLiabilitiesChart = () => {
  showLiabilitiesChart.value = !showLiabilitiesChart.value;
};

// 新增切换显示隐藏的方法
const toggleShowAssets = () => {
  showAssets.value = !showAssets.value;
};
const toggleShowLiabilities = () => {
  showLiabilities.value = !showLiabilities.value;
};
const toggleShowNetAssets = () => {
  showNetAssets.value = !showNetAssets.value;
};

// 刷新总收入图表
const refreshAssetsPie = async () => {
  if (assetsPieRef.value) {
    await assetsPieRef.value.refresh();
  }
};

// 刷新总支出图表
const refreshLiabilitiesPie = async () => {
  if (liabilitiesPieRef.value) {
    await liabilitiesPieRef.value.refresh();
  }
};

// 加载数据
const loadData = async () => {
  try {
    // 计算资产负债
    if (searchForm.groupId) {
      const res = await getAssetsLiabilities(searchForm.groupId);
      assetsLiabilities.value = res.data;
    }
  } catch (error) {
    console.error("加载数据失败", error);
    message("加载数据失败，请稍后重试", { type: "error" });
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    const [groupRes, defaultGroupId] = await Promise.all([
      getEnableGroupList(),
      getDefaultGroupId()
    ]);

    groupOptions.value = groupRes.data || [];

    if (groupOptions.value.length === 0) {
      message("请先启用或创建分组", { type: "warning" });
      loading.value = false;
      return;
    }

    searchForm.groupId = defaultGroupId.data
      ? defaultGroupId.data
      : groupOptions.value[0].groupId;

    const bookRes = await getEnableBookList(searchForm.groupId);
    bookOptions.value = bookRes.data || [];

    if (bookOptions.value.length === 0) {
      message("请先启用或创建账本", { type: "warning" });
      loading.value = false;
      return;
    }

    const currentGroup = groupOptions.value.find(
      group => group.groupId === searchForm.groupId
    );

    searchForm.bookId =
      currentGroup?.defaultBookId || bookOptions.value[0].bookId;

    // 初始化搜索表单
    incomeSearchForm.bookId = searchForm.bookId;
    incomeSearchForm.groupId = searchForm.groupId;
    expenseSearchForm.bookId = searchForm.bookId;
    expenseSearchForm.groupId = searchForm.groupId;

    // 加载资产负债数据
    await loadData();

    // 获取显示配置
    if (!cachedDisplayConfig) {
      const configRes = await getDisplayConfig();
      cachedDisplayConfig = JSON.parse(String(configRes.data));
    }
    // 设置默认显示状态
    showAssets.value = cachedDisplayConfig;
    showLiabilities.value = cachedDisplayConfig;
    showNetAssets.value = cachedDisplayConfig;
    showAssetsChart.value = cachedDisplayConfig;
    showLiabilitiesChart.value = cachedDisplayConfig;
    // 手动触发一次趋势图表的数据更新
    // 这里模拟点击了一下时间粒度按钮，强制触发图表更新
    const currentIncomeGranularity = incomeSearchForm.timeGranularity;
    const currentExpenseGranularity = expenseSearchForm.timeGranularity;

    // 临时改变值再改回来，触发watch
    incomeSearchForm.timeGranularity = currentIncomeGranularity === 1 ? 2 : 1;
    expenseSearchForm.timeGranularity = currentExpenseGranularity === 1 ? 2 : 1;

    // 使用setTimeout确保DOM更新后再改回原值
    setTimeout(() => {
      incomeSearchForm.timeGranularity = currentIncomeGranularity;
      expenseSearchForm.timeGranularity = currentExpenseGranularity;
    }, 100);
  } catch (error) {
    console.error("初始化失败", error);
    message("初始化失败，请刷新页面重试", { type: "error" });
  } finally {
    loading.value = false;
  }
});

watch(
  () => searchForm.groupId,
  async newGroupId => {
    if (!newGroupId) return;

    loading.value = true;
    try {
      const bookRes = await getEnableBookList(newGroupId);
      bookOptions.value = bookRes.data || [];

      if (bookOptions.value.length === 0) {
        message("请先启用或创建账本", { type: "warning" });
        return;
      }

      const currentGroup = groupOptions.value.find(
        group => group.groupId === newGroupId
      );
      searchForm.bookId =
        currentGroup?.defaultBookId || bookOptions.value[0].bookId;

      // 更新搜索表单
      incomeSearchForm.groupId = newGroupId;
      expenseSearchForm.groupId = newGroupId;

      // 重新加载数据
      await loadData();
      await refreshAssetsPie();
      await refreshLiabilitiesPie();
    } catch (error) {
      console.error("切换分组失败", error);
      message("切换分组失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }
);

watch(
  () => searchForm.bookId,
  async newBookId => {
    if (!newBookId) {
      return;
    }
    // 更新搜索表单
    incomeSearchForm.groupId = searchForm.groupId;
    expenseSearchForm.groupId = searchForm.groupId;
  }
);
</script>

<style scoped lang="scss">
/* 响应式布局 */
@media (width <= 1200px) {
  .charts-container {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: minmax(300px, auto);
  }
}

@media (width <= 768px) {
  .filter-container {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100vh;
  min-height: 600px;
  padding: 16px;
  background-color: #f5f7fa;
}

/* 过滤器区域样式 */
.filter-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);

  .filter-title {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: #303133;

    .el-icon {
      font-size: 20px;
      color: #409eff;
    }
  }

  .search-form {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .filter-select {
    width: 200px;
  }
}

/* 资产概览卡片样式 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  .summary-card {
    display: flex;
    align-items: center;
    padding: 20px;
    border-radius: 8px;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    .summary-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      margin-right: 16px;
      border-radius: 50%;

      .el-icon {
        font-size: 24px;
        color: #fff;
      }
    }

    .summary-content {
      flex: 1;

      .summary-label {
        margin-bottom: 8px;
        font-size: 14px;
        color: #909399;
      }

      .summary-value {
        font-size: 24px;
        font-weight: 600;
      }
    }
  }

  .assets-card {
    .summary-icon {
      background-color: #67c23a;
    }

    .summary-value {
      color: #67c23a;
    }

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
    }
  }

  .liabilities-card {
    .summary-icon {
      background-color: #f56c6c;
    }

    .summary-value {
      color: #f56c6c;
    }

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
    }
  }

  .net-assets-card {
    .summary-icon {
      background-color: #409eff;
    }

    .summary-value {
      color: #409eff;
    }

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
    }
  }
}

/* 图表区域样式 */
.charts-container {
  display: grid;
  flex: 1;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  min-height: 900px;

  .chart-card {
    height: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: 0 4px 20px 0 rgb(0 0 0 / 10%);
    }

    :deep(.el-card__body) {
      height: calc(100% - 60px);
      padding: 0;
    }
  }

  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;

    .chart-title {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 16px;
      font-weight: 600;

      .el-icon {
        color: #409eff;
      }
    }

    .chart-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .chart-content {
    height: 100%;
    padding: 16px;
  }

  .chart-loading,
  .chart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}
</style>
