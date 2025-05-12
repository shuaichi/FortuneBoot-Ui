import { usePublicHooks } from "@/views/system/hooks";
import { onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import {
  enableGroup,
  disableGroup,
  getFortuneGroupPage,
  GroupQuery,
  GroupVo,
  removeGroupApi,
  getDefaultGroupId
} from "@/api/fortune/group";
import type { PaginationProps } from "@pureadmin/table";
import { ElMessageBox } from "element-plus";

const { tagStyle } = usePublicHooks();

export function useHook() {
  const loading = ref(true);
  const dataList = ref([]);

  // 状态控制
  const currentRow = ref<GroupVo>();
  const operationType = ref<"enable" | "disable">();
  const defaultGroupId = ref<number>();

  onMounted(async () => {
    await onSearch();
  });

  async function onSearch() {
    loading.value = true;
    const [groupRes, defaultGroupRes] = await Promise.all([
      getFortuneGroupPage(searchForm),
      getDefaultGroupId()
    ]);
    dataList.value = groupRes.data.rows;
    pagination.total = groupRes.data.total;
    defaultGroupId.value = defaultGroupRes.data;
    loading.value = false;
  }

  const searchForm = reactive<GroupQuery>({});
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    currentPage: 1,
    background: true
  });

  async function handleRemoveGroupApi(row: GroupVo) {
    try {
      loading.value = true;
      await removeGroupApi(row.groupId);
      message(`您删除了分组名称为${row.groupName}的这条数据`, { type: "info" });
      await onSearch();
    } catch (e) {
      console.error(e);
      message((e as Error)?.message || "删除失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function handleSizeChange(pageSize: number) {
    pagination.pageSize = pageSize;
    searchForm.pageSize = pageSize;
    await onSearch();
  }

  async function handleCurrentChange(currentPage: number) {
    pagination.currentPage = currentPage;
    searchForm.pageNum = currentPage;
    await onSearch();
  }

  // 添加状态切换处理函数
  async function handleStatusChange() {
    if (!currentRow.value) return;

    try {
      loading.value = true;
      if (operationType.value === "enable") {
        await enableGroup(currentRow.value.groupId);
      } else {
        await disableGroup(currentRow.value.groupId);
      }
      message(`启用状态修改成功`, { type: "success" });
      onSearch();
    } catch (e) {
      console.error(e);
      message((e as Error)?.message || "操作失败", { type: "error" });
    } finally {
      loading.value = false;
      currentRow.value = undefined;
    }
  }

  // 添加点击处理函数
  async function handleStatusClick(row: GroupVo) {
    currentRow.value = row;
    const isEnable = row.enable;
    const action = isEnable ? "停用" : "启用";
    try {
      await ElMessageBox.confirm(`确定要${action}该分组吗？`, `${action}确认`, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      });
      operationType.value = isEnable ? "disable" : "enable";
      await handleStatusChange();
    } catch (error) {
      // 用户点击取消
      console.log("用户取消操作");
    }
  }

  const columns: TableColumnList = [
    {
      label: "分组名称",
      prop: "groupName",
      width: 200,
      align: "left"
    },
    {
      label: "币种",
      prop: "defaultCurrency",
      minWidth: 100
    },
    {
      label: "角色",
      prop: "roleTypeDesc",
      minWidth: 170
    },
    {
      label: "默认账本",
      prop: "defaultBookName",
      minWidth: 170
    },
    {
      label: "启用状态",
      prop: "enable",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.enable ? 1 : 0)}
          onClick={() => handleStatusClick(row)}
          class="cursor-pointer" // 添加点击指针样式
        >
          {row.enable ? "启用" : "停用"}
        </el-tag>
      )
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 300
    },
    {
      label: "操作",
      fixed: "right",
      width: 280,
      slot: "operation"
    }
  ];

  return {
    loading,
    columns,
    dataList,
    defaultGroupId,
    pagination,
    onSearch,
    handleRemoveGroupApi,
    handleSizeChange,
    handleCurrentChange
  };
}
