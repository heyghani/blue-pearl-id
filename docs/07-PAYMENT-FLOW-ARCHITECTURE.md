# Payment Flow Architecture

Production-grade payment design prioritizing **success rate**, **idempotency**, and **recoverability**.

---

## State Machine

### Order States

```mermaid
stateDiagram-v2
    [*] --> PENDING: create-order
    PENDING --> PAYMENT_PROCESSING: redirect to gateway
    PAYMENT_PROCESSING --> PAID: webhook/capture success
    PAYMENT_PROCESSING --> PAYMENT_FAILED: decline/expire
    PAYMENT_FAILED --> PAYMENT_PROCESSING: retry
    PENDING --> EXPIRED: 24h timeout job
    PAID --> PROCESSING: admin/fulfillment
    PROCESSING --> SHIPPED
    SHIPPED --> DELIVERED
    PAID --> REFUNDED: refund completed
    PENDING --> CANCELLED: user/admin cancel
```

### Payment States

```
PENDING → AUTHORIZED → CAPTURED
PENDING → FAILED
PENDING → EXPIRED
CAPTURED → REFUNDED | PARTIALLY_REFUNDED
```

---

## Midtrans Snap Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant FE as Next.js Frontend
    participant API as API /create-order
    participant DB as PostgreSQL
    participant MT as Midtrans Snap
    participant WH as Webhook Handler

    C->>FE: Complete checkout form
    FE->>API: POST /checkout/create-order<br/>Idempotency-Key
    API->>DB: BEGIN TX: reserve inventory,<br/>create Order PENDING, Payment PENDING
    API->>MT: POST /snap/v1/transactions
    MT-->>API: snapToken, redirect_url
    API->>DB: store snapToken, COMMIT
    API-->>FE: orderNumber, snapToken
    FE->>MT: Open Snap (popup/redirect)
    C->>MT: Enter card / 3DS
    MT-->>FE: onSuccess / onPending / onError
    MT->>WH: POST notification (async)
    WH->>WH: Verify SHA512 signature
    WH->>DB: Log PaymentEvent
    WH->>DB: Update Payment + Order (idempotent)
    WH-->>MT: 200 OK
    FE->>API: Poll GET /orders/{id} (fallback)
    FE->>C: Redirect /confirmation or /failed
```

### Midtrans Status Mapping

| Midtrans Status | Payment Status | Order Status |
|-----------------|----------------|--------------|
| `capture` (fraud accept) | CAPTURED | PAID |
| `settlement` | CAPTURED | PAID |
| `pending` | PENDING | PAYMENT_PROCESSING |
| `deny` | FAILED | PAYMENT_FAILED |
| `expire` | EXPIRED | EXPIRED |
| `cancel` | CANCELLED | CANCELLED |

---

## PayPal Checkout Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant FE as Frontend
    participant API as API
    participant DB as PostgreSQL
    participant PP as PayPal

    C->>FE: Select PayPal
    FE->>API: POST /checkout/create-order
    API->>DB: Order PENDING + Payment PENDING
    API->>PP: Create Order (CAPTURE intent)
    PP-->>API: paypalOrderId, approvalUrl
    API-->>FE: approvalUrl
    FE->>PP: Redirect customer to PayPal
    C->>PP: Approve payment
    PP-->>FE: Return URL with token
    FE->>API: POST /payments/paypal/capture
    API->>PP: Capture payment
    PP-->>API: CAPTURE.COMPLETED
    API->>DB: Payment CAPTURED, Order PAID
  par Webhook backup
    PP->>API: Webhook PAYMENT.CAPTURE.COMPLETED
    API->>DB: Idempotent status sync
  end
    API-->>FE: success
    FE->>C: /confirmation
```

---

## Duplicate Transaction Prevention

```
┌─────────────────────────────────────────────────┐
│ 1. Client sends Idempotency-Key (UUID)          │
│ 2. Redis SETNX key → 24h TTL                    │
│ 3. DB unique on Payment.idempotencyKey          │
│ 4. If duplicate: return cached response         │
│ 5. Order.idempotencyKey prevents double orders  │
└─────────────────────────────────────────────────┘
```

**Rule:** Never create a second `Order` on retry — only new `Payment` linked to same `Order`.

---

## Webhook Processing Pipeline

