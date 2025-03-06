<template>
  <el-form
    ref="formRef"
    :inline="true"
    :model="searchForm"
    class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] mb-5"
  >
    <el-form-item label="所属分组：">
      <el-select
        v-model="localGroupId"
        placeholder="请选择分组"
        class="!w-[200px]"
        filterable
      >
        <el-option
          v-for="item in groupOptions"
          :key="item.groupId"
          :label="item.groupName"
          :value="item.groupId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="所属账本：">
      <el-select
        v-model="formModel.bookId"
        placeholder="请选择账本"
        class="!w-[200px]"
        filterable
      >
        <el-option
          v-for="item in bookOptions"
          :key="item.bookId"
          :label="item.bookName"
          :value="item.bookId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="交易时间：">
      <el-date-picker
        v-model="localTradeTimeRange"
        type="daterange"
        range-separator="-"
        class="!w-[260px]"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>
    <el-form-item label="标题：">
      <el-input
        v-model.trim="formModel.title"
        placeholder="请输入标题"
        clearable
      />
    </el-form-item>
    <el-form-item label="账户：">
      <el-select
        multiple
        v-model="formModel.accountIds"
        placeholder="请选择账户"
        filterable
      >
        <el-option
          v-for="item in accountOptions"
          :key="item.accountId"
          :label="item.accountName"
          :value="item.accountId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="交易对象：">
      <el-select
        filterable
        multiple
        v-model="formModel.payeeIds"
        placeholder="请选择交易对象"
        style="width: 100%"
        clearable
      >
        <el-option
          v-for="item in payeeOptions"
          :key="item.payeeId"
          :label="item.payeeName"
          :value="item.payeeId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="分类：">
      <el-tree-select
        v-model="formModel.categoryIds"
        :data="categoryOptions"
        check-strictly
        filterable
        multiple
        placeholder="请选择分类"
        style="width: 100%"
        :props="categoryTreeProps"
        clearable
      />
    </el-form-item>
    <el-form-item label="标签：">
      <el-tree-select
        v-model="formModel.tagIds"
        :data="tagOptions"
        placeholder="请选择标签"
        style="width: 100%"
        check-strictly
        filterable
        multiple
        :props="tagTreeProps"
        clearable
      />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        :icon="useRenderIcon(Search)"
        :loading="loading"
        @click="$emit('search')"
      >
        搜索
      </el-button>
      <el-button :icon="useRenderIcon(Refresh)" @click="$emit('reset')">
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import { GroupVo } from "@/api/fortune/group";
import { BookVo } from "@/api/fortune/book";
import { AccountVo } from "@/api/fortune/account";
import { PayeeVo } from "@/api/fortune/payee";
import { CategoryVo } from "@/api/fortune/category";
import { TagVo } from "@/api/fortune/tag";
import { computed, onMounted, ref } from "vue";
import { BillReportQuery } from "@/api/fortune/include";

// 导入所有需要的API和类型
const props = defineProps({
  groupId: Number,
  tradeTimeRange: {
    type: Array as PropType<[Date, Date]>,
    default: () => [null, null]
  },
  searchForm: {
    type: Object as PropType<BillReportQuery>,
    default: () => ({}),
    required: true
  },
  groupOptions: Array<GroupVo>,
  bookOptions: Array<BookVo>,
  accountOptions: Array<AccountVo>,
  payeeOptions: Array<PayeeVo>,
  categoryOptions: Array<CategoryVo>,
  tagOptions: Array<TagVo>
});
const loading = ref<boolean>(false);
const emit = defineEmits([
  "init",
  "update:searchForm",
  "update:groupId",
  "update:tradeTimeRange"
]);
const formModel = computed({
  get: () => props.searchForm,
  set: value => emit("update:searchForm", value)
});
const localGroupId = computed({
  get: () => props.groupId,
  set: value => emit("update:groupId", value)
});
const localTradeTimeRange = computed({
  get: () => props.tradeTimeRange,
  set: value => emit("update:tradeTimeRange", value)
});
const tagTreeProps = {
  label: "tagName",
  value: "tagId",
  children: "children"
};
const categoryTreeProps = {
  label: "categoryName",
  value: "categoryId",
  children: "children"
};
onMounted(() => {
  emit("init");
});
</script>
