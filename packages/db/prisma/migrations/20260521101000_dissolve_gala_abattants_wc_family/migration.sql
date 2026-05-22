-- Dissolve the "Abattants WC Gala" family into single products.

DO $$
DECLARE
  target_family_id BIGINT;
  target_member_count INTEGER;
BEGIN
  SELECT "id"
  INTO target_family_id
  FROM "product_families"
  WHERE "slug" = 'abattants-wc-gala';

  IF target_family_id IS NULL THEN
    RAISE EXCEPTION 'Cannot dissolve Abattants WC Gala: family abattants-wc-gala is missing.';
  END IF;

  SELECT COUNT(*)
  INTO target_member_count
  FROM "product_family_members"
  WHERE "family_id" = target_family_id;

  IF target_member_count = 0 THEN
    RAISE EXCEPTION 'Cannot dissolve Abattants WC Gala: family has no members.';
  END IF;
END $$;

CREATE TEMP TABLE "_gala_abattants_to_single" AS
SELECT
  "product"."id" AS "product_id",
  "product"."sku"
FROM "product_families" "family"
JOIN "product_family_members" "member"
  ON "member"."family_id" = "family"."id"
JOIN "products" "product"
  ON "product"."id" = "member"."product_id"
WHERE "family"."slug" = 'abattants-wc-gala';

DELETE FROM "product_family_members" "member"
USING "_gala_abattants_to_single" "target"
WHERE "member"."product_id" = "target"."product_id";

UPDATE "products" "product"
SET
  "kind" = 'SINGLE'::"ProductKind",
  "updated_at" = CURRENT_TIMESTAMP
FROM "_gala_abattants_to_single" "target"
WHERE "product"."id" = "target"."product_id";

DELETE FROM "product_families" "family"
WHERE "family"."slug" = 'abattants-wc-gala'
  AND NOT EXISTS (
    SELECT 1
    FROM "product_family_members" "member"
    WHERE "member"."family_id" = "family"."id"
  );

DROP TABLE "_gala_abattants_to_single";
