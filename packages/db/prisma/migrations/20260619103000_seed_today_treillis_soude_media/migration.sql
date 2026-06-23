-- Seed the ZIP-backed Today treillis soude products.
-- These three folders are simple products with no brand and no datasheets.

CREATE TEMP TABLE "_today_treillis_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_today_treillis_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1773, 'TREILLIS SOUDE 15-15 EP4.webp', 'IMAGE'::"MediaKind"),
  (1774, 'TREILLIS SOUDE 15-15-3 EP 3x2.4.webp', 'IMAGE'::"MediaKind"),
  (1775, 'TREILLIS SOUDE 15-30  EP3x3-2.4 SIG.webp', 'IMAGE'::"MediaKind");

CREATE TEMP TABLE "_today_treillis_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_today_treillis_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
VALUES
  ('treillis-fer-beton', 'filtres-principaux', 'Filtres principaux', 0),
  ('treillis-fer-beton', 'caracteristiques-techniques', 'Caractéristiques techniques', 20);

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
FROM "_today_treillis_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_treillis_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_today_treillis_attribute_definitions" ("key", "label", "unit", "input_type", "select_options")
VALUES
  ('product_use', 'Type de produit', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Treillis soudé']::TEXT[]),
  ('mesh_size_text', 'Maille', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('wire_diameter_mm', 'Diamètre du fil', 'mm', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('panel_size_text', 'Format panneau', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]);

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
FROM "_today_treillis_attribute_definitions"
ON CONFLICT ("key") DO UPDATE SET
  "select_options" = (
    SELECT ARRAY(
      SELECT DISTINCT "option"."value"
      FROM unnest("product_attribute_definitions"."select_options" || EXCLUDED."select_options") AS "option"("value")
      WHERE "option"."value" <> ''
      ORDER BY "option"."value"
    )
  ),
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_treillis_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_today_treillis_type_attributes" (
  "product_type_slug", "key", "group_slug", "is_filterable", "sort_order"
)
VALUES
  ('treillis-fer-beton', 'product_use', 'filtres-principaux', true, 10),
  ('treillis-fer-beton', 'mesh_size_text', 'filtres-principaux', true, 20),
  ('treillis-fer-beton', 'wire_diameter_mm', 'filtres-principaux', true, 30),
  ('treillis-fer-beton', 'panel_size_text', 'caracteristiques-techniques', true, 40);

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
FROM "_today_treillis_type_attributes" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
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

CREATE TEMP TABLE "_today_treillis_products" AS
SELECT *
FROM jsonb_to_recordset($products$
[
  {
    "sku":"00007720",
    "slug":"treillis-soude-15x15-epaisseur-4mm-00007720",
    "name":"TREILLIS SOUDE 15/15 EP4",
    "display_name":"Treillis soudé 15x15 épaisseur 4 mm",
    "product_type_slug":"treillis-fer-beton",
    "kind":"SINGLE",
    "price_ttc":47.500,
    "stock_available":234.000,
    "stock_unit":"PIECE",
    "product_use":"Treillis soudé",
    "mesh_size_text":"15x15 cm",
    "wire_diameter_mm":4,
    "panel_size_text":null,
    "main_media_id":1773,
    "sort_order":0,
    "title_seo":"Treillis soudé 15x15 ép. 4 mm",
    "description_seo":"Treillis soudé 15x15 épaisseur 4 mm pour armature et renfort de béton sur chantier.",
    "tags":"treillis-soude treillis fer-a-beton armature beton construction renfort dalle maille-15x15 fil-4mm",
    "intro":"Treillis soudé 15x15 en fil de 4 mm, adapté aux travaux de renfort et d'armature béton.",
    "details":"Sa maille régulière aide à répartir les efforts dans les ouvrages en béton. Il convient aux chantiers de maçonnerie, dallage et renfort courant lorsque la résistance d'un fil de 4 mm est recherchée."
  },
  {
    "sku":"T15/15",
    "slug":"treillis-soude-15x15-fil-3mm-format-3x2-4-t1515",
    "name":"TREILLIS SOUDE 15/15/3 EP 3*2.4",
    "display_name":"Treillis soudé 15x15 fil 3 mm format 3x2.4 m",
    "product_type_slug":"treillis-fer-beton",
    "kind":"SINGLE",
    "price_ttc":27.730,
    "stock_available":282.000,
    "stock_unit":"PIECE",
    "product_use":"Treillis soudé",
    "mesh_size_text":"15x15 cm",
    "wire_diameter_mm":3,
    "panel_size_text":"3x2.4 m",
    "main_media_id":1774,
    "sort_order":10,
    "title_seo":"Treillis soudé 15x15 fil 3 mm",
    "description_seo":"Treillis soudé 15x15 en fil 3 mm, format 3x2.4 m, pour renfort de béton et travaux de maçonnerie.",
    "tags":"treillis-soude treillis fer-a-beton armature beton construction maille-15x15 fil-3mm format-3x2-4",
    "intro":"Treillis soudé 15x15 en fil de 3 mm, présenté en panneau 3x2.4 m pour les travaux d'armature courants.",
    "details":"Le format panneau facilite la pose sur les surfaces à renforcer. La maille 15x15 apporte un quadrillage polyvalent pour les petits ouvrages béton, les dalles légères et les reprises de maçonnerie."
  },
  {
    "sku":"T15/30",
    "slug":"treillis-soude-15x30-fil-3mm-format-3x2-4-t1530",
    "name":"TREILLIS SOUDE 15/30  EP3*3/2.4 SIG",
    "display_name":"Treillis soudé 15x30 fil 3 mm format 3x2.4 m",
    "product_type_slug":"treillis-fer-beton",
    "kind":"SINGLE",
    "price_ttc":21.430,
    "stock_available":296.000,
    "stock_unit":"PIECE",
    "product_use":"Treillis soudé",
    "mesh_size_text":"15x30 cm",
    "wire_diameter_mm":3,
    "panel_size_text":"3x2.4 m",
    "main_media_id":1775,
    "sort_order":20,
    "title_seo":"Treillis soudé 15x30 fil 3 mm",
    "description_seo":"Treillis soudé 15x30 en fil 3 mm, format 3x2.4 m, pour armature et renfort de béton.",
    "tags":"treillis-soude treillis fer-a-beton armature beton construction maille-15x30 fil-3mm format-3x2-4",
    "intro":"Treillis soudé 15x30 en fil de 3 mm, conçu pour renforcer les ouvrages béton avec une maille plus allongée.",
    "details":"La maille 15x30 permet de couvrir efficacement les zones à armer tout en conservant une pose simple en panneau. Ce format est pratique pour les travaux de construction, de rénovation et de maçonnerie générale."
  }
]$products$::jsonb) AS "product" (
  "sku" TEXT,
  "slug" TEXT,
  "name" TEXT,
  "display_name" TEXT,
  "product_type_slug" TEXT,
  "kind" TEXT,
  "price_ttc" NUMERIC(12, 3),
  "stock_available" NUMERIC(12, 3),
  "stock_unit" TEXT,
  "product_use" TEXT,
  "mesh_size_text" TEXT,
  "wire_diameter_mm" NUMERIC(12, 3),
  "panel_size_text" TEXT,
  "main_media_id" BIGINT,
  "sort_order" INTEGER,
  "title_seo" TEXT,
  "description_seo" TEXT,
  "tags" TEXT,
  "intro" TEXT,
  "details" TEXT
);

DO $$
DECLARE
  missing_media_count INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM "_today_treillis_products") <> 3 THEN
    RAISE EXCEPTION 'Expected 3 Today treillis products.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_type_templates"
    WHERE "slug" = 'treillis-fer-beton'
  ) THEN
    RAISE EXCEPTION 'Missing product type template treillis-fer-beton.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_subcategories" "subcategory"
    JOIN "product_types" "category"
      ON "category"."id" = "subcategory"."category_id"
    WHERE "category"."slug" = 'materiaux-de-construction'
      AND "subcategory"."slug" = 'treillis-soudes-et-fers-a-beton'
  ) THEN
    RAISE EXCEPTION 'Missing subcategory materiaux-de-construction / treillis-soudes-et-fers-a-beton.';
  END IF;

  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_today_treillis_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today treillis products: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;
