ALTER TABLE "articles"
  ADD COLUMN "scheduled_publish_at" TIMESTAMP(3),
  ADD COLUMN "scheduled_by_user_id" VARCHAR(191);

CREATE INDEX "articles_status_scheduled_publish_at_idx"
  ON "articles"("status", "scheduled_publish_at");

CREATE INDEX "articles_scheduled_by_user_id_idx"
  ON "articles"("scheduled_by_user_id");
