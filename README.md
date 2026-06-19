# Blue Pearl ID

Premium e-commerce platform focused on payment conversion and international checkout.

## Stack

- Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui
- PostgreSQL · Prisma 6 · Auth.js v5

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Generate an auth secret:

```bash
openssl rand -base64 32
```

Set `AUTH_SECRET` in `.env`.

### 3. Database

**Option A — Docker (local)**

```bash
docker compose up -d
```

**Option B — [Neon](https://neon.tech)** — paste your connection string as `DATABASE_URL`.

Then run migrations and seed:

```bash
npm run db:migrate
npm run db:seed
```

Seed creates:
- Admin: `admin@bluepearlid.com` / `changeme123`
- 5 categories, 6 sample products
- Standard ($15) and Express ($35) shipping rates

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |

## Documentation

Architecture and product docs live in [`docs/`](docs/README.md).

## Implementation status

- [x] Phase 1 — Project setup, design system, layouts
- [x] Phase 2 — Prisma schema + seed
- [x] Phase 3 — Authentication (login, register, verify, reset, account)
- [x] Phase 4 — Catalog (listing, filters, search, product detail, SEO)
- [x] Phase 5 — Cart (guest + user, drawer, stock validation)
- [x] Phase 6 — Checkout (3-step wizard, order creation, shipping)
- [x] Phase 7 — Payments (Midtrans Snap, PayPal, webhooks, retry)
- [x] Phase 8 — Admin dashboard (products, orders, customers, shipping, analytics)
- [x] Phase 9 — Testing (Vitest unit tests, Playwright E2E, CI, security checklist)
- [ ] Phase 10 — Production deployment

See [docs/TESTING.md](docs/TESTING.md), [docs/SECURITY-CHECKLIST.md](docs/SECURITY-CHECKLIST.md), and [docs/DEMO-GUIDE.md](docs/DEMO-GUIDE.md) for client demonstrations.

## Deploy to Vercel (checkpoint)

Phases 1–8 are ready for a preview/production deploy. Testing (Phase 9) is not included yet.

### 1. Database (Neon)

1. Create a project at [neon.tech](https://neon.tech) and copy the **pooled** connection string.
2. Run migrations and seed **once** from your machine (with `DATABASE_URL` pointing at Neon):

```bash
npm run db:migrate:deploy
npm run db:seed
```

### 2. Vercel project

1. Import [github.com/heyghani/blue-pearl-id](https://github.com/heyghani/blue-pearl-id) in Vercel.
2. Framework preset: **Next.js** (default). Build command: `npm run build`.
3. Add environment variables (Production + Preview):

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Neon pooled connection string |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | Your Vercel URL, e.g. `https://blue-pearl-id.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `AUTH_URL` |
| `MIDTRANS_SERVER_KEY` | For cards | Sandbox keys OK for preview |
| `MIDTRANS_CLIENT_KEY` | For cards | |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | For cards | Same as client key |
| `MIDTRANS_IS_PRODUCTION` | Yes | `false` for sandbox |
| `PAYPAL_CLIENT_ID` | For PayPal | Sandbox OK for preview |
| `PAYPAL_CLIENT_SECRET` | For PayPal | |
| `PAYPAL_MODE` | Yes | `sandbox` |
| `RESEND_API_KEY` | Optional | Emails log to console without it |
| `EMAIL_FROM` | Optional | `noreply@bluepearlid.com` |
| `EMAIL_REPLY_TO` | Optional | `support@bluepearlid.com` |

4. Deploy. After deploy, register webhooks using your live URL — see [docs/PAYMENT-SETUP.md](docs/PAYMENT-SETUP.md).

### 3. Smoke test

- Browse `/products`, add to cart, complete checkout (sandbox payments).
- Log in as admin (`admin@bluepearlid.com` / `changeme123`) → `/admin`.
- **Change the admin password** before sharing the URL publicly.
