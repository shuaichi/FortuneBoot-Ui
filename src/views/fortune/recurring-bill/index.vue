<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] fortune-grid-form"
    >
      <el-form-item label="所属分组：" prop="groupId">
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
      <el-form-item label="所属账本：" prop="bookId">
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
      <el-form-item label="备注：" prop="remark">
        <el-input
          v-model="searchForm.remark"
          placeholder="请输入备注"
          clearable
        />
      </el-form-item>
      <el-form-item class="fortune-search-buttons">
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

    <PureTableBar title="周期记账" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add', null)"
        >
          新增规则
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
            <el-button
              link
              type="primary"
              @click="openDialog('edit', row)"
              :disabled="row.billType === 4"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`确认删除【${row.ruleName}】账单？`"
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

    <recurring-bill-form
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
import { onMounted, ref, watch } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import PureTable from "@pureadmin/table";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import RecurringBillForm from "./recurring-bill-form.vue";
import { useHook } from "./utils/hook";
import { BookVo, getEnableBookList } from "@/api/fortune/book";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { message } from "@/utils/message";
import { useRoute } from "vue-router";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneRecurringBill"
});

const opType = ref<"add" | "edit">("add");
const currentRow = ref();
const modalVisible = ref(false);
const groupIdProp = ref();
const bookIdProp = ref();
const groupOptions = ref<Array<GroupVo>>();
const bookOptions = ref<Array<BookVo>>();
const formRef = ref();

const route = useRoute();

const {
  searchForm,
  dataList,
  columns,
  loading,
  pagination,
  onSearch,
  handleDelete,
  resetForm,
  handleSizeChange,
  handleCurrentChange
} = useHook();

onMounted(async () => {
  // 初始化分组
  await initGroup();
  // 初始化分组下的账本
  await initBook();
  // 查询账单数据
  await onSearch();
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
const initBook = async () => {
  const booksRes = await getEnableBookList(searchForm.groupId);
  bookOptions.value = booksRes.data;
  searchForm.bookId = groupOptions.value.find(
    group => group.groupId === searchForm.groupId
  ).defaultBookId;
};
watch(
  () => searchForm.groupId,
  async () => {
    await initBook();
  }
);
watch(
  () => searchForm.bookId,
  async () => {
    await onSearch();
  }
);

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
