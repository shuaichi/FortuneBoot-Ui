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
          placeholder="请选择分组"
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
    <PureTableBar :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openFormDialog('add')"
        >
          新增单据
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
              v-if="row.status === 100"
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="handleUsingFinanceOrderApi(row)"
            >
              使用
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openFormDialog('modify', row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`确认删除【${row.goodsName}】这条数据？数据一旦删除，将不可恢复！`"
              @confirm="handleRemoveFinanceOrderApi(row)"
            >
              <template #reference>
                <el-button class="reset-margin" link type="danger" :size="size">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
            <el-button
              v-if="row.status === 200"
              class="reset-margin"
              link
              type="danger"
              :size="size"
              @click="handleCloseFinanceOrderApi(row)"
            >
              关闭
            </el-button>
            <el-button
              v-if="row.status === 1000"
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="handleReopenFinanceOrderApi(row)"
            >
              重开
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <order-form
      v-if="formVisible"
      :type="opType"
      v-model="formVisible"
      :row="opRow"
      :group-id="searchForm.groupId"
      :book-id="searchForm.bookId"
      @success="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import PureTable from "@pureadmin/table";
import { PureTableBar } from "@/components/RePureTableBar";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import { watch } from "vue";
import { getEnableBookList } from "@/api/fortune/book";
import { message } from "@/utils/message";
import { useHook } from "@/views/fortune/finance-order/utils/hook";
import OrderForm from "@/views/fortune/finance-order/order-form.vue";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneFinanceOrder"
});

const {
  loading,
  groupOptions,
  bookOptions,
  columns,
  dataList,
  pagination,
  searchForm,
  formVisible,
  opRow,
  opType,
  onSearch,
  openFormDialog,
  handleUsingFinanceOrderApi,
  handleCloseFinanceOrderApi,
  handleReopenFinanceOrderApi,
  resetForm,
  handleCurrentChange,
  handleSizeChange,
  handleRemoveFinanceOrderApi
} = useHook();

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
</script>

<style scoped>
/* 页面特有样式可以在这里添加 */
</style>
