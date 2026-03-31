CREATE TABLE "public"."product_family_related_product_links" (
  "family_id" BIGINT NOT NULL,
  "related_family_id" BIGINT NOT NULL,

  CONSTRAINT "product_family_related_product_links_pkey" PRIMARY KEY ("family_id", "related_family_id"),
  CONSTRAINT "product_family_related_product_links_distinct_check" CHECK ("family_id" <> "related_family_id"),
  CONSTRAINT "product_family_related_product_links_order_check" CHECK ("family_id" < "related_family_id")
);

CREATE INDEX "product_family_related_product_links_related_family_id_idx"
ON "public"."product_family_related_product_links"("related_family_id");

ALTER TABLE "public"."product_family_related_product_links"
ADD CONSTRAINT "product_family_related_product_links_family_id_fkey"
FOREIGN KEY ("family_id") REFERENCES "public"."product_families"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."product_family_related_product_links"
ADD CONSTRAINT "product_family_related_product_links_related_family_id_fkey"
FOREIGN KEY ("related_family_id") REFERENCES "public"."product_families"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
