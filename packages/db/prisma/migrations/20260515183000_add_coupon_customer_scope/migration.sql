CREATE TABLE "commerce_coupon_customers" (
  "coupon_id" BIGINT NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "commerce_coupon_customers_pkey" PRIMARY KEY ("coupon_id", "customer_id")
);

CREATE INDEX "commerce_coupon_customers_customer_id_idx"
  ON "commerce_coupon_customers"("customer_id");

ALTER TABLE "commerce_coupon_customers"
  ADD CONSTRAINT "commerce_coupon_customers_coupon_id_fkey"
  FOREIGN KEY ("coupon_id") REFERENCES "commerce_coupons"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "commerce_coupon_customers"
  ADD CONSTRAINT "commerce_coupon_customers_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
