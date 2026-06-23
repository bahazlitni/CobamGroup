-- Seed the ZIP-backed Today cement adhesives, insulation boards, and waterproofing products.

CREATE TEMP TABLE "_today_cie_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_today_cie_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1962, 'ISOLATION POLYSTERENE 100-100 EP2.webp', 'IMAGE'::"MediaKind"),
  (1963, 'ISOLATION POLYSTERENE 100-100 EP4.webp', 'IMAGE'::"MediaKind"),
  (1964, 'ISOLINE 5 KG DEUTSCH COLOR.webp', 'IMAGE'::"MediaKind"),
  (1965, 'ISOLINE 15 KG DEUTSCH COLOR.webp', 'IMAGE'::"MediaKind"),
  (1966, 'IZODICHT D-17 20KG (SEAU) DEUTSCH COLOR.webp', 'IMAGE'::"MediaKind"),
  (1967, 'IZODICHT PU 18KG WHITE (SEAU) DEUTSCH COLOR.webp', 'IMAGE'::"MediaKind"),
  (1968, 'CIMENT COLLE FM BONDE 88 WHITE DEUTSCH COLOR.webp', 'IMAGE'::"MediaKind"),
  (1969, 'CIMENT COLLE SIKA CERAM 100 BLANC SAC 25KG [1].webp', 'IMAGE'::"MediaKind"),
  (1970, 'CIMENT COLLE SIKA CERAM 100 BLANC SAC 25KG (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1971, 'CIMENT COLLE FM BONDE 88 WHITE DEUTSCH COLOR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1972, 'ISOLINE DEUTSCH COLOR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1973, 'IZODICHT D-17 20KG (SEAU) DEUTSCH COLOR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1974, 'IZODICHT PU 18KG WHITE (SEAU) DEUTSCH COLOR (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
  missing_reference_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_today_cie_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Today cement/isolation/waterproofing seed aborted: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;

  SELECT COUNT(*)
  INTO missing_reference_count
  FROM (
    SELECT 'product type produit-pose-carrelage' AS "reference"
    WHERE NOT EXISTS (
      SELECT 1 FROM "product_type_templates" WHERE "slug" = 'produit-pose-carrelage'
    )

    UNION ALL

    SELECT 'product type materiau-batiment-jardin' AS "reference"
    WHERE NOT EXISTS (
      SELECT 1 FROM "product_type_templates" WHERE "slug" = 'materiau-batiment-jardin'
    )

    UNION ALL

    SELECT 'category revetements-de-sols-et-murs' AS "reference"
    WHERE NOT EXISTS (
      SELECT 1 FROM "product_types" WHERE "slug" = 'revetements-de-sols-et-murs'
    )

    UNION ALL

    SELECT 'category isolation-et-etancheite' AS "reference"
    WHERE NOT EXISTS (
      SELECT 1 FROM "product_types" WHERE "slug" = 'isolation-et-etancheite'
    )

    UNION ALL

    SELECT 'subcategory revetements-de-sols-et-murs/produits-de-pose-finition' AS "reference"
    WHERE NOT EXISTS (
      SELECT 1
      FROM "product_types" "category"
      JOIN "product_subcategories" "subcategory"
        ON "subcategory"."category_id" = "category"."id"
      WHERE "category"."slug" = 'revetements-de-sols-et-murs'
        AND "subcategory"."slug" = 'produits-de-pose-finition'
    )

    UNION ALL

    SELECT 'subcategory isolation-et-etancheite/etancheite' AS "reference"
    WHERE NOT EXISTS (
      SELECT 1
      FROM "product_types" "category"
      JOIN "product_subcategories" "subcategory"
        ON "subcategory"."category_id" = "category"."id"
      WHERE "category"."slug" = 'isolation-et-etancheite'
        AND "subcategory"."slug" = 'etancheite'
    )
  ) "missing";

  IF missing_reference_count > 0 THEN
    RAISE EXCEPTION 'Today cement/isolation/waterproofing seed aborted: % required catalog reference(s) are missing.', missing_reference_count;
  END IF;
END $$;

INSERT INTO "organizations" (
  "slug", "name", "description", "is_product_brand", "is_reference", "is_partner", "created_at", "updated_at"
)
VALUES
  (
    'deutsch-color',
    'Deutsch Color',
    'Marque de mortiers, colles et produits d''étanchéité pour chantier.',
    true,
    false,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'sika',
    'Sika',
    'Marque de solutions techniques pour construction, pose et étanchéité.',
    true,
    false,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = COALESCE("organizations"."description", EXCLUDED."description"),
  "is_product_brand" = true,
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_subcategories" (
  "category_id",
  "name",
  "subtitle",
  "slug",
  "description",
  "description_seo",
  "image_media_id",
  "sort_order",
  "is_active",
  "visible_ecommerce",
  "visible_vitrine",
  "created_at",
  "updated_at"
)
SELECT
  "category"."id",
  'Isolation thermique',
  'Panneaux et matériaux isolants',
  'isolation-thermique',
  'Matériaux et panneaux pour améliorer l''isolation thermique des murs, sols et façades.',
  'Isolation thermique : panneaux isolants et matériaux pour travaux de construction.',
  NULL,
  COALESCE(
    (SELECT MAX("subcategory"."sort_order") + 1 FROM "product_subcategories" "subcategory" WHERE "subcategory"."category_id" = "category"."id"),
    10
  ),
  true,
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "product_types" "category"
WHERE "category"."slug" = 'isolation-et-etancheite'
ON CONFLICT ("category_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "is_active" = true,
  "visible_ecommerce" = true,
  "visible_vitrine" = true,
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_cie_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_today_cie_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
VALUES
  ('produit-pose-carrelage', 'filtres-principaux', 'Filtres principaux', 0),
  ('produit-pose-carrelage', 'caracteristiques-techniques', 'Caractéristiques techniques', 20),
  ('produit-pose-carrelage', 'logistique', 'Logistique', 30),
  ('materiau-batiment-jardin', 'filtres-principaux', 'Filtres principaux', 0),
  ('materiau-batiment-jardin', 'caracteristiques-techniques', 'Caractéristiques techniques', 20),
  ('materiau-batiment-jardin', 'logistique', 'Logistique', 30);

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
FROM "_today_cie_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_cie_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  "group_slug" TEXT NOT NULL
);

INSERT INTO "_today_cie_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "is_filterable", "sort_order", "group_slug"
)
VALUES
  ('product_use', 'Type de produit', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY[
    'Ciment colle flexible',
    'Membrane d''étanchéité liquide',
    'Mortier colle carrelage',
    'Panneau d''isolation thermique',
    'Revêtement d''étanchéité',
    'Revêtement d''étanchéité PU'
  ]::TEXT[], true, 10, 'filtres-principaux'),
  ('application_area', 'Usage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY[
    'Étanchéité sous carrelage',
    'Étanchéité terrasse et balcon',
    'Isolation thermique',
    'Pose carrelage intérieur',
    'Pose carrelage intérieur et extérieur'
  ]::TEXT[], true, 20, 'filtres-principaux'),
  ('packaging_weight_kg', 'Conditionnement', 'kg', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 30, 'logistique'),
  ('ready_to_use', 'Prêt à l''emploi', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 40, 'filtres-principaux'),
  ('tile_adhesive_class', 'Classe mortier-colle', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['C1 TE', 'C2TE S2']::TEXT[], true, 50, 'filtres-principaux'),
  ('board_thickness_cm', 'Épaisseur', 'cm', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 60, 'filtres-principaux'),
  ('physical_form', 'Forme', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY[
    'Liquide',
    'Panneau',
    'Pâte prête à l''emploi',
    'Poudre',
    'Revêtement liquide'
  ]::TEXT[], true, 70, 'caracteristiques-techniques'),
  ('appearance_text', 'Aspect / couleur', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 80, 'caracteristiques-techniques'),
  ('compatible_supports', 'Supports compatibles', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 90, 'caracteristiques-techniques'),
  ('base_chemical', 'Base chimique', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 100, 'caracteristiques-techniques'),
  ('standard_class', 'Norme / classe', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 110, 'caracteristiques-techniques'),
  ('mixing_water_text', 'Eau de gâchage', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 120, 'caracteristiques-techniques'),
  ('application_thickness_mm', 'Épaisseur d''application', 'mm', 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 130, 'caracteristiques-techniques'),
  ('consumption_text', 'Consommation', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 140, 'caracteristiques-techniques'),
  ('working_time_text', 'Durée pratique d''utilisation', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 150, 'caracteristiques-techniques'),
  ('open_time_min', 'Temps ouvert', 'min', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 160, 'caracteristiques-techniques'),
  ('adjustment_time_min', 'Temps d''ajustabilité', 'min', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 170, 'caracteristiques-techniques'),
  ('dimensions_text', 'Dimensions', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 180, 'logistique'),
  ('material', 'Matière', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Polystyrène']::TEXT[], true, 190, 'caracteristiques-techniques'),
  ('density_text', 'Densité', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 200, 'caracteristiques-techniques'),
  ('drying_between_coats_h', 'Séchage entre couches', 'h', 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 210, 'caracteristiques-techniques'),
  ('total_drying_time_h', 'Séchage complet', 'h', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 220, 'caracteristiques-techniques'),
  ('tensile_adhesion_mpa', 'Adhérence traction', 'N/mm²', 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 230, 'caracteristiques-techniques'),
  ('waterproof_pressure_text', 'Étanchéité pression', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 240, 'caracteristiques-techniques');

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
FROM "_today_cie_attribute_definitions"
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
FROM "_today_cie_attribute_definitions" "seed"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "seed"."key"
JOIN "product_type_templates" "template"
  ON "template"."slug" IN ('produit-pose-carrelage', 'materiau-batiment-jardin')
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."product_type_id" = "template"."id"
  AND "attribute_group"."slug" = "seed"."group_slug"
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "attribute_group_id" = EXCLUDED."attribute_group_id",
  "is_required" = EXCLUDED."is_required",
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_cie_products" AS
SELECT *
FROM jsonb_to_recordset($products$
[
  {
    "sku":"00252201",
    "slug":"ciment-colle-fm-bond-88-white-25kg-deutsch-color-00252201",
    "name":"CIMENT COLLE FM BONDE 88 WHITE DEUTSCH COLOR",
    "display_name":"Ciment colle FM Bond 88 White 25kg Deutsch Color",
    "brand_slug":"deutsch-color",
    "product_type_slug":"produit-pose-carrelage",
    "kind":"SINGLE",
    "category_slug":"revetements-de-sols-et-murs",
    "subcategory_slug":"produits-de-pose-finition",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_default_sku":null,
    "family_main_media_id":null,
    "price_ttc":54.737,
    "vat_rate":19.000,
    "stock_available":55.000,
    "stock_unit":"BAG",
    "title_seo":"Ciment colle FM Bond 88 White 25kg",
    "description_seo":"Ciment colle flexible Deutsch Color C2TE S2 blanc pour carrelage intérieur/extérieur, supports difficiles et piscines.",
    "tags":"ciment-colle mortier-colle carrelage deutsch-color fm-bond-88 white blanc c2te-s2 flexible piscine interieur-exterieur sac-25kg",
    "intro":"FM Bond 88 White Deutsch Color est un mortier colle flexible blanc pour travaux de carrelage exigeants.",
    "details":"Sa fiche technique indique un classement C2TE S2 selon EN 12004 / EN 12002. Il convient à la pose en intérieur et extérieur, aux locaux humides, piscines et supports difficiles lorsqu'ils sont préparés selon les recommandations du fabricant.",
    "attributes":[
      {"key":"product_use","value":"Ciment colle flexible"},
      {"key":"application_area","value":"Pose carrelage intérieur et extérieur"},
      {"key":"packaging_weight_kg","value":"25"},
      {"key":"tile_adhesive_class","value":"C2TE S2"},
      {"key":"physical_form","value":"Poudre"},
      {"key":"appearance_text","value":"Blanc"},
      {"key":"compatible_supports","value":"Béton, chape ciment, anciens carreaux, supports difficiles"},
      {"key":"base_chemical","value":"Base ciment"},
      {"key":"standard_class","value":"EN 12004 C2TE S2 / EN 12002 S2"},
      {"key":"working_time_text","value":"Environ 4 h"},
      {"key":"open_time_min","value":"30"},
      {"key":"adjustment_time_min","value":"45"}
    ],
    "media":[
      {"media_id":1968,"role":"GALLERY","name":"Ciment colle FM Bond 88 White Deutsch Color","alt_text":"Sac Ciment colle FM Bond 88 White 25kg Deutsch Color","sort_order":0},
      {"media_id":1971,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique FM Bond 88 Deutsch Color","sort_order":100}
    ],
    "sort_order":0
  },
  {
    "sku":"00227889",
    "slug":"ciment-colle-sikaceram-100-blanc-25kg-sika-00227889",
    "name":"CIMENT COLLE SIKA CERAM 100 BLANC SAC 25KG",
    "display_name":"Ciment colle SikaCeram-100 blanc 25kg Sika",
    "brand_slug":"sika",
    "product_type_slug":"produit-pose-carrelage",
    "kind":"SINGLE",
    "category_slug":"revetements-de-sols-et-murs",
    "subcategory_slug":"produits-de-pose-finition",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_default_sku":null,
    "family_main_media_id":null,
    "price_ttc":14.210,
    "vat_rate":19.000,
    "stock_available":1.000,
    "stock_unit":"BAG",
    "title_seo":"Ciment colle SikaCeram-100 blanc 25kg",
    "description_seo":"Mortier-colle SikaCeram-100 blanc C1 TE pour pose intérieure de carreaux céramiques, sac 25kg.",
    "tags":"ciment-colle mortier-colle carrelage sika sikaceram-100 blanc c1-te interieur sol-mur sac-25kg",
    "intro":"SikaCeram-100 blanc est un mortier-colle mono-composant pour la pose intérieure de carreaux céramiques.",
    "details":"La fiche technique indique un classement C1 TE selon EN NF 12004, une application sur béton, chape, enduit ciment, terre cuite ou béton cellulaire, et une épaisseur de pose de 1 à 6 mm.",
    "attributes":[
      {"key":"product_use","value":"Mortier colle carrelage"},
      {"key":"application_area","value":"Pose carrelage intérieur"},
      {"key":"packaging_weight_kg","value":"25"},
      {"key":"tile_adhesive_class","value":"C1 TE"},
      {"key":"physical_form","value":"Poudre"},
      {"key":"appearance_text","value":"Blanc"},
      {"key":"compatible_supports","value":"Béton, chape ciment, enduit ciment, béton cellulaire"},
      {"key":"base_chemical","value":"Mortier de ciment"},
      {"key":"standard_class","value":"EN NF 12004 C1 TE"},
      {"key":"mixing_water_text","value":"5,3 à 5,6 L par sac de 25 kg"},
      {"key":"application_thickness_mm","value":"1 à 6"},
      {"key":"consumption_text","value":"1,5 à 7 kg/m² selon support et encollage"},
      {"key":"working_time_text","value":"2,5 à 3 h"},
      {"key":"open_time_min","value":"30"},
      {"key":"adjustment_time_min","value":"20"}
    ],
    "media":[
      {"media_id":1969,"role":"GALLERY","name":"Ciment colle SikaCeram-100 blanc 25kg","alt_text":"Sac SikaCeram-100 blanc 25kg","sort_order":0},
      {"media_id":1970,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique SikaCeram-100","sort_order":100}
    ],
    "sort_order":10
  },
  {
    "sku":"00197243",
    "slug":"isolation-polystyrene-100x100-ep2-00197243",
    "name":"ISOLATION POLYSTERENE 100/100 EP2",
    "display_name":"Panneau polystyrène 100x100 cm ép. 2 cm",
    "brand_slug":null,
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"VARIANT",
    "category_slug":"isolation-et-etancheite",
    "subcategory_slug":"isolation-thermique",
    "family_slug":"isolation-polystyrene-100x100",
    "family_name":"Panneaux polystyrène 100x100 cm",
    "family_subtitle":"Isolation thermique",
    "family_description":"Panneaux isolants en polystyrène 100x100 cm, disponibles en différentes épaisseurs.",
    "family_description_seo":"Panneaux polystyrène 100x100 cm pour isolation thermique, disponibles en épaisseurs 2 cm et 4 cm.",
    "family_default_sku":"00180047",
    "family_main_media_id":1963,
    "price_ttc":5.844,
    "vat_rate":7.000,
    "stock_available":226.000,
    "stock_unit":"PIECE",
    "title_seo":"Panneau polystyrène 100x100 ép. 2 cm",
    "description_seo":"Panneau d'isolation thermique en polystyrène 100x100 cm, épaisseur 2 cm, vendu à la pièce.",
    "tags":"isolation polystyrene panneau-isolant 100x100 epaisseur-2cm thermique construction",
    "intro":"Panneau d'isolation en polystyrène blanc au format 100 cm x 100 cm, épaisseur 2 cm.",
    "details":"Ce panneau léger est destiné aux travaux d'isolation thermique et aux applications de construction nécessitant un isolant facile à manipuler et à découper.",
    "attributes":[
      {"key":"product_use","value":"Panneau d'isolation thermique"},
      {"key":"application_area","value":"Isolation thermique"},
      {"key":"material","value":"Polystyrène"},
      {"key":"dimensions_text","value":"100 cm x 100 cm"},
      {"key":"board_thickness_cm","value":"2"},
      {"key":"physical_form","value":"Panneau"},
      {"key":"appearance_text","value":"Blanc"}
    ],
    "media":[
      {"media_id":1962,"role":"GALLERY","name":"Isolation polystyrene 100x100 epaisseur 2 cm","alt_text":"Panneau isolation polystyrene 100x100 cm epaisseur 2 cm","sort_order":0}
    ],
    "sort_order":20
  },
  {
    "sku":"00180047",
    "slug":"isolation-polystyrene-100x100-ep4-00180047",
    "name":"ISOLATION POLYSTERENE 100/100 EP4",
    "display_name":"Panneau polystyrène 100x100 cm ép. 4 cm",
    "brand_slug":null,
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"VARIANT",
    "category_slug":"isolation-et-etancheite",
    "subcategory_slug":"isolation-thermique",
    "family_slug":"isolation-polystyrene-100x100",
    "family_name":"Panneaux polystyrène 100x100 cm",
    "family_subtitle":"Isolation thermique",
    "family_description":"Panneaux isolants en polystyrène 100x100 cm, disponibles en différentes épaisseurs.",
    "family_description_seo":"Panneaux polystyrène 100x100 cm pour isolation thermique, disponibles en épaisseurs 2 cm et 4 cm.",
    "family_default_sku":"00180047",
    "family_main_media_id":1963,
    "price_ttc":10.895,
    "vat_rate":7.000,
    "stock_available":514.000,
    "stock_unit":"PIECE",
    "title_seo":"Panneau polystyrène 100x100 ép. 4 cm",
    "description_seo":"Panneau d'isolation thermique en polystyrène 100x100 cm, épaisseur 4 cm, vendu à la pièce.",
    "tags":"isolation polystyrene panneau-isolant 100x100 epaisseur-4cm thermique construction",
    "intro":"Panneau d'isolation en polystyrène blanc au format 100 cm x 100 cm, épaisseur 4 cm.",
    "details":"Ce panneau léger est destiné aux travaux d'isolation thermique et aux applications de construction nécessitant un isolant facile à manipuler et à découper.",
    "attributes":[
      {"key":"product_use","value":"Panneau d'isolation thermique"},
      {"key":"application_area","value":"Isolation thermique"},
      {"key":"material","value":"Polystyrène"},
      {"key":"dimensions_text","value":"100 cm x 100 cm"},
      {"key":"board_thickness_cm","value":"4"},
      {"key":"physical_form","value":"Panneau"},
      {"key":"appearance_text","value":"Blanc"}
    ],
    "media":[
      {"media_id":1963,"role":"GALLERY","name":"Isolation polystyrene 100x100 epaisseur 4 cm","alt_text":"Panneau isolation polystyrene 100x100 cm epaisseur 4 cm","sort_order":0}
    ],
    "sort_order":30
  },
  {
    "sku":"00219594",
    "slug":"isoline-membrane-etancheite-15kg-deutsch-color-00219594",
    "name":"ISOLINE 15 KG DEUTSCH COLOR",
    "display_name":"Isoline membrane d'étanchéité 15kg Deutsch Color",
    "brand_slug":"deutsch-color",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"VARIANT",
    "category_slug":"isolation-et-etancheite",
    "subcategory_slug":"etancheite",
    "family_slug":"isoline-deutsch-color",
    "family_name":"Isoline Deutsch Color",
    "family_subtitle":"Membrane d'étanchéité liquide",
    "family_description":"Membrane d'étanchéité liquide prête à l'emploi pour sols et murs avant pose de carrelage, disponible en plusieurs conditionnements.",
    "family_description_seo":"Isoline Deutsch Color, membrane d'étanchéité liquide prête à l'emploi en seaux 5 kg et 15 kg.",
    "family_default_sku":"00219594",
    "family_main_media_id":1965,
    "price_ttc":185.000,
    "vat_rate":19.000,
    "stock_available":3.000,
    "stock_unit":"BUCKET",
    "title_seo":"Isoline étanchéité 15kg Deutsch Color",
    "description_seo":"Membrane d'étanchéité liquide Isoline Deutsch Color, prête à l'emploi, seau 15kg pour sols et murs avant carrelage.",
    "tags":"isoline deutsch-color etancheite membrane-liquide pret-a-l-emploi sous-carrelage salle-de-bain balcon seau-15kg",
    "intro":"Isoline Deutsch Color est une membrane d'étanchéité liquide élastique, prête à l'emploi.",
    "details":"Elle s'applique au rouleau ou à la brosse et forme une membrane imperméable et perméable à la vapeur. Elle est adaptée aux salles de bains, balcons et supports à carreler lorsqu'elle est mise en œuvre selon la fiche technique.",
    "attributes":[
      {"key":"product_use","value":"Membrane d'étanchéité liquide"},
      {"key":"application_area","value":"Étanchéité sous carrelage"},
      {"key":"packaging_weight_kg","value":"15"},
      {"key":"ready_to_use","value":"true"},
      {"key":"physical_form","value":"Liquide"},
      {"key":"appearance_text","value":"Gris"},
      {"key":"compatible_supports","value":"Béton, plaques de plâtre, sols et murs avant carrelage"},
      {"key":"base_chemical","value":"Dispersion élastique"},
      {"key":"density_text","value":"1,58 kg/L"},
      {"key":"drying_between_coats_h","value":"Environ 6 h à 20 °C"},
      {"key":"total_drying_time_h","value":"24"},
      {"key":"waterproof_pressure_text","value":"7 Atm selon DIN 1048"}
    ],
    "media":[
      {"media_id":1965,"role":"GALLERY","name":"Isoline 15kg Deutsch Color","alt_text":"Seau Isoline 15kg Deutsch Color","sort_order":0},
      {"media_id":1972,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique Isoline Deutsch Color","sort_order":100}
    ],
    "sort_order":40
  },
  {
    "sku":"00219587",
    "slug":"isoline-membrane-etancheite-5kg-deutsch-color-00219587",
    "name":"ISOLINE 5 KG DEUTSCH COLOR",
    "display_name":"Isoline membrane d'étanchéité 5kg Deutsch Color",
    "brand_slug":"deutsch-color",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"VARIANT",
    "category_slug":"isolation-et-etancheite",
    "subcategory_slug":"etancheite",
    "family_slug":"isoline-deutsch-color",
    "family_name":"Isoline Deutsch Color",
    "family_subtitle":"Membrane d'étanchéité liquide",
    "family_description":"Membrane d'étanchéité liquide prête à l'emploi pour sols et murs avant pose de carrelage, disponible en plusieurs conditionnements.",
    "family_description_seo":"Isoline Deutsch Color, membrane d'étanchéité liquide prête à l'emploi en seaux 5 kg et 15 kg.",
    "family_default_sku":"00219594",
    "family_main_media_id":1965,
    "price_ttc":67.369,
    "vat_rate":19.000,
    "stock_available":2.000,
    "stock_unit":"BUCKET",
    "title_seo":"Isoline étanchéité 5kg Deutsch Color",
    "description_seo":"Membrane d'étanchéité liquide Isoline Deutsch Color, prête à l'emploi, seau 5kg pour sols et murs avant carrelage.",
    "tags":"isoline deutsch-color etancheite membrane-liquide pret-a-l-emploi sous-carrelage salle-de-bain balcon seau-5kg",
    "intro":"Isoline Deutsch Color est une membrane d'étanchéité liquide élastique, prête à l'emploi.",
    "details":"Ce conditionnement de 5 kg est adapté aux petites zones à étancher avant carrelage. Il s'applique au rouleau ou à la brosse et forme une membrane imperméable et perméable à la vapeur.",
    "attributes":[
      {"key":"product_use","value":"Membrane d'étanchéité liquide"},
      {"key":"application_area","value":"Étanchéité sous carrelage"},
      {"key":"packaging_weight_kg","value":"5"},
      {"key":"ready_to_use","value":"true"},
      {"key":"physical_form","value":"Liquide"},
      {"key":"appearance_text","value":"Gris"},
      {"key":"compatible_supports","value":"Béton, plaques de plâtre, sols et murs avant carrelage"},
      {"key":"base_chemical","value":"Dispersion élastique"},
      {"key":"density_text","value":"1,58 kg/L"},
      {"key":"drying_between_coats_h","value":"Environ 6 h à 20 °C"},
      {"key":"total_drying_time_h","value":"24"},
      {"key":"waterproof_pressure_text","value":"7 Atm selon DIN 1048"}
    ],
    "media":[
      {"media_id":1964,"role":"GALLERY","name":"Isoline 5kg Deutsch Color","alt_text":"Seau Isoline 5kg Deutsch Color","sort_order":0},
      {"media_id":1972,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique Isoline Deutsch Color","sort_order":100}
    ],
    "sort_order":50
  },
  {
    "sku":"00233545",
    "slug":"izodicht-d-17-etancheite-acrylique-20kg-deutsch-color-00233545",
    "name":"IZODICHT D-17 20KG (SEAU) DEUTSCH COLOR",
    "display_name":"Izodicht D-17 étanchéité acrylique 20kg Deutsch Color",
    "brand_slug":"deutsch-color",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"SINGLE",
    "category_slug":"isolation-et-etancheite",
    "subcategory_slug":"etancheite",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_default_sku":null,
    "family_main_media_id":null,
    "price_ttc":153.685,
    "vat_rate":19.000,
    "stock_available":2.000,
    "stock_unit":"BUCKET",
    "title_seo":"Izodicht D-17 étanchéité 20kg",
    "description_seo":"Revêtement d'étanchéité acrylique Izodicht D-17 Deutsch Color prêt à l'emploi pour terrasses et balcons.",
    "tags":"izodicht-d17 deutsch-color etancheite acrylique pret-a-l-emploi terrasse balcon seau-20kg",
    "intro":"Izodicht D-17 Deutsch Color est un revêtement d'étanchéité acrylique prêt à l'emploi.",
    "details":"Il forme une membrane élastique de protection contre l'eau sur terrasses et balcons propres et secs. La fiche technique indique une base copolymère acrylique, une consommation indicative de 0,8 à 1 kg/m² et un séchage complet en 24 h.",
    "attributes":[
      {"key":"product_use","value":"Revêtement d'étanchéité"},
      {"key":"application_area","value":"Étanchéité terrasse et balcon"},
      {"key":"packaging_weight_kg","value":"20"},
      {"key":"ready_to_use","value":"true"},
      {"key":"physical_form","value":"Pâte prête à l'emploi"},
      {"key":"appearance_text","value":"Blanc"},
      {"key":"compatible_supports","value":"Terrasses, balcons, béton et supports secs propres"},
      {"key":"base_chemical","value":"Copolymère acrylique"},
      {"key":"density_text","value":"1,35 ± 0,02 g/ml"},
      {"key":"tensile_adhesion_mpa","value":"≥ 0,8 N/mm² sur béton"},
      {"key":"consumption_text","value":"0,8 à 1 kg/m² ; 1,5 à 2 kg/m² avec trame complète"},
      {"key":"drying_between_coats_h","value":"6 à 8 h"},
      {"key":"total_drying_time_h","value":"24"}
    ],
    "media":[
      {"media_id":1966,"role":"GALLERY","name":"Izodicht D-17 20kg Deutsch Color","alt_text":"Seau Izodicht D-17 20kg Deutsch Color","sort_order":0},
      {"media_id":1973,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique Izodicht D-17 Deutsch Color","sort_order":100}
    ],
    "sort_order":60
  },
  {
    "sku":"00252218",
    "slug":"izodicht-pu-etancheite-white-18kg-deutsch-color-00252218",
    "name":"IZODICHT PU 18KG WHITE (SEAU) DEUTSCH COLOR",
    "display_name":"Izodicht PU White étanchéité 18kg Deutsch Color",
    "brand_slug":"deutsch-color",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"SINGLE",
    "category_slug":"isolation-et-etancheite",
    "subcategory_slug":"etancheite",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_default_sku":null,
    "family_main_media_id":null,
    "price_ttc":242.106,
    "vat_rate":19.000,
    "stock_available":1.000,
    "stock_unit":"BUCKET",
    "title_seo":"Izodicht PU White étanchéité 18kg",
    "description_seo":"Revêtement d'étanchéité PU blanc Izodicht Deutsch Color prêt à l'emploi pour terrasses, balcons et zones humides.",
    "tags":"izodicht-pu deutsch-color etancheite pu white blanc pret-a-l-emploi terrasse balcon seau-18kg",
    "intro":"Izodicht PU White Deutsch Color est un revêtement d'étanchéité blanc prêt à l'emploi.",
    "details":"Sa fiche technique indique une base polymère PU, une forte adhérence et une application sur terrasses, balcons, murs et zones exposées à l'humidité. La consommation indicative est de 0,8 à 1 kg/m² avec séchage complet en 24 h.",
    "attributes":[
      {"key":"product_use","value":"Revêtement d'étanchéité PU"},
      {"key":"application_area","value":"Étanchéité terrasse et balcon"},
      {"key":"packaging_weight_kg","value":"18"},
      {"key":"ready_to_use","value":"true"},
      {"key":"physical_form","value":"Revêtement liquide"},
      {"key":"appearance_text","value":"Blanc"},
      {"key":"compatible_supports","value":"Terrasses, balcons, béton, briques, bois, métal"},
      {"key":"base_chemical","value":"Polymère PU"},
      {"key":"density_text","value":"1,35 ± 0,02 g/ml"},
      {"key":"tensile_adhesion_mpa","value":"≥ 1,5 N/mm²"},
      {"key":"consumption_text","value":"0,8 à 1 kg/m²"},
      {"key":"drying_between_coats_h","value":"4 à 6 h"},
      {"key":"total_drying_time_h","value":"24"}
    ],
    "media":[
      {"media_id":1967,"role":"GALLERY","name":"Izodicht PU White 18kg Deutsch Color","alt_text":"Seau Izodicht PU White 18kg Deutsch Color","sort_order":0},
      {"media_id":1974,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique Izodicht PU Deutsch Color","sort_order":100}
    ],
    "sort_order":70
  }
]
$products$::jsonb) AS "product"(
  "sku" TEXT,
  "slug" TEXT,
  "name" TEXT,
  "display_name" TEXT,
  "brand_slug" TEXT,
  "product_type_slug" TEXT,
  "kind" TEXT,
  "category_slug" TEXT,
  "subcategory_slug" TEXT,
  "family_slug" TEXT,
  "family_name" TEXT,
  "family_subtitle" TEXT,
  "family_description" TEXT,
  "family_description_seo" TEXT,
  "family_default_sku" TEXT,
  "family_main_media_id" BIGINT,
  "price_ttc" NUMERIC(12,3),
  "vat_rate" NUMERIC(5,3),
  "stock_available" NUMERIC(12,3),
  "stock_unit" TEXT,
  "title_seo" TEXT,
  "description_seo" TEXT,
  "tags" TEXT,
  "intro" TEXT,
  "details" TEXT,
  "attributes" JSONB,
  "media" JSONB,
  "sort_order" INTEGER
);

DO $$
DECLARE
  missing_reference_count INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM "_today_cie_products") <> 8 THEN
    RAISE EXCEPTION 'Expected 8 Today cement/isolation/waterproofing products.';
  END IF;

  SELECT COUNT(*)
  INTO missing_reference_count
  FROM (
    SELECT DISTINCT 'product type ' || "seed"."product_type_slug" AS "reference"
    FROM "_today_cie_products" "seed"
    LEFT JOIN "product_type_templates" "template"
      ON "template"."slug" = "seed"."product_type_slug"
    WHERE "template"."id" IS NULL

    UNION ALL

    SELECT DISTINCT 'brand ' || "seed"."brand_slug" AS "reference"
    FROM "_today_cie_products" "seed"
    LEFT JOIN "organizations" "brand"
      ON "brand"."slug" = "seed"."brand_slug"
      AND "brand"."is_product_brand" = true
    WHERE "seed"."brand_slug" IS NOT NULL
      AND "brand"."id" IS NULL

    UNION ALL

    SELECT DISTINCT "seed"."category_slug" || '/' || "seed"."subcategory_slug" AS "reference"
    FROM "_today_cie_products" "seed"
    LEFT JOIN "product_types" "category"
      ON "category"."slug" = "seed"."category_slug"
    LEFT JOIN "product_subcategories" "subcategory"
      ON "subcategory"."category_id" = "category"."id"
      AND "subcategory"."slug" = "seed"."subcategory_slug"
    WHERE "subcategory"."id" IS NULL

    UNION ALL

    SELECT DISTINCT 'family media ' || "seed"."family_main_media_id" AS "reference"
    FROM "_today_cie_products" "seed"
    LEFT JOIN "media" "media"
      ON "media"."id" = "seed"."family_main_media_id"
    WHERE "seed"."family_main_media_id" IS NOT NULL
      AND "media"."id" IS NULL
  ) "missing";

  IF missing_reference_count > 0 THEN
    RAISE EXCEPTION 'Today cement/isolation/waterproofing seed aborted: % required product reference(s) are missing.', missing_reference_count;
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
  "guarantee_months",
  "visible_ecommerce",
  "visible_vitrine",
  "is_featured",
  "is_new",
  "stock_available",
  "stock_alert_threshold",
  "stock_unit",
  "stock_availability",
  "stock_visibility",
  "base_price_ttc_tnd",
  "current_price_ttc_tnd",
  "vat_rate",
  "price_visibility",
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
  left("seed"."name", 255),
  left("seed"."display_name", 255),
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
  "seed"."stock_unit"::"StockUnit",
  CASE
    WHEN "seed"."stock_available" > 0 THEN 'IN_STOCK'::"ProductAvailability"
    ELSE 'OUT_OF_STOCK'::"ProductAvailability"
  END,
  'AUTO'::"ProductInventoryVisibility",
  "seed"."price_ttc",
  "seed"."price_ttc",
  "seed"."vat_rate",
  'AUTO'::"ProductPricingVisibility",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_cie_products" "seed"
LEFT JOIN "organizations" "brand"
  ON "brand"."slug" = "seed"."brand_slug"
  AND "brand"."is_product_brand" = true
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
SELECT DISTINCT ON ("seed"."family_slug")
  "seed"."family_slug",
  "seed"."family_name",
  "seed"."family_subtitle",
  "seed"."family_description",
  left("seed"."family_description_seo", 160),
  "seed"."family_main_media_id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_cie_products" "seed"
WHERE "seed"."family_slug" IS NOT NULL
ORDER BY "seed"."family_slug", "seed"."sort_order"
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
  AND "family"."slug" IN (
    SELECT DISTINCT "family_slug"
    FROM "_today_cie_products"
    WHERE "family_slug" IS NOT NULL
  );

DELETE FROM "product_family_members" "member"
USING "products" "product", "_today_cie_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  (row_number() OVER (PARTITION BY "seed"."family_slug" ORDER BY "seed"."sort_order") - 1)::INTEGER
FROM "_today_cie_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = "seed"."family_slug"
WHERE "seed"."family_slug" IS NOT NULL
ON CONFLICT ("product_id") DO UPDATE SET
  "family_id" = EXCLUDED."family_id",
  "sort_order" = EXCLUDED."sort_order";

WITH "default_products" AS (
  SELECT DISTINCT
    "family"."id" AS "family_id",
    "product"."id" AS "product_id"
  FROM "_today_cie_products" "seed"
  JOIN "product_families" "family"
    ON "family"."slug" = "seed"."family_slug"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."family_default_sku"
  WHERE "seed"."family_slug" IS NOT NULL
)
UPDATE "product_families" "family"
SET
  "default_product_id" = "default_products"."product_id",
  "updated_at" = CURRENT_TIMESTAMP
FROM "default_products"
WHERE "family"."id" = "default_products"."family_id";

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_today_cie_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_today_cie_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = "seed"."category_slug"
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = "seed"."subcategory_slug"
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_media" "product_media"
USING "products" "product", "_today_cie_products" "seed"
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
  left(
    CASE
      WHEN "media_seed"."role" = 'GALLERY'
        THEN regexp_replace(COALESCE("media"."original_filename", "product"."display_name"), '\.[^.]+$', '')
      ELSE COALESCE("media_seed"."name", regexp_replace(COALESCE("media"."original_filename", "product"."display_name"), '\.[^.]+$', ''))
    END,
    255
  ),
  left("media_seed"."alt_text", 255),
  "media_seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_cie_products" "seed"
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
USING "products" "product", "_today_cie_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    SELECT "key" FROM "_today_cie_attribute_definitions"
  );

INSERT INTO "product_attributes" (
  "product_id", "attribute_def_id", "attribute_group_id", "name", "label", "value",
  "unit", "input_type", "is_required", "is_filterable", "group_name", "group_sort_order", "sort_order"
)
SELECT
  "product"."id",
  "definition"."id",
  "type_attribute"."attribute_group_id",
  "definition"."key",
  "definition"."label",
  left("attribute_seed"."value", 255),
  "definition"."unit",
  "definition"."input_type",
  COALESCE("type_attribute"."is_required", false),
  COALESCE("type_attribute"."is_filterable", false),
  "attribute_group"."name",
  COALESCE("attribute_group"."sort_order", 0),
  COALESCE("attribute_seed"."sort_order", "type_attribute"."sort_order", 0)
FROM "_today_cie_products" "seed"
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

DO $$
DECLARE
  expected_product_count INTEGER;
  seeded_product_count INTEGER;
  expected_media_count INTEGER;
  seeded_media_count INTEGER;
  expected_attribute_count INTEGER;
  seeded_attribute_count INTEGER;
  expected_family_member_count INTEGER;
  seeded_family_member_count INTEGER;
  expected_subcategory_count INTEGER;
  seeded_subcategory_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO expected_product_count FROM "_today_cie_products";

  SELECT COUNT(*)
  INTO seeded_product_count
  FROM "_today_cie_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
    AND "product"."slug" = "seed"."slug"
    AND "product"."kind" = "seed"."kind"::"ProductKind"
    AND "product"."stock_available" = "seed"."stock_available"
    AND "product"."stock_unit" = "seed"."stock_unit"::"StockUnit"
    AND "product"."base_price_ttc_tnd" = "seed"."price_ttc"
    AND "product"."vat_rate" = "seed"."vat_rate";

  IF seeded_product_count <> expected_product_count THEN
    RAISE EXCEPTION 'Today cement/isolation/waterproofing validation failed: expected % products, found %.', expected_product_count, seeded_product_count;
  END IF;

  SELECT COALESCE(SUM(jsonb_array_length("media")), 0)
  INTO expected_media_count
  FROM "_today_cie_products";

  SELECT COUNT(*)
  INTO seeded_media_count
  FROM "_today_cie_products" "seed"
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

  IF seeded_media_count <> expected_media_count THEN
    RAISE EXCEPTION 'Today cement/isolation/waterproofing validation failed: expected % media links, found %.', expected_media_count, seeded_media_count;
  END IF;

  SELECT COALESCE(SUM(jsonb_array_length("attributes")), 0)
  INTO expected_attribute_count
  FROM "_today_cie_products";

  SELECT COUNT(*)
  INTO seeded_attribute_count
  FROM "_today_cie_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL jsonb_to_recordset("seed"."attributes") AS "attribute_seed"(
    "key" TEXT,
    "value" TEXT,
    "sort_order" INTEGER
  )
  JOIN "product_attributes" "attribute"
    ON "attribute"."product_id" = "product"."id"
    AND "attribute"."name" = "attribute_seed"."key"
    AND "attribute"."value" = left("attribute_seed"."value", 255);

  IF seeded_attribute_count <> expected_attribute_count THEN
    RAISE EXCEPTION 'Today cement/isolation/waterproofing validation failed: expected % product attributes, found %.', expected_attribute_count, seeded_attribute_count;
  END IF;

  SELECT COUNT(*)
  INTO expected_family_member_count
  FROM "_today_cie_products"
  WHERE "family_slug" IS NOT NULL;

  SELECT COUNT(*)
  INTO seeded_family_member_count
  FROM "_today_cie_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_family_members" "member"
    ON "member"."product_id" = "product"."id"
  JOIN "product_families" "family"
    ON "family"."id" = "member"."family_id"
    AND "family"."slug" = "seed"."family_slug"
  WHERE "seed"."family_slug" IS NOT NULL;

  IF seeded_family_member_count <> expected_family_member_count THEN
    RAISE EXCEPTION 'Today cement/isolation/waterproofing validation failed: expected % family members, found %.', expected_family_member_count, seeded_family_member_count;
  END IF;

  SELECT COUNT(*) INTO expected_subcategory_count FROM "_today_cie_products";

  SELECT COUNT(*)
  INTO seeded_subcategory_count
  FROM "_today_cie_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_types" "category"
    ON "category"."slug" = "seed"."category_slug"
  JOIN "product_subcategories" "subcategory"
    ON "subcategory"."category_id" = "category"."id"
    AND "subcategory"."slug" = "seed"."subcategory_slug"
  JOIN "product_subcategory_links" "link"
    ON "link"."product_id" = "product"."id"
    AND "link"."subcategory_id" = "subcategory"."id";

  IF seeded_subcategory_count <> expected_subcategory_count THEN
    RAISE EXCEPTION 'Today cement/isolation/waterproofing validation failed: expected % subcategory links, found %.', expected_subcategory_count, seeded_subcategory_count;
  END IF;
END $$;
