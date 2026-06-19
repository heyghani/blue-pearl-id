import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("midtrans helpers", () => {
  beforeEach(() => {
    vi.stubEnv("MIDTRANS_SERVER_KEY", "SB-Mid-server-test");
    vi.stubEnv("MIDTRANS_IS_PRODUCTION", "false");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("maps settlement to CAPTURED", async () => {
    const { mapMidtransStatus } = await import("@/lib/payments/midtrans");

    expect(
      mapMidtransStatus({
        transaction_status: "settlement",
        order_id: "payment-1",
        status_code: "200",
        gross_amount: "100.00",
        signature_key: "x",
      }),
    ).toBe("CAPTURED");
  });

  it("maps capture with fraud accept to CAPTURED", async () => {
    const { mapMidtransStatus } = await import("@/lib/payments/midtrans");

    expect(
      mapMidtransStatus({
        transaction_status: "capture",
        fraud_status: "accept",
        order_id: "payment-1",
        status_code: "200",
        gross_amount: "100.00",
        signature_key: "x",
      }),
    ).toBe("CAPTURED");
  });

  it("maps deny to FAILED", async () => {
    const { mapMidtransStatus } = await import("@/lib/payments/midtrans");

    expect(
      mapMidtransStatus({
        transaction_status: "deny",
        order_id: "payment-1",
        status_code: "200",
        gross_amount: "100.00",
        signature_key: "x",
      }),
    ).toBe("FAILED");
  });

  it("verifies webhook signatures", async () => {
    const { verifyMidtransSignature } = await import("@/lib/payments/midtrans");

    const payload = {
      order_id: "payment-1",
      status_code: "200",
      gross_amount: "159.00",
    };

    const signature_key = crypto
      .createHash("sha512")
      .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}SB-Mid-server-test`)
      .digest("hex");

    expect(verifyMidtransSignature({ ...payload, signature_key })).toBe(true);
    expect(
      verifyMidtransSignature({ ...payload, signature_key: "invalid" }),
    ).toBe(false);
  });

  it("uses sandbox snap URL when not in production", async () => {
    const { getMidtransSnapBaseUrl } = await import("@/lib/payments/midtrans");

    expect(getMidtransSnapBaseUrl()).toBe("https://app.sandbox.midtrans.com");
  });
});
