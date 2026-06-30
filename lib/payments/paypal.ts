import { PAYMENT_MERCHANT_NAME } from "@/lib/constants";

const clientId = process.env.PAYPAL_CLIENT_ID ?? "";
const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? "";
const mode = process.env.PAYPAL_MODE ?? "sandbox";

export function getPayPalBaseUrl() {
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function isPayPalConfigured() {
  return Boolean(clientId && clientSecret);
}

async function getAccessToken() {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error_description ?? "PayPal authentication failed.");
  }

  return data.access_token as string;
}

export async function createPayPalOrder({
  referenceId,
  amount,
  currency,
  returnUrl,
  cancelUrl,
}: {
  referenceId: string;
  amount: string;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  if (!isPayPalConfigured()) {
    throw new Error("PayPal is not configured.");
  }

  const token = await getAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: referenceId,
          description: `${PAYMENT_MERCHANT_NAME} order ${referenceId}`,
          amount: {
            currency_code: currency,
            value: amount,
          },
          soft_descriptor: PAYMENT_MERCHANT_NAME.slice(0, 22).toUpperCase(),
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: PAYMENT_MERCHANT_NAME,
        user_action: "PAY_NOW",
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data?.message ??
        data?.details?.[0]?.description ??
        "Failed to create PayPal order.",
    );
  }

  const approvalUrl = (data.links as { rel: string; href: string }[]).find(
    (link) => link.rel === "approve",
  )?.href;

  if (!approvalUrl) {
    throw new Error("PayPal approval URL not found.");
  }

  return {
    id: data.id as string,
    approvalUrl,
  };
}

export async function capturePayPalOrder(paypalOrderId: string) {
  if (!isPayPalConfigured()) {
    throw new Error("PayPal is not configured.");
  }

  const token = await getAccessToken();
  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data?.message ??
        data?.details?.[0]?.description ??
        "PayPal capture failed.",
    );
  }

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    status: data.status as string,
    captureId: capture?.id as string | undefined,
    raw: data,
  };
}
