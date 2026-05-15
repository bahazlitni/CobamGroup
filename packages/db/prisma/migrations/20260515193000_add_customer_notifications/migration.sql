CREATE TABLE "customer_notifications" (
  "id" BIGSERIAL NOT NULL,
  "customer_id" BIGINT NOT NULL,
  "order_id" BIGINT,
  "type" VARCHAR(80) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "body" TEXT NOT NULL,
  "href" VARCHAR(500),
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "customer_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "customer_notifications_customer_id_read_at_created_at_idx"
  ON "customer_notifications"("customer_id", "read_at", "created_at");

CREATE INDEX "customer_notifications_order_id_idx"
  ON "customer_notifications"("order_id");

ALTER TABLE "customer_notifications"
  ADD CONSTRAINT "customer_notifications_customer_id_fkey"
  FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "customer_notifications"
  ADD CONSTRAINT "customer_notifications_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
