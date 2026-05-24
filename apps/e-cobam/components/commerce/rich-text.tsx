import {
  PublicRichText,
  getPublicRichTextPlainText,
  type PublicRichTextTheme,
} from "@cobam/shared/ui/PublicRichText";

export const commerceRichTextTheme = {
  content: "space-y-5",
  empty: "text-ec-muted",
  paragraph: "leading-8 text-ec-muted",
  h1: "mt-8 text-3xl font-black tracking-tight text-ec-ink",
  h2: "mt-8 text-2xl font-black tracking-tight text-ec-ink",
  h3: "mt-7 text-xl font-black tracking-tight text-ec-ink",
  h4: "mt-7 text-lg font-black tracking-tight text-ec-ink",
  bulletList: "ml-5 list-disc space-y-2 text-ec-muted marker:text-ec-blue",
  orderedList: "ml-5 list-decimal space-y-2 text-ec-muted marker:text-ec-blue",
  listItem: "pl-1 leading-8",
  blockquote: "border-l-4 border-ec-blue/30 pl-5 text-[1.02rem] italic leading-8 text-ec-muted",
  horizontalRule: "border-ec-line",
  figure: "overflow-hidden rounded-[1.35rem] border border-ec-line bg-white",
  image: "h-auto w-full object-cover",
  figcaption: "border-t border-ec-line px-4 py-3 text-sm text-ec-muted",
  tableWrapper: "overflow-x-auto rounded-[1.35rem] border border-ec-line bg-white",
  table: "min-w-full border-collapse text-left text-sm text-ec-muted",
  tableRow: "border-b border-ec-line last:border-b-0",
  tableHeader: "bg-slate-50 px-4 py-3 font-black text-ec-ink",
  tableCell: "px-4 py-3",
  codeBlock: "overflow-x-auto rounded-[1.1rem] bg-ec-ink px-5 py-4 text-sm leading-7 text-white",
  inlineCode: "rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.92em] text-ec-ink",
  link: "font-medium text-ec-blue underline-offset-4 hover:underline",
  strong: "font-semibold text-ec-ink",
  underline: "decoration-ec-blue/40 underline-offset-4",
} satisfies Partial<PublicRichTextTheme>;

export function getRichTextPlainText(value: unknown): string | null {
  const text = getPublicRichTextPlainText(value);
  return text || null;
}

export function RichText({ value }: { value: unknown }) {
  return <PublicRichText content={value} theme={commerceRichTextTheme} />;
}
