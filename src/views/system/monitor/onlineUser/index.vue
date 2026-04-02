<script setup lang="ts">
import { ref } from "vue";
import { useHook } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "OnlineUser"
});

const tableRef = ref();

const searchFormRef = ref();
const {
  searchFormParams,
  pageLoading,
  columns,
  dataList,
  pagination,
  autoRefresh,
  refreshInterval,
  toggleAutoRefresh,
  updateRefreshInterval,
  onSearch,
  resetForm,
  getList,
  handleLogout
} = useHook();
</script>

<template>
  <div class="main">
    <!-- 搜索栏 -->
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="登录IP：" prop="ipAddress">
        <el-input
          v-model="searchFormParams.ipAddress"
          placeholder="请输入IP地址"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="用户名：" prop="username">
        <el-input
          v-model="searchFormParams.username"
          placeholder="请选择用户名称"
          clearable
          class="!w-[200px]"
        />
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

      <el-form-item>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">自动刷新</span>
          <el-switch v-model="autoRefresh" @change="toggleAutoRefresh" />
          <el-select
            v-model="refreshInterval"
            :disabled="!autoRefresh"
            class="!w-[100px]"
            @change="updateRefreshInterval"
          >
            <el-option label="10秒" :value="10" />
            <el-option label="30秒" :value="30" />
            <el-option label="60秒" :value="60" />
          </el-select>
        </div>
      </el-form-item>
    </el-form>

    <!-- table bar 包裹  table -->
    <PureTableBar title="登录日志列表" :columns="columns" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          border
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="pageLoading"
          :size="size"
          adaptive
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="getList"
          @page-current-change="getList"
        >
          <template #operation="{ row }">
            <el-popconfirm
              :title="`是否确认强制退出用户${row.username}`"
              @confirm="handleLogout(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="danger"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  强制退出
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
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
</style>
