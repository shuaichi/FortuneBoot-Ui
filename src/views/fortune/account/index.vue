<template>
  <div>
    <div class="fortune-full-width-container">
      <el-radio-group
        v-model="searchForm.accountType"
        size="large"
        class="fortune-full-width-group"
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
        class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] fortune-grid-form"
      >
        <el-form-item v-show="isVisible(0)" label="所属分组：" prop="groupId">
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
          v-show="isVisible(1)"
          label="账户名称："
          prop="accountName"
        >
          <el-input
            v-model="searchForm.accountName"
            placeholder="请输入账本名称"
            clearable
          />
        </el-form-item>
        <el-form-item v-show="isVisible(2)" prop="currencyCode" label="币种：">
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
        <el-form-item v-show="isVisible(3)" prop="include" label="统计状态：">
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
          v-show="isVisible(4)"
          prop="canExpense"
          label="支出状态："
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
        <el-form-item v-show="isVisible(5)" prop="canIncome" label="收入状态：">
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
          v-show="isVisible(6)"
          prop="canTransferOut"
          label="转出状态："
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
          v-show="isVisible(7)"
          prop="canTransferIn"
          label="转入状态："
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
        <el-form-item v-show="isVisible(8)" prop="enable" label="启用状态：">
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
        <el-form-item class="fortune-search-buttons">
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
import { ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AccountForm from "@/views/fortune/account/account-form.vue";
import BalanceAdjust from "@/views/fortune/account/balance-adjust.vue";
import { useResponsiveForm } from "@/views/fortune/hooks/useResponsiveForm";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneAccount"
});

const formRef = ref();
const barRef = ref();

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

const { expanded, width, isVisible } = useResponsiveForm();
</script>
