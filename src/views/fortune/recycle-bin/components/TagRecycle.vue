<template>
  <div>
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] grid-form"
    >
      <el-form-item label="所属分组：" prop="groupId">
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
      <el-form-item label="标签名称：" prop="tagName">
        <el-input
          v-model="searchForm.tagName"
          placeholder="请输入标签名称"
          clearable
          class="!w-[200px]"
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
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm()">
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <PureTableBar title="标签回收站" :columns="columns" @refresh="onSearch">
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
            <el-popconfirm
              :title="`确认恢复【${row.tagName}】标签吗？`"
              @confirm="handlePutBack(row)"
            >
              <template #reference>
                <el-button link type="primary">恢复</el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm
              :title="`确认删除【${row.tagName}】标签及其子标签吗？数据一旦删除，将不可恢复！`"
              @confirm="handleRemove(row)"
            >
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>
<script setup lang="ts">
import PureTableBar from "@/components/RePureTableBar/src/bar";
import Search from "@iconify-icons/ep/search";
import PureTable from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { onMounted, reactive, ref, watch } from "vue";
import Refresh from "@iconify-icons/ep/refresh";
import {
  getTagListPageApi,
  tagPutBackApi,
  TagQuery,
  tagRemoveApi,
  TagVo
} from "@/api/fortune/tag";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { message } from "@/utils/message";
import { BookVo, getEnableBookList } from "@/api/fortune/book";

const groupId = ref<number>();
const defaultGroup = ref<number>();
const defaultBook = ref<number>();
const searchForm = reactive<TagQuery>({
  recycleBin: true
});
const groupOptions = ref<Array<GroupVo>>();
const bookOptions = ref<Array<BookVo>>();
const loading = ref(false);
const dataList = ref<TagVo[]>([]);

const pagination = reactive({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const columns: TableColumnList = [
  {
    label: "标签名称",
    prop: "tagName",
    minWidth: 200,
    align: "left"
  },
  {
    label: "备注",
    prop: "remark",
    minWidth: 200
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    width: 200
  }
];

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
  defaultGroup.value = defaultGroupId.data
    ? defaultGroupId.data
    : groupOptions.value[0].groupId;
  groupId.value = defaultGroup.value;
  const bookRes = await getEnableBookList(groupId.value);
  if (bookRes.data.length === 0) {
    message("请先启用或创建账本");
    return;
  }
  bookOptions.value = bookRes.data;
  defaultBook.value = groupOptions.value.find(
    group => group.groupId === groupId.value
  ).defaultBookId;
  searchForm.bookId = defaultBook.value;
  await onSearch();
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
async function onSearch() {
  try {
    loading.value = true;
    const tagRes = await getTagListPageApi(searchForm);
    dataList.value = tagRes.data.rows;
    pagination.total = tagRes.data.total;
  } catch (e) {
    message(e.message || "查询失败", { type: "error" });
  } finally {
    loading.value = false;
  }
}

async function resetForm() {
  groupId.value = defaultGroup.value;
  searchForm.bookId = defaultBook.value;
  searchForm.tagName = null;
  await onSearch();
}

function handleSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  searchForm.pageSize = pageSize;
  onSearch();
}

function handleCurrentChange(currentPage: number) {
  pagination.currentPage = currentPage;
  searchForm.pageNum = currentPage;
  onSearch();
}

async function handlePutBack(row: TagVo) {
  await tagPutBackApi(row.bookId, row.tagId);
  await onSearch();
}

async function handleRemove(row: TagVo) {
  await tagRemoveApi(row.bookId, row.tagId);
  await onSearch();
}
</script>

<style scoped>
.grid-form {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
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
  width: 100% !important;
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

/* 修复可能的对齐问题 */
.grid-form :deep(.el-input__wrapper),
.grid-form :deep(.el-select__wrapper) {
  height: 32px;
  line-height: 32px;
}
</style>
