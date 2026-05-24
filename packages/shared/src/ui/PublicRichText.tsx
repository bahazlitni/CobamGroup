import { Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "./cn";

export type PublicRichTextMark = {
  type?: string;
  attrs?: Record<string, unknown> | null;
};

export type PublicRichTextNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown> | null;
  marks?: PublicRichTextMark[];
  content?: PublicRichTextNode[];
};

export type PublicRichTextTheme = {
  content: string;
  empty: string;
  paragraph: string;
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  bulletList: string;
  orderedList: string;
  listItem: string;
  blockquote: string;
  horizontalRule: string;
  figure: string;
  image: string;
  figcaption: string;
  tableWrapper: string;
  table: string;
  tableRow: string;
  tableHeader: string;
  tableCell: string;
  codeBlock: string;
  inlineCode: string;
  link: string;
  strong: string;
  underline: string;
};

export type PublicRichTextProps = {
  content: unknown;
  className?: string;
  emptyLabel?: string;
  theme?: Partial<PublicRichTextTheme>;
};

const defaultTheme: PublicRichTextTheme = {
  content: "space-y-5",
  empty: "text-slate-500",
  paragraph: "text-[0.98rem] leading-8 text-slate-600",
  h1: "text-3xl font-semibold text-cobam-dark-blue sm:text-4xl",
  h2: "text-2xl font-semibold text-cobam-dark-blue sm:text-3xl",
  h3: "text-xl font-semibold text-cobam-dark-blue",
  h4: "text-lg font-semibold text-cobam-dark-blue",
  bulletList: "list-disc space-y-2 pl-5 text-slate-600 marker:text-cobam-water-blue",
  orderedList: "list-decimal space-y-2 pl-5 text-slate-600 marker:text-cobam-water-blue",
  listItem: "",
  blockquote: "border-l-4 border-cobam-water-blue/30 pl-5 text-[1.02rem] italic leading-8 text-slate-600",
  horizontalRule: "border-slate-200",
  figure: "overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm",
  image: "h-auto w-full object-cover",
  figcaption: "border-t border-slate-100 px-4 py-3 text-sm text-slate-500",
  tableWrapper: "overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-sm",
  table: "min-w-full border-collapse text-left text-sm text-slate-600",
  tableRow: "border-b border-slate-100 last:border-b-0",
  tableHeader: "bg-slate-50 px-4 py-3 font-semibold text-cobam-dark-blue",
  tableCell: "px-4 py-3",
  codeBlock: "overflow-x-auto rounded-[1.25rem] bg-slate-950 px-5 py-4 text-sm leading-7 text-slate-100",
  inlineCode: "rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.92em] text-cobam-dark-blue",
  link: "font-medium text-cobam-water-blue underline decoration-cobam-water-blue/40 underline-offset-4 transition hover:decoration-cobam-water-blue",
  strong: "",
  underline: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRichTextNode(value: unknown): value is PublicRichTextNode {
  return isRecord(value);
}

function normalizeRichTextContent(value: unknown): PublicRichTextNode {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return { type: "doc", content: [] };
    }

    try {
      return normalizeRichTextContent(JSON.parse(trimmed));
    } catch {
      return {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: value }] }],
      };
    }
  }

  if (Array.isArray(value)) {
    return {
      type: "doc",
      content: value.filter(isRichTextNode),
    };
  }

  if (!isRichTextNode(value)) {
    return { type: "doc", content: [] };
  }

  if (value.type === "doc") {
    return value;
  }

  return { type: "doc", content: [value] };
}

