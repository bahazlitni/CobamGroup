-- Assign per-variant images to the "Carrojoint Sika" family.
-- Media filenames include their stored image extension, so the exact match used
-- here is the internal product name plus ".webp", except for the documented
-- Noce/Walnut filename exception.

CREATE TEMP TABLE "_sika_carrojoint_media_targets" AS
SELECT
  "product"."id" AS "product_id",
  "product"."sku",
  "product"."name" AS "internal_name",
  "product"."display_name",
  (
    CASE
      WHEN "product"."name" = 'CARROJOINT NOCE/WALNUT 40 SIKA 5KG'
        THEN 'CARROJOINT NOCE-WALNUT 40 SIKA 5KG'
      ELSE "product"."name"
    END
  ) || '.webp' AS "expected_image_filename"
FROM "product_families" "family"
JOIN "product_family_members" "member"
  ON "member"."family_id" = "family"."id"
JOIN "products" "product"
  ON "product"."id" = "member"."product_id"
WHERE "family"."slug" = 'carrojoint-sika';

DO $$
DECLARE
  target_count INTEGER;
  missing_image_count INTEGER;
  duplicate_image_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO target_count
  FROM "_sika_carrojoint_media_targets";

  IF target_count = 0 THEN
    RAISE EXCEPTION 'Cannot assign Sika Carrojoint media: no variants found in carrojoint-sika.';
  END IF;

  SELECT COUNT(*)
  INTO missing_image_count
  FROM "_sika_carrojoint_media_targets" "target"
  WHERE NOT EXISTS (
    SELECT 1
    FROM "media" "image_media"
    WHERE "image_media"."original_filename" = "target"."expected_image_filename"
      AND "image_media"."kind" = 'IMAGE'
      AND "image_media"."deleted_at" IS NULL
  );

  IF missing_image_count > 0 THEN
    RAISE EXCEPTION 'Cannot assign Sika Carrojoint media: % expected image file(s) are missing.', missing_image_count;
  END IF;

  SELECT COUNT(*)
  INTO duplicate_image_count
  FROM (
    SELECT
      "target"."expected_image_filename"
    FROM "_sika_carrojoint_media_targets" "target"
    JOIN "media" "image_media"
      ON "image_media"."original_filename" = "target"."expected_image_filename"
      AND "image_media"."kind" = 'IMAGE'
      AND "image_media"."deleted_at" IS NULL
    GROUP BY "target"."expected_image_filename"
    HAVING COUNT(*) <> 1
  ) "duplicates";

  IF duplicate_image_count > 0 THEN
    RAISE EXCEPTION 'Cannot assign Sika Carrojoint media: % expected image filename(s) do not resolve to exactly one media row.', duplicate_image_count;
  END IF;
END $$;

CREATE TEMP TABLE "_sika_carrojoint_media_matches" AS
SELECT
  "target"."product_id",
  "target"."sku",
  "target"."display_name",
  "target"."expected_image_filename",
  "image_media"."id" AS "image_media_id"
FROM "_sika_carrojoint_media_targets" "target"
JOIN "media" "image_media"
  ON "image_media"."original_filename" = "target"."expected_image_filename"
  AND "image_media"."kind" = 'IMAGE'
  AND "image_media"."deleted_at" IS NULL;

DELETE FROM "product_media" "product_media"
USING "_sika_carrojoint_media_matches" "target"
WHERE "product_media"."product_id" = "target"."product_id"
  AND "product_media"."role" = 'GALLERY'::"ProductMediaRole";

INSERT INTO "product_media" (
  "product_id", "media_id", "role", "name", "alt_text", "sort_order", "created_at", "updated_at"
)
SELECT
  "target"."product_id",
  "target"."image_media_id",
  'GALLERY'::"ProductMediaRole",
  "target"."expected_image_filename",
  "target"."display_name",
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_sika_carrojoint_media_matches" "target"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DROP TABLE "_sika_carrojoint_media_matches";
DROP TABLE "_sika_carrojoint_media_targets";
