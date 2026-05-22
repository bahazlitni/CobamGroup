-- Split the general "Carrojoint Deutsch Color" family into Standard and Intense gammes.

DO $$
DECLARE
  source_family_id BIGINT;
  intense_count INTEGER;
  standard_count INTEGER;
BEGIN
  SELECT "id"
  INTO source_family_id
  FROM "product_families"
  WHERE "slug" = 'carrojoint-deutsch-color';

  IF source_family_id IS NULL THEN
    RAISE EXCEPTION 'Cannot split Deutsch Color Carrojoint: source family carrojoint-deutsch-color is missing.';
  END IF;

  SELECT
    COUNT(*) FILTER (
      WHERE COALESCE("range_attr"."value", '') = 'Intense'
        OR "product"."name" ILIKE '%INTENSE%'
        OR "product"."display_name" ILIKE '%INTENSE%'
    ),
    COUNT(*) FILTER (
      WHERE NOT (
        COALESCE("range_attr"."value", '') = 'Intense'
        OR "product"."name" ILIKE '%INTENSE%'
        OR "product"."display_name" ILIKE '%INTENSE%'
      )
    )
  INTO intense_count, standard_count
  FROM "product_family_members" "member"
  JOIN "products" "product"
    ON "product"."id" = "member"."product_id"
  LEFT JOIN "product_attributes" "range_attr"
    ON "range_attr"."product_id" = "product"."id"
    AND "range_attr"."name" = 'product_range'
  WHERE "member"."family_id" = source_family_id;

  IF intense_count = 0 THEN
    RAISE EXCEPTION 'Cannot split Deutsch Color Carrojoint: no Intense products found.';
  END IF;

  IF standard_count = 0 THEN
    RAISE EXCEPTION 'Cannot split Deutsch Color Carrojoint: no standard products would remain.';
  END IF;
END $$;

CREATE TEMP TABLE "_deutsch_carrojoint_split" AS
SELECT
  "product"."id" AS "product_id",
  "product"."sku",
  "product"."stock_available",
  "member"."sort_order" AS "previous_sort_order",
  CASE
    WHEN COALESCE("range_attr"."value", '') = 'Intense'
      OR "product"."name" ILIKE '%INTENSE%'
      OR "product"."display_name" ILIKE '%INTENSE%'
      THEN 'carrojoint-intense-deutsch-color'
    ELSE 'carrojoint-deutsch-color'
  END AS "target_family_slug"
FROM "product_families" "family"
JOIN "product_family_members" "member"
  ON "member"."family_id" = "family"."id"
JOIN "products" "product"
  ON "product"."id" = "member"."product_id"
LEFT JOIN "product_attributes" "range_attr"
  ON "range_attr"."product_id" = "product"."id"
  AND "range_attr"."name" = 'product_range'
WHERE "family"."slug" = 'carrojoint-deutsch-color';

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo",
  "main_image_media_id", "created_at", "updated_at"
)
SELECT
  'carrojoint-intense-deutsch-color',
  'Carrojoint Intense Deutsch Color',
  'Joints de carrelage Deutsch Color Intense',
  'Famille Carrojoint Intense Deutsch Color : mortiers de jointoiement colores pour finitions de carrelage en zones humides, surfaces exposees et usages exigeants.',
  'Carrojoint Intense Deutsch Color : joints de carrelage techniques et finitions couleur chez COBAM GROUP.',
  "family"."main_image_media_id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "product_families" "family"
WHERE "family"."slug" = 'carrojoint-deutsch-color'
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "main_image_media_id" = EXCLUDED."main_image_media_id",
  "updated_at" = CURRENT_TIMESTAMP;

UPDATE "product_families"
SET
  "name" = 'Carrojoint Deutsch Color',
  "subtitle" = 'Joints de carrelage Deutsch Color',
  "description" = 'Famille Carrojoint Deutsch Color : mortiers de jointoiement colores pour pose et finition de carrelage, hors gamme Intense.',
  "description_seo" = 'Carrojoint Deutsch Color : joints de carrelage standard et finitions couleur chez COBAM GROUP.',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "slug" = 'carrojoint-deutsch-color';

DELETE FROM "product_family_members" "member"
USING "_deutsch_carrojoint_split" "split"
WHERE "member"."product_id" = "split"."product_id";

WITH "ranked_members" AS (
  SELECT
    "split"."product_id",
    "split"."target_family_slug",
    row_number() OVER (
      PARTITION BY "split"."target_family_slug"
      ORDER BY "split"."previous_sort_order", "split"."sku"
    ) - 1 AS "sort_order"
  FROM "_deutsch_carrojoint_split" "split"
)
INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "ranked_members"."product_id",
  "ranked_members"."sort_order"::INTEGER
FROM "ranked_members"
JOIN "product_families" "family"
  ON "family"."slug" = "ranked_members"."target_family_slug"
ON CONFLICT ("family_id", "product_id") DO UPDATE SET
  "sort_order" = EXCLUDED."sort_order";

UPDATE "products" "product"
SET
  "kind" = 'VARIANT'::"ProductKind",
  "updated_at" = CURRENT_TIMESTAMP
FROM "_deutsch_carrojoint_split" "split"
WHERE "product"."id" = "split"."product_id";

WITH "ranked_defaults" AS (
  SELECT
    "split"."target_family_slug",
    "split"."product_id",
    row_number() OVER (
      PARTITION BY "split"."target_family_slug"
      ORDER BY "split"."stock_available" DESC, "split"."previous_sort_order", "split"."sku"
    ) AS "rank"
  FROM "_deutsch_carrojoint_split" "split"
)
UPDATE "product_families" "family"
SET
  "default_product_id" = "ranked_defaults"."product_id",
  "updated_at" = CURRENT_TIMESTAMP
FROM "ranked_defaults"
WHERE "family"."slug" = "ranked_defaults"."target_family_slug"
  AND "ranked_defaults"."rank" = 1;

DROP TABLE "_deutsch_carrojoint_split";
