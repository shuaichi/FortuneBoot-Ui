<template>
  <div class="main">
    <el-page-header @back="$router.back()">
      <template #content>
        <span class="text-large font-600 mr-3">
          {{ title }} -
          {{ searchForm.categoryType === 1 ? "支出" : "收入" }}分类
        </span>
      </template>
    </el-page-header>
    <div class="fortune-full-width-container">
      <el-radio-group
        v-model="searchForm.categoryType"
        size="large"
        class="full-width-group"
        @change="onSearch()"
      >
        <el-radio-button :label="1" class="half-width"
          >支 出 分 类</el-radio-button
        >
        <el-radio-button :label="2" class="half-width"
          >收 入 分 类</el-radio-button
        >
      </el-radio-group>
    </div>
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] fortune-grid-form"
    >
      <el-form-item label="名称：" prop="categoryName">
        <el-input
          v-model="searchForm.categoryName"
          placeholder="请输入名称"
          clearable
        />
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
      </el-form-item>
    </el-form>
    <PureTableBar title="分类列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
        >
          新增{{ searchForm.categoryType === 1 ? "支出" : "收入" }}分类
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
          row-key="categoryId"
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
              :title="`确认将【${row.categoryName}】移入回收站？`"
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
    <category-form
      :category-type="searchForm.categoryType"
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
import PureTableBar from "@/components/RePureTableBar/src/bar";
import PureTable from "@pureadmin/table";
import { onMounted, ref } from "vue";
import { CategoryVo } from "@/api/fortune/category";
import { useHook } from "./utils/hook";
import { useRoute } from "vue-router";
import { TagVo } from "@/api/fortune/tag";
import CategoryForm from "@/views/fortune/category/category-form.vue";

const opType = ref<"add" | "edit">("add");
const currentRow = ref<CategoryVo>();
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

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneBookCategory"
});

onMounted(async () => {
  const route = useRoute();
  searchForm.bookId = Number(route.query.bookId);
  searchForm.recycleBin = false;
  searchForm.categoryType = 1;
  await onSearch();
});

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
