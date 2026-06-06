-- Seed the EVI kitchen sink products from the E media package.
-- Products are organized according to the source family folders where present.

INSERT INTO "organizations" (
  "slug", "name", "description", "is_product_brand", "is_reference", "is_partner",
  "created_at", "updated_at"
)
VALUES
  ('sanibel', 'Sanibel', 'Marque produit pour équipements de cuisine et salle de bain.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('lemon', 'Lemon', 'Marque d''éviers et solutions cuisine, notamment en granite composite.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('franki', 'Franki', 'Marque d''éviers de cuisine et accessoires associés.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pyramis', 'Pyramis', 'Marque d''éviers, vidages et solutions cuisine.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('gr-master', 'GR Master', 'Marque d''éviers de cuisine en granite composite.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('marmorin', 'Marmorin', 'Marque d''éviers de cuisine en granite composite.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('deante', 'Deante', 'Marque d''équipements de cuisine et d''éviers.', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = COALESCE("organizations"."description", EXCLUDED."description"),
  "is_product_brand" = true,
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_colors" ("key", "label", "value", "created_at", "updated_at")
VALUES
  ('INOX', 'Inox', '#C5CCD1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('BEIGE_MOUCHETE', 'Beige moucheté', '#C7B89F', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('GRIS_INDUSTRIEL', 'Gris industriel', '#777A78', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('GRIS_FER', 'Gris fer', '#676B6E', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('GRIS_METALLISE', 'Gris métallisé', '#7E8385', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "value" = EXCLUDED."value",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_evier_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL
);

INSERT INTO "_evier_expected_media" ("media_id", "expected_filename", "kind")
VALUES
  (1012, 'EVI 86-50 RONDO BEIGE (LUNETTE) SANIBEL [1].webp', 'IMAGE'::"MediaKind"),
  (1014, 'EVI 86-50 RONDO BEIGE (LUNETTE) SANIBEL [3].webp', 'IMAGE'::"MediaKind"),
  (1015, 'EVI 86-50 RONDO BLANC (LUNETTE) SANIBEL [1].webp', 'IMAGE'::"MediaKind"),
  (1017, 'EVI 86-50 RONDO BLANC (LUNETTE) SANIBEL [3].webp', 'IMAGE'::"MediaKind"),
  (1018, 'EVI 112-50 TANGO BLANC SANIBEL [1].webp', 'IMAGE'::"MediaKind"),
  (1019, 'EVI 112-50 TANGO BLANC SANIBEL [2].webp', 'IMAGE'::"MediaKind"),
  (1020, 'EVI 112-50 TANGO GRIS SANIBEL [1].webp', 'IMAGE'::"MediaKind"),
  (1021, 'EVI 112-50 TANGO GRIS SANIBEL [2].webp', 'IMAGE'::"MediaKind"),
  (1022, 'EVI 115-50 GRANITE LISBON BLANC LEMON [1].webp', 'IMAGE'::"MediaKind"),
  (1023, 'EVI 115-50 GRANITE LISBON BLANC LEMON [2].webp', 'IMAGE'::"MediaKind"),
  (1024, 'EVI 115-50 GRANITE LISBON BLANC LEMON [3].webp', 'IMAGE'::"MediaKind"),
  (1025, 'EVI 115-50 GRANITE LISBON CHAMPAGNE LEMON [1].webp', 'IMAGE'::"MediaKind"),
  (1026, 'EVI 115-50 GRANITE LISBON CHAMPAGNE LEMON [2].webp', 'IMAGE'::"MediaKind"),
  (1027, 'EVI 115-50 GRANITE LISBON CHAMPAGNE LEMON [3].webp', 'IMAGE'::"MediaKind"),
  (1028, 'EVI 115-50 GRANITE LISBON GRIS CL LEMON [1].webp', 'IMAGE'::"MediaKind"),
  (1029, 'EVI 115-50 GRANITE LISBON GRIS CL LEMON [2].webp', 'IMAGE'::"MediaKind"),
  (1030, 'EVI 115-50 GRANITE LISBON GRIS CL LEMON [3].webp', 'IMAGE'::"MediaKind"),
  (1031, 'EVI 115-50 GRANITE LISBON VANILLE LEMON [1].webp', 'IMAGE'::"MediaKind"),
  (1032, 'EVI 115-50 GRANITE LISBON VANILLE LEMON [2].webp', 'IMAGE'::"MediaKind"),
  (1033, 'EVI 115-50 GRANITE LISBON VANILLE LEMON [3].webp', 'IMAGE'::"MediaKind"),
  (1034, 'EVI 115-50 GRANITE LISBON NOIR LEMON [1].webp', 'IMAGE'::"MediaKind"),
  (1035, 'EVI 115-50 GRANITE LISBON NOIR LEMON [2].webp', 'IMAGE'::"MediaKind"),
  (1036, 'EVI 115-50 GRANITE LISBON NOIR LEMON [3].webp', 'IMAGE'::"MediaKind"),
  (1037, 'EVI 116-50 ENCAS INOX DROITE FRANKI+SIPHON [1].webp', 'IMAGE'::"MediaKind"),
  (1038, 'EVI 116-50 ENCAS INOX DROITE FRANKI+SIPHON [2].webp', 'IMAGE'::"MediaKind"),
  (1039, 'EVI 116-50 GRANITE ATHLOS BLACK (53311)+VIDAGE PYRAMIS [1].webp', 'IMAGE'::"MediaKind"),
  (1040, 'EVI 116-50 GRANITE ATHLOS BLACK (53311)+VIDAGE PYRAMIS [2].webp', 'IMAGE'::"MediaKind"),
  (1041, 'EVI 116-50 GRANITE ATHLOS BLACK (53311)+VIDAGE PYRAMIS [3].webp', 'IMAGE'::"MediaKind"),
  (1042, 'EVI 116-50 GRANITE ATHLOS DARK BEIGE (39711)+VIDAGE PYRAMIS [1].webp', 'IMAGE'::"MediaKind"),
  (1043, 'EVI 116-50 GRANITE ATHLOS DARK BEIGE (39711)+VIDAGE PYRAMIS [2].webp', 'IMAGE'::"MediaKind"),
  (1044, 'EVI 116-50 GRANITE ATHLOS DARK BEIGE (39711)+VIDAGE PYRAMIS [3].webp', 'IMAGE'::"MediaKind"),
  (1045, 'EVI 116-50 GRANITE ATHLOS GRAPHITE CARBONE (39611)+VIDAGE PYRAMIS [1].webp', 'IMAGE'::"MediaKind"),
  (1046, 'EVI 116-50 GRANITE ATHLOS GRAPHITE CARBONE (39611)+VIDAGE PYRAMIS [2].webp', 'IMAGE'::"MediaKind"),
  (1047, 'EVI 116-50 GRANITE ATHLOS GRAPHITE CARBONE (39611)+VIDAGE PYRAMIS [3].webp', 'IMAGE'::"MediaKind"),
  (1048, 'EVI 116-50 GRANITE ATHLOS INDUSTRIAL GREY (53513)+VIDAGE PYRAMIS [1].webp', 'IMAGE'::"MediaKind"),
  (1049, 'EVI 116-50 GRANITE ATHLOS INDUSTRIAL GREY (53513)+VIDAGE PYRAMIS [2].webp', 'IMAGE'::"MediaKind"),
  (1050, 'EVI 116-50 GRANITE ATHLOS INDUSTRIAL GREY (53513)+VIDAGE PYRAMIS [3].webp', 'IMAGE'::"MediaKind"),
  (1051, 'EVI 116-50 GRANITE ATHLOS IRON GREY (42611)+VIDAGE PYRAMIS [1].webp', 'IMAGE'::"MediaKind"),
  (1052, 'EVI 116-50 GRANITE ATHLOS IRON GREY (42611)+VIDAGE PYRAMIS [2].webp', 'IMAGE'::"MediaKind"),
  (1053, 'EVI 116-50 GRANITE ATHLOS IRON GREY (42611)+VIDAGE PYRAMIS [3].webp', 'IMAGE'::"MediaKind"),
  (1054, 'EVI 116-50 GRANITE ATHLOS SNOW (39511)+VIDAGE PYRAMIS [1].webp', 'IMAGE'::"MediaKind"),
  (1055, 'EVI 116-50 GRANITE ATHLOS SNOW (39511)+VIDAGE PYRAMIS [2].webp', 'IMAGE'::"MediaKind"),
  (1056, 'EVI 116-50 GRANITE ATHLOS SNOW (39511)+VIDAGE PYRAMIS [3].webp', 'IMAGE'::"MediaKind"),
  (1057, 'EVI 116-50 GRANITE DELLO BLANC GR MASTER [1].webp', 'IMAGE'::"MediaKind"),
  (1058, 'EVI 116-50 GRANITE DELLO BLANC GR MASTER [2].webp', 'IMAGE'::"MediaKind"),
  (1059, 'EVI 116-50 GRANITE DELLO SAND GR MASTER [1].webp', 'IMAGE'::"MediaKind"),
  (1060, 'EVI 116-50 GRANITE DELLO SAND GR MASTER [2].webp', 'IMAGE'::"MediaKind"),
  (1061, 'EVI 116-50 GRANITE PROFIR BEIGE MOUCHTE MARMORIN [1].webp', 'IMAGE'::"MediaKind"),
  (1062, 'EVI 116-50 GRANITE PROFIR BEIGE MOUCHTE MARMORIN [2].webp', 'IMAGE'::"MediaKind"),
  (1063, 'EVI 116-50 GRANITE S213 METALICA DEANTE [1].webp', 'IMAGE'::"MediaKind"),
  (1064, 'EVI 116-50 GRANITE S213 METALICA DEANTE [2].webp', 'IMAGE'::"MediaKind"),
  (1065, 'EVI 116-50 GRANITE S213 METALICA DEANTE [3].webp', 'IMAGE'::"MediaKind"),
  (1066, 'EVI 116-50 SOLTANA BEIGE SANIBEL [1].webp', 'IMAGE'::"MediaKind"),
  (1067, 'EVI 116-50 SOLTANA BEIGE SANIBEL [2].webp', 'IMAGE'::"MediaKind"),
  (1068, 'EVI 116-50 SOLTANA BLANC SANIBEL [1].webp', 'IMAGE'::"MediaKind"),
  (1069, 'EVI 116-50 SOLTANA BLANC SANIBEL [2].webp', 'IMAGE'::"MediaKind"),
  (1070, 'EVI 116-50 SOLTANA GRIS SANIBEL [1].webp', 'IMAGE'::"MediaKind"),
  (1071, 'EVI 116-50 SOLTANA GRIS SANIBEL [2].webp', 'IMAGE'::"MediaKind"),
  (1072, 'EVI 115-50 GRANITE LISBON BLANC LEMON (FICHE TECHNIQUE).pdf', 'DOCUMENT'::"MediaKind"),
  (1073, 'EVI 86-50 RONDO BEIGE (LUNETTE) SANIBEL [2].webp', 'IMAGE'::"MediaKind"),
  (1074, 'EVI 86-50 RONDO BLANC (LUNETTE) SANIBEL [2].webp', 'IMAGE'::"MediaKind");

DO $$
DECLARE
  missing_media_count INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "product_type_templates" WHERE "slug" = 'evier-cuisine'
  ) THEN
    RAISE EXCEPTION 'Missing product type template slug evier-cuisine.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_subcategories" "subcategory"
    JOIN "product_types" "category"
      ON "category"."id" = "subcategory"."category_id"
    WHERE "category"."slug" = 'salle-de-bain-et-cuisine'
      AND "subcategory"."slug" = 'eviers-de-cuisine'
  ) THEN
    RAISE EXCEPTION 'Missing subcategory salle-de-bain-et-cuisine / eviers-de-cuisine.';
  END IF;

  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_evier_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = "expected"."kind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot seed EVI kitchen sink media: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;
END $$;

INSERT INTO "product_attribute_groups" (
  "product_type_id", "name", "slug", "sort_order", "created_at", "updated_at"
)
SELECT
  "template"."id",
  'Caractéristiques',
  'caracteristiques',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "product_type_templates" "template"
WHERE "template"."slug" = 'evier-cuisine'
ON CONFLICT ("product_type_id", "slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_evier_attribute_definitions" (
  "key" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "unit" TEXT,
  "input_type" "ProductTypeAttributeInputType" NOT NULL,
  "select_options" TEXT[] NOT NULL,
  "is_filterable" BOOLEAN NOT NULL,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_evier_attribute_definitions" (
  "key", "label", "unit", "input_type", "select_options", "is_filterable", "sort_order"
)
VALUES
  ('product_line', 'Gamme', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 0),
  ('model_reference', 'Référence modèle', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 5),
  ('sink_material', 'Matière', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Granite', 'Composite minéral', 'Inox']::TEXT[], true, 10),
  ('bowls_count', 'Nombre de bacs', NULL, 'NUMBER'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 20),
  ('drainer_side', 'Égouttoir', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['Droite', 'Gauche', 'Sans égouttoir', 'Non précisé']::TEXT[], true, 30),
  ('color', 'Couleur', NULL, 'COLOR'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 40),
  ('size_label', 'Dimensions', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], true, 50),
  ('included_accessory', 'Accessoires inclus', NULL, 'TEXT'::"ProductTypeAttributeInputType", ARRAY[]::TEXT[], false, 60),
  ('installation_type', 'Pose', NULL, 'SELECT'::"ProductTypeAttributeInputType", ARRAY['À encastrer']::TEXT[], true, 70);

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
FROM "_evier_attribute_definitions"
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

INSERT INTO "product_type_attributes" (
  "product_type_id", "attribute_group_id", "attribute_definition_id", "label",
  "is_required", "is_filterable", "sort_order", "created_at", "updated_at"
)
SELECT
  "template"."id",
  "attribute_group"."id",
  "definition"."id",
  "seed"."label",
  false,
  "seed"."is_filterable",
  "seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_evier_attribute_definitions" "seed"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."key" = "seed"."key"
JOIN "product_type_templates" "template"
  ON "template"."slug" = 'evier-cuisine'
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."product_type_id" = "template"."id"
  AND "attribute_group"."slug" = 'caracteristiques'
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "attribute_group_id" = EXCLUDED."attribute_group_id",
  "label" = EXCLUDED."label",
  "is_required" = EXCLUDED."is_required",
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

CREATE TEMP TABLE "_evier_products" (
  "sku" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "kind" "ProductKind" NOT NULL,
  "brand_slug" TEXT,
  "family_slug" TEXT,
  "family_name" TEXT,
  "family_subtitle" TEXT,
  "family_description" TEXT,
  "family_description_seo" TEXT,
  "family_main_image_media_id" BIGINT,
  "sort_order" INTEGER NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "product_line" TEXT,
  "model_reference" TEXT,
  "sink_material" TEXT,
  "bowls_count" TEXT,
  "drainer_side" TEXT,
  "color" TEXT,
  "size_label" TEXT NOT NULL,
  "included_accessory" TEXT,
  "installation_type" TEXT NOT NULL,
  "tags" TEXT NOT NULL,
  "overview_text" TEXT NOT NULL,
  "advice_text" TEXT NOT NULL
);

INSERT INTO "_evier_products" (
  "sku", "slug", "name", "display_name", "kind", "brand_slug", "family_slug",
  "family_name", "family_subtitle", "family_description", "family_description_seo",
  "family_main_image_media_id", "sort_order", "price_ttc", "stock_available",
  "product_line", "model_reference", "sink_material", "bowls_count", "drainer_side",
  "color", "size_label", "included_accessory", "installation_type", "tags",
  "overview_text", "advice_text"
)
VALUES
  ('00178402', 'sanibel-evier-tango-112-50-blanc', 'EVI 112/50 TANGO BLANC SANIBEL', 'Évier Tango 112/50 blanc Sanibel', 'VARIANT'::"ProductKind", 'sanibel', 'sanibel-evier-tango-112-50', 'Évier Tango 112/50 Sanibel', 'Évier de cuisine', 'Famille d''éviers Tango 112/50 avec deux bacs et égouttoir droit, déclinée en couleurs Sanibel.', 'Évier Tango 112/50 Sanibel : variantes deux bacs avec égouttoir pour cuisine.', 1018, 0, 305.880, 5.000, 'Tango', NULL, 'Composite minéral', '2', 'Droite', 'Blanc', '112/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine sanibel tango blanc composite deux-bacs egouttoir-droite 112-50', 'L''évier Tango 112/50 apporte une grande zone de lavage avec deux bacs séparés et une plage d''égouttage pratique pour les cuisines actives.', 'Sa finition blanche s''intègre facilement aux plans de travail clairs et aux ambiances contemporaines, tout en gardant une surface visuellement lumineuse.'),
  ('00185264', 'sanibel-evier-tango-112-50-gris', 'EVI 112/50 TANGO GRIS SANIBEL', 'Évier Tango 112/50 gris Sanibel', 'VARIANT'::"ProductKind", 'sanibel', 'sanibel-evier-tango-112-50', 'Évier Tango 112/50 Sanibel', 'Évier de cuisine', 'Famille d''éviers Tango 112/50 avec deux bacs et égouttoir droit, déclinée en couleurs Sanibel.', 'Évier Tango 112/50 Sanibel : variantes deux bacs avec égouttoir pour cuisine.', 1018, 1, 375.240, 1.000, 'Tango', NULL, 'Composite minéral', '2', 'Droite', 'Gris', '112/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine sanibel tango gris composite deux-bacs egouttoir-droite 112-50', 'L''évier Tango 112/50 est pensé pour séparer lavage, rinçage et préparation grâce à ses deux bacs et son égouttoir latéral.', 'La teinte grise donne un rendu sobre qui accompagne bien les cuisines minérales, les façades mates et les plans de travail foncés.'),

  ('00230995', 'lemon-evier-granite-lisbon-115-50-blanc', 'EVI 115/50 GRANITE LISBON BLANC LEMON', 'Évier granite Lisbon 115/50 blanc Lemon', 'VARIANT'::"ProductKind", 'lemon', 'lemon-evier-granite-lisbon-115-50', 'Évier Granite Lisbon 115/50 Lemon', 'Évier de cuisine', 'Famille d''éviers Lisbon 115/50 en granite, avec deux bacs et égouttoir droit, organisée par couleur.', 'Évier granite Lisbon 115/50 Lemon : variantes deux bacs avec égouttoir.', 1022, 0, 678.000, 3.000, 'Lisbon', NULL, 'Granite', '2', 'Droite', 'Blanc', '115/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine lemon lisbon granite blanc deux-bacs egouttoir-droite 115-50', 'L''évier Lisbon 115/50 combine l''aspect dense du granite avec un format généreux pour gérer lavage, rinçage et préparation au quotidien.', 'La version blanche garde une présence discrète et lumineuse, idéale pour alléger visuellement un plan de travail ou une cuisine compacte.'),
  ('00231008', 'lemon-evier-granite-lisbon-115-50-champagne', 'EVI 115/50 GRANITE LISBON CHAMPAGNE LEMON', 'Évier granite Lisbon 115/50 champagne Lemon', 'VARIANT'::"ProductKind", 'lemon', 'lemon-evier-granite-lisbon-115-50', 'Évier Granite Lisbon 115/50 Lemon', 'Évier de cuisine', 'Famille d''éviers Lisbon 115/50 en granite, avec deux bacs et égouttoir droit, organisée par couleur.', 'Évier granite Lisbon 115/50 Lemon : variantes deux bacs avec égouttoir.', 1022, 1, 678.000, 3.000, 'Lisbon', NULL, 'Granite', '2', 'Droite', 'Champagne', '115/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine lemon lisbon granite champagne deux-bacs egouttoir-droite 115-50', 'L''évier Lisbon 115/50 offre une organisation confortable avec ses deux cuves et sa zone d''égouttage intégrée.', 'Le coloris champagne réchauffe la cuisine sans être trop marqué, particulièrement avec les plans bois, beige ou pierre claire.'),
  ('00231015', 'lemon-evier-granite-lisbon-115-50-gris-clair', 'EVI 115/50 GRANITE LISBON GRIS CL LEMON', 'Évier granite Lisbon 115/50 gris clair Lemon', 'VARIANT'::"ProductKind", 'lemon', 'lemon-evier-granite-lisbon-115-50', 'Évier Granite Lisbon 115/50 Lemon', 'Évier de cuisine', 'Famille d''éviers Lisbon 115/50 en granite, avec deux bacs et égouttoir droit, organisée par couleur.', 'Évier granite Lisbon 115/50 Lemon : variantes deux bacs avec égouttoir.', 1022, 2, 678.000, 2.000, 'Lisbon', NULL, 'Granite', '2', 'Droite', 'Gris clair', '115/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine lemon lisbon granite gris-clair deux-bacs egouttoir-droite 115-50', 'L''évier Lisbon 115/50 convient aux cuisines qui demandent une grande surface de travail humide avec deux bacs bien séparés.', 'Le gris clair reste facile à associer et donne un rendu minéral doux, moins contrasté qu''un noir ou un graphite.'),
  ('00230988', 'lemon-evier-granite-lisbon-115-50-noir', 'EVI 115/50 GRANITE LISBON NOIR LEMON', 'Évier granite Lisbon 115/50 noir Lemon', 'VARIANT'::"ProductKind", 'lemon', 'lemon-evier-granite-lisbon-115-50', 'Évier Granite Lisbon 115/50 Lemon', 'Évier de cuisine', 'Famille d''éviers Lisbon 115/50 en granite, avec deux bacs et égouttoir droit, organisée par couleur.', 'Évier granite Lisbon 115/50 Lemon : variantes deux bacs avec égouttoir.', 1022, 3, 678.000, 2.000, 'Lisbon', NULL, 'Granite', '2', 'Droite', 'Noir', '115/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine lemon lisbon granite noir deux-bacs egouttoir-droite 115-50', 'L''évier Lisbon 115/50 en noir met en valeur les cuisines contemporaines et les plans de travail contrastés.', 'Son format deux bacs permet de garder une vraie souplesse d''usage entre vaisselle, rinçage et préparation des aliments.'),
  ('00231022', 'lemon-evier-granite-lisbon-115-50-vanille', 'EVI 115/50 GRANITE LISBON VANILLE LEMON', 'Évier granite Lisbon 115/50 vanille Lemon', 'VARIANT'::"ProductKind", 'lemon', 'lemon-evier-granite-lisbon-115-50', 'Évier Granite Lisbon 115/50 Lemon', 'Évier de cuisine', 'Famille d''éviers Lisbon 115/50 en granite, avec deux bacs et égouttoir droit, organisée par couleur.', 'Évier granite Lisbon 115/50 Lemon : variantes deux bacs avec égouttoir.', 1022, 4, 678.000, 1.000, 'Lisbon', NULL, 'Granite', '2', 'Droite', 'Vanille', '115/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine lemon lisbon granite vanille deux-bacs egouttoir-droite 115-50', 'L''évier Lisbon 115/50 version vanille apporte une note chaude et claire, tout en conservant le format pratique deux bacs avec égouttoir.', 'C''est un bon choix pour adoucir une cuisine beige, bois ou crème sans perdre en fonctionnalité.'),

  ('00208833', 'evier-116-50-beige-mouchete-casse', 'EVI 116/50 BEIGE MCHTE (CASSE)', 'Évier 116/50 beige moucheté - casse', 'SINGLE'::"ProductKind", NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 235.295, 1.000, NULL, NULL, 'Granite', NULL, 'Non précisé', 'Beige moucheté', '116/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine granite beige-mouchete 116-50 casse', 'Cet évier 116/50 beige moucheté répond à un besoin de remplacement ou de finition de chantier avec une teinte minérale facile à intégrer.', 'La mention casse doit être vérifiée avant vente afin de confirmer l''état exact de la pièce et son usage adapté.'),
  ('00182133', 'franki-evier-encas-inox-droite-116-50-siphon', 'EVI 116/50 ENCAS INOX DROITE FRANKI+SIPHON', 'Évier encastré inox droite 116/50 avec siphon Franki', 'SINGLE'::"ProductKind", 'franki', NULL, NULL, NULL, NULL, NULL, NULL, 0, 517.730, 8.000, NULL, NULL, 'Inox', '2', 'Droite', 'Inox', '116/50', 'Siphon', 'À encastrer', 'evier cuisine evier-cuisine franki inox deux-bacs egouttoir-droite siphon 116-50', 'Cet évier inox encastré privilégie la polyvalence avec deux bacs, un égouttoir droit et un siphon prévu dans l''ensemble.', 'L''inox reste un choix pratique pour les cuisines très utilisées, avec une esthétique professionnelle et une bonne compatibilité avec la robinetterie chromée.'),

  ('00248280', 'pyramis-evier-granite-athlos-116-50-black-53311-vidage', 'EVI 116/50 GRANITE ATHLOS BLACK (53311)+VIDAGE PYRAMIS', 'Évier granite Athlos 116/50 black 53311 avec vidage Pyramis', 'VARIANT'::"ProductKind", 'pyramis', 'pyramis-evier-granite-athlos-116-50-vidage', 'Évier Granite Athlos 116/50 Pyramis', 'Évier de cuisine', 'Famille d''éviers Athlos 116/50 en granite, avec deux bacs, égouttoir droit et vidage inclus.', 'Évier granite Athlos 116/50 Pyramis : variantes avec vidage inclus.', 1039, 0, 833.330, 4.000, 'Athlos', '53311', 'Granite', '2', 'Droite', 'Noir', '116/50', 'Vidage', 'À encastrer', 'evier cuisine evier-cuisine pyramis athlos granite noir black deux-bacs egouttoir-droite vidage 116-50', 'L''évier Athlos 116/50 mise sur une silhouette rectiligne et un usage complet avec deux bacs, égouttoir et vidage inclus.', 'Le noir apporte une finition forte, adaptée aux plans clairs comme aux cuisines modernes très contrastées.'),
  ('00248297', 'pyramis-evier-granite-athlos-116-50-dark-beige-39711-vidage', 'EVI 116/50 GRANITE ATHLOS DARK BEIGE (39711)+VIDAGE PYRAMIS', 'Évier granite Athlos 116/50 dark beige 39711 avec vidage Pyramis', 'VARIANT'::"ProductKind", 'pyramis', 'pyramis-evier-granite-athlos-116-50-vidage', 'Évier Granite Athlos 116/50 Pyramis', 'Évier de cuisine', 'Famille d''éviers Athlos 116/50 en granite, avec deux bacs, égouttoir droit et vidage inclus.', 'Évier granite Athlos 116/50 Pyramis : variantes avec vidage inclus.', 1039, 1, 833.330, 4.000, 'Athlos', '39711', 'Granite', '2', 'Droite', 'Beige foncé', '116/50', 'Vidage', 'À encastrer', 'evier cuisine evier-cuisine pyramis athlos granite beige-fonce dark-beige deux-bacs egouttoir-droite vidage 116-50', 'L''évier Athlos 116/50 offre une zone de lavage structurée pour les cuisines qui demandent un évier large et fonctionnel.', 'Le dark beige donne une présence chaude et minérale, facile à marier avec les décors bois et pierre.'),
  ('00248334', 'pyramis-evier-granite-athlos-116-50-graphite-carbone-39611-vidage', 'EVI 116/50 GRANITE ATHLOS GRAPHITE CARBONE (39611)+VIDAGE PYRAMIS', 'Évier granite Athlos 116/50 graphite carbone 39611 avec vidage Pyramis', 'VARIANT'::"ProductKind", 'pyramis', 'pyramis-evier-granite-athlos-116-50-vidage', 'Évier Granite Athlos 116/50 Pyramis', 'Évier de cuisine', 'Famille d''éviers Athlos 116/50 en granite, avec deux bacs, égouttoir droit et vidage inclus.', 'Évier granite Athlos 116/50 Pyramis : variantes avec vidage inclus.', 1039, 2, 833.330, 4.000, 'Athlos', '39611', 'Granite', '2', 'Droite', 'Graphite', '116/50', 'Vidage', 'À encastrer', 'evier cuisine evier-cuisine pyramis athlos granite graphite-carbone deux-bacs egouttoir-droite vidage 116-50', 'L''évier Athlos 116/50 combine une grande capacité de travail et un design géométrique très lisible sur le plan.', 'Le graphite carbone donne un rendu technique, discret et contemporain, notamment avec les plans sombres ou effet béton.'),
  ('00248327', 'pyramis-evier-granite-athlos-116-50-industrial-grey-53513-vidage', 'EVI 116/50 GRANITE ATHLOS INDUSTRIAL GREY (53513)+VIDAGE PYRAMIS', 'Évier granite Athlos 116/50 industrial grey 53513 avec vidage Pyramis', 'VARIANT'::"ProductKind", 'pyramis', 'pyramis-evier-granite-athlos-116-50-vidage', 'Évier Granite Athlos 116/50 Pyramis', 'Évier de cuisine', 'Famille d''éviers Athlos 116/50 en granite, avec deux bacs, égouttoir droit et vidage inclus.', 'Évier granite Athlos 116/50 Pyramis : variantes avec vidage inclus.', 1039, 3, 833.330, 2.000, 'Athlos', '53513', 'Granite', '2', 'Droite', 'Gris industriel', '116/50', 'Vidage', 'À encastrer', 'evier cuisine evier-cuisine pyramis athlos granite gris-industriel industrial-grey deux-bacs egouttoir-droite vidage 116-50', 'L''évier Athlos 116/50 est adapté aux cuisines familiales où l''on veut séparer les usages sans multiplier les accessoires.', 'Le gris industriel conserve une lecture sobre et moderne, avec moins de contraste qu''un noir pur.'),
  ('00248310', 'pyramis-evier-granite-athlos-116-50-iron-grey-42611-vidage', 'EVI 116/50 GRANITE ATHLOS IRON GREY (42611)+VIDAGE PYRAMIS', 'Évier granite Athlos 116/50 iron grey 42611 avec vidage Pyramis', 'VARIANT'::"ProductKind", 'pyramis', 'pyramis-evier-granite-athlos-116-50-vidage', 'Évier Granite Athlos 116/50 Pyramis', 'Évier de cuisine', 'Famille d''éviers Athlos 116/50 en granite, avec deux bacs, égouttoir droit et vidage inclus.', 'Évier granite Athlos 116/50 Pyramis : variantes avec vidage inclus.', 1039, 4, 833.330, 2.000, 'Athlos', '42611', 'Granite', '2', 'Droite', 'Gris fer', '116/50', 'Vidage', 'À encastrer', 'evier cuisine evier-cuisine pyramis athlos granite gris-fer iron-grey deux-bacs egouttoir-droite vidage 116-50', 'L''évier Athlos 116/50 propose une composition complète pour les tâches de cuisine quotidiennes, du lavage au rinçage.', 'Le gris fer donne un rendu équilibré entre inox et graphite, pratique pour les cuisines aux finitions métalliques.'),
  ('00248303', 'pyramis-evier-granite-athlos-116-50-snow-39511-vidage', 'EVI 116/50 GRANITE ATHLOS SNOW (39511)+VIDAGE PYRAMIS', 'Évier granite Athlos 116/50 snow 39511 avec vidage Pyramis', 'VARIANT'::"ProductKind", 'pyramis', 'pyramis-evier-granite-athlos-116-50-vidage', 'Évier Granite Athlos 116/50 Pyramis', 'Évier de cuisine', 'Famille d''éviers Athlos 116/50 en granite, avec deux bacs, égouttoir droit et vidage inclus.', 'Évier granite Athlos 116/50 Pyramis : variantes avec vidage inclus.', 1039, 5, 833.330, 4.000, 'Athlos', '39511', 'Granite', '2', 'Droite', 'Blanc', '116/50', 'Vidage', 'À encastrer', 'evier cuisine evier-cuisine pyramis athlos granite blanc snow deux-bacs egouttoir-droite vidage 116-50', 'L''évier Athlos 116/50 en finition snow conserve le confort de deux bacs avec une présence visuelle claire et légère.', 'Il accompagne naturellement les cuisines blanches, bois clair ou pierre douce, tout en gardant la praticité du vidage inclus.'),

  ('00236522', 'gr-master-evier-granite-dello-116-50-blanc', 'EVI 116/50 GRANITE DELLO BLANC GR MASTER', 'Évier granite Dello 116/50 blanc GR Master', 'VARIANT'::"ProductKind", 'gr-master', 'gr-master-evier-granite-dello-116-50', 'Évier Granite Dello 116/50 GR Master', 'Évier de cuisine', 'Famille d''éviers Dello 116/50 en granite avec deux bacs et égouttoir droit.', 'Évier granite Dello 116/50 GR Master : variantes avec deux bacs.', 1057, 0, 788.900, 1.000, 'Dello', NULL, 'Granite', '2', 'Droite', 'Blanc', '116/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine gr-master dello granite blanc deux-bacs egouttoir-droite 116-50', 'L''évier Dello 116/50 offre une grande surface de travail avec deux bacs profonds et un égouttoir latéral.', 'La version blanche apporte une finition nette et lumineuse, facile à intégrer dans une cuisine moderne.'),
  ('00236492', 'gr-master-evier-granite-dello-116-50-sand', 'EVI 116/50 GRANITE DELLO SAND GR MASTER', 'Évier granite Dello 116/50 sand GR Master', 'VARIANT'::"ProductKind", 'gr-master', 'gr-master-evier-granite-dello-116-50', 'Évier Granite Dello 116/50 GR Master', 'Évier de cuisine', 'Famille d''éviers Dello 116/50 en granite avec deux bacs et égouttoir droit.', 'Évier granite Dello 116/50 GR Master : variantes avec deux bacs.', 1057, 1, 788.900, 5.000, 'Dello', NULL, 'Granite', '2', 'Droite', 'Sable', '116/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine gr-master dello granite sable sand deux-bacs egouttoir-droite 116-50', 'L''évier Dello 116/50 sand combine un format généreux et une teinte chaude pour les cuisines naturelles.', 'Son égouttoir droit facilite le séchage de la vaisselle sans occuper une zone séparée du plan de travail.'),
  ('00195065', 'marmorin-evier-granite-profir-116-50-beige-mouchete', 'EVI 116/50 GRANITE PROFIR BEIGE MOUCHTE MARMORIN', 'Évier granite Profir 116/50 beige moucheté Marmorin', 'SINGLE'::"ProductKind", 'marmorin', NULL, NULL, NULL, NULL, NULL, NULL, 0, 711.110, 1.000, 'Profir', NULL, 'Granite', '2', 'Gauche', 'Beige moucheté', '116/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine marmorin profir granite beige-mouchete deux-bacs egouttoir-gauche 116-50', 'L''évier Profir 116/50 se distingue par son égouttoir à gauche et ses deux bacs, une configuration utile lorsque l''implantation de la cuisine l''impose.', 'Le beige moucheté apporte un effet pierre discret qui se marie bien avec les plans bois, crème ou travertin.'),

  ('00243506', 'evier-granite-ref-hb8230-116-50-black', 'EVI 116/50 GRANITE REF HB8230 BLACK', 'Évier granite HB8230 116/50 black', 'VARIANT'::"ProductKind", NULL, 'evier-granite-ref-hb8230-116-50', 'Évier Granite HB8230 116/50', 'Évier de cuisine', 'Famille d''éviers granite HB8230 116/50 organisée par coloris.', 'Évier granite HB8230 116/50 : variantes black, grey et sand.', NULL, 0, 933.400, 3.000, 'HB8230', 'HB8230', 'Granite', NULL, 'Non précisé', 'Noir', '116/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine granite hb8230 noir black 116-50', 'L''évier granite HB8230 116/50 vise les cuisines qui recherchent un évier minéral au format large.', 'La version black convient aux compositions contemporaines et aux plans de travail clairs ou contrastés.'),
  ('00243513', 'evier-granite-ref-hb8230-116-50-grey', 'EVI 116/50 GRANITE REF HB8230 GREY', 'Évier granite HB8230 116/50 grey', 'VARIANT'::"ProductKind", NULL, 'evier-granite-ref-hb8230-116-50', 'Évier Granite HB8230 116/50', 'Évier de cuisine', 'Famille d''éviers granite HB8230 116/50 organisée par coloris.', 'Évier granite HB8230 116/50 : variantes black, grey et sand.', NULL, 1, 933.400, 5.000, 'HB8230', 'HB8230', 'Granite', NULL, 'Non précisé', 'Gris', '116/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine granite hb8230 gris grey 116-50', 'L''évier granite HB8230 116/50 en gris offre une présence minérale facile à associer aux cuisines sobres.', 'Son format 116/50 laisse une belle surface utile pour les usages de lavage et de préparation.'),
  ('00243490', 'evier-granite-ref-hb8230-116-50-sand', 'EVI 116/50 GRANITE REF HB8230 SAND', 'Évier granite HB8230 116/50 sand', 'VARIANT'::"ProductKind", NULL, 'evier-granite-ref-hb8230-116-50', 'Évier Granite HB8230 116/50', 'Évier de cuisine', 'Famille d''éviers granite HB8230 116/50 organisée par coloris.', 'Évier granite HB8230 116/50 : variantes black, grey et sand.', NULL, 2, 933.400, 5.000, 'HB8230', 'HB8230', 'Granite', NULL, 'Non précisé', 'Sable', '116/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine granite hb8230 sable sand 116-50', 'L''évier granite HB8230 116/50 sand apporte une teinte douce et naturelle aux cuisines claires.', 'Ce coloris fonctionne particulièrement bien avec les plans bois, beige et pierre.'),
  ('00216883', 'deante-evier-granite-s213-metalica-116-50', 'EVI 116/50 GRANITE S213 METALICA DEANTE', 'Évier granite S213 Metalica 116/50 Deante', 'SINGLE'::"ProductKind", 'deante', NULL, NULL, NULL, NULL, NULL, NULL, 0, 1066.670, 1.000, 'S213 Metalica', 'S213', 'Granite', '2', 'Droite', 'Gris métallisé', '116/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine deante s213-metalica granite gris-metallise deux-bacs egouttoir-droite 116-50', 'L''évier S213 Metalica 116/50 propose une finition grise métallisée et un format complet avec deux bacs et égouttoir droit.', 'Il s''adresse aux cuisines contemporaines qui veulent une teinte technique sans aller jusqu''au noir.'),

  ('00183147', 'sanibel-evier-soltana-116-50-beige', 'EVI 116/50 SOLTANA BEIGE SANIBEL', 'Évier Soltana 116/50 beige Sanibel', 'VARIANT'::"ProductKind", 'sanibel', 'sanibel-evier-soltana-116-50', 'Évier Soltana 116/50 Sanibel', 'Évier de cuisine', 'Famille d''éviers Soltana 116/50 avec deux bacs et égouttoir droit, déclinée en coloris Sanibel.', 'Évier Soltana 116/50 Sanibel : variantes deux bacs avec égouttoir.', 1066, 0, 423.530, 2.000, 'Soltana', NULL, 'Composite minéral', '2', 'Droite', 'Beige', '116/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine sanibel soltana beige composite deux-bacs egouttoir-droite 116-50', 'L''évier Soltana 116/50 met l''accent sur le confort d''usage avec deux bacs, un égouttoir droit et une forme douce.', 'Le beige moucheté apporte une finition chaleureuse qui reste discrète dans les cuisines naturelles.'),
  ('00178389', 'sanibel-evier-soltana-116-50-blanc', 'EVI 116/50 SOLTANA BLANC SANIBEL', 'Évier Soltana 116/50 blanc Sanibel', 'VARIANT'::"ProductKind", 'sanibel', 'sanibel-evier-soltana-116-50', 'Évier Soltana 116/50 Sanibel', 'Évier de cuisine', 'Famille d''éviers Soltana 116/50 avec deux bacs et égouttoir droit, déclinée en coloris Sanibel.', 'Évier Soltana 116/50 Sanibel : variantes deux bacs avec égouttoir.', 1066, 1, 394.120, 1.000, 'Soltana', NULL, 'Composite minéral', '2', 'Droite', 'Blanc', '116/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine sanibel soltana blanc composite deux-bacs egouttoir-droite 116-50', 'L''évier Soltana 116/50 blanc conserve une lecture propre et lumineuse sur le plan de travail.', 'Sa configuration deux bacs avec égouttoir répond bien aux usages quotidiens d''une cuisine familiale.'),
  ('00184144', 'sanibel-evier-soltana-116-50-gris', 'EVI 116/50 SOLTANA GRIS SANIBEL', 'Évier Soltana 116/50 gris Sanibel', 'VARIANT'::"ProductKind", 'sanibel', 'sanibel-evier-soltana-116-50', 'Évier Soltana 116/50 Sanibel', 'Évier de cuisine', 'Famille d''éviers Soltana 116/50 avec deux bacs et égouttoir droit, déclinée en coloris Sanibel.', 'Évier Soltana 116/50 Sanibel : variantes deux bacs avec égouttoir.', 1066, 2, 423.530, 5.000, 'Soltana', NULL, 'Composite minéral', '2', 'Droite', 'Gris', '116/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine sanibel soltana gris composite deux-bacs egouttoir-droite 116-50', 'L''évier Soltana 116/50 gris donne une alternative sobre aux finitions claires, avec le même confort de deux bacs.', 'Il s''accorde facilement avec les plans effet pierre, béton ou les façades mates.'),

  ('00243469', 'evier-granite-mitigeur-ref-hb8237-75-48-black', 'EVI 75/48 GRANITE+MITIGEUR REF HB8237 BLACK', 'Évier granite HB8237 75/48 black avec mitigeur', 'SINGLE'::"ProductKind", NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1166.670, 1.000, 'HB8237', 'HB8237', 'Granite', NULL, 'Non précisé', 'Noir', '75/48', 'Mitigeur', 'À encastrer', 'evier cuisine evier-cuisine granite hb8237 noir black mitigeur 75-48', 'L''évier granite HB8237 75/48 est proposé avec mitigeur, une solution pratique pour composer rapidement un point d''eau de cuisine.', 'Son format plus compact convient aux cuisines où l''on veut préserver de la surface de plan de travail.'),
  ('00243544', 'evier-inox-8246-80-45-black', 'EVI 80/45 INOX 8246 BLACK', 'Évier inox 8246 80/45 black', 'SINGLE'::"ProductKind", NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1135.000, 3.000, NULL, '8246', 'Inox', NULL, 'Non précisé', 'Noir', '80/45', NULL, 'À encastrer', 'evier cuisine evier-cuisine inox 8246 noir black 80-45', 'Cet évier inox 8246 en finition black vise les cuisines qui veulent un rendu sombre tout en gardant la logique pratique de l''inox.', 'Le format 80/45 est adapté aux implantations plus compactes ou aux plans de travail où l''emprise doit rester maîtrisée.'),

  ('00216371', 'sanibel-evier-rondo-86-50-beige-lunette', 'EVI 86/50 RONDO BEIGE (LUNETTE) SANIBEL', 'Évier Rondo 86/50 beige avec lunette Sanibel', 'VARIANT'::"ProductKind", 'sanibel', 'sanibel-evier-rondo-86-50-lunette', 'Évier Rondo 86/50 Lunette Sanibel', 'Évier de cuisine', 'Famille d''éviers Rondo 86/50 à deux bacs sans égouttoir, avec forme arrondie et lunette.', 'Évier Rondo 86/50 Sanibel : variantes deux bacs sans égouttoir.', 1012, 0, 305.882, 1.000, 'Rondo', NULL, 'Composite minéral', '2', 'Sans égouttoir', 'Beige', '86/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine sanibel rondo beige composite deux-bacs sans-egouttoir lunette 86-50', 'L''évier Rondo 86/50 privilégie une forme arrondie et deux bacs compacts, sans zone d''égouttage latérale.', 'Il convient aux plans de travail où l''on souhaite conserver de la surface disponible autour de l''évier.'),
  ('00178365', 'sanibel-evier-rondo-86-50-blanc-lunette', 'EVI 86/50 RONDO BLANC (LUNETTE) SANIBEL', 'Évier Rondo 86/50 blanc avec lunette Sanibel', 'VARIANT'::"ProductKind", 'sanibel', 'sanibel-evier-rondo-86-50-lunette', 'Évier Rondo 86/50 Lunette Sanibel', 'Évier de cuisine', 'Famille d''éviers Rondo 86/50 à deux bacs sans égouttoir, avec forme arrondie et lunette.', 'Évier Rondo 86/50 Sanibel : variantes deux bacs sans égouttoir.', 1012, 1, 247.059, 3.000, 'Rondo', NULL, 'Composite minéral', '2', 'Sans égouttoir', 'Blanc', '86/50', NULL, 'À encastrer', 'evier cuisine evier-cuisine sanibel rondo blanc composite deux-bacs sans-egouttoir lunette 86-50', 'L''évier Rondo 86/50 blanc associe deux bacs arrondis à une présence visuelle légère et facile à coordonner.', 'Son absence d''égouttoir latéral permet de l''installer dans des configurations où le plan de travail doit rester dégagé.');

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo",
  "main_image_media_id", "created_at", "updated_at"
)
SELECT DISTINCT ON ("family_slug")
  "family_slug",
  "family_name",
  "family_subtitle",
  "family_description",
  left("family_description_seo", 160),
  "family_main_image_media_id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_evier_products"
WHERE "family_slug" IS NOT NULL
ORDER BY "family_slug", "sort_order"
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
  "seed"."kind",
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
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."overview_text"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "seed"."advice_text"))
      )
    )
  ),
  left("seed"."display_name" || ' | COBAM GROUP', 60),
  left("seed"."display_name" || ' : évier de cuisine disponible chez COBAM GROUP en Tunisie.', 160),
  "seed"."tags",
  0,
  true,
  true,
  false,
  false,
  "seed"."stock_available",
  0,
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
FROM "_evier_products" "seed"
JOIN "product_type_templates" "template"
  ON "template"."slug" = 'evier-cuisine'
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
USING "products" "product", "_evier_products" "seed"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  "seed"."sort_order"
FROM "_evier_products" "seed"
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
    "seed"."family_slug",
    "product"."id" AS "product_id",
    row_number() OVER (
      PARTITION BY "seed"."family_slug"
      ORDER BY "seed"."sort_order" ASC, "product"."id" ASC
    ) AS "rank"
  FROM "_evier_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  WHERE "seed"."family_slug" IS NOT NULL
)
UPDATE "product_families" "family"
SET
  "default_product_id" = "ranked_defaults"."product_id",
  "updated_at" = CURRENT_TIMESTAMP
