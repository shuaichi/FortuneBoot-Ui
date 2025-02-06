<template>
  <div class="main">
    <PureTableBar title="账本管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
        >
          新增账本
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
          <!--<template #enable="{ row }">
            <el-tag
              :style="tagStyle(row.enable ? 1 : 0)"
              class="cursor-pointer"
              @click="handleStatusClick(row)"
            >
              {{ row.enable ? "启用" : "禁用" }}
            </el-tag>
          </template>-->

          <template #operation="{ row }">
            <el-button link type="primary" @click="openDialog('edit', row)">
              编辑
            </el-button>
            <el-popconfirm
              :title="`确认删除【${row.bookName}】账本？`"
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
    <book-form
      v-model="modalVisible"
      :type="opType"
      :row="currentRow"
      @success="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { PureTableBar } from "@/components/RePureTableBar";
import PureTable from "@pureadmin/table";
import { ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { BookVo } from "@/api/fortune/book";
import BookForm from "./book-form.vue";
import { useHook } from "./utils/hook";
import { useRoute } from "vue-router";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneBook"
});

const route = useRoute();
console.log("当前路由信息：", route);
// 确认输出包含正确的 parent 路由信息

const {
  loading,
  columns,
  dataList,
  pagination,
  //tagStyle,
  onSearch,
  handleDelete,
  //handleStatusClick,
  handleSizeChange,
  handleCurrentChange
} = useHook();

const opType = ref<"add" | "edit">("add");
const currentRow = ref<BookVo>();
const modalVisible = ref(false);

function openDialog(type: "add" | "edit", row?: BookVo) {
  opType.value = type;
  currentRow.value = row;
  modalVisible.value = true;
}
</script>
