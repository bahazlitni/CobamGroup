-- Safely delete the "Sika - Ciment Colle Ceram Sac 25KG" family and its member products.
-- Historical order items keep their snapshots; product_id is set to NULL by the FK if any exist.
-- Media rows are not deleted, only their product links.

CREATE TEMP TABLE "_delete_sika_ciment_colle_family" AS
SELECT "id", "slug", "name"
FROM "product_families"
WHERE "name" = 'Sika - Ciment Colle Ceram Sac 25KG';

DO $$
DECLARE
  family_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO family_count FROM "_delete_sika_ciment_colle_family";

  IF family_count = 0 THEN
    RAISE EXCEPTION 'Cannot delete family: no product_families row named "Sika - Ciment Colle Ceram Sac 25KG" was found.';
  END IF;

  IF family_count > 1 THEN
    RAISE EXCEPTION 'Cannot delete family: % product_families rows named "Sika - Ciment Colle Ceram Sac 25KG" were found.', family_count;
  END IF;
END $$;

CREATE TEMP TABLE "_delete_sika_ciment_colle_products" AS
SELECT
  "product"."id",
  "product"."sku",
  "product"."slug",
  "product"."name"
FROM "_delete_sika_ciment_colle_family" "family"
JOIN "product_family_members" "member"
  ON "member"."family_id" = "family"."id"
JOIN "products" "product"
  ON "product"."id" = "member"."product_id";

DO $$
DECLARE
  reservation_count INTEGER;
  product_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM "_delete_sika_ciment_colle_products";

  IF product_count = 0 THEN
    RAISE NOTICE 'Deleting family "Sika - Ciment Colle Ceram Sac 25KG" with no member products.';
  END IF;

  SELECT COUNT(*)
  INTO reservation_count
  FROM "commerce_stock_reservations" "reservation"
  JOIN "_delete_sika_ciment_colle_products" "product"
    ON "product"."id" = "reservation"."product_id";

  IF reservation_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete Sika Ciment Colle Ceram products: % commerce_stock_reservations rows still reference them.', reservation_count;
  END IF;
END $$;

DELETE FROM "shopping_cart_items" "cart_item"
USING "_delete_sika_ciment_colle_products" "product"
WHERE "cart_item"."product_id" = "product"."id";

DELETE FROM "commerce_promotion_products" "promotion_product"
USING "_delete_sika_ciment_colle_products" "product"
WHERE "promotion_product"."product_id" = "product"."id";

DELETE FROM "commerce_wishlist_items" "wishlist_item"
USING "_delete_sika_ciment_colle_products" "product"
WHERE "wishlist_item"."product_id" = "product"."id";

DELETE FROM "product_media" "product_media"
USING "_delete_sika_ciment_colle_products" "product"
WHERE "product_media"."product_id" = "product"."id";

DELETE FROM "product_attributes" "attribute"
USING "_delete_sika_ciment_colle_products" "product"
WHERE "attribute"."product_id" = "product"."id";

DELETE FROM "product_subcategory_links" "subcategory_link"
USING "_delete_sika_ciment_colle_products" "product"
WHERE "subcategory_link"."product_id" = "product"."id";

UPDATE "product_families" "family"
SET
  "default_product_id" = NULL,
  "updated_at" = CURRENT_TIMESTAMP
FROM "_delete_sika_ciment_colle_family" "target_family"
WHERE "family"."id" = "target_family"."id";

DELETE FROM "product_family_members" "member"
USING "_delete_sika_ciment_colle_family" "family"
WHERE "member"."family_id" = "family"."id";

DELETE FROM "product_families" "family"
USING "_delete_sika_ciment_colle_family" "target_family"
WHERE "family"."id" = "target_family"."id";

DELETE FROM "products" "product"
USING "_delete_sika_ciment_colle_products" "target_product"
WHERE "product"."id" = "target_product"."id";

DROP TABLE "_delete_sika_ciment_colle_products";
DROP TABLE "_delete_sika_ciment_colle_family";
