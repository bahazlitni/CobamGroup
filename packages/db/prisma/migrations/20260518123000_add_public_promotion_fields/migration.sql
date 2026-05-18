ALTER TABLE "commerce_promotions"
  ADD COLUMN "display_name" VARCHAR(255),
  ADD COLUMN "slug" VARCHAR(255),
  ADD COLUMN "description" TEXT,
  ADD COLUMN "banner_media_id" BIGINT;

UPDATE "commerce_promotions"
SET
  "display_name" = COALESCE(NULLIF(TRIM("name"), ''), 'Promotion ' || "id"::text),
  "slug" = CONCAT(
    COALESCE(
      NULLIF(
        TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(COALESCE(NULLIF(TRIM("name"), ''), 'promotion')), '[^a-z0-9]+', '-', 'g')),
        ''
      ),
      'promotion'
    ),
    '-',
    "id"::text
  )
WHERE "display_name" IS NULL OR "slug" IS NULL;

ALTER TABLE "commerce_promotions"
  ALTER COLUMN "display_name" SET NOT NULL,
  ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "commerce_promotions_slug_key" ON "commerce_promotions"("slug");
CREATE INDEX "commerce_promotions_banner_media_id_idx" ON "commerce_promotions"("banner_media_id");

ALTER TABLE "commerce_promotions"
  ADD CONSTRAINT "commerce_promotions_banner_media_id_fkey"
  FOREIGN KEY ("banner_media_id") REFERENCES "media"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
