-- Seed the ZIP-backed Today Sola glass-block products.
-- These folders are simple products with two gallery images each.

CREATE TEMP TABLE "_today_brique_verre_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_today_brique_verre_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1961, 'BRIQUE EN VERRE MARINA SOLA [1].webp', 'IMAGE'::"MediaKind"),
  (1960, 'BRIQUE EN VERRE MARINA SOLA [2].webp', 'IMAGE'::"MediaKind"),
  (1956, 'BRIQUE EN VERRE SAVONA SOLA [1].webp', 'IMAGE'::"MediaKind"),
  (1957, 'BRIQUE EN VERRE SAVONA SOLA [2].webp', 'IMAGE'::"MediaKind"),
  (1958, 'BRIQUE EN VERRE WOLKE SOLA [1].webp', 'IMAGE'::"MediaKind"),
  (1959, 'BRIQUE EN VERRE WOLKE SOLA [2].webp', 'IMAGE'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
  missing_reference_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_today_brique_verre_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Today brique verre seed aborted: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;

  SELECT COUNT(*)
  INTO missing_reference_count
  FROM (
    SELECT 'product type brique' AS "reference"
    WHERE NOT EXISTS (
      SELECT 1
      FROM "product_type_templates"
      WHERE "slug" = 'brique'
    )

    UNION ALL

    SELECT 'materiaux-de-construction/briques' AS "reference"
    WHERE NOT EXISTS (
      SELECT 1
      FROM "product_types" "category"
      JOIN "product_subcategories" "subcategory"
        ON "subcategory"."category_id" = "category"."id"
      WHERE "category"."slug" = 'materiaux-de-construction'
        AND "subcategory"."slug" = 'briques'
    )
  ) "missing";

  IF missing_reference_count > 0 THEN
    RAISE EXCEPTION 'Today brique verre seed aborted: % required catalog reference(s) are missing.', missing_reference_count;
  END IF;
END $$;

INSERT INTO "organizations" (
  "slug", "name", "description", "is_product_brand", "is_reference", "is_partner", "created_at", "updated_at"
)
VALUES (
  'sola',
  'Sola',
  'Marque associée aux briques en verre décoratives du catalogue.',
  true,
  false,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "is_product_brand" = true,
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_attribute_groups" (
  "product_type_id", "name", "slug", "sort_order", "created_at", "updated_at"
)
SELECT
  "template"."id",
  "seed"."name",
  "seed"."slug",
  "seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  VALUES
    ('brique', 'caracteristiques', 'Caractéristiques', 0),
    ('brique', 'logistique', 'Logistique', 10)
) AS "seed"("product_type_slug", "slug", "name", "sort_order")
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_brique_verre_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  "group_slug" TEXT NOT NULL
);

