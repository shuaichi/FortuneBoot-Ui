import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addOrderEntryV2,
  confirmFinanceOrderReconciliationV2,
  createFinanceOrderV2,
  FinanceOrderV2Error,
  getFinanceOrderPageV2,
  isOrderVersionConflict,
  modifyOrderEntryV2,
  ORDER_ERROR_CODE,
  unwrapFinanceOrderV2Response,
  __resetFinanceOrderV2TransportForTest,
  __setFinanceOrderV2TransportForTest,
  type V2RequestSpec
} from "@/api/fortune/finance-order-v2";

vi.mock("@/utils/auth", () => ({
  getToken: vi.fn(() => null),
  formatToken: vi.fn((token: string) => `Bearer ${token}`)
}));

const specs: V2RequestSpec[] = [];

async function recordTransport(spec: V2RequestSpec): Promise<unknown> {
  specs.push(spec);
  return { rows: [], total: 0 };
}

afterEach(() => {
  specs.length = 0;
  __resetFinanceOrderV2TransportForTest();
});

describe("finance order v2 HTTP contract", () => {
  it("uses query params for GET and request data for JSON commands", async () => {
    __setFinanceOrderV2TransportForTest(recordTransport);

    await getFinanceOrderPageV2({
      bookId: 2,
      pageNum: 1,
      pageSize: 20,
      type: 2
    });
    await createFinanceOrderV2({
      bookId: 2,
      requestId: "0d1f3c66-0000-4000-8000-000000000001",
      title: "张三 · 借款",
      type: 2,
      counterpartyName: "张三"
    });

    expect(specs[0]).toMatchObject({
      method: "get",
      url: "/fortune/finance/order/v2/page",
      params: { bookId: 2, pageNum: 1, pageSize: 20, type: 2 }
    });
    expect(specs[0].data).toBeUndefined();
    expect(specs[1]).toMatchObject({
      method: "post",
      url: "/fortune/finance/order/v2/create"
    });
    expect(specs[1].params).toBeUndefined();
    expect(specs[1].data).toMatchObject({ bookId: 2, type: 2 });
  });

  it("posts manual reconciliation confirmation to the exact order path", async () => {
    __setFinanceOrderV2TransportForTest(recordTransport);

    await confirmFinanceOrderReconciliationV2(2, "9007199254740993", {
      requestId: "confirm-id",
      expectedVersion: 7
    });

    expect(specs[0]).toMatchObject({
      method: "post",
      url: "/fortune/finance/order/v2/2/9007199254740993/reconciliation/confirm",
      data: {
        requestId: "confirm-id",
        expectedVersion: 7
      }
    });
    expect(specs[0].params).toBeUndefined();
  });

  it("posts and puts entry multipart data on the exact order paths", async () => {
    __setFinanceOrderV2TransportForTest(recordTransport);
    const addData = new FormData();
    addData.append("data", new Blob(["{}"], { type: "application/json" }));
    const modifyData = new FormData();
    modifyData.append("data", new Blob(["{}"], { type: "application/json" }));

    await addOrderEntryV2(2, "9007199254740993", addData);
    await modifyOrderEntryV2(2, "9007199254740993", "123", modifyData);

    expect(specs[0]).toMatchObject({
      method: "post",
      url: "/fortune/finance/order/v2/2/9007199254740993/entries",
      data: addData
    });
    expect(specs[1]).toMatchObject({
      method: "put",
      url: "/fortune/finance/order/v2/2/9007199254740993/entries/123",
      data: modifyData
    });
  });

  it("recognizes ResponseDTO business errors even when HTTP is 200", () => {
    expect(() =>
      unwrapFinanceOrderV2Response({
        code: ORDER_ERROR_CODE.ORDER_VERSION_CONFLICT,
        msg: "单据已发生变化",
        data: null
      })
    ).toThrowError(FinanceOrderV2Error);

    try {
      unwrapFinanceOrderV2Response({
        code: ORDER_ERROR_CODE.ORDER_VERSION_CONFLICT,
        msg: "单据已发生变化",
        data: null
      });
    } catch (e) {
      expect(isOrderVersionConflict(e)).toBe(true);
    }

    expect(
      unwrapFinanceOrderV2Response({ code: 0, msg: "ok", data: { orderId: 1 } })
    ).toEqual({ orderId: 1 });
    expect(vi.isMockFunction(unwrapFinanceOrderV2Response)).toBe(false);
  });
});
