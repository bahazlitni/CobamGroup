-- Seed and enrich Carrojoint grout products by brand family.
-- The migration is intentionally idempotent: it upserts products, families,
-- category links, media links, and the Carrojoint-specific attributes.

BEGIN;

INSERT INTO "organizations" (
  "slug", "name", "description", "is_product_brand", "is_reference", "is_partner", "created_at", "updated_at"
)
VALUES
  ('deutsch-color', 'Deutsch Color', 'Marque de joints de carrelage et produits de finition sélectionnée par COBAM GROUP.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sika', 'Sika', 'Marque technique pour mortiers, joints, etancheite et solutions de construction.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vitrafix', 'VitraFix', 'Marque de produits de pose et joints flexibles pour carrelage.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('derbigum', 'Derbigum', 'Marque de produits techniques pour pose, etancheite et finitions.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('turkqua', 'Turkqua', 'Marque de joints et produits de finition importee depuis le catalogue COBAM.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = COALESCE("organizations"."description", EXCLUDED."description"),
  "is_product_brand" = true,
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_seed_carrojoint_brand_specs" ON COMMIT DROP AS
SELECT *
FROM (
  VALUES
    ('deutsch-color', 'Deutsch Color', 'carrojoint-deutsch-color', 'Carrojoint Deutsch Color', 'Joints de carrelage Deutsch Color', 'Famille Carrojoint Deutsch Color : joints de carrelage colores pour pose et finition, avec variantes standard et Intense.', 'Carrojoint Deutsch Color : joints de carrelage et finitions couleur chez COBAM GROUP.', 93::BIGINT, 110::BIGINT),
    ('sika', 'Sika', 'carrojoint-sika', 'Carrojoint Sika', 'Joints de carrelage Sika', 'Famille Carrojoint Sika : joints techniques en sacs de 5 kg pour finitions de carrelage durables.', 'Carrojoint Sika : joints techniques de carrelage chez COBAM GROUP.', 94::BIGINT, 96::BIGINT),
    ('vitrafix', 'VitraFix', 'carrojoint-vitrafix', 'Carrojoint VitraFix', 'Joints flexibles 1-6 mm', 'Famille Carrojoint VitraFix : joints flexibles 1-6 mm pour finitions de carrelage.', 'Carrojoint VitraFix : joints flexibles 1-6 mm chez COBAM GROUP.', 607::BIGINT, 606::BIGINT),
    ('derbigum', 'Derbigum', 'carrojoint-derbigum', 'Carrojoint Derbigum', 'Joints de carrelage Derbigum', 'Famille Carrojoint Derbigum : joints de carrelage en conditionnements de 6 kg.', 'Carrojoint Derbigum : joints de carrelage chez COBAM GROUP.', 601::BIGINT, 602::BIGINT),
    ('turkqua', 'Turkqua', 'carrojoint-turkqua', 'Carrojoint Turkqua', 'Joints de carrelage Turkqua', 'Famille Carrojoint Turkqua importee depuis le catalogue COBAM.', 'Carrojoint Turkqua : joints de carrelage chez COBAM GROUP.', NULL::BIGINT, NULL::BIGINT)
) AS "x"(
  "brand_slug", "brand_name", "family_slug", "family_name", "family_subtitle",
  "family_description", "family_description_seo", "image_media_id", "technical_media_id"
);

CREATE TEMP TABLE "_seed_carrojoint_attribute_definitions" ON COMMIT DROP AS
SELECT *
FROM (
  VALUES
    ('color', 'Couleur', NULL::TEXT, 'COLOR', ARRAY[]::TEXT[]),
    ('product_use', 'Type de produit', NULL::TEXT, 'SELECT', ARRAY['Joint de carrelage']::TEXT[]),
    ('packaging_weight_kg', 'Conditionnement', 'kg', 'NUMBER', ARRAY[]::TEXT[]),
    ('ready_to_use', 'Pret a l''emploi', NULL::TEXT, 'BOOLEAN', ARRAY[]::TEXT[]),
    ('product_range', 'Gamme', NULL::TEXT, 'SELECT', ARRAY['Standard', 'Intense', 'Flex', 'SikaCeram']::TEXT[]),
    ('color_code', 'Code couleur', NULL::TEXT, 'TEXT', ARRAY[]::TEXT[]),
    ('joint_width_mm', 'Largeur de joint', 'mm', 'TEXT', ARRAY[]::TEXT[]),
    ('waterproof', 'Etanche', NULL::TEXT, 'BOOLEAN', ARRAY[]::TEXT[])
) AS "x"("key", "label", "unit", "input_type", "select_options");

INSERT INTO "product_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "created_at", "updated_at"
)
SELECT
  "key",
  "label",
  "unit",
  "input_type"::"ProductTypeAttributeInputType",
  "select_options",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_seed_carrojoint_attribute_definitions"
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "unit" = EXCLUDED."unit",
  "input_type" = EXCLUDED."input_type",
  "select_options" = EXCLUDED."select_options",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_attribute_groups" (
  "product_type_id", "name", "slug", "sort_order", "created_at", "updated_at"
)
SELECT
  "types"."id",
  "groups"."name",
  "groups"."slug",
  "groups"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "product_type_templates" "types"
