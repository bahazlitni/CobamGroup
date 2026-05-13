import type { ReactNode } from "react";

type RichTextMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

type RichTextNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: RichTextMark[];
  content?: RichTextNode[];
};

function isRichTextNode(value: unknown): value is RichTextNode {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function renderMarks(node: RichTextNode, children: ReactNode, key: string) {
  return (node.marks ?? []).reduce<ReactNode>((content, mark, markIndex) => {
    const markKey = `${key}-mark-${markIndex}`;

    if (mark.type === "bold") {
      return (
        <strong key={markKey} className="font-semibold text-ec-ink">
          {content}
        </strong>
      );
    }

    if (mark.type === "italic") {
      return <em key={markKey}>{content}</em>;
    }

    if (mark.type === "underline") {
      return (
        <span key={markKey} className="underline decoration-ec-blue/40 underline-offset-4">
          {content}
        </span>
      );
    }

    if (mark.type === "link") {
      const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
      return (
        <a
          key={markKey}
          href={href}
          className="font-medium text-ec-blue underline-offset-4 hover:underline"
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
        >
          {content}
        </a>
      );
    }

    return content;
  }, children);
}

function renderChildren(nodes: RichTextNode[] | undefined, prefix: string) {
  return (nodes ?? []).map((node, index) => renderNode(node, `${prefix}-${index}`));
}

function renderNode(node: RichTextNode, key: string): ReactNode {
  if (node.type === "text") {
    return renderMarks(node, node.text ?? "", key);
  }

  if (node.type === "paragraph") {
    return (
      <p key={key} className="leading-8 text-ec-muted">
        {renderChildren(node.content, key)}
      </p>
    );
  }

  if (node.type === "heading") {
    const level = Number(node.attrs?.level ?? 2);
    const className = "font-semibold tracking-tight text-ec-ink";
    const children = renderChildren(node.content, key);

    if (level <= 2) {
      return (
        <h2 key={key} className={`${className} mt-8 text-2xl`}>
          {children}
        </h2>
      );
    }

    return (
      <h3 key={key} className={`${className} mt-7 text-xl`}>
        {children}
      </h3>
    );
  }

  if (node.type === "bulletList") {
    return (
      <ul key={key} className="ml-5 list-disc space-y-2 text-ec-muted">
        {renderChildren(node.content, key)}
      </ul>
    );
  }

  if (node.type === "orderedList") {
    return (
      <ol key={key} className="ml-5 list-decimal space-y-2 text-ec-muted">
        {renderChildren(node.content, key)}
      </ol>
    );
  }

  if (node.type === "listItem") {
    return (
      <li key={key} className="pl-1 leading-8">
        {renderChildren(node.content, key)}
      </li>
    );
  }

  if (node.type === "hardBreak") {
    return <br key={key} />;
  }

  return <span key={key}>{renderChildren(node.content, key)}</span>;
}

export function getRichTextPlainText(value: unknown): string | null {
  if (typeof value === "string") {
    try {
      return getRichTextPlainText(JSON.parse(value));
    } catch {
      return value.trim() || null;
    }
  }

  if (!isRichTextNode(value)) {
    return null;
  }

  const text = [
    value.text,
    ...(value.content ?? []).map((node) => getRichTextPlainText(node)),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return text || null;
}

export function RichText({ value }: { value: unknown }) {
  const document = typeof value === "string" ? safelyParseRichText(value) : value;

  if (!isRichTextNode(document)) {
    return null;
  }

  return <div className="space-y-5">{renderChildren(document.content, "rich")}</div>;
}

function safelyParseRichText(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: value }] }],
    };
  }
}
