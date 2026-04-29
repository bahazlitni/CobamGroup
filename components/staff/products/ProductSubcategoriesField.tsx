"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import PanelField from "@/components/staff/ui/PanelField";
import StaffSearchSelect from "@/components/staff/ui/search-select";
import type { ProductSubcategoryOptionDto } from "@/features/products/types";

type ProductSubcategoriesFieldProps = {
  id?: string;
  label?: string;
  value: string[];
  options: ProductSubcategoryOptionDto[];
  onChange: (nextValue: string[]) => void;
  className?: string;
  emptyStateText?: string;
};

export default function ProductSubcategoriesField({
  id = "productSubcategoryIds",
  label = "Sous-catégories",
  value,
  options,
  onChange,
  className,
  emptyStateText,
}: ProductSubcategoriesFieldProps) {
  const selectedProductSubcategories = useMemo(
    () => options.filter((item) => value.includes(String(item.id))),
    [options, value],
  );

  const remainingProductSubcategories = useMemo(
    () => options.filter((item) => !value.includes(String(item.id))),
    [options, value],
  );

  return (
    <PanelField id={id} label={label} className={className}>
      <div className="space-y-3">
        <StaffSearchSelect
          value=""
          onValueChange={(nextValue) => {
            if (!nextValue) {
              return;
            }

            onChange([...value, nextValue]);
          }}
          emptyLabel="Ajouter une sous-catégorie"
          placeholder="Ajouter une sous-catégorie"
          searchPlaceholder="Rechercher une sous-catégorie..."
          noResultsLabel="Aucune autre sous-catégorie disponible"
          options={remainingProductSubcategories.map((option) => ({
            value: String(option.id),
            label: `${option.categoryName} / ${option.name}`,
          }))}
          fullWidth
          disabled={options.length === 0 || remainingProductSubcategories.length === 0}
          triggerClassName="h-10 rounded-lg border-slate-300 px-4 text-base"
        />

        {selectedProductSubcategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedProductSubcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                type="button"
                onClick={() =>
                  onChange(
                    value.filter(
                      (subcategoryId) => subcategoryId !== String(subcategory.id),
                    ),
                  )
                }
                className="text-cobam-dark-blue inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:border-slate-300 hover:bg-slate-100"
              >
                <span>
                  {subcategory.categoryName} / {subcategory.name}
                </span>
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        ) : emptyStateText ? (
          <p className="text-sm text-slate-500">{emptyStateText}</p>
        ) : null}
      </div>
    </PanelField>
  );
}
