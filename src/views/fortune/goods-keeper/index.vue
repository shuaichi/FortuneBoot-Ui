<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="search-form bg-bg_color w-[99/100] pl-8 pr-8 pt-[12px] grid-form"
    >
      <el-form-item label="所属分组：" prop="groupId">
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
      <el-form-item label="所属账本：" prop="bookId">
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
      <el-form-item class="search-buttons">
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
    <PureTableBar title="归物" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openFormDialog('add')"
        >
          新增物品
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
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openFormDialog('modify', row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`确认删除【${row.goodsName}】这条数据？数据一旦删除，将不可恢复！`"
              @confirm="handleRemoveGoodsKeeperApi(row)"
            >
              <template #reference>
                <el-button class="reset-margin" link type="danger" :size="size">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import PureTable from "@pureadmin/table";
import { PureTableBar } from "@/components/RePureTableBar";
import { ElMessage } from "element-plus";
import { ref } from "vue";
import { useHook } from "@/views/fortune/goods-keeper/utils/hook";
import { GoodsKeeperVo } from "@/api/fortune/goods-keeper";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneGoodsKeeper"
});

const opType = ref<"add" | "modify">("add");
const opRow = ref<GoodsKeeperVo>();
const formVisible = ref<boolean>(false);
const {
  loading,
  groupOptions,
  bookOptions,
  columns,
  dataList,
  pagination,
  searchForm,
  onSearch,
  resetForm,
  handleCurrentChange,
  handleSizeChange,
  handleRemoveGoodsKeeperApi
} = useHook();

async function openFormDialog(type: "add" | "modify", row?: GoodsKeeperVo) {
  try {
    opType.value = type;
    opRow.value = row;
    formVisible.value = true;
  } catch (e) {
    console.error(e);
    ElMessage.error((e as Error)?.message || "加载菜单失败");
  }
}
</script>
