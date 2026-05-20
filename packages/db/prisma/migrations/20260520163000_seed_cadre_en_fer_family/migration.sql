-- Seed the "Cadre en fer" product family.
-- Product model: Treillis & fer a beton (product_type_templates.id = 39).
-- Attribute populated: dimensions_text / Dimensions.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "product_type_templates" WHERE "id" = 39
  ) THEN
    RAISE EXCEPTION 'Missing product_type_templates id 39.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_attribute_definitions"
    WHERE "id" = 24 AND "key" = 'dimensions_text'
  ) THEN
    RAISE EXCEPTION 'Missing dimensions_text attribute definition id 24.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_type_attributes"
    WHERE "product_type_id" = 39
      AND "attribute_definition_id" = 24
  ) THEN
    RAISE EXCEPTION 'Product model 39 is missing the dimensions_text attribute.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_subcategories"
    WHERE "slug" = 'treillis-soudes-et-fers-a-beton'
  ) THEN
    RAISE EXCEPTION 'Missing treillis-soudes-et-fers-a-beton subcategory.';
  END IF;
END $$;

CREATE TEMP TABLE "_seed_cadre_en_fer" (
  "sku" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "dimensions_text" TEXT NOT NULL,
  "fer_diameter" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_seed_cadre_en_fer" (
  "sku", "name", "price_ttc", "stock_available", "dimensions_text", "fer_diameter", "sort_order"
)
VALUES
  ('00207768', 'CADRE 10/10 EN FER DE 05', 0.360, 30, '10/10', '05', 0),
  ('00233804', 'CADRE 10/13 EN FER DE 05', 0.410, 0, '10/13', '05', 1),
  ('00004005', 'CADRE 10/15 EN FER DE 05', 0.420, 1246, '10/15', '05', 2),
  ('00188203', 'CADRE 10/20 EN FER DE 05', 0.480, 0, '10/20', '05', 3),
  ('00193221', 'CADRE 10/25 EN FER DE 05', 0.653, 0, '10/25', '05', 4),
  ('00222914', 'CADRE 10/30 EN FER DE 05', 0.670, 0, '10/30', '05', 5),
  ('00226608', 'CADRE 10/35 EN FER DE 05', 0.720, 0, '10/35', '05', 6),
  ('00206488', 'CADRE 10/40 EN FER DE 05', 0.950, 0, '10/40', '05', 7),
  ('00250061', 'CADRE 10/50 EN FER DE 05', 1.160, 0, '10/50', '05', 8),
  ('00221283', 'CADRE 12/12 EN FER DE 05', 0.580, 0, '12/12', '05', 9),
  ('00231756', 'CADRE 12/17 EN FER DE 05', 0.520, 0, '12/17', '05', 10),
  ('00224970', 'CADRE 12/18 EN FER DE 05', 0.520, 0, '12/18', '05', 11),
  ('00231459', 'CADRE 12/27 EN FER DE 05', 0.670, 0, '12/27', '05', 12),
  ('00246897', 'CADRE 13/13 EN FER DE 05', 0.520, 0, '13/13', '05', 13),
  ('00229449', 'CADRE 13/20 EN FER DE 05', 0.580, 0, '13/20', '05', 14),
  ('00246880', 'CADRE 13/25 EN FER DE 05', 0.630, 0, '13/25', '05', 15),
  ('00252836', 'CADRE 13/75 EN FER DE 05', 1.590, 0, '13/75', '05', 16),
  ('00248907', 'CADRE 14/16 EN FER DE 05', 0.610, 0, '14/16', '05', 17),
  ('00225120', 'CADRE 14/22 EN FER DE 05', 0.610, 0, '14/22', '05', 18),
  ('00004006', 'CADRE 15/15 EN FER DE 05', 0.490, 2830, '15/15', '05', 19),
  ('00245227', 'CADRE 15/17 EN FER DE 05', 0.610, 0, '15/17', '05', 20),
  ('DIV01CADR1520', 'CADRE 15/20 EN FER DE 05', 0.580, 0, '15/20', '05', 21),
  ('00004007', 'CADRE 15/25 EN FER DE 05', 0.670, 0, '15/25', '05', 22),
  ('00235037', 'CADRE 15/25 EN FER DE 06', 0.730, 0, '15/25', '06', 23),
  ('00184984', 'CADRE 15/30 EN FER DE 05', 0.730, 307, '15/30', '05', 24),
  ('DIV01CADR35', 'CADRE 15/35 EN FER DE 05', 0.830, 1, '15/35', '05', 25),
  ('00245265', 'CADRE 15/38 EN FER DE 05', 0.890, 0, '15/38', '05', 26),
  ('DIV01CADR40', 'CADRE 15/40 EN FER DE 05', 0.910, 200, '15/40', '05', 27),
  ('00217811', 'CADRE 15/45 EN FER DE 05', 1.000, 0, '15/45', '05', 28),
  ('00198882', 'CADRE 15/50 EN FER DE 05', 1.150, 0, '15/50', '05', 29),
  ('00217828', 'CADRE 15/55 EN FER DE 05', 1.180, 0, '15/55', '05', 30),
  ('00219877', 'CADRE 15/60 EN FER DE 05', 1.290, 0, '15/60', '05', 31),
  ('00252829', 'CADRE 16/22 EN FER DE 05', 0.720, 0, '16/22', '05', 32),
  ('00252812', 'CADRE 16/45 EN FER DE 05', 1.000, 0, '16/45', '05', 33),
  ('00179485', 'CADRE 17/17 EN FER DE 05', 0.700, 0, '17/17', '05', 34),
  ('00221153', 'CADRE 17/20 EN FER DE 05', 0.630, 0, '17/20', '05', 35),
  ('DIV01CADR1725', 'CADRE 17/25 EN FER DE 05', 0.795, 0, '17/25', '05', 36),
  ('00249843', 'CADRE 17/27 EN FER DE 05', 0.770, 0, '17/27', '05', 37),
  ('00221160', 'CADRE 17/30 EN FER DE 05', 0.770, 40, '17/30', '05', 38),
  ('00221177', 'CADRE 17/35 EN FER DE 05', 0.870, 0, '17/35', '05', 39),
  ('00221184', 'CADRE 17/40 EN FER DE 05', 0.910, 0, '17/40', '05', 40),
  ('00221191', 'CADRE 17/45 EN FER DE 05', 1.000, 0, '17/45', '05', 41),
  ('00193924', 'CADRE 20/20 EN FER DE 05', 0.670, 0, '20/20', '05', 42),
  ('00213042', 'CADRE 20/25 EN FER DE 05', 0.730, 0, '20/25', '05', 43),
  ('00243360', 'CADRE 20/30 EN FER DE 05', 0.830, 0, '20/30', '05', 44),
  ('00237574', 'CADRE 20/35 EN FER DE 05', 0.950, 190, '20/35', '05', 45),
  ('00232418', 'CADRE 20/40 EN FER DE 05', 0.980, 0, '20/40', '05', 46),
  ('00220910', 'CADRE 20/45 EN FER DE 05', 1.060, 0, '20/45', '05', 47),
  ('00221207', 'CADRE 20/55 EN FER DE 05', 1.300, 0, '20/55', '05', 48),
  ('00249850', 'CADRE 22/22 EN FER DE 05', 0.730, 0, '22/22', '05', 49),
  ('00249874', 'CADRE 22/25 EN FER DE 05', 0.760, 0, '22/25', '05', 50),
  ('00249836', 'CADRE 22/35 EN FER DE 05', 0.980, 0, '22/35', '05', 51),
  ('00220927', 'CADRE 23/53 EN FER DE 05', 1.320, 0, '23/53', '05', 52),
  ('00219853', 'CADRE 25/25 EN FER DE 05', 0.810, 350, '25/25', '05', 53),
  ('00225762', 'CADRE 25/30 EN FER DE 05', 0.950, 10, '25/30', '05', 54),
  ('00223379', 'CADRE 25/35 EN FER DE 05', 1.000, 0, '25/35', '05', 55),
  ('00219860', 'CADRE 25/40 EN FER DE 05', 1.060, 0, '25/40', '05', 56),
  ('00219884', 'CADRE 25/45 EN FER DE 05', 1.140, 0, '25/45', '05', 57),
  ('00225151', 'CADRE 30/30 EN FER DE 05', 0.980, 0, '30/30', '05', 58),
  ('00222617', 'CADRE 30/40 EN FER DE 05', 1.200, 0, '30/40', '05', 59);

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo", "created_at", "updated_at"
)
VALUES (
  'cadre-en-fer',
  'Cadre en fer',
  'Treillis & fer a beton',
  'Cadres en fer pour armatures beton, disponibles en plusieurs dimensions pour les travaux de construction.',
  'Cadre en fer : variantes pour armatures beton et travaux de construction chez COBAM GROUP.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "updated_at" = CURRENT_TIMESTAMP;

WITH "enriched" AS (
  SELECT
    "seeded".*,
    'Cadre ' || "seeded"."dimensions_text" || ' en fer de ' || "seeded"."fer_diameter" AS "display_name",
    regexp_replace(
      lower(
        regexp_replace(
          'cadre-' || "seeded"."dimensions_text" || '-en-fer-de-' || "seeded"."fer_diameter" || '-' || "seeded"."sku",
          '[^a-zA-Z0-9]+',
          '-',
          'g'
        )
      ),
      '(^-+|-+$)',
      '',
      'g'
    ) AS "slug"
  FROM "_seed_cadre_en_fer" "seeded"
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
  "enriched"."sku",
  "enriched"."slug",
  'VARIANT'::"ProductKind",
  NULL,
  39,
  "enriched"."name",
  left("enriched"."display_name", 255),
  jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'heading',
        'attrs', jsonb_build_object('level', 2),
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "enriched"."display_name"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "enriched"."display_name" || ' est un cadre en fer pour armatures beton et travaux de construction.'))
      ),
      jsonb_build_object(
        'type', 'bulletList',
        'content', jsonb_build_array(
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'SKU : ' || "enriched"."sku"))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Dimensions : ' || "enriched"."dimensions_text"))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Fer : ' || "enriched"."fer_diameter"))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Stock : ' || "enriched"."stock_available"::TEXT)))))
        )
      )
    )
  ),
  left("enriched"."display_name" || ' | COBAM GROUP', 60),
  left("enriched"."display_name" || ' : cadre en fer pour armatures beton et construction chez COBAM GROUP.', 160),
  'treillis fer-a-beton armature construction cadre-en-fer',
  0,
  true,
  true,
  false,
  false,
  "enriched"."stock_available",
  0,
  'PIECE'::"StockUnit",
  CASE
    WHEN "enriched"."stock_available" > 0 THEN 'IN_STOCK'::"ProductAvailability"
    ELSE 'OUT_OF_STOCK'::"ProductAvailability"
  END,
  'AUTO'::"ProductInventoryVisibility",
  "enriched"."price_ttc",
  "enriched"."price_ttc",
  19.000,
  'AUTO'::"ProductPricingVisibility",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "enriched"
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
  "last_updated_by_id" = EXCLUDED."last_updated_by_id",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "families"."id",
  "products"."id",
  "seeded"."sort_order"
