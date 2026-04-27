import PhoneInput, { type Value } from "react-phone-number-input";
import FormLabel from "./FormLabel";
import FormError from "./FormError";

type BaseFormFieldProps = {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  autoComplete?: string;
  error?: string;
};

type TextInputType =
  | "date"
  | "datetime-local"
  | "email"
  | "hidden"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url";

type FormFieldProps = BaseFormFieldProps & {
  type?: TextInputType | "phone";
  onChange:
    | ((e: React.ChangeEvent<HTMLInputElement>) => void)
    | ((value?: Value) => void);
};

export default function FormField(props: FormFieldProps) {
  const {
    label,
    name,
    value,
    required = false,
    disabled = false,
    maxLength,
    autoComplete,
    error,
  } = props;

  const errorId = `${name}-error`;

  return (
    <div>
      <FormLabel htmlFor={name}>{label}</FormLabel>

      {props.type === "phone" ? (
        props.type &&
        <PhoneInput
          id={name}
          name={name}
          international
          defaultCountry="TN"
          countryCallingCodeEditable={false}
          value={value}
          onChange={props.onChange as (value?: Value) => void}
          disabled={disabled}
          maxLength={32}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="
            public-contact-phone-input
            border-b border-cobam-quill-grey/60 py-2 text-base
            transition-colors focus-within:border-[#0a8dc1]
          "
        />
      ) : (
        <input
          id={name}
          name={name}
          type={props.type ?? "text"}
          value={value}
          onChange={props.onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="
            w-full border-b border-cobam-quill-grey/60
            bg-transparent py-2 text-base text-[#14202e]
            outline-none transition-colors
            placeholder:text-[#5e5e5e]/50
            focus:border-[#0a8dc1]
            disabled:cursor-not-allowed disabled:opacity-60
          "
        />
      )}

      <FormError id={errorId} message={error} />
    </div>
  );
}
