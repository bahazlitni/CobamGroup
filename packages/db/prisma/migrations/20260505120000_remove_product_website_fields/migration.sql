ALTER TABLE "products"
  DROP COLUMN IF EXISTS "base_price_amount",
  DROP COLUMN IF EXISTS "vat_rate",
  DROP COLUMN IF EXISTS "stock",
  DROP COLUMN IF EXISTS "stock_unit",
  DROP COLUMN IF EXISTS "visibility",
  DROP COLUMN IF EXISTS "price_visibility",
  DROP COLUMN IF EXISTS "stock_visibility",
  DROP COLUMN IF EXISTS "commercial_mode";

DROP TYPE IF EXISTS "ProductStockUnit";
DROP TYPE IF EXISTS "ProductCommercialMode";
