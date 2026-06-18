"use client";

import { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { parseArticleContent, serializeArticleContent } from "@/features/articles/document";
import {
  createArticleEditorExtensions,
  DEFAULT_ARTICLE_RICH_TEXT_FEATURES,
  PARAGRAPH_ONLY_ARTICLE_RICH_TEXT_FEATURES,
  type ArticleRichTextEditorFeatures,
} from "@/features/articles/editor/extensions";
import { cn } from "@/lib/utils";
import ArticleRichTextToolbar from "./article-rich-text-toolbar";

type ArticleRichTextEditorProps = {
  editorId?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  variant?: "article" | "paragraphOnly";
  features?: Partial<ArticleRichTextEditorFeatures>;
};

type PastedImage = {
  src: string;
  alt: string;
};

function isImageFile(file: File | null | undefined): file is File {
  return Boolean(file && file.type.startsWith("image/"));
}

function getClipboardImageFiles(event: ClipboardEvent): File[] {
  const clipboardData = event.clipboardData;

  if (!clipboardData) {
    return [];
  }

  const files: File[] = [];
  const seen = new Set<string>();
  const addFile = (file: File | null) => {
    if (!isImageFile(file)) {
      return;
    }

    const key = `${file.name}:${file.type}:${file.size}:${file.lastModified}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    files.push(file);
  };

  Array.from(clipboardData.items).forEach((item) => {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      addFile(item.getAsFile());
    }
  });

  Array.from(clipboardData.files).forEach(addFile);

  return files;
}

function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string" && result.startsWith("data:image/")) {
        resolve(result);
        return;
      }

      reject(new Error("Invalid pasted image data."));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("Unable to read pasted image."));
    };

    reader.readAsDataURL(file);
  });
}

function getPastedImageAlt(file: File, index: number, count: number) {
  const fileNameWithoutExtension = file.name.replace(/\.[^.]+$/, "").trim();

  if (fileNameWithoutExtension && fileNameWithoutExtension.toLowerCase() !== "image") {
    return fileNameWithoutExtension;
  }

  return count > 1 ? `Image collee ${index + 1}` : "Image collee";
}

async function readPastedImages(files: File[]): Promise<PastedImage[]> {
  const images = await Promise.all(
    files.map(async (file, index) => {
      try {
        return {
          src: await readImageFileAsDataUrl(file),
          alt: getPastedImageAlt(file, index, files.length),
        };
      } catch {
        return null;
      }
    }),
  );

  return images.filter((image): image is PastedImage => image !== null);
}

function insertPastedImages(editor: Editor | null, images: PastedImage[]) {
  if (!editor?.isEditable || images.length === 0) {
    return;
  }

  editor
    .chain()
    .focus()
    .insertContent([
      ...images.map((image) => ({
        type: "image",
        attrs: {
          src: image.src,
          alt: image.alt,
        },
      })),
      { type: "paragraph" },
    ])
    .run();
}

function resolveEditorFeatures(
  variant: ArticleRichTextEditorProps["variant"],
  features: ArticleRichTextEditorProps["features"],
): ArticleRichTextEditorFeatures {
  const baseFeatures =
    variant === "paragraphOnly"
      ? PARAGRAPH_ONLY_ARTICLE_RICH_TEXT_FEATURES
      : DEFAULT_ARTICLE_RICH_TEXT_FEATURES;

  return {
    ...baseFeatures,
    ...features,
  };
}

export default function ArticleRichTextEditor({
  editorId,
  value,
  onChange,
  placeholder = "Commencez a ecrire votre article...",
  editable = true,
  className,
  variant = "article",
  features,
}: ArticleRichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  const editorRef = useRef<Editor | null>(null);
  const isSyncingExternalContentRef = useRef(false);
  const document = useMemo(() => parseArticleContent(value), [value]);
  const normalizedValue = useMemo(() => serializeArticleContent(document), [document]);
  const editorFeatures = useMemo(
    () => resolveEditorFeatures(variant, features),
    [features, variant],
  );
  const extensions = useMemo(
    () =>
      createArticleEditorExtensions({
        placeholder,
        enableImageAltEditor: editorFeatures.images,
        features: editorFeatures,
      }),
    [editorFeatures, placeholder],
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: document,
    editable,
    editorProps: {
      attributes: {
        ...(editorId ? { id: editorId } : {}),
        class: "tiptap article-document article-document--editor",
      },
      handlePaste: (_view, event) => {
        if (!editorFeatures.images || !editorRef.current?.isEditable) {
          return false;
        }

        const imageFiles = getClipboardImageFiles(event);

        if (imageFiles.length === 0) {
          return false;
        }

        event.preventDefault();

        void readPastedImages(imageFiles).then((images) => {
          insertPastedImages(editorRef.current, images);
        });

        return true;
      },
    },
    onCreate: ({ editor: nextEditor }) => {
      editorRef.current = nextEditor;
    },
    onDestroy: () => {
      editorRef.current = null;
    },
    onUpdate: ({ editor: nextEditor }) => {
      if (isSyncingExternalContentRef.current) {
        return;
      }

      onChangeRef.current(serializeArticleContent(nextEditor.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(editable);

    const currentContent = serializeArticleContent(editor.getJSON());

    if (currentContent !== normalizedValue) {
      isSyncingExternalContentRef.current = true;
      editor.commands.setContent(document, { emitUpdate: false });
      queueMicrotask(() => {
        isSyncingExternalContentRef.current = false;
      });
    }
  }, [document, editable, editor, normalizedValue]);

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-300 bg-white shadow-sm",
        !editable && "opacity-90",
        className,
      )}
    >
      <ArticleRichTextToolbar editor={editor} features={editorFeatures} />

      <div className="rounded-b-lg bg-white">
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div className="article-document article-document--editor animate-pulse">
            Chargement de l&apos;editeur...
          </div>
        )}
      </div>
    </div>
  );
}
