import { onBeforeUnmount, onMounted } from "vue";
import { emitter } from "@/utils/mitt";

export const FINANCE_ORDER_MUTATED_EVENT = "finance-order:mutated";

export interface FinanceOrderMutatedPayload {
  bookId: number | string;
  orderId?: number | string | null;
  billId?: number | string | null;
}

export function emitFinanceOrderMutated(
  payload: FinanceOrderMutatedPayload
): void {
  emitter.emit(FINANCE_ORDER_MUTATED_EVENT, payload);
}

/**
 * 单据写成功后的统一刷新入口。
 * 在组件 setup 中调用，仅挂载时注册一次，卸载时解除订阅。
 */
export function useFinanceOrderMutationEvents(
  handler: (payload: FinanceOrderMutatedPayload) => void
): void {
  const listener = (payload: FinanceOrderMutatedPayload) => handler(payload);

  onMounted(() => {
    emitter.on(FINANCE_ORDER_MUTATED_EVENT, listener);
  });
  onBeforeUnmount(() => {
    emitter.off(FINANCE_ORDER_MUTATED_EVENT, listener);
  });
}
