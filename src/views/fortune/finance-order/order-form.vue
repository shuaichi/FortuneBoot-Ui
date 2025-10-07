<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    :title="type === 'add' ? '新增报销单' : '修改报销单'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="visible = false"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row :gutter="30">
        <re-col :value="12">
          <el-form-item prop="title" label="标题">
            <el-input v-model="formData.title" placeholder="请输入标题" />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="bookId" label="所属账本">
            <el-select
              v-model="formData.bookId"
              placeholder="请选择账本"
              style="width: 100%"
              :disabled="type === 'edit'"
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
  addFinanceOrderApi,
  FinanceOrderAddCommand,
  FinanceOrderModifyCommand,
  FinanceOrderVo,
  modifyFinanceOrderApi
} from "@/api/fortune/finance-order";
import { BookVo, getEnableBookList } from "@/api/fortune/book";

const props = defineProps<{
  type: "add" | "edit";
  modelValue: boolean;
  row?: FinanceOrderVo;
  groupId: number;
  bookId: number;
}>();

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

const loading = ref(false);
const formRef = ref();
const bookOptions = ref<Array<BookVo>>();

const formData = reactive<FinanceOrderAddCommand | FinanceOrderModifyCommand>({
  bookId: null,
  title: "",
  remark: ""
});

const rules: FormRules = {
  bookId: [{ required: true, message: "账本不能为空" }],
  title: [{ required: true, message: "标题不能为空" }]
};

onMounted(async () => {
  formData.bookId = props.bookId;
  // TODO 1是报销单，暂时写死，后续支持借出单、借入单
  formData.type = 1;
  // formData.status = 1;
  // formData.purchaseDate = dayjs(new Date()).format("YYYY-MM-DD");
  const book = await getEnableBookList(props.groupId);
  bookOptions.value = book.data;
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
      await addFinanceOrderApi(formData);
    } else {
      await modifyFinanceOrderApi(formData);
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
