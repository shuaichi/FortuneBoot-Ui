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
  moveAccount2RecycleBinApi,
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
import { getDefaultGroupId } from "@/api/fortune/group";
import dayjs from "dayjs";

export function useHook() {
  const { tagStyle } = usePublicHooks();
  const loading = ref(false);
  const dataList = ref<AccountVo[]>([]);
  const searchForm = reactive<AccountQuery>({});
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
        // 货币符号映射
        const currencySymbols = {
          // 人民币
          CNY: "￥",
          // 美元
          USD: "$",
          // 欧元
          EUR: "€",
          // 英镑
          GBP: "£",
          // 日元
          JPY: "¥",
          // 澳元
          AUD: "A$",
          // 加元
          CAD: "C$",
          // 印度卢比
          INR: "₹",
          // 港币
          HKD: "HK$",
          // 新西兰元
          NZD: "NZ$",
          // 瑞典克朗
          SEK: "Kr",
          // 韩币
          KRW: "₩",
          // 新加坡元
          SGD: "S$",
          // 卢布
          RUB: "₽",
          // 南非兰特
          ZAR: "R",
          //泰铢
          THB: "฿"
        };
        // 默认使用美元符号
        const symbol = currencySymbols[currencyCode] || "$";
        return `${symbol}${formattedAmount}`;
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
        // 货币符号映射
        const currencySymbols = {
          // 人民币
          CNY: "￥",
          // 美元
          USD: "$",
          // 欧元
          EUR: "€",
          // 英镑
          GBP: "£",
          // 日元
          JPY: "¥",
          // 澳元
          AUD: "A$",
          // 加元
          CAD: "C$",
          // 印度卢比
          INR: "₹",
          // 港币
          HKD: "HK$",
          // 新西兰元
          NZD: "NZ$",
          // 瑞典克朗
          SEK: "Kr",
          // 韩币
          KRW: "₩",
          // 新加坡元
          SGD: "S$",
          // 卢布
          RUB: "₽",
          // 南非兰特
          ZAR: "R",
          //泰铢
          THB: "฿"
        };
        // 默认使用美元符号
        const symbol = currencySymbols[currencyCode] || "$";
        return `${symbol}${formattedAmount}`;
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
      label: "支出状态",
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
      label: "收入状态",
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
      label: "转出状态",
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
      label: "转入状态",
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
      label: "启用状态",
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
      hideColumn(barRef);
      const data = await getFortuneAccountPage(searchForm);
      dataList.value = data.data.rows;
      pagination.total = data.data.total;
    } catch (e) {
      message(e.message || "查询失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  function hideColumn(barRef?: any) {
    const type = searchForm.accountType;
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
      await moveAccount2RecycleBinApi(row.groupId, row.accountId);
      message(`已将【${row.accountName}】账户移入回收站`, { type: "success" });
      await onSearch();
    } catch (e) {
      message(e.message || "移入回收站失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function resetForm() {
    searchForm.pageSize = 10;
    searchForm.pageNum = 1;
    searchForm.accountName = null;
    searchForm.currencyCode = null;
    searchForm.include = null;
    searchForm.canExpense = null;
    searchForm.canIncome = null;
    searchForm.canTransferOut = null;
    searchForm.canTransferIn = null;
    searchForm.enable = null;
    const defaultGroup = await getDefaultGroupId();
    searchForm.groupId = defaultGroup.data;
    await onSearch();
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

  return {
    searchForm,
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
