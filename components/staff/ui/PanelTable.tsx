import type { ReactNode } from "react";
import Loading from "@/components/staff/Loading";
import StaffSelect from "@/components/staff/ui/PanelSelect";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";

type TablePagination = {
  goPrev: () => void | Promise<void>;
  goNext: () => void | Promise<void>;
  updatePageSize: (n: number) => void | Promise<void>;
  canPrev: boolean;
  canNext: boolean;
  pageSize: number;
  total: number;
  totalPages: number;
  page: number;
  pageSizeOptions?: readonly number[];
  itemLabel: string;
  itemLabelPlural?: string;
};

export interface Props {
  columns: ReactNode[];
  children: ReactNode | ReactNode[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
  emptyMessage?: string;
  pagination?: TablePagination;
}

export default function PanelTable({
  columns,
  children,
  isLoading,
  isEmpty,
  error,
  emptyMessage = "Aucun élément ne correspond à ces critères.",
  pagination,
}: Props) {
  const columnCount = columns.length;
  const pageSizeOptions = pagination?.pageSizeOptions ?? [8, 12, 16, 20];
  const itemLabelPlural =
    pagination?.itemLabelPlural ?? `${pagination?.itemLabel ?? ""}s`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-sm panel-table">
        <thead className="bg-slate-50/80">
          <tr>
            {columns.map((column, index) => (
              <th
                key={`column-${index}`}
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-4 py-6 text-center text-sm text-slate-500"
              >
                <Loading />
              </td>
            </tr>
          ) : null}

          {!isLoading && error ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-4 py-6 text-center text-sm text-red-600"
              >
                {error}
              </td>
            </tr>
          ) : null}

          {!isLoading && !error && isEmpty ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-4 py-6 text-center text-sm text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : null}

          {!isLoading && !error && !isEmpty ? children : null}
        </tbody>
      </table>

      {pagination ? (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2">
            <span>Afficher</span>
            <div>
              <StaffSelect
                triggerClassName="!h-6 px-2 text-xs"
                value={String(pagination.pageSize)}
                onValueChange={(value) =>
                  void pagination.updatePageSize(Number(value))
                }
                options={pageSizeOptions.map((option) => ({
                  value: String(option),
                  label: String(option),
                }))}
              />
            </div>
            <span>
              / {pagination.total}{" "}
              {pagination.total > 1 ? itemLabelPlural : pagination.itemLabel}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <AnimatedUIButton
              type="button"
              disabled={!pagination.canPrev}
              onClick={() => void pagination.goPrev()}
              variant="ghost"
              size="sm"
              icon="chevron-left"
            >
              Précédent
            </AnimatedUIButton>

            <span>
              Page {pagination.page} sur {pagination.totalPages}
            </span>

            <AnimatedUIButton
              type="button"
              disabled={!pagination.canNext}
              onClick={() => void pagination.goNext()}
              variant="ghost"
              size="sm"
              icon="chevron-right"
              iconPosition="left"
            >
              Suivant
            </AnimatedUIButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