CROSS JOIN (
  VALUES
    ('Filtres principaux', 'filtres-principaux', 0),
    ('Caracteristiques techniques', 'caracteristiques-techniques', 20)
) AS "groups"("name", "slug", "sort_order")
WHERE "types"."slug" = 'produit-pose-carrelage'
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_seed_carrojoint_template_attributes" ON COMMIT DROP AS
SELECT *
FROM (
  VALUES
    ('product_use', 'filtres-principaux', 'Type de produit', true, 10),
    ('color', 'filtres-principaux', 'Couleur', true, 20),
    ('packaging_weight_kg', 'filtres-principaux', 'Conditionnement', true, 30),
    ('ready_to_use', 'filtres-principaux', 'Pret a l''emploi', true, 40),
    ('product_range', 'caracteristiques-techniques', 'Gamme', true, 50),
    ('color_code', 'caracteristiques-techniques', 'Code couleur', true, 60),
    ('joint_width_mm', 'caracteristiques-techniques', 'Largeur de joint', true, 70),
    ('waterproof', 'caracteristiques-techniques', 'Etanche', true, 80)
) AS "x"("attribute_key", "group_slug", "label", "is_filterable", "sort_order");

INSERT INTO "product_type_attributes" (
  "product_type_id", "attribute_group_id", "attribute_definition_id", "label",
  "is_required", "is_filterable", "sort_order", "created_at", "updated_at"
)
SELECT
  "types"."id",
  "groups"."id",
  "defs"."id",
  "template_attrs"."label",
  false,
  "template_attrs"."is_filterable",
  "template_attrs"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_seed_carrojoint_template_attributes" "template_attrs"
JOIN "product_type_templates" "types"
  ON "types"."slug" = 'produit-pose-carrelage'
JOIN "product_attribute_definitions" "defs"
  ON "defs"."key" = "template_attrs"."attribute_key"
