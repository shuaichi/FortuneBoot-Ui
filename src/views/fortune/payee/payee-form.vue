<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    :title="type === 'add' ? '新增交易对象' : '修改交易对象'"
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
          <el-form-item prop="payeeName" label="名称">
            <el-input v-model="formData.payeeName" placeholder="请输入名称" />
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="8">
          <el-form-item prop="canExpense" label="支出状态">
            <el-switch v-model="formData.canExpense" :style="switchStyle" />
          </el-form-item>
        </re-col>
        <re-col :value="8">
          <el-form-item prop="canIncome" label="收入状态">
            <el-switch v-model="formData.canIncome" :style="switchStyle" />
          </el-form-item>
        </re-col>
        <re-col :value="7">
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
import {
  addPayeeApi,
  modifyPayeeApi,
  AddPayeeCommand,
  ModifyPayeeCommand,
  PayeeVo
} from "@/api/fortune/payee";
import { ElMessage, FormRules } from "element-plus";

const props = defineProps<{
  type: "add" | "edit";
  modelValue: boolean;
  row?: PayeeVo;
  bookId?: number;
}>();

const formData = reactive<AddPayeeCommand | ModifyPayeeCommand>({
  canExpense: true,
  canIncome: true,
  enable: true
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
  payeeName: [{ required: true, message: "所属名称不能为空" }],
  canExpense: [{ required: true, message: "支出状态不能为空" }],
  canIncome: [{ required: true, message: "收入状态不能为空" }],
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
      await addPayeeApi(formData);
    } else {
      await modifyPayeeApi(formData);
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
