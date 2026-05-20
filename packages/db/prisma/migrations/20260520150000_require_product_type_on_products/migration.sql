-- Backfill legacy products before making the product model mandatory.
-- The classifier leans on product/category/subcategory slugs first, so it stays
-- stable across accented labels and console encodings.

DO $$
DECLARE
  missing_ids bigint[];
BEGIN
  SELECT array_agg(required_id)
  INTO missing_ids
  FROM unnest(ARRAY[
    1::bigint, 2::bigint, 3::bigint, 4::bigint, 5::bigint, 6::bigint, 7::bigint,
    8::bigint, 9::bigint, 10::bigint, 11::bigint, 12::bigint, 13::bigint,
    14::bigint, 15::bigint, 16::bigint, 17::bigint, 18::bigint, 19::bigint,
    20::bigint, 21::bigint, 22::bigint, 23::bigint, 24::bigint, 25::bigint,
    26::bigint, 27::bigint, 28::bigint, 29::bigint, 30::bigint, 31::bigint,
    32::bigint, 33::bigint, 34::bigint, 35::bigint, 36::bigint, 37::bigint,
    38::bigint, 39::bigint
  ]) AS required(required_id)
  WHERE NOT EXISTS (
    SELECT 1
    FROM "product_type_templates" "template"
    WHERE "template"."id" = required.required_id
  );

  IF missing_ids IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot backfill product models. Missing product_type_templates ids: %', missing_ids;
  END IF;
END $$;

