-- Add suggested preset tags and subcategory presets for the PDF product templates.
-- Tags are stored as space-separated single tokens because the staff tag input
-- serializes product tags with spaces.

WITH "template_tags" ("slug", "preset_tags") AS (
  VALUES
    ('carrelage-sol-mur', 'carrelage gres-cerame faience sol mur revetement grand-format antiderapant effet-beton effet-pierre effet-parquet'),
    ('mosaique-decor-listel', 'mosaique decor listel cabochon carrelage mural douche-italienne'),
    ('profile-plinthe-baguette', 'profile plinthe baguette finition carrelage angle bordure'),
    ('produit-pose-carrelage', 'colle joint carrelage pose finition mortier primaire croisillon adjuvant etancheite'),
    ('lavabo-lave-main', 'lavabo lave-main sanitaire salle-de-bain vasque suspendu monobloc'),
    ('vasque-bol-a-poser', 'vasque bol-a-poser salle-de-bain countertop sanitaire'),
    ('plan-vasque', 'plan-vasque meuble-sdb vasque salle-de-bain plan-toilette'),
    ('cuvette-wc', 'wc cuvette sanitaire suspendu monobloc rimless toilette'),
    ('abattant-wc', 'abattant-wc lunette-wc soft-close slim sanitaire toilette'),
    ('bati-support-reservoir-wc', 'bati-support reservoir-wc chasse encastre wc sanitaire'),
    ('plaque-commande-wc', 'plaque-commande chasse-wc bouton finition sanitaire wc'),
    ('meuble-sous-vasque', 'meuble-sous-vasque meuble-sdb salle-de-bain rangement vasque'),
    ('colonne-armoire-sdb', 'colonne-sdb armoire-sdb rangement salle-de-bain meuble'),
    ('miroir-eclairage-sdb', 'miroir-sdb eclairage led salle-de-bain applique'),
    ('accessoire-salle-de-bain', 'accessoire-sdb porte-serviette porte-papier brosse-wc patere'),
    ('mitigeur-lavabo-vasque', 'mitigeur lavabo vasque robinetterie salle-de-bain finition'),
    ('mitigeur-douche-bain', 'mitigeur douche bain-douche thermostatique robinetterie'),
    ('mitigeur-evier', 'mitigeur evier cuisine robinetterie bec-orientable'),
    ('corps-encastre-inverseur', 'corps-encastre inverseur robinetterie smartbox encastre'),
    ('colonne-barre-douche', 'colonne-douche barre-douche douche thermostatique robinetterie'),
    ('douchette-tete-bras-flexible', 'douchette tete-douche bras-douche flexible support-douche'),
    ('paroi-de-douche', 'paroi-douche douche verre profile receveur'),
    ('cabine-de-douche', 'cabine-douche douche verre receveur salle-de-bain'),
    ('receveur-caniveau', 'receveur caniveau douche evacuation grille antiderapant'),
    ('baignoire', 'baignoire bain acrylique ilot angle salle-de-bain'),
    ('baignoire-balneo-hydromassage', 'baignoire-balneo hydromassage jacuzzi jets bain'),
    ('accessoire-baignoire', 'accessoire-baignoire jupe-baignoire support repose-tete bain'),
    ('evier-cuisine', 'evier cuisine granite inox bac egouttoir'),
    ('bonde-siphon-vidage', 'bonde siphon vidage evacuation plomberie evier lavabo douche'),
    ('raccord-pvc-evacuation', 'raccord-pvc evacuation plomberie coude reduction manchon'),
    ('flexible-raccord-eau', 'flexible raccord-eau plomberie alimentation douche toilette'),
    ('porte-chassis', 'porte chassis porte-coulissante porte-bois menuiserie interieur exterieur'),
    ('luminaire-borne-exterieure', 'luminaire borne-exterieure applique eclairage exterieur jardin'),
    ('materiau-batiment-jardin', 'materiau-batiment jardin brique sable gravier ciment treillis beton isolation pierre')
)
UPDATE "product_type_templates" "templates"
SET
  "preset_tags" = "template_tags"."preset_tags",
  "updated_at" = CURRENT_TIMESTAMP
FROM "template_tags"
WHERE "templates"."slug" = "template_tags"."slug";

