<template>
  <div>
    <div class="full-width-container">
      <el-radio-group
        v-model="searchForm.accountType"
        size="large"
        class="full-width-group"
        @change="onSearch(barRef)"
      >
        <el-radio-button :label="1" class="quarter-width"
          >活 期
        </el-radio-button>
        <el-radio-button :label="2" class="quarter-width"
          >信 用
        </el-radio-button>
        <el-radio-button :label="3" class="quarter-width"
          >资 产
        </el-radio-button>
        <el-radio-button :label="4" class="quarter-width"
          >贷 款
        </el-radio-button>
      </el-radio-group>
    </div>
    <div>
      <el-form
        ref="formRef"
        :inline="true"
        :model="searchForm"
        class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] grid-form"
      >
        <el-form-item label="所属分组：" prop="groupId" v-show="isVisible(0)">
          <el-select
            v-model="searchForm.groupId"
            placeholder="请选择分组"
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
        <el-form-item
          label="账户名称："
          prop="accountName"
          v-show="isVisible(1)"
        >
          <el-input
            v-model="searchForm.accountName"
            placeholder="请输入账本名称"
            clearable
          />
        </el-form-item>
        <el-form-item prop="currencyCode" label="币种：" v-show="isVisible(2)">
          <el-select
            v-model="searchForm.currencyCode"
            placeholder="请选择币种"
            clearable
            filterable
          >
            <el-option
              v-for="item in currencyTemplateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="include" label="统计状态：" v-show="isVisible(3)">
          <el-select
            v-model="searchForm.include"
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
        <el-form-item
          prop="canExpense"
          label="支出状态："
          v-show="isVisible(4)"
        >
          <el-select
            v-model="searchForm.canExpense"
            placeholder="请选择支出状态"
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
        <el-form-item prop="canIncome" label="收入状态：" v-show="isVisible(5)">
          <el-select
            v-model="searchForm.canIncome"
            placeholder="请选择收入状态"
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
        <el-form-item
          prop="canTransferOut"
          label="转出状态："
          v-show="isVisible(6)"
        >
          <el-select
            v-model="searchForm.canTransferOut"
            placeholder="请选择转出状态"
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
        <el-form-item
          prop="canTransferIn"
          label="转入状态："
          v-show="isVisible(7)"
        >
          <el-select
            v-model="searchForm.canTransferIn"
            placeholder="请选择转入状态"
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
        <el-form-item prop="enable" label="启用状态：" v-show="isVisible(8)">
          <el-select
            v-model="searchForm.enable"
            placeholder="请选择启用状态"
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
        <!-- 其他搜索条件 -->
        <el-form-item class="search-buttons">
          <el-button
            type="primary"
            :icon="useRenderIcon(Search)"
            :loading="loading"
            @click="
              () => {
                onSearch(barRef);
              }
            "
          >
            搜索
          </el-button>
          <el-button :icon="useRenderIcon(Refresh)" @click="resetForm()">
            重置
          </el-button>
          <el-button type="text" @click="expanded = !expanded">
            {{ expanded ? "收起" : "展开" }}
          </el-button>
        </el-form-item>
      </el-form>
      <PureTableBar
        ref="barRef"
        title="账户管理"
        :columns="columns"
        @refresh="onSearch"
      >
        <template #buttons>
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openEditDialog('add', null)"
          >
            新增账户
          </el-button>
        </template>
        <!-- 表格列绑定账户字段 -->
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
            :pagination="pagination"
            :paginationSmall="size === 'small'"
            :header-cell-style="{
              background: 'var(--el-table-row-hover-bg-color)',
              color: 'var(--el-text-color-primary)'
            }"
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
          >
            <!-- 操作列 -->
            <template #operation="{ row }">
              <el-button link type="success" @click="openAdjustDialog(row)">
                余额调整
              </el-button>
              <el-button link type="primary" @click="reconcileAccounts(row)">
                对账
              </el-button>
              <el-button
                link
                type="primary"
                @click="openEditDialog('edit', row)"
              >
                编辑
              </el-button>
              <el-popconfirm
                :title="`确认将【${row.accountName}】账户移入回收站？`"
                @confirm="handleMove2RecycleBin(row)"
              >
                <template #reference>
                  <el-button link type="danger">回收站</el-button>
                </template>
              </el-popconfirm>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
      <account-form
        v-if="modalVisible"
        v-model="modalVisible"
        :type="opType"
        :row="currentRow"
        :group-id="searchForm.groupId"
        @success="onSearch"
      />
      <balance-adjust
        v-if="adjustVisible"
        v-model="adjustVisible"
        :row="currentRow"
        @success="onSearch"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHook } from "./utils/hook";
import PureTable from "@pureadmin/table";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AccountForm from "@/views/fortune/account/account-form.vue";
import BalanceAdjust from "@/views/fortune/account/balance-adjust.vue";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneAccount"
});

const formRef = ref();
const barRef = ref();
// 展开收起
const expanded = ref(false);
const width = ref(window.innerWidth);

const trueFalseOptions = ref([
  {
    value: 1,
    label: "是"
  },
  {
    value: 0,
    label: "否"
  }
]);
const {
  searchForm,
  dataList,
  columns,
  loading,
  pagination,
  currencyTemplateOptions,
  groupOptions,
  adjustVisible,
  modalVisible,
  currentRow,
  opType,
  resetForm,
  onSearch,
  handleMove2RecycleBin,
  handleSizeChange,
  handleCurrentChange,
  reconcileAccounts,
  openAdjustDialog,
  openEditDialog
} = useHook();
onMounted(async () => {
  window.addEventListener("resize", onResize);
});
const onResize = () => {
  width.value = window.innerWidth;
};
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});
// 计算默认展示条数
const defaultCount = computed(() => {
  let base = 3;
  if (width.value <= 1280) {
    base = base - 1; // 2
  } else if (width.value >= 1921) {
    base = base + 1; // 4
  }
  return base;
});
// 最终可见条数：展开时展示所有，收起时展示 defaultCount
const visibleCount = computed(() =>
  expanded.value ? 100 : defaultCount.value
);

// 判断第几个项是否可见
function isVisible(idx: number) {
  return idx < visibleCount.value;
}
</script>

<style scoped>
@media (width > 1920px) {
  .grid-form {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* 分辨率 <= 1920px 时四列 */
@media (width <= 1920px) {
  .grid-form {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 分辨率 <= 768px 时三列 */
@media (width <= 1280px) {
  .grid-form {
    grid-template-columns: repeat(3, 1fr);
  }
}

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
  display: grid;
  padding-bottom: 16px;
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
  width: 100%;
  height: 32px;
}

/* 确保日期选择器的宽度正确 */
.grid-form :deep(.el-date-editor.el-input__wrapper) {
  width: 100% !important;
}

/* 按钮容器样式 */
.search-buttons {
  display: flex;
  grid-column: span 1 / -1;
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

/* 金额范围选择器样式 */
.number-range-picker {
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
}

.amount-input {
  flex: 1;
  width: calc(50% - 10px) !important;
}

.range-separator {
  flex: none;
  margin: 0 5px;
}

/* 修复可能的对齐问题 */
.grid-form :deep(.el-input__wrapper),
.grid-form :deep(.el-select__wrapper) {
  height: 32px;
  line-height: 32px;
}

/* 深度选择器覆盖 element 样式 */
</style>
