-- Support concurrent OTP attempts per account by binding each challenge to a browser-held secret.
ALTER TABLE "otp_challenges"
  DROP CONSTRAINT IF EXISTS "otp_challenges_user_id_type_key";

ALTER TABLE "otp_challenges"
  ADD COLUMN IF NOT EXISTS "challenge_token_hash" TEXT,
  ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "consumed_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "otp_challenges_user_id_type_created_at_idx"
  ON "otp_challenges"("user_id", "type", "created_at");

CREATE INDEX IF NOT EXISTS "otp_challenges_challenge_token_hash_idx"
  ON "otp_challenges"("challenge_token_hash");

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "consumed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_hash_key"
  ON "password_reset_tokens"("token_hash");

CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_created_at_idx"
  ON "password_reset_tokens"("user_id", "created_at");

CREATE INDEX IF NOT EXISTS "password_reset_tokens_expires_at_idx"
  ON "password_reset_tokens"("expires_at");

ALTER TABLE "password_reset_tokens"
  ADD CONSTRAINT "password_reset_tokens_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
