-- Seed the ZIP-backed MIT lavabo, toilette and vasque products from the current Today package.
-- Products listed in the additional information but absent from Today.zip are intentionally ignored.
-- The ZIP folder "MIT.VASQUE LONGUE JAQUAR [FAMILLE]" is seeded as a product family.
-- Color/Finish rule: these rows store finish only; no color attributes are inserted.

DO $$
DECLARE
  missing_required_finishes INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_required_finishes
  FROM (
    VALUES ('CHROME'), ('MATT_BLACK'), ('DORE_BROSSE')
  ) AS "expected"("key")
  LEFT JOIN "product_finishes" "finish"
    ON "finish"."key" = "expected"."key"
  WHERE "finish"."id" IS NULL;

  IF missing_required_finishes > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today lavabo suite: % required existing finish row(s) are missing.', missing_required_finishes;
  END IF;
END $$;

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES
  ('SILVER', 'Silver', '#BFC3C7', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "color" = EXCLUDED."color",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_mit_lav2_product_types" (
  "slug" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "hint" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "title_seo" TEXT NOT NULL,
  "description_seo" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  "preset_tags" TEXT NOT NULL
);

INSERT INTO "_today_mit_lav2_product_types" (
  "slug", "name", "display_name", "hint", "description", "title_seo",
  "description_seo", "sort_order", "preset_tags"
)
VALUES
  (
    'mitigeur-lavabo-vasque',
    'Mitigeur lavabo / vasque',
    'Mitigeur lavabo / vasque',
    'Mitigeur mono-commande pour lavabo, vasque ou plan vasque.',
    'Sélection de mitigeurs de lavabo et de vasque pour salles de bain, en pose sur appareil, bec haut ou pose encastrée murale.',
    'Mitigeur lavabo / vasque',
    'Mitigeurs lavabo et vasque pour robinetterie de salle de bain chez COBAM GROUP en Tunisie.',
    320,
    'mitigeur lavabo vasque robinetterie salle-de-bain'
  ),
  (
    'mitigeur-toilette',
    'Mitigeur toilette',
    'Mitigeur toilette',
    'Mitigeur mono-commande pour point d''eau toilette.',
    'Sélection de mitigeurs toilette pour lave-mains, points d''eau sanitaires et espaces WC.',
    'Mitigeur toilette',
    'Mitigeurs toilette pour robinetterie sanitaire chez COBAM GROUP en Tunisie.',
    330,
    'mitigeur toilette lave-mains robinetterie sanitaire'
  );

INSERT INTO "product_type_templates" (
  "group_id", "name", "display_name", "slug", "hint", "description", "title_seo",
  "description_seo", "sort_order", "has_color", "has_finish", "preset_tags",
  "preset_stock_unit", "preset_vat_rate", "preset_guarantee_months", "created_at", "updated_at"
)
SELECT
  "group"."id",
  "seed"."name",
  "seed"."display_name",
  "seed"."slug",
  "seed"."hint",
  "seed"."description",
  "seed"."title_seo",
  LEFT("seed"."description_seo", 160),
  "seed"."sort_order",
  false,
  true,
  "seed"."preset_tags",
  'PIECE'::"StockUnit",
  19.000,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_mit_lav2_product_types" "seed"
JOIN "product_type_groups" "group"
  ON "group"."slug" = 'robinetterie'
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
FROM "_today_mit_lav2_product_types" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."slug"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'robinetterie'
ON CONFLICT ("product_type_id", "subcategory_id") DO NOTHING;

