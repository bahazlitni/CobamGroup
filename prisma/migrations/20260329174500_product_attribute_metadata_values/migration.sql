CREATE TABLE "public"."product_attribute_metadata_values" (
    "id" BIGSERIAL NOT NULL,
    "metadata_id" BIGINT NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_attribute_metadata_values_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_attribute_metadata_values_metadata_id_value_key"
ON "public"."product_attribute_metadata_values"("metadata_id", "value");

CREATE INDEX "product_attribute_metadata_values_metadata_id_idx"
ON "public"."product_attribute_metadata_values"("metadata_id");

CREATE INDEX "product_attribute_metadata_values_sort_order_idx"
ON "public"."product_attribute_metadata_values"("sort_order");

ALTER TABLE "public"."product_attribute_metadata_values"
ADD CONSTRAINT "product_attribute_metadata_values_metadata_id_fkey"
FOREIGN KEY ("metadata_id") REFERENCES "public"."product_attribute_metadata"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
