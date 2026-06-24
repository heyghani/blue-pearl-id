-- Merge duplicate guest carts that share the same session_id before adding uniqueness.
WITH ranked AS (
  SELECT
    id,
    session_id,
    ROW_NUMBER() OVER (
      PARTITION BY session_id
      ORDER BY updated_at DESC, created_at DESC
    ) AS row_number
  FROM carts
  WHERE session_id IS NOT NULL AND user_id IS NULL
),
keepers AS (
  SELECT id AS keep_id, session_id
  FROM ranked
  WHERE row_number = 1
),
dupes AS (
  SELECT r.id AS dupe_id, k.keep_id
  FROM ranked r
  JOIN keepers k ON k.session_id = r.session_id
  WHERE r.row_number > 1
)
UPDATE cart_items AS ci
SET cart_id = d.keep_id
FROM dupes d
WHERE ci.cart_id = d.dupe_id;

WITH ranked AS (
  SELECT
    id,
    session_id,
    ROW_NUMBER() OVER (
      PARTITION BY session_id
      ORDER BY updated_at DESC, created_at DESC
    ) AS row_number
  FROM carts
  WHERE session_id IS NOT NULL AND user_id IS NULL
)
DELETE FROM carts
WHERE id IN (
  SELECT id FROM ranked WHERE row_number > 1
);

-- Collapse duplicate line items created by the merge above.
WITH merged AS (
  SELECT
    MIN(id) AS keep_id,
    cart_id,
    product_id,
    variant_key,
    SUM(quantity)::int AS total_quantity
  FROM cart_items
  GROUP BY cart_id, product_id, variant_key
  HAVING COUNT(*) > 1
)
UPDATE cart_items AS ci
SET quantity = m.total_quantity
FROM merged m
WHERE ci.id = m.keep_id;

WITH merged AS (
  SELECT
    MIN(id) AS keep_id,
    cart_id,
    product_id,
    variant_key
  FROM cart_items
  GROUP BY cart_id, product_id, variant_key
  HAVING COUNT(*) > 1
)
DELETE FROM cart_items AS ci
USING merged m
WHERE ci.cart_id = m.cart_id
  AND ci.product_id = m.product_id
  AND ci.variant_key = m.variant_key
  AND ci.id <> m.keep_id;

CREATE UNIQUE INDEX "carts_session_id_key" ON "carts"("session_id");
