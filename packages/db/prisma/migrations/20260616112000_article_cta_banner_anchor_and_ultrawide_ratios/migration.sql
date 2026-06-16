ALTER TYPE "ArticleCTABannerHorizontalAspectRatio" ADD VALUE IF NOT EXISTS 'RATIO_21_9';
ALTER TYPE "ArticleCTABannerHorizontalAspectRatio" ADD VALUE IF NOT EXISTS 'RATIO_24_9';
ALTER TYPE "ArticleCTABannerHorizontalAspectRatio" ADD VALUE IF NOT EXISTS 'RATIO_32_9';
ALTER TYPE "ArticleCTABannerHorizontalAspectRatio" ADD VALUE IF NOT EXISTS 'RATIO_3_1';
ALTER TYPE "ArticleCTABannerHorizontalAspectRatio" ADD VALUE IF NOT EXISTS 'RATIO_4_1';

CREATE TYPE "ArticleCTABannerAnchor" AS ENUM (
  'TOP_LEFT',
  'TOP_CENTER',
  'TOP_RIGHT',
  'CENTER_LEFT',
  'CENTER_CENTER',
  'CENTER_RIGHT',
  'BOTTOM_LEFT',
  'BOTTOM_CENTER',
  'BOTTOM_RIGHT'
);

ALTER TABLE "article_cta_banners"
  ADD COLUMN "anchor" "ArticleCTABannerAnchor" NOT NULL DEFAULT 'CENTER_CENTER';
