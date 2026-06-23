-- Seed the ZIP-backed Today V/W products: vasques, vidages, Wasserphob family and Wasserstop.

CREATE TEMP TABLE "_today_vw_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_today_vw_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1776, 'WASSERPHOB 1L.webp', 'IMAGE'::"MediaKind"),
  (1779, 'VASQUE A POSER 60 DURASTYLE (03496) DURAVIT [1].webp', 'IMAGE'::"MediaKind"),
  (1780, 'VASQUE A POSER 60 DURASTYLE (03496) DURAVIT [2].webp', 'IMAGE'::"MediaKind"),
  (1781, 'VASQUE A POSER 60 DURASTYLE (03496) DURAVIT [3].webp', 'IMAGE'::"MediaKind"),
  (1782, 'VASQUE LEAF BLC-BLEU JDF [1].webp', 'IMAGE'::"MediaKind"),
  (1783, 'VASQUE LEAF BLC-BLEU JDF [2].webp', 'IMAGE'::"MediaKind"),
  (1784, 'VASQUE LEAF BLC-BLEU JDF [3].webp', 'IMAGE'::"MediaKind"),
  (1785, 'VASQUE MORFYS VERT SANINDUSA [1].webp', 'IMAGE'::"MediaKind"),
  (1786, 'VASQUE MORFYS VERT SANINDUSA [2].webp', 'IMAGE'::"MediaKind"),
  (1787, 'VASQUE MORFYS VERT SANINDUSA [3].webp', 'IMAGE'::"MediaKind"),
  (1788, 'VASQUE ROND GRIS FOUSSENA [1].webp', 'IMAGE'::"MediaKind"),
  (1789, 'VIDAGE BAIG DURA 0.5 [1].webp', 'IMAGE'::"MediaKind"),
  (1790, 'VIDAGE BAIG DURA 0.5 [2].webp', 'IMAGE'::"MediaKind"),
  (1791, 'VIDAGE EVIER 2BAC BONDES 90 EJIM-SOLTANA [1].webp', 'IMAGE'::"MediaKind"),
  (1792, 'VIDAGE EVIER 2BAC BONDES 90 EJIM-SOLTANA [2].webp', 'IMAGE'::"MediaKind"),
  (1793, 'WASSERPHOB 1L (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1794, 'WASSERPHOB 5L (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1795, 'WASSERSTOP 3KG (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1796, 'VASQUE A POSER 60 DURASTYLE (03496) DURAVIT (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1797, 'VASQUE A POSER 60 DURASTYLE (03496) DURAVIT (NOTICE D''ENTRETIEN).pdf', 'DOCUMENT'::"MediaKind"),
  (1798, 'VASQUE MORFYS VERT SANINDUSA (DESSIN TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1799, 'VASQUE MORFYS VERT SANINDUSA (MANUEL DE NETTOYAGE).pdf', 'DOCUMENT'::"MediaKind"),
  (1800, 'VIDAGE BAIG DURA 0.5 (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1801, 'VASQUE MORFYS VERT SANINDUSA (DECLARATION DES PERFORMANCES).pdf', 'DOCUMENT'::"MediaKind"),
  (1802, 'WASSERSTOP 3KG.webp', 'IMAGE'::"MediaKind"),
  (1803, 'WASSERPHOB 5L.webp', 'IMAGE'::"MediaKind");

CREATE TEMP TABLE "_today_vw_attribute_groups" (
  "product_type_slug" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "slug")
);

INSERT INTO "_today_vw_attribute_groups" ("product_type_slug", "slug", "name", "sort_order")
VALUES
  ('vasque-bol-a-poser', 'filtres-principaux', 'Filtres principaux', 0),
  ('vasque-bol-a-poser', 'caracteristiques-techniques', 'Caractéristiques techniques', 20),
  ('bonde-siphon-vidage', 'filtres-principaux', 'Filtres principaux', 0),
  ('bonde-siphon-vidage', 'caracteristiques-techniques', 'Caractéristiques techniques', 20),
  ('materiau-batiment-jardin', 'filtres-principaux', 'Filtres principaux', 0),
  ('materiau-batiment-jardin', 'caracteristiques-techniques', 'Caractéristiques techniques', 20);

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
FROM "_today_vw_attribute_groups" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_vw_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL
);

INSERT INTO "_today_vw_attribute_definitions" ("key", "label", "unit", "input_type", "select_options")
VALUES
  ('collection', 'Collection / série', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('manufacturer_ref', 'Référence fabricant', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('installation_type', 'Type de pose', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['À poser']::TEXT[]),
  ('size_label', 'Dimensions', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('color', 'Couleur', NULL, 'COLOR'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('material', 'Matière', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Céramique']::TEXT[]),
  ('shape', 'Forme', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Rond', 'Rectangulaire', 'Asymétrique']::TEXT[]),
  ('accessory_type', 'Type d''accessoire', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Vidage']::TEXT[]),
  ('application_use', 'Usage', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Bain', 'Évier', 'Étanchéité']::TEXT[]),
  ('connection_size', 'Dimension raccord', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('finish', 'Finition', NULL, 'FINISH'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('compatibility_notes', 'Compatibilité', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('product_use', 'Type de produit', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Hydrofuge de surface', 'Produit d''étanchéité']::TEXT[]),
  ('packaging_volume_l', 'Conditionnement', 'L', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('packaging_weight_kg', 'Conditionnement', 'kg', 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]),
  ('ready_to_use', 'Prêt à l''emploi', NULL, 'BOOLEAN'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[]);

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
FROM "_today_vw_attribute_definitions"
ON CONFLICT ("key") DO UPDATE SET
  "select_options" = (
    SELECT ARRAY(
      SELECT DISTINCT "option"."value"
      FROM unnest("product_attribute_definitions"."select_options" || EXCLUDED."select_options") AS "option"("value")
      WHERE "option"."value" <> ''
      ORDER BY "option"."value"
    )
  ),
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_today_vw_type_attributes" (
  "product_type_slug" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "group_slug" TEXT NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("product_type_slug", "key")
);

INSERT INTO "_today_vw_type_attributes" (
  "product_type_slug", "key", "group_slug", "is_filterable", "sort_order"
)
VALUES
  ('vasque-bol-a-poser', 'installation_type', 'filtres-principaux', true, 10),
  ('vasque-bol-a-poser', 'size_label', 'filtres-principaux', true, 20),
  ('vasque-bol-a-poser', 'color', 'filtres-principaux', true, 30),
  ('vasque-bol-a-poser', 'shape', 'filtres-principaux', true, 40),
  ('vasque-bol-a-poser', 'material', 'caracteristiques-techniques', true, 50),
  ('vasque-bol-a-poser', 'collection', 'caracteristiques-techniques', true, 60),
  ('vasque-bol-a-poser', 'manufacturer_ref', 'caracteristiques-techniques', true, 70),
  ('bonde-siphon-vidage', 'accessory_type', 'filtres-principaux', true, 10),
  ('bonde-siphon-vidage', 'application_use', 'filtres-principaux', true, 20),
  ('bonde-siphon-vidage', 'connection_size', 'caracteristiques-techniques', true, 30),
  ('bonde-siphon-vidage', 'manufacturer_ref', 'caracteristiques-techniques', true, 40),
  ('bonde-siphon-vidage', 'compatibility_notes', 'caracteristiques-techniques', false, 50),
  ('materiau-batiment-jardin', 'product_use', 'filtres-principaux', true, 10),
  ('materiau-batiment-jardin', 'application_use', 'filtres-principaux', true, 20),
  ('materiau-batiment-jardin', 'packaging_volume_l', 'filtres-principaux', true, 30),
  ('materiau-batiment-jardin', 'packaging_weight_kg', 'filtres-principaux', true, 40),
  ('materiau-batiment-jardin', 'ready_to_use', 'caracteristiques-techniques', true, 50);

DELETE FROM "product_type_attributes" "template_attribute"
USING "product_type_templates" "template", "product_attribute_definitions" "definition"
WHERE "template_attribute"."product_type_id" = "template"."id"
  AND "template_attribute"."attribute_definition_id" = "definition"."id"
  AND (
    lower("definition"."key") = 'finish'
    OR "definition"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
  )
  AND EXISTS (
    SELECT 1
    FROM "_today_vw_type_attributes" "seed"
    JOIN "product_attribute_definitions" "seed_definition"
      ON "seed_definition"."key" = "seed"."key"
    WHERE "seed"."product_type_slug" = "template"."slug"
      AND (
        lower("seed_definition"."key") = 'color'
        OR "seed_definition"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
      )
  );

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
    FROM "_today_vw_type_attributes" "seed"
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
FROM "_today_vw_type_attributes" "seed"
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

CREATE TEMP TABLE "_today_vw_products" AS
SELECT *
FROM jsonb_to_recordset($products$
[
  {
    "sku":"00204347",
    "slug":"vasque-a-poser-duravit-durastyle-60cm-03496-00204347",
    "name":"VASQUE A POSER 60 DURASTYLE (03496) DURAVIT",
    "display_name":"Vasque à poser Duravit DuraStyle 60 cm",
    "brand_slug":"duravit",
    "product_type_slug":"vasque-bol-a-poser",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"lavabos-et-vasques",
    "price_ttc":241.000,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Vasque Duravit DuraStyle 60 cm",
    "description_seo":"Vasque à poser Duravit DuraStyle 60 cm en céramique blanche, avec fiche technique et notice d'entretien.",
    "tags":"vasque a poser duravit durastyle 60cm ceramique blanc salle de bain",
    "intro":"Cette vasque à poser Duravit DuraStyle apporte une ligne sobre et facile à intégrer dans une salle de bain contemporaine.",
    "details":"Le format 60 cm offre une surface confortable pour un meuble ou un plan de toilette. La finition blanche en céramique facilite l'association avec la robinetterie et le mobilier existants.",
    "attributes":[
      {"key":"installation_type","value":"À poser","sort_order":10},
      {"key":"size_label","value":"60 cm","sort_order":20},
      {"key":"color","value":"Blanc","sort_order":30},
      {"key":"shape","value":"Rectangulaire","sort_order":40},
      {"key":"material","value":"Céramique","sort_order":50},
      {"key":"collection","value":"DuraStyle","sort_order":60},
      {"key":"manufacturer_ref","value":"03496","sort_order":70}
    ],
    "media":[
      {"media_id":1779,"role":"GALLERY","alt_text":"Vasque à poser Duravit DuraStyle 60 cm","sort_order":0},
      {"media_id":1780,"role":"GALLERY","alt_text":"Vasque Duravit DuraStyle vue complémentaire","sort_order":10},
      {"media_id":1781,"role":"GALLERY","alt_text":"Vasque Duravit DuraStyle détail produit","sort_order":20},
      {"media_id":1796,"role":"TECHNICAL","alt_text":"Fiche technique vasque Duravit DuraStyle","sort_order":100},
      {"media_id":1797,"role":"TECHNICAL","alt_text":"Notice d'entretien vasque Duravit DuraStyle","sort_order":110}
    ]
  },
  {
    "sku":"00007857",
    "slug":"vasque-leaf-blanc-bleu-jdf-00007857",
    "name":"VASQUE LEAF BLC/BLEU JDF",
    "display_name":"Vasque à poser Leaf blanc et bleu JDF",
    "brand_slug":null,
    "product_type_slug":"vasque-bol-a-poser",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"lavabos-et-vasques",
    "price_ttc":536.110,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Vasque Leaf blanc et bleu JDF",
    "description_seo":"Vasque à poser Leaf blanc et bleu JDF pour une salle de bain décorative avec une pièce forte sur plan vasque.",
    "tags":"vasque a poser leaf blanc bleu jdf salle de bain design",
    "intro":"La vasque Leaf blanc et bleu est pensée comme une pièce décorative pour personnaliser un plan de toilette.",
    "details":"Son contraste blanc et bleu donne du relief à l'espace lavabo. Elle convient aux projets où la vasque devient un élément visible du style de la salle de bain.",
    "attributes":[
      {"key":"installation_type","value":"À poser","sort_order":10},
      {"key":"color","value":"Blanc / bleu","sort_order":30},
      {"key":"shape","value":"Asymétrique","sort_order":40},
      {"key":"material","value":"Céramique","sort_order":50},
      {"key":"collection","value":"Leaf","sort_order":60}
    ],
    "media":[
      {"media_id":1782,"role":"GALLERY","alt_text":"Vasque Leaf blanc et bleu JDF","sort_order":0},
      {"media_id":1783,"role":"GALLERY","alt_text":"Vasque Leaf blanc et bleu vue complémentaire","sort_order":10},
      {"media_id":1784,"role":"GALLERY","alt_text":"Vasque Leaf blanc et bleu détail produit","sort_order":20}
    ]
  },
  {
    "sku":"00007863",
    "slug":"vasque-morfys-verte-sanindusa-00007863",
    "name":"VASQUE MORFYS VERT SANINDUSA",
    "display_name":"Vasque à poser Morfys verte Sanindusa",
    "brand_slug":null,
    "product_type_slug":"vasque-bol-a-poser",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"lavabos-et-vasques",
    "price_ttc":438.000,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Vasque Morfys verte Sanindusa",
    "description_seo":"Vasque à poser Morfys verte Sanindusa avec dessin technique, manuel de nettoyage et déclaration des performances.",
    "tags":"vasque a poser morfys vert sanindusa ceramique salle de bain",
    "intro":"La vasque Morfys verte apporte une touche de couleur maîtrisée au coin lavabo tout en restant simple à associer.",
    "details":"Les documents associés facilitent la vérification des dimensions, de l'entretien et des performances avant la pose. C'est un bon choix pour une salle de bain qui cherche un accent coloré sans perdre en sobriété.",
    "attributes":[
      {"key":"installation_type","value":"À poser","sort_order":10},
      {"key":"color","value":"Vert","sort_order":30},
      {"key":"material","value":"Céramique","sort_order":50},
      {"key":"collection","value":"Morfys","sort_order":60}
    ],
    "media":[
      {"media_id":1785,"role":"GALLERY","alt_text":"Vasque Morfys verte Sanindusa","sort_order":0},
      {"media_id":1786,"role":"GALLERY","alt_text":"Vasque Morfys verte vue complémentaire","sort_order":10},
      {"media_id":1787,"role":"GALLERY","alt_text":"Vasque Morfys verte détail produit","sort_order":20},
      {"media_id":1798,"role":"TECHNICAL","alt_text":"Dessin technique vasque Morfys verte","sort_order":100},
      {"media_id":1799,"role":"TECHNICAL","alt_text":"Manuel de nettoyage vasque Morfys verte","sort_order":110},
      {"media_id":1801,"role":"CERTIFICATE","alt_text":"Déclaration des performances vasque Morfys verte","sort_order":200}
    ]
  },
  {
    "sku":"00007887",
    "slug":"vasque-ronde-grise-foussena-00007887",
    "name":"VASQUE ROND GRIS FOUSSENA",
    "display_name":"Vasque à poser ronde grise Foussena",
    "brand_slug":null,
    "product_type_slug":"vasque-bol-a-poser",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"lavabos-et-vasques",
    "price_ttc":600.000,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Vasque ronde grise Foussena",
    "description_seo":"Vasque à poser ronde grise Foussena pour créer un point lavabo élégant et facile à coordonner.",
    "tags":"vasque a poser ronde gris foussena salle de bain",
    "intro":"Cette vasque ronde grise mise sur une forme douce et une teinte facile à intégrer dans une salle de bain moderne.",
    "details":"La pose sur plan met la forme de la vasque en valeur et simplifie la composition autour du mitigeur, du miroir et du meuble sous-vasque.",
    "attributes":[
      {"key":"installation_type","value":"À poser","sort_order":10},
      {"key":"color","value":"Gris","sort_order":30},
      {"key":"shape","value":"Rond","sort_order":40},
      {"key":"material","value":"Céramique","sort_order":50}
    ],
    "media":[
      {"media_id":1788,"role":"GALLERY","alt_text":"Vasque ronde grise Foussena","sort_order":0}
    ]
  },
  {
    "sku":"00213530",
    "slug":"vidage-baignoire-dura-0-5-chrome-duravit-00213530",
    "name":"VIDAGE BAIG DURA 0.5",
    "display_name":"Vidage baignoire Dura 0.5 chrome Duravit",
    "brand_slug":"duravit",
    "product_type_slug":"bonde-siphon-vidage",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"baignoires",
    "price_ttc":76.020,
    "stock_available":2.000,
    "stock_unit":"PIECE",
    "title_seo":"Vidage baignoire Duravit Dura 0.5",
    "description_seo":"Vidage de baignoire Duravit Dura 0.5 en finition chrome, avec fiche technique pour vérifier la compatibilité.",
    "tags":"vidage baignoire duravit dura chrome bonde siphon evacuation bain",
    "intro":"Ce vidage de baignoire Duravit en finition chrome complète une installation bain avec une évacuation propre et coordonnée.",
    "details":"La fiche technique jointe permet de vérifier les points de compatibilité avant achat. La finition chrome s'accorde facilement avec la robinetterie de baignoire la plus courante.",
    "attributes":[
      {"key":"accessory_type","value":"Vidage","sort_order":10},
      {"key":"application_use","value":"Bain","sort_order":20},
      {"key":"finish","value":"Chrome","sort_order":30},
      {"key":"connection_size","value":"0.5","sort_order":40},
      {"key":"manufacturer_ref","value":"Dura 0.5","sort_order":50}
    ],
    "media":[
      {"media_id":1789,"role":"GALLERY","alt_text":"Vidage baignoire Dura 0.5 chrome Duravit","sort_order":0},
      {"media_id":1790,"role":"GALLERY","alt_text":"Vidage baignoire Dura 0.5 vue complémentaire","sort_order":10},
      {"media_id":1800,"role":"TECHNICAL","alt_text":"Fiche technique vidage baignoire Dura 0.5","sort_order":100}
    ]
  },
  {
    "sku":"00178495",
    "slug":"vidage-evier-2-bacs-bondes-90-ejim-soltana-00178495",
    "name":"VIDAGE EVIER 2BAC BONDES 90 EJIM/SOLTANA",
    "display_name":"Vidage évier 2 bacs bondes 90 Ejim/Soltana",
    "brand_slug":"ejim",
    "product_type_slug":"bonde-siphon-vidage",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_sort_order":null,
    "category_slug":"salle-de-bain-et-cuisine",
    "subcategory_slug":"eviers-de-cuisine",
    "price_ttc":75.295,
    "stock_available":8.000,
    "stock_unit":"PIECE",
    "title_seo":"Vidage évier 2 bacs bondes 90",
    "description_seo":"Vidage pour évier 2 bacs avec bondes 90, compatible Ejim/Soltana selon le libellé produit.",
    "tags":"vidage evier 2 bacs bondes 90 ejim soltana evacuation cuisine",
    "intro":"Ce vidage est prévu pour équiper un évier de cuisine à deux bacs avec bondes 90.",
    "details":"Il répond au besoin de remplacement ou de complément d'installation sur évier compatible Ejim/Soltana. Les deux visuels permettent de vérifier la configuration générale avant achat.",
    "attributes":[
      {"key":"accessory_type","value":"Vidage","sort_order":10},
      {"key":"application_use","value":"Évier","sort_order":20},
      {"key":"connection_size","value":"Bondes 90","sort_order":40},
      {"key":"compatibility_notes","value":"Évier 2 bacs Ejim/Soltana","sort_order":60}
    ],
    "media":[
      {"media_id":1791,"role":"GALLERY","alt_text":"Vidage évier 2 bacs bondes 90 Ejim/Soltana","sort_order":0},
      {"media_id":1792,"role":"GALLERY","alt_text":"Vidage évier 2 bacs bondes 90 vue complémentaire","sort_order":10}
    ]
  },
  {
    "sku":"00219600",
    "slug":"wasserphob-1l-deutsch-color-00219600",
    "name":"WASSERPHOB 1L",
    "display_name":"Wasserphob 1L Deutsch Color",
    "brand_slug":"deutsch-color",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"VARIANT",
    "family_slug":"wasserphob-deutsch-color",
    "family_name":"Wasserphob Deutsch Color",
    "family_subtitle":"Hydrofuge de surface",
    "family_description":"Famille Wasserphob Deutsch Color pour protéger les supports minéraux contre la pénétration de l'eau.",
    "family_description_seo":"Wasserphob Deutsch Color : hydrofuge de surface en 1L et 5L chez COBAM GROUP.",
    "family_main_media_id":1776,
    "family_sort_order":0,
    "category_slug":"isolation-et-etancheite",
    "subcategory_slug":"etancheite",
    "price_ttc":6.000,
    "stock_available":5.000,
    "stock_unit":"PIECE",
    "title_seo":"Wasserphob 1L Deutsch Color",
    "description_seo":"Wasserphob 1L Deutsch Color, hydrofuge de surface pour limiter la pénétration de l'eau sur supports minéraux.",
    "tags":"wasserphob deutsch color hydrofuge surface etancheite 1l bidon",
    "intro":"Wasserphob 1L est un hydrofuge de surface conçu pour aider les supports minéraux à mieux résister à la pénétration de l'eau.",
    "details":"Le format 1L est pratique pour les petites interventions, les reprises localisées et les essais de traitement. La fiche technique permet de vérifier les supports compatibles et les conditions d'application.",
    "attributes":[
      {"key":"product_use","value":"Hydrofuge de surface","sort_order":10},
      {"key":"application_use","value":"Étanchéité","sort_order":20},
      {"key":"packaging_volume_l","value":"1","sort_order":30},
      {"key":"ready_to_use","value":"true","sort_order":50}
    ],
    "media":[
      {"media_id":1776,"role":"GALLERY","alt_text":"Wasserphob 1L Deutsch Color","sort_order":0},
      {"media_id":1793,"role":"TECHNICAL","alt_text":"Fiche technique Wasserphob 1L","sort_order":100}
    ]
  },
  {
    "sku":"00219617",
    "slug":"wasserphob-5l-deutsch-color-00219617",
    "name":"WASSERPHOB 5L",
    "display_name":"Wasserphob 5L Deutsch Color",
    "brand_slug":"deutsch-color",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"VARIANT",
    "family_slug":"wasserphob-deutsch-color",
    "family_name":"Wasserphob Deutsch Color",
    "family_subtitle":"Hydrofuge de surface",
    "family_description":"Famille Wasserphob Deutsch Color pour protéger les supports minéraux contre la pénétration de l'eau.",
    "family_description_seo":"Wasserphob Deutsch Color : hydrofuge de surface en 1L et 5L chez COBAM GROUP.",
    "family_main_media_id":1776,
    "family_sort_order":10,
    "category_slug":"isolation-et-etancheite",
    "subcategory_slug":"etancheite",
    "price_ttc":26.000,
    "stock_available":2.000,
    "stock_unit":"PIECE",
    "title_seo":"Wasserphob 5L Deutsch Color",
    "description_seo":"Wasserphob 5L Deutsch Color, hydrofuge de surface en bidon pour traitement des supports minéraux.",
    "tags":"wasserphob deutsch color hydrofuge surface etancheite 5l bidon",
    "intro":"Wasserphob 5L reprend le même usage hydrofuge dans un conditionnement plus adapté aux surfaces étendues.",
    "details":"Le bidon de 5L convient mieux aux travaux où plusieurs zones doivent être traitées. La fiche technique accompagne le choix du support et la préparation avant application.",
    "attributes":[
      {"key":"product_use","value":"Hydrofuge de surface","sort_order":10},
      {"key":"application_use","value":"Étanchéité","sort_order":20},
      {"key":"packaging_volume_l","value":"5","sort_order":30},
      {"key":"ready_to_use","value":"true","sort_order":50}
    ],
    "media":[
      {"media_id":1803,"role":"GALLERY","alt_text":"Wasserphob 5L Deutsch Color","sort_order":0},
      {"media_id":1794,"role":"TECHNICAL","alt_text":"Fiche technique Wasserphob 5L","sort_order":100}
    ]
  },
  {
    "sku":"00219624",
    "slug":"wasserstop-3kg-deutsch-color-00219624",
    "name":"WASSERSTOP 3KG",
    "display_name":"Wasserstop 3 kg Deutsch Color",
    "brand_slug":"deutsch-color",
    "product_type_slug":"materiau-batiment-jardin",
    "kind":"SINGLE",
    "family_slug":null,
    "family_name":null,
    "family_subtitle":null,
    "family_description":null,
    "family_description_seo":null,
    "family_main_media_id":null,
    "family_sort_order":null,
    "category_slug":"isolation-et-etancheite",
    "subcategory_slug":"etancheite",
    "price_ttc":27.500,
    "stock_available":1.000,
    "stock_unit":"PIECE",
    "title_seo":"Wasserstop 3 kg Deutsch Color",
    "description_seo":"Wasserstop 3 kg Deutsch Color, produit d'étanchéité en seau avec fiche technique pour préparer l'application.",
    "tags":"wasserstop deutsch color etancheite 3kg seau batiment",
    "intro":"Wasserstop 3 kg est un produit d'étanchéité en seau pour les travaux de protection des supports exposés à l'humidité.",
    "details":"Le format 3 kg convient aux petites surfaces et aux interventions ciblées. La fiche technique permet de vérifier la préparation du support et les conditions d'utilisation avant chantier.",
    "attributes":[
      {"key":"product_use","value":"Produit d'étanchéité","sort_order":10},
      {"key":"application_use","value":"Étanchéité","sort_order":20},
      {"key":"packaging_weight_kg","value":"3","sort_order":40}
    ],
    "media":[
      {"media_id":1802,"role":"GALLERY","alt_text":"Wasserstop 3 kg Deutsch Color","sort_order":0},
      {"media_id":1795,"role":"TECHNICAL","alt_text":"Fiche technique Wasserstop 3 kg","sort_order":100}
    ]
  }
]$products$::jsonb) AS "product" (
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
  "price_ttc" NUMERIC(12, 3),
  "stock_available" NUMERIC(12, 3),
  "stock_unit" TEXT,
  "title_seo" TEXT,
  "description_seo" TEXT,
  "tags" TEXT,
  "intro" TEXT,
  "details" TEXT,
  "attributes" JSONB,
  "media" JSONB
);

DO $$
DECLARE
  missing_media_count INTEGER;
  missing_brand_count INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM "_today_vw_products") <> 9 THEN
    RAISE EXCEPTION 'Expected 9 Today V/W products.';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM (
      VALUES
        ('vasque-bol-a-poser'),
        ('bonde-siphon-vidage'),
        ('materiau-batiment-jardin')
    ) AS "required"("slug")
    LEFT JOIN "product_type_templates" "template"
      ON "template"."slug" = "required"."slug"
    WHERE "template"."id" IS NULL
  ) > 0 THEN
    RAISE EXCEPTION 'Missing one or more required product type templates for Today V/W products.';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM (
      VALUES
        ('salle-de-bain-et-cuisine', 'lavabos-et-vasques'),
        ('salle-de-bain-et-cuisine', 'baignoires'),
        ('salle-de-bain-et-cuisine', 'eviers-de-cuisine'),
        ('isolation-et-etancheite', 'etancheite')
    ) AS "required"("category_slug", "subcategory_slug")
    LEFT JOIN "product_types" "category"
      ON "category"."slug" = "required"."category_slug"
    LEFT JOIN "product_subcategories" "subcategory"
      ON "subcategory"."category_id" = "category"."id"
      AND "subcategory"."slug" = "required"."subcategory_slug"
    WHERE "subcategory"."id" IS NULL
  ) > 0 THEN
    RAISE EXCEPTION 'Missing one or more required subcategories for Today V/W products.';
  END IF;

  SELECT COUNT(*)
  INTO missing_brand_count
  FROM (
    SELECT DISTINCT "brand_slug"
    FROM "_today_vw_products"
    WHERE "brand_slug" IS NOT NULL
  ) "brand"
  LEFT JOIN "organizations" "organization"
    ON "organization"."slug" = "brand"."brand_slug"
  WHERE "organization"."id" IS NULL;

  IF missing_brand_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today V/W products: % expected brand row(s) are missing.', missing_brand_count;
  END IF;

  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_today_vw_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed Today V/W products: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;
END $$;

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo",
  "main_image_media_id", "created_at", "updated_at"
)
SELECT DISTINCT
  "seed"."family_slug",
  "seed"."family_name",
  "seed"."family_subtitle",
  "seed"."family_description",
  "seed"."family_description_seo",
  "seed"."family_main_media_id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_vw_products" "seed"
WHERE "seed"."family_slug" IS NOT NULL
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "main_image_media_id" = EXCLUDED."main_image_media_id",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "products" (
  "sku", "slug", "kind", "brand_id", "product_type_id", "name", "display_name",
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
  "brand"."id",
  "template"."id",
  left("seed"."name", 255),
  left("seed"."display_name", 255),
  jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'heading',
        'attrs', jsonb_build_object('level', 2),
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."display_name"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."intro"))
      ),
      jsonb_build_object(
        'type', 'bulletList',
        'content', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'type', 'listItem',
              'content', jsonb_build_array(
                jsonb_build_object(
                  'type', 'paragraph',
                  'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "definition"."label" || ' : ' || "attribute"."value"))
                )
              )
            )
            ORDER BY "attribute"."sort_order"
          )
          FROM jsonb_to_recordset("seed"."attributes") AS "attribute"("key" TEXT, "value" TEXT, "sort_order" INTEGER)
          JOIN "product_attribute_definitions" "definition"
            ON "definition"."key" = "attribute"."key"
        )
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."details"))
      )
    )
  ),
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
  19.000,
  'AUTO'::"ProductPricingVisibility",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_vw_products" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = "seed"."product_type_slug"
