// components/staff/articles/block-editor/block-types.ts

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type BlockType =
  | HeadingLevel
  | "p"
  | "image"
  | "ol"
  | "ul"
  | "table"
  | "flex-container"
  | "grid-container";

// ─── Individual Block Data ────────────────────────────────────────────────────

export interface HeadingBlockData {
  type: HeadingLevel;
  text: string;
}

export interface ParagraphBlockData {
  type: "p";
  html: string;
}

export interface ImageBlockData {
  type: "image";
  mediaId: string;
  src: string;
  alt: string;
  caption: string;
  width: "full" | "wide" | "medium" | "small";
  align: "left" | "center" | "right";
}

export interface ListBlockData {
  type: "ol" | "ul";
  items: string[];
}

export interface TableCell {
  html: string;
}

export interface TableBlockData {
  type: "table";
  hasHeader: boolean;
  rows: TableCell[][];
}

export interface FlexContainerBlockData {
  type: "flex-container";
  direction: "row" | "column";
  gap: string;
  align: "start" | "center" | "end" | "stretch";
  justify: "start" | "center" | "end" | "between" | "around";
  children: Block[];
}

export interface GridContainerBlockData {
  type: "grid-container";
  columns: number;
  gap: string;
  children: Block[];
}

export type BlockData =
  | HeadingBlockData
  | ParagraphBlockData
  | ImageBlockData
  | ListBlockData
  | TableBlockData
  | FlexContainerBlockData
  | GridContainerBlockData;

// ─── Block entity (wrapper with id) ──────────────────────────────────────────

export interface Block {
  id: string;
  data: BlockData;
}

// ─── Block picker metadata ────────────────────────────────────────────────────

export interface BlockPickerItem {
  type: BlockType;
  label: string;
  description: string;
  icon: string; // lucide icon name or emoji for simplicity
  group: "text" | "media" | "lists" | "advanced";
}

export const BLOCK_PICKER_ITEMS: BlockPickerItem[] = [
  { type: "h1", label: "Heading 1", description: "Top-level title", icon: "H1", group: "text" },
  { type: "h2", label: "Heading 2", description: "Section title", icon: "H2", group: "text" },
  { type: "h3", label: "Heading 3", description: "Subsection title", icon: "H3", group: "text" },
  { type: "h4", label: "Heading 4", description: "Minor heading", icon: "H4", group: "text" },
  { type: "h5", label: "Heading 5", description: "Small heading", icon: "H5", group: "text" },
  { type: "h6", label: "Heading 6", description: "Smallest heading", icon: "H6", group: "text" },
  { type: "p", label: "Paragraph", description: "Rich text paragraph", icon: "¶", group: "text" },
  { type: "image", label: "Image", description: "Embed an image from media library", icon: "🖼", group: "media" },
  { type: "ol", label: "Ordered List", description: "Numbered list", icon: "1.", group: "lists" },
  { type: "ul", label: "Unordered List", description: "Bullet list", icon: "•", group: "lists" },
  { type: "table", label: "Table", description: "Data table with rows & columns", icon: "⊞", group: "lists" },
  { type: "flex-container", label: "Flex Container", description: "Flexbox layout wrapper", icon: "⬚", group: "advanced" },
  { type: "grid-container", label: "Grid Container", description: "CSS grid layout wrapper", icon: "⊟", group: "advanced" },
];

// ─── Factories ────────────────────────────────────────────────────────────────

import { nanoid } from "nanoid";

export function createBlock(type: BlockType): Block {
  const id = nanoid();

  if (type === "h1" || type === "h2" || type === "h3" || type === "h4" || type === "h5" || type === "h6") {
    return { id, data: { type, text: "" } };
  }
  if (type === "p") {
    return { id, data: { type: "p", html: "" } };
  }
  if (type === "image") {
    return { id, data: { type: "image", mediaId: "", src: "", alt: "", caption: "", width: "full", align: "center" } };
  }
  if (type === "ol" || type === "ul") {
    return { id, data: { type, items: [""] } };
  }
  if (type === "table") {
    return {
      id,
      data: {
        type: "table",
        hasHeader: true,
        rows: [
          [{ html: "Header 1" }, { html: "Header 2" }],
          [{ html: "" }, { html: "" }],
        ],
      },
    };
  }
  if (type === "flex-container") {
    return { id, data: { type: "flex-container", direction: "row", gap: "4", align: "start", justify: "start", children: [] } };
  }
  // grid-container
  return { id, data: { type: "grid-container", columns: 2, gap: "4", children: [] } };
}

export function serializeBlocksToHTML(blocks: Block[]): string {
  return JSON.stringify(blocks);
}

export function deserializeBlocksFromHTML(content: string): Block[] {
  if (!content || content.trim() === "") return [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed as Block[];
    return [];
  } catch {
    // Legacy HTML content — wrap in a single paragraph block
    return [{ id: nanoid(), data: { type: "p", html: content } }];
  }
}