# Development Roadmap

**Total estimated effort:** 10–14 weeks (1 full-stack dev + part-time design)  
**MVP launch target:** Week 12–14

Effort scale: **S** = 1–2 days, **M** = 3–5 days, **L** = 1–2 weeks

---

## Phase 1: Project Setup

| Item | Detail |
|------|--------|
| **Duration** | 3–5 days |
| **Deliverables** | Repo structure, shadcn/ui, ESLint/Prettier, env template, CI (lint + typecheck), Vercel preview deploy, design tokens in Tailwind |
| **Dependencies** | None |
| **Risks** | Next.js 16 API differences — read `node_modules/next/dist/docs/` before coding |

**Tasks:**
- [ ] Install shadcn/ui, Prisma, Auth.js, Zod, Upstash Redis client
- [ ] Configure `middleware.ts` skeleton
- [ ] Set up Neon Postgres + Prisma migrate
- [ ] Cloudflare R2 bucket + presigned upload POC
- [ ] **Resend:** add `bluepearlid.com`, configure SPF/DKIM/DMARC (1–2 days)
- [ ] Base layouts: storefront, checkout, admin

---

## Phase 2: Database Architecture

| Item | Detail |
|------|--------|
| **Duration** | 4–6 days |
| **Deliverables** | Full Prisma schema, migrations, seed script (categories, sample products), DB indexes, full-text search migration |
| **Dependencies** | Phase 1 |
| **Risks** | Schema churn if checkout rules change — lock order/payment models early |

**Tasks:**
- [ ] Implement schema from `03-DATABASE-SCHEMA.md`
- [ ] Seed 20 products, 5 categories
- [ ] Seed `ShippingRate` rows: STANDARD ($15), EXPRESS ($35) — admin-editable
- [ ] Repository layer / Prisma client singleton
- [ ] Inventory reservation transaction POC

---

## Phase 3: Authentication

| Item | Detail |
|------|--------|
| **Duration** | 5–7 days |
| **Deliverables** | Register, login, logout, forgot password, email verification (Resend), role middleware, admin route protection |
| **Dependencies** | Phase 2 |
| **Risks** | Email deliverability — verify domain in Resend early |

**Tasks:**
- [ ] Auth.js credentials provider + Prisma adapter
- [ ] Verification token flow
- [ ] Password reset flow
- [ ] Rate limit auth endpoints
- [ ] Cart merge on login

---

## Phase 4: Catalog (Storefront)

| Item | Detail |
|------|--------|
| **Duration** | 1.5–2 weeks |
| **Deliverables** | Home, catalog, product detail, search/filter/sort, SEO metadata, JSON-LD, image optimization |
| **Dependencies** | Phase 2 |
| **Risks** | Image performance — use R2 + `next/image` sizes from day one |

**Tasks:**
- [ ] Home page sections (hero, featured, best sellers, trust, FAQ, footer)
- [ ] Product listing with ISR
- [ ] Product detail + related products
- [ ] `sitemap.ts`, `robots.ts`
- [ ] GA4 + Clarity script integration

---

## Phase 5: Cart

| Item | Detail |
|------|--------|
| **Duration** | 4–6 days |
| **Deliverables** | Cart drawer, cart page, guest session cart, DB cart for users, stock validation, order summary component |
| **Dependencies** | Phase 3, 4 |
| **Risks** | Cart sync edge cases — test guest→login merge |

**Tasks:**
- [ ] `CartService` with sessionId cookie
- [ ] Add/update/remove API
- [ ] Cart persistence + expiry job
- [ ] GA4 `add_to_cart` events

---

## Phase 6: Checkout

| Item | Detail |
|------|--------|
| **Duration** | 1.5–2 weeks |
| **Deliverables** | 3-step checkout wizard, guest + account flows, address forms, coupon validation, order creation (PENDING), idempotency, abandoned checkout capture |
| **Dependencies** | Phase 5 |
| **Risks** | **Highest business risk** — allocate extra QA time |

**Tasks:**
- [ ] Checkout layout (minimal chrome)
- [ ] Step 1: customer info + email
- [ ] Step 2: shipping method selector (Standard / Express) + address + duties notice
- [ ] Step 3: payment method selection (UI only first)
- [ ] `POST /checkout/create-order` with inventory reserve
- [ ] Mobile UX pass + accessibility audit
- [ ] Abandoned checkout email job

