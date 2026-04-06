<template>
  <div class="main">
    <el-page-header @back="$router.back()">
      <template #content>
        <span class="text-large font-600 mr-3"> {{ title }} - 成员管理 </span>
      </template>
    </el-page-header>
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] fortune-grid-form"
    >
      <el-form-item v-show="isVisible(0)" label="名称：" prop="memberName">
        <el-input
          v-model="searchForm.memberName"
          placeholder="请输入名称"
          clearable
        />
      </el-form-item>
      <el-form-item v-show="isVisible(1)" label="启用状态：" prop="enable">
        <el-select
          v-model="searchForm.enable"
          placeholder="请选择是否启用"
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
        <el-button
          v-show="width <= 1920"
          type="text"
          @click="expanded = !expanded"
        >
          {{ expanded ? "收起" : "展开" }}
        </el-button>
      </el-form-item>
    </el-form>
    <PureTableBar title="成员列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
        >
          新增成员
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
              :title="`确认将【${row.memberName}】移入回收站？`"
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
    <member-form
      v-if="modalVisible"
      v-model="modalVisible"
      :type="opType"
      :row="currentRow"
      :bookId="bookId"
      @success="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { useHook } from "./utils/hook";
import PureTableBar from "@/components/RePureTableBar/src/bar";
import PureTable from "@pureadmin/table";
import MemberForm from "./member-form.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { MemberVo } from "@/api/fortune/member";
import { useRoute } from "vue-router";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import { useResponsiveForm } from "@/views/fortune/hooks/useResponsiveForm";

const opType = ref<"add" | "edit">("add");
const currentRow = ref<MemberVo>();
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

const enableOptions = ref([
  { label: "启用", value: true },
  { label: "停用", value: false }
]);

defineOptions({
  name: "FortuneBookMember"
});

const { expanded, width, isVisible } = useResponsiveForm();
onMounted(async () => {
  const route = useRoute();
  searchForm.bookId = Number(route.query.bookId);
  searchForm.recycleBin = false;
  await onSearch();
});
function openDialog(type: "add" | "edit", row?: MemberVo) {
  opType.value = type;
  currentRow.value = row;
  modalVisible.value = true;
  bookId.value = searchForm.bookId;
}
</script>

<style scoped>
/* 页面特有样式可以在这里添加 */
</style>
