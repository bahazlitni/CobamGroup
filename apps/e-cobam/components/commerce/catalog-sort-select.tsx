"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HiddenField = {
  name: string;
  value: string;
};

type CatalogSortSelectProps = {
  value: string;
  hiddenFields: HiddenField[];
};

const sortOptions = [
  { value: "latest", label: "Plus récents" },
  { value: "name", label: "Nom" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "stock", label: "Stock" },
];

export function CatalogSortSelect({ value, hiddenFields }: CatalogSortSelectProps) {
  const router = useRouter();

  function updateSort(nextValue: string) {
    const params = new URLSearchParams();

    hiddenFields.forEach((field) => {
      if (field.name !== "tri") {
        params.append(field.name, field.value);
      }
    });

    if (nextValue !== "latest") {
      params.set("tri", nextValue);
    }

    const query = params.toString();
    router.push(query ? `/catalogue?${query}` : "/catalogue");
  }

  return (
    <Select value={value} onValueChange={updateSort}>
      <SelectTrigger className="h-11 min-w-44 rounded-full bg-white">
        <SelectValue placeholder="Trier" />
      </SelectTrigger>
      <SelectContent align="end">
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
