// components/staff/articles/block-editor/blocks/TableBlock.tsx

"use client";

import type { TableBlockData, TableCell } from "../block-types";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableBlockProps {
  data: TableBlockData;
  onChange: (data: TableBlockData) => void;
}

export function TableBlock({ data, onChange }: TableBlockProps) {
  const updateCell = (rowIdx: number, colIdx: number, html: string) => {
    const rows = data.rows.map((row, ri) =>
      row.map((cell, ci) => (ri === rowIdx && ci === colIdx ? { html } : cell))
    );
    onChange({ ...data, rows });
  };

  const addRow = () => {
    const colCount = data.rows[0]?.length ?? 2;
    onChange({
      ...data,
      rows: [...data.rows, Array.from({ length: colCount }, () => ({ html: "" }))],
    });
  };

  const addColumn = () => {
    onChange({
      ...data,
      rows: data.rows.map((row) => [...row, { html: "" }]),
    });
  };

  const removeRow = (idx: number) => {
    if (data.rows.length <= 1) return;
    onChange({ ...data, rows: data.rows.filter((_, i) => i !== idx) });
  };

  const removeColumn = (idx: number) => {
    if ((data.rows[0]?.length ?? 0) <= 1) return;
    onChange({ ...data, rows: data.rows.map((row) => row.filter((_, i) => i !== idx)) });
  };

  const colCount = data.rows[0]?.length ?? 0;

  return (
    <div className="px-2 py-1 overflow-x-auto">
      <div className="flex items-center gap-2 mb-1 opacity-0 group-hover/block:opacity-100 focus-within:opacity-100 transition-opacity">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={data.hasHeader}
            onChange={(e) => onChange({ ...data, hasHeader: e.target.checked })}
            className="rounded"
          />
          First row as header
        </label>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <Plus className="w-3 h-3" /> Row
        </button>
        <button
          type="button"
          onClick={addColumn}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <Plus className="w-3 h-3" /> Column
        </button>
      </div>

      <table className="w-full border-collapse text-sm">
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} className="group/row">
              {row.map((cell, ci) => {
                const isHeader = data.hasHeader && ri === 0;
                const CellTag = isHeader ? "th" : "td";
                return (
                  <CellTag
                    key={ci}
                    className={cn(
                      "border border-border p-1.5 min-w-[80px] align-top",
                      isHeader && "bg-muted font-semibold"
                    )}
                  >
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="outline-none min-h-[1em] bg-transparent"
                      onInput={(e) =>
                        updateCell(ri, ci, (e.target as HTMLElement).innerHTML)
                      }
                      dangerouslySetInnerHTML={{ __html: cell.html }}
                    />
                  </CellTag>
                );
              })}
              {/* Row delete */}
              <td className="border-0 pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity align-middle">
                <button
                  type="button"
                  onClick={() => removeRow(ri)}
                  className="p-0.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Column delete row */}
      <div className="flex mt-1 gap-0">
        {Array.from({ length: colCount }).map((_, ci) => (
          <div
            key={ci}
            className="flex-1 flex justify-center opacity-0 group-hover/block:opacity-100 transition-opacity"
          >
            <button
              type="button"
              onClick={() => removeColumn(ci)}
              className="p-0.5 text-muted-foreground hover:text-destructive text-[10px]"
              title="Remove column"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}