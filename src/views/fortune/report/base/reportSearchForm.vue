<template>
  <el-form
    ref="formRef"
    :inline="true"
    :model="searchForm"
    class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] mb-5"
  >
    <div class="flex justify-between items-center mb-2 pr-8">
      <div class="text-lg font-bold">报表筛选</div>
      <el-button
        type="primary"
        text
        @click="isAdvancedSearch = !isAdvancedSearch"
      >
        {{ isAdvancedSearch ? "收起高级筛选" : "展开高级筛选" }}
        <el-icon class="ml-1">
          <component :is="isAdvancedSearch ? 'ArrowUp' : 'ArrowDown'" />
        </el-icon>
      </el-button>
    </div>
    <!-- 基础筛选条件 - 始终显示 -->
    <div class="flex flex-wrap gap-4">
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
        <div class="flex items-center">
          <el-date-picker
            v-model="localTradeTimeRange"
            type="daterange"
            range-separator="-"
            class="!w-[260px]"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
          <div class="ml-2">
            <el-radio-group
              v-model="dateRangeType"
              size="small"
              @change="handleDateRangeChange"
            >
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="year">本年</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </el-form-item>
    </div>

    <!-- 高级筛选条件 - 可折叠 -->
    <div v-show="isAdvancedSearch" class="mt-4">
      <el-form-item label="标题：">
        <el-input
          v-model.trim="formModel.title"
          placeholder="请输入标题"
          clearable
        />
      </el-form-item>
      <div class="flex flex-wrap gap-4">
        <el-form-item label="账户：">
          <el-select
            multiple
            v-model="formModel.accountIds"
            placeholder="请选择账户"
            filterable
            collapse-tags
            collapse-tags-tooltip
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
      </div>

      <div class="flex flex-wrap gap-4">
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
            collapse-tags
            collapse-tags-tooltip
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
            collapse-tags
            collapse-tags-tooltip
          />
        </el-form-item>
      </div>
    </div>
    <div class="mt-4 flex justify-center">
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
    </div>
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
const isAdvancedSearch = ref<boolean>(false);
const dateRangeType = ref<string>("");
const emit = defineEmits([
  "init",
  "update:searchForm",
  "update:groupId",
  "update:tradeTimeRange"
]);

// 处理日期范围快捷选择
const handleDateRangeChange = (type: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (type) {
    case "week": {
      // 本周的开始（周一）和结束（周日）
      const day = today.getDay() || 7; // 如果是0（周日）则设为7
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - day + 1);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      localTradeTimeRange.value = [startDate, endDate];
      break;
    }
    case "month": {
      // 本月的开始和结束
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      localTradeTimeRange.value = [startDate, endDate];
      break;
    }
    case "year": {
      // 本年的开始和结束
      const startDate = new Date(today.getFullYear(), 0, 1);
      const endDate = new Date(today.getFullYear(), 11, 31);
      localTradeTimeRange.value = [startDate, endDate];
      break;
    }
  }
};
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
