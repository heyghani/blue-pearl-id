import { createHmac, timingSafeEqual } from "crypto";

import { PAYMENT_MERCHANT_NAME } from "@/lib/constants";

/** USDT on Tron (TRC20) — NOWPayments pay currency code. */
export const NOWPAYMENTS_USDT_CURRENCY = "usdttrc20";

const apiKey = process.env.NOWPAYMENTS_API_KEY ?? "";
const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET ?? "";
const sandbox = process.env.NOWPAYMENTS_SANDBOX === "true";

export function getNowPaymentsBaseUrl() {
  return sandbox
    ? "https://api-sandbox.nowpayments.io/v1"
    : "https://api.nowpayments.io/v1";
}

export function isNowPaymentsConfigured() {
  return Boolean(apiKey && ipnSecret);
}

export type NowPaymentsInvoice = {
  id: string;
  invoiceUrl: string;
  tokenId?: string;
  orderId?: string;
  raw: Record<string, unknown>;
};

export type NowPaymentsIpnPayload = {
  payment_id?: number | string;
  invoice_id?: number | string;
  payment_status: string;
  pay_address?: string;
  price_amount?: number | string;
  price_currency?: string;
  pay_amount?: number | string;
  actually_paid?: number | string;
  pay_currency?: string;
  order_id?: string;
  order_description?: string;
  purchase_id?: string | number;
  outcome_amount?: number | string;
  outcome_currency?: string;
  payment_extra_ids?: unknown;
  fee?: unknown;
  [key: string]: unknown;
};

export async function createNowPaymentsInvoice({
  priceAmountUsd,
  orderId,
  orderNumber,
  ipnCallbackUrl,
  successUrl,
  cancelUrl,
}: {
  priceAmountUsd: number;
  orderId: string;
  orderNumber: string;
  ipnCallbackUrl: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<NowPaymentsInvoice> {
  if (!isNowPaymentsConfigured()) {
    throw new Error("NOWPayments is not configured.");
  }

  const response = await fetch(`${getNowPaymentsBaseUrl()}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: priceAmountUsd,
      price_currency: "usd",
      pay_currency: NOWPAYMENTS_USDT_CURRENCY,
      order_id: orderId,
      order_description: `${PAYMENT_MERCHANT_NAME} order ${orderNumber}`,
      ipn_callback_url: ipnCallbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
      is_fixed_rate: true,
      is_fee_paid_by_user: true,
    }),
  });

  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
          ? data.error
          : "NOWPayments invoice creation failed.";
    throw new Error(message);
  }

  const id = String(data.id ?? "");
  const invoiceUrl =
    typeof data.invoice_url === "string" ? data.invoice_url : "";

  if (!id || !invoiceUrl) {
    throw new Error("NOWPayments returned an incomplete invoice response.");
  }

  return {
    id,
    invoiceUrl,
    tokenId: typeof data.token_id === "string" ? data.token_id : undefined,
    orderId: typeof data.order_id === "string" ? data.order_id : orderId,
    raw: data,
  };
}

/**
 * Recursively sort object keys (NOWPayments Node IPN example).
 * Nested objects like `fee` must be sorted or HMAC verification fails.
 */
export function sortNowPaymentsPayload(
  value: unknown,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortNowPaymentsPayload(item));
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  const obj = value as Record<string, unknown>;
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, unknown>>((result, key) => {
      result[key] = sortNowPaymentsPayload(obj[key]);
      return result;
    }, {});
}

/**
 * Verify IPN signature per NOWPayments docs:
 * HMAC-SHA512 of JSON.stringify(sortObject(body)) with IPN secret.
 */
export function verifyNowPaymentsSignature(
  payload: Record<string, unknown>,
  signature: string | null | undefined,
): boolean {
  if (!signature || !ipnSecret) return false;

  const sorted = JSON.stringify(sortNowPaymentsPayload(payload));
  const expected = createHmac("sha512", ipnSecret)
    .update(sorted)
    .digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Ensure finished IPNs cover at least the order's USD total. */
export function assertNowPaymentsSettlement(
  payload: NowPaymentsIpnPayload,
  expectedAmountUsd: number,
) {
  const currency = String(payload.price_currency ?? "usd").toLowerCase();
  if (currency !== "usd") {
    throw new Error("NOWPayments currency mismatch.");
  }

  const priceAmount = Number(payload.price_amount);
  if (!Number.isFinite(priceAmount)) {
    throw new Error("NOWPayments IPN missing price_amount.");
  }

  // 1 cent tolerance for float serialization
  if (priceAmount + 0.01 < expectedAmountUsd) {
    throw new Error("NOWPayments amount below order total.");
  }
}

export function mapNowPaymentsStatus(
  paymentStatus: string,
): "CAPTURED" | "PENDING" | "FAILED" | "EXPIRED" | "CANCELLED" {
  switch (paymentStatus.toLowerCase()) {
    case "finished":
      return "CAPTURED";
    case "failed":
      return "FAILED";
    case "expired":
      return "EXPIRED";
    case "refunded":
      return "CANCELLED";
    case "waiting":
    case "confirming":
    case "confirmed":
    case "sending":
    case "partially_paid":
    default:
      return "PENDING";
  }
}
