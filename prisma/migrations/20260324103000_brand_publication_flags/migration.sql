DO $$
BEGIN
  CREATE TYPE "BrandShowcasePlacement" AS ENUM ('NONE', 'REFERENCE', 'PARTNER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "product_brands"
  ADD COLUMN IF NOT EXISTS "showcase_placement" "BrandShowcasePlacement" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "is_product_brand" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "product_brands_showcase_placement_idx"
  ON "product_brands"("showcase_placement");

CREATE INDEX IF NOT EXISTS "product_brands_is_product_brand_idx"
  ON "product_brands"("is_product_brand");
