-- Refresh the focused "Cadre en fer" family variants and attach the new uploaded WebP media.
-- These products intentionally have no brand and no datasheets.

CREATE TEMP TABLE "_cadre_refresh_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_cadre_refresh_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1721, 'CADRE 10-10 EN FER DE 05.webp', 'IMAGE'::"MediaKind"),
  (1722, 'CADRE 10-15 EN FER DE 05.webp', 'IMAGE'::"MediaKind"),
  (1723, 'CADRE 15-15 EN FER DE 6.webp', 'IMAGE'::"MediaKind"),
  (1724, 'CADRE 15-30 EN FER DE 05.webp', 'IMAGE'::"MediaKind"),
  (1725, 'CADRE 15-35 EN FER DE 05.webp', 'IMAGE'::"MediaKind"),
  (1726, 'CADRE 15-40 EN FER DE 05.webp', 'IMAGE'::"MediaKind"),
  (1727, 'CADRE 17-30 EN FER DE 05.webp', 'IMAGE'::"MediaKind"),
  (1728, 'CADRE 20-35 EN FER DE 05.webp', 'IMAGE'::"MediaKind"),
  (1729, 'CADRE 25-25 EN FER DE 05.webp', 'IMAGE'::"MediaKind"),
  (1730, 'CADRE 25-30 EN FER DE 05.webp', 'IMAGE'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "product_type_templates" WHERE "id" = 39 AND "slug" = 'treillis-fer-beton'
  ) THEN
    RAISE EXCEPTION 'Missing product_type_templates id 39 / treillis-fer-beton.';
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
  FROM "_cadre_refresh_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot refresh Cadre en fer media: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;
END $$;

INSERT INTO "product_attribute_groups" (
  "product_type_id", "name", "slug", "sort_order", "created_at", "updated_at"
)
VALUES (
  39,
  'Dimensions',
  'dimensions',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_cadre_refresh_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_cadre_refresh_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "is_filterable", "sort_order"
)
VALUES
  ('dimensions_text', 'Dimensions', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 0),
  ('fer_diameter_mm', 'Diamètre fer', 'mm', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 10);

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
FROM "_cadre_refresh_attribute_definitions"
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "unit" = EXCLUDED."unit",
  "input_type" = EXCLUDED."input_type",
  "select_options" = EXCLUDED."select_options",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_type_attributes" (
  "product_type_id", "attribute_group_id", "attribute_definition_id",
  "is_required", "is_filterable", "sort_order", "created_at", "updated_at"
)
SELECT
  39,
  "attribute_group"."id",
  "definition"."id",
  false,
  "seed"."is_filterable",
  "seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_cadre_refresh_attribute_definitions" "seed"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "seed"."key"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."product_type_id" = 39
  AND "attribute_group"."slug" = 'dimensions'
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "attribute_group_id" = EXCLUDED."attribute_group_id",
  "is_required" = EXCLUDED."is_required",
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_cadre_refresh_products" (
  "sku" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "dimensions_text" TEXT NOT NULL,
  "fer_diameter_mm" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  "main_media_id" BIGINT NOT NULL
);

