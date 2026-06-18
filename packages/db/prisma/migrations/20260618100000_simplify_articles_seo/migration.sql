-- Simplify articles for the internal COBAM Group blog while preserving old link data.
-- Old link tables are renamed to *_legacy so their rows remain inspectable after the app
-- switches to direct article ownership/category fields.

ALTER TABLE "articles"
  ADD COLUMN IF NOT EXISTS "created_by_user_id" TEXT,
  ADD COLUMN IF NOT EXISTS "title_seo" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "focus_keyword" VARCHAR(160),
  ADD COLUMN IF NOT EXISTS "category_id" BIGINT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'articles'
      AND column_name = 'author_id'
  ) THEN
    EXECUTE 'UPDATE "articles"
      SET "created_by_user_id" = "author_id"
      WHERE "created_by_user_id" IS NULL';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'articles'
      AND column_name = 'display_title'
  ) THEN
    EXECUTE 'UPDATE "articles"
      SET "title" = COALESCE(NULLIF(BTRIM("display_title"), ''''), "title")
      WHERE "display_title" IS NOT NULL';
  END IF;
END $$;

UPDATE "articles"
SET "title_seo" = LEFT("title", 255)
WHERE "title_seo" IS NULL;

DO $$
BEGIN
  IF to_regclass('public.article_category_links') IS NOT NULL THEN
    WITH ranked_categories AS (
      SELECT
        "article_id",
        "category_id",
        ROW_NUMBER() OVER (
          PARTITION BY "article_id"
          ORDER BY "score" DESC, "created_at" ASC, "category_id" ASC
        ) AS "rank"
      FROM "article_category_links"
    )
    UPDATE "articles" AS "article"
    SET "category_id" = "ranked_categories"."category_id"
    FROM "ranked_categories"
    WHERE "article"."id" = "ranked_categories"."article_id"
      AND "ranked_categories"."rank" = 1
      AND "article"."category_id" IS NULL;
  END IF;
END $$;

UPDATE "articles"
SET "created_by_user_id" = NULL
WHERE "created_by_user_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "users" WHERE "users"."id" = "articles"."created_by_user_id"
  );

UPDATE "articles"
SET "updated_by_user_id" = NULL
WHERE "updated_by_user_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "users" WHERE "users"."id" = "articles"."updated_by_user_id"
  );

UPDATE "articles"
SET "published_by_user_id" = NULL
WHERE "published_by_user_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "users" WHERE "users"."id" = "articles"."published_by_user_id"
  );

UPDATE "articles"
SET "category_id" = NULL
WHERE "category_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "article_categories" WHERE "article_categories"."id" = "articles"."category_id"
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'articles'
      AND column_name = 'deleted_at'
  ) THEN
    EXECUTE 'UPDATE "articles"
      SET "status" = ''ARCHIVED''
      WHERE "deleted_at" IS NOT NULL';
  END IF;
END $$;

-- Existing articles must pass the new SEO validation before being published again.
-- Slugs are intentionally left untouched to preserve already indexed URLs.
UPDATE "articles"
SET "status" = 'DRAFT',
    "scheduled_publish_at" = NULL;

ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_author_id_fkey";
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_created_by_user_id_fkey";
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_updated_by_user_id_fkey";
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_published_by_user_id_fkey";
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_category_id_fkey";

DROP INDEX IF EXISTS "articles_author_id_idx";
DROP INDEX IF EXISTS "articles_scheduled_by_user_id_idx";
DROP INDEX IF EXISTS "articles_deleted_at_idx";

ALTER TABLE "articles"
  DROP COLUMN IF EXISTS "author_id",
  DROP COLUMN IF EXISTS "archived_by_user_id",
  DROP COLUMN IF EXISTS "deleted_by_user_id",
  DROP COLUMN IF EXISTS "deleted_at",
  DROP COLUMN IF EXISTS "display_title",
  DROP COLUMN IF EXISTS "scheduled_by_user_id",
  DROP COLUMN IF EXISTS "no_follow",
  DROP COLUMN IF EXISTS "schema_type";

ALTER TABLE "articles"
  ADD CONSTRAINT "articles_created_by_user_id_fkey"
    FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "articles_updated_by_user_id_fkey"
    FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "articles_published_by_user_id_fkey"
    FOREIGN KEY ("published_by_user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "articles_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "article_categories"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "articles_created_by_user_id_idx"
  ON "articles"("created_by_user_id");
CREATE INDEX IF NOT EXISTS "articles_updated_by_user_id_idx"
  ON "articles"("updated_by_user_id");
CREATE INDEX IF NOT EXISTS "articles_published_by_user_id_idx"
  ON "articles"("published_by_user_id");
CREATE INDEX IF NOT EXISTS "articles_category_id_idx"
  ON "articles"("category_id");
CREATE INDEX IF NOT EXISTS "articles_status_published_at_idx"
  ON "articles"("status", "published_at");

DO $$
BEGIN
  IF to_regclass('public.article_category_links') IS NOT NULL
    AND to_regclass('public.article_category_links_legacy') IS NULL THEN
    ALTER TABLE "article_category_links" DROP CONSTRAINT IF EXISTS "article_category_links_article_id_fkey";
    ALTER TABLE "article_category_links" DROP CONSTRAINT IF EXISTS "article_category_links_category_id_fkey";
    ALTER TABLE "article_category_links" RENAME TO "article_category_links_legacy";
  END IF;

  IF to_regclass('public.article_author_links') IS NOT NULL
    AND to_regclass('public.article_author_links_legacy') IS NULL THEN
    ALTER TABLE "article_author_links" DROP CONSTRAINT IF EXISTS "article_author_links_article_id_fkey";
    ALTER TABLE "article_author_links" DROP CONSTRAINT IF EXISTS "article_author_links_user_id_fkey";
    ALTER TABLE "article_author_links" RENAME TO "article_author_links_legacy";
  END IF;

  IF to_regclass('public.article_media_links') IS NOT NULL
    AND to_regclass('public.article_media_links_legacy') IS NULL THEN
    ALTER TABLE "article_media_links" DROP CONSTRAINT IF EXISTS "article_media_links_article_id_fkey";
    ALTER TABLE "article_media_links" DROP CONSTRAINT IF EXISTS "article_media_links_media_id_fkey";
    ALTER TABLE "article_media_links" RENAME TO "article_media_links_legacy";
  END IF;
END $$;