INSERT INTO "_today_brique_verre_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options",
  "is_filterable", "sort_order", "group_slug"
)
VALUES
  (
    'brick_type',
    'Type de brique',
    NULL,
    'SELECT'::"ProductTypeAttributeInputType",
    ARRAY['Brique de verre']::TEXT[],
    true,
    0,
    'caracteristiques'
  ),
  (
    'material',
    'Matière',
    NULL,
    'SELECT'::"ProductTypeAttributeInputType",
    ARRAY['Verre']::TEXT[],
    true,
    10,
    'caracteristiques'
  ),
  (
    'glass_tint',
    'Teinte',
    NULL,
    'SELECT'::"ProductTypeAttributeInputType",
    ARRAY['Incolore']::TEXT[],
    true,
    20,
    'caracteristiques'
  ),
  (
    'glass_block_pattern',
    'Motif',
    NULL,
    'SELECT'::"ProductTypeAttributeInputType",
    ARRAY['Bulles', 'Linéaire', 'Nuagé']::TEXT[],
    true,
    30,
    'caracteristiques'
  ),
  (
    'dimensions_text',
    'Dimensions',
    NULL,
    'TEXT'::"ProductTypeAttributeInputType",
    ARRAY[]::TEXT[],
    true,
    40,
    'caracteristiques'
  ),
  (
    'weight_kg',
    'Poids',
    'kg',
    'NUMBER'::"ProductTypeAttributeInputType",
    ARRAY[]::TEXT[],
    false,
    50,
    'logistique'
  );

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
FROM "_today_brique_verre_attribute_definitions"
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "unit" = EXCLUDED."unit",
  "input_type" = EXCLUDED."input_type",
  "select_options" = (
    SELECT ARRAY(
      SELECT DISTINCT "option"."value"
      FROM unnest("product_attribute_definitions"."select_options" || EXCLUDED."select_options") AS "option"("value")
      WHERE "option"."value" <> ''
      ORDER BY "option"."value"
    )
  ),
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_type_attributes" (
  "product_type_id", "attribute_group_id", "attribute_definition_id",
  "is_required", "is_filterable", "sort_order", "created_at", "updated_at"
)
SELECT
  "template"."id",
  "attribute_group"."id",
  "definition"."id",
  false,
  "seed"."is_filterable",
  "seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_brique_verre_attribute_definitions" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = 'brique'
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "seed"."key"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."product_type_id" = "template"."id"
  AND "attribute_group"."slug" = "seed"."group_slug"
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "attribute_group_id" = EXCLUDED."attribute_group_id",
  "is_required" = EXCLUDED."is_required",
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_brique_verre_products" AS
SELECT *
FROM jsonb_to_recordset($products$
[
  {
    "sku": "00178488",
    "slug": "brique-en-verre-marina-incolore-sola-00178488",
    "name": "BRIQUE EN VERRE MARINA SOLA",
    "display_name": "Brique en verre Marina incolore 19x19x8 cm Sola",
    "product_type_slug": "brique",
    "brand_slug": "sola",
    "kind": "SINGLE",
    "category_slug": "materiaux-de-construction",
    "subcategory_slug": "briques",
    "stock_available": 3.000,
    "stock_unit": "PIECE",
    "price_ttc": 9.000,
    "vat_rate": 19.000,
    "title_seo": "Brique verre Marina incolore 19x19x8 Sola",
    "description_seo": "Brique en verre Marina incolore 19x19x8 cm, idéale pour cloison, paroi de douche ou séparation lumineuse avec motif linéaire.",
    "tags": "brique-verre pave-verre bloc-verre verre incolore 19x19x8 cloison separation paroi-douche salle-de-bain lumiere construction sola marina motif-lineaire",
    "intro": "Cette brique en verre Marina incolore permet de créer une cloison, une paroi de douche ou une séparation lumineuse tout en laissant passer la lumière.",
    "details": "Son motif linéaire apporte un relief graphique et aide à préserver une partie de l'intimité. Le format 19x19x8 cm s'intègre facilement dans les compositions de pavés de verre pour salle de bain ou aménagement intérieur.",
    "media": [
      {"media_id": 1961, "role": "GALLERY", "alt_text": "Brique en verre Marina incolore à motif linéaire", "sort_order": 0},
      {"media_id": 1960, "role": "GALLERY", "alt_text": "Cloison en briques de verre Marina incolore en salle de bain", "sort_order": 10}
    ],
    "attributes": [
      {"key": "brick_type", "value": "Brique de verre"},
      {"key": "material", "value": "Verre"},
      {"key": "glass_tint", "value": "Incolore"},
      {"key": "glass_block_pattern", "value": "Linéaire"},
      {"key": "dimensions_text", "value": "19 cm x 19 cm x 8 cm"},
      {"key": "weight_kg", "value": "2.25"}
    ]
  },
  {
    "sku": "00177979",
    "slug": "brique-en-verre-savona-incolore-sola-00177979",
    "name": "BRIQUE EN VERRE SAVONA SOLA",
    "display_name": "Brique en verre Savona incolore 19x19x8 cm Sola",
    "product_type_slug": "brique",
    "brand_slug": "sola",
    "kind": "SINGLE",
    "category_slug": "materiaux-de-construction",
    "subcategory_slug": "briques",
    "stock_available": 102.000,
    "stock_unit": "PIECE",
    "price_ttc": 11.053,
    "vat_rate": 19.000,
    "title_seo": "Brique verre Savona incolore 19x19x8 Sola",
    "description_seo": "Brique en verre Savona incolore 19x19x8 cm, idéale pour cloison, paroi de douche ou séparation lumineuse avec motif bulles.",
    "tags": "brique-verre pave-verre bloc-verre verre incolore 19x19x8 cloison separation paroi-douche salle-de-bain lumiere construction sola savona motif-bulles",
    "intro": "Cette brique en verre Savona incolore convient aux cloisons, parois de douche et séparations décoratives qui doivent laisser circuler la lumière.",
    "details": "Son motif bulles crée un rendu vivant et diffusant, utile pour apporter de la texture tout en limitant la visibilité directe. Le format 19x19x8 cm permet une pose modulaire dans les compositions en pavés de verre.",
    "media": [
      {"media_id": 1956, "role": "GALLERY", "alt_text": "Brique en verre Savona incolore à motif bulles", "sort_order": 0},
      {"media_id": 1957, "role": "GALLERY", "alt_text": "Paroi de douche en briques de verre Savona incolore", "sort_order": 10}
    ],
    "attributes": [
      {"key": "brick_type", "value": "Brique de verre"},
      {"key": "material", "value": "Verre"},
      {"key": "glass_tint", "value": "Incolore"},
      {"key": "glass_block_pattern", "value": "Bulles"},
      {"key": "dimensions_text", "value": "19 cm x 19 cm x 8 cm"},
      {"key": "weight_kg", "value": "2.25"}
    ]
  },
  {
    "sku": "00219358",
    "slug": "brique-en-verre-wolke-incolore-sola-00219358",
    "name": "BRIQUE EN VERRE WOLKE SOLA",
    "display_name": "Brique en verre Wolke incolore 19x19x8 cm Sola",
    "product_type_slug": "brique",
    "brand_slug": "sola",
    "kind": "SINGLE",
    "category_slug": "materiaux-de-construction",
    "subcategory_slug": "briques",
    "stock_available": 5.000,
    "stock_unit": "PIECE",
    "price_ttc": 11.053,
    "vat_rate": 19.000,
    "title_seo": "Brique verre Wolke incolore 19x19x8 Sola",
    "description_seo": "Brique en verre Wolke incolore 19x19x8 cm, idéale pour cloison, paroi de douche ou séparation lumineuse avec effet nuagé.",
    "tags": "brique-verre pave-verre bloc-verre verre incolore 19x19x8 cloison separation paroi-douche salle-de-bain lumiere construction sola wolke motif-nuage",
    "intro": "Cette brique en verre Wolke incolore est pensée pour composer des cloisons lumineuses, des parois de douche ou des séparations décoratives.",
    "details": "Son effet nuagé diffuse la lumière de manière douce et réduit la visibilité directe, ce qui convient aux espaces de bain et aux aménagements intérieurs recherchant plus d'intimité. Le format 19x19x8 cm reste compatible avec les compositions courantes en pavés de verre.",
    "media": [
      {"media_id": 1958, "role": "GALLERY", "alt_text": "Brique en verre Wolke incolore à effet nuagé", "sort_order": 0},
      {"media_id": 1959, "role": "GALLERY", "alt_text": "Paroi courbe en briques de verre Wolke incolore", "sort_order": 10}
    ],
    "attributes": [
      {"key": "brick_type", "value": "Brique de verre"},
      {"key": "material", "value": "Verre"},
      {"key": "glass_tint", "value": "Incolore"},
      {"key": "glass_block_pattern", "value": "Nuagé"},
      {"key": "dimensions_text", "value": "19 cm x 19 cm x 8 cm"},
      {"key": "weight_kg", "value": "2.25"}
    ]
  }
]
$products$::jsonb) AS "seed"(
  "sku" TEXT,
  "slug" TEXT,
  "name" TEXT,
  "display_name" TEXT,
  "product_type_slug" TEXT,
  "brand_slug" TEXT,
  "kind" TEXT,
  "category_slug" TEXT,
  "subcategory_slug" TEXT,
  "stock_available" NUMERIC(12, 3),
  "stock_unit" TEXT,
  "price_ttc" NUMERIC(12, 3),
  "vat_rate" NUMERIC(5, 3),
  "title_seo" TEXT,
  "description_seo" TEXT,
  "tags" TEXT,
  "intro" TEXT,
  "details" TEXT,
  "media" JSONB,
  "attributes" JSONB
);

