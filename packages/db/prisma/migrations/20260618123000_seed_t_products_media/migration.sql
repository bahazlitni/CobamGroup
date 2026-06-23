-- Seed the ZIP-backed T products: Deutsch Color TB mortars and shower heads.
-- The 15x15 and 20x20 Jaquar OHS shower heads are intentionally grouped as a family.

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES
  ('CHROME', 'Chrome', '#C8CDD0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

CREATE TEMP TABLE "_t_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_t_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1731, 'TETE DE DOUCHE 20-20 CARREE SOPAL [1].webp', 'IMAGE'::"MediaKind"),
  (1732, 'TETE DE DOUCHE 20-20 CARREE SOPAL [2].webp', 'IMAGE'::"MediaKind"),
  (1733, 'TETE DE DOUCHE 20-20 CARREE SOPAL [3].webp', 'IMAGE'::"MediaKind"),
  (1734, 'TETE DE DOUCHE ALIVE 45-35 AVEC LUMIERE OHS-CHR-85857 JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1735, 'TETE DE DOUCHE ALIVE 45-35 AVEC LUMIERE OHS-CHR-85857 JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1736, 'TETE DE DOUCHE ALIVE 45-35 AVEC LUMIERE OHS-CHR-85857 JAQUAR [3].webp', 'IMAGE'::"MediaKind"),
  (1737, 'TETE DE DOUCHE CARRE 15-15 OHS-CHR-35495 JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1738, 'TETE DE DOUCHE CARRE 15-15 OHS-CHR-35495 JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1739, 'TETE DE DOUCHE CARRE 15-15 OHS-CHR-35495 JAQUAR [3].webp', 'IMAGE'::"MediaKind"),
  (1740, 'TETE DE DOUCHE CARRE 20-20 ARI-OHS-CHR-35497 JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1741, 'TETE DE DOUCHE CARRE 20-20 ARI-OHS-CHR-35497 JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1742, 'TETE DE DOUCHE CARRE 20-20 ARI-OHS-CHR-35497 JAQUAR [3].webp', 'IMAGE'::"MediaKind"),
  (1743, 'TETE DE DOUCHE CARRE 45-45 CHROME CHR-1679 JAQUAR [1].webp', 'IMAGE'::"MediaKind"),
  (1744, 'TETE DE DOUCHE CARRE 45-45 CHROME CHR-1679 JAQUAR [2].webp', 'IMAGE'::"MediaKind"),
  (1745, 'TETE DE DOUCHE CARRE 45-45 CHROME CHR-1679 JAQUAR [3].webp', 'IMAGE'::"MediaKind"),
  (1746, 'TB 400 DEUTSCH COLOR [1].webp', 'IMAGE'::"MediaKind"),
  (1747, 'TB 400 DEUTSCH COLOR [2].webp', 'IMAGE'::"MediaKind"),
  (1748, 'TB 800 DEUTSCH COLOR [1].webp', 'IMAGE'::"MediaKind"),
  (1749, 'TB 800 DEUTSCH COLOR [2].webp', 'IMAGE'::"MediaKind"),
  (1750, 'TB 400 DEUTSCH COLOR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1751, 'TB 800 DEUTSCH COLOR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1752, 'TETE DE DOUCHE 20-20 CARREE SOPAL (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1753, 'TETE DE DOUCHE ALIVE 45-35 AVEC LUMIERE OHS-CHR 85857 JAQUAR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1754, 'TETE DE DOUCHE CARRE 45-45 CHROME CHR-1679 JAQUAR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1755, 'TETE DE DOUCHE CARRE 15-15 OHS-CHR-35495 JAQUAR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1756, 'TETE DE DOUCHE CARRE 15-15 OHS-CHR-35495 JAQUAR (GUIDE D''INSTALLATION).pdf', 'DOCUMENT'::"MediaKind"),
  (1757, 'TETE DE DOUCHE CARRE 20-20 ARI-OHS-CHR-35497 JAQUAR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1758, 'TETE DE DOUCHE CARRE 20-20 ARI-OHS-CHR-35497 JAQUAR (GUIDE D''INSTALLATION).pdf', 'DOCUMENT'::"MediaKind");

CREATE TEMP TABLE "_t_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_t_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
VALUES
  ('produit-pose-carrelage', 'filtres-principaux', 'Filtres principaux', 0),
  ('produit-pose-carrelage', 'caracteristiques-techniques', 'Caractéristiques techniques', 20),
  ('douchette-tete-bras-flexible', 'filtres-principaux', 'Filtres principaux', 0),
  ('douchette-tete-bras-flexible', 'caracteristiques-techniques', 'Caractéristiques techniques', 20);

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
FROM "_t_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_t_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_t_attribute_definitions" ("key", "label", "unit", "input_type", "select_options")
VALUES
  ('product_use', 'Type de produit', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Mortier colle isolation thermique', 'Tête de douche']::TEXT[]),
  ('packaging_weight_kg', 'Conditionnement', 'kg', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('application_area', 'Usage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Douche', 'Isolation thermique']::TEXT[]),
  ('compatible_supports', 'Supports compatibles', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('mixing_water_l', 'Eau de gâchage', 'L / 25 kg', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('application_thickness_mm', 'Épaisseur d''application', 'mm', 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('working_time_h', 'Temps de travail', 'h', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('correction_time_min', 'Temps de correction', 'min', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('shower_set_type', 'Type', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Tête de douche']::TEXT[]),
  ('finish', 'Finition', NULL, 'FINISH'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('manufacturer_ref', 'Référence fabricant', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('product_line', 'Gamme', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('dimensions_text', 'Dimensions', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('material', 'Matière', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('mounting_type', 'Montage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Mural', 'Faux plafond']::TEXT[]),
  ('spray_modes', 'Jet', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('flow_rate_lpm', 'Débit', 'L/min', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('recommended_pressure_bar', 'Pression recommandée', 'bar', 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('lighting', 'Éclairage', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]);

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
FROM "_t_attribute_definitions"
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

CREATE TEMP TABLE "_t_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_t_type_attributes" (
  "product_type_slug", "key", "group_slug", "is_filterable", "sort_order"
)
VALUES
  ('produit-pose-carrelage', 'product_use', 'filtres-principaux', true, 10),
  ('produit-pose-carrelage', 'packaging_weight_kg', 'filtres-principaux', true, 20),
  ('produit-pose-carrelage', 'application_area', 'filtres-principaux', true, 30),
  ('produit-pose-carrelage', 'compatible_supports', 'caracteristiques-techniques', true, 40),
  ('produit-pose-carrelage', 'mixing_water_l', 'caracteristiques-techniques', true, 50),
  ('produit-pose-carrelage', 'application_thickness_mm', 'caracteristiques-techniques', true, 60),
  ('produit-pose-carrelage', 'working_time_h', 'caracteristiques-techniques', true, 70),
  ('produit-pose-carrelage', 'correction_time_min', 'caracteristiques-techniques', true, 80),
  ('douchette-tete-bras-flexible', 'shower_set_type', 'filtres-principaux', true, 10),
  ('douchette-tete-bras-flexible', 'finish', 'filtres-principaux', true, 20),
  ('douchette-tete-bras-flexible', 'mounting_type', 'filtres-principaux', true, 30),
  ('douchette-tete-bras-flexible', 'lighting', 'filtres-principaux', true, 40),
  ('douchette-tete-bras-flexible', 'manufacturer_ref', 'caracteristiques-techniques', true, 50),
  ('douchette-tete-bras-flexible', 'product_line', 'caracteristiques-techniques', true, 60),
  ('douchette-tete-bras-flexible', 'dimensions_text', 'caracteristiques-techniques', true, 70),
  ('douchette-tete-bras-flexible', 'material', 'caracteristiques-techniques', true, 80),
  ('douchette-tete-bras-flexible', 'spray_modes', 'caracteristiques-techniques', true, 90),
  ('douchette-tete-bras-flexible', 'flow_rate_lpm', 'caracteristiques-techniques', true, 100),
  ('douchette-tete-bras-flexible', 'recommended_pressure_bar', 'caracteristiques-techniques', true, 110);

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
FROM "_t_type_attributes" "seed"
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

CREATE TEMP TABLE "_t_products" AS
SELECT *
FROM jsonb_to_recordset($products$
[
  {
    "sku":"00249249",
    "slug":"mortier-colle-tb-400-isolation-thermique-deutsch-color-00249249",
    "name":"TB 400 DEUTSCH COLOR",
    "display_name":"Mortier colle TB 400 pour isolation thermique Deutsch Color",
    "brand_slug":"deutsch-color",
    "product_type_slug":"produit-pose-carrelage",
    "family_slug":null,
    "kind":"SINGLE",
    "price_ttc":16.000,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "product_use":"Mortier colle isolation thermique",
    "packaging_weight_kg":25,
    "application_area":"Isolation thermique",
    "compatible_supports":"Panneaux isolants, briques, béton et mortier ciment",
    "mixing_water_l":6.5,
    "application_thickness_mm":"jusqu'à 15",
    "working_time_h":4,
    "correction_time_min":40,
    "manufacturer_ref":"TB 400",
    "product_line":"TB",
    "dimensions_text":null,
    "material":"Mortier cimentaire",
    "shower_set_type":null,
    "finish_value":null,
    "mounting_type":null,
    "spray_modes":null,
    "flow_rate_lpm":null,
    "recommended_pressure_bar":null,
    "lighting":null,
    "title_seo":"Mortier colle TB 400 Deutsch Color",
    "description_seo":"Mortier colle TB 400 Deutsch Color pour collage de panneaux d'isolation thermique sur supports stables.",
    "tags":"mortier-colle isolation-thermique panneau-isolant styromousse graphite fibre-minerale ciment deutsch-color tb-400 sac-25kg facade",
    "intro":"TB 400 Deutsch Color est un mortier colle cimentaire destiné au collage de panneaux utilisés dans les systèmes d'isolation thermique.",
    "details":"Sa formulation améliore la maniabilité et l'adhérence du mortier sur supports stables comme la brique, le béton ou les mortiers ciment. Il convient aux chantiers d'isolation qui demandent un produit prêt à gâcher et facile à appliquer.",
    "gallery":[1746,1747],
    "technical":[{"id":1750,"name":"Fiche technique"}],
    "sort_order":0
  },
  {
    "sku":"00229630",
    "slug":"mortier-colle-tb-800-isolation-thermique-deutsch-color-00229630",
    "name":"TB 800 DEUTSCH COLOR",
    "display_name":"Mortier colle TB 800 pour isolation thermique Deutsch Color",
    "brand_slug":"deutsch-color",
    "product_type_slug":"produit-pose-carrelage",
    "family_slug":null,
    "kind":"SINGLE",
    "price_ttc":35.000,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "product_use":"Mortier colle isolation thermique",
    "packaging_weight_kg":25,
    "application_area":"Isolation thermique",
    "compatible_supports":"Panneaux isolants, polyuréthane, laine de roche, laine de verre, graphite, béton et mortier ciment",
    "mixing_water_l":6.5,
    "application_thickness_mm":"jusqu'à 35",
    "working_time_h":4,
    "correction_time_min":null,
    "manufacturer_ref":"TB 800",
    "product_line":"TB",
    "dimensions_text":null,
    "material":"Mortier cimentaire",
    "shower_set_type":null,
    "finish_value":null,
    "mounting_type":null,
    "spray_modes":null,
    "flow_rate_lpm":null,
    "recommended_pressure_bar":null,
    "lighting":null,
    "title_seo":"Mortier colle TB 800 Deutsch Color",
    "description_seo":"Mortier colle TB 800 Deutsch Color pour collage et nivellement de panneaux d'isolation thermique.",
    "tags":"mortier-colle isolation-thermique panneau-isolant polyurethane laine-roche laine-verre graphite ciment deutsch-color tb-800 sac-25kg facade",
    "intro":"TB 800 Deutsch Color est un mortier colle cimentaire conçu pour le collage et le nivellement des panneaux d'isolation thermique.",
    "details":"Il apporte une bonne maniabilité, une adhérence adaptée aux surfaces rugueuses et une meilleure résistance à l'eau de pluie. Il est particulièrement utile pour les systèmes d'isolation avec treillis en fibre de verre.",
    "gallery":[1748,1749],
    "technical":[{"id":1751,"name":"Fiche technique"}],
    "sort_order":1
  },
  {
    "sku":"00007688",
    "slug":"tete-de-douche-carree-20x20-chromee-sopal-00007688",
    "name":"TETE DE DOUCHE 20/20 CARREE SOPAL",
    "display_name":"Tête de douche carrée 20x20 chromée Sopal",
    "brand_slug":"sopal",
    "product_type_slug":"douchette-tete-bras-flexible",
    "family_slug":null,
    "kind":"SINGLE",
    "price_ttc":148.050,
    "stock_available":3.000,
    "stock_unit":"PIECE",
    "product_use":null,
    "packaging_weight_kg":null,
    "application_area":"Douche",
    "compatible_supports":null,
    "mixing_water_l":null,
    "application_thickness_mm":null,
    "working_time_h":null,
    "correction_time_min":null,
    "manufacturer_ref":"1049A04",
    "product_line":"Rain shower",
    "dimensions_text":"20x20 cm",
    "material":"ABS",
    "shower_set_type":"Tête de douche",
    "finish_value":"Chrome",
    "mounting_type":"Mural",
    "spray_modes":"Jet pluie",
    "flow_rate_lpm":null,
    "recommended_pressure_bar":null,
    "lighting":false,
    "title_seo":"Tête de douche carrée 20x20 Sopal",
    "description_seo":"Tête de douche carrée Sopal 20x20 en ABS chromé, avec jets silicone et système anti-calcaire.",
    "tags":"tete-douche douche pluie carree 20x20 chrome abs anticalcaire jets-silicone sopal salle-de-bain",
    "intro":"Cette tête de douche carrée Sopal apporte un jet pluie confortable dans une finition chromée brillante et facile à associer.",
    "details":"Le corps en ABS chromé, les jets en silicone et le système anti-calcaire facilitent l'entretien quotidien. Le raccord G1/2 permet une intégration simple dans une installation de douche compatible.",
    "gallery":[1731,1732,1733],
    "technical":[{"id":1752,"name":"Fiche technique"}],
    "sort_order":2
  },
  {
    "sku":"00244800",
    "slug":"tete-de-douche-alive-45x35-led-jaquar-ohs-chr-85857-00244800",
    "name":"TETE DE DOUCHE ALIVE 45/35 AVEC LUMIERE OHS-CHR-85857 JAQUAR",
    "display_name":"Tête de douche Alive 45x35 avec lumière Jaquar",
    "brand_slug":"jaquar",
    "product_type_slug":"douchette-tete-bras-flexible",
    "family_slug":null,
    "kind":"SINGLE",
    "price_ttc":2900.000,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "product_use":null,
    "packaging_weight_kg":null,
    "application_area":"Douche",
    "compatible_supports":null,
    "mixing_water_l":null,
    "application_thickness_mm":null,
    "working_time_h":null,
    "correction_time_min":null,
    "manufacturer_ref":"OHS-CHR-85857",
    "product_line":"Alive Maze Prime",
    "dimensions_text":"45x35 cm",
    "material":"Acier inoxydable AISI 304",
    "shower_set_type":"Tête de douche",
    "finish_value":"Chrome",
    "mounting_type":"Faux plafond",
    "spray_modes":"Simple fonction",
    "flow_rate_lpm":47.00,
    "recommended_pressure_bar":"1-3",
    "lighting":true,
    "title_seo":"Tête douche Alive LED 45x35 Jaquar",
    "description_seo":"Tête de douche Jaquar Alive 45x35 avec LED RGB, télécommande et montage faux plafond.",
    "tags":"tete-douche douche-plafond led rgb chromotherapie 45x35 acier-inox jaquar alive maze-prime salle-de-bain",
    "intro":"La tête de douche Alive Jaquar transforme l'espace douche avec un large format 45x35 cm et un éclairage LED RGB intégré.",
    "details":"Conçue pour une pose en faux plafond, elle associe une douche de tête simple fonction, une finition soignée et un système Rubit qui aide à retirer les dépôts de calcaire par simple frottement.",
    "gallery":[1734,1735,1736],
    "technical":[{"id":1753,"name":"Fiche technique"}],
    "sort_order":3
  },
  {
    "sku":"00253826",
    "slug":"tete-de-douche-carree-15x15-ohs-chr-35495-jaquar-00253826",
    "name":"TETE DE DOUCHE CARRE 15/15 OHS-CHR-35495 JAQUAR",
    "display_name":"Tête de douche carrée 15x15 chromée Jaquar",
    "brand_slug":"jaquar",
    "product_type_slug":"douchette-tete-bras-flexible",
    "family_slug":"tetes-de-douche-carrees-ohs-jaquar",
    "kind":"VARIANT",
    "price_ttc":173.502,
    "stock_available":2.000,
    "stock_unit":"PIECE",
    "product_use":null,
    "packaging_weight_kg":null,
    "application_area":"Douche",
    "compatible_supports":null,
    "mixing_water_l":null,
    "application_thickness_mm":null,
    "working_time_h":null,
    "correction_time_min":null,
    "manufacturer_ref":"OHS-CHR-35495",
    "product_line":"OHS",
    "dimensions_text":"15x15 cm",
    "material":"ABS",
    "shower_set_type":"Tête de douche",
    "finish_value":"Chrome",
    "mounting_type":"Mural",
    "spray_modes":"Simple fonction",
    "flow_rate_lpm":24.78,
    "recommended_pressure_bar":"1-3",
    "lighting":false,
    "title_seo":"Tête douche carrée 15x15 Jaquar",
    "description_seo":"Tête de douche carrée Jaquar 15x15 en ABS chromé, avec système Rubit anti-calcaire.",
    "tags":"tete-douche douche murale carree 15x15 chrome abs rubit anticalcaire jaquar ohs salle-de-bain",
    "intro":"Cette tête de douche carrée Jaquar 15x15 convient aux douches murales qui recherchent une ligne nette et contemporaine.",
    "details":"Le corps en ABS chromé, le jet simple fonction et la technologie Rubit facilitent l'utilisation comme l'entretien. La pression recommandée de 1 à 3 bar aide à préparer correctement l'installation.",
    "gallery":[1737,1738,1739],
    "technical":[{"id":1755,"name":"Fiche technique"},{"id":1756,"name":"Guide d'installation"}],
    "sort_order":0
  },
  {
    "sku":"00206808",
    "slug":"tete-de-douche-carree-20x20-ari-ohs-chr-35497-jaquar-00206808",
    "name":"TETE DE DOUCHE CARRE 20*20 ARI-OHS-CHR-35497 JAQUAR",
    "display_name":"Tête de douche carrée 20x20 chromée Jaquar",
    "brand_slug":"jaquar",
    "product_type_slug":"douchette-tete-bras-flexible",
    "family_slug":"tetes-de-douche-carrees-ohs-jaquar",
    "kind":"VARIANT",
    "price_ttc":189.390,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "product_use":null,
    "packaging_weight_kg":null,
    "application_area":"Douche",
    "compatible_supports":null,
    "mixing_water_l":null,
    "application_thickness_mm":null,
    "working_time_h":null,
    "correction_time_min":null,
    "manufacturer_ref":"OHS-CHR-35497",
    "product_line":"OHS",
    "dimensions_text":"20x20 cm",
    "material":"ABS",
    "shower_set_type":"Tête de douche",
    "finish_value":"Chrome",
    "mounting_type":"Mural",
    "spray_modes":"Simple fonction",
    "flow_rate_lpm":24.15,
    "recommended_pressure_bar":"1-3",
    "lighting":false,
    "title_seo":"Tête douche carrée 20x20 Jaquar",
    "description_seo":"Tête de douche carrée Jaquar 20x20 en ABS chromé, avec système Rubit anti-calcaire.",
    "tags":"tete-douche douche murale carree 20x20 chrome abs rubit anticalcaire jaquar ohs salle-de-bain",
    "intro":"Cette tête de douche carrée Jaquar 20x20 offre une surface de jet plus généreuse tout en gardant un design sobre et moderne.",
    "details":"Elle associe un corps en ABS chromé, un jet simple fonction et la technologie Rubit pour simplifier le nettoyage des picots. La fiche technique indique une pression recommandée de 1 à 3 bar.",
    "gallery":[1740,1741,1742],
    "technical":[{"id":1757,"name":"Fiche technique"},{"id":1758,"name":"Guide d'installation"}],
    "sort_order":1
  },
  {
    "sku":"00244787",
    "slug":"tete-de-douche-carree-45x45-led-chrome-jaquar-chr-1679-00244787",
    "name":"TETE DE DOUCHE CARRE 45/45 CHROME CHR-1679 JAQUAR",
    "display_name":"Tête de douche carrée 45x45 LED chromée Jaquar",
    "brand_slug":"jaquar",
    "product_type_slug":"douchette-tete-bras-flexible",
    "family_slug":null,
    "kind":"SINGLE",
    "price_ttc":3270.588,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "product_use":null,
    "packaging_weight_kg":null,
    "application_area":"Douche",
    "compatible_supports":null,
    "mixing_water_l":null,
    "application_thickness_mm":null,
    "working_time_h":null,
    "correction_time_min":null,
    "manufacturer_ref":"OHS-CHR-1679",
    "product_line":"Maze Prime",
    "dimensions_text":"45x45 cm",
    "material":"Acier inoxydable AISI 304",
    "shower_set_type":"Tête de douche",
    "finish_value":"Chrome",
    "mounting_type":"Faux plafond",
    "spray_modes":"Simple fonction",
    "flow_rate_lpm":47.00,
    "recommended_pressure_bar":"1-3",
    "lighting":true,
    "title_seo":"Tête douche carrée LED 45x45 Jaquar",
    "description_seo":"Tête de douche carrée Jaquar 45x45 avec LED RGB, télécommande et montage faux plafond.",
    "tags":"tete-douche douche-plafond led rgb chromotherapie 45x45 acier-inox chrome jaquar maze-prime salle-de-bain",
    "intro":"Cette tête de douche carrée Jaquar 45x45 crée une douche de tête large avec éclairage RGB pour une ambiance plus immersive.",
    "details":"Le format en acier inoxydable AISI 304, la télécommande et le kit de pose faux plafond en font une solution haut de gamme pour les projets de salle de bain soignés. Le système Rubit facilite l'entretien des buses.",
    "gallery":[1743,1744,1745],
    "technical":[{"id":1754,"name":"Fiche technique"}],
    "sort_order":4
  }
]
$products$::jsonb) AS "seed"(
  "sku" TEXT,
  "slug" TEXT,
  "name" TEXT,
  "display_name" TEXT,
  "brand_slug" TEXT,
  "product_type_slug" TEXT,
  "family_slug" TEXT,
  "kind" TEXT,
  "price_ttc" NUMERIC(12, 3),
  "stock_available" NUMERIC(12, 3),
  "stock_unit" TEXT,
  "product_use" TEXT,
  "packaging_weight_kg" NUMERIC(12, 3),
  "application_area" TEXT,
  "compatible_supports" TEXT,
  "mixing_water_l" NUMERIC(12, 3),
  "application_thickness_mm" TEXT,
  "working_time_h" NUMERIC(12, 3),
  "correction_time_min" NUMERIC(12, 3),
  "manufacturer_ref" TEXT,
  "product_line" TEXT,
  "dimensions_text" TEXT,
  "material" TEXT,
  "shower_set_type" TEXT,
  "finish_value" TEXT,
  "mounting_type" TEXT,
  "spray_modes" TEXT,
  "flow_rate_lpm" NUMERIC(12, 3),
  "recommended_pressure_bar" TEXT,
  "lighting" BOOLEAN,
  "title_seo" TEXT,
  "description_seo" TEXT,
  "tags" TEXT,
  "intro" TEXT,
  "details" TEXT,
  "gallery" JSONB,
  "technical" JSONB,
  "sort_order" INTEGER
);

CREATE TEMP TABLE "_t_product_media_entries" AS
SELECT
  "seed"."sku",
  ("gallery_entry"."value")::TEXT::BIGINT AS "media_id",
  'GALLERY'::"ProductMediaRole" AS "role",
  NULL::TEXT AS "name",
  ("gallery_entry"."ordinality" - 1)::INTEGER AS "sort_order",
  'IMAGE'::"MediaKind" AS "expected_kind"
FROM "_t_products" "seed"
CROSS JOIN LATERAL jsonb_array_elements("seed"."gallery") WITH ORDINALITY AS "gallery_entry"("value", "ordinality")
UNION ALL
SELECT
  "seed"."sku",
  ("technical_entry"."value" ->> 'id')::BIGINT AS "media_id",
  'TECHNICAL'::"ProductMediaRole" AS "role",
  "technical_entry"."value" ->> 'name' AS "name",
  ("technical_entry"."ordinality" - 1)::INTEGER AS "sort_order",
  'DOCUMENT'::"MediaKind" AS "expected_kind"
FROM "_t_products" "seed"
CROSS JOIN LATERAL jsonb_array_elements("seed"."technical") WITH ORDINALITY AS "technical_entry"("value", "ordinality");

DO $$
DECLARE
  missing_brands INTEGER;
  missing_product_types INTEGER;
  missing_subcategories INTEGER;
  missing_media INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM "_t_products") <> 7 THEN
    RAISE EXCEPTION 'Expected 7 T products in the seed.';
  END IF;

  SELECT COUNT(*)
  INTO missing_brands
  FROM (
    SELECT DISTINCT "brand_slug"
    FROM "_t_products"
    WHERE "brand_slug" IS NOT NULL
  ) "expected"
  LEFT JOIN "organizations" "brand"
    ON "brand"."slug" = "expected"."brand_slug"
    AND "brand"."is_product_brand" = true
  WHERE "brand"."id" IS NULL;

  IF missing_brands > 0 THEN
    RAISE EXCEPTION 'Cannot seed T products: % expected brand row(s) are missing.', missing_brands;
  END IF;

  SELECT COUNT(*)
  INTO missing_product_types
  FROM (
    SELECT DISTINCT "product_type_slug" FROM "_t_products"
  ) "expected"
  LEFT JOIN "product_type_templates" "template"
    ON "template"."slug" = "expected"."product_type_slug"
  WHERE "template"."id" IS NULL;

  IF missing_product_types > 0 THEN
    RAISE EXCEPTION 'Cannot seed T products: % expected product type row(s) are missing.', missing_product_types;
  END IF;

  SELECT COUNT(*)
  INTO missing_subcategories
  FROM (VALUES (18::BIGINT), (28::BIGINT)) AS "expected"("id")
  LEFT JOIN "product_subcategories" "subcategory"
    ON "subcategory"."id" = "expected"."id"
  WHERE "subcategory"."id" IS NULL;

  IF missing_subcategories > 0 THEN
    RAISE EXCEPTION 'Cannot seed T products: % expected subcategory row(s) are missing.', missing_subcategories;
  END IF;

  SELECT COUNT(*)
  INTO missing_media
  FROM "_t_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media > 0 THEN
    RAISE EXCEPTION 'Cannot seed T media: % expected media row(s) are missing or mismatched.', missing_media;
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
  "seed"."kind"::"ProductKind",
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
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."intro"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."details"))
      )
    )
  ),
  LEFT("seed"."title_seo", 60),
  LEFT("seed"."description_seo", 160),
  regexp_replace(lower("seed"."tags"), '\s+', ' ', 'g'),
  0,
  true,
  true,
  false,
  false,
  "seed"."stock_available",
  0.000,
  "seed"."stock_unit"::"StockUnit",
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
FROM "_t_products" "seed"
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

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo",
  "main_image_media_id", "created_at", "updated_at"
)
VALUES (
  'tetes-de-douche-carrees-ohs-jaquar',
  'Têtes de douche carrées OHS Jaquar',
  'Têtes de douche carrées',
  'Famille de têtes de douche carrées Jaquar OHS en finition chromée, disponibles en formats 15x15 cm et 20x20 cm.',
  'Têtes de douche carrées Jaquar OHS chromées en formats 15x15 et 20x20 cm chez COBAM GROUP.',
  1737,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "main_image_media_id" = EXCLUDED."main_image_media_id",
  "updated_at" = CURRENT_TIMESTAMP;

DELETE FROM "product_family_members" "member"
USING "product_families" "family"
WHERE "member"."family_id" = "family"."id"
  AND "family"."slug" = 'tetes-de-douche-carrees-ohs-jaquar';

DELETE FROM "product_family_members" "member"
USING "products" "product", "_t_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  "seed"."sort_order"
FROM "_t_products" "seed"
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
    "family"."id" AS "family_id",
    "product"."id" AS "product_id",
    row_number() OVER (
      PARTITION BY "family"."id"
      ORDER BY "product"."stock_available" DESC, "member"."sort_order" ASC, "product"."id" ASC
    ) AS "rank"
  FROM "product_families" "family"
  JOIN "product_family_members" "member"
    ON "member"."family_id" = "family"."id"
  JOIN "products" "product"
    ON "product"."id" = "member"."product_id"
  WHERE "family"."slug" = 'tetes-de-douche-carrees-ohs-jaquar'
)
UPDATE "product_families" "family"
SET
  "default_product_id" = "ranked_defaults"."product_id",
  "updated_at" = CURRENT_TIMESTAMP
FROM "ranked_defaults"
WHERE "family"."id" = "ranked_defaults"."family_id"
  AND "ranked_defaults"."rank" = 1;

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_t_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_t_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."id" = CASE
    WHEN "seed"."product_type_slug" = 'produit-pose-carrelage' THEN 28::BIGINT
    ELSE 18::BIGINT
  END
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_t_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    'product_use',
    'packaging_weight_kg',
    'application_area',
    'compatible_supports',
    'mixing_water_l',
    'application_thickness_mm',
    'working_time_h',
    'correction_time_min',
    'shower_set_type',
    'finish',
    'manufacturer_ref',
    'product_line',
    'dimensions_text',
    'material',
    'mounting_type',
    'spray_modes',
    'flow_rate_lpm',
    'recommended_pressure_bar',
    'lighting'
  );

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "product"."product_type_id",
    "attribute_seed"."name",
    "attribute_seed"."value"
  FROM "_t_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL (
    VALUES
      ('product_use', "seed"."product_use"),
      ('packaging_weight_kg', CASE WHEN "seed"."packaging_weight_kg" IS NULL THEN NULL ELSE regexp_replace(("seed"."packaging_weight_kg")::TEXT, '\.000$', '') END),
      ('application_area', "seed"."application_area"),
      ('compatible_supports', "seed"."compatible_supports"),
      ('mixing_water_l', CASE WHEN "seed"."mixing_water_l" IS NULL THEN NULL ELSE regexp_replace(("seed"."mixing_water_l")::TEXT, '\.000$', '') END),
      ('application_thickness_mm', "seed"."application_thickness_mm"),
      ('working_time_h', CASE WHEN "seed"."working_time_h" IS NULL THEN NULL ELSE regexp_replace(("seed"."working_time_h")::TEXT, '\.000$', '') END),
      ('correction_time_min', CASE WHEN "seed"."correction_time_min" IS NULL THEN NULL ELSE regexp_replace(("seed"."correction_time_min")::TEXT, '\.000$', '') END),
      ('shower_set_type', "seed"."shower_set_type"),
      ('finish', "seed"."finish_value"),
      ('manufacturer_ref', "seed"."manufacturer_ref"),
      ('product_line', "seed"."product_line"),
      ('dimensions_text', "seed"."dimensions_text"),
      ('material', "seed"."material"),
      ('mounting_type', "seed"."mounting_type"),
      ('spray_modes', "seed"."spray_modes"),
      ('flow_rate_lpm', CASE WHEN "seed"."flow_rate_lpm" IS NULL THEN NULL ELSE regexp_replace(("seed"."flow_rate_lpm")::TEXT, '\.000$', '') END),
      ('recommended_pressure_bar', "seed"."recommended_pressure_bar"),
      ('lighting', CASE WHEN "seed"."lighting" IS NULL THEN NULL ELSE "seed"."lighting"::TEXT END)
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
USING "products" "product", "_t_products" "seed"
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
        THEN "product"."display_name" || ' - vue ' || ("entry"."sort_order" + 1)::TEXT
      ELSE COALESCE("entry"."name", 'Document technique') || ' - ' || "product"."display_name"
    END,
    255
  ),
  "entry"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_t_product_media_entries" "entry"
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
  expected_media_count INTEGER;
  seeded_media_count INTEGER;
  seeded_product_count INTEGER;
  family_member_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO seeded_product_count
  FROM "_t_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku";

  IF seeded_product_count <> 7 THEN
    RAISE EXCEPTION 'T seed expected 7 products and found %.', seeded_product_count;
  END IF;

  SELECT COUNT(*) INTO expected_media_count
  FROM "_t_product_media_entries";

  SELECT COUNT(*) INTO seeded_media_count
  FROM "_t_product_media_entries" "entry"
  JOIN "products" "product"
    ON "product"."sku" = "entry"."sku"
  JOIN "product_media" "product_media"
    ON "product_media"."product_id" = "product"."id"
    AND "product_media"."media_id" = "entry"."media_id";

  IF expected_media_count <> 28 OR seeded_media_count <> expected_media_count THEN
    RAISE EXCEPTION 'T seed expected 28 product media rows and found % expected / % seeded.', expected_media_count, seeded_media_count;
  END IF;

  SELECT COUNT(*) INTO family_member_count
  FROM "product_family_members" "member"
  JOIN "product_families" "family"
    ON "family"."id" = "member"."family_id"
  WHERE "family"."slug" = 'tetes-de-douche-carrees-ohs-jaquar';

  IF family_member_count <> 2 THEN
    RAISE EXCEPTION 'T seed expected 2 OHS family members and found %.', family_member_count;
  END IF;
END $$;

DROP TABLE "_t_product_media_entries";
DROP TABLE "_t_products";
DROP TABLE "_t_type_attributes";
DROP TABLE "_t_attribute_definitions";
DROP TABLE "_t_attribute_groups";
DROP TABLE "_t_expected_media";
