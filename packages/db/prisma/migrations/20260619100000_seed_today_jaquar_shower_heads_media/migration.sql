-- Seed the ZIP-backed Today Jaquar overhead shower products.
-- All four folders are simple products, so no product family is created here.

CREATE TEMP TABLE "_today_jaquar_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_today_jaquar_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1759, 'TETE DE DOUCHE CARRE REF ALI-OHS-CHR-1605 JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1760, 'TETE DE DOUCHE CARRE REF ALI-OHS-CHR-1605 JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1761, 'TETE DE DOUCHE MAZE AVEC LED CHR-1673 JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1762, 'TETE DE DOUCHE MAZE AVEC LED CHR-1673 JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1763, 'TETE DE DOUCHE ROND 24-24 OHS-GBP-1623PD OPAL JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1764, 'TETE DE DOUCHE ROND 24-24 OHS-GBP-1623PD OPAL JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1765, 'TETE DE DOUCHE ROND REF ORP-OHS-CHR-497N JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1766, 'TETE DE DOUCHE ROND REF ORP-OHS-CHR-497N JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1767, 'TETE DE DOUCHE CARRE REF ALI-OHS-CHR-1605 JAQUAR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1768, 'TETE DE DOUCHE CARRE REF ALI-OHS-CHR-1605 JAQUAR (GUIDE D''INSTALLATION).pdf', 'DOCUMENT'::"MediaKind"),
  (1769, 'TETE DE DOUCHE MAZE AVEC LED CHR-1673 JAQUAR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1770, 'TETE DE DOUCHE ROND 24-24 OHS-GBP-1623PD OPAL JAQUAR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1771, 'TETE DE DOUCHE ROND 24-24 OHS-GBP-1623PD OPAL JAQUAR (GUIDE D''INSTALLATION).pdf', 'DOCUMENT'::"MediaKind"),
  (1772, 'TETE DE DOUCHE ROND REF ORP-OHS-CHR-497N JAQUAR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind");

CREATE TEMP TABLE "_today_jaquar_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_today_jaquar_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
VALUES
  ('douchette-tete-bras-flexible', 'filtres-principaux', 'Filtres principaux', 0),
  ('douchette-tete-bras-flexible', 'caracteristiques-techniques', 'Caractéristiques techniques', 20);

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
FROM "_today_jaquar_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_jaquar_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_today_jaquar_attribute_definitions" ("key", "label", "unit", "input_type", "select_options")
VALUES
  ('shower_set_type', 'Type', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Tête de douche']::TEXT[]),
  ('finish', 'Finition', NULL, 'FINISH'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('manufacturer_ref', 'Référence fabricant', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('product_line', 'Gamme', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('dimensions_text', 'Dimensions', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('material', 'Matière', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('mounting_type', 'Montage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Mural', 'Faux plafond']::TEXT[]),
  ('spray_modes', 'Jet', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('flow_rate_lpm', 'Débit', 'L/min', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('recommended_pressure_bar', 'Pression recommandée', 'bar', 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('lighting', 'Éclairage', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('connection_size', 'Raccordement', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('cleaning_system', 'Système de nettoyage', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]);

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
FROM "_today_jaquar_attribute_definitions"
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

CREATE TEMP TABLE "_today_jaquar_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_today_jaquar_type_attributes" (
  "product_type_slug", "key", "group_slug", "is_filterable", "sort_order"
)
VALUES
  ('douchette-tete-bras-flexible', 'shower_set_type', 'filtres-principaux', true, 10),
  ('douchette-tete-bras-flexible', 'finish', 'filtres-principaux', true, 20),
  ('douchette-tete-bras-flexible', 'mounting_type', 'filtres-principaux', true, 30),
  ('douchette-tete-bras-flexible', 'lighting', 'filtres-principaux', true, 40),
  ('douchette-tete-bras-flexible', 'manufacturer_ref', 'caracteristiques-techniques', true, 50),
  ('douchette-tete-bras-flexible', 'product_line', 'caracteristiques-techniques', true, 60),
  ('douchette-tete-bras-flexible', 'dimensions_text', 'caracteristiques-techniques', true, 70),
  ('douchette-tete-bras-flexible', 'material', 'caracteristiques-techniques', true, 80),
  ('douchette-tete-bras-flexible', 'spray_modes', 'caracteristiques-techniques', true, 90),
  ('douchette-tete-bras-flexible', 'flow_rate_lpm', 'caracteristiques-techniques', true, 100),
  ('douchette-tete-bras-flexible', 'recommended_pressure_bar', 'caracteristiques-techniques', true, 110),
  ('douchette-tete-bras-flexible', 'connection_size', 'caracteristiques-techniques', true, 120),
  ('douchette-tete-bras-flexible', 'cleaning_system', 'caracteristiques-techniques', true, 130);

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
FROM "_today_jaquar_type_attributes" "seed"
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

CREATE TEMP TABLE "_today_jaquar_products" (
  "sku" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "brand_slug" TEXT NOT NULL,
  "product_type_slug" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "stock_unit" TEXT NOT NULL,
  "shower_set_type" TEXT NOT NULL,
  "finish_key" TEXT NOT NULL,
  "finish_value" TEXT NOT NULL,
  "manufacturer_ref" TEXT NOT NULL,
  "product_line" TEXT NOT NULL,
  "dimensions_text" TEXT NOT NULL,
  "material" TEXT NOT NULL,
  "mounting_type" TEXT NOT NULL,
  "spray_modes" TEXT NOT NULL,
  "flow_rate_lpm" NUMERIC(12, 3) NOT NULL,
  "recommended_pressure_bar" TEXT NOT NULL,
  "lighting" BOOLEAN NOT NULL,
  "connection_size" TEXT NOT NULL,
  "cleaning_system" TEXT NOT NULL,
  "title_seo" TEXT NOT NULL,
  "description_seo" TEXT NOT NULL,
  "tags" TEXT NOT NULL,
  "intro" TEXT NOT NULL,
  "details" TEXT NOT NULL
);

INSERT INTO "_today_jaquar_products" (
  "sku", "slug", "name", "display_name", "brand_slug", "product_type_slug", "kind",
  "price_ttc", "stock_available", "stock_unit",
  "shower_set_type", "finish_key", "finish_value", "manufacturer_ref", "product_line",
  "dimensions_text", "material", "mounting_type", "spray_modes", "flow_rate_lpm",
  "recommended_pressure_bar", "lighting", "connection_size", "cleaning_system",
  "title_seo", "description_seo", "tags", "intro", "details"
)
VALUES
  (
    '00206822',
    'tete-de-douche-carree-15x15-inox-jaquar-ali-ohs-chr-1605-00206822',
    'TETE DE DOUCHE CARRE REF ALI-OHS-CHR-1605 JAQUAR',
    'Tête de douche carrée 15x15 inox Jaquar',
    'jaquar',
    'douchette-tete-bras-flexible',
    'SINGLE',
    251.249,
    1.000,
    'PIECE',
    'Tête de douche',
    'CHROME',
    'Chrome',
    'OHS-CHR-1605',
    'Maze',
    '15x15 cm',
    'Acier inoxydable AISI 304',
    'Mural',
    'Simple fonction',
    43.800,
    '0.5-3',
    false,
    'G1/2',
    'Rubit',
    'Tête douche carrée 15x15 Jaquar',
    'Tête de douche carrée Jaquar 15x15 murale, en acier inoxydable AISI 304 avec système Rubit anti-calcaire.',
    'tete-douche douche murale carree 15x15 chrome inox acier-inoxydable rubit anticalcaire jaquar maze salle-de-bain',
    'Cette tête de douche carrée Jaquar 15x15 cm apporte un jet de pluie net dans un format compact, adapté aux douches murales contemporaines.',
    'Son corps en acier inoxydable AISI 304, le jet simple fonction et le système Rubit facilitent l''entretien des picots et la tenue du produit au quotidien.'
  ),
  (
    '00244794',
    'tete-de-douche-maze-ronde-led-45cm-jaquar-chr-1673-00244794',
    'TETE DE DOUCHE MAZE AVEC LED CHR-1673 JAQUAR',
    'Tête de douche Maze ronde 45 cm LED Jaquar',
    'jaquar',
    'douchette-tete-bras-flexible',
    'SINGLE',
    3094.117,
    1.000,
    'PIECE',
    'Tête de douche',
    'CHROME',
    'Chrome',
    'OHS-CHR-1673',
    'Maze Prime',
    '45 cm',
    'Acier inoxydable AISI 304',
    'Faux plafond',
    'Simple fonction',
    47.000,
    '1-3',
    true,
    'G1/2',
    'Rubit',
    'Tête douche Maze LED 45 cm Jaquar',
    'Tête de douche ronde Jaquar Maze 45 cm avec LED RGB, télécommande et montage au plafond pour une douche immersive.',
    'tete-douche douche-plafond douche-ronde 45cm led rgb chromotherapie chrome inox acier-inoxydable jaquar maze-prime salle-de-bain',
    'Cette tête de douche ronde Jaquar Maze Prime transforme la douche avec un large diamètre de 45 cm et un éclairage LED RGB intégré.',
    'La pose en faux plafond, la télécommande et la construction en acier inoxydable AISI 304 en font une solution haut de gamme pour une salle de bain immersive.'
  ),
  (
    '00232814',
    'tete-de-douche-ronde-24cm-or-brillant-pvd-jaquar-ohs-gbp-1623pd-00232814',
    'TETE DE DOUCHE ROND 24/24 OHS-GBP-1623PD OPAL JAQUAR',
    'Tête de douche ronde 24 cm or brillant PVD Jaquar',
    'jaquar',
    'douchette-tete-bras-flexible',
    'SINGLE',
    1213.020,
    2.000,
    'PIECE',
    'Tête de douche',
    'BRIGHT_GOLD_PVD',
    'Or brillant PVD',
    'OHS-GBP-1623PD',
    'Maze',
    '24 cm',
    'Acier inoxydable AISI 304',
    'Mural',
    'Simple fonction',
    42.640,
    '0.5-3',
    false,
    'G1/2',
    'Rubit',
    'Tête douche ronde 24 cm PVD Jaquar',
    'Tête de douche ronde Jaquar 24 cm en finition or brillant PVD, murale, avec système Rubit anti-calcaire.',
    'tete-douche douche murale ronde 24cm or-brillant pvd gold inox acier-inoxydable rubit anticalcaire jaquar maze salle-de-bain',
    'Cette tête de douche ronde Jaquar 24 cm se distingue par sa finition or brillant PVD et son design Maze sobre.',
    'Le jet simple fonction, le corps en acier inoxydable AISI 304 et le système Rubit offrent une douche généreuse avec un entretien plus simple des buses.'
  ),
  (
    '00206815',
    'tete-de-douche-ronde-19cm-chromee-jaquar-orp-ohs-chr-497n-00206815',
    'TETE DE DOUCHE ROND REF ORP-OHS-CHR-497N JAQUAR',
    'Tête de douche ronde 19 cm chromée Jaquar',
    'jaquar',
    'douchette-tete-bras-flexible',
    'SINGLE',
    155.625,
    2.000,
    'PIECE',
    'Tête de douche',
    'CHROME',
    'Chrome',
    'OHS-CHR-497N',
    'ORP',
    '19 cm',
    'ABS',
    'Mural',
    'Simple fonction',
    35.590,
    '1-3',
    false,
    'G1/2',
    'Rubit',
    'Tête douche ronde 19 cm Jaquar',
    'Tête de douche ronde Jaquar 19 cm en finition chromée, murale, avec jet simple et système Rubit anti-calcaire.',
    'tete-douche douche murale ronde 19cm chrome abs rubit anticalcaire jaquar orp salle-de-bain',
    'Cette tête de douche ronde Jaquar 19 cm convient aux installations murales qui recherchent un format discret, chromé et facile à intégrer.',
    'Le jet simple fonction et la technologie Rubit permettent une utilisation simple au quotidien, avec un nettoyage facilité des dépôts de calcaire.'
  );

CREATE TEMP TABLE "_today_jaquar_product_media_entries" (
  "sku" TEXT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "role" "ProductMediaRole" NOT NULL,
  "name" TEXT,
  "alt_text" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  "expected_kind" "MediaKind" NOT NULL,
  PRIMARY KEY ("sku", "media_id")
);

INSERT INTO "_today_jaquar_product_media_entries" (
  "sku", "media_id", "role", "name", "alt_text", "sort_order", "expected_kind"
)
VALUES
  ('00206822', 1759, 'GALLERY'::"ProductMediaRole", NULL, 'Tête de douche carrée Jaquar 15x15 en finition chromée', 0, 'IMAGE'::"MediaKind"),
  ('00206822', 1760, 'GALLERY'::"ProductMediaRole", NULL, 'Tête de douche carrée Jaquar 15x15 en acier inoxydable', 1, 'IMAGE'::"MediaKind"),
  ('00206822', 1767, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique de la tête de douche carrée Jaquar 15x15', 0, 'DOCUMENT'::"MediaKind"),
  ('00206822', 1768, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 'Guide d''installation de la tête de douche carrée Jaquar 15x15', 1, 'DOCUMENT'::"MediaKind"),

  ('00244794', 1761, 'GALLERY'::"ProductMediaRole", NULL, 'Tête de douche ronde Maze Jaquar avec éclairage LED RGB', 0, 'IMAGE'::"MediaKind"),
  ('00244794', 1762, 'GALLERY'::"ProductMediaRole", NULL, 'Tête de douche Jaquar Maze Prime 45 cm avec télécommande', 1, 'IMAGE'::"MediaKind"),
  ('00244794', 1769, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique de la tête de douche Maze LED Jaquar 45 cm', 0, 'DOCUMENT'::"MediaKind"),

  ('00232814', 1763, 'GALLERY'::"ProductMediaRole", NULL, 'Tête de douche ronde Jaquar 24 cm en or brillant PVD', 0, 'IMAGE'::"MediaKind"),
  ('00232814', 1764, 'GALLERY'::"ProductMediaRole", NULL, 'Tête de douche ronde Jaquar Maze 24 cm finition PVD', 1, 'IMAGE'::"MediaKind"),
  ('00232814', 1770, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique de la tête de douche ronde Jaquar 24 cm PVD', 0, 'DOCUMENT'::"MediaKind"),
  ('00232814', 1771, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 'Guide d''installation de la tête de douche ronde Jaquar 24 cm PVD', 1, 'DOCUMENT'::"MediaKind"),

  ('00206815', 1765, 'GALLERY'::"ProductMediaRole", NULL, 'Tête de douche ronde Jaquar 19 cm en finition chromée', 0, 'IMAGE'::"MediaKind"),
  ('00206815', 1766, 'GALLERY'::"ProductMediaRole", NULL, 'Tête de douche ronde Jaquar ORP chromée avec système Rubit', 1, 'IMAGE'::"MediaKind"),
  ('00206815', 1772, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique de la tête de douche ronde Jaquar 19 cm', 0, 'DOCUMENT'::"MediaKind");

DO $$
DECLARE
  missing_brands INTEGER;
  missing_product_types INTEGER;
  missing_subcategories INTEGER;
  missing_media INTEGER;
  missing_finishes INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM "_today_jaquar_products") <> 4 THEN
    RAISE EXCEPTION 'Expected 4 Today Jaquar products in the seed.';
  END IF;

  SELECT COUNT(*)
  INTO missing_brands
  FROM (
    SELECT DISTINCT "brand_slug"
    FROM "_today_jaquar_products"
  ) "expected"
  LEFT JOIN "organizations" "brand"
    ON "brand"."slug" = "expected"."brand_slug"
    AND "brand"."is_product_brand" = true
  WHERE "brand"."id" IS NULL;

  IF missing_brands > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today Jaquar products: % expected brand row(s) are missing.', missing_brands;
  END IF;

  SELECT COUNT(*)
  INTO missing_product_types
  FROM (
    SELECT DISTINCT "product_type_slug" FROM "_today_jaquar_products"
  ) "expected"
  LEFT JOIN "product_type_templates" "template"
    ON "template"."slug" = "expected"."product_type_slug"
  WHERE "template"."id" IS NULL;

  IF missing_product_types > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today Jaquar products: % expected product type row(s) are missing.', missing_product_types;
  END IF;

  SELECT COUNT(*)
  INTO missing_subcategories
  FROM (VALUES (18::BIGINT)) AS "expected"("id")
  LEFT JOIN "product_subcategories" "subcategory"
    ON "subcategory"."id" = "expected"."id"
  WHERE "subcategory"."id" IS NULL;

  IF missing_subcategories > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today Jaquar products: % expected subcategory row(s) are missing.', missing_subcategories;
  END IF;

  SELECT COUNT(*)
  INTO missing_finishes
  FROM (
    SELECT DISTINCT "finish_key" FROM "_today_jaquar_products"
  ) "expected"
  LEFT JOIN "product_finishes" "finish"
    ON "finish"."key" = "expected"."finish_key"
  WHERE "finish"."id" IS NULL;

  IF missing_finishes > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today Jaquar products: % expected finish row(s) are missing.', missing_finishes;
  END IF;

  SELECT COUNT(*)
  INTO missing_media
  FROM "_today_jaquar_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today Jaquar media: % expected media row(s) are missing or mismatched.', missing_media;
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
  "seed"."kind"::"ProductKind",
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
      )
    )
  ),
  LEFT("seed"."title_seo", 60),
  LEFT("seed"."description_seo", 160),
  regexp_replace(lower("seed"."tags"), '\s+', ' ', 'g'),
  0,
  true,
  true,
  false,
  false,
  "seed"."stock_available",
  0.000,
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
FROM "_today_jaquar_products" "seed"
JOIN "organizations" "brand"
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

DELETE FROM "product_family_members" "member"
USING "products" "product", "_today_jaquar_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_today_jaquar_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  18::BIGINT
FROM "_today_jaquar_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_today_jaquar_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    'shower_set_type',
    'finish',
    'manufacturer_ref',
    'product_line',
    'dimensions_text',
    'material',
    'mounting_type',
    'spray_modes',
    'flow_rate_lpm',
    'recommended_pressure_bar',
    'lighting',
    'connection_size',
    'cleaning_system'
  );

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "product"."product_type_id",
    "attribute_seed"."name",
    "attribute_seed"."value"
  FROM "_today_jaquar_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL (
    VALUES
      ('shower_set_type', "seed"."shower_set_type"),
      ('finish', "seed"."finish_value"),
      ('manufacturer_ref', "seed"."manufacturer_ref"),
      ('product_line', "seed"."product_line"),
      ('dimensions_text', "seed"."dimensions_text"),
      ('material', "seed"."material"),
      ('mounting_type', "seed"."mounting_type"),
      ('spray_modes', "seed"."spray_modes"),
      ('flow_rate_lpm', regexp_replace(("seed"."flow_rate_lpm")::TEXT, '\.000$', '')),
      ('recommended_pressure_bar', "seed"."recommended_pressure_bar"),
      ('lighting', "seed"."lighting"::TEXT),
      ('connection_size', "seed"."connection_size"),
      ('cleaning_system', "seed"."cleaning_system")
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
USING "products" "product", "_today_jaquar_products" "seed"
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
  LEFT("entry"."alt_text", 255),
  "entry"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_jaquar_product_media_entries" "entry"
JOIN "products" "product"
  ON "product"."sku" = "entry"."sku"
JOIN "media" "media"
  ON "media"."id" = "entry"."media_id"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DO $$
DECLARE
  expected_media_count INTEGER;
  seeded_media_count INTEGER;
  seeded_product_count INTEGER;
  seeded_attribute_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO seeded_product_count
  FROM "_today_jaquar_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku";

  IF seeded_product_count <> 4 THEN
    RAISE EXCEPTION 'Today Jaquar seed expected 4 products and found %.', seeded_product_count;
  END IF;

  SELECT COUNT(*) INTO expected_media_count
  FROM "_today_jaquar_product_media_entries";

  SELECT COUNT(*) INTO seeded_media_count
  FROM "_today_jaquar_product_media_entries" "entry"
  JOIN "products" "product"
    ON "product"."sku" = "entry"."sku"
  JOIN "product_media" "product_media"
    ON "product_media"."product_id" = "product"."id"
    AND "product_media"."media_id" = "entry"."media_id";

  IF expected_media_count <> 14 OR seeded_media_count <> expected_media_count THEN
    RAISE EXCEPTION 'Today Jaquar seed expected 14 product media rows and found % expected / % seeded.', expected_media_count, seeded_media_count;
  END IF;

  SELECT COUNT(*) INTO seeded_attribute_count
  FROM "product_attributes" "attribute"
  JOIN "products" "product"
    ON "product"."id" = "attribute"."product_id"
  JOIN "_today_jaquar_products" "seed"
    ON "seed"."sku" = "product"."sku"
  WHERE "attribute"."name" IN (
    'shower_set_type',
    'finish',
    'manufacturer_ref',
    'product_line',
    'dimensions_text',
    'material',
    'mounting_type',
    'spray_modes',
    'flow_rate_lpm',
    'recommended_pressure_bar',
    'lighting',
    'connection_size',
    'cleaning_system'
  );

  IF seeded_attribute_count <> 52 THEN
    RAISE EXCEPTION 'Today Jaquar seed expected 52 product attribute rows and found %.', seeded_attribute_count;
  END IF;
END $$;

DROP TABLE "_today_jaquar_product_media_entries";
DROP TABLE "_today_jaquar_products";
DROP TABLE "_today_jaquar_type_attributes";
DROP TABLE "_today_jaquar_attribute_definitions";
DROP TABLE "_today_jaquar_attribute_groups";
DROP TABLE "_today_jaquar_expected_media";
