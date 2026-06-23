-- Seed the ZIP-backed Today plaque de commande WC products.
-- Media 1954 is intentionally validated but not linked: the extracted PDF content describes a lighting product, not the Geberit Sigma01 plaque.

CREATE TEMP TABLE "_today_plaque_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_today_plaque_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1882, 'PLAQUE CARRE NOIR CHROME ALPHA01 115.055.QC.1 GEBERIT [1].webp', 'IMAGE'::"MediaKind"),
  (1883, 'PLAQUE CARRE NOIR CHROME ALPHA01 115.055.QC.1 GEBERIT [2].webp', 'IMAGE'::"MediaKind"),
  (1884, 'PLAQUE CARRE NOIR CHROME ALPHA01 115.055.QC.1 GEBERIT [3].webp', 'IMAGE'::"MediaKind"),
  (1885, 'PLAQUE CARRE NOIR CHROME ALPHA01 115.055.QC.1 GEBERIT [4].webp', 'IMAGE'::"MediaKind"),
  (1886, 'PLAQUE CARRE NOIR MAT ALPHA01 115.055.14.1 GEBERIT [1].webp', 'IMAGE'::"MediaKind"),
  (1887, 'PLAQUE CARRE NOIR MAT ALPHA01 115.055.14.1 GEBERIT [2].webp', 'IMAGE'::"MediaKind"),
  (1888, 'PLAQUE CARRE NOIR MAT ALPHA01 115.055.14.1 GEBERIT [3].webp', 'IMAGE'::"MediaKind"),
  (1889, 'PLAQUE CARRE NOIR MAT ALPHA01 115.055.14.1 GEBERIT [4].webp', 'IMAGE'::"MediaKind"),
  (1890, 'PLAQUE CARRE OR ROUGE (BRONZE) ALPHA01 115.055.QA.1 GEBERIT [1].webp', 'IMAGE'::"MediaKind"),
  (1891, 'PLAQUE CARRE OR ROUGE (BRONZE) ALPHA01 115.055.QA.1 GEBERIT [2].webp', 'IMAGE'::"MediaKind"),
  (1892, 'PLAQUE CARRE OR ROUGE (BRONZE) ALPHA01 115.055.QA.1 GEBERIT [3].webp', 'IMAGE'::"MediaKind"),
  (1893, 'PLAQUE CARRE OR ROUGE (BRONZE) ALPHA01 115.055.QA.1 GEBERIT [4].webp', 'IMAGE'::"MediaKind"),
  (1894, 'PLAQUE CARRE CHROME REF 115-045 ALPHA GEBERIT [1].webp', 'IMAGE'::"MediaKind"),
  (1895, 'PLAQUE CARRE CHROME REF 115-045 ALPHA GEBERIT [2].webp', 'IMAGE'::"MediaKind"),
  (1896, 'PLAQUE CARRE CHROME REF 115-045 ALPHA GEBERIT [3].webp', 'IMAGE'::"MediaKind"),
  (1897, 'PLAQUE CARRE CHROME REF 115-045 ALPHA GEBERIT [4].webp', 'IMAGE'::"MediaKind"),
  (1898, 'PLAQUE CARRE WARM SUNSET BROSSE 38732DL0 GROHE [1].webp', 'IMAGE'::"MediaKind"),
  (1899, 'PLAQUE CARRE WARM SUNSET BROSSE 38732DL0 GROHE [2].webp', 'IMAGE'::"MediaKind"),
  (1900, 'PLAQUE CARRE WARM SUNSET BROSSE 38732DL0 GROHE [3].webp', 'IMAGE'::"MediaKind"),
  (1901, 'PLAQUE DE CHASSE CHROME COSMO GROHE 38732 [1].webp', 'IMAGE'::"MediaKind"),
  (1902, 'PLAQUE DE CHASSE CHROME COSMO GROHE 38732 [2].webp', 'IMAGE'::"MediaKind"),
  (1903, 'PLAQUE DE CHASSE CHROME COSMO GROHE 38732 [3].webp', 'IMAGE'::"MediaKind"),
  (1904, 'PLAQUE DE CONTROLE JCP-GBP-152415PD OPAL JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1905, 'PLAQUE DE CONTROLE JCP-GBP-152415PD OPAL JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1906, 'PLAQUE DE CONTROLE JCP-GBP-152415PD OPAL JAQUAR [3].webp', 'IMAGE'::"MediaKind"),
  (1907, 'PLAQUE DE CONTROLE REF 392415CHR ARIA JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1908, 'PLAQUE DE CONTROLE REF 392415CHR ARIA JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1909, 'PLAQUE DE CONTROLE REF 392415CHR ARIA JAQUAR [3].webp', 'IMAGE'::"MediaKind"),
  (1910, 'PLAQUE DE CONTROLE REF852415 CHROME ALIVE JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1911, 'PLAQUE DE CONTROLE REF852415 CHROME ALIVE JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1912, 'PLAQUE DE CONTROLE REF852415 CHROME ALIVE JAQUAR [3].webp', 'IMAGE'::"MediaKind"),
  (1913, 'PLAQUE DE CONTROLE REF852415BLM BLACK MAT ALIVE JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1914, 'PLAQUE DE CONTROLE REF852415BLM BLACK MAT ALIVE JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1915, 'PLAQUE DE CONTROLE REF852415BLM BLACK MAT ALIVE JAQUAR [3].webp', 'IMAGE'::"MediaKind"),
  (1916, 'PLAQUE ROND CHROME 115.770.21.5 SIGMA 01 GEBERIT [1].webp', 'IMAGE'::"MediaKind"),
  (1917, 'PLAQUE ROND CHROME 115.770.21.5 SIGMA 01 GEBERIT [2].webp', 'IMAGE'::"MediaKind"),
  (1918, 'PLAQUE ROND CHROME 115.770.21.5 SIGMA 01 GEBERIT [3].webp', 'IMAGE'::"MediaKind"),
  (1919, 'PLAQUE ROND CHROME 115.770.21.5 SIGMA 01 GEBERIT [4].webp', 'IMAGE'::"MediaKind"),
  (1920, 'PLAQUE RONDE BLANCHE REF 115-125-11 DELTA GEBERIT [1].webp', 'IMAGE'::"MediaKind"),
  (1921, 'PLAQUE RONDE BLANCHE REF 115-125-11 DELTA GEBERIT [2].webp', 'IMAGE'::"MediaKind"),
  (1922, 'PLAQUE RONDE BLANCHE REF 115-125-11 DELTA GEBERIT [3].webp', 'IMAGE'::"MediaKind"),
  (1923, 'PLAQUE RONDE BLANCHE REF 115-125-11 DELTA GEBERIT [4].webp', 'IMAGE'::"MediaKind"),
  (1924, 'PLAQUE RONDE CHROME REF 115-35 ALPHA 01 GEBERIT [1].webp', 'IMAGE'::"MediaKind"),
  (1925, 'PLAQUE RONDE CHROME REF 115-35 ALPHA 01 GEBERIT [2].webp', 'IMAGE'::"MediaKind"),
  (1926, 'PLAQUE RONDE CHROME REF 115-35 ALPHA 01 GEBERIT [3].webp', 'IMAGE'::"MediaKind"),
  (1927, 'PLAQUE RONDE CHROME REF 115-35 ALPHA 01 GEBERIT [4].webp', 'IMAGE'::"MediaKind"),
  (1928, 'PLAQUE DE CONTROLE REF 102415 CHR ORNAMIX JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1929, 'PLAQUE DE CONTROLE REF 102415 CHR ORNAMIX JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1930, 'PLAQUE DE CONTROLE REF 102415 CHR ORNAMIX JAQUAR [3].webp', 'IMAGE'::"MediaKind"),
  (1931, 'PLAQUE CARRE ALPHA01 115.055 GEBERIT (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1932, 'PLAQUE CARRE ALPHA01 115.055 GEBERIT (INSTRUCTIONS DE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1933, 'PLAQUE CARRE ALPHA01 115.055 GEBERIT (INSTRUCTIONS D''ENTRETIEN).pdf', 'DOCUMENT'::"MediaKind"),
  (1934, 'PLAQUE CARRE CHROME REF 115-045 ALPHA GEBERIT (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1935, 'PLAQUE CARRE CHROME REF 115-045 ALPHA GEBERIT (INSTRUCTIONS D''ENTRETIEN).pdf', 'DOCUMENT'::"MediaKind"),
  (1936, 'PLAQUE CARRE CHROME REF 115-045 ALPHA GEBERIT (INSTRUCTIONS D''INSTALLATION).pdf', 'DOCUMENT'::"MediaKind"),
  (1937, 'PLAQUE DE CHASSE COSMO GROHE 38732 (CONSEILS D''ENTRETIEN).pdf', 'DOCUMENT'::"MediaKind"),
  (1938, 'PLAQUE DE CHASSE COSMO GROHE 38732 (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1939, 'PLAQUE DE CHASSE COSMO GROHE 38732 (NOTICE D''INSTALLATION [1]).pdf', 'DOCUMENT'::"MediaKind"),
  (1940, 'PLAQUE DE CHASSE COSMO GROHE 38732 (NOTICE D''INSTALLATION [2]).pdf', 'DOCUMENT'::"MediaKind"),
  (1941, 'PLAQUE DE CONTROLE JCP-GBP-152415PD OPAL JAQUAR (GUIDE D''INSTALLATION).pdf', 'DOCUMENT'::"MediaKind"),
  (1942, 'PLAQUE DE CONTROLE REF 102415 CHR ORNAMIX JAQUAR (GUIDE D''INSTALLATION).pdf', 'DOCUMENT'::"MediaKind"),
  (1943, 'PLAQUE DE CONTROLE REF 392415CHR ARIA JAQUAR (GUIDE D''INSTALLATION).pdf', 'DOCUMENT'::"MediaKind"),
  (1944, 'PLAQUE DE CONTROLE REF852415 CHROME ALIVE JAQUAR (GUIDE D''INSTALLATION).pdf', 'DOCUMENT'::"MediaKind"),
  (1945, 'PLAQUE ROND CHROME 115.770.21.5 SIGMA 01 GEBERIT (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1946, 'PLAQUE ROND CHROME 115.770.21.5 SIGMA 01 GEBERIT (INSTRUCTIONS DE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1947, 'PLAQUE ROND CHROME 115.770.21.5 SIGMA 01 GEBERIT (INSTRUCTIONS D''ENTRETIEN).pdf', 'DOCUMENT'::"MediaKind"),
  (1948, 'PLAQUE RONDE BLANCHE REF 115-125-11 DELTA GEBERIT (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1949, 'PLAQUE RONDE BLANCHE REF 115-125-11 DELTA GEBERIT (INSTRUCTIONS DE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1950, 'PLAQUE RONDE CHROME REF 115-35 ALPHA 01 GEBERIT (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1951, 'PLAQUE RONDE CHROME REF 115-35 ALPHA 01 GEBERIT (INSTRUCTIONS DE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1952, 'PLAQUE RONDE CHROME REF 115-35 ALPHA 01 GEBERIT (INSTRUCTIONS D''ENTRETIEN).pdf', 'DOCUMENT'::"MediaKind"),
  (1953, 'PLAQUE DE CHASSE COSMO GROHE 38732 (DECLARATION ENVIRONNEMENTALE).pdf', 'DOCUMENT'::"MediaKind"),
  (1954, 'PLAQUE ROND CHROME 115.770.21.5 SIGMA 01 GEBERIT (DECLARATION ENVIRONNEMENTALE).pdf', 'DOCUMENT'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
  missing_media_ids TEXT;
BEGIN
  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_today_plaque_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    SELECT string_agg("expected"."media_id"::TEXT, ', ' ORDER BY "expected"."media_id")
    INTO missing_media_ids
    FROM "_today_plaque_expected_media" "expected"
    LEFT JOIN "media" "media"
      ON "media"."id" = "expected"."media_id"
      AND "media"."original_filename" = "expected"."expected_filename"
      AND "media"."kind" = "expected"."kind"
      AND "media"."deleted_at" IS NULL
    WHERE "media"."id" IS NULL;

    RAISE EXCEPTION 'Today plaque WC seed aborted: % expected media row(s) are missing or mismatched. Media IDs: %.', missing_media_count, missing_media_ids;
  END IF;
END $$;

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES
  ('CHROME', 'Chrome', '#C8CDD0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('BLACK_CHROME', 'Chrome noir', '#171717', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('MATT_BLACK', 'Noir mat', '#111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('WHITE', 'Blanc', '#F4F4F4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('BRUSHED_WARM_SUNSET_BRONZE', 'Bronze - Warm Sunset brossé', '#8A592F', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ROSE_GOLD_PVD', 'Or rosé PVD', '#6B3925', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

CREATE TEMP TABLE "_today_plaque_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_today_plaque_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
VALUES
  ('plaque-commande-wc', 'filtres-principaux', 'Filtres principaux', 0),
  ('plaque-commande-wc', 'caracteristiques-techniques', 'Caractéristiques techniques', 20);

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
FROM "_today_plaque_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_plaque_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_today_plaque_attribute_definitions" ("key", "label", "unit", "input_type", "select_options")
VALUES
  ('finish', 'Finition', NULL, 'FINISH'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('number_of_buttons', 'Nombre de touches', 'touches', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('compatible_system', 'Système compatible', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('manufacturer_ref', 'Référence fabricant', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('product_line', 'Gamme', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('dimensions_text', 'Dimensions', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('material', 'Matière', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['ABS', 'Matière synthétique']::TEXT[]),
  ('mounting_type', 'Montage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Déclenchement frontal', 'Déclenchement par le dessus ou frontal', 'Horizontal ou vertical', 'Vertical']::TEXT[]),
  ('activation_type', 'Commande', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Double touche', 'Double touche interrompable', 'Rinçage double touche']::TEXT[]),
  ('compatibility_notes', 'Compatibilité', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]);

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
FROM "_today_plaque_attribute_definitions"
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "unit" = EXCLUDED."unit",
  "input_type" = EXCLUDED."input_type",
  "select_options" = (
    SELECT ARRAY(
      SELECT DISTINCT "option"."value"
      FROM unnest("product_attribute_definitions"."select_options" || EXCLUDED."select_options") AS "option"("value")
      WHERE "option"."value" <> ''
      ORDER BY "option"."value"
    )
  ),
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_plaque_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_today_plaque_type_attributes" (
  "product_type_slug", "key", "group_slug", "is_filterable", "sort_order"
)
VALUES
  ('plaque-commande-wc', 'finish', 'filtres-principaux', true, 10),
  ('plaque-commande-wc', 'number_of_buttons', 'filtres-principaux', true, 20),
  ('plaque-commande-wc', 'compatible_system', 'filtres-principaux', true, 30),
  ('plaque-commande-wc', 'manufacturer_ref', 'caracteristiques-techniques', true, 40),
  ('plaque-commande-wc', 'product_line', 'caracteristiques-techniques', true, 50),
  ('plaque-commande-wc', 'dimensions_text', 'caracteristiques-techniques', true, 60),
  ('plaque-commande-wc', 'material', 'caracteristiques-techniques', true, 70),
  ('plaque-commande-wc', 'mounting_type', 'caracteristiques-techniques', true, 80),
  ('plaque-commande-wc', 'activation_type', 'caracteristiques-techniques', true, 90),
  ('plaque-commande-wc', 'compatibility_notes', 'caracteristiques-techniques', false, 100);

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
FROM "_today_plaque_type_attributes" "seed"
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

CREATE TEMP TABLE "_today_plaque_products" AS
SELECT *
FROM jsonb_to_recordset($products$
[
  {
    "sku":"00246231",
    "slug":"plaque-commande-alpha01-carree-noir-chrome-geberit-115055qc1",
    "name":"PLAQUE CARRE NOIR CHROME ALPHA01 115.055.QC.1 GEBERIT",
    "display_name":"Plaque de commande Alpha01 carrée noir chromé Geberit",
    "brand_slug":"geberit",
    "product_type_slug":"plaque-commande-wc",
    "kind":"VARIANT",
    "family_slug":"plaque-commande-alpha01-carree-geberit-115055",
    "family_name":"Plaque de commande Geberit Alpha01 carrée 115.055",
    "family_subtitle":"Plaque de commande WC",
    "family_description":"Famille de plaques de déclenchement Geberit Alpha01 carrées pour réservoirs encastrés Alpha, avec rinçage double touche et plusieurs finitions.",
    "family_description_seo":"Plaques de commande Geberit Alpha01 carrées 115.055 pour réservoirs Alpha, en finitions noir chromé, noir mat et or rouge.",
    "family_main_media_id":1882,
    "family_default_sku":"00246231",
    "family_sort_order":0,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":361.837,
    "stock_available":8.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Alpha01 carrée noir chromé Geberit",
    "description_seo":"Plaque de commande Geberit Alpha01 carrée noir chromé pour réservoirs encastrés Alpha, avec rinçage double touche.",
    "tags":"plaque-commande wc chasse geberit alpha01 115055qc1 noir-chrome noir chrome carree double-touche reservoir-alpha salle-de-bain",
    "intro":"Cette plaque de commande Geberit Alpha01 carrée apporte une finition noir chromé élégante aux WC équipés d'un réservoir encastré Alpha.",
    "details":"Son rinçage double touche facilite l'utilisation quotidienne, tandis que le déclenchement par le dessus ou frontal permet une intégration adaptée aux configurations compatibles Geberit Alpha.",
    "attributes":[
      {"key":"finish","value":"Chrome noir","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Réservoirs à encastrer Geberit Alpha","sort_order":30},
      {"key":"manufacturer_ref","value":"115.055.QC.1","sort_order":40},
      {"key":"product_line","value":"Alpha01","sort_order":50},
      {"key":"dimensions_text","value":"21.3x14.2x1.6 cm","sort_order":60},
      {"key":"material","value":"Matière synthétique","sort_order":70},
      {"key":"mounting_type","value":"Déclenchement par le dessus ou frontal","sort_order":80},
      {"key":"activation_type","value":"Rinçage double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Compatible avec les réservoirs encastrés Geberit Alpha selon notice.","sort_order":100}
    ],
    "media":[
      {"media_id":1882,"role":"GALLERY","name":"Plaque Alpha01 carrée noir chromé Geberit 1","alt_text":"Plaque de commande Geberit Alpha01 carrée noir chromé","sort_order":0},
      {"media_id":1883,"role":"GALLERY","name":"Plaque Alpha01 carrée noir chromé Geberit 2","alt_text":"Plaque Geberit Alpha01 noir chromé vue de détail","sort_order":10},
      {"media_id":1884,"role":"GALLERY","name":"Plaque Alpha01 carrée noir chromé Geberit 3","alt_text":"Plaque de déclenchement Geberit Alpha01 noir chromé","sort_order":20},
      {"media_id":1885,"role":"GALLERY","name":"Plaque Alpha01 carrée noir chromé Geberit 4","alt_text":"Plaque WC Geberit Alpha01 carrée noir chromé","sort_order":30},
      {"media_id":1931,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique plaque Geberit Alpha01 carrée 115.055","sort_order":100},
      {"media_id":1932,"role":"TECHNICAL","name":"Instructions de montage","alt_text":"Instructions de montage plaque Geberit Alpha01 carrée","sort_order":110},
      {"media_id":1933,"role":"TECHNICAL","name":"Instructions d'entretien","alt_text":"Instructions d'entretien plaque Geberit Alpha01 carrée","sort_order":120}
    ],
    "certificate_slugs":[]
  },
  {
    "sku":"00231886",
    "slug":"plaque-commande-alpha01-carree-noir-mat-geberit-115055141",
    "name":"PLAQUE CARRE NOIR MAT ALPHA01 115.055.14.1 GEBERIT",
    "display_name":"Plaque de commande Alpha01 carrée noir mat Geberit",
    "brand_slug":"geberit",
    "product_type_slug":"plaque-commande-wc",
    "kind":"VARIANT",
    "family_slug":"plaque-commande-alpha01-carree-geberit-115055",
    "family_name":"Plaque de commande Geberit Alpha01 carrée 115.055",
    "family_subtitle":"Plaque de commande WC",
    "family_description":"Famille de plaques de déclenchement Geberit Alpha01 carrées pour réservoirs encastrés Alpha, avec rinçage double touche et plusieurs finitions.",
    "family_description_seo":"Plaques de commande Geberit Alpha01 carrées 115.055 pour réservoirs Alpha, en finitions noir chromé, noir mat et or rouge.",
    "family_main_media_id":1882,
    "family_default_sku":"00246231",
    "family_sort_order":10,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":311.112,
    "stock_available":3.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Alpha01 carrée noir mat Geberit",
    "description_seo":"Plaque de commande Geberit Alpha01 carrée noir mat pour réservoirs encastrés Alpha, rinçage double touche.",
    "tags":"plaque-commande wc chasse geberit alpha01 115055141 noir-mat noir mat carree double-touche reservoir-alpha salle-de-bain",
    "intro":"Cette plaque de commande Geberit Alpha01 carrée habille le WC suspendu avec une finition noir mat sobre et contemporaine.",
    "details":"Elle est conçue pour les réservoirs encastrés Geberit Alpha et propose un rinçage double touche pratique pour un usage quotidien simple et précis.",
    "attributes":[
      {"key":"finish","value":"Noir mat","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Réservoirs à encastrer Geberit Alpha","sort_order":30},
      {"key":"manufacturer_ref","value":"115.055.14.1","sort_order":40},
      {"key":"product_line","value":"Alpha01","sort_order":50},
      {"key":"dimensions_text","value":"21.3x14.2x1.6 cm","sort_order":60},
      {"key":"material","value":"Matière synthétique","sort_order":70},
      {"key":"mounting_type","value":"Déclenchement par le dessus ou frontal","sort_order":80},
      {"key":"activation_type","value":"Rinçage double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Compatible avec les réservoirs encastrés Geberit Alpha selon notice.","sort_order":100}
    ],
    "media":[
      {"media_id":1886,"role":"GALLERY","name":"Plaque Alpha01 carrée noir mat Geberit 1","alt_text":"Plaque de commande Geberit Alpha01 carrée noir mat","sort_order":0},
      {"media_id":1887,"role":"GALLERY","name":"Plaque Alpha01 carrée noir mat Geberit 2","alt_text":"Plaque Geberit Alpha01 noir mat vue de détail","sort_order":10},
      {"media_id":1888,"role":"GALLERY","name":"Plaque Alpha01 carrée noir mat Geberit 3","alt_text":"Plaque de déclenchement Geberit Alpha01 noir mat","sort_order":20},
      {"media_id":1889,"role":"GALLERY","name":"Plaque Alpha01 carrée noir mat Geberit 4","alt_text":"Plaque WC Geberit Alpha01 carrée noir mat","sort_order":30},
      {"media_id":1931,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique plaque Geberit Alpha01 carrée 115.055","sort_order":100},
      {"media_id":1932,"role":"TECHNICAL","name":"Instructions de montage","alt_text":"Instructions de montage plaque Geberit Alpha01 carrée","sort_order":110},
      {"media_id":1933,"role":"TECHNICAL","name":"Instructions d'entretien","alt_text":"Instructions d'entretien plaque Geberit Alpha01 carrée","sort_order":120}
    ],
    "certificate_slugs":[]
  },
  {
    "sku":"00252980",
    "slug":"plaque-commande-alpha01-carree-or-rouge-geberit-115055qa1",
    "name":"PLAQUE CARRE OR ROUGE (BRONZE) ALPHA01 115.055.QA.1 GEBERIT",
    "display_name":"Plaque de commande Alpha01 carrée or rouge Geberit",
    "brand_slug":"geberit",
    "product_type_slug":"plaque-commande-wc",
    "kind":"VARIANT",
    "family_slug":"plaque-commande-alpha01-carree-geberit-115055",
    "family_name":"Plaque de commande Geberit Alpha01 carrée 115.055",
    "family_subtitle":"Plaque de commande WC",
    "family_description":"Famille de plaques de déclenchement Geberit Alpha01 carrées pour réservoirs encastrés Alpha, avec rinçage double touche et plusieurs finitions.",
    "family_description_seo":"Plaques de commande Geberit Alpha01 carrées 115.055 pour réservoirs Alpha, en finitions noir chromé, noir mat et or rouge.",
    "family_main_media_id":1882,
    "family_default_sku":"00246231",
    "family_sort_order":20,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":355.556,
    "stock_available":2.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Alpha01 carrée or rouge Geberit",
    "description_seo":"Plaque Geberit Alpha01 carrée finition or rouge bronze pour réservoirs encastrés Alpha, avec double touche.",
    "tags":"plaque-commande wc chasse geberit alpha01 115055qa1 or-rouge bronze rose-gold carree double-touche reservoir-alpha",
    "intro":"Cette plaque de commande Geberit Alpha01 carrée se distingue par une finition or rouge, idéale pour coordonner le WC à une robinetterie bronze ou rosée.",
    "details":"Prévue pour les réservoirs encastrés Geberit Alpha, elle associe un format compact à un rinçage double touche clair pour finaliser l'installation avec une touche décorative.",
    "attributes":[
      {"key":"finish","value":"Or rouge","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Réservoirs à encastrer Geberit Alpha","sort_order":30},
      {"key":"manufacturer_ref","value":"115.055.QA.1","sort_order":40},
      {"key":"product_line","value":"Alpha01","sort_order":50},
      {"key":"dimensions_text","value":"21.3x14.2x1.6 cm","sort_order":60},
      {"key":"material","value":"Matière synthétique","sort_order":70},
      {"key":"mounting_type","value":"Déclenchement par le dessus ou frontal","sort_order":80},
      {"key":"activation_type","value":"Rinçage double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Compatible avec les réservoirs encastrés Geberit Alpha selon notice.","sort_order":100}
    ],
    "media":[
      {"media_id":1890,"role":"GALLERY","name":"Plaque Alpha01 carrée or rouge Geberit 1","alt_text":"Plaque de commande Geberit Alpha01 carrée or rouge","sort_order":0},
      {"media_id":1891,"role":"GALLERY","name":"Plaque Alpha01 carrée or rouge Geberit 2","alt_text":"Plaque Geberit Alpha01 or rouge vue de détail","sort_order":10},
      {"media_id":1892,"role":"GALLERY","name":"Plaque Alpha01 carrée or rouge Geberit 3","alt_text":"Plaque de déclenchement Geberit Alpha01 or rouge","sort_order":20},
      {"media_id":1893,"role":"GALLERY","name":"Plaque Alpha01 carrée or rouge Geberit 4","alt_text":"Plaque WC Geberit Alpha01 carrée or rouge","sort_order":30},
      {"media_id":1931,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique plaque Geberit Alpha01 carrée 115.055","sort_order":100},
      {"media_id":1932,"role":"TECHNICAL","name":"Instructions de montage","alt_text":"Instructions de montage plaque Geberit Alpha01 carrée","sort_order":110},
      {"media_id":1933,"role":"TECHNICAL","name":"Instructions d'entretien","alt_text":"Instructions d'entretien plaque Geberit Alpha01 carrée","sort_order":120}
    ],
    "certificate_slugs":[]
  },
  {
    "sku":"00180382",
    "slug":"plaque-commande-alpha25-carree-chrome-geberit-115045215",
    "name":"PLAQUE CARRE CHROME REF 115-045 ALPHA GEBERIT",
    "display_name":"Plaque de commande Alpha25 carrée chrome Geberit",
    "brand_slug":"geberit",
    "product_type_slug":"plaque-commande-wc",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_default_sku":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":133.334,
    "stock_available":26.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Alpha25 carrée chrome Geberit",
    "description_seo":"Plaque de commande Geberit Alpha25 carrée chrome brillant pour réservoirs encastrés Alpha, avec double touche.",
    "tags":"plaque-commande wc chasse geberit alpha25 115045215 chrome brillant carree double-touche reservoir-alpha salle-de-bain",
    "intro":"Cette plaque de commande Geberit Alpha25 carrée en chrome brillant est conçue pour déclencher le rinçage des réservoirs encastrés Alpha.",
    "details":"Son format 21.3x14.2 cm et sa double touche permettent une intégration discrète et fonctionnelle dans les espaces WC équipés d'un système Geberit Alpha compatible.",
    "attributes":[
      {"key":"finish","value":"Chrome brillant","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Réservoirs à encastrer Geberit Alpha","sort_order":30},
      {"key":"manufacturer_ref","value":"115.045.21.5","sort_order":40},
      {"key":"product_line","value":"Alpha25","sort_order":50},
      {"key":"dimensions_text","value":"21.3x14.2x1.6 cm","sort_order":60},
      {"key":"material","value":"Matière synthétique","sort_order":70},
      {"key":"mounting_type","value":"Déclenchement par le dessus ou frontal","sort_order":80},
      {"key":"activation_type","value":"Rinçage double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Compatible avec les réservoirs encastrés Geberit Alpha selon notice.","sort_order":100}
    ],
    "media":[
      {"media_id":1894,"role":"GALLERY","name":"Plaque Alpha25 carrée chrome Geberit 1","alt_text":"Plaque de commande Geberit Alpha25 carrée chrome","sort_order":0},
      {"media_id":1895,"role":"GALLERY","name":"Plaque Alpha25 carrée chrome Geberit 2","alt_text":"Plaque Geberit Alpha25 chrome vue de détail","sort_order":10},
      {"media_id":1896,"role":"GALLERY","name":"Plaque Alpha25 carrée chrome Geberit 3","alt_text":"Plaque de déclenchement Geberit Alpha25 chrome","sort_order":20},
      {"media_id":1897,"role":"GALLERY","name":"Plaque Alpha25 carrée chrome Geberit 4","alt_text":"Plaque WC Geberit Alpha25 carrée chrome","sort_order":30},
      {"media_id":1934,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique plaque Geberit Alpha25 carrée chrome","sort_order":100},
      {"media_id":1935,"role":"TECHNICAL","name":"Instructions d'entretien","alt_text":"Instructions d'entretien plaque Geberit Alpha25","sort_order":110},
      {"media_id":1936,"role":"TECHNICAL","name":"Instructions d'installation","alt_text":"Instructions d'installation plaque Geberit Alpha25","sort_order":120}
    ],
    "certificate_slugs":[]
  },
  {
    "sku":"00220187",
    "slug":"plaque-commande-skate-cosmopolitan-chrome-grohe-38732000",
    "name":"PLAQUE DE CHASSE CHROME COSMO GROHE 38732",
    "display_name":"Plaque de commande Skate Cosmopolitan chrome Grohe",
    "brand_slug":"grohe",
    "product_type_slug":"plaque-commande-wc",
    "kind":"VARIANT",
    "family_slug":"plaque-commande-skate-cosmopolitan-38732-grohe",
    "family_name":"Plaque de commande Grohe Skate Cosmopolitan 38732",
    "family_subtitle":"Plaque de commande WC",
    "family_description":"Famille de plaques de commande Grohe Skate Cosmopolitan 38732 pour WC encastrés, avec double touche interrompable et finitions coordonnées.",
    "family_description_seo":"Plaques de commande Grohe Skate Cosmopolitan 38732 pour réservoirs encastrés compatibles, disponibles en chrome et finitions brossées.",
    "family_main_media_id":1901,
    "family_default_sku":"00220187",
    "family_sort_order":20,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":175.000,
    "stock_available":3.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Skate Cosmopolitan chrome Grohe",
    "description_seo":"Plaque Grohe Skate Cosmopolitan 38732000 chrome, double touche interrompable pour mécanisme pneumatique AV1.",
    "tags":"plaque-commande wc chasse grohe skate-cosmopolitan 38732000 chrome double-touche rapid-sl av1 abs nf salle-de-bain",
    "intro":"Cette plaque de commande Grohe Skate Cosmopolitan en chrome brillant finalise un WC encastré avec une finition nette et intemporelle.",
    "details":"Elle dispose d'une double touche interrompable, d'un montage horizontal ou vertical et d'une compatibilité avec les réservoirs Rapid SL équipés du mécanisme pneumatique AV1.",
    "attributes":[
      {"key":"finish","value":"Chrome","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Rapid SL avec réservoir de chasse GD 2; mécanisme pneumatique AV1","sort_order":30},
      {"key":"manufacturer_ref","value":"38732000","sort_order":40},
      {"key":"product_line","value":"Skate Cosmopolitan","sort_order":50},
      {"key":"dimensions_text","value":"156x197 mm","sort_order":60},
      {"key":"material","value":"ABS","sort_order":70},
      {"key":"mounting_type","value":"Horizontal ou vertical","sort_order":80},
      {"key":"activation_type","value":"Double touche interrompable","sort_order":90},
      {"key":"compatibility_notes","value":"Pour Rapid SLX, prévoir la trappe de visite 66 791 000 vendue séparément.","sort_order":100}
    ],
    "media":[
      {"media_id":1901,"role":"GALLERY","name":"Plaque Skate Cosmopolitan chrome Grohe 1","alt_text":"Plaque de commande Grohe Skate Cosmopolitan chrome","sort_order":0},
      {"media_id":1902,"role":"GALLERY","name":"Plaque Skate Cosmopolitan chrome Grohe 2","alt_text":"Plaque Grohe Skate Cosmopolitan chrome vue de détail","sort_order":10},
      {"media_id":1903,"role":"GALLERY","name":"Plaque Skate Cosmopolitan chrome Grohe 3","alt_text":"Plaque WC Grohe Skate Cosmopolitan chrome","sort_order":20},
      {"media_id":1938,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique plaque Grohe Skate Cosmopolitan 38732","sort_order":100},
      {"media_id":1937,"role":"TECHNICAL","name":"Conseils d'entretien","alt_text":"Conseils d'entretien plaque Grohe Skate Cosmopolitan 38732","sort_order":110},
      {"media_id":1939,"role":"TECHNICAL","name":"Notice d'installation [1]","alt_text":"Notice d'installation plaque Grohe Skate Cosmopolitan première partie","sort_order":120},
      {"media_id":1940,"role":"TECHNICAL","name":"Notice d'installation [2]","alt_text":"Notice d'installation plaque Grohe Skate Cosmopolitan deuxième partie","sort_order":130},
      {"media_id":1953,"role":"CERTIFICATE","name":"Déclaration environnementale","alt_text":"Déclaration environnementale FDES plaque de commande Grohe","sort_order":200}
    ],
    "certificate_slugs":["fdes"]
  },
  {
    "sku":"00251402",
    "slug":"plaque-commande-skate-cosmopolitan-warm-sunset-brosse-grohe-38732dl0",
    "name":"PLAQUE CARRE WARM SUNSET BROSSE 38732DL0 GROHE",
    "display_name":"Plaque de commande Skate Cosmopolitan Warm Sunset brossé Grohe",
    "brand_slug":"grohe",
    "product_type_slug":"plaque-commande-wc",
    "kind":"VARIANT",
    "family_slug":"plaque-commande-skate-cosmopolitan-38732-grohe",
    "family_name":"Plaque de commande Grohe Skate Cosmopolitan 38732",
    "family_subtitle":"Plaque de commande WC",
    "family_description":"Famille de plaques de commande Grohe Skate Cosmopolitan 38732 pour WC encastrés, avec double touche interrompable et finitions coordonnées.",
    "family_description_seo":"Plaques de commande Grohe Skate Cosmopolitan 38732 pour réservoirs encastrés compatibles, disponibles en chrome et finitions brossées.",
    "family_main_media_id":1901,
    "family_default_sku":"00220187",
    "family_sort_order":30,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":605.883,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Skate Warm Sunset brossé Grohe",
    "description_seo":"Plaque de commande Grohe Skate Cosmopolitan 38732DL0 Warm Sunset brossé, double touche pour mécanisme AV1.",
    "tags":"plaque-commande wc chasse grohe skate-cosmopolitan 38732dl0 warm-sunset brosse bronze double-touche rapid-sl av1 abs",
    "intro":"Cette plaque de commande Grohe Skate Cosmopolitan met en valeur une finition Warm Sunset brossé, chaleureuse et très décorative.",
    "details":"Elle reprend le format 156x197 mm en ABS avec double touche interrompable. Le montage horizontal ou vertical permet de l'adapter aux réservoirs Rapid SL compatibles avec mécanisme pneumatique AV1.",
    "attributes":[
      {"key":"finish","value":"Warm Sunset brossé","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Rapid SL avec réservoir de chasse GD 2; mécanisme pneumatique AV1","sort_order":30},
      {"key":"manufacturer_ref","value":"38732DL0","sort_order":40},
      {"key":"product_line","value":"Skate Cosmopolitan","sort_order":50},
      {"key":"dimensions_text","value":"156x197 mm","sort_order":60},
      {"key":"material","value":"ABS","sort_order":70},
      {"key":"mounting_type","value":"Horizontal ou vertical","sort_order":80},
      {"key":"activation_type","value":"Double touche interrompable","sort_order":90},
      {"key":"compatibility_notes","value":"Pour Rapid SLX, prévoir la trappe de visite 66 791 000 vendue séparément.","sort_order":100}
    ],
    "media":[
      {"media_id":1898,"role":"GALLERY","name":"Plaque Skate Cosmopolitan Warm Sunset brossé Grohe 1","alt_text":"Plaque de commande Grohe Skate Cosmopolitan Warm Sunset brossé","sort_order":0},
      {"media_id":1899,"role":"GALLERY","name":"Plaque Skate Cosmopolitan Warm Sunset brossé Grohe 2","alt_text":"Plaque Grohe Warm Sunset brossé vue de détail","sort_order":10},
      {"media_id":1900,"role":"GALLERY","name":"Plaque Skate Cosmopolitan Warm Sunset brossé Grohe 3","alt_text":"Plaque WC Grohe Skate Cosmopolitan Warm Sunset brossé","sort_order":20},
      {"media_id":1938,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique plaque Grohe Skate Cosmopolitan 38732","sort_order":100},
      {"media_id":1937,"role":"TECHNICAL","name":"Conseils d'entretien","alt_text":"Conseils d'entretien plaque Grohe Skate Cosmopolitan 38732","sort_order":110},
      {"media_id":1939,"role":"TECHNICAL","name":"Notice d'installation [1]","alt_text":"Notice d'installation plaque Grohe Skate Cosmopolitan première partie","sort_order":120},
      {"media_id":1940,"role":"TECHNICAL","name":"Notice d'installation [2]","alt_text":"Notice d'installation plaque Grohe Skate Cosmopolitan deuxième partie","sort_order":130},
      {"media_id":1953,"role":"CERTIFICATE","name":"Déclaration environnementale","alt_text":"Déclaration environnementale FDES plaque de commande Grohe","sort_order":200}
    ],
    "certificate_slugs":["fdes"]
  },
  {
    "sku":"00232852",
    "slug":"plaque-commande-opal-jaquar-jcp-gbp-152415pd",
    "name":"PLAQUE DE CONTROLE JCP-GBP-152415PD OPAL JAQUAR",
    "display_name":"Plaque de commande Opal Jaquar",
    "brand_slug":"jaquar",
    "product_type_slug":"plaque-commande-wc",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_default_sku":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":673.800,
    "stock_available":2.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque de commande Opal Jaquar",
    "description_seo":"Plaque de contrôle Jaquar Opal pour WC encastré, avec guide d'installation et design contemporain.",
    "tags":"plaque-commande wc chasse jaquar opal jcp-gbp-152415pd plaque-controle salle-de-bain bati-support encastre",
    "intro":"Cette plaque de contrôle Jaquar Opal permet de finaliser un système de chasse encastré avec une façade soignée et contemporaine.",
    "details":"Le guide d'installation fourni accompagne la pose de la plaque et les étapes de fixation. Son design discret convient aux salles de bain modernes recherchant une finition propre autour du WC.",
    "attributes":[
      {"key":"finish","value":"Chrome","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Système de chasse encastré Jaquar compatible","sort_order":30},
      {"key":"manufacturer_ref","value":"JCP-GBP-152415PD","sort_order":40},
      {"key":"product_line","value":"Opal","sort_order":50},
      {"key":"activation_type","value":"Double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Se référer au guide d'installation Jaquar pour la compatibilité du mécanisme.","sort_order":100}
    ],
    "media":[
      {"media_id":1904,"role":"GALLERY","name":"Plaque de commande Opal Jaquar 1","alt_text":"Plaque de commande Jaquar Opal","sort_order":0},
      {"media_id":1905,"role":"GALLERY","name":"Plaque de commande Opal Jaquar 2","alt_text":"Plaque de contrôle Jaquar Opal vue de détail","sort_order":10},
      {"media_id":1906,"role":"GALLERY","name":"Plaque de commande Opal Jaquar 3","alt_text":"Plaque WC Jaquar Opal","sort_order":20},
      {"media_id":1941,"role":"TECHNICAL","name":"Guide d'installation","alt_text":"Guide d'installation plaque de contrôle Jaquar Opal","sort_order":100}
    ],
    "certificate_slugs":[]
  },
  {
    "sku":"00207171",
    "slug":"plaque-commande-ornamix-chrome-jaquar-102415chr",
    "name":"PLAQUE DE CONTROLE REF 102415 CHR ORNAMIX JAQUAR",
    "display_name":"Plaque de commande Ornamix chrome Jaquar",
    "brand_slug":"jaquar",
    "product_type_slug":"plaque-commande-wc",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_default_sku":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":134.063,
    "stock_available":5.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Ornamix chrome Jaquar",
    "description_seo":"Plaque de contrôle Jaquar Ornamix chrome pour WC encastré, livrée avec guide d'installation.",
    "tags":"plaque-commande wc chasse jaquar ornamix 102415chr chrome plaque-controle salle-de-bain bati-support encastre",
    "intro":"Cette plaque de contrôle Jaquar Ornamix en finition chrome apporte une finition brillante et facile à coordonner à l'espace WC.",
    "details":"Elle est accompagnée d'un guide d'installation pour faciliter la mise en place sur un mécanisme de chasse encastré compatible Jaquar.",
    "attributes":[
      {"key":"finish","value":"Chrome","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Système de chasse encastré Jaquar compatible","sort_order":30},
      {"key":"manufacturer_ref","value":"102415CHR","sort_order":40},
      {"key":"product_line","value":"Ornamix","sort_order":50},
      {"key":"activation_type","value":"Double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Se référer au guide d'installation Jaquar pour la compatibilité du mécanisme.","sort_order":100}
    ],
    "media":[
      {"media_id":1928,"role":"GALLERY","name":"Plaque de commande Ornamix chrome Jaquar 1","alt_text":"Plaque de commande Jaquar Ornamix chrome","sort_order":0},
      {"media_id":1929,"role":"GALLERY","name":"Plaque de commande Ornamix chrome Jaquar 2","alt_text":"Plaque de contrôle Jaquar Ornamix chrome vue de détail","sort_order":10},
      {"media_id":1930,"role":"GALLERY","name":"Plaque de commande Ornamix chrome Jaquar 3","alt_text":"Plaque WC Jaquar Ornamix chrome","sort_order":20},
      {"media_id":1942,"role":"TECHNICAL","name":"Guide d'installation","alt_text":"Guide d'installation plaque de contrôle Jaquar Ornamix","sort_order":100}
    ],
    "certificate_slugs":[]
  },
  {
    "sku":"00207133",
    "slug":"plaque-commande-aria-chrome-jaquar-392415chr",
    "name":"PLAQUE DE CONTROLE REF 392415CHR ARIA JAQUAR",
    "display_name":"Plaque de commande Aria chrome Jaquar",
    "brand_slug":"jaquar",
    "product_type_slug":"plaque-commande-wc",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_default_sku":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":121.875,
    "stock_available":5.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Aria chrome Jaquar",
    "description_seo":"Plaque de contrôle Jaquar Aria chrome pour chasse encastrée, au design carré et contemporain.",
    "tags":"plaque-commande wc chasse jaquar aria 392415chr chrome plaque-controle salle-de-bain bati-support encastre",
    "intro":"Cette plaque de commande Jaquar Aria en chrome complète une installation WC encastrée avec une façade carrée et brillante.",
    "details":"Elle convient aux projets qui recherchent une plaque de contrôle simple à coordonner avec une robinetterie chromée. Le guide d'installation précise les étapes de pose.",
    "attributes":[
      {"key":"finish","value":"Chrome","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Système de chasse encastré Jaquar compatible","sort_order":30},
      {"key":"manufacturer_ref","value":"392415CHR","sort_order":40},
      {"key":"product_line","value":"Aria","sort_order":50},
      {"key":"activation_type","value":"Double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Se référer au guide d'installation Jaquar pour la compatibilité du mécanisme.","sort_order":100}
    ],
    "media":[
      {"media_id":1907,"role":"GALLERY","name":"Plaque de commande Aria chrome Jaquar 1","alt_text":"Plaque de commande Jaquar Aria chrome","sort_order":0},
      {"media_id":1908,"role":"GALLERY","name":"Plaque de commande Aria chrome Jaquar 2","alt_text":"Plaque de contrôle Jaquar Aria chrome vue de détail","sort_order":10},
      {"media_id":1909,"role":"GALLERY","name":"Plaque de commande Aria chrome Jaquar 3","alt_text":"Plaque WC Jaquar Aria chrome","sort_order":20},
      {"media_id":1943,"role":"TECHNICAL","name":"Guide d'installation","alt_text":"Guide d'installation plaque de contrôle Jaquar Aria","sort_order":100}
    ],
    "certificate_slugs":[]
  },
  {
    "sku":"00210386",
    "slug":"plaque-commande-alive-chrome-jaquar-852415",
    "name":"PLAQUE DE CONTROLE REF852415 CHROME ALIVE JAQUAR",
    "display_name":"Plaque de commande Alive chrome Jaquar",
    "brand_slug":"jaquar",
    "product_type_slug":"plaque-commande-wc",
    "kind":"VARIANT",
    "family_slug":"plaque-commande-alive-jaquar-ref852415",
    "family_name":"Plaque de commande Jaquar Alive 852415",
    "family_subtitle":"Plaque de commande WC",
    "family_description":"Famille de plaques de contrôle Jaquar Alive pour chasse encastrée, disponible en chrome et noir mat.",
    "family_description_seo":"Plaques de commande Jaquar Alive 852415 pour WC encastré, en finitions chrome et noir mat.",
    "family_main_media_id":1910,
    "family_default_sku":"00210386",
    "family_sort_order":0,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":128.710,
    "stock_available":3.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Alive chrome Jaquar",
    "description_seo":"Plaque de contrôle Jaquar Alive chrome pour chasse encastrée, livrée avec guide d'installation.",
    "tags":"plaque-commande wc chasse jaquar alive 852415 chrome plaque-controle salle-de-bain bati-support encastre",
    "intro":"Cette plaque de commande Jaquar Alive en chrome offre une finition brillante pour habiller un système de chasse encastré.",
    "details":"Le guide d'installation partagé de la gamme Alive accompagne la fixation de la plaque et la mise en place du mécanisme compatible.",
    "attributes":[
      {"key":"finish","value":"Chrome","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Système de chasse encastré Jaquar compatible","sort_order":30},
      {"key":"manufacturer_ref","value":"852415","sort_order":40},
      {"key":"product_line","value":"Alive","sort_order":50},
      {"key":"activation_type","value":"Double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Se référer au guide d'installation Jaquar pour la compatibilité du mécanisme.","sort_order":100}
    ],
    "media":[
      {"media_id":1910,"role":"GALLERY","name":"Plaque de commande Alive chrome Jaquar 1","alt_text":"Plaque de commande Jaquar Alive chrome","sort_order":0},
      {"media_id":1911,"role":"GALLERY","name":"Plaque de commande Alive chrome Jaquar 2","alt_text":"Plaque de contrôle Jaquar Alive chrome vue de détail","sort_order":10},
      {"media_id":1912,"role":"GALLERY","name":"Plaque de commande Alive chrome Jaquar 3","alt_text":"Plaque WC Jaquar Alive chrome","sort_order":20},
      {"media_id":1944,"role":"TECHNICAL","name":"Guide d'installation","alt_text":"Guide d'installation plaque de contrôle Jaquar Alive","sort_order":100}
    ],
    "certificate_slugs":[]
  },
  {
    "sku":"00207140",
    "slug":"plaque-commande-alive-noir-mat-jaquar-852415blm",
    "name":"PLAQUE DE CONTROLE REF852415BLM BLACK MAT ALIVE JAQUAR",
    "display_name":"Plaque de commande Alive noir mat Jaquar",
    "brand_slug":"jaquar",
    "product_type_slug":"plaque-commande-wc",
    "kind":"VARIANT",
    "family_slug":"plaque-commande-alive-jaquar-ref852415",
    "family_name":"Plaque de commande Jaquar Alive 852415",
    "family_subtitle":"Plaque de commande WC",
    "family_description":"Famille de plaques de contrôle Jaquar Alive pour chasse encastrée, disponible en chrome et noir mat.",
    "family_description_seo":"Plaques de commande Jaquar Alive 852415 pour WC encastré, en finitions chrome et noir mat.",
    "family_main_media_id":1910,
    "family_default_sku":"00210386",
    "family_sort_order":10,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":204.000,
    "stock_available":2.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Alive noir mat Jaquar",
    "description_seo":"Plaque de contrôle Jaquar Alive noir mat pour chasse encastrée, avec façade sobre et contemporaine.",
    "tags":"plaque-commande wc chasse jaquar alive 852415blm noir-mat black-mat plaque-controle salle-de-bain encastre",
    "intro":"Cette plaque de commande Jaquar Alive en noir mat apporte une finition sobre et actuelle au WC encastré.",
    "details":"Elle partage le guide d'installation de la gamme Alive et s'intègre aux mécanismes de chasse compatibles Jaquar selon les instructions de pose.",
    "attributes":[
      {"key":"finish","value":"Noir mat","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Système de chasse encastré Jaquar compatible","sort_order":30},
      {"key":"manufacturer_ref","value":"852415BLM","sort_order":40},
      {"key":"product_line","value":"Alive","sort_order":50},
      {"key":"activation_type","value":"Double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Se référer au guide d'installation Jaquar pour la compatibilité du mécanisme.","sort_order":100}
    ],
    "media":[
      {"media_id":1913,"role":"GALLERY","name":"Plaque de commande Alive noir mat Jaquar 1","alt_text":"Plaque de commande Jaquar Alive noir mat","sort_order":0},
      {"media_id":1914,"role":"GALLERY","name":"Plaque de commande Alive noir mat Jaquar 2","alt_text":"Plaque de contrôle Jaquar Alive noir mat vue de détail","sort_order":10},
      {"media_id":1915,"role":"GALLERY","name":"Plaque de commande Alive noir mat Jaquar 3","alt_text":"Plaque WC Jaquar Alive noir mat","sort_order":20},
      {"media_id":1944,"role":"TECHNICAL","name":"Guide d'installation","alt_text":"Guide d'installation plaque de contrôle Jaquar Alive","sort_order":100}
    ],
    "certificate_slugs":[]
  },
  {
    "sku":"00225380",
    "slug":"plaque-commande-sigma01-ronde-chrome-geberit-115770215",
    "name":"PLAQUE ROND CHROME 115.770.21.5 SIGMA 01 GEBERIT",
    "display_name":"Plaque de commande Sigma01 ronde chrome Geberit",
    "brand_slug":"geberit",
    "product_type_slug":"plaque-commande-wc",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_default_sku":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":204.204,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Sigma01 ronde chrome Geberit",
    "description_seo":"Plaque de commande Geberit Sigma01 ronde chrome brillant pour réservoirs Sigma, rinçage double touche.",
    "tags":"plaque-commande wc chasse geberit sigma01 115770215 chrome rond ronde double-touche reservoir-sigma duofresh",
    "intro":"Cette plaque de commande Geberit Sigma01 ronde en chrome brillant est prévue pour les réservoirs encastrés Sigma.",
    "details":"Elle offre un rinçage double touche avec déclenchement frontal et des tiges à isolation phonique, pour une installation propre sur un système Geberit Sigma compatible.",
    "attributes":[
      {"key":"finish","value":"Chrome brillant","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Réservoirs à encastrer Geberit Sigma","sort_order":30},
      {"key":"manufacturer_ref","value":"115.770.21.5","sort_order":40},
      {"key":"product_line","value":"Sigma01","sort_order":50},
      {"key":"dimensions_text","value":"24.6x16.4x1.3 cm","sort_order":60},
      {"key":"material","value":"Matière synthétique","sort_order":70},
      {"key":"mounting_type","value":"Déclenchement frontal","sort_order":80},
      {"key":"activation_type","value":"Rinçage double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Compatible avec les réservoirs encastrés Geberit Sigma; accessoires DuoFresh selon configuration.","sort_order":100}
    ],
    "media":[
      {"media_id":1916,"role":"GALLERY","name":"Plaque Sigma01 ronde chrome Geberit 1","alt_text":"Plaque de commande Geberit Sigma01 ronde chrome","sort_order":0},
      {"media_id":1917,"role":"GALLERY","name":"Plaque Sigma01 ronde chrome Geberit 2","alt_text":"Plaque Geberit Sigma01 chrome vue de détail","sort_order":10},
      {"media_id":1918,"role":"GALLERY","name":"Plaque Sigma01 ronde chrome Geberit 3","alt_text":"Plaque de déclenchement Geberit Sigma01 chrome","sort_order":20},
      {"media_id":1919,"role":"GALLERY","name":"Plaque Sigma01 ronde chrome Geberit 4","alt_text":"Plaque WC Geberit Sigma01 ronde chrome","sort_order":30},
      {"media_id":1945,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique plaque Geberit Sigma01 ronde chrome","sort_order":100},
      {"media_id":1946,"role":"TECHNICAL","name":"Instructions de montage","alt_text":"Instructions de montage plaque Geberit Sigma01","sort_order":110},
      {"media_id":1947,"role":"TECHNICAL","name":"Instructions d'entretien","alt_text":"Instructions d'entretien plaque Geberit Sigma01","sort_order":120}
    ],
    "certificate_slugs":["epd-hub"]
  },
  {
    "sku":"00185448",
    "slug":"plaque-commande-delta25-ronde-blanche-geberit-115125115",
    "name":"PLAQUE RONDE BLANCHE REF 115-125-11 DELTA GEBERIT",
    "display_name":"Plaque de commande Delta25 ronde blanche Geberit",
    "brand_slug":"geberit",
    "product_type_slug":"plaque-commande-wc",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_default_sku":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":111.112,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Delta25 ronde blanche Geberit",
    "description_seo":"Plaque de commande Geberit Delta25 ronde blanche pour réservoirs encastrés Delta, avec rinçage double touche.",
    "tags":"plaque-commande wc chasse geberit delta25 115125115 blanc blanche rond ronde double-touche reservoir-delta",
    "intro":"Cette plaque de commande Geberit Delta25 ronde blanche apporte une finition lumineuse et discrète aux WC équipés d'un réservoir encastré Delta.",
    "details":"Elle dispose d'un déclenchement frontal et d'un rinçage double touche. Son format 24.6x16.4 cm convient aux installations Geberit Delta compatibles.",
    "attributes":[
      {"key":"finish","value":"Blanc brillant","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Réservoirs à encastrer Geberit Delta","sort_order":30},
      {"key":"manufacturer_ref","value":"115.125.11.5","sort_order":40},
      {"key":"product_line","value":"Delta25","sort_order":50},
      {"key":"dimensions_text","value":"24.6x16.4x3.1 cm","sort_order":60},
      {"key":"material","value":"Matière synthétique","sort_order":70},
      {"key":"mounting_type","value":"Déclenchement frontal","sort_order":80},
      {"key":"activation_type","value":"Rinçage double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Compatible avec les réservoirs encastrés Geberit Delta et Twinline avec accessoires adaptés.","sort_order":100}
    ],
    "media":[
      {"media_id":1920,"role":"GALLERY","name":"Plaque Delta25 ronde blanche Geberit 1","alt_text":"Plaque de commande Geberit Delta25 ronde blanche","sort_order":0},
      {"media_id":1921,"role":"GALLERY","name":"Plaque Delta25 ronde blanche Geberit 2","alt_text":"Plaque Geberit Delta25 blanche vue de détail","sort_order":10},
      {"media_id":1922,"role":"GALLERY","name":"Plaque Delta25 ronde blanche Geberit 3","alt_text":"Plaque de déclenchement Geberit Delta25 blanche","sort_order":20},
      {"media_id":1923,"role":"GALLERY","name":"Plaque Delta25 ronde blanche Geberit 4","alt_text":"Plaque WC Geberit Delta25 ronde blanche","sort_order":30},
      {"media_id":1948,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique plaque Geberit Delta25 ronde blanche","sort_order":100},
      {"media_id":1949,"role":"TECHNICAL","name":"Instructions de montage","alt_text":"Instructions de montage plaque Geberit Delta25","sort_order":110}
    ],
    "certificate_slugs":[]
  },
  {
    "sku":"00187442",
    "slug":"plaque-commande-alpha01-ronde-chrome-geberit-115035211",
    "name":"PLAQUE RONDE CHROME REF 115-35 ALPHA 01 GEBERIT",
    "display_name":"Plaque de commande Alpha01 ronde chrome Geberit",
    "brand_slug":"geberit",
    "product_type_slug":"plaque-commande-wc",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_default_sku":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":145.000,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Alpha01 ronde chrome Geberit",
    "description_seo":"Plaque de commande Geberit Alpha01 ronde chrome brillant pour réservoirs encastrés Alpha, double touche.",
    "tags":"plaque-commande wc chasse geberit alpha01 115035211 chrome rond ronde double-touche reservoir-alpha salle-de-bain",
    "intro":"Cette plaque de commande Geberit Alpha01 ronde en chrome brillant est destinée aux réservoirs encastrés Alpha.",
    "details":"Elle reprend le rinçage double touche et un déclenchement par le dessus ou frontal. Sa finition chromée s'accorde facilement avec les équipements sanitaires existants.",
    "attributes":[
      {"key":"finish","value":"Chrome brillant","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Réservoirs à encastrer Geberit Alpha","sort_order":30},
      {"key":"manufacturer_ref","value":"115.035.21.1","sort_order":40},
      {"key":"product_line","value":"Alpha01","sort_order":50},
      {"key":"dimensions_text","value":"21.3x14.2x1.6 cm","sort_order":60},
      {"key":"material","value":"Matière synthétique","sort_order":70},
      {"key":"mounting_type","value":"Déclenchement par le dessus ou frontal","sort_order":80},
      {"key":"activation_type","value":"Rinçage double touche","sort_order":90},
      {"key":"compatibility_notes","value":"Compatible avec les réservoirs encastrés Geberit Alpha selon notice.","sort_order":100}
    ],
    "media":[
      {"media_id":1924,"role":"GALLERY","name":"Plaque Alpha01 ronde chrome Geberit 1","alt_text":"Plaque de commande Geberit Alpha01 ronde chrome","sort_order":0},
      {"media_id":1925,"role":"GALLERY","name":"Plaque Alpha01 ronde chrome Geberit 2","alt_text":"Plaque Geberit Alpha01 ronde chrome vue de détail","sort_order":10},
      {"media_id":1926,"role":"GALLERY","name":"Plaque Alpha01 ronde chrome Geberit 3","alt_text":"Plaque de déclenchement Geberit Alpha01 ronde chrome","sort_order":20},
      {"media_id":1927,"role":"GALLERY","name":"Plaque Alpha01 ronde chrome Geberit 4","alt_text":"Plaque WC Geberit Alpha01 ronde chrome","sort_order":30},
      {"media_id":1950,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique plaque Geberit Alpha01 ronde chrome","sort_order":100},
      {"media_id":1951,"role":"TECHNICAL","name":"Instructions de montage","alt_text":"Instructions de montage plaque Geberit Alpha01 ronde","sort_order":110},
      {"media_id":1952,"role":"TECHNICAL","name":"Instructions d'entretien","alt_text":"Instructions d'entretien plaque Geberit Alpha01 ronde","sort_order":120}
    ],
    "certificate_slugs":[]
  }
]
$products$::jsonb) AS "seed"(
  "sku" TEXT,
  "slug" TEXT,
  "name" TEXT,
  "display_name" TEXT,
  "brand_slug" TEXT,
  "product_type_slug" TEXT,
  "kind" TEXT,
  "family_slug" TEXT,
  "family_name" TEXT,
  "family_subtitle" TEXT,
  "family_description" TEXT,
  "family_description_seo" TEXT,
  "family_main_media_id" BIGINT,
  "family_default_sku" TEXT,
  "family_sort_order" INTEGER,
  "category_slug" TEXT,
  "subcategory_slug" TEXT,
  "price_ttc" NUMERIC,
  "stock_available" NUMERIC,
  "stock_unit" TEXT,
  "title_seo" TEXT,
  "description_seo" TEXT,
  "tags" TEXT,
  "intro" TEXT,
  "details" TEXT,
  "attributes" JSONB,
  "media" JSONB,
  "certificate_slugs" JSONB
);

CREATE TEMP TABLE "_today_plaque_certificate_slugs" AS
SELECT
  "seed"."sku",
  "certificate"."slug" AS "certificate_slug"
FROM "_today_plaque_products" "seed"
CROSS JOIN LATERAL jsonb_array_elements_text("seed"."certificate_slugs") AS "certificate"("slug");

DO $$
DECLARE
  missing_reference_count INTEGER;
  missing_certificate_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_reference_count
  FROM (
    SELECT "seed"."product_type_slug" AS "reference"
    FROM "_today_plaque_products" "seed"
    LEFT JOIN "product_type_templates" "template"
      ON "template"."slug" = "seed"."product_type_slug"
    WHERE "template"."id" IS NULL

    UNION ALL

    SELECT "seed"."brand_slug" AS "reference"
    FROM "_today_plaque_products" "seed"
    LEFT JOIN "organizations" "brand"
      ON "brand"."slug" = "seed"."brand_slug"
      AND "brand"."is_product_brand" = true
    WHERE "brand"."id" IS NULL

    UNION ALL

    SELECT "seed"."category_slug" || '/' || "seed"."subcategory_slug" AS "reference"
    FROM "_today_plaque_products" "seed"
    LEFT JOIN "product_types" "category"
      ON "category"."slug" = "seed"."category_slug"
    LEFT JOIN "product_subcategories" "subcategory"
      ON "subcategory"."category_id" = "category"."id"
      AND "subcategory"."slug" = "seed"."subcategory_slug"
    WHERE "subcategory"."id" IS NULL
  ) "missing";

  IF missing_reference_count > 0 THEN
    RAISE EXCEPTION 'Today plaque WC seed aborted: % required catalog reference(s) are missing.', missing_reference_count;
  END IF;

  SELECT COUNT(*)
  INTO missing_certificate_count
  FROM "_today_plaque_certificate_slugs" "expected"
  LEFT JOIN "product_certificates" "certificate"
    ON "certificate"."slug" = "expected"."certificate_slug"
  WHERE "certificate"."id" IS NULL;

  IF missing_certificate_count > 0 THEN
    RAISE EXCEPTION 'Today plaque WC seed aborted: % product certificate row(s) are missing.', missing_certificate_count;
  END IF;
END $$;

INSERT INTO "products" (
  "brand_id",
  "product_type_id",
  "kind",
  "lifecycle",
  "slug",
  "sku",
  "name",
  "display_name",
  "rich_text_description",
  "title_seo",
  "description_seo",
  "tags",
  "visible_ecommerce",
  "visible_vitrine",
  "stock_available",
  "stock_unit",
  "stock_availability",
  "base_price_ttc_tnd",
  "current_price_ttc_tnd",
  "vat_rate",
  "created_at",
  "updated_at"
)
SELECT
  "brand"."id",
  "template"."id",
  "seed"."kind"::"ProductKind",
  'ACTIVE'::"ProductLifecycle",
  "seed"."slug",
  "seed"."sku",
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
  )::json,
  "seed"."title_seo",
  "seed"."description_seo",
  "seed"."tags",
  true,
  true,
  "seed"."stock_available",
  "seed"."stock_unit"::"StockUnit",
  CASE
    WHEN "seed"."stock_available" > 0 THEN 'IN_STOCK'::"ProductAvailability"
    ELSE 'OUT_OF_STOCK'::"ProductAvailability"
  END,
  "seed"."price_ttc",
  "seed"."price_ttc",
  19.000,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_plaque_products" "seed"
JOIN "organizations" "brand"
  ON "brand"."slug" = "seed"."brand_slug"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("sku") DO UPDATE SET
  "brand_id" = EXCLUDED."brand_id",
  "product_type_id" = EXCLUDED."product_type_id",
  "kind" = EXCLUDED."kind",
  "lifecycle" = EXCLUDED."lifecycle",
  "slug" = EXCLUDED."slug",
  "name" = EXCLUDED."name",
  "display_name" = EXCLUDED."display_name",
  "rich_text_description" = EXCLUDED."rich_text_description",
  "title_seo" = EXCLUDED."title_seo",
  "description_seo" = EXCLUDED."description_seo",
  "tags" = EXCLUDED."tags",
  "visible_ecommerce" = EXCLUDED."visible_ecommerce",
  "visible_vitrine" = EXCLUDED."visible_vitrine",
  "stock_available" = EXCLUDED."stock_available",
  "stock_unit" = EXCLUDED."stock_unit",
  "stock_availability" = EXCLUDED."stock_availability",
  "base_price_ttc_tnd" = EXCLUDED."base_price_ttc_tnd",
  "current_price_ttc_tnd" = EXCLUDED."current_price_ttc_tnd",
  "vat_rate" = EXCLUDED."vat_rate",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo",
  "main_image_media_id", "default_product_id", "created_at", "updated_at"
)
SELECT DISTINCT
  "seed"."family_slug",
  "seed"."family_name",
  "seed"."family_subtitle",
  "seed"."family_description",
  LEFT("seed"."family_description_seo", 160),
  "seed"."family_main_media_id",
  "default_product"."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_plaque_products" "seed"
LEFT JOIN "products" "default_product"
  ON "default_product"."sku" = "seed"."family_default_sku"
WHERE "seed"."family_slug" IS NOT NULL
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "main_image_media_id" = EXCLUDED."main_image_media_id",
  "default_product_id" = EXCLUDED."default_product_id",
  "updated_at" = CURRENT_TIMESTAMP;

DELETE FROM "product_family_members" "member"
USING "products" "product", "_today_plaque_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  COALESCE("seed"."family_sort_order", 0)
FROM "_today_plaque_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = "seed"."family_slug"
WHERE "seed"."family_slug" IS NOT NULL
ON CONFLICT ("product_id") DO UPDATE SET
  "family_id" = EXCLUDED."family_id",
  "sort_order" = EXCLUDED."sort_order";

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_today_plaque_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_today_plaque_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = "seed"."category_slug"
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = "seed"."subcategory_slug"
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_media" "product_media"
USING "products" "product", "_today_plaque_products" "seed"
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
  "media_seed"."media_id",
  "media_seed"."role"::"ProductMediaRole",
  "media_seed"."name",
  "media_seed"."alt_text",
  "media_seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_plaque_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
CROSS JOIN LATERAL jsonb_to_recordset("seed"."media") AS "media_seed"(
  "media_id" BIGINT,
  "role" TEXT,
  "name" TEXT,
  "alt_text" TEXT,
  "sort_order" INTEGER
)
JOIN "media" "media"
  ON "media"."id" = "media_seed"."media_id"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_today_plaque_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    'finish',
    'number_of_buttons',
    'compatible_system',
    'manufacturer_ref',
    'product_line',
    'dimensions_text',
    'material',
    'mounting_type',
    'activation_type',
    'compatibility_notes'
  );

INSERT INTO "product_attributes" (
  "product_id", "attribute_def_id", "attribute_group_id", "name", "label", "value",
  "unit", "input_type", "is_required", "is_filterable", "group_name", "group_sort_order", "sort_order"
)
SELECT
  "product"."id",
  "definition"."id",
  "attribute_group"."id",
  "definition"."key",
  "definition"."label",
  LEFT("attribute_seed"."value", 255),
  "definition"."unit",
  "definition"."input_type",
  false,
  COALESCE("type_attribute"."is_filterable", false),
  "attribute_group"."name",
  COALESCE("attribute_group"."sort_order", 0),
  COALESCE("type_attribute"."sort_order", "attribute_seed"."sort_order")
FROM "_today_plaque_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
CROSS JOIN LATERAL jsonb_to_recordset("seed"."attributes") AS "attribute_seed"(
  "key" TEXT,
  "value" TEXT,
  "sort_order" INTEGER
)
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "attribute_seed"."key"
LEFT JOIN "product_type_attributes" "type_attribute"
  ON "type_attribute"."product_type_id" = "product"."product_type_id"
  AND "type_attribute"."attribute_definition_id" = "definition"."id"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."id" = "type_attribute"."attribute_group_id";

DELETE FROM "product_certificate_associations" "association"
USING "products" "product", "_today_plaque_products" "seed"
WHERE "association"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_certificate_associations" ("product_id", "certificate_id")
SELECT
  "product"."id",
  "certificate"."id"
FROM "_today_plaque_certificate_slugs" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_certificates" "certificate"
  ON "certificate"."slug" = "seed"."certificate_slug"
ON CONFLICT ("product_id", "certificate_id") DO NOTHING;

DO $$
DECLARE
  expected_product_count INTEGER;
  seeded_product_count INTEGER;
  expected_media_link_count INTEGER;
  seeded_media_count INTEGER;
  expected_attribute_count INTEGER;
  seeded_attribute_count INTEGER;
  expected_certificate_count INTEGER;
  seeded_certificate_count INTEGER;
  expected_member_count INTEGER;
  seeded_member_count INTEGER;
  seeded_subcategory_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO expected_product_count FROM "_today_plaque_products";

  SELECT COUNT(*)
  INTO seeded_product_count
  FROM "_today_plaque_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku";

  IF seeded_product_count <> expected_product_count THEN
    RAISE EXCEPTION 'Today plaque WC validation failed: expected % products, found %.', expected_product_count, seeded_product_count;
  END IF;

  SELECT COUNT(*)
  INTO expected_media_link_count
  FROM "_today_plaque_products" "seed"
  CROSS JOIN LATERAL jsonb_to_recordset("seed"."media") AS "media_seed"(
    "media_id" BIGINT,
    "role" TEXT,
    "name" TEXT,
    "alt_text" TEXT,
    "sort_order" INTEGER
  );

  SELECT COUNT(*)
  INTO seeded_media_count
  FROM "_today_plaque_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL jsonb_to_recordset("seed"."media") AS "media_seed"(
    "media_id" BIGINT,
    "role" TEXT,
    "name" TEXT,
    "alt_text" TEXT,
    "sort_order" INTEGER
  )
  JOIN "product_media" "product_media"
    ON "product_media"."product_id" = "product"."id"
    AND "product_media"."media_id" = "media_seed"."media_id"
    AND "product_media"."role" = "media_seed"."role"::"ProductMediaRole";

  IF seeded_media_count <> expected_media_link_count THEN
    RAISE EXCEPTION 'Today plaque WC validation failed: expected % media links, found %.', expected_media_link_count, seeded_media_count;
  END IF;

  SELECT COUNT(*)
  INTO expected_attribute_count
  FROM "_today_plaque_products" "seed"
  CROSS JOIN LATERAL jsonb_to_recordset("seed"."attributes") AS "attribute_seed"(
    "key" TEXT,
    "value" TEXT,
    "sort_order" INTEGER
  );

  SELECT COUNT(*)
  INTO seeded_attribute_count
  FROM "_today_plaque_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL jsonb_to_recordset("seed"."attributes") AS "attribute_seed"(
    "key" TEXT,
    "value" TEXT,
    "sort_order" INTEGER
  )
  JOIN "product_attributes" "attribute"
    ON "attribute"."product_id" = "product"."id"
    AND "attribute"."name" = "attribute_seed"."key";

  IF seeded_attribute_count <> expected_attribute_count THEN
    RAISE EXCEPTION 'Today plaque WC validation failed: expected % product attributes, found %.', expected_attribute_count, seeded_attribute_count;
  END IF;

  SELECT COUNT(*) INTO expected_certificate_count FROM "_today_plaque_certificate_slugs";

  SELECT COUNT(*)
  INTO seeded_certificate_count
  FROM "_today_plaque_certificate_slugs" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_certificates" "certificate"
    ON "certificate"."slug" = "seed"."certificate_slug"
  JOIN "product_certificate_associations" "association"
    ON "association"."product_id" = "product"."id"
    AND "association"."certificate_id" = "certificate"."id";

  IF seeded_certificate_count <> expected_certificate_count THEN
    RAISE EXCEPTION 'Today plaque WC validation failed: expected % certificate associations, found %.', expected_certificate_count, seeded_certificate_count;
  END IF;

  SELECT COUNT(*)
  INTO expected_member_count
  FROM "_today_plaque_products"
  WHERE "family_slug" IS NOT NULL;

  SELECT COUNT(*)
  INTO seeded_member_count
  FROM "_today_plaque_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_family_members" "member"
    ON "member"."product_id" = "product"."id"
  WHERE "seed"."family_slug" IS NOT NULL;

  IF seeded_member_count <> expected_member_count THEN
    RAISE EXCEPTION 'Today plaque WC validation failed: expected % family members, found %.', expected_member_count, seeded_member_count;
  END IF;

  SELECT COUNT(*)
  INTO seeded_subcategory_count
  FROM "_today_plaque_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_subcategory_links" "link"
    ON "link"."product_id" = "product"."id";

  IF seeded_subcategory_count <> expected_product_count THEN
    RAISE EXCEPTION 'Today plaque WC validation failed: expected % subcategory links, found %.', expected_product_count, seeded_subcategory_count;
  END IF;
END $$;

DROP TABLE "_today_plaque_certificate_slugs";
DROP TABLE "_today_plaque_products";
DROP TABLE "_today_plaque_type_attributes";
DROP TABLE "_today_plaque_attribute_definitions";
DROP TABLE "_today_plaque_attribute_groups";
DROP TABLE "_today_plaque_expected_media";
