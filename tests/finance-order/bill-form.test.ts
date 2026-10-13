import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, onMounted } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BillForm from "@/views/fortune/bill/bill-form.vue";
import { FinanceOrderV2Error } from "@/api/fortune/finance-order-v2";
import {
  addOrderEntryV2,
  getFinanceOrderOptionsV2
} from "@/api/fortune/finance-order-v2";
import { addBillApi } from "@/api/fortune/bill";
import { message } from "@/utils/message";

vi.mock("@/api/fortune/group", () => ({
  getEnableGroupList: vi.fn(async () => ({ data: [{ groupId: 1 }] }))
}));
vi.mock("@/api/fortune/book", () => ({
  getEnableBookList: vi.fn(async () => ({
    data: [{ bookId: 2, bookName: "默认账本", currencyCode: "CNY" }]
  })),
  getBookById: vi.fn(async () => ({
    data: {
      defaultExpenseAccountId: 11,
      defaultIncomeAccountId: 12,
      defaultTransferOutAccountId: 11,
      defaultTransferInAccountId: 12
    }
  }))
}));
vi.mock("@/api/fortune/account", () => ({
  getEnableAccountList: vi.fn(async () => ({
    data: [
      {
        accountId: 11,
        accountName: "现金",
        currencyCode: "CNY",
        canExpense: true,
        canIncome: true,
        canTransferOut: true,
        canTransferIn: true
      },
      {
        accountId: 12,
        accountName: "储蓄卡",
        currencyCode: "CNY",
        canExpense: true,
        canIncome: true,
        canTransferOut: true,
        canTransferIn: true
      }
    ]
  }))
}));
vi.mock("@/api/fortune/category", () => ({
  getEnableCategoryList: vi.fn(async () => ({ data: [] }))
}));
vi.mock("@/api/fortune/payee", () => ({
  getEnablePayeeList: vi.fn(async () => ({ data: [] }))
}));
vi.mock("@/api/fortune/tag", () => ({
  getEnableTagList: vi.fn(async () => ({ data: [] }))
}));
vi.mock("@/api/fortune/member", () => ({
  getEnableMemberList: vi.fn(async () => ({ data: [] }))
}));
vi.mock("@/api/fortune/file", () => ({
  getFileByBillId: vi.fn(async () => ({ data: [] }))
}));
vi.mock("@/api/fortune/finance-order", () => ({
  getUsingFinanceOrderApi: vi.fn(async () => ({
    data: [{ orderId: 88, title: "旧接口单据" }]
  }))
}));
vi.mock("@/api/fortune/finance-order-v2", () => ({
  FinanceOrderV2Error: class extends Error {
    code: number;
    constructor(code: number, msg: string) {
      super(msg);
      this.code = code;
    }
  },
  addOrderEntryV2: vi.fn(async () => ({
    orderId: 88,
    billId: 99,
    version: 8,
    replayed: false
  })),
  modifyOrderEntryV2: vi.fn(async () => ({
    orderId: 88,
    billId: 99,
    version: 8,
    replayed: false
  })),
  getFinanceOrderOptionsV2: vi.fn(async () => ({
    rows: [{ orderId: "9007199254740993", title: "当前单据", type: 2 }],
    total: 1
  })),
  isOrderVersionConflict: (error: unknown) =>
    error instanceof FinanceOrderV2Error && error.code === 30011
}));
vi.mock("@/api/fortune/bill", () => ({
  addBillApi: vi.fn(async () => ({ code: 0 })),
  modifyBillApi: vi.fn(async () => ({ code: 0 }))
}));
vi.mock("@/utils/message", () => ({ message: vi.fn() }));

const FormStub = defineComponent({
  name: "ElForm",
  setup(_props, { expose }) {
    expose({
      validate: async () => true,
      resetFields: () => undefined
    });
    return () => h("form");
  }
});

const DialogStub = defineComponent({
  name: "VDialog",
  setup(_props, { attrs, slots }) {
    onMounted(() => (attrs.onOpened as (() => void) | undefined)?.());
    return () => h("div", slots.default?.());
  }
});

const ColStub = defineComponent({
  name: "ReCol",
  setup(_props, { slots }) {
    return () => h("div", slots.default?.());
  }
});

async function mountForm(props: Record<string, unknown> = {}) {
  return mount(BillForm, {
    props: {
      type: "add",
      modelValue: true,
      groupId: 1,
      bookId: 2,
      ...props
    },
    global: {
      stubs: {
        "el-form": FormStub,
        "v-dialog": DialogStub,
        "re-col": ColStub,
        "el-row": true,
        "el-col": true,
        "el-button": true,
        "el-form-item": true,
        "el-select": true,
        "el-option": true,
        "el-input": true,
        "el-input-number": true,
        "el-tree-select": true,
        "el-date-picker": true,
        "el-switch": true,
        "el-upload": true,
        "el-tooltip": true,
        "el-icon": true,
        IconifyIconOnline: true,
        QuestionFilled: true,
        Plus: true
      }
    }
  });
}

