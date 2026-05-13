-- Reset product templates from templates.pdf.
-- Product.product_type_id is configured with ON DELETE SET NULL, so existing products
-- keep their product data while losing the old template association.

DELETE FROM "product_type_templates";
DELETE FROM "product_type_groups";

ALTER SEQUENCE IF EXISTS "product_type_groups_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "product_type_templates_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "product_attribute_groups_id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "product_type_attributes_id_seq" RESTART WITH 1;

WITH "source_groups" ("name", "slug", "sort_order") AS (
  VALUES
    ('Carrelage & revêtement', 'carrelage-revetement', 10),
    ('Sanitaire & WC', 'sanitaire-wc', 100),
    ('Meubles & accessoires SDB', 'meubles-accessoires-sdb', 200),
    ('Robinetterie', 'robinetterie', 300),
    ('Douche', 'douche', 400),
    ('Bain', 'bain', 500),
    ('Cuisine', 'cuisine', 600),
    ('Cuisine / plomberie', 'cuisine-plomberie', 610),
    ('Plomberie', 'plomberie', 700),
    ('Construction & extérieur', 'construction-exterieur', 800)
)
INSERT INTO "product_type_groups" (
  "name",
  "slug",
  "sort_order",
  "created_at",
  "updated_at"
)
SELECT
  "name",
  "slug",
  "sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "source_groups";

