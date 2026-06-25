<template>
  <div class="main">
    <BillSearchForm
      v-model="searchForm"
      :loading="loading"
      :groupOptions="groupOptions"
      :bookOptions="bookOptions"
      :accountOptions="accountOptions"
      :billTypeOptions="billTypeOptions"
      :categoryOptions="categoryOptions"
      :tagOptions="tagOptions"
      :payeeOptions="payeeOptions"
      :memberOptions="memberOptions"
      @search="onSearch"
      @reset="resetForm"
    />

    <PureTableBar :title="tableTitle" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add', null)"
        >
          新增账单
        </el-button>
        <el-button
          type="success"
          :icon="useRenderIcon(Upload)"
          :disabled="!searchForm.groupId"
          @click="importModalVisible = true"
        >
          导入账单
        </el-button>
        <el-button
          type="warning"
          :icon="useRenderIcon(Download)"
          @click="exportAllExcel"
        >
          导出账单
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :default-sort="defaultSort"
          :paginationSmall="size === 'small'"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
          @sort-change="onSearch"
        >
          <template #operation="{ row }">
            <el-button
              link
              type="success"
              :disabled="row.billType === 4"
              @click="openDialog('add', row)"
            >
              复制
            </el-button>
            <el-button
              link
              type="primary"
              :disabled="row.billType === 4"
              @click="openDialog('edit', row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`确认删除【${row.title}】账单？`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <bill-form
      v-if="modalVisible"
      v-model="modalVisible"
      :groupId="groupIdProp"
      :bookId="bookIdProp"
      :type="opType"
      :row="currentRow"
      @success="onSearch"
    />

    <bill-import-dialog
      v-if="importModalVisible"
      v-model="importModalVisible"
      :group-id="searchForm.groupId"
      :book-id="searchForm.bookId"
      @success="onSearch"
    />

    <GlobalAddBtn />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { emitter } from "@/utils/mitt";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Download from "@iconify-icons/ep/download";
import Upload from "@iconify-icons/ep/upload";
import { PureTableBar } from "@/components/RePureTableBar";
import PureTable from "@pureadmin/table";
import { useRoute } from "vue-router";
import { message } from "@/utils/message";

import BillForm from "./bill-form.vue";
import BillImportDialog from "./bill-import-dialog.vue";
import BillSearchForm from "./components/bill-search-form.vue";
import GlobalAddBtn from "./global-add-bill-button.vue";

import { useHook } from "./utils/hook";
import { BookVo, getEnableBookList } from "@/api/fortune/book";
import { AccountVo, getEnableAccountList } from "@/api/fortune/account";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { CategoryVo, getEnableCategoryList } from "@/api/fortune/category";
import { getEnablePayeeList, PayeeVo } from "@/api/fortune/payee";
import { getEnableTagList, TagVo } from "@/api/fortune/tag";
import { getEnableMemberList, MemberVo } from "@/api/fortune/member";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneBill"
});

const opType = ref<"add" | "edit">("add");
const currentRow = ref();
const modalVisible = ref(false);
const importModalVisible = ref(false);
const groupIdProp = ref();
const bookIdProp = ref();
const groupOptions = ref<Array<GroupVo>>([]);
const bookOptions = ref<Array<BookVo>>([]);
const accountOptions = ref<Array<AccountVo>>([]);
const categoryOptions = ref<Array<CategoryVo>>([]);
const payeeOptions = ref<Array<PayeeVo>>([]);
const tagOptions = ref<Array<TagVo>>([]);
const memberOptions = ref<Array<MemberVo>>([]);

const route = useRoute();

const {
  searchForm,
  dataList,
  columns,
  loading,
  pagination,
  defaultSort,
  billTypeOptions,
  billStatistics,
  onSearch,
  exportAllExcel,
  handleDelete,
  resetForm,
  handleSizeChange,
  handleCurrentChange
} = useHook();

onMounted(async () => {
  // 初始化分组
  await initGroup();
  // 初始化分组下的账本和账户
  await initBookAndAccount();
  // 查询账单数据
  await onSearch();
  // 初始化搜索表单下拉框
  await initSearchSelect();

  // 监听账单创建成功事件，刷新账单列表
  emitter.on("billCreated", onSearch);
});

const initGroup = async () => {
  const groupRes = await getEnableGroupList();
  if (groupRes.data.length === 0) {
    message("请先启用或创建分组");
  }
  groupOptions.value = groupRes.data;
  // 获取 onMounted 时的分组 id
  searchForm.groupId = await getMountedGroupId();
};

const getMountedGroupId = async () => {
  if (route.query.groupId) {
    return Number(route.query.groupId);
  } else {
    const defaultGroup = await getDefaultGroupId();
    return defaultGroup.data;
  }
};

// 初始化账本和账户
const initBookAndAccount = async () => {
  const [booksRes, accountsRes] = await Promise.all([
    getEnableBookList(searchForm.groupId),
    getEnableAccountList(searchForm.groupId)
  ]);
  bookOptions.value = booksRes.data;
  searchForm.bookId = groupOptions.value.find(
    group => group.groupId === searchForm.groupId
  )?.defaultBookId;
  accountOptions.value = accountsRes.data;

  // 对账（如果 route 中有账户，则查询这个账户的数据）
  if (route.query.accountId) {
    searchForm.accountId = Number(route.query.accountId);
  }
};

const initSearchSelect = async () => {
  // 查询账单分类、交易对象、标签、成员下拉框
  const [categoryRes, payeeRes, tagRes, memberRes] = await Promise.all([
    getEnableCategoryList(searchForm.bookId, null),
    getEnablePayeeList(searchForm.bookId, null),
    getEnableTagList(searchForm.bookId, null),
    getEnableMemberList(searchForm.bookId)
  ]);
  categoryOptions.value = categoryRes.data;
  payeeOptions.value = payeeRes.data;
  tagOptions.value = tagRes.data;
  memberOptions.value = memberRes.data;
};

watch(
  () => searchForm.groupId,
  async () => {
    await initBookAndAccount();
  }
);
watch(
  () => searchForm.bookId,
  async () => {
    await onSearch();
    await initSearchSelect();
  }
);
const tableTitle = computed(() => {
  const statistics = billStatistics.value;

  return `账单管理　|　总收入：${statistics?.income ?? 0}元　|　总支出：${
    statistics?.expense ?? 0
  }元　|　总结余：${statistics?.surplus ?? 0}元`;
});

function openDialog(type: "add" | "edit", row?: any) {
  opType.value = type;
  groupIdProp.value = searchForm.groupId;
  bookIdProp.value = searchForm.bookId;
  currentRow.value = row;
  modalVisible.value = true;
}
</script>

<style scoped>
/* 页面特有样式可以在这里添加 */
</style>
