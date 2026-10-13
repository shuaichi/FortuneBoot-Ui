import { describe, expect, it } from "vitest";
import {
  buildEntryCommand,
  buildEntryFormData,
  computeEntryFingerprint,
  ensureEntryRequestId,
  parseEntryFormDataJson,
  resolveEntrySubmitRoute,
  validateOrderEntry
} from "@/views/fortune/finance-order/utils/order-entry-adapter";
import {
  BILL_TYPE_LABELS,
  isLegalOrderAction,
  ORDER_COMPONENT,
  ORDER_TYPE
} from "@/views/fortune/finance-order/utils/order-contract";

describe("order entry adapter", () => {
  it("defines 9-12 labels and the C04 legal action matrix", () => {
    expect(BILL_TYPE_LABELS[9]).toBe("借出");
    expect(BILL_TYPE_LABELS[10]).toBe("收回本金");
    expect(BILL_TYPE_LABELS[11]).toBe("借入");
    expect(BILL_TYPE_LABELS[12]).toBe("归还本金");

    expect(isLegalOrderAction(ORDER_TYPE.LOAN_OUT, 9, "PRINCIPAL")).toBe(true);
    expect(isLegalOrderAction(ORDER_TYPE.LOAN_OUT, 10, "PRINCIPAL")).toBe(true);
    expect(isLegalOrderAction(ORDER_TYPE.LOAN_OUT, 11, "PRINCIPAL")).toBe(
      false
    );
    expect(isLegalOrderAction(ORDER_TYPE.LOAN_IN, 11, "PRINCIPAL")).toBe(true);
    expect(isLegalOrderAction(ORDER_TYPE.LOAN_IN, 12, "PRINCIPAL")).toBe(true);
    expect(isLegalOrderAction(ORDER_TYPE.LOAN_IN, 9, "PRINCIPAL")).toBe(false);
    expect(isLegalOrderAction(ORDER_TYPE.LOAN_OUT, 2, "INTEREST")).toBe(true);
    expect(isLegalOrderAction(ORDER_TYPE.LOAN_IN, 1, "INTEREST")).toBe(true);
    expect(isLegalOrderAction(ORDER_TYPE.EXPENSE_CLAIM, 1, "FEE")).toBe(true);
    expect(isLegalOrderAction(ORDER_TYPE.LOAN_OUT, 1, "WRITE_OFF")).toBe(true);
    expect(isLegalOrderAction(ORDER_TYPE.LOAN_IN, 2, "WRITE_OFF")).toBe(true);
  });

  it("routes linked and contextual entries to V2 and ordinary 1/2/3 to the legacy API", () => {
    expect(resolveEntrySubmitRoute({ mode: "add", billType: 1 })).toBe(
      "LEGACY_ADD"
    );
    expect(resolveEntrySubmitRoute({ mode: "edit", billType: 1 })).toBe(
      "LEGACY_MODIFY"
    );
    expect(resolveEntrySubmitRoute({ mode: "add", billType: 9 })).toBe(
      "V2_ADD"
    );
    expect(
      resolveEntrySubmitRoute({
        mode: "edit",
        billType: 1,
        hasOrderContext: true
      })
    ).toBe("V2_MODIFY");
    expect(
      resolveEntrySubmitRoute({ mode: "add", billType: 1, orderId: 88 })
    ).toBe("V2_ADD");
  });

  it("builds a minimal 9-12 command with a two-decimal amount and no category split", () => {
    const command = buildEntryCommand({
      requestId: "request-id",
      expectedVersion: 7,
      orderComponent: ORDER_COMPONENT.PRINCIPAL,
      billType: 9,
      title: "记录借出",
      tradeTime: "2026-10-01 10:00:00",
      bookId: 2,
      orderId: "9007199254740993",
      accountId: 11,
      amount: "1000",
      confirm: true,
      include: false,
      categoryAmountPair: [{ categoryId: 3, amount: "1" }],
      extras: [{ extraType: 1, amount: 2 }]
    });

    expect(command).toMatchObject({
      requestId: "request-id",
      expectedVersion: 7,
      orderComponent: "PRINCIPAL",
      bookId: 2,
      orderId: "9007199254740993",
      billType: 9,
      accountId: 11,
      amount: "1000.00",
      confirm: true,
      include: false,
      categoryAmountPair: [],
      extras: null
    });
    expect(command.toAccountId).toBeNull();
  });

  it("forces WRITE_OFF to be non-cash, confirmed and reason-bearing", () => {
    const command = buildEntryCommand({
      requestId: "request-id",
      expectedVersion: 7,
      orderComponent: ORDER_COMPONENT.WRITE_OFF,
      billType: 1,
      title: "确认无法收回",
      tradeTime: "2026-10-01 10:00:00",
      bookId: 2,
      orderId: 88,
      accountId: 11,
      toAccountId: 12,
      confirm: false,
      include: null,
      categoryAmountPair: [{ categoryId: 3, amount: "200.5" }],
      remark: "对方破产",
      extras: []
    });

    expect(command).toMatchObject({
      orderComponent: "WRITE_OFF",
      accountId: null,
      toAccountId: null,
      confirm: true,
      amount: null,
      categoryAmountPair: [{ categoryId: 3, amount: "200.50" }],
      extras: null
    });
  });

  it("builds multipart with one JSON Blob data part and every file appended", async () => {
    const command = { requestId: "request-id", expectedVersion: 1 };
    const fileA = new File(["a"], "a.txt", { type: "text/plain" });
    const fileB = new File(["b"], "b.txt", { type: "text/plain" });
    const formData = buildEntryFormData(command, [fileA, null, fileB]);

    const dataPart = formData.get("data");
    expect(dataPart).toBeInstanceOf(Blob);
    expect((dataPart as Blob).type).toBe("application/json");
    expect(await parseEntryFormDataJson(formData)).toEqual(command);
    expect(formData.getAll("files")).toEqual([fileA, fileB]);
  });

  it("reuses UUID for same content and version-only retries, but regenerates after content edits", () => {
    const command = {
      title: "记录借出",
      amount: "1000.00",
      expectedVersion: 1
    };
    const first = ensureEntryRequestId(null, command);
    const same = ensureEntryRequestId(first.state, command);
    const versionChanged = ensureEntryRequestId(first.state, {
      ...command,
      expectedVersion: 2
    });
    const contentChanged = ensureEntryRequestId(first.state, {
      ...command,
      amount: "900.00"
    });

    expect(same.reused).toBe(true);
    expect(same.state.requestId).toBe(first.state.requestId);
    expect(versionChanged.reused).toBe(true);
    expect(versionChanged.state.requestId).toBe(first.state.requestId);
    expect(contentChanged.reused).toBe(false);
    expect(contentChanged.state.requestId).not.toBe(first.state.requestId);
    expect(computeEntryFingerprint(command)).not.toBe(
      computeEntryFingerprint({ ...command, amount: "900.00" })
    );
  });

  it("validates zero, precision, missing reason, over-settlement and currency mismatches", () => {
    const order = {
      orderId: 88,
      type: ORDER_TYPE.LOAN_OUT,
      currencyCode: "CNY",
      pendingAmount: "100.00"
    };
    const base = {
      mode: "add" as const,
      billType: 9,
      orderComponent: ORDER_COMPONENT.PRINCIPAL,
      orderId: 88,
      amount: "100",
      accountId: 11,
      accountCurrencyCode: "CNY",
      order
    };

    expect(validateOrderEntry({ ...base, amount: "0" })).toBe("金额必须大于0");
    expect(validateOrderEntry({ ...base, amount: "1.234" })).toBe(
      "金额最多支持两位小数"
    );
    expect(
      validateOrderEntry({
        ...base,
        billType: 1,
        orderComponent: ORDER_COMPONENT.WRITE_OFF,
        accountId: null,
        categoryAmountPair: [{ categoryId: 3, amount: "10" }],
        remark: ""
      })
    ).toBe("差额结清必须填写原因");
    expect(
      validateOrderEntry({ ...base, billType: 10, amount: "100.01" })
    ).toBe("金额超过单据待结清金额，请核对后再提交");
    expect(validateOrderEntry({ ...base, accountCurrencyCode: "USD" })).toBe(
      "账户币种必须与单据币种一致"
    );
  });
});
