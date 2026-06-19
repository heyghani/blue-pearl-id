const DEFAULT_RATE = 16_500;
const DEFAULT_CACHE_SECONDS = 3600; // 1 hour

export type ExchangeRateSource = "frankfurter" | "env" | "default";

export type ExchangeRateQuote = {
  rate: number;
  source: ExchangeRateSource;
  fetchedAt: string;
};

let cachedQuote: ExchangeRateQuote | null = null;
let cachedAtMs = 0;

function getFallbackRate(): number {
  const raw = process.env.USD_TO_IDR_RATE;
  const parsed = raw ? Number(raw) : DEFAULT_RATE;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_RATE;
  }
  return parsed;
}

function getCacheSeconds() {
  const raw = process.env.EXCHANGE_RATE_CACHE_SECONDS;
  const parsed = raw ? Number(raw) : DEFAULT_CACHE_SECONDS;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CACHE_SECONDS;
}

async function fetchFrankfurterRate(): Promise<number> {
  const response = await fetch(
    "https://api.frankfurter.app/latest?from=USD&to=IDR",
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Exchange rate API returned ${response.status}.`);
  }

  const data = (await response.json()) as { rates?: { IDR?: number } };
  const rate = data.rates?.IDR;

  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    throw new Error("Exchange rate API returned an invalid IDR rate.");
  }

  return rate;
}

async function resolveUsdToIdrRate(): Promise<ExchangeRateQuote> {
  const fetchedAt = new Date().toISOString();

  if (process.env.EXCHANGE_RATE_PROVIDER === "static") {
    return {
      rate: getFallbackRate(),
      source: "env",
      fetchedAt,
    };
  }

  try {
    const rate = await fetchFrankfurterRate();
    return { rate, source: "frankfurter", fetchedAt };
  } catch (error) {
    console.warn("[exchange-rate] Live fetch failed, using fallback:", error);
    const fallback = getFallbackRate();
    return {
      rate: fallback,
      source: process.env.USD_TO_IDR_RATE ? "env" : "default",
      fetchedAt,
    };
  }
}

/** Live USD→IDR rate, cached in memory (default 1 hour). */
export async function getUsdToIdrRate(): Promise<ExchangeRateQuote> {
  const ttlMs = getCacheSeconds() * 1000;
  const now = Date.now();

  if (cachedQuote && now - cachedAtMs < ttlMs) {
    return cachedQuote;
  }

  cachedQuote = await resolveUsdToIdrRate();
  cachedAtMs = now;
  return cachedQuote;
}

/** @internal Test helper */
export function clearExchangeRateCache() {
  cachedQuote = null;
  cachedAtMs = 0;
}

export async function convertUsdToIdrLive(usdAmount: number | string) {
  const usd = typeof usdAmount === "string" ? parseFloat(usdAmount) : usdAmount;
  const quote = await getUsdToIdrRate();
  const idr = Math.round(usd * quote.rate);

  return { idr, usd, quote };
}

export function convertUsdToIdrWithRate(
  usdAmount: number | string,
  rate: number,
): number {
  const usd = typeof usdAmount === "string" ? parseFloat(usdAmount) : usdAmount;
  return Math.round(usd * rate);
}
