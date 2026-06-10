DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT
        COALESCE(folder_id, 0) AS normalized_folder_id,
        original_filename
      FROM media
      WHERE deleted_at IS NULL
        AND original_filename IS NOT NULL
      GROUP BY COALESCE(folder_id, 0), original_filename
      HAVING COUNT(*) > 1
    ) duplicates
  ) THEN
    RAISE EXCEPTION 'Cannot create media filename uniqueness rule: duplicate active original_filename values exist inside at least one folder.';
  END IF;
END $$;

CREATE UNIQUE INDEX "media_active_folder_original_filename_unique"
  ON "media" (COALESCE("folder_id", 0), "original_filename")
  WHERE "deleted_at" IS NULL
    AND "original_filename" IS NOT NULL;
