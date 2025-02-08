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
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openDialog('upload', row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`确认删除【${row.groupName}】这条数据？数据一旦删除，将不可恢复！`"
              @confirm="handleRemoveGroupApi(row)"
            >
              <template #reference>
                <el-button class="reset-margin" link type="danger" :size="size">
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
      @success="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { PureTableBar } from "@/components/RePureTableBar";
import { useHook } from "@/views/fortune/group/utils/hook";
import { ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import AddFill from "@iconify-icons/ri/add-circle-line";
import { ElMessage } from "element-plus";
import { GroupVo } from "@/api/fortune/group";
import GroupForm from "@/views/fortune/group/group-form.vue";
import PureTable from "@pureadmin/table";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneGroup"
});

//const tableRef = ref();
const opType = ref<"add" | "upload">("add");
const opRow = ref<GroupVo>();
const modalVisible = ref(false);
const {
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  handleRemoveGroupApi,
  handleSizeChange,
  handleCurrentChange
} = useHook();

async function openDialog(type: "add" | "upload", row?: GroupVo) {
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
