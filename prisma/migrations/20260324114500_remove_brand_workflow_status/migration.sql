ALTER TABLE "product_brands"
  DROP COLUMN IF EXISTS "status",
  DROP COLUMN IF EXISTS "published_at",
  DROP COLUMN IF EXISTS "published_by_user_id",
  DROP COLUMN IF EXISTS "archived_at",
  DROP COLUMN IF EXISTS "archived_by_user_id";
