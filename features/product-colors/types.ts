export type ProductColorDto = {
  id: number;
  name: string;
  hexValue: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductColorSuggestionDto = {
  id: number;
  value: string;
  label: string;
  hexValue: string;
};

export type ProductColorInput = {
  name: string;
  hexValue: string;
};
