-- AlterTable
ALTER TABLE "products" ADD COLUMN "isHalloween" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "products_isActive_isHalloween_idx" ON "products"("isActive", "isHalloween");
