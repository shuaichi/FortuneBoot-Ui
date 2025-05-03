<template>
  <div class="main">
    <el-page-header @back="$router.back()">
      <template #content>
        <span class="text-large font-600 mr-3"> {{ title }} - 交易对象 </span>
      </template>
    </el-page-header>
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] grid-form"
    >
      <el-form-item label="名称：" prop="payeeName">
        <el-input
          v-model="searchForm.payeeName"
          placeholder="请输入名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="支出状态：" prop="canExpense">
        <el-select
          v-model="searchForm.canExpense"
          placeholder="请选择支出状态"
          class="!w-[200px]"
          filterable
        >
          <el-option
            v-for="item in canExpenseOptions"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="收入状态：" prop="canIncome">
        <el-select
          v-model="searchForm.canIncome"
          placeholder="请选择收入状态"
          class="!w-[200px]"
          filterable
        >
          <el-option
            v-for="item in canIncomeOptions"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="启用状态：" prop="enable">
        <el-select
          v-model="searchForm.enable"
          placeholder="请选择是否可收入"
          class="!w-[200px]"
          filterable
        >
          <el-option
            v-for="item in enableOptions"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
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
    <PureTableBar title="交易对象列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
        >
          新增交易对象
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
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openDialog('edit', row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`确认将【${row.payeeName}】移入回收站？`"
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
    <payee-form
      v-model="modalVisible"
      :type="opType"
      :row="currentRow"
      :bookId="bookId"
      v-if="modalVisible"
      @success="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { useHook } from "./utils/hook";
import PureTableBar from "@/components/RePureTableBar/src/bar";
import PureTable from "@pureadmin/table";
import PayeeForm from "@/views/fortune/payee/payee-form.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { onMounted, ref } from "vue";
import { PayeeVo } from "@/api/fortune/payee";
import { useRoute } from "vue-router";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";

const opType = ref<"add" | "edit">("add");
const currentRow = ref<PayeeVo>();
const modalVisible = ref(false);
const bookId = ref<number>();

const {
  loading,
  title,
  searchForm,
  pagination,
  dataList,
  columns,
  resetForm,
  onSearch,
  handleMove2RecycleBin,
  handleSizeChange,
  handleCurrentChange
} = useHook();

const canExpenseOptions = ref<
  [{ label?: string; value?: boolean }, { label?: string; value?: boolean }]
>([
  { label: "可支出", value: true },
  { label: "不可支出", value: false }
]);

const canIncomeOptions = ref<
  [{ label?: string; value?: boolean }, { label?: string; value?: boolean }]
>([
  { label: "可收入", value: true },
  { label: "不可收入", value: false }
]);

const enableOptions = ref<
  [{ label?: string; value?: boolean }, { label?: string; value?: boolean }]
>([
  { label: "启用", value: true },
  { label: "停用", value: false }
]);

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneBookPayee"
});

onMounted(async () => {
  const route = useRoute();
  searchForm.bookId = Number(route.query.bookId);
  searchForm.recycleBin = false;
  await onSearch();
});

function openDialog(type: "add" | "edit", row?: PayeeVo) {
  opType.value = type;
  currentRow.value = row;
  modalVisible.value = true;
  bookId.value = searchForm.bookId;
}
</script>

<style scoped>
@media (width > 1920px) {
  .grid-form {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* 分辨率 <= 1920px 时四列 */
@media (width <= 1920px) {
  .grid-form {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 分辨率 <= 768px 时三列 */
@media (width <= 1280px) {
  .grid-form {
    grid-template-columns: repeat(3, 1fr);
  }
}

.grid-form {
  display: grid;
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
  grid-column: span 1 / -1;
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
