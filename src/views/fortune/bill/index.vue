<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] fortune-grid-form"
    >
      <el-form-item label="所属分组：" prop="groupId" v-show="isVisible(0)">
        <el-select
          v-model="searchForm.groupId"
          placeholder="请选择账本"
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
      <el-form-item label="所属账本：" prop="bookId" v-show="isVisible(1)">
        <el-select
          v-model="searchForm.bookId"
          placeholder="请选择账本"
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
      <el-form-item label="所属账户：" prop="accountId" v-show="isVisible(2)">
        <el-select
          v-model="searchForm.accountId"
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
      <el-form-item label="标题：" prop="title" v-show="isVisible(3)">
        <el-input
          v-model.trim="searchForm.title"
          placeholder="请输入标题"
          clearable
        />
      </el-form-item>
      <el-form-item label="交易类型：" prop="billType" v-show="isVisible(4)">
        <el-select
          v-model="searchForm.billType"
          placeholder="请选择类型"
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
      <el-form-item
        label="交易时间："
        prop="tradeTimeRange"
        v-show="isVisible(5)"
      >
        <el-date-picker
          v-model="searchForm.tradeTimeRange"
          type="daterange"
          range-separator="-"
          class="!w-[260px]"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item prop="amountMin" label="金额：" v-show="isVisible(6)">
        <div class="fortune-number-range-picker">
          <el-input-number
            v-model="searchForm.amountMin"
            placeholder="最小值"
            :precision="2"
            :controls="false"
            class="amount-input"
          />
          <span class="range-separator">—</span>
          <el-input-number
            v-model="searchForm.amountMax"
            placeholder="最大值"
            :precision="2"
            :controls="false"
            class="amount-input"
          />
        </div>
      </el-form-item>
      <el-form-item label="分类：" prop="categoryIds" v-show="isVisible(7)">
        <el-tree-select
          v-model="searchForm.categoryIds"
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
      <el-form-item prop="tagIds" label="标签：" v-show="isVisible(8)">
        <el-tree-select
          v-model="searchForm.tagIds"
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
      <el-form-item prop="payeeId" label="交易对象：" v-show="isVisible(9)">
        <el-select
          filterable
          v-model="searchForm.payeeId"
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
      <el-form-item prop="confirm" label="确认状态：" v-show="isVisible(10)">
        <el-select
          v-model="searchForm.confirm"
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
      <el-form-item prop="include" label="统计状态：" v-show="isVisible(11)">
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
      <el-form-item label="备注：" prop="remark" v-show="isVisible(12)">
        <el-input
          v-model="searchForm.remark"
          placeholder="请输入备注"
          clearable
        />
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
        <el-button type="text" @click="expanded = !expanded">
          {{ expanded ? "收起" : "展开" }}
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar :title="tableTitle" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add', null)"
        >
          新增账单
        </el-button>
        <el-button
          type="warning"
          :icon="useRenderIcon(Download)"
          @click="exportAllExcel"
        >
          导出账单
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
          :pagination="pagination"
          :paginationSmall="size === 'small'"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              link
              type="success"
              @click="openDialog('add', row)"
              :disabled="row.billType === 4"
            >
              复制
            </el-button>
            <el-button
              link
              type="primary"
              @click="openDialog('edit', row)"
              :disabled="row.billType === 4"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`确认删除【${row.title}】账单？`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <bill-form
      v-if="modalVisible"
      v-model="modalVisible"
      :groupId="groupIdProp"
      :bookId="bookIdProp"
      :type="opType"
      :row="currentRow"
      @success="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onBeforeUnmount, watch } from "vue";
import { emitter } from "@/utils/mitt";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { PureTableBar } from "@/components/RePureTableBar";
import PureTable from "@pureadmin/table";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import BillForm from "./bill-form.vue";
import { useHook } from "./utils/hook";
import { BookVo, getEnableBookList } from "@/api/fortune/book";
import { AccountVo, getEnableAccountList } from "@/api/fortune/account";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { message } from "@/utils/message";
import { CategoryVo, getEnableCategoryList } from "@/api/fortune/category";
import { getEnablePayeeList, PayeeVo } from "@/api/fortune/payee";
import { getEnableTagList, TagVo } from "@/api/fortune/tag";
import { useRoute } from "vue-router";
import Download from "@iconify-icons/ep/download";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneBill"
});

