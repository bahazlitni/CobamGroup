-- Seed ATIK / AATIK Blanc from the Etancheite Tunisienne datasheet.
-- Media: 813 is the product image, 811 is the technical datasheet.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "product_type_templates"
    WHERE "id" = 1
      AND "slug" = 'produit-pose-carrelage'
  ) THEN
    RAISE EXCEPTION 'Missing product model 1 / produit-pose-carrelage.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "media"
    WHERE "id" = 811
      AND "original_filename" = 'ATIK BLANC.pdf'
      AND "kind" = 'DOCUMENT'
      AND "deleted_at" IS NULL
  ) THEN
    RAISE EXCEPTION 'Missing datasheet media 811 / ATIK BLANC.pdf.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "media"
    WHERE "id" = 813
      AND "original_filename" = 'ATIK BLANC.webp'
      AND "kind" = 'IMAGE'
      AND "deleted_at" IS NULL
  ) THEN
    RAISE EXCEPTION 'Missing image media 813 / ATIK BLANC.webp.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_subcategories"
    WHERE "slug" IN ('etancheite', 'produits-de-pose-finition')
    HAVING COUNT(*) = 2
  ) THEN
    RAISE EXCEPTION 'Missing one or more ATIK Blanc subcategories.';
  END IF;
END $$;

INSERT INTO "organizations" (
  "slug", "name", "description", "is_product_brand", "is_reference", "is_partner", "created_at", "updated_at"
)
VALUES (
  'etancheite-tunisienne',
  'Etancheite Tunisienne',
  'Fabricant tunisien de produits d''etancheite, enduits et solutions techniques pour le batiment.',
  true,
  false,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "is_product_brand" = true,
  "updated_at" = CURRENT_TIMESTAMP;

UPDATE "product_attribute_definitions"
SET
  "select_options" = (
    SELECT ARRAY(
      SELECT DISTINCT "option"
      FROM unnest("select_options" || ARRAY['Enduit monocouche']::TEXT[]) AS "option"
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
      FROM unnest("select_options" || ARRAY['AATIK']::TEXT[]) AS "option"
      ORDER BY "option"
    )
  ),
  "updated_at" = CURRENT_TIMESTAMP
WHERE "key" = 'product_range';

CREATE TEMP TABLE "_atik_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_atik_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "sort_order"
)
VALUES
  ('mixing_water_l_per_bag', 'Eau de gachage', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 90),
  ('application_thickness_mm', 'Epaisseur par passe', 'mm', 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 100),
  ('consumption_text', 'Consommation', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 110),
  ('application_temperature_c', 'Temperature d''application', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 120),
  ('shelf_life_months', 'Conservation', 'mois', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 130),
  ('finish_aspect', 'Aspect', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 140),
  ('substrate_text', 'Supports', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], 150);

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
FROM "_atik_attribute_definitions"
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "unit" = EXCLUDED."unit",
  "input_type" = EXCLUDED."input_type",
  "select_options" = EXCLUDED."select_options",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_type_attributes" (
  "product_type_id", "attribute_group_id", "attribute_definition_id", "label",
  "is_required", "is_filterable", "sort_order", "created_at", "updated_at"
)
SELECT
  1,
  "attribute_group"."id",
  "definition"."id",
  "seed"."label",
  false,
  false,
  "seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_atik_attribute_definitions" "seed"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "seed"."key"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."product_type_id" = 1
  AND "attribute_group"."slug" = 'caracteristiques-techniques'
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "attribute_group_id" = EXCLUDED."attribute_group_id",
  "label" = EXCLUDED."label",
  "is_required" = EXCLUDED."is_required",
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

