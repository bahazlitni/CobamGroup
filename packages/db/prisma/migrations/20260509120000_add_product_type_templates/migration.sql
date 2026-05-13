CREATE TYPE "ProductTypeAttributeInputType" AS ENUM (
  'TEXT',
  'NUMBER',
  'BOOLEAN',
  'SELECT',
  'COLOR',
  'FINISH'
);

CREATE TABLE "product_type_groups" (
  "id" BIGSERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "product_type_groups_slug_key" ON "product_type_groups"("slug");
CREATE INDEX "product_type_groups_sort_order_idx" ON "product_type_groups"("sort_order");
CREATE INDEX "product_type_groups_is_active_idx" ON "product_type_groups"("is_active");

CREATE TABLE "product_type_templates" (
  "id" BIGSERIAL PRIMARY KEY,
  "group_id" BIGINT,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "product_type_templates_slug_key" ON "product_type_templates"("slug");
CREATE INDEX "product_type_templates_group_id_idx" ON "product_type_templates"("group_id");
CREATE INDEX "product_type_templates_sort_order_idx" ON "product_type_templates"("sort_order");
CREATE INDEX "product_type_templates_is_active_idx" ON "product_type_templates"("is_active");

ALTER TABLE "product_type_templates"
  ADD CONSTRAINT "product_type_templates_group_id_fkey"
  FOREIGN KEY ("group_id") REFERENCES "product_type_groups"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "product_attribute_groups" (
  "id" BIGSERIAL PRIMARY KEY,
  "product_type_id" BIGINT,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "product_attribute_groups_product_type_id_slug_key"
  ON "product_attribute_groups"("product_type_id", "slug");
CREATE INDEX "product_attribute_groups_product_type_id_idx" ON "product_attribute_groups"("product_type_id");
CREATE INDEX "product_attribute_groups_sort_order_idx" ON "product_attribute_groups"("sort_order");

ALTER TABLE "product_attribute_groups"
  ADD CONSTRAINT "product_attribute_groups_product_type_id_fkey"
  FOREIGN KEY ("product_type_id") REFERENCES "product_type_templates"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "product_type_attributes" (
  "id" BIGSERIAL PRIMARY KEY,
  "product_type_id" BIGINT NOT NULL,
  "attribute_group_id" BIGINT,
  "name" VARCHAR(150) NOT NULL,
  "label" VARCHAR(255) NOT NULL DEFAULT '',
  "unit" VARCHAR(50),
  "input_type" "ProductTypeAttributeInputType" NOT NULL DEFAULT 'TEXT',
  "is_required" BOOLEAN NOT NULL DEFAULT false,
  "is_filterable" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "product_type_attributes_product_type_id_name_key"
  ON "product_type_attributes"("product_type_id", "name");
CREATE INDEX "product_type_attributes_product_type_id_idx" ON "product_type_attributes"("product_type_id");
CREATE INDEX "product_type_attributes_attribute_group_id_idx" ON "product_type_attributes"("attribute_group_id");
CREATE INDEX "product_type_attributes_sort_order_idx" ON "product_type_attributes"("sort_order");

ALTER TABLE "product_type_attributes"
  ADD CONSTRAINT "product_type_attributes_product_type_id_fkey"
  FOREIGN KEY ("product_type_id") REFERENCES "product_type_templates"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_type_attributes"
  ADD CONSTRAINT "product_type_attributes_attribute_group_id_fkey"
  FOREIGN KEY ("attribute_group_id") REFERENCES "product_attribute_groups"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "products"
  ADD COLUMN "product_type_id" BIGINT;

CREATE INDEX "products_product_type_id_idx" ON "products"("product_type_id");

ALTER TABLE "products"
  ADD CONSTRAINT "products_product_type_id_fkey"
  FOREIGN KEY ("product_type_id") REFERENCES "product_type_templates"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE IF EXISTS "product_attributes";

CREATE TABLE "product_attributes" (
  "id" BIGSERIAL PRIMARY KEY,
  "product_id" BIGINT NOT NULL,
  "attribute_def_id" BIGINT,
  "attribute_group_id" BIGINT,
  "name" VARCHAR(150) NOT NULL,
  "label" VARCHAR(255) NOT NULL DEFAULT '',
  "value" VARCHAR(255) NOT NULL,
  "unit" VARCHAR(50),
  "input_type" "ProductTypeAttributeInputType" NOT NULL DEFAULT 'TEXT',
  "is_required" BOOLEAN NOT NULL DEFAULT false,
  "is_filterable" BOOLEAN NOT NULL DEFAULT false,
  "group_name" VARCHAR(255),
  "group_sort_order" INTEGER NOT NULL DEFAULT 0,
  "sort_order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX "product_attributes_product_id_idx" ON "product_attributes"("product_id");
CREATE INDEX "product_attributes_attribute_def_id_idx" ON "product_attributes"("attribute_def_id");
CREATE INDEX "product_attributes_attribute_group_id_idx" ON "product_attributes"("attribute_group_id");
CREATE INDEX "product_attributes_group_sort_order_idx" ON "product_attributes"("group_sort_order");
CREATE INDEX "product_attributes_sort_order_idx" ON "product_attributes"("sort_order");

ALTER TABLE "product_attributes"
  ADD CONSTRAINT "product_attributes_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_attributes"
  ADD CONSTRAINT "product_attributes_attribute_def_id_fkey"
  FOREIGN KEY ("attribute_def_id") REFERENCES "product_type_attributes"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product_attributes"
  ADD CONSTRAINT "product_attributes_attribute_group_id_fkey"
  FOREIGN KEY ("attribute_group_id") REFERENCES "product_attribute_groups"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "product_colors" (
  "id" BIGSERIAL PRIMARY KEY,
  "key" VARCHAR(150) NOT NULL,
  "label" VARCHAR(255) NOT NULL,
  "value" VARCHAR(30) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "product_colors_key_key" ON "product_colors"("key");

CREATE TABLE "product_finishes" (
  "id" BIGSERIAL PRIMARY KEY,
  "key" VARCHAR(150) NOT NULL,
  "label" VARCHAR(255) NOT NULL,
  "color" VARCHAR(30),
  "image_media_id" BIGINT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "product_finishes_key_key" ON "product_finishes"("key");
CREATE INDEX "product_finishes_image_media_id_idx" ON "product_finishes"("image_media_id");

ALTER TABLE "product_finishes"
  ADD CONSTRAINT "product_finishes_image_media_id_fkey"
  FOREIGN KEY ("image_media_id") REFERENCES "media"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
