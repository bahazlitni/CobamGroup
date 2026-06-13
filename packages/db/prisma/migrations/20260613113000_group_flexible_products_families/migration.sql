-- Correct the F flexible import: the two [FAMILY] folders must be represented as
-- product families with their inner products as variants.

CREATE TEMP TABLE "_f_flexible_family_seed" (
  "family_slug" TEXT NOT NULL,
  "family_name" TEXT NOT NULL,
  "family_subtitle" TEXT,
  "family_description" TEXT,
  "family_description_seo" TEXT,
  "main_image_media_id" BIGINT,
  "default_sku" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("family_slug", "sku")
);

INSERT INTO "_f_flexible_family_seed" (
  "family_slug",
  "family_name",
  "family_subtitle",
  "family_description",
  "family_description_seo",
  "main_image_media_id",
  "default_sku",
  "sku",
  "sort_order"
)
VALUES
  (
    'jaquar-flexibles-douche-549d8',
    'Flexibles de douche Jaquar 549D8',
    'Famille de flexibles de douche',
    'Famille de flexibles de douche Jaquar 549D8 regroupant les finitions Opal doré brossé et chrome pour composer une douche coordonnée.',
    'Flexibles de douche Jaquar 549D8 en finitions Opal doré brossé et chrome chez COBAM GROUP en Tunisie.',
    1671,
    '00232791',
    '00232791',
    0
  ),
  (
    'jaquar-flexibles-douche-549d8',
    'Flexibles de douche Jaquar 549D8',
    'Famille de flexibles de douche',
    'Famille de flexibles de douche Jaquar 549D8 regroupant les finitions Opal doré brossé et chrome pour composer une douche coordonnée.',
    'Flexibles de douche Jaquar 549D8 en finitions Opal doré brossé et chrome chez COBAM GROUP en Tunisie.',
    1671,
    '00232791',
    '00206860',
    1
  ),
  (
    'jaquar-flexibles-douche-ari-sha-571',
    'Flexibles de douche Jaquar ARI-SHA-571',
    'Famille de flexibles de douche',
    'Famille de flexibles de douche Jaquar ARI-SHA-571 regroupant les versions noir mat et chromée pour les ensembles de douche coordonnés.',
    'Flexibles de douche Jaquar ARI-SHA-571 en versions noir mat et chromée chez COBAM GROUP en Tunisie.',
    1670,
    '00237802',
    '00237802',
    0
  ),
  (
    'jaquar-flexibles-douche-ari-sha-571',
    'Flexibles de douche Jaquar ARI-SHA-571',
    'Famille de flexibles de douche',
    'Famille de flexibles de douche Jaquar ARI-SHA-571 regroupant les versions noir mat et chromée pour les ensembles de douche coordonnés.',
    'Flexibles de douche Jaquar ARI-SHA-571 en versions noir mat et chromée chez COBAM GROUP en Tunisie.',
    1670,
    '00237802',
    '00206877',
    1
  );

DO $$
DECLARE
  missing_products INTEGER;
  missing_images INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_products
  FROM (
    SELECT DISTINCT "sku" FROM "_f_flexible_family_seed"
    UNION
    SELECT DISTINCT "default_sku" FROM "_f_flexible_family_seed"
  ) "expected"
  LEFT JOIN "products" "product"
    ON "product"."sku" = "expected"."sku"
  WHERE "product"."id" IS NULL;

  IF missing_products > 0 THEN
    RAISE EXCEPTION 'Cannot group F flexible products: % expected product row(s) are missing.', missing_products;
  END IF;

  SELECT COUNT(*)
  INTO missing_images
  FROM (
    SELECT DISTINCT "main_image_media_id"
    FROM "_f_flexible_family_seed"
    WHERE "main_image_media_id" IS NOT NULL
  ) "expected"
  LEFT JOIN "media"
    ON "media"."id" = "expected"."main_image_media_id"
    AND "media"."kind" = 'IMAGE'::"MediaKind"
  WHERE "media"."id" IS NULL;

  IF missing_images > 0 THEN
    RAISE EXCEPTION 'Cannot group F flexible products: % expected family image row(s) are missing or have the wrong kind.', missing_images;
  END IF;
