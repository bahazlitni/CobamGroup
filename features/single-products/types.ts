import type { ProductFormOptionsDto, ProductVariantInputDto } from "@/features/products/types";

export type SingleProductUpsertInput = Omit<ProductVariantInputDto, "id">;

export type SingleProductDetailDto = SingleProductUpsertInput & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type SingleProductFormOptionsDto = ProductFormOptionsDto;
