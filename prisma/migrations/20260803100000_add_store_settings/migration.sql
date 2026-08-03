-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL,
    "defaultBasePrice" DECIMAL(12,2) NOT NULL DEFAULT 80,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- Seed singleton row with current form default
INSERT INTO "store_settings" ("id", "defaultBasePrice", "createdAt", "updatedAt")
VALUES ('default', 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
