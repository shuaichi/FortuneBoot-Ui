import { onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "@/views/system/hooks";
import {
  BookQuery,
  BookVo,
  getFortuneBookPage,
  removeBookApi,
  enableBookApi,
  disableBookApi
} from "@/api/fortune/book";
import { getEnableGroupList } from "@/api/fortune/group";

export function useHook() {
  const { tagStyle } = usePublicHooks();
  const loading = ref(true);
  const dataList = ref<BookVo[]>([]);
  const form = reactive<BookQuery>({});
  const groupNameTemp = ref<string>("");
  const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "账本名称",
      prop: "bookName",
      width: 200,
      align: "left"
    },
    {
      label: "所属分组",
      prop: "groupName",
      width: 150
    },
    {
      label: "默认币种",
      prop: "defaultCurrency",
      width: 120
    },
    {
      label: "默认支出账户",
      prop: "defaultExpenseAccount",
      width: 150
    },
    {
      label: "默认收入账户",
      prop: "defaultIncomeAccount",
      width: 150
    },
    {
      label: "默认转出账户",
      prop: "defaultTransferOutAccount",
      width: 150
    },
    {
      label: "默认转入账户",
      prop: "defaultTransferInAccount",
      width: 150
    },
    {
      label: "排序",
      prop: "sort",
      width: 100
    },
    {
      label: "启用状态",
      prop: "enable",
      slot: "enable",
      width: 120
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 200
    },
    {
      label: "操作",
      slot: "operation",
      fixed: "right",
      width: 180
    }
  ];

  onMounted(() => {
    getEnableGroupList().then(res => {
      if (res.data.length === 0) {
        message("请先创建分组");
      }
      form.groupId = res.data[0].groupId;
      groupNameTemp.value = res.data[0].groupName;
      onSearch();
    });
  });

  async function onSearch() {
    try {
      loading.value = true;
      const { data } = await getFortuneBookPage({
        ...form,
        recycleBin: false,
        pageSize: pagination.pageSize,
        pageNum: pagination.currentPage
      });
      dataList.value = data.rows.map(item => {
        return {
          ...item,
          groupName: groupNameTemp.value
        };
      });
      pagination.total = data.total;
    } catch (e) {
      message(e.message || "查询失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function handleDelete(row: BookVo) {
    try {
      loading.value = true;
      await removeBookApi(row.groupId, row.bookId);
      message(`已删除【${row.bookName}】账本`, { type: "success" });
      onSearch();
    } catch (e) {
      message(e.message || "删除失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function handleStatusClick(row: BookVo) {
    try {
      const action = row.enable ? "禁用" : "启用";
      await ElMessageBox.confirm(
        `确认${action}【${row.bookName}】账本吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );

      if (row.enable) {
        await disableBookApi(row.groupId, row.bookId);
      } else {
        await enableBookApi(row.groupId, row.bookId);
      }
      message(`${action}成功`, { type: "success" });
      onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  return {
    loading,
    columns,
    dataList,
    pagination,
    tagStyle,
    onSearch,
    handleDelete,
    handleStatusClick,
    handleSizeChange,
    handleCurrentChange
  };
}
