<template>
  <div>
    <el-dialog
      v-model="visible"
      title="差额结清确认"
      width="min(520px, 92vw)"
      :close-on-click-modal="false"
    >
      <el-alert type="warning" :closable="false" show-icon>
        {{
          order.type === 3
            ? "对方免除还款"
            : order.type === 2
              ? "确认无法收回"
              : "转为自付"
        }}
      </el-alert>
      <div class="adjustment-body">
        <p>差额结清金额：{{ formatAmount(order.pendingAmount) }}</p>
        <p>{{ writeOffImpact }}</p>
        <p class="warning-text">
          这是非现金调整，确认后不会再次改变账户余额；请继续选择分类并填写原因。
        </p>
      </div>
      <template #footer>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="continueToForm">继续</el-button>
      </template>
    </el-dialog>

    <bill-form
      v-if="formVisible"
      v-model="formVisible"
      type="add"
      :group-id="groupId"
      :book-id="order.bookId"
      :context-book-id="order.bookId"
      :context-order-id="order.orderId"
      :context-bill-type="writeOffBillType"
      :context-component="ORDER_COMPONENT.WRITE_OFF"
      :context-title="writeOffTitle"
      :context-amount="order.pendingAmount"
      :expected-version="order.version"
      lock-order-context
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BillForm from "@/views/fortune/bill/bill-form.vue";
import type {
  FinanceOrderDetailVo,
  FinanceOrderMutationVo,
  OrderIdLike
} from "@/api/fortune/finance-order-v2";
import { ORDER_COMPONENT, ORDER_TYPE_META } from "./utils/order-contract";
import { formatOrderAmountText } from "./utils/order-money";

const props = defineProps<{
  modelValue: boolean;
  order: FinanceOrderDetailVo;
  groupId: number;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success", result: FinanceOrderMutationVo): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: v => emits("update:modelValue", v)
});
const formVisible = ref(false);

const meta = computed(() => ORDER_TYPE_META[props.order.type as 1 | 2 | 3]);
const writeOffBillType = computed(() => (props.order.type === 3 ? 2 : 1));
const writeOffTitle = computed(() => meta.value.writeOffText);
const writeOffImpact = computed(() => meta.value.writeOffImpact);

function formatAmount(value: string | null | undefined) {
  return formatOrderAmountText(value, { emptyText: "待核对" });
}

function close() {
  formVisible.value = false;
  visible.value = false;
}

function continueToForm() {
  formVisible.value = true;
  visible.value = false;
}

function handleSuccess(result: FinanceOrderMutationVo) {
  emits("success", result);
  close();
}
</script>

<style scoped lang="scss">
.adjustment-body {
  margin-top: 16px;
  line-height: 1.8;
}

.warning-text {
  color: var(--el-color-danger);
}
</style>
