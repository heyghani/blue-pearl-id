-- CreateTable
CREATE TABLE "shipping_quantity_tiers" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "standardPrice" DECIMAL(12,2) NOT NULL,
    "expressPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_quantity_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipping_quantity_tiers_quantity_key" ON "shipping_quantity_tiers"("quantity");

-- CreateIndex
CREATE INDEX "shipping_quantity_tiers_isActive_sortOrder_idx" ON "shipping_quantity_tiers"("isActive", "sortOrder");

-- Seed default pack sizes using current Standard/Express rates as starting prices
INSERT INTO "shipping_quantity_tiers" ("id", "quantity", "isActive", "sortOrder", "standardPrice", "expressPrice", "createdAt", "updatedAt")
VALUES
  (
    'qty-pack-3',
    3,
    true,
    0,
    COALESCE((SELECT "price" FROM "shipping_rates" WHERE "method" = 'STANDARD' LIMIT 1), 15),
    COALESCE((SELECT "price" FROM "shipping_rates" WHERE "method" = 'EXPRESS' LIMIT 1), 35),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'qty-pack-5',
    5,
    true,
    1,
    COALESCE((SELECT "price" FROM "shipping_rates" WHERE "method" = 'STANDARD' LIMIT 1), 15),
    COALESCE((SELECT "price" FROM "shipping_rates" WHERE "method" = 'EXPRESS' LIMIT 1), 35),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'qty-pack-10',
    10,
    true,
    2,
    COALESCE((SELECT "price" FROM "shipping_rates" WHERE "method" = 'STANDARD' LIMIT 1), 15),
    COALESCE((SELECT "price" FROM "shipping_rates" WHERE "method" = 'EXPRESS' LIMIT 1), 35),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'qty-pack-20',
    20,
    true,
    3,
    COALESCE((SELECT "price" FROM "shipping_rates" WHERE "method" = 'STANDARD' LIMIT 1), 15),
    COALESCE((SELECT "price" FROM "shipping_rates" WHERE "method" = 'EXPRESS' LIMIT 1), 35),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'qty-pack-50',
    50,
    true,
    4,
    COALESCE((SELECT "price" FROM "shipping_rates" WHERE "method" = 'STANDARD' LIMIT 1), 15),
    COALESCE((SELECT "price" FROM "shipping_rates" WHERE "method" = 'EXPRESS' LIMIT 1), 35),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("quantity") DO NOTHING;
