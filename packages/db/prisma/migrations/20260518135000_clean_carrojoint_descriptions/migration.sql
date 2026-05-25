-- Replace generated Carrojoint descriptions with product-line descriptions.
-- The seed migration initially copied static import details into the rich text.
-- This cleanup keeps SKU-specific color, range and packaging, but removes
-- stock/import narration from all public description fields.

BEGIN;

CREATE TEMP TABLE "_carrojoint_family_copy" ON COMMIT DROP AS
SELECT *
FROM (
  VALUES
    (
      'deutsch-color',
      'Carrojoint Deutsch Color',
      'Mortiers de jointoiement cimentaires Deutsch Color pour joints fins de carrelage.',
      'Les Carrojoint Deutsch Color sont des mortiers de jointoiement a base de ciment, charges minerales sélectionnées, resines, additifs hydrophobes et pigments. La gamme est adaptee aux joints fins des revetements ceramiques, gres, faience, porcelaine et pierres naturelles, avec une finition lisse et facile a nettoyer.',
      'Finition de joints de sols et murs, interieurs et exterieurs selon la gamme, pour projets residentiels, showrooms, salles d''eau, terrasses et zones soumises aux variations de temperature.',
      'Bonne maniabilite, nettoyage aise, rendu lisse, resistance a l''eau, aux UV, aux detergents et aux alcalis. Les variantes Intense renforcent le profil technique pour les zones humides et les usages exigeants.',
      'Joint de carrelage Deutsch Color pour sols et murs, disponible en plusieurs teintes et conditionnements chez COBAM GROUP.'
    ),
    (
      'sika',
      'Carrojoint Sika',
      'SikaCeram CleanGrout, mortier de jointoiement cimentaire hautes performances.',
      'Les Carrojoint Sika correspondent à la famille SikaCeram CleanGrout : un mortier de jointoiement premelange a base de ciment, sable de quartz sélectionné et additifs specifiques pour joints de 1 a 8 mm. La formulation vise une finition hydrofuge, stable en couleur et adaptee aux carreaux techniques.',
      'Jointoiement de carreaux ceramiques, terre cuite, mosaique de verre, marbre, pierres naturelles et gres. Convient aussi aux pieces humides, piscines, sols chauffants, facades et locaux soumis a de fortes sollicitations.',
      'Classe CG2 WA selon EN 13888, absorption d''eau limitee, haute resistance a l''usure, durete elevee, resistance aux UV et au gel, protection contre moisissures, bacteries et champignons.',
      'SikaCeram CleanGrout en sac de 5 kg pour joints de carrelage 1 a 8 mm, sols et murs, chez COBAM GROUP.'
    ),
    (
      'vitrafix',
      'Carrojoint VitraFix',
      'VitraFix 1-6 mm, joint cimentaire standard pour joints fins interieurs.',
      'Les Carrojoint VitraFix sont des joints cimentaires pour joints de 1 a 6 mm. La formulation est concue pour les revetements en carreaux ceramiques, marbre, pierre naturelle, travertin et mosaique de verre, avec une surface lisse et une application rapide.',
      'Application interieure sur sols et murs carrelage lorsque le projet demande une teinte reguliere, un remplissage propre et un joint fin facile a travailler.',
      'Surface lisse, nettoyage facile, resistance a l''abrasion, faible retrait, limitation du risque de fissuration ou d''affaissement du joint.',
      'VitraFix 1-6 mm, joint de carrelage flexible et facile a appliquer, disponible chez COBAM GROUP.'
    ),
    (
      'derbigum',
      'Carrojoint Derbigum',
      'Derbigum Carojoin, mortier joint impermeable pour revetements.',
      'Les Carrojoint Derbigum sont des mortiers joints impermeables, predoses en usine, a base de liants hydrauliques, charges, resines et adjuvants speciaux. Le produit se melange a l''eau sur chantier pour realiser les joints de revetements.',
      'Jointoiement de revetements de sols et murs lorsque le projet demande une solution simple, mineralisee et resistante a l''humidite.',
      'Mortier poudre pret a gacher, rendu mineral, bonne tenue du joint et profil impermeable pour les travaux courants de finition carrelage.',
      'Carrojoint Derbigum, mortier joint impermeable pour revetements de sols et murs chez COBAM GROUP.'
    ),
    (
      'turkqua',
      'Carrojoint Turkqua',
      'Turkqua, mortier de jointement issu d''une gamme de produits chimiques du batiment.',
      'Le Carrojoint Turkqua appartient a une famille de mortiers et mastics de jointement pour carrelage. La marque developpe des produits de mortier sec, colles, etancheite et solutions de finition destines aux chantiers de construction et de renovation.',
      'Jointoiement de carrelage et finitions minerales dans les projets courants ou une teinte beige sobre est recherchee.',
      'Mortier de jointement en poudre, pense pour une application de chantier, une finition propre et une integration simple dans les travaux de pose carrelage.',
      'Carrojoint Turkqua beige pour jointoiement de carrelage, disponible chez COBAM GROUP.'
    )
) AS "x"(
  "brand_slug",
  "family_name",
  "family_subtitle",
  "family_description",
  "family_application",
  "family_advantages",
  "family_description_seo"
);

