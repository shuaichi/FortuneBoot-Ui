import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ElMessageBox } from "element-plus";
import OrderReconciliation from "@/views/fortune/finance-order/order-reconciliation.vue";
import {
  confirmFinanceOrderReconciliationV2,
  getFinanceOrderReconciliationV2,
  type FinanceOrderReconciliationVo
} from "@/api/fortune/finance-order-v2";

vi.mock("element-plus", () => ({
  ElMessageBox: { confirm: vi.fn() }
}));
vi.mock("@/api/fortune/finance-order-v2", () => ({
  getFinanceOrderReconciliationV2: vi.fn(),
  confirmFinanceOrderReconciliationV2: vi.fn()
}));
vi.mock("@/utils/message", () => ({ message: vi.fn() }));

const row: FinanceOrderReconciliationVo = {
  orderId: 10,
  billId: null,
  bookId: 2,
  version: 7,
  issueCodes: ["LEGACY_LOAN_ISOLATED"],
  originalStatus: 200,
  originalOutAmount: "1000.00",
  originalInAmount: "400.00",
  candidateIssuedAmount: null,
  candidateSettledAmount: null,
  candidatePendingAmount: null,
  accountIds: [50],
  currencyCodes: ["CNY"],
  cashEffectKnown: false,
  note: "历史现金效果未知"
};

function mountComponent() {
  return mount(OrderReconciliation, {
    props: { bookId: 2 },
    global: {
      stubs: {
        "el-alert": true,
        "el-button": true,
        "el-table": true,
        "el-table-column": true,
        "el-pagination": true
      }
    }
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFinanceOrderReconciliationV2).mockResolvedValue({
    rows: [row],
    total: 1
  });
  vi.mocked(confirmFinanceOrderReconciliationV2).mockResolvedValue({
    orderId: 10,
    version: 8,
    replayed: false
  });
});

describe("finance order reconciliation", () => {
  it("does not call the confirm API when the user cancels", async () => {
    vi.mocked(ElMessageBox.confirm).mockRejectedValueOnce(new Error("cancel"));
    const wrapper = await mountComponent();
    await flushPromises();
    const vm = wrapper.vm as any;

    await vm.handleConfirm(row);
    await flushPromises();

    expect(ElMessageBox.confirm).toHaveBeenCalledTimes(1);
    expect(confirmFinanceOrderReconciliationV2).not.toHaveBeenCalled();
    expect(wrapper.emitted("mutated")).toBeUndefined();
  });

  it("requires a second confirmation, submits expected version and reloads", async () => {
    type ConfirmResult = Awaited<ReturnType<typeof ElMessageBox.confirm>>;
    const confirmResult = undefined as unknown as ConfirmResult;

    vi.mocked(ElMessageBox.confirm).mockResolvedValueOnce(confirmResult);
    const wrapper = await mountComponent();
    await flushPromises();
    const vm = wrapper.vm as any;
    vi.mocked(getFinanceOrderReconciliationV2).mockClear();

    await vm.handleConfirm(row);
    await flushPromises();

    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      expect.stringContaining("LEGACY_LOAN_ISOLATED"),
      "确认历史单据已核对？",
      expect.anything()
    );
    expect(confirmFinanceOrderReconciliationV2).toHaveBeenCalledWith(2, 10, {
      requestId: expect.any(String),
      expectedVersion: 7
    });
    expect(getFinanceOrderReconciliationV2).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("mutated")[0][0]).toEqual({
      bookId: 2,
      orderId: 10
    });
  });
});
