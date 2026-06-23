-- Store permanent redirects when a product family is dissolved into standalone products.

CREATE TABLE IF NOT EXISTS "product_family_redirects" (
  "id" BIGSERIAL PRIMARY KEY,
  "family_id" BIGINT NOT NULL,
  "family_slug" VARCHAR(255) NOT NULL,
  "source_category_slug" VARCHAR(255),
  "source_subcategory_slug" VARCHAR(255),
  "source_path" VARCHAR(500) NOT NULL,
  "default_variant_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "product_family_redirects_default_variant_id_fkey"
    FOREIGN KEY ("default_variant_id")
    REFERENCES "products"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_family_redirects_family_id_key"
  ON "product_family_redirects"("family_id");

CREATE UNIQUE INDEX IF NOT EXISTS "product_family_redirects_source_path_key"
  ON "product_family_redirects"("source_path");

CREATE INDEX IF NOT EXISTS "product_family_redirects_family_slug_idx"
  ON "product_family_redirects"("family_slug");

CREATE INDEX IF NOT EXISTS "product_family_redirects_default_variant_id_idx"
  ON "product_family_redirects"("default_variant_id");
