CREATE TABLE "customer_payment_methods" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "method" "CommercePaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "label" VARCHAR(120),
    "provider" VARCHAR(80),
    "provider_payment_method_id" VARCHAR(191),
    "holder_name" VARCHAR(255),
    "billing_address_id" BIGINT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_payment_methods_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "customer_payment_methods_customer_id_idx" ON "customer_payment_methods"("customer_id");
CREATE INDEX "customer_payment_methods_billing_address_id_idx" ON "customer_payment_methods"("billing_address_id");
CREATE INDEX "customer_payment_methods_method_idx" ON "customer_payment_methods"("method");
CREATE INDEX "customer_payment_methods_is_active_idx" ON "customer_payment_methods"("is_active");

ALTER TABLE "customer_payment_methods"
ADD CONSTRAINT "customer_payment_methods_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "customer_payment_methods"
ADD CONSTRAINT "customer_payment_methods_billing_address_id_fkey"
FOREIGN KEY ("billing_address_id") REFERENCES "customer_addresses"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
