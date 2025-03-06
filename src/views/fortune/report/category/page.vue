<template>
  <div>
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] mb-5"
    >
      <el-form-item label="所属分组：">
        <el-select
          v-model="groupId"
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
      <el-form-item label="所属账本：">
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
      <el-form-item label="交易时间：">
        <el-date-picker
          v-model="tradeTimeRange"
          type="daterange"
          range-separator="-"
          class="!w-[260px]"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="标题：">
        <el-input
          v-model.trim="searchForm.title"
          placeholder="请输入标题"
          clearable
        />
      </el-form-item>
      <el-form-item label="账户：">
        <el-select
          multiple
          v-model="searchForm.accountIds"
          placeholder="请选择账户"
          filterable
        >
          <el-option
            v-for="item in accountOptions"
            :key="item.accountId"
            :label="item.accountName"
            :value="item.accountId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="交易对象：">
        <el-select
          filterable
          multiple
          v-model="searchForm.payeeIds"
          placeholder="请选择交易对象"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="item in payeeOptions"
            :key="item.payeeId"
            :label="item.payeeName"
            :value="item.payeeId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分类：">
        <el-tree-select
          v-model="searchForm.categoryIds"
          :data="categoryOptions"
          check-strictly
          filterable
          multiple
          placeholder="请选择分类"
          style="width: 100%"
          :props="categoryTreeProps"
          clearable
        />
      </el-form-item>
      <el-form-item label="标签：">
        <el-tree-select
          v-model="searchForm.tagIds"
          :data="tagOptions"
          placeholder="请选择标签"
          style="width: 100%"
          check-strictly
          filterable
          multiple
          :props="tagTreeProps"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm">
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <el-card>
      <pie :data="resData" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { BookVo, getEnableBookList } from "@/api/fortune/book";
import { AccountVo, getEnableAccountList } from "@/api/fortune/account";
import { CategoryVo, getEnableCategoryList } from "@/api/fortune/category";
import { getEnablePayeeList, PayeeVo } from "@/api/fortune/payee";
import { getEnableTagList, TagVo } from "@/api/fortune/tag";
import { message } from "@/utils/message";
import { useRoute } from "vue-router";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import pie from "./pie.vue";
import {
  CategoryReportQuery,
  getCategoryExpenseApi,
  getCategoryIncomeApi,
  PieVo
} from "@/api/fortune/include";

const billType = ref<number>();
const searchForm = reactive<CategoryReportQuery>({});
const groupId = ref<number>();
const tradeTimeRange = ref<[Date, Date]>([null, null]);
const groupOptions = ref<Array<GroupVo>>();
const bookOptions = ref<Array<BookVo>>();
const accountOptions = ref<Array<AccountVo>>();
const categoryOptions = ref<Array<CategoryVo>>();
const payeeOptions = ref<Array<PayeeVo>>();
const tagOptions = ref<Array<TagVo>>();
const loading = ref<boolean>(false);

const tagTreeProps = {
  label: "tagName",
  value: "tagId",
  children: "children"
};
const categoryTreeProps = {
  label: "categoryName",
  value: "categoryId",
  children: "children"
};
const resData = ref<Array<PieVo>>([]);
onMounted(async () => {
  getBillTypeByFullPath();
  const groupRes = await getEnableGroupList();
  if (groupRes.data.length === 0) {
    message("请先启用或创建分组");
  }
  groupOptions.value = groupRes.data;
  const defaultGroup = await getDefaultGroupId();
  groupId.value = defaultGroup.data;
  const [booksRes, accountsRes] = await Promise.all([
    getEnableBookList(groupId.value),
    getEnableAccountList(groupId.value)
  ]);
  bookOptions.value = booksRes.data;
  searchForm.bookId = groupOptions.value.find(
    group => group.groupId === defaultGroup.data
  ).defaultBookId;
  await onSearch();
  accountOptions.value = accountsRes.data;
  const [categoryRes, payeeRes, tagRes] = await Promise.all([
    getEnableCategoryList(searchForm.bookId, billType.value),
    getEnablePayeeList(searchForm.bookId, billType.value),
    getEnableTagList(searchForm.bookId, billType.value)
  ]);
  categoryOptions.value = categoryRes.data;
  payeeOptions.value = payeeRes.data;
  tagOptions.value = tagRes.data;
});
watch(
  () => groupId.value,
  async () => {
    const bookRes = await getEnableBookList(groupId.value);
    if (bookRes.data.length === 0) {
      message("请先启用或创建账本");
      return;
    }
    bookOptions.value = bookRes.data;
    searchForm.bookId = groupOptions.value.find(
      group => group.groupId === groupId.value
    ).defaultBookId;
  }
);
watch(
  () => searchForm.bookId,
  async () => {
    await onSearch();
  }
);

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

async function resetForm() {
  const defaultGroup = await getDefaultGroupId();
  groupId.value = defaultGroup.data;
  searchForm.bookId = groupOptions.value.find(
    group => group.groupId === defaultGroup.data
  ).defaultBookId;
  searchForm.title = null;
  searchForm.accountIds = [];
  searchForm.payeeIds = [];
  searchForm.tagIds = [];
  searchForm.categoryIds = [];
  searchForm.startDate = null;
  searchForm.endDate = null;
  tradeTimeRange.value = [null, null];
  await onSearch();
}

async function onSearch() {
  searchForm.startDate = tradeTimeRange.value[0];
  searchForm.endDate = tradeTimeRange.value[1];
  console.log(searchForm);
  if (billType.value === 1) {
    const res = await getCategoryExpenseApi(searchForm);
    resData.value = res.data;
  } else if (billType.value === 2) {
    const res = await getCategoryIncomeApi(searchForm);
    resData.value = res.data;
  }
}
</script>
