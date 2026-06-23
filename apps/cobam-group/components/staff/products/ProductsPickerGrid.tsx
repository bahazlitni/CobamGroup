"use client";

import { useState } from "react";
import { StaffBadge } from "@/components/staff/ui";
import type { ProductFamilyGroupingCandidateDto } from "@/features/products/types";
import formatEnumLabel from "@/lib/formatEnumLabel";
import ProductGrid from "./ProductGrid";
import type { ProductGridCardItem } from "./ProductGridCard";
import ProductsPickerDialog from "./ProductsPickerDialog";

function mapProductToGridItem(product: ProductFamilyGroupingCandidateDto): ProductGridCardItem {
  return {
    id: product.id,
    imageAlt: product.name,
    imageUrl: product.imageThumbnailUrl,
    subtitle: product.sku,
    title: product.name,
    type: "PRODUCT",
  };
}

export default function ProductsPickerGrid({
  items,
  onChange,
  title = "Produits sélectionnés",
  description = "Ajoutez des produits simples, puis glissez les cartes pour changer l'ordre des variantes.",
  pickerTitle = "Ajouter des produits",
  pickerDescription = "Seuls les produits simples non rattachés à une famille sont proposés.",
  addButtonLabel = "Ajouter un produit",
  excludeVariants = true,
  ungroupedOnly = true,
}: {
  items: ProductFamilyGroupingCandidateDto[];
  onChange: (items: ProductFamilyGroupingCandidateDto[]) => void;
  title?: string;
  description?: string;
  pickerTitle?: string;
  pickerDescription?: string;
  addButtonLabel?: string;
  excludeVariants?: boolean;
  ungroupedOnly?: boolean;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const gridItems = items.map(mapProductToGridItem);

  const handleAdd = (products: ProductFamilyGroupingCandidateDto[]) => {
    const existingIds = new Set(items.map((item) => item.id));
    const additions = products.filter((product) => !existingIds.has(product.id));
    if (additions.length === 0) {
      return;
    }

    onChange([...items, ...additions]);
  };

  const handleRemove = (productId: number) => {
    const next = items.filter((item) => item.id !== productId);
    onChange(next);
  };

  return (
    <>
      <ProductGrid
        items={gridItems}
        title={title}
        description={description}
        addButtonLabel={addButtonLabel}
        onAddClick={() => setIsPickerOpen(true)}
        onItemsReordered={(nextItems) => {
          const productsById = new Map(items.map((item) => [String(item.id), item]));
          onChange(
            nextItems
              .map((item) => productsById.get(String(item.id)))
              .filter((item): item is ProductFamilyGroupingCandidateDto => Boolean(item)),
          );
        }}
        onRemove={(item) => handleRemove(Number(item.id))}
        renderMeta={(_, index) => {
          const product = items[index];
          if (!product) {
            return null;
          }

          return (
            <StaffBadge size="xs" color={product.lifecycle ? "secondary" : "default"}>
              {product.lifecycle ? formatEnumLabel(product.lifecycle) : "-"}
            </StaffBadge>
          );
        }}
      />

      {isPickerOpen ? (
        <ProductsPickerDialog
          open={isPickerOpen}
          onOpenChange={setIsPickerOpen}
          title={pickerTitle}
          description={pickerDescription}
          excludedProductIds={items.map((item) => item.id)}
          excludeVariants={excludeVariants}
          ungroupedOnly={ungroupedOnly}
          onAdd={handleAdd}
        />
      ) : null}
    </>
  );
}
