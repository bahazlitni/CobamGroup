ALTER TABLE "public"."product_families"
ADD COLUMN "vat_rate" DOUBLE PRECISION NOT NULL DEFAULT 19,
DROP COLUMN "currency_code";

ALTER TABLE "public"."product_variants"
DROP COLUMN "currency_code_override";
