<template>
  <v-dialog
    v-model="visible"
    show-full-screen
    :fixed-body-height="false"
    :title="type === 'add' ? '新增成员' : '修改成员'"
    width="640px"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form ref="formRef" :model="formData" label-width="120px" :rules="rules">
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="memberName" label="名称">
            <el-input v-model="formData.memberName" placeholder="请输入名称" />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="enable" label="启用状态">
            <el-switch v-model="formData.enable" :style="switchStyle" />
          </el-form-item>
        </re-col>
        <re-col :value="12">
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
              v-model="formData.remark"
              type="textarea"
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
import {
  addMemberApi,
  modifyMemberApi,
  AddMemberCommand,
  ModifyMemberCommand,
  MemberVo
} from "@/api/fortune/member";
import { ElMessage, FormRules } from "element-plus";

const props = defineProps<{
  type: "add" | "edit";
  modelValue: boolean;
  row?: MemberVo;
  bookId?: number;
}>();

const formData = reactive<AddMemberCommand | ModifyMemberCommand>({
  enable: true,
  sort: 1
});

const loading = ref(false);
const formRef = ref();
const { switchStyle } = usePublicHooks();
const emits = defineEmits(["update:modelValue", "success"]);
const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});

const rules: FormRules = {
  memberName: [{ required: true, message: "成员名称不能为空" }],
  enable: [{ required: true, message: "启用状态不能为空" }]
};

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  } else {
    formRef.value?.resetFields();
    formData.bookId = props.bookId;
  }
}

async function handleConfirm() {
  try {
    loading.value = true;
    if (props.type === "add") {
      await addMemberApi(formData as AddMemberCommand);
    } else {
      await modifyMemberApi(formData as ModifyMemberCommand);
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
