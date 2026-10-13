<template>
  <v-dialog
    v-model="visible"
    show-full-screen
    :fixed-body-height="false"
    :title="mode === 'add' ? '新建单据' : '编辑单据信息'"
    :loading="loading"
    @cancel="close"
    @opened="handleOpened"
  >
    <el-form ref="formRef" :model="formData" label-width="120px" :rules="rules">
      <el-row :gutter="24">
        <re-col :value="12">
          <el-form-item prop="type" label="单据类型">
            <el-select
              v-model="formData.type"
              :disabled="mode === 'edit'"
              style="width: 100%"
            >
              <el-option
                v-for="item in ORDER_TYPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item label="所属账本">
            <el-input :model-value="bookName" disabled />
          </el-form-item>
        </re-col>
      </el-row>

      <el-row :gutter="24">
        <re-col :value="12">
          <el-form-item prop="counterpartyName" label="对象">
            <el-input
              v-model="formData.counterpartyName"
              :disabled="counterpartyLocked"
              maxlength="64"
              placeholder="请输入交易对象"
            />
          </el-form-item>
        </re-col>
        <re-col :value="12">
          <el-form-item prop="dueDate" label="日期">
            <el-date-picker
              v-model="formData.dueDate"
              type="date"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              placeholder="选择日期"
            />
          </el-form-item>
        </re-col>
      </el-row>

      <el-row :gutter="24">
        <re-col :value="24">
          <el-form-item prop="title" label="标题">
            <el-input
              v-model="formData.title"
              maxlength="50"
              show-word-limit
              placeholder="请输入标题"
            />
          </el-form-item>
        </re-col>
      </el-row>

      <el-row :gutter="24">
        <re-col :value="24">
          <el-form-item prop="remark" label="备注">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              maxlength="512"
              show-word-limit
              placeholder="请输入备注"
            />
          </el-form-item>
        </re-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button :loading="loading" @click="handleConfirm('draft')">
          {{ mode === "add" ? "保存草稿" : "保存" }}
        </el-button>
        <el-button
          v-if="mode === 'add'"
          type="primary"
          :loading="loading"
          @click="handleContinue"
        >
          下一步，记一笔
        </el-button>
      </div>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import type { FormRules } from "element-plus";
import VDialog from "@/components/VDialog/VDialog.vue";
import ReCol from "@/components/ReCol";
import {
  createFinanceOrderV2,
  isOrderVersionConflict,
  modifyFinanceOrderV2,
  type FinanceOrderDetailVo,
  type FinanceOrderMutationVo
} from "@/api/fortune/finance-order-v2";
import { getEnableBookList, type BookVo } from "@/api/fortune/book";
import { message } from "@/utils/message";
import {
  ORDER_TYPE,
  ORDER_TYPE_META,
  ORDER_TYPE_OPTIONS,
  type OrderType
} from "./utils/order-contract";

const props = defineProps<{
  mode: "add" | "edit";
  modelValue: boolean;
  row?: FinanceOrderDetailVo;
  groupId: number;
  bookId: number | string;
  hasEntryHistory?: boolean;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success", result: FinanceOrderMutationVo): void;
  (e: "continue", result: FinanceOrderMutationVo, orderType: OrderType): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});

const loading = ref(false);
const formRef = ref();
const bookOptions = ref<Array<BookVo>>([]);
const requestId = ref(createRequestId());
const requestFingerprint = ref("");

interface OrderFormData {
  bookId?: number | string;
  orderId?: number | string;
  title: string;
  type: OrderType;
  counterpartyId?: number | string | null;
  counterpartyName: string;
  dueDate?: string | null;
  remark: string;
  expectedVersion?: number | string;
}

const formData = reactive<OrderFormData>({
  bookId: props.bookId,
  title: "",
  type: ORDER_TYPE.LOAN_OUT,
  counterpartyId: null,
  counterpartyName: "",
  dueDate: null,
  remark: ""
});

const rules: FormRules = {
  type: [{ required: true, message: "请选择单据类型" }],
  counterpartyName: [
    { required: true, message: "请输入对象", trigger: "blur" },
    { max: 64, message: "对象不能超过64个字符", trigger: "blur" }
  ],
  title: [
    { required: true, message: "请输入标题", trigger: "blur" },
    { max: 50, message: "标题不能超过50个字符", trigger: "blur" }
  ],
  remark: [{ max: 512, message: "备注不能超过512个字符", trigger: "blur" }]
};

