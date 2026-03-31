ALTER TABLE "public"."product_variants"
RENAME COLUMN "slug_override" TO "slug";

ALTER TABLE "public"."product_variants"
RENAME COLUMN "name_override" TO "name";

ALTER TABLE "public"."product_variants"
RENAME COLUMN "description_override" TO "description";

ALTER TABLE "public"."product_variants"
RENAME COLUMN "lifecycle_status_override" TO "lifecycle_status";

ALTER TABLE "public"."product_variants"
RENAME COLUMN "visibility_override" TO "visibility";

ALTER TABLE "public"."product_variants"
RENAME COLUMN "commercial_mode_override" TO "commercial_mode";

ALTER TABLE "public"."product_variants"
RENAME COLUMN "price_visibility_override" TO "price_visibility";

ALTER TABLE "public"."product_variants"
RENAME COLUMN "base_price_amount_override" TO "base_price_amount";

ALTER TABLE "public"."product_variants"
ADD COLUMN "description_seo" TEXT;

UPDATE "public"."product_variants" AS "variant"
SET
  "slug" = COALESCE("variant"."slug", "family"."slug"),
  "name" = COALESCE("variant"."name", "family"."name"),
  "description" = COALESCE("variant"."description", "family"."description", ''),
  "description_seo" = COALESCE(
    "variant"."description_seo",
    "family"."description_seo",
    "family"."description",
    ''
  ),
  "lifecycle_status" = COALESCE("variant"."lifecycle_status", "family"."lifecycle_status"),
  "visibility" = COALESCE("variant"."visibility", "family"."visibility"),
  "commercial_mode" = COALESCE("variant"."commercial_mode", "family"."commercial_mode"),
  "price_visibility" = COALESCE("variant"."price_visibility", "family"."price_visibility"),
  "base_price_amount" = COALESCE("variant"."base_price_amount", "family"."base_price_amount")
FROM "public"."product_families" AS "family"
WHERE "variant"."family_id" = "family"."id";

UPDATE "public"."product_families" AS "family"
SET "default_variant_id" = "resolved"."id"
FROM (
  SELECT DISTINCT ON ("family_id")
    "family_id",
    "id"
  FROM "public"."product_variants"
  ORDER BY "family_id", "sort_order" ASC, "created_at" ASC
) AS "resolved"
WHERE "family"."default_variant_id" IS NULL
  AND "family"."id" = "resolved"."family_id";

ALTER TABLE "public"."product_variants"
DROP COLUMN "subtitle_override",
DROP COLUMN "is_promoted_override",
DROP COLUMN "current_price_amount_override";

ALTER TABLE "public"."product_families"
DROP COLUMN "lifecycle_status",
DROP COLUMN "visibility",
DROP COLUMN "commercial_mode",
DROP COLUMN "price_visibility",
DROP COLUMN "is_promoted",
DROP COLUMN "base_price_amount",
DROP COLUMN "current_price_amount";
