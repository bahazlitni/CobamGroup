ALTER TABLE "media_folders"
ADD COLUMN IF NOT EXISTS "protected" BOOLEAN NOT NULL DEFAULT false;

UPDATE "media_folders"
SET "protected" = true
WHERE "id" IN (1, 4, 5, 6, 7, 8, 9, 13, 22);
