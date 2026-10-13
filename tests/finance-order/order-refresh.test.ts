import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  emitFinanceOrderMutated,
  useFinanceOrderMutationEvents
} from "@/views/fortune/finance-order/utils/use-finance-order-refresh";

describe("finance-order mutation refresh bus", () => {
  it("subscribes once and unsubscribes on unmount", () => {
    const handler = vi.fn();
    const Host = defineComponent({
      setup() {
        useFinanceOrderMutationEvents(handler);
        return () => h("div");
      }
    });
    const wrapper = mount(Host);
    emitFinanceOrderMutated({ bookId: 2, orderId: 10 });
    emitFinanceOrderMutated({ bookId: 2, orderId: 10, billId: 20 });
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenLastCalledWith({
      bookId: 2,
      orderId: 10,
      billId: 20
    });
    wrapper.unmount();
    emitFinanceOrderMutated({ bookId: 2, orderId: 10 });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("uses the fixed event name and typed payload shape", () => {
    const received: unknown[] = [];
    const Host = defineComponent({
      setup() {
        useFinanceOrderMutationEvents(payload => received.push(payload));
        return () => h("div");
      }
    });
    const wrapper = mount(Host);
    emitFinanceOrderMutated({
      bookId: "2",
      orderId: "10",
      billId: "20"
    });
    expect(received).toEqual([{ bookId: "2", orderId: "10", billId: "20" }]);
    wrapper.unmount();
  });
});
