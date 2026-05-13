export function formatPriceTnd(value: string | number | null | undefined) {
  if (value == null || value === "") {
    return null;
  }

  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    return null;
  }

  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 3,
    maximumFractionDigits: 3,
  }).format(amount);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("fr-TN", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function joinDefined(values: Array<string | null | undefined>, separator = " · ") {
  return values.filter((value): value is string => Boolean(value)).join(separator);
}

export function normalizeSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return value?.trim() || null;
}
