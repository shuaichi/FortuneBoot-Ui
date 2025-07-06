import { reactive, ref } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "@/views/system/hooks";
import dayjs from "dayjs";
import {
  getRecurringBillPageApi,
  recurringBillDisableApi,
  recurringBillEnableApi,
  RecurringBillQuery,
  RecurringBillVo,
  removeRecurringBillApi
} from "@/api/fortune/recurring-bill";

export function useHook() {
  const { tagStyle } = usePublicHooks();
  const loading = ref(false);
  const dataList = ref<RecurringBillVo[]>([]);
  const searchForm = reactive<RecurringBillQuery>({});
  const pagination = reactive({
    total: 0,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    currentPage: 1,
    background: true
  });
  const billTypeOptions = [
    { value: 1, label: "支出" },
    { value: 2, label: "收入" },
    { value: 3, label: "转账" }
  ];

  const columns: TableColumnList = [
    {
      label: "名称",
      prop: "ruleName",
      width: 120
    },
    {
      label: "cron表达式",
      prop: "cronExpression",
      width: 120
    },
    {
      label: "启用状态",
      prop: "enable",
      width: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.confirm ? 1 : 0)}
          onClick={() => handleEnableClick(row)}
          class="cursor-pointer"
        >
          {row.confirm ? "已确认" : "未确认"}
        </el-tag>
      )
    },
    {
      label: "开始日期",
      prop: "startDate",
      minWidth: 120
    },
    {
      label: "endDate",
      prop: "tradeTime",
      width: 160
    },
    {
      label: "最大执行次数",
      prop: "maxExecutions",
      minWidth: 120
    },
    {
      label: "已经执行次数",
      prop: "executedCount",
      minWidth: 120
    },
    {
      label: "最后一次执行时间",
      prop: "lastExecutedTime",
      width: 100
    },
    {
      label: "下次执行时间",
      prop: "nextExecutionTime",
      width: 120
    },
    {
      label: "补偿策略",
      prop: "recoveryStrategy",
      width: 120
    },
    {
      label: "最大补偿次数",
      prop: "maxRecoveryCount",
      width: 120
    },
    {
      label: "上次补偿时间",
      prop: "lastRecoveryCheck",
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

  async function onSearch() {
    try {
      loading.value = true;
      const { data } = await getRecurringBillPageApi(searchForm);
      dataList.value = data.rows.map((item: any) => ({
        ...item,
        tradeTime: formatDateTime(item.tradeTime)
      }));
      pagination.total = data.total;
    } catch (e) {
      message(e.message || "查询失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  function formatDateTime(dateStr: string) {
    return dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss");
  }

  async function handleDelete(row) {
    try {
      loading.value = true;
      await removeRecurringBillApi(row.bookId, row.ruleId);
      message(`已删除【${row.title}】账单`, { type: "success" });
      await onSearch();
    } catch (e) {
      message(e.message || "删除失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function handleEnableClick(row) {
    try {
      const action = row.confirm ? "取消确认" : "确认";
      await ElMessageBox.confirm(
        `确认${action}【${row.title}】账单吗？`,
        `${action}确认`,
        { confirmButtonText: "确定", cancelButtonText: "取消" }
      );

      if (row.confirm) {
        await recurringBillDisableApi(row.bookId, row.billId);
      } else {
        await recurringBillEnableApi(row.bookId, row.billId);
      }

      message(`${action}成功`);
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
    searchForm.enable = null;
    searchForm.remark = null;
    await onSearch();
  }

  return {
    searchForm,
    dataList,
    columns,
    loading,
    pagination,
    billTypeOptions,
    onSearch,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    resetForm
  };
}
