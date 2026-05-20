ALTER TABLE "product_type_templates"
  ADD COLUMN "hint" TEXT;

UPDATE "product_type_templates"
SET "hint" = "description"
WHERE "hint" IS NULL
  AND NULLIF(BTRIM("description"), '') IS NOT NULL;

UPDATE "product_type_templates"
SET "description" = NULL
WHERE NULLIF(BTRIM("description"), '') IS NOT NULL;
