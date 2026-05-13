const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const HEX_COLOR_3_PATTERN = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;

export function normalizeHexColor(value: string | null | undefined) {
  const trimmed = value?.trim().replace(/\s+/g, "");

  if (!trimmed) {
    return null;
  }

  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  if (!HEX_COLOR_PATTERN.test(prefixed)) {
    return null;
  }

  return prefixed
    .replace(
      HEX_COLOR_3_PATTERN,
      (_, r: string, g: string, b: string) => `#${r}${r}${g}${g}${b}${b}`,
    )
    .toUpperCase();
}

export function resolveColorHex(value: string | null | undefined) {
  return normalizeHexColor(value);
}
