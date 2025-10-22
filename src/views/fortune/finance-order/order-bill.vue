<template>
  <v-dialog
    use-body-scrolling
    :fixed-body-height="false"
    title="关联账单"
    v-model="visible"
    :loading="loading"
    @cancel="visible = false"
    @opened="onSearch"
    width="720px"
  >
    <PureTableBar title="" :columns="columns" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :paginationSmall="size === 'small'"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
        />
      </template>
    </PureTableBar>
  </v-dialog>
</template>
<script setup lang="ts">
import { PureTableBar } from "@/components/RePureTableBar";
import PureTable from "@pureadmin/table";
import VDialog from "@/components/VDialog/VDialog.vue";
import { computed, ref, h } from "vue";
import { getCurrencySymbol } from "@/utils/currency";
import { getBillPage } from "@/api/fortune/bill";
import { message } from "@/utils/message";
import dayjs from "dayjs";
import { FinanceOrderVo } from "@/api/fortune/finance-order";

const loading = ref<boolean>(false);
const dataList = ref([]);

const props = defineProps<{
  modelValue: boolean;
  opRow: FinanceOrderVo;
}>();
const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();
const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});
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
      return h("span", { style: { color } }, type?.label);
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
    prop: "confirmDesc",
    width: 90
  },
  {
    label: "统计状态",
    prop: "includeDesc",
    width: 90
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
  }
];
async function onSearch() {
  try {
    loading.value = true;
    const params = {
      pageNum: 1,
      pageSize: 500,
      orderId: props.opRow.orderId,
      bookId: props.opRow.bookId
    };

    const { data } = await getBillPage(params);
    dataList.value = data.rows.map(item => ({
      ...item,
      tradeTime: dayjs(item.tradeTime).format("YYYY-MM-DD HH:mm:ss"),
      tagName: item.tagList
        ? item.tagList.map(tag => tag.tagName).join(", ")
        : "-",
      categoryName: item.categoryAmountPair
        ? item.categoryAmountPair
            .map(category => category.categoryName)
            .join(", ")
        : "-",
      payeeName: item.payeeName ? item.payeeName : "-",
      hasFileDesc: item.hasFile ? "是" : "否",
      confirmDesc: item.confirm ? "已确认" : "未确认",
      includeDesc: item.include ? "已统计" : "未统计"
    }));
    // pagination.total = data.total;
  } catch (e) {
    message(e.message || "查询失败", { type: "error" });
  } finally {
    loading.value = false;
  }
}
</script>
