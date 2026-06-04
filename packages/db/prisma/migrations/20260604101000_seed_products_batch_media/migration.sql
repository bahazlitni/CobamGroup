-- Seed the mixed construction / bathroom products batch and attach uploaded media.
-- The migration uses existing brands only and upserts products by SKU.

CREATE TEMP TABLE "_batch_product_expected_brand" (
  "brand_id" BIGINT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL
);

INSERT INTO "_batch_product_expected_brand" ("brand_id", "slug", "name")
VALUES
  (2, 'sopal', 'Sopal'),
  (8, 'deutsch-color', 'Deutsch Color'),
  (10, 'sika', 'Sika'),
  (20, 'jaquar', 'Jaquar'),
  (22, 'ciment-de-gabes', 'Ciment de Gabès'),
  (43, 'sanimed', 'Sanimed'),
  (282, 'ideal-san', 'Ideal San');

CREATE TEMP TABLE "_batch_product_expected_type" (
  "product_type_id" BIGINT PRIMARY KEY,
  "slug" TEXT NOT NULL
);

INSERT INTO "_batch_product_expected_type" ("product_type_id", "slug")
VALUES
  (1, 'produit-pose-carrelage'),
  (7, 'abattant-wc'),
  (23, 'douchette-tete-bras-flexible'),
  (32, 'materiau-batiment-jardin'),
  (37, 'brique');

CREATE TEMP TABLE "_batch_product_expected_subcategory" (
  "category_slug" TEXT NOT NULL,
  "subcategory_slug" TEXT NOT NULL,
  PRIMARY KEY ("category_slug", "subcategory_slug")
);

INSERT INTO "_batch_product_expected_subcategory" ("category_slug", "subcategory_slug")
VALUES
  ('salle-de-bain-et-cuisine', 'abattants-wc'),
  ('salle-de-bain-et-cuisine', 'espace-douche'),
  ('revetements-de-sols-et-murs', 'produits-de-pose-finition'),
  ('materiaux-de-construction', 'briques'),
  ('materiaux-de-construction', 'ciments-et-produits-en-beton'),
  ('materiaux-de-construction', 'adjuvants'),
  ('isolation-et-etancheite', 'etancheite');

