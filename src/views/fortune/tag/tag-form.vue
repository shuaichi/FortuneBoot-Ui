<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    :title="type === 'add' ? '新增标签' : '修改标签'"
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
          <el-form-item prop="parentId" label="父级标签">
            <el-tree-select
              v-model="formData.parentId"
              check-strictly
              :disabled="props.type !== 'add'"
              :data="tagOptions"
              placeholder="请选择父级标签"
              style="width: 100%"
              :props="tagTreeProps"
            />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="tagName" label="标签名称">
            <el-input v-model="formData.tagName" placeholder="请输入名称" />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="7">
          <el-form-item prop="canExpense" label="支出状态">
            <el-switch v-model="formData.canExpense" :style="switchStyle" />
          </el-form-item>
        </re-col>
        <re-col :value="7">
          <el-form-item prop="canIncome" label="收入状态">
            <el-switch v-model="formData.canIncome" :style="switchStyle" />
          </el-form-item>
        </re-col>
        <re-col :value="7">
          <el-form-item prop="canTransfer" label="转账状态">
            <el-switch v-model="formData.canTransfer" :style="switchStyle" />
          </el-form-item>
        </re-col>
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
  addTagApi,
  AddTagCommand,
  getTagPageApi,
  modifyTagApi,
  ModifyTagCommand,
  TagVo
} from "@/api/fortune/tag";

const props = defineProps<{
  type: "add" | "edit";
  modelValue: boolean;
  row?: TagVo;
  bookId?: number;
}>();

const formData = reactive<AddTagCommand | ModifyTagCommand>({
  canExpense: true,
  canIncome: true,
  canTransfer: true,
  enable: true
});
const loading = ref(false);
const formRef = ref();
const tagOptions = ref([]);
const { switchStyle } = usePublicHooks();
const emits = defineEmits(["update:modelValue", "success"]);
const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});
const tagTreeProps = {
  label: "tagName",
  value: "tagId",
  children: "children"
};
const rules: FormRules = {
  tagName: [{ required: true, message: "标签名称不能为空" }],
  canExpense: [{ required: true, message: "支出状态不能为空" }],
  canIncome: [{ required: true, message: "收入状态不能为空" }],
  canTransfer: [{ required: true, message: "转账状态不能为空" }],
  enable: [{ required: true, message: "启用状态不能为空" }]
};

async function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  } else {
    formRef.value?.resetFields();
    formData.bookId = props.bookId;
  }
  if (props.type !== "add" && formData.parentId === -1) {
    tagOptions.value = [{ tagName: "根节点", tagId: -1 }];
  } else {
    const tagRes = await getTagPageApi({
      bookId: formData.bookId,
      recycleBin: false
    });
    tagOptions.value = tagRes.data.rows;
  }
}

async function handleConfirm() {
  try {
    loading.value = true;
    if (props.type === "add") {
      formData.parentId = formData.parentId ? formData.parentId : -1;
      await addTagApi(formData);
    } else {
      await modifyTagApi(formData);
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