LEFT JOIN "product_attribute_groups" "groups"
  ON "groups"."product_type_id" = "types"."id"
 AND "groups"."slug" = "template_attrs"."group_slug"
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "attribute_group_id" = EXCLUDED."attribute_group_id",
  "label" = EXCLUDED."label",
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_seed_carrojoints_raw" ON COMMIT DROP AS
SELECT *
FROM (
  VALUES
    ('00224772', 'CARROJOINT COTTON FILED (49) 3KG DEUTSCH COLOR', 13.000::NUMERIC, 0::NUMERIC),
    ('00221566', 'CARROJOINT ALMOND IVOIR (44) 3KG DEUTSCH COLOR', 9.000::NUMERIC, 0::NUMERIC),
    ('00228121', 'CARROJOINT ANTRACITE 04 SIKA 5KG', 39.473::NUMERIC, 4::NUMERIC),
    ('00242332', 'CARROJOINT ANTRACITE 37 INTENSE 5KG DEUTSCH COLOR', 35.000::NUMERIC, 8::NUMERIC),
    ('00227971', 'CARROJOINT BEACH WOOD 39 SIKA 5KG', 39.473::NUMERIC, 5::NUMERIC),
    ('00178808', 'CARROJOINT BEIGE FC 5KG TURQUA', 13.000::NUMERIC, 0::NUMERIC),
    ('00228015', 'CARROJOINT BEIGE 08 SIKA 5KG', 39.473::NUMERIC, 0::NUMERIC),
    ('00224796', 'CARROJOINT BEIGE 18 INTENSE(ETANCHE) 5KG DEUTSCH COLOR', 29.000::NUMERIC, 0::NUMERIC),
    ('00249058', 'CARROJOINT BEIGE 18 INTENSE(ETANCHE) 5KG DEUTSCH COLOR', 29.000::NUMERIC, 0::NUMERIC),
    ('00202503', 'CARROJOINT BEIGE (18) 6KG DEUTSCH COLOR', 18.000::NUMERIC, 1::NUMERIC),
    ('00201551', 'CARROJOINT BEIGE (32) / (18) 3KG DEUTSCH COLOR', 9.000::NUMERIC, 0::NUMERIC),
    ('00246699', 'CARROJOINT BLACK 02 INTENSE(ETANCHE) 5KG DEUTSCH COLOR', 29.000::NUMERIC, 0::NUMERIC),
    ('00221993', 'CARROJOINT BLANC INTENSE(ETANCHE) 5KG DEUTSCH COLOR', 29.000::NUMERIC, 26::NUMERIC),
    ('00209977', 'CARROJOINT BLANC (01) 12KG DEUTSCH COLOR', 35.000::NUMERIC, 0::NUMERIC),
    ('00205528', 'CARROJOINT BLANC (01) 3KG DEUTSCH COLOR', 12.000::NUMERIC, 18::NUMERIC),
    ('00202510', 'CARROJOINT BLANC (01) 6KG DEUTSCH COLOR', 18.000::NUMERIC, 0::NUMERIC),
    ('00193733', 'CARROJOINT BLANC 6KG DERBIGUM', 17.000::NUMERIC, 0::NUMERIC),
    ('00212502', 'CARROJOINT BROWN (08) 6KG DEUTSCH COLOR', 22.000::NUMERIC, 0::NUMERIC),
    ('00227933', 'CARROJOINT BROWN 10 SIKA 5KG', 39.473::NUMERIC, 0::NUMERIC),
    ('00227995', 'CARROJOINT CAK WOOD 41 SIKA 5KG', 39.473::NUMERIC, 1::NUMERIC),
    ('00227957', 'CARROJOINT CARAMEL 16 SIKA 5KG', 39.473::NUMERIC, 0::NUMERIC),
    ('00201544', 'CARROJOINT CARAMEL 3KG DEUTSCH COLOR', 11.000::NUMERIC, 0::NUMERIC),
    ('00228152', 'CARROJOINT CEDAR 38 SIKA 5KG', 39.473::NUMERIC, 12::NUMERIC),
    ('00228046', 'CARROJOINT CENERA ASH 03 SIKA 5KG', 39.473::NUMERIC, 0::NUMERIC),
    ('00237291', 'CARROJOINT CHAMOMILE 45 INTENSE 2KG DEUTSCH COLOR', 15.500::NUMERIC, 0::NUMERIC),
    ('00232173', 'CARROJOINT CHAMOMILE 45 6KG DEUTSCH COLOR', 24.000::NUMERIC, 0::NUMERIC),
    ('00232555', 'CARROJOINT COFFE 09 6KG DEUTSCH COLOR', 27.000::NUMERIC, 0::NUMERIC),
    ('00230810', 'CARROJOINT COTTON FIELD (49) 6KG DEUTSCH COLOR', 25.000::NUMERIC, 0::NUMERIC),
    ('00235440', 'CARROJOINT CYPRES 32 INTENSE 2KG DEUTSCH COLOR', 15.500::NUMERIC, 0::NUMERIC),
    ('00225533', 'CARROJOINT DARK BLEU 24 INTENSE 5KG DEUTSCH COLOR', 35.000::NUMERIC, 19::NUMERIC),
    ('00235150', 'CARROJOINT DARK BLEU 24 INTENSE(ETANCHE) 2KG DEUTSCH COLOR', 15.500::NUMERIC, 0::NUMERIC),
    ('00181228', 'CARROJOINT FLEX 1-6MM BEIGE BAHAMAS 5KG VITRAFIX', 20.000::NUMERIC, 0::NUMERIC),
    ('00000272', 'CARROJOINT FLEX 1-6MM BEIGE 5KG VITRAFIX', 16.000::NUMERIC, 0::NUMERIC),
    ('00000273', 'CARROJOINT FLEX 1-6MM BLANC 5KG VITRAFIX', 16.000::NUMERIC, 0::NUMERIC),
    ('00000275', 'CARROJOINT FLEX 1-6MM DARK GREY FC 5KG VITRAFIX', 16.000::NUMERIC, 6::NUMERIC),
    ('00182430', 'CARROJOINT FLEX 1-6MM EFES BEIGE 5KG VITRAFIX', 25.000::NUMERIC, 0::NUMERIC),
    ('00179027', 'CARROJOINT FLEX 1-6MM GRIS CL (SILVER) 5KG VITRAFIX', 16.000::NUMERIC, 0::NUMERIC),
    ('00177931', 'CARROJOINT FLEX 1-6MM ICE GREY 5KG VITRAFIX', 16.000::NUMERIC, 0::NUMERIC),
    ('00190886', 'CARROJOINT FLEX 1-6MM MOKA BROWN 5KG VITRAFIX', 25.000::NUMERIC, 0::NUMERIC),
    ('00000276', 'CARROJOINT FLEX 1-6MM NOIR 5KG VITRAFIX', 25.000::NUMERIC, 0::NUMERIC),
    ('00191838', 'CARROJOINT FLEX 1-6MM PETRA BEIGE 5KG VITRAFIX', 16.000::NUMERIC, 0::NUMERIC),
    ('00179010', 'CARROJOINT FLEX 1-6MM SAHARA BEIGE 5KG VITRAFIX', 16.000::NUMERIC, 0::NUMERIC),
    ('00181068', 'CARROJOINT FLEX 1-6MM STARDUST 5KG VITRAFIX', 25.000::NUMERIC, 0::NUMERIC),
    ('00228145', 'CARROJOINT GRAPHITE 33 SIKA 5KG', 39.473::NUMERIC, 0::NUMERIC),
    ('00228107', 'CARROJOINT GREY 32 SIKA 5KG', 39.470::NUMERIC, 3::NUMERIC),
    ('00226974', 'CARROJOINT GRIS CIMENT (10) 6KG DEUTSCH COLOR', 18.000::NUMERIC, 0::NUMERIC),
    ('00207836', 'CARROJOINT GRIS CL (05) 3KG DEUTSCH COLOR', 9.000::NUMERIC, 0::NUMERIC),
    ('00208406', 'CARROJOINT GRIS CL 05 6KG DEUTSCH COLOR', 18.000::NUMERIC, 11::NUMERIC),
    ('00223669', 'CARROJOINT GRIS FC (04) 3KG DEUTSCH COLOR', 9.000::NUMERIC, 0::NUMERIC),
    ('00231985', 'CARROJOINT GRIS FC 04 6KG DEUTSCH COLOR', 18.000::NUMERIC, 0::NUMERIC),
    ('00224789', 'CARROJOINT GRIS ICE (15) MANHATAN 6KG DEUTSCH COLOR', 18.000::NUMERIC, 0::NUMERIC),
    ('00221559', 'CARROJOINT GRIS ICE (15) MANHATEN 3KG DEUTSCH COLOR', 11.000::NUMERIC, 0::NUMERIC),
    ('00224086', 'CARROJOINT GRIS MOYEN 17 INTENSE(ETANCHE) 5KG DEUTSCH COLOR', 29.000::NUMERIC, 4::NUMERIC),
    ('00207829', 'CARROJOINT GRIS MOYEN (17) 3KG DEUTSCH COLOR', 9.000::NUMERIC, 0::NUMERIC),
    ('00206495', 'CARROJOINT GRIS MOYEN 17 6KG DEUTSCH COLOR', 18.000::NUMERIC, 0::NUMERIC),
    ('00195041', 'CARROJOINT GRIS MOYEN 6KG DERBIGUM', 19.800::NUMERIC, 0::NUMERIC),
    ('00224338', 'CARROJOINT GRIS PEARL 29 6KG DEUTSCH COLOR', 18.000::NUMERIC, 0::NUMERIC),
    ('00207812', 'CARROJOINT GRIS SILVER (16) 3KG DEUTSCH COLOR', 9.000::NUMERIC, 0::NUMERIC),
    ('00206501', 'CARROJOINT GRIS SILVER (16) 6KG DEUTSCH COLOR', 18.000::NUMERIC, 0::NUMERIC),
    ('00225137', 'CARROJOINT GRIS 04 INTENSE(ETANCHE) 5KG DEUTSCH COLOR', 29.000::NUMERIC, 1::NUMERIC),
    ('00228091', 'CARROJOINT ICE 02 SIKA 5KG', 39.470::NUMERIC, 13::NUMERIC),
    ('00227964', 'CARROJOINT JASMIN 06 SIKA 5KG', 39.473::NUMERIC, 0::NUMERIC),
    ('00232395', 'CARROJOINT LIGHT BLEU 33 INTENSE 5KG DEUTSCH COLOR', 35.000::NUMERIC, 27::NUMERIC),
    ('00237581', 'CARROJOINT LIGHT GREY 05 INTENSE(ETANCHE) 5KG DEUTSCH COLOR', 29.000::NUMERIC, 62::NUMERIC),
    ('00228060', 'CARROJOINT LIGHT GREY 29 SIKA 5KG', 39.470::NUMERIC, 87::NUMERIC),
    ('00228053', 'CARROJOINT LIGHT SAND 37 SIKA 5KG', 39.473::NUMERIC, 14::NUMERIC),
    ('00208390', 'CARROJOINT MAGNOLIA (BEIGE CL) (13) 6KG DEUTSCH COLOR', 21.000::NUMERIC, 0::NUMERIC),
    ('00209755', 'CARROJOINT MAGNOLIA BEIGE (13) 3KG DEUTSCH COLOR', 9.000::NUMERIC, 0::NUMERIC),
    ('00242356', 'CARROJOINT MAGNOLIA/IVOIR 13 INTENSE 5KG DEUTSCH COLOR', 35.000::NUMERIC, 7::NUMERIC),
    ('00229210', 'CARROJOINT MAHOGANY 42 (MARRON FC) SIKA 5KG', 39.473::NUMERIC, 0::NUMERIC),
    ('00212496', 'CARROJOINT MALVE (61) 3KG DEUTSCH COLOR', 9.000::NUMERIC, 0::NUMERIC),
    ('00228138', 'CARROJOINT MANHATTAN 01 SIKA 5KG', 39.473::NUMERIC, 22::NUMERIC),
    ('00225557', 'CARROJOINT MANHATTAN 15 INTENSE(ETANCHE) 5KG DEUTSCH COLOR', 29.000::NUMERIC, 0::NUMERIC),
    ('00228008', 'CARROJOINT MAPLE WOOD 35 SIKA 5KG', 39.473::NUMERIC, 0::NUMERIC),
    ('00227872', 'CARROJOINT MY KONOS BLEU 30 INTENSE 5KG DEUTSCH COLOR', 35.000::NUMERIC, 0::NUMERIC),
    ('00231589', 'CARROJOINT NAVY BLEU 31 INTENSE 5KG DEUTSCH COLOR', 35.000::NUMERIC, 0::NUMERIC),
    ('00227940', 'CARROJOINT NERO ABSOLUTO 30 SIKA 5KG', 39.473::NUMERIC, 6::NUMERIC),
    ('00228114', 'CARROJOINT NOCE/WALNUT 40 SIKA 5KG', 39.473::NUMERIC, 0::NUMERIC),
    ('00226042', 'CARROJOINT NOIR (02) 6KG DEUTSCH COLOR', 24.000::NUMERIC, 0::NUMERIC),
    ('00199261', 'CARROJOINT NOIR 6KG DERBIGUM', 17.000::NUMERIC, 0::NUMERIC),
    ('00228084', 'CARROJOINT PERGAMON 24 SIKA 5KG', 39.470::NUMERIC, 0::NUMERIC),
    ('00227988', 'CARROJOINT PINE 34 SIKA 5KG', 39.470::NUMERIC, 17::NUMERIC),
    ('00242011', 'CARROJOINT PURPLE (06) 6KG DEUTSCH COLOR', 22.000::NUMERIC, 0::NUMERIC),
    ('00212489', 'CARROJOINT RED BROWN (45) 3KG DEUTSCH COLOR', 9.000::NUMERIC, 0::NUMERIC),
    ('00224802', 'CARROJOINT SAHARA BEIGE (46) 6KG DEUTSCH COLOR', 18.000::NUMERIC, 0::NUMERIC),
    ('00228039', 'CARROJOINT SAND SABBIA 09 SIKA 5KG', 39.473::NUMERIC, 0::NUMERIC),
    ('00249065', 'CARROJOINT SILVER GREY 16 INTENSE(ETANCHE) 5KG DEUTSCH COLOR', 29.000::NUMERIC, 16::NUMERIC),
    ('00238533', 'CARROJOINT SILVER 31 SIKA 5KG', 39.470::NUMERIC, 3::NUMERIC),
    ('00223614', 'CARROJOINT TABACO 41 3KG DEUTSCH COLOR', 9.000::NUMERIC, 0::NUMERIC),
    ('00226530', 'CARROJOINT TABACO (41) 6KG DEUTSCH COLOR', 19.000::NUMERIC, 0::NUMERIC),
    ('00202534', 'CARROJOINT TORTILLA (34) 6KG DEUTSCH COLOR', 18.000::NUMERIC, 8::NUMERIC),
    ('00228022', 'CARROJOINT TORTORA 36 SIKA 5KG', 39.473::NUMERIC, 0::NUMERIC),
    ('00202527', 'CARROJOINT UMBER (33) 6KG DEUTSCH COLOR', 18.000::NUMERIC, 0::NUMERIC),
    ('00248587', 'CARROJOINT UMBER 50 INTENSE(ETANCHE) 5KG DEUTSCH COLOR', 29.000::NUMERIC, 1::NUMERIC),
    ('00221573', 'CARROJOINT UMBER (50) 3KG DEUTSCH COLOR', 9.000::NUMERIC, 0::NUMERIC),
    ('00225526', 'CARROJOINT VERT CYPRESS 32 INTENSE 5KG DEUTSCH COLOR', 35.000::NUMERIC, 14::NUMERIC),
    ('00226967', 'CARROJOINT VERT CYPRESS 32 6KG DEUTSCH COLOR', 32.500::NUMERIC, 0::NUMERIC),
    ('00228077', 'CARROJOINT WHITE 00 SIKA 5KG', 39.470::NUMERIC, 20::NUMERIC)
) AS "x"("sku", "name", "price_ttc", "stock_available");