END $$;

INSERT INTO "product_families" (
  "slug",
  "name",
  "subtitle",
  "description",
  "description_seo",
  "main_image_media_id",
  "default_product_id",
  "created_at",
  "updated_at"
)
SELECT DISTINCT ON ("seed"."family_slug")
  "seed"."family_slug",
  "seed"."family_name",
  "seed"."family_subtitle",
  "seed"."family_description",
  LEFT("seed"."family_description_seo", 160),
  "seed"."main_image_media_id",
  "default_product"."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_f_flexible_family_seed" "seed"
JOIN "products" "default_product"
  ON "default_product"."sku" = "seed"."default_sku"
ORDER BY "seed"."family_slug", "seed"."sort_order"
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "main_image_media_id" = EXCLUDED."main_image_media_id",
  "default_product_id" = EXCLUDED."default_product_id",
  "updated_at" = CURRENT_TIMESTAMP;

UPDATE "products" "product"
SET
  "kind" = 'VARIANT'::"ProductKind",
  "updated_at" = CURRENT_TIMESTAMP
WHERE "product"."sku" IN (
  SELECT "sku" FROM "_f_flexible_family_seed"
);

DELETE FROM "product_family_members" "member"
USING "product_families" "family"
WHERE "member"."family_id" = "family"."id"
  AND "family"."slug" IN (
    SELECT DISTINCT "family_slug" FROM "_f_flexible_family_seed"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "_f_flexible_family_seed" "seed"
    JOIN "products" "product"
      ON "product"."sku" = "seed"."sku"
    WHERE "seed"."family_slug" = "family"."slug"
      AND "product"."id" = "member"."product_id"
  );

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  "seed"."sort_order"
FROM "_f_flexible_family_seed" "seed"
JOIN "product_families" "family"
  ON "family"."slug" = "seed"."family_slug"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
ON CONFLICT ("product_id") DO UPDATE SET
  "family_id" = EXCLUDED."family_id",
  "sort_order" = EXCLUDED."sort_order";

DO $$
DECLARE
  expected_family_count INTEGER;
  seeded_family_count INTEGER;
  expected_member_count INTEGER;
  seeded_member_count INTEGER;
  variant_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT "family_slug")
  INTO expected_family_count
  FROM "_f_flexible_family_seed";

  SELECT COUNT(*)
  INTO seeded_family_count
  FROM "product_families" "family"
  WHERE "family"."slug" IN (
    SELECT DISTINCT "family_slug" FROM "_f_flexible_family_seed"
  );

  IF expected_family_count <> 2 OR seeded_family_count <> expected_family_count THEN
    RAISE EXCEPTION 'F flexible family correction expected 2 families and found % expected / % seeded.', expected_family_count, seeded_family_count;
  END IF;

  SELECT COUNT(*)
  INTO expected_member_count
  FROM "_f_flexible_family_seed";

  SELECT COUNT(*)
  INTO seeded_member_count
  FROM "_f_flexible_family_seed" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_family_members" "member"
    ON "member"."product_id" = "product"."id"
  JOIN "product_families" "family"
    ON "family"."id" = "member"."family_id"
    AND "family"."slug" = "seed"."family_slug";

  IF expected_member_count <> 4 OR seeded_member_count <> expected_member_count THEN
    RAISE EXCEPTION 'F flexible family correction expected 4 family members and found % expected / % seeded.', expected_member_count, seeded_member_count;
  END IF;

  SELECT COUNT(*)
  INTO variant_count
  FROM "_f_flexible_family_seed" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  WHERE "product"."kind" = 'VARIANT'::"ProductKind";

  IF variant_count <> 4 THEN
    RAISE EXCEPTION 'F flexible family correction expected 4 variant products and found %.', variant_count;
  END IF;
END $$;
