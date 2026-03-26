ALTER TABLE "public"."article_categories"
  ADD COLUMN "color" VARCHAR(30) NOT NULL DEFAULT '#0a8dc1',
  ADD COLUMN "created_by_user_id" TEXT,
  ADD COLUMN "updated_by_user_id" TEXT;

CREATE INDEX "article_categories_created_by_user_id_idx"
  ON "public"."article_categories"("created_by_user_id");

CREATE INDEX "article_categories_updated_by_user_id_idx"
  ON "public"."article_categories"("updated_by_user_id");

ALTER TABLE "public"."article_categories"
  ADD CONSTRAINT "article_categories_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id")
  REFERENCES "public"."users"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "public"."article_categories"
  ADD CONSTRAINT "article_categories_updated_by_user_id_fkey"
  FOREIGN KEY ("updated_by_user_id")
  REFERENCES "public"."users"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
