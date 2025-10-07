import { reactive, ref } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "@/views/system/hooks";
import {
  BillQuery,
  BillVo,
  getBillPage,
  deleteBillApi,
  confirmBillApi,
  unConfirmBillApi,
  includeBillApi,
  excludeBillApi,
  exportBillExcelApi
} from "@/api/fortune/bill";
import dayjs from "dayjs";
import { BillStatisticsVo, getBillStatistics } from "@/api/fortune/include";
import { getCurrencySymbol } from "@/utils/currency";

export function useHook() {
  const { tagStyle } = usePublicHooks();
  const loading = ref(false);
  const dataList = ref<BillVo[]>([]);
  const searchForm = reactive<BillQuery>({});
  const pagination = reactive({
    total: 0,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    currentPage: 1,
    background: true
  });
  const billStatistics = ref<BillStatisticsVo>();
  const billTypeOptions = [
    { value: 1, label: "支出" },
    { value: 2, label: "收入" },
    { value: 3, label: "转账" },
    { value: 4, label: "余额调整" },
    { value: 7, label: "垫付" },
    { value: 8, label: "报销" }
  ];

  const columns: TableColumnList = [
    {
      label: "所属账本",
      prop: "bookName",
      width: 180,
      align: "left"
    },
    {
      label: "标题",
      prop: "title",
      width: 120
    },
    {
      label: "类型",
      prop: "billType",
      width: 120,
      cellRenderer: ({ row }) => {
        const type = billTypeOptions.find(t => t.value === row.billType);
        let color = "";
        if (row.billType === 1 || row.billType === 7) {
          color = "#67C23A"; // 支出-绿色
        } else if (row.billType === 2 || row.billType === 8) {
          color = "#F56C6C"; // 收入-红色
        } else {
          color = "#000000"; // 转账和余额调整-黑色
        }
        return <span style={{ color }}>{type?.label}</span>;
      }
    },
    {
      label: "金额",
      prop: "convertedAmount",
      width: 150,
      formatter: ({
        amount,
        convertedAmount,
        currencyCode,
        toCurrencyCode,
        billType
      }) => {
        // 千分位格式化
        const format = val =>
          val != null
            ? val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : "-";

        // 转账类型且币种不同，展示前后金额
        // 使用全局工具函数获取币种符号
        if (
          billType === 3 &&
          currencyCode &&
          toCurrencyCode &&
          currencyCode !== toCurrencyCode
        ) {
          const fromSym = getCurrencySymbol(currencyCode);
          const toSym = getCurrencySymbol(toCurrencyCode);
          const withSymbol = (sym, code, val) =>
            sym && sym !== code
              ? `${sym}${format(val)}`
              : `${code} ${format(val)}`;
          return `${withSymbol(fromSym, currencyCode, amount)} -> ${withSymbol(
            toSym,
            toCurrencyCode,
            convertedAmount
          )}`;
        }

        // 其他情况，展示原币金额
        const sym = getCurrencySymbol(currencyCode);
        return sym && sym !== currencyCode
          ? `${sym} ${format(amount)}`
          : `${currencyCode} ${format(amount)}`;
      }
    },
    {
      label: "账户",
      prop: "accountName",
      minWidth: 120,
      formatter: ({ accountName, toAccountName, billType }) => {
        if (billType === 3) {
          return accountName + " -> " + toAccountName;
        }
        return accountName;
      }
    },
    {
      label: "交易时间",
      prop: "tradeTime",
      width: 160
    },
    {
      label: "分类",
      prop: "categoryName",
      minWidth: 120
    },
    {
      label: "标签",
      prop: "tagName",
      minWidth: 120
    },
    {
      label: "交易对象",
      prop: "payeeName",
      width: 100
    },
    {
      label: "确认状态",
      prop: "confirm",
      width: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.confirm ? 1 : 0)}
          onClick={() => handleConfirmClick(row)}
          class="cursor-pointer"
        >
          {row.confirm ? "已确认" : "未确认"}
        </el-tag>
      )
    },
    {
      label: "统计状态",
      prop: "include",
      width: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          style={tagStyle.value(row.include ? 1 : 0)}
          onClick={() => handleIncludeClick(row)}
          class="cursor-pointer"
        >
          {row.include ? "已统计" : "不统计"}
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

  async function onSearch() {
    try {
      loading.value = true;
      const params = {
        ...searchForm,
        tradeTimeStartTime: searchForm.tradeTimeRange?.[0],
        tradeTimeEndTime: searchForm.tradeTimeRange?.[1]
      };

      const { data } = await getBillPage(params);
      dataList.value = data.rows.map(item => ({
        ...item,
        tradeTime: formatDateTime(item.tradeTime),
        tagName: item.tagList
          ? item.tagList.map(tag => tag.tagName).join(", ")
          : "-",
        categoryName: item.categoryAmountPair
          ? item.categoryAmountPair
              .map(category => category.categoryName)
              .join(", ")
          : "-",
        payeeName: item.payeeName ? item.payeeName : "-"
      }));
      pagination.total = data.total;
      const statisticsRes = await getBillStatistics(params);
      billStatistics.value = statisticsRes.data;
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
      await deleteBillApi(row.bookId, row.billId);
      message(`已删除【${row.title}】账单`, { type: "success" });
      await onSearch();
    } catch (e) {
      message(e.message || "删除失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function handleConfirmClick(row) {
    try {
      const action = row.confirm ? "取消确认" : "确认";
      await ElMessageBox.confirm(
        `确认${action}【${row.title}】账单吗？`,
        `${action}确认`,
        { confirmButtonText: "确定", cancelButtonText: "取消" }
      );

      if (row.confirm) {
        await unConfirmBillApi(row.bookId, row.billId);
      } else {
        await confirmBillApi(row.bookId, row.billId);
      }

      message(`${action}成功`);
      await onSearch();
    } catch (error) {
      console.log("操作取消");
    }
  }

  async function handleIncludeClick(row) {
    try {
      const action = row.include ? "排除统计" : "包含统计";
      await ElMessageBox.confirm(
        `确认${action}【${row.title}】账单吗？`,
        `${action}确认`,
        { confirmButtonText: "确定", cancelButtonText: "取消" }
      );

      if (row.include) {
        await excludeBillApi(row.bookId, row.billId);
      } else {
        await includeBillApi(row.bookId, row.billId);
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
    searchForm.tradeTimeRange = [null, null];
    searchForm.accountId = null;
    searchForm.billType = null;
    searchForm.title = null;
    searchForm.amountMin = null;
    searchForm.amountMax = null;
    searchForm.categoryIds = [];
    searchForm.tagIds = [];
    searchForm.payeeId = null;
    searchForm.confirm = null;
    searchForm.include = null;
    searchForm.remark = null;
    await onSearch();
  }

  async function exportAllExcel() {
    loading.value = true;
    const params = {
      ...searchForm,
      tradeTimeStartTime: searchForm.tradeTimeRange?.[0],
      tradeTimeEndTime: searchForm.tradeTimeRange?.[1]
    };
    exportBillExcelApi(params, "账单.xls");
    loading.value = false;
  }

  return {
    searchForm,
    dataList,
    columns,
    loading,
    pagination,
    billTypeOptions,
    billStatistics,
    onSearch,
    exportAllExcel,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    resetForm
  };
}
