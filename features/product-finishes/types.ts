export type ProductFinishDto = {
  id: number;
  name: string;
  colorHex: string;
  mediaId: number | null;
  mediaThumbnailEndpoint: string | null;
  mediaFileEndpoint: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductFinishSuggestionDto = {
  id: number;
  value: string;
  label: string;
  colorHex: string;
  mediaId: number | null;
};

export type ProductFinishInput = {
  name: string;
  colorHex: string;
  mediaId: number | null;
};