INSERT INTO "_cadre_refresh_products" (
  "sku", "slug", "name", "display_name", "price_ttc", "stock_available",
  "dimensions_text", "fer_diameter_mm", "sort_order", "main_media_id"
)
VALUES
  ('00207768', 'cadre-10-10-en-fer-de-05-00207768', 'CADRE 10/10 EN FER DE 05', 'Cadre 10/10 en fer de 05', 0.360, 30.000, '10/10', '5', 0, 1721),
  ('00004005', 'cadre-10-15-en-fer-de-05-00004005', 'CADRE 10/15 EN FER DE 05', 'Cadre 10/15 en fer de 05', 0.420, 1246.000, '10/15', '5', 2, 1722),
  ('00004006', 'cadre-15-15-en-fer-de-05-00004006', 'CADRE 15/15 EN FER DE 05', 'Cadre 15/15 en fer de 05', 0.490, 2830.000, '15/15', '5', 19, 1723),
  ('00184984', 'cadre-15-30-en-fer-de-05-00184984', 'CADRE 15/30 EN FER DE 05', 'Cadre 15/30 en fer de 05', 0.730, 307.000, '15/30', '5', 24, 1724),
  ('DIV01CADR35', 'cadre-15-35-en-fer-de-05-div01cadr35', 'CADRE 15/35 EN FER DE 05', 'Cadre 15/35 en fer de 05', 0.830, 1.000, '15/35', '5', 25, 1725),
  ('DIV01CADR40', 'cadre-15-40-en-fer-de-05-div01cadr40', 'CADRE 15/40 EN FER DE 05', 'Cadre 15/40 en fer de 05', 0.910, 200.000, '15/40', '5', 27, 1726),
  ('00221160', 'cadre-17-30-en-fer-de-05-00221160', 'CADRE 17/30 EN FER DE 05', 'Cadre 17/30 en fer de 05', 0.770, 40.000, '17/30', '5', 38, 1727),
  ('00237574', 'cadre-20-35-en-fer-de-05-00237574', 'CADRE 20/35 EN FER DE 05', 'Cadre 20/35 en fer de 05', 0.950, 190.000, '20/35', '5', 45, 1728),
  ('00219853', 'cadre-25-25-en-fer-de-05-00219853', 'CADRE 25/25 EN FER DE 05', 'Cadre 25/25 en fer de 05', 0.810, 350.000, '25/25', '5', 53, 1729),
  ('00225762', 'cadre-25-30-en-fer-de-05-00225762', 'CADRE 25/30 EN FER DE 05', 'Cadre 25/30 en fer de 05', 0.950, 10.000, '25/30', '5', 54, 1730);

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo",
  "main_image_media_id", "created_at", "updated_at"
)
VALUES (
  'cadre-en-fer',
  'Cadre en fer',
  'Treillis & fer à béton',
  'Cadres en fer pour armatures béton, disponibles en plusieurs dimensions pour les travaux de construction.',
  'Cadre en fer : variantes pour armatures béton et travaux de construction chez COBAM GROUP.',
  1721,
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
  NULL,
  39,
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
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Ce cadre en fer sert à préparer des armatures régulières pour les éléments en béton. Il aide à gagner du temps sur chantier et à choisir rapidement la dimension adaptée au coffrage ou à la zone à renforcer.'))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Sélectionnez la variante selon les dimensions recherchées et les contraintes du chantier. Le format prêt à l''emploi facilite le stockage, le comptage et l''approvisionnement des équipes.'))
      )
    )
  ),
  left("seed"."display_name" || ' | COBAM GROUP', 60),
  left("seed"."display_name" || ' : cadre en fer pour armatures béton et travaux de construction.', 160),
  trim(
    'cadre fer armature béton beton construction treillis fer-a-beton ' ||
    replace("seed"."dimensions_text", '/', '-') ||
    ' fer-05'
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
FROM "_cadre_refresh_products" "seed"
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
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = 'DIV01CADR151506';

UPDATE "products"
SET
  "lifecycle" = 'DISCONTINUED'::"ProductLifecycle",
  "visible_ecommerce" = false,
  "visible_vitrine" = false,
  "stock_available" = 0,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "sku" = 'DIV01CADR151506';

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  "seed"."sort_order"
FROM "_cadre_refresh_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = 'cadre-en-fer'
ON CONFLICT ("product_id") DO UPDATE SET
  "family_id" = EXCLUDED."family_id",
  "sort_order" = EXCLUDED."sort_order";

WITH "ranked_defaults" AS (
  SELECT
    "family"."id" AS "family_id",
    "product"."id" AS "product_id",
    row_number() OVER (
      PARTITION BY "family"."id"
      ORDER BY "product"."stock_available" DESC, "member"."sort_order" ASC, "product"."id" ASC
    ) AS "rank"
  FROM "product_families" "family"
  JOIN "product_family_members" "member"
    ON "member"."family_id" = "family"."id"
  JOIN "products" "product"
    ON "product"."id" = "member"."product_id"
  WHERE "family"."slug" = 'cadre-en-fer'
)
UPDATE "product_families" "family"
SET
  "default_product_id" = "ranked_defaults"."product_id",
  "updated_at" = CURRENT_TIMESTAMP
FROM "ranked_defaults"
WHERE "family"."id" = "ranked_defaults"."family_id"
  AND "ranked_defaults"."rank" = 1;

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_cadre_refresh_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_cadre_refresh_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'materiaux-de-construction'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'treillis-soudes-et-fers-a-beton'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_cadre_refresh_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN ('dimensions_text', 'fer_diameter_mm');

WITH "attribute_values" AS (
  SELECT "product"."id" AS "product_id", 'dimensions_text' AS "name", "seed"."dimensions_text" AS "value"
  FROM "_cadre_refresh_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'fer_diameter_mm', "seed"."fer_diameter_mm"
  FROM "_cadre_refresh_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"
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
  "definition"."label",
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
  ON "template_attribute"."product_type_id" = 39
  AND "template_attribute"."attribute_definition_id" = "definition"."id"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."id" = "template_attribute"."attribute_group_id";

CREATE TEMP TABLE "_cadre_refresh_media" (
  "sku" TEXT PRIMARY KEY,
  "media_id" BIGINT NOT NULL,
  "alt_text" TEXT NOT NULL
);

INSERT INTO "_cadre_refresh_media" ("sku", "media_id", "alt_text")
SELECT
  "seed"."sku",
  "seed"."main_media_id",
  "seed"."display_name" || ' - cadre en fer pour armature béton'
FROM "_cadre_refresh_products" "seed";

DELETE FROM "product_media" "product_media"
USING "products" "product", "_cadre_refresh_products" "seed"
WHERE "product_media"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "product_media"."role" = 'GALLERY'::"ProductMediaRole";

DELETE FROM "product_media" "product_media"
USING "products" "product"
WHERE "product_media"."product_id" = "product"."id"
  AND "product"."sku" = 'DIV01CADR151506'
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
FROM "_cadre_refresh_media" "media_link"
JOIN "products" "product"
  ON "product"."sku" = "media_link"."sku"
JOIN "_cadre_refresh_expected_media" "expected"
  ON "expected"."media_id" = "media_link"."media_id"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DROP TABLE "_cadre_refresh_media";
DROP TABLE "_cadre_refresh_products";
DROP TABLE "_cadre_refresh_attribute_definitions";
DROP TABLE "_cadre_refresh_expected_media";
