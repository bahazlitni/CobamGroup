-- Improve the public rich text descriptions for Abattant WC products.
-- This migration expects the Abattant WC seed migration to have already inserted the products.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "product_type_templates" WHERE "id" = 7 AND "slug" = 'abattant-wc'
  ) THEN
    RAISE EXCEPTION 'Missing product_type_templates id 7 / abattant-wc.';
  END IF;
END $$;

WITH "abattants" AS (
  SELECT
    "product"."id",
    "product"."sku",
    "product"."display_name",
    "brand"."name" AS "brand_name",
    "color_attr"."value" AS "color_value",
    "finish_attr"."value" AS "finish_value",
    "soft_close_attr"."value" = 'true' AS "soft_close",
    "slim_attr"."value" = 'true' AS "slim_seat",
    "compatibility_attr"."value" AS "compatibility_notes"
  FROM "products" "product"
  LEFT JOIN "organizations" "brand"
    ON "brand"."id" = "product"."brand_id"
  LEFT JOIN "product_attributes" "color_attr"
    ON "color_attr"."product_id" = "product"."id"
    AND "color_attr"."name" = 'color'
  LEFT JOIN "product_attributes" "finish_attr"
    ON "finish_attr"."product_id" = "product"."id"
    AND "finish_attr"."name" = 'finish'
  LEFT JOIN "product_attributes" "soft_close_attr"
    ON "soft_close_attr"."product_id" = "product"."id"
    AND "soft_close_attr"."name" = 'soft_close'
  LEFT JOIN "product_attributes" "slim_attr"
    ON "slim_attr"."product_id" = "product"."id"
    AND "slim_attr"."name" = 'slim_seat'
  LEFT JOIN "product_attributes" "compatibility_attr"
    ON "compatibility_attr"."product_id" = "product"."id"
    AND "compatibility_attr"."name" = 'compatibility_notes'
  WHERE "product"."product_type_id" = 7
),
"copy" AS (
  SELECT
    "abattants".*,
    trim(concat_ws(
      ' ',
      CASE
        WHEN "brand_name" = 'Duravit' THEN 'Avec ses lignes maitrisees et son esprit sanitaire haut de gamme, cet abattant Duravit accompagne une salle de bain soignee jusque dans les details.'
        WHEN "brand_name" = 'GSI' AND "slim_seat" THEN 'Fin et precis, cet abattant GSI met l''accent sur une silhouette contemporaine et une presence visuelle plus legere sur la cuvette.'
        WHEN "brand_name" = 'GSI' THEN 'Cet abattant GSI s''adresse aux salles de bain qui recherchent une piece nette, fiable et coherente avec une ceramique de belle facture.'
        WHEN "brand_name" = 'Sanimed' THEN 'Pratique et facile a integrer, cet abattant Sanimed repond aux besoins d''un sanitaire quotidien avec une lecture claire et confortable.'
        WHEN "brand_name" = 'Ideal San' THEN 'Cet abattant Ideal San complete la cuvette avec une approche simple, propre et adaptee aux salles de bain familiales comme aux projets de renovation.'
        WHEN "brand_name" = 'Idevit' THEN 'Cet abattant Idevit privilegie une finition nette et une utilisation naturelle, pour garder une salle de bain lisible et bien equipee.'
        WHEN "brand_name" = 'Geberit' THEN 'Sobre et fonctionnel, cet abattant Geberit prolonge l''esprit technique de la marque avec une piece discrete mais importante au quotidien.'
        WHEN "brand_name" = 'Vitra' THEN 'Cet abattant Vitra apporte une reponse elegante et rationnelle pour finaliser une cuvette avec une finition propre.'
        WHEN "brand_name" = 'Gala' THEN 'Cet abattant Gala garde une ligne simple et lumineuse, adaptee aux sanitaires que l''on veut faciles a vivre et faciles a entretenir.'
        WHEN "brand_name" = 'Turkuaz' THEN 'Cet abattant Turkuaz offre une solution accessible et directe pour equiper une cuvette sans complexifier le choix.'
        WHEN "brand_name" IS NOT NULL THEN "brand_name" || ' propose ici un abattant WC pense pour completer la cuvette avec une finition propre et un usage quotidien naturel.'
        ELSE 'Cet abattant WC apporte une solution simple et propre pour equiper ou renouveler une cuvette dans une salle de bain, un sanitaire invite ou un espace professionnel.'
      END,
      CASE
        WHEN "compatibility_notes" IS NOT NULL THEN 'Il est associe a la reference ' || "compatibility_notes" || ', un repere utile pour confirmer le bon accord avec votre installation.'
        ELSE NULL
      END
    )) AS "intro_text",
    trim(concat_ws(
      ' ',
      CASE
        WHEN "finish_value" IS NOT NULL THEN 'Sa finition ' || lower("finish_value") || ' renforce la sensation de proprete et facilite l''accord avec les autres equipements sanitaires.'
        ELSE NULL
      END,
      CASE
        WHEN "color_value" IS NOT NULL THEN 'La teinte ' || lower("color_value") || ' permet de garder une lecture harmonieuse avec la ceramique, le meuble vasque et la robinetterie.'
        ELSE NULL
      END,
      CASE
        WHEN "soft_close" THEN 'La fermeture amortie accompagne le geste et limite les claquements a l''usage.'
        ELSE 'La fermeture classique reste directe, simple et facile a manipuler au quotidien.'
      END,
      CASE
        WHEN "slim_seat" THEN 'Son profil slim affine visuellement la cuvette et donne un rendu plus contemporain.'
        ELSE NULL
      END
    )) AS "detail_text",
    CASE
      WHEN "compatibility_notes" IS NOT NULL THEN 'Avant commande, verifiez la compatibilite avec votre cuvette ou votre reference existante : ' || "compatibility_notes" || '.'
      ELSE 'Avant commande, comparez les dimensions et les points de fixation avec votre cuvette afin de confirmer la compatibilite.'
    END AS "advice_text"
  FROM "abattants"
)
UPDATE "products" "product"
SET
  "rich_text_description" = jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'heading',
        'attrs', jsonb_build_object('level', 2),
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "copy"."display_name"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "copy"."intro_text"))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "copy"."detail_text"))
      ),
      jsonb_build_object(
        'type', 'bulletList',
        'content', jsonb_build_array(
          jsonb_build_object(
            'type', 'listItem',
            'content', jsonb_build_array(jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(jsonb_build_object(
                'type', 'text',
                'text',
                CASE
                  WHEN "copy"."soft_close" THEN 'Fermeture amortie pour un confort d''utilisation plus discret.'
                  ELSE 'Fermeture classique pour une utilisation simple et immediate.'
                END
              ))
            ))
          ),
          jsonb_build_object(
            'type', 'listItem',
            'content', jsonb_build_array(jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(jsonb_build_object(
                'type', 'text',
                'text',
                CASE
                  WHEN "copy"."slim_seat" THEN 'Design slim, ideal pour une cuvette au rendu plus leger.'
                  ELSE 'Forme fonctionnelle adaptee aux usages quotidiens.'
                END
              ))
            ))
          ),
          jsonb_build_object(
            'type', 'listItem',
            'content', jsonb_build_array(jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', "copy"."advice_text"))
            ))
          )
        )
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Reference COBAM : ' || "copy"."sku" || '.'))
      )
    )
  ),
  "description_seo" = left(
    "copy"."display_name" || ' : abattant WC pour salle de bain, avec compatibilite et finitions a verifier chez COBAM GROUP.',
    160
  ),
  "updated_at" = CURRENT_TIMESTAMP
FROM "copy"
WHERE "product"."id" = "copy"."id";