WITH product_search AS (
  SELECT
    "p"."id",
    lower(
      concat_ws(
        ' ',
        "p"."sku",
        "p"."slug",
        "p"."name",
        "p"."display_name",
        "p"."tags",
        "brand"."name",
        "brand"."slug",
        COALESCE(
          string_agg(
            concat_ws(
              ' ',
              "category"."name",
              "category"."slug",
              "subcategory"."name",
              "subcategory"."slug"
            ),
            ' '
          ),
          ''
        )
      )
    ) AS "search_text"
  FROM "products" "p"
  LEFT JOIN "organizations" "brand" ON "brand"."id" = "p"."brand_id"
  LEFT JOIN "product_subcategory_links" "link" ON "link"."product_id" = "p"."id"
  LEFT JOIN "product_subcategories" "subcategory" ON "subcategory"."id" = "link"."subcategory_id"
  LEFT JOIN "product_types" "category" ON "category"."id" = "subcategory"."category_id"
  WHERE "p"."product_type_id" IS NULL
  GROUP BY "p"."id", "brand"."name", "brand"."slug"
),
classified_products AS (
  SELECT
    "id",
    CASE
      WHEN "search_text" ~ '(plaque[^a-z0-9]+commande|commande[^a-z0-9]+wc)' THEN 5
      WHEN "search_text" ~ '(bati[^a-z0-9]*support|reservoir[^a-z0-9]+wc)' THEN 6
      WHEN "search_text" ~ 'abattant' THEN 7
      WHEN "search_text" ~ '(^|[^a-z0-9])(cuvette|wc|toilette)([^a-z0-9]|$)' THEN 8

      WHEN "search_text" ~ '(corps[^a-z0-9]+encastre|inverseur)' THEN 16
      WHEN "search_text" ~ '(mitigeur|melangeur|robinet)' AND "search_text" ~ '(evier|cuisine)' THEN 17
      WHEN "search_text" ~ '(mitigeur|melangeur|robinet)' AND "search_text" ~ '(douche|bain[^a-z0-9]*douche|baignoire)' THEN 18
      WHEN "search_text" ~ '(mitigeur|melangeur|robinet)' AND "search_text" ~ '(lavabo|vasque|lave[^a-z0-9]*main)' THEN 19

      WHEN "search_text" ~ '(colonne[^a-z0-9]+douche|barre[^a-z0-9]+douche)' THEN 24
      WHEN "search_text" ~ '(douchette|tete[^a-z0-9]+douche|bras[^a-z0-9]+douche|flexible[^a-z0-9]+douche|pomme[^a-z0-9]+douche)' THEN 23
      WHEN "search_text" ~ '(paroi[^a-z0-9]+douche|pare[^a-z0-9]*douche)' THEN 22
      WHEN "search_text" ~ 'cabine[^a-z0-9]+douche' THEN 21
      WHEN "search_text" ~ '(receveur|caniveau)' THEN 20

      WHEN "search_text" ~ 'baignoire' AND "search_text" ~ '(balneo|hydromassage|spa)' THEN 26
      WHEN "search_text" ~ '(accessoire[^a-z0-9]+baignoire|tablier[^a-z0-9]+baignoire|appui[^a-z0-9]*tete)' THEN 25
      WHEN "search_text" ~ 'baignoire' THEN 27

      WHEN "search_text" ~ '(bonde|siphon|vidage|drain)' THEN 29
      WHEN "search_text" ~ '(raccord[^a-z0-9]+pvc|evacuation|tube[^a-z0-9]+pvc)' THEN 31
      WHEN "search_text" ~ '(flexible|raccord)' AND "search_text" ~ '(eau|sanitaire)' THEN 30
      WHEN "search_text" ~ 'evier' THEN 28

      WHEN "search_text" ~ 'plan[^a-z0-9]+vasque' THEN 9
      WHEN "search_text" ~ '(vasque|bol[^a-z0-9]+a[^a-z0-9]+poser)' THEN 10
      WHEN "search_text" ~ '(lavabo|lave[^a-z0-9]*main)' THEN 11
      WHEN "search_text" ~ '(meuble[^a-z0-9]+sous[^a-z0-9]*vasque|meuble[^a-z0-9]+sdb|meuble[^a-z0-9]+salle[^a-z0-9]+de[^a-z0-9]+bain)' THEN 15
      WHEN "search_text" ~ '(miroir|eclairage[^a-z0-9]+sdb)' THEN 13
      WHEN "search_text" ~ '(colonne|armoire)' AND "search_text" ~ '(sdb|salle[^a-z0-9]+de[^a-z0-9]+bain|bain)' THEN 14
      WHEN "search_text" ~ '(porte[^a-z0-9]*serviette|distributeur|patere|accessoire[^a-z0-9]+salle[^a-z0-9]+de[^a-z0-9]+bain)' THEN 12

      WHEN "search_text" ~ 'beton[^a-z0-9]+cire' THEN 36
      WHEN "search_text" ~ '(peinture|enduit|vernis)' THEN 35
      WHEN "search_text" ~ '(porte|chassis|menuiserie)' THEN 34
      WHEN "search_text" ~ '(luminaire|borne[^a-z0-9]+exterieure)' THEN 33
      WHEN "search_text" ~ '(treillis|fer[^a-z0-9]+a[^a-z0-9]+beton|armature)' THEN 39
      WHEN "search_text" ~ '(sable|gravier|granulat|grave)' THEN 38
      WHEN "search_text" ~ '(brique|hourdis)' THEN 37

      WHEN "search_text" ~ '(colle|joint|mortier|ciment[^a-z0-9]*colle|produit[^a-z0-9]+de[^a-z0-9]+pose|pose[^a-z0-9]+carrelage|carrojoint)' THEN 1
      WHEN "search_text" ~ '(profile|profil|plinthe|baguette)' THEN 2
      WHEN "search_text" ~ '(mosaique|decor|listel)' THEN 3
      WHEN "search_text" ~ '(carrelage|faience|gres|dalle)' THEN 4

      WHEN "search_text" ~ '(isolation|etancheite|adjuvant|ciment|jardin|batiment|materiau|piscine)' THEN 32
      ELSE 32
    END AS "product_type_id"
  FROM product_search
)
UPDATE "products" "product"
SET "product_type_id" = "classified_products"."product_type_id"
FROM "classified_products"
WHERE "product"."id" = "classified_products"."id"
  AND "product"."product_type_id" IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "products" WHERE "product_type_id" IS NULL) THEN
    RAISE EXCEPTION 'Cannot require products.product_type_id: some products still have no model.';
  END IF;
END $$;

ALTER TABLE "products"
  DROP CONSTRAINT IF EXISTS "products_product_type_id_fkey";

ALTER TABLE "products"
  ALTER COLUMN "product_type_id" SET NOT NULL;

ALTER TABLE "products"
  ADD CONSTRAINT "products_product_type_id_fkey"
  FOREIGN KEY ("product_type_id") REFERENCES "product_type_templates"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
