<script setup lang="ts">
import { ref, reactive } from "vue";
import { useHook } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ElMessage, ElMessageBox } from "element-plus";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { useUserStoreHook } from "@/store/modules/user";
import {
  getParamEnums,
  saveSystemConfig,
  deleteSystemConfig
} from "@/api/system/config";
import Delete from "@iconify-icons/ep/delete"; // 假设接口路径

defineOptions({
  name: "SystemConfig"
});

const yesOrNoList = useUserStoreHook().dictionaryList["common.yesOrNo"];
const tableRef = ref();
const searchFormRef = ref();

const {
  searchFormParams,
  pageLoading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  openDialog,
  handleRefresh,
  getList
} = useHook();

// ==================== 新增弹窗 ====================
const addDialogVisible = ref(false);
const addFormRef = ref();
const addForm = reactive({
  type: "",
  configName: "",
  configKey: "",
  configValue: "",
  configOptions: "",
  isAllowChange: "",
  remark: ""
});

const addRules = {
  type: [{ required: true, message: "请选择参数类型", trigger: "change" }],
  configName: [
    { required: true, message: "请输入/选择参数名称", trigger: "blur" }
  ],
  configKey: [
    { required: true, message: "请输入/选择参数键名", trigger: "blur" }
  ],
  configValue: [{ required: true, message: "请输入参数值", trigger: "blur" }],
  isAllowChange: [
    { required: true, message: "请选择是否允许修改", trigger: "change" }
  ]
};

const configDescriptionOptions = ref([]);
const configOptions = ref([]);
const configValueOptions = ref([]);
const configRequiredOptions = ref([]);

const fetchEnumData = async () => {
  const res = await getParamEnums();
  configDescriptionOptions.value = res.data.rows.map((item: any) => ({
    value: item.description,
    label: item.description
  }));
  configOptions.value = res.data.rows.map((item: any) => ({
    value: item.option,
    label: item.option
  }));
  configValueOptions.value = res.data.rows.map((item: any) => ({
    value: item.value,
    label: item.value
  }));
  configRequiredOptions.value = res.data.rows.map((item: any) => ({
    value: item.required,
    label: item.required
  }));
};

const openAddDialog = () => {
  resetAddForm();
  addDialogVisible.value = true;
};

const resetAddForm = () => {
  Object.assign(addForm, {
    type: "",
    configName: "",
    configKey: "",
    configValue: "",
    configOptions: "",
    isAllowChange: "",
    remark: ""
  });
  addFormRef.value?.clearValidate?.();
};

const onTypeChange = async () => {
  addForm.configName = "";
  addForm.configKey = "";
  addForm.configValue = "";
  addForm.configOptions = "";
  addForm.isAllowChange = "";
  addForm.remark = "";

  if (addForm.type === "builtin") {
    await fetchEnumData();
  }
};

const submitAddForm = () => {
  addFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    try {
      const payload = {
        ...addForm,
        isAllowChange: addForm.isAllowChange === "true",
        configOptions: (() => {
          const options = addForm.configOptions;

          if (!options) return "[]";

          if (Array.isArray(options)) {
            return JSON.stringify(options.map(String));
          }

          if (typeof options === "string") {
            // 如果是以逗号分隔的字符串，分割并去除首尾空格
            return JSON.stringify(
              options
                .split(/[,，]/) // 同时支持英文逗号和中文逗号
                .map(opt => opt.trim())
                .filter(opt => opt.length > 0)
            );
          }

          // 其他类型，如布尔或数字，也转成字符串数组
          return JSON.stringify([String(options)]);
        })()
      };

      await saveSystemConfig(payload);
      ElMessage.success("新增成功");
      addDialogVisible.value = false;
      await getList();
    } catch (e) {
      ElMessage.error("新增失败");
    }
  });
};
const handleDelete = async (row: any) => {
  console.log(row);
  try {
    await ElMessageBox.confirm(
      `确定删除参数 [${row.configName}] 吗？`,
      "提示",
      {
        type: "warning",
        confirmButtonText: "删除",
        cancelButtonText: "取消"
      }
    );

    await deleteSystemConfig(row.configId); // 假设删除时需要 id
    ElMessage.success("删除成功");
    await getList(); // 重新刷新列表
  } catch (err) {
    if (err !== "cancel") ElMessage.error("删除失败");
  }
};
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="参数名称：" prop="configName">
        <el-input
          v-model="searchFormParams.configName"
          placeholder="请输入参数名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="参数键名：" prop="configKey">
        <el-input
          v-model="searchFormParams.configKey"
          placeholder="请输入参数键名"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="允许修改：" prop="isAllowChange">
        <el-select
          v-model="searchFormParams.isAllowChange"
          placeholder="请选择"
          clearable
          class="!w-[180px]"
        >
          <el-option
            v-for="dict in yesOrNoList"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="pageLoading"
          @click="onSearch"
          >搜索</el-button
        >
        <el-button
          :icon="useRenderIcon(Refresh)"
          @click="resetForm(searchFormRef, tableRef)"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <PureTableBar title="通知列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openAddDialog"
          >新增参数</el-button
        >
        <el-button
          type="warning"
          :icon="useRenderIcon(Refresh)"
          @click="handleRefresh()"
          >刷新缓存</el-button
        >
      </template>

      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          ref="tableRef"
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="pageLoading"
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
          @page-size-change="getList"
          @page-current-change="getList"
        >
          <template #operation="{ row }">
            <div class="btn-group">
              <el-button
                type="primary"
                plain
                size="small"
                :icon="useRenderIcon(EditPen)"
                @click="openDialog(row)"
              >
                修改
              </el-button>
              <el-button
                type="danger"
                plain
                size="small"
                :icon="useRenderIcon(Delete)"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 新增参数弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增参数"
      width="600px"
      @close="resetAddForm"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addRules"
        label-width="100px"
      >
        <el-form-item label="参数类型" prop="type">
          <el-select
            v-model="addForm.type"
            placeholder="请选择"
            @change="onTypeChange"
          >
            <el-option label="内置参数" value="builtin" />
            <el-option label="自定义参数" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="参数名称" prop="configName">
          <component
            :is="addForm.type === 'builtin' ? 'el-select' : 'el-input'"
            v-model="addForm.configName"
            placeholder="请输入/选择"
          >
            <template v-if="addForm.type === 'builtin'">
              <el-option
                v-for="item in configDescriptionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </template>
          </component>
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <component
            :is="addForm.type === 'builtin' ? 'el-select' : 'el-input'"
            v-model="addForm.configKey"
            placeholder="请输入/选择"
          >
            <template v-if="addForm.type === 'builtin'">
              <el-option
                v-for="item in configValueOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </template>
          </component>
        </el-form-item>
        <el-form-item label="参数值" prop="configValue">
          <el-input v-model="addForm.configValue" placeholder="请输入参数值" />
        </el-form-item>
        <el-form-item label="参数选项" prop="configOptions">
          <component
            :is="addForm.type === 'builtin' ? 'el-select' : 'el-input'"
            v-model="addForm.configOptions"
            placeholder="请输入/选择,如果多个值以逗号间隔"
          >
            <template v-if="addForm.type === 'builtin'">
              <el-option
                v-for="item in configOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </template>
          </component>
        </el-form-item>

        <el-form-item label="允许修改" prop="isAllowChange">
          <el-select
            v-model="addForm.isAllowChange"
            placeholder="请选择"
            class="!w-full"
          >
            <el-option label="是" value="true" />
            <el-option label="否" value="false" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="addForm.remark"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.btn-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
}
</style>
