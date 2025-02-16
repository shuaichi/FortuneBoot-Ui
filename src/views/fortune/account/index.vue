<template>
  <div class="full-width-container">
    <el-radio-group
      v-model="searchForm.accountType"
      size="large"
      class="full-width-group"
      @change="onSearch(barRef)"
    >
      <el-radio-button :label="1" class="quarter-width">活 期</el-radio-button>
      <el-radio-button :label="2" class="quarter-width">信 用</el-radio-button>
      <el-radio-button :label="3" class="quarter-width">资 产</el-radio-button>
      <el-radio-button :label="4" class="quarter-width">贷 款</el-radio-button>
    </el-radio-group>
  </div>
  <div>
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="所属分组：" prop="groupId">
        <el-select
          v-model="searchForm.groupId"
          placeholder="请选择分组"
          class="!w-[180px]"
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
      <el-form-item label="账户名称：" prop="accountName">
        <el-input
          v-model="searchForm.accountName"
          placeholder="请输入账本名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <!-- 其他搜索条件 -->
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="
            () => {
              onSearch(barRef);
            }
          "
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm()">
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <PureTableBar
      ref="barRef"
      title="账户管理"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
        >
          新增账户
        </el-button>
      </template>
      <!-- 表格列绑定账户字段 -->
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
          <!-- 操作列 -->
          <template #operation="{ row }">
            <el-button link type="primary" @click="openDialog('edit', row)">
              编辑
            </el-button>
            <el-popconfirm
              :title="`确认将【${row.accountName}】账户移入回收站？`"
              @confirm="handleMove2RecycleBin(row)"
            >
              <template #reference>
                <el-button link type="danger">回收站</el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <account-form
      v-model="modalVisible"
      :type="opType"
      :row="currentRow"
      @success="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { useHook } from "./utils/hook";
import PureTable from "@pureadmin/table";
import { onMounted, ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AccountForm from "@/views/fortune/account/account-form.vue";
import { AccountVo } from "@/api/fortune/account";
import { getEnableGroupList } from "@/api/fortune/group";
import { message } from "@/utils/message";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneBook"
});

const opType = ref<"add" | "edit">("add");
const currentRow = ref<AccountVo>();
const modalVisible = ref(false);
const groupOptions = ref([]);
const formRef = ref();
const barRef = ref();

const {
  searchForm,
  dataList,
  columns,
  resetForm,
  loading,
  pagination,
  onSearch,
  handleMove2RecycleBin,
  handleSizeChange,
  handleCurrentChange
} = useHook();

onMounted(async () => {
  const [groupRes] = await Promise.all([getEnableGroupList()]);
  if (groupRes.data.length === 0) {
    message("请先启用或创建分组");
  }
  groupOptions.value = groupRes.data;
  searchForm.groupId = groupRes.data[0].groupId;
  searchForm.recycleBin = false;
  searchForm.accountType = 1;
  await onSearch();
});

function openDialog(type: "add" | "edit", row?: AccountVo) {
  opType.value = type;
  currentRow.value = row;
  modalVisible.value = true;
}
</script>

<style scoped>
/* 深度选择器覆盖 element 样式 */
:deep(.full-width-group) {
  display: flex;
  width: 100%;
}

:deep(.quarter-width) {
  flex: 1; /* 等分剩余空间 */

  /* 调整内部按钮宽度 */

  .el-radio-button__inner {
    display: block;
    width: 100%;
    text-align: center;
  }
}
</style>
