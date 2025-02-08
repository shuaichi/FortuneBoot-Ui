import { reactive, ref } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "@/views/system/hooks";
import {
  AccountQuery,
  AccountVo,
  getFortuneAccountPage,
  enableAccountApi,
  disableAccountApi,
  move2RecycleBinApi,
  canIncomeApi,
  cannotIncomeApi,
  cannotTransferOutApi,
  canTransferOutApi,
  canExpenseApi,
  cannotExpenseApi,
  canTransferInApi,
  cannotTransferInApi,
  includeAccountApi,
  excludeAccountApi
} from "@/api/fortune/account";
import { getEnableGroupList } from "@/api/fortune/group";
import dayjs from "dayjs";

export function useHook() {
  const { tagStyle } = usePublicHooks();
  const loading = ref(false);
  const dataList = ref<AccountVo[]>([]);
  const searchFormParams = reactive<AccountQuery>({});
  const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const accountTypeOptions = [
    { value: 1, label: "活期" },
    { value: 2, label: "信用" },
    { value: 3, label: "资产" },
    { value: 4, label: "贷款" }
  ];

  const columns: TableColumnList = [
    {
      label: "账户名称",
      prop: "accountName",
      width: 150,
      align: "left"
    },
    {
      label: "账户类型",
      prop: "accountType",
      width: 100,
      formatter: ({ accountType }) =>
        accountTypeOptions.find(t => t.value === accountType)?.label
    },
    {
      label: "币种",
      prop: "currencyCode",
      width: 80
    },
    {
      label: "余额",
      prop: "balance",
      width: 150,
      formatter: ({ balance, currencyCode }) => {
        if (!balance) {
          return "-";
        }
        const formattedAmount = balance
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return currencyCode === "CNY"
          ? `￥${formattedAmount}`
          : `$${formattedAmount}`;
      }
    },
    {
      label: "额度",
      prop: "creditLimit",
      width: 120,
      formatter: ({ creditLimit, currencyCode }) => {
        if (!creditLimit) {
          return "-";
        }
        const formattedAmount = creditLimit
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return currencyCode === "CNY"
          ? `￥${formattedAmount}`
          : `$${formattedAmount}`;
      },
      hide: true
    },
    {
      label: "利率",
      prop: "apr",
      width: 80,
      formatter: ({ apr }) => (apr ? `${apr}%` : "-"),
      hide: true
    },
    {
      label: "账单日",
      width: 100,
      prop: "billDay",
      formatter: ({ billDay }) =>
        billDay ? dayjs(billDay).format("YYYY-MM-DD") : null,
      hide: true
    },
    {
      label: "还款日",
      width: 100,
      prop: "repayDay",
      formatter: ({ repayDay }) =>
        repayDay ? dayjs(repayDay).format("YYYY-MM-DD") : null,
      hide: true
    },
    {
      label: "可支出",
      prop: "canExpense",
      width: 100,
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
      label: "可收入",
      prop: "canIncome",
      width: 100,
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
      label: "可转出",
      prop: "canTransferOut",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.canTransferOut ? 1 : 0)}
          onClick={() => handleCanTransferOutClick(row)}
          class="cursor-pointer"
        >
          {row.canTransferOut ? "可转出" : "不可转出"}
        </el-tag>
      )
    },
    {
      label: "可转入",
      prop: "canTransferIn",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.canTransferIn ? 1 : 0)}
          onClick={() => handleCanTransferInClick(row)}
          class="cursor-pointer"
        >
          {row.canTransferIn ? "可转入" : "不可转入"}
        </el-tag>
      )
    },
    {
      label: "计入净资产",
      prop: "include",
      width: 120,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.include ? 1 : 0)}
          onClick={() => handleIncludeClick(row)}
          class="cursor-pointer"
        >
          {row.include ? "计入净资产" : "不计入净资产"}
        </el-tag>
      )
    },
    {
      label: "是否启用",
      prop: "enable",
      width: 100,
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

  async function onSearch(barRef?: any) {
    try {
      loading.value = true;
      console.log("onSearch");
      hideColumn(barRef);
      searchFormParams.recycleBin = false;
      const { data } = await getFortuneAccountPage({
        ...searchFormParams,
        pageSize: pagination.pageSize,
        pageNum: pagination.currentPage
      });
      dataList.value = data.rows;
      pagination.total = data.total;
    } catch (e) {
      message(e.message || "查询失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  function hideColumn(barRef?: any) {
    const type = searchFormParams.accountType;
    barRef?.handleCheckColumnListChange(type === 4, "利率");
    barRef?.handleCheckColumnListChange(type === 4 || type === 2, "额度");
    barRef?.handleCheckColumnListChange(type === 2, "账单日");
    barRef?.handleCheckColumnListChange(type === 4 || type === 2, "还款日");
  }

  async function handleCanExpenseClick(row: AccountVo) {
    try {
      const action = row.canExpense ? "不可支出" : "可支出";
      await ElMessageBox.confirm(
        `确认${action}【${row.accountName}】账户吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      if (row.canExpense) {
        await cannotExpenseApi(row.groupId, row.accountId);
      } else {
        await canExpenseApi(row.groupId, row.accountId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  async function handleCanIncomeClick(row: AccountVo) {
    try {
      const action = row.canIncome ? "不可收入" : "可收入";
      await ElMessageBox.confirm(
        `确认${action}【${row.accountName}】账户吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      if (row.canIncome) {
        await cannotIncomeApi(row.groupId, row.accountId);
      } else {
        await canIncomeApi(row.groupId, row.accountId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  async function handleCanTransferOutClick(row: AccountVo) {
    try {
      const action = row.canTransferOut ? "不可转出" : "可转出";
      await ElMessageBox.confirm(
        `确认${action}【${row.accountName}】账户吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      if (row.canTransferOut) {
        await cannotTransferOutApi(row.groupId, row.accountId);
      } else {
        await canTransferOutApi(row.groupId, row.accountId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  async function handleCanTransferInClick(row: AccountVo) {
    try {
      const action = row.canTransferIn ? "不可转入" : "可转入";
      await ElMessageBox.confirm(
        `确认${action}【${row.accountName}】账户吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      if (row.canTransferIn) {
        await cannotTransferInApi(row.groupId, row.accountId);
      } else {
        await canTransferInApi(row.groupId, row.accountId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  async function handleIncludeClick(row: AccountVo) {
    try {
      const action = row.include ? "不计入" : "计入";
      await ElMessageBox.confirm(
        `确认${action}【${row.accountName}】账户吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      if (row.include) {
        await excludeAccountApi(row.groupId, row.accountId);
      } else {
        await includeAccountApi(row.groupId, row.accountId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  async function handleStatusClick(row: AccountVo) {
    try {
      const action = row.enable ? "停用" : "启用";
      await ElMessageBox.confirm(
        `确认${action}【${row.accountName}】账户吗？`,
        `${action}确认`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      );

      if (row.enable) {
        await disableAccountApi(row.groupId, row.accountId);
      } else {
        await enableAccountApi(row.groupId, row.accountId);
      }
      message(`${action}成功`, { type: "success" });
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  async function handleMove2RecycleBin(row: AccountVo) {
    try {
      loading.value = true;
      await move2RecycleBinApi(row.groupId, row.accountId);
      message(`已将【${row.accountName}】账户移入回收站`, { type: "success" });
      await onSearch();
    } catch (e) {
      message(e.message || "移入回收站失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function resetForm() {
    searchFormParams.accountName = null;
    const res = await getEnableGroupList();
    if (res.data.length === 0) {
      message("请先启用或创建分组");
    }
    searchFormParams.groupId = res.data[0].groupId;
    await onSearch();
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
    searchFormParams,
    loading,
    columns,
    dataList,
    pagination,
    accountTypeOptions,
    resetForm,
    onSearch,
    handleMove2RecycleBin,
    handleSizeChange,
    handleCurrentChange
  };
}
