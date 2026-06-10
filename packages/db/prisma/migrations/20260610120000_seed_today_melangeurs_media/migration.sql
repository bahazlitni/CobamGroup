-- Seed the ZIP-backed MEL.* mixer products from the current Today package.
-- Additional-information SKUs without a matching product folder are intentionally ignored.
-- Color/Finish rule: these rows store finish only; no color attributes are inserted.

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES
  ('CHROME', 'Chrome', '#C8CDD0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('BRONZE_ANTIQUE', 'Bronze antique', '#8A6A3F', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "color" = EXCLUDED."color",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_mel_product_types" (
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

INSERT INTO "_today_mel_product_types" (
  "slug", "name", "display_name", "hint", "description", "title_seo", "description_seo",
  "sort_order", "preset_tags"
)
VALUES
  (
    'melangeur-douche-bain',
    'Mélangeur douche / bain-douche',
    'Mélangeur douche / bain-douche',
    'Mélangeur à deux commandes pour douche ou bain-douche.',
    'Modèles de mélangeurs à deux poignées destinés aux installations de douche et bain-douche.',
    'Mélangeur douche / bain-douche',
    'Mélangeurs douche et bain-douche pour robinetterie de salle de bain chez COBAM GROUP en Tunisie.',
    340,
    'melangeur douche bain-douche robinetterie salle-de-bain'
  ),
  (
    'melangeur-lavabo-vasque',
    'Mélangeur lavabo / vasque',
    'Mélangeur lavabo / vasque',
    'Mélangeur à deux commandes pour lavabo ou vasque.',
    'Modèles de mélangeurs à deux poignées pour lavabos, vasques et plans vasque.',
    'Mélangeur lavabo / vasque',
    'Mélangeurs lavabo et vasque pour robinetterie de salle de bain chez COBAM GROUP en Tunisie.',
    350,
    'melangeur lavabo vasque robinetterie salle-de-bain'
  ),
  (
    'melangeur-toilette',
    'Mélangeur toilette',
    'Mélangeur toilette',
    'Mélangeur à deux commandes pour point d''eau toilette.',
    'Modèles de mélangeurs à deux poignées pour équipements toilette et points d''eau sanitaires.',
    'Mélangeur toilette',
    'Mélangeurs toilette pour robinetterie sanitaire chez COBAM GROUP en Tunisie.',
    360,
    'melangeur toilette robinetterie sanitaire salle-de-bain'
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
FROM "_today_mel_product_types" "seed"
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
FROM "_today_mel_product_types" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."slug"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'robinetterie'
ON CONFLICT ("product_type_id", "subcategory_id") DO NOTHING;

CREATE TEMP TABLE "_today_mel_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_today_mel_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
SELECT "slug", 'filtres-principaux', 'Filtres principaux', 0
FROM "_today_mel_product_types"
UNION ALL
SELECT "slug", 'caracteristiques', 'Caractéristiques', 10
FROM "_today_mel_product_types";

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
FROM "_today_mel_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_mel_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_today_mel_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options"
)
VALUES
  ('finish', 'Finition', NULL, 'FINISH'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('manufacturer_ref', 'Référence fabricant', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('product_line', 'Gamme', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('mixer_usage', 'Usage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Bain-douche', 'Douche', 'Lavabo', 'Toilette', 'Vasque']::TEXT[]),
  ('installation_type', 'Pose', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Mural', 'À poser']::TEXT[]),
  ('handle_type', 'Commande robinet', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Mélangeur 2 poignées']::TEXT[]),
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
FROM "_today_mel_attribute_definitions"
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

CREATE TEMP TABLE "_today_mel_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_today_mel_type_attributes" (
  "product_type_slug", "key", "group_slug", "is_filterable", "sort_order"
)
VALUES
  ('melangeur-douche-bain', 'finish', 'filtres-principaux', true, 0),
  ('melangeur-douche-bain', 'diverter', 'filtres-principaux', true, 10),
  ('melangeur-douche-bain', 'installation_type', 'filtres-principaux', true, 20),
  ('melangeur-douche-bain', 'handle_type', 'filtres-principaux', true, 30),
  ('melangeur-douche-bain', 'with_shower_kit', 'filtres-principaux', true, 40),
  ('melangeur-douche-bain', 'manufacturer_ref', 'caracteristiques', true, 50),
  ('melangeur-douche-bain', 'product_line', 'caracteristiques', true, 60),
  ('melangeur-douche-bain', 'mixer_usage', 'caracteristiques', true, 70),
  ('melangeur-lavabo-vasque', 'finish', 'filtres-principaux', true, 0),
  ('melangeur-lavabo-vasque', 'installation_type', 'filtres-principaux', true, 20),
  ('melangeur-lavabo-vasque', 'handle_type', 'filtres-principaux', true, 30),
  ('melangeur-lavabo-vasque', 'manufacturer_ref', 'caracteristiques', true, 50),
  ('melangeur-lavabo-vasque', 'product_line', 'caracteristiques', true, 60),
  ('melangeur-lavabo-vasque', 'mixer_usage', 'caracteristiques', true, 70),
  ('melangeur-toilette', 'finish', 'filtres-principaux', true, 0),
  ('melangeur-toilette', 'installation_type', 'filtres-principaux', true, 20),
  ('melangeur-toilette', 'handle_type', 'filtres-principaux', true, 30),
  ('melangeur-toilette', 'manufacturer_ref', 'caracteristiques', true, 50),
  ('melangeur-toilette', 'product_line', 'caracteristiques', true, 60),
  ('melangeur-toilette', 'mixer_usage', 'caracteristiques', true, 70);

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
FROM "_today_mel_type_attributes" "seed"
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

CREATE TEMP TABLE "_today_mel_products" (
  "sku" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "brand_slug" TEXT,
  "product_type_slug" TEXT NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "product_line" TEXT,
  "manufacturer_ref" TEXT,
  "mixer_usage" TEXT NOT NULL,
  "installation_type" TEXT NOT NULL,
  "handle_type" TEXT NOT NULL,
  "diverter" BOOLEAN,
  "with_shower_kit" BOOLEAN,
  "finish_value" TEXT NOT NULL
);

INSERT INTO "_today_mel_products" (
  "sku", "slug", "name", "display_name", "brand_slug", "product_type_slug",
  "price_ttc", "stock_available", "product_line", "manufacturer_ref", "mixer_usage",
  "installation_type", "handle_type", "diverter", "with_shower_kit", "finish_value"
)
VALUES
  ('00190961', 'melangeur-bain-douche-artistique-trefle-a2707-00190961', 'MEL.B.DOUCHE ARTISTIQUE TREFLE A2707', 'Mélangeur bain-douche artistique Trèfle A2707 bronze antique', NULL, 'melangeur-douche-bain', 658.820, 2.000, 'Artistique Trèfle', 'A2707', 'Bain-douche', 'Mural', 'Mélangeur 2 poignées', true, true, 'Bronze antique'),
  ('00002407', 'sopal-melangeur-bain-douche-monastir-3-00002407', 'MEL.B.DOUCHE MONASTIR 3 SOPAL', 'Mélangeur bain-douche Monastir 3 chrome Sopal', 'sopal', 'melangeur-douche-bain', 302.000, 2.000, 'Monastir 3', NULL, 'Bain-douche', 'Mural', 'Mélangeur 2 poignées', true, false, 'Chrome'),
  ('00002408', 'sopal-melangeur-bain-douche-salakta-00002408', 'MEL.B.DOUCHE SALAKTA SOPAL', 'Mélangeur bain-douche Salakta chrome Sopal', 'sopal', 'melangeur-douche-bain', 138.500, 3.000, 'Salakta', NULL, 'Bain-douche', 'Mural', 'Mélangeur 2 poignées', true, false, 'Chrome'),
  ('00000692', 'sopal-melangeur-bain-douche-tabarka-00000692', 'MEL.B.DOUCHE TABARKA SOPAL', 'Mélangeur bain-douche Tabarka chrome Sopal', 'sopal', 'melangeur-douche-bain', 217.730, 1.000, 'Tabarka', NULL, 'Bain-douche', 'Mural', 'Mélangeur 2 poignées', true, false, 'Chrome'),
  ('00002410', 'sopal-melangeur-bain-douche-tozeur-00002410', 'MEL.B.DOUCHE TOZEUR SOPAL', 'Mélangeur bain-douche Tozeur chrome Sopal', 'sopal', 'melangeur-douche-bain', 185.600, 3.000, 'Tozeur', NULL, 'Bain-douche', 'Mural', 'Mélangeur 2 poignées', true, false, 'Chrome'),
  ('00002419', 'sopal-melangeur-douche-salakta-00002419', 'MEL.DOUCHE SALAKTA SOPAL', 'Mélangeur de douche Salakta chrome Sopal', 'sopal', 'melangeur-douche-bain', 73.000, 1.000, 'Salakta', NULL, 'Douche', 'Mural', 'Mélangeur 2 poignées', false, false, 'Chrome'),
  ('00190992', 'melangeur-lavabo-artistique-trefle-a2701-00190992', 'MEL.LAV ARTISTIQUE TREFLE A2701', 'Mélangeur lavabo artistique Trèfle A2701 bronze antique', NULL, 'melangeur-lavabo-vasque', 382.350, 1.000, 'Artistique Trèfle', 'A2701', 'Lavabo', 'À poser', 'Mélangeur 2 poignées', NULL, NULL, 'Bronze antique'),
  ('00002434', 'sopal-melangeur-toilette-tabarka-00002434', 'MEL.TOILETTE TABARKA SOPAL', 'Mélangeur toilette Tabarka chrome Sopal', 'sopal', 'melangeur-toilette', 114.705, 2.000, 'Tabarka', NULL, 'Toilette', 'Mural', 'Mélangeur 2 poignées', NULL, NULL, 'Chrome'),
  ('00190978', 'melangeur-vasque-longue-artistique-trefle-a8004-00190978', 'MEL.VASQUE LONGUE ARTISTIQUE TREFLE A8004', 'Mélangeur vasque longue artistique Trèfle A8004 bronze antique', NULL, 'melangeur-lavabo-vasque', 513.000, 1.000, 'Artistique Trèfle', 'A8004', 'Vasque', 'À poser', 'Mélangeur 2 poignées', NULL, NULL, 'Bronze antique');

CREATE TEMP TABLE "_today_mel_gallery_ranges" (
  "sku" TEXT PRIMARY KEY,
  "start_media_id" BIGINT NOT NULL,
  "end_media_id" BIGINT NOT NULL
);

INSERT INTO "_today_mel_gallery_ranges" ("sku", "start_media_id", "end_media_id")
VALUES
  ('00190961', 1391, 1392),
  ('00002407', 1393, 1395),
  ('00002408', 1396, 1398),
  ('00000692', 1399, 1401),
  ('00002410', 1402, 1404),
  ('00002419', 1405, 1407),
  ('00190992', 1408, 1409),
  ('00002434', 1410, 1412),
  ('00190978', 1413, 1414);

CREATE TEMP TABLE "_today_mel_product_media_entries" (
  "sku" TEXT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "role" "ProductMediaRole" NOT NULL,
  "name" TEXT,
  "sort_order" INTEGER NOT NULL,
  "kind" "MediaKind" NOT NULL,
  PRIMARY KEY ("sku", "media_id")
);

INSERT INTO "_today_mel_product_media_entries" ("sku", "media_id", "role", "name", "sort_order", "kind")
SELECT
  "range"."sku",
  "series"."media_id",
  'GALLERY'::"ProductMediaRole",
  NULL,
  ("series"."media_id" - "range"."start_media_id")::INTEGER,
  'IMAGE'::"MediaKind"
FROM "_today_mel_gallery_ranges" "range"
CROSS JOIN LATERAL generate_series("range"."start_media_id", "range"."end_media_id") AS "series"("media_id");

INSERT INTO "_today_mel_product_media_entries" ("sku", "media_id", "role", "name", "sort_order", "kind")
VALUES
  ('00002407', 1386, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00002408', 1387, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00000692', 1388, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00002410', 1389, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind"),
  ('00002434', 1390, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 0, 'DOCUMENT'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
  conflict_count INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM "_today_mel_products") <> 9 THEN
    RAISE EXCEPTION 'Expected 9 ZIP-backed products in this Today MEL seed.';
  END IF;

  IF (SELECT COUNT(*) FROM "_today_mel_product_media_entries") <> 29 THEN
    RAISE EXCEPTION 'Expected 29 media links in this Today MEL seed.';
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

  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_today_mel_product_media_entries" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today MEL media: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;

  SELECT COUNT(*)
  INTO conflict_count
  FROM "product_type_templates" "template"
  WHERE "template"."slug" IN (SELECT "slug" FROM "_today_mel_product_types")
    AND "template"."has_color" = true
    AND "template"."has_finish" = true;

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today MEL templates: % template(s) still expose Color and Finish together.', conflict_count;
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
              WHEN "seed"."mixer_usage" = 'Bain-douche' THEN 'Ce mélangeur bain-douche à deux poignées permet de régler séparément l''eau chaude et l''eau froide, avec une finition ' || lower("seed"."finish_value") || ' adaptée aux salles de bain classiques.'
              WHEN "seed"."mixer_usage" = 'Douche' THEN 'Ce mélangeur de douche à deux poignées offre une solution simple et robuste pour les installations murales de salle de bain.'
              WHEN "seed"."mixer_usage" = 'Toilette' THEN 'Ce mélangeur toilette à deux poignées complète un point d''eau sanitaire avec une finition ' || lower("seed"."finish_value") || ' facile à associer.'
              ELSE 'Ce mélangeur ' || lower("seed"."mixer_usage") || ' à deux poignées apporte une robinetterie décorative et fonctionnelle avec une finition ' || lower("seed"."finish_value") || '.'
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
              WHEN "seed"."installation_type" = 'À poser' THEN 'La pose sur appareil sanitaire convient aux lavabos et vasques qui demandent une commande traditionnelle et une présence visuelle marquée.'
              ELSE 'La pose murale facilite l''intégration dans une zone douche ou bain-douche et garde les commandes accessibles.'
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
                FROM "_today_mel_product_media_entries" "media_entry"
                WHERE "media_entry"."sku" = "seed"."sku"
                  AND "media_entry"."role" = 'TECHNICAL'::"ProductMediaRole"
              ) THEN 'La fiche technique jointe permet de vérifier les dimensions, les raccordements et les conditions de pose avant installation.'
              ELSE 'Les visuels associés permettent d''identifier la finition, le style et les proportions du produit.'
            END
          )
        )
      )
    )
  ),
  LEFT("seed"."display_name", 60),
  LEFT("seed"."display_name" || ' disponible chez COBAM GROUP en Tunisie pour les projets de robinetterie sanitaire.', 160),
  regexp_replace(
    lower(
      concat_ws(
        ' ',
        "brand"."name",
        'melangeur',
        'mélangeur',
        'robinetterie',
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
FROM "_today_mel_products" "seed"
LEFT JOIN "organizations" "brand"
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
FROM "_today_mel_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'robinetterie'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_today_mel_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    SELECT "key" FROM "_today_mel_attribute_definitions"
    UNION ALL
    SELECT 'color'
  );

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "product"."product_type_id",
    "attribute_seed"."name",
    "attribute_seed"."value"
  FROM "_today_mel_products" "seed"
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
USING "products" "product", "_today_mel_products" "seed"
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
FROM "_today_mel_product_media_entries" "entry"
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

DO $$
DECLARE
  product_conflicts INTEGER;
  template_conflicts INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO product_conflicts
  FROM "_today_mel_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  WHERE EXISTS (
    SELECT 1 FROM "product_attributes" "attribute"
    WHERE "attribute"."product_id" = "product"."id"
      AND lower("attribute"."name") = 'finish'
  )
    AND EXISTS (
    SELECT 1 FROM "product_attributes" "attribute"
    WHERE "attribute"."product_id" = "product"."id"
      AND lower("attribute"."name") = 'color'
  );

  IF product_conflicts > 0 THEN
    RAISE EXCEPTION 'Today MEL seed created % product(s) with both Color and Finish.', product_conflicts;
  END IF;

  SELECT COUNT(*)
  INTO template_conflicts
  FROM "_today_mel_product_types" "seed"
  JOIN "product_type_templates" "template"
    ON "template"."slug" = "seed"."slug"
  WHERE "template"."has_color" = true
    AND "template"."has_finish" = true;

  IF template_conflicts > 0 THEN
    RAISE EXCEPTION 'Today MEL seed created % template(s) with both Color and Finish.', template_conflicts;
  END IF;
END $$;
