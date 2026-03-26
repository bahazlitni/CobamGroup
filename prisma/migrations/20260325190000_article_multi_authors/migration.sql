CREATE TABLE "public"."article_author_links" (
  "article_id" BIGINT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "article_author_links_pkey" PRIMARY KEY ("article_id", "user_id")
);

CREATE INDEX "article_author_links_user_id_idx"
  ON "public"."article_author_links"("user_id");

ALTER TABLE "public"."article_author_links"
  ADD CONSTRAINT "article_author_links_article_id_fkey"
  FOREIGN KEY ("article_id")
  REFERENCES "public"."articles"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "public"."article_author_links"
  ADD CONSTRAINT "article_author_links_user_id_fkey"
  FOREIGN KEY ("user_id")
  REFERENCES "public"."users"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
