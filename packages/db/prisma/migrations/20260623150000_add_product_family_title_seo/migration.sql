ALTER TABLE "product_families"
  ADD COLUMN "title_seo" VARCHAR(60);

UPDATE "product_families"
SET "title_seo" = LEFT(
  COALESCE(NULLIF(BTRIM("name"), ''), NULLIF(BTRIM("slug"), ''), 'Famille produit'),
  60
)
WHERE "title_seo" IS NULL OR BTRIM("title_seo") = '';

ALTER TABLE "product_families"
  ALTER COLUMN "title_seo" SET NOT NULL;

ALTER TABLE "product_families"
  ADD CONSTRAINT "product_families_title_seo_not_blank"
  CHECK (LENGTH(BTRIM("title_seo")) > 0);
