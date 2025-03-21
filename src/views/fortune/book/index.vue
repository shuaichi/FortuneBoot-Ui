<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] grid-form"
    >
      <el-form-item label="所属分组：" prop="groupId">
        <el-select
          v-model="searchFormParams.groupId"
          placeholder="请选择分组"
          filterable
          class="!w-[180px]"
        >
          <el-option
            v-for="item in groupOptions"
            :key="item.groupId"
            :label="item.groupName"
            :value="item.groupId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="账本名称：" prop="bookName">
        <el-input
          v-model="searchFormParams.bookName"
          placeholder="请输入账本名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="启用状态：" prop="status">
        <el-select
          v-model="searchFormParams.enable"
          placeholder="请选择状态"
          clearable
          class="!w-[180px]"
        >
          <el-option label="启用" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
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
    <PureTableBar title="账本管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
        >
          新增账本
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
            <div class="flex items-center justify-center gap-8px w-full">
              <el-popconfirm
                :title="`确认设置【${row.bookId}】为默认账本吗？`"
                @confirm="setDefault(row)"
              >
                <template #reference>
                  <el-button
                    class="reset-margin"
                    link
                    type="success"
                    :size="size"
                    :disabled="defaultBookId === row.bookId"
                  >
                    默认
                  </el-button>
                </template>
              </el-popconfirm>
              <el-button link type="primary" @click="openDialog('edit', row)">
                编辑
              </el-button>
              <el-popconfirm
                :title="`确认将【${row.bookName}】账本移入回收站？`"
                @confirm="handleRecycleBin(row)"
              >
                <template #reference>
                  <el-button link type="danger">回收站</el-button>
                </template>
              </el-popconfirm>
              <el-dropdown>
                <el-button link type="primary">账本配置</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="openCategory(row)">
                      分类管理
                    </el-dropdown-item>
                    <el-dropdown-item @click="openTag(row)">
                      标签管理
                    </el-dropdown-item>
                    <el-dropdown-item @click="openPayee(row)">
                      交易对象
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <book-form
      v-if="modalVisible"
      v-model="modalVisible"
      :type="opType"
      :row="currentRow"
      @success="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { PureTableBar } from "@/components/RePureTableBar";
import PureTable from "@pureadmin/table";
import { onMounted, ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { BookVo } from "@/api/fortune/book";
import BookForm from "./book-form.vue";
import { useHook } from "./utils/hook";
import { useRoute } from "vue-router";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import { getEnableGroupList, GroupVo } from "@/api/fortune/group";
import { message } from "@/utils/message";
import { useRouter } from "vue-router";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneBook"
});

const route = useRoute();
console.log("当前路由信息：", route);
// 确认输出包含正确的 parent 路由信息

const {
  searchFormParams,
  resetForm,
  loading,
  columns,
  dataList,
  pagination,
  defaultBookId,
  setDefault,
  onSearch,
  handleRecycleBin,
  handleSizeChange,
  handleCurrentChange
} = useHook();

const formRef = ref();
const opType = ref<"add" | "edit">("add");
const currentRow = ref<BookVo>();
const modalVisible = ref(false);
const groupOptions = ref<Array<GroupVo>>();
const router = useRouter();

onMounted(async () => {
  const groupRes = await getEnableGroupList();
  groupOptions.value = groupRes.data;
  if (groupRes.data.length === 0) {
    message("请先启用或创建分组");
  }
});

function openDialog(type: "add" | "edit", row?: BookVo) {
  opType.value = type;
  currentRow.value = row;
  modalVisible.value = true;
}

function openCategory(row?: BookVo) {
  router.push({
    path: "/fortune/category/index",
    query: {
      bookId: row.bookId
    }
  });
}

function openTag(row?: BookVo) {
  router.push({
    path: "/fortune/tag/index",
    query: {
      bookId: row.bookId
    }
  });
}

function openPayee(row?: BookVo) {
  router.push({
    path: "/fortune/payee/index",
    query: {
      bookId: row.bookId
    }
  });
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
  margin-right: 0;
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
