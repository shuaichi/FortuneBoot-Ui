import { onMounted, reactive, ref } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "@/views/system/hooks";
import {
  BookQuery,
  BookVo,
  getFortuneBookPage,
  enableBookApi,
  disableBookApi,
  bookMove2RecycleBinApi
} from "@/api/fortune/book";
import { getEnableGroupList } from "@/api/fortune/group";

export function useHook() {
  const { tagStyle } = usePublicHooks();
  const loading = ref(true);
  const dataList = ref<BookVo[]>([]);
  const searchForm = reactive<BookQuery>({});
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
      minWidth: 200
    },
    {
      label: "操作",
      slot: "operation",
      fixed: "right",
      width: 180
    }
  ];

  onMounted(async () => {
    const res = await getEnableGroupList();
    if (res.data.length === 0) {
      message("请先启用或创建分组");
    }
    searchForm.recycleBin = false;
    searchForm.groupId = res.data[0].groupId;
    await onSearch();
  });

  async function onSearch() {
    try {
      loading.value = true;
      const { data } = await getFortuneBookPage(searchForm);
      const group = await getEnableGroupList();
      if (group.data.length === 0) {
        message("请先启用或创建分组");
      }
      dataList.value = data.rows.map(item => {
        return {
          ...item,
          groupName: group.data.find(g => g.groupId === item.groupId).groupName
        };
      });
      pagination.total = data.total;
    } catch (e) {
      message(e.message || "查询失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function handleRecycleBin(row: BookVo) {
    try {
      loading.value = true;
      await bookMove2RecycleBinApi(row.bookId);
      message(`已删除【${row.bookName}】账本`, { type: "success" });
      await onSearch();
    } catch (e) {
      message(e.message || "删除失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function handleStatusClick(row: BookVo) {
    try {
      const action = row.enable ? "停用" : "启用";
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
        await disableBookApi(row.bookId);
      } else {
        await enableBookApi(row.bookId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  function handleSizeChange(pageSize: number) {
    pagination.pageSize = pageSize;
    searchForm.pageSize = pageSize;
    onSearch();
  }

  function handleCurrentChange(currentPage: number) {
    pagination.currentPage = currentPage;
    searchForm.pageNum = currentPage;
    onSearch();
  }

  async function resetForm() {
    searchForm.bookName = null;
    searchForm.enable = null;
    const res = await getEnableGroupList();
    if (res.data.length === 0) {
      message("请先启用或创建分组");
    }
    searchForm.groupId = res.data[0].groupId;
    await onSearch();
  }

  return {
    searchFormParams: searchForm,
    resetForm,
    loading,
    columns,
    dataList,
    pagination,
    tagStyle,
    onSearch,
    handleRecycleBin,
    handleSizeChange,
    handleCurrentChange
  };
}
