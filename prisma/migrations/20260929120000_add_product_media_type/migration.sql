-- CreateEnum
CREATE TYPE "ProductMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN "mediaType" "ProductMediaType" NOT NULL DEFAULT 'IMAGE';
