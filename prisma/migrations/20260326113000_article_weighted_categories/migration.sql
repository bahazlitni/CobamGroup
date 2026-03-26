CREATE TABLE "public"."article_category_links" (
  "article_id" BIGINT NOT NULL,
  "category_id" BIGINT NOT NULL,
  "score" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "article_category_links_pkey" PRIMARY KEY ("article_id", "category_id")
);

CREATE INDEX "article_category_links_category_id_idx"
  ON "public"."article_category_links"("category_id");

ALTER TABLE "public"."article_category_links"
  ADD CONSTRAINT "article_category_links_article_id_fkey"
  FOREIGN KEY ("article_id")
  REFERENCES "public"."articles"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "public"."article_category_links"
  ADD CONSTRAINT "article_category_links_category_id_fkey"
  FOREIGN KEY ("category_id")
  REFERENCES "public"."article_categories"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

INSERT INTO "public"."article_category_links" ("article_id", "category_id", "score", "created_at")
SELECT "id", "category_id", 100, CURRENT_TIMESTAMP
FROM "public"."articles"
WHERE "category_id" IS NOT NULL
ON CONFLICT ("article_id", "category_id") DO NOTHING;

ALTER TABLE "public"."articles"
  DROP COLUMN "category_id";
