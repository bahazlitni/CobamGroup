import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// utils/scrollToId.ts
export function scrollToIdCenter(id: string, options?: { offset?: number }) {
  if (typeof window === "undefined") return;

  const el = document.getElementById(id);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const elementCenter = rect.top + rect.height / 2;

  // Use true viewport center; you can change to * 2/3
  const viewportCenter = window.innerHeight / 2;

  const offsetY = elementCenter - viewportCenter - (options?.offset ?? 0);

  window.scrollBy({
    top: offsetY,
    behavior: "smooth",
  });
}

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}


export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}