-- AlterTable
ALTER TABLE "order_items" ADD COLUMN "variantId" TEXT;
ALTER TABLE "order_items" ADD COLUMN "variantLabel" TEXT;
ALTER TABLE "order_items" ADD COLUMN "optionsJson" JSONB;
ALTER TABLE "order_items" ADD COLUMN "imageUrl" TEXT;
