-- CreateEnum
CREATE TYPE "ProductPriceUnit" AS ENUM (
    'ITEM',
    'MILLIGRAM',
    'GRAM',
    'KILOGRAM',
    'MILLILITER',
    'CENTILITER',
    'LITER',
    'CUBIC_METER',
    'MILLIMETER',
    'CENTIMETER',
    'METER',
    'SQUARE_METER'
);

-- AlterTable
ALTER TABLE "product_families"
ADD COLUMN "price_unit" "ProductPriceUnit" NOT NULL DEFAULT 'ITEM';

-- CreateIndex
CREATE INDEX "product_families_price_unit_idx" ON "product_families"("price_unit");
