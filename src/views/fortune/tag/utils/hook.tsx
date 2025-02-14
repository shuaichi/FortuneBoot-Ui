import { usePublicHooks } from "@/views/system/hooks";
import { reactive, ref } from "vue";
import { message } from "@/utils/message";
import type { PaginationProps } from "@pureadmin/table";
import { ElMessageBox } from "element-plus";
import { getBookById } from "@/api/fortune/book";
import {
  getTagPageApi,
  moveTag2RecycleBinApi,
  tagCanExpenseApi,
  tagCanIncomeApi,
  tagCannotExpenseApi,
  tagCannotIncomeApi,
  tagCannotTransferApi,
  tagCanTransferApi,
  tagDisableApi,
  tagEnableApi,
  TagQuery,
  TagVo
} from "@/api/fortune/tag";

const { tagStyle } = usePublicHooks();
export function useHook() {
  const loading = ref(true);
  const title = ref<string>(null);
  const dataList = ref([]);
  const searchForm = reactive<TagQuery>({});

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  function resetForm() {
    searchForm.canIncome = null;
    searchForm.canExpense = null;
    searchForm.canTransfer = null;
    searchForm.enable = null;
    searchForm.tagName = null;
    onSearch();
  }

  async function onSearch() {
    try {
      const [data, book] = await Promise.all([
        getTagPageApi(searchForm),
        getBookById(searchForm.bookId)
      ]);
      dataList.value = data.data.rows;
      title.value = book.data.bookName;
      pagination.total = data.data.total;
    } catch (e) {
      message(e.message || "查询失败", { type: "error" });
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

  async function handleCanExpenseClick(row: TagVo) {
    try {
      const action = row.canExpense ? "不可支出" : "可支出";
      await ElMessageBox.confirm(
        `确认${action}【${row.tagName}】吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      if (row.canExpense) {
        await tagCannotExpenseApi(row.bookId, row.tagId);
      } else {
        await tagCanExpenseApi(row.bookId, row.tagId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  async function handleCanIncomeClick(row: TagVo) {
    try {
      const action = row.canIncome ? "不可收入" : "可收入";
      await ElMessageBox.confirm(
        `确认${action}【${row.tagName}】吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      if (row.canIncome) {
        await tagCannotIncomeApi(row.bookId, row.tagId);
      } else {
        await tagCanIncomeApi(row.bookId, row.tagId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  async function handleCanTransferClick(row: TagVo) {
    try {
      const action = row.canTransfer ? "不可转账" : "可转账";
      await ElMessageBox.confirm(
        `确认${action}【${row.tagName}】吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      if (row.canTransfer) {
        await tagCannotTransferApi(row.bookId, row.tagId);
      } else {
        await tagCanTransferApi(row.bookId, row.tagId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  async function handleStatusClick(row: TagVo) {
    try {
      const action = row.enable ? "停用" : "启用";
      await ElMessageBox.confirm(
        `确认${action}【${row.tagName}】吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      if (row.enable) {
        await tagDisableApi(row.bookId, row.tagId);
      } else {
        await tagEnableApi(row.bookId, row.tagId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  async function handleMove2RecycleBin(row: TagVo) {
    try {
      loading.value = true;
      await moveTag2RecycleBinApi(row.bookId, row.tagId);
      message(`已将【${row.tagName}】移入回收站`, { type: "success" });
      await onSearch();
    } catch (e) {
      message(e.message || "移入回收站失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  const columns: TableColumnList = [
    {
      label: "标签名称",
      prop: "tagName",
      minWidth: 200,
      align: "left"
    },
    {
      label: "支出状态",
      prop: "canExpense",
      width: 200,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.canExpense ? 1 : 0)}
          onClick={() => handleCanExpenseClick(row)}
          class="cursor-pointer"
        >
          {row.canExpense ? "可支出" : "不可支出"}
        </el-tag>
      )
    },
    {
      label: "收入状态",
      prop: "canIncome",
      width: 200,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.canIncome ? 1 : 0)}
          onClick={() => handleCanIncomeClick(row)}
          class="cursor-pointer"
        >
          {row.canIncome ? "可收入" : "不可收入"}
        </el-tag>
      )
    },
    {
      label: "转账状态",
      prop: "canTransfer",
      width: 200,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.canTransfer ? 1 : 0)}
          onClick={() => handleCanTransferClick(row)}
          class="cursor-pointer"
        >
          {row.canTransfer ? "可转账" : "不可转账"}
        </el-tag>
      )
    },
    {
      label: "启用状态",
      prop: "enable",
      width: 200,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.enable ? 1 : 0)}
          onClick={() => handleStatusClick(row)}
          class="cursor-pointer"
        >
          {row.enable ? "启用" : "停用"}
        </el-tag>
      )
    },
    {
      label: "顺序",
      prop: "sort",
      width: 200
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
      width: 200
    }
  ];

  return {
    searchForm,
    loading,
    title,
    columns,
    dataList,
    pagination,
    resetForm,
    onSearch,
    handleMove2RecycleBin,
    handleSizeChange,
    handleCurrentChange
  };
}
