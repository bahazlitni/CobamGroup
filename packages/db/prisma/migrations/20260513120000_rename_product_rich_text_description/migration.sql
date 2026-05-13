DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'richTextDescription'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'rich_text_description'
  ) THEN
    ALTER TABLE "products" RENAME COLUMN "richTextDescription" TO "rich_text_description";
  END IF;
END $$;

ALTER TABLE "products"
  ALTER COLUMN "rich_text_description" TYPE JSON USING "rich_text_description"::JSON;
