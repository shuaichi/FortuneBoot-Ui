<template>
  <el-form
    :inline="true"
    :model="searchForm"
    class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] fortune-grid-form"
  >
    <el-form-item label="所属分组：">
      <el-select
        v-model="localGroupId"
        placeholder="请选择分组"
        class="w-full"
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
        class="w-full"
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
        class="w-full"
        type="daterange"
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
      />
    </el-form-item>

    <el-form-item v-if="showBillType" label="账单类型：">
      <el-select
        v-model="formModel.billType"
        placeholder="请选择账单类型"
        class="w-full"
        clearable
      >
        <el-option
          v-for="item in billTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-show="isVisible(baseCount)" label="账户：">
      <el-select
        v-model="formModel.accountIds"
        multiple
        placeholder="请选择账户"
        filterable
        clearable
        collapse-tags
        collapse-tags-tooltip
        class="w-full"
      >
        <el-option
          v-for="item in accountOptions"
          :key="item.accountId"
          :label="item.accountName"
          :value="item.accountId"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-show="isVisible(baseCount + 1)" label="分类：">
      <el-tree-select
        v-model="formModel.categoryIds"
        :data="categoryOptions"
        :props="categoryTreeProps"
        check-strictly
        filterable
        multiple
        placeholder="请选择分类"
        class="w-full"
        clearable
        collapse-tags
        collapse-tags-tooltip
      />
    </el-form-item>

    <el-form-item v-show="isVisible(baseCount + 2)" label="标签：">
      <el-tree-select
        v-model="formModel.tagIds"
        :data="tagOptions"
        :props="tagTreeProps"
        check-strictly
        filterable
        multiple
        placeholder="请选择标签"
        class="w-full"
        clearable
        collapse-tags
        collapse-tags-tooltip
      />
    </el-form-item>

    <el-form-item v-show="isVisible(baseCount + 3)" label="交易对象：">
      <el-select
        v-model="formModel.payeeIds"
        multiple
        filterable
        placeholder="请选择交易对象"
        class="w-full"
        clearable
        collapse-tags
        collapse-tags-tooltip
      >
        <el-option
          v-for="item in payeeOptions"
          :key="item.payeeId"
          :label="item.payeeName"
          :value="item.payeeId"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-show="isVisible(baseCount + 4)" label="成员：">
      <el-select
        v-model="formModel.memberIds"
        multiple
        filterable
        placeholder="请选择成员"
        class="w-full"
        clearable
        collapse-tags
        collapse-tags-tooltip
      >
        <el-option
          v-for="item in memberOptions"
          :key="item.memberId"
          :label="item.memberName"
          :value="item.memberId"
        />
      </el-select>
    </el-form-item>

    <el-form-item class="fortune-search-buttons">
      <el-button
        :icon="useRenderIcon(Refresh)"
        class="mr-1"
        @click="$emit('reset')"
      >
        重置
      </el-button>
      <el-button
        type="primary"
        :icon="useRenderIcon(Search)"
        @click="$emit('search')"
      >
        搜索
      </el-button>
      <el-button link type="primary" class="ml-1" @click="expanded = !expanded">
        {{ expanded ? "收起" : "展开" }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import type { GroupVo } from "@/api/fortune/group";
import type { BookVo } from "@/api/fortune/book";
import type { AccountVo } from "@/api/fortune/account";
import type { PayeeVo } from "@/api/fortune/payee";
import type { CategoryVo } from "@/api/fortune/category";
import type { TagVo } from "@/api/fortune/tag";
import type { MemberVo } from "@/api/fortune/member";
import type { BillIncludeQuery } from "@/api/fortune/include";
import { useResponsiveForm } from "@/views/fortune/hooks/useResponsiveForm";
import { billTypeOptions } from "./constants";

const props = defineProps<{
  groupId?: number;
  searchForm: BillIncludeQuery;
  tradeTimeRange: [Date, Date];
  groupOptions: Array<GroupVo>;
  bookOptions: Array<BookVo>;
  accountOptions: Array<AccountVo>;
  payeeOptions: Array<PayeeVo>;
  categoryOptions: Array<CategoryVo>;
  tagOptions: Array<TagVo>;
  memberOptions: Array<MemberVo>;
  showBillType?: boolean;
}>();

const emit = defineEmits([
  "search",
  "reset",
  "update:groupId",
  "update:tradeTimeRange"
]);

/** 前 3 个基础项（分组/账本/时间）恒显，账单类型显示时基础项 +1 */
const baseCount = computed(() => (props.showBillType ? 4 : 3));
const { expanded, isVisible } = useResponsiveForm();

const localGroupId = computed({
  get: () => props.groupId,
  set: value => emit("update:groupId", value)
});
const localTradeTimeRange = computed({
  get: () => props.tradeTimeRange,
  set: value => emit("update:tradeTimeRange", value)
});
/** 表单模型代理：父级传入的是 reactive 对象，通过 getter 读取并就地更新字段 */
const formModel = computed(() => props.searchForm);

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
</script>
