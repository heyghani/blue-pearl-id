import crypto from "crypto";

const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

export function getMidtransSnapBaseUrl() {
  return isProduction
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";
}

export function getMidtransClientKey() {
  return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
}

export function isMidtransConfigured() {
  return Boolean(serverKey && getMidtransClientKey());
}

type SnapCustomer = {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
};

export async function createMidtransSnapToken({
  orderId,
  grossAmount,
  customer,
}: {
  orderId: string;
  grossAmount: number;
  customer: SnapCustomer;
}) {
  if (!isMidtransConfigured()) {
    throw new Error("Midtrans is not configured.");
  }

  const auth = Buffer.from(`${serverKey}:`).toString("base64");
  const response = await fetch(`${getMidtransSnapBaseUrl()}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        email: customer.email,
        first_name: customer.firstName,
        last_name: customer.lastName ?? "",
        phone: customer.phone ?? "",
      },
      credit_card: { secure: true },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error_messages?.join(", ") ??
        data?.status_message ??
        "Failed to create Midtrans Snap token.",
    );
  }

  return {
    token: data.token as string,
    redirectUrl: data.redirect_url as string | undefined,
  };
}

export function verifyMidtransSignature(payload: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}) {
  const expected = crypto
    .createHash("sha512")
    .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`)
    .digest("hex");

  return expected === payload.signature_key;
}

export type MidtransNotification = {
  transaction_status: string;
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_id?: string;
  fraud_status?: string;
  payment_type?: string;
  status_message?: string;
};

export function mapMidtransStatus(notification: MidtransNotification) {
  const { transaction_status, fraud_status } = notification;

  if (transaction_status === "capture") {
    if (fraud_status === "accept") return "CAPTURED";
    if (fraud_status === "challenge") return "PENDING";
    return "FAILED";
  }

  if (transaction_status === "settlement") return "CAPTURED";
  if (transaction_status === "pending") return "PENDING";
  if (transaction_status === "deny") return "FAILED";
  if (transaction_status === "expire") return "EXPIRED";
  if (transaction_status === "cancel") return "CANCELLED";

  return "PENDING";
}
