import { reactive, Ref, ref, watch } from "vue";
import { BillReportQuery, PieVo } from "@/api/fortune/include";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { BookVo, getEnableBookList } from "@/api/fortune/book";
import { AccountVo, getEnableAccountList } from "@/api/fortune/account";
import { CategoryVo, getEnableCategoryList } from "@/api/fortune/category";
import { getEnablePayeeList, PayeeVo } from "@/api/fortune/payee";
import { getEnableTagList, TagVo } from "@/api/fortune/tag";
import { message } from "@/utils/message";

export function useReportSearch(billType: Ref<number>, fetchApi: Function) {
  const searchForm = reactive<BillReportQuery>({});
  const groupId = ref<number>();
  const tradeTimeRange = ref<[Date, Date]>([null, null]);
  const groupOptions = ref<Array<GroupVo>>();
  const bookOptions = ref<Array<BookVo>>();
  const accountOptions = ref<Array<AccountVo>>();
  const categoryOptions = ref<Array<CategoryVo>>();
  const payeeOptions = ref<Array<PayeeVo>>();
  const tagOptions = ref<Array<TagVo>>();
  const resData = ref<Array<PieVo>>();

  async function init() {
    const groupRes = await getEnableGroupList();
    if (groupRes.data.length === 0) {
      message("请先启用或创建分组");
    }
    groupOptions.value = groupRes.data;
    const defaultGroup = await getDefaultGroupId();
    groupId.value = defaultGroup.data;
    const [booksRes, accountsRes] = await Promise.all([
      getEnableBookList(groupId.value),
      getEnableAccountList(groupId.value)
    ]);
    bookOptions.value = booksRes.data;
    searchForm.bookId = groupOptions.value.find(
      group => group.groupId === defaultGroup.data
    ).defaultBookId;
    await onSearch();
    accountOptions.value = accountsRes.data;
    const [categoryRes, payeeRes, tagRes] = await Promise.all([
      getEnableCategoryList(searchForm.bookId, billType.value),
      getEnablePayeeList(searchForm.bookId, billType.value),
      getEnableTagList(searchForm.bookId, billType.value)
    ]);
    categoryOptions.value = categoryRes.data;
    payeeOptions.value = payeeRes.data;
    tagOptions.value = tagRes.data;
  }

  watch(
    () => groupId.value,
    async () => {
      const bookRes = await getEnableBookList(groupId.value);
      if (bookRes.data.length === 0) {
        message("请先启用或创建账本");
        return;
      }
      bookOptions.value = bookRes.data;
      searchForm.bookId = groupOptions.value.find(
        group => group.groupId === groupId.value
      ).defaultBookId;
    }
  );
  watch(
    () => searchForm.bookId,
    async () => {
      await onSearch();
    }
  );

  async function resetForm() {
    const defaultGroup = await getDefaultGroupId();
    groupId.value = defaultGroup.data;
    searchForm.bookId = groupOptions.value.find(
      group => group.groupId === defaultGroup.data
    ).defaultBookId;
    searchForm.title = null;
    searchForm.accountIds = [];
    searchForm.payeeIds = [];
    searchForm.tagIds = [];
    searchForm.categoryIds = [];
    searchForm.startDate = null;
    searchForm.endDate = null;
    tradeTimeRange.value = [null, null];
    await onSearch();
  }

  async function onSearch() {
    // 公共搜索逻辑
    if (tradeTimeRange.value && tradeTimeRange.value.length > 0) {
      searchForm.startDate = tradeTimeRange.value[0];
      searchForm.endDate = tradeTimeRange.value[1];
    } else {
      searchForm.startDate = null;
      searchForm.endDate = null;
    }
    const res = await fetchApi(searchForm);
    resData.value = res.data;
  }

  return {
    searchForm,
    tradeTimeRange,
    groupId,
    groupOptions,
    bookOptions,
    accountOptions,
    payeeOptions,
    tagOptions,
    categoryOptions,
    resData,
    init,
    resetForm,
    onSearch
  };
}
