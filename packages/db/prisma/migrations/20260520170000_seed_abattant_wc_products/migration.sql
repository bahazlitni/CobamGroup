-- Seed Abattant WC products.
-- Product model: Abattant WC (product_type_templates.id = 7).
-- Media fields are intentionally left empty: images, technical datasheets, and certificates.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "product_type_templates" WHERE "id" = 7 AND "slug" = 'abattant-wc'
  ) THEN
    RAISE EXCEPTION 'Missing product_type_templates id 7 / abattant-wc.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "product_type_attributes" "pta"
    JOIN "product_attribute_definitions" "pad"
      ON "pad"."id" = "pta"."attribute_definition_id"
    WHERE "pta"."product_type_id" = 7
      AND "pad"."key" IN ('color', 'finish', 'soft_close', 'slim_seat', 'compatibility_notes')
    HAVING COUNT(DISTINCT "pad"."key") = 5
  ) THEN
    RAISE EXCEPTION 'Product model 7 is missing one or more expected attributes.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "product_types" WHERE "slug" = 'salle-de-bain-et-cuisine'
  ) THEN
    RAISE EXCEPTION 'Missing salle-de-bain-et-cuisine category.';
  END IF;
END $$;

CREATE TEMP TABLE "_seed_abattant_wc" (
  "sku" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "price_ttc" NUMERIC(12, 3) NOT NULL,
  "stock_available" NUMERIC(12, 3) NOT NULL,
  "brand_slug" TEXT,
  "brand_name" TEXT,
  "family_slug" TEXT,
  "family_name" TEXT,
  "color_value" TEXT,
  "finish_value" TEXT,
  "soft_close" BOOLEAN NOT NULL,
  "slim_seat" BOOLEAN NOT NULL,
  "compatibility_notes" TEXT,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_seed_abattant_wc" (
  "sku", "name", "display_name", "price_ttc", "stock_available",
  "brand_slug", "brand_name", "family_slug", "family_name",
  "color_value", "finish_value", "soft_close", "slim_seat", "compatibility_notes", "sort_order"
)
VALUES
  ('00221139', 'ABAT ABS FLORA EJIM', 'Ejim - Abattant Flora ABS', 56.470, 0, 'ejim', 'Ejim', NULL, NULL, NULL, 'ABS', false, false, 'Flora', 0),
  ('00211253', 'ABAT AMESTERDAM NOIR CS SANIMED', 'Sanimed - Abattant Amesterdam noir', 360.401, 0, 'sanimed', 'Sanimed', 'abattants-wc-sanimed', 'Abattants WC Sanimed', 'Noir', NULL, false, false, 'Amesterdam', 1),
  ('00201926', 'ABAT AVEC AMORT GEMME CS IDEAL SAN', 'Ideal San - Abattant Gemme avec amorti', 117.000, 0, 'ideal-san', 'Ideal San', 'abattants-wc-ideal-san', 'Abattants WC Ideal San', NULL, NULL, true, false, 'Gemme', 2),
  ('00192866', 'ABAT AVEC AMORT HALLEY MARRON (06-010) IDEVIT', 'Idevit - Abattant Halley marron avec amorti (06-010)', 329.412, 0, 'idevit', 'Idevit', 'abattants-wc-idevit', 'Abattants WC Idevit', 'Marron', NULL, true, false, 'Halley 06-010', 3),
  ('00186346', 'ABAT AVEC AMORT KC318100 CREAVIT', 'Creavit - Abattant KC318100 avec amorti', 101.000, 1, 'creavit', 'Creavit', NULL, NULL, NULL, NULL, true, false, 'KC318100', 4),
  ('00184076', 'ABAT AVEC AMORT ME BY STARCK 2009 (SUSP) DURAVIT', 'Duravit - Abattant ME by Starck 2009 suspendu avec amorti', 275.830, 0, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, true, false, 'ME by Starck 2009 suspendu', 5),
  ('00189552', 'ABAT AVEC AMORT ME BY STARCK 20190000 (SUR PIED) DURAVIT', 'Duravit - Abattant ME by Starck 20190000 sur pied avec amorti', 261.744, 0, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, true, false, 'ME by Starck 20190000 sur pied', 6),
  ('00242820', 'ABAT AVEC AMORT SLIM KUBE MS86CSN11 GSI', 'GSI - Abattant slim Kube MS86CSN11 avec amorti', 223.530, 52, 'gsi', 'GSI', 'abattants-wc-gsi', 'Abattants WC GSI', NULL, NULL, true, true, 'Kube MS86CSN11', 7),
  ('00242813', 'ABAT AVEC AMORT SLIM MODO MS98C11 GSI', 'GSI - Abattant slim Modo MS98C11 avec amorti', 211.764, 2, 'gsi', 'GSI', 'abattants-wc-gsi', 'Abattants WC GSI', NULL, NULL, true, true, 'Modo MS98C11', 8),
  ('00245920', 'ABAT AVEC AMORT SLIM NUBES MS96C11 GSI', 'GSI - Abattant slim Nubes MS96C11 avec amorti', 294.118, 30, 'gsi', 'GSI', 'abattants-wc-gsi', 'Abattants WC GSI', NULL, NULL, true, true, 'Nubes MS96C11', 9),
  ('00248143', 'ABAT AVEC AMORT SLIM NUBES NOIR MS96C26 GSI', 'GSI - Abattant slim Nubes noir MS96C26 avec amorti', 529.412, 3, 'gsi', 'GSI', 'abattants-wc-gsi', 'Abattants WC GSI', 'Noir', NULL, true, true, 'Nubes MS96C26', 10),
  ('00248204', 'ABAT AVEC AMORT SLIM PURA BLEU MS86CSN04 GSI', 'GSI - Abattant slim Pura bleu MS86CSN04 avec amorti', 517.648, 1, 'gsi', 'GSI', 'abattants-wc-gsi', 'Abattants WC GSI', 'Bleu', NULL, true, true, 'Pura MS86CSN04', 11),
  ('00248211', 'ABAT AVEC AMORT SLIM PURA GREGE MS86CSN08 GSI', 'GSI - Abattant slim Pura grege MS86CSN08 avec amorti', 517.648, 5, 'gsi', 'GSI', 'abattants-wc-gsi', 'Abattants WC GSI', 'Grege', NULL, true, true, 'Pura MS86CSN08', 12),
  ('00248228', 'ABAT AVEC AMORT SLIM PURA GRIS CL MS86CSN17 GSI', 'GSI - Abattant slim Pura gris clair MS86CSN17 avec amorti', 517.648, 1, 'gsi', 'GSI', 'abattants-wc-gsi', 'Abattants WC GSI', 'Gris clair', NULL, true, true, 'Pura MS86CSN17', 13),
  ('00248198', 'ABAT AVEC AMORT SLIM PURA NOIR MS86CSN26 GSI', 'GSI - Abattant slim Pura noir MS86CSN26 avec amorti', 517.648, 5, 'gsi', 'GSI', 'abattants-wc-gsi', 'Abattants WC GSI', 'Noir', NULL, true, true, 'Pura MS86CSN26', 14),
  ('00000050', 'ABAT AVEC AMORTI STARCK3 (6389) DURAVIT', 'Duravit - Abattant Starck 3 avec amorti (6389)', 355.000, 0, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, true, false, 'Starck 3 6389', 15),
  ('00202992', 'ABAT AZUR/LAVANTA CS SANIMED', 'Sanimed - Abattant Azur / Lavanta', 42.000, 29, 'sanimed', 'Sanimed', 'abattants-wc-sanimed', 'Abattants WC Sanimed', 'Azur / Lavanta', NULL, false, false, 'Azur / Lavanta', 16),
  ('00203012', 'ABAT CANDO AMESTERDAM AVEC AMORT CS SANIMED', 'Sanimed - Abattant Cando Amesterdam avec amorti', 152.941, 1, 'sanimed', 'Sanimed', 'abattants-wc-sanimed', 'Abattants WC Sanimed', NULL, NULL, true, false, 'Cando Amesterdam', 17),
  ('00210614', 'ABAT CANDO MILANO/LONDON AVEC AMORT CS SANIMED', 'Sanimed - Abattant Cando Milano / London avec amorti', 152.941, 1, 'sanimed', 'Sanimed', 'abattants-wc-sanimed', 'Abattants WC Sanimed', NULL, NULL, true, false, 'Cando Milano / London', 18),
  ('00253611', 'ABAT COMBI BASIC AVEC AMORTIS (2619) DURAVIT', 'Duravit - Abattant Combi Basic avec amortis (2619)', 297.648, 1, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, true, false, 'Combi Basic 2619', 19),
  ('00244060', 'ABAT COMBI BASIC SANS AMORTIS (2611) DURAVIT', 'Duravit - Abattant Combi Basic sans amortis (2611)', 146.401, 1, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, false, false, 'Combi Basic 2611', 20),
  ('00242752', 'ABAT DUNE SANS AMORT (6060) DURAVIT', 'Duravit - Abattant Dune sans amorti (6060)', 72.942, 14, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, false, false, 'Dune 6060', 21),
  ('00002934', 'ABAT DURASTYLE AVEC AMORT (6379) DURAVIT', 'Duravit - Abattant Durastyle avec amorti (6379)', 265.470, 20, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, true, false, 'Durastyle 6379', 22),
  ('00213691', 'ABAT DURASTYLE (RIMLESS) AVEC AMORT (2079) DURAVIT', 'Duravit - Abattant Durastyle Rimless avec amorti (2079)', 216.000, 3, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, true, false, 'Durastyle Rimless 2079', 23),
  ('00241564', 'ABAT DURASTYLE (RIMLESS) SIMPLE 2071 DURAVIT', 'Duravit - Abattant Durastyle Rimless simple 2071', 108.235, 0, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, false, false, 'Durastyle Rimless 2071', 24),
  ('00002935', 'ABAT DURASTYLE SANS AMORTIS (6371) DURAVIT', 'Duravit - Abattant Durastyle sans amortis (6371)', 165.033, 0, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, false, false, 'Durastyle 6371', 25),
  ('00000967', 'ABAT DURAVIT D-CODE AVEC AMORTIS (6739)', 'Duravit - Abattant D-Code avec amortis (6739)', 300.460, 5, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, true, false, 'D-Code 6739', 26),
  ('00000053', 'ABAT DURAVIT D-CODE SANS AMORTIS(6731)', 'Duravit - Abattant D-Code sans amortis (6731)', 117.850, 43, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, false, false, 'D-Code 6731', 27),
  ('00002938', 'ABAT DURAVIT DELLARCO DURAVIT', 'Duravit - Abattant Dellarco', 191.910, 0, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, false, false, 'Dellarco', 28),
  ('SOTABANIL0', 'ABAT ECE BLC', 'Abattant Ece blanc', 35.000, 0, NULL, NULL, NULL, NULL, 'Blanc', NULL, false, false, 'Ece', 29),
  ('00184519', 'ABAT GALA  METROPOL BLC', 'Gala - Abattant Metropol blanc', 70.400, 0, 'gala', 'Gala', 'abattants-wc-gala', 'Abattants WC Gala', 'Blanc', NULL, false, false, 'Metropol', 30),
  ('00184533', 'ABAT GALA BIDET ELIA BLC', 'Gala - Abattant bidet Elia blanc', 64.300, 0, 'gala', 'Gala', 'abattants-wc-gala', 'Abattants WC Gala', 'Blanc', NULL, false, false, 'Bidet Elia', 31),
  ('00184526', 'ABAT GALA BIDET MARINA BLC', 'Gala - Abattant bidet Marina blanc', 65.000, 0, 'gala', 'Gala', 'abattants-wc-gala', 'Abattants WC Gala', 'Blanc', NULL, false, false, 'Bidet Marina', 32),
  ('00002952', 'ABAT IDEAL SANIT IRIS BLC', 'Ideal San - Abattant Iris blanc', 27.700, 0, 'ideal-san', 'Ideal San', 'abattants-wc-ideal-san', 'Abattants WC Ideal San', 'Blanc', NULL, false, false, 'Iris', 33),
  ('00192835', 'ABAT LUXE BLANC', 'Abattant Luxe blanc', 13.530, 0, NULL, NULL, NULL, NULL, 'Blanc', NULL, false, false, 'Luxe', 34),
  ('00245128', 'ABAT OCEAN THERMODUR SANIMED', 'Sanimed - Abattant Ocean thermodur', 56.442, 11, 'sanimed', 'Sanimed', 'abattants-wc-sanimed', 'Abattants WC Sanimed', NULL, 'Thermodur', false, false, 'Ocean', 35),
  ('00203005', 'ABAT OLYMPIA AVEC AMORT SANIMED', 'Sanimed - Abattant Olympia avec amorti', 111.764, 0, 'sanimed', 'Sanimed', 'abattants-wc-sanimed', 'Abattants WC Sanimed', NULL, NULL, true, false, 'Olympia', 36),
  ('00212618', 'ABAT OLYMPIA NOIR AVEC AMORT SANIMED', 'Sanimed - Abattant Olympia noir avec amorti', 266.449, 0, 'sanimed', 'Sanimed', 'abattants-wc-sanimed', 'Abattants WC Sanimed', 'Noir', NULL, true, false, 'Olympia', 37),
  ('00234993', 'ABAT OLYMPIA PALMA', 'Palma - Abattant Olympia', 86.000, 0, 'palma', 'Palma', NULL, NULL, NULL, NULL, false, false, 'Olympia', 38),
  ('00000968', 'ABAT PLASTIC OVA 1C TURKUAZ', 'Turkuaz - Abattant Ova plastique 1C', 15.000, 0, 'turkuaz', 'Turkuaz', 'abattants-wc-turkuaz', 'Abattants WC Turkuaz', NULL, 'Plastique', false, false, 'Ova 1C', 39),
  ('00194952', 'ABAT PLASTIQUE ALIA SANIMED', 'Sanimed - Abattant Alia plastique', 22.232, 0, 'sanimed', 'Sanimed', 'abattants-wc-sanimed', 'Abattants WC Sanimed', NULL, 'Plastique', false, false, 'Alia', 40),
  ('00242745', 'ABAT P3 CONFORTS AVEC AMORT (2039) DURAVIT', 'Duravit - Abattant P3 Comforts avec amorti (2039)', 347.059, 15, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, true, false, 'P3 Comforts 2039', 41),
  ('MED18ABATRENA', 'ABAT RENA (530205001) IDEVIT', 'Idevit - Abattant Rena (530205001)', 121.429, 0, 'idevit', 'Idevit', 'abattants-wc-idevit', 'Abattants WC Idevit', NULL, NULL, false, false, 'Rena 530205001', 42),
  ('00002958', 'ABAT ROCA  DAMA BLC', 'Roca - Abattant Dama blanc', 127.500, 0, 'roca', 'Roca', NULL, NULL, 'Blanc', NULL, false, false, 'Dama', 43),
  ('00184069', 'ABAT SANS AMORT ME BY STARCK (2001) DURAVIT', 'Duravit - Abattant ME by Starck sans amorti (2001)', 182.403, 0, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, false, false, 'ME by Starck 2001', 44),
  ('00000057', 'ABAT SANS AMORTI STARCK3 (6381) DURAVIT', 'Duravit - Abattant Starck 3 sans amorti (6381)', 166.226, 0, 'duravit', 'Duravit', 'abattants-wc-duravit', 'Abattants WC Duravit', NULL, NULL, false, false, 'Starck 3 6381', 45),
  ('00194129', 'ABAT SELNOVA ABALONA AVEC AMORT (500.334.01.1) GEBERIT', 'Geberit - Abattant Selnova Abalona avec amorti (500.334.01.1)', 183.530, 0, 'geberit', 'Geberit', 'abattants-wc-geberit', 'Abattants WC Geberit', NULL, NULL, true, false, 'Selnova Abalona 500.334.01.1', 46),
  ('00194143', 'ABAT SELNOVA ABALONA SANS AMORT  (500.332.01.1) GEBERIT', 'Geberit - Abattant Selnova Abalona sans amorti (500.332.01.1)', 96.470, 1, 'geberit', 'Geberit', 'abattants-wc-geberit', 'Abattants WC Geberit', NULL, NULL, false, false, 'Selnova Abalona 500.332.01.1', 47),
  ('00245401', 'ABAT SENNER SOFT LECCICO', 'Leccico - Abattant Senner Soft', 117.650, 0, 'leccico', 'Leccico', NULL, NULL, NULL, NULL, true, false, 'Senner Soft', 48),
  ('00194150', 'ABAT SMYLE AVEC AMORT  (500.240.01.1) GEBERIT', 'Geberit - Abattant Smyle avec amorti (500.240.01.1)', 335.714, 0, 'geberit', 'Geberit', 'abattants-wc-geberit', 'Abattants WC Geberit', NULL, NULL, true, false, 'Smyle 500.240.01.1', 49),
  ('00222549', 'ABAT SUNRISE AVEC AMORT VITRA', 'Vitra - Abattant Sunrise avec amorti', 165.706, 0, 'vitra', 'Vitra', 'abattants-wc-vitra', 'Abattants WC Vitra', NULL, NULL, true, false, 'Sunrise', 50),
  ('00222501', 'ABAT S20 REF 77-003-001 VITRA', 'Vitra - Abattant S20 ref 77-003-001', 97.417, 0, 'vitra', 'Vitra', 'abattants-wc-vitra', 'Abattants WC Vitra', NULL, NULL, false, false, 'S20 77-003-001', 51),
  ('00000972', 'ABAT THERMO EVA TURKUAZ', 'Turkuaz - Abattant Eva thermodur', 62.500, 0, 'turkuaz', 'Turkuaz', 'abattants-wc-turkuaz', 'Abattants WC Turkuaz', NULL, 'Thermodur', false, false, 'Eva', 52),
  ('00179171', 'ABAT VEGA (53025002) IDEVIT', 'Idevit - Abattant Vega (53025002)', 127.000, 0, 'idevit', 'Idevit', 'abattants-wc-idevit', 'Abattants WC Idevit', NULL, NULL, false, false, 'Vega 53025002', 53),
  ('00203029', 'ABAT VENETTO AVEC AMORT CS SANIMED', 'Sanimed - Abattant Venetto avec amorti', 196.470, 0, 'sanimed', 'Sanimed', 'abattants-wc-sanimed', 'Abattants WC Sanimed', NULL, NULL, true, false, 'Venetto', 54),
  ('00212632', 'ABAT VENISE AVEC AMORT CS SANIMED', 'Sanimed - Abattant Venise avec amorti', 147.059, 0, 'sanimed', 'Sanimed', 'abattants-wc-sanimed', 'Abattants WC Sanimed', NULL, NULL, true, false, 'Venise', 55),
  ('00000975', 'ABAT WC HANDICAP REF C1800 SANIMED', 'Sanimed - Abattant WC Handicap ref C1800', 124.000, 1, 'sanimed', 'Sanimed', 'abattants-wc-sanimed', 'Abattants WC Sanimed', NULL, NULL, false, false, 'WC Handicap C1800', 56),
  ('00002985', 'ABAT ZENTRUM AVEC AMORT REF 94-003-009 VITRA', 'Vitra - Abattant Zentrum avec amorti ref 94-003-009', 179.000, 0, 'vitra', 'Vitra', 'abattants-wc-vitra', 'Abattants WC Vitra', NULL, NULL, true, false, 'Zentrum 94-003-009', 57),
  ('00233033', 'ABAT.DUROPLAST EMERAUDE', 'Abattant Duroplast emeraude', 95.000, 4, NULL, NULL, NULL, NULL, 'Emeraude', 'Duroplast', false, false, 'Emeraude', 58),
  ('00219952', 'ABAT.THERMODUR AVEC AMORT EMERAUDE IDEAL SAN', 'Ideal San - Abattant Thermodur emeraude avec amorti', 128.000, 10, 'ideal-san', 'Ideal San', 'abattants-wc-ideal-san', 'Abattants WC Ideal San', 'Emeraude', 'Thermodur', true, false, 'Emeraude', 59),
  ('00000977', 'ABAT.THERMODUR AVEC AMORT ONYX IDEAL SAN', 'Ideal San - Abattant Thermodur Onyx avec amorti', 94.300, 0, 'ideal-san', 'Ideal San', 'abattants-wc-ideal-san', 'Abattants WC Ideal San', 'Onyx', 'Thermodur', true, false, 'Onyx', 60),
  ('00201919', 'ABAT.THERMODUR CORAIL/SAPHIR /FLORA', 'Abattant Thermodur Corail / Saphir / Flora', 68.000, 1, NULL, NULL, NULL, NULL, 'Corail / Saphir', 'Thermodur', false, false, 'Corail / Saphir / Flora', 61),
  ('00000978', 'ABAT.THERMODUR ECO+ SAPHIR IDEAL SAN', 'Ideal San - Abattant Thermodur Eco+ Saphir', 29.300, 0, 'ideal-san', 'Ideal San', 'abattants-wc-ideal-san', 'Abattants WC Ideal San', 'Saphir', 'Thermodur', false, false, 'Eco+ Saphir', 62);

