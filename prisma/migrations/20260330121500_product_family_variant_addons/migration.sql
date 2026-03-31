ALTER TABLE "product_families"
ADD COLUMN "commercial_mode" "ProductCommercialMode" NOT NULL DEFAULT 'REFERENCE_ONLY',
ADD COLUMN "price_visibility" "ProductPriceVisibility" NOT NULL DEFAULT 'HIDDEN',
ADD COLUMN "currency_code" CHAR(3) NOT NULL DEFAULT 'TND',
ADD COLUMN "base_price_amount" DECIMAL(12, 2),
ADD COLUMN "current_price_amount" DECIMAL(12, 2);

ALTER TABLE "product_variants"
RENAME COLUMN "slug" TO "slug_override";

ALTER TABLE "product_variants"
RENAME COLUMN "title" TO "name_override";

ALTER TABLE "product_variants"
RENAME COLUMN "subtitle" TO "subtitle_override";

ALTER TABLE "product_variants"
RENAME COLUMN "description" TO "description_override";

ALTER TABLE "product_variants"
RENAME COLUMN "lifecycle_status" TO "lifecycle_status_override";

ALTER TABLE "product_variants"
RENAME COLUMN "visibility" TO "visibility_override";

ALTER TABLE "product_variants"
RENAME COLUMN "commercial_mode" TO "commercial_mode_override";

ALTER TABLE "product_variants"
RENAME COLUMN "price_visibility" TO "price_visibility_override";

ALTER TABLE "product_variants"
RENAME COLUMN "is_promoted" TO "is_promoted_override";

ALTER TABLE "product_variants"
RENAME COLUMN "currency_code" TO "currency_code_override";

ALTER TABLE "product_variants"
RENAME COLUMN "base_price_amount" TO "base_price_amount_override";

ALTER TABLE "product_variants"
RENAME COLUMN "current_price_amount" TO "current_price_amount_override";

ALTER TABLE "product_variants"
ALTER COLUMN "slug_override" DROP NOT NULL,
ALTER COLUMN "name_override" DROP NOT NULL,
ALTER COLUMN "lifecycle_status_override" DROP NOT NULL,
ALTER COLUMN "visibility_override" DROP NOT NULL,
ALTER COLUMN "commercial_mode_override" DROP NOT NULL,
ALTER COLUMN "price_visibility_override" DROP NOT NULL,
ALTER COLUMN "is_promoted_override" DROP NOT NULL,
ALTER COLUMN "currency_code_override" DROP NOT NULL;

WITH default_variant_values AS (
  SELECT DISTINCT ON (family_id)
    family_id,
    lifecycle_status_override,
    visibility_override,
    commercial_mode_override,
    price_visibility_override,
    is_promoted_override,
    currency_code_override,
    base_price_amount_override,
    current_price_amount_override
  FROM "product_variants"
  ORDER BY family_id, sort_order ASC, id ASC
)
UPDATE "product_families" AS family
SET
  commercial_mode = COALESCE(default_variant_values.commercial_mode_override, 'REFERENCE_ONLY'),
  price_visibility = COALESCE(default_variant_values.price_visibility_override, 'HIDDEN'),
  currency_code = COALESCE(default_variant_values.currency_code_override, 'TND'),
  base_price_amount = default_variant_values.base_price_amount_override,
  current_price_amount = default_variant_values.current_price_amount_override
FROM default_variant_values
WHERE family.id = default_variant_values.family_id;

UPDATE "product_variants" AS variant
SET slug_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.slug_override = family.slug;

UPDATE "product_variants" AS variant
SET name_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.name_override = family.name;

UPDATE "product_variants" AS variant
SET subtitle_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.subtitle_override IS NOT DISTINCT FROM family.subtitle;

UPDATE "product_variants" AS variant
SET description_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.description_override IS NOT DISTINCT FROM family.description;

UPDATE "product_variants" AS variant
SET lifecycle_status_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.lifecycle_status_override IS NOT DISTINCT FROM family.lifecycle_status;

UPDATE "product_variants" AS variant
SET visibility_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.visibility_override IS NOT DISTINCT FROM family.visibility;

UPDATE "product_variants" AS variant
SET commercial_mode_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.commercial_mode_override IS NOT DISTINCT FROM family.commercial_mode;

UPDATE "product_variants" AS variant
SET price_visibility_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.price_visibility_override IS NOT DISTINCT FROM family.price_visibility;

UPDATE "product_variants" AS variant
SET is_promoted_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.is_promoted_override IS NOT DISTINCT FROM family.is_promoted;

UPDATE "product_variants" AS variant
SET currency_code_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.currency_code_override IS NOT DISTINCT FROM family.currency_code;

UPDATE "product_variants" AS variant
SET base_price_amount_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.base_price_amount_override IS NOT DISTINCT FROM family.base_price_amount;

UPDATE "product_variants" AS variant
SET current_price_amount_override = NULL
FROM "product_families" AS family
WHERE variant.family_id = family.id
  AND variant.current_price_amount_override IS NOT DISTINCT FROM family.current_price_amount;

CREATE INDEX "product_families_commercial_mode_idx" ON "product_families"("commercial_mode");
CREATE INDEX "product_families_price_visibility_idx" ON "product_families"("price_visibility");
