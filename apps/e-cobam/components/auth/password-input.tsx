"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/cn";

type PasswordInputProps = Omit<ComponentPropsWithoutRef<"input">, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(
          "border-ec-line text-ec-ink placeholder:text-ec-muted/70 focus:border-ec-ink focus:ring-ec-ink/10 h-12 w-full border bg-white px-4 pr-12 font-sans text-sm font-semibold outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="text-ec-muted hover:text-ec-ink focus-visible:outline-ec-blue absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
