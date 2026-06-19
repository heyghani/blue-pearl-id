# Client Demo Guide

Use this script when presenting **Blue Pearl ID** to your client on [Vercel preview](https://blue-pearl-id.vercel.app/) or locally.

## Before the demo

1. Confirm Vercel deploy is up to date (push latest changes).
2. Use **sandbox** payment keys (Midtrans + PayPal) — no real charges.
3. Log in as admin and **change the default password** (`admin@bluepearlid.com` / `changeme123`).
4. Optional: place one test order beforehand so account order history has data.

## Demo flow (~15 minutes)

### 1. Storefront (3 min)

- **Home** — hero, featured products, trust bar, testimonials, FAQ
- **Shop** — browse catalog, filter by category, search
- **Product detail** — gallery, specs, add to cart

### 2. Checkout & payments (5 min)

- Open cart → **Proceed to checkout**
- Walk through 3 steps: Information → Shipping → Payment
- Highlight: USD pricing, duties notice, Standard vs Express shipping
- Complete payment with **sandbox card** or **PayPal sandbox buyer**
- Show confirmation page + (if Resend configured) confirmation email

### 3. Customer account (2 min)

- Register or sign in
- **Account → Orders** — order history and detail
- **Legal pages** — footer links to Privacy, Terms, Shipping, Returns

### 4. Admin (5 min)

- `/admin` — dashboard metrics
- **Products** — edit a product (price, stock, image URL)
- **Orders** — mark order **Processing** → **Shipped** with tracking (triggers shipping email)
- **Shipping rates** — adjust Standard / Express prices
- **Customers** — view registered customers

## Talking points

| Topic | Message |
|-------|---------|
| International | Worldwide shipping, USD-only checkout, duties disclaimer |
| Payments | Midtrans (cards) + PayPal, webhook-confirmed order status |
| Trust | Legal pages, secure checkout, guest checkout supported |
| Operations | Admin can fulfill orders, adjust catalog and shipping without code |

## Known demo limitations

- Product images use URLs (R2 upload not yet built)
- Refunds recorded in admin; gateway refund is manual in Midtrans/PayPal
- Analytics (GA4/Clarity) not integrated yet
- Live production keys and custom domain = Phase 10

## After client approval

Proceed to **Phase 10**: custom domain, live payment keys, Resend domain verification, security sign-off, production smoke test.
