import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrderDetailDrawer from "@/views/fortune/finance-order/order-detail-drawer.vue";
import {
  getFinanceOrderAuditV2,
  getFinanceOrderDetailV2,
  getFinanceOrderEntriesV2,
  getFinanceOrderReconciliationV2,
  orderEntryActionV2,
  transitionFinanceOrderV2,
  type FinanceOrderDetailVo,
  type FinanceOrderEntryVo
} from "@/api/fortune/finance-order-v2";

vi.mock("@/api/fortune/finance-order-v2", () => ({
  getFinanceOrderDetailV2: vi.fn(),
  getFinanceOrderEntriesV2: vi.fn(),
  getFinanceOrderAuditV2: vi.fn(),
  getFinanceOrderReconciliationV2: vi.fn(),
  orderEntryActionV2: vi.fn(),
  transitionFinanceOrderV2: vi.fn()
}));
vi.mock("@/views/fortune/bill/bill-form.vue", () => ({
  default: defineComponent({
    name: "BillForm",
    setup: () => () => h("div")
  })
}));
vi.mock("@/api/fortune/book", () => ({
  getEnableBookList: vi.fn(async () => ({ data: [] }))
}));

const detail: FinanceOrderDetailVo = {
  orderId: 10,
  bookId: 2,
  title: "张三 · 借款",
  type: 2,
  typeDesc: "债权单",
  status: 200,
  statusDesc: "进行中",
  counterpartyName: "张三",
  currencyCode: "CNY",
  dueDate: "2026-10-01",
  version: 7,
  reconciliationStatus: "READY",
  outAmount: "1000.00",
  inAmount: "400.00",
  issuedAmount: "1000.00",
  settledAmount: "400.00",
  adjustedAmount: "0.00",
  pendingAmount: "600.00",
  interestIncome: "20.00",
  interestExpense: "0.00",
  feeAmount: "5.00",
  netCostOrIncome: "15.00",
  pendingEntryCount: 1,
  overdue: true,
  canEdit: true,
  canDelete: false,
  canClose: false,
  canReopen: false,
  allowedEntryActions: [
    "LOAN_OUT",
    "LOAN_RECOVER",
    "INTEREST_IN",
    "FEE",
    "WRITE_OFF"
  ],
  readOnlyReason: null
};

const entry: FinanceOrderEntryVo = {
  billId: 20,
  bookId: 2,
  orderId: 10,
  title: "收回本金",
  tradeTime: "2026-10-02 10:00:00",
  amount: "400.00",
  currencyCode: "CNY",
  billType: 10,
  confirm: true,
  include: false,
  orderComponent: "PRINCIPAL",
  orderLedgerVersion: 1,
  recycleBin: false,
  allowedActions: ["EDIT", "VOID"],
  readOnlyReason: null
};

async function mountDrawer() {
  return mount(OrderDetailDrawer, {
    props: {
      modelValue: true,
      bookId: 2,
      orderId: 10,
      groupId: 1
    },
    global: {
      stubs: {
        "el-drawer": {
          template: "<div><slot /></div>"
        },
        "el-card": true,
        "el-descriptions": true,
        "el-descriptions-item": true,
        "el-tabs": true,
        "el-tab-pane": true,
        "el-radio-group": true,
        "el-radio-button": true,
        "el-table": true,
        "el-table-column": true,
        "el-pagination": true,
        "el-button": true,
        "el-tag": true,
        "el-alert": true,
        "el-empty": true,
        "el-dropdown": true,
        "el-dropdown-menu": true,
        "el-dropdown-item": true,
        "el-dialog": true,
        "order-bill": true,
        "order-audit": true,
        "order-reconciliation": true,
        "order-adjustment-dialog": true
      }
    }
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFinanceOrderDetailV2).mockResolvedValue(detail);
  vi.mocked(getFinanceOrderEntriesV2).mockResolvedValue({
    rows: [entry],
    total: 1
  });
  vi.mocked(getFinanceOrderAuditV2).mockResolvedValue({
    rows: [{ id: 1, action: "CREATE", createTime: "2026-10-01 08:00:00" }],
    total: 1
  });
  vi.mocked(getFinanceOrderReconciliationV2).mockResolvedValue({
    rows: [],
    total: 0
  });
});

