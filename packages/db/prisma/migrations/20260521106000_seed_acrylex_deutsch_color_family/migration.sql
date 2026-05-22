-- Seed Acrylex Deutsch Color as a two-variant paint/primer family.
-- Shared media: 814 is the product image, 815 is the technical datasheet.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "product_type_templates"
    WHERE "id" = 35
      AND "slug" = 'peinture'
  ) THEN
    RAISE EXCEPTION 'Missing product model 35 / peinture.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "media"
    WHERE "id" = 814
      AND "original_filename" = 'ACRYLEX DEUTSCH COLOR.webp'
      AND "kind" = 'IMAGE'
      AND "deleted_at" IS NULL
  ) THEN
    RAISE EXCEPTION 'Missing image media 814 / ACRYLEX DEUTSCH COLOR.webp.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "media"
    WHERE "id" = 815
      AND "original_filename" = 'ACRYLEX DEUTSCH COLOR.pdf'
      AND "kind" = 'DOCUMENT'
      AND "deleted_at" IS NULL
  ) THEN
    RAISE EXCEPTION 'Missing datasheet media 815 / ACRYLEX DEUTSCH COLOR.pdf.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_subcategories"
    WHERE "slug" IN ('peintures-d-interieur', 'peintures-d-exterieur', 'produits-de-pose-finition')
    HAVING COUNT(*) = 3
  ) THEN
    RAISE EXCEPTION 'Missing one or more Acrylex subcategories.';
  END IF;
END $$;

