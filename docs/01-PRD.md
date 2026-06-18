# Product Requirements Document (PRD)

**Project:** Blue Pearl ID — Premium E-Commerce MVP  
**Version:** 1.1  
**Status:** Approved (business decisions locked)  
**Priority:** Payment conversion & checkout reliability

---

## 1. Executive Summary

Blue Pearl ID is a premium, conversion-focused e-commerce platform targeting **international buyers**, with emphasis on **Chinese customers**. The MVP optimizes for **payment success rate**, **checkout completion**, and **operational simplicity** over feature breadth.

**North-star metrics:**
| Metric | MVP Target |
|--------|------------|
| Checkout completion rate | ≥ 65% |
| Payment success rate (first attempt) | ≥ 92% |
| Payment recovery (retry + abandoned cart) | ≥ 15% of failed/abandoned |
| Mobile checkout completion | ≥ 60% of desktop rate |
| Lighthouse Performance (mobile) | ≥ 90 |

---

## 2. Problem Statement

International e-commerce buyers—especially from China—abandon checkout due to:
- Unclear pricing (shipping, duties, currency)
- Slow or confusing payment flows
- Failed payments without recovery paths
- Lack of trust signals on mobile
- Forced account creation

**Solution:** A lean, mobile-first storefront with a **3-step checkout**, dual payment rails (Midtrans + PayPal), guest checkout, and production-grade payment reliability (webhooks, idempotency, retry).

---

## 3. Target Users

| Persona | Needs | Priority |
|---------|-------|----------|
| **International buyer (China)** | Mobile checkout, clear total price, trusted payment, English/optional CN copy | P0 |
| **Guest shopper** | Fast checkout, no account required | P0 |
| **Registered customer** | Order history, saved addresses, faster repeat purchase | P1 |
| **Store admin** | Product/order management, payment status visibility | P0 |
| **Operations** | Refunds, failed payment investigation, analytics | P1 |

---

## 4. Scope

### 4.1 In Scope (MVP)

**Public storefront**
- Home, catalog, product detail, cart, checkout, order confirmation
- Search, category filter, sort
- SEO (metadata, OG, JSON-LD, sitemap, robots)

**Checkout & payments (critical path)**
- Guest + account checkout
- Flow: Cart → Customer Info → Shipping → Payment → Confirmation
- Midtrans Snap (credit card) + PayPal Checkout
- Webhook handling, idempotency, payment retry, abandoned checkout capture

**Customer account**
- Register, login, forgot password, email verification
- Profile, addresses, order history, basic tracking

**Admin**
- CRUD products, inventory, categories
- Order management, status updates, refund initiation
- Shipping rate configuration (Standard / Express)
- Manual tracking number entry on shipment
- Customer list, basic analytics dashboard

**Transactional email (Resend)**
- Order confirmation, payment success, payment failed
- Shipping confirmation, password reset, email verification

### 4.2 Out of Scope (Post-MVP)

- CNY estimated price display (checkout remains USD)
- Automated international VAT / import tax calculation
- Carrier API integrations (DHL, FedEx, UPS, SF Express)
- Multi-language i18n (MVP: English primary; structure for CN later)
- Alipay / WeChat Pay direct integration
- Subscription / membership
- Advanced fraud (3DS rules engine, device fingerprinting)
- Native mobile apps
- Marketplace / multi-vendor
- Loyalty points, wishlists (beyond session cart)
- Live chat, reviews moderation workflow

---

## 5. Functional Requirements

### 5.1 Home Page
| ID | Requirement | Priority |
|----|-------------|----------|
| H-01 | Hero with primary CTA to catalog/featured product | P0 |
| H-02 | Featured products grid (max 8) | P0 |
| H-03 | Best sellers section | P0 |
| H-04 | Trust indicators (secure payment, shipping, returns) | P0 |
| H-05 | Testimonials (static CMS or DB) | P1 |
| H-06 | FAQ accordion | P1 |
| H-07 | Footer with legal links, contact | P0 |

### 5.2 Catalog
| ID | Requirement | Priority |
|----|-------------|----------|
| C-01 | Paginated product listing | P0 |
| C-02 | Category filter (single + multi) | P0 |
| C-03 | Full-text search (name, SKU, description) | P0 |
| C-04 | Sort: price, newest, popularity | P0 |
| C-05 | Empty state + filter reset | P1 |