FROM "_seed_cadre_en_fer" "seeded"
JOIN "products" ON "products"."sku" = "seeded"."sku"
JOIN "product_families" "families" ON "families"."slug" = 'cadre-en-fer'
ON CONFLICT ("product_id") DO UPDATE SET
  "family_id" = EXCLUDED."family_id",
  "sort_order" = EXCLUDED."sort_order";

WITH "ranked_defaults" AS (
  SELECT
    "families"."id" AS "family_id",
    "products"."id" AS "product_id",
    ROW_NUMBER() OVER (
      PARTITION BY "families"."id"
      ORDER BY "products"."stock_available" DESC, "members"."sort_order" ASC, "products"."id" ASC
    ) AS "rank"
  FROM "product_family_members" "members"
  JOIN "products" ON "products"."id" = "members"."product_id"
  JOIN "product_families" "families" ON "families"."id" = "members"."family_id"
  WHERE "families"."slug" = 'cadre-en-fer'
)
UPDATE "product_families" "families"
SET "default_product_id" = "ranked_defaults"."product_id",
    "updated_at" = CURRENT_TIMESTAMP
FROM "ranked_defaults"
WHERE "families"."id" = "ranked_defaults"."family_id"
  AND "ranked_defaults"."rank" = 1;

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "products"."id",
  "subcategories"."id"