INSERT INTO "organizations" (
  "slug", "name", "description", "is_product_brand", "is_reference", "is_partner", "created_at", "updated_at"
)
SELECT DISTINCT
  "brand_slug",
  "brand_name",
  NULL,
  true,
  false,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_seed_abattant_wc"
WHERE "brand_slug" IS NOT NULL
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "is_product_brand" = true,
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_colors" ("key", "label", "value", "created_at", "updated_at")
VALUES
  ('grege', 'Grege', '#B8AA98', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('emeraude', 'Emeraude', '#08715F', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('onyx', 'Onyx', '#1B1B1B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('saphir', 'Saphir', '#1C4C96', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('azur', 'Azur', '#4D9DCE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('corail', 'Corail', '#D36D5C', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "value" = EXCLUDED."value",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES
  ('abs', 'ABS', '#F5F5F5', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('thermodur', 'Thermodur', '#F7F7F4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('duroplast', 'Duroplast', '#F1F1EF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plastique', 'Plastique', '#F4F4F2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "color" = EXCLUDED."color",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_subcategories" (
  "category_id", "name", "subtitle", "slug", "description", "description_seo",
  "sort_order", "is_active", "visible_ecommerce", "visible_vitrine", "created_at", "updated_at"
)
SELECT
  "category"."id",
  'Abattants WC',
  'Lunettes et abattants pour cuvettes WC',
  'abattants-wc',
  'Abattants et lunettes WC pour salles de bain et espaces sanitaires.',
  'Abattants WC : lunettes, fermetures amorties et modeles compatibles chez COBAM GROUP.',
  35,
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
  7,
  "subcategory"."id"
FROM "product_subcategories" "subcategory"
JOIN "product_types" "category"
  ON "category"."id" = "subcategory"."category_id"
WHERE "category"."slug" = 'salle-de-bain-et-cuisine'
  AND "subcategory"."slug" = 'abattants-wc'
ON CONFLICT ("product_type_id", "subcategory_id") DO NOTHING;

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo", "created_at", "updated_at"
)
SELECT DISTINCT
  "family_slug",
  "family_name",
  "brand_name",
  "family_name" || ' : selection d''abattants WC avec compatibilites, finitions et options de fermeture adaptees aux espaces sanitaires.',
  left("family_name" || ' : abattants WC et lunettes compatibles disponibles chez COBAM GROUP.', 160),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_seed_abattant_wc"
WHERE "family_slug" IS NOT NULL
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "updated_at" = CURRENT_TIMESTAMP;

WITH "enriched" AS (
  SELECT
    "seeded".*,
    "organization"."id" AS "brand_id",
    regexp_replace(
      lower(
        regexp_replace(
          'abattant-wc-' || "seeded"."display_name" || '-' || "seeded"."sku",
          '[^a-zA-Z0-9]+',
          '-',
          'g'
        )
      ),
      '(^-+|-+$)',
      '',
      'g'
    ) AS "slug"
  FROM "_seed_abattant_wc" "seeded"
  LEFT JOIN "organizations" "organization"
    ON "organization"."slug" = "seeded"."brand_slug"
)
INSERT INTO "products" (
  "sku", "slug", "kind", "brand_id", "product_type_id", "name", "display_name",
  "rich_text_description", "title_seo", "description_seo", "tags",
  "guarantee_months", "visible_ecommerce", "visible_vitrine", "is_featured", "is_new",
  "stock_available", "stock_alert_threshold", "stock_unit", "stock_availability", "stock_visibility",
  "base_price_ttc_tnd", "current_price_ttc_tnd", "vat_rate", "price_visibility",
  "created_at", "updated_at"
)
SELECT
  "enriched"."sku",
  "enriched"."slug",
  CASE
    WHEN "enriched"."family_slug" IS NULL THEN 'SINGLE'::"ProductKind"
    ELSE 'VARIANT'::"ProductKind"
  END,
  "enriched"."brand_id",
  7,
  left("enriched"."name", 255),
  left("enriched"."display_name", 255),
  jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'heading',
        'attrs', jsonb_build_object('level', 2),
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "enriched"."display_name"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "enriched"."display_name" || ' est un abattant WC pour salle de bain et espace sanitaire.'))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'SKU : ' || "enriched"."sku" || ' | Type : Abattant WC | Stock : ' || "enriched"."stock_available"::TEXT || ' piece(s).'))
      )
    )
  ),
  left("enriched"."display_name" || ' | COBAM GROUP', 60),
  left("enriched"."display_name" || ' : abattant WC disponible chez COBAM GROUP.', 160),
  trim('abattant-wc lunette-wc sanitaire toilette ' || COALESCE("enriched"."brand_slug", '')),
  0,
  true,
  true,
  false,
  false,
  "enriched"."stock_available",
  0,
  'PIECE'::"StockUnit",
  CASE
    WHEN "enriched"."stock_available" > 0 THEN 'IN_STOCK'::"ProductAvailability"
    ELSE 'OUT_OF_STOCK'::"ProductAvailability"
  END,
  'AUTO'::"ProductInventoryVisibility",
  "enriched"."price_ttc",
  "enriched"."price_ttc",
  19.000,
  'AUTO'::"ProductPricingVisibility",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "enriched"
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
USING "products" "product", "_seed_abattant_wc" "seeded"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "seeded"."sku";

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  "seeded"."sort_order"
FROM "_seed_abattant_wc" "seeded"
JOIN "products" "product"
  ON "product"."sku" = "seeded"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = "seeded"."family_slug"