CREATE TEMP TABLE "_seed_carrojoints_enriched" ON COMMIT DROP AS
WITH "typed" AS (
  SELECT
    "raw".*,
    CASE
      WHEN "raw"."name" ILIKE '%DEUTSCH COLOR%' THEN 'deutsch-color'
      WHEN "raw"."name" ILIKE '%SIKA%' THEN 'sika'
      WHEN "raw"."name" ILIKE '%VITRAFIX%' THEN 'vitrafix'
      WHEN "raw"."name" ILIKE '%DERBIGUM%' THEN 'derbigum'
      WHEN "raw"."name" ILIKE '%TURQUA%' THEN 'turkqua'
      ELSE NULL
    END AS "brand_slug",
    NULLIF(substring(upper("raw"."name") FROM '([0-9]+(\.[0-9]+)?)KG'), '')::NUMERIC AS "packaging_weight_kg",
    NULLIF(substring(upper("raw"."name") FROM '([0-9]+-[0-9]+)MM'), '') AS "joint_width_mm",
    COALESCE(
      NULLIF(substring(upper("raw"."name") FROM '\(([0-9]{1,2})\)'), ''),
      NULLIF(substring(upper("raw"."name") FROM '[[:space:]]([0-9]{1,2})[[:space:]]'), '')
    ) AS "color_code",
    ("raw"."name" ILIKE '%ETANCHE%') AS "waterproof"
  FROM "_seed_carrojoints_raw" "raw"
),
"cleaned" AS (
  SELECT
    "typed".*,
    trim(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(upper("typed"."name"), 'DEUTSCH COLOR|VITRAFIX|DERBIGUM|TURQUA|SIKA', ' ', 'g'),
                      'CARROJOINT|INTENSE|ETANCHE|FLEX|FC', ' ', 'g'
                    ),
                    '[0-9]+-[0-9]+MM', ' ', 'g'
                  ),
                  '[0-9]+(\.[0-9]+)?KG', ' ', 'g'
                ),
                '\([^)]*\)', ' ', 'g'
              ),
              '(^|[[:space:]])[0-9]{1,2}([[:space:]]|$)', ' ', 'g'
            ),
            '[^A-Z]+', ' ', 'g'
          ),
          '[[:space:]]+', ' ', 'g'
        ),
        '^[[:space:]]+|[[:space:]]+$', '', 'g'
      )
    ) AS "color_raw"
  FROM "typed"
),
"finalized" AS (
  SELECT
    "cleaned".*,
    "specs"."brand_name",
    "specs"."family_slug",
    "specs"."family_name",
    "specs"."family_subtitle",
    "specs"."family_description",
    "specs"."family_description_seo",
    "specs"."image_media_id",
    "specs"."technical_media_id",
    CASE
      WHEN "cleaned"."name" ILIKE '%INTENSE%' THEN 'Intense'
      WHEN "cleaned"."name" ILIKE '%FLEX%' THEN 'Flex'
      WHEN "cleaned"."brand_slug" = 'sika' THEN 'SikaCeram'
      ELSE 'Standard'
    END AS "product_range",
    COALESCE(NULLIF(initcap(lower("cleaned"."color_raw")), ''), 'Non precisee') AS "color_label"
  FROM "cleaned"
  JOIN "_seed_carrojoint_brand_specs" "specs"
    ON "specs"."brand_slug" = "cleaned"."brand_slug"
)
SELECT
  "finalized".*,
  trim(regexp_replace(initcap(lower(regexp_replace("finalized"."name", '[[:space:]]+', ' ', 'g'))), '[[:space:]]+', ' ', 'g')) AS "pretty_raw_name",
  "finalized"."brand_name" || ' - ' || trim(regexp_replace(initcap(lower(regexp_replace(
    regexp_replace("finalized"."name", 'DEUTSCH COLOR|VITRAFIX|DERBIGUM|TURQUA|SIKA', ' ', 'gi'),
    '[[:space:]]+', ' ', 'g'
  ))), '[[:space:]]+', ' ', 'g')) AS "display_name",
  ROW_NUMBER() OVER (
    PARTITION BY "finalized"."brand_slug"
    ORDER BY "finalized"."color_label", COALESCE("finalized"."packaging_weight_kg", 0), "finalized"."sku"
  )::INTEGER AS "sort_order"