function getTextStyle(mark: PublicRichTextMark) {
  if (!isRecord(mark.attrs)) {
    return undefined;
  }

  const style: CSSProperties = {};

  if (typeof mark.attrs.color === "string" && mark.attrs.color.trim()) {
    style.color = mark.attrs.color;
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

function renderMarkedText(
  node: PublicRichTextNode,
  key: string,
  theme: PublicRichTextTheme,
): ReactNode {
  const text = node.text ?? "";
  const marks = Array.isArray(node.marks) ? node.marks : [];

  return marks.reduce<ReactNode>((child, mark, index) => {
    const markKey = `${key}-mark-${index}`;

    switch (mark.type) {
      case "bold":
        return (
          <strong key={markKey} className={theme.strong || undefined}>
            {child}
          </strong>
        );
      case "italic":
        return <em key={markKey}>{child}</em>;
      case "underline":
        return (
          <u key={markKey} className={theme.underline || undefined}>
            {child}
          </u>
        );
      case "strike":
        return <s key={markKey}>{child}</s>;
      case "code":
        return (
          <code key={markKey} className={theme.inlineCode}>
            {child}
          </code>
        );
      case "link": {
        const href =
          isRecord(mark.attrs) && typeof mark.attrs.href === "string"
            ? mark.attrs.href
            : "#";
        const isExternal = /^https?:\/\//i.test(href);

        return (
          <a
            key={markKey}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer noopener" : undefined}
            className={theme.link}
          >
            {child}
          </a>
        );
      }
      case "textStyle":
        return (
          <span key={markKey} style={getTextStyle(mark)}>
            {child}
          </span>
        );
      default:
        return <Fragment key={markKey}>{child}</Fragment>;
    }
  }, text);
}

function renderChildren(
  nodes: PublicRichTextNode[] | undefined,
  keyPrefix: string,
  theme: PublicRichTextTheme,
) {
  return (nodes ?? []).map((child, index) =>
    renderNode(child, `${keyPrefix}-${index}`, theme),
  );
}

function renderNode(node: PublicRichTextNode, key: string, theme: PublicRichTextTheme): ReactNode {
  switch (node.type) {
    case "doc":
      return <Fragment key={key}>{renderChildren(node.content, key, theme)}</Fragment>;

    case "paragraph":
      return (
        <p key={key} className={theme.paragraph}>
          {renderChildren(node.content, key, theme)}
        </p>
      );

    case "heading": {
      const level =
        isRecord(node.attrs) && typeof node.attrs.level === "number"
          ? node.attrs.level
          : 2;
      const content = renderChildren(node.content, key, theme);

      if (level <= 1) {
        return (
          <h1 key={key} className={theme.h1}>
            {content}
          </h1>
        );
      }

      if (level === 2) {
        return (
          <h2 key={key} className={theme.h2}>
            {content}
          </h2>
        );
      }

      if (level === 3) {
        return (
          <h3 key={key} className={theme.h3}>
            {content}
          </h3>
        );
      }

      return (
        <h4 key={key} className={theme.h4}>
          {content}
        </h4>
      );
    }

    case "bulletList":
      return (
        <ul key={key} className={theme.bulletList}>
          {renderChildren(node.content, key, theme)}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className={theme.orderedList}>
          {renderChildren(node.content, key, theme)}
        </ol>
      );

    case "listItem":
      return (
        <li key={key} className={theme.listItem || undefined}>
          {renderChildren(node.content, key, theme)}
        </li>
      );

    case "blockquote":
      return (
        <blockquote key={key} className={theme.blockquote}>
          {renderChildren(node.content, key, theme)}
        </blockquote>
      );

    case "horizontalRule":
      return <hr key={key} className={theme.horizontalRule} />;

    case "hardBreak":
      return <br key={key} />;

    case "image": {
      const attrs = isRecord(node.attrs) ? node.attrs : {};
      const src = typeof attrs.src === "string" ? attrs.src : "";
      const alt = typeof attrs.alt === "string" ? attrs.alt : "";
      const title = typeof attrs.title === "string" ? attrs.title : "";

      if (!src) {
        return null;
      }

      return (
        <figure key={key} className={theme.figure}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || title}
            loading="lazy"
            decoding="async"
            className={theme.image}
          />
          {title ? <figcaption className={theme.figcaption}>{title}</figcaption> : null}
        </figure>
      );
    }

    case "table":
      return (
        <div key={key} className={theme.tableWrapper}>
          <table className={theme.table}>
            <tbody>{renderChildren(node.content, key, theme)}</tbody>
          </table>
        </div>
      );

    case "tableRow":
      return (
        <tr key={key} className={theme.tableRow}>
          {renderChildren(node.content, key, theme)}
        </tr>
      );

    case "tableHeader":
      return (
        <th key={key} className={theme.tableHeader}>
          {renderChildren(node.content, key, theme)}
        </th>
      );

    case "tableCell":
      return (
        <td key={key} className={theme.tableCell}>
          {renderChildren(node.content, key, theme)}
        </td>
      );

    case "codeBlock":
      return (
        <pre key={key} className={theme.codeBlock}>
          <code>{node.text ?? renderChildren(node.content, key, theme)}</code>
        </pre>
      );

    case "text":
      return <Fragment key={key}>{renderMarkedText(node, key, theme)}</Fragment>;

    default:
      return <Fragment key={key}>{renderChildren(node.content, key, theme)}</Fragment>;
  }
}

function collectPlainText(node: PublicRichTextNode): string {
  return [node.text, ...(node.content ?? []).map(collectPlainText)]
    .filter(Boolean)
    .join(" ");
}

export function getPublicRichTextPlainText(content: unknown) {
  return collectPlainText(normalizeRichTextContent(content)).replace(/\s+/g, " ").trim();
}

export function PublicRichText({
  content,
  className,
  emptyLabel = "Aucune description pour le moment.",
  theme,
}: PublicRichTextProps) {
  const resolvedTheme = { ...defaultTheme, ...theme };
  const document = normalizeRichTextContent(content);
  const nodes = Array.isArray(document.content) ? document.content : [];

  if (nodes.length === 0) {
    return <div className={cn(resolvedTheme.empty, className)}>{emptyLabel}</div>;
  }

  return (
    <div className={className}>
      <div className={resolvedTheme.content}>
        {nodes.map((node, index) => renderNode(node, `node-${index}`, resolvedTheme))}
      </div>
    </div>
  );
}

export default PublicRichText;
