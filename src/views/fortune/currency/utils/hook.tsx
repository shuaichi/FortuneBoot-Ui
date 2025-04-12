import { onMounted, reactive, ref } from "vue";
import {
  CurrencyQuery,
  getCurrencyListApi,
  refreshCurrency
} from "@/api/fortune/currency";
import { getCurrencyTemplate } from "@/api/fortune/group";

export function useHook() {
  const loading = ref(true);
  const dataList = ref([]);
  const searchForm = reactive<CurrencyQuery>({});
  const currencyOptions = ref([]);

  onMounted(async () => {
    const res = await getCurrencyTemplate();
    currencyOptions.value = res.data.map(item => {
      return {
        label: item.label,
        value: item.label
      };
    });
    await onSearch();
  });

  const onSearch = async () => {
    loading.value = true;
    const res = await getCurrencyListApi(searchForm);
    dataList.value = res.data;
    loading.value = false;
  };

  const resetForm = async () => {
    searchForm.base = null;
    searchForm.target = null;
    await onSearch();
  };

  const refresh = async () => {
    loading.value = true;
    await refreshCurrency();
    await onSearch();
  };

  const columns: TableColumnList = [
    {
      label: "汇率名称",
      prop: "currencyName",
      align: "left"
    },
    {
      label: "基准汇率名称",
      prop: "baseCurrency"
    },
    {
      label: "汇率价格",
      prop: "rate"
    }
  ];
  return {
    loading,
    columns,
    currencyOptions,
    dataList,
    searchForm,
    resetForm,
    onSearch,
    refresh
  };
}
