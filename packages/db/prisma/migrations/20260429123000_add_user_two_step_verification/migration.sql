ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "two_step_verification_enabled" BOOLEAN NOT NULL DEFAULT true;