END $$;

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
  "seed"."kind"::"ProductKind",
  NULL,
  "template"."id",
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
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."intro"))
      ),
      jsonb_build_object(
        'type', 'bulletList',
        'content', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'type', 'listItem',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'paragraph',
                  'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "item"."label" || ' : ' || "item"."value"))
                )
              )
            )
            ORDER BY "item"."sort_order"
          )
          FROM (
            VALUES
              (10, 'Maille', "seed"."mesh_size_text"),
              (20, 'Diamètre du fil', trim(to_char("seed"."wire_diameter_mm", 'FM999999990.###')) || ' mm'),
              (30, 'Format panneau', "seed"."panel_size_text")
          ) AS "item"("sort_order", "label", "value")
          WHERE "item"."value" IS NOT NULL
        )
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."details"))
      )
    )
  ),
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
  19.000,
  'AUTO'::"ProductPricingVisibility",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_treillis_products" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
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
USING "products" "product"
JOIN "_today_treillis_products" "seed"
  ON "seed"."sku" = "product"."sku"
WHERE "member"."product_id" = "product"."id";

DELETE FROM "product_subcategory_links" "link"
USING "products" "product"
JOIN "_today_treillis_products" "seed"
  ON "seed"."sku" = "product"."sku"
WHERE "link"."product_id" = "product"."id";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_today_treillis_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'materiaux-de-construction'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'treillis-soudes-et-fers-a-beton'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_media" "product_media"
USING "products" "product"
JOIN "_today_treillis_products" "seed"
  ON "seed"."sku" = "product"."sku"
