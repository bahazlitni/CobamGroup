-- Seed the ZIP-backed FLEXIBLE/FLEXIBE products from the current F package.
-- F.zip was not available locally during authoring; this seed uses the media IDs supplied
-- with the request. SKU 00181242 is intentionally ignored because no matching media/folder
-- evidence was provided, following the established product-import rule.
-- Color/Finish rule: these rows store finish only; no color attributes are inserted.

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES
  ('CHROME', 'Chrome', '#C8CDD0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('MATT_BLACK', 'Noir mat', '#111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('DORE_BROSSE', 'Doré brossé', '#C8A24A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('SILVER', 'Argenté', '#BFC3C7', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "color" = EXCLUDED."color",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_f_flexible_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_f_flexible_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
VALUES
  ('douchette-tete-bras-flexible', 'caracteristiques', 'Caractéristiques', 10),
  ('flexible-raccord-eau', 'caracteristiques', 'Caractéristiques', 10);

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
FROM "_f_flexible_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

UPDATE "product_type_templates"
SET
  "has_color" = false,
  "has_finish" = true,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "slug" IN ('douchette-tete-bras-flexible', 'flexible-raccord-eau');

INSERT INTO "product_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "created_at", "updated_at"
)
VALUES
  ('material', 'Matière', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY['Métal', 'Plastique']::TEXT[], CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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

CREATE TEMP TABLE "_f_flexible_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_f_flexible_type_attributes" (
  "product_type_slug", "key", "group_slug", "is_filterable", "sort_order"
)
VALUES
  ('douchette-tete-bras-flexible', 'material', 'caracteristiques', true, 45),
  ('flexible-raccord-eau', 'material', 'caracteristiques', true, 30);

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
FROM "_f_flexible_type_attributes" "seed"
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

CREATE TEMP TABLE "_f_flexible_products" AS
SELECT *
FROM jsonb_to_recordset($products$
[
  {
    "sku":"00237802",
    "slug":"flexible-de-douche-ari-sha-blm-571-noir-mat-jaquar-00237802",
    "brand_slug":"jaquar",
    "product_type_slug":"douchette-tete-bras-flexible",
    "name":"FLEXIBE DE DOUCHE ARI-SHA-BLM-571 BLACK MAT JAQUAR",
    "display_name":"Flexible de douche ARI-SHA-BLM-571 noir mat Jaquar",
    "price_ttc":72.958,
    "stock_available":1,
    "finish_value":"Noir mat",
    "model_reference":"ARI-SHA-BLM-571",
    "shower_set_type":"Flexible",
    "hose_length_cm":150,
    "length_cm":null,
    "dimensions_text":"1,5 m",
    "material":"Plastique",
    "application_area":"Douche",
    "intro":"Flexible de douche Jaquar ARI-SHA-BLM-571 en finition noir mat, pensé pour compléter une douche contemporaine avec un accessoire discret et cohérent.",
    "details":"La longueur de 1,5 m offre une bonne liberté d'utilisation au quotidien, tout en conservant une intégration visuelle sobre avec les mitigeurs et douchettes assortis.",
    "gallery":[1670,1683],
    "technical":[{"id":1681,"name":"Fiche technique"}]
  },
  {
    "sku":"00232791",
    "slug":"flexible-de-douche-metal-sha-gbp-549d8-opal-jaquar-00232791",
    "brand_slug":"jaquar",
    "product_type_slug":"douchette-tete-bras-flexible",
    "name":"FLEXIBE DE DOUCHE METAL SHA-GBP-549D8 OPAL JAQUAR",
    "display_name":"Flexible de douche métal SHA-GBP-549D8 Opal doré brossé Jaquar",
    "price_ttc":112.910,
    "stock_available":2,
    "finish_value":"Doré brossé",
    "model_reference":"SHA-GBP-549D8",
    "shower_set_type":"Flexible",
    "hose_length_cm":null,
    "length_cm":null,
    "dimensions_text":null,
    "material":"Métal",
    "application_area":"Douche",
    "intro":"Flexible de douche métal Jaquar SHA-GBP-549D8 Opal, avec une finition dorée brossée adaptée aux ensembles de douche premium.",
    "details":"La construction métallique renforce la présence du produit dans les compositions de robinetterie où la finition et la cohérence des accessoires comptent autant que la fonction.",
    "gallery":[1671,1684],
    "technical":[{"id":1677,"name":"Fiche technique"},{"id":1678,"name":"Guide d'installation"}]
  },
  {
    "sku":"00206860",
    "slug":"flexible-de-douche-orp-ali-chr-549d8-jaquar-00206860",
    "brand_slug":"jaquar",
    "product_type_slug":"douchette-tete-bras-flexible",
    "name":"FLEXIBE DE DOUCHE ORP-ALI-CHR-549D8 JAQUAR",
    "display_name":"Flexible de douche ORP-ALI-CHR-549D8 chromé Jaquar",
    "price_ttc":68.289,
    "stock_available":4,
    "finish_value":"Chrome",
    "model_reference":"ORP-ALI-CHR-549D8",
    "shower_set_type":"Flexible",
    "hose_length_cm":null,
    "length_cm":null,
    "dimensions_text":null,
    "material":null,
    "application_area":"Douche",
    "intro":"Flexible de douche Jaquar ORP-ALI-CHR-549D8 en finition chromée, destiné aux installations de douche qui demandent un accessoire coordonné et facile à associer.",
    "details":"La finition chrome reste polyvalente pour les salles de bain contemporaines comme classiques et s'accorde avec la majorité des douchettes et mitigeurs chromés.",
    "gallery":[1672,1685,491],
    "technical":[{"id":1679,"name":"Fiche technique"},{"id":1680,"name":"Guide d'installation"}]
  },
  {
    "sku":"00206877",
    "slug":"flexible-de-douche-plastique-1-5m-ari-sha-chr-571-jaquar-00206877",
    "brand_slug":"jaquar",
    "product_type_slug":"douchette-tete-bras-flexible",
    "name":"FLEXIBE DE DOUCHE PLASTIQUE 1.5 ARI-SHA-CHR-571 JAQUAR",
    "display_name":"Flexible de douche plastique 1,5 m ARI-SHA-CHR-571 chromé Jaquar",
    "price_ttc":63.046,
    "stock_available":10,
    "finish_value":"Chrome",
    "model_reference":"ARI-SHA-CHR-571",
    "shower_set_type":"Flexible",
    "hose_length_cm":150,
    "length_cm":null,
    "dimensions_text":"1,5 m",
    "material":"Plastique",
    "application_area":"Douche",
    "intro":"Flexible de douche plastique Jaquar ARI-SHA-CHR-571 de 1,5 m, en finition chromée pour une intégration simple dans une douche équipée.",
    "details":"Son format de 1,5 m répond aux usages courants de douche et convient aux remplacements ou compléments d'installation avec douchette à main.",
    "gallery":[1673,1686],
    "technical":[{"id":1682,"name":"Fiche technique"}]
  },
  {
    "sku":"00181259",
    "slug":"flexible-de-toilette-1m-argente-sopal-00181259",
    "brand_slug":"sopal",
    "product_type_slug":"flexible-raccord-eau",
    "name":"FLEXIBLE DE TOILETTE 1M ARGENT SOPAL",
    "display_name":"Flexible de toilette 1 m argenté Sopal",
    "price_ttc":19.622,
    "stock_available":8,
    "finish_value":"Argenté",
    "model_reference":null,
    "shower_set_type":null,
    "hose_length_cm":null,
    "length_cm":100,
    "dimensions_text":"1 m",
    "material":null,
    "application_area":"Toilette",
    "intro":"Flexible de toilette Sopal de 1 m en finition argentée, prévu pour les raccordements sanitaires simples et les points d'eau WC.",
    "details":"Son format compact facilite la mise en place dans les zones techniques étroites tout en gardant une finition discrète et propre.",
    "gallery":[1674],
    "technical":[]
  },
  {
    "sku":"00005495",
    "slug":"flexible-douche-1-5m-sopal-00005495",
    "brand_slug":"sopal",
    "product_type_slug":"douchette-tete-bras-flexible",
    "name":"FLEXIBLE DOUCHE 1.5M SOPAL",
    "display_name":"Flexible douche 1,5 m Sopal",
    "price_ttc":15.500,
    "stock_available":14,
    "finish_value":null,
    "model_reference":null,
    "shower_set_type":"Flexible",
    "hose_length_cm":150,
    "length_cm":null,
    "dimensions_text":"1,5 m",
    "material":null,
    "application_area":"Douche",
    "intro":"Flexible douche Sopal de 1,5 m, adapté au remplacement ou à l'équipement d'une douche avec douchette à main.",
    "details":"La longueur de 1,5 m apporte une amplitude confortable pour l'usage quotidien tout en restant facile à installer dans une salle de bain standard.",
    "gallery":[1675],
    "technical":[]
  },
  {
    "sku":"SOP18FLETOI",
    "slug":"flexible-robinet-toilette-1m-sopal-sop18fletoi",
    "brand_slug":"sopal",
    "product_type_slug":"flexible-raccord-eau",
    "name":"FLEXIBLE ROB.TOILETTE 1M SOPAL",
    "display_name":"Flexible robinet toilette 1 m Sopal",
    "price_ttc":13.500,
    "stock_available":9,
    "finish_value":null,
    "model_reference":null,
    "shower_set_type":null,
    "hose_length_cm":null,
    "length_cm":100,
    "dimensions_text":"1 m",
    "material":null,
    "application_area":"Toilette",
    "intro":"Flexible pour robinet de toilette Sopal de 1 m, destiné aux raccordements sanitaires de salle de bain et d'espace WC.",
    "details":"Cette longueur convient aux raccordements proches du point d'eau et aide à garder une installation nette dans les espaces compacts.",
    "gallery":[1676],
    "technical":[]
  }
]
$products$::jsonb) AS "seed"(
  "sku" TEXT,
  "slug" TEXT,
  "brand_slug" TEXT,
  "product_type_slug" TEXT,
  "name" TEXT,
  "display_name" TEXT,
  "price_ttc" NUMERIC(12, 3),
  "stock_available" NUMERIC(12, 3),
  "finish_value" TEXT,
  "model_reference" TEXT,
  "shower_set_type" TEXT,
  "hose_length_cm" NUMERIC(12, 3),
  "length_cm" NUMERIC(12, 3),
  "dimensions_text" TEXT,
  "material" TEXT,
  "application_area" TEXT,
  "intro" TEXT,
  "details" TEXT,
  "gallery" JSONB,
  "technical" JSONB
);

CREATE TEMP TABLE "_f_flexible_product_media_entries" AS
SELECT
  "seed"."sku",
  ("gallery_entry"."value")::TEXT::BIGINT AS "media_id",
  'GALLERY'::"ProductMediaRole" AS "role",
  NULL::TEXT AS "name",
  ("gallery_entry"."ordinality" - 1)::INTEGER AS "sort_order",
  'IMAGE'::"MediaKind" AS "expected_kind"
FROM "_f_flexible_products" "seed"
CROSS JOIN LATERAL jsonb_array_elements("seed"."gallery") WITH ORDINALITY AS "gallery_entry"("value", "ordinality")
UNION ALL
SELECT
  "seed"."sku",
  ("technical_entry"."value" ->> 'id')::BIGINT AS "media_id",
  'TECHNICAL'::"ProductMediaRole" AS "role",
  "technical_entry"."value" ->> 'name' AS "name",
  ("technical_entry"."ordinality" - 1)::INTEGER AS "sort_order",
  'DOCUMENT'::"MediaKind" AS "expected_kind"
FROM "_f_flexible_products" "seed"
CROSS JOIN LATERAL jsonb_array_elements("seed"."technical") WITH ORDINALITY AS "technical_entry"("value", "ordinality");

DO $$
DECLARE
  missing_brands INTEGER;
  missing_product_types INTEGER;
  missing_finishes INTEGER;
  missing_media INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_brands
  FROM (
    SELECT DISTINCT "brand_slug"
    FROM "_f_flexible_products"
    WHERE "brand_slug" IS NOT NULL
  ) "expected"
  LEFT JOIN "organizations" "brand"
    ON "brand"."slug" = "expected"."brand_slug"
  WHERE "brand"."id" IS NULL;

  IF missing_brands > 0 THEN
    RAISE EXCEPTION 'Cannot seed F flexible products: % expected brand row(s) are missing.', missing_brands;
  END IF;

  SELECT COUNT(*)
  INTO missing_product_types
  FROM (
    SELECT DISTINCT "product_type_slug" FROM "_f_flexible_products"
  ) "expected"
  LEFT JOIN "product_type_templates" "template"
    ON "template"."slug" = "expected"."product_type_slug"
  WHERE "template"."id" IS NULL;

  IF missing_product_types > 0 THEN
    RAISE EXCEPTION 'Cannot seed F flexible products: % expected product type row(s) are missing.', missing_product_types;
  END IF;

  SELECT COUNT(*)
  INTO missing_finishes
  FROM (
    SELECT DISTINCT "finish_value"
    FROM "_f_flexible_products"
    WHERE "finish_value" IS NOT NULL
  ) "expected"
  LEFT JOIN "product_finishes" "finish"
    ON lower("finish"."label") = lower("expected"."finish_value")
  WHERE "finish"."id" IS NULL;

  IF missing_finishes > 0 THEN
    RAISE EXCEPTION 'Cannot seed F flexible products: % expected finish row(s) are missing.', missing_finishes;
  END IF;

  SELECT COUNT(*)
  INTO missing_media
  FROM "_f_flexible_product_media_entries" "expected"
  LEFT JOIN "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."kind" = "expected"."expected_kind"
  WHERE "media"."id" IS NULL;

  IF missing_media > 0 THEN
    RAISE EXCEPTION 'Cannot seed F flexible media: % expected media row(s) are missing or have the wrong kind.', missing_media;
  END IF;
END $$;

INSERT INTO "products" (
  "sku", "slug", "kind", "lifecycle", "brand_id", "product_type_id", "name", "display_name",
  "rich_text_description", "title_seo", "description_seo", "tags",
  "guarantee_months", "visible_ecommerce", "visible_vitrine", "is_featured", "is_new",
  "stock_available", "stock_alert_threshold", "stock_unit", "stock_availability", "stock_visibility",
  "base_price_ttc_tnd", "current_price_ttc_tnd", "vat_rate", "price_visibility",
  "created_at", "updated_at"
)
SELECT
  "seed"."sku",
  "seed"."slug",
  'SINGLE'::"ProductKind",
  'ACTIVE'::"ProductLifecycle",
  "brand"."id",
  "template"."id",
  "seed"."name",
  "seed"."display_name",
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
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(
          jsonb_build_object(
            'type',
            'text',
            'text',
            CASE
              WHEN EXISTS (
                SELECT 1
                FROM "_f_flexible_product_media_entries" "media_entry"
                WHERE "media_entry"."sku" = "seed"."sku"
                  AND "media_entry"."role" = 'TECHNICAL'::"ProductMediaRole"
              ) THEN 'Les documents joints permettent de vérifier les informations techniques et les consignes d''installation avant achat.'
              ELSE 'Le visuel associé permet d''identifier rapidement le produit et son usage dans l''installation sanitaire.'
            END
          )
        )
      )
    )
  ),
  LEFT("seed"."display_name", 60),
  LEFT("seed"."display_name" || ' disponible chez COBAM GROUP en Tunisie pour la robinetterie, la douche et les raccordements sanitaires.', 160),
  regexp_replace(
    lower(
      concat_ws(
        ' ',
        "brand"."name",
        'flexible douche toilette robinetterie raccordement sanitaire salle de bain tunisie',
        "seed"."finish_value",
        "seed"."model_reference",
        "seed"."material"
      )
    ),
    '\s+',
    ' ',
    'g'
  ),
  0,
  true,
  true,
  false,
  false,
  "seed"."stock_available",
  0.000,
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
FROM "_f_flexible_products" "seed"
LEFT JOIN "organizations" "brand"
  ON "brand"."slug" = "seed"."brand_slug"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("sku") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "kind" = EXCLUDED."kind",
  "lifecycle" = EXCLUDED."lifecycle",
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

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_f_flexible_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND NOT EXISTS (
    SELECT 1
    FROM "product_type_subcategory_presets" "preset"
    WHERE "preset"."product_type_id" = "product"."product_type_id"
      AND "preset"."subcategory_id" = "link"."subcategory_id"
  );

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "preset"."subcategory_id"
FROM "_f_flexible_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_type_subcategory_presets" "preset"
  ON "preset"."product_type_id" = "product"."product_type_id"
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_f_flexible_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    'finish',
    'model_reference',
    'shower_set_type',
    'hose_length_cm',
    'length_cm',
    'dimensions_text',
    'material',
    'application_area',
    'color'
  );

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "product"."product_type_id",
    "attribute_seed"."name",
    "attribute_seed"."value"
  FROM "_f_flexible_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL (
    VALUES
      ('finish', "seed"."finish_value"),
      ('model_reference', "seed"."model_reference"),
      ('shower_set_type', "seed"."shower_set_type"),
      ('hose_length_cm', CASE WHEN "seed"."hose_length_cm" IS NULL THEN NULL ELSE regexp_replace(("seed"."hose_length_cm")::TEXT, '\.000$', '') END),
      ('length_cm', CASE WHEN "seed"."length_cm" IS NULL THEN NULL ELSE regexp_replace(("seed"."length_cm")::TEXT, '\.000$', '') END),
      ('dimensions_text', "seed"."dimensions_text"),
      ('material', "seed"."material"),
      ('application_area', "seed"."application_area")
  ) AS "attribute_seed"("name", "value")
  WHERE "attribute_seed"."value" IS NOT NULL
    AND "attribute_seed"."value" <> ''
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
  LEFT("attribute_values"."value", 255),
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
  ON "template_attribute"."product_type_id" = "attribute_values"."product_type_id"
  AND "template_attribute"."attribute_definition_id" = "definition"."id"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."id" = "template_attribute"."attribute_group_id";

