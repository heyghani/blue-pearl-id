# UI/UX Sitemap & Design System

## Design Philosophy

**References:** Apple (clarity), Stripe (checkout trust), Notion (spacing), Shopify (commerce patterns)

**Principles:**
- Content before chrome
- One primary action per screen
- Progressive disclosure in checkout
- Trust signals adjacent to payment CTAs
- No decorative animation; functional transitions only (150–200ms)

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#FAFAFA` | Page background |
| `--foreground` | `#0A0A0A` | Primary text |
| `--muted` | `#F4F4F5` | Cards, sections |
| `--muted-foreground` | `#71717A` | Secondary text |
| `--border` | `#E4E4E7` | Dividers |
| `--primary` | `#18181B` | CTAs, links |
| `--primary-foreground` | `#FAFAFA` | CTA text |
| `--accent` | `#2563EB` | Focus, success links |
| `--destructive` | `#DC2626` | Errors |
| `--success` | `#16A34A` | Paid, in stock |

Typography: **Inter** (UI) + optional **Playfair Display** (hero headlines only)

**Price display:** `$129.00 USD` — all amounts in USD. Post-MVP: optional `≈ ¥935 CNY` estimate (non-binding, checkout stays USD).

**Duties notice** (product footer, cart summary, checkout): muted text, always visible:

> Import duties, VAT, and local taxes are the responsibility of the customer and may be charged upon delivery.

Spacing scale: 4px base (4, 8, 12, 16, 24, 32, 48, 64)

Border radius: `sm: 6px`, `md: 8px`, `lg: 12px`

---

## Component Hierarchy

```
App
├── StorefrontLayout
│   ├── Header (logo, nav, search, cart icon)
│   ├── TrustBar (optional promo)
│   ├── Main
│   └── Footer
├── CheckoutLayout (minimal — logo + secure badge only)
└── AdminLayout
    ├── Sidebar
    └── Main

CheckoutWizard
├── CheckoutSteps (1. Info → 2. Shipping → 3. Pay)
├── OrderSummary (sticky desktop / collapsible mobile)
└── StepContent
    ├── CustomerForm
    ├── ShippingForm
    └── PaymentSelector
        ├── MidtransSnapEmbed
        └── PayPalButtons
```

---

## Sitemap

```
/                           Home
/products                   Catalog
/products/[slug]            Product Detail
/cart                       Shopping Cart

/checkout/information       Step 1 — Email & contact
/checkout/shipping          Step 2 — Address
/checkout/payment           Step 3 — Payment method
/checkout/processing          Payment redirect/wait
/checkout/confirmation/[id]   Success

/payment/failed             Retry + support
/payment/success              Legacy redirect → confirmation

/login
/register
/forgot-password
/verify-email

/account                    Dashboard
/account/orders
/account/orders/[id]
/account/addresses
/account/profile

/admin                      Analytics
/admin/products
/admin/products/new
/admin/products/[id]/edit
/admin/orders
/admin/orders/[id]
/admin/customers
/admin/customers/[id]
/admin/shipping                   Shipping rates (Standard / Express)

/legal/privacy
/legal/terms
/legal/refunds
/legal/shipping
```

---

## Page Wireframes (ASCII)

### Home

```
┌────────────────────────────────────────────┐
│ [Logo]    Shop  About  FAQ     [🔍] [🛒]  │
├────────────────────────────────────────────┤
│                                            │
│     Premium Pearls for the World           │
│     [Shop Collection]                      │
│                                            │
├────────────────────────────────────────────┤
│  🔒 Secure Pay  ✈ Intl Shipping  ↩ Returns │
├────────────────────────────────────────────┤
│  Featured Products          [grid 2x4]     │
├────────────────────────────────────────────┤
│  Best Sellers               [grid]       │
├────────────────────────────────────────────┤
│  Testimonials               [carousel]   │
├────────────────────────────────────────────┤
│  FAQ                        [accordion]  │
├────────────────────────────────────────────┤
│  Footer: links, social, newsletter         │
└────────────────────────────────────────────┘
```

### Checkout Shipping Step (Mobile)

```
┌──────────────────────────┐
│ Shipping Address         │
│ [form fields...]         │
│                          │
│ Shipping Method          │
│ ┌──────────────────────┐ │
│ │ ● Standard  $15.00   │ │
│ │   10–21 business days│ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ○ Express   $35.00   │ │
│ │   3–7 business days  │ │
│ └──────────────────────┘ │
│                          │
│ ℹ Import duties, VAT...  │
│   (duties notice)        │
│                          │
│ Continue to Payment   →  │
└──────────────────────────┘
```

### Payment Step

```
┌──────────────────────────┐
│ Payment Method           │
│ ┌──────────────────────┐ │
│ │ ● Credit Card        │ │
│ │   [Midtrans Snap]    │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ○ PayPal             │ │
│ │   [PayPal Button]    │ │
│ └──────────────────────┘ │
│                          │
│ 🔒 Encrypted · PCI via   │
│    Midtrans / PayPal     │
│                          │
│ [Complete Payment]       │
└──────────────────────────┘
```

### Payment Failed (Recovery)

```
┌──────────────────────────┐
│ ⚠ Payment unsuccessful   │
│                          │
│ Your order #BP-xxx is    │
│ saved. No charge made.   │
│                          │
│ [Try Again]  [PayPal]    │
│                          │
│ Need help? support@...   │
└──────────────────────────┘
```

---

## UX Patterns for Conversion

| Pattern | Implementation |
|---------|----------------|
| Guest checkout default | No account wall; optional "Create account" post-purchase |
| Sticky order summary | Desktop right column; mobile collapsible |
| Express checkout | PayPal one-click when available |
| Error recovery | Preserve form state; show specific decline reason |
| Trust | SSL badge, payment logos, money-back snippet at payment |
| Progress | 3 steps max; show step indicator |
| Loading | Skeleton screens; disable double-submit on payment |
| Abandoned cart | Email with recovery link to `/checkout/recover/[token]` |

---

## Accessibility

- Focus trap in cart drawer and modals
- `aria-live` for payment status updates
- Form labels + `aria-describedby` for errors
- Color contrast ≥ 4.5:1 on body text
- Touch targets ≥ 44×44px on mobile checkout

---

## Analytics Events (GA4 Ecommerce)

| Event | Trigger |
|-------|---------|
| `view_item` | Product detail load |
| `add_to_cart` | Add to cart click |
| `begin_checkout` | Checkout step 1 |
| `add_shipping_info` | Shipping step complete |
| `add_payment_info` | Payment method selected |
| `purchase` | Confirmation page (dedupe by transaction_id) |

Clarity: Record checkout funnel pages; mask email/phone fields.
