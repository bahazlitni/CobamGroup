ALTER TABLE "product_subcategories"
  ADD COLUMN "visible_ecommerce" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "visible_vitrine" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "product_subcategories_visible_ecommerce_idx" ON "product_subcategories"("visible_ecommerce");
CREATE INDEX "product_subcategories_visible_vitrine_idx" ON "product_subcategories"("visible_vitrine");
