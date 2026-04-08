export const DEFAULT_THEME_COLOR = "#9CA3AF";

export function normalizeThemeColor(color: string | null | undefined) {
  const trimmed = color?.trim();
  return trimmed || DEFAULT_THEME_COLOR;
}

export function hexToRgb(hex: string | null | undefined) {
  const normalizedHex = normalizeThemeColor(hex).replace("#", "");

  if (normalizedHex.length !== 6) {
    return null;
  }

  const parsed = Number.parseInt(normalizedHex, 16);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

export function withThemeAlpha(
  color: string | null | undefined,
  alpha: number,
) {
  const rgb = hexToRgb(color);

  if (!rgb) {
    return `rgba(156, 163, 175, ${alpha})`;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
