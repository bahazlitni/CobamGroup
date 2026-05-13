"use client";

import type { KeyboardEvent } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  PanelSelectProps,
  StaffSelectGroupedOption,
  StaffSelectOption,
} from "./PanelSelect";
import {
  AiSuggestionActionsRow,
  handleAiTabAccept,
  type AiSuggestionActions,
} from "./ai-suggestion";

const EMPTY_SELECT_VALUE = "__staff_empty__";

function findOptionLabel(
  value: string | null | undefined,
  options?: StaffSelectOption[],
  groupedOptions?: StaffSelectGroupedOption[],
) {
  if (!value) {
    return null;
  }

  const flatOptions = groupedOptions
    ? groupedOptions.flatMap((group) => group.items)
    : options ?? [];

  return flatOptions.find((option) => option.value === value)?.label ?? value;
}

export type AiPanelSelectProps = PanelSelectProps &
  AiSuggestionActions<string>;

export default function AiPanelSelect({
  value,
  onValueChange,
  options,
  groupedOptions,
  placeholder,
  emptyLabel,
  disabled = false,
  fullWidth = false,
  triggerClassName,
  contentClassName,
  id,
  aiSuggestion,
  onAcceptAiSuggestion,
  onRejectAiSuggestion,
}: AiPanelSelectProps) {
  const selectValue = value === "" ? EMPTY_SELECT_VALUE : value;
  const suggestedLabel = findOptionLabel(aiSuggestion, options, groupedOptions);

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    handleAiTabAccept(event, aiSuggestion, onAcceptAiSuggestion);
  };

  return (
    <div
      className={cn("relative", fullWidth && "w-full")}
      onKeyDownCapture={handleKeyDownCapture}
    >
      <Select
        value={selectValue ?? ""}
        onValueChange={(nextValue) =>
          onValueChange(nextValue === EMPTY_SELECT_VALUE ? "" : nextValue)
        }
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className={cn(
            "!h-10 rounded-md border border-slate-300 bg-white px-4",
            fullWidth ? "!w-full" : "!w-auto",
            !value && aiSuggestion && "text-cobam-water-blue/70",
            triggerClassName,
          )}
        >
          {value ? (
            <SelectValue placeholder={placeholder} />
          ) : suggestedLabel ? (
            <span className="truncate text-cobam-water-blue/70">
              {suggestedLabel}
            </span>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent className={cn("rounded-sm", contentClassName)}>
          {emptyLabel ? (
            <SelectItem value={EMPTY_SELECT_VALUE}>{emptyLabel}</SelectItem>
          ) : null}

          {groupedOptions
            ? groupedOptions.map((group, groupIndex) => (
                <div key={group.label}>
                  <SelectGroup>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        disabled={item.disabled}
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  {groupIndex < groupedOptions.length - 1 ? (
                    <SelectSeparator />
                  ) : null}
                </div>
              ))
            : options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>

      <AiSuggestionActionsRow
        suggestion={aiSuggestion}
        onAcceptSuggestion={onAcceptAiSuggestion}
        onRejectSuggestion={onRejectAiSuggestion}
      />
    </div>
  );
}
