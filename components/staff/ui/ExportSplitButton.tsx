"use client";

import { ChevronDown, Download, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ALL_PRODUCTS_EXPORT_ACTIONS,
  type AllProductsExportAction,
} from "@/features/all-products/types";

type ExportSplitButtonProps = {
  value: AllProductsExportAction;
  onActionChange: (action: AllProductsExportAction) => void;
  onExport: (action: AllProductsExportAction) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export default function ExportSplitButton({
  value,
  onActionChange,
  onExport,
  disabled = false,
  loading = false,
  className,
}: ExportSplitButtonProps) {
  const activeOption =
    ALL_PRODUCTS_EXPORT_ACTIONS.find((option) => option.value === value) ??
    ALL_PRODUCTS_EXPORT_ACTIONS[1];
  const menuOptions = ALL_PRODUCTS_EXPORT_ACTIONS.filter(
    (option) => option.value !== value,
  );
  const isDisabled = disabled || loading;

  const handleMenuOption = (action: AllProductsExportAction) => {
    onActionChange(action);
    void onExport(action);
  };

  return (
    <div className={cn("inline-flex max-w-full rounded-lg shadow-sm", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-l-lg border border-cobam-water-blue bg-cobam-water-blue px-4 text-sm font-semibold tracking-[0.02em] text-white transition-[background-color,border-color,box-shadow,filter,opacity] duration-200",
          "hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobam-water-blue/20 active:brightness-90",
          "disabled:cursor-not-allowed disabled:opacity-65",
        )}
        disabled={isDisabled}
        onClick={() => void onExport(value)}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <span className="min-w-0 truncate">{activeOption.label}</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "-ml-px inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-r-lg border border-cobam-water-blue border-l-white/25 bg-cobam-water-blue text-white transition-[background-color,border-color,box-shadow,filter,opacity] duration-200",
              "hover:brightness-95 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobam-water-blue/20 active:brightness-90",
              "disabled:cursor-not-allowed disabled:opacity-65",
            )}
            disabled={isDisabled}
            aria-label="Choisir le mode d'export"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {menuOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className="cursor-pointer px-2 py-2"
              disabled={isDisabled}
              onSelect={() => handleMenuOption(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