DO $$
DECLARE
  missing_media_count INTEGER;
  missing_reference_count INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM "_today_brique_verre_products") <> 3 THEN
    RAISE EXCEPTION 'Expected 3 Today brique verre products.';
  END IF;

  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_today_brique_verre_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Today brique verre seed aborted: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;

  SELECT COUNT(*)
  INTO missing_reference_count
  FROM (
    SELECT DISTINCT 'product type ' || "seed"."product_type_slug" AS "reference"
    FROM "_today_brique_verre_products" "seed"
    LEFT JOIN "product_type_templates" "template"
      ON "template"."slug" = "seed"."product_type_slug"
    WHERE "template"."id" IS NULL

    UNION ALL

    SELECT DISTINCT 'brand ' || "seed"."brand_slug" AS "reference"
    FROM "_today_brique_verre_products" "seed"
    LEFT JOIN "organizations" "brand"
      ON "brand"."slug" = "seed"."brand_slug"
      AND "brand"."is_product_brand" = true
    WHERE "brand"."id" IS NULL

    UNION ALL

    SELECT DISTINCT "seed"."category_slug" || '/' || "seed"."subcategory_slug" AS "reference"
    FROM "_today_brique_verre_products" "seed"
    LEFT JOIN "product_types" "category"
      ON "category"."slug" = "seed"."category_slug"
    LEFT JOIN "product_subcategories" "subcategory"
      ON "subcategory"."category_id" = "category"."id"
      AND "subcategory"."slug" = "seed"."subcategory_slug"
    WHERE "subcategory"."id" IS NULL
  ) "missing";

  IF missing_reference_count > 0 THEN
    RAISE EXCEPTION 'Today brique verre seed aborted: % required catalog reference(s) are missing.', missing_reference_count;
  END IF;
