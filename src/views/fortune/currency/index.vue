<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] fortune-grid-form"
    >
      <el-form-item label="目标币种：" prop="currency">
        <el-select
          v-model="searchForm.target"
          placeholder="请选择目标币种"
          class="!w-[200px]"
          filterable
        >
          <el-option
            v-for="item in currencyOptions"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="基础币种：" prop="base">
        <el-select
          v-model="searchForm.base"
          placeholder="请选择基础币种"
          class="!w-[200px]"
          filterable
        >
          <el-option
            v-for="item in currencyOptions"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="fortune-search-buttons">
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm">
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <PureTableBar title="汇率列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(Refresh)"
          @click="refresh"
        >
          刷新汇率
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
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
  </div>
</template>
<script setup lang="ts">
import { useHook } from "./utils/hook";
import PureTable from "@pureadmin/table";
import PureTableBar from "@/components/RePureTableBar/src/bar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "@iconify-icons/ri/search-line";
import Refresh from "@iconify-icons/ep/refresh";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneCurrency"
});

const {
  loading,
  columns,
  currencyOptions,
  dataList,
  searchForm,
  resetForm,
  onSearch,
  refresh
} = useHook();
</script>
