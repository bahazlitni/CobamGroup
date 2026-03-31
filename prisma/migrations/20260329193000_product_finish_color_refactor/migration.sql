-- Normalise legacy attribute data types before shrinking the enum.
UPDATE "product_attribute_definitions"
SET "data_type" = 'TEXT'
WHERE "data_type" IN ('ENUM', 'COLOR', 'JSON');

UPDATE "product_attribute_metadata"
SET "data_type" = 'TEXT'
WHERE "data_type" IN ('ENUM', 'COLOR', 'JSON');

-- Replace the enum with the reduced set.
CREATE TYPE "ProductAttributeDataType_new" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN');

ALTER TABLE "product_attribute_definitions"
ALTER COLUMN "data_type" TYPE "ProductAttributeDataType_new"
USING ("data_type"::text::"ProductAttributeDataType_new");

ALTER TABLE "product_attribute_metadata"
ALTER COLUMN "data_type" TYPE "ProductAttributeDataType_new"
USING ("data_type"::text::"ProductAttributeDataType_new");

ALTER TYPE "ProductAttributeDataType" RENAME TO "ProductAttributeDataType_old";
ALTER TYPE "ProductAttributeDataType_new" RENAME TO "ProductAttributeDataType";
DROP TYPE "ProductAttributeDataType_old";

-- Drop the old generic values table.
DROP TABLE IF EXISTS "product_attribute_metadata_values";

-- Create the dedicated autocomplete libraries.
CREATE TABLE "product_finishes" (
  "id" BIGSERIAL NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "color_hex" VARCHAR(30) NOT NULL,
  "media_id" BIGINT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_finishes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_colors" (
  "id" BIGSERIAL NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "hex_value" VARCHAR(30) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_colors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_finishes_name_key" ON "product_finishes"("name");
CREATE INDEX "product_finishes_media_id_idx" ON "product_finishes"("media_id");
CREATE INDEX "product_finishes_name_idx" ON "product_finishes"("name");

CREATE UNIQUE INDEX "product_colors_name_key" ON "product_colors"("name");
CREATE UNIQUE INDEX "product_colors_hex_value_key" ON "product_colors"("hex_value");
CREATE INDEX "product_colors_name_idx" ON "product_colors"("name");
CREATE INDEX "product_colors_hex_value_idx" ON "product_colors"("hex_value");

ALTER TABLE "product_finishes"
ADD CONSTRAINT "product_finishes_media_id_fkey"
FOREIGN KEY ("media_id") REFERENCES "media"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
