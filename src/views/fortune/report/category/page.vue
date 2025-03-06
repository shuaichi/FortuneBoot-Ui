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
    <el-card>
      <pie :data="resData" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { message } from "@/utils/message";
import { useRoute } from "vue-router";
import pie from "../base/pie.vue";
import ReportSearchForm from "../base/reportSearchForm.vue";
import { useReportSearch } from "../base/useReportSearch";
import {
  getCategoryExpenseApi,
  getCategoryIncomeApi
} from "@/api/fortune/include";

const billType = ref<number>();
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
    ? getCategoryExpenseApi(params)
    : getCategoryIncomeApi(params);
});
onMounted(async () => {
  getBillTypeByFullPath();
});

function getBillTypeByFullPath() {
  const route = useRoute();
  switch (route.path) {
    case "/fortune/report/category/expense":
      billType.value = 1;
      return;
    case "/fortune/report/category/income":
      billType.value = 2;
      return;
    default:
      message("参数有误；");
      return;
  }
}
</script>