END $$;

INSERT INTO "products" (
  "brand_id",
  "product_type_id",
  "kind",
  "lifecycle",
  "slug",
  "sku",
  "name",
  "display_name",
  "rich_text_description",
  "title_seo",
  "description_seo",
  "tags",
  "guarantee_months",
  "visible_ecommerce",
  "visible_vitrine",
  "is_featured",
  "is_new",
  "stock_available",
  "stock_alert_threshold",
  "stock_unit",
  "stock_availability",
  "stock_visibility",
  "base_price_ttc_tnd",
  "current_price_ttc_tnd",
  "vat_rate",
  "price_visibility",
  "created_at",
  "updated_at"
)
SELECT
  "brand"."id",
  "template"."id",
  "seed"."kind"::"ProductKind",
  'ACTIVE'::"ProductLifecycle",
  "seed"."slug",
  "seed"."sku",
  left("seed"."name", 255),
  left("seed"."display_name", 255),
  jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."intro"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."details"))
      )
    )
  )::json,
  left("seed"."title_seo", 60),
  left("seed"."description_seo", 160),
  "seed"."tags",
  0,
  true,
  true,
  false,
  false,
  "seed"."stock_available",
  0,
  "seed"."stock_unit"::"StockUnit",
  CASE
    WHEN "seed"."stock_available" > 0 THEN 'IN_STOCK'::"ProductAvailability"
    ELSE 'OUT_OF_STOCK'::"ProductAvailability"
  END,
  'AUTO'::"ProductInventoryVisibility",
  "seed"."price_ttc",
  "seed"."price_ttc",
  "seed"."vat_rate",
  'AUTO'::"ProductPricingVisibility",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_brique_verre_products" "seed"
JOIN "organizations" "brand"
  ON "brand"."slug" = "seed"."brand_slug"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("sku") DO UPDATE SET
  "brand_id" = EXCLUDED."brand_id",
  "product_type_id" = EXCLUDED."product_type_id",
  "kind" = EXCLUDED."kind",
  "lifecycle" = EXCLUDED."lifecycle",
  "slug" = EXCLUDED."slug",
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
USING "products" "product", "_today_brique_verre_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_today_brique_verre_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_today_brique_verre_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = "seed"."category_slug"
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = "seed"."subcategory_slug"
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_media" "product_media"
USING "products" "product", "_today_brique_verre_products" "seed"
WHERE "product_media"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "product_media"."role" IN (
    'GALLERY'::"ProductMediaRole",
    'TECHNICAL'::"ProductMediaRole",
    'CERTIFICATE'::"ProductMediaRole"
  );

INSERT INTO "product_media" (
  "product_id", "media_id", "role", "name", "alt_text", "sort_order", "created_at", "updated_at"
)
SELECT
  "product"."id",
  "media_seed"."media_id",
  "media_seed"."role"::"ProductMediaRole",
  regexp_replace("media"."original_filename", '\.[^.]+$', ''),
  "media_seed"."alt_text",
  "media_seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_brique_verre_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
