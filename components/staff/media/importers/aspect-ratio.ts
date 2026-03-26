import type { MediaListItemDto } from "@/features/media/types";

export type ParsedAspectRatio = {
  width: number;
  height: number;
  value: number;
  label: string;
};

type DimensionLike = Pick<MediaListItemDto, "widthPx" | "heightPx"> | {
  widthPx?: number | null;
  heightPx?: number | null;
} | null | undefined;

export function parseAspectRatio(value?: string | null): ParsedAspectRatio | null {
  const raw = value?.trim();
  if (!raw) {
    return null;
  }

  const divider = raw.includes("/") ? "/" : raw.includes(":") ? ":" : null;

  if (divider) {
    const [widthRaw, heightRaw] = raw.split(divider);
    const width = Number(widthRaw);
    const height = Number(heightRaw);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return null;
    }

    return {
      width,
      height,
      value: width / height,
      label: `${width}:${height}`,
    };
  }

  const numericValue = Number(raw);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return {
    width: numericValue,
    height: 1,
    value: numericValue,
    label: raw,
  };
}

export function getAspectRatioValue(dimensions: DimensionLike): number | null {
  const width = dimensions?.widthPx ?? null;
  const height = dimensions?.heightPx ?? null;

  if (width == null || height == null || width <= 0 || height <= 0) {
    return null;
  }

  return width / height;
}

export function matchesAspectRatio(
  dimensions: DimensionLike,
  requiredAspectRatio: ParsedAspectRatio | null,
  tolerance = 0.03,
): boolean {
  if (!requiredAspectRatio) {
    return true;
  }

  const actual = getAspectRatioValue(dimensions);
  if (actual == null) {
    return false;
  }

  return Math.abs(actual - requiredAspectRatio.value) <= requiredAspectRatio.value * tolerance;
}

export function getAspectRatioCssValue(
  requiredAspectRatio: ParsedAspectRatio | null,
  dimensions?: DimensionLike,
): string | undefined {
  if (requiredAspectRatio) {
    return `${requiredAspectRatio.width} / ${requiredAspectRatio.height}`;
  }

  const width = dimensions?.widthPx ?? null;
  const height = dimensions?.heightPx ?? null;

  if (width == null || height == null || width <= 0 || height <= 0) {
    return undefined;
  }

  return `${width} / ${height}`;
}

export function isWideAspectRatio(value: number | null, threshold = 1.5): boolean {
  return value != null && value >= threshold;
}
