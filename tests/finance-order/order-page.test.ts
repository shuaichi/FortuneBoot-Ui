import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FinanceOrderPage from "@/views/fortune/finance-order/index.vue";
import {
  getFinanceOrderPageV2,
  getFinanceOrderSummaryV2,
  type FinanceOrderDetailVo
} from "@/api/fortune/finance-order-v2";
import { message } from "@/utils/message";

vi.mock("@/api/fortune/group", () => ({
  getEnableGroupList: vi.fn(async () => ({
    data: [
      {
        groupId: 1,
        groupName: "默认分组",
        defaultBookId: 2,
        defaultCurrency: "CNY"
      }
    ]
  })),
  getDefaultGroupId: vi.fn(async () => ({ data: 1 }))
}));

vi.mock("@/api/fortune/book", () => ({
  getEnableBookList: vi.fn(async () => ({
    data: [{ bookId: 2, bookName: "默认账本", defaultCurrency: "CNY" }]
  }))
}));

vi.mock("@/api/fortune/finance-order-v2", () => ({
  getFinanceOrderPageV2: vi.fn(),
  getFinanceOrderSummaryV2: vi.fn()
}));

vi.mock("@/api/fortune/finance-order", () => ({}));
vi.mock("@/views/fortune/bill/bill-form.vue", () => ({
  default: defineComponent({
    name: "BillForm",
    setup: () => () => h("div")
  })
}));

vi.mock("@/utils/message", () => ({ message: vi.fn() }));

const summary = {
  currencyCode: "CNY",
  receivableAmount: "300.00",
  payableAmount: "200.00",
  reimbursementAmount: "100.00",
  overdueReceivableAmount: "30.00",
  overduePayableAmount: "20.00",
  overdueReimbursementAmount: "10.00",
  receivableCount: 3,
  payableCount: 2,
  reimbursementCount: 1,
  pendingEntryCount: 1,
  reviewRequiredCount: 2,
  orphanLegacyBillCount: 1,
  asOfDate: "2026-10-13"
};

function detail(
  overrides: Partial<FinanceOrderDetailVo> = {}
): FinanceOrderDetailVo {
  return {
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
    outAmount: "1000.00",
    inAmount: "400.00",
    issuedAmount: "1000.00",
    settledAmount: "400.00",
    adjustedAmount: "0.00",
    pendingAmount: "600.00",
    interestIncome: "0.00",
    interestExpense: "0.00",
    feeAmount: "0.00",
    netCostOrIncome: "0.00",
    pendingEntryCount: 0,
    overdue: true,
    canEdit: true,
    canDelete: false,
    canClose: false,
    canReopen: false,
    allowedEntryActions: ["LOAN_OUT", "LOAN_RECOVER", "FEE", "WRITE_OFF"],
    ...overrides
  };
}

async function mountPage() {
  return mount(FinanceOrderPage, {
    global: {
      stubs: {
        "el-card": true,
        "el-form": true,
        "el-form-item": true,
        "el-select": true,
        "el-option": true,
        "el-input": true,
        "el-switch": true,
        "el-radio-group": true,
        "el-radio-button": true,
        "el-button": true,
        "el-tag": true,
        "el-dropdown": true,
        "el-dropdown-menu": true,
        "el-dropdown-item": true,
        "el-popconfirm": true,
        "el-dialog": true,
        "el-drawer": true,
        "pure-table": true,
        PureTableBar: true,
        "order-detail-drawer": true,
        "order-form": true,
        "bill-form": true
      }
    }
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFinanceOrderSummaryV2).mockResolvedValue(summary);
  vi.mocked(getFinanceOrderPageV2).mockResolvedValue({
    rows: [detail()],
    total: 22
  });
});

describe("finance order workbench page", () => {
  it("loads V2 summary and defaults to loan-out/ongoing with real pagination size", async () => {
    const wrapper = await mountPage();
    await flushPromises();

    expect(getFinanceOrderPageV2).toHaveBeenCalledWith({
      bookId: 2,
      type: 2,
      status: 200,
      keyword: "",
      overdueOnly: false,
      pageNum: 1,
      pageSize: 20
    });
    expect(getFinanceOrderSummaryV2).toHaveBeenCalledWith(2);
    const vm = wrapper.vm as any;
    expect(vm.pagination.total).toBe(22);
    expect(vm.pagination.pageSize).toBe(20);
    expect(vm.summary.receivableAmount).toBe("300.00");
  });

  it("switches all three order tabs and resets pagination", async () => {
    const wrapper = await mountPage();
    await flushPromises();
    vi.mocked(getFinanceOrderPageV2).mockClear();
    const vm = wrapper.vm as any;
    vm.pagination.currentPage = 2;

    for (const type of [1, 2, 3]) {
      await vm.handleTypeChange(type);
      await flushPromises();
      expect(vm.searchForm.type).toBe(type);
      expect(vm.pagination.currentPage).toBe(1);
    }
    const calls = vi.mocked(getFinanceOrderPageV2).mock.calls;
    expect(calls.map(call => call[0].type)).toEqual([1, 2, 3]);
  });

  it("opens the detail drawer from the clickable title", async () => {
    const wrapper = await mountPage();
    await flushPromises();
    const vm = wrapper.vm as any;
    await vm.openDetail(detail());
    await nextTick();
    expect(vm.detailVisible).toBe(true);
    expect(vm.selectedOrder.orderId).toBe(10);
  });

  it("shows only view, legal primary action and more for normal and visitor rows", async () => {
    const wrapper = await mountPage();
    await flushPromises();
    const vm = wrapper.vm as any;
    expect(vm.visibleRowActions(detail())).toEqual([
      "VIEW",
      "LOAN_RECOVER",
      "MORE"
    ]);
    expect(
      vm.visibleRowActions(
        detail({
          canEdit: false,
          canDelete: false,
          canClose: false,
          canReopen: false,
          allowedEntryActions: []
        })
      )
    ).toEqual(["VIEW"]);
  });

  it("discards stale page responses when book or filters change", async () => {
    const wrapper = await mountPage();
    await flushPromises();
    const vm = wrapper.vm as any;
    vi.mocked(getFinanceOrderPageV2).mockClear();
    let resolveFirst: (value: any) => void = () => undefined;
    vi.mocked(getFinanceOrderPageV2)
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveFirst = resolve;
          })
      )
      .mockResolvedValueOnce({
        rows: [detail({ orderId: 11, title: "新数据" })],
        total: 1
      });

    const first = vm.loadPage();
    const second = vm.loadPage();
    await second;
    await flushPromises();
    expect(vm.dataList[0].title).toBe("新数据");
    resolveFirst({
      rows: [detail({ orderId: 12, title: "过期数据" })],
      total: 1
    });
    await first;
    await flushPromises();
    expect(vm.dataList[0].title).toBe("新数据");
  });

  it("keeps old rows and filters when a page request fails", async () => {
    const wrapper = await mountPage();
    await flushPromises();
    const vm = wrapper.vm as any;
    vm.searchForm.keyword = "张三";
    vi.mocked(getFinanceOrderPageV2).mockRejectedValueOnce(
      new Error("服务暂不可用")
    );
    await vm.loadPage();
    await flushPromises();

    expect(vm.dataList).toHaveLength(1);
    expect(vm.searchForm.keyword).toBe("张三");
    expect(message).toHaveBeenCalledWith("服务暂不可用", { type: "error" });
  });
});
