// import { usePublicHooks } from "@/views/system/hooks";
import { onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import type { PaginationProps } from "@pureadmin/table";
// import { ElMessageBox } from "element-plus";
import { GoodsKeeperQuery, GoodsKeeperVo } from "@/api/fortune/goods-keeper";

// const { tagStyle } = usePublicHooks();

export function useHook() {
  const loading = ref(true);
  const dataList = ref([]);

  // 状态控制
  // const currentRow = ref<GoodsKeeperVo>();
  // const operationType = ref<"enable" | "disable">();
  const defaultGroupId = ref<number>();
  // const defaultBookId = ref<number>();

  onMounted(async () => {
    await onSearch();
  });

  async function onSearch() {
    loading.value = true;

    loading.value = false;
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
      // await removeGroupApi(row.groupId);
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

  const columns: TableColumnList = [
    {
      label: "物品",
      prop: "goodsName",
      width: 100,
      align: "left"
    },
    {
      label: "日均成本",
      prop: "dailyAverageCost",
      width: 100
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
      label: "价格",
      prop: "price",
      minWidth: 100
    },
    {
      label: "购买日期",
      prop: "purchaseDate",
      minWidth: 100
    },
    {
      label: "保修日期",
      prop: "warrantyDate",
      minWidth: 100
    },
    {
      label: "是否按次使用",
      prop: "useByTimesDesc",
      minWidth: 100
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
      width: 100,
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
    handleRemoveGoodsKeeperApi,
    handleSizeChange,
    handleCurrentChange
  };
}
