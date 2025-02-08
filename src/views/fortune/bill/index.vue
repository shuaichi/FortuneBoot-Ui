<!-- bill-index.vue -->
<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="账本：" prop="bookId">
        <el-select
          v-model="searchFormParams.bookId"
          placeholder="请选择账本"
          class="!w-[180px]"
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
      <el-form-item label="交易类型：" prop="billType">
        <el-select
          v-model="searchFormParams.billType"
          placeholder="请选择类型"
          class="!w-[120px]"
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
      <el-form-item label="账户：" prop="accountId">
        <el-select
          v-model="searchFormParams.accountId"
          placeholder="请选择账户"
          class="!w-[180px]"
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
      <el-form-item label="交易时间：">
        <el-date-picker
          v-model="searchFormParams.tradeTimeRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
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
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm()">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="账单管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
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
      v-model="modalVisible"
      :type="opType"
      :row="currentRow"
      @success="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import PureTable from "@pureadmin/table";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import BillForm from "./bill-form.vue";
import { useHook } from "./utils/hook";
import { getEnableBookList } from "@/api/fortune/book";
import { getAccountList } from "@/api/fortune/account";

const opType = ref<"add" | "edit">("add");
const currentRow = ref();
const modalVisible = ref(false);
const bookOptions = ref([]);
const accountOptions = ref([]);
const formRef = ref();

const {
  searchFormParams,
  dataList,
  columns,
  loading,
  pagination,
  billTypeOptions,
  onSearch,
  handleDelete,
  resetForm,
  handleSizeChange,
  handleCurrentChange
} = useHook();

onMounted(async () => {
  const [booksRes, accountsRes] = await Promise.all([
    getEnableBookList(),
    getAccountList()
  ]);
  bookOptions.value = booksRes.data;
  accountOptions.value = accountsRes.data;
  await onSearch();
});

function openDialog(type: "add" | "edit", row?: any) {
  opType.value = type;
  currentRow.value = row;
  modalVisible.value = true;
}
</script>
