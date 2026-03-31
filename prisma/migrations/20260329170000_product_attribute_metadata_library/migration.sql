CREATE TABLE "public"."product_attribute_metadata" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "data_type" "public"."ProductAttributeDataType" NOT NULL,
    "unit" VARCHAR(50) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_attribute_metadata_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_attribute_metadata_name_data_type_unit_key"
ON "public"."product_attribute_metadata"("name", "data_type", "unit");

CREATE INDEX "product_attribute_metadata_name_idx"
ON "public"."product_attribute_metadata"("name");

CREATE INDEX "product_attribute_metadata_data_type_idx"
ON "public"."product_attribute_metadata"("data_type");

INSERT INTO "public"."product_attribute_metadata" (
    "name",
    "data_type",
    "unit",
    "created_at",
    "updated_at"
)
SELECT DISTINCT
    "name",
    "data_type",
    COALESCE("unit", ''),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "public"."product_attribute_definitions"
WHERE TRIM("name") <> ''
ON CONFLICT ("name", "data_type", "unit") DO NOTHING;
