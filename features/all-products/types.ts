import type {
  ProductCommercialMode,
  ProductKind,
  ProductLifecycle,
  ProductStockUnit,
} from "@prisma/client";

export const ALL_PRODUCTS_EXPORT_MODES = ["basic", "extended", "super"] as const;

export type AllProductsExportMode = (typeof ALL_PRODUCTS_EXPORT_MODES)[number];

export const ALL_PRODUCTS_EXPORT_FORMATS = ["csv", "pdf"] as const;

export type AllProductsExportFormat = (typeof ALL_PRODUCTS_EXPORT_FORMATS)[number];

export const ALL_PRODUCTS_EXPORT_ACTIONS = [
  {
    value: "basic-pdf",
    mode: "basic",
    format: "pdf",
    label: "Exporter Basic PDF",
  },
  {
    value: "extended-pdf",
    mode: "extended",
    format: "pdf",
    label: "Exporter Extended PDF",
  },
  {
    value: "super-csv",
    mode: "super",
    format: "csv",
    label: "Exporter Super CSV",
  },
] as const satisfies readonly {
  value: string;
  mode: AllProductsExportMode;
  format: AllProductsExportFormat;
  label: string;
}[];

export type AllProductsExportAction =
  (typeof ALL_PRODUCTS_EXPORT_ACTIONS)[number]["value"];

export type AllProductsListItemDto = {
  id: number;
  kind: ProductKind;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  brand: string | null;
  basePriceAmount: string | null;
  vatRate: number | null;
  stock: string | null;
  stockUnit: ProductStockUnit | null;
  hasImage: boolean;
  hasDatasheet: boolean;
  subcategories: {
    id: number;
    name: string;
    slug: string;
    categorySlug: string;
  }[];
  visibility: boolean | null;
  priceVisibility: boolean | null;
  stockVisibility: boolean | null;
  lifecycle: ProductLifecycle | null;
  commercialMode: ProductCommercialMode | null;
  updatedAt: string;
  family:
    | {
        id: number;
        name: string;
        slug: string;
      }
    | null;
};

export type AllProductsListResult = {
  items: AllProductsListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};
