-- Move discontinued products out of stock availability and into product lifecycle.

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "lifecycle" "ProductLifecycle" NOT NULL DEFAULT 'ACTIVE';

UPDATE "products"
SET "lifecycle" = CASE
  WHEN "stock_availability"::text = 'DISCONTINUED' THEN 'DISCONTINUED'::"ProductLifecycle"
  WHEN COALESCE("visible_ecommerce", false) OR COALESCE("visible_vitrine", false) THEN 'ACTIVE'::"ProductLifecycle"
  ELSE 'DRAFT'::"ProductLifecycle"
END;

UPDATE "products"
SET
  "visible_ecommerce" = false,
  "visible_vitrine" = false,
  "stock_availability" = 'OUT_OF_STOCK'::"ProductAvailability"
WHERE "lifecycle" = 'DISCONTINUED'::"ProductLifecycle";

ALTER TABLE "products" ALTER COLUMN "stock_availability" DROP DEFAULT;

CREATE TYPE "ProductAvailability_new" AS ENUM (
  'IN_STOCK',
  'ON_ORDER',
  'OUT_OF_STOCK'
);

ALTER TABLE "products"
  ALTER COLUMN "stock_availability" TYPE "ProductAvailability_new"
  USING (
    CASE
      WHEN "stock_availability"::text = 'DISCONTINUED' THEN 'OUT_OF_STOCK'
      ELSE "stock_availability"::text
    END
  )::"ProductAvailability_new";

DROP TYPE "ProductAvailability";
ALTER TYPE "ProductAvailability_new" RENAME TO "ProductAvailability";

ALTER TABLE "products"
  ALTER COLUMN "stock_availability" SET DEFAULT 'IN_STOCK'::"ProductAvailability";

CREATE INDEX IF NOT EXISTS "products_lifecycle_idx" ON "products"("lifecycle");