### 5.3 Product Detail
| ID | Requirement | Priority |
|----|-------------|----------|
| P-01 | Image gallery with zoom (mobile swipe) | P0 |
| P-02 | Price, stock status, SKU | P0 |
| P-03 | Description + specifications tabs | P0 |
| P-04 | Add to cart + Buy now | P0 |
| P-05 | Related products (same category) | P1 |
| P-06 | JSON-LD Product schema | P0 |

### 5.4 Cart
| ID | Requirement | Priority |
|----|-------------|----------|
| CT-01 | Update quantity, remove item | P0 |
| CT-01 | Persist cart (guest: cookie/local; user: DB merge) | P0 |
| CT-03 | Order summary with subtotal; shipping at checkout | P0 |
| CT-04 | Stock validation on cart load | P0 |

### 5.5 Checkout (Critical)
| ID | Requirement | Priority |
|----|-------------|----------|
| CH-01 | Max 3 visible steps after cart | P0 |
| CH-02 | Guest checkout without account | P0 |
| CH-03 | Pre-fill for logged-in users | P0 |
| CH-04 | Real-time field validation (Zod) | P0 |
| CH-05 | Shipping address with country validation | P0 |
| CH-06 | Order review before payment | P0 |
| CH-07 | Payment method selection: Card (Midtrans) / PayPal | P0 |
| CH-08 | Create `PENDING` order before payment redirect | P0 |
| CH-09 | Payment failure page with retry CTA | P0 |
| CH-10 | Abandoned checkout email (Resend) after 1h | P1 |
| CH-11 | Duplicate submit prevention (idempotency key) | P0 |

### 5.6 Payments
| ID | Requirement | Priority |
|----|-------------|----------|
| PAY-01 | Midtrans Snap token generation server-side | P0 |
| PAY-02 | Midtrans webhook signature verification | P0 |
| PAY-03 | PayPal order create + capture | P0 |
| PAY-04 | PayPal webhook verification | P0 |
| PAY-05 | Payment event audit log | P0 |
| PAY-06 | Order status sync: PENDING → PAID / FAILED / EXPIRED | P0 |
| PAY-07 | Admin refund via gateway API | P1 |

### 5.7 Customer Account
| ID | Requirement | Priority |
|----|-------------|----------|
| A-01 | Email/password auth with verification | P0 |
| A-02 | Forgot password flow | P0 |
| A-03 | Profile edit | P1 |
| A-04 | Address CRUD (default shipping) | P0 |
| A-05 | Order history with status | P0 |

### 5.8 Admin
| ID | Requirement | Priority |
|----|-------------|----------|
| AD-01 | Role-based access (ADMIN, CUSTOMER) | P0 |
| AD-02 | Product CRUD + image upload | P0 |
| AD-03 | Inventory decrement on paid order | P0 |
| AD-04 | Order list, filter, status update | P0 |
| AD-05 | Revenue / orders / conversion widgets | P1 |
| AD-06 | Customer list + detail | P1 |
| AD-07 | Configure Standard / Express shipping rates (worldwide) | P0 |
| AD-08 | Enter tracking number when marking order shipped | P0 |

### 5.9 Shipping (MVP)

| ID | Requirement | Priority |
|----|-------------|----------|
| SH-01 | Worldwide shipping support | P0 |
| SH-02 | Two methods: **Standard Shipping** and **Express Shipping** | P0 |
| SH-03 | Customer selects shipping method at checkout (step 2) | P0 |
| SH-04 | Admin configures flat rates per method in dashboard | P0 |
| SH-05 | Admin manually enters tracking number on shipment | P0 |
| SH-06 | Shipping confirmation email with tracking link/number | P0 |
| SH-07 | Estimated delivery range per method (admin-configurable) | P1 |

### 5.10 Tax & Duties (MVP)

| ID | Requirement | Priority |
|----|-------------|----------|
| TX-01 | Do **not** calculate international VAT or import taxes at checkout | P0 |
| TX-02 | `taxAmount` stored as `0` on all MVP orders | P0 |
| TX-03 | Display duties notice on product, cart, and checkout pages | P0 |

**Required notice (exact copy):**

