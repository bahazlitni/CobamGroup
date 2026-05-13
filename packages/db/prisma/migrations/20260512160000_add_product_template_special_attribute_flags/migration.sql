ALTER TABLE "product_type_templates"
  ADD COLUMN "has_color" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "has_finish" BOOLEAN NOT NULL DEFAULT false;

UPDATE "product_type_templates" template
SET "has_color" = true
WHERE EXISTS (
  SELECT 1
  FROM "product_type_attributes" attribute
  JOIN "product_attribute_definitions" definition
    ON definition."id" = attribute."attribute_definition_id"
  WHERE attribute."product_type_id" = template."id"
    AND definition."input_type" = 'COLOR'
);

UPDATE "product_type_templates" template
SET "has_finish" = true
WHERE EXISTS (
  SELECT 1
  FROM "product_type_attributes" attribute
  JOIN "product_attribute_definitions" definition
    ON definition."id" = attribute."attribute_definition_id"
  WHERE attribute."product_type_id" = template."id"
    AND definition."input_type" = 'FINISH'
);