INSERT INTO "organizations" (
  "slug", "name", "description", "is_product_brand", "is_reference", "is_partner", "created_at", "updated_at"
)
VALUES (
  'deutsch-color',
  'Deutsch Color',
  'Marque de peintures, primaires, joints et solutions de finition pour le batiment.',
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
VALUES
  (35, 'Filtres principaux', 'filtres-principaux', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (35, 'Caracteristiques techniques', 'caracteristiques-techniques', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

UPDATE "product_attribute_definitions"
SET
  "select_options" = (
    SELECT ARRAY(
      SELECT DISTINCT "option"
      FROM unnest("select_options" || ARRAY['Primaire d''accrochage']::TEXT[]) AS "option"
      ORDER BY "option"
    )
  ),
  "updated_at" = CURRENT_TIMESTAMP
WHERE "key" = 'product_use';

UPDATE "product_attribute_definitions"
SET
  "select_options" = (
    SELECT ARRAY(
      SELECT DISTINCT "option"
      FROM unnest("select_options" || ARRAY['ACRYLEX']::TEXT[]) AS "option"
      ORDER BY "option"
    )
  ),
  "updated_at" = CURRENT_TIMESTAMP
WHERE "key" = 'product_range';

CREATE TEMP TABLE "_acrylex_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_acrylex_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "group_slug", "is_filterable", "sort_order"
)
VALUES
  ('product_use', 'Type de produit', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Primaire d''accrochage']::TEXT[], 'filtres-principaux', true, 10),
  ('packaging_weight_kg', 'Conditionnement', 'kg', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 'filtres-principaux', true, 20),
  ('ready_to_use', 'Pret a l''emploi', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 'filtres-principaux', true, 30),
  ('product_range', 'Gamme', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['ACRYLEX']::TEXT[], 'filtres-principaux', true, 40),
  ('dilution_ratio_text', 'Dilution', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 'caracteristiques-techniques', false, 50),
  ('drying_time_text', 'Temps de sechage', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 'caracteristiques-techniques', false, 60),
  ('application_tools_text', 'Application', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 'caracteristiques-techniques', false, 70),
  ('substrate_text', 'Supports', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 'caracteristiques-techniques', false, 80),
  ('shelf_life_months', 'Conservation', 'mois', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 'caracteristiques-techniques', false, 90),
  ('storage_temperature_text', 'Temperature de stockage', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 'caracteristiques-techniques', false, 100),
  ('finish_aspect', 'Aspect', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 'caracteristiques-techniques', false, 110);

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
FROM "_acrylex_attribute_definitions"
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "unit" = EXCLUDED."unit",
  "input_type" = EXCLUDED."input_type",
  "select_options" = CASE
    WHEN EXCLUDED."select_options" = ARRAY[]::TEXT[] THEN "product_attribute_definitions"."select_options"
    ELSE (
      SELECT ARRAY(
        SELECT DISTINCT "option"
        FROM unnest("product_attribute_definitions"."select_options" || EXCLUDED."select_options") AS "option"
        ORDER BY "option"
      )
    )
  END,
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_type_attributes" (
  "product_type_id", "attribute_group_id", "attribute_definition_id", "label",
  "is_required", "is_filterable", "sort_order", "created_at", "updated_at"
)
SELECT
  35,
  "attribute_group"."id",
  "definition"."id",
  "seed"."label",
  false,
  "seed"."is_filterable",
  "seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_acrylex_attribute_definitions" "seed"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "seed"."key"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."product_type_id" = 35
  AND "attribute_group"."slug" = "seed"."group_slug"
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "attribute_group_id" = EXCLUDED."attribute_group_id",
  "label" = EXCLUDED."label",
  "is_required" = EXCLUDED."is_required",
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_type_subcategory_presets" ("product_type_id", "subcategory_id")
SELECT
  35,
  "subcategory"."id"
FROM "product_subcategories" "subcategory"
WHERE "subcategory"."slug" IN ('peintures-d-interieur', 'peintures-d-exterieur')
ON CONFLICT ("product_type_id", "subcategory_id") DO NOTHING;

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo",
  "main_image_media_id", "created_at", "updated_at"
)
VALUES (
  'acrylex-deutsch-color',
  'Acrylex Deutsch Color',
  'Primaire acrylique granule',
  'Acrylex Deutsch Color prepare les murs avant un enduit griffe. Sa texture granulee aide a creer une base reguliere et plus accrocheuse pour les travaux de finition interieurs et exterieurs.',
  'Acrylex Deutsch Color : primaire acrylique granule pour murs interieurs et exterieurs chez COBAM GROUP.',
  814,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "main_image_media_id" = EXCLUDED."main_image_media_id",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_acrylex_products" (
  "sku" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "packaging_weight_kg" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_acrylex_products" (
  "sku", "name", "display_name", "slug", "price_ttc", "stock_available", "packaging_weight_kg", "sort_order"
)
VALUES
  ('00233132', 'ACRYLEX 20KG DEUTSCH COLOR', 'Deutsch Color - Acrylex 20kg', 'deutsch-color-acrylex-20kg-00233132', 75.000, 0, '20', 0),
  ('00219648', 'ACRYLEX 5KG DEUTSHCOLOR', 'Deutsch Color - Acrylex 5kg', 'deutsch-color-acrylex-5kg-00219648', 27.269, 2, '5', 1);

WITH "brand" AS (
  SELECT "id" FROM "organizations" WHERE "slug" = 'deutsch-color'
)
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
  'VARIANT'::"ProductKind",
  "brand"."id",
  35,
  "seed"."name",
  "seed"."display_name",
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
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Acrylex Deutsch Color est un primaire acrylique granule qui prepare le mur avant l''application d''un enduit griffe. Il aide le support a mieux accrocher et donne une base plus reguliere pour une finition propre.'))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Il convient aux murs interieurs et exterieurs, en neuf comme en renovation, notamment avant les finitions decoratives sur systemes d''isolation thermique ou anciens murs peints.'))
      ),
      jsonb_build_object(
        'type', 'bulletList',
        'content', jsonb_build_array(
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Conditionnement : seau de ' || "seed"."packaging_weight_kg" || ' kg.'))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Application simple au pinceau ou au rouleau.'))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'A diluer avec de l''eau avant application, selon le rendu et le support.'))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Nettoyage des outils a l''eau avant sechage.')))))
        )
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Reference COBAM : ' || "seed"."sku" || '.'))
      )
    )
  ),
  left("seed"."display_name" || ' | COBAM GROUP', 60),
  left("seed"."display_name" || ' : primaire acrylique granule pour murs interieurs et exterieurs chez COBAM GROUP.', 160),
  'acrylex deutsch-color primaire appret acrylique granule enduit-griffe peinture interieur exterieur',
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
FROM "_acrylex_products" "seed"
CROSS JOIN "brand"
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
USING "products" "product", "_acrylex_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  "seed"."sort_order"
FROM "_acrylex_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = 'acrylex-deutsch-color'
ON CONFLICT ("family_id", "product_id") DO UPDATE SET
  "sort_order" = EXCLUDED."sort_order";

WITH "ranked_defaults" AS (
  SELECT
    "product"."id" AS "product_id",
    row_number() OVER (
      ORDER BY "seed"."stock_available" DESC, "seed"."sort_order" ASC
    ) AS "rank"
  FROM "_acrylex_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
)
UPDATE "product_families" "family"
SET
  "default_product_id" = "ranked_defaults"."product_id",
  "updated_at" = CURRENT_TIMESTAMP
