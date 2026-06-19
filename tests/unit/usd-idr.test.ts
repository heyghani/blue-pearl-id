import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("USD to IDR live conversion", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses Frankfurter API when available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ rates: { IDR: 16250 } }),
      }),
    );

    const { clearExchangeRateCache, convertUsdToIdrLive } = await import(
      "@/lib/payments/usd-idr"
    );
    clearExchangeRateCache();
    const result = await convertUsdToIdrLive(100);

    expect(result.idr).toBe(1_625_000);
    expect(result.quote.source).toBe("frankfurter");
    expect(result.quote.rate).toBe(16250);
  });

  it("falls back to env rate when API fails", async () => {
    vi.stubEnv("USD_TO_IDR_RATE", "16000");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );

    const { clearExchangeRateCache, convertUsdToIdrLive } = await import(
      "@/lib/payments/usd-idr"
    );
    clearExchangeRateCache();
    const result = await convertUsdToIdrLive(100);

    expect(result.idr).toBe(1_600_000);
    expect(result.quote.source).toBe("env");
  });

  it("uses static env rate when EXCHANGE_RATE_PROVIDER=static", async () => {
    vi.stubEnv("EXCHANGE_RATE_PROVIDER", "static");
    vi.stubEnv("USD_TO_IDR_RATE", "17000");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { clearExchangeRateCache, convertUsdToIdrLive } = await import(
      "@/lib/payments/usd-idr"
    );
    clearExchangeRateCache();
    const result = await convertUsdToIdrLive(10);

    expect(result.idr).toBe(170_000);
    expect(result.quote.source).toBe("env");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