DELETE FROM "product_media" "product_media"
USING "products" "product", "_f_flexible_products" "seed"
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
  "entry"."media_id",
  "entry"."role",
  LEFT(
    COALESCE(
      "entry"."name",
      regexp_replace(COALESCE("media"."original_filename", "product"."display_name"), '\.[^.]+$', '')
    ),
    255
  ),
  LEFT(
    CASE
      WHEN "entry"."role" = 'GALLERY'::"ProductMediaRole"
        THEN "product"."display_name" || ' - visuel ' || ("entry"."sort_order" + 1)::TEXT
      ELSE "entry"."name" || ' du ' || "product"."display_name"
    END,
    255
  ),
  "entry"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_f_flexible_product_media_entries" "entry"
JOIN "products" "product"
  ON "product"."sku" = "entry"."sku"
JOIN "media"
  ON "media"."id" = "entry"."media_id"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DO $$
DECLARE
  seeded_product_count INTEGER;
  expected_product_count INTEGER;
  seeded_media_count INTEGER;
  expected_media_count INTEGER;
  color_finish_conflicts INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO expected_product_count
  FROM "_f_flexible_products";

  SELECT COUNT(*)
  INTO seeded_product_count
  FROM "_f_flexible_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku";

  IF expected_product_count <> 7 OR seeded_product_count <> expected_product_count THEN
    RAISE EXCEPTION 'F flexible seed expected 7 products and found % expected / % seeded.', expected_product_count, seeded_product_count;
  END IF;

  SELECT COUNT(*)
  INTO expected_media_count
  FROM "_f_flexible_product_media_entries";

  SELECT COUNT(*)
  INTO seeded_media_count
  FROM "_f_flexible_product_media_entries" "entry"
  JOIN "products" "product"
    ON "product"."sku" = "entry"."sku"
  JOIN "product_media" "product_media"
    ON "product_media"."product_id" = "product"."id"
    AND "product_media"."media_id" = "entry"."media_id";

  IF expected_media_count <> 18 OR seeded_media_count <> expected_media_count THEN
    RAISE EXCEPTION 'F flexible seed expected 18 product media rows and found % expected / % seeded.', expected_media_count, seeded_media_count;
  END IF;

  WITH "special_attributes" AS (
    SELECT
      "attribute"."product_id",
      CASE
        WHEN lower("attribute"."name") = 'color'
          OR "attribute"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
          OR lower(COALESCE("definition"."key", '')) = 'color'
          THEN 'color'
        WHEN lower("attribute"."name") = 'finish'
          OR "attribute"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
          OR lower(COALESCE("definition"."key", '')) = 'finish'
          THEN 'finish'
        ELSE NULL
      END AS "special_key"
    FROM "product_attributes" "attribute"
    LEFT JOIN "product_attribute_definitions" "definition"
      ON "definition"."id" = "attribute"."attribute_def_id"
    JOIN "products" "product"
      ON "product"."id" = "attribute"."product_id"
    JOIN "_f_flexible_products" "seed"
      ON "seed"."sku" = "product"."sku"
  )
  SELECT COUNT(*)
  INTO color_finish_conflicts
  FROM (
    SELECT "product_id"
    FROM "special_attributes"
    WHERE "special_key" IN ('color', 'finish')
    GROUP BY "product_id"
    HAVING bool_or("special_key" = 'color') AND bool_or("special_key" = 'finish')
  ) "conflicts";

  IF color_finish_conflicts > 0 THEN
    RAISE EXCEPTION 'F flexible seed produced % product(s) with both Color and Finish attributes.', color_finish_conflicts;
  END IF;
END $$;
