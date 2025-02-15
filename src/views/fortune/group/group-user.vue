<template>
  <v-dialog
    use-body-scrolling
    :fixed-body-height="false"
    title="用户列表"
    v-model="visible"
    :loading="loading"
    @cancel="visible = false"
    @opened="onSearch"
    width="510px"
  >
    <PureTableBar title="" :columns="columns" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :paginationSmall="size === 'small'"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
        >
          <template #operation="{ row }">
            <el-popconfirm
              :title="`确认删除【${row.username}】这条数据？数据一旦删除，将不可恢复！`"
              @confirm="handleRemoveInviteUser(row)"
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
  </v-dialog>
</template>
<script setup lang="ts">
import { PureTableBar } from "@/components/RePureTableBar";
import PureTable from "@pureadmin/table";
import VDialog from "@/components/VDialog/VDialog.vue";
import { computed, ref } from "vue";
import {
  getGroupUserApi,
  GroupUserVo,
  removeGroupUserApi
} from "@/api/fortune/group";

const loading = ref<boolean>(false);
const dataList = ref([]);

const props = defineProps<{
  modelValue: boolean;
  groupId?: number;
}>();
const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();
const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});
const columns: TableColumnList = [
  {
    label: "用户名",
    prop: "username",
    width: 150
  },
  {
    label: "昵称",
    prop: "nickname",
    width: 150
  },
  {
    label: "角色",
    prop: "roleTypeDesc",
    width: 80
  },
  {
    label: "操作",
    fixed: "right",
    width: 74,
    slot: "operation"
  }
];
async function onSearch() {
  const groupUserRes = await getGroupUserApi(props.groupId);
  dataList.value = groupUserRes.data;
}

async function handleRemoveInviteUser(row: GroupUserVo) {
  await removeGroupUserApi(row.userGroupRelationId);
  await onSearch();
}
</script>