FROM "_seed_cadre_en_fer" "seeded"
JOIN "products" ON "products"."sku" = "seeded"."sku"
JOIN "product_subcategories" "subcategories"
  ON "subcategories"."slug" = 'treillis-soudes-et-fers-a-beton'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes"
USING "_seed_cadre_en_fer" "seeded", "products"
WHERE "products"."sku" = "seeded"."sku"
  AND "product_attributes"."product_id" = "products"."id"
  AND "product_attributes"."name" = 'dimensions_text';

INSERT INTO "product_attributes" (
  "product_id", "attribute_def_id", "attribute_group_id", "name", "label", "value", "unit", "input_type",
  "is_required", "is_filterable", "group_name", "group_sort_order", "sort_order"
)
SELECT
  "products"."id",
  "definitions"."id",
  "attribute_groups"."id",
  "definitions"."key",
  COALESCE(NULLIF("type_attributes"."label", ''), "definitions"."label"),
  "seeded"."dimensions_text",
  "definitions"."unit",
  "definitions"."input_type",
  "type_attributes"."is_required",
  "type_attributes"."is_filterable",
  "attribute_groups"."name",
  COALESCE("attribute_groups"."sort_order", 0),
  "type_attributes"."sort_order"
FROM "_seed_cadre_en_fer" "seeded"
JOIN "products" ON "products"."sku" = "seeded"."sku"
JOIN "product_attribute_definitions" "definitions"
  ON "definitions"."key" = 'dimensions_text'
JOIN "product_type_attributes" "type_attributes"
  ON "type_attributes"."product_type_id" = 39
 AND "type_attributes"."attribute_definition_id" = "definitions"."id"
LEFT JOIN "product_attribute_groups" "attribute_groups"
  ON "attribute_groups"."id" = "type_attributes"."attribute_group_id";

DROP TABLE "_seed_cadre_en_fer";
