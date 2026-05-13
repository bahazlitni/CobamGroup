-- Product type templates can now prefill creation form fields.
-- sort_order remains persisted, but is managed by drag-and-drop in the staff UI.

DROP INDEX IF EXISTS "product_type_groups_is_active_idx";
DROP INDEX IF EXISTS "product_type_templates_is_active_idx";

ALTER TABLE "product_type_groups"
  DROP COLUMN IF EXISTS "is_active";

ALTER TABLE "product_type_templates"
  DROP COLUMN IF EXISTS "is_active",
  ADD COLUMN IF NOT EXISTS "preset_tags" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "preset_stock_unit" "StockUnit",
  ADD COLUMN IF NOT EXISTS "preset_vat_rate" DECIMAL(5, 3),
  ADD COLUMN IF NOT EXISTS "preset_guarantee_months" INTEGER;

CREATE TABLE IF NOT EXISTS "product_type_subcategory_presets" (
  "product_type_id" BIGINT NOT NULL,
  "subcategory_id" BIGINT NOT NULL,

  CONSTRAINT "product_type_subcategory_presets_pkey"
    PRIMARY KEY ("product_type_id", "subcategory_id"),
  CONSTRAINT "product_type_subcategory_presets_product_type_id_fkey"
    FOREIGN KEY ("product_type_id")
    REFERENCES "product_type_templates"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT "product_type_subcategory_presets_subcategory_id_fkey"
    FOREIGN KEY ("subcategory_id")
    REFERENCES "product_subcategories"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "product_type_subcategory_presets_subcategory_id_idx"
  ON "product_type_subcategory_presets"("subcategory_id");
