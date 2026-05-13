const DEFAULT_SITE_URL = "https://www.cobamgroup.com";

function normalizeBaseUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getSiteUrl() {
  return new URL(
    normalizeBaseUrl(
      process.env.NEXT_PUBLIC_SITE_URL ??
        process.env.SITE_URL ??
        process.env.VERCEL_PROJECT_PRODUCTION_URL,
    ),
  );
}

export function getSiteName() {
  return "COBAM GROUP";
}

export function buildAbsoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

export function toAbsoluteUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).toString();
  } catch {
    return buildAbsoluteUrl(value.startsWith("/") ? value : `/${value}`);
  }
}
