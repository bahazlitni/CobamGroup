-- Correct the Today MIT.LAV* lavabo seed with accented French data.
-- The previous seed migration is already deployed, so this migration amends the data in place.
-- Finish/Color catalog rule: reuse existing finish/color rows and remove the duplicate finish introduced by the seed.

DO $$
DECLARE
  chrome_finish_count INTEGER;
  matt_black_finish_count INTEGER;
  chrome_color_count INTEGER;
  black_color_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO chrome_finish_count
  FROM "product_finishes"
  WHERE "key" = 'CHROME'
    AND "label" = 'Chrome';

  IF chrome_finish_count = 0 THEN
    RAISE EXCEPTION 'Cannot refine Today lavabo seed: existing Chrome finish is missing.';
  END IF;

  SELECT COUNT(*)
  INTO matt_black_finish_count
  FROM "product_finishes"
  WHERE "key" = 'MATT_BLACK'
    AND "label" = 'Noir mat';

  IF matt_black_finish_count = 0 THEN
    RAISE EXCEPTION 'Cannot refine Today lavabo seed: existing Noir mat finish MATT_BLACK is missing.';
  END IF;

  SELECT COUNT(*)
  INTO chrome_color_count
  FROM "product_colors"
  WHERE "key" = 'CHROME'
    OR lower("label") = 'chrome';

  SELECT COUNT(*)
  INTO black_color_count
  FROM "product_colors"
  WHERE "key" IN ('NOIR', 'noir')
    OR lower("label") = 'noir';

  IF chrome_color_count = 0 OR black_color_count = 0 THEN
    RAISE NOTICE 'Today lavabo seed uses finishes only. Existing color catalog rows found: chrome=%, noir=%.', chrome_color_count, black_color_count;
  END IF;
END $$;

