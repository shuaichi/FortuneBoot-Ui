<template>
  <div>
    <report-search-form
      v-model:group-id="groupId"
      v-model:search-form="searchForm"
      v-model:trade-time-range="tradeTimeRange"
      :group-options="groupOptions"
      :book-options="bookOptions"
      :account-options="accountOptions"
      :payee-options="payeeOptions"
      :category-options="categoryOptions"
      :tag-options="tagOptions"
      @init="init"
      @search="onSearch"
      @reset="resetForm"
    />
    <el-card class="report-card">
      <pie :data="resData" :title="reportTitle" @refresh="onSearch" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { message } from "@/utils/message";
import { useRoute } from "vue-router";
import pie from "../base/pie.vue";
import ReportSearchForm from "../base/reportSearchForm.vue";
import { useReportSearch } from "../base/useReportSearch";
import { getPayeeExpenseApi, getPayeeIncomeApi } from "@/api/fortune/include";

const billType = ref<number>();
const reportTitle = computed(() => {
  return billType.value === 1 ? "支出交易对象统计" : "收入交易对象统计";
});

const {
  searchForm,
  groupId,
  groupOptions,
  bookOptions,
  accountOptions,
  payeeOptions,
  tagOptions,
  categoryOptions,
  tradeTimeRange,
  resData,
  init,
  resetForm,
  onSearch
} = useReportSearch(billType, params => {
  return billType.value === 1
    ? getPayeeExpenseApi(params)
    : getPayeeIncomeApi(params);
});

onMounted(async () => {
  getBillTypeByFullPath();
});

function getBillTypeByFullPath() {
  const route = useRoute();
  switch (route.path) {
    case "/fortune/report/payee/expense":
      billType.value = 1;
      return;
    case "/fortune/report/payee/income":
      billType.value = 2;
      return;
    default:
      message("参数有误；");
      return;
  }
}
</script>

<style scoped>
.report-card {
  margin-top: 16px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}
</style>
