import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, onMounted } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrderForm from "@/views/fortune/finance-order/order-form.vue";
import {
  createFinanceOrderV2,
  FinanceOrderV2Error,
  modifyFinanceOrderV2
} from "@/api/fortune/finance-order-v2";
import { message } from "@/utils/message";

vi.mock("@/api/fortune/book", () => ({
  getEnableBookList: vi.fn(async () => ({
    data: [{ bookId: 2, bookName: "默认账本", defaultCurrency: "CNY" }]
  }))
}));
vi.mock("@/api/fortune/payee", () => ({
  getEnablePayeeList: vi.fn(async () => ({ data: [] }))
}));
vi.mock("@/api/fortune/finance-order-v2", () => ({
  FinanceOrderV2Error: class extends Error {
    code: number;
    constructor(code: number, msg: string) {
      super(msg);
      this.code = code;
    }
  },
  createFinanceOrderV2: vi.fn(),
  modifyFinanceOrderV2: vi.fn(),
  isOrderVersionConflict: (error: unknown) =>
    error instanceof FinanceOrderV2Error && error.code === 30011
}));
vi.mock("@/api/fortune/finance-order", () => ({
  addFinanceOrderApi: vi.fn(),
  modifyFinanceOrderApi: vi.fn()
}));
vi.mock("@/utils/message", () => ({ message: vi.fn() }));

function createFormStub(validateResult = true) {
  return defineComponent({
    name: "ElForm",
    setup(_props, { expose }) {
      expose({
        validate: async () => validateResult,
        resetFields: () => undefined
      });
      return () => h("form");
    }
  });
}

const DialogStub = defineComponent({
  name: "VDialog",
  setup(_props, { attrs, slots }) {
    onMounted(() => (attrs.onOpened as (() => void) | undefined)?.());
    return () => h("div", [slots.default?.(), slots.footer?.()]);
  }
});

async function mountForm(
  props: Record<string, unknown> = {},
  validateResult = true
) {
  return mount(OrderForm, {
    props: {
      mode: "add",
      modelValue: true,
      groupId: 1,
      bookId: 2,
      ...props
    },
    global: {
      stubs: {
        "el-form": createFormStub(validateResult),
        "el-form-item": true,
        "el-row": true,
        "re-col": true,
        "el-col": true,
        "el-select": true,
        "el-option": true,
        "el-input": true,
        "el-date-picker": true,
        "el-input-number": true,
        "el-button": true,
        "v-dialog": DialogStub
      }
    }
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createFinanceOrderV2).mockResolvedValue({
    orderId: 10,
    version: 0,
    replayed: false
  });
  vi.mocked(modifyFinanceOrderV2).mockResolvedValue({
    orderId: 10,
    version: 1,
    replayed: false
  });
});

describe("finance order metadata form", () => {
  it("creates a type 2 draft with a request id and emits the mutation result", async () => {
    const wrapper = await mountForm();
    await flushPromises();
    const vm = wrapper.vm as any;
    vm.formData.counterpartyName = "张三";
    vm.formData.title = "张三 · 借款";
    await vm.handleConfirm("draft");
    await flushPromises();

    expect(createFinanceOrderV2).toHaveBeenCalledWith({
      bookId: 2,
      requestId: expect.any(String),
      title: "张三 · 借款",
      type: 2,
      counterpartyId: null,
      counterpartyName: "张三",
      dueDate: null,
      remark: ""
    });
    expect(wrapper.emitted("success")[0][0]).toEqual({
      orderId: 10,
      version: 0,
      replayed: false
    });
  });

  it("does not submit before validation passes", async () => {
    const wrapper = await mountForm({}, false);
    await flushPromises();
    const vm = wrapper.vm as any;
    vm.formRef = {
      validate: async () => {
        throw new Error("validate failed");
      }
    };
    vm.formData.counterpartyName = "";
    vm.formData.title = "";
    await vm.handleConfirm("draft");
    await flushPromises();

    expect(createFinanceOrderV2).not.toHaveBeenCalled();
    expect(vm.loading).toBe(false);
  });

  it("renders save-draft and continue actions in the dialog footer", async () => {
    const wrapper = await mountForm();
    await flushPromises();
    expect(wrapper.find(".dialog-footer").exists()).toBe(true);
    expect(wrapper.findAll("el-button-stub")).toHaveLength(3);
  });

  it("supports save draft and continue-to-entry from the same create contract", async () => {
    const wrapper = await mountForm();
    await flushPromises();
    const vm = wrapper.vm as any;
    vm.formData.counterpartyName = "李四";
    vm.formData.title = "李四 · 借款";
    await vm.handleContinue();
    await flushPromises();

    expect(createFinanceOrderV2).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("continue")[0][0]).toEqual({
      orderId: 10,
      version: 0,
      replayed: false
    });
    expect(wrapper.emitted("success")).toBeUndefined();
  });

  it("preserves input and stops loading on a version conflict", async () => {
    vi.mocked(modifyFinanceOrderV2).mockRejectedValueOnce(
      new FinanceOrderV2Error(30011, "单据已发生变化，请刷新后重试")
    );
    const wrapper = await mountForm({
      mode: "edit",
      row: {
        orderId: 10,
        bookId: 2,
        title: "张三 · 借款",
        type: 2,
        counterpartyId: null,
        counterpartyName: "张三",
        currencyCode: "CNY",
        dueDate: null,
        remark: "",
        version: 7
      }
    });
    await flushPromises();
    const vm = wrapper.vm as any;
    await vm.handleConfirm();
    await flushPromises();

    expect(modifyFinanceOrderV2).toHaveBeenCalledTimes(1);
    expect(message).toHaveBeenCalledWith("单据已发生变化，请刷新后重试", {
      type: "warning"
    });
    expect(vm.formData.title).toBe("张三 · 借款");
    expect(vm.loading).toBe(false);
  });

  it("modifies with expectedVersion and locks immutable fields and historical counterparty", async () => {
    const wrapper = await mountForm({
      mode: "edit",
      row: {
        orderId: 10,
        bookId: 2,
        title: "张三 · 借款",
        type: 3,
        counterpartyId: 5,
        counterpartyName: "张三",
        currencyCode: "CNY",
        dueDate: "2026-10-01",
        remark: "旧备注",
        version: 7
      },
      hasEntryHistory: true
    });
    await flushPromises();
    const vm = wrapper.vm as any;
    vm.formData.title = "张三 · 借入（更新）";
    await vm.handleConfirm();
    await flushPromises();

    expect(modifyFinanceOrderV2).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 10,
        bookId: 2,
        expectedVersion: 7,
        type: 3,
        counterpartyId: 5,
        counterpartyName: "张三"
      })
    );
    expect(vm.immutableBook).toBe(true);
    expect(vm.counterpartyLocked).toBe(true);
  });
});
