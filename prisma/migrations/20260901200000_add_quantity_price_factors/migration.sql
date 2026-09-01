-- AlterTable
ALTER TABLE "shipping_quantity_tiers" ADD COLUMN "priceFactor" DECIMAL(8,4) NOT NULL DEFAULT 1;

-- Seed default quantity discount factors
UPDATE "shipping_quantity_tiers" SET "priceFactor" = 0.9889 WHERE "quantity" = 3;
UPDATE "shipping_quantity_tiers" SET "priceFactor" = 0.9778 WHERE "quantity" = 5;
UPDATE "shipping_quantity_tiers" SET "priceFactor" = 0.9500 WHERE "quantity" = 10;
UPDATE "shipping_quantity_tiers" SET "priceFactor" = 0.9444 WHERE "quantity" = 20;
UPDATE "shipping_quantity_tiers" SET "priceFactor" = 0.9278 WHERE "quantity" = 50;
