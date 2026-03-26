"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type BirthdayPickerProps = {
  id?: string;
  value: string; // yyyy-MM-dd or ""
  onChange: (value: string) => void;
};

export function PanelBirthdayPicker({ id, value, onChange }: BirthdayPickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() =>
    value ? new Date(value) : undefined,
  );

  const handleSelect = (selected: Date | undefined) => {
    setDate(selected);
    if (!selected) {
      onChange("");
      return;
    }
    // store as yyyy-MM-dd
    const iso = selected.toISOString().slice(0, 10);
    onChange(iso);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          type="button"
          className={"h-12 rounded-md border-cobam-grey px-4 text-base w-full justify-start"}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
          {date ? format(date, "dd MMMM yyyy") : "Sélectionner une date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          captionLayout="dropdown"
          fromYear={1920}
          toYear={new Date().getFullYear()}
        />
      </PopoverContent>
    </Popover>
  );
}
