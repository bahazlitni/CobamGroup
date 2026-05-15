-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "CustomerAddressType" AS ENUM ('BILLING', 'SHIPPING', 'BOTH');

-- CreateEnum
CREATE TYPE "ShoppingCartStatus" AS ENUM ('ACTIVE', 'CONVERTED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('OPEN', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommerceOrderStatus" AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CommercePaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'CASH_ON_DELIVERY', 'PAY_IN_STORE');

-- CreateEnum
CREATE TYPE "CommercePaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "CommerceRefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommerceFulfillmentMethod" AS ENUM ('DELIVERY', 'PICKUP');

-- CreateEnum
CREATE TYPE "CommerceFulfillmentStatus" AS ENUM ('PENDING', 'SCHEDULED', 'PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommercePromotionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommerceDiscountType" AS ENUM ('PERCENT', 'FIXED_AMOUNT', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "CommerceInvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommerceReturnRequestStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommerceReturnItemStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CommerceMessageVisibility" AS ENUM ('CUSTOMER', 'STAFF_INTERNAL');

-- CreateEnum
CREATE TYPE "CommerceStockReservationStatus" AS ENUM ('RESERVED', 'RELEASED', 'CONSUMED', 'EXPIRED');

-- CreateTable
CREATE TABLE "customer_profiles" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "CustomerType" NOT NULL DEFAULT 'INDIVIDUAL',
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "company_name" VARCHAR(255),
    "tax_identifier" VARCHAR(100),
    "phone" VARCHAR(50),
    "email_marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "sms_marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "default_billing_address_id" BIGINT,
    "default_shipping_address_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "type" "CustomerAddressType" NOT NULL DEFAULT 'BOTH',
    "label" VARCHAR(100),
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "address_line_1" VARCHAR(255) NOT NULL,
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(120) NOT NULL,
    "governorate" VARCHAR(120),
    "postal_code" VARCHAR(30),
    "country_code" VARCHAR(2) NOT NULL DEFAULT 'TN',
    "is_default_billing" BOOLEAN NOT NULL DEFAULT false,
    "is_default_shipping" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_carts" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT,
    "guest_token" VARCHAR(191),
    "status" "ShoppingCartStatus" NOT NULL DEFAULT 'ACTIVE',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'TND',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopping_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_cart_items" (
    "id" BIGSERIAL NOT NULL,
    "cart_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit_price_ttc" DECIMAL(12,3),
    "vat_rate" DECIMAL(5,3) NOT NULL DEFAULT 19.000,
    "price_snapshot" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopping_cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkout_sessions" (
    "id" BIGSERIAL NOT NULL,
    "cart_id" BIGINT NOT NULL,
    "customer_id" BIGINT,
    "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'OPEN',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'TND',
    "subtotal_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "discount_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "shipping_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "tax_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "total_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "shipping_address_snapshot" JSON,
    "billing_address_snapshot" JSON,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_orders" (
    "id" BIGSERIAL NOT NULL,
    "order_number" VARCHAR(50) NOT NULL,
    "customer_id" BIGINT,
    "cart_id" BIGINT,
    "guest_email" VARCHAR(255),
    "guest_phone" VARCHAR(50),
    "status" "CommerceOrderStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "CommercePaymentStatus" NOT NULL DEFAULT 'PENDING',
    "fulfillment_status" "CommerceFulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'TND',
    "subtotal_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "discount_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "shipping_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "tax_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "total_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "customer_snapshot" JSON,
    "billing_address_snapshot" JSON,
    "shipping_address_snapshot" JSON,
    "notes" TEXT,
    "cancellation_reason" TEXT,
    "placed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_order_items" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "product_id" BIGINT,
    "sku" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "image_url" VARCHAR(500),
    "brand_name" VARCHAR(255),
    "quantity" DECIMAL(12,3) NOT NULL,
    "stock_unit" "StockUnit" NOT NULL DEFAULT 'PIECE',
    "unit_price_ttc" DECIMAL(12,3),
    "vat_rate" DECIMAL(5,3) NOT NULL DEFAULT 19.000,
    "discount_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "line_subtotal_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "line_total_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "attributes_snapshot" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_order_status_events" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "from_status" "CommerceOrderStatus",
    "to_status" "CommerceOrderStatus" NOT NULL,
    "note" TEXT,
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_order_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_payments" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "checkout_session_id" BIGINT,
    "provider" VARCHAR(80) NOT NULL,
    "method" "CommercePaymentMethod" NOT NULL,
    "status" "CommercePaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,3) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'TND',
    "provider_payment_id" VARCHAR(191),
    "provider_session_id" VARCHAR(191),
    "transaction_reference" VARCHAR(191),
    "failure_code" VARCHAR(100),
    "failure_reason" TEXT,
    "paid_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_payment_events" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" BIGINT,
    "provider" VARCHAR(80) NOT NULL,
    "provider_event_id" VARCHAR(191) NOT NULL,
    "type" VARCHAR(120) NOT NULL,
    "payload" JSON NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "commerce_payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_refunds" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" BIGINT NOT NULL,
    "order_id" BIGINT NOT NULL,
    "amount" DECIMAL(12,3) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'TND',
    "status" "CommerceRefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "provider_refund_id" VARCHAR(191),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_locations" (
    "id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "address_line_1" VARCHAR(255) NOT NULL,
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(120) NOT NULL,
    "governorate" VARCHAR(120),
    "postal_code" VARCHAR(30),
    "country_code" VARCHAR(2) NOT NULL DEFAULT 'TN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_fulfillments" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "method" "CommerceFulfillmentMethod" NOT NULL,
    "status" "CommerceFulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "pickup_location_id" BIGINT,
    "delivery_address_snapshot" JSON,
    "requested_date" TIMESTAMP(3),
    "scheduled_at" TIMESTAMP(3),
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "tracking_number" VARCHAR(120),
    "carrier_name" VARCHAR(120),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_fulfillments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_fulfillment_events" (
    "id" BIGSERIAL NOT NULL,
    "fulfillment_id" BIGINT NOT NULL,
    "from_status" "CommerceFulfillmentStatus",
    "to_status" "CommerceFulfillmentStatus" NOT NULL,
    "note" TEXT,
    "tracking_payload" JSON,
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_fulfillment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_promotions" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "status" "CommercePromotionStatus" NOT NULL DEFAULT 'DRAFT',
    "discount_type" "CommerceDiscountType" NOT NULL,
    "discount_value" DECIMAL(12,3) NOT NULL,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "minimum_subtotal_ttc" DECIMAL(12,3),
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "rules_json" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_coupons" (
    "id" BIGSERIAL NOT NULL,
    "promotion_id" BIGINT NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "usage_limit" INTEGER,
    "usage_limit_per_customer" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_promotion_products" (
    "promotion_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,

    CONSTRAINT "commerce_promotion_products_pkey" PRIMARY KEY ("promotion_id","product_id")
);

-- CreateTable
CREATE TABLE "commerce_promotion_categories" (
    "promotion_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,

    CONSTRAINT "commerce_promotion_categories_pkey" PRIMARY KEY ("promotion_id","category_id")
);

-- CreateTable
CREATE TABLE "commerce_promotion_brands" (
    "promotion_id" BIGINT NOT NULL,
    "brand_id" BIGINT NOT NULL,

    CONSTRAINT "commerce_promotion_brands_pkey" PRIMARY KEY ("promotion_id","brand_id")
);

-- CreateTable
CREATE TABLE "commerce_promotion_redemptions" (
    "id" BIGSERIAL NOT NULL,
    "promotion_id" BIGINT NOT NULL,
    "coupon_id" BIGINT,
    "customer_id" BIGINT,
    "order_id" BIGINT NOT NULL,
    "discount_amount_ttc" DECIMAL(12,3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_promotion_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_invoices" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "invoice_number" VARCHAR(80) NOT NULL,
    "status" "CommerceInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issued_at" TIMESTAMP(3),
    "total_ttc" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'TND',
    "pdf_media_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_return_requests" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "customer_id" BIGINT,
    "status" "CommerceReturnRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "reason" VARCHAR(255),
    "customer_note" TEXT,
    "staff_note" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_return_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_return_items" (
    "id" BIGSERIAL NOT NULL,
    "return_request_id" BIGINT NOT NULL,
    "order_item_id" BIGINT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "status" "CommerceReturnItemStatus" NOT NULL DEFAULT 'REQUESTED',
    "reason" VARCHAR(255),
    "refund_amount_ttc" DECIMAL(12,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_order_messages" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "customer_id" BIGINT,
    "staff_user_id" TEXT,
    "visibility" "CommerceMessageVisibility" NOT NULL DEFAULT 'CUSTOMER',
    "subject" VARCHAR(255),
    "body" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_order_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_wishlist_items" (
    "id" BIGSERIAL NOT NULL,
    "customer_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_stock_reservations" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "order_id" BIGINT,
    "cart_id" BIGINT,
    "customer_id" BIGINT,
    "quantity" DECIMAL(12,3) NOT NULL,
    "status" "CommerceStockReservationStatus" NOT NULL DEFAULT 'RESERVED',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_user_id_key" ON "customer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "customer_profiles_type_idx" ON "customer_profiles"("type");

-- CreateIndex
CREATE INDEX "customer_profiles_default_billing_address_id_idx" ON "customer_profiles"("default_billing_address_id");

-- CreateIndex
CREATE INDEX "customer_profiles_default_shipping_address_id_idx" ON "customer_profiles"("default_shipping_address_id");

-- CreateIndex
CREATE INDEX "customer_addresses_customer_id_idx" ON "customer_addresses"("customer_id");

-- CreateIndex
CREATE INDEX "customer_addresses_type_idx" ON "customer_addresses"("type");

-- CreateIndex
CREATE UNIQUE INDEX "shopping_carts_guest_token_key" ON "shopping_carts"("guest_token");

-- CreateIndex
CREATE INDEX "shopping_carts_customer_id_status_idx" ON "shopping_carts"("customer_id", "status");

-- CreateIndex
CREATE INDEX "shopping_carts_status_idx" ON "shopping_carts"("status");

-- CreateIndex
CREATE INDEX "shopping_carts_expires_at_idx" ON "shopping_carts"("expires_at");

-- CreateIndex
CREATE INDEX "shopping_cart_items_product_id_idx" ON "shopping_cart_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "shopping_cart_items_cart_id_product_id_key" ON "shopping_cart_items"("cart_id", "product_id");

-- CreateIndex
CREATE INDEX "checkout_sessions_cart_id_idx" ON "checkout_sessions"("cart_id");

-- CreateIndex
CREATE INDEX "checkout_sessions_customer_id_idx" ON "checkout_sessions"("customer_id");

-- CreateIndex
CREATE INDEX "checkout_sessions_status_idx" ON "checkout_sessions"("status");

-- CreateIndex
CREATE INDEX "checkout_sessions_expires_at_idx" ON "checkout_sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_orders_order_number_key" ON "commerce_orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_orders_cart_id_key" ON "commerce_orders"("cart_id");

-- CreateIndex
CREATE INDEX "commerce_orders_customer_id_placed_at_idx" ON "commerce_orders"("customer_id", "placed_at");

-- CreateIndex
CREATE INDEX "commerce_orders_status_idx" ON "commerce_orders"("status");

-- CreateIndex
CREATE INDEX "commerce_orders_payment_status_idx" ON "commerce_orders"("payment_status");

-- CreateIndex
CREATE INDEX "commerce_orders_fulfillment_status_idx" ON "commerce_orders"("fulfillment_status");

-- CreateIndex
CREATE INDEX "commerce_orders_placed_at_idx" ON "commerce_orders"("placed_at");

-- CreateIndex
CREATE INDEX "commerce_order_items_order_id_idx" ON "commerce_order_items"("order_id");

-- CreateIndex
CREATE INDEX "commerce_order_items_product_id_idx" ON "commerce_order_items"("product_id");

-- CreateIndex
CREATE INDEX "commerce_order_items_sku_idx" ON "commerce_order_items"("sku");

-- CreateIndex
CREATE INDEX "commerce_order_status_events_order_id_created_at_idx" ON "commerce_order_status_events"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "commerce_order_status_events_created_by_user_id_idx" ON "commerce_order_status_events"("created_by_user_id");

-- CreateIndex
CREATE INDEX "commerce_payments_order_id_idx" ON "commerce_payments"("order_id");

-- CreateIndex
CREATE INDEX "commerce_payments_checkout_session_id_idx" ON "commerce_payments"("checkout_session_id");

-- CreateIndex
CREATE INDEX "commerce_payments_provider_provider_payment_id_idx" ON "commerce_payments"("provider", "provider_payment_id");

-- CreateIndex
CREATE INDEX "commerce_payments_status_idx" ON "commerce_payments"("status");

-- CreateIndex
CREATE INDEX "commerce_payment_events_payment_id_idx" ON "commerce_payment_events"("payment_id");

-- CreateIndex
CREATE INDEX "commerce_payment_events_received_at_idx" ON "commerce_payment_events"("received_at");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_payment_events_provider_provider_event_id_key" ON "commerce_payment_events"("provider", "provider_event_id");

-- CreateIndex
CREATE INDEX "commerce_refunds_payment_id_idx" ON "commerce_refunds"("payment_id");

-- CreateIndex
CREATE INDEX "commerce_refunds_order_id_idx" ON "commerce_refunds"("order_id");

-- CreateIndex
CREATE INDEX "commerce_refunds_status_idx" ON "commerce_refunds"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pickup_locations_slug_key" ON "pickup_locations"("slug");

-- CreateIndex
CREATE INDEX "pickup_locations_is_active_idx" ON "pickup_locations"("is_active");

-- CreateIndex
CREATE INDEX "pickup_locations_sort_order_idx" ON "pickup_locations"("sort_order");

-- CreateIndex
CREATE INDEX "commerce_fulfillments_order_id_idx" ON "commerce_fulfillments"("order_id");

-- CreateIndex
CREATE INDEX "commerce_fulfillments_pickup_location_id_idx" ON "commerce_fulfillments"("pickup_location_id");

-- CreateIndex
CREATE INDEX "commerce_fulfillments_method_idx" ON "commerce_fulfillments"("method");

-- CreateIndex
CREATE INDEX "commerce_fulfillments_status_idx" ON "commerce_fulfillments"("status");

-- CreateIndex
CREATE INDEX "commerce_fulfillment_events_fulfillment_id_created_at_idx" ON "commerce_fulfillment_events"("fulfillment_id", "created_at");

-- CreateIndex
CREATE INDEX "commerce_fulfillment_events_created_by_user_id_idx" ON "commerce_fulfillment_events"("created_by_user_id");

-- CreateIndex
CREATE INDEX "commerce_promotions_status_idx" ON "commerce_promotions"("status");

-- CreateIndex
CREATE INDEX "commerce_promotions_starts_at_idx" ON "commerce_promotions"("starts_at");

-- CreateIndex
CREATE INDEX "commerce_promotions_ends_at_idx" ON "commerce_promotions"("ends_at");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_coupons_code_key" ON "commerce_coupons"("code");

-- CreateIndex
CREATE INDEX "commerce_coupons_promotion_id_idx" ON "commerce_coupons"("promotion_id");

-- CreateIndex
CREATE INDEX "commerce_coupons_is_active_idx" ON "commerce_coupons"("is_active");

-- CreateIndex
CREATE INDEX "commerce_promotion_products_product_id_idx" ON "commerce_promotion_products"("product_id");

-- CreateIndex
CREATE INDEX "commerce_promotion_categories_category_id_idx" ON "commerce_promotion_categories"("category_id");

-- CreateIndex
CREATE INDEX "commerce_promotion_brands_brand_id_idx" ON "commerce_promotion_brands"("brand_id");

-- CreateIndex
CREATE INDEX "commerce_promotion_redemptions_coupon_id_idx" ON "commerce_promotion_redemptions"("coupon_id");

-- CreateIndex
CREATE INDEX "commerce_promotion_redemptions_customer_id_idx" ON "commerce_promotion_redemptions"("customer_id");

-- CreateIndex
CREATE INDEX "commerce_promotion_redemptions_order_id_idx" ON "commerce_promotion_redemptions"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_promotion_redemptions_promotion_id_order_id_key" ON "commerce_promotion_redemptions"("promotion_id", "order_id");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_invoices_order_id_key" ON "commerce_invoices"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_invoices_invoice_number_key" ON "commerce_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "commerce_invoices_status_idx" ON "commerce_invoices"("status");

-- CreateIndex
CREATE INDEX "commerce_invoices_pdf_media_id_idx" ON "commerce_invoices"("pdf_media_id");

-- CreateIndex
CREATE INDEX "commerce_return_requests_order_id_idx" ON "commerce_return_requests"("order_id");

-- CreateIndex
CREATE INDEX "commerce_return_requests_customer_id_idx" ON "commerce_return_requests"("customer_id");

-- CreateIndex
CREATE INDEX "commerce_return_requests_status_idx" ON "commerce_return_requests"("status");

-- CreateIndex
CREATE INDEX "commerce_return_items_return_request_id_idx" ON "commerce_return_items"("return_request_id");

-- CreateIndex
CREATE INDEX "commerce_return_items_order_item_id_idx" ON "commerce_return_items"("order_item_id");

-- CreateIndex
CREATE INDEX "commerce_return_items_status_idx" ON "commerce_return_items"("status");

-- CreateIndex
CREATE INDEX "commerce_order_messages_order_id_created_at_idx" ON "commerce_order_messages"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "commerce_order_messages_customer_id_idx" ON "commerce_order_messages"("customer_id");

-- CreateIndex
CREATE INDEX "commerce_order_messages_staff_user_id_idx" ON "commerce_order_messages"("staff_user_id");

-- CreateIndex
CREATE INDEX "commerce_order_messages_visibility_idx" ON "commerce_order_messages"("visibility");

-- CreateIndex
CREATE INDEX "commerce_wishlist_items_product_id_idx" ON "commerce_wishlist_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_wishlist_items_customer_id_product_id_key" ON "commerce_wishlist_items"("customer_id", "product_id");

-- CreateIndex
CREATE INDEX "commerce_stock_reservations_product_id_status_idx" ON "commerce_stock_reservations"("product_id", "status");

-- CreateIndex
CREATE INDEX "commerce_stock_reservations_order_id_idx" ON "commerce_stock_reservations"("order_id");

-- CreateIndex
CREATE INDEX "commerce_stock_reservations_cart_id_idx" ON "commerce_stock_reservations"("cart_id");

-- CreateIndex
CREATE INDEX "commerce_stock_reservations_customer_id_idx" ON "commerce_stock_reservations"("customer_id");

-- CreateIndex
CREATE INDEX "commerce_stock_reservations_expires_at_idx" ON "commerce_stock_reservations"("expires_at");

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_default_billing_address_id_fkey" FOREIGN KEY ("default_billing_address_id") REFERENCES "customer_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_default_shipping_address_id_fkey" FOREIGN KEY ("default_shipping_address_id") REFERENCES "customer_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_carts" ADD CONSTRAINT "shopping_carts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_cart_items" ADD CONSTRAINT "shopping_cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "shopping_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_cart_items" ADD CONSTRAINT "shopping_cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "shopping_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_orders" ADD CONSTRAINT "commerce_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_orders" ADD CONSTRAINT "commerce_orders_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "shopping_carts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_order_items" ADD CONSTRAINT "commerce_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_order_items" ADD CONSTRAINT "commerce_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_order_status_events" ADD CONSTRAINT "commerce_order_status_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_order_status_events" ADD CONSTRAINT "commerce_order_status_events_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_payments" ADD CONSTRAINT "commerce_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_payments" ADD CONSTRAINT "commerce_payments_checkout_session_id_fkey" FOREIGN KEY ("checkout_session_id") REFERENCES "checkout_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_payment_events" ADD CONSTRAINT "commerce_payment_events_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "commerce_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_refunds" ADD CONSTRAINT "commerce_refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "commerce_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_refunds" ADD CONSTRAINT "commerce_refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_fulfillments" ADD CONSTRAINT "commerce_fulfillments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_fulfillments" ADD CONSTRAINT "commerce_fulfillments_pickup_location_id_fkey" FOREIGN KEY ("pickup_location_id") REFERENCES "pickup_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_fulfillment_events" ADD CONSTRAINT "commerce_fulfillment_events_fulfillment_id_fkey" FOREIGN KEY ("fulfillment_id") REFERENCES "commerce_fulfillments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_fulfillment_events" ADD CONSTRAINT "commerce_fulfillment_events_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_coupons" ADD CONSTRAINT "commerce_coupons_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "commerce_promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_promotion_products" ADD CONSTRAINT "commerce_promotion_products_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "commerce_promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_promotion_products" ADD CONSTRAINT "commerce_promotion_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_promotion_categories" ADD CONSTRAINT "commerce_promotion_categories_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "commerce_promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_promotion_categories" ADD CONSTRAINT "commerce_promotion_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_promotion_brands" ADD CONSTRAINT "commerce_promotion_brands_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "commerce_promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_promotion_brands" ADD CONSTRAINT "commerce_promotion_brands_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_promotion_redemptions" ADD CONSTRAINT "commerce_promotion_redemptions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "commerce_promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_promotion_redemptions" ADD CONSTRAINT "commerce_promotion_redemptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "commerce_coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_promotion_redemptions" ADD CONSTRAINT "commerce_promotion_redemptions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_promotion_redemptions" ADD CONSTRAINT "commerce_promotion_redemptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_invoices" ADD CONSTRAINT "commerce_invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_invoices" ADD CONSTRAINT "commerce_invoices_pdf_media_id_fkey" FOREIGN KEY ("pdf_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_return_requests" ADD CONSTRAINT "commerce_return_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_return_requests" ADD CONSTRAINT "commerce_return_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_return_items" ADD CONSTRAINT "commerce_return_items_return_request_id_fkey" FOREIGN KEY ("return_request_id") REFERENCES "commerce_return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_return_items" ADD CONSTRAINT "commerce_return_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "commerce_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_order_messages" ADD CONSTRAINT "commerce_order_messages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_order_messages" ADD CONSTRAINT "commerce_order_messages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_order_messages" ADD CONSTRAINT "commerce_order_messages_staff_user_id_fkey" FOREIGN KEY ("staff_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_wishlist_items" ADD CONSTRAINT "commerce_wishlist_items_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_wishlist_items" ADD CONSTRAINT "commerce_wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_stock_reservations" ADD CONSTRAINT "commerce_stock_reservations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_stock_reservations" ADD CONSTRAINT "commerce_stock_reservations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_stock_reservations" ADD CONSTRAINT "commerce_stock_reservations_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "shopping_carts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_stock_reservations" ADD CONSTRAINT "commerce_stock_reservations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
