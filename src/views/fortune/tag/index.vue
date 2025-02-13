<template>
  <div class="main">
    <el-page-header @back="$router.back()">
      <template #content>
        <span class="text-large font-600 mr-3"> {{ title }} - 标签 </span>
      </template>
    </el-page-header>
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="名称：" prop="tagName">
        <el-input
          v-model="searchFormParams.tagName"
          placeholder="请输入名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="可支出：" prop="canExpense">
        <el-select
          v-model="searchFormParams.canExpense"
          placeholder="请选择是否可支出"
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
      <el-form-item label="可收入：" prop="canIncome">
        <el-select
          v-model="searchFormParams.canIncome"
          placeholder="请选择是否可收入"
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
      <el-form-item label="转账状态：" prop="canTransfer">
        <el-select
          v-model="searchFormParams.canTransfer"
          placeholder="请选择转账状态"
          class="!w-[200px]"
          filterable
        >
          <el-option
            v-for="item in canTransferOptions"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="启用状态：" prop="enable">
        <el-select
          v-model="searchFormParams.enable"
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
    <PureTableBar title="标签列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
        >
          新增标签
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
              :title="`确认将【${row.payeeName}】账户移入回收站？`"
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
    <tag-form
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
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import PureTable from "@pureadmin/table";
import PureTableBar from "@/components/RePureTableBar/src/bar";
import TagForm from "@/views/fortune/tag/tag-form.vue";
import { onMounted, ref } from "vue";
import { useHook } from "./utils/hook";
import { useRoute } from "vue-router";
import { TagVo } from "@/api/fortune/tag";

const opType = ref<"add" | "edit">("add");
const currentRow = ref<TagVo>();
const modalVisible = ref(false);
const bookId = ref<number>();

const {
  loading,
  title,
  searchFormParams,
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

const canTransferOptions = ref<
  [{ label?: string; value?: boolean }, { label?: string; value?: boolean }]
>([
  { label: "可转账", value: true },
  { label: "不可转账", value: false }
]);

const enableOptions = ref<
  [{ label?: string; value?: boolean }, { label?: string; value?: boolean }]
>([
  { label: "启用", value: true },
  { label: "停用", value: false }
]);

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneBookTag"
});

onMounted(async () => {
  const route = useRoute();
  searchFormParams.bookId = Number(route.query.bookId);
  searchFormParams.recycleBin = false;
  await onSearch();
});

function openDialog(type: "add" | "edit", row?: TagVo) {
  opType.value = type;
  currentRow.value = row;
  modalVisible.value = true;
  bookId.value = searchFormParams.bookId;
}
</script>
