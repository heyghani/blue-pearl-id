# Folder Structure

Recommended Next.js 16 App Router layout for Blue Pearl ID.

```
blue-pearl-id/
├── app/
│   ├── (storefront)/                    # Public shop layout
│   │   ├── layout.tsx                   # Header, footer, cart provider
│   │   ├── page.tsx                     # Home
│   │   ├── products/
│   │   │   ├── page.tsx                 # Catalog
│   │   │   └── [slug]/page.tsx          # Product detail
│   │   ├── cart/page.tsx
│   │   ├── checkout/
│   │   │   ├── layout.tsx               # Checkout shell (minimal chrome)
│   │   │   ├── page.tsx                 # Redirect to step 1
│   │   │   ├── information/page.tsx
│   │   │   ├── shipping/page.tsx
│   │   │   ├── payment/page.tsx
│   │   │   ├── processing/page.tsx      # Payment in progress
│   │   │   └── confirmation/[orderNumber]/page.tsx
│   │   ├── payment/
│   │   │   ├── success/page.tsx
│   │   │   └── failed/page.tsx          # Retry flow
│   │   └── account/
│   │       ├── layout.tsx
│   │       ├── page.tsx                 # Dashboard
│   │       ├── orders/page.tsx
│   │       ├── orders/[id]/page.tsx
│   │       ├── addresses/page.tsx
│   │       └── profile/page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify-email/page.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx                   # Admin sidebar
│   │   ├── page.tsx                     # Analytics dashboard
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── coupons/page.tsx
│   │   └── shipping/page.tsx          # Standard / Express rate config
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── health/route.ts
│   │   ├── products/route.ts
│   │   ├── products/[slug]/route.ts
│   │   ├── categories/route.ts
│   │   ├── shipping/rates/route.ts
│   │   ├── cart/route.ts
│   │   ├── cart/items/route.ts
│   │   ├── cart/items/[id]/route.ts
│   │   ├── checkout/
│   │   │   ├── validate/route.ts
│   │   │   ├── create-order/route.ts
│   │   │   └── recover/[token]/route.ts
│   │   ├── payments/
│   │   │   ├── midtrans/
│   │   │   │   ├── snap-token/route.ts
│   │   │   │   └── webhook/route.ts
│   │   │   ├── paypal/
│   │   │   │   ├── create-order/route.ts
│   │   │   │   ├── capture/route.ts
│   │   │   │   └── webhook/route.ts
│   │   │   └── retry/route.ts
│   │   ├── orders/[id]/route.ts
│   │   ├── shipping-rates/route.ts
│   │   ├── addresses/route.ts
│   │   ├── admin/
│   │   │   ├── products/route.ts
│   │   │   ├── orders/route.ts
│   │   │   ├── orders/[id]/status/route.ts
│   │   │   ├── shipping-rates/route.ts
│   │   │   ├── refunds/route.ts
│   │   │   └── analytics/route.ts
│   │   └── upload/route.ts              # Presigned R2 upload
│   │
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── layout.tsx                       # Root layout
│   └── globals.css
│
├── components/
│   ├── ui/                              # shadcn primitives
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── mobile-nav.tsx
│   │   └── trust-bar.tsx
│   ├── catalog/
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── filters.tsx
│   │   └── search-bar.tsx
│   ├── product/
│   │   ├── image-gallery.tsx
│   │   ├── add-to-cart.tsx
│   │   └── related-products.tsx
│   ├── cart/
│   │   ├── cart-drawer.tsx
│   │   ├── cart-item.tsx
│   │   └── order-summary.tsx
│   ├── checkout/
│   │   ├── checkout-steps.tsx
│   │   ├── customer-form.tsx
│   │   ├── shipping-form.tsx
│   │   ├── shipping-method-selector.tsx
│   │   ├── duties-notice.tsx
│   │   ├── payment-selector.tsx
│   │   ├── midtrans-snap.tsx
│   │   └── paypal-buttons.tsx
│   ├── admin/
│   │   ├── data-table.tsx
│   │   ├── product-form.tsx
│   │   └── order-status-badge.tsx
│   └── shared/
│       ├── price.tsx
│       ├── seo-json-ld.tsx
│       └── loading-skeleton.tsx
│
├── lib/
│   ├── db.ts                            # Prisma singleton
│   ├── auth.ts                          # Auth.js config
│   ├── redis.ts                         # Upstash client
│   ├── validations/
│   │   ├── checkout.ts
│   │   ├── product.ts
│   │   └── auth.ts
│   ├── services/
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   ├── inventory.service.ts
│   │   └── email.service.ts
│   ├── payments/
│   │   ├── midtrans.ts
│   │   ├── paypal.ts
│   │   ├── idempotency.ts
│   │   └── webhook-verify.ts
│   ├── storage/
│   │   └── r2.ts
│   ├── analytics/
│   │   └── events.ts                    # GA4 ecommerce events
│   └── utils/
│       ├── currency.ts
│       ├── order-number.ts
│       └── cn.ts
│
├── hooks/
│   ├── use-cart.ts
│   └── use-checkout.ts
│
├── types/
│   ├── api.ts
│   ├── checkout.ts
│   └── payment.ts
│
├── emails/                              # React Email templates
│   ├── order-confirmation.tsx
│   ├── payment-success.tsx
│   ├── payment-failed.tsx
│   ├── shipping-confirmation.tsx
│   ├── password-reset.tsx
│   └── email-verification.tsx
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│   ├── images/
│   └── fonts/
│
├── docs/                                # Architecture docs (this folder)
├── middleware.ts                        # Auth, rate limit, admin guard
├── next.config.ts
├── tailwind.config.ts                   # If needed for v4 extensions
└── package.json
```

## Conventions

| Pattern | Rule |
|---------|------|
| Server Components | Default for data fetching pages |
| Client Components | Checkout forms, cart drawer, payment widgets only |
| Services | All business logic in `lib/services/`; routes stay thin |
| Validation | Zod schemas in `lib/validations/`; shared client/server |
| API responses | `{ data, error, meta }` envelope |
| Errors | `lib/errors.ts` with typed `AppError` codes |
