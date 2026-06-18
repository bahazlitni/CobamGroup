DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'ArticleSeoStatus'
  ) THEN
    CREATE TYPE "ArticleSeoStatus" AS ENUM ('SEO_READY', 'NEEDS_IMPROVEMENT', 'NOT_READY');
  END IF;
END $$;

ALTER TABLE "articles"
  ADD COLUMN IF NOT EXISTS "seo_status" "ArticleSeoStatus" NOT NULL DEFAULT 'NOT_READY',
  ADD COLUMN IF NOT EXISTS "seo_score" INTEGER NOT NULL DEFAULT 0;

-- Existing articles are intentionally reset for manual reverification.
UPDATE "articles"
SET "seo_status" = 'NOT_READY',
    "seo_score" = 0;

CREATE INDEX IF NOT EXISTS "articles_seo_status_idx"
  ON "articles"("seo_status");
