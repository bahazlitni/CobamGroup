ALTER TABLE "product_type_templates"
  ADD COLUMN "title_seo" VARCHAR(60),
  ADD COLUMN "description_seo" VARCHAR(160),
  ADD COLUMN "media_image_id" BIGINT;

UPDATE "product_type_templates"
SET "title_seo" = LEFT(NULLIF(BTRIM("name"), ''), 60)
WHERE "title_seo" IS NULL;

UPDATE "product_type_templates"
SET "description_seo" = LEFT(
  NULLIF(
    regexp_replace(
      COALESCE(NULLIF(BTRIM("description"), ''), NULLIF(BTRIM("name"), '')),
      '\s+',
      ' ',
      'g'
    ),
    ''
  ),
  160
)
WHERE "description_seo" IS NULL;

CREATE INDEX "product_type_templates_media_image_id_idx"
  ON "product_type_templates"("media_image_id");

ALTER TABLE "product_type_templates"
  ADD CONSTRAINT "product_type_templates_media_image_id_fkey"
  FOREIGN KEY ("media_image_id") REFERENCES "media"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
