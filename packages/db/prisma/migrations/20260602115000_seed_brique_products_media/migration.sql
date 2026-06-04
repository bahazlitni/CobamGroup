-- Seed Brique products, organize the variants, and attach the uploaded images.
-- These products intentionally have no brand.

INSERT INTO "product_attribute_groups" (
  "product_type_id", "name", "slug", "sort_order", "created_at", "updated_at"
)
VALUES
  (37, 'Caractéristiques', 'caracteristiques', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (37, 'Logistique', 'logistique', 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_brique_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  "group_slug" TEXT NOT NULL
);

INSERT INTO "_brique_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "is_filterable", "sort_order", "group_slug"
)
VALUES
  ('brick_type', 'Type de brique', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Brique plâtrière', 'Brique hourdis', 'Brique série A']::TEXT[], true, 0, 'caracteristiques'),
  ('format_text', 'Format', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 10, 'caracteristiques'),
  ('pallet_quantity', 'Pièces par palette', 'pièces', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 20, 'logistique'),
  ('origin_note', 'Origine / dépôt', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 30, 'logistique');

INSERT INTO "product_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "created_at", "updated_at"
)
SELECT
  "key",
  "label",
  "unit",
  "input_type",
  "select_options",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_brique_attribute_definitions"
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "unit" = EXCLUDED."unit",
  "input_type" = EXCLUDED."input_type",
  "select_options" = (
    SELECT ARRAY(
      SELECT DISTINCT "option"
      FROM unnest("product_attribute_definitions"."select_options" || EXCLUDED."select_options") AS "option"
      WHERE "option" <> ''
      ORDER BY "option"
    )
  ),
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_type_attributes" (
  "product_type_id", "attribute_group_id", "attribute_definition_id", "label",
  "is_required", "is_filterable", "sort_order", "created_at", "updated_at"
)
SELECT
  37,
  "attribute_group"."id",
  "definition"."id",
  "seed"."label",
  false,
  "seed"."is_filterable",
  "seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_brique_attribute_definitions" "seed"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "seed"."key"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."product_type_id" = 37
  AND "attribute_group"."slug" = "seed"."group_slug"
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "attribute_group_id" = EXCLUDED."attribute_group_id",
  "label" = EXCLUDED."label",
  "is_required" = EXCLUDED."is_required",
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_brique_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_brique_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (35, 'BRIQUE A06.png', 'IMAGE'::"MediaKind"),
  (36, 'BRIQUE A08.png', 'IMAGE'::"MediaKind"),
  (37, 'BRIQUE A12.png', 'IMAGE'::"MediaKind"),
  (38, 'Brique Double cloison.png', 'IMAGE'::"MediaKind"),
  (39, 'BRIQUE HOURD 16.png', 'IMAGE'::"MediaKind"),
  (40, 'BRIQUE HOURD 19.png', 'IMAGE'::"MediaKind"),
  (41, 'BRIQUE PLATRIÈRE 8.png', 'IMAGE'::"MediaKind"),
  (42, 'Famille Brique Hourdis.png', 'IMAGE'::"MediaKind"),
  (43, 'Famille Brique Série A.png', 'IMAGE'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "product_type_templates" WHERE "id" = 37 AND "slug" = 'brique'
  ) THEN
    RAISE EXCEPTION 'Missing product_type_templates id 37 / brique.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_subcategories" "subcategory"
    JOIN "product_types" "category"
      ON "category"."id" = "subcategory"."category_id"
    WHERE "category"."slug" = 'materiaux-de-construction'
      AND "subcategory"."slug" = 'briques'
  ) THEN
    RAISE EXCEPTION 'Missing subcategory materiaux-de-construction / briques.';
  END IF;

  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_brique_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed Brique media: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;
END $$;

