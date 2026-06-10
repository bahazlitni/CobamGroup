-- Enforce the catalog rule: a product or product type may use either Color or Finish, not both.
-- Finish is richer and wins whenever both attributes already exist.

CREATE TEMP TABLE "_color_finish_product_attributes" AS
SELECT
  "attribute"."id",
  "attribute"."product_id",
  CASE
    WHEN lower("attribute"."name") = 'color'
      OR "attribute"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
      OR lower(COALESCE("definition"."key", '')) = 'color'
      THEN 'color'
    WHEN lower("attribute"."name") = 'finish'
      OR "attribute"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
      OR lower(COALESCE("definition"."key", '')) = 'finish'
      THEN 'finish'
    ELSE NULL
  END AS "special_key"
FROM "product_attributes" "attribute"
LEFT JOIN "product_attribute_definitions" "definition"
  ON "definition"."id" = "attribute"."attribute_def_id";

DELETE FROM "product_attributes" "attribute"
USING "_color_finish_product_attributes" "color_attribute"
WHERE "attribute"."id" = "color_attribute"."id"
  AND "color_attribute"."special_key" = 'color'
  AND EXISTS (
    SELECT 1
    FROM "_color_finish_product_attributes" "finish_attribute"
    WHERE "finish_attribute"."product_id" = "color_attribute"."product_id"
      AND "finish_attribute"."special_key" = 'finish'
  );

CREATE TEMP TABLE "_color_finish_type_attributes" AS
SELECT
  "template_attribute"."id",
  "template_attribute"."product_type_id",
  CASE
    WHEN lower("definition"."key") = 'color'
      OR "definition"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
      THEN 'color'
    WHEN lower("definition"."key") = 'finish'
      OR "definition"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
      THEN 'finish'
    ELSE NULL
  END AS "special_key"
FROM "product_type_attributes" "template_attribute"
JOIN "product_attribute_definitions" "definition"
  ON "definition"."id" = "template_attribute"."attribute_definition_id";

DELETE FROM "product_type_attributes" "template_attribute"
USING "_color_finish_type_attributes" "color_attribute"
WHERE "template_attribute"."id" = "color_attribute"."id"
  AND "color_attribute"."special_key" = 'color'
  AND EXISTS (
    SELECT 1
    FROM "_color_finish_type_attributes" "finish_attribute"
    WHERE "finish_attribute"."product_type_id" = "color_attribute"."product_type_id"
      AND "finish_attribute"."special_key" = 'finish'
  );

WITH "template_flags" AS (
  SELECT
    "product_type"."id",
    EXISTS (
      SELECT 1
      FROM "product_type_attributes" "template_attribute"
      JOIN "product_attribute_definitions" "definition"
        ON "definition"."id" = "template_attribute"."attribute_definition_id"
      WHERE "template_attribute"."product_type_id" = "product_type"."id"
        AND (
          lower("definition"."key") = 'color'
          OR "definition"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
        )
    ) AS "has_color",
    EXISTS (
      SELECT 1
      FROM "product_type_attributes" "template_attribute"
      JOIN "product_attribute_definitions" "definition"
        ON "definition"."id" = "template_attribute"."attribute_definition_id"
      WHERE "template_attribute"."product_type_id" = "product_type"."id"
        AND (
          lower("definition"."key") = 'finish'
          OR "definition"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
        )
    ) AS "has_finish"
  FROM "product_type_templates" "product_type"
)
UPDATE "product_type_templates" "product_type"
SET
  "has_color" = "template_flags"."has_color",
  "has_finish" = "template_flags"."has_finish",
  "updated_at" = CURRENT_TIMESTAMP
FROM "template_flags"
WHERE "template_flags"."id" = "product_type"."id"
  AND (
    "product_type"."has_color" IS DISTINCT FROM "template_flags"."has_color"
    OR "product_type"."has_finish" IS DISTINCT FROM "template_flags"."has_finish"
  );

DO $$
DECLARE
  product_conflicts INTEGER;
  template_conflicts INTEGER;
  flag_mismatches INTEGER;
