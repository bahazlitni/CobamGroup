-- Add the lifecycle enum value in its own committed migration.
-- PostgreSQL does not allow using a newly added enum value in the same transaction.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ProductLifecycle'
      AND e.enumlabel = 'DISCONTINUED'
  ) THEN
    ALTER TYPE "ProductLifecycle" ADD VALUE 'DISCONTINUED';
  END IF;
END $$;
