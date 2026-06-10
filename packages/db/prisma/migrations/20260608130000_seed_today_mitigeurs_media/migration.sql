-- Seed the ZIP-backed mixer products from the Today media package.
-- SKUs present only in the additional information are intentionally ignored.

INSERT INTO "organizations" (
  "slug", "name", "description", "is_product_brand", "is_reference", "is_partner", "created_at", "updated_at"
)
VALUES
  ('kludi', 'Kludi', 'Marque de robinetterie et d''équipements sanitaires.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brava', 'Brava', 'Marque de robinetterie et d''équipements pour cuisine et salle de bain.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = COALESCE("organizations"."description", EXCLUDED."description"),
  "is_product_brand" = true,
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_colors" ("key", "label", "value", "created_at", "updated_at")
VALUES
  ('CHROME', 'Chrome', '#C8CDD0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('NOIR', 'Noir', '#111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('GRIS', 'Gris', '#7A7F83', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "value" = EXCLUDED."value",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES
  ('CHROME', 'Chrome', '#C8CDD0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('MATT_BLACK', 'Noir mat', '#111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('GRIS_GRANITE', 'Gris granite', '#6E7476', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "color" = EXCLUDED."color",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_today_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
VALUES
  ('mitigeur-douche-bain', 'filtres-principaux', 'Filtres principaux', 0),
  ('mitigeur-douche-bain', 'caracteristiques', 'Caractéristiques', 10),
  ('mitigeur-evier', 'filtres-principaux', 'Filtres principaux', 0),
  ('mitigeur-evier', 'caracteristiques', 'Caractéristiques', 10),
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
FROM "_today_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_today_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options"
)
VALUES
  ('color', 'Couleur', NULL, 'COLOR'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('finish', 'Finition', NULL, 'FINISH'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('manufacturer_ref', 'Référence fabricant', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('product_line', 'Gamme', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('mixer_usage', 'Usage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Bain-douche', 'Bidet', 'Douche', 'Évier', 'Vasque']::TEXT[]),
  ('installation_type', 'Pose', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Mural', 'À encastrer', 'À poser']::TEXT[]),
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
FROM "_today_attribute_definitions"
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

CREATE TEMP TABLE "_today_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_today_type_attributes" (
  "product_type_slug", "key", "group_slug", "is_filterable", "sort_order"
)
VALUES
  ('mitigeur-douche-bain', 'color', 'filtres-principaux', true, 0),
  ('mitigeur-douche-bain', 'finish', 'filtres-principaux', true, 1),
  ('mitigeur-douche-bain', 'thermostatic', 'filtres-principaux', true, 10),
  ('mitigeur-douche-bain', 'diverter', 'filtres-principaux', true, 20),
  ('mitigeur-douche-bain', 'installation_type', 'filtres-principaux', true, 30),
  ('mitigeur-douche-bain', 'handle_type', 'filtres-principaux', true, 35),
  ('mitigeur-douche-bain', 'with_shower_kit', 'filtres-principaux', true, 40),
  ('mitigeur-douche-bain', 'manufacturer_ref', 'caracteristiques', true, 50),
  ('mitigeur-douche-bain', 'product_line', 'caracteristiques', true, 60),
  ('mitigeur-douche-bain', 'mixer_usage', 'caracteristiques', true, 70),
  ('mitigeur-evier', 'color', 'filtres-principaux', true, 0),
  ('mitigeur-evier', 'finish', 'filtres-principaux', true, 1),
  ('mitigeur-evier', 'installation_type', 'filtres-principaux', true, 20),
  ('mitigeur-evier', 'handle_type', 'filtres-principaux', true, 35),
  ('mitigeur-evier', 'manufacturer_ref', 'caracteristiques', true, 50),
  ('mitigeur-evier', 'product_line', 'caracteristiques', true, 60),
  ('mitigeur-evier', 'mixer_usage', 'caracteristiques', true, 70),
  ('mitigeur-lavabo-vasque', 'color', 'filtres-principaux', true, 0),
  ('mitigeur-lavabo-vasque', 'finish', 'filtres-principaux', true, 1),
  ('mitigeur-lavabo-vasque', 'installation_type', 'filtres-principaux', true, 20),
  ('mitigeur-lavabo-vasque', 'handle_type', 'filtres-principaux', true, 40),
  ('mitigeur-lavabo-vasque', 'manufacturer_ref', 'caracteristiques', true, 50),
  ('mitigeur-lavabo-vasque', 'product_line', 'caracteristiques', true, 60),
  ('mitigeur-lavabo-vasque', 'mixer_usage', 'caracteristiques', true, 70);

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
FROM "_today_type_attributes" "seed"
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

CREATE TEMP TABLE "_today_products" (
  "sku" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "brand_slug" TEXT NOT NULL,
  "product_type_slug" TEXT NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "product_line" TEXT,
  "manufacturer_ref" TEXT,
  "mixer_usage" TEXT NOT NULL,
  "installation_type" TEXT NOT NULL,
  "handle_type" TEXT NOT NULL,
  "thermostatic" BOOLEAN,
  "diverter" BOOLEAN,
  "with_shower_kit" BOOLEAN,
  "color_value" TEXT NOT NULL,
  "finish_value" TEXT NOT NULL
);

INSERT INTO "_today_products" (
  "sku", "slug", "name", "display_name", "brand_slug", "product_type_slug",
  "price_ttc", "stock_available", "product_line", "manufacturer_ref", "mixer_usage",
  "installation_type", "handle_type", "thermostatic", "diverter", "with_shower_kit",
  "color_value", "finish_value"
)
VALUES
  ('00212724', 'kludi-mitigeur-douche-388700575-00212724', 'MIT DE DOUCHE REF 388700575 KLUDI', 'Mitigeur de douche 388700575 chrome Kludi', 'kludi', 'mitigeur-douche-bain', 309.412, 9.000, 'Kludi', '388700575', 'Douche', 'Mural', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('00208864', 'brava-mitigeur-evier-gris-granite-00208864', 'MIT. EVIER GRIS GRANITE BRAVA', 'Mitigeur évier gris granite Brava', 'brava', 'mitigeur-evier', 258.824, 1.000, 'Brava', NULL, 'Évier', 'À poser', 'Mitigeur mono-commande', NULL, NULL, NULL, 'Gris', 'Gris granite'),
  ('00212755', 'kludi-mitigeur-vasque-long-noir-522968775-00212755', 'MIT VASQUE LONG NOIR 522968775 KLUDI', 'Mitigeur vasque long 522968775 noir Kludi', 'kludi', 'mitigeur-lavabo-vasque', 747.059, 1.000, 'Vasque Long', '522968775', 'Vasque', 'À poser', 'Mitigeur mono-commande', NULL, NULL, NULL, 'Noir', 'Noir mat'),
  ('00212748', 'kludi-mitigeur-vasque-long-zenta-382560575-00212748', 'MIT VASQUE LONG ZENTA 382560575 KLUDI', 'Mitigeur vasque long Zenta 382560575 chrome Kludi', 'kludi', 'mitigeur-lavabo-vasque', 341.176, 8.000, 'Zenta', '382560575', 'Vasque', 'À poser', 'Mitigeur mono-commande', NULL, NULL, NULL, 'Chrome', 'Chrome'),
  ('00214803', 'venisia-mitigeur-bain-douche-alpin-5011401-00214803', 'MIT.B DOUCHE ALPIN 5011401 VENISIA', 'Mitigeur bain-douche Alpin 5011401 chrome Venisia', 'venisia', 'mitigeur-douche-bain', 183.874, 2.000, 'Alpin', '5011401', 'Bain-douche', 'Mural', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00006445', 'sopal-mitigeur-bain-douche-douz-00006445', 'MIT.B DOUCHE DOUZ SOPAL', 'Mitigeur bain-douche Douz chrome Sopal', 'sopal', 'mitigeur-douche-bain', 376.470, 3.000, 'Douz', NULL, 'Bain-douche', 'Mural', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00219204', 'grohe-mitigeur-bain-douche-encastre-eurocube-24062000-00219204', 'MIT.B DOUCHE ENCAS EUROCUBE 24062000 GROHE', 'Mitigeur bain-douche encastré Eurocube 24062000 chrome Grohe', 'grohe', 'mitigeur-douche-bain', 734.000, 1.000, 'Eurocube', '24062000', 'Bain-douche', 'À encastrer', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00214759', 'venisia-mitigeur-bain-douche-flat-5011901-00214759', 'MIT.B DOUCHE FLAT 5011901 VENISIA', 'Mitigeur bain-douche Flat 5011901 chrome Venisia', 'venisia', 'mitigeur-douche-bain', 302.511, 1.000, 'Flat', '5011901', 'Bain-douche', 'Mural', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00214902', 'venisia-mitigeur-bain-douche-hitit-5011001-00214902', 'MIT.B DOUCHE HITIT 5011001 VENISIA', 'Mitigeur bain-douche Hitit 5011001 chrome Venisia', 'venisia', 'mitigeur-douche-bain', 222.581, 2.000, 'Hitit', '5011001', 'Bain-douche', 'Mural', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00214858', 'venisia-mitigeur-bain-douche-kapadokya-5010801-00214858', 'MIT.B DOUCHE KAPADOKYA 5010801 VENISIA', 'Mitigeur bain-douche Kapadokya 5010801 chrome Venisia', 'venisia', 'mitigeur-douche-bain', 290.625, 2.000, 'Kapadokya', '5010801', 'Bain-douche', 'Mural', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00002453', 'sopal-mitigeur-bain-douche-bizerte-00002453', 'MIT.B.DOUCHE BIZERTE SOPAL', 'Mitigeur bain-douche Bizerte chrome Sopal', 'sopal', 'mitigeur-douche-bain', 481.247, 2.000, 'Bizerte', NULL, 'Bain-douche', 'Mural', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00000740', 'sopal-mitigeur-bain-douche-djerba-00000740', 'MIT.B.DOUCHE DJERBA SOPAL', 'Mitigeur bain-douche Djerba chrome Sopal', 'sopal', 'mitigeur-douche-bain', 265.109, 7.000, 'Djerba', NULL, 'Bain-douche', 'Mural', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00006458', 'sopal-mitigeur-bain-douche-encastre-zarzis-06bja04-1-00006458', 'MIT.B.DOUCHE ENCASTRE ZARZIS(06BJA04-1) SOPAL', 'Mitigeur bain-douche encastré Zarzis 06BJA04-1 chrome Sopal', 'sopal', 'mitigeur-douche-bain', 579.432, 1.000, 'Zarzis', '06BJA04-1', 'Bain-douche', 'À encastrer', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00000745', 'sopal-mitigeur-bain-douche-sousse-00000745', 'MIT.B.DOUCHE SOUSSE SOPAL', 'Mitigeur bain-douche Sousse chrome Sopal', 'sopal', 'mitigeur-douche-bain', 540.674, 3.000, 'Sousse', NULL, 'Bain-douche', 'Mural', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00002464', 'sopal-mitigeur-bain-douche-zarzis-00002464', 'MIT.B.DOUCHE ZARZIS SOPAL', 'Mitigeur bain-douche Zarzis chrome Sopal', 'sopal', 'mitigeur-douche-bain', 651.130, 2.000, 'Zarzis', NULL, 'Bain-douche', 'Mural', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('SOP19MITDBIZ', 'sopal-mitigeur-douche-bizerte-sop19mitdbiz', 'MIT.DOUCHE BIZERTE SOPAL', 'Mitigeur de douche Bizerte chrome Sopal', 'sopal', 'mitigeur-douche-bain', 314.120, 2.000, 'Bizerte', NULL, 'Douche', 'Mural', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('SOP19MIDJER', 'sopal-mitigeur-douche-djerba-sop19midjer', 'MIT.DOUCHE DJERBA SOPAL', 'Mitigeur de douche Djerba chrome Sopal', 'sopal', 'mitigeur-douche-bain', 200.000, 5.000, 'Djerba', NULL, 'Douche', 'Mural', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('00002473', 'sopal-mitigeur-douche-douz-00002473', 'MIT.DOUCHE DOUZ SOPAL', 'Mitigeur de douche Douz chrome Sopal', 'sopal', 'mitigeur-douche-bain', 294.118, 1.000, 'Douz', NULL, 'Douche', 'Mural', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('00208604', 'jaquar-mitigeur-douche-encastre-ali-blm-85065-00208604', 'MIT.DOUCHE ENCAS AVEC INV ALI-BLM-85065 JAQUAR', 'Mitigeur de douche encastré avec inverseur ALI-BLM-85065 noir Jaquar', 'jaquar', 'mitigeur-douche-bain', 604.600, 3.000, 'ALI', 'ALI-BLM-85065', 'Douche', 'À encastrer', 'Mitigeur mono-commande', false, true, false, 'Noir', 'Noir mat'),
  ('00206938', 'jaquar-mitigeur-douche-encastre-ali-chr-85065nk-00206938', 'MIT.DOUCHE ENCAS AVEC INV ALI-CHR-85065NK JAQUAR', 'Mitigeur de douche encastré avec inverseur ALI-CHR-85065NK chrome Jaquar', 'jaquar', 'mitigeur-douche-bain', 128.042, 3.000, 'ALI', 'ALI-CHR-85065NK', 'Douche', 'À encastrer', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00252485', 'jaquar-mitigeur-douche-encastre-ornamix-orp-chr-10065mkpm-00252485', 'MIT.DOUCHE ENCAS AVEC INV ORNAMIX ORP-CHR-10065MKPM JAQUAR', 'Mitigeur de douche encastré avec inverseur Ornamix ORP-CHR-10065MKPM chrome Jaquar', 'jaquar', 'mitigeur-douche-bain', 171.741, 1.000, 'Ornamix', 'ORP-CHR-10065MKPM', 'Douche', 'À encastrer', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00206921', 'jaquar-mitigeur-douche-encastre-lyric-38065-00206921', 'MIT.DOUCHE ENCAS AVEC INV REF 38065 LYRIC JAQUAR', 'Mitigeur de douche encastré avec inverseur Lyric 38065 chrome Jaquar', 'jaquar', 'mitigeur-douche-bain', 114.374, 1.000, 'Lyric', '38065', 'Douche', 'À encastrer', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00219266', 'grohe-mitigeur-douche-encastre-eurosmart-00219266', 'MIT.DOUCHE ENCAS EUROSMART GROHE', 'Mitigeur de douche encastré Eurosmart chrome Grohe', 'grohe', 'mitigeur-douche-bain', 347.634, 1.000, 'Eurosmart', NULL, 'Douche', 'À encastrer', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('SOP19MITDEINVDOUZ', 'sopal-mitigeur-douche-encastre-avec-inverseur-douz-sop19mitdeinvdouz', 'MIT.DOUCHE ENCASTRE AVEC INV DOUZ SOPAL', 'Mitigeur de douche encastré avec inverseur Douz chrome Sopal', 'sopal', 'mitigeur-douche-bain', 278.240, 3.000, 'Douz', NULL, 'Douche', 'À encastrer', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00006502', 'sopal-mitigeur-douche-encastre-bizerte-00006502', 'MIT.DOUCHE ENCASTRE BIZERTE SOPAL', 'Mitigeur de douche encastré Bizerte chrome Sopal', 'sopal', 'mitigeur-douche-bain', 158.907, 1.000, 'Bizerte', NULL, 'Douche', 'À encastrer', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('00183703', 'sopal-mitigeur-douche-encastre-zarzis-06bma04-1-nouveau-00183703', 'MIT.DOUCHE ENCASTRE ZARZIS (06BMA04-1) SOPAL NOUVEAU', 'Mitigeur de douche encastré Zarzis 06BMA04-1 chrome Sopal', 'sopal', 'mitigeur-douche-bain', 856.552, 2.000, 'Zarzis', '06BMA04-1', 'Douche', 'À encastrer', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('00006506', 'sopal-mitigeur-douche-encastre-zarzis-06bla04-1-00006506', 'MIT.DOUCHE ENCASTRE ZARZIS AVEC INVERSEUR (06BLA04-1) SOPAL', 'Mitigeur de douche encastré avec inverseur Zarzis 06BLA04-1 chrome Sopal', 'sopal', 'mitigeur-douche-bain', 1350.824, 2.000, 'Zarzis', '06BLA04-1', 'Douche', 'À encastrer', 'Mitigeur mono-commande', false, true, false, 'Chrome', 'Chrome'),
  ('00219235', 'grohe-mitigeur-douche-mural-essence-33636001-00219235', 'MIT.DOUCHE ESSENCE MURAL 33636001 GROHE', 'Mitigeur de douche mural Essence 33636001 chrome Grohe', 'grohe', 'mitigeur-douche-bain', 655.703, 1.000, 'Essence', '33636001', 'Douche', 'Mural', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('00214896', 'venisia-mitigeur-douche-kapadokya-5010822-00214896', 'MIT.DOUCHE KAPADOKYA 5010822 VENISIA', 'Mitigeur de douche Kapadokya 5010822 chrome Venisia', 'venisia', 'mitigeur-douche-bain', 231.054, 1.000, 'Kapadokya', '5010822', 'Douche', 'Mural', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('00002475', 'sopal-mitigeur-douche-kerkennah-00002475', 'MIT.DOUCHE KERKENNAH SOPAL', 'Mitigeur de douche Kerkennah chrome Sopal', 'sopal', 'mitigeur-douche-bain', 180.000, 2.000, 'Kerkennah', NULL, 'Douche', 'Mural', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('00221832', 'tres-mitigeur-douche-mural-apparent-21826701-al1020-00221832', 'MIT.DOUCHE MURAL APPARENT 21826701 (AL1020) TRES PLUS', 'Mitigeur de douche mural apparent 21826701 AL1020 chrome TRES', 'tres', 'mitigeur-douche-bain', 329.412, 5.000, 'TRES Plus', '21826701 / AL1020', 'Douche', 'Mural', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('00192736', 'sopal-mitigeur-douche-nabeul-00192736', 'MIT.DOUCHE NABEUL SOPAL', 'Mitigeur de douche Nabeul chrome Sopal', 'sopal', 'mitigeur-douche-bain', 452.290, 3.000, 'Nabeul', NULL, 'Douche', 'Mural', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('00006512', 'hansgrohe-mitigeur-douche-metris-31680000-chrome-00006512', 'MIT.DOUCHE. METRIS CHROME 31680000', 'Mitigeur de douche Metris 31680000 chrome Hansgrohe', 'hansgrohe', 'mitigeur-douche-bain', 545.000, 1.000, 'Metris', '31680000', 'Douche', 'Mural', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome'),
  ('00006513', 'hansgrohe-mitigeur-douche-metris-s-31660000-chrome-00006513', 'MIT.DOUCHE. METRIS S CHROME 31660000', 'Mitigeur de douche Metris S 31660000 chrome Hansgrohe', 'hansgrohe', 'mitigeur-douche-bain', 478.000, 1.000, 'Metris S', '31660000', 'Douche', 'Mural', 'Mitigeur mono-commande', false, false, false, 'Chrome', 'Chrome');

CREATE TEMP TABLE "_today_gallery_ranges" (
  "sku" TEXT PRIMARY KEY,
  "start_media_id" BIGINT NOT NULL,
  "end_media_id" BIGINT NOT NULL
);

INSERT INTO "_today_gallery_ranges" ("sku", "start_media_id", "end_media_id")
VALUES
  ('00212724', 1149, 1151),
  ('00212755', 1152, 1154),
  ('00212748', 1155, 1157),
  ('00208864', 1158, 1159),
  ('00214803', 1160, 1161),
  ('00006445', 1162, 1164),
  ('00219204', 1165, 1168),
  ('00214759', 1169, 1170),
  ('00214902', 1171, 1172),
  ('00214858', 1173, 1175),
  ('00002453', 1176, 1178),
  ('00000740', 1179, 1181),
  ('00006458', 1182, 1184),
  ('00000745', 1185, 1187),
  ('00002464', 1188, 1190),
  ('SOP19MITDBIZ', 1191, 1193),
  ('SOP19MIDJER', 1194, 1196),
  ('00002473', 1197, 1199),
  ('00208604', 1200, 1202),
  ('00206938', 1203, 1205),
  ('00252485', 1206, 1208),
  ('00206921', 1209, 1211),
  ('00219266', 1212, 1214),
  ('SOP19MITDEINVDOUZ', 1215, 1217),
  ('00006502', 1218, 1220),
  ('00183703', 1221, 1223),
  ('00006506', 1224, 1226),
  ('00219235', 1227, 1229),
  ('00214896', 1230, 1231),
  ('00002475', 1232, 1234),
  ('00221832', 1235, 1237),
  ('00192736', 1238, 1240),
  ('00006512', 1241, 1244),
  ('00006513', 1245, 1248);

CREATE TEMP TABLE "_today_product_media_entries" (
  "sku" TEXT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "role" "ProductMediaRole" NOT NULL,
  "name" TEXT,
  "sort_order" INTEGER NOT NULL,
  "kind" "MediaKind" NOT NULL,
  PRIMARY KEY ("sku", "media_id")
);

INSERT INTO "_today_product_media_entries" ("sku", "media_id", "role", "name", "sort_order", "kind")
SELECT
  "range"."sku",
  "series"."media_id",
  'GALLERY'::"ProductMediaRole",
  NULL,
  ("series"."media_id" - "range"."start_media_id")::INTEGER,
  'IMAGE'::"MediaKind"
FROM "_today_gallery_ranges" "range"
CROSS JOIN LATERAL generate_series("range"."start_media_id", "range"."end_media_id") AS "series"("media_id");

INSERT INTO "_today_product_media_entries" ("sku", "media_id", "role", "name", "sort_order", "kind")
VALUES
  ('00212755', 1249, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00212755', 1250, 'TECHNICAL'::"ProductMediaRole", 'Instructions d''entretien', 1, 'DOCUMENT'::"MediaKind"),
  ('00006445', 1251, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00219204', 1252, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00219204', 1253, 'TECHNICAL'::"ProductMediaRole", 'Instructions d''entretien', 1, 'DOCUMENT'::"MediaKind"),
  ('00002453', 1254, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00000740', 1255, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00006458', 1256, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00000745', 1257, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00002464', 1258, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('SOP19MITDBIZ', 1259, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('SOP19MIDJER', 1260, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00002473', 1261, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00208604', 1262, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00206938', 1263, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00252485', 1264, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00252485', 1265, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),
  ('00206921', 1266, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00206921', 1267, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),
  ('00219266', 1268, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00219266', 1269, 'TECHNICAL'::"ProductMediaRole", 'Notice d''installation [1]', 1, 'DOCUMENT'::"MediaKind"),
  ('00219266', 1270, 'TECHNICAL'::"ProductMediaRole", 'Notice d''installation [2]', 2, 'DOCUMENT'::"MediaKind"),
  ('00219266', 1271, 'TECHNICAL'::"ProductMediaRole", 'Notice d''installation [3]', 3, 'DOCUMENT'::"MediaKind"),
  ('SOP19MITDEINVDOUZ', 1272, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00006502', 1273, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00183703', 1274, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00006506', 1275, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00219235', 1276, 'TECHNICAL'::"ProductMediaRole", 'Conseils d''entretien', 0, 'DOCUMENT'::"MediaKind"),
  ('00219235', 1277, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 1, 'DOCUMENT'::"MediaKind"),
  ('00219235', 1278, 'TECHNICAL'::"ProductMediaRole", 'Notice d''installation [1]', 2, 'DOCUMENT'::"MediaKind"),
  ('00219235', 1279, 'TECHNICAL'::"ProductMediaRole", 'Notice d''installation [2]', 3, 'DOCUMENT'::"MediaKind"),
  ('00219235', 1280, 'TECHNICAL'::"ProductMediaRole", 'Notice d''installation [3]', 4, 'DOCUMENT'::"MediaKind"),
  ('00002475', 1281, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00221832', 1282, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00221832', 1283, 'TECHNICAL'::"ProductMediaRole", 'Manuel d''installation', 1, 'DOCUMENT'::"MediaKind"),
  ('00192736', 1284, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00006512', 1285, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00006512', 1286, 'TECHNICAL'::"ProductMediaRole", 'Mode d''emploi entretien', 1, 'DOCUMENT'::"MediaKind"),
  ('00006512', 1287, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 2, 'DOCUMENT'::"MediaKind"),
  ('00006513', 1288, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00006513', 1289, 'TECHNICAL'::"ProductMediaRole", 'Mode d''emploi entretien [capot]', 1, 'DOCUMENT'::"MediaKind"),
  ('00006513', 1290, 'TECHNICAL'::"ProductMediaRole", 'Mode d''emploi entretien [cartouche]', 2, 'DOCUMENT'::"MediaKind"),
  ('00006513', 1291, 'TECHNICAL'::"ProductMediaRole", 'Mode d''emploi entretien [clapet anti-retour]', 3, 'DOCUMENT'::"MediaKind"),
  ('00006513', 1292, 'TECHNICAL'::"ProductMediaRole", 'Mode d''emploi entretien [conseils de nettoyage]', 4, 'DOCUMENT'::"MediaKind"),
  ('00006513', 1293, 'TECHNICAL'::"ProductMediaRole", 'Mode d''emploi entretien [extension]', 5, 'DOCUMENT'::"MediaKind"),
  ('00006513', 1294, 'TECHNICAL'::"ProductMediaRole", 'Mode d''emploi entretien [poignée]', 6, 'DOCUMENT'::"MediaKind"),
  ('00006513', 1295, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage', 7, 'DOCUMENT'::"MediaKind"),
  ('00219235', 1296, 'CERTIFICATE'::"ProductMediaRole", 'Déclaration environnementale', 0, 'DOCUMENT'::"MediaKind"),
  ('00221832', 1297, 'CERTIFICATE'::"ProductMediaRole", 'Certificat de conformité', 0, 'DOCUMENT'::"MediaKind"),
  ('00006512', 1298, 'CERTIFICATE'::"ProductMediaRole", 'Déclaration de conformité-performance', 0, 'DOCUMENT'::"MediaKind"),
  ('00006512', 1299, 'CERTIFICATE'::"ProductMediaRole", 'Déclaration environnementale', 1, 'DOCUMENT'::"MediaKind");

CREATE TEMP TABLE "_today_product_certificate_slugs" (
  "sku" TEXT NOT NULL,
  "certificate_slug" TEXT NOT NULL,
  PRIMARY KEY ("sku", "certificate_slug")
);

INSERT INTO "_today_product_certificate_slugs" ("sku", "certificate_slug")
VALUES
  ('00219235', 'fdes'),
  ('00221832', 'nf'),
  ('00221832', 'dvgw'),
  ('00221832', 'belgaqua'),
  ('00221832', 'aenor'),
  ('00006512', 'fdes'),
  ('00006512', 'acs');

DO $$
DECLARE
  missing_media_count INTEGER;
  missing_certificate_count INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM "_today_products") <> 34 THEN
    RAISE EXCEPTION 'Expected 34 ZIP-backed products in the Today seed.';
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

  IF EXISTS (
    SELECT 1
    FROM "_today_products" "seed"
    LEFT JOIN "organizations" "brand"
      ON "brand"."slug" = "seed"."brand_slug"
      AND "brand"."is_product_brand" = true
    WHERE "brand"."id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot seed Today mixers: at least one expected brand is missing.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "_today_products" "seed"
    LEFT JOIN "product_type_templates" "template"
      ON "template"."slug" = "seed"."product_type_slug"
    WHERE "template"."id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot seed Today mixers: at least one expected product type is missing.';
  END IF;

  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_today_product_media_entries" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today mixer media: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;

  SELECT COUNT(*)
  INTO missing_certificate_count
  FROM "_today_product_certificate_slugs" "expected"
  LEFT JOIN "product_certificates" "certificate"
    ON "certificate"."slug" = "expected"."certificate_slug"
  WHERE "certificate"."id" IS NULL;

  IF missing_certificate_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today mixer certificates: % product certificate row(s) are missing.', missing_certificate_count;
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
        'content', jsonb_build_array(
          jsonb_build_object(
            'type', 'text',
            'text',
            CASE
              WHEN "seed"."mixer_usage" = 'Évier' THEN 'Ce mitigeur d''évier ' || COALESCE("seed"."product_line" || ' ', '') || 'propose une solution de robinetterie pratique pour la cuisine, avec une finition ' || lower("seed"."finish_value") || ' facile à intégrer.'
              WHEN "seed"."mixer_usage" = 'Vasque' THEN 'Ce mitigeur de vasque ' || COALESCE("seed"."product_line" || ' ', '') || 'associe une commande simple à une silhouette adaptée aux plans vasque contemporains.'
              WHEN "seed"."mixer_usage" = 'Bain-douche' THEN 'Ce mitigeur bain-douche ' || COALESCE("seed"."product_line" || ' ', '') || 'réunit une robinetterie fonctionnelle pour la baignoire et la douche dans une finition ' || lower("seed"."finish_value") || '.'
              ELSE 'Ce mitigeur de douche ' || COALESCE("seed"."product_line" || ' ', '') || 'offre une robinetterie claire et fiable pour équiper une salle de bain avec une finition ' || lower("seed"."finish_value") || '.'
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
              WHEN "seed"."installation_type" = 'À encastrer' THEN 'La pose encastrée permet une intégration discrète dans le mur et demande de vérifier les réservations, les raccordements et l''accès de maintenance avant installation.'
              WHEN "seed"."installation_type" = 'À poser' THEN 'La pose sur plan ou sur appareil sanitaire convient aux aménagements qui recherchent une installation accessible et une utilisation quotidienne simple.'
              ELSE 'La pose murale facilite l''association avec les équipements de douche ou de bain existants et garde la zone d''usage lisible.'
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
                FROM "_today_product_media_entries" "media_entry"
                WHERE "media_entry"."sku" = "seed"."sku"
                  AND "media_entry"."role" <> 'GALLERY'::"ProductMediaRole"
              ) THEN 'Les documents joints permettent de contrôler les dimensions, les notices de pose et les informations techniques avant validation du projet.'
              ELSE 'Les visuels associés permettent d''identifier la finition, la forme générale et l''intégration du produit dans le projet.'
            END
          )
        )
      )
    )
  ),
  LEFT("seed"."display_name", 60),
  LEFT("seed"."display_name" || ' disponible chez COBAM GROUP en Tunisie pour les projets de salle de bain et cuisine.', 160),
  regexp_replace(
    lower(
      concat_ws(
        ' ',
        "brand"."name",
        'mitigeur',
        'robinetterie',
        "seed"."mixer_usage",
        "seed"."product_line",
        "seed"."manufacturer_ref",
        "seed"."color_value",
        "seed"."finish_value",
        'salle de bain cuisine tunisie'
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
FROM "_today_products" "seed"
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
FROM "_today_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'robinetterie'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_today_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    SELECT "key" FROM "_today_attribute_definitions"
  );

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "product"."product_type_id",
    "attribute_seed"."name",
    "attribute_seed"."value"
  FROM "_today_products" "seed"
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
USING "products" "product", "_today_products" "seed"
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
      WHEN "entry"."role" = 'GALLERY'::"ProductMediaRole" THEN "product"."display_name" || ' - vue ' || ("entry"."sort_order" + 1)::TEXT
      ELSE COALESCE("entry"."name", 'Document') || ' - ' || "product"."display_name"
    END,
    255
  ),
  "entry"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_product_media_entries" "entry"
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

DELETE FROM "product_certificate_associations" "association"
USING "products" "product", "_today_product_certificate_slugs" "seed", "product_certificates" "certificate"
WHERE "association"."product_id" = "product"."id"
  AND "association"."certificate_id" = "certificate"."id"
  AND "product"."sku" = "seed"."sku"
  AND "certificate"."slug" = "seed"."certificate_slug";

INSERT INTO "product_certificate_associations" ("product_id", "certificate_id")
SELECT
  "product"."id",
  "certificate"."id"
FROM "_today_product_certificate_slugs" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_certificates" "certificate"
  ON "certificate"."slug" = "seed"."certificate_slug"
ON CONFLICT ("product_id", "certificate_id") DO NOTHING;