const opType = ref<"add" | "edit">("add");
const currentRow = ref();
const modalVisible = ref(false);
const groupIdProp = ref();
const bookIdProp = ref();
const groupOptions = ref<Array<GroupVo>>();
const bookOptions = ref<Array<BookVo>>();
const accountOptions = ref<Array<AccountVo>>();
const formRef = ref();
const categoryOptions = ref<Array<CategoryVo>>();
const payeeOptions = ref<Array<PayeeVo>>();
const tagOptions = ref<Array<TagVo>>();

const expanded = ref(false);
const width = ref(window.innerWidth);

const route = useRoute();

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
const {
  searchForm,
  dataList,
  columns,
  loading,
  pagination,
  billTypeOptions,
  billStatistics,
  onSearch,
  exportAllExcel,
  handleDelete,
  resetForm,
  handleSizeChange,
  handleCurrentChange
} = useHook();

onMounted(async () => {
  window.addEventListener("resize", onResize);
  // 初始化分组
  await initGroup();
  // 初始化分组下的账本和账户
  await initBookAndAccount();
  // 查询账单数据
  await onSearch();
  // 初始化搜索表单下拉框
  await initSearchSelect();

  // 监听账单创建成功事件，刷新账单列表
  emitter.on("billCreated", onSearch);
});
const onResize = () => {
  width.value = window.innerWidth;
};
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  // 移除事件监听
  emitter.off("billCreated", onSearch);
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

const initGroup = async () => {
  const groupRes = await getEnableGroupList();
  if (groupRes.data.length === 0) {
    message("请先启用或创建分组");
  }
  groupOptions.value = groupRes.data;
  // 获取 onMounted 时的分组 id
  searchForm.groupId = await getMountedGroupId();
};

const getMountedGroupId = async () => {
  if (route.query.groupId) {
    return Number(route.query.groupId);
  } else {
    const defaultGroup = await getDefaultGroupId();
    return defaultGroup.data;
  }
};

// 初始化账本和账户
const initBookAndAccount = async () => {
  const [booksRes, accountsRes] = await Promise.all([
    getEnableBookList(searchForm.groupId),
    getEnableAccountList(searchForm.groupId)
  ]);
  bookOptions.value = booksRes.data;
  searchForm.bookId = groupOptions.value.find(
    group => group.groupId === searchForm.groupId
  ).defaultBookId;
  accountOptions.value = accountsRes.data;

  // 对账（如果 route 中有账户，则查询这个账户的数据）
  if (route.query.accountId) {
    searchForm.accountId = Number(route.query.accountId);
  }
};

const initSearchSelect = async () => {
  // 查询账单分类、交易对象、标签下拉框
  const [categoryRes, payeeRes, tagRes] = await Promise.all([
    getEnableCategoryList(searchForm.bookId, null),
    getEnablePayeeList(searchForm.bookId, null),
    getEnableTagList(searchForm.bookId, null)
  ]);
  categoryOptions.value = categoryRes.data;
  payeeOptions.value = payeeRes.data;
  tagOptions.value = tagRes.data;
};

watch(
  () => searchForm.groupId,
  async () => {
    await initBookAndAccount();
  }
);
watch(
  () => searchForm.bookId,
  async () => {
    await onSearch();
    await initSearchSelect();
  }
);
const tableTitle = computed(() => {
  const statistics = billStatistics.value;
  // eslint-disable-next-line no-irregular-whitespace
  return `账单管理　|　总收入：${statistics?.income ?? 0}元　|　总支出：${
    statistics?.expense ?? 0
    // eslint-disable-next-line no-irregular-whitespace
  }元　|　总结余：${statistics?.surplus ?? 0}元`;
});

function openDialog(type: "add" | "edit", row?: any) {
  opType.value = type;
  groupIdProp.value = searchForm.groupId;
  bookIdProp.value = searchForm.bookId;
  currentRow.value = row;
  modalVisible.value = true;
}
</script>

<style scoped>
/* 页面特有样式可以在这里添加 */
</style>
