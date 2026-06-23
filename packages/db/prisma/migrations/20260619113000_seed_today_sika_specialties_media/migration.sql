-- Seed the ZIP-backed Today Sika specialty products.
-- These folders are simple products; they share the Sika brand but are not true variants.

CREATE TEMP TABLE "_today_sika_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_today_sika_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1804, 'SIKA MONO TOP 412N TN SAC 25KG SIKA (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1805, 'SIKA TOP 121 GRIS 10.7KG (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1806, 'SIKAGARD 104 BIDON 5L SIKA (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1808, 'SIKAGARD 240 BIDON 5L SIKA (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1809, 'SIKALASTIC 260 SEAU DE 7KG (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1811, 'SIKA TOP 121 GRIS 10.7KG [1].webp', 'IMAGE'::"MediaKind"),
  (1812, 'SIKAGARD 104 BIDON 5L SIKA [1].webp', 'IMAGE'::"MediaKind"),
  (1813, 'SIKAGARD 145 BIDON 5L SIKA [1].webp', 'IMAGE'::"MediaKind"),
  (1814, 'SIKAGARD 240 BIDON 5L SIKA [1].webp', 'IMAGE'::"MediaKind"),
  (1815, 'SIKALASTIC 260 SEAU DE 7KG [1].webp', 'IMAGE'::"MediaKind"),
  (1816, 'SIKAGARD 145 BIDON 5L SIKA (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1817, 'SIKA MONO TOP 412N TN SAC 25KG SIKA [1].webp', 'IMAGE'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_today_sika_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Today Sika seed aborted: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;
END $$;

INSERT INTO "organizations" (
  "slug", "name", "description", "is_product_brand", "is_reference", "is_partner", "created_at", "updated_at"
)
VALUES (
  'sika',
  'Sika',
  'Marque technique pour mortiers, traitements de surface, étanchéité et solutions de construction.',
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

CREATE TEMP TABLE "_today_sika_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_today_sika_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
VALUES
  ('materiau-batiment-jardin', 'filtres-principaux', 'Filtres principaux', 0),
  ('materiau-batiment-jardin', 'caracteristiques-techniques', 'Caractéristiques techniques', 20),
  ('produit-pose-carrelage', 'filtres-principaux', 'Filtres principaux', 0),
  ('produit-pose-carrelage', 'caracteristiques-techniques', 'Caractéristiques techniques', 20);

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
FROM "_today_sika_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_sika_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_today_sika_attribute_definitions" ("key", "label", "unit", "input_type", "select_options")
VALUES
  ('product_use', 'Type de produit', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY[
    'Décapant ciment',
    'Dégriseur bois',
    'Mortier de réparation',
    'Mortier de surfaçage',
    'Protecteur hydrofuge',
    'Système d''étanchéité sous carrelage'
  ]::TEXT[]),
  ('application_area', 'Usage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY[
    'Bois grisé',
    'Étanchéité intérieure',
    'Façade, toiture et sol',
    'Nettoyage laitance ciment',
    'Réparation béton',
    'Surfaçage béton'
  ]::TEXT[]),
  ('packaging_volume_l', 'Conditionnement', 'L', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('packaging_weight_kg', 'Conditionnement', 'kg', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('ready_to_use', 'Prêt à l''emploi', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('physical_form', 'Forme', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY[
    'Dispersion de résine',
    'Gel',
    'Kit bi-composant',
    'Liquide',
    'Poudre'
  ]::TEXT[]),
  ('appearance_text', 'Aspect / couleur', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('compatible_supports', 'Supports compatibles', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('base_chemical', 'Base chimique', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('standard_class', 'Norme / classe', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('application_thickness_mm', 'Épaisseur d''application', 'mm', 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('consumption_text', 'Consommation', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]);

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
FROM "_today_sika_attribute_definitions"
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

CREATE TEMP TABLE "_today_sika_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_today_sika_type_attributes" (
  "product_type_slug", "key", "group_slug", "is_filterable", "sort_order"
)
VALUES
  ('materiau-batiment-jardin', 'product_use', 'filtres-principaux', true, 10),
  ('materiau-batiment-jardin', 'application_area', 'filtres-principaux', true, 20),
  ('materiau-batiment-jardin', 'packaging_volume_l', 'filtres-principaux', true, 30),
  ('materiau-batiment-jardin', 'packaging_weight_kg', 'filtres-principaux', true, 40),
  ('materiau-batiment-jardin', 'ready_to_use', 'filtres-principaux', true, 50),
  ('materiau-batiment-jardin', 'physical_form', 'caracteristiques-techniques', true, 60),
  ('materiau-batiment-jardin', 'appearance_text', 'caracteristiques-techniques', true, 70),
  ('materiau-batiment-jardin', 'compatible_supports', 'caracteristiques-techniques', true, 80),
  ('materiau-batiment-jardin', 'base_chemical', 'caracteristiques-techniques', false, 90),
  ('materiau-batiment-jardin', 'standard_class', 'caracteristiques-techniques', true, 100),
  ('materiau-batiment-jardin', 'application_thickness_mm', 'caracteristiques-techniques', true, 110),
  ('materiau-batiment-jardin', 'consumption_text', 'caracteristiques-techniques', false, 120),
  ('produit-pose-carrelage', 'product_use', 'filtres-principaux', true, 10),
  ('produit-pose-carrelage', 'application_area', 'filtres-principaux', true, 20),
  ('produit-pose-carrelage', 'packaging_volume_l', 'filtres-principaux', true, 30),
  ('produit-pose-carrelage', 'ready_to_use', 'filtres-principaux', true, 40),
  ('produit-pose-carrelage', 'physical_form', 'caracteristiques-techniques', true, 50),
  ('produit-pose-carrelage', 'appearance_text', 'caracteristiques-techniques', true, 60),
  ('produit-pose-carrelage', 'compatible_supports', 'caracteristiques-techniques', true, 70),
  ('produit-pose-carrelage', 'base_chemical', 'caracteristiques-techniques', false, 80),
  ('produit-pose-carrelage', 'consumption_text', 'caracteristiques-techniques', false, 90);

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
FROM "_today_sika_type_attributes" "seed"
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

CREATE TEMP TABLE "_today_sika_products" AS
SELECT *
FROM jsonb_to_recordset($products$
[
  {
    "sku":"00231206",
    "slug":"sikagard-104-degriseur-bois-5l-sika-00231206",
    "name":"SIKAGARD 104 BIDON 5L SIKA",
    "display_name":"Sikagard 104 dégriseur bois 5L Sika",
    "brand_slug":"sika",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"SINGLE",
    "category_slug":"revetements-de-sols-et-murs",
    "subcategory_slug":"produits-de-pose-finition",
    "price_ttc":95.000,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Sikagard 104 dégriseur bois 5L",
    "description_seo":"Sikagard 104 Sika, gel dégriseur prêt à l'emploi pour redonner leur couleur d'origine aux bois grisés.",
    "tags":"sikagard 104 sika degriseur bois nettoyant gel bois-grise terrasse bardage cloture teck chene pin bidon-5l",
    "intro":"Sikagard 104 est un gel dégriseur destiné aux bois grisés par l'exposition et le vieillissement naturel.",
    "details":"Sa texture gel facilite l'application sur les surfaces verticales comme les bardages et clôtures, tout en restant adaptée aux lames de terrasse. Il aide le bois à retrouver une teinte plus proche de son aspect d'origine avant une finition ou un entretien.",
    "attributes":[
      {"key":"product_use","value":"Dégriseur bois","sort_order":10},
      {"key":"application_area","value":"Bois grisé","sort_order":20},
      {"key":"packaging_volume_l","value":"5","sort_order":30},
      {"key":"ready_to_use","value":"true","sort_order":50},
      {"key":"physical_form","value":"Gel","sort_order":60},
      {"key":"appearance_text","value":"Gel translucide","sort_order":70},
      {"key":"compatible_supports","value":"Bois grisés : pin, mélèze, chêne, bois exotiques, red cedar","sort_order":80},
      {"key":"base_chemical","value":"Nettoyant acide en phase aqueuse","sort_order":90},
      {"key":"consumption_text","value":"1 L pour 4 à 10 m² selon support","sort_order":120}
    ],
    "media":[
      {"media_id":1812,"role":"GALLERY","name":"SIKAGARD 104 BIDON 5L SIKA 1","alt_text":"Bidon Sikagard 104 dégriseur bois 5L Sika","sort_order":0},
      {"media_id":1806,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique Sikagard 104 dégriseur bois","sort_order":100}
    ],
    "sort_order":0
  },
  {
    "sku":"00231190",
    "slug":"sikagard-145-decapant-ciment-5l-sika-00231190",
    "name":"SIKAGARD 145 BIDON 5L SIKA",
    "display_name":"Sikagard 145 décapant ciment 5L Sika",
    "brand_slug":"sika",
    "product_type_slug":"produit-pose-carrelage",
    "kind":"SINGLE",
    "category_slug":"revetements-de-sols-et-murs",
    "subcategory_slug":"produits-de-pose-finition",
    "price_ttc":89.000,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Sikagard 145 décapant ciment 5L",
    "description_seo":"Sikagard 145 Sika, décapant ciment prêt à l'emploi pour laitance, traces de ciment et efflorescences.",
    "tags":"sikagard 145 sika decapant ciment laitance joint carrelage efflorescence nettoyage outil chantier bidon-5l",
    "intro":"Sikagard 145 est un décapant ciment conçu pour nettoyer les traces de ciment, les laitances de joints et certains dépôts de chantier.",
    "details":"Il s'utilise notamment après des travaux de carrelage ou de maçonnerie, avec un essai préalable sur support sensible. Sa formule prête à l'emploi simplifie le nettoyage des surfaces et des outils concernés.",
    "attributes":[
      {"key":"product_use","value":"Décapant ciment","sort_order":10},
      {"key":"application_area","value":"Nettoyage laitance ciment","sort_order":20},
      {"key":"packaging_volume_l","value":"5","sort_order":30},
      {"key":"ready_to_use","value":"true","sort_order":40},
      {"key":"physical_form","value":"Liquide","sort_order":50},
      {"key":"appearance_text","value":"Liquide limpide orange","sort_order":60},
      {"key":"compatible_supports","value":"Carrelage, faïence, céramique, acier, inox, aluminium, plastique","sort_order":70},
      {"key":"base_chemical","value":"Décapant acide en phase aqueuse","sort_order":80},
      {"key":"consumption_text","value":"1 L pour 3 à 8 m² selon travaux","sort_order":90}
    ],
    "media":[
      {"media_id":1813,"role":"GALLERY","name":"SIKAGARD 145 BIDON 5L SIKA 1","alt_text":"Bidon Sikagard 145 décapant ciment 5L Sika","sort_order":0},
      {"media_id":1816,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique Sikagard 145 décapant ciment","sort_order":100}
    ],
    "sort_order":10
  },
  {
    "sku":"00231183",
    "slug":"sikagard-240-protecteur-hydrofuge-5l-sika-00231183",
    "name":"SIKAGARD 240 BIDON 5L SIKA",
    "display_name":"Sikagard 240 protecteur hydrofuge 5L Sika",
    "brand_slug":"sika",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"SINGLE",
    "category_slug":"isolation-et-etancheite",
    "subcategory_slug":"etancheite",
    "price_ttc":208.000,
    "stock_available":0.000,
    "stock_unit":"PIECE",
    "title_seo":"Sikagard 240 protecteur hydrofuge 5L",
    "description_seo":"Sikagard 240 Sika protège façades, toitures et sols contre l'eau, les taches et l'encrassement.",
    "tags":"sikagard 240 sika protecteur hydrofuge tout-en-1 facade toiture sol antigraffiti support-mineral bidon-5l",
    "intro":"Sikagard 240 est un protecteur hydrofuge tout en 1 pour supports minéraux en façade, toiture ou sol.",
    "details":"Il aide à limiter la pénétration de l'eau, des liquides huileux et des salissures sans former de film visible en surface. Il convient aux projets qui recherchent une protection discrète en conservant l'aspect du matériau.",
    "attributes":[
      {"key":"product_use","value":"Protecteur hydrofuge","sort_order":10},
      {"key":"application_area","value":"Façade, toiture et sol","sort_order":20},
      {"key":"packaging_volume_l","value":"5","sort_order":30},
      {"key":"ready_to_use","value":"true","sort_order":50},
      {"key":"physical_form","value":"Liquide","sort_order":60},
      {"key":"appearance_text","value":"Protection invisible après application","sort_order":70},
      {"key":"compatible_supports","value":"Pierres naturelles, terre cuite, béton, enduits à base ciment, fibre-ciment, bois, plâtre","sort_order":80},
      {"key":"base_chemical","value":"Produit d'imprégnation en phase aqueuse","sort_order":90}
    ],
    "media":[
      {"media_id":1814,"role":"GALLERY","name":"SIKAGARD 240 BIDON 5L SIKA 1","alt_text":"Bidon Sikagard 240 protecteur hydrofuge 5L Sika","sort_order":0},
      {"media_id":1808,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique Sikagard 240 protecteur tout en 1","sort_order":100}
    ],
    "sort_order":20
  },
  {
    "sku":"00231213",
    "slug":"sikalastic-260-stop-aqua-7kg-sika-00231213",
    "name":"SIKALASTIC 260 SEAU DE 7KG",
    "display_name":"Sikalastic 260 Stop Aqua 7kg Sika",
    "brand_slug":"sika",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"SINGLE",
    "category_slug":"isolation-et-etancheite",
    "subcategory_slug":"etancheite",
    "price_ttc":105.000,
    "stock_available":0.000,
    "stock_unit":"PIECE",
    "title_seo":"Sikalastic 260 étanchéité 7kg",
    "description_seo":"Sikalastic 260 Stop Aqua Sika, système d'étanchéité prêt à l'emploi sous carrelage pour locaux humides.",
    "tags":"sikalastic 260 sika stop-aqua etancheite sous-carrelage locaux-humides douche italienne salle-de-bain seau-7kg",
    "intro":"Sikalastic 260 Stop Aqua est une solution d'étanchéité prête à l'emploi pour les zones humides sous protection carrelée.",
    "details":"Après séchage, le produit forme un film adhérent et étanche à l'eau liquide, prêt à recevoir du carrelage collé. Il est adapté aux salles de bain, douches, sanitaires et autres locaux intérieurs exposés à l'humidité.",
    "attributes":[
      {"key":"product_use","value":"Système d'étanchéité sous carrelage","sort_order":10},
      {"key":"application_area","value":"Étanchéité intérieure","sort_order":20},
      {"key":"packaging_weight_kg","value":"7","sort_order":40},
      {"key":"ready_to_use","value":"true","sort_order":50},
      {"key":"physical_form","value":"Dispersion de résine","sort_order":60},
      {"key":"appearance_text","value":"Résine prête à l'emploi","sort_order":70},
      {"key":"compatible_supports","value":"Planchers intermédiaires, cloisons de locaux humides, chapes et supports admis selon fiche technique","sort_order":80},
      {"key":"base_chemical","value":"Dispersion de résine","sort_order":90}
    ],
    "media":[
      {"media_id":1815,"role":"GALLERY","name":"SIKALASTIC 260 SEAU DE 7KG 1","alt_text":"Seau Sikalastic 260 Stop Aqua 7kg Sika","sort_order":0},
      {"media_id":1809,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique Sikalastic 260 Stop Aqua","sort_order":100}
    ],
    "sort_order":30
  },
  {
    "sku":"00250207",
    "slug":"sika-monotop-412n-tn-mortier-reparation-25kg-00250207",
    "name":"SIKA MONO TOP 412N TN SAC 25KG SIKA",
    "display_name":"Sika MonoTop 412N TN mortier de réparation 25kg",
    "brand_slug":"sika",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"SINGLE",
    "category_slug":"materiaux-de-construction",
    "subcategory_slug":"ciments-et-produits-en-beton",
    "price_ttc":53.264,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Sika MonoTop 412N mortier R4 25kg",
    "description_seo":"Sika MonoTop 412N TN, mortier de réparation structurale R4 pour béton, sac 25kg.",
    "tags":"sika monotop 412n tn mortier reparation structurale beton classe-r4 en-1504-3 fibre faible-retrait sac-25kg",
    "intro":"Sika MonoTop 412N TN est un mortier de réparation monocomposant renforcé en fibres pour ouvrages en béton.",
    "details":"Il est conçu pour les réparations structurelles et non structurelles, le reprofilage et la restauration des supports en béton ou mortier. Sa classe R4 selon EN 1504-3 en fait un choix adapté aux interventions techniques exigeantes.",
    "attributes":[
      {"key":"product_use","value":"Mortier de réparation","sort_order":10},
      {"key":"application_area","value":"Réparation béton","sort_order":20},
      {"key":"packaging_weight_kg","value":"25","sort_order":40},
      {"key":"ready_to_use","value":"false","sort_order":50},
      {"key":"physical_form","value":"Poudre","sort_order":60},
      {"key":"appearance_text","value":"Poudre grise","sort_order":70},
      {"key":"compatible_supports","value":"Béton et mortier","sort_order":80},
      {"key":"base_chemical","value":"Ciment Portland, charges et additifs","sort_order":90},
      {"key":"standard_class","value":"EN 1504-3 classe R4","sort_order":100},
      {"key":"application_thickness_mm","value":"jusqu'à 70 mm par couche selon application","sort_order":110}
    ],
    "media":[
      {"media_id":1817,"role":"GALLERY","name":"SIKA MONO TOP 412N TN SAC 25KG SIKA 1","alt_text":"Sac Sika MonoTop 412N TN mortier de réparation 25kg","sort_order":0},
      {"media_id":1804,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique Sika MonoTop 412N TN","sort_order":100}
    ],
    "sort_order":40
  },
  {
    "sku":"00194808",
    "slug":"sikatop-121-mortier-surfacage-gris-10-7kg-00194808",
    "name":"SIKA TOP 121 GRIS 10.7KG",
    "display_name":"SikaTop 121 mortier de surfaçage gris 10.7kg",
    "brand_slug":"sika",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"SINGLE",
    "category_slug":"materiaux-de-construction",
    "subcategory_slug":"ciments-et-produits-en-beton",
    "price_ttc":38.970,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"SikaTop 121 mortier de surfaçage gris",
    "description_seo":"SikaTop 121 gris, mortier bi-composant pour surfaçage et réparation de faible épaisseur.",
    "tags":"sikatop 121 sika mortier surfacage gris reparation beton bouche-porage pret-a-peindre kit-10-7kg",
    "intro":"SikaTop 121 est un mortier bi-composant gris destiné au surfaçage et aux réparations de faible épaisseur.",
    "details":"Il s'utilise en préparation de fonds, bouche-porage avant peinture ou reprise de supports en bâtiment et génie civil. Son aspect fini prêt à peindre facilite les étapes de finition après réparation.",
    "attributes":[
      {"key":"product_use","value":"Mortier de surfaçage","sort_order":10},
      {"key":"application_area","value":"Surfaçage béton","sort_order":20},
      {"key":"packaging_weight_kg","value":"10.7","sort_order":40},
      {"key":"ready_to_use","value":"false","sort_order":50},
      {"key":"physical_form","value":"Kit bi-composant","sort_order":60},
      {"key":"appearance_text","value":"Mortier gris","sort_order":70},
      {"key":"compatible_supports","value":"Béton, mortier, pierre et brique","sort_order":80},
      {"key":"base_chemical","value":"Mortier à base ciment et polymères","sort_order":90},
      {"key":"application_thickness_mm","value":"réparation de faible épaisseur","sort_order":110}
    ],
    "media":[
      {"media_id":1811,"role":"GALLERY","name":"SIKA TOP 121 GRIS 10.7KG 1","alt_text":"Seau SikaTop 121 gris 10.7kg Sika","sort_order":0},
      {"media_id":1805,"role":"TECHNICAL","name":"Fiche technique","alt_text":"Fiche technique SikaTop 121 surfaçage gris","sort_order":100}
    ],
    "sort_order":50
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
  "sort_order" INTEGER
);

DO $$
DECLARE
  missing_reference_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_reference_count
  FROM (
    SELECT "seed"."product_type_slug" AS "reference"
    FROM "_today_sika_products" "seed"
    LEFT JOIN "product_type_templates" "template"
      ON "template"."slug" = "seed"."product_type_slug"
    WHERE "template"."id" IS NULL

    UNION ALL

    SELECT "seed"."brand_slug" AS "reference"
    FROM "_today_sika_products" "seed"
    LEFT JOIN "organizations" "brand"
      ON "brand"."slug" = "seed"."brand_slug"
    WHERE "brand"."id" IS NULL

    UNION ALL

    SELECT "seed"."category_slug" || '/' || "seed"."subcategory_slug" AS "reference"
    FROM "_today_sika_products" "seed"
    LEFT JOIN "product_types" "category"
      ON "category"."slug" = "seed"."category_slug"
    LEFT JOIN "product_subcategories" "subcategory"
      ON "subcategory"."category_id" = "category"."id"
      AND "subcategory"."slug" = "seed"."subcategory_slug"
    WHERE "subcategory"."id" IS NULL
  ) "missing";

  IF missing_reference_count > 0 THEN
    RAISE EXCEPTION 'Today Sika seed aborted: % required catalog reference(s) are missing.', missing_reference_count;
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
FROM "_today_sika_products" "seed"
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

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_today_sika_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_today_sika_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = "seed"."category_slug"
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = "seed"."subcategory_slug"
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_media" "product_media"
USING "products" "product", "_today_sika_products" "seed"
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
FROM "_today_sika_products" "seed"
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
USING "products" "product", "_today_sika_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    'product_use',
    'application_area',
    'packaging_volume_l',
    'packaging_weight_kg',
    'ready_to_use',
    'physical_form',
    'appearance_text',
    'compatible_supports',
    'base_chemical',
    'standard_class',
    'application_thickness_mm',
    'consumption_text'
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
  "attribute_seed"."value",
  "definition"."unit",
  "definition"."input_type",
  false,
  COALESCE("type_attribute"."is_filterable", false),
  "attribute_group"."name",
  COALESCE("attribute_group"."sort_order", 0),
  COALESCE("type_attribute"."sort_order", "attribute_seed"."sort_order")
FROM "_today_sika_products" "seed"
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
  seeded_product_count INTEGER;
  seeded_media_count INTEGER;
  seeded_subcategory_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO seeded_product_count
  FROM "_today_sika_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku";

  IF seeded_product_count <> 6 THEN
    RAISE EXCEPTION 'Today Sika validation failed: expected 6 products, found %.', seeded_product_count;
  END IF;

  SELECT COUNT(*)
  INTO seeded_media_count
  FROM "_today_sika_products" "seed"
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

  IF seeded_media_count <> 12 THEN
    RAISE EXCEPTION 'Today Sika validation failed: expected 12 media links, found %.', seeded_media_count;
  END IF;

  SELECT COUNT(*)
  INTO seeded_subcategory_count
  FROM "_today_sika_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  JOIN "product_subcategory_links" "link"
    ON "link"."product_id" = "product"."id";

  IF seeded_subcategory_count <> 6 THEN
    RAISE EXCEPTION 'Today Sika validation failed: expected 6 subcategory links, found %.', seeded_subcategory_count;
  END IF;
END $$;

DROP TABLE "_today_sika_products";
DROP TABLE "_today_sika_type_attributes";
DROP TABLE "_today_sika_attribute_definitions";
DROP TABLE "_today_sika_attribute_groups";
DROP TABLE "_today_sika_expected_media";