CREATE TEMP TABLE "_brique_products" (
  "sku" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "kind" "ProductKind" NOT NULL,
  "family_slug" TEXT,
  "family_name" TEXT,
  "family_subtitle" TEXT,
  "family_description" TEXT,
  "family_description_seo" TEXT,
  "family_main_image_media_id" BIGINT,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "brick_type" TEXT NOT NULL,
  "format_text" TEXT NOT NULL,
  "pallet_quantity" TEXT,
  "origin_note" TEXT,
  "sort_order" INTEGER NOT NULL,
  "main_media_id" BIGINT NOT NULL
);

INSERT INTO "_brique_products" (
  "sku", "slug", "name", "display_name", "kind",
  "family_slug", "family_name", "family_subtitle", "family_description",
  "family_description_seo", "family_main_image_media_id",
  "price_ttc", "stock_available", "brick_type", "format_text",
  "pallet_quantity", "origin_note", "sort_order", "main_media_id"
)
VALUES
  (
    'PLATR',
    'brique-platriere-essahel',
    'BRIQUE  PLATERIERE ESSAHEL',
    'Brique plâtrière Essahel',
    'SINGLE'::"ProductKind",
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0.815,
    4404.000,
    'Brique plâtrière',
    '8',
    NULL,
    'Essahel',
    0,
    41
  ),
  (
    'H16',
    'brique-hourdis-h16-bcm-sbm-depot',
    'BRIQUE DE H16 BCM/SBM DEPOT',
    'Brique hourdis H16 BCM/SBM dépôt',
    'VARIANT'::"ProductKind",
    'brique-hourdis',
    'Brique Hourdis',
    'Briques de construction',
    'Famille de briques hourdis pour planchers et travaux de maçonnerie, organisée par hauteur.',
    'Brique Hourdis : variantes pour planchers et maçonnerie chez COBAM GROUP.',
    42,
    1.450,
    772.000,
    'Brique hourdis',
    'H16',
    NULL,
    'BCM / SBM dépôt',
    0,
    39
  ),
  (
    'B06',
    'brique-serie-a-06-680-pl',
    'BRIQUE DE 06  (680/PL)',
    'Brique série A 06',
    'VARIANT'::"ProductKind",
    'brique-serie-a',
    'Brique Série A',
    'Briques de construction',
    'Famille de briques série A pour cloisons et travaux de maçonnerie courants.',
    'Brique Série A : variantes 06, 08 et 12 chez COBAM GROUP.',
    43,
    0.380,
    774.000,
    'Brique série A',
    '06',
    '680',
    NULL,
    0,
    35
  ),
  (
    'B08',
    'brique-serie-a-08-essahel-depot',
    'BRIQUE DE 08  ESSAHEL  DEPOT',
    'Brique série A 08 Essahel dépôt',
    'VARIANT'::"ProductKind",
    'brique-serie-a',
    'Brique Série A',
    'Briques de construction',
    'Famille de briques série A pour cloisons et travaux de maçonnerie courants.',
    'Brique Série A : variantes 06, 08 et 12 chez COBAM GROUP.',
    43,
    0.820,
    28.000,
    'Brique série A',
    '08',
    NULL,
    'Essahel dépôt',
    1,
    36
  ),
  (
    '00178273',
    'brique-serie-a-12-bcm-depot',
    'BRIQUE DE 12 BCM DEPOT',
    'Brique série A 12 BCM dépôt',
    'VARIANT'::"ProductKind",
    'brique-serie-a',
    'Brique Série A',
    'Briques de construction',
    'Famille de briques série A pour cloisons et travaux de maçonnerie courants.',
    'Brique Série A : variantes 06, 08 et 12 chez COBAM GROUP.',
    43,
    0.980,
    4431.000,
    'Brique série A',
    '12',
    NULL,
    'BCM dépôt',
    2,
    37
  );

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo",
  "main_image_media_id", "created_at", "updated_at"
)
SELECT DISTINCT
  "family_slug",
  "family_name",
  "family_subtitle",
  "family_description",
  left("family_description_seo", 160),
  "family_main_image_media_id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_brique_products"
