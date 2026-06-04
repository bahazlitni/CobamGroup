-- Attach the uploaded Carrojoint technical sheets to the explicitly listed products.
-- One listed product, CARROJOINT BEIGE FC 5KG TURQUA, is intentionally skipped because
-- none of the provided datasheets match that line.

CREATE TEMP TABLE "_carrojoint_datasheet_expected_media" (
  "media_id" BIGINT PRIMARY KEY,
  "expected_filename" TEXT NOT NULL,
  "label" TEXT NOT NULL
);

INSERT INTO "_carrojoint_datasheet_expected_media" ("media_id", "expected_filename", "label")
VALUES
  (1003, 'Carrojoint Intense Deutsch Color (FICHE TECHNIQUE).pdf', 'Fiche technique Carrojoint Intense Deutsch Color'),
  (1004, 'Carrojoint Sika (FICHE TECHNIQUE).pdf', 'Fiche technique Carrojoint Sika'),
  (1005, 'Carrojoint VitraFix (FICHE TECHNIQUE).pdf', 'Fiche technique Carrojoint VitraFix'),
  (1006, 'Carrojoint Deutsch Color (FICHE TECHNIQUE).pdf', 'Fiche technique Carrojoint Deutsch Color'),
  (1007, 'Carrojoint Derbigum (FICHE TECHNIQUE).pdf', 'Fiche technique Carrojoint Derbigum');

CREATE TEMP TABLE "_carrojoint_datasheet_targets" (
  "sku" TEXT PRIMARY KEY,
  "media_id" BIGINT NOT NULL REFERENCES "_carrojoint_datasheet_expected_media" ("media_id")
);

INSERT INTO "_carrojoint_datasheet_targets" ("sku", "media_id")
VALUES
  ('00221993', 1003),
  ('00224086', 1003),
  ('00224796', 1003),
  ('00225137', 1003),
  ('00225526', 1003),
  ('00225533', 1003),
  ('00225557', 1003),
  ('00227872', 1003),
  ('00231589', 1003),
  ('00232395', 1003),
  ('00235150', 1003),
  ('00235440', 1003),
  ('00237291', 1003),
  ('00237581', 1003),
  ('00242332', 1003),
  ('00242356', 1003),
  ('00246699', 1003),
  ('00248587', 1003),
  ('00249058', 1003),
  ('00249065', 1003),
  ('00227933', 1004),
  ('00227940', 1004),
  ('00227957', 1004),
  ('00227964', 1004),
  ('00227971', 1004),
  ('00227988', 1004),
  ('00227995', 1004),
  ('00228008', 1004),
  ('00228015', 1004),
  ('00228022', 1004),
  ('00228039', 1004),
  ('00228046', 1004),
  ('00228053', 1004),
  ('00228060', 1004),
  ('00228077', 1004),
  ('00228084', 1004),
  ('00228091', 1004),
  ('00228107', 1004),
  ('00228114', 1004),
  ('00228121', 1004),
  ('00228138', 1004),
  ('00228145', 1004),
  ('00228152', 1004),
  ('00229210', 1004),
  ('00238533', 1004),
  ('00000272', 1005),
  ('00000273', 1005),
  ('00000275', 1005),
  ('00000276', 1005),
  ('00177931', 1005),
  ('00179010', 1005),
  ('00179027', 1005),
  ('00181068', 1005),
  ('00181228', 1005),
  ('00182430', 1005),
  ('00190886', 1005),
  ('00191838', 1005),
  ('00201544', 1006),
  ('00201551', 1006),
  ('00202503', 1006),
  ('00202510', 1006),
  ('00202527', 1006),
  ('00202534', 1006),
  ('00205528', 1006),
  ('00206495', 1006),
  ('00206501', 1006),
  ('00207812', 1006),
  ('00207829', 1006),
  ('00207836', 1006),
  ('00208390', 1006),
  ('00208406', 1006),
  ('00209755', 1006),
  ('00209977', 1006),
  ('00212489', 1006),
  ('00212496', 1006),
  ('00212502', 1006),
  ('00221559', 1006),
  ('00221566', 1006),
  ('00221573', 1006),
  ('00223614', 1006),
  ('00223669', 1006),
  ('00224338', 1006),
  ('00224772', 1006),
  ('00224789', 1006),
  ('00224802', 1006),
  ('00226042', 1006),
  ('00226530', 1006),
  ('00226967', 1006),
  ('00226974', 1006),
  ('00230810', 1006),
  ('00231985', 1006),
  ('00232173', 1006),
  ('00232555', 1006),
  ('00242011', 1006),
  ('00193733', 1007),
  ('00195041', 1007),
  ('00199261', 1007);

DO $$
DECLARE
  missing_media_count INTEGER;
  missing_product_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO missing_media_count
  FROM "_carrojoint_datasheet_expected_media" "expected"
  LEFT JOIN "media" "media"
    ON "media"."id" = "expected"."media_id"
    AND "media"."original_filename" = "expected"."expected_filename"
    AND "media"."kind" = 'DOCUMENT'::"MediaKind"
    AND "media"."deleted_at" IS NULL
  WHERE "media"."id" IS NULL;

  IF missing_media_count > 0 THEN
    RAISE EXCEPTION 'Cannot attach Carrojoint datasheets: % expected media row(s) are missing or mismatched.', missing_media_count;
  END IF;

  SELECT COUNT(*)
  INTO missing_product_count
  FROM "_carrojoint_datasheet_targets" "target"
  LEFT JOIN "products" "product"
    ON "product"."sku" = "target"."sku"
  WHERE "product"."id" IS NULL;

  IF missing_product_count > 0 THEN
    RAISE EXCEPTION 'Cannot attach Carrojoint datasheets: % target product SKU(s) are missing.', missing_product_count;
  END IF;
END $$;

INSERT INTO "product_media" (
  "product_id", "media_id", "role", "name", "alt_text", "sort_order", "created_at", "updated_at"
)
SELECT
  "product"."id",
  "target"."media_id",
  'TECHNICAL'::"ProductMediaRole",
  left("expected"."label", 255),
  left("product"."display_name" || ' - ' || "expected"."label", 255),
  20,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_carrojoint_datasheet_targets" "target"
JOIN "_carrojoint_datasheet_expected_media" "expected"
  ON "expected"."media_id" = "target"."media_id"
JOIN "products" "product"
  ON "product"."sku" = "target"."sku"
ON CONFLICT ("product_id", "media_id") DO UPDATE SET
  "role" = EXCLUDED."role",
  "name" = EXCLUDED."name",
  "alt_text" = EXCLUDED."alt_text",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = CURRENT_TIMESTAMP;