WITH "source_templates" (
  "sort_order",
  "group_slug",
  "name",
  "slug",
  "ecommerce_use",
  "has_color",
  "has_finish",
  "preset_stock_unit",
  "preset_vat_rate",
  "preset_guarantee_months",
  "family_strategy",
  "main_filters"
) AS (
  VALUES
    (10, 'carrelage-revetement', 'Carrelage sol/mur', 'carrelage-sol-mur', 'For GRE., FAI., PAR. labels and standard floor/wall tiles.', true, true, 'SQUARE_METER', 19.000, NULL::INTEGER, 'Collection + format + color/finish as variants', 'type, format, color, finish, aspect, destination'),
    (20, 'carrelage-revetement', 'Mosaïque, décor & listel', 'mosaique-decor-listel', 'For MOSAIQUE, DEC., BAG., cabochon/listel decorative pieces.', true, true, 'PIECE', 19.000, NULL::INTEGER, 'Family by collection/color', 'type, format, color, material'),
    (30, 'carrelage-revetement', 'Profilé, plinthe & baguette', 'profile-plinthe-baguette', 'For profiles, plinthes, baguettes and finishing trims.', true, true, 'PIECE', 19.000, NULL::INTEGER, 'Family by profile type + finish', 'profile type, length, material, finish'),
    (40, 'carrelage-revetement', 'Colle, joint & produit de pose', 'produit-pose-carrelage', 'For CARROJOINT, ciment colle, pâte, croisillons and installation consumables.', true, false, 'KILOGRAM', 19.000, NULL::INTEGER, 'No family unless color/size variants exist', 'type, color, weight, ready-to-use'),
    (100, 'sanitaire-wc', 'Lavabo & lave-main', 'lavabo-lave-main', 'For LAV, LAVE MAIN, lavabos suspendus/monoblocs.', true, true, 'PIECE', 19.000, 0, 'Family by collection + size + color', 'installation, width, color, shape, material'),
    (110, 'sanitaire-wc', 'Vasque / bol à poser', 'vasque-bol-a-poser', 'For BOL REF, VASQUE and countertop basins.', true, true, 'PIECE', 19.000, 0, 'Family by model + color/finish', 'installation, size, color, material, shape'),
    (120, 'sanitaire-wc', 'Plan vasque', 'plan-vasque', 'For PLAN VASQUE and vanity tops.', true, true, 'PIECE', 19.000, 0, 'Family by width + basin count', 'width, basin count, color, material'),
    (130, 'sanitaire-wc', 'Cuvette WC', 'cuvette-wc', 'For CUV, CUV.SUSP, WC bowls and packs.', true, true, 'PIECE', 19.000, 0, 'Family by collection + installation', 'suspended/standing, rimless, color, outlet'),
    (140, 'sanitaire-wc', 'Abattant WC', 'abattant-wc', 'For ABAT labels including soft-close/slim seats.', true, true, 'PIECE', 19.000, 0, 'Family by compatible WC + color', 'soft-close, slim, color, compatibility'),
    (150, 'sanitaire-wc', 'Bâti-support & réservoir WC', 'bati-support-reservoir-wc', 'For BATI CHASSE, BATI SUPPORT and concealed cistern systems.', false, false, 'PIECE', 19.000, 0, 'Family by system/height', 'height, wall type, compatible plates'),
    (160, 'sanitaire-wc', 'Plaque de commande WC', 'plaque-commande-wc', 'For PLAQUE CARRE/RONDE, flush plates and activation plates.', true, true, 'PIECE', 19.000, 0, 'Family by system + finish', 'finish, buttons, compatible system'),
    (200, 'meubles-accessoires-sdb', 'Meuble sous-vasque / meuble SDB', 'meuble-sous-vasque', 'For MEUB.S, MEUB SDB, bas elements and vanity furniture.', true, true, 'PIECE', 19.000, 0, 'Family by collection + width + color', 'width, color, material, drawers, basin included'),
    (210, 'meubles-accessoires-sdb', 'Colonne / armoire SDB', 'colonne-armoire-sdb', 'For MEUB COLONNE, storage columns, cabinets.', true, true, 'PIECE', 19.000, 0, 'Family by collection + color', 'width, height, doors, color'),
    (220, 'meubles-accessoires-sdb', 'Miroir & éclairage SDB', 'miroir-eclairage-sdb', 'For MIR, MIROIR, LAV+MIROIR and LED appliques.', true, true, 'PIECE', 19.000, 0, 'Family by size + lighting', 'width, LED, IP rating, style'),
    (230, 'meubles-accessoires-sdb', 'Accessoire salle de bain', 'accessoire-salle-de-bain', 'For porte-serviette, porte-papier, brosse WC, patères and accessory sets.', true, true, 'PIECE', 19.000, 0, 'Family by accessory type + finish', 'accessory type, finish, material, set pieces'),
    (300, 'robinetterie', 'Mitigeur lavabo / vasque', 'mitigeur-lavabo-vasque', 'For MIT.LAVABO, MIT.VASQUE and basin mixers.', true, true, 'PIECE', 19.000, 0, 'Family by collection + finish + height', 'finish, installation, spout height, handle'),
    (310, 'robinetterie', 'Mitigeur douche / bain-douche', 'mitigeur-douche-bain', 'For MIT.DOUCHE, MIT.B.DOUCHE and thermostatic/bath mixers.', true, true, 'PIECE', 19.000, 0, 'Family by collection + finish', 'thermostatic, diverter, finish, kit included'),
    (320, 'robinetterie', 'Mitigeur évier', 'mitigeur-evier', 'For MIT.EVIER and kitchen mixers.', true, true, 'PIECE', 19.000, 0, 'Family by collection + finish', 'finish, spout type, swivel, installation'),
    (330, 'robinetterie', 'Corps encastré & inverseur', 'corps-encastre-inverseur', 'For CORPS ENCAS, SmartBox, inverseurs and built-in bodies.', false, false, 'PIECE', 19.000, 0, 'Family by compatible mixer/system', 'compatibility, outlets, diverter, connection'),
    (400, 'douche', 'Colonne / barre de douche', 'colonne-barre-douche', 'For COLONNE DE DOUCHE and BARRE DE DOUCHE.', true, true, 'PIECE', 19.000, 0, 'Family by collection + finish', 'with mixer, thermostatic, finish, height'),
    (410, 'douche', 'Douchette, tête, bras & flexible', 'douchette-tete-bras-flexible', 'For DOUCHETTE, TETE, BRAS DE DOUCHE, FLEXIBLE and supports.', true, true, 'PIECE', 19.000, 0, 'Family by accessory type + finish', 'type, finish, hose length, spray modes'),
    (420, 'douche', 'Paroi de douche', 'paroi-de-douche', 'For PAROI labels including accessories for paroi.', true, true, 'PIECE', 19.000, 0, 'Family by model + width + finish', 'width, opening, glass thickness, profile finish'),
    (430, 'douche', 'Cabine de douche', 'cabine-de-douche', 'For CABINE labels.', true, true, 'PIECE', 19.000, 0, 'Family by size + features', 'size, opening, glass, tray included'),
    (440, 'douche', 'Receveur & caniveau', 'receveur-caniveau', 'For REC, RECEVEUR, CANIVEAU, grilles and drainage channels.', true, true, 'PIECE', 19.000, 0, 'Family by size + color', 'size, material, drain position, anti-slip'),
    (500, 'bain', 'Baignoire', 'baignoire', 'For BAIG/BAIGNOIRE standard, acrylic, island and corner baths.', true, true, 'PIECE', 19.000, 0, 'Family by size + type', 'type, length, width, material, faucet included'),
    (510, 'bain', 'Baignoire balnéo / hydromassage', 'baignoire-balneo-hydromassage', 'For BAIG.HYD, hydromassage and balneo products.', true, true, 'PIECE', 19.000, 0, 'Family by size + hydromassage spec', 'jets, capacity, faucet/support included'),
    (520, 'bain', 'Accessoire baignoire', 'accessoire-baignoire', 'For JUPE, repose-tête, supports and bath accessories.', true, true, 'PIECE', 19.000, 0, 'Family by compatible bathtub + finish', 'type, compatibility, color/finish'),
    (600, 'cuisine', 'Évier de cuisine', 'evier-cuisine', 'For EVI and EVIER labels, especially LEMON granite sinks.', true, true, 'PIECE', 19.000, 0, 'Family by model + size + color', 'material, bowls, drainer, color, size'),
    (610, 'cuisine-plomberie', 'Bonde, siphon & vidage', 'bonde-siphon-vidage', 'For BONDE, SIPHON, VIDAGE and drain accessories.', false, true, 'PIECE', 19.000, 0, 'Family by application + connection', 'type, application, connection size, finish'),
    (700, 'plomberie', 'Raccord PVC & évacuation', 'raccord-pvc-evacuation', 'For PVC coude, té, réduction, bouchon, manchon and evacuation fittings.', false, false, 'PIECE', 19.000, 0, 'Family by fitting type + diameter', 'type, diameter, angle, connection'),
    (710, 'plomberie', 'Flexible & raccord eau', 'flexible-raccord-eau', 'For flexibles toilette/douche/eau and small water fittings.', false, true, 'PIECE', 19.000, 0, 'Family by length + connection', 'length, connection size, finish'),
    (800, 'construction-exterieur', 'Porte & châssis', 'porte-chassis', 'For PORTE INT/EXT and CHASSIS PORTE labels.', true, true, 'PIECE', 19.000, 0, 'Family by dimensions + side', 'type, width, height, opening direction'),
    (810, 'construction-exterieur', 'Luminaire / borne extérieure', 'luminaire-borne-exterieure', 'For APPLIQUE, BORNE D ECLAIRAGE and outdoor lighting.', true, true, 'PIECE', 19.000, 0, 'Family by style + finish', 'type, IP rating, power, installation'),
    (820, 'construction-exterieur', 'Matériau bâtiment / jardin', 'materiau-batiment-jardin', 'For brique, grillage, balustrade, banquette, garden/building items.', true, true, 'PIECE', 19.000, 0, 'Family by material + dimensions', 'type, material, dimensions, color')
)
INSERT INTO "product_type_templates" (
  "group_id",
  "name",
  "slug",
  "description",
  "sort_order",
  "has_color",
  "has_finish",
  "preset_tags",
  "preset_stock_unit",
  "preset_vat_rate",
  "preset_guarantee_months",
  "created_at",
  "updated_at"
)
SELECT
  "groups"."id",
  "templates"."name",
  "templates"."slug",
  "templates"."ecommerce_use" || E'\nFamily strategy: ' || "templates"."family_strategy" || E'\nMain filters: ' || "templates"."main_filters",
  "templates"."sort_order",
  "templates"."has_color",
  "templates"."has_finish",
  '',
  "templates"."preset_stock_unit"::"StockUnit",
  "templates"."preset_vat_rate"::DECIMAL(5, 3),
  "templates"."preset_guarantee_months",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "source_templates" "templates"