WHERE "family_slug" IS NOT NULL
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "main_image_media_id" = EXCLUDED."main_image_media_id",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "products" (
  "sku", "slug", "kind", "brand_id", "product_type_id", "name", "display_name",
  "rich_text_description", "title_seo", "description_seo", "tags",
  "guarantee_months", "visible_ecommerce", "visible_vitrine", "is_featured", "is_new",
  "stock_available", "stock_alert_threshold", "stock_unit", "stock_availability", "stock_visibility",
  "base_price_ttc_tnd", "current_price_ttc_tnd", "vat_rate", "price_visibility",
  "created_at", "updated_at"
)
SELECT
  "seed"."sku",
  "seed"."slug",
  "seed"."kind",
  NULL,
  37,
  left("seed"."name", 255),
  left("seed"."display_name", 255),
  jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'heading',
        'attrs', jsonb_build_object('level', 2),
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."display_name"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Cette brique de construction est destinée aux travaux de maçonnerie, cloisons ou planchers selon son format. Elle complète la sélection COBAM GROUP pour les chantiers courants et les approvisionnements dépôt.'))
      )
    )
  ),
  left("seed"."display_name" || ' | COBAM GROUP', 60),
  left("seed"."display_name" || ' : brique de construction disponible chez COBAM GROUP en Tunisie.', 160),
  trim(
    'brique construction maconnerie materiaux ' ||
    lower(replace("seed"."brick_type", ' ', '-')) || ' ' ||
    lower(replace("seed"."format_text", ' ', '-'))
  ),
  0,
  true,
  true,
  false,
  false,
  "seed"."stock_available",
  0,
  'PIECE'::"StockUnit",
  CASE
    WHEN "seed"."stock_available" > 0 THEN 'IN_STOCK'::"ProductAvailability"
    ELSE 'OUT_OF_STOCK'::"ProductAvailability"
  END,
  'AUTO'::"ProductInventoryVisibility",
  "seed"."price_ttc",
  "seed"."price_ttc",
  19.000,
  'AUTO'::"ProductPricingVisibility",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_brique_products" "seed"
ON CONFLICT ("sku") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "kind" = EXCLUDED."kind",
  "brand_id" = EXCLUDED."brand_id",
  "product_type_id" = EXCLUDED."product_type_id",
  "name" = EXCLUDED."name",
  "display_name" = EXCLUDED."display_name",
  "rich_text_description" = EXCLUDED."rich_text_description",
  "title_seo" = EXCLUDED."title_seo",
  "description_seo" = EXCLUDED."description_seo",
  "tags" = EXCLUDED."tags",
  "guarantee_months" = EXCLUDED."guarantee_months",
  "visible_ecommerce" = EXCLUDED."visible_ecommerce",
  "visible_vitrine" = EXCLUDED."visible_vitrine",
  "is_featured" = EXCLUDED."is_featured",
  "is_new" = EXCLUDED."is_new",
  "stock_available" = EXCLUDED."stock_available",
  "stock_alert_threshold" = EXCLUDED."stock_alert_threshold",
  "stock_unit" = EXCLUDED."stock_unit",
  "stock_availability" = EXCLUDED."stock_availability",
  "stock_visibility" = EXCLUDED."stock_visibility",
  "base_price_ttc_tnd" = EXCLUDED."base_price_ttc_tnd",
  "current_price_ttc_tnd" = EXCLUDED."current_price_ttc_tnd",
  "vat_rate" = EXCLUDED."vat_rate",
  "price_visibility" = EXCLUDED."price_visibility",
  "updated_at" = CURRENT_TIMESTAMP;

DELETE FROM "product_family_members" "member"
USING "products" "product", "_brique_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  "seed"."sort_order"
FROM "_brique_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = "seed"."family_slug"
WHERE "seed"."family_slug" IS NOT NULL
ON CONFLICT ("product_id") DO UPDATE SET
  "family_id" = EXCLUDED."family_id",
  "sort_order" = EXCLUDED."sort_order";

