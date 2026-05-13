import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "quiet";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ec-ink text-white shadow-[0_16px_35px_rgba(16,32,47,0.18)] hover:bg-ec-blue focus-visible:outline-ec-blue",
  secondary:
    "border border-ec-ink/15 bg-white text-ec-ink hover:border-ec-blue/40 hover:bg-ec-blue/5 focus-visible:outline-ec-blue",
  ghost:
    "bg-transparent text-ec-ink hover:bg-ec-stone/70 focus-visible:outline-ec-blue",
  quiet:
    "bg-ec-stone text-ec-ink hover:bg-ec-stone-strong focus-visible:outline-ec-blue",
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-6 text-base",
};

type SharedProps = {
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  ...props
}: SharedProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
      {icon}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  href,
  ...props
}: SharedProps & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
      {icon}
    </Link>
  );
}
