# Database Schema (Prisma)

Complete schema for `prisma/schema.prisma`. Includes relationships, indexes, constraints, and audit fields.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ───────────────────────────────────────────────────────────────────

enum UserRole {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING           // Created, awaiting payment
  PAYMENT_PROCESSING
  PAID
  PROCESSING        // Fulfillment started
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
  PAYMENT_FAILED
  EXPIRED
}

enum PaymentProvider {
  MIDTRANS
  PAYPAL
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
  EXPIRED
  CANCELLED
}

enum PaymentMethod {
  CREDIT_CARD
  PAYPAL
}

enum AddressType {
  SHIPPING
  BILLING
}

enum CouponType {
  PERCENTAGE
  FIXED_AMOUNT
}

enum ShippingMethodType {
  STANDARD
  EXPRESS
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  PAYMENT
  REFUND
  STATUS_CHANGE
}

// ─── Auth (Auth.js compatible) ─────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String?
  name          String?
  phone         String?
  role          UserRole  @default(CUSTOMER)
  image         String?

  accounts      Account[]
  sessions      Session[]
  addresses     Address[]
  carts         Cart[]
  orders        Order[]
  reviews       Review[]
  auditLogs     AuditLog[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  @@index([email])
  @@index([role])
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ─── Catalog ─────────────────────────────────────────────────────────────────

model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?    @db.Text
  imageUrl    String?
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]
  sortOrder   Int        @default(0)
  isActive    Boolean    @default(true)

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([slug])
  @@index([parentId])
  @@map("categories")
}

model Product {
  id              String         @id @default(cuid())
  name            String
  slug            String         @unique
  description     String?        @db.Text
  shortDescription String?       @db.VarChar(500)
  sku             String         @unique
  price           Decimal        @db.Decimal(12, 2)
  compareAtPrice  Decimal?       @db.Decimal(12, 2)
  currency        String         @default("USD") @db.VarChar(3)
  categoryId      String?
  category        Category?      @relation(fields: [categoryId], references: [id])
  isActive        Boolean        @default(true)
  isFeatured      Boolean        @default(false)
  metadata        Json?          // specs, SEO overrides

  images          ProductImage[]
  inventory       Inventory?
  cartItems       CartItem[]
  orderItems      OrderItem[]
  reviews         Review[]

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  deletedAt       DateTime?

  @@index([slug])
  @@index([categoryId])
  @@index([isActive, isFeatured])
  @@index([price])
  @@map("products")
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  sortOrder Int      @default(0)
  isPrimary Boolean  @default(false)

  createdAt DateTime @default(now())

  @@index([productId])
  @@map("product_images")
}

model Inventory {
  id                String   @id @default(cuid())
  productId         String   @unique
  product           Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity          Int      @default(0)
  reservedQuantity  Int      @default(0) // Held during PENDING checkout
  lowStockThreshold Int      @default(5)
  trackInventory    Boolean  @default(true)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("inventory")
}

model Review {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  rating    Int      // 1-5
  title     String?
  body      String?  @db.Text
  isApproved Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([productId, userId])
  @@index([productId, isApproved])
  @@map("reviews")
}

// ─── Cart ────────────────────────────────────────────────────────────────────

model Cart {
  id        String     @id @default(cuid())
  userId    String?
  user      User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessionId String?    // Guest cart identifier
  items     CartItem[]

  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  expiresAt DateTime?

  @@unique([userId])
  @@index([sessionId])
  @@map("carts")
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int      @default(1) @db.SmallInt

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([cartId, productId])
  @@index([cartId])
  @@map("cart_items")
}

// ─── Shipping ────────────────────────────────────────────────────────────────

model ShippingRate {
  id               String             @id @default(cuid())
  method           ShippingMethodType @unique
  name             String             // "Standard Shipping"
  description      String?            @db.Text
  price            Decimal            @db.Decimal(12, 2)
  currency         String             @default("USD") @db.VarChar(3)
  estimatedDaysMin Int?
  estimatedDaysMax Int?
  isActive         Boolean            @default(true)
  sortOrder        Int                @default(0)

  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  @@map("shipping_rates")
}

// ─── Orders & Payments ───────────────────────────────────────────────────────

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique // Human-readable: BP-20250618-XXXX
  userId          String?
  user            User?       @relation(fields: [userId], references: [id])
  guestEmail      String?
  status          OrderStatus @default(PENDING)

  subtotal        Decimal     @db.Decimal(12, 2)
  shippingAmount  Decimal     @db.Decimal(12, 2) @default(0)
  shippingMethod  ShippingMethodType?
  shippingMethodName String?  // Snapshot: "Express Shipping"
  discountAmount  Decimal     @db.Decimal(12, 2) @default(0)
  taxAmount       Decimal     @db.Decimal(12, 2) @default(0) // Always 0 at MVP
  total           Decimal     @db.Decimal(12, 2)
  currency        String      @default("USD") @db.VarChar(3)

  shippingAddress Json        // Snapshot at order time
  billingAddress  Json?
  trackingNumber  String?     // Admin-entered at shipment
  carrier         String?     // Optional label, e.g. "DHL" (future API use)

  couponId        String?
  coupon          Coupon?     @relation(fields: [couponId], references: [id])
  couponCode      String?     // Denormalized snapshot

  idempotencyKey  String?     @unique
  notes           String?     @db.Text

  items           OrderItem[]
  payments        Payment[]
  addresses       Address[]   @relation("OrderAddresses")

  paidAt          DateTime?
  shippedAt       DateTime?
  deliveredAt     DateTime?
  cancelledAt     DateTime?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([userId])
  @@index([guestEmail])
  @@index([status])
  @@index([orderNumber])
  @@index([createdAt])
  @@map("orders")
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  productName String   // Snapshot
  productSku  String
  unitPrice   Decimal  @db.Decimal(12, 2)
  quantity    Int
  totalPrice  Decimal  @db.Decimal(12, 2)

  createdAt   DateTime @default(now())

  @@index([orderId])
  @@map("order_items")
}

