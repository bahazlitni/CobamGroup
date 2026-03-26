ALTER TABLE "profiles"
  ADD COLUMN IF NOT EXISTS "avatar_media_id" BIGINT;

ALTER TABLE "product_brands"
  ADD COLUMN IF NOT EXISTS "logo_media_id" BIGINT;

ALTER TABLE "product_types"
  ADD COLUMN IF NOT EXISTS "image_media_id" BIGINT;

CREATE INDEX IF NOT EXISTS "profiles_avatar_media_id_idx"
  ON "profiles"("avatar_media_id");

CREATE INDEX IF NOT EXISTS "product_brands_logo_media_id_idx"
  ON "product_brands"("logo_media_id");

CREATE INDEX IF NOT EXISTS "product_types_image_media_id_idx"
  ON "product_types"("image_media_id");

DO $$
BEGIN
  ALTER TABLE "profiles"
    ADD CONSTRAINT "profiles_avatar_media_id_fkey"
    FOREIGN KEY ("avatar_media_id") REFERENCES "media"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "product_brands"
    ADD CONSTRAINT "product_brands_logo_media_id_fkey"
    FOREIGN KEY ("logo_media_id") REFERENCES "media"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "product_types"
    ADD CONSTRAINT "product_types_image_media_id_fkey"
    FOREIGN KEY ("image_media_id") REFERENCES "media"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