LEFT JOIN "organizations" "brand"
  ON "brand"."slug" = "seed"."brand_slug"
ON CONFLICT ("sku") DO UPDATE SET
  "slug" = EXCLUDED."slug",
  "kind" = EXCLUDED."kind",
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

DELETE FROM "product_family_members" "member"
USING "products" "product"
JOIN "_today_vw_products" "seed"
  ON "seed"."sku" = "product"."sku"
WHERE "member"."product_id" = "product"."id";

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  COALESCE("seed"."family_sort_order", 0)
FROM "_today_vw_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = "seed"."family_slug"
WHERE "seed"."family_slug" IS NOT NULL
ON CONFLICT ("family_id", "product_id") DO UPDATE SET
  "sort_order" = EXCLUDED."sort_order";

UPDATE "product_families" "family"
SET
  "default_product_id" = "default_product"."id",
  "updated_at" = CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT ON ("seed"."family_slug")
    "seed"."family_slug",
    "product"."id"
  FROM "_today_vw_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  WHERE "seed"."family_slug" IS NOT NULL
  ORDER BY "seed"."family_slug", COALESCE("seed"."family_sort_order", 0), "seed"."sku"
) "default_product"
WHERE "family"."slug" = "default_product"."family_slug";

DELETE FROM "product_subcategory_links" "link"
USING "products" "product"
JOIN "_today_vw_products" "seed"
  ON "seed"."sku" = "product"."sku"
