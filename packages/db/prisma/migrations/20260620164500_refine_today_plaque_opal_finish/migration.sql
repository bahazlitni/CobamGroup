-- Correct the Jaquar Opal finish after visual media review.
-- The product image shows a doré brossé plate, while the initial seed used a conservative chrome finish.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "products" WHERE "sku" = '00232852') THEN
    RAISE EXCEPTION 'Jaquar Opal finish refinement aborted: product SKU 00232852 is missing.';
  END IF;
END $$;

INSERT INTO "product_finishes" ("key", "label", "color", "created_at", "updated_at")
VALUES ('DORE_BROSSE', 'Doré brossé', '#C8A24A', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

UPDATE "products"
SET
  "slug" = 'plaque-commande-opal-dore-brosse-jaquar-jcp-gbp-152415pd',
  "display_name" = 'Plaque de commande Opal doré brossé Jaquar',
  "rich_text_description" = jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Cette plaque de contrôle Jaquar Opal apporte une finition doré brossé élégante pour finaliser un système de chasse encastré.'))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Le guide d''installation fourni accompagne la pose de la plaque et les étapes de fixation. Son design à double touche convient aux salles de bain modernes recherchant une finition décorative et soignée autour du WC.'))
      )
    )
  )::json,
  "title_seo" = 'Plaque Opal doré brossé Jaquar',
  "description_seo" = 'Plaque de contrôle Jaquar Opal doré brossé pour WC encastré, avec double touche et guide d''installation.',
  "tags" = 'plaque-commande wc chasse jaquar opal jcp-gbp-152415pd dore-brosse or brosse plaque-controle salle-de-bain bati-support encastre',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "sku" = '00232852';

UPDATE "product_attributes" "attribute"
SET
  "value" = 'Doré brossé'
FROM "products" "product"
WHERE "attribute"."product_id" = "product"."id"
  AND "product"."sku" = '00232852'
  AND "attribute"."name" = 'finish';

UPDATE "product_media" "product_media"
SET
  "name" = CASE "product_media"."media_id"
    WHEN 1904 THEN 'Plaque de commande Opal doré brossé Jaquar 1'
    WHEN 1905 THEN 'Plaque de commande Opal doré brossé Jaquar 2'
    WHEN 1906 THEN 'Plaque de commande Opal doré brossé Jaquar 3'
    ELSE "product_media"."name"
  END,
  "alt_text" = CASE "product_media"."media_id"
    WHEN 1904 THEN 'Plaque de commande Jaquar Opal doré brossé'
    WHEN 1905 THEN 'Plaque de contrôle Jaquar Opal doré brossé vue de détail'
    WHEN 1906 THEN 'Plaque WC Jaquar Opal doré brossé'
    ELSE "product_media"."alt_text"
  END,
  "updated_at" = CURRENT_TIMESTAMP
FROM "products" "product"
WHERE "product_media"."product_id" = "product"."id"
  AND "product"."sku" = '00232852'
  AND "product_media"."media_id" IN (1904, 1905, 1906);

DO $$
DECLARE
  finish_value TEXT;
  product_slug TEXT;
  updated_media_count INTEGER;
BEGIN
  SELECT "attribute"."value"
  INTO finish_value
  FROM "product_attributes" "attribute"
  JOIN "products" "product"
    ON "product"."id" = "attribute"."product_id"
  WHERE "product"."sku" = '00232852'
    AND "attribute"."name" = 'finish';

  IF finish_value <> 'Doré brossé' THEN
    RAISE EXCEPTION 'Jaquar Opal finish refinement failed: expected finish Doré brossé, found %.', finish_value;
  END IF;

  SELECT "slug"
  INTO product_slug
  FROM "products"
  WHERE "sku" = '00232852';

  IF product_slug <> 'plaque-commande-opal-dore-brosse-jaquar-jcp-gbp-152415pd' THEN
    RAISE EXCEPTION 'Jaquar Opal finish refinement failed: unexpected slug %.', product_slug;
  END IF;

  SELECT COUNT(*)
  INTO updated_media_count
  FROM "product_media" "product_media"
  JOIN "products" "product"
    ON "product"."id" = "product_media"."product_id"
  WHERE "product"."sku" = '00232852'
    AND "product_media"."media_id" IN (1904, 1905, 1906)
    AND "product_media"."alt_text" ILIKE '%doré brossé%';

  IF updated_media_count <> 3 THEN
    RAISE EXCEPTION 'Jaquar Opal finish refinement failed: expected 3 updated gallery alt texts, found %.', updated_media_count;
  END IF;
END $$;