CREATE TEMP TABLE "_carrojoint_scope" ON COMMIT DROP AS
SELECT
  "products"."id",
  "products"."sku",
  "products"."display_name",
  "products"."name",
  "brands"."slug" AS "brand_slug",
  "brands"."name" AS "brand_name",
  "families"."slug" AS "family_slug",
  "copy"."family_name",
  "copy"."family_subtitle",
  "copy"."family_description",
  "copy"."family_application",
  "copy"."family_advantages",
  "copy"."family_description_seo",
  NULLIF("color_attr"."value", '') AS "color_label",
  NULLIF("packaging_attr"."value", '') AS "packaging_weight_kg",
  NULLIF("range_attr"."value", '') AS "product_range",
  NULLIF("joint_attr"."value", '') AS "joint_width_mm",
  COALESCE(NULLIF("waterproof_attr"."value", ''), 'false') AS "waterproof"
FROM "products"
JOIN "organizations" "brands" ON "brands"."id" = "products"."brand_id"
JOIN "product_family_members" "members" ON "members"."product_id" = "products"."id"
JOIN "product_families" "families" ON "families"."id" = "members"."family_id"
JOIN "_carrojoint_family_copy" "copy" ON "copy"."brand_slug" = "brands"."slug"
LEFT JOIN "product_attributes" "color_attr"
  ON "color_attr"."product_id" = "products"."id"
 AND "color_attr"."name" = 'color'
LEFT JOIN "product_attributes" "packaging_attr"
  ON "packaging_attr"."product_id" = "products"."id"
 AND "packaging_attr"."name" = 'packaging_weight_kg'
LEFT JOIN "product_attributes" "range_attr"
  ON "range_attr"."product_id" = "products"."id"
 AND "range_attr"."name" = 'product_range'
LEFT JOIN "product_attributes" "joint_attr"
  ON "joint_attr"."product_id" = "products"."id"
 AND "joint_attr"."name" = 'joint_width_mm'
LEFT JOIN "product_attributes" "waterproof_attr"
  ON "waterproof_attr"."product_id" = "products"."id"
 AND "waterproof_attr"."name" = 'waterproof'
WHERE "families"."slug" IN (
  'carrojoint-deutsch-color',
  'carrojoint-sika',
  'carrojoint-vitrafix',
  'carrojoint-derbigum',
  'carrojoint-turkqua'
);

UPDATE "product_families" "families"
SET
  "subtitle" = "copy"."family_subtitle",
  "description" = "copy"."family_description",
  "description_seo" = left("copy"."family_description_seo", 160),
  "updated_at" = CURRENT_TIMESTAMP
FROM "_carrojoint_family_copy" "copy"
WHERE "families"."slug" = 'carrojoint-' || "copy"."brand_slug";

