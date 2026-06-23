-- Seed the ZIP-backed P products: Grohe Skate Cosmopolitan 38732 flush plates.
-- The folder is a family: shared installation/care/environment documents with finish-specific technical sheets.

CREATE TEMP TABLE "_p_grohe_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_p_grohe_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1818, 'PLAQUE CARRE 38732 GROHE (CONSEILS D''ENTRETIEN).pdf', 'DOCUMENT'::"MediaKind"),
  (1819, 'PLAQUE CARRE 38732 GROHE (NOTICE D''INSTALLATION [1]).pdf', 'DOCUMENT'::"MediaKind"),
  (1820, 'PLAQUE CARRE 38732 GROHE (NOTICE D''INSTALLATION [2]).pdf', 'DOCUMENT'::"MediaKind"),
  (1821, 'PLAQUE CARRE COOL SUNRESE BROSSE 38732GN0 GROHE (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1822, 'PLAQUE CARRE HARD GRAPHITE BROSSE 38732AL0 GROHE (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1823, 'PLAQUE CARRE 38732 GROHE (DECLARATION ENVIRONNEMENTALE).pdf', 'DOCUMENT'::"MediaKind"),
  (1824, 'PLAQUE CARRE COOL SUNRESE BROSSE 38732GN0 GROHE [1].webp', 'IMAGE'::"MediaKind"),
  (1825, 'PLAQUE CARRE COOL SUNRESE BROSSE 38732GN0 GROHE [2].webp', 'IMAGE'::"MediaKind"),
  (1826, 'PLAQUE CARRE COOL SUNRESE BROSSE 38732GN0 GROHE [3.webp', 'IMAGE'::"MediaKind"),
  (1827, 'PLAQUE CARRE COOL SUNRESE BROSSE 38732GN0 GROHE [4].webp', 'IMAGE'::"MediaKind"),
  (1828, 'PLAQUE CARRE HARD GRAPHITE BROSSE 38732AL0 GROHE [1].webp', 'IMAGE'::"MediaKind"),
  (1829, 'PLAQUE CARRE HARD GRAPHITE BROSSE 38732AL0 GROHE [2].webp', 'IMAGE'::"MediaKind"),
  (1830, 'PLAQUE CARRE HARD GRAPHITE BROSSE 38732AL0 GROHE [3].webp', 'IMAGE'::"MediaKind"),
  (1831, 'PLAQUE CARRE HARD GRAPHITE BROSSE 38732AL0 GROHE [4].webp', 'IMAGE'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
  missing_media_ids TEXT;
BEGIN
  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_p_grohe_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    SELECT string_agg("expected"."media_id"::TEXT, ', ' ORDER BY "expected"."media_id")
    INTO missing_media_ids
    FROM "_p_grohe_expected_media" "expected"
    LEFT JOIN "media" "media"
      ON "media"."id" = "expected"."media_id"
      AND "media"."kind" = "expected"."kind"
      AND "media"."deleted_at" IS NULL
    WHERE "media"."id" IS NULL;

    RAISE EXCEPTION 'P Grohe plaque seed aborted: % expected media row(s) are missing, deleted, or have the wrong media kind. Media IDs: %.', missing_media_count, missing_media_ids;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "product_certificates" WHERE "slug" = 'fdes') THEN
    RAISE EXCEPTION 'P Grohe plaque seed aborted: expected product certificate slug fdes is missing.';
  END IF;
END $$;

INSERT INTO "organizations" (
  "slug", "name", "description", "is_product_brand", "is_reference", "is_partner", "created_at", "updated_at"
)
VALUES (
  'grohe',
  'Grohe',
  'Marque allemande de renommée mondiale fournissant des équipements sanitaires et des systèmes d''eau innovants.',
  true,
  false,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "is_product_brand" = true,
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES
  ('BRUSHED_COOL_SUNRISE_GOLD', 'Cool Sunrise brossé', '#D6A35C', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('BRUSHED_ANTHRACITE_HARD_GRAPHITE', 'Hard Graphite brossé', '#4A4D50', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "product_subcategories" (
  "category_id", "name", "subtitle", "slug", "description", "description_seo",
  "sort_order", "is_active", "visible_ecommerce", "visible_vitrine", "created_at", "updated_at"
)
SELECT
  "category"."id",
  'Plaques de commande WC',
  'Plaques de déclenchement pour WC suspendus',
  'plaques-de-commande-wc',
  'Plaques de commande pour mécanismes de chasse encastrés, bâtis-supports et réservoirs WC compatibles.',
  'Plaques de commande WC pour mécanismes de chasse et bâtis-supports encastrés.',
  36,
  true,
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "product_types" "category"
WHERE "category"."slug" = 'salle-de-bain-et-cuisine'
ON CONFLICT ("category_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "is_active" = true,
  "visible_ecommerce" = true,
  "visible_vitrine" = true,
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
  AND "subcategory"."slug" = 'plaques-de-commande-wc'
WHERE "template"."slug" = 'plaque-commande-wc'
ON CONFLICT ("product_type_id", "subcategory_id") DO NOTHING;

CREATE TEMP TABLE "_p_grohe_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_p_grohe_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
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
FROM "_p_grohe_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_p_grohe_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_p_grohe_attribute_definitions" ("key", "label", "unit", "input_type", "select_options")
VALUES
  ('finish', 'Finition', NULL, 'FINISH'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('number_of_buttons', 'Nombre de touches', 'touches', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('compatible_system', 'Système compatible', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('manufacturer_ref', 'Référence fabricant', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('product_line', 'Gamme', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('dimensions_text', 'Dimensions', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('material', 'Matière', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['ABS']::TEXT[]),
  ('mounting_type', 'Montage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Vertical']::TEXT[]),
  ('activation_type', 'Commande', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Double touche interrompable']::TEXT[]),
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
FROM "_p_grohe_attribute_definitions"
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

CREATE TEMP TABLE "_p_grohe_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_p_grohe_type_attributes" (
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

DELETE FROM "product_type_attributes" "template_attribute"
USING "product_type_templates" "template", "product_attribute_definitions" "definition"
WHERE "template_attribute"."product_type_id" = "template"."id"
  AND "template_attribute"."attribute_definition_id" = "definition"."id"
  AND (
    lower("definition"."key") = 'color'
    OR "definition"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
  )
  AND EXISTS (
    SELECT 1
    FROM "_p_grohe_type_attributes" "seed"
    JOIN "product_attribute_definitions" "seed_definition"
      ON "seed_definition"."key" = "seed"."key"
    WHERE "seed"."product_type_slug" = "template"."slug"
      AND (
        lower("seed_definition"."key") = 'finish'
        OR "seed_definition"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
      )
  );

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
FROM "_p_grohe_type_attributes" "seed"
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

CREATE TEMP TABLE "_p_grohe_products" AS
SELECT *
FROM jsonb_to_recordset($products$
[
  {
    "sku":"00251419",
    "slug":"plaque-commande-skate-cosmopolitan-cool-sunrise-brosse-grohe-38732gn0",
    "name":"PLAQUE CARRE COOL SUNRESE BROSSE 38732GN0 GROHE",
    "display_name":"Plaque de commande Skate Cosmopolitan Cool Sunrise brossé Grohe",
    "brand_slug":"grohe",
    "product_type_slug":"plaque-commande-wc",
    "kind":"VARIANT",
    "family_slug":"plaque-commande-skate-cosmopolitan-38732-grohe",
    "family_name":"Plaque de commande Grohe Skate Cosmopolitan 38732",
    "family_subtitle":"Plaque de commande WC",
    "family_description":"Famille de plaques de commande Grohe Skate Cosmopolitan 38732 pour WC encastrés, avec double touche interrompable et finitions brossées.",
    "family_description_seo":"Plaques de commande Grohe Skate Cosmopolitan 38732 en finitions brossées pour réservoirs encastrés compatibles.",
    "family_main_media_id":1824,
    "family_sort_order":0,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":694.118,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Grohe Skate Cosmopolitan Cool Sunrise",
    "description_seo":"Plaque de commande Grohe Skate Cosmopolitan 38732GN0 en finition Cool Sunrise brossé, double touche et montage vertical.",
    "tags":"plaque-commande wc chasse grohe skate-cosmopolitan 38732 cool-sunrise-brosse double-touche rapid-sl av1 abs",
    "intro":"Cette plaque de commande carrée Grohe Skate Cosmopolitan apporte une finition Cool Sunrise brossé chaleureuse aux WC suspendus équipés d'un réservoir encastré compatible.",
    "details":"La double touche interrompable facilite la gestion de la chasse au quotidien. Le format vertical 156x197 mm, la fabrication en ABS et la finition longue durée Grohe en font une solution soignée pour finaliser un bâti-support Rapid SL compatible.",
    "attributes":[
      {"key":"finish","value":"Cool Sunrise brossé","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Rapid SL avec réservoir de chasse GD 2; mécanisme pneumatique AV1","sort_order":30},
      {"key":"manufacturer_ref","value":"38732GN0","sort_order":40},
      {"key":"product_line","value":"Skate Cosmopolitan","sort_order":50},
      {"key":"dimensions_text","value":"156x197 mm","sort_order":60},
      {"key":"material","value":"ABS","sort_order":70},
      {"key":"mounting_type","value":"Vertical","sort_order":80},
      {"key":"activation_type","value":"Double touche interrompable","sort_order":90},
      {"key":"compatibility_notes","value":"Pour Rapid SLX, prévoir la trappe de visite 66 791 000 vendue séparément.","sort_order":100}
    ],
    "media":[
      {"media_id":1824,"role":"GALLERY","name":"Plaque Grohe Skate Cosmopolitan Cool Sunrise brossé 1","alt_text":"Plaque de commande Grohe Skate Cosmopolitan Cool Sunrise brossé","sort_order":0},
      {"media_id":1825,"role":"GALLERY","name":"Plaque Grohe Skate Cosmopolitan Cool Sunrise brossé 2","alt_text":"Plaque Grohe Skate Cosmopolitan Cool Sunrise brossé vue de détail","sort_order":10},
      {"media_id":1826,"role":"GALLERY","name":"Plaque Grohe Skate Cosmopolitan Cool Sunrise brossé 3","alt_text":"Plaque Grohe 38732GN0 Cool Sunrise brossé en situation","sort_order":20},
      {"media_id":1827,"role":"GALLERY","name":"Plaque Grohe Skate Cosmopolitan Cool Sunrise brossé 4","alt_text":"Plaque de commande WC Grohe Cool Sunrise brossé profil","sort_order":30},
      {"media_id":1821,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique plaque Grohe 38732GN0 Cool Sunrise brossé","sort_order":100},
      {"media_id":1818,"role":"TECHNICAL","name":"Conseils d'entretien","alt_text":"Conseils d'entretien plaque de commande Grohe 38732","sort_order":110},
      {"media_id":1819,"role":"TECHNICAL","name":"Notice d'installation [1]","alt_text":"Notice d'installation plaque de commande Grohe 38732 première partie","sort_order":120},
      {"media_id":1820,"role":"TECHNICAL","name":"Notice d'installation [2]","alt_text":"Notice d'installation plaque de commande Grohe 38732 deuxième partie","sort_order":130},
      {"media_id":1823,"role":"CERTIFICATE","name":"Déclaration environnementale","alt_text":"Déclaration environnementale FDES plaque de commande Grohe","sort_order":200}
    ],
    "certificate_slugs":["fdes"]
  },
  {
    "sku":"00251396",
    "slug":"plaque-commande-skate-cosmopolitan-hard-graphite-brosse-grohe-38732al0",
    "name":"PLAQUE CARRE HARD GRAPHITE BROSSE 38732AL0 GROHE",
    "display_name":"Plaque de commande Skate Cosmopolitan Hard Graphite brossé Grohe",
    "brand_slug":"grohe",
    "product_type_slug":"plaque-commande-wc",
    "kind":"VARIANT",
    "family_slug":"plaque-commande-skate-cosmopolitan-38732-grohe",
    "family_name":"Plaque de commande Grohe Skate Cosmopolitan 38732",
    "family_subtitle":"Plaque de commande WC",
    "family_description":"Famille de plaques de commande Grohe Skate Cosmopolitan 38732 pour WC encastrés, avec double touche interrompable et finitions brossées.",
    "family_description_seo":"Plaques de commande Grohe Skate Cosmopolitan 38732 en finitions brossées pour réservoirs encastrés compatibles.",
    "family_main_media_id":1824,
    "family_sort_order":10,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"plaques-de-commande-wc",
    "price_ttc":889.412,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Plaque Grohe Skate Cosmopolitan Hard Graphite",
    "description_seo":"Plaque de commande Grohe Skate Cosmopolitan 38732AL0 en finition Hard Graphite brossé, double touche et montage vertical.",
    "tags":"plaque-commande wc chasse grohe skate-cosmopolitan 38732 hard-graphite-brosse graphite double-touche rapid-sl av1 abs",
    "intro":"Cette plaque de commande carrée Grohe Skate Cosmopolitan met en avant une finition Hard Graphite brossé, sobre et contemporaine.",
    "details":"Elle reprend le format vertical 156x197 mm avec double touche interrompable pour une commande de chasse pratique. Sa compatibilité Rapid SL avec réservoir GD 2 et son mécanisme pneumatique AV1 permettent de l'intégrer dans les installations WC encastrées prévues pour ce système.",
    "attributes":[
      {"key":"finish","value":"Hard Graphite brossé","sort_order":10},
      {"key":"number_of_buttons","value":"2","sort_order":20},
      {"key":"compatible_system","value":"Rapid SL avec réservoir de chasse GD 2; mécanisme pneumatique AV1","sort_order":30},
      {"key":"manufacturer_ref","value":"38732AL0","sort_order":40},
      {"key":"product_line","value":"Skate Cosmopolitan","sort_order":50},
      {"key":"dimensions_text","value":"156x197 mm","sort_order":60},
      {"key":"material","value":"ABS","sort_order":70},
      {"key":"mounting_type","value":"Vertical","sort_order":80},
      {"key":"activation_type","value":"Double touche interrompable","sort_order":90},
      {"key":"compatibility_notes","value":"Pour Rapid SLX, prévoir la trappe de visite 66 791 000 vendue séparément.","sort_order":100}
    ],
    "media":[
      {"media_id":1828,"role":"GALLERY","name":"Plaque Grohe Skate Cosmopolitan Hard Graphite brossé 1","alt_text":"Plaque de commande Grohe Skate Cosmopolitan Hard Graphite brossé","sort_order":0},
      {"media_id":1829,"role":"GALLERY","name":"Plaque Grohe Skate Cosmopolitan Hard Graphite brossé 2","alt_text":"Plaque Grohe Skate Cosmopolitan Hard Graphite brossé vue de détail","sort_order":10},
      {"media_id":1830,"role":"GALLERY","name":"Plaque Grohe Skate Cosmopolitan Hard Graphite brossé 3","alt_text":"Plaque Grohe 38732AL0 Hard Graphite brossé en situation","sort_order":20},
      {"media_id":1831,"role":"GALLERY","name":"Plaque Grohe Skate Cosmopolitan Hard Graphite brossé 4","alt_text":"Plaque de commande WC Grohe Hard Graphite brossé profil","sort_order":30},
      {"media_id":1822,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique plaque Grohe 38732AL0 Hard Graphite brossé","sort_order":100},
      {"media_id":1818,"role":"TECHNICAL","name":"Conseils d'entretien","alt_text":"Conseils d'entretien plaque de commande Grohe 38732","sort_order":110},
      {"media_id":1819,"role":"TECHNICAL","name":"Notice d'installation [1]","alt_text":"Notice d'installation plaque de commande Grohe 38732 première partie","sort_order":120},
      {"media_id":1820,"role":"TECHNICAL","name":"Notice d'installation [2]","alt_text":"Notice d'installation plaque de commande Grohe 38732 deuxième partie","sort_order":130},
      {"media_id":1823,"role":"CERTIFICATE","name":"Déclaration environnementale","alt_text":"Déclaration environnementale FDES plaque de commande Grohe","sort_order":200}
    ],
    "certificate_slugs":["fdes"]
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

CREATE TEMP TABLE "_p_grohe_certificate_slugs" AS
SELECT
  "seed"."sku",
  "certificate"."slug" AS "certificate_slug"
FROM "_p_grohe_products" "seed"
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
    FROM "_p_grohe_products" "seed"
    LEFT JOIN "product_type_templates" "template"
      ON "template"."slug" = "seed"."product_type_slug"
    WHERE "template"."id" IS NULL

    UNION ALL

    SELECT "seed"."brand_slug" AS "reference"
    FROM "_p_grohe_products" "seed"
    LEFT JOIN "organizations" "brand"
      ON "brand"."slug" = "seed"."brand_slug"
      AND "brand"."is_product_brand" = true
    WHERE "brand"."id" IS NULL

    UNION ALL

    SELECT "seed"."category_slug" || '/' || "seed"."subcategory_slug" AS "reference"
    FROM "_p_grohe_products" "seed"
    LEFT JOIN "product_types" "category"
      ON "category"."slug" = "seed"."category_slug"
    LEFT JOIN "product_subcategories" "subcategory"
      ON "subcategory"."category_id" = "category"."id"
      AND "subcategory"."slug" = "seed"."subcategory_slug"
    WHERE "subcategory"."id" IS NULL
  ) "missing";

  IF missing_reference_count > 0 THEN
    RAISE EXCEPTION 'P Grohe plaque seed aborted: % required catalog reference(s) are missing.', missing_reference_count;
  END IF;

  SELECT COUNT(*)
  INTO missing_certificate_count
  FROM "_p_grohe_certificate_slugs" "expected"
  LEFT JOIN "product_certificates" "certificate"
    ON "certificate"."slug" = "expected"."certificate_slug"
  WHERE "certificate"."id" IS NULL;

  IF missing_certificate_count > 0 THEN
    RAISE EXCEPTION 'P Grohe plaque seed aborted: % product certificate row(s) are missing.', missing_certificate_count;
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
FROM "_p_grohe_products" "seed"
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
FROM "_p_grohe_products" "seed"
LEFT JOIN "products" "default_product"
  ON "default_product"."sku" = '00251419'
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
USING "product_families" "family"
WHERE "member"."family_id" = "family"."id"
  AND "family"."slug" IN (SELECT DISTINCT "family_slug" FROM "_p_grohe_products");

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  COALESCE("seed"."family_sort_order", 0)
FROM "_p_grohe_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = "seed"."family_slug"
ON CONFLICT ("product_id") DO UPDATE SET
  "family_id" = EXCLUDED."family_id",
  "sort_order" = EXCLUDED."sort_order";

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_p_grohe_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_p_grohe_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = "seed"."category_slug"
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = "seed"."subcategory_slug"
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_media" "product_media"
USING "products" "product", "_p_grohe_products" "seed"
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
FROM "_p_grohe_products" "seed"
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
USING "products" "product", "_p_grohe_products" "seed"
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
FROM "_p_grohe_products" "seed"
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
USING "products" "product", "_p_grohe_certificate_slugs" "seed", "product_certificates" "certificate"
WHERE "association"."product_id" = "product"."id"
  AND "association"."certificate_id" = "certificate"."id"
  AND "product"."sku" = "seed"."sku"
  AND "certificate"."slug" = "seed"."certificate_slug";

INSERT INTO "product_certificate_associations" ("product_id", "certificate_id")
SELECT
  "product"."id",
  "certificate"."id"
FROM "_p_grohe_certificate_slugs" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_certificates" "certificate"
  ON "certificate"."slug" = "seed"."certificate_slug"
ON CONFLICT ("product_id", "certificate_id") DO NOTHING;

DO $$
DECLARE
  seeded_product_count INTEGER;
  seeded_media_count INTEGER;
  seeded_attribute_count INTEGER;
  seeded_certificate_count INTEGER;
  family_member_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO seeded_product_count
  FROM "_p_grohe_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku";

  IF seeded_product_count <> 2 THEN
    RAISE EXCEPTION 'P Grohe plaque validation failed: expected 2 products, found %.', seeded_product_count;
  END IF;

  SELECT COUNT(*)
  INTO seeded_media_count
  FROM "_p_grohe_products" "seed"
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

  IF seeded_media_count <> 18 THEN
    RAISE EXCEPTION 'P Grohe plaque validation failed: expected 18 media links, found %.', seeded_media_count;
  END IF;

  SELECT COUNT(*)
  INTO seeded_attribute_count
  FROM "_p_grohe_products" "seed"
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

  IF seeded_attribute_count <> 20 THEN
    RAISE EXCEPTION 'P Grohe plaque validation failed: expected 20 product attributes, found %.', seeded_attribute_count;
  END IF;

  SELECT COUNT(*)
  INTO seeded_certificate_count
  FROM "_p_grohe_certificate_slugs" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_certificates" "certificate"
    ON "certificate"."slug" = "seed"."certificate_slug"
  JOIN "product_certificate_associations" "association"
    ON "association"."product_id" = "product"."id"
    AND "association"."certificate_id" = "certificate"."id";

  IF seeded_certificate_count <> 2 THEN
    RAISE EXCEPTION 'P Grohe plaque validation failed: expected 2 product certificate links, found %.', seeded_certificate_count;
  END IF;

  SELECT COUNT(*)
  INTO family_member_count
  FROM "product_families" "family"
  JOIN "product_family_members" "member"
    ON "member"."family_id" = "family"."id"
  WHERE "family"."slug" = 'plaque-commande-skate-cosmopolitan-38732-grohe';

  IF family_member_count <> 2 THEN
    RAISE EXCEPTION 'P Grohe plaque validation failed: expected 2 family members, found %.', family_member_count;
  END IF;
END $$;

DROP TABLE "_p_grohe_certificate_slugs";
DROP TABLE "_p_grohe_products";
DROP TABLE "_p_grohe_type_attributes";
DROP TABLE "_p_grohe_attribute_definitions";
DROP TABLE "_p_grohe_attribute_groups";
DROP TABLE "_p_grohe_expected_media";