WITH "ranked_defaults" AS (
  SELECT
    "seed"."family_slug",
    "product"."id" AS "product_id",
    row_number() OVER (
      PARTITION BY "seed"."family_slug"
      ORDER BY "product"."stock_available" DESC, "seed"."sort_order" ASC, "product"."id" ASC
    ) AS "rank"
  FROM "_brique_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  WHERE "seed"."family_slug" IS NOT NULL
)
UPDATE "product_families" "family"
SET
  "default_product_id" = "ranked_defaults"."product_id",
  "updated_at" = CURRENT_TIMESTAMP
FROM "ranked_defaults"
WHERE "family"."slug" = "ranked_defaults"."family_slug"
  AND "ranked_defaults"."rank" = 1;

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_brique_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_brique_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'materiaux-de-construction'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'briques'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_brique_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN ('brick_type', 'format_text', 'pallet_quantity', 'origin_note');

WITH "attribute_values" AS (
  SELECT "product"."id" AS "product_id", 'brick_type' AS "name", "seed"."brick_type" AS "value"
  FROM "_brique_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'format_text', "seed"."format_text"
  FROM "_brique_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'pallet_quantity', "seed"."pallet_quantity"
  FROM "_brique_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"
  WHERE "seed"."pallet_quantity" IS NOT NULL

  UNION ALL
  SELECT "product"."id", 'origin_note', "seed"."origin_note"
  FROM "_brique_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"
  WHERE "seed"."origin_note" IS NOT NULL
)
INSERT INTO "product_attributes" (
  "product_id", "attribute_def_id", "attribute_group_id", "name", "label", "value",
  "unit", "input_type", "is_required", "is_filterable", "group_name", "group_sort_order", "sort_order"
)
SELECT
  "attribute_values"."product_id",
  "definition"."id",
  "template_attribute"."attribute_group_id",
  "definition"."key",
  COALESCE(NULLIF("template_attribute"."label", ''), "definition"."label"),
  "attribute_values"."value",
  "definition"."unit",
  "definition"."input_type",
  "template_attribute"."is_required",
  "template_attribute"."is_filterable",
  "attribute_group"."name",
  COALESCE("attribute_group"."sort_order", 0),
  "template_attribute"."sort_order"
FROM "attribute_values"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "attribute_values"."name"
JOIN "product_type_attributes" "template_attribute"
  ON "template_attribute"."product_type_id" = 37
  AND "template_attribute"."attribute_definition_id" = "definition"."id"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."id" = "template_attribute"."attribute_group_id";

CREATE TEMP TABLE "_brique_media" (
  "sku" TEXT PRIMARY KEY,
  "media_id" BIGINT NOT NULL,
  "alt_text" TEXT NOT NULL
);

INSERT INTO "_brique_media" ("sku", "media_id", "alt_text")
SELECT
  "sku",
  "main_media_id",
  "display_name" || ' - vue produit'
FROM "_brique_products";

DELETE FROM "product_media" "product_media"
USING "products" "product", "_brique_products" "seed"
WHERE "product_media"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "product_media"."role" = 'GALLERY'::"ProductMediaRole";

INSERT INTO "product_media" (
  "product_id", "media_id", "role", "name", "alt_text", "sort_order", "created_at", "updated_at"
)
SELECT
  "product"."id",
  "media_link"."media_id",
  'GALLERY'::"ProductMediaRole",
  regexp_replace("expected"."expected_filename", '\.[^.]+$', ''),
  "media_link"."alt_text",
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_brique_media" "media_link"
JOIN "products" "product"
  ON "product"."sku" = "media_link"."sku"
JOIN "_brique_expected_media" "expected"
  ON "expected"."media_id" = "media_link"."media_id"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DROP TABLE "_brique_media";
DROP TABLE "_brique_products";
DROP TABLE "_brique_expected_media";
DROP TABLE "_brique_attribute_definitions";