DELETE FROM "product_finishes"
WHERE "key" = 'NOIR_MAT'
  AND "image_media_id" IS NULL;

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES ('DORE_BROSSE', 'Doré brossé', '#C8A24A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "color" = EXCLUDED."color",
  "updated_at" = CURRENT_TIMESTAMP;

UPDATE "product_type_templates"
SET
  "name" = 'Mitigeur lavabo / vasque',
  "display_name" = 'Mitigeur lavabo / vasque',
  "hint" = 'Mitigeur mono-commande pour lavabo, vasque ou plan vasque.',
  "description" = 'Sélection de mitigeurs de lavabo et de vasque pour salles de bain, en pose sur appareil, bec haut ou pose encastrée murale.',
  "title_seo" = 'Mitigeur lavabo / vasque',
  "description_seo" = 'Mitigeurs lavabo et vasque pour robinetterie de salle de bain chez COBAM GROUP en Tunisie.',
  "has_color" = false,
  "has_finish" = true,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "slug" = 'mitigeur-lavabo-vasque';

UPDATE "product_attribute_groups" "attribute_group"
SET
  "name" = CASE
    WHEN "attribute_group"."slug" = 'caracteristiques' THEN 'Caractéristiques'
    ELSE "attribute_group"."name"
  END,
  "updated_at" = CURRENT_TIMESTAMP
FROM "product_type_templates" "template"
WHERE "attribute_group"."product_type_id" = "template"."id"
  AND "template"."slug" = 'mitigeur-lavabo-vasque'
  AND "attribute_group"."slug" IN ('filtres-principaux', 'caracteristiques');

UPDATE "product_attribute_definitions"
SET
  "label" = CASE "key"
    WHEN 'manufacturer_ref' THEN 'Référence fabricant'
    ELSE "label"
  END,
  "select_options" = CASE "key"
    WHEN 'installation_type' THEN ARRAY(
      SELECT DISTINCT "normalized_option"
      FROM unnest("select_options" || ARRAY['À encastrer', 'À poser', 'Mural encastré']::TEXT[]) AS "source_option"
      CROSS JOIN LATERAL (
        VALUES (
          CASE "source_option"
            WHEN 'A encastrer' THEN 'À encastrer'
            WHEN 'A poser' THEN 'À poser'
            WHEN 'Mural encastre' THEN 'Mural encastré'
            ELSE "source_option"
          END
        )
      ) AS "normalized"("normalized_option")
      WHERE "normalized_option" <> ''
      ORDER BY "normalized_option"
    )
    ELSE "select_options"
  END,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "key" IN ('manufacturer_ref', 'installation_type');

CREATE TEMP TABLE "_today_lav_accented_products" (
  "sku" TEXT PRIMARY KEY,
  "display_name" TEXT NOT NULL,
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

INSERT INTO "_today_lav_accented_products" (
  "sku", "display_name", "finish_value", "manufacturer_ref", "product_line",
  "mixer_usage", "installation_type", "handle_type", "spout_type", "coolstart", "visible_part_only"
)
VALUES
  ('00221795', 'Mitigeur lavabo Eco CoolStart 21810401 chromé TRES', 'Chrome', '21810401 / AJ0301', 'Eco CoolStart', 'Lavabo', 'À poser', 'Mitigeur mono-commande', 'Bec standard', true, NULL),
  ('00221528', 'Mitigeur lavabo mural ORP-CHR-10233NKPM chromé Jaquar', 'Chrome', 'ORP-CHR-10233NKPM', 'ORP', 'Lavabo', 'Mural encastré', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00252454', 'Mitigeur lavabo mural Laguna LAG-BLM-91231NK noir mat Jaquar', 'Noir mat', 'LAG-BLM-91231NK / ALD-CHR', 'Laguna', 'Lavabo', 'Mural encastré', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00252461', 'Mitigeur lavabo encastré 2 trous Laguna LAG-CHR-91231NK chromé Jaquar', 'Chrome', 'LAG-CHR-91231NK', 'Laguna', 'Lavabo', 'Mural encastré', 'Mitigeur mono-commande', 'Mural 2 trous', NULL, NULL),
  ('00252362', 'Mitigeur lavabo mural OPP-GBP-15233NKPM doré brossé Jaquar', 'Doré brossé', 'OPP-GBP-15233NKPM', 'OPP', 'Lavabo', 'Mural encastré', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00206679', 'Mitigeur lavabo mural ALI-CHR-85233NK chromé Jaquar', 'Chrome', 'ALI-CHR-85233NK', 'ALI', 'Lavabo', 'Mural encastré', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00252355', 'Mitigeur lavabo mural ARIA ARI-CHR-39233NK chromé Jaquar', 'Chrome', 'ARI-CHR-39233NK', 'ARIA', 'Lavabo', 'Mural encastré', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00252478', 'Mitigeur lavabo mural FLP-CHR-5233NKPM chromé Jaquar', 'Chrome', 'FLP-CHR-5233NKPM', 'FLP', 'Lavabo', 'Mural encastré', 'Mitigeur mono-commande', 'Partie apparente murale', NULL, true),
  ('00221801', 'Mitigeur lavabo long Canigo 21820301 chromé TRES', 'Chrome', '21820301 / AJ0211', 'Canigo', 'Lavabo', 'À poser', 'Mitigeur mono-commande', 'Bec long', NULL, NULL),
  ('00202817', 'Mitigeur lavabo encastré Sfax chromé Sopal', 'Chrome', NULL, 'Sfax', 'Lavabo', 'À encastrer', 'Mitigeur mono-commande', 'Bec standard', NULL, NULL),
  ('00208154', 'Mitigeur lavabo ALI-BLM-85011B noir mat Jaquar', 'Noir mat', 'ALI-BLM-85011B', 'ALI', 'Lavabo', 'À poser', 'Mitigeur mono-commande', 'Bec standard', NULL, NULL),
  ('00206723', 'Mitigeur lavabo ALI-CHR-85011B chromé Jaquar', 'Chrome', 'ALI-CHR-85011B', 'ALI', 'Lavabo', 'À poser', 'Mitigeur mono-commande', 'Bec standard', NULL, NULL),
  ('00214827', 'Mitigeur lavabo Alpin 5011404 chromé Venisia', 'Chrome', '5011404', 'Alpin', 'Lavabo', 'À poser', 'Mitigeur mono-commande', 'Bec standard', NULL, NULL),
  ('00229043', 'Mitigeur lavabo ARI-CHR-39001B chromé Jaquar', 'Chrome', 'ARI-CHR-39001B', 'ARI', 'Lavabo', 'À poser', 'Mitigeur mono-commande', 'Bec standard', NULL, NULL),
  ('00232685', 'Mitigeur lavabo bec haut ARI-CHR-39005B chromé Jaquar', 'Chrome', 'ARI-CHR-39005B', 'ARI', 'Lavabo', 'À poser', 'Mitigeur mono-commande', 'Bec haut', NULL, NULL),
  ('00252430', 'Mitigeur lavabo bec haut Laguna LAG-CHR-91005B chromé Jaquar', 'Chrome', 'LAG-CHR-91005B', 'Laguna', 'Lavabo', 'À poser', 'Mitigeur mono-commande', 'Bec haut', NULL, NULL),
  ('00252423', 'Mitigeur lavabo bec haut Laguna LAG-BLM-91005B noir mat Jaquar', 'Noir mat', 'LAG-BLM-91005B', 'Laguna', 'Lavabo', 'À poser', 'Mitigeur mono-commande', 'Bec haut', NULL, NULL);

UPDATE "products" "product"
SET
  "display_name" = "seed"."display_name",
  "rich_text_description" = jsonb_build_object(
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
              WHEN "seed"."installation_type" = 'Mural encastré' THEN 'La pose murale encastrée garde le plan vasque dégagé et demande de vérifier les réservations ainsi que les raccordements avant installation.'
              WHEN "seed"."installation_type" = 'À encastrer' THEN 'La pose encastrée permet une intégration discrète et doit être contrôlée avec la fiche technique avant validation du support.'
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
                FROM "product_media" "media_entry"
                WHERE "media_entry"."product_id" = "product"."id"
                  AND "media_entry"."role" <> 'GALLERY'::"ProductMediaRole"
              ) THEN 'Les documents joints permettent de vérifier les dimensions, la pose et la conformité avant commande.'
              ELSE 'Les visuels associés permettent d''identifier la silhouette, la finition et l''intégration du produit dans le projet.'
            END
          )
        )
      )
    )
  ),
  "title_seo" = LEFT("seed"."display_name", 60),
  "description_seo" = LEFT("seed"."display_name" || ' disponible chez COBAM GROUP en Tunisie pour la robinetterie de salle de bain.', 160),
  "tags" = regexp_replace(
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
  "updated_at" = CURRENT_TIMESTAMP
FROM "_today_lav_accented_products" "seed"
JOIN "organizations" "brand"
  ON true
WHERE "product"."sku" = "seed"."sku"
  AND "brand"."id" = "product"."brand_id";

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_today_lav_accented_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    'finish',
    'manufacturer_ref',
    'product_line',
    'mixer_usage',
    'installation_type',
    'handle_type',
    'spout_type',
    'coolstart',
    'visible_part_only',
    'color'
  );

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "product"."product_type_id",
    "attribute_seed"."name",
    "attribute_seed"."value"
  FROM "_today_lav_accented_products" "seed"
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

