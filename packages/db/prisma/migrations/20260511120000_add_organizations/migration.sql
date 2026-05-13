CREATE TABLE "organizations" (
  "id" BIGSERIAL PRIMARY KEY,
  "slug" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "display_name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "logo_media_id" BIGINT,
  "is_product_brand" BOOLEAN NOT NULL DEFAULT false,
  "is_reference" BOOLEAN NOT NULL DEFAULT false,
  "is_partner" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE INDEX "organizations_logo_media_id_idx" ON "organizations"("logo_media_id");

ALTER TABLE "organizations"
  ADD CONSTRAINT "organizations_logo_media_id_fkey"
  FOREIGN KEY ("logo_media_id") REFERENCES "media"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "products"
  ADD COLUMN "organization_id" BIGINT;

CREATE INDEX "products_organization_id_idx" ON "products"("organization_id");

ALTER TABLE "products"
  ADD CONSTRAINT "products_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
