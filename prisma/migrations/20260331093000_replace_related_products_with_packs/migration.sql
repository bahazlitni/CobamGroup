DROP TABLE IF EXISTS "public"."product_family_related_product_links";

CREATE TABLE "public"."product_packs" (
  "id" BIGSERIAL NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "subtitle" VARCHAR(255),
  "description" TEXT,
  "description_seo" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_packs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_packs_slug_key" ON "public"."product_packs"("slug");
CREATE INDEX "product_packs_name_idx" ON "public"."product_packs"("name");

CREATE TABLE "public"."product_pack_lines" (
  "pack_id" BIGINT NOT NULL,
  "product_variant_id" BIGINT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "sort_order" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "product_pack_lines_pkey" PRIMARY KEY ("pack_id","product_variant_id")
);

CREATE INDEX "product_pack_lines_product_variant_id_idx"
ON "public"."product_pack_lines"("product_variant_id");

CREATE TABLE "public"."product_pack_media_links" (
  "pack_id" BIGINT NOT NULL,
  "media_id" BIGINT NOT NULL,
  "role" "public"."MediaLinkRole" NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "product_pack_media_links_pkey" PRIMARY KEY ("pack_id","media_id","role")
);

CREATE INDEX "product_pack_media_links_media_id_idx"
ON "public"."product_pack_media_links"("media_id");

ALTER TABLE "public"."product_pack_lines"
ADD CONSTRAINT "product_pack_lines_pack_id_fkey"
FOREIGN KEY ("pack_id") REFERENCES "public"."product_packs"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."product_pack_lines"
ADD CONSTRAINT "product_pack_lines_product_variant_id_fkey"
FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."product_pack_media_links"
ADD CONSTRAINT "product_pack_media_links_pack_id_fkey"
FOREIGN KEY ("pack_id") REFERENCES "public"."product_packs"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."product_pack_media_links"
ADD CONSTRAINT "product_pack_media_links_media_id_fkey"
FOREIGN KEY ("media_id") REFERENCES "public"."media"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