WITH "template_slugs" ("slug") AS (
  VALUES
    ('carrelage-sol-mur'),
    ('mosaique-decor-listel'),
    ('profile-plinthe-baguette'),
    ('produit-pose-carrelage'),
    ('lavabo-lave-main'),
    ('vasque-bol-a-poser'),
    ('plan-vasque'),
    ('cuvette-wc'),
    ('abattant-wc'),
    ('bati-support-reservoir-wc'),
    ('plaque-commande-wc'),
    ('meuble-sous-vasque'),
    ('colonne-armoire-sdb'),
    ('miroir-eclairage-sdb'),
    ('accessoire-salle-de-bain'),
    ('mitigeur-lavabo-vasque'),
    ('mitigeur-douche-bain'),
    ('mitigeur-evier'),
    ('corps-encastre-inverseur'),
    ('colonne-barre-douche'),
    ('douchette-tete-bras-flexible'),
    ('paroi-de-douche'),
    ('cabine-de-douche'),
    ('receveur-caniveau'),
    ('baignoire'),
    ('baignoire-balneo-hydromassage'),
    ('accessoire-baignoire'),
    ('evier-cuisine'),
    ('bonde-siphon-vidage'),
    ('raccord-pvc-evacuation'),
    ('flexible-raccord-eau'),
    ('porte-chassis'),
    ('luminaire-borne-exterieure'),
    ('materiau-batiment-jardin')
)
DELETE FROM "product_type_subcategory_presets" "presets"
USING "product_type_templates" "templates", "template_slugs"
WHERE "presets"."product_type_id" = "templates"."id"
  AND "templates"."slug" = "template_slugs"."slug";

WITH "template_subcategories" ("template_slug", "subcategory_id") AS (
  VALUES
    ('carrelage-sol-mur', 1),
    ('carrelage-sol-mur', 2),
    ('carrelage-sol-mur', 3),
    ('carrelage-sol-mur', 29),
    ('carrelage-sol-mur', 30),
    ('carrelage-sol-mur', 31),
    ('carrelage-sol-mur', 32),
    ('carrelage-sol-mur', 33),
    ('mosaique-decor-listel', 4),
    ('mosaique-decor-listel', 6),
    ('mosaique-decor-listel', 23),
    ('profile-plinthe-baguette', 4),
    ('profile-plinthe-baguette', 22),
    ('produit-pose-carrelage', 9),
    ('produit-pose-carrelage', 11),
    ('produit-pose-carrelage', 27),
    ('produit-pose-carrelage', 28),
    ('lavabo-lave-main', 17),
    ('vasque-bol-a-poser', 17),
    ('plan-vasque', 17),
    ('meuble-sous-vasque', 17),
    ('mitigeur-lavabo-vasque', 14),
    ('mitigeur-lavabo-vasque', 17),
    ('mitigeur-douche-bain', 14),
    ('mitigeur-douche-bain', 15),
    ('mitigeur-douche-bain', 18),
    ('mitigeur-evier', 13),
    ('mitigeur-evier', 14),
    ('corps-encastre-inverseur', 14),
    ('corps-encastre-inverseur', 18),
    ('colonne-barre-douche', 14),
    ('colonne-barre-douche', 18),
    ('douchette-tete-bras-flexible', 14),
    ('douchette-tete-bras-flexible', 18),
    ('paroi-de-douche', 18),
    ('cabine-de-douche', 18),
    ('receveur-caniveau', 11),
    ('receveur-caniveau', 18),
    ('baignoire', 15),
    ('baignoire-balneo-hydromassage', 15),
    ('baignoire-balneo-hydromassage', 16),
    ('accessoire-baignoire', 15),
    ('evier-cuisine', 13),
    ('bonde-siphon-vidage', 13),
    ('bonde-siphon-vidage', 17),
    ('bonde-siphon-vidage', 18),
    ('flexible-raccord-eau', 14),
    ('porte-chassis', 25),
    ('porte-chassis', 26),
    ('materiau-batiment-jardin', 7),
    ('materiau-batiment-jardin', 8),
    ('materiau-batiment-jardin', 9),
    ('materiau-batiment-jardin', 10),
    ('materiau-batiment-jardin', 11),
    ('materiau-batiment-jardin', 12),
    ('materiau-batiment-jardin', 22),
    ('materiau-batiment-jardin', 24)
)
INSERT INTO "product_type_subcategory_presets" (
  "product_type_id",
  "subcategory_id"
)
SELECT
  "templates"."id",
  "subcategories"."id"
FROM "template_subcategories"
JOIN "product_type_templates" "templates"
  ON "templates"."slug" = "template_subcategories"."template_slug"
JOIN "product_subcategories" "subcategories"
  ON "subcategories"."id" = "template_subcategories"."subcategory_id"
ON CONFLICT ("product_type_id", "subcategory_id") DO NOTHING;
