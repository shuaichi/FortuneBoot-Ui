<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    :title="type === 'add' ? '新增分组' : '修改分组'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="82px" :rules="rules" ref="formRef">
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item
            prop="groupName"
            label="分组名称"
            required
            inline-message
          >
            <el-input
              v-model="formData.groupName"
              placeholder="请输入分组名称"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="defaultCurrency" label="默认币种" required>
            <el-select
              v-model="formData.defaultCurrency"
              placeholder="请选择默认币种"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in currencyTemplateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12" v-if="props.type === 'add'">
          <el-form-item prop="bookTemplate" label="账本模板" required>
            <el-select
              v-model="formData.bookTemplate"
              placeholder="请选择账本模板"
              style="width: 100%"
            >
              <el-option
                v-for="item in bookTemplateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </re-col>
        <re-col :value="12" v-if="props.type !== 'add'">
          <el-form-item prop="defaultBookId" label="默认账本" required>
            <el-select
              v-model="(formData as ModifyGroupCommand).defaultBookId"
              placeholder="请选择默认账本"
              style="width: 100%"
            >
              <el-option
                v-for="item in bookOptions"
                :key="item.bookId"
                :label="item.bookName"
                :value="item.bookId"
              />
            </el-select>
          </el-form-item>
        </re-col>
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="启用状态">
            <el-switch
              v-model="formData.enable"
              inline-prompt
              :active-value="true"
              :inactive-value="false"
              active-text="启用"
              inactive-text="停用"
              :style="switchStyle"
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
import {
  addGroupApi,
  AddGroupCommand,
  getBookTemplate,
  getCurrencyTemplate,
  GroupVo,
  modifyGroupApi,
  ModifyGroupCommand
} from "@/api/fortune/group";
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, FormRules } from "element-plus";
import ReCol from "@/components/ReCol";
import { BookVo, getBookByGroupId } from "@/api/fortune/book";
import { usePublicHooks } from "@/views/system/hooks";

const props = defineProps<Props>();
const loading = ref(false);
const { switchStyle } = usePublicHooks();
const bookTemplateOptions = ref();
const currencyTemplateOptions = ref();

const bookOptions = ref<Array<BookVo>>();
onMounted(async () => {
  const bookTemplate = await getBookTemplate();
  bookTemplateOptions.value = bookTemplate.data;
  const currency = await getCurrencyTemplate();
  currencyTemplateOptions.value = currency.data;
  if (props.type !== "add") {
    const book = await getBookByGroupId(props.row.groupId);
    bookOptions.value = book.data;
  }
});

interface Props {
  type: "add" | "upload";
  modelValue: boolean;
  row?: GroupVo;
}

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});
const formData = reactive<AddGroupCommand | ModifyGroupCommand>({
  defaultCurrency: "CNY",
  defaultBookId: null
});

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  } else {
    //formRef.value?.resetFields();
  }
}

async function handleConfirm() {
  try {
    loading.value = true;
    switch (props.type) {
      case "add":
        await addGroupApi(formData as AddGroupCommand);
        break;
      case "upload":
        await modifyGroupApi(formData as ModifyGroupCommand);
        break;
      default:
        break;
    }
    ElMessage.info("提交成功");
    visible.value = false;
    console.log(visible.value);
    emits("success");
  } catch (e) {
    console.error(e);
    ElMessage.error((e as Error)?.message || "提交失败");
  } finally {
    loading.value = false;
  }
}

const rules: FormRules = {
  groupName: [
    {
      required: true,
      message: "分组名称不能为空"
    }
  ],
  defaultCurrency: [
    {
      required: true,
      message: "默认币种不能为空"
    }
  ],
  bookTemplate: [
    {
      required: props.type === "add",
      message: "账本模板不能为空"
    }
  ],
  defaultBookId: [
    {
      required: props.type !== "add",
      message: "默认账本不能为空"
    }
  ]
};
</script>
