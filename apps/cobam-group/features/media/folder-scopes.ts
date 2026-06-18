export const MEDIA_FOLDER_SCOPE_IDS = {
  PRODUCT_CATEGORIES: 1,
  PRODUCT_DATASHEETS: 4,
  PRODUCT_IMAGES: 5,
  ARTICLES: 6,
  FINISHES: 7,
  BRANDS: 8,
  PROMOTIONS: 9,
  CERTIFICATE_PDFS: 13,
  PRODUCT_CERTIFICATE_IMAGES: 22,
} as const;

export const MEDIA_FOLDER_SCOPE_LABELS = {
  [MEDIA_FOLDER_SCOPE_IDS.PRODUCT_CATEGORIES]: "Categories Produits",
  [MEDIA_FOLDER_SCOPE_IDS.PRODUCT_DATASHEETS]: "Fiches techniques",
  [MEDIA_FOLDER_SCOPE_IDS.PRODUCT_IMAGES]: "Images",
  [MEDIA_FOLDER_SCOPE_IDS.ARTICLES]: "Articles",
  [MEDIA_FOLDER_SCOPE_IDS.FINISHES]: "Finitions",
  [MEDIA_FOLDER_SCOPE_IDS.BRANDS]: "Marques",
  [MEDIA_FOLDER_SCOPE_IDS.PROMOTIONS]: "Promotions",
  [MEDIA_FOLDER_SCOPE_IDS.CERTIFICATE_PDFS]: "Certificats",
  [MEDIA_FOLDER_SCOPE_IDS.PRODUCT_CERTIFICATE_IMAGES]: "Certificats Produits",
} as const satisfies Record<number, string>;

export type MediaFolderScopeId =
  (typeof MEDIA_FOLDER_SCOPE_IDS)[keyof typeof MEDIA_FOLDER_SCOPE_IDS];

export function getMediaFolderScopeLabel(folderId: number | null | undefined) {
  if (folderId == null) {
    return undefined;
  }

  return (MEDIA_FOLDER_SCOPE_LABELS as Record<number, string>)[folderId] ?? `#${folderId}`;
}
