import type { ReactNode, RefCallback } from "react";
import { Loader2 } from "lucide-react";
import Loading from "@/components/staff/Loading";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";

type TableInfiniteScroll = {
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void | Promise<void>;
  loaded: number;
  total: number;
  itemLabel: string;
  itemLabelPlural?: string;
  sentinelRef?: RefCallback<HTMLDivElement>;
};

export interface Props {
  columns: ReactNode[];
  columnWidths?: string[];
  children: ReactNode | ReactNode[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
  emptyMessage?: string;
  infiniteScroll?: TableInfiniteScroll;
}

export default function PanelTable({
  columns,
  columnWidths,
  children,
  isLoading,
  isEmpty,
  error,
  emptyMessage = "Aucun élément ne correspond à ces critères.",
  infiniteScroll,
}: Props) {
  const columnCount = columns.length;
  const infiniteHasMore = infiniteScroll?.hasMore ?? false;
  const infiniteIsLoadingMore = infiniteScroll?.isLoadingMore ?? false;
  const infiniteLoaded = infiniteScroll?.loaded ?? 0;
  const infiniteTotal = infiniteScroll?.total ?? 0;
  const infiniteItemLabel = infiniteScroll?.itemLabel ?? "";
  const infiniteOnLoadMore = infiniteScroll?.onLoadMore;
  const infiniteSentinelRef = infiniteScroll?.sentinelRef;
  const itemLabelPlural =
    infiniteScroll?.itemLabelPlural ?? `${infiniteItemLabel}s`;
  const showInfiniteFooter = Boolean(
    infiniteScroll && !isLoading && !error && !isEmpty,
  );

  return (
    <div className="overflow-visible rounded-lg border border-slate-300 bg-white shadow-sm">
      <table
        className="min-w-full divide-y divide-slate-100 text-sm panel-table"
        style={{ tableLayout: columnWidths ? "fixed" : undefined }}
      >
        {columnWidths ? (
          <colgroup>
            {columnWidths.map((w, i) => (
              <col key={`cw-${i}`} style={{ width: w }} />
            ))}
          </colgroup>
        ) : null}
        <thead className="sticky top-0 z-10 bg-slate-50/95 shadow-[0_1px_0_rgba(203,213,225,0.75)] backdrop-blur">
          <tr>
            {columns.map((column, index) => (
              <th
                key={`column-${index}`}
                className="sticky top-0 z-10 bg-slate-50/95 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 backdrop-blur"
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

      {showInfiniteFooter && infiniteScroll ? (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {infiniteLoaded} / {infiniteTotal}{" "}
            {infiniteTotal > 1
              ? itemLabelPlural
              : infiniteItemLabel}
          </span>

          <div className="flex min-h-9 items-center justify-end gap-3">
            {infiniteIsLoadingMore ? (
              <span className="inline-flex items-center gap-2 font-medium text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Chargement...
              </span>
            ) : infiniteHasMore ? (
              <>
                {infiniteSentinelRef ? (
                  <div
                    ref={infiniteSentinelRef}
                    className="h-px w-px"
                    aria-hidden="true"
                  />
                ) : null}
                <AnimatedUIButton
                  type="button"
                  onClick={() => void infiniteOnLoadMore?.()}
                  variant="ghost"
                  size="sm"
                  icon="chevron-down"
                  iconPosition="left"
                >
                  Charger plus
                </AnimatedUIButton>
              </>
            ) : infiniteLoaded > 0 ? (
              <span>Tous les éléments sont chargés.</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