WHERE "product_media"."product_id" = "product"."id"
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
  "seed"."main_media_id",
  'GALLERY'::"ProductMediaRole",
  "media"."original_filename",
  "seed"."display_name",
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_treillis_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "media" "media"
  ON "media"."id" = "seed"."main_media_id"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DELETE FROM "product_attributes" "attribute"
USING "products" "product"
JOIN "_today_treillis_products" "seed"
  ON "seed"."sku" = "product"."sku"
WHERE "attribute"."product_id" = "product"."id"
  AND "attribute"."name" IN ('product_use', 'mesh_size_text', 'wire_diameter_mm', 'panel_size_text');

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "value"."key",
    "value"."value",
    "value"."sort_order"
  FROM "_today_treillis_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL (
    VALUES
      ('product_use', "seed"."product_use", 10),
      ('mesh_size_text', "seed"."mesh_size_text", 20),
      ('wire_diameter_mm', trim(to_char("seed"."wire_diameter_mm", 'FM999999990.###')), 30),
      ('panel_size_text', "seed"."panel_size_text", 40)
  ) AS "value"("key", "value", "sort_order")
  WHERE "value"."value" IS NOT NULL
)
INSERT INTO "product_attributes" (
  "product_id", "attribute_def_id", "attribute_group_id", "name", "label", "value",
  "unit", "input_type", "is_required", "is_filterable", "group_name", "group_sort_order", "sort_order"
)
SELECT
  "attribute_values"."product_id",
  "definition"."id",
  "attribute_group"."id",
  "definition"."key",
  "definition"."label",
  "attribute_values"."value",
  "definition"."unit",
  "definition"."input_type",
  false,
  COALESCE("type_attribute"."is_filterable", false),
  "attribute_group"."name",
  COALESCE("attribute_group"."sort_order", 0),
  COALESCE("type_attribute"."sort_order", "attribute_values"."sort_order")
FROM "attribute_values"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "attribute_values"."key"
JOIN "products" "product"
  ON "product"."id" = "attribute_values"."product_id"
LEFT JOIN "product_type_attributes" "type_attribute"
  ON "type_attribute"."product_type_id" = "product"."product_type_id"
  AND "type_attribute"."attribute_definition_id" = "definition"."id"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."id" = "type_attribute"."attribute_group_id";

DO $$
DECLARE
  seeded_product_count INTEGER;
  seeded_media_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO seeded_product_count
  FROM "_today_treillis_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
    AND "product"."kind" = 'SINGLE'::"ProductKind";

  IF seeded_product_count <> 3 THEN
    RAISE EXCEPTION 'Today treillis validation failed: expected 3 products, found %.', seeded_product_count;
  END IF;

  SELECT COUNT(*)
  INTO seeded_media_count
  FROM "_today_treillis_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_media" "product_media"
    ON "product_media"."product_id" = "product"."id"
    AND "product_media"."media_id" = "seed"."main_media_id"
    AND "product_media"."role" = 'GALLERY'::"ProductMediaRole";

  IF seeded_media_count <> 3 THEN
    RAISE EXCEPTION 'Today treillis validation failed: expected 3 gallery media links, found %.', seeded_media_count;
  END IF;
END $$;

DROP TABLE "_today_treillis_products";
DROP TABLE "_today_treillis_type_attributes";
DROP TABLE "_today_treillis_attribute_definitions";
DROP TABLE "_today_treillis_attribute_groups";
DROP TABLE "_today_treillis_expected_media";