FROM "finalized";

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo",
  "main_image_media_id", "created_at", "updated_at"
)
SELECT DISTINCT
  "specs"."family_slug",
  "specs"."family_name",
  "specs"."family_subtitle",
  "specs"."family_description",
  "specs"."family_description_seo",
  CASE WHEN "media"."id" IS NULL THEN NULL ELSE "specs"."image_media_id" END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_seed_carrojoint_brand_specs" "specs"
LEFT JOIN "media" ON "media"."id" = "specs"."image_media_id"
WHERE EXISTS (
  SELECT 1 FROM "_seed_carrojoints_enriched" "seeded"
  WHERE "seeded"."family_slug" = "specs"."family_slug"
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
  "rich_text_description", "short_description", "title_seo", "description_seo", "tags",
  "guarantee_months", "visible_ecommerce", "visible_vitrine", "is_featured", "is_promoted", "is_new",
  "stock_available", "stock_alert_threshold", "stock_unit", "stock_availability", "stock_visibility",
  "base_price_ttc_tnd", "current_price_ttc_tnd", "vat_rate", "price_visibility",
  "created_by_id", "last_updated_by_id", "created_at", "updated_at"
)
SELECT
  "seeded"."sku",
  regexp_replace(
    lower(regexp_replace("seeded"."display_name" || '-' || "seeded"."sku", '[^a-zA-Z0-9]+', '-', 'g')),
    '(^-+|-+$)', '', 'g'
  ) AS "slug",
  'VARIANT'::"ProductKind",
  "brands"."id",
  "types"."id",
  "seeded"."name",
  left("seeded"."display_name", 255),
  jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'heading',
        'attrs', jsonb_build_object('level', 2),
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seeded"."display_name"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seeded"."display_name" || ' est un joint de carrelage sélectionné pour le catalogue COBAM GROUP.'))
      ),
      jsonb_build_object(
        'type', 'bulletList',
        'content', jsonb_build_array(
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'SKU : ' || "seeded"."sku"))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Marque : ' || "seeded"."brand_name"))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Couleur : ' || "seeded"."color_label"))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Conditionnement : ' || COALESCE("seeded"."packaging_weight_kg"::TEXT, 'Non precise') || ' kg'))))),
          jsonb_build_object('type', 'listItem', 'content', jsonb_build_array(jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Stock importe : ' || "seeded"."stock_available"::TEXT)))))
        )
      )
    )
  ),
  left('Joint de carrelage ' || "seeded"."brand_name" || ' - ' || "seeded"."color_label" || ' - ' || COALESCE("seeded"."packaging_weight_kg"::TEXT, '0') || ' kg.', 500),
  left("seeded"."display_name" || ' | COBAM GROUP', 60),
  left("seeded"."display_name" || ' : joint de carrelage ' || "seeded"."brand_name" || ' pour pose et finition, disponible chez COBAM GROUP.', 160),
  'carrojoint joint_carrelage produit_pose_carrelage produits_de_pose_finition ' || replace("seeded"."brand_slug", '-', '_'),
  0,
  true,
  true,
  false,
  false,
  false,
  "seeded"."stock_available",
  0,
  'PIECE'::"StockUnit",
  CASE WHEN "seeded"."stock_available" > 0 THEN 'IN_STOCK'::"ProductAvailability" ELSE 'OUT_OF_STOCK'::"ProductAvailability" END,
  'AUTO'::"ProductInventoryVisibility",
  "seeded"."price_ttc",
  "seeded"."price_ttc",
  19.000,
  'AUTO'::"ProductPricingVisibility",
  'cmnnfemzf00008wg9iwn6hacx',
  'cmnnfemzf00008wg9iwn6hacx',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_seed_carrojoints_enriched" "seeded"