describe("finance order detail drawer", () => {
  it("renders amount breakdown, accessory amounts, overdue and effective entries", async () => {
    const wrapper = await mountDrawer();
    await flushPromises();
    const vm = wrapper.vm as any;
    const text = wrapper.text();

    expect(vm.detail.typeDesc).toBe("债权单");
    expect(text).toContain("600.00");
    expect(text).toContain("1,000.00");
    expect(text).toContain("400.00");
    expect(text).toContain("20.00");
    expect(text).toContain("5.00");
    expect(vm.detail.overdue).toBe(true);
    expect(getFinanceOrderEntriesV2).toHaveBeenCalledWith(2, 10, {
      pageNum: 1,
      pageSize: 1,
      entryStatus: "ALL"
    });
  });

  it("builds locked BillForm context and prefills settlement amount from pending", async () => {
    const wrapper = await mountDrawer();
    await flushPromises();
    const vm = wrapper.vm as any;
    const context = vm.entryFormContext("LOAN_RECOVER");

    expect(context).toMatchObject({
      contextBookId: 2,
      contextOrderId: 10,
      contextBillType: 10,
      contextComponent: "PRINCIPAL",
      expectedVersion: 7,
      lockOrderContext: true,
      contextAmount: "600.00"
    });
    expect(vm.entryFormContext("LOAN_OUT").contextAmount).toBeNull();
    expect(vm.entryFormContext("WRITE_OFF").contextComponent).toBe("WRITE_OFF");
  });

  it("hides principal settlement when pending is zero and respects server canClose", async () => {
    vi.mocked(getFinanceOrderDetailV2).mockResolvedValue({
      ...detail,
      pendingAmount: "0.00",
      settledAmount: "1000.00",
      canClose: true
    });
    const wrapper = await mountDrawer();
    await flushPromises();
    const vm = wrapper.vm as any;

    expect(vm.primaryEntryAction).toBeNull();
    expect(vm.canArchive).toBe(true);
  });

  it("renders visitor and abnormal orders read-only", async () => {
    vi.mocked(getFinanceOrderDetailV2).mockResolvedValue({
      ...detail,
      canEdit: false,
      canDelete: false,
      canClose: false,
      canReopen: false,
      allowedEntryActions: [],
      readOnlyReason: "访客只读"
    });
    const wrapper = await mountDrawer();
    await flushPromises();
    const vm = wrapper.vm as any;
    expect(vm.isReadOnly).toBe(true);
    expect(vm.visibleEntryActions).toHaveLength(0);
    expect(vm.canArchive).toBe(false);
  });

  it("transitions lifecycle operations with requestId and version then emits mutation", async () => {
    vi.mocked(transitionFinanceOrderV2).mockResolvedValue({
      orderId: 10,
      version: 8,
      replayed: false
    });
    const wrapper = await mountDrawer();
    await flushPromises();
    const vm = wrapper.vm as any;
    await vm.handleLifecycle("close");

    expect(transitionFinanceOrderV2).toHaveBeenCalledWith(2, 10, "close", {
      requestId: expect.any(String),
      expectedVersion: 7
    });
    expect(wrapper.emitted("mutated")[0][0]).toEqual({
      bookId: 2,
      orderId: 10
    });
  });

  it("executes entry confirm/void actions with idempotency and refreshes detail", async () => {
    vi.mocked(orderEntryActionV2).mockResolvedValue({
      orderId: 10,
      billId: 20,
      version: 8,
      replayed: false
    });
    const wrapper = await mountDrawer();
    await flushPromises();
    const vm = wrapper.vm as any;
    vi.mocked(getFinanceOrderDetailV2).mockClear();
    await vm.handleEntryAction(entry, "void");

    expect(orderEntryActionV2).toHaveBeenCalledWith(2, 10, 20, "void", {
      requestId: expect.any(String),
      expectedVersion: 7
    });
    expect(getFinanceOrderDetailV2).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("mutated")[0][0]).toEqual({
      bookId: 2,
      orderId: 10,
      billId: 20
    });
  });
});
