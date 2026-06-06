-- CreateTable
CREATE TABLE "product_certificates" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image_media_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_certificate_associations" (
    "product_id" BIGINT NOT NULL,
    "certificate_id" BIGINT NOT NULL,

    CONSTRAINT "product_certificate_associations_pkey" PRIMARY KEY ("product_id","certificate_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_certificates_slug_key" ON "product_certificates"("slug");

-- CreateIndex
CREATE INDEX "product_certificates_image_media_id_idx" ON "product_certificates"("image_media_id");

-- CreateIndex
CREATE INDEX "product_certificate_associations_certificate_id_idx" ON "product_certificate_associations"("certificate_id");

-- AddForeignKey
ALTER TABLE "product_certificates" ADD CONSTRAINT "product_certificates_image_media_id_fkey" FOREIGN KEY ("image_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_certificate_associations" ADD CONSTRAINT "product_certificate_associations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_certificate_associations" ADD CONSTRAINT "product_certificate_associations_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "product_certificates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
