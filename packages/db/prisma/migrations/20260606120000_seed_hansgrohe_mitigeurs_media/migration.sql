-- Seed Hansgrohe mixer products from the M media package.
-- Products are simple catalog entries linked to the existing Hansgrohe brand.

INSERT INTO "product_colors" ("key", "label", "value", "created_at", "updated_at")
VALUES
  ('CHROME', 'Chrome', '#C8CDD0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "value" = EXCLUDED."value",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_hansgrohe_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_hansgrohe_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
VALUES
  ('mitigeur-douche-bain', 'filtres-principaux', 'Filtres principaux', 0),
  ('mitigeur-douche-bain', 'caracteristiques', 'Caractéristiques', 10),
  ('mitigeur-lavabo-vasque', 'filtres-principaux', 'Filtres principaux', 0),
  ('mitigeur-lavabo-vasque', 'caracteristiques', 'Caractéristiques', 10);

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
FROM "_hansgrohe_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_hansgrohe_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_hansgrohe_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options"
)
VALUES
  ('color', 'Couleur', NULL, 'COLOR'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('finish', 'Finition', NULL, 'FINISH'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('manufacturer_ref', 'Référence fabricant', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('product_line', 'Gamme', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('mixer_usage', 'Usage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Bain-douche', 'Bidet']::TEXT[]),
  ('installation_type', 'Pose', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Mural', 'À poser']::TEXT[]),
  ('handle_type', 'Commande robinet', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Mitigeur mono-commande']::TEXT[]),
  ('thermostatic', 'Thermostatique', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('diverter', 'Inverseur', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('with_shower_kit', 'Kit douche inclus', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]);

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
FROM "_hansgrohe_attribute_definitions"
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

CREATE TEMP TABLE "_hansgrohe_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_hansgrohe_type_attributes" (
  "product_type_slug", "key", "group_slug", "label", "is_filterable", "sort_order"
)
VALUES
  ('mitigeur-douche-bain', 'color', 'filtres-principaux', 'Couleur', true, 0),
  ('mitigeur-douche-bain', 'finish', 'filtres-principaux', 'Finition', true, 1),
  ('mitigeur-douche-bain', 'thermostatic', 'filtres-principaux', 'Thermostatique', true, 10),
  ('mitigeur-douche-bain', 'diverter', 'filtres-principaux', 'Inverseur', true, 20),
  ('mitigeur-douche-bain', 'installation_type', 'filtres-principaux', 'Pose', true, 30),
  ('mitigeur-douche-bain', 'handle_type', 'filtres-principaux', 'Commande robinet', true, 35),
  ('mitigeur-douche-bain', 'with_shower_kit', 'filtres-principaux', 'Kit douche inclus', true, 40),
  ('mitigeur-douche-bain', 'manufacturer_ref', 'caracteristiques', 'Référence fabricant', true, 50),
  ('mitigeur-douche-bain', 'product_line', 'caracteristiques', 'Gamme', true, 60),
  ('mitigeur-douche-bain', 'mixer_usage', 'caracteristiques', 'Usage', true, 70),
  ('mitigeur-lavabo-vasque', 'color', 'filtres-principaux', 'Couleur', true, 0),
  ('mitigeur-lavabo-vasque', 'finish', 'filtres-principaux', 'Finition', true, 1),
  ('mitigeur-lavabo-vasque', 'installation_type', 'filtres-principaux', 'Pose', true, 20),
  ('mitigeur-lavabo-vasque', 'handle_type', 'filtres-principaux', 'Commande robinet', true, 40),
  ('mitigeur-lavabo-vasque', 'manufacturer_ref', 'caracteristiques', 'Référence fabricant', true, 50),
  ('mitigeur-lavabo-vasque', 'product_line', 'caracteristiques', 'Gamme', true, 60),
  ('mitigeur-lavabo-vasque', 'mixer_usage', 'caracteristiques', 'Usage', true, 70);

INSERT INTO "product_type_attributes" (
  "product_type_id", "attribute_group_id", "attribute_definition_id", "label",
  "is_required", "is_filterable", "sort_order", "created_at", "updated_at"
)
SELECT
  "template"."id",
  "attribute_group"."id",
  "definition"."id",
  "seed"."label",
  false,
  "seed"."is_filterable",
  "seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_hansgrohe_type_attributes" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "seed"."key"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."product_type_id" = "template"."id"
  AND "attribute_group"."slug" = "seed"."group_slug"
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "attribute_group_id" = EXCLUDED."attribute_group_id",
  "label" = EXCLUDED."label",
  "is_required" = EXCLUDED."is_required",
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_hansgrohe_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_hansgrohe_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1079, 'MIT. B.DOUCHE. FOCUS E2 31940000 CHROME (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1080, 'MIT. B.DOUCHE. FOCUS E2 31940000 CHROME (NOTICE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1081, 'MIT. B.DOUCHE. FOCUS S 31742000 CHROME (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1082, 'MIT. B.DOUCHE. FOCUS S 31742000 CHROME (NOTICE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1083, 'MIT. B.DOUCHE. METRIS MURAL 31480000 CHROME (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1084, 'MIT. B.DOUCHE. METRIS MURAL 31480000 CHROME (NOTICE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1085, 'MIT. B.DOUCHE. METRIS S 31460000 CHROME (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1086, 'MIT. B.DOUCHE. METRIS S 31460000 CHROME (NOTICE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1087, 'MIT. B.DOUCHE. TALIS E2 31642000 CHROME (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1088, 'MIT. B.DOUCHE. TALIS E2 31642000 CHROME (NOTICE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1089, 'MIT. B.DOUCHE. TALIS S2 3240000 CHROME (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1090, 'MIT. B.DOUCHE. TALIS S2 3240000 CHROME (NOTICE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1091, 'MIT. BID. FOCUS E2 3192000 CHROME (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1092, 'MIT. BID. FOCUS E2 3192000 CHROME (NOTICE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1093, 'MIT. BID. FOCUS S 31721000 CHROME (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1094, 'MIT. BID. FOCUS S 31721000 CHROME (NOTICE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1095, 'MIT. BID. TALIS E2 31622000 CHROME (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1096, 'MIT. BID. TALIS E2 31622000 CHROME (NOTICE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1097, 'MIT. BID. TALIS S2 3224000 CHROME (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1098, 'MIT. BID. TALIS S2 3224000 CHROME (NOTICE MONTAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1099, 'MIT. B.DOUCHE. FOCUS E2 31940000 CHROME [1].webp', 'IMAGE'::"MediaKind"),
  (1100, 'MIT. B.DOUCHE. FOCUS E2 31940000 CHROME [2].webp', 'IMAGE'::"MediaKind"),
  (1101, 'MIT. B.DOUCHE. FOCUS E2 31940000 CHROME [3].webp', 'IMAGE'::"MediaKind"),
  (1102, 'MIT. B.DOUCHE. FOCUS E2 31940000 CHROME [4].webp', 'IMAGE'::"MediaKind"),
  (1103, 'MIT. B.DOUCHE. FOCUS S 31742000 CHROME [1].webp', 'IMAGE'::"MediaKind"),
  (1104, 'MIT. B.DOUCHE. FOCUS S 31742000 CHROME [2].webp', 'IMAGE'::"MediaKind"),
  (1105, 'MIT. B.DOUCHE. FOCUS S 31742000 CHROME [3].webp', 'IMAGE'::"MediaKind"),
  (1106, 'MIT. B.DOUCHE. FOCUS S 31742000 CHROME [4].webp', 'IMAGE'::"MediaKind"),
  (1107, 'MIT. B.DOUCHE. METRIS MURAL 31480000 CHROME [1].webp', 'IMAGE'::"MediaKind"),
  (1108, 'MIT. B.DOUCHE. METRIS MURAL 31480000 CHROME [2].webp', 'IMAGE'::"MediaKind"),
  (1109, 'MIT. B.DOUCHE. METRIS MURAL 31480000 CHROME [3].webp', 'IMAGE'::"MediaKind"),
  (1110, 'MIT. B.DOUCHE. METRIS MURAL 31480000 CHROME [4].webp', 'IMAGE'::"MediaKind"),
  (1111, 'MIT. B.DOUCHE. METRIS S 31460000 CHROME [1].webp', 'IMAGE'::"MediaKind"),
  (1112, 'MIT. B.DOUCHE. METRIS S 31460000 CHROME [2].webp', 'IMAGE'::"MediaKind"),
  (1113, 'MIT. B.DOUCHE. METRIS S 31460000 CHROME [3].webp', 'IMAGE'::"MediaKind"),
  (1114, 'MIT. B.DOUCHE. METRIS S 31460000 CHROME [4].webp', 'IMAGE'::"MediaKind"),
  (1115, 'MIT. B.DOUCHE. TALIS E2 31642000 CHROME [1].webp', 'IMAGE'::"MediaKind"),
  (1116, 'MIT. B.DOUCHE. TALIS E2 31642000 CHROME [2].webp', 'IMAGE'::"MediaKind"),
  (1117, 'MIT. B.DOUCHE. TALIS E2 31642000 CHROME [3].webp', 'IMAGE'::"MediaKind"),
  (1118, 'MIT. B.DOUCHE. TALIS S2 3240000 CHROME [1].webp', 'IMAGE'::"MediaKind"),
  (1119, 'MIT. B.DOUCHE. TALIS S2 3240000 CHROME [2].webp', 'IMAGE'::"MediaKind"),
  (1120, 'MIT. B.DOUCHE. TALIS S2 3240000 CHROME [3].webp', 'IMAGE'::"MediaKind"),
  (1121, 'MIT. B.DOUCHE. TALIS S2 3240000 CHROME [4].webp', 'IMAGE'::"MediaKind"),
  (1122, 'MIT. BID. FOCUS E2 3192000 CHROME [1].webp', 'IMAGE'::"MediaKind"),
  (1123, 'MIT. BID. FOCUS E2 3192000 CHROME [2].webp', 'IMAGE'::"MediaKind"),
  (1124, 'MIT. BID. FOCUS E2 3192000 CHROME [3].webp', 'IMAGE'::"MediaKind"),
  (1125, 'MIT. BID. FOCUS E2 3192000 CHROME [4].webp', 'IMAGE'::"MediaKind"),
  (1126, 'MIT. BID. FOCUS S 31721000 CHROME [1].webp', 'IMAGE'::"MediaKind"),
  (1127, 'MIT. BID. FOCUS S 31721000 CHROME [2].webp', 'IMAGE'::"MediaKind"),
  (1128, 'MIT. BID. FOCUS S 31721000 CHROME [3].webp', 'IMAGE'::"MediaKind"),
  (1129, 'MIT. BID. FOCUS S 31721000 CHROME [4].webp', 'IMAGE'::"MediaKind"),
  (1130, 'MIT. BID. TALIS E2 31622000 CHROME [1].webp', 'IMAGE'::"MediaKind"),
  (1131, 'MIT. BID. TALIS E2 31622000 CHROME [2].webp', 'IMAGE'::"MediaKind"),
  (1132, 'MIT. BID. TALIS E2 31622000 CHROME [3].webp', 'IMAGE'::"MediaKind"),
  (1133, 'MIT. BID. TALIS S2 3224000 CHROME [1].webp', 'IMAGE'::"MediaKind"),
  (1134, 'MIT. BID. TALIS S2 3224000 CHROME [2].webp', 'IMAGE'::"MediaKind"),
  (1135, 'MIT. BID. TALIS S2 3224000 CHROME [3].webp', 'IMAGE'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "organizations"
    WHERE "id" = 352
      AND "slug" = 'hansgrohe'
      AND "name" = 'Hansgrohe'
      AND "is_product_brand" = true
  ) THEN
    RAISE EXCEPTION 'Missing expected brand organizations id 352 / Hansgrohe.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "product_type_templates" WHERE "slug" = 'mitigeur-douche-bain'
  ) THEN
    RAISE EXCEPTION 'Missing product type template slug mitigeur-douche-bain.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "product_type_templates" WHERE "slug" = 'mitigeur-lavabo-vasque'
  ) THEN
    RAISE EXCEPTION 'Missing product type template slug mitigeur-lavabo-vasque.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_subcategories" "subcategory"
    JOIN "product_types" "category"
      ON "category"."id" = "subcategory"."category_id"
    WHERE "category"."slug" = 'salle-de-bain-et-cuisine'
      AND "subcategory"."slug" = 'robinetterie'
  ) THEN
    RAISE EXCEPTION 'Missing subcategory salle-de-bain-et-cuisine / robinetterie.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "product_finishes" WHERE "key" = 'CHROME'
  ) THEN
    RAISE EXCEPTION 'Missing expected product finish key CHROME.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "product_certificates" WHERE "slug" = 'acs'
  ) THEN
    RAISE EXCEPTION 'Missing product certificate ACS.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "product_certificates" WHERE "slug" = 'fdes'
  ) THEN
    RAISE EXCEPTION 'Missing product certificate FDES.';
  END IF;

  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_hansgrohe_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed Hansgrohe mixer media: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;
END $$;

CREATE TEMP TABLE "_hansgrohe_products" (
  "sku" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "product_type_slug" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "product_line" TEXT NOT NULL,
  "manufacturer_ref" TEXT NOT NULL,
  "mixer_usage" TEXT NOT NULL,
  "installation_type" TEXT NOT NULL,
  "handle_type" TEXT NOT NULL,
  "thermostatic" BOOLEAN,
  "diverter" BOOLEAN,
  "with_shower_kit" BOOLEAN,
  "color_value" TEXT NOT NULL,
  "finish_value" TEXT NOT NULL,
  "title_seo" TEXT NOT NULL,
  "description_seo" TEXT NOT NULL,
  "tags" TEXT NOT NULL,
  "overview_text" TEXT NOT NULL,
  "advice_text" TEXT NOT NULL,
  "detail_text" TEXT NOT NULL
);

INSERT INTO "_hansgrohe_products" (
  "sku", "slug", "name", "display_name", "product_type_slug", "sort_order",
  "price_ttc", "stock_available", "product_line", "manufacturer_ref",
  "mixer_usage", "installation_type", "handle_type", "thermostatic", "diverter",
  "with_shower_kit", "color_value", "finish_value", "title_seo", "description_seo",
  "tags", "overview_text", "advice_text", "detail_text"
)
VALUES
  (
    '00006421',
    'hansgrohe-mitigeur-bain-douche-focus-e2-31940000-chrome',
    'MIT. B.DOUCHE. FOCUS E2 31940000 CHROME',
    'Mitigeur bain-douche Focus E2 31940000 chrome Hansgrohe',
    'mitigeur-douche-bain',
    0,
    260.000,
    2.000,
    'Focus E2',
    '31940000',
    'Bain-douche',
    'Mural',
    'Mitigeur mono-commande',
    false,
    true,
    false,
    'Chrome',
    'Chrome',
    'Mitigeur bain-douche Focus E2 Hansgrohe',
    'Mitigeur bain-douche Hansgrohe Focus E2 chromé, référence 31940000, disponible chez COBAM GROUP en Tunisie.',
    'hansgrohe mitigeur bain-douche douche baignoire robinetterie focus-e2 chrome 31940000',
    'Le mitigeur bain-douche Focus E2 Hansgrohe réunit une silhouette sobre, une commande mono-commande et une finition chrome pensée pour les salles de bain contemporaines.',
    'Adapté à une installation murale bain-douche, il convient aux projets qui recherchent une robinetterie fiable, facile à coordonner avec des accessoires chromés.',
    'La documentation technique et la notice de montage jointes permettent de vérifier les cotes, les raccordements et les prérequis d''installation avant la pose.'
  ),
  (
    '00006422',
    'hansgrohe-mitigeur-bain-douche-focus-s-31742000-chrome',
    'MIT. B.DOUCHE. FOCUS S 31742000 CHROME',
    'Mitigeur bain-douche Focus S 31742000 chrome Hansgrohe',
    'mitigeur-douche-bain',
    1,
    258.000,
    3.000,
    'Focus S',
    '31742000',
    'Bain-douche',
    'Mural',
    'Mitigeur mono-commande',
    false,
    true,
    false,
    'Chrome',
    'Chrome',
    'Mitigeur bain-douche Focus S Hansgrohe',
    'Mitigeur bain-douche Hansgrohe Focus S chromé, référence 31742000, disponible chez COBAM GROUP en Tunisie.',
    'hansgrohe mitigeur bain-douche douche baignoire robinetterie focus-s chrome 31742000',
    'Le Focus S 31742000 apporte une robinetterie bain-douche chromée au dessin arrondi, adaptée aux salles de bain sobres et faciles à entretenir.',
    'Sa commande mono-commande facilite le réglage du débit et de la température pour un usage quotidien simple.',
    'La fiche technique et la notice de montage permettent de contrôler les dimensions, les raccordements et les étapes de pose.'
  ),
  (
    '00006423',
    'hansgrohe-mitigeur-bain-douche-mural-metris-31480000-chrome',
    'MIT. B.DOUCHE. METRIS MURAL 31480000 CHROME',
    'Mitigeur bain-douche mural Metris 31480000 chrome Hansgrohe',
    'mitigeur-douche-bain',
    2,
    651.000,
    1.000,
    'Metris',
    '31480000',
    'Bain-douche',
    'Mural',
    'Mitigeur mono-commande',
    false,
    true,
    false,
    'Chrome',
    'Chrome',
    'Mitigeur bain-douche mural Metris Hansgrohe',
    'Mitigeur bain-douche mural Hansgrohe Metris chromé, référence 31480000, disponible chez COBAM GROUP en Tunisie.',
    'hansgrohe mitigeur bain-douche mural douche baignoire robinetterie metris chrome 31480000',
    'Le Metris mural 31480000 met l''accent sur une présence plus statutaire avec une finition chrome et une commande mono-commande précise.',
    'Il s''intègre aux compositions bain-douche murales qui demandent une robinetterie visible, durable et facile à associer.',
    'Les documents joints servent à vérifier les cotes de montage et les recommandations de pose avant intervention.'
  ),
  (
    '00006424',
    'hansgrohe-mitigeur-bain-douche-metris-s-31460000-chrome',
    'MIT. B.DOUCHE. METRIS S 31460000 CHROME',
    'Mitigeur bain-douche Metris S 31460000 chrome Hansgrohe',
    'mitigeur-douche-bain',
    3,
    525.000,
    1.000,
    'Metris S',
    '31460000',
    'Bain-douche',
    'Mural',
    'Mitigeur mono-commande',
    false,
    true,
    false,
    'Chrome',
    'Chrome',
    'Mitigeur bain-douche Metris S Hansgrohe',
    'Mitigeur bain-douche Hansgrohe Metris S chromé, référence 31460000, disponible chez COBAM GROUP en Tunisie.',
    'hansgrohe mitigeur bain-douche douche baignoire robinetterie metris-s chrome 31460000',
    'Le Metris S 31460000 associe une silhouette arrondie à une finition chrome lumineuse pour une zone bain-douche soignée.',
    'Son format mural convient aux installations où l''on veut conserver un ensemble lisible et facile à nettoyer autour de la baignoire.',
    'La fiche technique et la notice de montage accompagnent la vérification des raccordements et de la pose.'
  ),
  (
    '00006425',
    'hansgrohe-mitigeur-bain-douche-talis-e2-31642000-chrome',
    'MIT. B.DOUCHE. TALIS E2 31642000 CHROME',
    'Mitigeur bain-douche Talis E2 31642000 chrome Hansgrohe',
    'mitigeur-douche-bain',
    4,
    313.000,
    1.000,
    'Talis E2',
    '31642000',
    'Bain-douche',
    'Mural',
    'Mitigeur mono-commande',
    false,
    true,
    false,
    'Chrome',
    'Chrome',
    'Mitigeur bain-douche Talis E2 Hansgrohe',
    'Mitigeur bain-douche Hansgrohe Talis E2 chromé, référence 31642000, disponible chez COBAM GROUP en Tunisie.',
    'hansgrohe mitigeur bain-douche douche baignoire robinetterie talis-e2 chrome 31642000',
    'Le Talis E2 31642000 propose une robinetterie bain-douche chromée avec une ligne nette et une commande confortable.',
    'Il convient aux projets de salle de bain qui cherchent une finition classique, compatible avec les accessoires chromés existants.',
    'Les documents techniques fournis facilitent la préparation de la pose et le contrôle de la compatibilité.'
  ),
  (
    '00006426',
    'hansgrohe-mitigeur-bain-douche-talis-s2-3240000-chrome',
    'MIT. B.DOUCHE. TALIS S2 3240000 CHROME',
    'Mitigeur bain-douche Talis S2 3240000 chrome Hansgrohe',
    'mitigeur-douche-bain',
    5,
    363.000,
    2.000,
    'Talis S2',
    '3240000',
    'Bain-douche',
    'Mural',
    'Mitigeur mono-commande',
    false,
    true,
    false,
    'Chrome',
    'Chrome',
    'Mitigeur bain-douche Talis S2 Hansgrohe',
    'Mitigeur bain-douche Hansgrohe Talis S2 chromé, référence 3240000, disponible chez COBAM GROUP en Tunisie.',
    'hansgrohe mitigeur bain-douche douche baignoire robinetterie talis-s2 chrome 3240000',
    'Le Talis S2 3240000 apporte une robinetterie bain-douche chromée au design arrondi et facile à associer.',
    'Sa commande mono-commande permet de gérer rapidement le débit et la température dans une salle de bain familiale.',
    'La fiche technique et la notice de montage jointes documentent les dimensions et la procédure de pose.'
  ),
  (
    '00006427',
    'hansgrohe-mitigeur-bidet-focus-e2-3192000-chrome',
    'MIT. BID. FOCUS E2 3192000 CHROME',
    'Mitigeur bidet Focus E2 3192000 chrome Hansgrohe',
    'mitigeur-lavabo-vasque',
    6,
    178.000,
    2.000,
    'Focus E2',
    '3192000',
    'Bidet',
    'À poser',
    'Mitigeur mono-commande',
    NULL,
    NULL,
    NULL,
    'Chrome',
    'Chrome',
    'Mitigeur bidet Focus E2 Hansgrohe',
    'Mitigeur bidet Hansgrohe Focus E2 chromé, référence 3192000, disponible chez COBAM GROUP en Tunisie.',
    'hansgrohe mitigeur bidet robinetterie focus-e2 chrome 3192000',
    'Le mitigeur bidet Focus E2 3192000 complète une salle de bain avec une robinetterie chromée compacte et cohérente avec la gamme Focus.',
    'Sa pose sur appareil sanitaire convient aux projets où l''on souhaite une commande simple et une finition facile à harmoniser.',
    'La fiche technique et la notice de montage permettent de vérifier les dimensions et les instructions de pose.'
  ),
  (
    '00006428',
    'hansgrohe-mitigeur-bidet-focus-s-31721000-chrome',
    'MIT. BID. FOCUS S 31721000 CHROME',
    'Mitigeur bidet Focus S 31721000 chrome Hansgrohe',
    'mitigeur-lavabo-vasque',
    7,
    227.000,
    2.000,
    'Focus S',
    '31721000',
    'Bidet',
    'À poser',
    'Mitigeur mono-commande',
    NULL,
    NULL,
    NULL,
    'Chrome',
    'Chrome',
    'Mitigeur bidet Focus S Hansgrohe',
    'Mitigeur bidet Hansgrohe Focus S chromé, référence 31721000, disponible chez COBAM GROUP en Tunisie.',
    'hansgrohe mitigeur bidet robinetterie focus-s chrome 31721000',
    'Le Focus S 31721000 est un mitigeur de bidet chromé au dessin sobre, pensé pour rester discret dans l''espace sanitaire.',
    'La commande mono-commande simplifie les réglages au quotidien et la finition chrome se coordonne facilement avec la robinetterie de salle de bain.',
    'Les documents joints facilitent le contrôle des dimensions, du raccordement et de la pose.'
  ),
  (
    '00006429',
    'hansgrohe-mitigeur-bidet-talis-e2-31622000-chrome',
    'MIT. BID. TALIS E2 31622000 CHROME',
    'Mitigeur bidet Talis E2 31622000 chrome Hansgrohe',
    'mitigeur-lavabo-vasque',
    8,
    258.000,
    1.000,
    'Talis E2',
    '31622000',
    'Bidet',
    'À poser',
    'Mitigeur mono-commande',
    NULL,
    NULL,
    NULL,
    'Chrome',
    'Chrome',
    'Mitigeur bidet Talis E2 Hansgrohe',
    'Mitigeur bidet Hansgrohe Talis E2 chromé, référence 31622000, disponible chez COBAM GROUP en Tunisie.',
    'hansgrohe mitigeur bidet robinetterie talis-e2 chrome 31622000',
    'Le Talis E2 31622000 propose une robinetterie de bidet chromée avec une ligne nette et une prise en main confortable.',
    'Il convient aux salles de bain qui recherchent une finition homogène entre bidet, lavabo et accessoires chromés.',
    'La fiche technique et la notice de montage documentent les points de contrôle nécessaires avant installation.'
  ),
  (
    '00006430',
    'hansgrohe-mitigeur-bidet-talis-s2-3224000-chrome',
    'MIT. BID. TALIS S2 3224000 CHROME',
    'Mitigeur bidet Talis S2 3224000 chrome Hansgrohe',
    'mitigeur-lavabo-vasque',
    9,
    292.000,
    1.000,
    'Talis S2',
    '3224000',
    'Bidet',
    'À poser',
    'Mitigeur mono-commande',
    NULL,
    NULL,
    NULL,
    'Chrome',
    'Chrome',
    'Mitigeur bidet Talis S2 Hansgrohe',
    'Mitigeur bidet Hansgrohe Talis S2 chromé, référence 3224000, disponible chez COBAM GROUP en Tunisie.',
    'hansgrohe mitigeur bidet robinetterie talis-s2 chrome 3224000',
    'Le Talis S2 3224000 complète l''espace bidet avec une finition chrome et une commande mono-commande simple à utiliser.',
    'Son esthétique arrondie permet de l''associer naturellement aux autres éléments chromés de la salle de bain.',
    'Les documents techniques joints aident à vérifier les cotes, le raccordement et la pose.'
  );

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
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."overview_text"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."advice_text"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."detail_text"))
      )
    )
  ),
  left("seed"."title_seo", 60),
  left("seed"."description_seo", 160),
  "seed"."tags",
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
FROM "_hansgrohe_products" "seed"
JOIN "organizations" "brand"
  ON "brand"."id" = 352
  AND "brand"."slug" = 'hansgrohe'
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
USING "products" "product", "_hansgrohe_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_hansgrohe_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'robinetterie'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_hansgrohe_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    SELECT "key" FROM "_hansgrohe_attribute_definitions"
  );

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "product"."product_type_id",
    "attribute_seed"."name",
    "attribute_seed"."value"
  FROM "_hansgrohe_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL (
    VALUES
      ('color', "seed"."color_value"),
      ('finish', "seed"."finish_value"),
      ('manufacturer_ref', "seed"."manufacturer_ref"),
      ('product_line', "seed"."product_line"),
      ('mixer_usage', "seed"."mixer_usage"),
      ('installation_type', "seed"."installation_type"),
      ('handle_type', "seed"."handle_type"),
      ('thermostatic', CASE WHEN "seed"."thermostatic" IS NULL THEN NULL ELSE "seed"."thermostatic"::TEXT END),
      ('diverter', CASE WHEN "seed"."diverter" IS NULL THEN NULL ELSE "seed"."diverter"::TEXT END),
      ('with_shower_kit', CASE WHEN "seed"."with_shower_kit" IS NULL THEN NULL ELSE "seed"."with_shower_kit"::TEXT END)
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
  COALESCE(NULLIF("template_attribute"."label", ''), "definition"."label"),
  left("attribute_values"."value", 255),
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

CREATE TEMP TABLE "_hansgrohe_product_media" (
  "sku" TEXT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "role" "ProductMediaRole" NOT NULL,
  "name" TEXT NOT NULL,
  "alt_text" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("sku", "media_id")
);

INSERT INTO "_hansgrohe_product_media" ("sku", "media_id", "role", "name", "alt_text", "sort_order")
VALUES
  ('00006421', 1099, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. FOCUS E2 31940000 CHROME [1]', 'Mitigeur bain-douche Focus E2 31940000 chrome Hansgrohe - vue 1', 0),
  ('00006421', 1100, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. FOCUS E2 31940000 CHROME [2]', 'Mitigeur bain-douche Focus E2 31940000 chrome Hansgrohe - vue 2', 1),
  ('00006421', 1101, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. FOCUS E2 31940000 CHROME [3]', 'Mitigeur bain-douche Focus E2 31940000 chrome Hansgrohe - vue 3', 2),
  ('00006421', 1102, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. FOCUS E2 31940000 CHROME [4]', 'Mitigeur bain-douche Focus E2 31940000 chrome Hansgrohe - vue 4', 3),
  ('00006421', 1079, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique mitigeur bain-douche Focus E2 31940000 Hansgrohe', 0),
  ('00006421', 1080, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 'Notice de montage mitigeur bain-douche Focus E2 31940000 Hansgrohe', 1),
  ('00006422', 1103, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. FOCUS S 31742000 CHROME [1]', 'Mitigeur bain-douche Focus S 31742000 chrome Hansgrohe - vue 1', 0),
  ('00006422', 1104, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. FOCUS S 31742000 CHROME [2]', 'Mitigeur bain-douche Focus S 31742000 chrome Hansgrohe - vue 2', 1),
  ('00006422', 1105, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. FOCUS S 31742000 CHROME [3]', 'Mitigeur bain-douche Focus S 31742000 chrome Hansgrohe - vue 3', 2),
  ('00006422', 1106, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. FOCUS S 31742000 CHROME [4]', 'Mitigeur bain-douche Focus S 31742000 chrome Hansgrohe - vue 4', 3),
  ('00006422', 1081, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique mitigeur bain-douche Focus S 31742000 Hansgrohe', 0),
  ('00006422', 1082, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 'Notice de montage mitigeur bain-douche Focus S 31742000 Hansgrohe', 1),
  ('00006423', 1107, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. METRIS MURAL 31480000 CHROME [1]', 'Mitigeur bain-douche mural Metris 31480000 chrome Hansgrohe - vue 1', 0),
  ('00006423', 1108, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. METRIS MURAL 31480000 CHROME [2]', 'Mitigeur bain-douche mural Metris 31480000 chrome Hansgrohe - vue 2', 1),
  ('00006423', 1109, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. METRIS MURAL 31480000 CHROME [3]', 'Mitigeur bain-douche mural Metris 31480000 chrome Hansgrohe - vue 3', 2),
  ('00006423', 1110, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. METRIS MURAL 31480000 CHROME [4]', 'Mitigeur bain-douche mural Metris 31480000 chrome Hansgrohe - vue 4', 3),
  ('00006423', 1083, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique mitigeur bain-douche mural Metris 31480000 Hansgrohe', 0),
  ('00006423', 1084, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 'Notice de montage mitigeur bain-douche mural Metris 31480000 Hansgrohe', 1),
  ('00006424', 1111, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. METRIS S 31460000 CHROME [1]', 'Mitigeur bain-douche Metris S 31460000 chrome Hansgrohe - vue 1', 0),
  ('00006424', 1112, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. METRIS S 31460000 CHROME [2]', 'Mitigeur bain-douche Metris S 31460000 chrome Hansgrohe - vue 2', 1),
  ('00006424', 1113, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. METRIS S 31460000 CHROME [3]', 'Mitigeur bain-douche Metris S 31460000 chrome Hansgrohe - vue 3', 2),
  ('00006424', 1114, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. METRIS S 31460000 CHROME [4]', 'Mitigeur bain-douche Metris S 31460000 chrome Hansgrohe - vue 4', 3),
  ('00006424', 1085, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique mitigeur bain-douche Metris S 31460000 Hansgrohe', 0),
  ('00006424', 1086, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 'Notice de montage mitigeur bain-douche Metris S 31460000 Hansgrohe', 1),
  ('00006425', 1115, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. TALIS E2 31642000 CHROME [1]', 'Mitigeur bain-douche Talis E2 31642000 chrome Hansgrohe - vue 1', 0),
  ('00006425', 1116, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. TALIS E2 31642000 CHROME [2]', 'Mitigeur bain-douche Talis E2 31642000 chrome Hansgrohe - vue 2', 1),
  ('00006425', 1117, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. TALIS E2 31642000 CHROME [3]', 'Mitigeur bain-douche Talis E2 31642000 chrome Hansgrohe - vue 3', 2),
  ('00006425', 1087, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique mitigeur bain-douche Talis E2 31642000 Hansgrohe', 0),
  ('00006425', 1088, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 'Notice de montage mitigeur bain-douche Talis E2 31642000 Hansgrohe', 1),
  ('00006426', 1118, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. TALIS S2 3240000 CHROME [1]', 'Mitigeur bain-douche Talis S2 3240000 chrome Hansgrohe - vue 1', 0),
  ('00006426', 1119, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. TALIS S2 3240000 CHROME [2]', 'Mitigeur bain-douche Talis S2 3240000 chrome Hansgrohe - vue 2', 1),
  ('00006426', 1120, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. TALIS S2 3240000 CHROME [3]', 'Mitigeur bain-douche Talis S2 3240000 chrome Hansgrohe - vue 3', 2),
  ('00006426', 1121, 'GALLERY'::"ProductMediaRole", 'MIT. B.DOUCHE. TALIS S2 3240000 CHROME [4]', 'Mitigeur bain-douche Talis S2 3240000 chrome Hansgrohe - vue 4', 3),
  ('00006426', 1089, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique mitigeur bain-douche Talis S2 3240000 Hansgrohe', 0),
  ('00006426', 1090, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 'Notice de montage mitigeur bain-douche Talis S2 3240000 Hansgrohe', 1),
  ('00006427', 1122, 'GALLERY'::"ProductMediaRole", 'MIT. BID. FOCUS E2 3192000 CHROME [1]', 'Mitigeur bidet Focus E2 3192000 chrome Hansgrohe - vue 1', 0),
  ('00006427', 1123, 'GALLERY'::"ProductMediaRole", 'MIT. BID. FOCUS E2 3192000 CHROME [2]', 'Mitigeur bidet Focus E2 3192000 chrome Hansgrohe - vue 2', 1),
  ('00006427', 1124, 'GALLERY'::"ProductMediaRole", 'MIT. BID. FOCUS E2 3192000 CHROME [3]', 'Mitigeur bidet Focus E2 3192000 chrome Hansgrohe - vue 3', 2),
  ('00006427', 1125, 'GALLERY'::"ProductMediaRole", 'MIT. BID. FOCUS E2 3192000 CHROME [4]', 'Mitigeur bidet Focus E2 3192000 chrome Hansgrohe - vue 4', 3),
  ('00006427', 1091, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique mitigeur bidet Focus E2 3192000 Hansgrohe', 0),
  ('00006427', 1092, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 'Notice de montage mitigeur bidet Focus E2 3192000 Hansgrohe', 1),
  ('00006428', 1126, 'GALLERY'::"ProductMediaRole", 'MIT. BID. FOCUS S 31721000 CHROME [1]', 'Mitigeur bidet Focus S 31721000 chrome Hansgrohe - vue 1', 0),
  ('00006428', 1127, 'GALLERY'::"ProductMediaRole", 'MIT. BID. FOCUS S 31721000 CHROME [2]', 'Mitigeur bidet Focus S 31721000 chrome Hansgrohe - vue 2', 1),
  ('00006428', 1128, 'GALLERY'::"ProductMediaRole", 'MIT. BID. FOCUS S 31721000 CHROME [3]', 'Mitigeur bidet Focus S 31721000 chrome Hansgrohe - vue 3', 2),
  ('00006428', 1129, 'GALLERY'::"ProductMediaRole", 'MIT. BID. FOCUS S 31721000 CHROME [4]', 'Mitigeur bidet Focus S 31721000 chrome Hansgrohe - vue 4', 3),
  ('00006428', 1093, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique mitigeur bidet Focus S 31721000 Hansgrohe', 0),
  ('00006428', 1094, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 'Notice de montage mitigeur bidet Focus S 31721000 Hansgrohe', 1),
  ('00006429', 1130, 'GALLERY'::"ProductMediaRole", 'MIT. BID. TALIS E2 31622000 CHROME [1]', 'Mitigeur bidet Talis E2 31622000 chrome Hansgrohe - vue 1', 0),
  ('00006429', 1131, 'GALLERY'::"ProductMediaRole", 'MIT. BID. TALIS E2 31622000 CHROME [2]', 'Mitigeur bidet Talis E2 31622000 chrome Hansgrohe - vue 2', 1),
  ('00006429', 1132, 'GALLERY'::"ProductMediaRole", 'MIT. BID. TALIS E2 31622000 CHROME [3]', 'Mitigeur bidet Talis E2 31622000 chrome Hansgrohe - vue 3', 2),
  ('00006429', 1095, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique mitigeur bidet Talis E2 31622000 Hansgrohe', 0),
  ('00006429', 1096, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 'Notice de montage mitigeur bidet Talis E2 31622000 Hansgrohe', 1),
  ('00006430', 1133, 'GALLERY'::"ProductMediaRole", 'MIT. BID. TALIS S2 3224000 CHROME [1]', 'Mitigeur bidet Talis S2 3224000 chrome Hansgrohe - vue 1', 0),
  ('00006430', 1134, 'GALLERY'::"ProductMediaRole", 'MIT. BID. TALIS S2 3224000 CHROME [2]', 'Mitigeur bidet Talis S2 3224000 chrome Hansgrohe - vue 2', 1),
  ('00006430', 1135, 'GALLERY'::"ProductMediaRole", 'MIT. BID. TALIS S2 3224000 CHROME [3]', 'Mitigeur bidet Talis S2 3224000 chrome Hansgrohe - vue 3', 2),
  ('00006430', 1097, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique mitigeur bidet Talis S2 3224000 Hansgrohe', 0),
  ('00006430', 1098, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 'Notice de montage mitigeur bidet Talis S2 3224000 Hansgrohe', 1);

DELETE FROM "product_media" "product_media"
USING "products" "product", "_hansgrohe_products" "seed"
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
FROM "_hansgrohe_product_media" "media_seed"
JOIN "products" "product"
  ON "product"."sku" = "media_seed"."sku"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_hansgrohe_product_certificates" (
  "sku" TEXT NOT NULL,
  "certificate_slug" TEXT NOT NULL,
  PRIMARY KEY ("sku", "certificate_slug")
);

INSERT INTO "_hansgrohe_product_certificates" ("sku", "certificate_slug")
VALUES
  ('00006421', 'acs'),
  ('00006421', 'fdes'),
  ('00006422', 'acs'),
  ('00006422', 'fdes'),
  ('00006423', 'acs'),
  ('00006423', 'fdes'),
  ('00006430', 'acs');

DELETE FROM "product_certificate_associations" "association"
USING "products" "product", "product_certificates" "certificate", "_hansgrohe_products" "seed"
WHERE "association"."product_id" = "product"."id"
  AND "association"."certificate_id" = "certificate"."id"
  AND "product"."sku" = "seed"."sku"
  AND "certificate"."slug" IN ('acs', 'fdes');

INSERT INTO "product_certificate_associations" ("product_id", "certificate_id")
SELECT
  "product"."id",
  "certificate"."id"
FROM "_hansgrohe_product_certificates" "certificate_seed"
JOIN "products" "product"
  ON "product"."sku" = "certificate_seed"."sku"
JOIN "product_certificates" "certificate"
  ON "certificate"."slug" = "certificate_seed"."certificate_slug"
ON CONFLICT ("product_id", "certificate_id") DO NOTHING;

DROP TABLE "_hansgrohe_product_certificates";
DROP TABLE "_hansgrohe_product_media";
DROP TABLE "_hansgrohe_products";
DROP TABLE "_hansgrohe_expected_media";
DROP TABLE "_hansgrohe_type_attributes";
DROP TABLE "_hansgrohe_attribute_definitions";
DROP TABLE "_hansgrohe_attribute_groups";
