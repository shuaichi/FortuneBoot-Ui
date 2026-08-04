<template>
  <div class="statistics-page">
    <!-- 顶部筛选 -->
    <el-card class="statistics-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="所属分组">
          <el-select
            v-model="filterForm.groupId"
            placeholder="请选择分组"
            class="filter-select"
            filterable
            @change="onGroupChange"
          >
            <el-option
              v-for="item in groupOptions"
              :key="item.groupId"
              :label="item.groupName"
              :value="item.groupId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="净资产趋势">
          <el-radio-group
            v-model="trendGranularity"
            @change="loadNetAssetsTrend"
          >
            <el-radio-button
              v-for="item in trendGranularityOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 资产负债总览 -->
    <div class="summary-cards">
      <summary-card
        label="总资产"
        :value="assetsLiabilities.totalAssets"
        :icon="Wallet"
        accent="#67c23a"
        :currency="currentCurrency"
      />
      <summary-card
        label="总负债"
        :value="assetsLiabilities.totalLiabilities"
        :icon="Money"
        accent="#f56c6c"
        :currency="currentCurrency"
      />
      <summary-card
        label="净资产"
        :value="assetsLiabilities.netAssets"
        :icon="TrendCharts"
        accent="#409eff"
        :currency="currentCurrency"
      />
    </div>

    <!-- 净资产趋势 -->
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header"><span>净资产趋势</span></div>
      </template>
      <div class="chart-box">
        <trend-chart
          :data="netAssetsTrend"
          :loading="trendLoading"
          :currency="currentCurrency"
        />
      </div>
    </el-card>

    <!-- 账户类型资产分布 -->
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header"><span>账户类型资产分布</span></div>
      </template>
      <pure-table
        :data="accountTypeAssets"
        border
        stripe
        :loading="typeLoading"
        align-whole="center"
      >
        <el-table-column label="账户类型" prop="accountTypeName" />
        <el-table-column label="资产">
          <template #default="{ row }">{{
            formatCurrency(row.assets)
          }}</template>
        </el-table-column>
        <el-table-column label="负债">
          <template #default="{ row }">
            {{ formatCurrency(row.liabilities) }}
          </template>
        </el-table-column>
        <el-table-column label="账户数" prop="accountCount" />
      </pure-table>
    </el-card>

    <!-- 信用卡看板 -->
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header"><span>信用卡额度看板</span></div>
      </template>
      <div v-if="creditCards.length === 0" class="empty-box">
        <el-empty description="暂无信用卡账户" />
      </div>
      <div v-else class="credit-cards">
        <div
          v-for="card in creditCards"
          :key="card.accountId"
          class="credit-card"
        >
          <div class="credit-card__name">{{ card.accountName }}</div>
          <el-progress
            :percentage="Math.min(Number(card.usageRate) || 0, 100)"
            :color="progressColor(card.usageRate)"
          />
          <div class="credit-card__detail">
            <span>额度 {{ formatCurrency(card.creditLimit) }}</span>
            <span>已用 {{ formatCurrency(card.usedAmount) }}</span>
            <span>剩余 {{ formatCurrency(card.available) }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 账户余额趋势 -->
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header">
          <span>账户余额趋势</span>
          <el-select
            v-model="selectedAccountId"
            placeholder="请选择账户"
            class="filter-select"
            filterable
            @change="loadBalanceTrend"
          >
            <el-option
              v-for="item in accountOptions"
              :key="item.accountId"
              :label="item.accountName"
              :value="item.accountId"
            />
          </el-select>
        </div>
      </template>
      <div class="chart-box">
        <trend-chart
          :data="balanceTrend"
          :loading="balanceLoading"
          :currency="currentCurrency"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import SummaryCard from "../base/summaryCard.vue";
import TrendChart from "../base/trendChart.vue";
import { trendGranularityOptions } from "../base/constants";
import {
  getDefaultGroupId,
  getEnableGroupList,
  type GroupVo
} from "@/api/fortune/group";
import { type AccountVo, getEnableAccountList } from "@/api/fortune/account";
import {
  type AssetsLiabilitiesVo,
  type AccountTypeAssetsVo,
  type CreditCardVo,
  type LineVo,
  getAssetsLiabilities,
  getNetAssetsTrend,
  getAssetsByAccountType,
  getCreditCardOverview,
  getAccountBalanceTrend
} from "@/api/fortune/include";
import { Wallet, Money, TrendCharts } from "@element-plus/icons-vue";

const filterForm = reactive<{ groupId?: number }>({});
const groupOptions = ref<Array<GroupVo>>([]);
const accountOptions = ref<Array<AccountVo>>([]);
const trendGranularity = ref<number>(3);
const selectedAccountId = ref<number>();

const assetsLiabilities = ref<AssetsLiabilitiesVo>({
  totalAssets: 0,
  totalLiabilities: 0,
  netAssets: 0
});
const netAssetsTrend = ref<Array<LineVo>>([]);
const trendLoading = ref<boolean>(false);
const accountTypeAssets = ref<Array<AccountTypeAssetsVo>>([]);
const typeLoading = ref<boolean>(false);
const creditCards = ref<Array<CreditCardVo>>([]);
const balanceTrend = ref<Array<LineVo>>([]);
const balanceLoading = ref<boolean>(false);

const currentCurrency = computed(() => {
  const currentGroup = groupOptions.value.find(
    group => group.groupId === filterForm.groupId
  );
  return currentGroup?.defaultCurrency || "CNY";
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currentCurrency.value,
    minimumFractionDigits: 2
  }).format(value);

function progressColor(rate: number) {
  if (rate >= 80) return "#f56c6c";
  if (rate >= 50) return "#e6a23c";
  return "#67c23a";
}

async function loadNetAssetsTrend() {
  if (!filterForm.groupId) return;
  trendLoading.value = true;
  try {
    const res = await getNetAssetsTrend(
      filterForm.groupId,
      trendGranularity.value
    );
    netAssetsTrend.value = res.data || [];
  } finally {
    trendLoading.value = false;
  }
}

async function loadBalanceTrend() {
  if (!selectedAccountId.value) return;
  balanceLoading.value = true;
  try {
    const res = await getAccountBalanceTrend(
      selectedAccountId.value,
      trendGranularity.value
    );
    balanceTrend.value = res.data || [];
  } finally {
    balanceLoading.value = false;
  }
}

async function loadGroupData() {
  if (!filterForm.groupId) return;
  typeLoading.value = true;
  try {
    const [assetsRes, typeRes, creditRes, accountsRes] = await Promise.all([
      getAssetsLiabilities(filterForm.groupId),
      getAssetsByAccountType(filterForm.groupId),
      getCreditCardOverview(filterForm.groupId),
      getEnableAccountList(filterForm.groupId)
    ]);
    assetsLiabilities.value = assetsRes.data;
    accountTypeAssets.value = typeRes.data || [];
    creditCards.value = creditRes.data || [];
    accountOptions.value = accountsRes.data || [];
    selectedAccountId.value = accountOptions.value[0]?.accountId;
    await Promise.all([loadNetAssetsTrend(), loadBalanceTrend()]);
  } catch (error) {
    message("加载资产负债数据失败", { type: "error" });
  } finally {
    typeLoading.value = false;
  }
}

function onGroupChange() {
  loadGroupData();
}

onMounted(async () => {
  const [groupRes, defaultGroupId] = await Promise.all([
    getEnableGroupList(),
    getDefaultGroupId()
  ]);
  groupOptions.value = groupRes.data || [];
  if (groupOptions.value.length === 0) {
    message("请先启用或创建分组", { type: "warning" });
    return;
  }
  filterForm.groupId = defaultGroupId.data || groupOptions.value[0].groupId;
  await loadGroupData();
});
</script>

<style scoped lang="scss">
@media (width <= 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}

.statistics-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.statistics-card {
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }
}

.filter-form {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-select {
  width: 200px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.chart-box {
  height: 360px;
}

.empty-box {
  padding: 20px 0;
}

.credit-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;

  .credit-card {
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;

    &__name {
      margin-bottom: 12px;
      font-weight: 600;
    }

    &__detail {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