BEGIN
  WITH "special_attributes" AS (
    SELECT
      "attribute"."product_id",
      CASE
        WHEN lower("attribute"."name") = 'color'
          OR "attribute"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
          OR lower(COALESCE("definition"."key", '')) = 'color'
          THEN 'color'
        WHEN lower("attribute"."name") = 'finish'
          OR "attribute"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
          OR lower(COALESCE("definition"."key", '')) = 'finish'
          THEN 'finish'
        ELSE NULL
      END AS "special_key"
    FROM "product_attributes" "attribute"
    LEFT JOIN "product_attribute_definitions" "definition"
      ON "definition"."id" = "attribute"."attribute_def_id"
  )
  SELECT COUNT(*)
  INTO product_conflicts
  FROM (
    SELECT "product_id"
    FROM "special_attributes"
    WHERE "special_key" IN ('color', 'finish')
    GROUP BY "product_id"
    HAVING bool_or("special_key" = 'color') AND bool_or("special_key" = 'finish')
  ) "conflicts";

  IF product_conflicts > 0 THEN
    RAISE EXCEPTION 'Color/Finish pruning failed: % product(s) still have both attributes.', product_conflicts;
  END IF;

  WITH "special_template_attributes" AS (
    SELECT
      "template_attribute"."product_type_id",
      CASE
        WHEN lower("definition"."key") = 'color'
          OR "definition"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
          THEN 'color'
        WHEN lower("definition"."key") = 'finish'
          OR "definition"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
          THEN 'finish'
        ELSE NULL
      END AS "special_key"
    FROM "product_type_attributes" "template_attribute"
    JOIN "product_attribute_definitions" "definition"
      ON "definition"."id" = "template_attribute"."attribute_definition_id"
  )
  SELECT COUNT(*)
  INTO template_conflicts
  FROM (
    SELECT "product_type_id"
    FROM "special_template_attributes"
    WHERE "special_key" IN ('color', 'finish')
    GROUP BY "product_type_id"
    HAVING bool_or("special_key" = 'color') AND bool_or("special_key" = 'finish')
  ) "conflicts";

  IF template_conflicts > 0 THEN
    RAISE EXCEPTION 'Color/Finish pruning failed: % product type template(s) still have both attributes.', template_conflicts;
  END IF;

  WITH "template_flags" AS (
    SELECT
      "product_type"."id",
      EXISTS (
        SELECT 1
        FROM "product_type_attributes" "template_attribute"
        JOIN "product_attribute_definitions" "definition"
          ON "definition"."id" = "template_attribute"."attribute_definition_id"
        WHERE "template_attribute"."product_type_id" = "product_type"."id"
          AND (
            lower("definition"."key") = 'color'
            OR "definition"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
          )
      ) AS "has_color",
      EXISTS (
        SELECT 1
        FROM "product_type_attributes" "template_attribute"
        JOIN "product_attribute_definitions" "definition"
          ON "definition"."id" = "template_attribute"."attribute_definition_id"
        WHERE "template_attribute"."product_type_id" = "product_type"."id"
          AND (
            lower("definition"."key") = 'finish'
            OR "definition"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
          )
      ) AS "has_finish"
    FROM "product_type_templates" "product_type"
  )
  SELECT COUNT(*)
  INTO flag_mismatches
  FROM "product_type_templates" "product_type"
  JOIN "template_flags"
    ON "template_flags"."id" = "product_type"."id"
  WHERE "product_type"."has_color" IS DISTINCT FROM "template_flags"."has_color"
    OR "product_type"."has_finish" IS DISTINCT FROM "template_flags"."has_finish";

  IF flag_mismatches > 0 THEN
    RAISE EXCEPTION 'Color/Finish pruning failed: % product type template flag(s) do not match template attributes.', flag_mismatches;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION "prevent_product_attribute_color_finish_overlap"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_special_key TEXT;
  opposite_special_key TEXT;
