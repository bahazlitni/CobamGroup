export function normalizeProductAttributeMetadataName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fr-FR");
}

export function normalizeProductAttributeMetadataUnit(unit: string | null) {
  return (unit ?? "").replace(/\s+/g, " ").trim().toLocaleLowerCase("fr-FR");
}
