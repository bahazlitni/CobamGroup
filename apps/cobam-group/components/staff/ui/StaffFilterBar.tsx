import { Search } from "lucide-react";
import type { ReactNode } from "react";
import SearchInput from "./SearchInput";

export default function StaffFilterBar({
  children,
  summary,
  onSearchChange,
  searchValue,
  searchPlaceholder = "Rechercher par titre ou slug...",
}: {
  children?: ReactNode;
  summary?: ReactNode;
  onSearchChange?: (s: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}) {
  const hasSearchInput =
    typeof onSearchChange === "function" && typeof searchValue === "string";

  return (
    <div className="border border-slate-300 rounded-lg bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {summary ? (
          <div className="text-sm text-slate-500">{summary}</div>
        ) : null}

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:justify-start">
          {hasSearchInput ? (
            <SearchInput
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
            />

          ) : null}

          {children}
        </div>
      </div>
    </div>
  );
}