JOIN "product_type_groups" "groups"
  ON "groups"."slug" = "templates"."group_slug";

INSERT INTO "product_attribute_groups" (
  "product_type_id",
  "name",
  "slug",
  "sort_order",
  "created_at",
  "updated_at"
)
SELECT
  "id",
  'Filtres principaux',
  'filtres-principaux',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "product_type_templates";

WITH "flag_attributes" ("template_slug", "attribute_key", "sort_order") AS (
  SELECT "slug", 'color', 0
  FROM "product_type_templates"
  WHERE "has_color" = true

  UNION ALL

  SELECT "slug", 'finish', 1
  FROM "product_type_templates"
  WHERE "has_finish" = true
)
INSERT INTO "product_type_attributes" (
  "product_type_id",
  "attribute_group_id",
  "attribute_definition_id",
  "label",
  "is_required",
  "is_filterable",
  "sort_order",
  "created_at",
  "updated_at"
)
SELECT
  "templates"."id",
  "groups"."id",
  "definitions"."id",
  '',
  false,
  true,
  "flag_attributes"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "flag_attributes"
JOIN "product_type_templates" "templates"
  ON "templates"."slug" = "flag_attributes"."template_slug"
JOIN "product_attribute_groups" "groups"
  ON "groups"."product_type_id" = "templates"."id"
 AND "groups"."slug" = 'filtres-principaux'