```mermaid
flowchart LR
    A[Receive Webhook] --> B{Valid Signature?}
    B -->|No| C[401 + Log]
    B -->|Yes| D[Insert PaymentEvent]
    D --> E{Already CAPTURED?}
    E -->|Yes| F[200 OK - noop]
    E -->|No| G[BEGIN DB Transaction]
    G --> H[Update Payment status]
    H --> I[Update Order status]
    I --> J[Decrement inventory if PAID]
    J --> K[COMMIT]
    K --> L[Queue confirmation email]
    L --> F
```

### Webhook Reliability

| Mechanism | Detail |
|-----------|--------|
| Immediate 200 | Acknowledge before heavy work (or use queue) |
| Event log | All payloads in `PaymentEvent` before processing |
| Idempotent updates | `WHERE status NOT IN (CAPTURED, REFUNDED)` |
| Polling fallback | Cron every 5m: `PENDING` payments > 10min → query gateway status |
| Replay | Admin tool to reprocess `PaymentEvent` where `processed=false` |

---

## Payment Retry Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant FE as /payment/failed
    participant API as /payments/retry
    participant DB as DB

    C->>FE: Lands on failure page
    FE->>C: Show order #, amount, Try Again
    C->>FE: Select method + retry
    FE->>API: POST /payments/retry<br/>NEW Idempotency-Key
    API->>DB: Verify Order ∈ {PENDING, PAYMENT_FAILED}
    API->>DB: Create new Payment row
    API->>API: Initiate gateway flow
    API-->>FE: snapToken or PayPal URL
```

**UX rules:**
- Show "You were not charged" unless `CAPTURED`
- Allow switching method (Card → PayPal)
- Max 3 retries per order per hour (rate limit)

---

## Abandoned Checkout Recovery

1. On checkout step progress → upsert `AbandonedCheckout` with email + cart snapshot
2. Cron after 1 hour: if order still `PENDING` and no `CAPTURED` payment → send Resend email
3. Recovery link: `/checkout/recover/[token]` restores cart + pre-filled forms
4. Track `recoveredAt` for analytics

---

## Refund Flow

```
Admin initiates refund
  → API calls Midtrans/PayPal refund endpoint
  → Create Refund record (PENDING)
  → Webhook/poll confirms
  → Payment → REFUNDED, Order → REFUNDED
  → Restore inventory (optional business rule)
  → AuditLog entry

---

## Shipping Fulfillment Flow

```mermaid
sequenceDiagram
    participant Admin
    participant API as Admin API
    participant DB as PostgreSQL
    participant Email as Resend

    Admin->>API: PATCH /admin/orders/{id}/status<br/>SHIPPED + trackingNumber
    API->>DB: Update order, set shippedAt
    API->>Email: shipping-confirmation.tsx<br/>to customer email
    Email-->>Admin: 200 OK
```

- MVP: admin manually enters tracking number (any carrier format)
- Future: DHL, FedEx, UPS, SF Express API integration for labels + auto-tracking
```

---

## Fraud Prevention (MVP Basics)

| Control | Implementation |
|---------|----------------|
| Velocity | Max 3 failed payments per email/hour |
| Amount sanity | Reject if client total ≠ server calculation |
| AVS/CVV | Delegated to Midtrans/PayPal |
| 3DS | Enabled via Midtrans Snap defaults |
| IP logging | Store in `AuditLog` on payment create |
| Blocklist | Optional email/IP table post-MVP |

---

## Payment Logs Schema Usage

Every gateway interaction writes to `PaymentEvent`:

```json
{
  "eventType": "webhook.notification",
  "provider": "MIDTRANS",
  "payload": { "transaction_status": "settlement", ... },
  "signature": "sha512...",
  "processed": true
}
```

**Retention:** 7 years for financial audit (configurable export to cold storage).

---

## Database Tables (Payment Domain)

| Table | Purpose |
|-------|---------|
| `orders` | Commercial record; status source of truth for fulfillment |
| `payments` | One order may have multiple payment attempts |
| `payment_events` | Immutable webhook/API audit trail |
| `refunds` | Refund lifecycle |
| `abandoned_checkouts` | Recovery marketing |
| `audit_logs` | Admin actions on refunds/status |

---

## API Structure (Payment Module)

```
lib/payments/
├── midtrans.ts          # Snap token, status API, refund
├── paypal.ts            # Create, capture, refund
├── idempotency.ts       # Redis + DB helper
├── webhook-verify.ts    # Signature validators
├── order-sync.ts        # Central status transition logic
└── inventory.ts         # Reserve/release/decrement
```

**Single entry point:** `PaymentService.completePayment(paymentId, gatewayPayload)` — all webhooks and capture callbacks use this to avoid divergent logic.