CREATE TEMP TABLE "_batch_product_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_batch_product_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (946, 'BRIQUE DE 12 BCM DEPOT.webp', 'IMAGE'::"MediaKind"),
  (947, 'BRIQUE DE 08 ESSAHEL DEPOT.webp', 'IMAGE'::"MediaKind"),
  (948, 'BRIQUE DE 06 (680-PL).webp', 'IMAGE'::"MediaKind"),
  (949, 'BRIQUE PLATERIERE ESSAHEL.webp', 'IMAGE'::"MediaKind"),
  (950, 'BRIQUE DE H16 BCM-SBM DEPOT.webp', 'IMAGE'::"MediaKind"),
  (951, 'BRAS DE DOUCHE MURAL CARRE ALI-SHA-CHR-455L400 JAQUAR.webp', 'IMAGE'::"MediaKind"),
  (952, 'BRAS DE DOUCHE CARRE MURAL G1-2 L360 90° SOPAL.webp', 'IMAGE'::"MediaKind"),
  (953, 'ABAT AZUR-LAVANTA CS SANIMED.webp', 'IMAGE'::"MediaKind"),
  (954, 'ABAT.THERMODUR AVEC AMORT EMERAUDE IDEAL SAN.webp', 'IMAGE'::"MediaKind"),
  (955, 'CIMENT GABES CPA PAR SAC.webp', 'IMAGE'::"MediaKind"),
  (956, 'CIMENT GABES H.R.S PAR SAC.webp', 'IMAGE'::"MediaKind"),
  (957, 'CIMENT GABES NORMAL 32.5 PAR SAC.webp', 'IMAGE'::"MediaKind"),
  (958, 'ADMIX CIMENT 1KG PAR SACHET DEUTSCH.webp', 'IMAGE'::"MediaKind"),
  (959, 'CIMENT COLLE FM1000 BLANC DEUTSCH COLOR.webp', 'IMAGE'::"MediaKind"),
  (960, 'CIMENT COLLE FM2000 BLANC DEUTSCH COLOR.webp', 'IMAGE'::"MediaKind"),
  (961, 'CIMENT COLLE FM3000 (PISCINE) DEUTSCH COLOR.webp', 'IMAGE'::"MediaKind"),
  (962, 'CIMENT COLLE FM-ECO BLANC DEUTSCH COLOR.webp', 'IMAGE'::"MediaKind"),
  (963, 'CIMENT COLLE SIKA CERAM 103 BLANC SAC 25KG.webp', 'IMAGE'::"MediaKind"),
  (965, 'CIMENT COLLE SIKA CERAM 206 BLANC SAC 25KG.webp', 'IMAGE'::"MediaKind"),
  (966, 'CIMENT COLLE SIKA CERAM 106 BLANC SAC 25KG.webp', 'IMAGE'::"MediaKind"),
  (967, 'SIKA ANCHORFIX -1 150 ML (CARTOUCHE) [1].webp', 'IMAGE'::"MediaKind"),
  (968, 'SIKA ANCHORFIX -1 150 ML (CARTOUCHE) [2].webp', 'IMAGE'::"MediaKind"),
  (969, 'SIKA ANCHORFIX -1 150 ML (CARTOUCHE) [3].webp', 'IMAGE'::"MediaKind"),
  (970, 'SIKA ANCHORFIX -1 150 ML (CARTOUCHE) [4].webp', 'IMAGE'::"MediaKind"),
  (971, 'SIKA BITUSEAL T-140 PG (ROULEAU D''ETANCHITE) [1].webp', 'IMAGE'::"MediaKind"),
  (972, 'SIKA BITUSEAL T-140 PG (ROULEAU D''ETANCHITE) [2].webp', 'IMAGE'::"MediaKind"),
  (973, 'SIKA BITUSEAL T-140 PG (ROULEAU D''ETANCHITE) [3.webp', 'IMAGE'::"MediaKind"),
  (974, 'SIKA BITUSEAL T-140 PG (ROULEAU D''ETANCHITE) [4].webp', 'IMAGE'::"MediaKind"),
  (975, 'SIKA CHAPDUR PREMIX GRIS 25 KG.webp', 'IMAGE'::"MediaKind"),
  (976, 'SIKALATEX BIDON 1L [1].webp', 'IMAGE'::"MediaKind"),
  (977, 'SIKALATEX BIDON 1L [2].webp', 'IMAGE'::"MediaKind"),
  (978, 'SIKALATEX BIDON 1L [3].webp', 'IMAGE'::"MediaKind"),
  (979, 'SIKALATEX BIDON 1L [4].webp', 'IMAGE'::"MediaKind"),
  (980, 'SIKALATEX BIDON 5L [1].webp', 'IMAGE'::"MediaKind"),
  (981, 'SIKALATEX BIDON 5L [2].webp', 'IMAGE'::"MediaKind"),
  (982, 'SIKALATEX BIDON 5L [3].webp', 'IMAGE'::"MediaKind"),
  (983, 'SIKALATEX BIDON 5L [4].webp', 'IMAGE'::"MediaKind"),
  (984, 'SIKALATEX BIDON 20L [1].webp', 'IMAGE'::"MediaKind"),
  (985, 'SIKALATEX BIDON 20L [2].webp', 'IMAGE'::"MediaKind"),
  (986, 'SIKALATEX BIDON 20L [3].webp', 'IMAGE'::"MediaKind"),
  (987, 'SIKALATEX BIDON 20L [4].webp', 'IMAGE'::"MediaKind"),
  (988, 'SIKALITE 1KG PAR SACHET [1].webp', 'IMAGE'::"MediaKind"),
  (989, 'SIKALITE 1KG PAR SACHET [2].webp', 'IMAGE'::"MediaKind"),
  (990, 'SIKALITE 1KG PAR SACHET (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (991, 'SikaLatex (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (992, 'SIKA CHAPDUR PREMIX GRIS 25 KG (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (993, 'SIKA BITUSEAL T-140 PG (ROULEAU D''ETANCHITE) (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (994, 'SIKA ANCHORFIX -1 150 ML (CARTOUCHE) (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (995, 'CIMENT COLLE FM1000 BLANC DEUTSCH COLOR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (996, 'CIMENT COLLE FM2000 BLANC DEUTSCH COLOR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (997, 'CIMENT COLLE FM3000 (PISCINE) DEUTSCH COLOR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (998, 'CIMENT COLLE FM-ECO BLANC DEUTSCH COLOR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (999, 'CIMENT COLLE SIKA CERAM 103 BLANC SAC 25KG (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1000, 'CIMENT COLLE SIKA CERAM 106 BLANC SAC 25KG (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1001, 'CIMENT COLLE SIKA CERAM 206 BLANC SAC 25KG (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1002, 'CIMENT GABES CPA PAR SAC (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1009, 'CIMENT GABES H.R.S PAR SAC (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1010, 'CIMENT GABES NORMAL 32.5 PAR SAC (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind");

DO $$
DECLARE
  missing_brand_count INTEGER;
  missing_type_count INTEGER;
  missing_subcategory_count INTEGER;
  missing_media_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_brand_count
  FROM "_batch_product_expected_brand" "expected"
  LEFT JOIN "organizations" "brand"
    ON "brand"."id" = "expected"."brand_id"
    AND "brand"."slug" = "expected"."slug"
    AND "brand"."is_product_brand" = true
  WHERE "brand"."id" IS NULL;

  IF missing_brand_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed batch products: % expected brand row(s) are missing or mismatched.', missing_brand_count;
  END IF;

  SELECT COUNT(*)
  INTO missing_type_count
  FROM "_batch_product_expected_type" "expected"
  LEFT JOIN "product_type_templates" "template"
    ON "template"."id" = "expected"."product_type_id"
    AND "template"."slug" = "expected"."slug"
  WHERE "template"."id" IS NULL;

  IF missing_type_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed batch products: % expected product type row(s) are missing or mismatched.', missing_type_count;
  END IF;

  SELECT COUNT(*)
  INTO missing_subcategory_count
  FROM "_batch_product_expected_subcategory" "expected"
  LEFT JOIN "product_types" "category"
    ON "category"."slug" = "expected"."category_slug"
  LEFT JOIN "product_subcategories" "subcategory"
    ON "subcategory"."category_id" = "category"."id"
    AND "subcategory"."slug" = "expected"."subcategory_slug"
  WHERE "subcategory"."id" IS NULL;

  IF missing_subcategory_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed batch products: % expected subcategory row(s) are missing or mismatched.', missing_subcategory_count;
  END IF;

  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_batch_product_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed batch products media: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;
END $$;

CREATE TEMP TABLE "_batch_product_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_batch_product_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "is_filterable", "sort_order"
)
VALUES
  ('product_line', 'Gamme', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 0),
  ('model_reference', 'Référence modèle', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 5),
  ('seat_type', 'Type d''abattant', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Standard', 'Soft-close']::TEXT[], true, 10),
  ('soft_close', 'Fermeture amortie', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 15),
  ('color', 'Couleur', NULL, 'COLOR'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 20),
  ('material', 'Matière', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 25),
  ('dimensions_text', 'Dimensions', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 30),
  ('connection_size', 'Raccordement', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 35),
  ('finish', 'Finition', NULL, 'FINISH'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 40),
  ('packaging_weight_kg', 'Conditionnement', 'kg', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 45),
  ('packaging_volume_l', 'Conditionnement', 'L', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 50),
  ('application_area', 'Usage', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 55),
  ('brick_type', 'Type de brique', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Brique plâtrière', 'Brique série A', 'Brique hourdis']::TEXT[], true, 60),
  ('format_text', 'Format', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 65),
  ('pallet_quantity', 'Pièces par palette', 'pièces', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 70),
  ('origin_note', 'Origine / dépôt', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 75);

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
FROM "_batch_product_attribute_definitions"
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

CREATE TEMP TABLE "_batch_products" (
  "sku" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "kind" "ProductKind" NOT NULL,
  "brand_id" BIGINT,
  "product_type_id" BIGINT NOT NULL,
  "category_slug" TEXT NOT NULL,
  "subcategory_slug" TEXT NOT NULL,
  "family_slug" TEXT,
  "family_name" TEXT,
  "family_subtitle" TEXT,
  "family_description" TEXT,
  "family_description_seo" TEXT,
  "family_main_image_media_id" BIGINT,
  "sort_order" INTEGER NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "stock_unit" "StockUnit" NOT NULL,
  "tags" TEXT NOT NULL,
  "short_description" TEXT NOT NULL
);

INSERT INTO "_batch_products" (
  "sku", "slug", "name", "display_name", "kind", "brand_id", "product_type_id",
  "category_slug", "subcategory_slug", "family_slug", "family_name", "family_subtitle",
  "family_description", "family_description_seo", "family_main_image_media_id",
  "sort_order", "price_ttc", "stock_available", "stock_unit", "tags", "short_description"
)
VALUES
  (
    '00202992',
    'abat-azur-lavanta-cs-sanimed',
    'ABAT AZUR/LAVANTA CS SANIMED',
    'Abattant AZUR/LAVANTA CS Sanimed',
    'SINGLE'::"ProductKind",
    43,
    7,
    'salle-de-bain-et-cuisine',
    'abattants-wc',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    42.000,
    29.000,
    'PIECE'::"StockUnit",
    'abattant wc sanimed azur lavanta salle de bain',
    'Abattant WC Sanimed en teinte azur/lavanta pour équiper une salle de bain avec une finition colorée.'
  ),
  (
    '00219952',
    'abat-thermodur-avec-amort-emeraude-ideal-san',
    'ABAT.THERMODUR AVEC AMORT EMERAUDE IDEAL SAN',
    'Abattant thermodur avec amort Emeraude Ideal San',
    'SINGLE'::"ProductKind",
    282,
    7,
    'salle-de-bain-et-cuisine',
    'abattants-wc',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    128.000,
    10.000,
    'PIECE'::"StockUnit",
    'abattant wc ideal san thermodur emeraude amorti salle de bain',
    'Abattant WC Ideal San en thermodur avec fermeture amortie et finition Emeraude.'
  ),
  (
    '00223607',
    'admix-ciment-1kg-par-sachet-deutsch',
    'ADMIX CIMENT 1KG PAR SACHET DEUTSCH',
    'Admix ciment 1KG par sachet Deutsch Color',
    'SINGLE'::"ProductKind",
    8,
    1,
    'revetements-de-sols-et-murs',
    'produits-de-pose-finition',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    7.000,
    7.000,
    'PIECE'::"StockUnit",
    'admix ciment deutsch color adjuvant pose carrelage',
    'Admix ciment Deutsch Color en sachet de 1 kg pour préparation et amélioration des mortiers.'
  ),
  (
    '00219631',
    'admix-s2-bidon-1kg',
    'ADMIX S2 BIDON 1KG',
    'Admix S2 bidon 1KG',
    'SINGLE'::"ProductKind",
    NULL,
    1,
    'revetements-de-sols-et-murs',
    'produits-de-pose-finition',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    12.500,
    5.000,
    'PIECE'::"StockUnit",
    'admix s2 bidon adjuvant ciment pose carrelage',
    'Admix S2 en bidon de 1 kg pour les préparations de pose et les mélanges cimentaires.'
  ),
  (
    '00178822',
    'bras-de-douche-carre-mural-g12-l360-90-sopal',
    'BRAS DE DOUCHE CARRE MURAL G1/2 L360 90° SOPAL',
    'Bras de douche carré mural G1/2 L360 90° Sopal',
    'SINGLE'::"ProductKind",
    2,
    23,
    'salle-de-bain-et-cuisine',
    'espace-douche',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    360.900,
    4.000,
    'PIECE'::"StockUnit",
    'bras douche mural carre sopal g1/2 l360 chrome salle de bain',
    'Bras de douche mural carré Sopal avec raccord G1/2, longueur 360 mm et angle 90°.'
  ),
  (
    '00206792',
    'bras-de-douche-mural-carre-ali-sha-chr-455l400-jaquar',
    'BRAS DE DOUCHE MURAL CARRE ALI-SHA-CHR-455L400 JAQUAR',
    'Bras de douche mural carré ALI-SHA-CHR-455L400 Jaquar',
    'SINGLE'::"ProductKind",
    20,
    23,
    'salle-de-bain-et-cuisine',
    'espace-douche',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    156.610,
    3.000,
    'PIECE'::"StockUnit",
    'bras douche mural carre jaquar ali sha chr 455l400 chrome',
    'Bras de douche mural carré Jaquar référence ALI-SHA-CHR-455L400 pour installation murale.'
  ),
  (
    'PLATR',
    'brique-platriere-essahel',
    'BRIQUE  PLATERIERE ESSAHEL',
    'Brique plâtrière Essahel',
    'SINGLE'::"ProductKind",
    NULL,
    37,
    'materiaux-de-construction',
    'briques',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    0.815,
    4404.000,
    'PIECE'::"StockUnit",
    'brique platriere essahel materiaux construction depot',
    'Brique plâtrière Essahel pour les travaux de maçonnerie intérieure et les cloisons.'
  ),
  (
    'H16',
    'brique-hourdis-h16-bcm-sbm-depot',
    'BRIQUE DE H16 BCM/SBM DEPOT',
    'Brique hourdis H16 BCM/SBM dépôt',
    'SINGLE'::"ProductKind",
    NULL,
    37,
    'materiaux-de-construction',
    'briques',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    1.450,
    772.000,
    'PIECE'::"StockUnit",
    'brique hourdis h16 bcm sbm materiaux construction depot',
    'Brique hourdis H16 BCM/SBM pour les travaux de plancher et de maçonnerie.'
  ),
  (
    'B06',
    'brique-serie-a-06-680-pl',
    'BRIQUE DE 06  (680/PL)',
    'Brique série A 06',
    'VARIANT'::"ProductKind",
    NULL,
    37,
    'materiaux-de-construction',
    'briques',
    'brique-serie-a',
    'Brique Série A',
    'Briques de construction',
    'Famille de briques série A pour cloisons et travaux de maçonnerie courants.',
    'Brique Série A : variantes 06, 08 et 12 disponibles chez COBAM GROUP.',
    948,
    0,
    0.380,
    774.000,
    'PIECE'::"StockUnit",
    'brique serie a 06 cloison construction materiaux',
    'Brique série A format 06, conditionnée à 680 pièces par palette.'
  ),
  (
    'B08',
    'brique-serie-a-08-essahel-depot',
    'BRIQUE DE 08  ESSAHEL DEPOT',
    'Brique série A 08 Essahel dépôt',
    'VARIANT'::"ProductKind",
    NULL,
    37,
    'materiaux-de-construction',
    'briques',
    'brique-serie-a',
    'Brique Série A',
    'Briques de construction',
    'Famille de briques série A pour cloisons et travaux de maçonnerie courants.',
    'Brique Série A : variantes 06, 08 et 12 disponibles chez COBAM GROUP.',
    948,
    1,
    0.820,
    28.000,
    'PIECE'::"StockUnit",
    'brique serie a 08 essahel construction depot',
    'Brique série A format 08 Essahel pour cloisons et travaux de maçonnerie.'
  ),
  (
    '00178273',
    'brique-serie-a-12-bcm-depot',
    'BRIQUE DE 12 BCM DEPOT',
    'Brique série A 12 BCM dépôt',
    'VARIANT'::"ProductKind",
    NULL,
    37,
    'materiaux-de-construction',
    'briques',
    'brique-serie-a',
    'Brique Série A',
    'Briques de construction',
    'Famille de briques série A pour cloisons et travaux de maçonnerie courants.',
    'Brique Série A : variantes 06, 08 et 12 disponibles chez COBAM GROUP.',
    948,
    2,
    0.980,
    4431.000,
    'PIECE'::"StockUnit",
    'brique serie a 12 bcm construction depot',
    'Brique série A format 12 BCM pour maçonnerie et cloisons.'
  ),
  (
    '00201599',
    'ciment-colle-fm-eco-blanc-deutsch-color',
    'CIMENT COLLE FM-ECO BLANC DEUTSCH COLOR',
    'Ciment colle FM-ECO blanc Deutsch Color',
    'VARIANT'::"ProductKind",
    8,
    1,
    'revetements-de-sols-et-murs',
    'produits-de-pose-finition',
    'ciment-colle-deutsch-color',
    'Ciment Colle Deutsch Color',
    'Colles à carrelage',
    'Famille de ciments-colles Deutsch Color pour la pose de carrelage, organisée par niveau de performance.',
    'Ciments-colles Deutsch Color : FM-ECO, FM1000, FM2000 et FM3000 disponibles chez COBAM GROUP.',
    962,
    0,
    12.630,
    151.000,
    'PIECE'::"StockUnit",
    'ciment colle deutsch color fm eco blanc sac 25kg carrelage',
    'Ciment colle FM-ECO blanc Deutsch Color pour travaux courants de pose de carrelage.'
  ),
  (
    '00201582',
    'ciment-colle-fm1000-blanc-deutsch-color',
    'CIMENT COLLE FM1000 BLANC DEUTSCH COLOR',
    'Ciment colle FM1000 blanc Deutsch Color',
    'VARIANT'::"ProductKind",
    8,
    1,
    'revetements-de-sols-et-murs',
    'produits-de-pose-finition',
    'ciment-colle-deutsch-color',
    'Ciment Colle Deutsch Color',
    'Colles à carrelage',
    'Famille de ciments-colles Deutsch Color pour la pose de carrelage, organisée par niveau de performance.',
    'Ciments-colles Deutsch Color : FM-ECO, FM1000, FM2000 et FM3000 disponibles chez COBAM GROUP.',
    962,
    1,
    16.842,
    84.000,
    'PIECE'::"StockUnit",
    'ciment colle deutsch color fm1000 blanc sac 25kg carrelage',
    'Ciment colle FM1000 blanc Deutsch Color pour la pose de carrelage.'
  ),
  (
    '00201575',
    'ciment-colle-fm2000-blanc-deutsch-color',
    'CIMENT COLLE FM2000 BLANC DEUTSCH COLOR',
    'Ciment colle FM2000 blanc Deutsch Color',
    'VARIANT'::"ProductKind",
    8,
    1,
    'revetements-de-sols-et-murs',
    'produits-de-pose-finition',
    'ciment-colle-deutsch-color',
    'Ciment Colle Deutsch Color',
    'Colles à carrelage',
    'Famille de ciments-colles Deutsch Color pour la pose de carrelage, organisée par niveau de performance.',
    'Ciments-colles Deutsch Color : FM-ECO, FM1000, FM2000 et FM3000 disponibles chez COBAM GROUP.',
    962,
    2,
    25.263,
    186.000,
    'PIECE'::"StockUnit",
    'ciment colle deutsch color fm2000 blanc sac 25kg carrelage',
    'Ciment colle FM2000 blanc Deutsch Color pour la pose de carrelage.'
  ),
  (
    '00201568',
    'ciment-colle-fm3000-piscine-deutsch-color',
    'CIMENT COLLE FM3000 (PISCINE) DEUTSCH COLOR',
    'Ciment colle FM3000 piscine Deutsch Color',
    'VARIANT'::"ProductKind",
    8,
    1,
    'revetements-de-sols-et-murs',
    'produits-de-pose-finition',
    'ciment-colle-deutsch-color',
    'Ciment Colle Deutsch Color',
    'Colles à carrelage',
    'Famille de ciments-colles Deutsch Color pour la pose de carrelage, organisée par niveau de performance.',
    'Ciments-colles Deutsch Color : FM-ECO, FM1000, FM2000 et FM3000 disponibles chez COBAM GROUP.',
    962,
    3,
    40.000,
    144.000,
    'PIECE'::"StockUnit",
    'ciment colle deutsch color fm3000 piscine sac 25kg carrelage',
    'Ciment colle FM3000 Deutsch Color pour les applications piscine.'
  ),
  (
    '00227896',
    'ciment-colle-sika-ceram-103-blanc-sac-25kg',
    'CIMENT COLLE SIKA CERAM 103 BLANC SAC 25KG',
    'Ciment colle Sika Ceram 103 blanc sac 25KG',
    'VARIANT'::"ProductKind",
    10,
    1,
    'revetements-de-sols-et-murs',
    'produits-de-pose-finition',
    'ciment-colle-sika-ceram',
    'Sika Ceram',
    'Ciments-colles Sika',
    'Famille de ciments-colles Sika Ceram pour la pose de carrelage, organisée par performance.',
    'Sika Ceram : ciments-colles 103, 106 et 206 blanc sac 25KG disponibles chez COBAM GROUP.',
    963,
    0,
    15.265,
    54.000,
    'PIECE'::"StockUnit",
    'sika ceram 103 ciment colle blanc sac 25kg carrelage',
    'Ciment colle Sika Ceram 103 blanc en sac de 25 kg pour travaux de pose.'
  ),
  (
    '00227902',
    'ciment-colle-sika-ceram-106-blanc-sac-25kg',
    'CIMENT COLLE SIKA CERAM 106 BLANC SAC 25KG',
    'Ciment colle Sika Ceram 106 blanc sac 25KG',
    'VARIANT'::"ProductKind",
    10,
    1,
    'revetements-de-sols-et-murs',
    'produits-de-pose-finition',
    'ciment-colle-sika-ceram',
    'Sika Ceram',
    'Ciments-colles Sika',
    'Famille de ciments-colles Sika Ceram pour la pose de carrelage, organisée par performance.',
    'Sika Ceram : ciments-colles 103, 106 et 206 blanc sac 25KG disponibles chez COBAM GROUP.',
    963,
    1,
    26.316,
    150.000,
    'PIECE'::"StockUnit",
    'sika ceram 106 ciment colle blanc sac 25kg carrelage',
    'Ciment colle Sika Ceram 106 blanc en sac de 25 kg pour travaux de pose.'
  ),
  (
    '00227926',
    'ciment-colle-sika-ceram-206-blanc-sac-25kg',
    'CIMENT COLLE SIKA CERAM 206 BLANC SAC 25KG',
    'Ciment colle Sika Ceram 206 blanc sac 25KG',
    'VARIANT'::"ProductKind",
    10,
    1,
    'revetements-de-sols-et-murs',
    'produits-de-pose-finition',
    'ciment-colle-sika-ceram',
    'Sika Ceram',
    'Ciments-colles Sika',
    'Famille de ciments-colles Sika Ceram pour la pose de carrelage, organisée par performance.',
    'Sika Ceram : ciments-colles 103, 106 et 206 blanc sac 25KG disponibles chez COBAM GROUP.',
    963,
    2,
    43.684,
    176.000,
    'PIECE'::"StockUnit",
    'sika ceram 206 ciment colle blanc sac 25kg carrelage',
    'Ciment colle Sika Ceram 206 blanc en sac de 25 kg pour travaux de pose.'
  ),
  (
    'CPAGABES',
    'ciment-gabes-cpa-par-sac',
    'CIMENT GABES CPA PAR SAC',
    'Ciment Gabès CPA par sac',
    'VARIANT'::"ProductKind",
    22,
    32,
    'materiaux-de-construction',
    'ciments-et-produits-en-beton',
    'ciment-gabes',
    'Ciment Gabès',
    'Ciments en sac',
    'Famille de ciments Gabès en sac pour les travaux de construction courants.',
    'Ciment Gabès : CPA, H.R.S et Normal 32.5 disponibles par sac chez COBAM GROUP.',
    955,
    0,
    20.000,
    599.000,
    'PIECE'::"StockUnit",
    'ciment gabes cpa sac construction beton',
    'Ciment Gabès CPA en sac pour travaux de construction et béton.'
  ),
  (
    'HRSGABES',
    'ciment-gabes-hrs-par-sac',
    'CIMENT GABES H.R.S PAR SAC',
    'Ciment Gabès H.R.S par sac',
    'VARIANT'::"ProductKind",
    22,
    32,
    'materiaux-de-construction',
    'ciments-et-produits-en-beton',
    'ciment-gabes',
    'Ciment Gabès',
    'Ciments en sac',
    'Famille de ciments Gabès en sac pour les travaux de construction courants.',
    'Ciment Gabès : CPA, H.R.S et Normal 32.5 disponibles par sac chez COBAM GROUP.',
    955,
    1,
    21.843,
    165.000,
    'PIECE'::"StockUnit",
    'ciment gabes hrs sac construction beton',
    'Ciment Gabès H.R.S en sac pour travaux de construction et environnements exigeants.'
  ),
  (
    'NORMALGABES',
    'ciment-gabes-normal-325-par-sac',
    'CIMENT GABES NORMAL 32.5 PAR SAC',
    'Ciment Gabès Normal 32.5 par sac',
    'VARIANT'::"ProductKind",
    22,
    32,
    'materiaux-de-construction',
    'ciments-et-produits-en-beton',
    'ciment-gabes',
    'Ciment Gabès',
    'Ciments en sac',
    'Famille de ciments Gabès en sac pour les travaux de construction courants.',
    'Ciment Gabès : CPA, H.R.S et Normal 32.5 disponibles par sac chez COBAM GROUP.',
    955,
    2,
    18.684,
    364.000,
    'PIECE'::"StockUnit",
    'ciment gabes normal 32.5 sac construction beton',
    'Ciment Gabès Normal 32.5 en sac pour travaux de construction courants.'
  ),
  (
    '00228534',
    'sika-anchorfix-1-150-ml-cartouche',
    'SIKA ANCHORFIX -1 150 ML (CARTOUCHE)',
    'Sika AnchorFix-1 150 ml cartouche',
    'SINGLE'::"ProductKind",
    10,
    32,
    'materiaux-de-construction',
    'adjuvants',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    29.610,
    4.000,
    'PIECE'::"StockUnit",
    'sika anchorfix scellement chimique cartouche 150ml fixation beton',
    'Sika AnchorFix-1 en cartouche de 150 ml pour scellement et fixation.'
  ),
  (
    '00231893',
    'sika-bituseal-t-140-pg-rouleau-etancheite',
    'SIKA BITUSEAL T-140 PG (ROULEAU D ETANCHITE)',
    'Sika Bituseal T-140 PG rouleau d''étanchéité',
    'SINGLE'::"ProductKind",
    10,
    32,
    'isolation-et-etancheite',
    'etancheite',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    165.220,
    58.000,
    'PIECE'::"StockUnit",
    'sika bituseal t140 pg rouleau etancheite membrane',
    'Sika Bituseal T-140 PG en rouleau pour travaux d''étanchéité.'
  ),
  (
    '00231145',
    'sika-chapdur-premix-gris-25-kg',
    'SIKA CHAPDUR PREMIX GRIS 25 KG',
    'Sika Chapdur Premix gris 25 KG',
    'SINGLE'::"ProductKind",
    10,
    32,
    'materiaux-de-construction',
    'adjuvants',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    27.370,
    4.000,
    'PIECE'::"StockUnit",
    'sika chapdur premix gris 25kg durcisseur sol beton',
    'Sika Chapdur Premix gris en sac de 25 kg pour durcissement de surface béton.'
  ),
  (
    '00194792',
    'sikalatex-bidon-1l',
    'SIKALATEX BIDON 1L',
    'SikaLatex bidon 1L',
    'VARIANT'::"ProductKind",
    10,
    32,
    'materiaux-de-construction',
    'adjuvants',
    'sikalatex',
    'SikaLatex',
    'Résine d''accrochage et adjuvant',
    'Famille SikaLatex en bidons de 1L, 5L et 20L pour accrochage et amélioration des mortiers.',
    'SikaLatex : bidons 1L, 5L et 20L disponibles chez COBAM GROUP.',
    976,
    0,
    19.180,
    14.000,
    'PIECE'::"StockUnit",
    'sikalatex bidon 1l adjuvant mortier accrochage sika',
    'SikaLatex en bidon de 1L pour accrochage et amélioration des mortiers.'
  ),
  (
    '00229470',
    'sikalatex-bidon-20l',
    'SIKALATEX BIDON 20L',
    'SikaLatex bidon 20L',
    'VARIANT'::"ProductKind",
    10,
    32,
    'materiaux-de-construction',
    'adjuvants',
    'sikalatex',
    'SikaLatex',
    'Résine d''accrochage et adjuvant',
    'Famille SikaLatex en bidons de 1L, 5L et 20L pour accrochage et amélioration des mortiers.',
    'SikaLatex : bidons 1L, 5L et 20L disponibles chez COBAM GROUP.',
    976,
    2,
    345.000,
    3.000,
    'PIECE'::"StockUnit",
    'sikalatex bidon 20l adjuvant mortier accrochage sika',
    'SikaLatex en bidon de 20L pour accrochage et amélioration des mortiers.'
  ),
  (
    '00194785',
    'sikalatex-bidon-5l',
    'SIKALATEX BIDON 5L',
    'SikaLatex bidon 5L',
    'VARIANT'::"ProductKind",
    10,
    32,
    'materiaux-de-construction',
    'adjuvants',
    'sikalatex',
    'SikaLatex',
    'Résine d''accrochage et adjuvant',
    'Famille SikaLatex en bidons de 1L, 5L et 20L pour accrochage et amélioration des mortiers.',
    'SikaLatex : bidons 1L, 5L et 20L disponibles chez COBAM GROUP.',
    976,
    1,
    93.500,
    15.000,
    'PIECE'::"StockUnit",
    'sikalatex bidon 5l adjuvant mortier accrochage sika',
    'SikaLatex en bidon de 5L pour accrochage et amélioration des mortiers.'
  ),
  (
    '00183796',
    'sikalite-1kg-par-sachet',
    'SIKALITE 1KG PAR SACHET',
    'Sikalite 1KG par sachet',
    'SINGLE'::"ProductKind",
    10,
    32,
    'materiaux-de-construction',
    'adjuvants',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    8.750,
    162.000,
    'PIECE'::"StockUnit",
    'sikalite sachet 1kg adjuvant impermeabilisant mortier sika',
    'Sikalite en sachet de 1 kg pour les préparations cimentaires et mortiers.'
  );

INSERT INTO "product_attribute_groups" (
  "product_type_id", "name", "slug", "sort_order", "created_at", "updated_at"
)
SELECT DISTINCT
  "product_type_id",
  'Caractéristiques',
  'caracteristiques',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_batch_products"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_batch_attribute_values" (
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  PRIMARY KEY ("sku", "name")
);

INSERT INTO "_batch_attribute_values" ("sku", "name", "value")
VALUES
  ('00202992', 'seat_type', 'Standard'),
  ('00202992', 'soft_close', 'false'),
  ('00202992', 'color', 'Azur / lavanta'),
  ('00202992', 'application_area', 'Abattant WC'),

  ('00219952', 'seat_type', 'Soft-close'),
  ('00219952', 'soft_close', 'true'),
  ('00219952', 'color', 'Emeraude'),
  ('00219952', 'material', 'Thermodur'),
  ('00219952', 'application_area', 'Abattant WC'),

  ('00223607', 'packaging_weight_kg', '1'),
  ('00223607', 'application_area', 'Adjuvant ciment'),

  ('00219631', 'packaging_weight_kg', '1'),
  ('00219631', 'application_area', 'Adjuvant S2'),

  ('00178822', 'dimensions_text', 'L360 mm, angle 90°'),
  ('00178822', 'connection_size', 'G1/2'),
  ('00178822', 'finish', 'Chrome'),
  ('00178822', 'application_area', 'Bras de douche mural'),

  ('00206792', 'model_reference', 'ALI-SHA-CHR-455L400'),
  ('00206792', 'dimensions_text', 'L400 mm'),
  ('00206792', 'finish', 'Chrome'),
  ('00206792', 'application_area', 'Bras de douche mural'),

  ('PLATR', 'brick_type', 'Brique plâtrière'),
  ('PLATR', 'format_text', 'Plâtrière'),
  ('PLATR', 'origin_note', 'Essahel'),

  ('H16', 'brick_type', 'Brique hourdis'),
  ('H16', 'format_text', 'H16'),
  ('H16', 'origin_note', 'BCM / SBM dépôt'),

  ('B06', 'brick_type', 'Brique série A'),
  ('B06', 'format_text', '06'),
  ('B06', 'pallet_quantity', '680'),

  ('B08', 'brick_type', 'Brique série A'),
  ('B08', 'format_text', '08'),
  ('B08', 'origin_note', 'Essahel dépôt'),

  ('00178273', 'brick_type', 'Brique série A'),
  ('00178273', 'format_text', '12'),
  ('00178273', 'origin_note', 'BCM dépôt'),

  ('00201599', 'product_line', 'FM-ECO'),
  ('00201599', 'packaging_weight_kg', '25'),
  ('00201599', 'color', 'Blanc'),
  ('00201599', 'application_area', 'Pose de carrelage'),

  ('00201582', 'product_line', 'FM1000'),
  ('00201582', 'packaging_weight_kg', '25'),
  ('00201582', 'color', 'Blanc'),
  ('00201582', 'application_area', 'Pose de carrelage'),

  ('00201575', 'product_line', 'FM2000'),
  ('00201575', 'packaging_weight_kg', '25'),
  ('00201575', 'color', 'Blanc'),
  ('00201575', 'application_area', 'Pose de carrelage'),

  ('00201568', 'product_line', 'FM3000'),
  ('00201568', 'packaging_weight_kg', '25'),
  ('00201568', 'application_area', 'Piscine'),

  ('00227896', 'product_line', 'Sika Ceram 103'),
  ('00227896', 'packaging_weight_kg', '25'),
  ('00227896', 'color', 'Blanc'),
  ('00227896', 'application_area', 'Pose de carrelage'),

  ('00227902', 'product_line', 'Sika Ceram 106'),
  ('00227902', 'packaging_weight_kg', '25'),
  ('00227902', 'color', 'Blanc'),
  ('00227902', 'application_area', 'Pose de carrelage'),

  ('00227926', 'product_line', 'Sika Ceram 206'),
  ('00227926', 'packaging_weight_kg', '25'),
  ('00227926', 'color', 'Blanc'),
  ('00227926', 'application_area', 'Pose de carrelage'),

  ('CPAGABES', 'product_line', 'CPA'),
  ('CPAGABES', 'packaging_weight_kg', '50'),
  ('CPAGABES', 'application_area', 'Ciment en sac'),

  ('HRSGABES', 'product_line', 'H.R.S'),
  ('HRSGABES', 'packaging_weight_kg', '50'),
  ('HRSGABES', 'application_area', 'Ciment en sac'),

  ('NORMALGABES', 'product_line', 'Normal 32.5'),
  ('NORMALGABES', 'packaging_weight_kg', '50'),
  ('NORMALGABES', 'application_area', 'Ciment en sac'),

  ('00228534', 'product_line', 'AnchorFix-1'),
  ('00228534', 'packaging_volume_l', '0.15'),
  ('00228534', 'application_area', 'Scellement chimique'),

  ('00231893', 'product_line', 'Bituseal T-140 PG'),
  ('00231893', 'application_area', 'Etanchéité'),

  ('00231145', 'product_line', 'Chapdur Premix'),
  ('00231145', 'packaging_weight_kg', '25'),
  ('00231145', 'color', 'Gris'),
  ('00231145', 'application_area', 'Durcisseur de surface béton'),

  ('00194792', 'product_line', 'SikaLatex'),
  ('00194792', 'packaging_volume_l', '1'),
  ('00194792', 'application_area', 'Accrochage et adjuvant mortier'),

  ('00194785', 'product_line', 'SikaLatex'),
  ('00194785', 'packaging_volume_l', '5'),
  ('00194785', 'application_area', 'Accrochage et adjuvant mortier'),

  ('00229470', 'product_line', 'SikaLatex'),
  ('00229470', 'packaging_volume_l', '20'),
  ('00229470', 'application_area', 'Accrochage et adjuvant mortier'),

  ('00183796', 'product_line', 'Sikalite'),
  ('00183796', 'packaging_weight_kg', '1'),
  ('00183796', 'application_area', 'Adjuvant mortier');

INSERT INTO "product_type_attributes" (
  "product_type_id", "attribute_group_id", "attribute_definition_id", "label",
  "is_required", "is_filterable", "sort_order", "created_at", "updated_at"
)
SELECT DISTINCT
  "seed"."product_type_id",
  "attribute_group"."id",
  "definition"."id",
  "definition_seed"."label",
  false,
  "definition_seed"."is_filterable",
  "definition_seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_batch_attribute_values" "value_seed"
JOIN "_batch_products" "seed"
  ON "seed"."sku" = "value_seed"."sku"
JOIN "_batch_product_attribute_definitions" "definition_seed"
  ON "definition_seed"."key" = "value_seed"."name"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "definition_seed"."key"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."product_type_id" = "seed"."product_type_id"
  AND "attribute_group"."slug" = 'caracteristiques'
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "attribute_group_id" = EXCLUDED."attribute_group_id",
  "label" = EXCLUDED."label",
  "is_required" = EXCLUDED."is_required",
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo",
  "main_image_media_id", "created_at", "updated_at"
)
SELECT DISTINCT ON ("family_slug")
  "family_slug",
  "family_name",
  "family_subtitle",
  "family_description",
  left("family_description_seo", 160),
  "family_main_image_media_id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_batch_products"
WHERE "family_slug" IS NOT NULL
ORDER BY "family_slug", "sort_order"
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
  "seed"."kind",
  "seed"."brand_id",
  "seed"."product_type_id",
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
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."short_description"))
      )
    )
  ),
  left("seed"."display_name" || ' | COBAM GROUP', 60),
  left("seed"."display_name" || ' disponible chez COBAM GROUP en Tunisie.', 160),
  "seed"."tags",
  0,
  true,
  true,
  false,
  false,
  "seed"."stock_available",
  0,
  "seed"."stock_unit",
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
FROM "_batch_products" "seed"
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
USING "products" "product", "_batch_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  "seed"."sort_order"
FROM "_batch_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = "seed"."family_slug"
WHERE "seed"."family_slug" IS NOT NULL
ON CONFLICT ("product_id") DO UPDATE SET
  "family_id" = EXCLUDED."family_id",
  "sort_order" = EXCLUDED."sort_order";

WITH "ranked_defaults" AS (
  SELECT
    "seed"."family_slug",
    "product"."id" AS "product_id",
    row_number() OVER (
      PARTITION BY "seed"."family_slug"
      ORDER BY "seed"."sort_order" ASC, "product"."id" ASC
    ) AS "rank"
  FROM "_batch_products" "seed"
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

DELETE FROM "product_families" "family"
WHERE "family"."slug" = 'brique-hourdis'
  AND NOT EXISTS (
    SELECT 1
    FROM "product_family_members" "member"
    WHERE "member"."family_id" = "family"."id"
  );

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_batch_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_batch_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = "seed"."category_slug"
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = "seed"."subcategory_slug"
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_batch_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    SELECT "name" FROM "_batch_attribute_values"
  );

INSERT INTO "product_attributes" (
  "product_id", "attribute_def_id", "attribute_group_id", "name", "label", "value",
  "unit", "input_type", "is_required", "is_filterable", "group_name", "group_sort_order", "sort_order"
)
SELECT
  "product"."id",
  "definition"."id",
  "attribute_group"."id",
  "value_seed"."name",
  "definition_seed"."label",
  left("value_seed"."value", 255),
  "definition_seed"."unit",
  "definition_seed"."input_type",
  false,
  "definition_seed"."is_filterable",
  "attribute_group"."name",
  COALESCE("attribute_group"."sort_order", 0),
  "definition_seed"."sort_order"
FROM "_batch_attribute_values" "value_seed"
JOIN "_batch_products" "seed"
  ON "seed"."sku" = "value_seed"."sku"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "_batch_product_attribute_definitions" "definition_seed"
  ON "definition_seed"."key" = "value_seed"."name"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "definition_seed"."key"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."product_type_id" = "seed"."product_type_id"
  AND "attribute_group"."slug" = 'caracteristiques';

CREATE TEMP TABLE "_batch_product_media" (
  "sku" TEXT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "role" "ProductMediaRole" NOT NULL,
  "name" TEXT NOT NULL,
  "alt_text" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("sku", "media_id")
);

INSERT INTO "_batch_product_media" ("sku", "media_id", "role", "name", "alt_text", "sort_order")
VALUES
  ('00202992', 953, 'GALLERY'::"ProductMediaRole", 'ABAT AZUR-LAVANTA CS SANIMED', 'Abattant AZUR/LAVANTA CS Sanimed', 0),
  ('00219952', 954, 'GALLERY'::"ProductMediaRole", 'ABAT.THERMODUR AVEC AMORT EMERAUDE IDEAL SAN', 'Abattant thermodur avec amort Emeraude Ideal San', 0),
  ('00223607', 958, 'GALLERY'::"ProductMediaRole", 'ADMIX CIMENT 1KG PAR SACHET DEUTSCH', 'Admix ciment 1KG par sachet Deutsch Color', 0),
  ('00178822', 952, 'GALLERY'::"ProductMediaRole", 'BRAS DE DOUCHE CARRE MURAL G1-2 L360 90° SOPAL', 'Bras de douche carré mural G1/2 L360 90° Sopal', 0),
  ('00206792', 951, 'GALLERY'::"ProductMediaRole", 'BRAS DE DOUCHE MURAL CARRE ALI-SHA-CHR-455L400 JAQUAR', 'Bras de douche mural carré ALI-SHA-CHR-455L400 Jaquar', 0),
  ('PLATR', 949, 'GALLERY'::"ProductMediaRole", 'BRIQUE PLATERIERE ESSAHEL', 'Brique plâtrière Essahel', 0),
  ('H16', 950, 'GALLERY'::"ProductMediaRole", 'BRIQUE DE H16 BCM-SBM DEPOT', 'Brique hourdis H16 BCM/SBM dépôt', 0),
  ('B06', 948, 'GALLERY'::"ProductMediaRole", 'BRIQUE DE 06 (680-PL)', 'Brique série A 06', 0),
  ('B08', 947, 'GALLERY'::"ProductMediaRole", 'BRIQUE DE 08 ESSAHEL DEPOT', 'Brique série A 08 Essahel dépôt', 0),
  ('00178273', 946, 'GALLERY'::"ProductMediaRole", 'BRIQUE DE 12 BCM DEPOT', 'Brique série A 12 BCM dépôt', 0),

  ('00201599', 962, 'GALLERY'::"ProductMediaRole", 'CIMENT COLLE FM-ECO BLANC DEUTSCH COLOR', 'Ciment colle FM-ECO blanc Deutsch Color', 0),
  ('00201599', 998, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Ciment colle FM-ECO blanc Deutsch Color', 0),
  ('00201582', 959, 'GALLERY'::"ProductMediaRole", 'CIMENT COLLE FM1000 BLANC DEUTSCH COLOR', 'Ciment colle FM1000 blanc Deutsch Color', 0),
  ('00201582', 995, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Ciment colle FM1000 blanc Deutsch Color', 0),
  ('00201575', 960, 'GALLERY'::"ProductMediaRole", 'CIMENT COLLE FM2000 BLANC DEUTSCH COLOR', 'Ciment colle FM2000 blanc Deutsch Color', 0),
  ('00201575', 996, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Ciment colle FM2000 blanc Deutsch Color', 0),
  ('00201568', 961, 'GALLERY'::"ProductMediaRole", 'CIMENT COLLE FM3000 (PISCINE) DEUTSCH COLOR', 'Ciment colle FM3000 piscine Deutsch Color', 0),
  ('00201568', 997, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Ciment colle FM3000 piscine Deutsch Color', 0),

  ('00227896', 963, 'GALLERY'::"ProductMediaRole", 'CIMENT COLLE SIKA CERAM 103 BLANC SAC 25KG', 'Ciment colle Sika Ceram 103 blanc sac 25KG', 0),
  ('00227896', 999, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Sika Ceram 103 blanc sac 25KG', 0),
  ('00227902', 966, 'GALLERY'::"ProductMediaRole", 'CIMENT COLLE SIKA CERAM 106 BLANC SAC 25KG', 'Ciment colle Sika Ceram 106 blanc sac 25KG', 0),
  ('00227902', 1000, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Sika Ceram 106 blanc sac 25KG', 0),
  ('00227926', 965, 'GALLERY'::"ProductMediaRole", 'CIMENT COLLE SIKA CERAM 206 BLANC SAC 25KG', 'Ciment colle Sika Ceram 206 blanc sac 25KG', 0),
  ('00227926', 1001, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Sika Ceram 206 blanc sac 25KG', 0),

  ('CPAGABES', 955, 'GALLERY'::"ProductMediaRole", 'CIMENT GABES CPA PAR SAC', 'Ciment Gabès CPA par sac', 0),
  ('CPAGABES', 1002, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Ciment Gabès CPA par sac', 0),
  ('HRSGABES', 956, 'GALLERY'::"ProductMediaRole", 'CIMENT GABES H.R.S PAR SAC', 'Ciment Gabès H.R.S par sac', 0),
  ('HRSGABES', 1009, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Ciment Gabès H.R.S par sac', 0),
  ('NORMALGABES', 957, 'GALLERY'::"ProductMediaRole", 'CIMENT GABES NORMAL 32.5 PAR SAC', 'Ciment Gabès Normal 32.5 par sac', 0),
  ('NORMALGABES', 1010, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Ciment Gabès Normal 32.5 par sac', 0),

  ('00228534', 967, 'GALLERY'::"ProductMediaRole", 'SIKA ANCHORFIX -1 150 ML (CARTOUCHE) 1', 'Sika AnchorFix-1 150 ml cartouche', 0),
  ('00228534', 968, 'GALLERY'::"ProductMediaRole", 'SIKA ANCHORFIX -1 150 ML (CARTOUCHE) 2', 'Sika AnchorFix-1 150 ml cartouche', 1),
  ('00228534', 969, 'GALLERY'::"ProductMediaRole", 'SIKA ANCHORFIX -1 150 ML (CARTOUCHE) 3', 'Sika AnchorFix-1 150 ml cartouche', 2),
  ('00228534', 970, 'GALLERY'::"ProductMediaRole", 'SIKA ANCHORFIX -1 150 ML (CARTOUCHE) 4', 'Sika AnchorFix-1 150 ml cartouche', 3),
  ('00228534', 994, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Sika AnchorFix-1 150 ml cartouche', 0),

  ('00231893', 971, 'GALLERY'::"ProductMediaRole", 'SIKA BITUSEAL T-140 PG 1', 'Sika Bituseal T-140 PG rouleau d''étanchéité', 0),
  ('00231893', 972, 'GALLERY'::"ProductMediaRole", 'SIKA BITUSEAL T-140 PG 2', 'Sika Bituseal T-140 PG rouleau d''étanchéité', 1),
  ('00231893', 973, 'GALLERY'::"ProductMediaRole", 'SIKA BITUSEAL T-140 PG 3', 'Sika Bituseal T-140 PG rouleau d''étanchéité', 2),
  ('00231893', 974, 'GALLERY'::"ProductMediaRole", 'SIKA BITUSEAL T-140 PG 4', 'Sika Bituseal T-140 PG rouleau d''étanchéité', 3),
  ('00231893', 993, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Sika Bituseal T-140 PG', 0),

  ('00231145', 975, 'GALLERY'::"ProductMediaRole", 'SIKA CHAPDUR PREMIX GRIS 25 KG', 'Sika Chapdur Premix gris 25 KG', 0),
  ('00231145', 992, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Sika Chapdur Premix gris 25 KG', 0),

  ('00194792', 976, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 1L 1', 'SikaLatex bidon 1L', 0),
  ('00194792', 977, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 1L 2', 'SikaLatex bidon 1L', 1),
  ('00194792', 978, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 1L 3', 'SikaLatex bidon 1L', 2),
  ('00194792', 979, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 1L 4', 'SikaLatex bidon 1L', 3),
  ('00194792', 991, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique SikaLatex', 0),

  ('00194785', 980, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 5L 1', 'SikaLatex bidon 5L', 0),
  ('00194785', 981, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 5L 2', 'SikaLatex bidon 5L', 1),
  ('00194785', 982, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 5L 3', 'SikaLatex bidon 5L', 2),
  ('00194785', 983, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 5L 4', 'SikaLatex bidon 5L', 3),
  ('00194785', 991, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique SikaLatex', 0),

  ('00229470', 984, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 20L 1', 'SikaLatex bidon 20L', 0),
  ('00229470', 985, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 20L 2', 'SikaLatex bidon 20L', 1),
  ('00229470', 986, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 20L 3', 'SikaLatex bidon 20L', 2),
  ('00229470', 987, 'GALLERY'::"ProductMediaRole", 'SIKALATEX BIDON 20L 4', 'SikaLatex bidon 20L', 3),
  ('00229470', 991, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique SikaLatex', 0),

  ('00183796', 988, 'GALLERY'::"ProductMediaRole", 'SIKALITE 1KG PAR SACHET 1', 'Sikalite 1KG par sachet', 0),
  ('00183796', 989, 'GALLERY'::"ProductMediaRole", 'SIKALITE 1KG PAR SACHET 2', 'Sikalite 1KG par sachet', 1),
  ('00183796', 990, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique Sikalite 1KG par sachet', 0);

DELETE FROM "product_media" "product_media"
USING "products" "product", "_batch_products" "seed"
WHERE "product_media"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "product_media"."role" IN ('GALLERY'::"ProductMediaRole", 'TECHNICAL'::"ProductMediaRole");

INSERT INTO "product_media" (
  "product_id", "media_id", "role", "name", "alt_text", "sort_order", "created_at", "updated_at"
)
SELECT
  "product"."id",
  "media_seed"."media_id",
  "media_seed"."role",
  left("media_seed"."name", 255),
  left("media_seed"."alt_text", 255),
  "media_seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_batch_product_media" "media_seed"
JOIN "products" "product"
  ON "product"."sku" = "media_seed"."sku"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;