> Import duties, VAT, and local taxes are the responsibility of the customer and may be charged upon delivery.

### 5.11 Currency (MVP)

| ID | Requirement | Priority |
|----|-------------|----------|
| CU-01 | **USD** is the sole display and checkout currency | P0 |
| CU-02 | All product prices stored in USD | P0 |
| CU-03 | Payment gateways charge in USD | P0 |
| CU-04 | Post-MVP: show estimated CNY conversion alongside USD (display only) | P2 |

### 5.12 Email (Resend)

| ID | Requirement | Priority |
|----|-------------|----------|
| EM-01 | Resend with verified custom domain `bluepearlid.com` | P0 |
| EM-02 | Sender: `noreply@bluepearlid.com` (transactional) | P0 |
| EM-03 | Reply-to / support: `support@bluepearlid.com` | P0 |
| EM-04 | Order confirmation | P0 |
| EM-05 | Payment success | P0 |
| EM-06 | Payment failed (with retry link) | P0 |
| EM-07 | Shipping confirmation (with tracking) | P0 |
| EM-08 | Password reset | P0 |
| EM-09 | Email verification | P0 |
| EM-10 | DNS setup: SPF, DKIM, DMARC (1–2 day timeline) | P0 |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | LCP < 2.5s, INP < 200ms, CLS < 0.1; Lighthouse ≥ 90 |
| Security | OWASP Top 10; CSRF on mutations; rate limits on auth/checkout |
| Availability | 99.5% uptime target; payment webhooks retried by provider |
| SEO | Indexable product/category pages; canonical URLs |
| Accessibility | WCAG 2.1 AA for checkout flow |
| Mobile | Mobile-first; checkout usable on 375px viewport |

---

## 7. Success Criteria (Launch)

- [ ] End-to-end purchase with Midtrans (sandbox + production)
- [ ] End-to-end purchase with PayPal (sandbox + production)
- [ ] Webhook updates order within 30s of payment
- [ ] Failed payment shows retry without duplicate charge
- [ ] Guest can complete checkout in < 2 minutes on mobile
- [ ] Admin can fulfill order lifecycle manually

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Midtrans limited China card success | High | PayPal as primary for CN; monitor decline codes; plan Stripe/alternative |
| Webhook delivery failure | High | Polling fallback job; idempotent handlers; payment log replay |
| Inventory oversell | Medium | DB transaction + row lock on order creation |
| Scope creep | Medium | Strict MVP boundary; phase gates in roadmap |

---

## 9. Assumptions

- Business entity qualifies for Midtrans micro-business tier
- Single warehouse; worldwide shipping with admin-configured flat rates
- All prices, checkout totals, and payment processing in **USD**
- No automated tax/VAT calculation at MVP; customer bears import duties
- Legal pages (Privacy, Terms, Refund) provided by business
- Resend domain verification completed before production email go-live

---

## 10. Resolved Business Decisions

### 10.1 Currency

- **Primary currency:** USD for display, storage, checkout, and payment processing
- All `Product.price` and order monetary fields use USD
- **Future:** Estimated CNY conversion shown next to USD prices (informational only; checkout stays USD)

### 10.2 Shipping

| Method | MVP Behavior |
|--------|--------------|
| **Standard Shipping** | Worldwide; admin-set flat rate |
| **Express Shipping** | Worldwide; admin-set flat rate |

- Admin configures rates and estimated delivery windows
- Admin manually enters tracking numbers when fulfilling orders
- **Future carriers:** DHL, FedEx, UPS, SF Express (API label + tracking integration)

### 10.3 Tax / VAT

- No automatic international VAT or import tax calculation at checkout
- `taxAmount = 0` on all MVP orders
- Duties notice displayed on product, cart, and checkout (see §5.10)
- **Future:** Region-specific tax rules when legally required

### 10.4 Email Infrastructure

| Setting | Value |
|---------|-------|
| Provider | Resend |
| Domain | `bluepearlid.com` (verified) |
| Transactional sender | `noreply@bluepearlid.com` |
| Support / reply-to | `support@bluepearlid.com` |
| DNS records | SPF, DKIM, DMARC |
| Setup timeline | 1–2 days including DNS propagation |

**Required email templates:** Order Confirmation · Payment Success · Payment Failed · Shipping Confirmation · Password Reset · Email Verification
