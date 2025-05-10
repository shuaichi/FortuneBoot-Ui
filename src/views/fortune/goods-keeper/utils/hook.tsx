// import { usePublicHooks } from "@/views/system/hooks";
import { computed, onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import type { PaginationProps } from "@pureadmin/table";
import { ElMessage } from "element-plus";
import {
  getFortuneGoodsKeeperPage,
  getGoodsKeeperStatistics,
  GoodsKeeperQuery,
  goodsKeeperStatistics,
  GoodsKeeperVo,
  removeGoodsKeeperApi
} from "@/api/fortune/goods-keeper";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { BookVo, getEnableBookList } from "@/api/fortune/book";

export function useHook() {
  const loading = ref(true);
  const dataList = ref([]);

  // 状态控制
  const defaultGroupId = ref<number>();
  const groupOptions = ref<Array<GroupVo>>();
  const bookOptions = ref<Array<BookVo>>();

  const opType = ref<"add" | "modify">("add");
  const opRow = ref<GoodsKeeperVo>();
  const formVisible = ref<boolean>(false);

  const goodsKeeperStatistics = ref<goodsKeeperStatistics>();

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
    console.log(searchForm.groupId);
    const booksRes = await getEnableBookList(searchForm.groupId);
    bookOptions.value = booksRes.data;
    searchForm.bookId = groupOptions.value.find(
      group => group.groupId === searchForm.groupId
    ).defaultBookId;
    await onSearch();
  });

  const tableTitle = computed(() => {
    // eslint-disable-next-line no-irregular-whitespace
    return `归物　|　总资产：${
      goodsKeeperStatistics.value?.allPrice ?? 0
      // eslint-disable-next-line no-irregular-whitespace
    }元　|　总日均资产：${
      goodsKeeperStatistics.value?.allDailyPrice ?? 0
      // eslint-disable-next-line no-irregular-whitespace
    }元　|　在役资产：${
      goodsKeeperStatistics.value?.activePrice ?? 0
      // eslint-disable-next-line no-irregular-whitespace
    }元　|　在役日均资产：${
      goodsKeeperStatistics.value?.activeDailyPrice ?? 0
    }元`;
  });

  async function onSearch() {
    loading.value = true;
    const res = await getFortuneGoodsKeeperPage(searchForm);
    dataList.value = res.data.rows;
    const statistics = await getGoodsKeeperStatistics(searchForm.bookId);
    goodsKeeperStatistics.value = statistics.data;
    loading.value = false;
  }

  function resetForm() {
    searchForm.goodsName = "";
  }

  const searchForm = reactive<GoodsKeeperQuery>({});
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  async function handleRemoveGoodsKeeperApi(row: GoodsKeeperVo) {
    try {
      loading.value = true;
      await removeGoodsKeeperApi(row.bookId, row.goodsKeeperId);
      message(`您删除了物品名称为${row.goodsName}的这条数据`, { type: "info" });
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

  async function openFormDialog(type: "add" | "modify", row?: GoodsKeeperVo) {
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
      label: "物品",
      prop: "goodsName",
      width: 150,
      align: "left"
    },
    {
      label: "日均成本",
      prop: "dailyAverageCost",
      width: 100
    },
    {
      label: "价格",
      prop: "price",
      minWidth: 100
    },
    {
      label: "持有时间（天）",
      prop: "holdingTime",
      minWidth: 140
    },
    {
      label: "购买日期",
      prop: "purchaseDate",
      minWidth: 100
    },
    {
      label: "分类",
      prop: "categoryName",
      minWidth: 100
    },
    {
      label: "标签",
      prop: "tagName",
      minWidth: 100
    },
    {
      label: "保修日期",
      prop: "warrantyDate",
      minWidth: 100
    },
    {
      label: "是否过保",
      prop: "isOverWarranty",
      minWidth: 100
    },
    {
      label: "是否按次使用",
      prop: "useByTimesDesc",
      minWidth: 120
    },
    {
      label: "使用次数",
      prop: "usageNum",
      minWidth: 100
    },
    {
      label: "状态",
      prop: "statusDesc",
      minWidth: 100
    },
    {
      label: "退役日期",
      prop: "retiredDate",
      minWidth: 100
    },
    {
      label: "出售价格",
      prop: "soldPrice",
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
      width: 120,
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
    tableTitle,
    onSearch,
    openFormDialog,
    resetForm,
    handleRemoveGoodsKeeperApi,
    handleSizeChange,
    handleCurrentChange
  };
}
