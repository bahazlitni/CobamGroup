export type OrganizationDto = {
  id: number;
  slug: string;
  name: string;
  displayName: string;
  description: string | null;
  logoMediaId: number | null;
  isProductBrand: boolean;
  isReference: boolean;
  isPartner: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationInput = {
  slug: string;
  name: string;
  displayName: string;
  description: string | null;
  logoMediaId: number | null;
  isProductBrand: boolean;
  isReference: boolean;
  isPartner: boolean;
};
