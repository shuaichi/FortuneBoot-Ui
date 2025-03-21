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
      <bar :data="resData" :title="reportTitle" @refresh="onSearch" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { message } from "@/utils/message";
import { useRoute } from "vue-router";
import bar from "../base/bar.vue";
import ReportSearchForm from "../base/reportSearchForm.vue";
import { useReportSearch } from "../base/useReportSearch";
import { getTagExpenseApi, getTagIncomeApi } from "@/api/fortune/include";

const billType = ref<number>();
const reportTitle = computed(() => {
  return billType.value === 1 ? "支出标签统计" : "收入标签统计";
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
    ? getTagExpenseApi(params)
    : getTagIncomeApi(params);
});

onMounted(async () => {
  getBillTypeByFullPath();
});

function getBillTypeByFullPath() {
  const route = useRoute();
  switch (route.path) {
    case "/fortune/report/tag/expense":
      billType.value = 1;
      return;
    case "/fortune/report/tag/income":
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