WHERE "seeded"."family_slug" IS NOT NULL
ON CONFLICT ("family_id", "product_id") DO UPDATE SET
  "sort_order" = EXCLUDED."sort_order";

WITH "ranked_defaults" AS (
  SELECT
    "seeded"."family_slug",
    "product"."id" AS "product_id",
    row_number() OVER (
      PARTITION BY "seeded"."family_slug"
      ORDER BY "seeded"."stock_available" DESC, "seeded"."sort_order" ASC
    ) AS "rank"
  FROM "_seed_abattant_wc" "seeded"
  JOIN "products" "product"
    ON "product"."sku" = "seeded"."sku"
  WHERE "seeded"."family_slug" IS NOT NULL
)
UPDATE "product_families" "family"
SET
  "default_product_id" = "ranked_defaults"."product_id",
  "updated_at" = CURRENT_TIMESTAMP
FROM "ranked_defaults"
WHERE "family"."slug" = "ranked_defaults"."family_slug"
  AND "ranked_defaults"."rank" = 1;

INSERT INTO "product_subcategory_links" ("product_id", "subcategory_id")
SELECT
  "product"."id",
  "subcategory"."id"
FROM "_seed_abattant_wc" "seeded"
JOIN "products" "product"
  ON "product"."sku" = "seeded"."sku"
