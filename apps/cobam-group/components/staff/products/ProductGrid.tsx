"use client";

import { type ReactNode, useState } from "react";
import ProductGridAddButton from "./ProductGridAddButton";
import ProductGridCard, { type ProductGridCardItem } from "./ProductGridCard";

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function ProductGrid({
  items,
  title,
  description,
  addButtonLabel,
  onAddClick,
  onItemClick,
  onItemsReordered,
  onRemove,
  renderMeta,
}: {
  items: ProductGridCardItem[];
  title: string;
  description: string;
  addButtonLabel: string;
  onAddClick: () => void;
  onItemClick?: (item: ProductGridCardItem, index: number) => void;
  onItemsReordered?: (items: ProductGridCardItem[]) => void;
  onRemove: (item: ProductGridCardItem, index: number) => void;
  renderMeta?: (item: ProductGridCardItem, index: number) => ReactNode;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const canDrag = Boolean(onItemsReordered) && items.length > 1;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-cobam-dark-blue text-sm font-semibold">{title}</p>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <div className="grid auto-rows-fr items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {items.map((item, index) => (
          <ProductGridCard
            key={item.id}
            item={item}
            index={index}
            canDrag={canDrag}
            isDragging={draggedIndex === index}
            isDragOver={dragOverIndex === index}
            meta={renderMeta?.(item, index)}
            onClick={onItemClick ? () => onItemClick(item, index) : undefined}
            onRemove={() => onRemove(item, index)}
            onDragStart={() => {
              if (!canDrag) {
                return;
              }

              setDraggedIndex(index);
              setDragOverIndex(index);
            }}
            onDragOver={() => {
              if (canDrag) {
                setDragOverIndex(index);
              }
            }}
            onDrop={() => {
              if (!canDrag || draggedIndex == null || !onItemsReordered) {
                return;
              }

              onItemsReordered(moveItem(items, draggedIndex, index));
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
          />
        ))}

        <ProductGridAddButton
          onClick={onAddClick}
          label={addButtonLabel}
          className={items.length > 0 ? "h-full min-h-0 self-stretch aspect-auto" : undefined}
        />
      </div>
    </div>
  );
}
