<template>
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
      <el-form-item label="账户类型：" prop="accountType" v-show="isVisible(1)">
        <el-select
          v-model="searchForm.accountType"
          placeholder="请选择分组"
          filterable
        >
          <el-option
            v-for="item in accountTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="账户名称：" prop="accountName" v-show="isVisible(2)">
        <el-input
          v-model="searchForm.accountName"
          placeholder="请输入账本名称"
          clearable
        />
      </el-form-item>
      <el-form-item class="search-buttons">
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch()"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm()">
          重置
        </el-button>
        <el-button
          type="text"
          @click="expanded = !expanded"
          v-show="width <= 1280"
        >
          {{ expanded ? "收起" : "展开" }}
        </el-button>
      </el-form-item>
    </el-form>
    <PureTableBar title="账户回收站" :columns="columns" @refresh="onSearch">
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
            <el-popconfirm
              :title="`确认恢复【${row.accountName}】账户吗？`"
              @confirm="handlePutBack(row)"
            >
              <template #reference>
                <el-button link type="primary">恢复</el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm
              :title="`确认删除【${row.accountName}】账户吗？数据一旦删除，将不可恢复！`"
              @confirm="handleRemove(row)"
            >
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>
<script setup lang="ts">
import PureTableBar from "@/components/RePureTableBar/src/bar";
import Search from "@iconify-icons/ep/search";
import PureTable from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import {
  accountPutBackApi,
  AccountQuery,
  accountRemoveApi,
  AccountVo,
  getFortuneAccountPage
} from "@/api/fortune/account";
import Refresh from "@iconify-icons/ep/refresh";
import {
  getDefaultGroupId,
  getEnableGroupList,
  GroupVo
} from "@/api/fortune/group";
import { message } from "@/utils/message";

const searchForm = reactive<AccountQuery>({
  recycleBin: true
});
const groupOptions = ref<Array<GroupVo>>();
const defaultGroup = ref<number>();
const accountTypeOptions = ref([
  { label: "活期", value: 1 },
  { label: "信用", value: 2 },
  { label: "资产", value: 3 },
  { label: "贷款", value: 4 }
]);
const loading = ref(false);
const dataList = ref<Array<AccountVo>>();

// 展开收起
const expanded = ref(false);
const width = ref(window.innerWidth);

const pagination = reactive({
  total: 0,
  pageSize: 10,
  pageSizes: [10, 20, 50, 100],
  currentPage: 1,
  background: true
});

const columns: TableColumnList = [
  {
    label: "账户名称",
    prop: "accountName",
    minWidth: 150,
    align: "left"
  },
  {
    label: "账户类型",
    prop: "accountType",
    minWidth: 100,
    formatter: ({ accountType }) =>
      accountTypeOptions.value.find(t => t.value === accountType)?.label
  },
  {
    label: "币种",
    prop: "currencyCode",
    minWidth: 80
  },
  {
    label: "余额",
    prop: "balance",
    minWidth: 150,
    formatter: ({ balance, currencyCode }) => {
      if (!balance) {
        return "-";
      }
      const formattedAmount = balance
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      // 货币符号映射
      const currencySymbols = {
        // 人民币
        CNY: "￥",
        // 美元
        USD: "$",
        // 欧元
        EUR: "€",
        // 英镑
        GBP: "£",
        // 日元
        JPY: "¥",
        // 澳元
        AUD: "A$",
        // 加元
        CAD: "C$",
        // 印度卢比
        INR: "₹",
        // 港币
        HKD: "HK$",
        // 新西兰元
        NZD: "NZ$",
        // 瑞典克朗
        SEK: "Kr",
        // 韩币
        KRW: "₩",
        // 新加坡元
        SGD: "S$",
        // 卢布
        RUB: "₽",
        // 南非兰特
        ZAR: "R",
        //泰铢
        THB: "฿"
      };
      if (currencySymbols[currencyCode]) {
        // 主要货币符号和金额之间无空格
        return `${currencySymbols[currencyCode]}${formattedAmount}`;
      } else {
        // 货币编码和金额之间有空格
        return `${currencyCode} ${formattedAmount}`;
      }
    }
  },
  {
    label: "备注",
    prop: "remark",
    minWidth: 200
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    minWidth: 180
  }
];

onMounted(async () => {
  window.addEventListener("resize", onResize);
  const [groupRes, defaultGroupId] = await Promise.all([
    getEnableGroupList(),
    getDefaultGroupId()
  ]);
  groupOptions.value = groupRes.data;
  if (groupRes.data.length === 0) {
    message("请先启用或创建分组");
    return;
  }
  defaultGroup.value = defaultGroupId.data
    ? defaultGroupId.data
    : groupOptions.value[0].groupId;
  searchForm.groupId = defaultGroup.value;
  await onSearch();
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

async function onSearch() {
  try {
    loading.value = true;
    const accountRes = await getFortuneAccountPage(searchForm);
    dataList.value = accountRes.data.rows;
    pagination.total = accountRes.data.total;
  } catch (e) {
    message(e.message || "查询失败", { type: "error" });
  } finally {
    loading.value = false;
  }
}

async function resetForm() {
  searchForm.groupId = defaultGroup.value;
  searchForm.accountType = null;
  searchForm.accountName = null;
  await onSearch();
}

function handleSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  searchForm.pageSize = pageSize;
  onSearch();
}

function handleCurrentChange(currentPage: number) {
  pagination.currentPage = currentPage;
  searchForm.pageNum = currentPage;
  onSearch();
}

async function handlePutBack(row: AccountVo) {
  await accountPutBackApi(row.groupId, row.accountId);
  message("恢复成功");
  await onSearch();
}

async function handleRemove(row: AccountVo) {
  await accountRemoveApi(row.groupId, row.accountId);
  message("删除成功");
  await onSearch();
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

/* 修复可能的对齐问题 */
.grid-form :deep(.el-input__wrapper),
.grid-form :deep(.el-select__wrapper) {
  height: 32px;
  line-height: 32px;
}
</style>