WHERE "link"."product_id" = "product"."id";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_today_vw_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = "seed"."category_slug"
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = "seed"."subcategory_slug"
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_media" "product_media"
USING "products" "product"
JOIN "_today_vw_products" "seed"
  ON "seed"."sku" = "product"."sku"
WHERE "product_media"."product_id" = "product"."id"
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
  "media"."original_filename",
  "media_seed"."alt_text",
  "media_seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_today_vw_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
CROSS JOIN LATERAL jsonb_to_recordset("seed"."media") AS "media_seed"(
  "media_id" BIGINT,
  "role" TEXT,
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
USING "products" "product"
JOIN "_today_vw_products" "seed"
  ON "seed"."sku" = "product"."sku"
WHERE "attribute"."product_id" = "product"."id"
  AND "attribute"."name" IN (
    'collection',
    'manufacturer_ref',
    'installation_type',
    'size_label',
    'color',
    'material',
    'shape',
    'accessory_type',
    'application_use',
    'connection_size',
    'finish',
    'compatibility_notes',
    'product_use',
    'packaging_volume_l',
    'packaging_weight_kg',
    'ready_to_use'
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
FROM "_today_vw_products" "seed"
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
  wasserphob_member_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO seeded_product_count
  FROM "_today_vw_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku";

  IF seeded_product_count <> 9 THEN
    RAISE EXCEPTION 'Today V/W validation failed: expected 9 products, found %.', seeded_product_count;
  END IF;

  SELECT COUNT(*)
  INTO seeded_media_count
  FROM "_today_vw_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL jsonb_to_recordset("seed"."media") AS "media_seed"(
    "media_id" BIGINT,
    "role" TEXT,
    "alt_text" TEXT,
    "sort_order" INTEGER
  )
  JOIN "product_media" "product_media"
    ON "product_media"."product_id" = "product"."id"
    AND "product_media"."media_id" = "media_seed"."media_id"
    AND "product_media"."role" = "media_seed"."role"::"ProductMediaRole";

  IF seeded_media_count <> 26 THEN
    RAISE EXCEPTION 'Today V/W validation failed: expected 26 product media links, found %.', seeded_media_count;
  END IF;

  SELECT COUNT(*)
  INTO wasserphob_member_count
  FROM "product_families" "family"
  JOIN "product_family_members" "member"
    ON "member"."family_id" = "family"."id"
  WHERE "family"."slug" = 'wasserphob-deutsch-color';

  IF wasserphob_member_count <> 2 THEN
    RAISE EXCEPTION 'Today V/W validation failed: expected 2 Wasserphob family members, found %.', wasserphob_member_count;
  END IF;
END $$;

DROP TABLE "_today_vw_products";
DROP TABLE "_today_vw_type_attributes";
DROP TABLE "_today_vw_attribute_definitions";
DROP TABLE "_today_vw_attribute_groups";
DROP TABLE "_today_vw_expected_media";
