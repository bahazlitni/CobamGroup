"use client";

import { type ComponentProps } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type AutoSubmitCheckboxProps = ComponentProps<typeof Checkbox>;

export function AutoSubmitCheckbox({ onCheckedChange, ...props }: AutoSubmitCheckboxProps) {
  return (
    <Checkbox
      {...props}
      onCheckedChange={(checked) => {
        onCheckedChange?.(checked);

        window.setTimeout(() => {
          const form = document.getElementById("catalog-filters-form") as HTMLFormElement | null;
          form?.requestSubmit();
        }, 0);
      }}
    />
  );
}
