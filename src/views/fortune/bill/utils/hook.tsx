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
  excludeBillApi
} from "@/api/fortune/bill";
import dayjs from "dayjs";
import { BillStatisticsVo, getBillStatistics } from "@/api/fortune/include";

export function useHook() {
  const { tagStyle } = usePublicHooks();
  const loading = ref(false);
  const dataList = ref<BillVo[]>([]);
  const searchForm = reactive<BillQuery>({});
  const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const billStatistics = ref<BillStatisticsVo>();
  const billTypeOptions = [
    { value: 1, label: "支出" },
    { value: 2, label: "收入" },
    { value: 3, label: "转账" },
    { value: 4, label: "余额调整" }
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
      formatter: ({ billType }) =>
        billTypeOptions.find(t => t.value === billType)?.label
    },
    {
      label: "金额",
      prop: "convertedAmount",
      width: 150,
      formatter: ({ convertedAmount, currencyCode }) => {
        if (!convertedAmount) {
          return "-";
        }
        const formattedAmount = convertedAmount
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
        const symbol = currencySymbols[currencyCode] || currencyCode;
        return `${symbol}${formattedAmount}`;
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
      const statisticsRes = await getBillStatistics(params.bookId);
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

  return {
    searchForm,
    dataList,
    columns,
    loading,
    pagination,
    billTypeOptions,
    billStatistics,
    onSearch,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    resetForm
  };
}
