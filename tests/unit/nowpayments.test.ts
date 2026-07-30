import { createHmac } from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("nowpayments signature + status mapping", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("verifies IPN HMAC-SHA512 with nested fee object", async () => {
    const secret = "test-ipn-secret";
    vi.stubEnv("NOWPAYMENTS_API_KEY", "test-key");
    vi.stubEnv("NOWPAYMENTS_IPN_SECRET", secret);

    const {
      sortNowPaymentsPayload,
      verifyNowPaymentsSignature,
    } = await import("@/lib/payments/nowpayments");

    const payload = {
      payment_status: "finished",
      order_id: "pay_123",
      payment_id: 99,
      price_amount: 100,
      price_currency: "usd",
      fee: {
        currency: "usdttrc20",
        depositFee: 0.1,
        serviceFee: 1,
        withdrawalFee: 0.2,
      },
    };

    const signature = createHmac("sha512", secret)
      .update(JSON.stringify(sortNowPaymentsPayload(payload)))
      .digest("hex");

    expect(verifyNowPaymentsSignature(payload, signature)).toBe(true);
    expect(verifyNowPaymentsSignature(payload, "bad-signature")).toBe(false);
  });

  it("maps payment statuses", async () => {
    vi.stubEnv("NOWPAYMENTS_API_KEY", "test-key");
    vi.stubEnv("NOWPAYMENTS_IPN_SECRET", "test-secret");

    const { mapNowPaymentsStatus } = await import("@/lib/payments/nowpayments");

    expect(mapNowPaymentsStatus("finished")).toBe("CAPTURED");
    expect(mapNowPaymentsStatus("failed")).toBe("FAILED");
    expect(mapNowPaymentsStatus("expired")).toBe("EXPIRED");
    expect(mapNowPaymentsStatus("waiting")).toBe("PENDING");
    expect(mapNowPaymentsStatus("confirming")).toBe("PENDING");
    expect(mapNowPaymentsStatus("partially_paid")).toBe("PENDING");
  });

  it("rejects underpaid finished settlements", async () => {
    vi.stubEnv("NOWPAYMENTS_API_KEY", "test-key");
    vi.stubEnv("NOWPAYMENTS_IPN_SECRET", "test-secret");

    const { assertNowPaymentsSettlement } = await import(
      "@/lib/payments/nowpayments"
    );

    expect(() =>
      assertNowPaymentsSettlement(
        {
          payment_status: "finished",
          price_amount: 50,
          price_currency: "usd",
        },
        100,
      ),
    ).toThrow(/below order total/);

    expect(() =>
      assertNowPaymentsSettlement(
        {
          payment_status: "finished",
          price_amount: 100,
          price_currency: "usd",
        },
        100,
      ),
    ).not.toThrow();
  });
});
