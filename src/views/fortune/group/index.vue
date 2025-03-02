<template>
  <div class="main">
    <PureTableBar title="分组列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openUploadDialog('add')"
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
            <el-popconfirm
              :title="`确认设置【${row.groupName}】为默认分组吗？`"
              @confirm="setDefault(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="success"
                  :size="size"
                  :disabled="defaultGroupId === row.groupId"
                >
                  默认
                </el-button>
              </template>
            </el-popconfirm>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openUploadDialog('upload', row)"
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
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openInviteDialog(row)"
            >
              邀请
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openUserDialog(row)"
            >
              用户列表
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <group-form
      v-model="uploadVisible"
      :type="opType"
      :row="opRow"
      v-if="uploadVisible"
      @success="onSearch"
    />
    <group-invite
      v-model="inviteVisible"
      v-if="inviteVisible"
      :group-id="opRow.groupId"
      @success="onSearch"
    />
    <group-user
      v-model="userVisible"
      v-if="userVisible"
      :group-id="opRow.groupId"
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
import { GroupVo, setGroupDefaultApi } from "@/api/fortune/group";
import GroupForm from "@/views/fortune/group/group-form.vue";
import PureTable from "@pureadmin/table";
import GroupInvite from "@/views/fortune/group/group-invite.vue";
import GroupUser from "@/views/fortune/group/group-user.vue";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneGroup"
});

const opType = ref<"add" | "upload">("add");
const opRow = ref<GroupVo>();
const uploadVisible = ref<boolean>(false);
const inviteVisible = ref<boolean>(false);
const userVisible = ref<boolean>(false);
const {
  loading,
  columns,
  dataList,
  pagination,
  defaultGroupId,
  onSearch,
  handleRemoveGroupApi,
  handleSizeChange,
  handleCurrentChange
} = useHook();

async function setDefault(row: GroupVo) {
  await setGroupDefaultApi(row.groupId);
  await onSearch();
}

async function openUploadDialog(type: "add" | "upload", row?: GroupVo) {
  try {
    opType.value = type;
    opRow.value = row;
    uploadVisible.value = true;
  } catch (e) {
    console.error(e);
    ElMessage.error((e as Error)?.message || "加载菜单失败");
  }
}

function openInviteDialog(row?: GroupVo) {
  opRow.value = row;
  inviteVisible.value = true;
}

function openUserDialog(row?: GroupVo) {
  opRow.value = row;
  userVisible.value = true;
}
</script>
