import { reactive, ref } from "vue";
import { message } from "@/utils/message";
import { ElMessageBox, type Sort } from "element-plus";
import { usePublicHooks } from "@/views/system/hooks";
import {
  type BillQuery,
  type BillVo,
  getBillPage,
  deleteBillApi,
  confirmBillApi,
  unConfirmBillApi,
  includeBillApi,
  excludeBillApi,
  exportBillExcelApi
} from "@/api/fortune/bill";
import dayjs from "dayjs";
import {
  type BillStatisticsVo,
  getBillStatistics
} from "@/api/fortune/include";
import { getCurrencySymbol } from "@/utils/currency";

// 千分位 + 两位小数格式化（纯函数）
const formatMoney = (val: unknown): string => {
  if (val == null || val === "") return "-";
  const num = Number(val);
  if (Number.isNaN(num)) return "-";
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 带币种符号格式化
const withSymbol = (sym: string, code: string, val: unknown): string =>
  sym && sym !== code
    ? `${sym}${formatMoney(val)}`
    : `${code} ${formatMoney(val)}`;

// 安全数字
const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

interface ExtraSums {
  fee: number; // 手续费总额（accountSide=1）
  discount: number; // 优惠总额（accountSide=1）
  feeTo: number; // 手续费总额（accountSide=2）
  discountTo: number; // 优惠总额（accountSide=2）
}

/**
 * 汇总附加费用/优惠：
 * 默认 accountSide=1（转出方/主账户）。
 * 转账场景下 accountSide=2 表示作用于转入方金额。
 */
function sumExtras(extras: any[] | undefined): ExtraSums {
  const init: ExtraSums = { fee: 0, discount: 0, feeTo: 0, discountTo: 0 };
  if (!Array.isArray(extras) || extras.length === 0) return init;
  return extras.reduce<ExtraSums>((acc, e) => {
    const amount = toNum(e?.amount);
    if (amount <= 0) return acc;
    const isToSide = e?.accountSide === 2;
    if (e?.extraType === 1) {
      return isToSide
        ? { ...acc, feeTo: acc.feeTo + amount }
        : { ...acc, fee: acc.fee + amount };
    }
    if (e?.extraType === 2) {
      return isToSide
        ? { ...acc, discountTo: acc.discountTo + amount }
        : { ...acc, discount: acc.discount + amount };
    }
    return acc;
  }, init);
}

// 计算实际金额：原始金额 + 手续费 - 优惠（不可变）
const applyExtras = (base: unknown, fee: number, discount: number): number =>
  toNum(base) + fee - discount;

/**
 * 账单金额主文案（已应用手续费/优惠）。
 * - 非转账：实际金额 = amount + fee - discount
 * - 转账（同币种）：仅展示转出方实际金额
 * - 转账（不同币种）：转出方应用 from-side 的 fee/discount，转入方应用 to-side 的 fee/discount
 */
function formatBillAmount(params: {
  amount: number;
  convertedAmount: number;
  currencyCode: string;
  toCurrencyCode: string;
  billType: number;
  sums: ExtraSums;
}): string {
  const {
    amount,
    convertedAmount,
    currencyCode,
    toCurrencyCode,
    billType,
    sums
  } = params;

  if (
    billType === 3 &&
    currencyCode &&
    toCurrencyCode &&
    currencyCode !== toCurrencyCode
  ) {
    const fromSym = getCurrencySymbol(currencyCode);
    const toSym = getCurrencySymbol(toCurrencyCode);
    const fromActual = applyExtras(amount, sums.fee, sums.discount);
    const toActual = applyExtras(convertedAmount, sums.feeTo, sums.discountTo);
    return `${withSymbol(fromSym, currencyCode, fromActual)} -> ${withSymbol(
      toSym,
      toCurrencyCode,
      toActual
    )}`;
  }

  // 非转账或同币种转账：合并 from/to 两侧调整
  const totalFee = sums.fee + sums.feeTo;
  const totalDiscount = sums.discount + sums.discountTo;
  const sym = getCurrencySymbol(currencyCode);
  const actual = applyExtras(amount, totalFee, totalDiscount);
  return withSymbol(sym, currencyCode, actual);
}

/**
 * 附加费用/优惠副提示文案：展示原始金额与调整明细。
 * 例：原 ¥3.00 +手续费 1.00 -优惠 2.00
 */
function formatExtrasTip(params: {
  amount: number;
  currencyCode: string;
  sums: ExtraSums;
}): string {
  const { amount, currencyCode, sums } = params;
  const totalFee = sums.fee + sums.feeTo;
  const totalDiscount = sums.discount + sums.discountTo;
  if (totalFee <= 0 && totalDiscount <= 0) return "";
  const sym = getCurrencySymbol(currencyCode);
  const parts: string[] = [`原 ${withSymbol(sym, currencyCode, amount)}`];
  if (totalFee > 0) parts.push(`+手续费 ${formatMoney(totalFee)}`);
  if (totalDiscount > 0) parts.push(`-优惠 ${formatMoney(totalDiscount)}`);
  return parts.join(" ");
}

export function useHook() {
  const { tagStyle } = usePublicHooks();
  const loading = ref(false);
  const dataList = ref<BillVo[]>([]);
  const defaultSort: Sort = {
    prop: "tradeTime",
    order: "descending"
  };
  const searchForm = reactive<BillQuery>({
    orderColumn: defaultSort.prop,
    orderDirection: defaultSort.order
  });
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
      width: 300,
      sortable: "custom",
      cellRenderer: ({ row }) => {
        const {
          amount,
          convertedAmount,
          currencyCode,
          toCurrencyCode,
          billType,
          extras
        } = row;
        const sums = sumExtras(extras);
        const mainText = formatBillAmount({
          amount,
          convertedAmount,
          currencyCode,
          toCurrencyCode,
          billType,
          sums
        });
        const extrasTip = formatExtrasTip({ amount, currencyCode, sums });
        return (
          <span>
            <span>{mainText}</span>
            {extrasTip ? (
              <span
                style={{
                  color: "#909399",
                  fontSize: "12px",
                  marginLeft: "6px"
                }}
              >
                ({extrasTip})
              </span>
            ) : null}
          </span>
        );
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
      width: 160,
      sortable: "custom"
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
      label: "成员",
      prop: "memberName",
      minWidth: 120
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
      label: "包含附件",
      prop: "hasFileDesc",
      width: 90
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

  async function onSearch(sort?: Sort) {
    try {
      loading.value = true;
      // 只有当 sort 参数存在（非 undefined）时，才处理排序逻辑
      if (sort) {
        if (sort.prop && sort.order) {
          searchForm.orderColumn = sort.prop;
          searchForm.orderDirection = sort.order;
        } else {
          // 如果 sort 为 null (用户取消排序)，恢复默认排序
          searchForm.orderColumn = defaultSort.prop;
          searchForm.orderDirection = defaultSort.order;
        }
      }

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
        memberName: item.memberList
          ? item.memberList.map(member => member.memberName).join(", ")
          : "-",
        payeeName: item.payeeName ? item.payeeName : "-",
        hasFileDesc: item.hasFile ? "是" : "否"
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
      // 构建风险提示信息
      const warnings: string[] = [];

      if (row.confirm) {
        warnings.push("已确认");
      }

      if (row.include) {
        warnings.push("已统计");
      }

      if (row.hasFileDesc && row.hasFileDesc !== "无附件") {
        warnings.push("包含附件");
      }

      // 构建提示消息
      let confirmMessage = `确定要删除【${row.title}】账单吗？`;
      if (warnings.length > 0) {
        confirmMessage = `该账单${warnings.join("、")}，删除后数据将无法恢复`;
        if (row.hasFileDesc && row.hasFileDesc !== "无附件") {
          confirmMessage += "，附件也将被清除";
        }
        confirmMessage += "。确定要删除吗？";
      }

      // 显示确认弹窗
      await ElMessageBox.confirm(confirmMessage, "删除确认", {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning"
      });

      // 执行删除
      loading.value = true;
      await deleteBillApi(row.bookId, row.billId);
      message(`已删除【${row.title}】账单`, { type: "success" });
      await onSearch();
    } catch (e) {
      // 用户取消删除时不显示错误消息
      if (e !== "cancel") {
        message(e.message || "删除失败", { type: "error" });
      }
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
      console.log("操作取消", error);
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
      console.log("操作取消", error);
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
    searchForm.memberIds = [];
    searchForm.payeeId = null;
    searchForm.confirm = null;
    searchForm.include = null;
    searchForm.remark = null;
    searchForm.orderColumn = defaultSort.prop;
    searchForm.orderDirection = defaultSort.order;
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
    defaultSort,
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
