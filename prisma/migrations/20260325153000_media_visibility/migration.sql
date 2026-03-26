CREATE TYPE "public"."MediaVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

ALTER TABLE "public"."media"
ADD COLUMN "visibility" "public"."MediaVisibility" NOT NULL DEFAULT 'PRIVATE';
