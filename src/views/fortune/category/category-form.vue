<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    :title="
      type === 'add'
        ? props.categoryType === 1
          ? '新增支出分类'
          : '新增收入分类'
        : props.categoryType === 2
        ? '修改收入分类'
        : '修改支出分类'
    "
    v-model="visible"
    width="640px"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="parentId" label="父级分类">
            <el-tree-select
              v-model="formData.parentId"
              check-strictly
              :disabled="props.type !== 'add'"
              :data="categoryOptions"
              placeholder="请选择父级分类"
              style="width: 100%"
              :props="categoryTreeProps"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="categoryName" label="分类名称">
            <el-input
              v-model="formData.categoryName"
              placeholder="请输入名称"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="6">
          <el-form-item prop="enable" label="启用状态">
            <el-switch v-model="formData.enable" :style="switchStyle" />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="sort" label="顺序">
            <el-input-number
              v-model="formData.sort"
              :min="0"
              :precision="0"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="remark" label="备注" style="margin-bottom: 0">
            <el-input
              type="textarea"
              v-model="formData.remark"
              rows="6"
              placeholder="请输入备注"
            />
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<script setup lang="ts">
import VDialog from "@/components/VDialog/VDialog.vue";
import ReCol from "@/components/ReCol";
import { usePublicHooks } from "@/views/system/hooks";
import { computed, reactive, ref } from "vue";
import { ElMessage, FormRules } from "element-plus";
import {
  addCategoryApi,
  AddCategoryCommand,
  CategoryVo,
  getCategoryListApi,
  modifyCategoryApi,
  ModifyCategoryCommand
} from "@/api/fortune/category";

const props = defineProps<{
  categoryType: number;
  type: "add" | "edit";
  modelValue: boolean;
  row?: CategoryVo;
  bookId?: number;
}>();

const formData = reactive<AddCategoryCommand | ModifyCategoryCommand>({
  enable: true
});
const loading = ref(false);
const formRef = ref();
const categoryOptions = ref([]);
const { switchStyle } = usePublicHooks();
const emits = defineEmits(["update:modelValue", "success"]);
const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});
const categoryTreeProps = {
  label: "categoryName",
  value: "categoryId",
  children: "children"
};
const rules: FormRules = {
  categoryName: [{ required: true, message: "分类名称不能为空" }],
  enable: [{ required: true, message: "启用状态不能为空" }]
};

async function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  } else {
    formRef.value?.resetFields();
    formData.bookId = props.bookId;
    formData.categoryType = props.categoryType;
  }
  if (props.type !== "add" && formData.parentId === -1) {
    categoryOptions.value = [{ categoryName: "根节点", categoryId: -1 }];
  } else {
    const categoryRes = await getCategoryListApi({
      bookId: formData.bookId,
      categoryType: formData.categoryType,
      recycleBin: false
    });
    categoryOptions.value = trimTreeToTwoLevels(categoryRes.data);
  }
}

function trimTreeToTwoLevels(nodes: Array<CategoryVo>) {
  return nodes.map(node => {
    // 复制当前节点的其他属性
    const newNode = { ...node };
    // 如果当前节点有子节点，则只保留它们的直接子节点，并清空更深层次的子节点
    if (newNode.children && newNode.children.length > 0) {
      newNode.children = newNode.children.map(childNode => {
        // 复制子节点的其他属性
        const trimmedChildNode = { ...childNode };
        // 清空子节点的子节点
        trimmedChildNode.children = [];
        return trimmedChildNode;
      });
    }
    return newNode;
  });
}

async function handleConfirm() {
  try {
    loading.value = true;
    if (props.type === "add") {
      formData.parentId = formData.parentId ? formData.parentId : -1;
      await addCategoryApi(formData);
    } else {
      await modifyCategoryApi(formData);
    }
    ElMessage.success("操作成功");
    visible.value = false;
    emits("success");
  } catch (e) {
    ElMessage.error(e.message || "操作失败");
  } finally {
    loading.value = false;
  }
}
</script>