UPDATE "product_families"
SET
  "name" = CASE "slug"
    WHEN 'jaquar-mitigeur-lavabo-mural-91231nk' THEN 'Mitigeur lavabo mural 91231NK Jaquar'
    WHEN 'jaquar-mitigeur-lavabo-ali-85011b' THEN 'Mitigeur lavabo ALI 85011B Jaquar'
    WHEN 'jaquar-mitigeur-lavabo-bec-haut-laguna-91005b' THEN 'Mitigeur lavabo bec haut Laguna 91005B Jaquar'
    ELSE "name"
  END,
  "subtitle" = CASE "slug"
    WHEN 'jaquar-mitigeur-lavabo-mural-91231nk' THEN 'Famille Laguna encastrée'
    WHEN 'jaquar-mitigeur-lavabo-ali-85011b' THEN 'Famille ALI sur plage'
    WHEN 'jaquar-mitigeur-lavabo-bec-haut-laguna-91005b' THEN 'Famille Laguna bec haut'
    ELSE "subtitle"
  END,
  "description" = CASE "slug"
    WHEN 'jaquar-mitigeur-lavabo-mural-91231nk' THEN 'Famille de mitigeurs lavabo Jaquar Laguna pour pose murale encastrée, avec variante 2 trous chrome et partie apparente noire.'
    WHEN 'jaquar-mitigeur-lavabo-ali-85011b' THEN 'Famille de mitigeurs lavabo Jaquar ALI 85011B pour pose sur appareil, en finition noir mat ou chrome.'
    WHEN 'jaquar-mitigeur-lavabo-bec-haut-laguna-91005b' THEN 'Famille de mitigeurs lavabo bec haut Jaquar Laguna 91005B, proposée en finition chrome ou noir mat.'
    ELSE "description"
  END,
  "description_seo" = CASE "slug"
    WHEN 'jaquar-mitigeur-lavabo-mural-91231nk' THEN 'Mitigeurs lavabo muraux Laguna 91231NK Jaquar en variantes chrome et noir mat chez COBAM GROUP.'
    WHEN 'jaquar-mitigeur-lavabo-ali-85011b' THEN 'Mitigeurs lavabo Jaquar ALI 85011B en finitions noir mat et chrome chez COBAM GROUP.'
    WHEN 'jaquar-mitigeur-lavabo-bec-haut-laguna-91005b' THEN 'Mitigeurs lavabo bec haut Laguna 91005B Jaquar en finitions chrome et noir mat chez COBAM GROUP.'
    ELSE "description_seo"
  END,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "slug" IN (
  'jaquar-mitigeur-lavabo-mural-91231nk',
  'jaquar-mitigeur-lavabo-ali-85011b',
  'jaquar-mitigeur-lavabo-bec-haut-laguna-91005b'
);

