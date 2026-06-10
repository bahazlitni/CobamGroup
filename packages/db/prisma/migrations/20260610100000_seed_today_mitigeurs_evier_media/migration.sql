-- Seed the ZIP-backed shower and kitchen mixer products from the current Today package.
-- Additional-information SKUs without a matching product folder are intentionally ignored.

INSERT INTO "product_colors" ("key", "label", "value", "created_at", "updated_at")
VALUES
  ('CHROME', 'Chrome', '#C8CDD0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('NOIR', 'Noir', '#111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('INOX', 'Inox', '#B9C0C3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "value" = EXCLUDED."value",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES
  ('CHROME', 'Chrome', '#C8CDD0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('MATT_BLACK', 'Noir mat', '#111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('INOX', 'Inox', '#B9C0C3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "color" = EXCLUDED."color",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_mixer_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_today_mixer_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
VALUES
  ('mitigeur-douche-bain', 'filtres-principaux', 'Filtres principaux', 0),
  ('mitigeur-douche-bain', 'caracteristiques', 'Caractéristiques', 10),
  ('mitigeur-evier', 'filtres-principaux', 'Filtres principaux', 0),
  ('mitigeur-evier', 'caracteristiques', 'Caractéristiques', 10);

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
FROM "_today_mixer_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_mixer_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_today_mixer_attribute_definitions" (
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
  ('spout_type', 'Type de bec', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['3 trous', 'Col de cygne', 'Douchette extractible', 'Fixe', 'Orientable']::TEXT[]),
  ('swivel_spout', 'Bec orientable', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
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
FROM "_today_mixer_attribute_definitions"
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

CREATE TEMP TABLE "_today_mixer_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_today_mixer_type_attributes" (
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
  ('mitigeur-evier', 'spout_type', 'filtres-principaux', true, 10),
  ('mitigeur-evier', 'swivel_spout', 'filtres-principaux', true, 20),
  ('mitigeur-evier', 'installation_type', 'filtres-principaux', true, 30),
  ('mitigeur-evier', 'handle_type', 'filtres-principaux', true, 35),
  ('mitigeur-evier', 'manufacturer_ref', 'caracteristiques', true, 50),
  ('mitigeur-evier', 'product_line', 'caracteristiques', true, 60),
  ('mitigeur-evier', 'mixer_usage', 'caracteristiques', true, 70);

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
FROM "_today_mixer_type_attributes" "seed"
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

CREATE TEMP TABLE "_today_mixer_products" (
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
  "spout_type" TEXT,
  "swivel_spout" BOOLEAN,
  "thermostatic" BOOLEAN,
  "diverter" BOOLEAN,
  "with_shower_kit" BOOLEAN,
  "color_value" TEXT NOT NULL,
  "finish_value" TEXT NOT NULL
);

INSERT INTO "_today_mixer_products" (
  "sku", "slug", "name", "display_name", "brand_slug", "product_type_slug",
  "price_ttc", "stock_available", "product_line", "manufacturer_ref", "mixer_usage",
  "installation_type", "handle_type", "spout_type", "swivel_spout",
  "thermostatic", "diverter", "with_shower_kit", "color_value", "finish_value"
)
VALUES
  ('00208604', 'jaquar-mitigeur-douche-encastre-ali-blm-85065-00208604', 'MIT.DOUCHE ENCAS AVEC INV ALI-BLM-85065 JAQUAR', 'Mitigeur de douche encastré avec inverseur ALI-BLM-85065 noir Jaquar', 'jaquar', 'mitigeur-douche-bain', 604.600, 3.000, 'ALI', 'ALI-BLM-85065', 'Douche', 'À encastrer', 'Mitigeur mono-commande', NULL, NULL, false, true, false, 'Noir', 'Noir mat'),
  ('00206938', 'jaquar-mitigeur-douche-encastre-ali-chr-85065mk-00206938', 'MIT.DOUCHE ENCAS AVEC INV ALI-CHR-85065MK JAQUAR', 'Mitigeur de douche encastré avec inverseur ALI-CHR-85065MK chrome Jaquar', 'jaquar', 'mitigeur-douche-bain', 128.042, 3.000, 'ALI', 'ALI-CHR-85065MK', 'Douche', 'À encastrer', 'Mitigeur mono-commande', NULL, NULL, false, true, false, 'Chrome', 'Chrome'),
  ('00232661', 'jaquar-mitigeur-douche-partie-apparente-ali-blm-85227k-00232661', 'MIT.DOUCHE PARTIE APPARENTE ALI-BLM-85227K JAQUAR', 'Mitigeur de douche partie apparente ALI-BLM-85227K noir Jaquar', 'jaquar', 'mitigeur-douche-bain', 302.310, 2.000, 'ALI', 'ALI-BLM-85227K', 'Douche', 'Mural', 'Mitigeur mono-commande', NULL, NULL, false, false, false, 'Noir', 'Noir mat'),
  ('00206846', 'jaquar-mitigeur-douche-lyric-38149-00206846', 'MIT.DOUCHE REF38149 LYRIC JAQUAR', 'Mitigeur de douche Lyric 38149 chrome Jaquar', 'jaquar', 'mitigeur-douche-bain', 309.375, 1.000, 'Lyric', '38149', 'Douche', 'Mural', 'Mitigeur mono-commande', NULL, NULL, false, false, false, 'Chrome', 'Chrome'),
  ('SOP19MITDSFY', 'sopal-mitigeur-douche-sfax-sop19mitdsfy', 'MIT.DOUCHE SFAX SOPAL', 'Mitigeur de douche Sfax chrome Sopal', 'sopal', 'mitigeur-douche-bain', 461.255, 2.000, 'Sfax', NULL, 'Douche', 'Mural', 'Mitigeur mono-commande', NULL, NULL, false, false, false, 'Chrome', 'Chrome'),
  ('00002477', 'sopal-mitigeur-douche-sousse-00002477', 'MIT.DOUCHE SOUSSE SOPAL', 'Mitigeur de douche Sousse chrome Sopal', 'sopal', 'mitigeur-douche-bain', 379.829, 1.000, 'Sousse', NULL, 'Douche', 'Mural', 'Mitigeur mono-commande', NULL, NULL, false, false, false, 'Chrome', 'Chrome'),
  ('00006515', 'hansgrohe-mitigeur-douche-talis-e2-chrome-00006515', 'MIT.DOUCHE. TALIS E2 CHROME', 'Mitigeur de douche Talis E2 chrome Hansgrohe', 'hansgrohe', 'mitigeur-douche-bain', 258.000, 1.000, 'Talis E2', NULL, 'Douche', 'Mural', 'Mitigeur mono-commande', NULL, NULL, false, false, false, 'Chrome', 'Chrome'),
  ('00002478', 'sopal-mitigeur-douche-zarzis-bras-lateral-0641a04-00002478', 'MIT.DOUCHE ZARZIS BRAS LATERAL (0641A04)SOPAL', 'Mitigeur de douche Zarzis bras latéral 0641A04 chrome Sopal', 'sopal', 'mitigeur-douche-bain', 456.880, 2.000, 'Zarzis', '0641A04', 'Douche', 'Mural', 'Mitigeur mono-commande', NULL, NULL, false, false, false, 'Chrome', 'Chrome'),
  ('00232708', 'jaquar-mitigeur-douche-2-fonctions-ari-chr-39145-00232708', 'MIT.DOUCHE 2FONCT ARI-CHR-39145 JAQUAR', 'Mitigeur de douche 2 fonctions ARI-CHR-39145 chrome Jaquar', 'jaquar', 'mitigeur-douche-bain', 502.132, 3.000, 'Ari', 'ARI-CHR-39145', 'Douche', 'Mural', 'Mitigeur mono-commande', NULL, NULL, false, true, false, 'Chrome', 'Chrome'),
  ('00202794', 'sopal-mitigeur-evier-djerba-col-de-cygne-00202794', 'MIT.EVIER DJERBA A COL DE CYGNE SOPAL', 'Mitigeur évier Djerba à col de cygne chrome Sopal', 'sopal', 'mitigeur-evier', 229.412, 4.000, 'Djerba', NULL, 'Évier', 'À poser', 'Mitigeur mono-commande', 'Col de cygne', true, NULL, NULL, NULL, 'Chrome', 'Chrome'),
  ('00000758', 'sopal-mitigeur-evier-djerba-3-trous-00000758', 'MIT.EVIER DJERBA 3 TROUE SOPAL', 'Mitigeur évier Djerba 3 trous chrome Sopal', 'sopal', 'mitigeur-evier', 394.812, 1.000, 'Djerba', NULL, 'Évier', 'À poser', 'Mitigeur mono-commande', '3 trous', true, NULL, NULL, NULL, 'Chrome', 'Chrome'),
  ('00002480', 'sopal-mitigeur-evier-douchette-amovible-sousse-00002480', 'MIT.EVIER DOUCHETTE AMOVIBLE SOUSSE SOPAL', 'Mitigeur évier Sousse avec douchette amovible chrome Sopal', 'sopal', 'mitigeur-evier', 284.871, 1.000, 'Sousse', NULL, 'Évier', 'À poser', 'Mitigeur mono-commande', 'Douchette extractible', true, NULL, NULL, NULL, 'Chrome', 'Chrome'),
  ('00006524', 'sopal-mitigeur-evier-douz-00006524', 'MIT.EVIER DOUZ SOPAL', 'Mitigeur évier Douz chrome Sopal', 'sopal', 'mitigeur-evier', 247.059, 4.000, 'Douz', NULL, 'Évier', 'À poser', 'Mitigeur mono-commande', 'Orientable', true, NULL, NULL, NULL, 'Chrome', 'Chrome'),
  ('00221825', 'tres-mitigeur-evier-essential-21644020-aj0304-00221825', 'MIT.EVIER ESSENTIAL 21644020 (AJ0304) TRES PLUS', 'Mitigeur évier Essential 21644020 AJ0304 chrome TRES', 'tres', 'mitigeur-evier', 405.000, 4.000, 'Essential', '21644020 / AJ0304', 'Évier', 'À poser', 'Mitigeur mono-commande', 'Orientable', true, NULL, NULL, NULL, 'Chrome', 'Chrome'),
  ('00215015', 'venisia-mitigeur-evier-kapadokya-5010902-05-noir-00215015', 'MIT.EVIER KAPADOKYA 5010902-05 NOIR VENISIA', 'Mitigeur évier Kapadokya 5010902-05 noir Venisia', 'venisia', 'mitigeur-evier', 388.850, 6.000, 'Kapadokya', '5010902-05', 'Évier', 'À poser', 'Mitigeur mono-commande', 'Orientable', true, NULL, NULL, NULL, 'Noir', 'Noir mat'),
  ('00202800', 'sopal-mitigeur-evier-kerkennah-col-de-cygne-00202800', 'MIT.EVIER KERKENNAH COL DE CYGNE SOPAL', 'Mitigeur évier Kerkennah col de cygne chrome Sopal', 'sopal', 'mitigeur-evier', 166.510, 2.000, 'Kerkennah', NULL, 'Évier', 'À poser', 'Mitigeur mono-commande', 'Col de cygne', true, NULL, NULL, NULL, 'Chrome', 'Chrome'),
  ('00219174', 'grohe-mitigeur-evier-minta-32917000-00219174', 'MIT.EVIER MINTA 32917000 GROHE', 'Mitigeur évier Minta 32917000 chrome Grohe', 'grohe', 'mitigeur-evier', 788.235, 1.000, 'Minta', '32917000', 'Évier', 'À poser', 'Mitigeur mono-commande', 'Orientable', true, NULL, NULL, NULL, 'Chrome', 'Chrome'),
  ('00181983', 'sopal-mitigeur-evier-sfax-00181983', 'MIT.EVIER SFAX SOPAL', 'Mitigeur évier Sfax chrome Sopal', 'sopal', 'mitigeur-evier', 468.236, 1.000, 'Sfax', NULL, 'Évier', 'À poser', 'Mitigeur mono-commande', 'Orientable', true, NULL, NULL, NULL, 'Chrome', 'Chrome'),
  ('00000761', 'sopal-mitigeur-evier-sousse-00000761', 'MIT.EVIER SOUSSE SOPAL', 'Mitigeur évier Sousse chrome Sopal', 'sopal', 'mitigeur-evier', 207.354, 2.000, 'Sousse', NULL, 'Évier', 'À poser', 'Mitigeur mono-commande', 'Orientable', true, NULL, NULL, NULL, 'Chrome', 'Chrome'),
  ('00214995', 'venisia-mitigeur-evier-304-inox-5013116-00214995', 'MIT.EVIER 304 INOX 5013116 VENISIA', 'Mitigeur évier 304 inox 5013116 Venisia', 'venisia', 'mitigeur-evier', 203.566, 1.000, '304 Inox', '5013116', 'Évier', 'À poser', 'Mitigeur mono-commande', 'Orientable', true, NULL, NULL, NULL, 'Inox', 'Inox');

CREATE TEMP TABLE "_today_mixer_gallery_ranges" (
  "sku" TEXT PRIMARY KEY,
  "start_media_id" BIGINT NOT NULL,
  "end_media_id" BIGINT NOT NULL
);

INSERT INTO "_today_mixer_gallery_ranges" ("sku", "start_media_id", "end_media_id")
VALUES
  ('00232708', 1327, 1329),
  ('00208604', 1330, 1332),
  ('00206938', 1333, 1335),
  ('00232661', 1336, 1338),
  ('00206846', 1339, 1341),
  ('SOP19MITDSFY', 1342, 1344),
  ('00002477', 1345, 1347),
  ('00002478', 1348, 1350),
  ('00006515', 1351, 1353),
  ('00214995', 1354, 1356),
  ('00000758', 1357, 1359),
  ('00202794', 1360, 1362),
  ('00002480', 1363, 1365),
  ('00006524', 1366, 1368),
  ('00221825', 1369, 1371),
  ('00215015', 1372, 1373),
  ('00202800', 1374, 1376),
  ('00219174', 1377, 1379),
  ('00181983', 1380, 1382),
  ('00000761', 1383, 1384);

CREATE TEMP TABLE "_today_mixer_product_media_entries" (
  "sku" TEXT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "role" "ProductMediaRole" NOT NULL,
  "name" TEXT,
  "sort_order" INTEGER NOT NULL,
  "kind" "MediaKind" NOT NULL,
  PRIMARY KEY ("sku", "media_id")
);

INSERT INTO "_today_mixer_product_media_entries" ("sku", "media_id", "role", "name", "sort_order", "kind")
SELECT
  "range"."sku",
  "series"."media_id",
  'GALLERY'::"ProductMediaRole",
  NULL,
  ("series"."media_id" - "range"."start_media_id")::INTEGER,
  'IMAGE'::"MediaKind"
FROM "_today_mixer_gallery_ranges" "range"
CROSS JOIN LATERAL generate_series("range"."start_media_id", "range"."end_media_id") AS "series"("media_id");

INSERT INTO "_today_mixer_product_media_entries" ("sku", "media_id", "role", "name", "sort_order", "kind")
VALUES
  ('00232708', 1300, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00208604', 1301, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00206938', 1302, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00206938', 1303, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),
  ('00232661', 1304, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00206846', 1305, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00206846', 1306, 'TECHNICAL'::"ProductMediaRole", 'Guide d''installation', 1, 'DOCUMENT'::"MediaKind"),
  ('SOP19MITDSFY', 1307, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00002477', 1308, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00002478', 1309, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00006515', 1310, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00006515', 1311, 'TECHNICAL'::"ProductMediaRole", 'Mode d''emploi entretien [conseil de nettoyage]', 1, 'DOCUMENT'::"MediaKind"),
  ('00006515', 1312, 'TECHNICAL'::"ProductMediaRole", 'Mode d''emploi entretien [écrou]', 2, 'DOCUMENT'::"MediaKind"),
  ('00006515', 1313, 'TECHNICAL'::"ProductMediaRole", 'Mode d''emploi entretien [poignée]', 3, 'DOCUMENT'::"MediaKind"),
  ('00006515', 1314, 'TECHNICAL'::"ProductMediaRole", 'Notice de montage [mitigeur]', 4, 'DOCUMENT'::"MediaKind"),
  ('00000758', 1315, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00202794', 1316, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00002480', 1317, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00006524', 1318, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00221825', 1319, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00221825', 1320, 'TECHNICAL'::"ProductMediaRole", 'Manuel d''installation', 1, 'DOCUMENT'::"MediaKind"),
  ('00202800', 1321, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00219174', 1322, 'TECHNICAL'::"ProductMediaRole", 'Conseils d''entretien', 0, 'DOCUMENT'::"MediaKind"),
  ('00219174', 1323, 'TECHNICAL'::"ProductMediaRole", 'Notice d''installation [1]', 1, 'DOCUMENT'::"MediaKind"),
  ('00219174', 1324, 'TECHNICAL'::"ProductMediaRole", 'Notice d''installation [2]', 2, 'DOCUMENT'::"MediaKind"),
  ('00219174', 1325, 'TECHNICAL'::"ProductMediaRole", 'Notice d''installation [3]', 3, 'DOCUMENT'::"MediaKind"),
  ('00181983', 1326, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00221825', 1385, 'CERTIFICATE'::"ProductMediaRole", 'Certificat de conformité', 0, 'DOCUMENT'::"MediaKind");

CREATE TEMP TABLE "_today_mixer_certificate_slugs" (
  "sku" TEXT NOT NULL,
  "certificate_slug" TEXT NOT NULL,
  PRIMARY KEY ("sku", "certificate_slug")
);

INSERT INTO "_today_mixer_certificate_slugs" ("sku", "certificate_slug")
VALUES
  ('00221825', 'aenor'),
  ('00221825', 'dvgw'),
  ('00221825', 'nf');

DO $$
DECLARE
  missing_media_count INTEGER;
  missing_certificate_count INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM "_today_mixer_products") <> 20 THEN
    RAISE EXCEPTION 'Expected 20 ZIP-backed products in this Today mixer seed.';
  END IF;

  IF (SELECT COUNT(*) FROM "_today_mixer_product_media_entries") <> 86 THEN
    RAISE EXCEPTION 'Expected 86 media links in this Today mixer seed.';
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
    FROM "_today_mixer_products" "seed"
    LEFT JOIN "organizations" "brand"
      ON "brand"."slug" = "seed"."brand_slug"
      AND "brand"."is_product_brand" = true
    WHERE "brand"."id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot seed Today mixers: at least one expected brand is missing.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "_today_mixer_products" "seed"
    LEFT JOIN "product_type_templates" "template"
      ON "template"."slug" = "seed"."product_type_slug"
    WHERE "template"."id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot seed Today mixers: at least one expected product type is missing.';
  END IF;

  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_today_mixer_product_media_entries" "expected"
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
  FROM "_today_mixer_certificate_slugs" "expected"
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
              WHEN "seed"."mixer_usage" = 'Évier' THEN 'Ce mitigeur d''évier ' || COALESCE("seed"."product_line" || ' ', '') || 'apporte une robinetterie pratique pour la cuisine, avec une finition ' || lower("seed"."finish_value") || ' facile à coordonner.'
              ELSE 'Ce mitigeur de douche ' || COALESCE("seed"."product_line" || ' ', '') || 'offre une robinetterie fiable pour la salle de bain, avec une finition ' || lower("seed"."finish_value") || ' et une commande simple.'
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
              WHEN "seed"."installation_type" = 'À encastrer' THEN 'La pose encastrée demande de vérifier les réservations murales, les raccordements et les accès de maintenance avant installation.'
              WHEN "seed"."mixer_usage" = 'Évier' AND "seed"."spout_type" IS NOT NULL THEN 'Le type de bec ' || lower("seed"."spout_type") || ' aide à adapter le mitigeur à la profondeur de l''évier et aux gestes quotidiens.'
              ELSE 'La pose murale ou apparente facilite l''association avec les équipements existants et garde la zone d''usage lisible.'
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
                FROM "_today_mixer_product_media_entries" "media_entry"
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
        "seed"."spout_type",
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
FROM "_today_mixer_products" "seed"
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
FROM "_today_mixer_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'robinetterie'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_today_mixer_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    SELECT "key" FROM "_today_mixer_attribute_definitions"
  );

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "product"."product_type_id",
    "attribute_seed"."name",
    "attribute_seed"."value"
  FROM "_today_mixer_products" "seed"
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
      ('spout_type', "seed"."spout_type"),
      ('swivel_spout', CASE WHEN "seed"."swivel_spout" IS NULL THEN NULL ELSE "seed"."swivel_spout"::TEXT END),
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
USING "products" "product", "_today_mixer_products" "seed"
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
FROM "_today_mixer_product_media_entries" "entry"
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
USING "products" "product", "_today_mixer_certificate_slugs" "seed", "product_certificates" "certificate"
WHERE "association"."product_id" = "product"."id"
  AND "association"."certificate_id" = "certificate"."id"
  AND "product"."sku" = "seed"."sku"
  AND "certificate"."slug" = "seed"."certificate_slug";

INSERT INTO "product_certificate_associations" ("product_id", "certificate_id")
SELECT
  "product"."id",
  "certificate"."id"
FROM "_today_mixer_certificate_slugs" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_certificates" "certificate"
  ON "certificate"."slug" = "seed"."certificate_slug"
ON CONFLICT ("product_id", "certificate_id") DO NOTHING;
