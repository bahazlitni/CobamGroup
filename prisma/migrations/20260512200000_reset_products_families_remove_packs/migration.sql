-- Reset product catalog data and remove pack support.
-- This intentionally clears products, families, and product-owned dependent rows.

BEGIN;

DROP TABLE IF EXISTS "product_pack_lines";

DELETE FROM "product_family_members";
UPDATE "product_families" SET "default_product_id" = NULL;
DELETE FROM "product_families";

DELETE FROM "product_attributes";
DELETE FROM "product_media";
DELETE FROM "product_subcategory_links";
DELETE FROM "products";

ALTER SEQUENCE IF EXISTS "product_families_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "product_attributes_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "product_media_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "products_id_seq" RESTART WITH 1;

ALTER TABLE "products" ALTER COLUMN "kind" DROP DEFAULT;
ALTER TYPE "ProductKind" RENAME TO "ProductKind_old";
CREATE TYPE "ProductKind" AS ENUM ('STANDARD', 'VARIANT', 'SINGLE');
ALTER TABLE "products"
  ALTER COLUMN "kind" TYPE "ProductKind"
  USING "kind"::text::"ProductKind";
ALTER TABLE "products" ALTER COLUMN "kind" SET DEFAULT 'STANDARD';
DROP TYPE "ProductKind_old";

COMMIT;
