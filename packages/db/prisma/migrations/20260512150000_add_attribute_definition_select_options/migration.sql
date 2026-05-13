ALTER TABLE "product_attribute_definitions"
  ADD COLUMN "select_options" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- COLOR and FINISH are built-in attribute data types. Collapse any legacy
-- duplicates onto one canonical definition before enforcing uniqueness.
WITH canonical AS (
  SELECT "id"
  FROM "product_attribute_definitions"
  WHERE "input_type" = 'COLOR'
  ORDER BY CASE WHEN "key" = 'COLOR' THEN 0 ELSE 1 END, "id"
  LIMIT 1
),
ranked_template_attributes AS (
  SELECT
    pta."id",
    ROW_NUMBER() OVER (
      PARTITION BY pta."product_type_id"
      ORDER BY
        CASE WHEN pta."attribute_definition_id" = (SELECT "id" FROM canonical) THEN 0 ELSE 1 END,
        pta."sort_order",
        pta."id"
    ) AS "rank"
  FROM "product_type_attributes" pta
  JOIN "product_attribute_definitions" pad
    ON pad."id" = pta."attribute_definition_id"
  WHERE pad."input_type" = 'COLOR'
)
DELETE FROM "product_type_attributes"
WHERE "id" IN (
  SELECT "id"
  FROM ranked_template_attributes
  WHERE "rank" > 1
);

WITH canonical AS (
  SELECT "id"
  FROM "product_attribute_definitions"
  WHERE "input_type" = 'COLOR'
  ORDER BY CASE WHEN "key" = 'COLOR' THEN 0 ELSE 1 END, "id"
  LIMIT 1
)
UPDATE "product_type_attributes" pta
SET "attribute_definition_id" = (SELECT "id" FROM canonical)
FROM "product_attribute_definitions" pad
WHERE pad."id" = pta."attribute_definition_id"
  AND pad."input_type" = 'COLOR'
  AND pta."attribute_definition_id" <> (SELECT "id" FROM canonical);

WITH canonical AS (
  SELECT "id"
  FROM "product_attribute_definitions"
  WHERE "input_type" = 'COLOR'
  ORDER BY CASE WHEN "key" = 'COLOR' THEN 0 ELSE 1 END, "id"
  LIMIT 1
)
UPDATE "product_attributes" pa
SET "attribute_def_id" = (SELECT "id" FROM canonical)
FROM "product_attribute_definitions" pad
WHERE pad."id" = pa."attribute_def_id"
  AND pad."input_type" = 'COLOR'
  AND pa."attribute_def_id" <> (SELECT "id" FROM canonical);

WITH canonical AS (
  SELECT "id"
  FROM "product_attribute_definitions"
  WHERE "input_type" = 'COLOR'
  ORDER BY CASE WHEN "key" = 'COLOR' THEN 0 ELSE 1 END, "id"
  LIMIT 1
)
DELETE FROM "product_attribute_definitions"
WHERE "input_type" = 'COLOR'
  AND "id" <> (SELECT "id" FROM canonical);

WITH canonical AS (
  SELECT "id"
  FROM "product_attribute_definitions"
  WHERE "input_type" = 'FINISH'
  ORDER BY CASE WHEN "key" = 'FINISH' THEN 0 ELSE 1 END, "id"
  LIMIT 1
),
ranked_template_attributes AS (
  SELECT
    pta."id",
    ROW_NUMBER() OVER (
      PARTITION BY pta."product_type_id"
      ORDER BY
        CASE WHEN pta."attribute_definition_id" = (SELECT "id" FROM canonical) THEN 0 ELSE 1 END,
        pta."sort_order",
        pta."id"
    ) AS "rank"
  FROM "product_type_attributes" pta
  JOIN "product_attribute_definitions" pad
    ON pad."id" = pta."attribute_definition_id"
  WHERE pad."input_type" = 'FINISH'
)
DELETE FROM "product_type_attributes"
WHERE "id" IN (
  SELECT "id"
  FROM ranked_template_attributes
  WHERE "rank" > 1
);

WITH canonical AS (
  SELECT "id"
  FROM "product_attribute_definitions"
  WHERE "input_type" = 'FINISH'
  ORDER BY CASE WHEN "key" = 'FINISH' THEN 0 ELSE 1 END, "id"
  LIMIT 1
)
UPDATE "product_type_attributes" pta
SET "attribute_definition_id" = (SELECT "id" FROM canonical)
FROM "product_attribute_definitions" pad
WHERE pad."id" = pta."attribute_definition_id"
  AND pad."input_type" = 'FINISH'
  AND pta."attribute_definition_id" <> (SELECT "id" FROM canonical);

WITH canonical AS (
  SELECT "id"
  FROM "product_attribute_definitions"
  WHERE "input_type" = 'FINISH'
  ORDER BY CASE WHEN "key" = 'FINISH' THEN 0 ELSE 1 END, "id"
  LIMIT 1
)
UPDATE "product_attributes" pa
SET "attribute_def_id" = (SELECT "id" FROM canonical)
FROM "product_attribute_definitions" pad
WHERE pad."id" = pa."attribute_def_id"
  AND pad."input_type" = 'FINISH'
  AND pa."attribute_def_id" <> (SELECT "id" FROM canonical);

WITH canonical AS (
  SELECT "id"
  FROM "product_attribute_definitions"
  WHERE "input_type" = 'FINISH'
  ORDER BY CASE WHEN "key" = 'FINISH' THEN 0 ELSE 1 END, "id"
  LIMIT 1
)
DELETE FROM "product_attribute_definitions"
WHERE "input_type" = 'FINISH'
  AND "id" <> (SELECT "id" FROM canonical);

CREATE UNIQUE INDEX "product_attribute_definitions_single_color_type_idx"
  ON "product_attribute_definitions"("input_type")
  WHERE "input_type" = 'COLOR';

CREATE UNIQUE INDEX "product_attribute_definitions_single_finish_type_idx"
  ON "product_attribute_definitions"("input_type")
  WHERE "input_type" = 'FINISH';