const contextProps = {
  contextBookId: 2,
  contextOrderId: "9007199254740993",
  contextBillType: 9,
  contextComponent: "PRINCIPAL",
  expectedVersion: 7,
  lockOrderContext: true
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("bill form finance order integration", () => {
  it("accepts explicit locked context and submits a V2 entry with a JSON Blob data part", async () => {
    const wrapper = await mountForm(contextProps);
    await flushPromises();
    const vm = wrapper.vm as any;

    expect(vm.formData.bookId).toBe(2);
    expect(vm.formData.orderId).toBe("9007199254740993");
    expect(vm.formData.billType).toBe(9);
    expect(vm.formData.orderComponent).toBe("PRINCIPAL");
    expect(vm.expectedVersion).toBe(7);
    expect(vm.lockOrderContext).toBe(true);
    expect(vm.showCategoryFields).toBe(false);
    expect(vm.showExtraFields).toBe(false);
    expect(vm.showTagsAndMembers).toBe(false);
    expect(vm.showPayeeField).toBe(false);
    expect(vm.showConfirmControls).toBe(false);
    expect(vm.showIncludeControls).toBe(false);

    vm.formData.amount = "1000";
    await vm.handleConfirm();
    await flushPromises();

    expect(addOrderEntryV2).toHaveBeenCalledTimes(1);
    expect(addBillApi).not.toHaveBeenCalled();
    const [bookId, orderId, formData] =
      vi.mocked(addOrderEntryV2).mock.calls[0];
    expect(bookId).toBe(2);
    expect(orderId).toBe("9007199254740993");
    const dataPart = formData.get("data");
    expect(dataPart).toBeInstanceOf(Blob);
    expect((dataPart as Blob).type).toBe("application/json");
    expect(JSON.parse(await (dataPart as Blob).text())).toMatchObject({
      requestId: expect.any(String),
      expectedVersion: 7,
      orderComponent: "PRINCIPAL",
      bookId: 2,
      orderId: "9007199254740993",
      billType: 9,
      amount: "1000.00",
      categoryAmountPair: [],
      extras: null
    });
  });

  it("keeps locked book, type and order when change handlers run", async () => {
    const wrapper = await mountForm(contextProps);
    await flushPromises();
    const vm = wrapper.vm as any;

    await vm.handleBookOrBillTypeChange();
    await vm.handleBillTypeChange(1);
    await flushPromises();

    expect(vm.formData.bookId).toBe(2);
    expect(vm.formData.orderId).toBe("9007199254740993");
    expect(vm.formData.billType).toBe(9);
    expect(vm.formData.orderComponent).toBe("PRINCIPAL");
    expect(message).toHaveBeenCalledWith(
      "单据上下文已锁定，不能切换账本、类型或单据",
      {
        type: "warning"
      }
    );
  });

  it("does not send a request when the form or precision validation fails", async () => {
    const wrapper = await mountForm(contextProps);
    await flushPromises();
    const vm = wrapper.vm as any;
    vm.formData.amount = "1.234";

    await vm.handleConfirm();
    await flushPromises();

    expect(addOrderEntryV2).not.toHaveBeenCalled();
    expect(addBillApi).not.toHaveBeenCalled();
    expect(message).toHaveBeenCalledWith("金额最多支持两位小数", {
      type: "error"
    });
    expect(vm.loading).toBe(false);
  });

  it("preserves input and does not auto-resubmit on a V2 version conflict", async () => {
    vi.mocked(addOrderEntryV2).mockRejectedValueOnce(
      new FinanceOrderV2Error(30011, "单据已发生变化，请刷新后重试")
    );
    const wrapper = await mountForm(contextProps);
    await flushPromises();
    const vm = wrapper.vm as any;
    vm.formData.amount = "1000";
    await vm.handleConfirm();
    await flushPromises();

    expect(addOrderEntryV2).toHaveBeenCalledTimes(1);
    expect(message).toHaveBeenCalledWith("单据已发生变化，请刷新后重试", {
      type: "warning"
    });
    expect(vm.formData.amount).toBe("1000");
    expect(vm.loading).toBe(false);
  });

  it("keeps ordinary 1/2/3 entries on the legacy bill API", async () => {
    const wrapper = await mountForm();
    await flushPromises();
    const vm = wrapper.vm as any;
    vm.formData.bookId = 2;
    vm.formData.billType = 1;
    vm.formData.title = "普通支出";
    vm.formData.tradeTime = "2026-10-01 10:00:00";
    vm.formData.accountId = 11;
    vm.formData.categoryAmountPair = [{ categoryId: 3, amount: 12.34 }];
    await vm.handleConfirm();
    await flushPromises();

    expect(addBillApi).toHaveBeenCalledTimes(1);
    expect(addOrderEntryV2).not.toHaveBeenCalled();
  });

  it("does not submit a linked type before order options are available", async () => {
    vi.mocked(getFinanceOrderOptionsV2).mockImplementationOnce(
      () => new Promise(() => undefined)
    );
    const wrapper = await mountForm();
    await flushPromises();
    const vm = wrapper.vm as any;
    void vm.handleBillTypeChange(9);
    await flushPromises();
    vm.formData.title = "记录借出";
    vm.formData.tradeTime = "2026-10-01 10:00:00";
    vm.formData.accountId = 11;
    vm.formData.amount = "1000";
    vm.formData.orderComponent = "PRINCIPAL";
    await vm.handleConfirm();
    await flushPromises();

    expect(addOrderEntryV2).not.toHaveBeenCalled();
    expect(message).toHaveBeenCalledWith("单据选项未加载完成，请稍后重试", {
      type: "warning"
    });
  });
});
