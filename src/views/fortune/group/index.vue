<template>
  <div class="main">
    <PureTableBar title="分组列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
        >
          新增分组
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
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('modify', row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`是否确认删除分组名称为${row.groupName}的这条数据`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="danger"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <group-form
      v-model="modalVisible"
      :type="opType"
      :row="opRow"
      v-if="modalVisible"
    />
  </div>
</template>

<script setup lang="ts">
import { PureTableBar } from "@/components/RePureTableBar";
import { useHook } from "@/views/fortune/group/utils/hook";
import { ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { ElMessage } from "element-plus";
import { GroupVo } from "@/api/fortune/group";
import GroupForm from "@/views/fortune/group/groupForm.vue";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneGroup"
});

//const tableRef = ref();
const opType = ref<"add" | "modify">("add");
const opRow = ref<GroupVo>();
const modalVisible = ref(false);
const { loading, columns, dataList, pagination, onSearch, handleDelete } =
  useHook();

async function openDialog(type: "add" | "modify", row?: GroupVo) {
  // debugger;
  try {
    opType.value = type;
    opRow.value = row;
    modalVisible.value = true;
    /*    if (row) {

        }*/
  } catch (e) {
    console.error(e);
    ElMessage.error((e as Error)?.message || "加载菜单失败");
  }
}
</script>
