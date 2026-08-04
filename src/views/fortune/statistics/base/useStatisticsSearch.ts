import { reactive, ref, watch } from "vue";
import type { BillIncludeQuery } from "@/api/fortune/include";
import {
  getDefaultGroupId,
  getEnableGroupList,
  type GroupVo
} from "@/api/fortune/group";
import { type BookVo, getEnableBookList } from "@/api/fortune/book";
import { type AccountVo, getEnableAccountList } from "@/api/fortune/account";
import { type CategoryVo, getEnableCategoryList } from "@/api/fortune/category";
import { getEnablePayeeList, type PayeeVo } from "@/api/fortune/payee";
import { getEnableTagList, type TagVo } from "@/api/fortune/tag";
import { getEnableMemberList, type MemberVo } from "@/api/fortune/member";
import { message } from "@/utils/message";

/**
 * 统计模块通用搜索逻辑：统一分组、账本、账户、分类、标签、交易对象、成员的加载与联动。
 * onSearch 交给调用方定义，以便不同页面组合不同接口。
 */
export function useStatisticsSearch(onSearch: () => Promise<void> | void) {
  const searchForm = reactive<BillIncludeQuery>({});
  const groupId = ref<number>();
  const tradeTimeRange = ref<[Date, Date]>([null, null]);
  const groupOptions = ref<Array<GroupVo>>([]);
  const bookOptions = ref<Array<BookVo>>([]);
  const accountOptions = ref<Array<AccountVo>>([]);
  const categoryOptions = ref<Array<CategoryVo>>([]);
  const payeeOptions = ref<Array<PayeeVo>>([]);
  const tagOptions = ref<Array<TagVo>>([]);
  const memberOptions = ref<Array<MemberVo>>([]);
  const isInitialized = ref<boolean>(false);

  async function loadDimensionOptions() {
    if (!searchForm.bookId) return;
    const [accountsRes, categoryRes, payeeRes, tagRes, memberRes] =
      await Promise.all([
        getEnableAccountList(groupId.value),
        getEnableCategoryList(searchForm.bookId, null),
        getEnablePayeeList(searchForm.bookId, null),
        getEnableTagList(searchForm.bookId, null),
        getEnableMemberList(searchForm.bookId)
      ]);
    accountOptions.value = accountsRes.data;
    categoryOptions.value = categoryRes.data;
    payeeOptions.value = payeeRes.data;
    tagOptions.value = tagRes.data;
    memberOptions.value = memberRes.data;
  }

  async function init() {
    const groupRes = await getEnableGroupList();
    if (groupRes.data.length === 0) {
      message("请先启用或创建分组");
      return;
    }
    groupOptions.value = groupRes.data;
    const defaultGroup = await getDefaultGroupId();
    groupId.value = defaultGroup.data;
    const booksRes = await getEnableBookList(groupId.value);
    bookOptions.value = booksRes.data;
    searchForm.bookId = groupOptions.value.find(
      group => group.groupId === defaultGroup.data
    )?.defaultBookId;
    await loadDimensionOptions();
    await onSearch();
    isInitialized.value = true;
  }

  watch(
    () => groupId.value,
    async () => {
      if (!isInitialized.value) return;
      const bookRes = await getEnableBookList(groupId.value);
      if (bookRes.data.length === 0) {
        message("请先启用或创建账本");
        return;
      }
      bookOptions.value = bookRes.data;
      searchForm.bookId = groupOptions.value.find(
        group => group.groupId === groupId.value
      )?.defaultBookId;
    }
  );
  watch(
    () => searchForm.bookId,
    async () => {
      if (!isInitialized.value) return;
      await loadDimensionOptions();
      await onSearch();
    }
  );

  function syncTradeTimeRange() {
    if (tradeTimeRange.value && tradeTimeRange.value.length > 0) {
      searchForm.startDate = tradeTimeRange.value[0];
      searchForm.endDate = tradeTimeRange.value[1];
    } else {
      searchForm.startDate = null;
      searchForm.endDate = null;
    }
  }

  async function resetForm() {
    const defaultGroup = await getDefaultGroupId();
    groupId.value = defaultGroup.data;
    searchForm.bookId = groupOptions.value.find(
      group => group.groupId === defaultGroup.data
    )?.defaultBookId;
    searchForm.title = null;
    searchForm.billType = null;
    searchForm.accountIds = [];
    searchForm.payeeIds = [];
    searchForm.tagIds = [];
    searchForm.categoryIds = [];
    searchForm.memberIds = [];
    searchForm.startDate = null;
    searchForm.endDate = null;
    tradeTimeRange.value = [null, null];
    await loadDimensionOptions();
    await onSearch();
  }

  return {
    searchForm,
    groupId,
    tradeTimeRange,
    groupOptions,
    bookOptions,
    accountOptions,
    categoryOptions,
    payeeOptions,
    tagOptions,
    memberOptions,
    isInitialized,
    init,
    resetForm,
    syncTradeTimeRange
  };
}
