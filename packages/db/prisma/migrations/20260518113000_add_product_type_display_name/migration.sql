ALTER TABLE "product_type_templates"
  ADD COLUMN "display_name" VARCHAR(255);

UPDATE "product_type_templates"
SET "display_name" = LEFT(NULLIF(BTRIM("name"), ''), 255)
WHERE "display_name" IS NULL OR BTRIM("display_name") = '';

UPDATE "product_type_templates"
SET "display_name" = CONCAT('Modele produit #', "id")
WHERE "display_name" IS NULL OR BTRIM("display_name") = '';

ALTER TABLE "product_type_templates"
  ALTER COLUMN "display_name" SET NOT NULL;