JOIN "organizations" "brands"
  ON "brands"."slug" = "seeded"."brand_slug"
JOIN "product_type_templates" "types"
  ON "types"."slug" = 'produit-pose-carrelage'
ON CONFLICT ("sku") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "kind" = EXCLUDED."kind",
  "brand_id" = EXCLUDED."brand_id",
  "product_type_id" = EXCLUDED."product_type_id",
  "name" = EXCLUDED."name",
  "display_name" = EXCLUDED."display_name",
  "rich_text_description" = EXCLUDED."rich_text_description",
  "short_description" = EXCLUDED."short_description",
  "title_seo" = EXCLUDED."title_seo",
  "description_seo" = EXCLUDED."description_seo",
  "tags" = EXCLUDED."tags",
  "visible_ecommerce" = EXCLUDED."visible_ecommerce",
  "visible_vitrine" = EXCLUDED."visible_vitrine",
  "stock_available" = EXCLUDED."stock_available",
  "stock_unit" = EXCLUDED."stock_unit",
  "stock_availability" = EXCLUDED."stock_availability",
  "stock_visibility" = EXCLUDED."stock_visibility",
  "base_price_ttc_tnd" = EXCLUDED."base_price_ttc_tnd",
  "current_price_ttc_tnd" = EXCLUDED."current_price_ttc_tnd",
  "price_visibility" = EXCLUDED."price_visibility",
  "last_updated_by_id" = EXCLUDED."last_updated_by_id",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "families"."id",
  "products"."id",
  "seeded"."sort_order"