CREATE TEMP TABLE "_today_lav_accented_media_names" (
  "sku" TEXT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "name" TEXT NOT NULL,
  PRIMARY KEY ("sku", "media_id")
);

INSERT INTO "_today_lav_accented_media_names" ("sku", "media_id", "name")
VALUES
  ('00221795', 1465, 'Fiche technique'),
  ('00221795', 1466, 'Manuel d''installation'),
  ('00221795', 1495, 'Certificat de conformité'),
  ('00252461', 1469, 'Fiche technique'),
  ('00252461', 1470, 'Guide d''installation'),
  ('00221528', 1467, 'Fiche technique'),
  ('00221528', 1468, 'Guide d''installation'),
  ('00252454', 1471, 'Fiche technique'),
  ('00252454', 1472, 'Guide d''installation'),
  ('00252362', 1473, 'Fiche technique'),
  ('00252362', 1474, 'Guide d''installation'),
  ('00206679', 1475, 'Fiche technique'),
  ('00206679', 1476, 'Guide d''installation'),
  ('00252355', 1477, 'Fiche technique'),
  ('00252355', 1478, 'Guide d''installation'),
  ('00252478', 1479, 'Fiche technique'),
  ('00252478', 1480, 'Guide d''installation'),
  ('00221801', 1481, 'Fiche technique'),
  ('00221801', 1482, 'Manuel d''installation'),
  ('00221801', 1496, 'Certificat de conformité'),
  ('00208154', 1485, 'Fiche technique'),
  ('00208154', 1486, 'Guide d''installation'),
  ('00206723', 1483, 'Fiche technique'),
  ('00206723', 1484, 'Guide d''installation'),
  ('00229043', 1487, 'Fiche technique'),
  ('00229043', 1488, 'Guide d''installation'),
  ('00232685', 1493, 'Fiche technique'),
  ('00232685', 1494, 'Guide d''installation'),
  ('00252430', 1491, 'Fiche technique'),
  ('00252430', 1492, 'Guide d''installation'),
  ('00252423', 1489, 'Fiche technique'),
  ('00252423', 1490, 'Guide d''installation');

UPDATE "product_media" "product_media"
SET
  "name" = LEFT(
    COALESCE(
      (
        SELECT "media_name"."name"
        FROM "_today_lav_accented_media_names" "media_name"
        WHERE "media_name"."sku" = "seed"."sku"
          AND "media_name"."media_id" = "product_media"."media_id"
      ),
      "product_media"."name"
    ),
    255
  ),
  "alt_text" = LEFT(
    CASE
      WHEN "product_media"."role" = 'GALLERY'::"ProductMediaRole"
        THEN "product"."display_name" || ' - visuel ' || ("product_media"."sort_order" + 1)::TEXT
      ELSE COALESCE(
        (
          SELECT "media_name"."name"
          FROM "_today_lav_accented_media_names" "media_name"
          WHERE "media_name"."sku" = "seed"."sku"
            AND "media_name"."media_id" = "product_media"."media_id"
        ),
        "product_media"."name",
        "product"."display_name"
      )
    END,
    255
  ),
  "updated_at" = CURRENT_TIMESTAMP
FROM "_today_lav_accented_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
WHERE "product_media"."product_id" = "product"."id"
  AND "product_media"."role" IN (
    'GALLERY'::"ProductMediaRole",
    'TECHNICAL'::"ProductMediaRole",
    'CERTIFICATE'::"ProductMediaRole"
  );

DO $$
DECLARE
  unaccented_rows INTEGER;
  duplicate_noir_finish_count INTEGER;
  color_finish_conflicts INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unaccented_rows
  FROM "products" "product"
  JOIN "_today_lav_accented_products" "seed"
    ON "seed"."sku" = "product"."sku"
  WHERE "product"."display_name" <> "seed"."display_name";

  IF unaccented_rows > 0 THEN
    RAISE EXCEPTION 'Today lavabo accent refinement failed: % product display name(s) were not updated.', unaccented_rows;
  END IF;

  SELECT COUNT(*)
  INTO duplicate_noir_finish_count
  FROM "product_finishes"
  WHERE "key" = 'NOIR_MAT';

  IF duplicate_noir_finish_count > 0 THEN
    RAISE EXCEPTION 'Today lavabo accent refinement failed: duplicate NOIR_MAT finish still exists.';
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
    JOIN "_today_lav_accented_products" "seed"
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
    RAISE EXCEPTION 'Today lavabo accent refinement produced % product(s) with both Color and Finish attributes.', color_finish_conflicts;
  END IF;
END $$;