---

## Phase 7: Payments

| Item | Detail |
|------|--------|
| **Duration** | 2–2.5 weeks |
| **Deliverables** | Midtrans Snap, PayPal Checkout, webhooks, retry flow, failed payment page, confirmation email, payment event logging, polling fallback cron |
| **Dependencies** | Phase 6 |
| **Risks** | Webhook local testing — use ngrok/staging; Midtrans sandbox quirks; PayPal webhook verification |

**Tasks:**
- [ ] Midtrans Snap token + client embed
- [ ] Midtrans webhook + signature verify
- [ ] PayPal create + capture + webhook
- [ ] `PaymentService` central status handler
- [ ] Retry API + `/payment/failed` UI
- [ ] Order confirmation page + emails (confirmation, payment success, payment failed)
- [ ] Shipping confirmation email on admin ship action
- [ ] E2E payment tests (sandbox)
- [ ] Duplicate transaction test suite

---

## Phase 8: Admin Dashboard

| Item | Detail |
|------|--------|
| **Duration** | 1.5–2 weeks |
| **Deliverables** | Product CRUD + image upload, order management, status updates, customer list, basic analytics, refund initiation |
| **Dependencies** | Phase 4, 7 |
| **Risks** | Scope creep — stick to table + form patterns |

**Tasks:**
- [ ] Admin layout + navigation
- [ ] Products CRUD with R2 upload
- [ ] Inventory management inline
- [ ] Orders list/detail + status workflow + tracking number entry
- [ ] Shipping rates admin (Standard / Express)
- [ ] Analytics widgets (revenue, orders, conversion, top products)
- [ ] Refund UI wired to gateway APIs

---

## Phase 9: Testing

| Item | Detail |
|------|--------|
| **Duration** | 1–1.5 weeks |
| **Deliverables** | Unit tests (services), integration tests (checkout API), E2E (Playwright: browse → checkout → pay sandbox), security checklist, Lighthouse audit |
| **Dependencies** | Phases 1–8 |
| **Risks** | Flaky E2E on payment redirects — mock gateways in CI, sandbox in staging |

**Tasks:**
- [ ] Vitest for `OrderService`, `PaymentService`, idempotency
- [ ] Playwright critical path tests
- [ ] OWASP checklist walkthrough
- [ ] Load test checkout endpoint (k6 light)
- [ ] Mobile device testing (iOS Safari, Android Chrome)

---

## Phase 10: Production Deployment

| Item | Detail |
|------|--------|
| **Duration** | 4–6 days |
| **Deliverables** | Production env on Vercel, Neon prod DB, Cloudflare DNS + WAF, live payment keys, monitoring, runbook |
| **Dependencies** | Phase 9 |
| **Risks** | Payment go-live approval delays from Midtrans/PayPal |

**Tasks:**
- [ ] Production secrets rotation
- [ ] Webhook URLs registered with gateways
- [ ] Smoke test live $1 transaction
- [ ] Backup strategy (Neon PITR)
- [ ] Incident runbook for payment failures

---

## Gantt Overview

```
Week  1  2  3  4  5  6  7  8  9  10 11 12 13 14
P1    ██
P2       ██
P3          ██
P4             ████
P5                   ██
P6                      ████
P7                          █████
P8                               ████
P9                                    ███
P10                                      ██
```

---

## Critical Path

```
Phase 1 → 2 → 6 → 7 → 10
              ↗
         3 → 5
              ↗
         4 (parallel with 3/5)
```

**Payment (Phase 7) is the gate for launch.** Start Midtrans/PayPal sandbox accounts in Week 1.

---

## Team Recommendations

| Role | Allocation |
|------|------------|
| Full-stack engineer | 100% |
| UI/UX designer | 25% (weeks 1–4, checkout review week 8) |
| QA | 25% (weeks 9–10) |
| Product owner | Sign-off on checkout + payment flows |

---

## Definition of Done (MVP)

- [ ] Customer can complete purchase via Midtrans and PayPal in production
- [ ] Webhooks reliably update order status
- [ ] Admin can manage products and fulfill orders
- [ ] Lighthouse mobile performance ≥ 90 on key pages
- [ ] Security checklist completed
- [ ] Legal pages linked in footer
