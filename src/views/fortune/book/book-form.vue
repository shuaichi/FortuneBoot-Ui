<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    :title="type === 'add' ? '新增账本' : '修改账本'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="bookName" label="账本名称">
            <el-input
              v-model="formData.bookName"
              placeholder="请输入账本名称"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="groupId" label="所属分组">
            <el-select
              v-model="formData.groupId"
              placeholder="请选择分组"
              style="width: 100%"
              :disabled="type === 'edit'"
            >
              <el-option
                v-for="item in groupOptions"
                :key="item.groupId"
                :label="item.groupName"
                :value="item.groupId"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="defaultCurrency" label="默认币种">
            <el-select
              v-model="formData.defaultCurrency"
              placeholder="请选择币种"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in currencyOptions"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item
            prop="bookTemplate"
            label="账本模板"
            v-if="props.type === 'add'"
          >
            <el-select
              v-model="formData.bookTemplate"
              placeholder="请选择账本模板"
              style="width: 100%"
              filterable
              clearable
            >
              <el-option
                v-for="item in bookTemplateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="sort" label="排序">
            <el-input-number
              v-model="formData.sort"
              :min="1"
              :max="999"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12" :xs="24" :sm="24">
          <el-form-item label="是否启用">
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
        <re-col :value="12">
          <el-form-item prop="defaultExpenseAccountId" label="默认支出账户">
            <el-select
              v-model="formData.defaultExpenseAccountId"
              placeholder="请选择账户"
              style="width: 100%"
            >
              <el-option
                v-for="item in accountOptions"
                :key="item.accountId"
                :label="item.accountName"
                :value="item.accountId"
              />
            </el-select>
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="defaultIncomeAccountId" label="默认收入账户">
            <el-select
              v-model="formData.defaultIncomeAccountId"
              placeholder="请选择账户"
              style="width: 100%"
            >
              <el-option
                v-for="item in accountOptions"
                :key="item.accountId"
                :label="item.accountName"
                :value="item.accountId"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="defaultTransferOutAccountId" label="默认转出账户">
            <el-select
              v-model="formData.defaultTransferOutAccountId"
              placeholder="请选择账户"
              style="width: 100%"
            >
              <el-option
                v-for="item in accountOptions"
                :key="item.accountId"
                :label="item.accountName"
                :value="item.accountId"
              />
            </el-select>
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="defaultTransferInAccountId" label="默认转入账户">
            <el-select
              v-model="formData.defaultTransferInAccountId"
              placeholder="请选择账户"
              style="width: 100%"
            >
              <el-option
                v-for="item in accountOptions"
                :key="item.accountId"
                :label="item.accountName"
                :value="item.accountId"
              />
            </el-select>
          </el-form-item>
        </re-col>
      </el-row>
      <el-row :gutter="30">
        <re-col :value="24">
          <el-form-item prop="remark" label="备注">
            <el-input
              type="textarea"
              v-model="formData.remark"
              rows="4"
              placeholder="请输入备注"
            />
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, FormRules } from "element-plus";
import VDialog from "@/components/VDialog/VDialog.vue";
import ReCol from "@/components/ReCol";
import {
  addBookApi,
  modifyBookApi,
  AddBookCommand,
  ModifyBookCommand,
  BookVo
} from "@/api/fortune/book";
import { getBookTemplate, getCurrencyTemplate } from "@/api/fortune/group";
import { getEnableGroupList } from "@/api/fortune/group";
import { usePublicHooks } from "@/views/system/hooks";

const props = defineProps<{
  type: "add" | "edit";
  modelValue: boolean;
  row?: BookVo;
}>();
const { switchStyle } = usePublicHooks();
const emits = defineEmits(["update:modelValue", "success"]);

const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});

const loading = ref(false);
const formRef = ref();
const currencyOptions = ref([]);
const groupOptions = ref([]);
const accountOptions = ref([]);
const bookTemplateOptions = ref();

const formData = reactive<AddBookCommand | ModifyBookCommand>({
  bookId: null,
  bookName: "",
  groupId: null,
  defaultCurrency: "CNY",
  defaultExpenseAccountId: null,
  defaultIncomeAccountId: null,
  defaultTransferOutAccountId: null,
  defaultTransferInAccountId: null,
  sort: null,
  remark: "",
  enable: true,
  bookTemplate: null
});

const rules: FormRules = {
  bookName: [{ required: true, message: "账本名称不能为空" }],
  groupId: [{ required: true, message: "所属分组不能为空" }],
  defaultCurrency: [{ required: true, message: "默认币种不能为空" }]
  // sort: [{ required: true, message: "排序不能为空" }]
};

onMounted(async () => {
  const [currencyRes, groupRes, bookTemplateRes] = await Promise.all([
    getCurrencyTemplate(),
    getEnableGroupList(),
    //getAccountList()
    getBookTemplate()
  ]);
  currencyOptions.value = currencyRes.data;
  groupOptions.value = groupRes.data;
  bookTemplateOptions.value = bookTemplateRes.data;
  //accountOptions.value = accountRes.data;
});

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  } else {
    formRef.value?.resetFields();
  }
}

async function handleConfirm() {
  try {
    loading.value = true;
    if (props.type === "add") {
      await addBookApi(formData);
    } else {
      await modifyBookApi(formData);
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
