<!-- bill-index.vue -->
<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] grid-form"
    >
      <el-form-item label="分组：" prop="groupId">
        <el-select
          v-model="searchForm.groupId"
          placeholder="请选择账本"
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
      <el-form-item label="账本：" prop="bookId">
        <el-select
          v-model="searchForm.bookId"
          placeholder="请选择账本"
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
      <el-form-item label="账户：" prop="accountId">
        <el-select
          v-model="searchForm.accountId"
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
      <el-form-item label="标题：" prop="title">
        <el-input
          v-model.trim="searchForm.title"
          placeholder="请输入标题"
          clearable
        />
      </el-form-item>
      <el-form-item label="交易类型：" prop="billType">
        <el-select
          v-model="searchForm.billType"
          placeholder="请选择类型"
          clearable
        >
          <el-option
            v-for="item in billTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="交易时间：">
        <el-date-picker
          v-model="searchForm.tradeTimeRange"
          type="daterange"
          range-separator="-"
          class="!w-[260px]"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item prop="amountMin" label="金额：">
        <div class="number-range-picker">
          <el-input-number
            v-model="searchForm.amountMin"
            placeholder="最小值"
            :precision="2"
            :controls="false"
            class="amount-input"
          />
          <span class="range-separator">—</span>
          <el-input-number
            v-model="searchForm.amountMax"
            placeholder="最大值"
            :precision="2"
            :controls="false"
            class="amount-input"
          />
        </div>
      </el-form-item>
      <el-form-item label="分类：" prop="categoryIds">
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
      <el-form-item prop="tagIds" label="标签：">
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
      <el-form-item prop="payeeId" label="交易对象：">
        <el-select
          filterable
          v-model="searchForm.payeeId"
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
      <el-form-item prop="confirm" label="确认状态：">
        <el-select
          v-model="searchForm.confirm"
          placeholder="请选择确认状态"
          clearable
          filterable
        >
          <el-option
            v-for="item in trueFalseOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="include" label="统计状态：">
        <el-select
          v-model="searchForm.include"
          placeholder="请选择统计状态"
          clearable
          filterable
        >
          <el-option
            v-for="item in trueFalseOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注：" prop="remark">
        <el-input
          v-model="searchForm.remark"
          placeholder="请输入备注"
          clearable
        />
      </el-form-item>
      <el-form-item class="search-buttons">
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

    <PureTableBar :title="tableTitle" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add', null)"
        >
          新增账单
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
          :paginationSmall="size === 'small'"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button link type="success" @click="openDialog('add', row)">
              复制
            </el-button>
            <el-button link type="primary" @click="openDialog('edit', row)">
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import PureTable from "@pureadmin/table";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import BillForm from "./bill-form.vue";
import { useHook } from "./utils/hook";
import { BookVo, getEnableBookList } from "@/api/fortune/book";
import { AccountVo, getEnableAccountList } from "@/api/fortune/account";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { message } from "@/utils/message";
import { CategoryVo, getEnableCategoryList } from "@/api/fortune/category";
import { getEnablePayeeList, PayeeVo } from "@/api/fortune/payee";
import { getEnableTagList, TagVo } from "@/api/fortune/tag";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneBill"
});

const opType = ref<"add" | "edit">("add");
const currentRow = ref();
const modalVisible = ref(false);
const groupIdProp = ref();
const bookIdProp = ref();
const groupOptions = ref<Array<GroupVo>>();
const bookOptions = ref<Array<BookVo>>();
const accountOptions = ref<Array<AccountVo>>();
const formRef = ref();
const categoryOptions = ref<Array<CategoryVo>>();
const payeeOptions = ref<Array<PayeeVo>>();
const tagOptions = ref<Array<TagVo>>();
const trueFalseOptions = ref([
  {
    value: 1,
    label: "是"
  },
  {
    value: 0,
    label: "否"
  }
]);
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
const {
  searchForm,
  dataList,
  columns,
  loading,
  pagination,
  billTypeOptions,
  billStatistics,
  onSearch,
  handleDelete,
  resetForm,
  handleSizeChange,
  handleCurrentChange
} = useHook();

onMounted(async () => {
  const groupRes = await getEnableGroupList();
  if (groupRes.data.length === 0) {
    message("请先启用或创建分组");
  }
  groupOptions.value = groupRes.data;
  const defaultGroup = await getDefaultGroupId();
  searchForm.groupId = defaultGroup.data;
  const [booksRes, accountsRes] = await Promise.all([
    getEnableBookList(searchForm.groupId),
    getEnableAccountList(searchForm.groupId)
  ]);
  bookOptions.value = booksRes.data;
  searchForm.bookId = groupOptions.value.find(
    group => group.groupId === defaultGroup.data
  ).defaultBookId;
  accountOptions.value = accountsRes.data;
  await onSearch();
  const [categoryRes, payeeRes, tagRes] = await Promise.all([
    getEnableCategoryList(searchForm.bookId, null),
    getEnablePayeeList(searchForm.bookId, null),
    getEnableTagList(searchForm.bookId, null)
  ]);
  categoryOptions.value = categoryRes.data;
  payeeOptions.value = payeeRes.data;
  tagOptions.value = tagRes.data;
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
      group => group.groupId === searchForm.groupId
    ).defaultBookId;
  }
);
watch(
  () => searchForm.bookId,
  async () => {
    await onSearch();
  }
);
const tableTitle = computed(() => {
  const statistics = billStatistics.value;
  // eslint-disable-next-line no-irregular-whitespace
  return `账单管理　|　总收入：${statistics?.income ?? 0}元　|　总支出：${
    statistics?.expense ?? 0
    // eslint-disable-next-line no-irregular-whitespace
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
.grid-form {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  padding-bottom: 16px;
}

/* 统一标签宽度和对齐方式 */
.grid-form :deep(.el-form-item__label) {
  width: 80px;
  height: 40px;
  padding-right: 8px;
  line-height: 40px;
  text-align: right;
}

/* 统一表单项内容区域样式 */
.grid-form :deep(.el-form-item__content) {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-start;
  height: 40px;
}

/* 统一所有输入控件的宽度 */
.grid-form :deep(.el-select),
.grid-form :deep(.el-input),
.grid-form :deep(.el-date-editor),
.grid-form :deep(.el-tree-select),
.grid-form :deep(.el-input-number) {
  width: 100%;
  height: 32px;
}

/* 确保日期选择器的宽度正确 */
.grid-form :deep(.el-date-editor.el-input__wrapper) {
  width: 100% !important;
}

/* 按钮容器样式 */
.search-buttons {
  display: flex;
  grid-column: 5;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  height: 40px;
  margin-right: 30px;
}

/* 确保按钮垂直居中 */
.search-buttons :deep(.el-button) {
  height: 32px;
  margin-top: 0;
  margin-bottom: 0;
}

/* 金额范围选择器样式 */
.number-range-picker {
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
}

.amount-input {
  flex: 1;
  width: calc(50% - 10px) !important;
}

.range-separator {
  flex: none;
  margin: 0 5px;
}

/* 修复可能的对齐问题 */
.grid-form :deep(.el-input__wrapper),
.grid-form :deep(.el-select__wrapper) {
  height: 32px;
  line-height: 32px;
}
</style>