JOIN "product_types" "category"
  ON "category"."slug" = 'salle-de-bain-et-cuisine'
JOIN "product_subcategories" "subcategory"
  ON "subcategory"."category_id" = "category"."id"
  AND "subcategory"."slug" = 'abattants-wc'
ON CONFLICT ("product_id", "subcategory_id") DO NOTHING;

DELETE FROM "product_attributes" "attribute"
USING "products" "product", "_seed_abattant_wc" "seeded"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = "seeded"."sku"
  AND "attribute"."name" IN ('color', 'finish', 'soft_close', 'slim_seat', 'compatibility_notes');

WITH "attribute_values" AS (
  SELECT "product"."id" AS "product_id", 'color' AS "name", "seeded"."color_value" AS "value"
  FROM "_seed_abattant_wc" "seeded"
  JOIN "products" "product" ON "product"."sku" = "seeded"."sku"
  WHERE "seeded"."color_value" IS NOT NULL

  UNION ALL

  SELECT "product"."id" AS "product_id", 'finish' AS "name", "seeded"."finish_value" AS "value"
  FROM "_seed_abattant_wc" "seeded"
  JOIN "products" "product" ON "product"."sku" = "seeded"."sku"
  WHERE "seeded"."finish_value" IS NOT NULL

  UNION ALL

  SELECT "product"."id" AS "product_id", 'soft_close' AS "name", "seeded"."soft_close"::TEXT AS "value"
  FROM "_seed_abattant_wc" "seeded"
  JOIN "products" "product" ON "product"."sku" = "seeded"."sku"

  UNION ALL

  SELECT "product"."id" AS "product_id", 'slim_seat' AS "name", "seeded"."slim_seat"::TEXT AS "value"
  FROM "_seed_abattant_wc" "seeded"
  JOIN "products" "product" ON "product"."sku" = "seeded"."sku"

  UNION ALL

  SELECT "product"."id" AS "product_id", 'compatibility_notes' AS "name", "seeded"."compatibility_notes" AS "value"
  FROM "_seed_abattant_wc" "seeded"
  JOIN "products" "product" ON "product"."sku" = "seeded"."sku"
  WHERE "seeded"."compatibility_notes" IS NOT NULL
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
  "attribute_values"."value",
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
  ON "template_attribute"."product_type_id" = 7
  AND "template_attribute"."attribute_definition_id" = "definition"."id"
LEFT JOIN "product_attribute_groups" "attribute_group"
  ON "attribute_group"."id" = "template_attribute"."attribute_group_id";

DROP TABLE "_seed_abattant_wc";
