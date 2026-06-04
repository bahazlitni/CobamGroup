-- Refine GSI abattant WC entries from the provided GSI media package.
-- Folder shape:
-- - Kube and Modo are simple products.
-- - Nubes and Pura are product families with color variants.
-- Products are linked to the existing GSI Ceramica brand (organizations.id = 35).

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

CREATE TEMP TABLE "_gsi_abattant_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_gsi_abattant_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "is_filterable", "sort_order"
)
VALUES
  ('model_reference', 'Reference modele', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 0),
  ('seat_type', 'Type d''abattant', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Standard', 'Slim', 'Soft-close', 'Slim soft-close', 'Thermodur', 'ABS', 'Enfant']::TEXT[], true, 5),
  ('soft_close', 'Fermeture amortie', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 10),
  ('slim_seat', 'Design slim', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 20),
  ('color', 'Couleur', NULL, 'COLOR'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 30),
  ('material', 'Matiere', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Resine thermodurcissable']::TEXT[], true, 35),
  ('dimensions_text', 'Dimensions', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 50),
  ('weight_kg', 'Poids', 'kg', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 60),
  ('compatibility_notes', 'Compatibilite', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 70);

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
FROM "_gsi_abattant_attribute_definitions"
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
FROM "_gsi_abattant_attribute_definitions" "seed"
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

CREATE TEMP TABLE "_gsi_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_gsi_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (849, 'ABAT AVEC AMORT SLIM KUBE MS86CSN11 GSI [1].webp', 'IMAGE'::"MediaKind"),
  (850, 'ABAT AVEC AMORT SLIM KUBE MS86CSN11 GSI [2].webp', 'IMAGE'::"MediaKind"),
  (851, 'ABAT AVEC AMORT SLIM KUBE MS86CSN11 GSI [3].webp', 'IMAGE'::"MediaKind"),
  (852, 'ABAT AVEC AMORT SLIM KUBE MS86CSN11 GSI [4].webp', 'IMAGE'::"MediaKind"),
  (853, 'ABAT AVEC AMORT SLIM KUBE MS86CSN11 GSI [5].webp', 'IMAGE'::"MediaKind"),
  (854, 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI [1].webp', 'IMAGE'::"MediaKind"),
  (855, 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI [2].webp', 'IMAGE'::"MediaKind"),
  (856, 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI [3].webp', 'IMAGE'::"MediaKind"),
  (857, 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI [4].webp', 'IMAGE'::"MediaKind"),
  (858, 'ABAT AVEC AMORT SLIM NUBES MS96C11 GSI [1].webp', 'IMAGE'::"MediaKind"),
  (859, 'ABAT AVEC AMORT SLIM NUBES MS96C11 GSI [2].webp', 'IMAGE'::"MediaKind"),
  (860, 'ABAT AVEC AMORT SLIM NUBES MS96C11 GSI [3].webp', 'IMAGE'::"MediaKind"),
  (861, 'ABAT AVEC AMORT SLIM NUBES MS96C11 GSI [4].webp', 'IMAGE'::"MediaKind"),
  (862, 'ABAT AVEC AMORT SLIM NUBES NOIR MS96C26 GSI [1].webp', 'IMAGE'::"MediaKind"),
  (863, 'ABAT AVEC AMORT SLIM NUBES NOIR MS96C26 GSI [2].webp', 'IMAGE'::"MediaKind"),
  (864, 'ABAT AVEC AMORT SLIM NUBES NOIR MS96C26 GSI [3].webp', 'IMAGE'::"MediaKind"),
  (865, 'ABAT AVEC AMORT SLIM NUBES NOIR MS96C26 GSI [4].webp', 'IMAGE'::"MediaKind"),
  (866, 'ABAT AVEC AMORT SLIM PURA BLEU MS86CSN04 GSI [1].webp', 'IMAGE'::"MediaKind"),
  (867, 'ABAT AVEC AMORT SLIM PURA BLEU MS86CSN04 GSI [2].webp', 'IMAGE'::"MediaKind"),
  (868, 'ABAT AVEC AMORT SLIM PURA BLEU MS86CSN04 GSI [3].webp', 'IMAGE'::"MediaKind"),
  (869, 'ABAT AVEC AMORT SLIM PURA BLEU MS86CSN04 GSI [4].webp', 'IMAGE'::"MediaKind"),
  (870, 'ABAT AVEC AMORT SLIM PURA GREGE MS86CSN08 GSI [1].webp', 'IMAGE'::"MediaKind"),
  (871, 'ABAT AVEC AMORT SLIM PURA GREGE MS86CSN08 GSI [2].webp', 'IMAGE'::"MediaKind"),
  (872, 'ABAT AVEC AMORT SLIM PURA GREGE MS86CSN08 GSI [3].webp', 'IMAGE'::"MediaKind"),
  (873, 'ABAT AVEC AMORT SLIM PURA GREGE MS86CSN08 GSI [4].webp', 'IMAGE'::"MediaKind"),
  (874, 'ABAT AVEC AMORT SLIM PURA GRIS CL MS86CSN17 GSI [1].webp', 'IMAGE'::"MediaKind"),
  (875, 'ABAT AVEC AMORT SLIM PURA GRIS CL MS86CSN17 GSI [2].webp', 'IMAGE'::"MediaKind"),
  (876, 'ABAT AVEC AMORT SLIM PURA GRIS CL MS86CSN17 GSI [3].webp', 'IMAGE'::"MediaKind"),
  (877, 'ABAT AVEC AMORT SLIM PURA GRIS CL MS86CSN17 GSI [4].webp', 'IMAGE'::"MediaKind"),
  (878, 'ABAT AVEC AMORT SLIM PURA NOIR MS86CSN26 GSI [1].webp', 'IMAGE'::"MediaKind"),
  (879, 'ABAT AVEC AMORT SLIM PURA NOIR MS86CSN26 GSI [2].webp', 'IMAGE'::"MediaKind"),
  (880, 'ABAT AVEC AMORT SLIM PURA NOIR MS86CSN26 GSI [3].webp', 'IMAGE'::"MediaKind"),
  (881, 'ABAT AVEC AMORT SLIM PURA NOIR MS86CSN26 GSI [4].webp', 'IMAGE'::"MediaKind"),
  (901, 'ABAT AVEC AMORT SLIM KUBE MS86CSN11 GSI.pdf', 'DOCUMENT'::"MediaKind"),
  (902, 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI.pdf', 'DOCUMENT'::"MediaKind"),
  (903, 'ABAT AVEC AMORT SLIM NUBES GSI.pdf', 'DOCUMENT'::"MediaKind"),
  (904, 'ABAT AVEC AMORT SLIM PURA BLEU MS86CSN04 GSI.pdf', 'DOCUMENT'::"MediaKind"),
  (905, 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI (PERFORMANCE BIDET).pdf', 'DOCUMENT'::"MediaKind"),
  (906, 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI (PERFORMANCE SHOWER TRAYS).pdf', 'DOCUMENT'::"MediaKind"),
  (907, 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI (PERFORMANCE URINALS).pdf', 'DOCUMENT'::"MediaKind"),
  (908, 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI (PERFORMANCE WASHBASINS).pdf', 'DOCUMENT'::"MediaKind"),
  (909, 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI (PERFORMANCE WC).pdf', 'DOCUMENT'::"MediaKind"),
  (910, 'ABAT AVEC AMORT SLIM NUBES GSI (PERFORMANCE BIDET).pdf', 'DOCUMENT'::"MediaKind"),
  (911, 'ABAT AVEC AMORT SLIM NUBES GSI (PERFORMANCE SHOWER TRAYS).pdf', 'DOCUMENT'::"MediaKind"),
  (912, 'ABAT AVEC AMORT SLIM NUBES GSI (PERFORMANCE URINALS).pdf', 'DOCUMENT'::"MediaKind"),
  (913, 'ABAT AVEC AMORT SLIM NUBES GSI (PERFORMANCE WASHBASINS).pdf', 'DOCUMENT'::"MediaKind"),
  (914, 'ABAT AVEC AMORT SLIM NUBES GSI (PERFORMANCE WC).pdf', 'DOCUMENT'::"MediaKind"),
  (915, 'ABAT AVEC AMORT SLIM PURA BLEU GSI (PERFORMANCE BIDET).pdf', 'DOCUMENT'::"MediaKind"),
  (916, 'ABAT AVEC AMORT SLIM PURA BLEU GSI (PERFORMANCE SHOWER TRAYS).pdf', 'DOCUMENT'::"MediaKind"),
  (917, 'ABAT AVEC AMORT SLIM PURA BLEU GSI (PERFORMANCE URINALS).pdf', 'DOCUMENT'::"MediaKind"),
  (918, 'ABAT AVEC AMORT SLIM PURA BLEU GSI (PERFORMANCE WASHBASINS).pdf', 'DOCUMENT'::"MediaKind"),
  (919, 'ABAT AVEC AMORT SLIM PURA BLEU GSI (PERFORMANCE WC).pdf', 'DOCUMENT'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "organizations"
    WHERE "id" = 35
      AND "slug" = 'gsi-ceramica'
      AND "name" = 'GSI Ceramica'
      AND "is_product_brand" = true
  ) THEN
    RAISE EXCEPTION 'Missing expected brand organizations id 35 / GSI Ceramica.';
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
  FROM "_gsi_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed GSI abattant WC media: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;
END $$;

CREATE TEMP TABLE "_gsi_abattant_products" (
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
  "sort_order" INTEGER NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "model_reference" TEXT NOT NULL,
  "color_value" TEXT NOT NULL,
  "dimensions_text" TEXT NOT NULL,
  "weight_kg" TEXT NOT NULL,
  "compatibility_notes" TEXT NOT NULL
);

INSERT INTO "_gsi_abattant_products" (
  "sku", "slug", "name", "display_name", "kind",
  "family_slug", "family_name", "family_subtitle", "family_description",
  "family_description_seo", "family_main_image_media_id", "sort_order",
  "price_ttc", "stock_available", "model_reference", "color_value",
  "dimensions_text", "weight_kg", "compatibility_notes"
)
VALUES
  ('00242820', 'gsi-abattant-slim-kube-ms86csn11', 'ABAT AVEC AMORT SLIM KUBE MS86CSN11 GSI', 'GSI - Abattant slim Kube MS86CSN11 blanc', 'SINGLE'::"ProductKind", NULL, NULL, NULL, NULL, NULL, NULL, 0, 223.530, 52.000, 'MS86CSN11', 'Blanc', '45.5 x 36.5 cm', '2.5', 'Kube X / Norm Pura Kube X'),
  ('00242813', 'gsi-abattant-slim-modo-ms98c11', 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI', 'GSI - Abattant slim Modo MS98C11 blanc', 'SINGLE'::"ProductKind", NULL, NULL, NULL, NULL, NULL, NULL, 1, 211.764, 2.000, 'MS98C11', 'Blanc', '44 x 37 cm', '2.2', 'Modo'),
  ('00245920', 'gsi-abattant-slim-nubes-ms96c11', 'ABAT AVEC AMORT SLIM NUBES MS96C11 GSI', 'GSI - Abattant slim Nubes MS96C11 blanc', 'VARIANT'::"ProductKind", 'abattants-wc-gsi-nubes', 'GSI Nubes', 'Abattants WC GSI', 'Gamme GSI Nubes : abattants WC slim avec fermeture amortie, proposes en finitions claires ou foncees pour completer les cuvettes compatibles.', 'GSI Nubes : abattants WC slim avec fermeture amortie disponibles chez COBAM GROUP.', 858, 0, 294.118, 30.000, 'MS96C11', 'Blanc', '45 x 35 cm', '2.2', 'Nubes'),
  ('00248143', 'gsi-abattant-slim-nubes-noir-ms96c26', 'ABAT AVEC AMORT SLIM NUBES NOIR MS96C26 GSI', 'GSI - Abattant slim Nubes MS96C26 noir', 'VARIANT'::"ProductKind", 'abattants-wc-gsi-nubes', 'GSI Nubes', 'Abattants WC GSI', 'Gamme GSI Nubes : abattants WC slim avec fermeture amortie, proposes en finitions claires ou foncees pour completer les cuvettes compatibles.', 'GSI Nubes : abattants WC slim avec fermeture amortie disponibles chez COBAM GROUP.', 858, 1, 529.412, 3.000, 'MS96C26', 'Noir', '45 x 35 cm', '2.2', 'Nubes'),
  ('00248204', 'gsi-abattant-slim-pura-bleu-ms86csn04', 'ABAT AVEC AMORT SLIM PURA BLEU MS86CSN04 GSI', 'GSI - Abattant slim Pura MS86CSN04 bleu', 'VARIANT'::"ProductKind", 'abattants-wc-gsi-pura', 'GSI Pura', 'Abattants WC GSI', 'Gamme GSI Pura : abattants WC slim avec fermeture amortie, disponibles en couleurs decoratives pour une salle de bain coordonnee.', 'GSI Pura : abattants WC slim couleur avec fermeture amortie chez COBAM GROUP.', 870, 0, 517.648, 1.000, 'MS86CSN04', 'Bleu', '45.5 x 36.5 cm', '2.5', 'Norm Pura Kube X'),
  ('00248211', 'gsi-abattant-slim-pura-grege-ms86csn08', 'ABAT AVEC AMORT SLIM PURA GREGE MS86CSN08 GSI', 'GSI - Abattant slim Pura MS86CSN08 grege', 'VARIANT'::"ProductKind", 'abattants-wc-gsi-pura', 'GSI Pura', 'Abattants WC GSI', 'Gamme GSI Pura : abattants WC slim avec fermeture amortie, disponibles en couleurs decoratives pour une salle de bain coordonnee.', 'GSI Pura : abattants WC slim couleur avec fermeture amortie chez COBAM GROUP.', 870, 1, 517.648, 5.000, 'MS86CSN08', 'Grege', '45.5 x 36.5 cm', '2.5', 'Norm Pura Kube X'),
  ('00248228', 'gsi-abattant-slim-pura-gris-clair-ms86csn17', 'ABAT AVEC AMORT SLIM PURA GRIS CL MS86CSN17 GSI', 'GSI - Abattant slim Pura MS86CSN17 gris clair', 'VARIANT'::"ProductKind", 'abattants-wc-gsi-pura', 'GSI Pura', 'Abattants WC GSI', 'Gamme GSI Pura : abattants WC slim avec fermeture amortie, disponibles en couleurs decoratives pour une salle de bain coordonnee.', 'GSI Pura : abattants WC slim couleur avec fermeture amortie chez COBAM GROUP.', 870, 2, 517.648, 1.000, 'MS86CSN17', 'Gris clair', '45.5 x 36.5 cm', '2.5', 'Norm Pura Kube X'),
  ('00248198', 'gsi-abattant-slim-pura-noir-ms86csn26', 'ABAT AVEC AMORT SLIM PURA NOIR MS86CSN26 GSI', 'GSI - Abattant slim Pura MS86CSN26 noir', 'VARIANT'::"ProductKind", 'abattants-wc-gsi-pura', 'GSI Pura', 'Abattants WC GSI', 'Gamme GSI Pura : abattants WC slim avec fermeture amortie, disponibles en couleurs decoratives pour une salle de bain coordonnee.', 'GSI Pura : abattants WC slim couleur avec fermeture amortie chez COBAM GROUP.', 870, 3, 517.648, 5.000, 'MS86CSN26', 'Noir', '45.5 x 36.5 cm', '2.5', 'Norm Pura Kube X');

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
FROM "_gsi_abattant_products"
WHERE "family_slug" IS NOT NULL
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "main_image_media_id" = EXCLUDED."main_image_media_id",
  "updated_at" = CURRENT_TIMESTAMP;

WITH "brand" AS (
  SELECT "id" FROM "organizations" WHERE "id" = 35 AND "slug" = 'gsi-ceramica'
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
  "seed"."kind",
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
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Cet abattant WC slim GSI complete une cuvette de salle de bain avec une ligne fine, un couvercle enveloppant et une fermeture progressive adaptee a un usage quotidien.'))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Sa presentation sobre facilite l''association avec des ambiances sanitaires contemporaines, du blanc classique aux teintes decoratives.'))
      )
    )
  ),
  left("seed"."display_name" || ' | COBAM GROUP', 60),
  left("seed"."display_name" || ' : abattant WC slim avec fermeture amortie disponible chez COBAM GROUP en Tunisie.', 160),
  trim(
    'abattant-wc lunette-wc slim fermeture-amortie gsi ' ||
    lower(replace("seed"."model_reference", ' ', '-')) || ' ' ||
    lower(replace("seed"."color_value", ' ', '-'))
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
FROM "_gsi_abattant_products" "seed"
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
USING "products" "product", "_gsi_abattant_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  "seed"."sort_order"
FROM "_gsi_abattant_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = "seed"."family_slug"
WHERE "seed"."family_slug" IS NOT NULL
ON CONFLICT ("family_id", "product_id") DO UPDATE SET
  "sort_order" = EXCLUDED."sort_order";

WITH "ranked_defaults" AS (
  SELECT
    "seed"."family_slug",
    "product"."id" AS "product_id",
    row_number() OVER (
      PARTITION BY "seed"."family_slug"
      ORDER BY "seed"."stock_available" DESC, "seed"."sort_order" ASC
    ) AS "rank"
  FROM "_gsi_abattant_products" "seed"
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

WITH "remaining_old_family_members" AS (
  SELECT
    "member"."family_id",
    "member"."product_id",
    row_number() OVER (PARTITION BY "member"."family_id" ORDER BY "member"."sort_order", "member"."product_id") AS "rank"
  FROM "product_families" "family"
  JOIN "product_family_members" "member"
    ON "member"."family_id" = "family"."id"
  WHERE "family"."slug" = 'abattants-wc-gsi'
)
UPDATE "product_families" "family"
SET
  "default_product_id" = "remaining"."product_id",
  "updated_at" = CURRENT_TIMESTAMP
FROM "remaining_old_family_members" "remaining"
WHERE "family"."id" = "remaining"."family_id"
  AND "remaining"."rank" = 1;

DELETE FROM "product_families" "family"
WHERE "family"."slug" = 'abattants-wc-gsi'
  AND NOT EXISTS (
    SELECT 1
    FROM "product_family_members" "member"
    WHERE "member"."family_id" = "family"."id"
  );

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_gsi_abattant_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_gsi_abattant_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'abattants-wc'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_gsi_abattant_products" "seed"
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
    'weight_kg',
    'compatibility_notes'
  );

WITH "attribute_values" AS (
  SELECT "product"."id" AS "product_id", 'model_reference' AS "name", "seed"."model_reference" AS "value"
  FROM "_gsi_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'seat_type', 'Slim soft-close'
  FROM "_gsi_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'soft_close', 'true'
  FROM "_gsi_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'slim_seat', 'true'
  FROM "_gsi_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'color', "seed"."color_value"
  FROM "_gsi_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'material', 'Resine thermodurcissable'
  FROM "_gsi_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'dimensions_text', "seed"."dimensions_text"
  FROM "_gsi_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'weight_kg', "seed"."weight_kg"
  FROM "_gsi_abattant_products" "seed"
  JOIN "products" "product" ON "product"."sku" = "seed"."sku"

  UNION ALL
  SELECT "product"."id", 'compatibility_notes', "seed"."compatibility_notes"
  FROM "_gsi_abattant_products" "seed"
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

CREATE TEMP TABLE "_gsi_abattant_media" (
  "sku" TEXT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "role" "ProductMediaRole" NOT NULL,
  "alt_text" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("sku", "media_id")
);

INSERT INTO "_gsi_abattant_media" ("sku", "media_id", "role", "alt_text", "sort_order")
VALUES
  ('00242820', 849, 'GALLERY'::"ProductMediaRole", 'Abattant slim Kube GSI blanc - vue produit 1', 0),
  ('00242820', 850, 'GALLERY'::"ProductMediaRole", 'Abattant slim Kube GSI blanc - vue produit 2', 1),
  ('00242820', 851, 'GALLERY'::"ProductMediaRole", 'Abattant slim Kube GSI blanc - vue produit 3', 2),
  ('00242820', 852, 'GALLERY'::"ProductMediaRole", 'Abattant slim Kube GSI blanc - vue produit 4', 3),
  ('00242820', 853, 'GALLERY'::"ProductMediaRole", 'Abattant slim Kube GSI blanc - vue produit 5', 4),
  ('00242820', 901, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique abattant slim Kube GSI MS86CSN11', 0),

  ('00242813', 854, 'GALLERY'::"ProductMediaRole", 'Abattant slim Modo GSI blanc - vue produit 1', 0),
  ('00242813', 855, 'GALLERY'::"ProductMediaRole", 'Abattant slim Modo GSI blanc - vue produit 2', 1),
  ('00242813', 856, 'GALLERY'::"ProductMediaRole", 'Abattant slim Modo GSI blanc - vue produit 3', 2),
  ('00242813', 857, 'GALLERY'::"ProductMediaRole", 'Abattant slim Modo GSI blanc - vue produit 4', 3),
  ('00242813', 902, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique abattant slim Modo GSI MS98C11', 0),
  ('00242813', 905, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI - bidets', 0),
  ('00242813', 906, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI - receveurs de douche', 1),
  ('00242813', 907, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI - urinoirs', 2),
  ('00242813', 908, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI - lavabos', 3),
  ('00242813', 909, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI - WC', 4),

  ('00245920', 858, 'GALLERY'::"ProductMediaRole", 'Abattant slim Nubes GSI blanc - vue produit 1', 0),
  ('00245920', 859, 'GALLERY'::"ProductMediaRole", 'Abattant slim Nubes GSI blanc - vue produit 2', 1),
  ('00245920', 860, 'GALLERY'::"ProductMediaRole", 'Abattant slim Nubes GSI blanc - vue produit 3', 2),
  ('00245920', 861, 'GALLERY'::"ProductMediaRole", 'Abattant slim Nubes GSI blanc - vue produit 4', 3),
  ('00245920', 903, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique abattant slim Nubes GSI', 0),
  ('00245920', 910, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Nubes - bidets', 0),
  ('00245920', 911, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Nubes - receveurs de douche', 1),
  ('00245920', 912, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Nubes - urinoirs', 2),
  ('00245920', 913, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Nubes - lavabos', 3),
  ('00245920', 914, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Nubes - WC', 4),

  ('00248143', 862, 'GALLERY'::"ProductMediaRole", 'Abattant slim Nubes GSI noir - vue produit 1', 0),
  ('00248143', 863, 'GALLERY'::"ProductMediaRole", 'Abattant slim Nubes GSI noir - vue produit 2', 1),
  ('00248143', 864, 'GALLERY'::"ProductMediaRole", 'Abattant slim Nubes GSI noir - vue produit 3', 2),
  ('00248143', 865, 'GALLERY'::"ProductMediaRole", 'Abattant slim Nubes GSI noir - vue produit 4', 3),
  ('00248143', 903, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique abattant slim Nubes GSI', 0),
  ('00248143', 910, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Nubes - bidets', 0),
  ('00248143', 911, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Nubes - receveurs de douche', 1),
  ('00248143', 912, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Nubes - urinoirs', 2),
  ('00248143', 913, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Nubes - lavabos', 3),
  ('00248143', 914, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Nubes - WC', 4),

  ('00248204', 866, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI bleu - vue produit 1', 0),
  ('00248204', 867, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI bleu - vue produit 2', 1),
  ('00248204', 868, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI bleu - vue produit 3', 2),
  ('00248204', 869, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI bleu - vue produit 4', 3),
  ('00248204', 904, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique abattant slim Pura GSI', 0),
  ('00248204', 915, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - bidets', 0),
  ('00248204', 916, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - receveurs de douche', 1),
  ('00248204', 917, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - urinoirs', 2),
  ('00248204', 918, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - lavabos', 3),
  ('00248204', 919, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - WC', 4),

  ('00248211', 870, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI grege - vue produit 1', 0),
  ('00248211', 871, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI grege - vue produit 2', 1),
  ('00248211', 872, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI grege - vue produit 3', 2),
  ('00248211', 873, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI grege - vue produit 4', 3),
  ('00248211', 904, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique abattant slim Pura GSI', 0),
  ('00248211', 915, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - bidets', 0),
  ('00248211', 916, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - receveurs de douche', 1),
  ('00248211', 917, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - urinoirs', 2),
  ('00248211', 918, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - lavabos', 3),
  ('00248211', 919, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - WC', 4),

  ('00248228', 874, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI gris clair - vue produit 1', 0),
  ('00248228', 875, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI gris clair - vue produit 2', 1),
  ('00248228', 876, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI gris clair - vue produit 3', 2),
  ('00248228', 877, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI gris clair - vue produit 4', 3),
  ('00248228', 904, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique abattant slim Pura GSI', 0),
  ('00248228', 915, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - bidets', 0),
  ('00248228', 916, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - receveurs de douche', 1),
  ('00248228', 917, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - urinoirs', 2),
  ('00248228', 918, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - lavabos', 3),
  ('00248228', 919, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - WC', 4),

  ('00248198', 878, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI noir - vue produit 1', 0),
  ('00248198', 879, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI noir - vue produit 2', 1),
  ('00248198', 880, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI noir - vue produit 3', 2),
  ('00248198', 881, 'GALLERY'::"ProductMediaRole", 'Abattant slim Pura GSI noir - vue produit 4', 3),
  ('00248198', 904, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique abattant slim Pura GSI', 0),
  ('00248198', 915, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - bidets', 0),
  ('00248198', 916, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - receveurs de douche', 1),
  ('00248198', 917, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - urinoirs', 2),
  ('00248198', 918, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - lavabos', 3),
  ('00248198', 919, 'CERTIFICATE'::"ProductMediaRole", 'Declaration de performance GSI Pura - WC', 4);

DELETE FROM "product_media" "product_media"
USING "products" "product", "_gsi_abattant_products" "seed"
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
FROM "_gsi_abattant_media" "media_link"
JOIN "products" "product"
  ON "product"."sku" = "media_link"."sku"
JOIN "_gsi_expected_media" "expected"
  ON "expected"."media_id" = "media_link"."media_id"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DROP TABLE "_gsi_abattant_media";
DROP TABLE "_gsi_abattant_products";
DROP TABLE "_gsi_expected_media";
DROP TABLE "_gsi_abattant_attribute_definitions";
