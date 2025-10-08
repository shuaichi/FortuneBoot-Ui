import { onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import type { PaginationProps } from "@pureadmin/table";
import { ElMessage } from "element-plus";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { BookVo, getEnableBookList } from "@/api/fortune/book";
import {
  closeFinanceOrderApi,
  FinanceOrderQuery,
  FinanceOrderVo,
  getFinanceOrderPage,
  removeFinanceOrderApi,
  reopenFinanceOrderApi,
  usingFinanceOrderApi
} from "@/api/fortune/finance-order";

export function useHook() {
  const loading = ref(true);
  const dataList = ref([]);

  // 状态控制
  const defaultGroupId = ref<number>();
  const groupOptions = ref<Array<GroupVo>>();
  const bookOptions = ref<Array<BookVo>>();

  const opType = ref<"add" | "modify">("add");
  const opRow = ref<FinanceOrderVo>();
  const formVisible = ref<boolean>(false);

  onMounted(async () => {
    const [groupRes, defaultGroupRes] = await Promise.all([
      getEnableGroupList(),
      getDefaultGroupId()
    ]);
    if (groupRes.data.length === 0) {
      message("请先启用或创建分组");
    }
    groupOptions.value = groupRes.data;
    searchForm.groupId = defaultGroupRes.data;
    const booksRes = await getEnableBookList(searchForm.groupId);
    bookOptions.value = booksRes.data;
    searchForm.bookId = groupOptions.value.find(
      group => group.groupId === searchForm.groupId
    ).defaultBookId;
    await onSearch();
  });

  async function onSearch() {
    loading.value = true;
    const res = await getFinanceOrderPage(searchForm);
    dataList.value = res.data.rows;
    pagination.total = res.data.total;
    loading.value = false;
  }

  function resetForm() {
    searchForm.title = "";
    searchForm.status = null;
    onSearch();
  }

  const searchForm = reactive<FinanceOrderQuery>({});
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    currentPage: 1,
    background: true
  });

  async function handleRemoveFinanceOrderApi(row: FinanceOrderVo) {
    try {
      loading.value = true;
      await removeFinanceOrderApi(row.bookId, row.orderId);
      message(`您删除了标题为${row.title}的这条单据`, { type: "info" });
      await onSearch();
    } catch (e) {
      console.error(e);
      message((e as Error)?.message || "删除失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function handleUsingFinanceOrderApi(row: FinanceOrderVo) {
    try {
      loading.value = true;
      await usingFinanceOrderApi(row.bookId, row.orderId);
      message(`您使用了标题为${row.title}的这条单据`, { type: "info" });
      await onSearch();
    } catch (e) {
      console.error(e);
      message((e as Error)?.message || "使用失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function handleCloseFinanceOrderApi(row: FinanceOrderVo) {
    try {
      loading.value = true;
      await closeFinanceOrderApi(row.bookId, row.orderId);
      message(`您关闭了标题为${row.title}的这条单据`, { type: "info" });
      await onSearch();
    } catch (e) {
      console.error(e);
      message((e as Error)?.message || "使用失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function handleReopenFinanceOrderApi(row: FinanceOrderVo) {
    try {
      loading.value = true;
      await reopenFinanceOrderApi(row.bookId, row.orderId);
      message(`您重开了标题为${row.title}的这条单据`, { type: "info" });
      await onSearch();
    } catch (e) {
      console.error(e);
      message((e as Error)?.message || "使用失败", { type: "error" });
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

  async function openFormDialog(type: "add" | "modify", row?: FinanceOrderVo) {
    try {
      opType.value = type;
      opRow.value = row;
      formVisible.value = true;
    } catch (e) {
      console.error(e);
      ElMessage.error((e as Error)?.message || "加载菜单失败");
    }
  }

  const columns: TableColumnList = [
    {
      label: "标题",
      prop: "title",
      width: 150,
      align: "left"
    },
    {
      label: "单据类型",
      prop: "typeDesc",
      width: 100
    },
    {
      label: "支出金额",
      prop: "outAmount",
      minWidth: 100
    },
    {
      label: "转入金额",
      prop: "inAmount",
      minWidth: 140
    },
    {
      label: "状态",
      prop: "statusDesc",
      minWidth: 100
    },
    {
      label: "单据提交时间",
      prop: "submitTime",
      minWidth: 100
    },
    {
      label: "单据关闭时间",
      prop: "closeTime",
      minWidth: 100
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 200
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];

  return {
    loading,
    groupOptions,
    bookOptions,
    columns,
    dataList,
    defaultGroupId,
    pagination,
    searchForm,
    formVisible,
    opRow,
    opType,
    onSearch,
    openFormDialog,
    handleUsingFinanceOrderApi,
    handleCloseFinanceOrderApi,
    handleReopenFinanceOrderApi,
    resetForm,
    handleRemoveFinanceOrderApi,
    handleSizeChange,
    handleCurrentChange
  };
}
