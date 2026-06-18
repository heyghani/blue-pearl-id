# Payment setup guide

Blue Pearl ID supports **credit/debit cards** via [Midtrans Snap](https://midtrans.com) and **PayPal**. All checkout amounts are in **USD**.

Use this guide to configure sandbox testing locally and production later.

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Running app | `npm run dev` or deployed URL |
| PostgreSQL | Orders and payments are stored in your database |
| Public HTTPS URL (webhooks) | Required for Midtrans webhooks in dev — use [ngrok](https://ngrok.com) or similar |
| Resend (optional) | Order confirmation emails; logs to console without `RESEND_API_KEY` |

---

## Environment variables

Copy `.env.example` to `.env` and set:

```bash
# Must match the URL users and payment providers can reach
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Midtrans — server key is secret; client key is public (Snap.js)
MIDTRANS_SERVER_KEY="SB-Mid-server-..."
MIDTRANS_CLIENT_KEY="SB-Mid-client-..."
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-..."   # same as MIDTRANS_CLIENT_KEY
MIDTRANS_IS_PRODUCTION="false"                        # "true" in production

# PayPal
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
PAYPAL_MODE="sandbox"                                 # "live" in production

# Email (optional for dev)
RESEND_API_KEY=""
EMAIL_FROM="noreply@bluepearlid.com"
EMAIL_REPLY_TO="support@bluepearlid.com"
```

Restart the dev server after changing `.env`.

---

## Midtrans (cards)

### 1. Create an account

1. Sign up at [dashboard.midtrans.com](https://dashboard.midtrans.com)
2. Stay in **Sandbox** for development
3. Go to **Settings → Access Keys**
4. Copy **Server Key** and **Client Key**

### 2. Configure `.env`

```bash
MIDTRANS_SERVER_KEY="<sandbox server key>"
MIDTRANS_CLIENT_KEY="<sandbox client key>"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="<same client key>"
MIDTRANS_IS_PRODUCTION="false"
```

### 3. Webhook URL

Midtrans sends payment status to your app:

```
{NEXT_PUBLIC_APP_URL}/api/payments/midtrans/webhook
```

**Local development:** Midtrans cannot reach `localhost`. Expose your app:

```bash
ngrok http 3000
```

Set `NEXT_PUBLIC_APP_URL` to the ngrok HTTPS URL (e.g. `https://abc123.ngrok-free.app`) and register the webhook in the Midtrans dashboard:

```
https://abc123.ngrok-free.app/api/payments/midtrans/webhook
```

### 4. Sandbox test cards

In the Snap popup, use Midtrans sandbox card numbers from their docs, for example:

| Field | Value |
|-------|-------|
| Card number | `4811 1111 1111 1114` (success) |
| CVV | `123` |
| Expiry | Any future date |
| OTP | `112233` (if prompted) |

### 5. Production checklist

- Switch to production keys in Midtrans dashboard
- Set `MIDTRANS_IS_PRODUCTION="true"`
- Register production webhook URL on your live domain
- Ensure `NEXT_PUBLIC_APP_URL` is `https://bluepearlid.com` (or your domain)

---

## PayPal

### 1. Create a developer app

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. **Dashboard → Apps & Credentials → Sandbox**
3. Create an app and copy **Client ID** and **Secret**

### 2. Configure `.env`

```bash
PAYPAL_CLIENT_ID="<sandbox client id>"
PAYPAL_CLIENT_SECRET="<sandbox secret>"
PAYPAL_MODE="sandbox"
```

### 3. Return URLs (automatic)

The app configures these when creating a PayPal order:

| Flow | URL |
|------|-----|
| Success return | `{APP_URL}/api/payments/paypal/return?orderNumber=BP-...` |
| Cancel | `{APP_URL}/payment/failed?order=BP-...` |

PayPal redirects the buyer back after approval; the server captures the payment and sends the user to the confirmation or failed page.

**Local dev:** PayPal sandbox can redirect to `http://localhost:3000` — no ngrok required for the return flow. `NEXT_PUBLIC_APP_URL` should still be `http://localhost:3000`.

### 4. Sandbox test account

Use a **Personal Sandbox** buyer account from the PayPal developer dashboard to log in during checkout.

### 5. Production checklist

- Create a **Live** app in PayPal dashboard
- Set `PAYPAL_MODE="live"` and live credentials
- Set `NEXT_PUBLIC_APP_URL` to your production domain

---

## Resend (order confirmation email)

Sent when payment status becomes **CAPTURED**.

1. Create an account at [resend.com](https://resend.com)
2. Add and verify domain `bluepearlid.com` (SPF, DKIM, DMARC)
3. Set `RESEND_API_KEY` and `EMAIL_FROM=noreply@bluepearlid.com`

Without Resend, emails are printed to the server console in development.

---

## End-to-end test flow

1. Start database: `docker compose up -d`
2. Migrate and seed: `npm run db:migrate && npm run db:seed`
3. Configure payment keys in `.env`
4. Start app: `npm run dev`
5. Add a product to cart → checkout → choose **Card** or **PayPal**
6. After placing the order you land on `/checkout/processing?order=BP-...`
7. Complete payment in Snap or PayPal
8. Confirm redirect to `/checkout/confirmation/BP-...` and order status **PAID**

If payment fails or is cancelled: `/payment/failed?order=BP-...` with retry options.

---

## API routes (reference)

| Route | Purpose |
|-------|---------|
| `GET /api/payments/session?order=BP-...` | Start or resume payment (Snap token / PayPal URL) |
| `POST /api/payments/midtrans/webhook` | Midtrans payment notifications |
| `GET /api/payments/paypal/return` | PayPal return + capture |
| `POST /api/payments/retry` | Retry failed payment |
| `GET /api/orders/[orderNumber]` | Poll order status after card payment |

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| "Payment gateway not configured" | Missing API keys or `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` |
| Card payment succeeds but order stays pending | Webhook not reachable — check ngrok and Midtrans webhook URL |
| PayPal redirect works but capture fails | Wrong `PAYPAL_CLIENT_SECRET` or sandbox/live mismatch |
| Snap window does not open | Client key missing; check browser console and `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` |
| No confirmation email | `RESEND_API_KEY` not set (check server logs for `[email:dev]`) |

---

## Security notes

- Never commit `.env` or expose `MIDTRANS_SERVER_KEY` / `PAYPAL_CLIENT_SECRET` to the client
- Only `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` is safe in the browser (required for Snap.js)
- Midtrans webhook signatures are verified server-side before updating orders
