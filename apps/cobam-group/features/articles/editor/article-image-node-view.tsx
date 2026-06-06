"use client";

import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";

function getStringAttr(value: unknown) {
  return typeof value === "string" ? value : "";
}

export default function ArticleImageNodeView({
  editor,
  getPos,
  node,
  selected,
  updateAttributes,
}: NodeViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const src = getStringAttr(node.attrs.src);
  const alt = getStringAttr(node.attrs.alt);
  const title = getStringAttr(node.attrs.title);
  const showAltEditor = editor.isEditable && selected;

  useEffect(() => {
    if (!showAltEditor) {
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [showAltEditor]);

  const selectImage = (event: MouseEvent) => {
    if (!editor.isEditable) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const position = getPos();

    if (typeof position === "number") {
      editor.chain().focus().setNodeSelection(position).run();
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();

    if (event.key === "Escape") {
      event.preventDefault();
      const position = getPos();

      if (typeof position === "number") {
        editor.chain().focus().setNodeSelection(position).run();
      }
    }
  };

  if (!src) {
    return null;
  }

  return (
    <NodeViewWrapper
      contentEditable={false}
      className={cn(
        "article-image-node-view my-5 flex flex-col items-center gap-2",
        selected && editor.isEditable && "is-selected",
      )}
    >
      <button
        type="button"
        tabIndex={editor.isEditable ? 0 : -1}
        aria-label={alt || title || "Image"}
        onMouseDown={selectImage}
        className={cn(
          "group block max-w-full rounded-2xl border border-transparent p-1 transition",
          editor.isEditable && "cursor-text hover:border-cobam-water-blue/35",
          selected && editor.isEditable && "border-cobam-water-blue bg-cobam-water-blue/5",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} title={title || undefined} loading="lazy" decoding="async" />
      </button>

      {showAltEditor ? (
        <div
          className="w-full max-w-xl rounded-lg border border-slate-300 bg-white p-2 shadow-sm"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <label className="block text-xs font-medium text-slate-500" htmlFor="article-image-alt">
            Texte alternatif
          </label>
          <input
            ref={inputRef}
            id="article-image-alt"
            type="text"
            value={alt}
            onChange={(event) => updateAttributes({ alt: event.target.value })}
            onKeyDown={handleInputKeyDown}
            placeholder="Decrivez cette image"
            className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-cobam-water-blue focus:ring-2 focus:ring-cobam-water-blue/15"
          />
        </div>
      ) : null}
    </NodeViewWrapper>
  );
}
