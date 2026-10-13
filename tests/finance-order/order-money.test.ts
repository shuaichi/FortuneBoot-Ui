import { describe, expect, it } from "vitest";
import {
  compareMoney,
  normalizeId,
  normalizeOptionalId,
  parseOrderAmountInput,
  sumMoneyList
} from "@/views/fortune/finance-order/utils/order-money";

describe("order money precision", () => {
  it("formats legal input to two decimal places without truncating precision", () => {
    for (const [input, expected] of [
      ["100", "100.00"],
      ["100.1", "100.10"],
      ["100.2", "100.20"]
    ] as const) {
      const result = parseOrderAmountInput(input);
      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error("unexpected money parse failure");
      expect(result.value).toBe(expected);
    }
  });

  it("rejects empty, invalid, non-positive, three-decimal and over-max input", () => {
    for (const [input, expected] of [
      ["", "EMPTY"],
      ["abc", "INVALID"],
      ["0", "NOT_POSITIVE"],
      ["-1", "NOT_POSITIVE"],
      ["1.234", "TOO_MANY_DECIMALS"],
      ["1.230", "TOO_MANY_DECIMALS"],
      ["1000000000000", "EXCEED_MAX"]
    ] as const) {
      const result = parseOrderAmountInput(input);
      expect(result.ok).toBe(false);
      if ("reason" in result) {
        expect(result.reason).toBe(expected);
      } else {
        throw new Error("unexpected money parse success");
      }
    }
  });

  it("uses decimal comparison and exact two-decimal category sums", () => {
    expect(compareMoney("0.10", "0.1")).toBe(0);
    expect(compareMoney("0.20", "0.1")).toBe(1);
    expect(sumMoneyList(["0.10", "1.01", "2"])).toBe("3.11");
  });

  it("keeps Long precision by normalizing IDs to strings", () => {
    expect(normalizeId("9007199254740993")).toBe("9007199254740993");
    expect(normalizeId(123)).toBe("123");
    expect(normalizeOptionalId(null)).toBeNull();
    expect(normalizeOptionalId("456")).toBe("456");
    expect(() => normalizeId(9007199254740993)).toThrow(/ID超出安全整数范围/);
  });
});
