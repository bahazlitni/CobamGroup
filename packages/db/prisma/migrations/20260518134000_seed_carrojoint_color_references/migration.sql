-- Add missing product color references used by the Carrojoint seed migration.
-- Product color attributes are stored as text labels, so these references make
-- the public inspector and staff UI able to resolve swatches for those labels.

BEGIN;

CREATE TEMP TABLE "_seed_carrojoint_color_references" ON COMMIT DROP AS
SELECT *
FROM (
  VALUES
    ('CARROJOINT_ALMOND_IVOIR', 'Almond Ivoir', '#E8DDC8'),
    ('CARROJOINT_ANTRACITE', 'Antracite', '#3E4347'),
    ('CARROJOINT_BEACH_WOOD', 'Beach Wood', '#A88862'),
    ('CARROJOINT_BEIGE', 'Beige', '#D9C9A5'),
    ('CARROJOINT_BEIGE_BAHAMAS', 'Beige Bahamas', '#D8C7A6'),
    ('CARROJOINT_BLACK', 'Black', '#111111'),
    ('CARROJOINT_BLANC', 'Blanc', '#F5F5F5'),
    ('CARROJOINT_BROWN', 'Brown', '#7A5A46'),
    ('CARROJOINT_CAK_WOOD', 'Cak Wood', '#8B6A4E'),
    ('CARROJOINT_CARAMEL', 'Caramel', '#B67A3C'),
    ('CARROJOINT_CEDAR', 'Cedar', '#8A5A3B'),
    ('CARROJOINT_CENERA_ASH', 'Cenera Ash', '#8B8F8A'),
    ('CARROJOINT_CHAMOMILE', 'Chamomile', '#E4D6A8'),
    ('CARROJOINT_COFFE', 'Coffe', '#6F4E37'),
    ('CARROJOINT_COTTON_FIELD', 'Cotton Field', '#EEE6D6'),
    ('CARROJOINT_COTTON_FILED', 'Cotton Filed', '#EEE6D6'),
    ('CARROJOINT_CYPRES', 'Cypres', '#3F5F4A'),
    ('CARROJOINT_DARK_BLEU', 'Dark Bleu', '#1F3A5F'),
    ('CARROJOINT_DARK_GREY', 'Dark Grey', '#4C4F52'),
    ('CARROJOINT_EFES_BEIGE', 'Efes Beige', '#CDB996'),
    ('CARROJOINT_GRAPHITE', 'Graphite', '#4F5357'),
    ('CARROJOINT_GREY', 'Grey', '#7D7F7D'),
    ('CARROJOINT_GRIS', 'Gris', '#808080'),
    ('CARROJOINT_GRIS_CIMENT', 'Gris Ciment', '#8A867D'),
    ('CARROJOINT_GRIS_CL', 'Gris Cl', '#C9C9C9'),
    ('CARROJOINT_GRIS_ICE_MANHATAN', 'Gris Ice Manhatan', '#B5B8B6'),
    ('CARROJOINT_GRIS_ICE_MANHATEN', 'Gris Ice Manhaten', '#B5B8B6'),
    ('CARROJOINT_GRIS_MOYEN', 'Gris Moyen', '#8A8A8A'),
    ('CARROJOINT_GRIS_PEARL', 'Gris Pearl', '#C7C6C0'),
    ('CARROJOINT_GRIS_SILVER', 'Gris Silver', '#A6A6A6'),
    ('CARROJOINT_ICE', 'Ice', '#DDE3E6'),
    ('CARROJOINT_ICE_GREY', 'Ice Grey', '#D0D4D3'),
    ('CARROJOINT_JASMIN', 'Jasmin', '#F0E7D5'),
    ('CARROJOINT_LIGHT_BLEU', 'Light Bleu', '#6FA3D2'),
    ('CARROJOINT_LIGHT_GREY', 'Light Grey', '#BEBEBE'),
    ('CARROJOINT_LIGHT_SAND', 'Light Sand', '#D8C7A3'),
    ('CARROJOINT_MAGNOLIA', 'Magnolia', '#F2E6C9'),
    ('CARROJOINT_MAGNOLIA_BEIGE', 'Magnolia Beige', '#E8DCC4'),
    ('CARROJOINT_MAGNOLIA_IVOIR', 'Magnolia Ivoir', '#F2E6C9'),
    ('CARROJOINT_MAHOGANY', 'Mahogany', '#6B3E2E'),
    ('CARROJOINT_MALVE', 'Malve', '#8C7284'),
    ('CARROJOINT_MANHATTAN', 'Manhattan', '#A6A8A6'),
    ('CARROJOINT_MAPLE_WOOD', 'Maple Wood', '#C79E6E'),
    ('CARROJOINT_MOKA_BROWN', 'Moka Brown', '#6B5142'),
    ('CARROJOINT_MY_KONOS_BLEU', 'My Konos Bleu', '#2E5C8A'),
    ('CARROJOINT_NAVY_BLEU', 'Navy Bleu', '#1C304C'),
    ('CARROJOINT_NERO_ABSOLUTO', 'Nero Absoluto', '#1E1E1C'),
    ('CARROJOINT_NOCE_WALNUT', 'Noce Walnut', '#6F4E37'),
    ('CARROJOINT_NOIR', 'Noir', '#111111'),
    ('CARROJOINT_PERGAMON', 'Pergamon', '#E8DFCF'),
    ('CARROJOINT_PETRA_BEIGE', 'Petra Beige', '#D2BE9B'),
    ('CARROJOINT_PINE', 'Pine', '#C4B08A'),
    ('CARROJOINT_PURPLE', 'Purple', '#6B4C7A'),
    ('CARROJOINT_RED_BROWN', 'Red Brown', '#7B3F34'),
    ('CARROJOINT_SAHARA_BEIGE', 'Sahara Beige', '#D9C19D'),
    ('CARROJOINT_SAND_SABBIA', 'Sand Sabbia', '#BFA77F'),
    ('CARROJOINT_SILVER', 'Silver', '#BFC3C7'),
    ('CARROJOINT_SILVER_GREY', 'Silver Grey', '#A6A6A6'),
    ('CARROJOINT_STARDUST', 'Stardust', '#B8B8B6'),
    ('CARROJOINT_TABACO', 'Tabaco', '#7A5638'),
    ('CARROJOINT_TORTILLA', 'Tortilla', '#C8A97E'),
    ('CARROJOINT_TORTORA', 'Tortora', '#9A8F84'),
    ('CARROJOINT_UMBER', 'Umber', '#7B604A'),
    ('CARROJOINT_VERT_CYPRESS', 'Vert Cypress', '#3F5F4A'),
    ('CARROJOINT_WHITE', 'White', '#F5F5F2')
) AS "x"("key", "label", "value");

INSERT INTO "product_colors" ("key", "label", "value", "created_at", "updated_at")
SELECT
  "refs"."key",
  "refs"."label",
  "refs"."value",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_seed_carrojoint_color_references" "refs"
WHERE NOT EXISTS (
  SELECT 1
  FROM "product_colors" "existing"
  WHERE lower("existing"."label") = lower("refs"."label")
)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "value" = EXCLUDED."value",
  "updated_at" = CURRENT_TIMESTAMP;

COMMIT;
