export type ArticleEditorColorPreset = {
  name: string;
  value: `#${string}`;
  description: string;
};

export const ARTICLE_EDITOR_COLOR_PRESETS: readonly ArticleEditorColorPreset[] = [
  {
    name: "Water Blue",
    value: "#0a8dc1",
    description: "Couleur d'accent principale COBAM.",
  },
  {
    name: "Dark Blue",
    value: "#14202e",
    description: "Bleu fonce principal de la marque.",
  },
  {
    name: "Carbon Grey",
    value: "#5e5e5e",
    description: "Gris fonce pour une lecture sobre.",
  },
  {
    name: "Slate",
    value: "#475569",
    description: "Ardoise profonde pour les intertitres et contenus techniques.",
  },
  {
    name: "Slate Light",
    value: "#64748b",
    description: "Ardoise adoucie pour les niveaux secondaires.",
  },
  {
    name: "Quill Grey",
    value: "#d3d3d3",
    description: "Gris clair de la charte, a utiliser avec parcimonie.",
  },
] as const;

export const ARTICLE_HEADING_COLORS = {
  h1: "#0a8dc1",
  h2: "#14202e",
  h3: "#5e5e5e",
  h4: "#475569",
  h5: "#64748b",
  h6: "#738296",
} as const;

export function normalizeArticleEditorColor(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}