CREATE TEMP TABLE "_today_mit_lav2_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_today_mit_lav2_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
SELECT "slug", 'filtres-principaux', 'Filtres principaux', 0
FROM "_today_mit_lav2_product_types"
UNION ALL
SELECT "slug", 'caracteristiques', 'Caractéristiques', 10
FROM "_today_mit_lav2_product_types";

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
FROM "_today_mit_lav2_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_mit_lav2_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_today_mit_lav2_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options"
)
VALUES
  ('finish', 'Finition', NULL, 'FINISH'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('manufacturer_ref', 'Référence fabricant', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('product_line', 'Gamme', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('mixer_usage', 'Usage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Lavabo', 'Toilette', 'Vasque']::TEXT[]),
  ('installation_type', 'Pose', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['À encastrer', 'À poser', 'Mural encastré']::TEXT[]),
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
FROM "_today_mit_lav2_attribute_definitions"
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
  AND "template"."slug" IN (SELECT "slug" FROM "_today_mit_lav2_product_types")
  AND "definition"."key" = 'color';

CREATE TEMP TABLE "_today_mit_lav2_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_today_mit_lav2_type_attributes" (
  "product_type_slug", "key", "group_slug", "is_filterable", "sort_order"
)
SELECT "slug", 'finish', 'filtres-principaux', true, 0
FROM "_today_mit_lav2_product_types"
UNION ALL
SELECT "slug", 'installation_type', 'filtres-principaux', true, 10
FROM "_today_mit_lav2_product_types"
UNION ALL
SELECT "slug", 'spout_type', 'filtres-principaux', true, 20
FROM "_today_mit_lav2_product_types"
UNION ALL
SELECT "slug", 'mixer_usage', 'filtres-principaux', true, 30
FROM "_today_mit_lav2_product_types"
UNION ALL
SELECT "slug", 'product_line', 'caracteristiques', true, 40
FROM "_today_mit_lav2_product_types"
UNION ALL
SELECT "slug", 'manufacturer_ref', 'caracteristiques', true, 50
FROM "_today_mit_lav2_product_types"
UNION ALL
SELECT "slug", 'handle_type', 'caracteristiques', false, 60
FROM "_today_mit_lav2_product_types"
UNION ALL
SELECT "slug", 'coolstart', 'caracteristiques', true, 70
FROM "_today_mit_lav2_product_types"
UNION ALL
SELECT "slug", 'visible_part_only', 'caracteristiques', false, 80
FROM "_today_mit_lav2_product_types";

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
FROM "_today_mit_lav2_type_attributes" "seed"
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

UPDATE "product_type_templates" "template"
SET
  "has_color" = false,
  "has_finish" = true,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "template"."slug" IN (SELECT "slug" FROM "_today_mit_lav2_product_types");

CREATE TEMP TABLE "_today_mit_lav2_products" AS
SELECT *
FROM jsonb_to_recordset($products$
[
  {"sku":"00232746","slug":"mitigeur-lavabo-bec-haut-orp-chr-10005bpm-jaquar-00232746","brand_slug":"jaquar","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO BEC HAUT ORP-CHR-10005BPM JAQUAR","display_name":"Mitigeur lavabo bec haut ORP-CHR-10005BPM chromé Jaquar","price_ttc":509.910,"stock_available":2,"finish_value":"Chrome","manufacturer_ref":"ORP-CHR-10005BPM","product_line":"ORP","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec haut","coolstart":null,"visible_part_only":null,"gallery":[1498,1499,1500],"technical":[{"id":1610,"name":"Fiche technique"},{"id":1611,"name":"Guide d'installation"}],"certificates":[]},
  {"sku":"00252409","slug":"mitigeur-lavabo-bec-haut-florentine-prime-flp-chr-5005bpm-jaquar-00252409","brand_slug":"jaquar","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO BEC HAUTFLORENTINE PRIME FLP-CHR-5005BPM JAQUAR","display_name":"Mitigeur lavabo bec haut Florentine Prime FLP-CHR-5005BPM chromé Jaquar","price_ttc":490.643,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":"FLP-CHR-5005BPM","product_line":"Florentine Prime","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec haut","coolstart":null,"visible_part_only":null,"gallery":[1501,1502,1503],"technical":[{"id":1612,"name":"Fiche technique"},{"id":1613,"name":"Guide d'installation"}],"certificates":[]},
  {"sku":"00252447","slug":"mitigeur-lavabo-bec-rallonge-laguna-lag-chr-91023b-jaquar-00252447","brand_slug":"jaquar","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO BEC RALLONG LAGUNA LAG-CHR-91023B JAQUAR","display_name":"Mitigeur lavabo bec rallongé Laguna LAG-CHR-91023B chromé Jaquar","price_ttc":688.373,"stock_available":3,"finish_value":"Chrome","manufacturer_ref":"LAG-CHR-91023B","product_line":"Laguna","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec long","coolstart":null,"visible_part_only":null,"gallery":[1504,1505,1506],"technical":[{"id":1614,"name":"Fiche technique"},{"id":1615,"name":"Guide d'installation"}],"certificates":[]},
  {"sku":"00002489","slug":"mitigeur-lavabo-bizerte-sopal-00002489","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO BIZERTE SOPAL","display_name":"Mitigeur lavabo Bizerte chromé Sopal","price_ttc":294.118,"stock_available":6,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Bizerte","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1507,1508,1509],"technical":[{"id":1616,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"SOP19MILJER","slug":"mitigeur-lavabo-djerba-sopal-sop19miljer","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO DJERBA SOPAL","display_name":"Mitigeur lavabo Djerba chromé Sopal","price_ttc":197.648,"stock_available":7,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Djerba","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1510,1511,1512],"technical":[{"id":1617,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00006556","slug":"mitigeur-lavabo-douz-sopal-00006556","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO DOUZ SOPAL","display_name":"Mitigeur lavabo Douz chromé Sopal","price_ttc":241.177,"stock_available":5,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Douz","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1513,1514,1515],"technical":[{"id":1618,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00250924","slug":"mitigeur-lavabo-el-jem-sopal-00250924","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO ELJEM SOPAL","display_name":"Mitigeur lavabo El Jem chromé Sopal","price_ttc":503.530,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"El Jem","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1516,1517,1518],"technical":[{"id":1619,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00208895","slug":"mitigeur-lavabo-encastre-mural-ali-blm-85233nk-sans-corps-jaquar-00208895","brand_slug":"jaquar","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO ENCAS MURAL SANS CORPS ALI-BLM-85233NK JAQUAR","display_name":"Mitigeur lavabo encastré mural ALI-BLM-85233NK sans corps noir mat Jaquar","price_ttc":506.259,"stock_available":4,"finish_value":"Noir mat","manufacturer_ref":"ALI-BLM-85233NK","product_line":"ALI","mixer_usage":"Lavabo","installation_type":"Mural encastré","handle_type":"Mitigeur mono-commande","spout_type":"Partie apparente murale","coolstart":null,"visible_part_only":true,"gallery":[1519,1520,1521],"technical":[{"id":1620,"name":"Fiche technique"},{"id":1621,"name":"Guide d'installation"}],"certificates":[]},
  {"sku":"00219150","slug":"mitigeur-lavabo-essence-23462001-grohe-00219150","brand_slug":"grohe","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO ESSEN NV23462001 GROHE","display_name":"Mitigeur lavabo Essence 23462001 chromé Grohe","price_ttc":694.117,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":"23462001","product_line":"Essence","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1522,1523,1524],"technical":[{"id":1622,"name":"Fiche technique"},{"id":1623,"name":"Instructions d'entretien"},{"id":1624,"name":"Notice d'installation [1]"},{"id":1625,"name":"Notice d'installation [2]"},{"id":1626,"name":"Notice d'installation [3]"},{"id":1627,"name":"Notice d'installation [4]"},{"id":1628,"name":"Notice d'installation [5]"}],"certificates":[]},
  {"sku":"00219167","slug":"mitigeur-lavabo-eurocube-23127000-grohe-00219167","brand_slug":"grohe","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO EUROCUBE 23127000 GROHE","display_name":"Mitigeur lavabo Eurocube 23127000 chromé Grohe","price_ttc":799.900,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":"23127000","product_line":"Eurocube","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1525,1526,1527],"technical":[{"id":1629,"name":"Fiche technique"},{"id":1630,"name":"Instructions d'entretien"},{"id":1631,"name":"Notice d'installation [1]"},{"id":1632,"name":"Notice d'installation [2]"},{"id":1633,"name":"Notice d'installation [3]"}],"certificates":[]},
  {"sku":"00219143","slug":"mitigeur-lavabo-eurosmart-nv2-grohe-00219143","brand_slug":"grohe","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO EUROSMART NV2 GROHE","display_name":"Mitigeur lavabo Eurosmart NV2 chromé Grohe","price_ttc":395.000,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":"NV2","product_line":"Eurosmart","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1528,1529,1530],"technical":[{"id":1634,"name":"Conseils d'entretien"},{"id":1635,"name":"Fiche technique"},{"id":1636,"name":"Notice d'installation [1]"},{"id":1637,"name":"Notice d'installation [2]"}],"certificates":[]},
  {"sku":"00002495","slug":"mitigeur-lavabo-eurostyle-chrome-grohe-ancien-stock-00002495","brand_slug":"grohe","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO EUROSTYLE CHR GROHE(ANCIEN STK)","display_name":"Mitigeur lavabo Eurostyle chromé Grohe","price_ttc":164.140,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Eurostyle","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1531,1532,1533],"technical":[{"id":1638,"name":"Conseils d'entretien"},{"id":1639,"name":"Fiche technique"},{"id":1640,"name":"Notice d'installation [1]"},{"id":1641,"name":"Notice d'installation [2]"},{"id":1642,"name":"Notice d'installation [3]"}],"certificates":[]},
  {"sku":"00252393","slug":"mitigeur-lavabo-florentine-prime-flp-chr-5001bpm-jaquar-00252393","brand_slug":"jaquar","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO FLORENTINE PRIME FLP-CHR-5001BPM JAQUAR","display_name":"Mitigeur lavabo Florentine Prime FLP-CHR-5001BPM chromé Jaquar","price_ttc":327.250,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":"FLP-CHR-5001BPM","product_line":"Florentine Prime","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1534,1535,1536],"technical":[{"id":1643,"name":"Fiche technique"},{"id":1644,"name":"Guide d'installation"}],"certificates":[]},
  {"sku":"00219747","slug":"mitigeur-lavabo-kapadokya-5010904-noir-mat-venisia-00219747","brand_slug":"venisia","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO KAPADOKYA NOIR 5010904 VENISIA","display_name":"Mitigeur lavabo Kapadokya 5010904 noir mat Venisia","price_ttc":418.000,"stock_available":3,"finish_value":"Noir mat","manufacturer_ref":"5010904","product_line":"Kapadokya","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1537,1538],"technical":[],"certificates":[]},
  {"sku":"00002499","slug":"mitigeur-lavabo-kerkennah-sopal-00002499","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO KERKENNAH SOPAL","display_name":"Mitigeur lavabo Kerkennah chromé Sopal","price_ttc":155.295,"stock_available":5,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Kerkennah","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1539,1540,1541],"technical":[{"id":1645,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00252348","slug":"mitigeur-lavabo-laguna-black-lag-blm-91023b-jaquar-00252348","brand_slug":"jaquar","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO LAGUNA BLACK LAG-BLM-91023B JAQUAR","display_name":"Mitigeur lavabo Laguna LAG-BLM-91023B noir mat Jaquar","price_ttc":1019.711,"stock_available":1,"finish_value":"Noir mat","manufacturer_ref":"LAG-BLM-91023B","product_line":"Laguna","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec long","coolstart":null,"visible_part_only":null,"gallery":[1542,1543,1544],"technical":[{"id":1646,"name":"Fiche technique"},{"id":1647,"name":"Guide d'installation"}],"certificates":[]},
  {"sku":"00199681","slug":"mitigeur-lavabo-long-douz-06d3a04-1-sopal-00199681","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO LONG DOUZ SOPAL (06D3A04-1)","display_name":"Mitigeur lavabo long Douz 06D3A04-1 chromé Sopal","price_ttc":243.380,"stock_available":2,"finish_value":"Chrome","manufacturer_ref":"06D3A04-1","product_line":"Douz","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec long","coolstart":null,"visible_part_only":null,"gallery":[1545,1546,1547],"technical":[{"id":1648,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00192729","slug":"mitigeur-lavabo-nabeul-sopal-00192729","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO NABEUL SOPAL","display_name":"Mitigeur lavabo Nabeul chromé Sopal","price_ttc":286.790,"stock_available":3,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Nabeul","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1548,1549,1550],"technical":[{"id":1649,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00252379","slug":"mitigeur-lavabo-opal-gold-opp-gbp-15011bpm-jaquar-00252379","brand_slug":"jaquar","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO OPAL GOLD OPP-GBP-15011BPM JAQUAR","display_name":"Mitigeur lavabo Opal Gold OPP-GBP-15011BPM doré brossé Jaquar","price_ttc":775.612,"stock_available":1,"finish_value":"Doré brossé","manufacturer_ref":"OPP-GBP-15011BPM","product_line":"OPP","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1551,1552,1553],"technical":[{"id":1650,"name":"Fiche technique"},{"id":1651,"name":"Guide d'installation"}],"certificates":[]},
  {"sku":"00232739","slug":"mitigeur-lavabo-orp-chr-10011bpm-jaquar-00232739","brand_slug":"jaquar","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO ORP-CHR-10011BPM JAQUAR","display_name":"Mitigeur lavabo ORP-CHR-10011BPM chromé Jaquar","price_ttc":378.790,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":"ORP-CHR-10011BPM","product_line":"ORP","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1554,1555,1556],"technical":[{"id":1652,"name":"Fiche technique"},{"id":1653,"name":"Guide d'installation"}],"certificates":[]},
  {"sku":"00182010","slug":"mitigeur-lavabo-sfax-sopal-00182010","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO SFAX SOPAL","display_name":"Mitigeur lavabo Sfax chromé Sopal","price_ttc":308.600,"stock_available":9,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Sfax","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1557,1558,1559],"technical":[{"id":1654,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00002501","slug":"mitigeur-lavabo-sousse-sopal-00002501","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO SOUSSE SOPAL","display_name":"Mitigeur lavabo Sousse chromé Sopal","price_ttc":271.310,"stock_available":2,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Sousse","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1560,1561,1562],"technical":[{"id":1655,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00002504","slug":"mitigeur-lavabo-zarzis-sopal-00002504","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.LAVABO ZARZIS SOPAL","display_name":"Mitigeur lavabo Zarzis chromé Sopal","price_ttc":360.600,"stock_available":5,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Zarzis","mixer_usage":"Lavabo","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1563,1564,1565],"technical":[],"certificates":[]},
  {"sku":"00214834","slug":"mitigeur-toilette-alpin-5011415-venisia-00214834","brand_slug":"venisia","product_type_slug":"mitigeur-toilette","family_slug":null,"family_sort_order":null,"name":"MIT.TOILETTE ALPIN 5011415 VENISIA","display_name":"Mitigeur toilette Alpin 5011415 chromé Venisia","price_ttc":146.020,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":"5011415","product_line":"Alpin","mixer_usage":"Toilette","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1566,1567],"technical":[],"certificates":[]},
  {"sku":"SOP19MITJER","slug":"mitigeur-toilette-djerba-sopal-sop19mitjer","brand_slug":"sopal","product_type_slug":"mitigeur-toilette","family_slug":null,"family_sort_order":null,"name":"MIT.TOILETTE DJERBA SOPAL","display_name":"Mitigeur toilette Djerba chromé Sopal","price_ttc":168.945,"stock_available":8,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Djerba","mixer_usage":"Toilette","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1568,1569,1570],"technical":[{"id":1656,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00006563","slug":"mitigeur-toilette-douz-sopal-00006563","brand_slug":"sopal","product_type_slug":"mitigeur-toilette","family_slug":null,"family_sort_order":null,"name":"MIT.TOILETTE DOUZ SOPAL","display_name":"Mitigeur toilette Douz chromé Sopal","price_ttc":212.717,"stock_available":8,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Douz","mixer_usage":"Toilette","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1571,1572,1573],"technical":[{"id":1657,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00214780","slug":"mitigeur-toilette-flat-5011916-venisia-00214780","brand_slug":"venisia","product_type_slug":"mitigeur-toilette","family_slug":null,"family_sort_order":null,"name":"MIT.TOILETTE FLAT 5011916 VENISIA","display_name":"Mitigeur toilette Flat 5011916 chromé Venisia","price_ttc":214.848,"stock_available":2,"finish_value":"Chrome","manufacturer_ref":"5011916","product_line":"Flat","mixer_usage":"Toilette","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1574,1575],"technical":[],"certificates":[]},
  {"sku":"00214933","slug":"mitigeur-toilette-hitit-5011016-venisia-00214933","brand_slug":"venisia","product_type_slug":"mitigeur-toilette","family_slug":null,"family_sort_order":null,"name":"MIT.TOILETTE HITIT 5011016 VENISIA","display_name":"Mitigeur toilette Hitit 5011016 chromé Venisia","price_ttc":147.664,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":"5011016","product_line":"Hitit","mixer_usage":"Toilette","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1576,1577],"technical":[],"certificates":[]},
  {"sku":"00214889","slug":"mitigeur-toilette-kapadokya-5010816-silver-venisia-00214889","brand_slug":"venisia","product_type_slug":"mitigeur-toilette","family_slug":null,"family_sort_order":null,"name":"MIT.TOILETTE KAPADOKYA 5010816 SILVER VENISIA","display_name":"Mitigeur toilette Kapadokya 5010816 silver Venisia","price_ttc":174.127,"stock_available":2,"finish_value":"Silver","manufacturer_ref":"5010816","product_line":"Kapadokya","mixer_usage":"Toilette","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1578,1579],"technical":[],"certificates":[]},
  {"sku":"00223706","slug":"mitigeur-toilette-kapadokya-5010916-noir-mat-venisia-00223706","brand_slug":"venisia","product_type_slug":"mitigeur-toilette","family_slug":null,"family_sort_order":null,"name":"MIT.TOILETTE KAPADOKYA 5010916 NOIR VENISIA","display_name":"Mitigeur toilette Kapadokya 5010916 noir mat Venisia","price_ttc":377.253,"stock_available":2,"finish_value":"Noir mat","manufacturer_ref":"5010916","product_line":"Kapadokya","mixer_usage":"Toilette","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1580,1581],"technical":[],"certificates":[]},
  {"sku":"00219488","slug":"mitigeur-toilette-sfax-sopal-00219488","brand_slug":"sopal","product_type_slug":"mitigeur-toilette","family_slug":null,"family_sort_order":null,"name":"MIT.TOILETTE SFAX SOPAL","display_name":"Mitigeur toilette Sfax chromé Sopal","price_ttc":442.905,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Sfax","mixer_usage":"Toilette","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1582,1583,1584],"technical":[{"id":1658,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00002508","slug":"mitigeur-toilette-zarzis-sopal-00002508","brand_slug":"sopal","product_type_slug":"mitigeur-toilette","family_slug":null,"family_sort_order":null,"name":"MIT.TOILETTE ZARZIS SOPAL","display_name":"Mitigeur toilette Zarzis chromé Sopal","price_ttc":421.910,"stock_available":5,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Zarzis","mixer_usage":"Toilette","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec standard","coolstart":null,"visible_part_only":null,"gallery":[1585,1586,1587],"technical":[{"id":1659,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00221818","slug":"mitigeur-vasque-longue-xxl-canigo-21880301-aj0222-tres-plus-00221818","brand_slug":"tres","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.VASQUE LONG XXL CANIGO 21880301 (AJ0222) TRES PLUS","display_name":"Mitigeur vasque longue XXL Canigo 21880301 chromé TRES","price_ttc":582.353,"stock_available":4,"finish_value":"Chrome","manufacturer_ref":"21880301 / AJ0222","product_line":"Canigo","mixer_usage":"Vasque","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec long","coolstart":null,"visible_part_only":null,"gallery":[1588,1589,1590],"technical":[{"id":1660,"name":"Fiche technique"},{"id":1661,"name":"Manuel d'installation"}],"certificates":[{"id":1609,"name":"Certificat de conformité"}]},
  {"sku":"00208147","slug":"mitigeur-vasque-longue-ali-blm-85005b-jaquar-00208147","brand_slug":"jaquar","product_type_slug":"mitigeur-lavabo-vasque","family_slug":"jaquar-mitigeur-vasque-longue-ali-85005b","family_sort_order":0,"name":"MIT.VASQUE LONGUE ALI-BLM-85005B JAQUAR","display_name":"Mitigeur vasque longue ALI-BLM-85005B noir mat Jaquar","price_ttc":855.910,"stock_available":4,"finish_value":"Noir mat","manufacturer_ref":"ALI-BLM-85005B","product_line":"ALI","mixer_usage":"Vasque","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec haut","coolstart":null,"visible_part_only":null,"gallery":[1591,1592,1593],"technical":[{"id":1665,"name":"Fiche technique"},{"id":1666,"name":"Guide d'installation"}],"certificates":[]},
  {"sku":"00206747","slug":"mitigeur-vasque-longue-ali-chr-85005b-jaquar-00206747","brand_slug":"jaquar","product_type_slug":"mitigeur-lavabo-vasque","family_slug":"jaquar-mitigeur-vasque-longue-ali-85005b","family_sort_order":1,"name":"MIT.VASQUE LONGUE ALI-CHR-85005B JAQUAR","display_name":"Mitigeur vasque longue ALI-CHR-85005B chromé Jaquar","price_ttc":611.890,"stock_available":3,"finish_value":"Chrome","manufacturer_ref":"ALI-CHR-85005B","product_line":"ALI","mixer_usage":"Vasque","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec haut","coolstart":null,"visible_part_only":null,"gallery":[1594,1595,1596],"technical":[{"id":1663,"name":"Fiche technique"},{"id":1664,"name":"Guide d'installation"}],"certificates":[]},
  {"sku":"00002514","slug":"mitigeur-vasque-longue-bizerte-sopal-00002514","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.VASQUE LONGUE BIZERTE SOPAL","display_name":"Mitigeur vasque longue Bizerte chromé Sopal","price_ttc":441.635,"stock_available":6,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Bizerte","mixer_usage":"Vasque","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec haut","coolstart":null,"visible_part_only":null,"gallery":[1597,1598,1599],"technical":[{"id":1662,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00206778","slug":"mitigeur-vasque-longue-lyric-38005b-jaquar-00206778","brand_slug":"jaquar","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.VASQUE LONGUE REF38005B LYRIC JAQUAR","display_name":"Mitigeur vasque longue Lyric 38005B chromé Jaquar","price_ttc":480.000,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":"38005B","product_line":"Lyric","mixer_usage":"Vasque","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec haut","coolstart":null,"visible_part_only":null,"gallery":[1600,1601,1602],"technical":[{"id":1667,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"SOP19MITVASQLSAX","slug":"mitigeur-vasque-longue-sfax-sopal-sop19mitvasqlsax","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.VASQUE LONGUE SFAX SOPAL","display_name":"Mitigeur vasque longue Sfax chromé Sopal","price_ttc":439.936,"stock_available":1,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Sfax","mixer_usage":"Vasque","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec haut","coolstart":null,"visible_part_only":null,"gallery":[1603,1604,1605],"technical":[{"id":1668,"name":"Fiche technique"}],"certificates":[]},
  {"sku":"00002515","slug":"mitigeur-vasque-longue-zarzis-sopal-00002515","brand_slug":"sopal","product_type_slug":"mitigeur-lavabo-vasque","family_slug":null,"family_sort_order":null,"name":"MIT.VASQUE LONGUE ZARZIS SOPAL","display_name":"Mitigeur vasque longue Zarzis chromé Sopal","price_ttc":525.250,"stock_available":7,"finish_value":"Chrome","manufacturer_ref":null,"product_line":"Zarzis","mixer_usage":"Vasque","installation_type":"À poser","handle_type":"Mitigeur mono-commande","spout_type":"Bec haut","coolstart":null,"visible_part_only":null,"gallery":[1606,1607,1608],"technical":[{"id":1669,"name":"Fiche technique"}],"certificates":[]}
]
$products$::jsonb) AS "seed"(
  "sku" TEXT,
  "slug" TEXT,
  "brand_slug" TEXT,
  "product_type_slug" TEXT,
  "family_slug" TEXT,
  "family_sort_order" INTEGER,
  "name" TEXT,
  "display_name" TEXT,
  "price_ttc" NUMERIC(12, 3),
  "stock_available" NUMERIC(12, 3),
  "finish_value" TEXT,
  "manufacturer_ref" TEXT,
  "product_line" TEXT,
  "mixer_usage" TEXT,
  "installation_type" TEXT,
  "handle_type" TEXT,
  "spout_type" TEXT,
  "coolstart" BOOLEAN,
  "visible_part_only" BOOLEAN,
  "gallery" JSONB,
  "technical" JSONB,
  "certificates" JSONB
);

CREATE TEMP TABLE "_today_mit_lav2_families" (
  "slug" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "subtitle" TEXT,
  "description" TEXT,
  "description_seo" TEXT,
  "main_image_media_id" BIGINT,
  "default_sku" TEXT NOT NULL
);

INSERT INTO "_today_mit_lav2_families" (
  "slug", "name", "subtitle", "description", "description_seo", "main_image_media_id", "default_sku"
)
VALUES
  (
    'jaquar-mitigeur-vasque-longue-ali-85005b',
    'Mitigeur vasque longue ALI 85005B Jaquar',
    'Famille ALI bec haut',
    'Famille de mitigeurs vasque longue Jaquar ALI 85005B pour pose sur plan, en finition noir mat ou chrome.',
    'Mitigeurs vasque longue Jaquar ALI 85005B en finitions noir mat et chrome chez COBAM GROUP.',
    1591,
    '00208147'
  );

CREATE TEMP TABLE "_today_mit_lav2_product_media_entries" AS
SELECT
  "seed"."sku",
  ("gallery_entry"."value")::TEXT::BIGINT AS "media_id",
  'GALLERY'::"ProductMediaRole" AS "role",
  NULL::TEXT AS "name",
  ("gallery_entry"."ordinality" - 1)::INTEGER AS "sort_order",
  'IMAGE'::"MediaKind" AS "expected_kind"
FROM "_today_mit_lav2_products" "seed"
CROSS JOIN LATERAL jsonb_array_elements("seed"."gallery") WITH ORDINALITY AS "gallery_entry"("value", "ordinality")
UNION ALL
SELECT
  "seed"."sku",
  ("technical_entry"."value" ->> 'id')::BIGINT AS "media_id",
  'TECHNICAL'::"ProductMediaRole" AS "role",
  "technical_entry"."value" ->> 'name' AS "name",
  ("technical_entry"."ordinality" - 1)::INTEGER AS "sort_order",
  'DOCUMENT'::"MediaKind" AS "expected_kind"
FROM "_today_mit_lav2_products" "seed"
CROSS JOIN LATERAL jsonb_array_elements("seed"."technical") WITH ORDINALITY AS "technical_entry"("value", "ordinality")
UNION ALL
SELECT
  "seed"."sku",
  ("certificate_entry"."value" ->> 'id')::BIGINT AS "media_id",
  'CERTIFICATE'::"ProductMediaRole" AS "role",
  "certificate_entry"."value" ->> 'name' AS "name",
  ("certificate_entry"."ordinality" - 1)::INTEGER AS "sort_order",
  'DOCUMENT'::"MediaKind" AS "expected_kind"
FROM "_today_mit_lav2_products" "seed"
CROSS JOIN LATERAL jsonb_array_elements("seed"."certificates") WITH ORDINALITY AS "certificate_entry"("value", "ordinality");

DO $$
DECLARE
  missing_brands INTEGER;
  missing_product_types INTEGER;
  missing_media INTEGER;
  missing_finishes INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_brands
  FROM (
    SELECT DISTINCT "brand_slug" FROM "_today_mit_lav2_products"
  ) "expected"
  LEFT JOIN "organizations" "brand"
    ON "brand"."slug" = "expected"."brand_slug"
  WHERE "brand"."id" IS NULL;

  IF missing_brands > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today lavabo suite: % expected brand row(s) are missing.', missing_brands;
  END IF;

  SELECT COUNT(*)
  INTO missing_product_types
  FROM (
    SELECT DISTINCT "product_type_slug" FROM "_today_mit_lav2_products"
  ) "expected"
  LEFT JOIN "product_type_templates" "template"
    ON "template"."slug" = "expected"."product_type_slug"
  WHERE "template"."id" IS NULL;

  IF missing_product_types > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today lavabo suite: % expected product type row(s) are missing.', missing_product_types;
  END IF;

  SELECT COUNT(*)
  INTO missing_finishes
  FROM (
    SELECT DISTINCT "finish_value" FROM "_today_mit_lav2_products"
  ) "expected"
  LEFT JOIN "product_finishes" "finish"
    ON lower("finish"."label") = lower("expected"."finish_value")
  WHERE "finish"."id" IS NULL;

  IF missing_finishes > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today lavabo suite: % expected finish row(s) are missing.', missing_finishes;
  END IF;

  SELECT COUNT(*)
  INTO missing_media
  FROM "_today_mit_lav2_product_media_entries" "expected"
  LEFT JOIN "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."kind" = "expected"."expected_kind"
  WHERE "media"."id" IS NULL;

  IF missing_media > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today lavabo suite media: % expected media row(s) are missing or have the wrong kind.', missing_media;
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
            CASE
              WHEN "seed"."mixer_usage" = 'Toilette' THEN 'Ce mitigeur toilette ' || COALESCE("seed"."product_line" || ' ', '') || 'apporte une solution compacte et soignée pour un point d''eau sanitaire, avec une finition ' || lower("seed"."finish_value") || '.'
              WHEN "seed"."mixer_usage" = 'Vasque' THEN 'Ce mitigeur de vasque ' || COALESCE("seed"."product_line" || ' ', '') || 'associe une silhouette adaptée aux plans vasque à une finition ' || lower("seed"."finish_value") || '.'
              ELSE 'Ce mitigeur lavabo ' || COALESCE("seed"."product_line" || ' ', '') || 'propose une robinetterie mono-commande en finition ' || lower("seed"."finish_value") || ' pour les projets de salle de bain.'
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
              WHEN "seed"."installation_type" = 'Mural encastré' THEN 'La pose murale encastrée garde le plan vasque dégagé et demande de vérifier les réservations ainsi que les raccordements avant installation.'
              WHEN "seed"."spout_type" IN ('Bec haut', 'Bec long') THEN 'Le bec haut ou allongé facilite l''usage avec une vasque ou un lavabo plus profond, tout en conservant une zone de lavage confortable.'
              ELSE 'La pose sur appareil convient aux lavabos, plans vasque et points d''eau qui recherchent une utilisation quotidienne simple et accessible.'
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
                FROM "_today_mit_lav2_product_media_entries" "media_entry"
                WHERE "media_entry"."sku" = "seed"."sku"
                  AND "media_entry"."role" <> 'GALLERY'::"ProductMediaRole"
              ) THEN 'Les documents joints permettent de vérifier les dimensions, la pose, l''entretien et les informations techniques avant commande.'
              ELSE 'Les visuels associés permettent d''identifier la silhouette, la finition et l''intégration du produit dans le projet.'
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
        'mitigeur robinetterie',
        "seed"."mixer_usage",
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
FROM "_today_mit_lav2_products" "seed"
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
FROM "_today_mit_lav2_products" "seed"
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
FROM "_today_mit_lav2_families" "family"
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
USING "products" "product", "_today_mit_lav2_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "seed"."family_slug" IS NULL;

DELETE FROM "product_family_members" "member"
USING "product_families" "family"
WHERE "member"."family_id" = "family"."id"
  AND "family"."slug" IN (SELECT "slug" FROM "_today_mit_lav2_families")
  AND NOT EXISTS (
    SELECT 1
    FROM "_today_mit_lav2_products" "seed"
    JOIN "products" "product"
      ON "product"."sku" = "seed"."sku"
    WHERE "seed"."family_slug" = "family"."slug"
      AND "product"."id" = "member"."product_id"
  );

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  COALESCE("seed"."family_sort_order", 0)
FROM "_today_mit_lav2_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = "seed"."family_slug"
WHERE "seed"."family_slug" IS NOT NULL
ON CONFLICT ("product_id") DO UPDATE SET
  "family_id" = EXCLUDED."family_id",
  "sort_order" = EXCLUDED."sort_order";

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_today_mit_lav2_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    SELECT "key" FROM "_today_mit_lav2_attribute_definitions"
    UNION ALL
    SELECT 'color'
  );

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "product"."product_type_id",
    "attribute_seed"."name",
    "attribute_seed"."value"
  FROM "_today_mit_lav2_products" "seed"
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
USING "products" "product", "_today_mit_lav2_products" "seed"
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
      WHEN "entry"."role" = 'CERTIFICATE'::"ProductMediaRole"
        THEN "entry"."name" || ' du ' || "product"."display_name"
      ELSE "entry"."name" || ' du ' || "product"."display_name"
    END,
    255
  ),
  "entry"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_mit_lav2_product_media_entries" "entry"
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
  seeded_family_member_count INTEGER;
  expected_family_member_count INTEGER;
  color_finish_conflicts INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO expected_product_count
  FROM "_today_mit_lav2_products";

  SELECT COUNT(*)
  INTO seeded_product_count
  FROM "_today_mit_lav2_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku";

  IF expected_product_count <> 39 OR seeded_product_count <> expected_product_count THEN
    RAISE EXCEPTION 'Today lavabo suite seed expected 39 products and found % expected / % seeded.', expected_product_count, seeded_product_count;
  END IF;

  SELECT COUNT(*)
  INTO expected_media_count
  FROM "_today_mit_lav2_product_media_entries";

  SELECT COUNT(*)
  INTO seeded_media_count
  FROM "_today_mit_lav2_product_media_entries" "entry"
  JOIN "products" "product"
    ON "product"."sku" = "entry"."sku"
  JOIN "product_media" "product_media"
    ON "product_media"."product_id" = "product"."id"
    AND "product_media"."media_id" = "entry"."media_id";

  IF seeded_media_count <> expected_media_count THEN
    RAISE EXCEPTION 'Today lavabo suite seed expected % product media rows but found %.', expected_media_count, seeded_media_count;
  END IF;

  SELECT COUNT(*)
  INTO expected_family_member_count
  FROM "_today_mit_lav2_products"
  WHERE "family_slug" IS NOT NULL;

  SELECT COUNT(*)
  INTO seeded_family_member_count
  FROM "_today_mit_lav2_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_family_members" "member"
    ON "member"."product_id" = "product"."id"
  JOIN "product_families" "family"
    ON "family"."id" = "member"."family_id"
    AND "family"."slug" = "seed"."family_slug"
  WHERE "seed"."family_slug" IS NOT NULL;

  IF seeded_family_member_count <> expected_family_member_count THEN
    RAISE EXCEPTION 'Today lavabo suite seed expected % family member rows but found %.', expected_family_member_count, seeded_family_member_count;
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
    JOIN "_today_mit_lav2_products" "seed"
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
    RAISE EXCEPTION 'Today lavabo suite seed produced % product(s) with both Color and Finish attributes.', color_finish_conflicts;
  END IF;
END $$;