WITH "copy" AS (
  SELECT
    "scope".*,
    CASE
      WHEN "scope"."color_label" IS NULL THEN ''
      ELSE ' La teinte ' || "scope"."color_label" || ' permet d''accorder le joint au carrelage, au format et a l''ambiance du projet.'
    END AS "color_sentence",
    CASE
      WHEN "scope"."product_range" = 'Intense' THEN ' Cette variante Intense est orientee vers les zones humides, les surfaces exposees et les finitions demandant une meilleure resistance a l''eau.'
      WHEN "scope"."product_range" = 'Flex' THEN ' Cette variante Flex cible les joints fins de 1 a 6 mm avec une application souple et une finition reguliere.'
      WHEN "scope"."product_range" = 'SikaCeram' THEN ' Cette variante SikaCeram CleanGrout est adaptee aux joints techniques de sols et murs, y compris en pieces humides et zones sollicitees.'
      ELSE ''
    END AS "range_sentence",
    CASE
      WHEN "scope"."waterproof" = 'true' THEN ' Le libelle etanche indique une finition pensee pour limiter la penetration de l''eau dans le joint.'
      ELSE ''
    END AS "waterproof_sentence",
    CASE
      WHEN "scope"."packaging_weight_kg" IS NULL THEN ''
      ELSE 'Conditionnement : sac de ' || "scope"."packaging_weight_kg" || ' kg.'
    END AS "packaging_sentence",
    CASE
      WHEN "scope"."joint_width_mm" IS NULL THEN ''
      ELSE 'Largeur de joint recommandee : ' || "scope"."joint_width_mm" || ' mm.'
    END AS "joint_sentence"
  FROM "_carrojoint_scope" "scope"
)
UPDATE "products"
SET
  "short_description" = left(
    trim(
      COALESCE("copy"."brand_name", '') ||
      ' - mortier de jointoiement pour carrelage' ||
      CASE WHEN "copy"."color_label" IS NULL THEN '' ELSE ', teinte ' || "copy"."color_label" END ||
      CASE WHEN "copy"."packaging_weight_kg" IS NULL THEN '' ELSE ', sac ' || "copy"."packaging_weight_kg" || ' kg' END ||
      '.'
    ),
    500
  ),
  "title_seo" = left(
    trim(
      'Joint carrelage ' ||
      COALESCE("copy"."brand_name", '') ||
      CASE WHEN "copy"."color_label" IS NULL THEN '' ELSE ' ' || "copy"."color_label" END ||
      CASE WHEN "copy"."packaging_weight_kg" IS NULL THEN '' ELSE ' ' || "copy"."packaging_weight_kg" || 'kg' END ||
      ' | COBAM GROUP'
    ),
    60
  ),
  "description_seo" = left(
    trim(
      COALESCE("copy"."brand_name", '') ||
      CASE WHEN "copy"."color_label" IS NULL THEN '' ELSE ' ' || "copy"."color_label" END ||
      ' : mortier de jointoiement pour carrelage sols et murs' ||
      CASE WHEN "copy"."packaging_weight_kg" IS NULL THEN '' ELSE ', sac ' || "copy"."packaging_weight_kg" || ' kg' END ||
      ', sélectionné par COBAM GROUP.'
    ),
    160
  ),
  "rich_text_description" = jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'heading',
        'attrs', jsonb_build_object('level', 2),
        'content', jsonb_build_array(jsonb_build_object(
          'type', 'text',
          'text', trim(
            'Joint de carrelage ' ||
            COALESCE("copy"."brand_name", '') ||
            CASE WHEN "copy"."color_label" IS NULL THEN '' ELSE ' - ' || "copy"."color_label" END
          )
        ))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object(
          'type', 'text',
          'text', trim(
            "copy"."family_description" ||
            "copy"."color_sentence" ||
            "copy"."range_sentence" ||
            "copy"."waterproof_sentence"
          )
        ))
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object(
          'type', 'text',
          'text', "copy"."family_application"
        ))
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
                'text', "copy"."family_advantages"
              ))
            ))
          ),
          jsonb_build_object(
            'type', 'listItem',
            'content', jsonb_build_array(jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(jsonb_build_object(
                'type', 'text',
                'text', COALESCE(NULLIF("copy"."packaging_sentence", ''), 'Conditionnement selon variante.')
              ))
            ))
          ),
          jsonb_build_object(
            'type', 'listItem',
            'content', jsonb_build_array(jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(jsonb_build_object(
                'type', 'text',
                'text', COALESCE(
                  NULLIF("copy"."joint_sentence", ''),
                  CASE
                    WHEN "copy"."brand_slug" = 'sika' THEN 'Largeur de joint indicative : 1 a 8 mm.'
                    WHEN "copy"."brand_slug" IN ('deutsch-color', 'vitrafix') THEN 'Largeur de joint indicative : joints fins jusqu''a 6 mm selon la gamme.'
                    ELSE 'Largeur de joint selon support, format et fiche technique du produit.'
                  END
                )
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
                    WHEN "copy"."color_label" IS NULL THEN 'Teinte a confirmer sur nuancier et echantillon chantier.'
                    ELSE 'Teinte : ' || "copy"."color_label" || '. Toujours verifier le rendu sur nuancier et sur un essai chantier avant pose definitive.'
                  END
              ))
            ))
          )
        )
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(jsonb_build_object(
          'type', 'text',
          'text', 'Pour un resultat regulier, respecter les dosages d''eau, le temps de repos, le nettoyage a l''eponge et les delais de mise en service indiques dans la fiche technique de la marque.'
        ))
      )
    )
  ),
  "updated_at" = CURRENT_TIMESTAMP,
  "last_updated_by_id" = 'cmnnfemzf00008wg9iwn6hacx'
FROM "copy"
WHERE "products"."id" = "copy"."id";

COMMIT;
