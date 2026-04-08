export function normalizeMediaFolderPath(value: string) {
  return value
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join("/")
    .toLocaleLowerCase("fr");
}

