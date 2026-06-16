-- CreateEnum
CREATE TYPE "ArticleCTABannerHorizontalAspectRatio" AS ENUM (
  'SQUARE',
  'RATIO_21_10',
  'RATIO_16_9',
  'RATIO_16_10',
  'RATIO_5_4',
  'RATIO_4_3',
  'RATIO_3_2',
  'RATIO_7_5',
  'RATIO_2_1'
);

-- CreateTable
CREATE TABLE "article_cta_banners" (
  "id" BIGSERIAL NOT NULL,
  "article_id" BIGINT NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "image_id" BIGINT,
  "background_color" VARCHAR(30) NOT NULL DEFAULT '#14202e',
  "horizontal_aspect_ratio" "ArticleCTABannerHorizontalAspectRatio" NOT NULL DEFAULT 'RATIO_21_10',
  "approx_position_percentage" INTEGER NOT NULL DEFAULT 50,
  "href" VARCHAR(500),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "article_cta_banners_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "article_cta_banners_position_check" CHECK (
    "approx_position_percentage" >= 0 AND "approx_position_percentage" <= 100
  ),
  CONSTRAINT "article_cta_banners_background_color_check" CHECK (
    "background_color" ~ '^#[0-9A-Fa-f]{6}$'
  )
);

-- CreateTable
CREATE TABLE "article_cta_banner_buttons" (
  "id" BIGSERIAL NOT NULL,
  "banner_id" BIGINT NOT NULL,
  "text" VARCHAR(120),
  "icon_code" VARCHAR(80),
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "href" VARCHAR(500),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "article_cta_banner_buttons_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "article_cta_banner_buttons_sort_order_check" CHECK (
    "sort_order" >= 0 AND "sort_order" <= 1
  )
);

-- CreateIndex
CREATE INDEX "article_cta_banners_article_id_idx" ON "article_cta_banners"("article_id");

-- CreateIndex
CREATE INDEX "article_cta_banners_image_id_idx" ON "article_cta_banners"("image_id");

-- CreateIndex
CREATE INDEX "article_cta_banners_article_id_approx_position_percentage_idx"
  ON "article_cta_banners"("article_id", "approx_position_percentage");

-- CreateIndex
CREATE INDEX "article_cta_banner_buttons_banner_id_idx"
  ON "article_cta_banner_buttons"("banner_id");

-- CreateIndex
CREATE INDEX "article_cta_banner_buttons_banner_id_sort_order_idx"
  ON "article_cta_banner_buttons"("banner_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "article_cta_banner_buttons_banner_id_sort_order_key"
  ON "article_cta_banner_buttons"("banner_id", "sort_order");

-- AddForeignKey
ALTER TABLE "article_cta_banners"
  ADD CONSTRAINT "article_cta_banners_article_id_fkey"
  FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_cta_banners"
  ADD CONSTRAINT "article_cta_banners_image_id_fkey"
  FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_cta_banner_buttons"
  ADD CONSTRAINT "article_cta_banner_buttons_banner_id_fkey"
  FOREIGN KEY ("banner_id") REFERENCES "article_cta_banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
