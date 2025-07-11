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
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] fortune-grid-form"
    >
      <el-form-item label="名称：" prop="tagName" v-show="isVisible(0)">
        <el-input
          v-model="searchForm.tagName"
          placeholder="请输入名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="支出状态：" prop="canExpense" v-show="isVisible(1)">
        <el-select
          v-model="searchForm.canExpense"
          placeholder="请选择支出状态"
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
      <el-form-item label="收入状态：" prop="canIncome" v-show="isVisible(2)">
        <el-select
          v-model="searchForm.canIncome"
          placeholder="请选择收入状态"
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
      <el-form-item label="转账状态：" prop="canTransfer" v-show="isVisible(3)">
        <el-select
          v-model="searchForm.canTransfer"
          placeholder="请选择转账状态"
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
      <el-form-item label="启用状态：" prop="enable" v-show="isVisible(4)">
        <el-select
          v-model="searchForm.enable"
          placeholder="请选择是否可收入"
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
      <el-form-item class="fortune-search-buttons">
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
        <el-button type="text" @click="expanded = !expanded">
          {{ expanded ? "收起" : "展开" }}
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
          row-key="tagId"
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
              :title="`确认将【${row.tagName}】移入回收站？`"
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
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
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

// 展开收起
const expanded = ref(false);
const width = ref(window.innerWidth);

onMounted(async () => {
  window.addEventListener("resize", onResize);
  const route = useRoute();
  searchForm.bookId = Number(route.query.bookId);
  searchForm.recycleBin = false;
  await onSearch();
});
const onResize = () => {
  width.value = window.innerWidth;
};
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});
// 计算默认展示条数
const defaultCount = computed(() => {
  let base = 3;
  if (width.value <= 1280) {
    base = base - 1; // 2
  } else if (width.value >= 1921) {
    base = base + 1; // 4
  }
  return base;
});
// 最终可见条数：展开时展示所有，收起时展示 defaultCount
const visibleCount = computed(() =>
  expanded.value ? 100 : defaultCount.value
);

// 判断第几个项是否可见
function isVisible(idx: number) {
  return idx < visibleCount.value;
}

function openDialog(type: "add" | "edit", row?: TagVo) {
  opType.value = type;
  currentRow.value = row;
  modalVisible.value = true;
  bookId.value = searchForm.bookId;
}
</script>

<style scoped>
/* 页面特有样式可以在这里添加 */
</style>
