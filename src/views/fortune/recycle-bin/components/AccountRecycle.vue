<template>
  <div>
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="所属分组：" prop="groupId">
        <el-select
          v-model="searchForm.groupId"
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
      <el-form-item label="账户类型：" prop="accountType">
        <el-select
          v-model="searchForm.accountType"
          placeholder="请选择分组"
          class="!w-[200px]"
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
      <el-form-item label="账户名称：" prop="accountName">
        <el-input
          v-model="searchForm.accountName"
          placeholder="请输入账本名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch()"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm()">
          重置</el-button
        >
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
import { onMounted, reactive, ref } from "vue";
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

const pagination = reactive({
  total: 0,
  pageSize: 10,
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
      // 默认使用美元符号
      const symbol = currencySymbols[currencyCode] || currencyCode;
      return `${symbol}${formattedAmount}`;
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
