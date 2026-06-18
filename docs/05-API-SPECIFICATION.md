# API Specification

Base URL: `https://bluepearl.id/api`  
Auth: Session cookie (Auth.js) or `Authorization: Bearer` for future mobile  
Content-Type: `application/json`

## Response Envelope

```typescript
// Success
{ "data": T, "meta"?: { page, total, ... } }

// Error
{ "error": { "code": string, "message": string, "details"?: unknown } }
```

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Zod validation failed |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient role |
| `NOT_FOUND` | 404 | Resource missing |
| `CONFLICT` | 409 | Duplicate idempotency / stock |
| `RATE_LIMITED` | 429 | Too many requests |
| `PAYMENT_FAILED` | 402 | Gateway declined |
| `INTERNAL_ERROR` | 500 | Unexpected |

---

## Public — Catalog

### `GET /products`

Query: `?page=1&limit=24&category=slug&sort=price_asc|price_desc|newest&search=query`

```json
{
  "data": [{
    "id": "clx...",
    "name": "Pearl Necklace",
    "slug": "pearl-necklace",
    "price": "129.00",
    "currency": "USD",
    "image": "https://...",
    "inStock": true
  }],
  "meta": { "page": 1, "limit": 24, "total": 142 }
}
```

### `GET /products/[slug]`

Returns full product with images, inventory, category, related.

### `GET /categories`

Returns active category tree.

---

## Shipping

### `GET /shipping/rates`

Returns active worldwide shipping options for checkout.

```json
{
  "data": [
    {
      "method": "STANDARD",
      "name": "Standard Shipping",
      "price": "15.00",
      "currency": "USD",
      "estimatedDaysMin": 10,
      "estimatedDaysMax": 21
    },
    {
      "method": "EXPRESS",
      "name": "Express Shipping",
      "price": "35.00",
      "currency": "USD",
      "estimatedDaysMin": 3,
      "estimatedDaysMax": 7
    }
  ],
  "meta": {
    "taxNotice": "Import duties, VAT, and local taxes are the responsibility of the customer and may be charged upon delivery."
  }
}
```

---

## Cart

### `GET /cart`

Returns cart for session or authenticated user. Merges on login.

### `POST /cart/items`

```json
{ "productId": "clx...", "quantity": 1 }
```

### `PATCH /cart/items/[id]`

```json
{ "quantity": 2 }
```

### `DELETE /cart/items/[id]`

Remove line item.

---

## Checkout

### `POST /checkout/validate`

Real-time validation without creating order.

```json
{
  "email": "buyer@example.com",
  "shippingAddress": {
    "firstName": "Li",
    "lastName": "Wei",
    "line1": "123 Main St",
    "city": "Shanghai",
    "postalCode": "200000",
    "country": "CN",
    "phone": "+8613800138000"
  },
  "shippingMethod": "STANDARD",
  "couponCode": "WELCOME10"
}
```

Response:

```json
{
  "data": {
    "valid": true,
    "totals": {
      "subtotal": "258.00",
      "shipping": "15.00",
      "discount": "0.00",
      "tax": "0.00",
      "total": "273.00",
      "currency": "USD"
    },
    "taxNotice": "Import duties, VAT, and local taxes are the responsibility of the customer and may be charged upon delivery."
  }
}
```

### `POST /checkout/create-order`

**Headers:** `Idempotency-Key: <uuid-v4>` (required)

```json
{
  "email": "buyer@example.com",
  "shippingAddress": { ... },
  "billingAddress": { ... },
  "shippingMethod": "STANDARD" | "EXPRESS",
  "paymentMethod": "CREDIT_CARD" | "PAYPAL",
  "couponCode": "WELCOME10",
  "notes": ""
}
```

Response:

```json
{
  "data": {
    "orderId": "clx...",
    "orderNumber": "BP-20250618-A1B2",
    "total": "149.00",
    "payment": {
      "provider": "MIDTRANS",
      "snapToken": "xxx",           // Midtrans only
      "redirectUrl": "https://...", // PayPal approval URL
      "paymentId": "clx..."
    }
  }
}
```

### `GET /checkout/recover/[token]`

Restores abandoned checkout session; returns cart + partial form data.

---

## Payments

### `POST /payments/midtrans/snap-token`

Internal; called from `create-order`. Returns Snap token for client embed.

### `POST /payments/midtrans/webhook`

**No auth** — verified via SHA512 signature.

Headers: `X-Midtrans-Signature` (or body signature per Midtrans docs)

Body: Midtrans notification payload.

**Handler logic:**
1. Verify signature
2. Log `PaymentEvent`
3. If `transaction_status` ∈ `capture, settlement` → mark PAID (idempotent)
4. If `deny, expire, cancel` → mark FAILED
5. Return `200 OK` immediately

### `POST /payments/paypal/create-order`

Creates PayPal order; returns `approvalUrl`.

### `POST /payments/paypal/capture`

```json
{ "paypalOrderId": "xxx", "paymentId": "clx..." }
```

### `POST /payments/paypal/webhook`

Verify via PayPal webhook ID + cert chain.

Events: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

### `POST /payments/retry`

**Headers:** `Idempotency-Key: <new-uuid>`

```json
{ "orderId": "clx...", "paymentMethod": "CREDIT_CARD" | "PAYPAL" }
```

Creates new `Payment` record if order still `PENDING` or `PAYMENT_FAILED`. Reuses same order.

---

## Orders (Customer)

### `GET /orders`

Authenticated. Paginated order history.

### `GET /orders/[id]`

Order detail + payment status + tracking.

---

## Addresses

### `GET /addresses` | `POST /addresses` | `PATCH /addresses/[id]` | `DELETE /addresses/[id]`

Standard CRUD. `POST` body matches checkout address schema.

---

## Admin (requires `ADMIN` role)

### `GET /admin/analytics`

Query: `?from=2025-06-01&to=2025-06-18`

```json
{
  "data": {
    "revenue": "12450.00",
    "orders": 89,
    "conversionRate": 0.034,
    "topProducts": [{ "name": "...", "units": 42 }]
  }
}
```

### `POST /admin/products` | `PATCH /admin/products/[id]` | `DELETE /admin/products/[id]`

### `PATCH /admin/orders/[id]/status`

```json
{
  "status": "SHIPPED",
  "trackingNumber": "1Z999AA10123456784",
  "carrier": "UPS"
}
```

Triggers **Shipping Confirmation** email when `status` is `SHIPPED` and `trackingNumber` is provided.

### `GET /admin/shipping-rates` | `PATCH /admin/shipping-rates/[method]`

Admin configures Standard / Express flat rates (USD).

```json
{ "price": "15.00", "estimatedDaysMin": 10, "estimatedDaysMax": 21, "isActive": true }
```

### `POST /admin/refunds`

```json
{ "paymentId": "clx...", "amount": "49.00", "reason": "Customer request" }
```

---

## Upload

### `POST /upload`

Returns presigned R2 URL for admin product images.

```json
{ "filename": "pearl-1.jpg", "contentType": "image/jpeg" }
```

---

## Webhooks Security Checklist

| Gateway | Verification |
|---------|--------------|
| Midtrans | `SHA512(order_id + status_code + gross_amount + server_key)` |
| PayPal | Webhook ID + signature verification API |

## Idempotency

- Client generates UUID v4 per checkout submit / retry
- Server stores in Redis + DB unique constraint
- Duplicate key returns original response (200) without re-charging

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 10/min per IP |
| `/api/checkout/*` | 20/min per IP |
| `/api/payments/retry` | 5/min per order |
| Webhooks | No limit (signature required) |
