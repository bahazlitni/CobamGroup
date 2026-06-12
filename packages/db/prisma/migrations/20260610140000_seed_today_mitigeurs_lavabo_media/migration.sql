-- Seed the ZIP-backed MIT.LAV* lavabo mixer products from the current Today package.
-- Products not represented in Today.zip are intentionally ignored.
-- Folders marked [FAMILLE] are seeded as product families with variant members.
-- Color/Finish rule: these rows store finish only; no color attributes are inserted.

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES
  ('CHROME', 'Chrome', '#C8CDD0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('NOIR_MAT', 'Noir mat', '#1F2426', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('DORE_BROSSE', 'Dore brosse', '#C8A24A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "color" = EXCLUDED."color",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_type_templates" (
  "group_id", "name", "display_name", "slug", "hint", "description", "title_seo",
  "description_seo", "sort_order", "has_color", "has_finish", "preset_tags",
  "preset_stock_unit", "preset_vat_rate", "preset_guarantee_months", "created_at", "updated_at"
)
SELECT
  "group"."id",
  'Mitigeur lavabo / vasque',
  'Mitigeur lavabo / vasque',
  'mitigeur-lavabo-vasque',
  'Mitigeur mono-commande pour lavabo, vasque ou plan vasque.',
  'Selection de mitigeurs de lavabo et de vasque pour salles de bain, en pose sur appareil, bec haut ou pose encastree murale.',
  'Mitigeur lavabo / vasque',
  'Mitigeurs lavabo et vasque pour robinetterie de salle de bain chez COBAM GROUP en Tunisie.',
  320,
  false,
  true,
  'mitigeur lavabo vasque robinetterie salle-de-bain',
  'PIECE'::"StockUnit",
  19.000,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "product_type_groups" "group"
WHERE "group"."slug" = 'robinetterie'
ON CONFLICT ("slug") DO UPDATE SET
  "group_id" = EXCLUDED."group_id",
  "name" = EXCLUDED."name",
  "display_name" = EXCLUDED."display_name",
  "hint" = EXCLUDED."hint",
  "description" = EXCLUDED."description",
  "title_seo" = EXCLUDED."title_seo",
  "description_seo" = EXCLUDED."description_seo",
  "sort_order" = EXCLUDED."sort_order",
  "has_color" = false,
  "has_finish" = true,
  "preset_tags" = EXCLUDED."preset_tags",
  "preset_stock_unit" = EXCLUDED."preset_stock_unit",
  "preset_vat_rate" = EXCLUDED."preset_vat_rate",
  "preset_guarantee_months" = EXCLUDED."preset_guarantee_months",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_type_subcategory_presets" ("product_type_id", "subcategory_id")
SELECT
  "template"."id",
  "subcategory"."id"
FROM "product_type_templates" "template"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'robinetterie'
WHERE "template"."slug" = 'mitigeur-lavabo-vasque'
ON CONFLICT ("product_type_id", "subcategory_id") DO NOTHING;

