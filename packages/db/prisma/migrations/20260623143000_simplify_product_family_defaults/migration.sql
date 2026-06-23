-- Product families now derive their default variant from the first member sort order.
-- Family subtitles are removed from the product-family model.

DROP INDEX IF EXISTS "product_families_default_product_id_idx";

ALTER TABLE "product_families"
  DROP CONSTRAINT IF EXISTS "product_families_default_product_id_fkey";

ALTER TABLE "product_families"
  DROP COLUMN IF EXISTS "default_product_id",
  DROP COLUMN IF EXISTS "subtitle";
