// Utility: currency symbol helpers
// Provides cached retrieval of currency symbols by ISO 4217 code using Intl.NumberFormat
// Narrow symbol is used by default. Falls back to the currency code if not supported.

const symbolCache = new Map<string, string>();

export function getCurrencySymbol(
  code?: string,
  locale = "en",
  useNarrow = true
): string {
  if (!code) return "";
  const key = `${locale}-${useNarrow ? "narrow" : "wide"}-${code}`;
  const cached = symbolCache.get(key);
  if (cached) return cached;
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      currencyDisplay: useNarrow ? "narrowSymbol" : "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).formatToParts(0);
    const sym = parts.find(p => p.type === "currency")?.value || code;
    symbolCache.set(key, sym);
    return sym;
  } catch {
    symbolCache.set(key, code);
    return code;
  }
}