FROM "_seed_carrojoints_enriched" "seeded"
JOIN "products" ON "products"."sku" = "seeded"."sku"
JOIN "product_families" "families" ON "families"."slug" = "seeded"."family_slug"
ON CONFLICT ("product_id") DO UPDATE SET
  "family_id" = EXCLUDED."family_id",
  "sort_order" = EXCLUDED."sort_order";

WITH "ranked_defaults" AS (
  SELECT
    "families"."id" AS "family_id",
    "products"."id" AS "product_id",
    ROW_NUMBER() OVER (
      PARTITION BY "families"."id"
      ORDER BY "products"."stock_available" DESC, "seeded"."sort_order" ASC, "products"."id" ASC
    ) AS "rank"
  FROM "_seed_carrojoints_enriched" "seeded"
  JOIN "products" ON "products"."sku" = "seeded"."sku"
  JOIN "product_families" "families" ON "families"."slug" = "seeded"."family_slug"
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
FROM "_seed_carrojoints_enriched" "seeded"
JOIN "products" ON "products"."sku" = "seeded"."sku"
JOIN "product_subcategories" "subcategories"
  ON "subcategories"."slug" = 'produits-de-pose-finition'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

WITH "media_source" AS (
  SELECT
    "products"."id" AS "product_id",
    "seeded"."image_media_id" AS "media_id",
    'GALLERY'::"ProductMediaRole" AS "role",
    "seeded"."display_name" AS "alt_text",
    0 AS "sort_order"
  FROM "_seed_carrojoints_enriched" "seeded"
  JOIN "products" ON "products"."sku" = "seeded"."sku"
  WHERE "seeded"."image_media_id" IS NOT NULL

  UNION ALL

  SELECT
    "products"."id" AS "product_id",
    "seeded"."technical_media_id" AS "media_id",
    'TECHNICAL'::"ProductMediaRole" AS "role",
    'Fiche technique ' || "seeded"."family_name" AS "alt_text",
    10 AS "sort_order"
  FROM "_seed_carrojoints_enriched" "seeded"
  JOIN "products" ON "products"."sku" = "seeded"."sku"
  WHERE "seeded"."technical_media_id" IS NOT NULL
)
INSERT INTO "product_media" (
  "product_id", "media_id", "role", "name", "alt_text", "sort_order", "created_at", "updated_at"
)
SELECT
  "media_source"."product_id",
  "media_source"."media_id",
  "media_source"."role",
  CASE WHEN "media_source"."role" = 'TECHNICAL' THEN "media_source"."alt_text" ELSE NULL END,
  "media_source"."alt_text",
  "media_source"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "media_source"
JOIN "media" ON "media"."id" = "media_source"."media_id"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DELETE FROM "product_attributes"
WHERE "product_id" IN (
  SELECT "products"."id"
  FROM "_seed_carrojoints_enriched" "seeded"
  JOIN "products" ON "products"."sku" = "seeded"."sku"
)
AND "name" IN (
  'color',
  'product_use',
  'packaging_weight_kg',
  'ready_to_use',
  'product_range',
  'color_code',
  'joint_width_mm',
  'waterproof'
);

WITH "attribute_source" AS (
  SELECT "seeded"."sku", 'color' AS "key", 'filtres-principaux' AS "group_slug", 'Couleur' AS "label", "seeded"."color_label" AS "value", NULL::TEXT AS "unit", 'COLOR' AS "input_type", true AS "is_filterable", 0 AS "group_sort_order", 20 AS "sort_order"
  FROM "_seed_carrojoints_enriched" "seeded"

  UNION ALL
  SELECT "seeded"."sku", 'product_use', 'filtres-principaux', 'Type de produit', 'Joint de carrelage', NULL::TEXT, 'SELECT', true, 0, 10
  FROM "_seed_carrojoints_enriched" "seeded"

  UNION ALL
  SELECT "seeded"."sku", 'packaging_weight_kg', 'filtres-principaux', 'Conditionnement', COALESCE("seeded"."packaging_weight_kg"::TEXT, ''), 'kg', 'NUMBER', true, 0, 30
  FROM "_seed_carrojoints_enriched" "seeded"
  WHERE "seeded"."packaging_weight_kg" IS NOT NULL

  UNION ALL
  SELECT "seeded"."sku", 'ready_to_use', 'filtres-principaux', 'Pret a l''emploi', 'false', NULL::TEXT, 'BOOLEAN', true, 0, 40
  FROM "_seed_carrojoints_enriched" "seeded"

  UNION ALL
  SELECT "seeded"."sku", 'product_range', 'caracteristiques-techniques', 'Gamme', "seeded"."product_range", NULL::TEXT, 'SELECT', true, 20, 50
  FROM "_seed_carrojoints_enriched" "seeded"

  UNION ALL
  SELECT "seeded"."sku", 'color_code', 'caracteristiques-techniques', 'Code couleur', "seeded"."color_code", NULL::TEXT, 'TEXT', true, 20, 60
  FROM "_seed_carrojoints_enriched" "seeded"
  WHERE "seeded"."color_code" IS NOT NULL

  UNION ALL
  SELECT "seeded"."sku", 'joint_width_mm', 'caracteristiques-techniques', 'Largeur de joint', "seeded"."joint_width_mm", 'mm', 'TEXT', true, 20, 70
  FROM "_seed_carrojoints_enriched" "seeded"
  WHERE "seeded"."joint_width_mm" IS NOT NULL

  UNION ALL
  SELECT "seeded"."sku", 'waterproof', 'caracteristiques-techniques', 'Etanche', CASE WHEN "seeded"."waterproof" THEN 'true' ELSE 'false' END, NULL::TEXT, 'BOOLEAN', true, 20, 80
  FROM "_seed_carrojoints_enriched" "seeded"
)
INSERT INTO "product_attributes" (
  "product_id", "attribute_def_id", "attribute_group_id", "name", "label", "value", "unit", "input_type",
  "is_required", "is_filterable", "group_name", "group_sort_order", "sort_order"
)
SELECT
  "products"."id",
  "defs"."id",
  "groups"."id",
  "attrs"."key",
  "attrs"."label",
  "attrs"."value",
  "attrs"."unit",
  "attrs"."input_type"::"ProductTypeAttributeInputType",
  false,
  "attrs"."is_filterable",
  "groups"."name",
  "attrs"."group_sort_order",
  "attrs"."sort_order"
FROM "attribute_source" "attrs"
JOIN "products" ON "products"."sku" = "attrs"."sku"
JOIN "product_attribute_definitions" "defs" ON "defs"."key" = "attrs"."key"
JOIN "product_type_templates" "types" ON "types"."slug" = 'produit-pose-carrelage'
LEFT JOIN "product_attribute_groups" "groups"
  ON "groups"."product_type_id" = "types"."id"
 AND "groups"."slug" = "attrs"."group_slug";

COMMIT;
