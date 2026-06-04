-- Seed Geberit abattant WC products and attach the uploaded Geberit media.
-- Products are simple products linked to the existing Geberit brand (organizations.id = 7).

INSERT INTO "product_attribute_groups" (
  "product_type_id", "name", "slug", "sort_order", "created_at", "updated_at"
)
SELECT
  7,
  'Filtres principaux',
  'filtres-principaux',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE EXISTS (
  SELECT 1 FROM "product_type_templates" WHERE "id" = 7 AND "slug" = 'abattant-wc'
)
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_geberit_abattant_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_geberit_abattant_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "is_filterable", "sort_order"
)
VALUES
  ('model_reference', 'Reference modele', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 0),
  ('seat_type', 'Type d''abattant', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Standard', 'Soft-close', 'Slim soft-close']::TEXT[], true, 5),
  ('soft_close', 'Fermeture amortie', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 10),
  ('slim_seat', 'Design slim', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 20),
  ('color', 'Couleur', NULL, 'COLOR'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 30),
  ('material', 'Matiere', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Duroplast']::TEXT[], true, 35),
  ('dimensions_text', 'Dimensions', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 50),
  ('fastening', 'Fixation', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Par le haut', 'Par le bas']::TEXT[], true, 55),
  ('fastening_distance_cm', 'Entraxe de fixation', 'cm', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 60),
  ('quick_release', 'Charniere declipsable', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 65),
  ('hinge_material', 'Matiere des charnieres', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Acier inoxydable', 'Laiton chrome']::TEXT[], false, 70),
  ('compatibility_notes', 'Compatibilite', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 80);

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
FROM "_geberit_abattant_attribute_definitions"
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
  7,
  "attribute_group"."id",
  "definition"."id",
  "seed"."label",
  false,
  "seed"."is_filterable",
  "seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_geberit_abattant_attribute_definitions" "seed"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "seed"."key"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."product_type_id" = 7
  AND "attribute_group"."slug" = 'filtres-principaux'
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "attribute_group_id" = EXCLUDED."attribute_group_id",
  "label" = EXCLUDED."label",
  "is_required" = EXCLUDED."is_required",
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_geberit_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_geberit_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (928, 'ABAT SMYLE AVEC AMORT (500.240.01.1) GEBERIT [1].webp', 'IMAGE'::"MediaKind"),
  (929, 'ABAT SMYLE AVEC AMORT (500.240.01.1) GEBERIT [2].webp', 'IMAGE'::"MediaKind"),
  (930, 'ABAT SMYLE AVEC AMORT (500.240.01.1) GEBERIT [3].webp', 'IMAGE'::"MediaKind"),
  (931, 'ABAT SELNOVA ABALONA SANS AMORT (500.332.01.1) GEBERIT [1].webp', 'IMAGE'::"MediaKind"),
  (932, 'ABAT SELNOVA ABALONA SANS AMORT (500.332.01.1) GEBERIT [2].webp', 'IMAGE'::"MediaKind"),
  (933, 'ABAT SELNOVA ABALONA SANS AMORT (500.332.01.1) GEBERIT [3].webp', 'IMAGE'::"MediaKind"),
  (934, 'ABAT SELNOVA ABALONA AVEC AMORT (500.334.01.1) GEBERIT [1].webp', 'IMAGE'::"MediaKind"),
  (935, 'ABAT SELNOVA ABALONA AVEC AMORT (500.334.01.1) GEBERIT [2].webp', 'IMAGE'::"MediaKind"),
  (936, 'ABAT SELNOVA ABALONA AVEC AMORT (500.334.01.1) GEBERIT [3].webp', 'IMAGE'::"MediaKind"),
  (937, 'ABAT SELNOVA ABALONA AVEC AMORT (500.334.01.1) GEBERIT (INSTRUCTIONS DE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (938, 'ABAT SELNOVA ABALONA AVEC AMORT (500.334.01.1) GEBERIT (INSTRUCTIONS D''ENTRETIEN).pdf', 'DOCUMENT'::"MediaKind"),
  (939, 'ABAT SELNOVA ABALONA AVEC AMORT (500.334.01.1) GEBERIT.pdf', 'DOCUMENT'::"MediaKind"),
  (940, 'ABAT SELNOVA ABALONA SANS AMORT (500.332.01.1) GEBERIT (INSTRUCTIONS DE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (941, 'ABAT SELNOVA ABALONA SANS AMORT (500.332.01.1) GEBERIT (INSTRUCTIONS D''ENTRETIEN).pdf', 'DOCUMENT'::"MediaKind"),
  (942, 'ABAT SELNOVA ABALONA SANS AMORT (500.332.01.1) GEBERIT.pdf', 'DOCUMENT'::"MediaKind"),
  (943, 'ABAT SMYLE AVEC AMORT (500.240.01.1) GEBERIT (INSTRUCTIONS DE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (944, 'ABAT SMYLE AVEC AMORT (500.240.01.1) GEBERIT (INSTRUCTIONS D''ENTRETIEN).pdf', 'DOCUMENT'::"MediaKind"),
  (945, 'ABAT SMYLE AVEC AMORT (500.240.01.1) GEBERIT.pdf', 'DOCUMENT'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "organizations"
    WHERE "id" = 7
      AND "slug" = 'geberit'
      AND "name" = 'Geberit'
      AND "is_product_brand" = true
  ) THEN
    RAISE EXCEPTION 'Missing expected brand organizations id 7 / Geberit.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "product_type_templates" WHERE "id" = 7 AND "slug" = 'abattant-wc'
  ) THEN
    RAISE EXCEPTION 'Missing product_type_templates id 7 / abattant-wc.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_subcategories" "subcategory"
    JOIN "product_types" "category"
      ON "category"."id" = "subcategory"."category_id"
    WHERE "category"."slug" = 'salle-de-bain-et-cuisine'
      AND "subcategory"."slug" = 'abattants-wc'
  ) THEN
    RAISE EXCEPTION 'Missing subcategory salle-de-bain-et-cuisine / abattants-wc.';
  END IF;

  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_geberit_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed Geberit abattant WC media: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;
END $$;

CREATE TEMP TABLE "_geberit_abattant_products" (
  "sku" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "model_reference" TEXT NOT NULL,
  "seat_type" TEXT NOT NULL,
  "soft_close" BOOLEAN NOT NULL,
  "slim_seat" BOOLEAN NOT NULL,
  "color_value" TEXT NOT NULL,
  "material_value" TEXT NOT NULL,
  "dimensions_text" TEXT NOT NULL,
  "fastening_value" TEXT NOT NULL,
  "fastening_distance_cm" TEXT NOT NULL,
  "quick_release" BOOLEAN NOT NULL,
  "hinge_material_value" TEXT NOT NULL,
  "compatibility_notes" TEXT NOT NULL
);

INSERT INTO "_geberit_abattant_products" (
  "sku", "slug", "name", "display_name", "sort_order",
  "price_ttc", "stock_available", "model_reference", "seat_type",
  "soft_close", "slim_seat", "color_value", "material_value",
  "dimensions_text", "fastening_value", "fastening_distance_cm",
  "quick_release", "hinge_material_value", "compatibility_notes"
)
VALUES
  (
    '00194129',
    'geberit-abattant-wc-selnova-abalona-avec-amort-500334011',
    'ABAT SELNOVA ABALONA AVEC AMORT (500.334.01.1) GEBERIT',
    'Abattant WC Selnova Abalona avec amortisseur Geberit',
    0,
    183.530,
    0.000,
    '500.334.01.1',
    'Slim soft-close',
    true,
    true,
    'Blanc',
    'Duroplast',
    '35.5 x 5 x 45 cm',
    'Par le haut',
    '15.5',
    false,
    'Laiton chrome',
    'Selnova Square / Abalona Square'
  ),
  (
    '00194143',
    'geberit-abattant-wc-selnova-abalona-sans-amort-500332011',
    'ABAT SELNOVA ABALONA SANS AMORT (500.332.01.1) GEBERIT',
    'Abattant WC Selnova Abalona sans amortisseur Geberit',
    1,
    96.470,
    1.000,
    '500.332.01.1',
    'Standard',
    false,
    false,
    'Blanc',
    'Duroplast',
    '35.5 x 5 x 45 cm',
    'Par le bas',
    '15.5',
    false,
    'Acier inoxydable',
    'Selnova Square / Abalona Square'
  ),
  (
    '00194150',
    'geberit-abattant-wc-smyle-avec-amort-500240011',
    'ABAT SMYLE AVEC AMORT (500.240.01.1) GEBERIT',
    'Abattant WC Smyle avec amortisseur Geberit',
    2,
    335.714,
    0.000,
    '500.240.01.1',
    'Slim soft-close',
    true,
    true,
    'Blanc',
    'Duroplast',
    '35 x 4.5 x 45 cm',
    'Par le haut',
    '15.5',
    false,
    'Laiton chrome',
    'Smyle Square / Modo'
  );

WITH "brand" AS (
  SELECT "id" FROM "organizations" WHERE "id" = 7 AND "slug" = 'geberit'
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
  'SINGLE'::"ProductKind",
  "brand"."id",
  7,
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
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Cet abattant WC Geberit apporte une finition propre et durable a l''espace toilettes, avec une silhouette adaptee aux cuvettes contemporaines.'))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Sa conception facilite une integration discrete dans les salles de bain familiales, hotellerie ou projets residentiels soignes.'))
      )
    )
  ),
  left("seed"."display_name", 60),
  left("seed"."display_name" || ' : abattant WC blanc disponible chez COBAM GROUP en Tunisie.', 160),
  trim(
    'abattant-wc lunette-wc geberit blanc ' ||
    lower(replace(replace("seed"."model_reference", '.', ''), ' ', '-')) || ' ' ||
    CASE WHEN "seed"."soft_close" THEN 'fermeture-amortie ' ELSE 'sans-amortisseur ' END ||
    lower(replace("seed"."compatibility_notes", ' ', '-'))
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
FROM "_geberit_abattant_products" "seed"
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
USING "products" "product", "_geberit_abattant_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_geberit_abattant_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_geberit_abattant_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'abattants-wc'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_geberit_abattant_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    'model_reference',
    'seat_type',
    'soft_close',
    'slim_seat',
    'color',
    'material',
    'dimensions_text',
    'fastening',
    'fastening_distance_cm',
    'quick_release',
    'hinge_material',
    'compatibility_notes'
  );

WITH "attribute_values" AS (
  SELECT "product"."id" AS "product_id", 'model_reference' AS "name", "seed"."model_reference" AS "value"
  FROM "_geberit_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'seat_type', "seed"."seat_type"
  FROM "_geberit_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'soft_close', CASE WHEN "seed"."soft_close" THEN 'true' ELSE 'false' END
  FROM "_geberit_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'slim_seat', CASE WHEN "seed"."slim_seat" THEN 'true' ELSE 'false' END
  FROM "_geberit_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'color', "seed"."color_value"
  FROM "_geberit_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'material', "seed"."material_value"
  FROM "_geberit_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'dimensions_text', "seed"."dimensions_text"
  FROM "_geberit_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'fastening', "seed"."fastening_value"
  FROM "_geberit_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'fastening_distance_cm', "seed"."fastening_distance_cm"
  FROM "_geberit_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'quick_release', CASE WHEN "seed"."quick_release" THEN 'true' ELSE 'false' END
  FROM "_geberit_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'hinge_material', "seed"."hinge_material_value"
  FROM "_geberit_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'compatibility_notes', "seed"."compatibility_notes"
  FROM "_geberit_abattant_products" "seed"
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
  ON "template_attribute"."product_type_id" = 7
  AND "template_attribute"."attribute_definition_id" = "definition"."id"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."id" = "template_attribute"."attribute_group_id";

CREATE TEMP TABLE "_geberit_abattant_media" (
  "sku" TEXT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "role" "ProductMediaRole" NOT NULL,
  "alt_text" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("sku", "media_id")
);

INSERT INTO "_geberit_abattant_media" ("sku", "media_id", "role", "alt_text", "sort_order")
VALUES
  ('00194129', 934, 'GALLERY'::"ProductMediaRole", 'Abattant WC Selnova Abalona Geberit blanc avec amortisseur - vue produit 1', 0),
  ('00194129', 935, 'GALLERY'::"ProductMediaRole", 'Abattant WC Selnova Abalona Geberit blanc avec amortisseur - vue produit 2', 1),
  ('00194129', 936, 'GALLERY'::"ProductMediaRole", 'Abattant WC Selnova Abalona Geberit blanc avec amortisseur - vue produit 3', 2),
  ('00194129', 939, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique abattant WC Selnova Abalona avec amortisseur Geberit', 0),
  ('00194129', 937, 'TECHNICAL'::"ProductMediaRole", 'Instructions de montage abattant WC Selnova Abalona avec amortisseur Geberit', 1),
  ('00194129', 938, 'TECHNICAL'::"ProductMediaRole", 'Instructions d''entretien abattant WC Selnova Abalona avec amortisseur Geberit', 2),

  ('00194143', 931, 'GALLERY'::"ProductMediaRole", 'Abattant WC Selnova Abalona Geberit blanc sans amortisseur - vue produit 1', 0),
  ('00194143', 932, 'GALLERY'::"ProductMediaRole", 'Abattant WC Selnova Abalona Geberit blanc sans amortisseur - vue produit 2', 1),
  ('00194143', 933, 'GALLERY'::"ProductMediaRole", 'Abattant WC Selnova Abalona Geberit blanc sans amortisseur - vue produit 3', 2),
  ('00194143', 942, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique abattant WC Selnova Abalona sans amortisseur Geberit', 0),
  ('00194143', 940, 'TECHNICAL'::"ProductMediaRole", 'Instructions de montage abattant WC Selnova Abalona sans amortisseur Geberit', 1),
  ('00194143', 941, 'TECHNICAL'::"ProductMediaRole", 'Instructions d''entretien abattant WC Selnova Abalona sans amortisseur Geberit', 2),

  ('00194150', 928, 'GALLERY'::"ProductMediaRole", 'Abattant WC Smyle Geberit blanc avec amortisseur - vue produit 1', 0),
  ('00194150', 929, 'GALLERY'::"ProductMediaRole", 'Abattant WC Smyle Geberit blanc avec amortisseur - vue produit 2', 1),
  ('00194150', 930, 'GALLERY'::"ProductMediaRole", 'Abattant WC Smyle Geberit blanc avec amortisseur - vue produit 3', 2),
  ('00194150', 945, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique abattant WC Smyle avec amortisseur Geberit', 0),
  ('00194150', 943, 'TECHNICAL'::"ProductMediaRole", 'Instructions de montage abattant WC Smyle avec amortisseur Geberit', 1),
  ('00194150', 944, 'TECHNICAL'::"ProductMediaRole", 'Instructions d''entretien abattant WC Smyle avec amortisseur Geberit', 2);

DELETE FROM "product_media" "product_media"
USING "products" "product", "_geberit_abattant_products" "seed"
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
  "media_link"."media_id",
  "media_link"."role",
  regexp_replace("expected"."expected_filename", '\.[^.]+$', ''),
  "media_link"."alt_text",
  "media_link"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_geberit_abattant_media" "media_link"
JOIN "products" "product"
  ON "product"."sku" = "media_link"."sku"
JOIN "_geberit_expected_media" "expected"
  ON "expected"."media_id" = "media_link"."media_id"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DROP TABLE "_geberit_abattant_media";
DROP TABLE "_geberit_abattant_products";
DROP TABLE "_geberit_expected_media";
DROP TABLE "_geberit_abattant_attribute_definitions";
