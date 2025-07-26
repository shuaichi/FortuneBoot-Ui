<template>
  <el-dialog
    v-model="visible"
    title="新增参数"
    width="600px"
    @close="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="参数类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择"
          @change="onTypeChange"
          class="!w-full"
        >
          <el-option label="内置参数" value="builtin" />
          <el-option label="自定义参数" value="custom" />
        </el-select>
      </el-form-item>

      <el-form-item label="参数名称" prop="configName">
        <component
          class="!w-full"
          :is="form.type === 'builtin' ? 'el-select' : 'el-input'"
          v-model="form.configName"
          placeholder="请输入/选择"
        >
          <template v-if="form.type === 'builtin'">
            <el-option
              v-for="item in descriptionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </template>
        </component>
      </el-form-item>

      <el-form-item label="参数键名" prop="configKey">
        <component
          class="!w-full"
          :is="form.type === 'builtin' ? 'el-select' : 'el-input'"
          v-model="form.configKey"
          placeholder="请输入/选择"
          :disabled="form.type === 'builtin'"
        >
          <template v-if="form.type === 'builtin'">
            <el-option
              v-for="item in valueOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </template>
        </component>
      </el-form-item>

      <el-form-item label="参数值" prop="configValue">
        <el-input
          v-model="form.configValue"
          placeholder="请输入参数值"
          :disabled="form.isAllowChange"
        />
      </el-form-item>

      <el-form-item label="参数选项" prop="configOptions">
        <component
          class="!w-full"
          :is="form.type === 'builtin' ? 'el-select' : 'el-input'"
          v-model="form.configOptions"
          placeholder="请输入/选择,如果多个值以逗号间隔"
          :disabled="form.type === 'builtin'"
        >
          <template v-if="form.type === 'builtin'">
            <el-option
              v-for="item in optionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </template>
        </component>
      </el-form-item>

      <el-form-item label="允许修改" prop="isAllowChange">
        <el-select
          v-model="form.isAllowChange"
          placeholder="请选择"
          class="!w-full"
          :disabled="form.type === 'builtin'"
        >
          <el-option label="是" value="true" />
          <el-option label="否" value="false" />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder="请输入备注"
          :disabled="form.type === 'builtin'"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, defineEmits, defineProps } from "vue";
import { ElMessage } from "element-plus";
import { getParamEnums, saveSystemConfig } from "@/api/system/config";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "success"): void;
}>();

const visible = ref(props.modelValue);
const formRef = ref();
const form = reactive({
  type: "custom",
  configName: "",
  configKey: "",
  configValue: "",
  configOptions: "",
  isAllowChange: "",
  remark: ""
});

watch(
  () => props.modelValue,
  val => (visible.value = val)
);
watch(visible, val => emit("update:modelValue", val));

watch(
  () => form.configName,
  async () => {
    if (form.type !== "builtin") {
      return;
    }
    const configKey = configKeyDTOList.value.find(
      (item: any) => item.description === form.configName
    );
    form.configKey = configKey.value;
    form.configValue = configKey.defaultValue;
    form.configOptions = configKey.option;
    form.isAllowChange = configKey.isAllowChange;
    form.remark = configKey.remark;
  }
);

const rules = {
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

const descriptionOptions = ref([]);
const optionOptions = ref([]);
const valueOptions = ref([]);
const configKeyDTOList = ref([]);

const fetchEnumData = async () => {
  const res = await getParamEnums();
  const rows = res.data;
  configKeyDTOList.value = rows;
  descriptionOptions.value = rows.map(item => ({
    value: item.description,
    label: item.description
  }));
  optionOptions.value = rows.map(item => ({
    value: item.option,
    label: item.option
  }));
  valueOptions.value = rows.map(item => ({
    value: item.value,
    label: item.value
  }));
};

const onTypeChange = async () => {
  Object.assign(form, {
    configName: "",
    configKey: "",
    configValue: "",
    configOptions: "",
    isAllowChange: "",
    remark: ""
  });
  if (form.type === "builtin") await fetchEnumData();
};

const resetForm = () => {
  Object.assign(form, {
    type: "custom",
    configName: "",
    configKey: "",
    configValue: "",
    configOptions: "",
    isAllowChange: "",
    remark: ""
  });
  formRef.value?.clearValidate?.();
};

const handleSubmit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    try {
      const payload = {
        ...form,
        isAllowChange: form.isAllowChange === "true",
        configOptions: (() => {
          return formatConfigOptions(form.configOptions);
        })()
      };
      await saveSystemConfig(payload);
      ElMessage.success("新增成功");
      visible.value = false;
      emit("success");
    } catch (err) {
      ElMessage.error("新增失败");
    }
  });
};

const formatConfigOptions = (options: any): string => {
  if (!options) return "[]";
  if (Array.isArray(options)) return JSON.stringify(options.map(String));
  if (typeof options === "string") {
    return JSON.stringify(
      options
        .split(/[,，]/)
        .map(v => v.trim())
        .filter(v => !!v)
    );
  }
  return JSON.stringify([String(options)]);
};
</script>