BEGIN
  SELECT
    CASE
      WHEN lower(NEW."name") = 'color'
        OR NEW."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
        OR lower(COALESCE("definition"."key", '')) = 'color'
        THEN 'color'
      WHEN lower(NEW."name") = 'finish'
        OR NEW."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
        OR lower(COALESCE("definition"."key", '')) = 'finish'
        THEN 'finish'
      ELSE NULL
    END
  INTO new_special_key
  FROM (SELECT 1) "source"
  LEFT JOIN "product_attribute_definitions" "definition"
    ON "definition"."id" = NEW."attribute_def_id";

  IF new_special_key IS NULL THEN
    RETURN NEW;
  END IF;

  opposite_special_key := CASE WHEN new_special_key = 'color' THEN 'finish' ELSE 'color' END;

  IF EXISTS (
    SELECT 1
    FROM "product_attributes" "attribute"
    LEFT JOIN "product_attribute_definitions" "definition"
      ON "definition"."id" = "attribute"."attribute_def_id"
    WHERE "attribute"."product_id" = NEW."product_id"
      AND "attribute"."id" IS DISTINCT FROM NEW."id"
      AND (
        (opposite_special_key = 'color' AND (
          lower("attribute"."name") = 'color'
          OR "attribute"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
          OR lower(COALESCE("definition"."key", '')) = 'color'
        ))
        OR
        (opposite_special_key = 'finish' AND (
          lower("attribute"."name") = 'finish'
          OR "attribute"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
          OR lower(COALESCE("definition"."key", '')) = 'finish'
        ))
      )
  ) THEN
    RAISE EXCEPTION 'A product cannot have both Color and Finish attributes. Finish replaces Color.';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS "product_attributes_prevent_color_finish_overlap" ON "product_attributes";
CREATE TRIGGER "product_attributes_prevent_color_finish_overlap"
BEFORE INSERT OR UPDATE OF "product_id", "attribute_def_id", "name", "input_type"
ON "product_attributes"
FOR EACH ROW
EXECUTE FUNCTION "prevent_product_attribute_color_finish_overlap"();

CREATE OR REPLACE FUNCTION "prevent_product_type_attribute_color_finish_overlap"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_special_key TEXT;
  opposite_special_key TEXT;
BEGIN
  SELECT
    CASE
      WHEN lower("definition"."key") = 'color'
        OR "definition"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
        THEN 'color'
      WHEN lower("definition"."key") = 'finish'
        OR "definition"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
        THEN 'finish'
      ELSE NULL
    END
  INTO new_special_key
  FROM "product_attribute_definitions" "definition"
  WHERE "definition"."id" = NEW."attribute_definition_id";

  IF new_special_key IS NULL THEN
    RETURN NEW;
  END IF;

  opposite_special_key := CASE WHEN new_special_key = 'color' THEN 'finish' ELSE 'color' END;

  IF EXISTS (
    SELECT 1
    FROM "product_type_attributes" "template_attribute"
    JOIN "product_attribute_definitions" "definition"
      ON "definition"."id" = "template_attribute"."attribute_definition_id"
    WHERE "template_attribute"."product_type_id" = NEW."product_type_id"
      AND "template_attribute"."id" IS DISTINCT FROM NEW."id"
      AND (
        (opposite_special_key = 'color' AND (
          lower("definition"."key") = 'color'
          OR "definition"."input_type" = 'COLOR'::"ProductTypeAttributeInputType"
        ))
        OR
        (opposite_special_key = 'finish' AND (
          lower("definition"."key") = 'finish'
          OR "definition"."input_type" = 'FINISH'::"ProductTypeAttributeInputType"
        ))
      )
  ) THEN
    RAISE EXCEPTION 'A product type template cannot have both Color and Finish attributes. Finish replaces Color.';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS "product_type_attributes_prevent_color_finish_overlap" ON "product_type_attributes";
CREATE TRIGGER "product_type_attributes_prevent_color_finish_overlap"
BEFORE INSERT OR UPDATE OF "product_type_id", "attribute_definition_id"
ON "product_type_attributes"
FOR EACH ROW
EXECUTE FUNCTION "prevent_product_type_attribute_color_finish_overlap"();
