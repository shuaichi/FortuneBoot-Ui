<script setup lang="ts">
import { ref } from "vue";
import { useHook } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ElMessage, ElMessageBox } from "element-plus";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Delete from "@iconify-icons/ep/delete";
import { useUserStoreHook } from "@/store/modules/user";
import { deleteSystemConfig } from "@/api/system/config";

import AddConfigDialog from "@/views/system/config/AddConfigDialog.vue"; // 引入新增弹窗组件

defineOptions({
  name: "SystemConfig"
});

const yesOrNoList = useUserStoreHook().dictionaryList["common.yesOrNo"];
const tableRef = ref();
const searchFormRef = ref();
const addDialogVisible = ref(false);

const {
  searchFormParams,
  pageLoading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  openDialog,
  handleRefresh,
  getList
} = useHook();

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定删除参数 [${row.configName}] 吗？`,
      "提示",
      {
        type: "warning",
        confirmButtonText: "删除",
        cancelButtonText: "取消"
      }
    );

    await deleteSystemConfig(row.configId);
    ElMessage.success("删除成功");
    await getList();
  } catch (err) {
    if (err !== "cancel") ElMessage.error("删除失败");
  }
};
</script>

<template>
  <div class="main">
    <!-- 搜索表单 -->
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="参数名称：" prop="configName">
        <el-input
          v-model="searchFormParams.configName"
          placeholder="请输入参数名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="参数键名：" prop="configKey">
        <el-input
          v-model="searchFormParams.configKey"
          placeholder="请输入参数键名"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="允许修改：" prop="isAllowChange">
        <el-select
          v-model="searchFormParams.isAllowChange"
          placeholder="请选择"
          clearable
          class="!w-[180px]"
        >
          <el-option
            v-for="dict in yesOrNoList"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="pageLoading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button
          :icon="useRenderIcon(Refresh)"
          @click="resetForm(searchFormRef, tableRef)"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区域 -->
    <PureTableBar title="通知列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="addDialogVisible = true"
        >
          新增参数
        </el-button>
        <el-button
          type="warning"
          :icon="useRenderIcon(Refresh)"
          @click="handleRefresh()"
        >
          刷新缓存
        </el-button>
      </template>

      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          ref="tableRef"
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="pageLoading"
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
          @page-size-change="getList"
          @page-current-change="getList"
        >
          <template #operation="{ row }">
            <div class="btn-group">
              <el-button
                type="primary"
                plain
                size="small"
                :icon="useRenderIcon(EditPen)"
                @click="openDialog(row)"
              >
                修改
              </el-button>
              <el-button
                type="danger"
                plain
                size="small"
                :icon="useRenderIcon(Delete)"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 弹窗组件 -->
    <AddConfigDialog v-model="addDialogVisible" @success="getList" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.btn-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
}
</style>