FROM "ranked_defaults"
WHERE "family"."slug" = 'acrylex-deutsch-color'
  AND "ranked_defaults"."rank" = 1;

DELETE FROM "product_media" "product_media"
USING "products" "product", "_acrylex_products" "seed"
WHERE "product_media"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "product_media"."role" IN ('GALLERY'::"ProductMediaRole", 'TECHNICAL'::"ProductMediaRole");

INSERT INTO "product_media" (
  "product_id", "media_id", "role", "name", "alt_text", "sort_order", "created_at", "updated_at"
)
SELECT
  "product"."id",
  814,
  'GALLERY'::"ProductMediaRole",
  'ACRYLEX DEUTSCH COLOR.webp',
  "seed"."display_name",
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_acrylex_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_media" (
  "product_id", "media_id", "role", "name", "alt_text", "sort_order", "created_at", "updated_at"
)
SELECT
  "product"."id",
  815,
  'TECHNICAL'::"ProductMediaRole",
  'ACRYLEX DEUTSCH COLOR.pdf',
  "seed"."display_name",
  10,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_acrylex_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_acrylex_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_acrylex_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."slug" IN ('peintures-d-interieur', 'peintures-d-exterieur', 'produits-de-pose-finition')
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_acrylex_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    'product_use',
    'packaging_weight_kg',
    'ready_to_use',
    'product_range',
    'dilution_ratio_text',
    'drying_time_text',
    'application_tools_text',
    'substrate_text',
    'shelf_life_months',
    'storage_temperature_text',
    'finish_aspect'
  );

CREATE TEMP TABLE "_acrylex_attribute_values" (
  "sku" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  PRIMARY KEY ("sku", "key")
);

INSERT INTO "_acrylex_attribute_values" ("sku", "key", "value")
SELECT "sku", 'product_use', 'Primaire d''accrochage' FROM "_acrylex_products"
UNION ALL
SELECT "sku", 'packaging_weight_kg', "packaging_weight_kg" FROM "_acrylex_products"
UNION ALL
SELECT "sku", 'ready_to_use', 'false' FROM "_acrylex_products"
UNION ALL
SELECT "sku", 'product_range', 'ACRYLEX' FROM "_acrylex_products"
UNION ALL
SELECT "sku", 'dilution_ratio_text', '20 a 40% d''eau' FROM "_acrylex_products"
UNION ALL
SELECT "sku", 'drying_time_text', '2 a 4 h avant revetement, 4 a 6 h entre couches' FROM "_acrylex_products"
UNION ALL
SELECT "sku", 'application_tools_text', 'Pinceau ou rouleau' FROM "_acrylex_products"
UNION ALL
SELECT "sku", 'substrate_text', 'Murs interieurs et exterieurs, supports neufs ou anciens, enduits et anciens murs peints' FROM "_acrylex_products"
UNION ALL
SELECT "sku", 'shelf_life_months', '36' FROM "_acrylex_products"
UNION ALL
SELECT "sku", 'storage_temperature_text', '+5 C a +30 C, au sec et hors gel' FROM "_acrylex_products"
UNION ALL
SELECT "sku", 'finish_aspect', 'Granule' FROM "_acrylex_products";

INSERT INTO "product_attributes" (
  "product_id", "attribute_def_id", "attribute_group_id", "name", "label", "value",
  "unit", "input_type", "is_required", "is_filterable", "group_name", "group_sort_order", "sort_order"
)
SELECT
  "product"."id",
  "definition"."id",
  "template_attribute"."attribute_group_id",
  "definition"."key",
  COALESCE(NULLIF("template_attribute"."label", ''), "definition"."label"),
  "value"."value",
  "definition"."unit",
  "definition"."input_type",
  "template_attribute"."is_required",
  "template_attribute"."is_filterable",
  "attribute_group"."name",
  COALESCE("attribute_group"."sort_order", 0),
  "template_attribute"."sort_order"
FROM "_acrylex_attribute_values" "value"
JOIN "products" "product"
  ON "product"."sku" = "value"."sku"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "value"."key"
JOIN "product_type_attributes" "template_attribute"
  ON "template_attribute"."product_type_id" = 35
  AND "template_attribute"."attribute_definition_id" = "definition"."id"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."id" = "template_attribute"."attribute_group_id";

DROP TABLE "_acrylex_attribute_values";
DROP TABLE "_acrylex_products";
DROP TABLE "_acrylex_attribute_definitions";