WITH "brand" AS (
  SELECT "id" FROM "organizations" WHERE "slug" = 'etancheite-tunisienne'
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
  '00244312',
  'etancheite-tunisienne-aatik-blanc-00244312',
  'SINGLE'::"ProductKind",
  "brand"."id",
  1,
  'ATIK BLANC',
  'Etancheite Tunisienne - AATIK Blanc 25kg',
  jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'heading',
        'attrs', jsonb_build_object('level', 2),
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'AATIK Blanc'))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'AATIK Blanc est un enduit monocouche teinte dans la masse, concu pour l''impermeabilisation et la decoration des facades, murs et supports interieurs ou exterieurs.'))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Il s''applique en neuf sur maconneries non enduites ou beton, et en renovation sur anciens supports non enduits ou revetus d''un mortier hydraulique sain. La finition peut etre lissee, rugueuse, brute de projection, ecrasee ou grattee selon le rendu recherche.'))
      ),
      jsonb_build_object(
        'type', 'bulletList',
        'content', jsonb_build_array(
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Conditionnement : sac kraft de 25 kg.'))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Preparation : 6 a 7 litres d''eau par sac de 25 kg pour une application lissee a la taloche.'))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Application : deux passes, dont une premiere couche d''environ 8 mm, sur support propre, stable et prealablement humidifie.'))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Consommation moyenne : 8 a 10 kg/m2 par couche de 8 mm.'))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Temperature de projection recommandee : +5 C a +35 C.'))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Conservation : 12 mois dans l''emballage d''origine, a l''abri de l''humidite.')))))
        )
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Reference COBAM : 00244312.'))
      )
    )
  ),
  'Etancheite Tunisienne - AATIK Blanc | COBAM GROUP',
  'AATIK Blanc : enduit monocouche impermeabilisation et decoration, sac 25 kg, pour interieur et exterieur chez COBAM GROUP.',
  'aatik atik blanc enduit monocouche impermeabilisation decoration facade etancheite sac-25kg',
  0,
  true,
  true,
  false,
  false,
  0,
  0,
  'PIECE'::"StockUnit",
  'OUT_OF_STOCK'::"ProductAvailability",
  'AUTO'::"ProductInventoryVisibility",
  19.000,
  19.000,
  19.000,
  'AUTO'::"ProductPricingVisibility",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "brand"
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

DELETE FROM "product_media"
WHERE "product_id" = (SELECT "id" FROM "products" WHERE "sku" = '00244312')
  AND "role" IN ('GALLERY'::"ProductMediaRole", 'TECHNICAL'::"ProductMediaRole");

INSERT INTO "product_media" (
  "product_id", "media_id", "role", "name", "alt_text", "sort_order", "created_at", "updated_at"
)
SELECT
  "product"."id",
  813,
  'GALLERY'::"ProductMediaRole",
  'ATIK BLANC.webp',
  'AATIK Blanc - enduit monocouche',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "products" "product"
WHERE "product"."sku" = '00244312'
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
  811,
  'TECHNICAL'::"ProductMediaRole",
  'ATIK BLANC.pdf',
  'Fiche technique AATIK Blanc',
  10,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "products" "product"
WHERE "product"."sku" = '00244312'
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DELETE FROM "product_subcategory_links"
WHERE "product_id" = (SELECT "id" FROM "products" WHERE "sku" = '00244312');

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "products" "product"
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."slug" IN ('etancheite', 'produits-de-pose-finition')
WHERE "product"."sku" = '00244312'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes"
WHERE "product_id" = (SELECT "id" FROM "products" WHERE "sku" = '00244312')
  AND "name" IN (
    'product_use',
    'color',
    'packaging_weight_kg',
    'ready_to_use',
    'product_range',
    'waterproof',
    'mixing_water_l_per_bag',
    'application_thickness_mm',
    'consumption_text',
    'application_temperature_c',
    'shelf_life_months',
    'finish_aspect',
    'substrate_text'
  );

CREATE TEMP TABLE "_atik_attribute_values" (
  "key" TEXT PRIMARY KEY,
  "value" TEXT NOT NULL
);

INSERT INTO "_atik_attribute_values" ("key", "value")
VALUES
  ('product_use', 'Enduit monocouche'),
  ('color', 'Blanc'),
  ('packaging_weight_kg', '25'),
  ('ready_to_use', 'false'),
  ('product_range', 'AATIK'),
  ('waterproof', 'true'),
  ('mixing_water_l_per_bag', '6 a 7 L / sac de 25 kg'),
  ('application_thickness_mm', '8'),
  ('consumption_text', '8 a 10 kg/m2 par couche de 8 mm'),
  ('application_temperature_c', '+5 C a +35 C'),
  ('shelf_life_months', '12'),
  ('finish_aspect', 'Lisse ou rugueux'),
  ('substrate_text', 'Maconneries non enduites, beton, anciens supports au mortier hydraulique sain');

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
FROM "_atik_attribute_values" "value"
JOIN "products" "product"
  ON "product"."sku" = '00244312'
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "value"."key"
JOIN "product_type_attributes" "template_attribute"
  ON "template_attribute"."product_type_id" = 1
  AND "template_attribute"."attribute_definition_id" = "definition"."id"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."id" = "template_attribute"."attribute_group_id";

DROP TABLE "_atik_attribute_values";
DROP TABLE "_atik_attribute_definitions";
