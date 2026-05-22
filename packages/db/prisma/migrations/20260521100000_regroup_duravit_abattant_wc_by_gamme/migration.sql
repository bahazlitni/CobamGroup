-- Regroup Duravit Abattant WC products by gamme instead of one general brand family.
-- Note: the affected SKU list contains four Durastyle products, so all four are kept together.

DO $$
DECLARE
  "missing_count" INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO "missing_count"
  FROM (
    VALUES
      ('00242745'),
      ('00002938'),
      ('00000053'),
      ('00000967'),
      ('00002935'),
      ('00241564'),
      ('00213691'),
      ('00002934'),
      ('00242752'),
      ('00244060'),
      ('00253611'),
      ('00000050'),
      ('00000057'),
      ('00184069'),
      ('00189552'),
      ('00184076')
  ) AS "expected"("sku")
  LEFT JOIN "products" "product"
    ON "product"."sku" = "expected"."sku"
  WHERE "product"."id" IS NULL;

  IF "missing_count" > 0 THEN
    RAISE EXCEPTION 'Cannot regroup Duravit Abattant WC products: % affected SKU(s) are missing.', "missing_count";
  END IF;
END $$;

CREATE TEMP TABLE "_duravit_abattant_gammes" (
  "sku" TEXT PRIMARY KEY,
  "kind" "ProductKind" NOT NULL,
  "family_slug" TEXT,
  "family_name" TEXT,
  "family_subtitle" TEXT,
  "family_description" TEXT,
  "family_description_seo" TEXT,
  "sort_order" INTEGER NOT NULL
);