CROSS JOIN LATERAL jsonb_to_recordset("seed"."media") AS "media_seed"(
  "media_id" BIGINT,
  "role" TEXT,
  "alt_text" TEXT,
  "sort_order" INTEGER
)
JOIN "media" "media"
  ON "media"."id" = "media_seed"."media_id"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_today_brique_verre_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    'brick_type',
    'material',
    'glass_tint',
    'glass_block_pattern',
    'dimensions_text',
    'weight_kg'
  );

INSERT INTO "product_attributes" (
  "product_id", "attribute_def_id", "attribute_group_id", "name", "label", "value",
  "unit", "input_type", "is_required", "is_filterable", "group_name", "group_sort_order", "sort_order"
)
SELECT
  "product"."id",
  "definition"."id",
  "type_attribute"."attribute_group_id",
  "definition"."key",
  "definition"."label",
  "attribute_seed"."value",
  "definition"."unit",
  "definition"."input_type",
  COALESCE("type_attribute"."is_required", false),
  COALESCE("type_attribute"."is_filterable", false),
  "attribute_group"."name",
  COALESCE("attribute_group"."sort_order", 0),
  COALESCE("type_attribute"."sort_order", 0)
FROM "_today_brique_verre_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
CROSS JOIN LATERAL jsonb_to_recordset("seed"."attributes") AS "attribute_seed"(
  "key" TEXT,
  "value" TEXT
)
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "attribute_seed"."key"
LEFT JOIN "product_type_attributes" "type_attribute"
  ON "type_attribute"."product_type_id" = "product"."product_type_id"
  AND "type_attribute"."attribute_definition_id" = "definition"."id"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."id" = "type_attribute"."attribute_group_id";

DO $$
DECLARE
  seeded_product_count INTEGER;
  seeded_media_count INTEGER;
  seeded_attribute_count INTEGER;
  seeded_subcategory_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO seeded_product_count
  FROM "_today_brique_verre_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
    AND "product"."kind" = 'SINGLE'::"ProductKind"
    AND "product"."stock_unit" = 'PIECE'::"StockUnit";

  IF seeded_product_count <> 3 THEN
    RAISE EXCEPTION 'Today brique verre validation failed: expected 3 products, found %.', seeded_product_count;
  END IF;

  SELECT COUNT(*)
  INTO seeded_media_count
  FROM "_today_brique_verre_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL jsonb_to_recordset("seed"."media") AS "media_seed"(
    "media_id" BIGINT,
    "role" TEXT,
    "alt_text" TEXT,
    "sort_order" INTEGER
  )
  JOIN "product_media" "product_media"
    ON "product_media"."product_id" = "product"."id"
    AND "product_media"."media_id" = "media_seed"."media_id"
    AND "product_media"."role" = "media_seed"."role"::"ProductMediaRole";

  IF seeded_media_count <> 6 THEN
    RAISE EXCEPTION 'Today brique verre validation failed: expected 6 gallery media links, found %.', seeded_media_count;
  END IF;

  SELECT COUNT(*)
  INTO seeded_attribute_count
  FROM "_today_brique_verre_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_attributes" "attribute"
    ON "attribute"."product_id" = "product"."id"
    AND "attribute"."name" IN (
      'brick_type',
      'material',
      'glass_tint',
      'glass_block_pattern',
      'dimensions_text',
      'weight_kg'
    );

  IF seeded_attribute_count <> 18 THEN
    RAISE EXCEPTION 'Today brique verre validation failed: expected 18 product attributes, found %.', seeded_attribute_count;
  END IF;

  SELECT COUNT(*)
  INTO seeded_subcategory_count
  FROM "_today_brique_verre_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_subcategory_links" "link"
    ON "link"."product_id" = "product"."id";

  IF seeded_subcategory_count <> 3 THEN
    RAISE EXCEPTION 'Today brique verre validation failed: expected 3 subcategory links, found %.', seeded_subcategory_count;
  END IF;
END $$;

DROP TABLE "_today_brique_verre_products";
DROP TABLE "_today_brique_verre_attribute_definitions";
DROP TABLE "_today_brique_verre_expected_media";
