import { onMounted, reactive, ref } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import { getEnableBookList, type BookVo } from "@/api/fortune/book";
import {
  getDefaultGroupId,
  getEnableGroupList,
  type GroupVo
} from "@/api/fortune/group";
import {
  getFinanceOrderPageV2,
  getFinanceOrderSummaryV2,
  type FinanceOrderDetailVo,
  type FinanceOrderPageQuery,
  type FinanceOrderSummaryVo
} from "@/api/fortune/finance-order-v2";
import { message } from "@/utils/message";
import {
  ENTRY_ACTION_META,
  ORDER_STATUS,
  ORDER_TYPE,
  ORDER_TYPE_META,
  type EntryAction,
  type OrderStatus,
  type OrderType
} from "./order-contract";
import { isMoneyGreaterThan } from "./order-money";

export interface FinanceOrderWorkbenchQuery extends FinanceOrderPageQuery {
  groupId?: number;
}

export function useFinanceOrderList() {
  const loading = ref(false);
  const summaryLoading = ref(false);
  const dataList = ref<Array<FinanceOrderDetailVo>>([]);
  const summary = ref<FinanceOrderSummaryVo | null>(null);
  const groupOptions = ref<Array<GroupVo>>([]);
  const bookOptions = ref<Array<BookVo>>([]);

  const searchForm = reactive<FinanceOrderWorkbenchQuery>({
    groupId: undefined,
    bookId: undefined,
    type: ORDER_TYPE.LOAN_OUT,
    status: ORDER_STATUS.ONGOING,
    keyword: "",
    overdueOnly: false,
    pageNum: 1,
    pageSize: 20
  });

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 20,
    pageSizes: [20, 50, 100],
    currentPage: 1,
    background: true
  });

  const pageRequestSeq = ref(0);
  const summaryRequestSeq = ref(0);

  async function loadPage() {
    if (searchForm.bookId == null) return;
    const seq = ++pageRequestSeq.value;
    loading.value = true;
    try {
      const page = await getFinanceOrderPageV2({
        bookId: searchForm.bookId,
        type: searchForm.type,
        status: searchForm.status,
        keyword: searchForm.keyword,
        overdueOnly: searchForm.overdueOnly,
        pageNum: searchForm.pageNum,
        pageSize: searchForm.pageSize
      });
      if (seq !== pageRequestSeq.value) return;
      dataList.value = page.rows ?? [];
      pagination.total = page.total ?? 0;
      pagination.currentPage = searchForm.pageNum ?? 1;
      pagination.pageSize = searchForm.pageSize ?? 20;
    } catch (e) {
      if (seq === pageRequestSeq.value) {
        message((e as Error)?.message || "单据查询失败", { type: "error" });
      }
    } finally {
      if (seq === pageRequestSeq.value) loading.value = false;
    }
  }

  async function loadSummary() {
    if (searchForm.bookId == null) return;
    const seq = ++summaryRequestSeq.value;
    summaryLoading.value = true;
    try {
      const result = await getFinanceOrderSummaryV2(searchForm.bookId);
      if (seq !== summaryRequestSeq.value) return;
      summary.value = result;
    } catch (e) {
      if (seq === summaryRequestSeq.value) {
        message((e as Error)?.message || "单据汇总查询失败", {
          type: "error"
        });
      }
    } finally {
      if (seq === summaryRequestSeq.value) summaryLoading.value = false;
    }
  }

  async function refreshData(options: { resetPage?: boolean } = {}) {
    if (options.resetPage) {
      searchForm.pageNum = 1;
      pagination.currentPage = 1;
    }
    await Promise.all([loadPage(), loadSummary()]);
  }

  async function handleGroupChange(groupId?: number) {
    if (groupId == null) return;
    searchForm.groupId = groupId;
    try {
      const bookRes = await getEnableBookList(groupId);
      bookOptions.value = bookRes.data ?? [];
      if (bookOptions.value.length === 0) {
        message("请先启用或创建账本", { type: "warning" });
        return;
      }
      const currentGroup = groupOptions.value.find(
        item => item.groupId === groupId
      );
      searchForm.bookId =
        currentGroup?.defaultBookId ?? bookOptions.value[0].bookId;
      await refreshData({ resetPage: true });
    } catch (e) {
      message((e as Error)?.message || "账本查询失败", { type: "error" });
    }
  }

  function handleTypeChange(type: OrderType) {
    searchForm.type = type;
    refreshData({ resetPage: true });
  }

  function handleStatusChange(status: OrderStatus) {
    searchForm.status = status;
    refreshData({ resetPage: true });
  }

  function handleSearch() {
    refreshData({ resetPage: true });
  }

  function resetFilters() {
    searchForm.keyword = "";
    searchForm.overdueOnly = false;
    refreshData({ resetPage: true });
  }

  function handleSizeChange(pageSize: number) {
    searchForm.pageSize = pageSize;
    searchForm.pageNum = 1;
    pagination.pageSize = pageSize;
    pagination.currentPage = 1;
    loadPage();
  }

  function handleCurrentChange(currentPage: number) {
    searchForm.pageNum = currentPage;
    pagination.currentPage = currentPage;
    loadPage();
  }

  function primaryRowAction(row: FinanceOrderDetailVo): EntryAction | null {
    const meta = ORDER_TYPE_META[row.type];
    if (!meta || !row.allowedEntryActions?.includes(meta.settleAction)) {
      return null;
    }
    return row.pendingAmount != null &&
      isMoneyGreaterThan(row.pendingAmount, "0")
      ? meta.settleAction
      : null;
  }

  function hasMoreRowActions(row: FinanceOrderDetailVo) {
    const primary = primaryRowAction(row);
    const secondaryEntryActions = (row.allowedEntryActions ?? []).filter(
      action => action !== primary
    );
    return (
      secondaryEntryActions.length > 0 ||
      row.canEdit ||
      row.canDelete ||
      row.canClose ||
      row.canReopen
    );
  }

  function visibleRowActions(row: FinanceOrderDetailVo) {
    const actions = ["VIEW"];
    const primary = primaryRowAction(row);
    if (primary) actions.push(primary);
    if (hasMoreRowActions(row)) actions.push("MORE");
    return actions;
  }

  onMounted(async () => {
    try {
      const [groupRes, defaultGroupRes] = await Promise.all([
        getEnableGroupList(),
        getDefaultGroupId()
      ]);
      groupOptions.value = groupRes.data ?? [];
      if (groupOptions.value.length === 0) {
        message("请先启用或创建分组", { type: "warning" });
        return;
      }
      await handleGroupChange(
        defaultGroupRes.data ?? groupOptions.value[0].groupId
      );
    } catch (e) {
      message((e as Error)?.message || "初始化单据数据失败", {
        type: "error"
      });
    }
  });

  return {
    loading,
    summaryLoading,
    dataList,
    summary,
    groupOptions,
    bookOptions,
    searchForm,
    pagination,
    loadPage,
    loadSummary,
    refreshData,
    handleGroupChange,
    handleTypeChange,
    handleStatusChange,
    handleSearch,
    resetFilters,
    handleSizeChange,
    handleCurrentChange,
    primaryRowAction,
    hasMoreRowActions,
    visibleRowActions
  };
}

export function entryActionLabel(action: EntryAction) {
  return ENTRY_ACTION_META[action].label;
}
