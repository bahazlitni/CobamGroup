import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { JSONContent } from "@tiptap/core";
import { parseArticleContent } from "@/features/articles/document";

type PublicRichTextProps = {
  content: string | null | undefined;
  className?: string;
  emptyLabel?: string;
};

type RichTextMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getTextStyle(mark: RichTextMark) {
  if (!isRecord(mark?.attrs)) {
    return undefined;
  }

  const style: CSSProperties = {};

  if (typeof mark.attrs.color === "string" && mark.attrs.color.trim()) {
    style.color = mark.attrs.color;
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

function renderMarkedText(node: JSONContent, key: string): ReactNode {
  const text = node.text ?? "";
  const marks = (Array.isArray(node.marks) ? node.marks : []) as RichTextMark[];

  return marks.reduce<ReactNode>((child, mark, index) => {
    const markKey = `${key}-mark-${index}`;

    switch (mark.type) {
      case "bold":
        return <strong key={markKey}>{child}</strong>;
      case "italic":
        return <em key={markKey}>{child}</em>;
      case "underline":
        return <u key={markKey}>{child}</u>;
      case "strike":
        return <s key={markKey}>{child}</s>;
      case "code":
        return (
          <code
            key={markKey}
            className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.92em] text-cobam-dark-blue"
          >
            {child}
          </code>
        );
      case "link": {
        const href =
          isRecord(mark.attrs) && typeof mark.attrs.href === "string"
            ? mark.attrs.href
            : "#";

        return (
          <a
            key={markKey}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-cobam-water-blue underline decoration-cobam-water-blue/40 underline-offset-4 transition hover:decoration-cobam-water-blue"
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

function renderChildren(nodes: JSONContent[] | undefined, keyPrefix: string) {
  return (nodes ?? []).map((child, index) =>
    renderNode(child, `${keyPrefix}-${index}`),
  );
}

function renderNode(node: JSONContent, key: string): ReactNode {
  switch (node.type) {
    case "doc":
      return <Fragment key={key}>{renderChildren(node.content, key)}</Fragment>;

    case "paragraph":
      return (
        <p key={key} className="text-[0.98rem] leading-8 text-slate-600">
          {renderChildren(node.content, key)}
        </p>
      );

    case "heading": {
      const level =
        isRecord(node.attrs) && typeof node.attrs.level === "number"
          ? node.attrs.level
          : 2;
      const content = renderChildren(node.content, key);

      if (level <= 1) {
        return (
          <h1 key={key} className="text-3xl font-semibold text-cobam-dark-blue sm:text-4xl">
            {content}
          </h1>
        );
      }

      if (level === 2) {
        return (
          <h2 key={key} className="text-2xl font-semibold text-cobam-dark-blue sm:text-3xl">
            {content}
          </h2>
        );
      }

      if (level === 3) {
        return (
          <h3 key={key} className="text-xl font-semibold text-cobam-dark-blue">
            {content}
          </h3>
        );
      }

      return (
        <h4 key={key} className="text-lg font-semibold text-cobam-dark-blue">
          {content}
        </h4>
      );
    }

    case "bulletList":
      return (
        <ul key={key} className="list-disc space-y-2 pl-5 text-slate-600 marker:text-cobam-water-blue">
          {renderChildren(node.content, key)}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-decimal space-y-2 pl-5 text-slate-600 marker:text-cobam-water-blue">
          {renderChildren(node.content, key)}
        </ol>
      );

    case "listItem":
      return <li key={key}>{renderChildren(node.content, key)}</li>;

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-cobam-water-blue/30 pl-5 text-[1.02rem] italic leading-8 text-slate-600"
        >
          {renderChildren(node.content, key)}
        </blockquote>
      );

    case "horizontalRule":
      return <hr key={key} className="border-slate-200" />;

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
        <figure key={key} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || title}
            loading="lazy"
            decoding="async"
            className="h-auto w-full object-cover"
          />
          {title ? (
            <figcaption className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
              {title}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    case "table":
      return (
        <div key={key} className="overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full border-collapse text-left text-sm text-slate-600">
            <tbody>{renderChildren(node.content, key)}</tbody>
          </table>
        </div>
      );

    case "tableRow":
      return <tr key={key} className="border-b border-slate-100 last:border-b-0">{renderChildren(node.content, key)}</tr>;

    case "tableHeader":
      return (
        <th key={key} className="bg-slate-50 px-4 py-3 font-semibold text-cobam-dark-blue">
          {renderChildren(node.content, key)}
        </th>
      );

    case "tableCell":
      return <td key={key} className="px-4 py-3">{renderChildren(node.content, key)}</td>;

    case "codeBlock":
      return (
        <pre
          key={key}
          className="overflow-x-auto rounded-[1.25rem] bg-slate-950 px-5 py-4 text-sm leading-7 text-slate-100"
        >
          <code>{node.text ?? renderChildren(node.content, key)}</code>
        </pre>
      );

    case "text":
      return <Fragment key={key}>{renderMarkedText(node, key)}</Fragment>;

    default:
      return <Fragment key={key}>{renderChildren(node.content, key)}</Fragment>;
  }
}

export default function PublicRichText({
  content,
  className,
  emptyLabel = "Aucune description pour le moment.",
}: PublicRichTextProps) {
  const document = parseArticleContent(content);
  const nodes = Array.isArray(document.content) ? document.content : [];

  if (nodes.length === 0) {
    return <div className={className}>{emptyLabel}</div>;
  }

  return (
    <div className={className}>
      <div className="space-y-5">{nodes.map((node, index) => renderNode(node, `node-${index}`))}</div>
    </div>
  );
}
