export type ProductAttributeSuggestion = {
  key: string;
  label: string;
  tag?: string;
};

export function normalizeProductAttributeKind(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function formatProductAttributeKind(value: string | null | undefined) {
  const normalized = normalizeProductAttributeKind(value);

  if (!normalized) {
    return "";
  }

  return normalized
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getProductAttributeUnit(_value?: string | null | undefined) {
  void _value;
  return null;
}

export function getAttributeNameSuggestions(): ProductAttributeSuggestion[] {
  return [];
}

export function enumProductAttributKindToLabel(value: string) {
  return formatProductAttributeKind(value);
}
