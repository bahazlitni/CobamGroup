CREATE TABLE "product_attribute_definitions" (
  "id" BIGSERIAL PRIMARY KEY,
  "key" VARCHAR(150) NOT NULL,
  "label" VARCHAR(255) NOT NULL,
  "unit" VARCHAR(50),
  "input_type" "ProductTypeAttributeInputType" NOT NULL DEFAULT 'TEXT',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "product_attribute_definitions_key_key"
  ON "product_attribute_definitions"("key");
CREATE INDEX "product_attribute_definitions_label_idx"
  ON "product_attribute_definitions"("label");

INSERT INTO "product_attribute_definitions" ("key", "label", "unit", "input_type", "updated_at")
VALUES
  ('FINISH', 'Finition', NULL, 'FINISH', CURRENT_TIMESTAMP),
  ('COLOR', 'Couleur', NULL, 'COLOR', CURRENT_TIMESTAMP),
  ('SIZE', 'Taille', NULL, 'TEXT', CURRENT_TIMESTAMP),
  ('WIDTH_MM', 'Largeur', 'mm', 'NUMBER', CURRENT_TIMESTAMP),
  ('HEIGHT_MM', 'Hauteur', 'mm', 'NUMBER', CURRENT_TIMESTAMP),
  ('DEPTH_MM', 'Profondeur', 'mm', 'NUMBER', CURRENT_TIMESTAMP),
  ('THICKNESS_MM', 'Epaisseur', 'mm', 'NUMBER', CURRENT_TIMESTAMP),
  ('VOLUME_M3', 'Volume', 'm3', 'NUMBER', CURRENT_TIMESTAMP),
  ('VOLUME_L', 'Volume', 'L', 'NUMBER', CURRENT_TIMESTAMP),
  ('SURFACE_M2', 'Surface', 'm2', 'NUMBER', CURRENT_TIMESTAMP),
  ('LENGTH_MM', 'Longueur', 'mm', 'NUMBER', CURRENT_TIMESTAMP),
  ('LENGTH_M', 'Longueur', 'm', 'NUMBER', CURRENT_TIMESTAMP),
  ('WEIGHT_KG', 'Poids', 'Kg', 'NUMBER', CURRENT_TIMESTAMP),
  ('GRID_SPACING', 'Mailles', 'cm', 'TEXT', CURRENT_TIMESTAMP),
  ('NUMBER', 'Nombre', NULL, 'NUMBER', CURRENT_TIMESTAMP),
  ('DIAMETER_MM', 'Diametre', 'mm', 'NUMBER', CURRENT_TIMESTAMP),
  ('DIAMETER_CM', 'Diametre', 'cm', 'NUMBER', CURRENT_TIMESTAMP),
  ('DIMENSION_CM', 'Dimension', 'cm', 'TEXT', CURRENT_TIMESTAMP),
  ('VOLUME_ML', 'Volume', 'mL', 'NUMBER', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "unit" = EXCLUDED."unit",
  "input_type" = EXCLUDED."input_type",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "product_attribute_definitions" ("key", "label", "unit", "input_type", "updated_at")
SELECT DISTINCT
  pta."name",
  COALESCE(NULLIF(pta."label", ''), pta."name"),
  pta."unit",
  pta."input_type",
  CURRENT_TIMESTAMP
FROM "product_type_attributes" pta
WHERE NOT EXISTS (
  SELECT 1
  FROM "product_attribute_definitions" pad
  WHERE pad."key" = pta."name"
);

ALTER TABLE "product_type_attributes"
  ADD COLUMN "attribute_definition_id" BIGINT;

UPDATE "product_type_attributes" pta
SET "attribute_definition_id" = pad."id"
FROM "product_attribute_definitions" pad
WHERE pad."key" = pta."name";

ALTER TABLE "product_attributes"
  DROP CONSTRAINT IF EXISTS "product_attributes_attribute_def_id_fkey";

UPDATE "product_attributes" pa
SET "attribute_def_id" = pta."attribute_definition_id"
FROM "product_type_attributes" pta
WHERE pa."attribute_def_id" = pta."id";

ALTER TABLE "product_type_attributes"
  ALTER COLUMN "attribute_definition_id" SET NOT NULL;

DROP INDEX IF EXISTS "product_type_attributes_product_type_id_name_key";

CREATE UNIQUE INDEX "product_type_attributes_product_type_id_attribute_definition_id_key"
  ON "product_type_attributes"("product_type_id", "attribute_definition_id");
CREATE INDEX "product_type_attributes_attribute_definition_id_idx"
  ON "product_type_attributes"("attribute_definition_id");

ALTER TABLE "product_type_attributes"
  ADD CONSTRAINT "product_type_attributes_attribute_definition_id_fkey"
  FOREIGN KEY ("attribute_definition_id") REFERENCES "product_attribute_definitions"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "product_attributes"
  ADD CONSTRAINT "product_attributes_attribute_def_id_fkey"
  FOREIGN KEY ("attribute_def_id") REFERENCES "product_attribute_definitions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product_type_attributes"
  DROP COLUMN "name",
  DROP COLUMN "unit",
  DROP COLUMN "input_type";