FROM "ranked_defaults"
WHERE "family"."slug" = "ranked_defaults"."family_slug"
  AND "ranked_defaults"."rank" = 1;

DELETE FROM "product_subcategory_links" "link"
USING "products" "product", "_evier_products" "seed"
WHERE "link"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku";

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_evier_products" "seed"
JOIN "products" "product"
  ON "product"."sku" = "seed"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'eviers-de-cuisine'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_evier_products" "seed"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seed"."sku"
  AND "attribute"."name" IN (
    SELECT "key" FROM "_evier_attribute_definitions"
  );

WITH "attribute_values" AS (
  SELECT
    "product"."id" AS "product_id",
    "attribute_seed"."name",
    "attribute_seed"."value"
  FROM "_evier_products" "seed"
  JOIN "products" "product"
    ON "product"."sku" = "seed"."sku"
  CROSS JOIN LATERAL (
    VALUES
      ('product_line', "seed"."product_line"),
      ('model_reference', "seed"."model_reference"),
      ('sink_material', "seed"."sink_material"),
      ('bowls_count', "seed"."bowls_count"),
      ('drainer_side', "seed"."drainer_side"),
      ('color', "seed"."color"),
      ('size_label', "seed"."size_label"),
      ('included_accessory', "seed"."included_accessory"),
      ('installation_type', "seed"."installation_type")
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
  COALESCE(NULLIF("template_attribute"."label", ''), "definition"."label"),
  left("attribute_values"."value", 255),
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
JOIN "product_type_templates" "template"
  ON "template"."slug" = 'evier-cuisine'
JOIN "product_type_attributes" "template_attribute"
  ON "template_attribute"."product_type_id" = "template"."id"
  AND "template_attribute"."attribute_definition_id" = "definition"."id"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."id" = "template_attribute"."attribute_group_id";

CREATE TEMP TABLE "_evier_product_media" (
  "sku" TEXT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "role" "ProductMediaRole" NOT NULL,
  "name" TEXT NOT NULL,
  "alt_text" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL,
  PRIMARY KEY ("sku", "media_id")
);

INSERT INTO "_evier_product_media" ("sku", "media_id", "role", "name", "alt_text", "sort_order")
VALUES
  ('00178402', 1018, 'GALLERY'::"ProductMediaRole", 'EVI 112-50 TANGO BLANC SANIBEL [1]', 'Évier Tango 112/50 blanc Sanibel deux bacs avec égouttoir', 0),
  ('00178402', 1019, 'GALLERY'::"ProductMediaRole", 'EVI 112-50 TANGO BLANC SANIBEL [2]', 'Évier Tango 112/50 blanc Sanibel vue complémentaire', 1),
  ('00185264', 1020, 'GALLERY'::"ProductMediaRole", 'EVI 112-50 TANGO GRIS SANIBEL [1]', 'Évier Tango 112/50 gris Sanibel deux bacs avec égouttoir', 0),
  ('00185264', 1021, 'GALLERY'::"ProductMediaRole", 'EVI 112-50 TANGO GRIS SANIBEL [2]', 'Évier Tango 112/50 gris Sanibel vue complémentaire', 1),

  ('00230995', 1022, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON BLANC LEMON [1]', 'Évier granite Lisbon 115/50 blanc Lemon deux bacs avec égouttoir', 0),
  ('00230995', 1023, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON BLANC LEMON [2]', 'Évier granite Lisbon 115/50 blanc Lemon vue complémentaire', 1),
  ('00230995', 1024, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON BLANC LEMON [3]', 'Évier granite Lisbon 115/50 blanc Lemon détail', 2),
  ('00230995', 1072, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique évier granite Lisbon 115/50 Lemon', 0),
  ('00231008', 1025, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON CHAMPAGNE LEMON [1]', 'Évier granite Lisbon 115/50 champagne Lemon deux bacs avec égouttoir', 0),
  ('00231008', 1026, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON CHAMPAGNE LEMON [2]', 'Évier granite Lisbon 115/50 champagne Lemon vue complémentaire', 1),
  ('00231008', 1027, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON CHAMPAGNE LEMON [3]', 'Évier granite Lisbon 115/50 champagne Lemon détail', 2),
  ('00231008', 1072, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique évier granite Lisbon 115/50 Lemon', 0),
  ('00231015', 1028, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON GRIS CL LEMON [1]', 'Évier granite Lisbon 115/50 gris clair Lemon deux bacs avec égouttoir', 0),
  ('00231015', 1029, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON GRIS CL LEMON [2]', 'Évier granite Lisbon 115/50 gris clair Lemon vue complémentaire', 1),
  ('00231015', 1030, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON GRIS CL LEMON [3]', 'Évier granite Lisbon 115/50 gris clair Lemon détail', 2),
  ('00231015', 1072, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique évier granite Lisbon 115/50 Lemon', 0),
  ('00231022', 1031, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON VANILLE LEMON [1]', 'Évier granite Lisbon 115/50 vanille Lemon deux bacs avec égouttoir', 0),
  ('00231022', 1032, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON VANILLE LEMON [2]', 'Évier granite Lisbon 115/50 vanille Lemon vue complémentaire', 1),
  ('00231022', 1033, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON VANILLE LEMON [3]', 'Évier granite Lisbon 115/50 vanille Lemon détail', 2),
  ('00231022', 1072, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique évier granite Lisbon 115/50 Lemon', 0),
  ('00230988', 1034, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON NOIR LEMON [1]', 'Évier granite Lisbon 115/50 noir Lemon deux bacs avec égouttoir', 0),
  ('00230988', 1035, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON NOIR LEMON [2]', 'Évier granite Lisbon 115/50 noir Lemon vue complémentaire', 1),
  ('00230988', 1036, 'GALLERY'::"ProductMediaRole", 'EVI 115-50 GRANITE LISBON NOIR LEMON [3]', 'Évier granite Lisbon 115/50 noir Lemon détail', 2),
  ('00230988', 1072, 'TECHNICAL'::"ProductMediaRole", 'Fiche technique', 'Fiche technique évier granite Lisbon 115/50 Lemon', 0),

  ('00182133', 1037, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 ENCAS INOX DROITE FRANKI+SIPHON [1]', 'Évier encastré inox droite 116/50 Franki avec siphon', 0),
  ('00182133', 1038, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 ENCAS INOX DROITE FRANKI+SIPHON [2]', 'Évier encastré inox droite 116/50 Franki vue complémentaire', 1),

  ('00248280', 1039, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS BLACK (53311)+VIDAGE PYRAMIS [1]', 'Évier granite Athlos black 116/50 Pyramis avec vidage', 0),
  ('00248280', 1040, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS BLACK (53311)+VIDAGE PYRAMIS [2]', 'Évier granite Athlos black 116/50 Pyramis vue complémentaire', 1),
  ('00248280', 1041, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS BLACK (53311)+VIDAGE PYRAMIS [3]', 'Évier granite Athlos black 116/50 Pyramis détail', 2),
  ('00248297', 1042, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS DARK BEIGE (39711)+VIDAGE PYRAMIS [1]', 'Évier granite Athlos dark beige 116/50 Pyramis avec vidage', 0),
  ('00248297', 1043, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS DARK BEIGE (39711)+VIDAGE PYRAMIS [2]', 'Évier granite Athlos dark beige 116/50 Pyramis vue complémentaire', 1),
  ('00248297', 1044, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS DARK BEIGE (39711)+VIDAGE PYRAMIS [3]', 'Évier granite Athlos dark beige 116/50 Pyramis détail', 2),
  ('00248334', 1045, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS GRAPHITE CARBONE (39611)+VIDAGE PYRAMIS [1]', 'Évier granite Athlos graphite carbone 116/50 Pyramis avec vidage', 0),
  ('00248334', 1046, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS GRAPHITE CARBONE (39611)+VIDAGE PYRAMIS [2]', 'Évier granite Athlos graphite carbone 116/50 Pyramis vue complémentaire', 1),
  ('00248334', 1047, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS GRAPHITE CARBONE (39611)+VIDAGE PYRAMIS [3]', 'Évier granite Athlos graphite carbone 116/50 Pyramis détail', 2),
  ('00248327', 1048, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS INDUSTRIAL GREY (53513)+VIDAGE PYRAMIS [1]', 'Évier granite Athlos industrial grey 116/50 Pyramis avec vidage', 0),
  ('00248327', 1049, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS INDUSTRIAL GREY (53513)+VIDAGE PYRAMIS [2]', 'Évier granite Athlos industrial grey 116/50 Pyramis vue complémentaire', 1),
  ('00248327', 1050, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS INDUSTRIAL GREY (53513)+VIDAGE PYRAMIS [3]', 'Évier granite Athlos industrial grey 116/50 Pyramis détail', 2),
  ('00248310', 1051, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS IRON GREY (42611)+VIDAGE PYRAMIS [1]', 'Évier granite Athlos iron grey 116/50 Pyramis avec vidage', 0),
  ('00248310', 1052, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS IRON GREY (42611)+VIDAGE PYRAMIS [2]', 'Évier granite Athlos iron grey 116/50 Pyramis vue complémentaire', 1),
  ('00248310', 1053, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS IRON GREY (42611)+VIDAGE PYRAMIS [3]', 'Évier granite Athlos iron grey 116/50 Pyramis détail', 2),
  ('00248303', 1054, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS SNOW (39511)+VIDAGE PYRAMIS [1]', 'Évier granite Athlos snow 116/50 Pyramis avec vidage', 0),
  ('00248303', 1055, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS SNOW (39511)+VIDAGE PYRAMIS [2]', 'Évier granite Athlos snow 116/50 Pyramis vue complémentaire', 1),
  ('00248303', 1056, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE ATHLOS SNOW (39511)+VIDAGE PYRAMIS [3]', 'Évier granite Athlos snow 116/50 Pyramis détail', 2),

  ('00236522', 1057, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE DELLO BLANC GR MASTER [1]', 'Évier granite Dello blanc 116/50 GR Master', 0),
  ('00236522', 1058, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE DELLO BLANC GR MASTER [2]', 'Évier granite Dello blanc 116/50 GR Master vue complémentaire', 1),
  ('00236492', 1059, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE DELLO SAND GR MASTER [1]', 'Évier granite Dello sand 116/50 GR Master', 0),
  ('00236492', 1060, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE DELLO SAND GR MASTER [2]', 'Évier granite Dello sand 116/50 GR Master vue complémentaire', 1),
  ('00195065', 1061, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE PROFIR BEIGE MOUCHTE MARMORIN [1]', 'Évier granite Profir beige moucheté 116/50 Marmorin', 0),
  ('00195065', 1062, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE PROFIR BEIGE MOUCHTE MARMORIN [2]', 'Évier granite Profir beige moucheté 116/50 Marmorin vue complémentaire', 1),
  ('00216883', 1063, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE S213 METALICA DEANTE [1]', 'Évier granite S213 Metalica 116/50 Deante', 0),
  ('00216883', 1064, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE S213 METALICA DEANTE [2]', 'Évier granite S213 Metalica 116/50 Deante vue complémentaire', 1),
  ('00216883', 1065, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 GRANITE S213 METALICA DEANTE [3]', 'Évier granite S213 Metalica 116/50 Deante détail', 2),

  ('00183147', 1066, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 SOLTANA BEIGE SANIBEL [1]', 'Évier Soltana 116/50 beige Sanibel deux bacs avec égouttoir', 0),
  ('00183147', 1067, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 SOLTANA BEIGE SANIBEL [2]', 'Évier Soltana 116/50 beige Sanibel vue complémentaire', 1),
  ('00178389', 1068, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 SOLTANA BLANC SANIBEL [1]', 'Évier Soltana 116/50 blanc Sanibel deux bacs avec égouttoir', 0),
  ('00178389', 1069, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 SOLTANA BLANC SANIBEL [2]', 'Évier Soltana 116/50 blanc Sanibel vue complémentaire', 1),
  ('00184144', 1070, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 SOLTANA GRIS SANIBEL [1]', 'Évier Soltana 116/50 gris Sanibel deux bacs avec égouttoir', 0),
  ('00184144', 1071, 'GALLERY'::"ProductMediaRole", 'EVI 116-50 SOLTANA GRIS SANIBEL [2]', 'Évier Soltana 116/50 gris Sanibel vue complémentaire', 1),

  ('00216371', 1012, 'GALLERY'::"ProductMediaRole", 'EVI 86-50 RONDO BEIGE (LUNETTE) SANIBEL [1]', 'Évier Rondo 86/50 beige Sanibel deux bacs sans égouttoir', 0),
  ('00216371', 1073, 'GALLERY'::"ProductMediaRole", 'EVI 86-50 RONDO BEIGE (LUNETTE) SANIBEL [2]', 'Évier Rondo 86/50 beige Sanibel vue complémentaire', 1),
  ('00216371', 1014, 'GALLERY'::"ProductMediaRole", 'EVI 86-50 RONDO BEIGE (LUNETTE) SANIBEL [3]', 'Évier Rondo 86/50 beige Sanibel détail', 2),
  ('00178365', 1015, 'GALLERY'::"ProductMediaRole", 'EVI 86-50 RONDO BLANC (LUNETTE) SANIBEL [1]', 'Évier Rondo 86/50 blanc Sanibel deux bacs sans égouttoir', 0),
  ('00178365', 1074, 'GALLERY'::"ProductMediaRole", 'EVI 86-50 RONDO BLANC (LUNETTE) SANIBEL [2]', 'Évier Rondo 86/50 blanc Sanibel vue complémentaire', 1),
  ('00178365', 1017, 'GALLERY'::"ProductMediaRole", 'EVI 86-50 RONDO BLANC (LUNETTE) SANIBEL [3]', 'Évier Rondo 86/50 blanc Sanibel détail', 2);

DELETE FROM "product_media" "product_media"
USING "products" "product", "_evier_product_media" "media_seed"
WHERE "product_media"."product_id" = "product"."id"
  AND "product"."sku" = "media_seed"."sku"
  AND "product_media"."role" IN ('GALLERY'::"ProductMediaRole", 'TECHNICAL'::"ProductMediaRole");

INSERT INTO "product_media" (
  "product_id", "media_id", "role", "name", "alt_text", "sort_order", "created_at", "updated_at"
)
SELECT
  "product"."id",
  "media_seed"."media_id",
  "media_seed"."role",
  left("media_seed"."name", 255),
  left("media_seed"."alt_text", 255),
  "media_seed"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_evier_product_media" "media_seed"
JOIN "products" "product"
  ON "product"."sku" = "media_seed"."sku"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;

DROP TABLE "_evier_product_media";
DROP TABLE "_evier_products";
DROP TABLE "_evier_attribute_definitions";
DROP TABLE "_evier_expected_media";
