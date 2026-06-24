-- Merge duplicate guest carts that share the same sessionId before adding uniqueness.
WITH ranked AS (
  SELECT
    id,
    "sessionId",
    ROW_NUMBER() OVER (
      PARTITION BY "sessionId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC
    ) AS row_number
  FROM "carts"
  WHERE "sessionId" IS NOT NULL AND "userId" IS NULL
),
keepers AS (
  SELECT id AS keep_id, "sessionId"
  FROM ranked
  WHERE row_number = 1
),
dupes AS (
  SELECT r.id AS dupe_id, k.keep_id
  FROM ranked r
  JOIN keepers k ON k."sessionId" = r."sessionId"
  WHERE r.row_number > 1
)
UPDATE "cart_items" AS ci
SET "cartId" = d.keep_id
FROM dupes d
WHERE ci."cartId" = d.dupe_id;

WITH ranked AS (
  SELECT
    id,
    "sessionId",
    ROW_NUMBER() OVER (
      PARTITION BY "sessionId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC
    ) AS row_number
  FROM "carts"
  WHERE "sessionId" IS NOT NULL AND "userId" IS NULL
)
DELETE FROM "carts"
WHERE id IN (
  SELECT id FROM ranked WHERE row_number > 1
);

-- Collapse duplicate line items created by the merge above.
WITH merged AS (
  SELECT
    MIN(id) AS keep_id,
    "cartId",
    "productId",
    "variantKey",
    SUM(quantity)::int AS total_quantity
  FROM "cart_items"
  GROUP BY "cartId", "productId", "variantKey"
  HAVING COUNT(*) > 1
)
UPDATE "cart_items" AS ci
SET quantity = m.total_quantity
FROM merged m
WHERE ci.id = m.keep_id;

WITH merged AS (
  SELECT
    MIN(id) AS keep_id,
    "cartId",
    "productId",
    "variantKey"
  FROM "cart_items"
  GROUP BY "cartId", "productId", "variantKey"
  HAVING COUNT(*) > 1
)
DELETE FROM "cart_items" AS ci
USING merged m
WHERE ci."cartId" = m."cartId"
  AND ci."productId" = m."productId"
  AND ci."variantKey" = m."variantKey"
  AND ci.id <> m.keep_id;

CREATE UNIQUE INDEX "carts_sessionId_key" ON "carts"("sessionId");
