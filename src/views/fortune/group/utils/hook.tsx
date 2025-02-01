import { usePublicHooks } from "@/views/system/hooks";
import { onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import { getFortuneGroupPage, GroupQuery, GroupVo } from "@/api/fortune/group";
import type { PaginationProps } from "@pureadmin/table";

const { tagStyle } = usePublicHooks();

export function useHook() {
  const loading = ref(true);
  const dataList = ref([]);
  onMounted(() => {
    onSearch();
  });

  async function onSearch() {
    loading.value = true;
    const { data } = await getFortuneGroupPage(form);
    console.log("group list", data);
    dataList.value = data.rows;
    pagination.total = data.total;
    loading.value = false;
  }

  const form = reactive<GroupQuery>({});
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  async function handleDelete(row: GroupVo) {
    try {
      loading.value = true;
      //TODO 删除API调用
      //await deleteRoleApi(row.roleId);
      message(`您删除了分组名称为${row.groupName}的这条数据`, { type: "info" });
      onSearch();
    } catch (e) {
      console.error(e);
      message((e as Error)?.message || "删除失败", { type: "error" });
    } finally {
      loading.value = false;
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
      label: "是否启用",
      prop: "enable",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.enable)}>
          {row.enable ? "启用" : "禁用"}
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
      width: 240,
      slot: "operation"
    }
  ];

  return {
    loading,
    columns,
    dataList,
    pagination,
    onSearch,
    handleDelete
  };
}