INSERT INTO "_duravit_abattant_gammes" (
  "sku", "kind", "family_slug", "family_name", "family_subtitle",
  "family_description", "family_description_seo", "sort_order"
)
VALUES
  ('00000053', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-d-code', 'Duravit D-Code', 'Abattants WC Duravit', 'Gamme Duravit D-Code : abattants WC sobres et fonctionnels pour completer une cuvette avec ou sans fermeture amortie.', 'Duravit D-Code : abattants WC compatibles disponibles chez COBAM GROUP.', 0),
  ('00000967', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-d-code', 'Duravit D-Code', 'Abattants WC Duravit', 'Gamme Duravit D-Code : abattants WC sobres et fonctionnels pour completer une cuvette avec ou sans fermeture amortie.', 'Duravit D-Code : abattants WC compatibles disponibles chez COBAM GROUP.', 1),

  ('00244060', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-combi-basic', 'Duravit Combi Basic', 'Abattants WC Duravit', 'Gamme Duravit Combi Basic : abattants WC pour une salle de bain nette, pratique et facile a entretenir.', 'Duravit Combi Basic : abattants WC compatibles disponibles chez COBAM GROUP.', 0),
  ('00253611', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-combi-basic', 'Duravit Combi Basic', 'Abattants WC Duravit', 'Gamme Duravit Combi Basic : abattants WC pour une salle de bain nette, pratique et facile a entretenir.', 'Duravit Combi Basic : abattants WC compatibles disponibles chez COBAM GROUP.', 1),

  ('00002935', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-durastyle', 'Duravit Durastyle', 'Abattants WC Duravit', 'Gamme Duravit Durastyle : abattants WC aux lignes simples, disponibles en versions classiques et rimless selon la cuvette.', 'Duravit Durastyle : abattants WC compatibles disponibles chez COBAM GROUP.', 0),
  ('00241564', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-durastyle', 'Duravit Durastyle', 'Abattants WC Duravit', 'Gamme Duravit Durastyle : abattants WC aux lignes simples, disponibles en versions classiques et rimless selon la cuvette.', 'Duravit Durastyle : abattants WC compatibles disponibles chez COBAM GROUP.', 1),
  ('00213691', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-durastyle', 'Duravit Durastyle', 'Abattants WC Duravit', 'Gamme Duravit Durastyle : abattants WC aux lignes simples, disponibles en versions classiques et rimless selon la cuvette.', 'Duravit Durastyle : abattants WC compatibles disponibles chez COBAM GROUP.', 2),
  ('00002934', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-durastyle', 'Duravit Durastyle', 'Abattants WC Duravit', 'Gamme Duravit Durastyle : abattants WC aux lignes simples, disponibles en versions classiques et rimless selon la cuvette.', 'Duravit Durastyle : abattants WC compatibles disponibles chez COBAM GROUP.', 3),

  ('00184069', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-me-by-starck', 'Duravit ME by Starck', 'Abattants WC Duravit', 'Gamme Duravit ME by Starck : abattants WC pour une salle de bain contemporaine, avec versions sur pied et suspendues.', 'Duravit ME by Starck : abattants WC compatibles disponibles chez COBAM GROUP.', 0),
  ('00189552', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-me-by-starck', 'Duravit ME by Starck', 'Abattants WC Duravit', 'Gamme Duravit ME by Starck : abattants WC pour une salle de bain contemporaine, avec versions sur pied et suspendues.', 'Duravit ME by Starck : abattants WC compatibles disponibles chez COBAM GROUP.', 1),
  ('00184076', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-me-by-starck', 'Duravit ME by Starck', 'Abattants WC Duravit', 'Gamme Duravit ME by Starck : abattants WC pour une salle de bain contemporaine, avec versions sur pied et suspendues.', 'Duravit ME by Starck : abattants WC compatibles disponibles chez COBAM GROUP.', 2),

  ('00000050', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-starck-3', 'Duravit Starck 3', 'Abattants WC Duravit', 'Gamme Duravit Starck 3 : abattants WC au dessin intemporel, proposes en version avec ou sans fermeture amortie.', 'Duravit Starck 3 : abattants WC compatibles disponibles chez COBAM GROUP.', 0),
  ('00000057', 'VARIANT'::"ProductKind", 'abattants-wc-duravit-starck-3', 'Duravit Starck 3', 'Abattants WC Duravit', 'Gamme Duravit Starck 3 : abattants WC au dessin intemporel, proposes en version avec ou sans fermeture amortie.', 'Duravit Starck 3 : abattants WC compatibles disponibles chez COBAM GROUP.', 1),

  ('00002938', 'SINGLE'::"ProductKind", NULL, NULL, NULL, NULL, NULL, 0),
  ('00242745', 'SINGLE'::"ProductKind", NULL, NULL, NULL, NULL, NULL, 0),
  ('00242752', 'SINGLE'::"ProductKind", NULL, NULL, NULL, NULL, NULL, 0);

INSERT INTO "product_families" (
  "slug", "name", "subtitle", "description", "description_seo", "created_at", "updated_at"
)
SELECT DISTINCT
  "family_slug",
  "family_name",
  "family_subtitle",
  "family_description",
  "family_description_seo",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "_duravit_abattant_gammes"
WHERE "family_slug" IS NOT NULL
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "subtitle" = EXCLUDED."subtitle",
  "description" = EXCLUDED."description",
  "description_seo" = EXCLUDED."description_seo",
  "updated_at" = CURRENT_TIMESTAMP;

DELETE FROM "product_family_members" "member"
USING "products" "product", "_duravit_abattant_gammes" "gamme"
WHERE "member"."product_id" = "product"."id"
  AND "product"."sku" = "gamme"."sku";

UPDATE "products" "product"
SET
  "kind" = "gamme"."kind",
  "updated_at" = CURRENT_TIMESTAMP
FROM "_duravit_abattant_gammes" "gamme"
WHERE "product"."sku" = "gamme"."sku";

INSERT INTO "product_family_members" ("family_id", "product_id", "sort_order")
SELECT
  "family"."id",
  "product"."id",
  "gamme"."sort_order"
FROM "_duravit_abattant_gammes" "gamme"
JOIN "products" "product"
  ON "product"."sku" = "gamme"."sku"
JOIN "product_families" "family"
  ON "family"."slug" = "gamme"."family_slug"
WHERE "gamme"."family_slug" IS NOT NULL
ON CONFLICT ("family_id", "product_id") DO UPDATE SET
  "sort_order" = EXCLUDED."sort_order";

WITH "ranked_defaults" AS (
  SELECT
    "gamme"."family_slug",
    "product"."id" AS "product_id",
    row_number() OVER (
      PARTITION BY "gamme"."family_slug"
      ORDER BY "product"."stock_available" DESC, "gamme"."sort_order" ASC
    ) AS "rank"
  FROM "_duravit_abattant_gammes" "gamme"
  JOIN "products" "product"
    ON "product"."sku" = "gamme"."sku"
  WHERE "gamme"."family_slug" IS NOT NULL
)
UPDATE "product_families" "family"
SET
  "default_product_id" = "ranked_defaults"."product_id",
  "updated_at" = CURRENT_TIMESTAMP
FROM "ranked_defaults"
WHERE "family"."slug" = "ranked_defaults"."family_slug"
  AND "ranked_defaults"."rank" = 1;

DELETE FROM "product_families" "family"
WHERE "family"."slug" = 'abattants-wc-duravit'
  AND NOT EXISTS (
    SELECT 1
    FROM "product_family_members" "member"
    WHERE "member"."family_id" = "family"."id"
  );

DROP TABLE "_duravit_abattant_gammes";
