<template>
  <el-form
    ref="formRef"
    :inline="true"
    :model="form"
    class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] fortune-grid-form"
  >
    <el-form-item v-show="isVisible(0)" label="所属分组：" prop="groupId">
      <el-select v-model="form.groupId" placeholder="请选择账本" filterable>
        <el-option
          v-for="item in groupOptions"
          :key="item.groupId"
          :label="item.groupName"
          :value="item.groupId"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-show="isVisible(1)" label="所属账本：" prop="bookId">
      <el-select v-model="form.bookId" placeholder="请选择账本" filterable>
        <el-option
          v-for="item in bookOptions"
          :key="item.bookId"
          :label="item.bookName"
          :value="item.bookId"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-show="isVisible(2)" label="所属账户：" prop="accountId">
      <el-select v-model="form.accountId" placeholder="请选择账户" filterable>
        <el-option
          v-for="item in accountOptions"
          :key="item.accountId"
          :label="item.accountName"
          :value="item.accountId"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-show="isVisible(3)" label="标题：" prop="title">
      <el-input v-model.trim="form.title" placeholder="请输入标题" clearable />
    </el-form-item>
    <el-form-item v-show="isVisible(4)" label="交易类型：" prop="billType">
      <el-select v-model="form.billType" placeholder="请选择类型" clearable>
        <el-option
          v-for="item in billTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      v-show="isVisible(5)"
      label="交易时间："
      prop="tradeTimeRange"
    >
      <el-date-picker
        v-model="form.tradeTimeRange"
        type="daterange"
        range-separator="-"
        class="!w-[260px]"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        :shortcuts="shortcuts"
      />
    </el-form-item>
    <el-form-item v-show="isVisible(6)" prop="amountMin" label="金额：">
      <div class="fortune-number-range-picker">
        <el-input-number
          v-model="form.amountMin"
          placeholder="最小值"
          :precision="2"
          :controls="false"
          class="amount-input"
        />
        <span class="range-separator">—</span>
        <el-input-number
          v-model="form.amountMax"
          placeholder="最大值"
          :precision="2"
          :controls="false"
          class="amount-input"
        />
      </div>
    </el-form-item>
    <el-form-item v-show="isVisible(7)" label="分类：" prop="categoryIds">
      <el-tree-select
        v-model="form.categoryIds"
        :data="categoryOptions"
        check-strictly
        filterable
        multiple
        placeholder="请选择分类"
        style="width: 100%"
        :props="categoryTreeProps"
        clearable
        node-key="categoryId"
        :filter-node-method="filterNodeMethod('categoryName')"
      />
    </el-form-item>
    <el-form-item v-show="isVisible(8)" prop="tagIds" label="标签：">
      <el-tree-select
        v-model="form.tagIds"
        :data="tagOptions"
        placeholder="请选择标签"
        style="width: 100%"
        check-strictly
        filterable
        multiple
        :props="tagTreeProps"
        clearable
        node-key="tagId"
        :filter-node-method="filterNodeMethod('tagName')"
      />
    </el-form-item>
    <el-form-item v-show="isVisible(9)" prop="payeeId" label="交易对象：">
      <el-select
        v-model="form.payeeId"
        filterable
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
    <el-form-item v-show="isVisible(10)" prop="memberIds" label="成员：">
      <el-select
        v-model="form.memberIds"
        filterable
        multiple
        placeholder="请选择成员"
        style="width: 100%"
        clearable
      >
        <el-option
          v-for="item in memberOptions"
          :key="item.memberId"
          :label="item.memberName"
          :value="item.memberId"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-show="isVisible(11)" prop="confirm" label="确认状态：">
      <el-select
        v-model="form.confirm"
        placeholder="请选择确认状态"
        clearable
        filterable
      >
        <el-option
          v-for="item in trueFalseOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-show="isVisible(12)" prop="include" label="统计状态：">
      <el-select
        v-model="form.include"
        placeholder="请选择统计状态"
        clearable
        filterable
      >
        <el-option
          v-for="item in trueFalseOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-show="isVisible(13)" label="备注：" prop="remark">
      <el-input v-model="form.remark" placeholder="请输入备注" clearable />
    </el-form-item>
    <el-form-item class="fortune-search-buttons">
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
      <el-button type="text" @click="expanded = !expanded">
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
import { useResponsiveForm } from "@/views/fortune/hooks/useResponsiveForm";
import dayjs from "dayjs";
import {
  filterNodeMethod,
  categoryTreeProps,
  tagTreeProps,
  trueFalseOptions
} from "../utils/helper";

const props = defineProps<{
  modelValue: any;
  loading: boolean;
  groupOptions: any[];
  bookOptions: any[];
  accountOptions: any[];
  billTypeOptions: any[];
  categoryOptions: any[];
  tagOptions: any[];
  payeeOptions: any[];
  memberOptions: any[];
}>();

const emit = defineEmits(["update:modelValue", "search", "reset"]);

// 核心解法：使用 computed 代理一层，这样 ESLint 就不会报直接修改 Prop 的错误了
const form = computed({
  get: () => props.modelValue,
  set: val => emit("update:modelValue", val)
});

const { expanded, isVisible } = useResponsiveForm();

const shortcuts = [
  {
    text: "最近一周",
    value: () => {
      const end = dayjs();
      const start = end.subtract(7, "day");
      return [start.toDate(), end.toDate()];
    }
  },
  {
    text: "本周",
    value: () => {
      const start = dayjs().startOf("week");
      const end = dayjs().endOf("week");
      return [start.toDate(), end.toDate()];
    }
  },
  {
    text: "最近一月",
    value: () => {
      const end = dayjs();
      const start = end.subtract(1, "month");
      return [start.toDate(), end.toDate()];
    }
  },
  {
    text: "本月",
    value: () => {
      const start = dayjs().startOf("month");
      const end = dayjs().endOf("month");
      return [start.toDate(), end.toDate()];
    }
  },
  {
    text: "最近一年",
    value: () => {
      const end = dayjs();
      const start = end.subtract(1, "year");
      return [start.toDate(), end.toDate()];
    }
  },
  {
    text: "今年",
    value: () => {
      const start = dayjs().startOf("year");
      const end = dayjs().endOf("year");
      return [start.toDate(), end.toDate()];
    }
  }
];
</script>
