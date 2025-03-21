<template>
  <el-form
    ref="formRef"
    :inline="true"
    :model="searchForm"
    class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] grid-form"
  >
    <!-- 第一行筛选条件 -->
    <div class="grid-row">
      <!-- 所属分组 - 占1个宽度 -->
      <el-form-item label="所属分组：" label-width="80px">
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

      <el-form-item label="所属账本：" label-width="80px">
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
      <el-form-item label="交易时间：" label-width="80px">
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
      <el-form-item label="标题：" label-width="80px">
        <el-input
          v-model.trim="formModel.title"
          placeholder="请输入标题"
          clearable
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="账户：" label-width="80px">
        <el-select
          multiple
          v-model="formModel.accountIds"
          placeholder="请选择账户"
          filterable
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
    </div>
    <!-- 第二行筛选条件 -->
    <div class="mt-4 grid-row">
      <el-form-item label="交易对象：" label-width="80px">
        <el-select
          filterable
          multiple
          v-model="formModel.payeeIds"
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
      <el-form-item label="分类：" label-width="80px">
        <el-tree-select
          v-model="formModel.categoryIds"
          :data="categoryOptions"
          check-strictly
          filterable
          multiple
          placeholder="请选择分类"
          class="w-full"
          :props="categoryTreeProps"
          clearable
          collapse-tags
          collapse-tags-tooltip
        />
      </el-form-item>
      <el-form-item label="标签：" label-width="80px">
        <el-tree-select
          v-model="formModel.tagIds"
          :data="tagOptions"
          placeholder="请选择标签"
          class="w-full"
          check-strictly
          filterable
          multiple
          :props="tagTreeProps"
          clearable
          collapse-tags
          collapse-tags-tooltip
        />
      </el-form-item>
      <!-- 按钮组 - 占0.5个宽度，靠右对齐 -->
      <el-form-item class="search-buttons">
        <el-button
          :icon="useRenderIcon(Refresh)"
          @click="$emit('reset')"
          class="mr-1"
        >
          重置
        </el-button>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="$emit('search')"
        >
          搜索
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

<style scoped>
/* 深度选择器覆盖 element 样式 */
:deep(.full-width-group) {
  display: flex;
  width: 100%;
}

:deep(.quarter-width) {
  flex: 1; /* 等分剩余空间 */

  /* 调整内部按钮宽度 */

  .el-radio-button__inner {
    display: block;
    width: 100%;
    text-align: center;
  }
}

.grid-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

/* 统一标签宽度和对齐方式 */
.grid-form :deep(.el-form-item__label) {
  width: 80px;
  height: 40px;
  padding-right: 8px;
  line-height: 40px;
  text-align: right;
}

/* 统一表单项内容区域样式 */
.grid-form :deep(.el-form-item__content) {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-start;
  height: 40px;
}

/* 统一所有输入控件的宽度 */
.grid-form :deep(.el-select),
.grid-form :deep(.el-input),
.grid-form :deep(.el-date-editor),
.grid-form :deep(.el-tree-select),
.grid-form :deep(.el-input-number) {
  width: 100% !important;
  height: 32px;
}

/* 确保日期选择器的宽度正确 */
.grid-form :deep(.el-date-editor.el-input__wrapper) {
  width: 100% !important;
}

/* 按钮容器样式 */
.search-buttons {
  display: flex;
  grid-column: 5;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  height: 40px;
  margin-right: 30px;
}

/* 确保按钮垂直居中 */
.search-buttons :deep(.el-button) {
  height: 32px;
  margin-top: 0;
  margin-bottom: 0;
}

/* 修复可能的对齐问题 */
.grid-form :deep(.el-input__wrapper),
.grid-form :deep(.el-select__wrapper) {
  height: 32px;
  line-height: 32px;
}
</style>
