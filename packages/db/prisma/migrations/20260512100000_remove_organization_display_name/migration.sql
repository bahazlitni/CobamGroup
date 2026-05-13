-- Collapse Organization internal/display naming into a single canonical name.
-- Preserve the previously visible label when it differs from the internal name.
UPDATE "organizations"
SET "name" = "display_name"
WHERE "display_name" IS NOT NULL
  AND btrim("display_name") <> ''
  AND "name" IS DISTINCT FROM "display_name";

ALTER TABLE "organizations"
  DROP COLUMN IF EXISTS "display_name";
