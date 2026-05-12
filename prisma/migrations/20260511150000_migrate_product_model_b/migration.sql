DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StockUnit') THEN
    CREATE TYPE "StockUnit" AS ENUM ('PIECE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductMediaRole') THEN
    CREATE TYPE "ProductMediaRole" AS ENUM ('GALLERY', 'TECHNICAL', 'CERTIFICATE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductAvailability') THEN
    CREATE TYPE "ProductAvailability" AS ENUM (
      'IN_STOCK',
      'ON_ORDER',
      'OUT_OF_STOCK',
      'DISCONTINUED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductInventoryVisibility') THEN
    CREATE TYPE "ProductInventoryVisibility" AS ENUM ('AUTO', 'ALWAYS', 'NEVER');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductPricingVisibility') THEN
    CREATE TYPE "ProductPricingVisibility" AS ENUM ('AUTO', 'ALWAYS', 'NEVER');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ProductKind' AND e.enumlabel = 'STANDARD'
  ) THEN
    EXECUTE 'CREATE TYPE "ProductKind_new" AS ENUM (''STANDARD'', ''VARIANT'', ''PACK'', ''SINGLE'')';
    EXECUTE 'ALTER TABLE "products" ALTER COLUMN "kind" DROP DEFAULT';
    EXECUTE 'ALTER TABLE "products" ALTER COLUMN "kind" TYPE "ProductKind_new" USING "kind"::text::"ProductKind_new"';
    EXECUTE 'DROP TYPE "ProductKind"';
    EXECUTE 'ALTER TYPE "ProductKind_new" RENAME TO "ProductKind"';
  END IF;
END $$;

DO $$
DECLARE
  long_sku_count integer;
BEGIN
  SELECT COUNT(*) INTO long_sku_count
  FROM "products"
  WHERE length("sku") > 100;

  IF long_sku_count > 0 THEN
    RAISE EXCEPTION 'Cannot migrate products.sku to VARCHAR(100): % SKU value(s) exceed 100 characters.', long_sku_count;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "product_legacy_backup" AS
SELECT
  "id" AS "product_id",
  "brand" AS "legacy_brand",
  "tags" AS "legacy_tags",
  "lifecycle"::text AS "legacy_lifecycle",
  "datasheet_media_id" AS "legacy_datasheet_media_id",
  "description" AS "legacy_description",
  "organization_id" AS "legacy_organization_id",
  CURRENT_TIMESTAMP AS "backed_up_at"
FROM "products"
WHERE
  "brand" IS NOT NULL
  OR COALESCE("tags", '') <> ''
  OR "lifecycle" IS NOT NULL
  OR "datasheet_media_id" IS NOT NULL
  OR "description" IS NOT NULL
  OR "organization_id" IS NOT NULL;

COMMENT ON TABLE "product_legacy_backup" IS
  'Snapshot of Product model A fields removed or transformed during Product model B migration.';

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_organization_id_fkey";
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_datasheet_media_id_fkey";

DROP INDEX IF EXISTS "products_kind_idx";
DROP INDEX IF EXISTS "products_organization_id_idx";
DROP INDEX IF EXISTS "products_brand_idx";
DROP INDEX IF EXISTS "products_lifecycle_idx";
DROP INDEX IF EXISTS "products_datasheet_media_id_idx";

DO $$
BEGIN
  IF to_regclass('product_media') IS NULL AND to_regclass('product_media_links') IS NOT NULL THEN
    ALTER TABLE "product_media_links" RENAME TO "product_media";
  END IF;
END $$;

ALTER TABLE "product_media" DROP CONSTRAINT IF EXISTS "product_media_links_pkey";
ALTER TABLE "product_media" DROP CONSTRAINT IF EXISTS "product_media_pkey";
ALTER TABLE "product_media" DROP CONSTRAINT IF EXISTS "product_media_links_product_id_fkey";
ALTER TABLE "product_media" DROP CONSTRAINT IF EXISTS "product_media_product_id_fkey";
ALTER TABLE "product_media" DROP CONSTRAINT IF EXISTS "product_media_links_media_id_fkey";
ALTER TABLE "product_media" DROP CONSTRAINT IF EXISTS "product_media_media_id_fkey";
ALTER TABLE "product_media" DROP CONSTRAINT IF EXISTS "product_media_product_id_media_id_key";

DROP INDEX IF EXISTS "product_media_links_media_id_idx";
DROP INDEX IF EXISTS "product_media_links_sort_order_idx";
DROP INDEX IF EXISTS "product_media_media_id_idx";
DROP INDEX IF EXISTS "product_media_sort_order_idx";
DROP INDEX IF EXISTS "product_media_product_id_idx";
DROP INDEX IF EXISTS "product_media_product_id_role_idx";
DROP INDEX IF EXISTS "product_media_product_id_sort_order_idx";

ALTER TABLE "product_media"
  ADD COLUMN IF NOT EXISTS "id" BIGINT,
  ADD COLUMN IF NOT EXISTS "role" "ProductMediaRole" NOT NULL DEFAULT 'GALLERY',
  ADD COLUMN IF NOT EXISTS "name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "alt_text" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE SEQUENCE IF NOT EXISTS "product_media_id_seq";
