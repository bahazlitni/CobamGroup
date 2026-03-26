UPDATE "public"."media" AS "m"
SET "visibility" = 'PUBLIC'
FROM "public"."product_brands" AS "b"
WHERE "b"."logo_media_id" = "m"."id"
  AND "b"."deleted_at" IS NULL
  AND "b"."showcase_placement" IN ('REFERENCE', 'PARTNER')
  AND "m"."deleted_at" IS NULL
  AND "m"."is_active" = TRUE
  AND "m"."visibility" <> 'PUBLIC';
