"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import AnimatedIcon, { ANIMATED_ICON_NAMES, type AnimatedIconName } from "./AnimatedIcon";

type AnimatedIconPickerProps = {
  value: string;
  onValueChange: (value: AnimatedIconName) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

function getIconLabel(icon: AnimatedIconName) {
  return icon;
}

function normalizeIcon(value: string): AnimatedIconName {
  return (ANIMATED_ICON_NAMES as readonly string[]).includes(value)
    ? (value as AnimatedIconName)
    : "none";
}

export default function AnimatedIconPicker({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Choisir une icône",
  className,
}: AnimatedIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedIcon = normalizeIcon(value);

  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const options = ANIMATED_ICON_NAMES.filter((icon) => icon !== "loader");

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((icon) =>
      `${icon} ${getIconLabel(icon)}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const handleSelect = (icon: AnimatedIconName) => {
    onValueChange(icon);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-md border-slate-300 bg-white px-3 text-left font-normal text-slate-700 hover:bg-white",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <AnimatedIcon icon={selectedIcon} size="sm" className="shrink-0" />
            <span className="truncate">
              {selectedIcon === "none" && !value ? placeholder : getIconLabel(selectedIcon)}
            </span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[18rem] p-0"
      >
        <div className="border-b border-slate-200 p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une icône..."
              className="h-10 border-slate-300 pl-9"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto p-1.5">
          {filteredIcons.length === 0 ? (
            <div className="px-3 py-5 text-sm text-slate-500">Aucune icône trouvée.</div>
          ) : (
            filteredIcons.map((icon) => {
              const isSelected = selectedIcon === icon;

              return (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleSelect(icon)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100",
                    isSelected ? "bg-slate-100 text-cobam-dark-blue" : "text-slate-700",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <AnimatedIcon icon={icon} size="sm" className="shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{getIconLabel(icon)}</span>
                      <span className="block truncate text-xs text-slate-400">{icon}</span>
                    </span>
                  </span>
                  {isSelected ? (
                    <Check className="ml-3 h-4 w-4 shrink-0 text-cobam-water-blue" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
