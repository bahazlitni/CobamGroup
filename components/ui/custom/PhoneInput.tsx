// components/ui/phone-input.tsx
"use client";

import PhoneInputRaw, {
  type Value as PhoneValue,
} from "react-phone-number-input/input";
import "react-phone-number-input/style.css";

import { cn } from "@/lib/utils";
import { CountryCode } from "libphonenumber-js/core";

type PhoneInputProps = {
  id?: string;
  name?: string;
  value: PhoneValue;
  onChange: (value: PhoneValue) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultCountry?: string;
  fullWidth?: boolean
};

export function PhoneInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  defaultCountry = "TN",
  fullWidth = false
}: PhoneInputProps) {
  return (
    <PhoneInputRaw
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      country={defaultCountry as CountryCode}
      international
      withCountryCallingCode
      placeholder={placeholder ?? "+216 ..."}
      disabled={disabled}
      className={cn(
        "h-10 rounded-md border-cobam-grey px-4 text-base border border-slate-300 bg-white",
        fullWidth ? "w-full" : "w-auto"
      )}
    />
  );
}