const immutableBook = computed(() => props.mode === "edit");
const counterpartyLocked = computed(
  () => props.mode === "edit" && props.hasEntryHistory === true
);
const bookName = computed(
  () =>
    bookOptions.value.find(item => item.bookId === props.bookId)?.bookName ??
    String(props.bookId)
);
const defaultTitle = computed(() => {
  if (!formData.counterpartyName) return "";
  const suffix = {
    [ORDER_TYPE.EXPENSE_CLAIM]: "报销",
    [ORDER_TYPE.LOAN_OUT]: "借款",
    [ORDER_TYPE.LOAN_IN]: "借入"
  }[formData.type];
  return `${formData.counterpartyName} · ${suffix}`;
});

function createRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function currentFingerprint() {
  return JSON.stringify({
    bookId: props.bookId,
    title: formData.title,
    type: formData.type,
    counterpartyId: formData.counterpartyId ?? null,
    counterpartyName: formData.counterpartyName,
    dueDate: formData.dueDate ?? null,
    remark: formData.remark ?? ""
  });
}

watch(
  formData,
  () => {
    const fingerprint = currentFingerprint();
    if (fingerprint === requestFingerprint.value) return;
    requestFingerprint.value = fingerprint;
    requestId.value = createRequestId();
  },
  { deep: true }
);

watch(
  () => [formData.counterpartyName, formData.type],
  () => {
    if (props.mode === "add" && !formData.title && defaultTitle.value) {
      formData.title = defaultTitle.value;
    }
  }
);

function handleOpened() {
  if (props.mode === "edit" && props.row) {
    Object.assign(formData, {
      bookId: props.row.bookId,
      orderId: props.row.orderId,
      title: props.row.title,
      type: props.row.type,
      counterpartyId: props.row.counterpartyId ?? null,
      counterpartyName: props.row.counterpartyName ?? "",
      dueDate: props.row.dueDate ?? null,
      remark: props.row.remark ?? "",
      expectedVersion: props.row.version
    });
  } else {
    formData.bookId = props.bookId;
    formData.orderId = undefined;
    formData.expectedVersion = undefined;
    formData.title = "";
    formData.type = ORDER_TYPE.LOAN_OUT;
    formData.counterpartyId = null;
    formData.counterpartyName = "";
    formData.dueDate = null;
    formData.remark = "";
  }
  requestFingerprint.value = currentFingerprint();
  requestId.value = createRequestId();
}

function close() {
  visible.value = false;
}

async function validateForm() {
  if (!formRef.value) return true;
  try {
    await formRef.value.validate();
    return true;
  } catch {
    return false;
  }
}

async function handleConfirm(_intent: "draft" | "continue" = "draft") {
  if (!(await validateForm())) return;
  if (loading.value) return;
  loading.value = true;
  try {
    const result =
      props.mode === "add"
        ? await createFinanceOrderV2({
            bookId: props.bookId,
            requestId: requestId.value,
            title: formData.title,
            type: formData.type,
            counterpartyId: formData.counterpartyId ?? null,
            counterpartyName: formData.counterpartyName,
            dueDate: formData.dueDate ?? null,
            remark: formData.remark ?? ""
          })
        : await modifyFinanceOrderV2({
            orderId: formData.orderId as number | string,
            bookId: props.bookId,
            requestId: requestId.value,
            expectedVersion: formData.expectedVersion ?? 0,
            title: formData.title,
            type: formData.type,
            counterpartyId: formData.counterpartyId ?? null,
            counterpartyName: formData.counterpartyName,
            dueDate: formData.dueDate ?? null,
            remark: formData.remark ?? ""
          });
    message("操作成功", { type: "success" });
    emits("success", result);
    close();
  } catch (e) {
    if (isOrderVersionConflict(e)) {
      message((e as Error).message, { type: "warning" });
    } else {
      message((e as Error)?.message || "操作失败", { type: "error" });
    }
  } finally {
    loading.value = false;
  }
}

async function handleContinue() {
  if (!(await validateForm())) return;
  if (loading.value) return;
  loading.value = true;
  try {
    const result = await createFinanceOrderV2({
      bookId: props.bookId,
      requestId: requestId.value,
      title: formData.title,
      type: formData.type,
      counterpartyId: formData.counterpartyId ?? null,
      counterpartyName: formData.counterpartyName,
      dueDate: formData.dueDate ?? null,
      remark: formData.remark ?? ""
    });
    message("草稿已保存，请继续记账", { type: "success" });
    emits("continue", result, formData.type);
    close();
  } catch (e) {
    if (isOrderVersionConflict(e)) {
      message((e as Error).message, { type: "warning" });
    } else {
      message((e as Error)?.message || "操作失败", { type: "error" });
    }
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const bookRes = await getEnableBookList(props.groupId);
  bookOptions.value = bookRes.data ?? [];
  requestFingerprint.value = currentFingerprint();
});

defineExpose({
  formData,
  formRef,
  loading,
  immutableBook,
  counterpartyLocked,
  handleConfirm,
  handleContinue
});
</script>

<style scoped>
.dialog-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
