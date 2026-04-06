import { usePublicHooks } from "@/views/system/hooks";
import { reactive, ref } from "vue";
import { message } from "@/utils/message";
import type { PaginationProps } from "@pureadmin/table";
import { ElMessageBox } from "element-plus";
import {
  getMemberPageApi,
  moveMember2RecycleBinApi,
  memberDisableApi,
  memberEnableApi,
  type MemberQuery,
  type MemberVo
} from "@/api/fortune/member";
import { getBookById } from "@/api/fortune/book";

const { tagStyle } = usePublicHooks();

export function useHook() {
  const loading = ref(true);
  const title = ref<string>(null);
  const dataList = ref([]);
  const searchForm = reactive<MemberQuery>({});

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    currentPage: 1,
    background: true
  });

  function resetForm() {
    searchForm.enable = null;
    searchForm.memberName = null;
    onSearch();
  }

  async function onSearch() {
    try {
      loading.value = true;
      const [data, book] = await Promise.all([
        getMemberPageApi(searchForm),
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

  async function handleStatusClick(row: MemberVo) {
    try {
      const action = row.enable ? "停用" : "启用";
      await ElMessageBox.confirm(
        `确认${action}【${row.memberName}】吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      if (row.enable) {
        await memberDisableApi(row.bookId, row.memberId);
      } else {
        await memberEnableApi(row.bookId, row.memberId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消", error);
    }
  }

  async function handleMove2RecycleBin(row: MemberVo) {
    try {
      loading.value = true;
      await moveMember2RecycleBinApi(row.bookId, row.memberId);
      message(`已将【${row.memberName}】移入回收站`, { type: "success" });
      await onSearch();
    } catch (e) {
      message(e.message || "移入回收站失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  const columns: TableColumnList = [
    {
      label: "名称",
      prop: "memberName",
      minWidth: 200,
      align: "left"
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