ALTER SEQUENCE "product_media_id_seq" OWNED BY "product_media"."id";
UPDATE "product_media"
SET "id" = nextval('"product_media_id_seq"')
WHERE "id" IS NULL;
SELECT setval(
  '"product_media_id_seq"',
  COALESCE((SELECT MAX("id") FROM "product_media"), 1),
  (SELECT COUNT(*) > 0 FROM "product_media")
);
ALTER TABLE "product_media"
  ALTER COLUMN "id" SET DEFAULT nextval('"product_media_id_seq"'),
  ALTER COLUMN "id" SET NOT NULL;

ALTER TABLE "product_media"
  ADD CONSTRAINT "product_media_pkey" PRIMARY KEY ("id"),
  ADD CONSTRAINT "product_media_product_id_media_id_key" UNIQUE ("product_id", "media_id"),
  ADD CONSTRAINT "product_media_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "product_media_media_id_fkey"
    FOREIGN KEY ("media_id") REFERENCES "media"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "product_media_product_id_idx" ON "product_media"("product_id");
CREATE INDEX "product_media_media_id_idx" ON "product_media"("media_id");
CREATE INDEX "product_media_product_id_role_idx" ON "product_media"("product_id", "role");
CREATE INDEX "product_media_product_id_sort_order_idx" ON "product_media"("product_id", "sort_order");

ALTER TABLE "products" RENAME COLUMN "organization_id" TO "brand_id";

ALTER TABLE "products"
  ADD COLUMN "display_name" VARCHAR(255),
  ADD COLUMN "richTextDescription" JSONB,
  ADD COLUMN "short_description" VARCHAR(500),
  ADD COLUMN "title_seo" VARCHAR(60),
  ADD COLUMN "guarantee_months" INTEGER DEFAULT 0,
  ADD COLUMN "visible_ecommerce" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "visible_vitrine" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "is_promoted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "is_new" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "stock_available" DECIMAL(12, 3) NOT NULL DEFAULT 0,
  ADD COLUMN "stock_alert_threshold" DECIMAL(12, 3) NOT NULL DEFAULT 0,
  ADD COLUMN "stock_unit" "StockUnit" NOT NULL DEFAULT 'PIECE',
  ADD COLUMN "stock_availability" "ProductAvailability" NOT NULL DEFAULT 'IN_STOCK',
  ADD COLUMN "stock_visibility" "ProductInventoryVisibility" NOT NULL DEFAULT 'AUTO',
  ADD COLUMN "base_price_ttc_tnd" DECIMAL(12, 3),
  ADD COLUMN "current_price_ttc_tnd" DECIMAL(12, 3),
  ADD COLUMN "vat_rate" DECIMAL(5, 3) NOT NULL DEFAULT 19.000,
  ADD COLUMN "price_visibility" "ProductPricingVisibility" NOT NULL DEFAULT 'AUTO',
  ADD COLUMN "created_by_id" BIGINT,
  ADD COLUMN "last_updated_by_id" BIGINT;

UPDATE "products"
SET "display_name" = "name";

UPDATE "products"
SET "richTextDescription" = jsonb_build_object(
  'type',
  'doc',
  'content',
  jsonb_build_array(
    jsonb_build_object(
      'type',
      'paragraph',
      'content',
      jsonb_build_array(
        jsonb_build_object('type', 'text', 'text', "description")
      )
    )
  )
)
WHERE "description" IS NOT NULL AND btrim("description") <> '';

INSERT INTO "product_media" (
  "product_id",
  "media_id",
  "role",
  "name",
  "sort_order"
)
SELECT
  "id",
  "datasheet_media_id",
  'TECHNICAL',
  'Fiche technique',
  0
FROM "products"
WHERE "datasheet_media_id" IS NOT NULL
ON CONFLICT ("product_id", "media_id") DO UPDATE
SET
  "role" = 'TECHNICAL',
  "name" = COALESCE("product_media"."name", EXCLUDED."name"),
  "updated_at" = CURRENT_TIMESTAMP;

ALTER TABLE "products"
  ALTER COLUMN "display_name" SET NOT NULL,
  ALTER COLUMN "sku" TYPE VARCHAR(100),
  ALTER COLUMN "kind" SET DEFAULT 'STANDARD';

ALTER TABLE "products"
  DROP COLUMN "description",
  DROP COLUMN "brand",
  DROP COLUMN "lifecycle",
  DROP COLUMN "tags",
  DROP COLUMN "datasheet_media_id";

ALTER TABLE "products"
  ADD CONSTRAINT "products_brand_id_fkey"
  FOREIGN KEY ("brand_id") REFERENCES "organizations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "products_brand_id_idx" ON "products"("brand_id");
CREATE INDEX "products_visible_ecommerce_idx" ON "products"("visible_ecommerce");
CREATE INDEX "products_visible_vitrine_idx" ON "products"("visible_vitrine");
CREATE INDEX "products_is_promoted_idx" ON "products"("is_promoted");
CREATE INDEX "products_is_featured_idx" ON "products"("is_featured");
