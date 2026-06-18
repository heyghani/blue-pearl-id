import { Resend } from "resend";

import { APP_NAME, NOREPLY_EMAIL, SUPPORT_EMAIL } from "@/lib/constants";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from = process.env.EMAIL_FROM ?? NOREPLY_EMAIL;
const replyTo = process.env.EMAIL_REPLY_TO ?? SUPPORT_EMAIL;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type SendResult = { ok: true } | { ok: false; error: string };

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  if (!resend) {
    console.info(`[email:dev] To: ${to}\nSubject: ${subject}\n${html}`);
    return { ok: true };
  }

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo,
    subject,
    html,
  });

  if (error) {
    console.error("[email] send failed:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

function emailLayout(content: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0a0a0a;">
      <p style="font-size: 14px; font-weight: 600; margin-bottom: 24px;">${APP_NAME}</p>
      ${content}
      <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;" />
      <p style="font-size: 12px; color: #71717a;">
        Questions? Reply to this email or contact
        <a href="mailto:${SUPPORT_EMAIL}" style="color: #18181b;">${SUPPORT_EMAIL}</a>
      </p>
    </div>
  `;
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${appUrl}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: `Verify your ${APP_NAME} account`,
    html: emailLayout(`
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 12px;">Verify your email</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; margin: 0 0 24px;">
        Thanks for signing up. Confirm your email address to activate your account and start shopping.
      </p>
      <a href="${url}" style="display: inline-block; background: #18181b; color: #fafafa; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">
        Verify email
      </a>
      <p style="font-size: 12px; color: #71717a; margin: 24px 0 0;">
        This link expires in 24 hours. If you didn't create an account, you can ignore this email.
      </p>
    `),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${appUrl}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    html: emailLayout(`
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 12px;">Reset your password</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; margin: 0 0 24px;">
        We received a request to reset your password. Click below to choose a new one.
      </p>
      <a href="${url}" style="display: inline-block; background: #18181b; color: #fafafa; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">
        Reset password
      </a>
      <p style="font-size: 12px; color: #71717a; margin: 24px 0 0;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
    `),
  });
}

type OrderEmailItem = {
  productName: string;
  quantity: number;
  totalPrice: { toString(): string };
};

export async function sendOrderConfirmationEmail({
  email,
  orderNumber,
  total,
  currency,
  items,
}: {
  email: string;
  orderNumber: string;
  total: string;
  currency: string;
  items: OrderEmailItem[];
}) {
  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; font-size: 14px;">${item.productName} × ${item.quantity}</td>
          <td style="padding: 8px 0; font-size: 14px; text-align: right;">${currency} ${item.totalPrice.toString()}</td>
        </tr>`,
    )
    .join("");

  const orderUrl = `${appUrl}/checkout/confirmation/${orderNumber}`;

  return sendEmail({
    to: email,
    subject: `Order confirmed — ${orderNumber}`,
    html: emailLayout(`
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 12px;">Thank you for your order</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; margin: 0 0 24px;">
        We've received your payment for order <strong>${orderNumber}</strong>.
        We'll email you again when your order ships.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        ${itemRows}
      </table>
      <p style="font-size: 14px; font-weight: 600; margin: 0 0 24px;">
        Total: ${currency} ${total}
      </p>
      <a href="${orderUrl}" style="display: inline-block; background: #18181b; color: #fafafa; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">
        View order
      </a>
    `),
  });
}

type ShippingEmailItem = {
  productName: string;
  quantity: number;
};

export async function sendShippingConfirmationEmail({
  email,
  orderNumber,
  trackingNumber,
  carrier,
  items,
}: {
  email: string;
  orderNumber: string;
  trackingNumber: string;
  carrier?: string;
  items: ShippingEmailItem[];
}) {
  const itemList = items
    .map((item) => `<li style="margin: 4px 0;">${item.productName} × ${item.quantity}</li>`)
    .join("");

  const orderUrl = `${appUrl}/checkout/confirmation/${orderNumber}`;

  return sendEmail({
    to: email,
    subject: `Your order has shipped — ${orderNumber}`,
    html: emailLayout(`
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 12px;">Your order is on its way</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; margin: 0 0 16px;">
        Order <strong>${orderNumber}</strong> has shipped.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #3f3f46; margin: 0 0 8px;">
        <strong>Tracking:</strong> ${trackingNumber}
        ${carrier ? `<br /><strong>Carrier:</strong> ${carrier}` : ""}
      </p>
      <ul style="font-size: 14px; color: #3f3f46; padding-left: 20px; margin: 16px 0;">
        ${itemList}
      </ul>
      <a href="${orderUrl}" style="display: inline-block; background: #18181b; color: #fafafa; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 500;">
        View order
      </a>
    `),
  });
}
