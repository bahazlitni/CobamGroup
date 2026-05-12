import type { ProductLifecycle } from "@prisma/client";

export const PRODUCT_LIFECYCLE_VALUES = [
  "DRAFT",
  "ACTIVE",
] satisfies ProductLifecycle[];

export function isProductLifecycle(value: unknown): value is ProductLifecycle {
  return (
    typeof value === "string" &&
    PRODUCT_LIFECYCLE_VALUES.includes(value as ProductLifecycle)
  );
}
