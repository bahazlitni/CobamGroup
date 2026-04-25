export const DESCRIPTION_SEO_MAX_LENGTH = 160;

export function truncateDescriptionSeo(value: string) {
  return value.slice(0, DESCRIPTION_SEO_MAX_LENGTH);
}

export function isDescriptionSeoTooLong(value: string | null | undefined) {
  return (value ?? "").trim().length > DESCRIPTION_SEO_MAX_LENGTH;
}
