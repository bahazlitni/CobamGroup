export type ProductCertificateDto = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageMediaId: number;
  imageUrl: string;
  imageThumbnailUrl: string | null;
  imageAltText: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductCertificateInput = {
  name: string;
  slug: string;
  description: string | null;
  imageMediaId: number;
};