CREATE TEMP TABLE "_today_lav_attribute_groups" (
  "slug" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_today_lav_attribute_groups" ("slug", "name", "sort_order")
VALUES
  ('filtres-principaux', 'Filtres principaux', 0),
  ('caracteristiques', 'Caracteristiques', 10);

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
FROM "_today_lav_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = 'mitigeur-lavabo-vasque'
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_lav_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_today_lav_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options"
)
VALUES
  ('finish', 'Finition', NULL, 'FINISH'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('manufacturer_ref', 'Reference fabricant', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('product_line', 'Gamme', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('mixer_usage', 'Usage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Lavabo', 'Vasque']::TEXT[]),
  ('installation_type', 'Pose', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['A encastrer', 'A poser', 'Mural encastre']::TEXT[]),
  ('handle_type', 'Commande robinet', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Mitigeur mono-commande']::TEXT[]),
  ('spout_type', 'Type de bec', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Bec haut', 'Bec long', 'Bec standard', 'Mural 2 trous', 'Partie apparente murale']::TEXT[]),
  ('coolstart', 'CoolStart', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('visible_part_only', 'Partie apparente seule', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]);

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
FROM "_today_lav_attribute_definitions"
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

DELETE FROM "product_type_attributes" "template_attribute"
USING "product_type_templates" "template", "product_attribute_definitions" "definition"
WHERE "template_attribute"."product_type_id" = "template"."id"
  AND "template_attribute"."attribute_definition_id" = "definition"."id"
  AND "template"."slug" = 'mitigeur-lavabo-vasque'
  AND "definition"."key" = 'color';

CREATE TEMP TABLE "_today_lav_type_attributes" (
  "key" TEXT PRIMARY KEY,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_today_lav_type_attributes" (
  "key", "group_slug", "is_filterable", "sort_order"
)
VALUES
  ('finish', 'filtres-principaux', true, 0),
  ('installation_type', 'filtres-principaux', true, 10),
  ('spout_type', 'filtres-principaux', true, 20),
  ('mixer_usage', 'filtres-principaux', true, 30),
  ('product_line', 'caracteristiques', true, 40),
  ('manufacturer_ref', 'caracteristiques', true, 50),
  ('handle_type', 'caracteristiques', false, 60),
  ('coolstart', 'caracteristiques', true, 70),
  ('visible_part_only', 'caracteristiques', false, 80);

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
FROM "_today_lav_type_attributes" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = 'mitigeur-lavabo-vasque'
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

UPDATE "product_type_templates" "template"
SET
  "has_color" = false,
  "has_finish" = true,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "template"."slug" = 'mitigeur-lavabo-vasque';

CREATE TEMP TABLE "_today_lav_products" (
  "sku" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "brand_slug" TEXT NOT NULL,
  "product_type_slug" TEXT NOT NULL,
  "family_slug" TEXT,
  "family_sort_order" INTEGER,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "finish_value" TEXT NOT NULL,
  "manufacturer_ref" TEXT,
  "product_line" TEXT,
  "mixer_usage" TEXT NOT NULL,
  "installation_type" TEXT NOT NULL,
  "handle_type" TEXT NOT NULL,
  "spout_type" TEXT NOT NULL,
  "coolstart" BOOLEAN,
  "visible_part_only" BOOLEAN
);

INSERT INTO "_today_lav_products" (
  "sku", "slug", "brand_slug", "product_type_slug", "family_slug", "family_sort_order",
  "name", "display_name", "price_ttc", "stock_available", "finish_value",
  "manufacturer_ref", "product_line", "mixer_usage", "installation_type",
  "handle_type", "spout_type", "coolstart", "visible_part_only"
)
VALUES
  ('00221795', 'mitigeur-lavabo-eco-coolstart-21810401-aj0301-tres-plus-00221795', 'tres', 'mitigeur-lavabo-vasque', NULL, NULL, 'MIT.LAV ECO COOLSTART 21810401 (AJ0301) TRES PLUS', 'Mitigeur lavabo Eco CoolStart 21810401 chrome TRES', 305.882, 3.000, 'Chrome', '21810401 / AJ0301', 'Eco CoolStart', 'Lavabo', 'A poser', 'Mitigeur mono-commande', 'Bec standard', true, NULL),
  ('00221528', 'mitigeur-lavabo-mural-orp-chr-10233nkpm-partie-apparente-jaquar-00221528', 'jaquar', 'mitigeur-lavabo-vasque', NULL, NULL, 'MIT.LAV ENCA MURAL ORP-CHR-10233NKPM PARTIE APPARENTE JAQUAR', 'Mitigeur lavabo mural ORP-CHR-10233NKPM chrome Jaquar', 295.020, 2.000, 'Chrome', 'ORP-CHR-10233NKPM', 'ORP', 'Lavabo', 'Mural encastre', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00252454', 'mitigeur-lavabo-mural-laguna-lag-blm-91231nk-add-ald-chr-jaquar-00252454', 'jaquar', 'mitigeur-lavabo-vasque', 'jaquar-mitigeur-lavabo-mural-91231nk', 1, 'MIT.LAV ENCA MURAL PARTI APPA LAGUNA LAG-BLM-91231NK ADD ALD-CHR JAQUAR', 'Mitigeur lavabo mural Laguna LAG-BLM-91231NK noir mat Jaquar', 524.475, 1.000, 'Noir mat', 'LAG-BLM-91231NK / ALD-CHR', 'Laguna', 'Lavabo', 'Mural encastre', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00252461', 'mitigeur-lavabo-encastre-2-trous-laguna-lag-chr-91231nk-jaquar-00252461', 'jaquar', 'mitigeur-lavabo-vasque', 'jaquar-mitigeur-lavabo-mural-91231nk', 0, 'MIT.LAV ENCA 2 TROUS LAG-CHR-91231NK JAQUAR', 'Mitigeur lavabo encastre 2 trous Laguna LAG-CHR-91231NK chrome Jaquar', 396.790, 1.000, 'Chrome', 'LAG-CHR-91231NK', 'Laguna', 'Lavabo', 'Mural encastre', 'Mitigeur mono-commande', 'Mural 2 trous', NULL, NULL),
  ('00252362', 'mitigeur-lavabo-mural-gold-opp-gbp-15233nkpm-jaquar-00252362', 'jaquar', 'mitigeur-lavabo-vasque', NULL, NULL, 'MIT.LAV ENCAS MURAL GOLD PARTIE APPARENTE OPP-GBP-15233NKPM JAQUAR', 'Mitigeur lavabo mural OPP-GBP-15233NKPM dore brosse Jaquar', 560.896, 1.000, 'Dore brosse', 'OPP-GBP-15233NKPM', 'OPP', 'Lavabo', 'Mural encastre', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00206679', 'mitigeur-lavabo-mural-ali-chr-85233nk-jaquar-00206679', 'jaquar', 'mitigeur-lavabo-vasque', NULL, NULL, 'MIT.LAV ENCAS MURAL PARTIE APPARENTE ALI-CHR-85233NK JAQUAR', 'Mitigeur lavabo mural ALI-CHR-85233NK chrome Jaquar', 331.440, 3.000, 'Chrome', 'ALI-CHR-85233NK', 'ALI', 'Lavabo', 'Mural encastre', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00252355', 'mitigeur-lavabo-mural-aria-ari-chr-39233nk-jaquar-00252355', 'jaquar', 'mitigeur-lavabo-vasque', NULL, NULL, 'MIT.LAV ENCAS MURAL PARTIE APPARENTE ARIA ARI-CHR-39233NK JAQUAR', 'Mitigeur lavabo mural ARIA ARI-CHR-39233NK chrome Jaquar', 313.227, 1.000, 'Chrome', 'ARI-CHR-39233NK', 'ARIA', 'Lavabo', 'Mural encastre', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00252478', 'mitigeur-lavabo-mural-flp-chr-5233nkpm-jaquar-00252478', 'jaquar', 'mitigeur-lavabo-vasque', NULL, NULL, 'MIT.LAV ENCAS MURAL PARTIE APPARENTE FLP-CHR-5233NKPM JAQUAR', 'Mitigeur lavabo mural FLP-CHR-5233NKPM chrome Jaquar', 303.000, 1.000, 'Chrome', 'FLP-CHR-5233NKPM', 'FLP', 'Lavabo', 'Mural encastre', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00221801', 'mitigeur-lavabo-long-canigo-21820301-aj0211-tres-plus-00221801', 'tres', 'mitigeur-lavabo-vasque', NULL, NULL, 'MIT.LAV LONG CANIGO 21820301 (AJ0211) TRES PLUS', 'Mitigeur lavabo long Canigo 21820301 chrome TRES', 478.823, 3.000, 'Chrome', '21820301 / AJ0211', 'Canigo', 'Lavabo', 'A poser', 'Mitigeur mono-commande', 'Bec long', NULL, NULL),
  ('00202817', 'mitigeur-lavabo-encastre-sfax-sopal-00202817', 'sopal', 'mitigeur-lavabo-vasque', NULL, NULL, 'MIT.LAVABO  ENCASTRE SFAX SOPAL', 'Mitigeur lavabo encastre Sfax chrome Sopal', 459.317, 2.000, 'Chrome', NULL, 'Sfax', 'Lavabo', 'A encastrer', 'Mitigeur mono-commande', 'Bec standard', NULL, NULL),
  ('00208154', 'mitigeur-lavabo-ali-blm-85011b-jaquar-00208154', 'jaquar', 'mitigeur-lavabo-vasque', 'jaquar-mitigeur-lavabo-ali-85011b', 0, 'MIT.LAVABO ALI-BLM-85011B JAQUAR', 'Mitigeur lavabo ALI-BLM-85011B noir mat Jaquar', 557.250, 7.000, 'Noir mat', 'ALI-BLM-85011B', 'ALI', 'Lavabo', 'A poser', 'Mitigeur mono-commande', 'Bec standard', NULL, NULL),
  ('00206723', 'mitigeur-lavabo-ali-chr-85011b-jaquar-00206723', 'jaquar', 'mitigeur-lavabo-vasque', 'jaquar-mitigeur-lavabo-ali-85011b', 1, 'MIT.LAVABO ALI-CHR-85011B JAQUAR', 'Mitigeur lavabo ALI-CHR-85011B chrome Jaquar', 397.000, 3.000, 'Chrome', 'ALI-CHR-85011B', 'ALI', 'Lavabo', 'A poser', 'Mitigeur mono-commande', 'Bec standard', NULL, NULL),
  ('00214827', 'mitigeur-lavabo-alpin-5011404-venisia-00214827', 'venisia', 'mitigeur-lavabo-vasque', NULL, NULL, 'MIT.LAVABO ALPIN 5011404 VENISIA', 'Mitigeur lavabo Alpin 5011404 chrome Venisia', 122.582, 1.000, 'Chrome', '5011404', 'Alpin', 'Lavabo', 'A poser', 'Mitigeur mono-commande', 'Bec standard', NULL, NULL),
  ('00229043', 'mitigeur-lavabo-ari-chr-39001b-jaquar-00229043', 'jaquar', 'mitigeur-lavabo-vasque', NULL, NULL, 'MIT.LAVABO ARI-CHR-39001B JAQUAR', 'Mitigeur lavabo ARI-CHR-39001B chrome Jaquar', 390.606, 5.000, 'Chrome', 'ARI-CHR-39001B', 'ARI', 'Lavabo', 'A poser', 'Mitigeur mono-commande', 'Bec standard', NULL, NULL),
  ('00232685', 'mitigeur-lavabo-bec-haut-ari-chr-39005b-jaquar-00232685', 'jaquar', 'mitigeur-lavabo-vasque', NULL, NULL, 'MIT.LAVABO BEC HAUT ARI-CHR-39005B JAQUAR', 'Mitigeur lavabo bec haut ARI-CHR-39005B chrome Jaquar', 546.330, 3.000, 'Chrome', 'ARI-CHR-39005B', 'ARI', 'Lavabo', 'A poser', 'Mitigeur mono-commande', 'Bec haut', NULL, NULL),
  ('00252430', 'mitigeur-lavabo-bec-haut-laguna-lag-chr-91005b-jaquar-00252430', 'jaquar', 'mitigeur-lavabo-vasque', 'jaquar-mitigeur-lavabo-bec-haut-laguna-91005b', 0, 'MIT.LAVABO BEC HAUT CHROME LAG-CHR-91005B JAQUAR', 'Mitigeur lavabo bec haut Laguna LAG-CHR-91005B chrome Jaquar', 859.556, 1.000, 'Chrome', 'LAG-CHR-91005B', 'Laguna', 'Lavabo', 'A poser', 'Mitigeur mono-commande', 'Bec haut', NULL, NULL),
  ('00252423', 'mitigeur-lavabo-bec-haut-laguna-lag-blm-91005b-jaquar-00252423', 'jaquar', 'mitigeur-lavabo-vasque', 'jaquar-mitigeur-lavabo-bec-haut-laguna-91005b', 1, 'MIT.LAVABO BEC HAUT LAGUNA BLACK LAG-BLM-91005B JAQUAR', 'Mitigeur lavabo bec haut Laguna LAG-BLM-91005B noir mat Jaquar', 1201.921, 1.000, 'Noir mat', 'LAG-BLM-91005B', 'Laguna', 'Lavabo', 'A poser', 'Mitigeur mono-commande', 'Bec haut', NULL, NULL);

CREATE TEMP TABLE "_today_lav_families" (
  "slug" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "subtitle" TEXT,
  "description" TEXT,
  "description_seo" TEXT,
  "main_image_media_id" BIGINT,
  "default_sku" TEXT NOT NULL
);

INSERT INTO "_today_lav_families" (
  "slug", "name", "subtitle", "description", "description_seo", "main_image_media_id", "default_sku"
)
VALUES
  (
    'jaquar-mitigeur-lavabo-mural-91231nk',
    'Mitigeur lavabo mural 91231NK Jaquar',
    'Famille Laguna encastree',
    'Famille de mitigeurs lavabo Jaquar Laguna pour pose murale encastree, avec variante 2 trous chrome et partie apparente noire.',
    'Mitigeurs lavabo muraux Laguna 91231NK Jaquar en variantes chrome et noir mat chez COBAM GROUP.',
    1418,
    '00252461'
  ),
  (
    'jaquar-mitigeur-lavabo-ali-85011b',
    'Mitigeur lavabo ALI 85011B Jaquar',
    'Famille ALI sur plage',
    'Famille de mitigeurs lavabo Jaquar ALI 85011B pour pose sur appareil, en finition noir mat ou chrome.',
    'Mitigeurs lavabo Jaquar ALI 85011B en finitions noir mat et chrome chez COBAM GROUP.',
    1445,
    '00208154'
  ),
  (
    'jaquar-mitigeur-lavabo-bec-haut-laguna-91005b',
    'Mitigeur lavabo bec haut Laguna 91005B Jaquar',
    'Famille Laguna bec haut',
    'Famille de mitigeurs lavabo bec haut Jaquar Laguna 91005B, proposee en finition chrome ou noir mat.',
    'Mitigeurs lavabo bec haut Laguna 91005B Jaquar en finitions chrome et noir mat chez COBAM GROUP.',
    1459,
    '00252430'
  );

CREATE TEMP TABLE "_today_lav_product_media_entries" (
  "sku" TEXT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "role" "ProductMediaRole" NOT NULL,
  "name" TEXT,
  "sort_order" INTEGER NOT NULL,
  "expected_kind" "MediaKind" NOT NULL
);

INSERT INTO "_today_lav_product_media_entries" (
  "sku", "media_id", "role", "name", "sort_order", "expected_kind"
)
VALUES
  ('00221795', 1415, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00221795', 1416, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00221795', 1417, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00221795', 1465, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00221795', 1466, 'TECHNICAL'::"ProductMediaRole", 'Manuel d''installation', 1, 'DOCUMENT'::"MediaKind"),
  ('00221795', 1495, 'CERTIFICATE'::"ProductMediaRole", 'Certificat de conformite', 0, 'DOCUMENT'::"MediaKind"),

  ('00252461', 1418, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00252461', 1419, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00252461', 1420, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00252461', 1469, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00252461', 1470, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00221528', 1421, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00221528', 1422, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00221528', 1423, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00221528', 1467, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00221528', 1468, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00252454', 1424, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00252454', 1425, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00252454', 1426, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00252454', 1471, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00252454', 1472, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00252362', 1427, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00252362', 1428, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00252362', 1429, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00252362', 1473, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00252362', 1474, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00206679', 1430, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00206679', 1431, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00206679', 1432, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00206679', 1475, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00206679', 1476, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00252355', 1433, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00252355', 1434, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00252355', 1435, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00252355', 1477, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00252355', 1478, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00252478', 1436, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00252478', 1437, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00252478', 1438, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00252478', 1479, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00252478', 1480, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00221801', 1439, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00221801', 1440, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00221801', 1441, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00221801', 1481, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00221801', 1482, 'TECHNICAL'::"ProductMediaRole", 'Manuel d''installation', 1, 'DOCUMENT'::"MediaKind"),
  ('00221801', 1496, 'CERTIFICATE'::"ProductMediaRole", 'Certificat de conformite', 0, 'DOCUMENT'::"MediaKind"),

  ('00202817', 1442, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00202817', 1443, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00202817', 1444, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),

  ('00208154', 1445, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00208154', 1446, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00208154', 1447, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00208154', 1485, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00208154', 1486, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00206723', 1448, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00206723', 1449, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00206723', 1450, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00206723', 1483, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00206723', 1484, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00214827', 1451, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00214827', 1452, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),

  ('00229043', 1453, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00229043', 1454, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00229043', 1455, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00229043', 1487, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00229043', 1488, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00232685', 1456, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00232685', 1457, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00232685', 1458, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00232685', 1493, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00232685', 1494, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00252430', 1459, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00252430', 1460, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00252430', 1461, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00252430', 1491, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00252430', 1492, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),

  ('00252423', 1462, 'GALLERY'::"ProductMediaRole", NULL, 0, 'IMAGE'::"MediaKind"),
  ('00252423', 1463, 'GALLERY'::"ProductMediaRole", NULL, 1, 'IMAGE'::"MediaKind"),
  ('00252423', 1464, 'GALLERY'::"ProductMediaRole", NULL, 2, 'IMAGE'::"MediaKind"),
  ('00252423', 1489, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00252423', 1490, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind");

DO $$
DECLARE
  missing_brands INTEGER;
  missing_product_types INTEGER;
  missing_media INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_brands
  FROM (
    SELECT DISTINCT "brand_slug" FROM "_today_lav_products"
  ) "expected"
  LEFT JOIN "organizations" "brand"
    ON "brand"."slug" = "expected"."brand_slug"
  WHERE "brand"."id" IS NULL;

  IF missing_brands > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today lavabo products: % expected brand row(s) are missing.', missing_brands;
  END IF;

  SELECT COUNT(*)
  INTO missing_product_types
  FROM (
    SELECT DISTINCT "product_type_slug" FROM "_today_lav_products"
  ) "expected"
  LEFT JOIN "product_type_templates" "template"
    ON "template"."slug" = "expected"."product_type_slug"
  WHERE "template"."id" IS NULL;

  IF missing_product_types > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today lavabo products: % expected product type row(s) are missing.', missing_product_types;
  END IF;

  SELECT COUNT(*)
  INTO missing_media
  FROM "_today_lav_product_media_entries" "expected"
  LEFT JOIN "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."kind" = "expected"."expected_kind"
  WHERE "media"."id" IS NULL;

  IF missing_media > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today lavabo media: % expected media row(s) are missing or have the wrong kind.', missing_media;
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
  CASE
    WHEN "seed"."family_slug" IS NULL THEN 'SINGLE'::"ProductKind"
    ELSE 'VARIANT'::"ProductKind"
  END,
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
        'content', jsonb_build_array(
          jsonb_build_object(
            'type', 'text',
            'text',
            'Ce mitigeur lavabo ' || COALESCE("seed"."product_line" || ' ', '') ||
            'propose une robinetterie mono-commande en finition ' || lower("seed"."finish_value") ||
            ' pour les projets de salle de bain.'
          )
        )
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(
          jsonb_build_object(
            'type', 'text',
            'text',
            CASE
              WHEN "seed"."installation_type" = 'Mural encastre' THEN 'La pose murale encastree garde le plan vasque degage et demande de verifier les reservations ainsi que les raccordements avant installation.'
              WHEN "seed"."installation_type" = 'A encastrer' THEN 'La pose encastree permet une integration discrete et doit etre controlee avec la fiche technique avant validation du support.'
              ELSE 'La pose sur appareil convient aux lavabos et plans vasque qui recherchent une utilisation quotidienne simple et accessible.'
            END
          )
        )
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(
          jsonb_build_object(
            'type', 'text',
            'text',
            CASE
              WHEN EXISTS (
                SELECT 1
                FROM "_today_lav_product_media_entries" "media_entry"
                WHERE "media_entry"."sku" = "seed"."sku"
                  AND "media_entry"."role" <> 'GALLERY'::"ProductMediaRole"
              ) THEN 'Les documents joints permettent de verifier dimensions, pose et conformite avant commande.'
              ELSE 'Les visuels associes permettent d''identifier la silhouette, la finition et l''integration du produit dans le projet.'
            END
          )
        )
      )
    )
  ),
  LEFT("seed"."display_name", 60),
  LEFT("seed"."display_name" || ' disponible chez COBAM GROUP en Tunisie pour la robinetterie de salle de bain.', 160),
  regexp_replace(
    lower(
      concat_ws(
        ' ',
        "brand"."name",
        'mitigeur lavabo vasque robinetterie',
        "seed"."product_line",
        "seed"."manufacturer_ref",
        "seed"."finish_value",
        'salle de bain tunisie'
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
FROM "_today_lav_products" "seed"
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

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_today_lav_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'robinetterie'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo",
  "main_image_media_id", "default_product_id", "created_at", "updated_at"
)
SELECT
  "family"."slug",
  "family"."name",
  "family"."subtitle",
  "family"."description",
  LEFT("family"."description_seo", 160),
  "family"."main_image_media_id",
  "default_product"."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_lav_families" "family"
LEFT JOIN "products" "default_product"
  ON "default_product"."sku" = "family"."default_sku"
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "main_image_media_id" = EXCLUDED."main_image_media_id",
  "default_product_id" = EXCLUDED."default_product_id",
  "updated_at" = CURRENT_TIMESTAMP;

DELETE FROM "product_family_members" "member"
USING "products" "product", "_today_lav_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "seed"."family_slug" IS NULL;

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  COALESCE("seed"."family_sort_order", 0)
FROM "_today_lav_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = "seed"."family_slug"
WHERE "seed"."family_slug" IS NOT NULL
ON CONFLICT ("product_id") DO UPDATE SET
  "family_id" = EXCLUDED."family_id",
  "sort_order" = EXCLUDED."sort_order";

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_today_lav_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    SELECT "key" FROM "_today_lav_attribute_definitions"
    UNION ALL
    SELECT 'color'
  );

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "product"."product_type_id",
    "attribute_seed"."name",
    "attribute_seed"."value"
  FROM "_today_lav_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL (
    VALUES
      ('finish', "seed"."finish_value"),
      ('manufacturer_ref', "seed"."manufacturer_ref"),
      ('product_line', "seed"."product_line"),
      ('mixer_usage', "seed"."mixer_usage"),
      ('installation_type', "seed"."installation_type"),
      ('handle_type', "seed"."handle_type"),
      ('spout_type', "seed"."spout_type"),
      ('coolstart', CASE WHEN "seed"."coolstart" IS NULL THEN NULL ELSE "seed"."coolstart"::TEXT END),
      ('visible_part_only', CASE WHEN "seed"."visible_part_only" IS NULL THEN NULL ELSE "seed"."visible_part_only"::TEXT END)
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
USING "products" "product", "_today_lav_products" "seed"
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
      ELSE COALESCE("entry"."name", "product"."display_name")
    END,
    255
  ),
  "entry"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_lav_product_media_entries" "entry"
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
  seeded_media_count INTEGER;
  expected_media_count INTEGER;
  seeded_family_member_count INTEGER;
  expected_family_member_count INTEGER;
  color_finish_conflicts INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO seeded_product_count
  FROM "_today_lav_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku";

  IF seeded_product_count <> 17 THEN
    RAISE EXCEPTION 'Today lavabo seed expected 17 products but found %.', seeded_product_count;
  END IF;

  SELECT COUNT(*)
  INTO expected_media_count
  FROM "_today_lav_product_media_entries";

  SELECT COUNT(*)
  INTO seeded_media_count
  FROM "_today_lav_product_media_entries" "entry"
  JOIN "products" "product"
    ON "product"."sku" = "entry"."sku"
  JOIN "product_media" "product_media"
    ON "product_media"."product_id" = "product"."id"
    AND "product_media"."media_id" = "entry"."media_id";

  IF seeded_media_count <> expected_media_count THEN
    RAISE EXCEPTION 'Today lavabo seed expected % product media rows but found %.', expected_media_count, seeded_media_count;
  END IF;

  SELECT COUNT(*)
  INTO expected_family_member_count
  FROM "_today_lav_products"
  WHERE "family_slug" IS NOT NULL;

  SELECT COUNT(*)
  INTO seeded_family_member_count
  FROM "_today_lav_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_family_members" "member"
    ON "member"."product_id" = "product"."id"
  JOIN "product_families" "family"
    ON "family"."id" = "member"."family_id"
    AND "family"."slug" = "seed"."family_slug"
  WHERE "seed"."family_slug" IS NOT NULL;

  IF seeded_family_member_count <> expected_family_member_count THEN
    RAISE EXCEPTION 'Today lavabo seed expected % family member rows but found %.', expected_family_member_count, seeded_family_member_count;
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
    JOIN "_today_lav_products" "seed"
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
    RAISE EXCEPTION 'Today lavabo seed produced % product(s) with both Color and Finish attributes.', color_finish_conflicts;
  END IF;
END $$;
