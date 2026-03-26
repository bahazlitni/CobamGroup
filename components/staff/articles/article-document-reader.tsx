"use client";

import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  isArticleDocumentEmpty,
  parseArticleContent,
  serializeArticleContent,
} from "@/features/articles/document";
import { createArticleEditorExtensions } from "@/features/articles/editor/extensions";
import { cn } from "@/lib/utils";

type ArticleDocumentReaderProps = {
  content: string;
  className?: string;
  emptyLabel?: string;
};

export default function ArticleDocumentReader({
  content,
  className,
  emptyLabel = "Aucun contenu pour le moment.",
}: ArticleDocumentReaderProps) {
  const document = useMemo(() => parseArticleContent(content), [content]);
  const normalizedContent = useMemo(
    () => serializeArticleContent(document),
    [document],
  );
  const extensions = useMemo(() => createArticleEditorExtensions(), []);
  const isEmpty = isArticleDocumentEmpty(document);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions,
    content: document,
    editorProps: {
      attributes: {
        class: "tiptap article-document article-document--reader",
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentContent = serializeArticleContent(editor.getJSON());

    if (currentContent !== normalizedContent) {
      editor.commands.setContent(document, { emitUpdate: false });
    }
  }, [document, editor, normalizedContent]);

  if (isEmpty) {
    return (
      <div className={cn("article-document article-document--empty", className)}>
        {emptyLabel}
      </div>
    );
  }

  if (!editor) {
    return (
      <div
        className={cn(
          "article-document article-document--empty animate-pulse",
          className,
        )}
      >
        Chargement de l&apos;aperçu...
      </div>
    );
  }

  return <EditorContent editor={editor} className={className} />;
}
