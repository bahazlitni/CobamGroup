import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useRef } from "react";

const CELL_HEIGHT = "h-9"
const CELL_BOX_CLASS =
  `box-border flex ${CELL_HEIGHT} rounded-none w-full min-w-0 items-center border border-transparent bg-transparent px-2 text-sm leading-none text-slate-700`;

export type EditingState = {
    rowId: number;
    field: string;
    value: string;
} | null;

function EditableCellInner({
    value,
    rowId,
    field,
    editing,
    onStartEdit,
    onChangeEdit,
    onCommitEdit,
    onCancelEdit,
    saving,
    readOnly = false,
    type = "text",
}: {
    value: string;
    rowId: number;
    field: string;
    editing: EditingState;
    onStartEdit: (rowId: number, field: string, value: string) => void;
    onChangeEdit: (value: string) => void;
    onCommitEdit: () => void;
    onCancelEdit: () => void;
    saving: boolean;
    readOnly?: boolean;
    type?: "text" | "number";
}) {
    const isEditing = editing?.rowId === rowId && editing?.field === field;
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
        }
    }, [isEditing]);

    // Single stable wrapper. Same width/height in both states.
    return (
        <div className={`relative ${CELL_HEIGHT} w-full min-w-0`}>
        {isEditing && !readOnly ? (
            <Input
            ref={inputRef}
            className={`${CELL_BOX_CLASS} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-cobam-dark-blue/40 bg-white shadow-none outline-none ring-0 ring-offset-0 focus-visible:border-cobam-dark-blue focus-visible:ring-0 focus-visible:ring-offset-0`}
            type={type}
            step={type === "number" ? "any" : undefined}
            value={editing.value}
            disabled={saving}
            onChange={(e) => onChangeEdit(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") onCommitEdit();
                if (e.key === "Escape") onCancelEdit();
            }}
            onBlur={onCommitEdit}
            />
        ) : readOnly ? (
            <div className={`${CELL_BOX_CLASS} cursor-default overflow-hidden`}>
            <span className="block w-full truncate">
                {value || <span className="text-slate-300">—</span>}
            </span>
            </div>
        ) : (
            <button
            type="button"
            className={`${CELL_BOX_CLASS} cursor-text overflow-hidden text-left transition-colors hover:border-cobam-dark-blue/10 hover:bg-cobam-dark-blue/5`}
            onClick={() => onStartEdit(rowId, field, value)}
            >
            <span className="block w-full truncate">
                {value || <span className="text-slate-300">—</span>}
            </span>
            </button>
        )}
        </div>
    );
}

function SelectCellInner({
    value,
    onValueChange,
    saving,
    readOnly = false,
    items,
    placeholder,
}: {
    value: string;
    saving: boolean;
    readOnly?: boolean;
    items: {value: string, label: string}[]
    onValueChange: (nextValue: string) => void;
    placeholder: string;
}) {
    return (
        <Select
            value={value}
            disabled={saving || readOnly}
            onValueChange={onValueChange}
        >
        <SelectTrigger className={`box-border flex ${CELL_HEIGHT} w-full min-w-0 items-center rounded-none border border-transparent bg-transparent px-2 text-sm leading-none text-slate-700 shadow-none ring-0 ring-offset-0 transition-colors ${readOnly ? "cursor-default opacity-70" : "hover:border-cobam-dark-blue/10 hover:bg-cobam-dark-blue/5"} focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0`}>
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="rounded-none">
            {items.map((item, i) => <SelectItem className="rounded-none" key={i} value={item.value}>{item.label}</SelectItem>)}
        </SelectContent>
        </Select>
    );
}


export const EditableCell = React.memo(EditableCellInner);
export const SelectCell = React.memo(SelectCellInner);