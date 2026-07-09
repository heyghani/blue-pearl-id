type PayPalPayerName = {
  given_name?: string;
  surname?: string;
};

type PayPalPayer = {
  name?: PayPalPayerName;
  email_address?: string;
};

type PayPalCapturePayload = {
  payer?: PayPalPayer;
};

export type PayPalPayerInfo = {
  name: string | null;
  email: string | null;
};

export function extractPayPalPayerInfo(rawResponse: unknown): PayPalPayerInfo | null {
  if (!rawResponse || typeof rawResponse !== "object") {
    return null;
  }

  const payer = (rawResponse as PayPalCapturePayload).payer;
  if (!payer) {
    return null;
  }

  const name = [payer.name?.given_name, payer.name?.surname]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    name: name || null,
    email: payer.email_address ?? null,
  };
}