JOIN "product_attribute_definitions" "definitions"
  ON "definitions"."key" = "flag_attributes"."attribute_key"
ON CONFLICT ("product_type_id", "attribute_definition_id") DO NOTHING;

WITH "template_attributes" ("template_slug", "attribute_key", "sort_order") AS (
  VALUES
    ('carrelage-sol-mur', 'tile_type', 10),
    ('carrelage-sol-mur', 'tile_size_cm', 20),
    ('carrelage-sol-mur', 'color', 30),
    ('carrelage-sol-mur', 'finish', 40),
    ('carrelage-sol-mur', 'look_effect', 50),
    ('carrelage-sol-mur', 'tile_application', 60),
    ('mosaique-decor-listel', 'tile_type', 10),
    ('mosaique-decor-listel', 'sheet_size_cm', 20),
    ('mosaique-decor-listel', 'color', 30),
    ('mosaique-decor-listel', 'material', 40),
    ('profile-plinthe-baguette', 'profile_type', 10),
    ('profile-plinthe-baguette', 'length_cm', 20),
    ('profile-plinthe-baguette', 'material', 30),
    ('profile-plinthe-baguette', 'finish', 40),
    ('produit-pose-carrelage', 'product_use', 10),
    ('produit-pose-carrelage', 'color', 20),
    ('produit-pose-carrelage', 'packaging_weight_kg', 30),
    ('produit-pose-carrelage', 'ready_to_use', 40),
    ('lavabo-lave-main', 'installation_type', 10),
    ('lavabo-lave-main', 'width_cm', 20),
    ('lavabo-lave-main', 'color', 30),
    ('lavabo-lave-main', 'shape', 40),
    ('lavabo-lave-main', 'material', 50),
    ('vasque-bol-a-poser', 'installation_type', 10),
    ('vasque-bol-a-poser', 'size_label', 20),
    ('vasque-bol-a-poser', 'color', 30),
    ('vasque-bol-a-poser', 'material', 40),
    ('vasque-bol-a-poser', 'shape', 50),
    ('plan-vasque', 'width_cm', 10),
    ('plan-vasque', 'basin_count', 20),
    ('plan-vasque', 'color', 30),
    ('plan-vasque', 'material', 40),
    ('cuvette-wc', 'wc_type', 10),
    ('cuvette-wc', 'rimless', 20),
    ('cuvette-wc', 'color', 30),
    ('cuvette-wc', 'outlet_type', 40),
    ('abattant-wc', 'soft_close', 10),
    ('abattant-wc', 'slim_seat', 20),
    ('abattant-wc', 'color', 30),
    ('abattant-wc', 'compatibility_notes', 40),
    ('bati-support-reservoir-wc', 'frame_height_cm', 10),
    ('bati-support-reservoir-wc', 'wall_type', 20),
    ('bati-support-reservoir-wc', 'compatible_system', 30),
    ('plaque-commande-wc', 'finish', 10),
    ('plaque-commande-wc', 'number_of_buttons', 20),
    ('plaque-commande-wc', 'compatible_system', 30),
    ('meuble-sous-vasque', 'width_cm', 10),
    ('meuble-sous-vasque', 'color', 20),
    ('meuble-sous-vasque', 'material', 30),
    ('meuble-sous-vasque', 'drawers_count', 40),
    ('meuble-sous-vasque', 'basin_included', 50),
    ('colonne-armoire-sdb', 'width_cm', 10),
    ('colonne-armoire-sdb', 'height_cm', 20),
    ('colonne-armoire-sdb', 'doors_count', 30),
    ('colonne-armoire-sdb', 'color', 40),
    ('miroir-eclairage-sdb', 'width_cm', 10),
    ('miroir-eclairage-sdb', 'lighting_included', 20),
    ('miroir-eclairage-sdb', 'ip_rating', 30),
    ('miroir-eclairage-sdb', 'style', 40),
    ('accessoire-salle-de-bain', 'accessory_type', 10),
    ('accessoire-salle-de-bain', 'finish', 20),
    ('accessoire-salle-de-bain', 'material', 30),
    ('accessoire-salle-de-bain', 'set_pieces', 40),
    ('mitigeur-lavabo-vasque', 'finish', 10),
    ('mitigeur-lavabo-vasque', 'installation_type', 20),
    ('mitigeur-lavabo-vasque', 'spout_height_cm', 30),
    ('mitigeur-lavabo-vasque', 'handle_type', 40),
    ('mitigeur-douche-bain', 'thermostatic', 10),
    ('mitigeur-douche-bain', 'diverter', 20),
    ('mitigeur-douche-bain', 'finish', 30),
    ('mitigeur-douche-bain', 'with_shower_kit', 40),
    ('mitigeur-evier', 'finish', 10),
    ('mitigeur-evier', 'spout_type', 20),
    ('mitigeur-evier', 'swivel_spout', 30),
    ('mitigeur-evier', 'installation_type', 40),
    ('corps-encastre-inverseur', 'compatibility_notes', 10),
    ('corps-encastre-inverseur', 'number_of_outlets', 20),
    ('corps-encastre-inverseur', 'diverter', 30),
    ('corps-encastre-inverseur', 'connection_type', 40),
    ('colonne-barre-douche', 'with_mixer', 10),
    ('colonne-barre-douche', 'thermostatic', 20),
    ('colonne-barre-douche', 'finish', 30),
    ('colonne-barre-douche', 'height_cm', 40),
    ('douchette-tete-bras-flexible', 'shower_set_type', 10),
    ('douchette-tete-bras-flexible', 'finish', 20),
    ('douchette-tete-bras-flexible', 'hose_length_cm', 30),
    ('douchette-tete-bras-flexible', 'spray_modes', 40),
    ('paroi-de-douche', 'width_cm', 10),
    ('paroi-de-douche', 'opening_type', 20),
    ('paroi-de-douche', 'glass_thickness_mm', 30),
    ('paroi-de-douche', 'profile_finish', 40),
    ('cabine-de-douche', 'size_label', 10),
    ('cabine-de-douche', 'opening_type', 20),
    ('cabine-de-douche', 'glass_finish', 30),
    ('cabine-de-douche', 'tray_included', 40),
    ('receveur-caniveau', 'size_label', 10),
    ('receveur-caniveau', 'material', 20),
    ('receveur-caniveau', 'drain_position', 30),
    ('receveur-caniveau', 'anti_slip', 40),
    ('baignoire', 'bathtub_type', 10),
    ('baignoire', 'length_cm', 20),
    ('baignoire', 'width_cm', 30),
    ('baignoire', 'material', 40),
    ('baignoire', 'faucet_included', 50),
    ('baignoire-balneo-hydromassage', 'jet_count', 10),
    ('baignoire-balneo-hydromassage', 'capacity_l', 20),
    ('baignoire-balneo-hydromassage', 'faucet_included', 30),
    ('baignoire-balneo-hydromassage', 'support_included', 40),
    ('accessoire-baignoire', 'accessory_type', 10),
    ('accessoire-baignoire', 'compatibility_notes', 20),
    ('accessoire-baignoire', 'color', 30),
    ('accessoire-baignoire', 'finish', 40),
    ('evier-cuisine', 'sink_material', 10),
    ('evier-cuisine', 'bowls_count', 20),
    ('evier-cuisine', 'drainer_side', 30),
    ('evier-cuisine', 'color', 40),
    ('evier-cuisine', 'size_label', 50),
    ('bonde-siphon-vidage', 'accessory_type', 10),
    ('bonde-siphon-vidage', 'application_use', 20),
    ('bonde-siphon-vidage', 'connection_size', 30),
    ('bonde-siphon-vidage', 'finish', 40),
    ('raccord-pvc-evacuation', 'fitting_type', 10),
    ('raccord-pvc-evacuation', 'pipe_diameter_mm', 20),
    ('raccord-pvc-evacuation', 'angle_degrees', 30),
    ('raccord-pvc-evacuation', 'connection_type', 40),
    ('flexible-raccord-eau', 'length_cm', 10),
    ('flexible-raccord-eau', 'connection_size', 20),
    ('flexible-raccord-eau', 'finish', 30),
    ('porte-chassis', 'door_type', 10),
    ('porte-chassis', 'width_cm', 20),
    ('porte-chassis', 'height_cm', 30),
    ('porte-chassis', 'opening_direction', 40),
    ('luminaire-borne-exterieure', 'light_type', 10),
    ('luminaire-borne-exterieure', 'ip_rating', 20),
    ('luminaire-borne-exterieure', 'power_w', 30),
    ('luminaire-borne-exterieure', 'installation_type', 40),
    ('materiau-batiment-jardin', 'building_material_type', 10),
    ('materiau-batiment-jardin', 'material', 20),
    ('materiau-batiment-jardin', 'dimensions_text', 30),
    ('materiau-batiment-jardin', 'color', 40)
)
INSERT INTO "product_type_attributes" (
  "product_type_id",
  "attribute_group_id",
  "attribute_definition_id",
  "label",
  "is_required",
  "is_filterable",
  "sort_order",
  "created_at",
  "updated_at"
)
SELECT
  "templates"."id",
  "groups"."id",
  "definitions"."id",
  '',
  false,
  true,
  "template_attributes"."sort_order",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "template_attributes"
JOIN "product_type_templates" "templates"
  ON "templates"."slug" = "template_attributes"."template_slug"
JOIN "product_attribute_groups" "groups"
  ON "groups"."product_type_id" = "templates"."id"
 AND "groups"."slug" = 'filtres-principaux'
JOIN "product_attribute_definitions" "definitions"
  ON "definitions"."key" = "template_attributes"."attribute_key"
ON CONFLICT ("product_type_id", "attribute_definition_id") DO UPDATE SET
  "is_filterable" = EXCLUDED."is_filterable",
  "sort_order" = LEAST("product_type_attributes"."sort_order", EXCLUDED."sort_order"),
  "updated_at" = CURRENT_TIMESTAMP;
