import type { ProductCommercialMode, ProductLifecycle, ProductStockUnit } from "@prisma/client";
import type { ProductMediaDto, ProductSubcategoryOptionDto } from "@/features/products/types";

export type ProductPackLineInputDto = {
  productId: number;
  quantity: number;
};

export type ProductPackUpsertInput = {
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  descriptionSeo: string | null;
  subcategoryIds: number[];
  media: ProductMediaDto[];
  lines: ProductPackLineInputDto[];
};

export type ProductPackSelectableProductDto = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  kind: "SINGLE" | "VARIANT";
};

export type ProductPackFormOptionsDto = {
  productSubcategories: ProductSubcategoryOptionDto[];
  availableProducts: ProductPackSelectableProductDto[];
};

export type ProductPackListItemDto = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  lineCount: number;
  brands: string[];
  basePriceAmount: string | null;
  vatRate: number | null;
  stock: string | null;
  stockUnit: ProductStockUnit | null;
  visibility: boolean;
  priceVisibility: boolean | null;
  stockVisibility: boolean | null;
  lifecycle: ProductLifecycle;
  commercialMode: ProductCommercialMode | null;
  subcategories: ProductSubcategoryOptionDto[];
  updatedAt: string;
};

export type ProductPackListResult = {
  items: ProductPackListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductPackDetailDto = ProductPackUpsertInput & {
  id: number;
  createdAt: string;
  updatedAt: string;
  derived: {
    brands: string[];
    basePriceAmount: string | null;
    visibility: boolean;
    priceVisibility: boolean;
    stockVisibility: boolean;
    lifecycle: ProductLifecycle;
    commercialMode: ProductCommercialMode | null;
    vatRate: number;
    stock: string | null;
  };
};
