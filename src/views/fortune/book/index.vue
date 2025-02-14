<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="所属分组：" prop="groupId">
        <el-select
          v-model="searchFormParams.groupId"
          placeholder="请选择分组"
          filterable
          class="!w-[180px]"
        >
          <el-option
            v-for="item in groupOptions"
            :key="item.groupId"
            :label="item.groupName"
            :value="item.groupId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="账本名称：" prop="bookName">
        <el-input
          v-model="searchFormParams.bookName"
          placeholder="请输入账本名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="启用状态：" prop="status">
        <el-select
          v-model="searchFormParams.enable"
          placeholder="请选择状态"
          clearable
          class="!w-[180px]"
        >
          <el-option label="启用" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm()">
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <PureTableBar title="账本管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
        >
          新增账本
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
            <div class="flex items-center justify-center gap-8px w-full">
              <el-button link type="primary" @click="openDialog('edit', row)">
                编辑
              </el-button>
              <el-popconfirm
                :title="`确认将【${row.bookName}】账本移入回收站？`"
                @confirm="handleRecycleBin(row)"
              >
                <template #reference>
                  <el-button link type="danger">回收站</el-button>
                </template>
              </el-popconfirm>
              <el-dropdown>
                <el-button link type="primary">账本配置</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="openCategory(row)">
                      分类管理
                    </el-dropdown-item>
                    <el-dropdown-item @click="openTag(row)">
                      标签管理
                    </el-dropdown-item>
                    <el-dropdown-item @click="openPayee(row)">
                      交易对象
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <book-form
      v-model="modalVisible"
      :type="opType"
      :row="currentRow"
      @success="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { PureTableBar } from "@/components/RePureTableBar";
import PureTable from "@pureadmin/table";
import { onMounted, ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { BookVo } from "@/api/fortune/book";
import BookForm from "./book-form.vue";
import { useHook } from "./utils/hook";
import { useRoute } from "vue-router";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import { getEnableGroupList } from "@/api/fortune/group";
import { message } from "@/utils/message";
import { useRouter } from "vue-router";

/** 组件name最好和菜单表中的router_name一致 */
defineOptions({
  name: "FortuneBook"
});

const route = useRoute();
console.log("当前路由信息：", route);
// 确认输出包含正确的 parent 路由信息

const {
  searchFormParams,
  resetForm,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  handleRecycleBin,
  handleSizeChange,
  handleCurrentChange
} = useHook();

const formRef = ref();
const opType = ref<"add" | "edit">("add");
const currentRow = ref<BookVo>();
const modalVisible = ref(false);
const groupOptions = ref([]);
const router = useRouter();

onMounted(async () => {
  const groupRes = await getEnableGroupList();
  groupOptions.value = groupRes.data;
  if (groupRes.data.length === 0) {
    message("请先启用或创建分组");
  }
});

function openDialog(type: "add" | "edit", row?: BookVo) {
  opType.value = type;
  currentRow.value = row;
  modalVisible.value = true;
}

function openCategory(row?: BookVo) {
  router.push({
    path: "/fortune/category/index",
    query: {
      bookId: row.bookId
    }
  });
}

function openTag(row?: BookVo) {
  router.push({
    path: "/fortune/tag/index",
    query: {
      bookId: row.bookId
    }
  });
}

function openPayee(row?: BookVo) {
  router.push({
    path: "/fortune/payee/index",
    query: {
      bookId: row.bookId
    }
  });
}
</script>
