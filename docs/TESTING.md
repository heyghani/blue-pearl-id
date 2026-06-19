# Testing Guide

## Overview

| Layer | Tool | What it covers |
|-------|------|----------------|
| Unit | [Vitest](https://vitest.dev) | Order numbers, Midtrans status/signature, checkout validation, order totals (mocked) |
| E2E | [Playwright](https://playwright.dev) | Storefront browse, cart, login page |
| CI | GitHub Actions | Lint, build, unit tests, E2E with Postgres |

Payment redirects are **not** automated in CI (flaky in sandbox). Test payments manually on [your Vercel preview](https://blue-pearl-id.vercel.app/) or locally with sandbox keys — see [PAYMENT-SETUP.md](./PAYMENT-SETUP.md).

---

## Unit tests

```bash
npm test              # run once
npm run test:watch    # watch mode
```

Tests live in `tests/unit/`.

---

## E2E tests

### Local (requires running database)

```bash
docker compose up -d
npm run db:migrate:deploy
npm run db:seed
npm run test:e2e
```

Playwright starts `npm run dev` automatically unless `PLAYWRIGHT_BASE_URL` is set.

### Against Vercel deployment

```bash
PLAYWRIGHT_BASE_URL=https://blue-pearl-id.vercel.app npm run test:e2e
```

Useful for smoke-testing production after deploy without a local DB.

### Interactive mode

```bash
npm run test:e2e:ui
```

---

## Manual QA checklist (payments)

- [ ] Add to cart → checkout (guest) → place order
- [ ] Midtrans sandbox card payment → order **PAID**
- [ ] PayPal sandbox payment → order **PAID**
- [ ] Failed payment → `/payment/failed` → retry
- [ ] Admin: mark order **Shipped** with tracking → shipping email
- [ ] Login as admin → `/admin` dashboard loads

---

## Load testing (optional)

A light k6 script is not included in MVP CI. For checkout load testing before launch, use [k6](https://k6.io) against `POST /api/checkout/validate` in a staging environment only — never against production without throttling.

---

## Lighthouse

Run manually before launch:

```bash
npx lighthouse https://blue-pearl-id.vercel.app --only-categories=performance,accessibility,best-practices,seo --view
```

Target: mobile performance ≥ 90 on home, product, and checkout pages (per roadmap).