model Payment {
  id                String          @id @default(cuid())
  orderId           String
  order             Order           @relation(fields: [orderId], references: [id])
  provider          PaymentProvider
  method            PaymentMethod
  status            PaymentStatus   @default(PENDING)

  amount            Decimal         @db.Decimal(12, 2)
  currency          String          @default("USD") @db.VarChar(3)

  // Gateway references
  externalId        String?         // Midtrans order_id / PayPal order ID
  transactionId     String?         // Final capture transaction ID
  snapToken         String?         @db.Text
  redirectUrl       String?         @db.Text

  idempotencyKey    String          @unique
  failureCode       String?
  failureMessage    String?         @db.Text
  rawResponse       Json?

  events            PaymentEvent[]
  refunds           Refund[]

  authorizedAt      DateTime?
  capturedAt        DateTime?
  failedAt          DateTime?
  expiredAt         DateTime?

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([orderId])
  @@index([externalId])
  @@index([transactionId])
  @@index([status])
  @@map("payments")
}

model PaymentEvent {
  id          String   @id @default(cuid())
  paymentId   String
  payment     Payment  @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  eventType   String   // e.g. webhook.settlement, capture.completed
  provider    PaymentProvider
  payload     Json
  signature   String?
  processed   Boolean  @default(false)

  createdAt   DateTime @default(now())

  @@index([paymentId])
  @@index([eventType])
  @@index([createdAt])
  @@map("payment_events")
}

model Refund {
  id              String   @id @default(cuid())
  paymentId       String
  payment         Payment  @relation(fields: [paymentId], references: [id])
  amount          Decimal  @db.Decimal(12, 2)
  reason          String?  @db.Text
  externalRefundId String?
  status          String   @default("PENDING") // PENDING, COMPLETED, FAILED
  initiatedBy     String?  // admin userId

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([paymentId])
  @@map("refunds")
}

// ─── Addresses & Coupons ─────────────────────────────────────────────────────

model Address {
  id         String      @id @default(cuid())
  userId     String
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  type       AddressType @default(SHIPPING)
  label      String?     // "Home", "Office"
  firstName  String
  lastName   String
  company    String?
  line1      String
  line2      String?
  city       String
  state      String?
  postalCode String
  country    String      @db.VarChar(2) // ISO 3166-1 alpha-2
  phone      String?
  isDefault  Boolean     @default(false)

  orders     Order[]     @relation("OrderAddresses")

  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  @@index([userId])
  @@map("addresses")
}

model Coupon {
  id              String     @id @default(cuid())
  code            String     @unique
  type            CouponType
  value           Decimal    @db.Decimal(12, 2)
  minOrderAmount  Decimal?   @db.Decimal(12, 2)
  maxUses         Int?
  usedCount       Int        @default(0)
  startsAt        DateTime?
  expiresAt       DateTime?
  isActive        Boolean    @default(true)

  orders          Order[]

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@index([code, isActive])
  @@map("coupons")
}

// ─── Audit ───────────────────────────────────────────────────────────────────

model AuditLog {
  id         String      @id @default(cuid())
  userId     String?
  user       User?       @relation(fields: [userId], references: [id])
  action     AuditAction
  entityType String      // Order, Product, Payment, etc.
  entityId   String
  metadata   Json?
  ipAddress  String?
  userAgent  String?     @db.Text

  createdAt  DateTime    @default(now())

  @@index([entityType, entityId])
  @@index([userId])
  @@index([createdAt])
  @@map("audit_logs")
}

// ─── Abandoned Checkout ──────────────────────────────────────────────────────

model AbandonedCheckout {
  id           String   @id @default(cuid())
  email        String
  orderId      String?  @unique
  cartSnapshot Json
  step         String   // customer, shipping, payment
  recoveryToken String  @unique @default(cuid())
  emailSentAt  DateTime?
  recoveredAt  DateTime?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([email])
  @@index([recoveryToken])
  @@map("abandoned_checkouts")
}
```

## Entity Relationship Summary

```
User 1──* Order, Cart, Address, Review
Category 1──* Product
Product 1──1 Inventory, 1──* ProductImage, OrderItem, CartItem
Order 1──* OrderItem, Payment
Payment 1──* PaymentEvent, Refund
Coupon 1──* Order
ShippingRate — standalone config (STANDARD / EXPRESS)
```

## MVP Business Rules

| Field | Rule |
|-------|------|
| `Product.currency` | Always `USD` |
| `Order.currency` | Always `USD` |
| `Order.taxAmount` | Always `0` (no auto VAT/import tax) |
| `ShippingRate` | Two rows seeded: STANDARD, EXPRESS; admin edits `price` |
| `Order.trackingNumber` | Set by admin when status → SHIPPED; triggers email |

## Key Constraints

- **Inventory:** `reservedQuantity + sold ≤ quantity` enforced in application transaction
- **Order totals:** Immutable after `PAID` (adjustments via refund only)
- **Idempotency:** `Payment.idempotencyKey` and `Order.idempotencyKey` prevent duplicate charges
- **Soft delete:** `User.deletedAt`, `Product.deletedAt` for GDPR retention

## Recommended Indexes (beyond schema)

- Full-text search: `CREATE INDEX products_search_idx ON products USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));`
- Partial index on active products: `WHERE deleted_at IS NULL AND is_active = true`
