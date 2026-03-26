"use client";

import { useState, type ReactNode } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Columns3,
  Eraser,
  Heading1,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Rows3,
  Strikethrough,
  Trash2,
  Type,
  Underline as UnderlineIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ImagePickerDialog from "@/components/staff/media/importers/image-picker-dialog";
import type { MediaListItemDto } from "@/features/media/types";
import {
  ARTICLE_EDITOR_COLOR_PRESETS,
  normalizeArticleEditorColor,
} from "@/features/articles/editor/colors";
import { cn } from "@/lib/utils";

type ArticleRichTextToolbarProps = {
  editor: Editor | null;
};

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
};

function ToolbarButton({
  active = false,
  disabled = false,
  onClick,
  className,
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "outline"}
      disabled={disabled}
      onClick={onClick}
      className={cn("h-9 rounded-xl border-slate-200 px-3", className)}
    >
      {children}
    </Button>
  );
}

function getActiveBlockValue(editor: Editor | null) {
  if (!editor) {
    return "paragraph";
  }

  for (const level of [1, 2, 3, 4, 5, 6] as const) {
    if (editor.isActive("heading", { level })) {
      return `h${level}`;
    }
  }

  return "paragraph";
}

function applyBlockType(editor: Editor | null, nextValue: string) {
  if (!editor) {
    return;
  }

  const chain = editor.chain().focus();

  if (nextValue === "paragraph") {
    chain.setParagraph().run();
    return;
  }

  if (nextValue.startsWith("h")) {
    const level = Number(nextValue.slice(1));

    if (Number.isInteger(level) && level >= 1 && level <= 6) {
      chain.toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
  }
}

function buildArticleImageSource(mediaId: number) {
  return `/api/staff/medias/${mediaId}/file`;
}

export default function ArticleRichTextToolbar({
  editor,
}: ArticleRichTextToolbarProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const isReadOnly = !editor?.isEditable;
  const editorState =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => {
        const nextColor = currentEditor?.getAttributes("textStyle").color;

        return {
          activeBlock: getActiveBlockValue(currentEditor),
          currentColor:
            typeof nextColor === "string" && nextColor.startsWith("#")
              ? nextColor
              : "#14202e",
          isBold: currentEditor?.isActive("bold") ?? false,
          isItalic: currentEditor?.isActive("italic") ?? false,
          isUnderline: currentEditor?.isActive("underline") ?? false,
          isStrike: currentEditor?.isActive("strike") ?? false,
          isBlockquote: currentEditor?.isActive("blockquote") ?? false,
          isBulletList: currentEditor?.isActive("bulletList") ?? false,
          isOrderedList: currentEditor?.isActive("orderedList") ?? false,
          isHeadingOne:
            currentEditor?.isActive("heading", { level: 1 }) ?? false,
          isInTable: currentEditor?.isActive("table") ?? false,
        };
      },
    }) ?? {
      activeBlock: "paragraph",
      currentColor: "#14202e",
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrike: false,
      isBlockquote: false,
      isBulletList: false,
      isOrderedList: false,
      isHeadingOne: false,
      isInTable: false,
    };

  const handleInsertImage = (media: MediaListItemDto) => {
    if (!editor) {
      return;
    }

    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: {
          src: buildArticleImageSource(media.id),
          mediaId: String(media.id),
          alt:
            media.altText ??
            media.title ??
            media.originalFilename ??
            "Image d'article",
          title: media.title ?? media.originalFilename ?? undefined,
        },
      })
      .run();
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={editorState.activeBlock}
          onValueChange={(value) => applyBlockType(editor, value)}
          disabled={isReadOnly}
        >
          <SelectTrigger className="h-9 min-w-40 rounded-xl border-slate-200 bg-white">
            <SelectValue placeholder="Paragraphe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Paragraphe</SelectItem>
            <SelectItem value="h1">Titre 1</SelectItem>
            <SelectItem value="h2">Titre 2</SelectItem>
            <SelectItem value="h3">Titre 3</SelectItem>
            <SelectItem value="h4">Titre 4</SelectItem>
            <SelectItem value="h5">Titre 5</SelectItem>
            <SelectItem value="h6">Titre 6</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

        <ToolbarButton
          active={editorState.isBold}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="mr-2 h-4 w-4" />
          Gras
        </ToolbarButton>

        <ToolbarButton
          active={editorState.isItalic}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="mr-2 h-4 w-4" />
          Italique
        </ToolbarButton>

        <ToolbarButton
          active={editorState.isUnderline}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="mr-2 h-4 w-4" />
          Souligne
        </ToolbarButton>

        <ToolbarButton
          active={editorState.isStrike}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="mr-2 h-4 w-4" />
          Barre
        </ToolbarButton>

        <ToolbarButton
          active={editorState.isBlockquote}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="mr-2 h-4 w-4" />
          Citation
        </ToolbarButton>

        <ToolbarButton
          active={editorState.isBulletList}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="mr-2 h-4 w-4" />
          Liste
        </ToolbarButton>

        <ToolbarButton
          active={editorState.isOrderedList}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="mr-2 h-4 w-4" />
          Liste ordonnee
        </ToolbarButton>

        <ToolbarButton
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="mr-2 h-4 w-4" />
          Ligne
        </ToolbarButton>

        <ToolbarButton
          disabled={isReadOnly}
          onClick={() => setIsImageDialogOpen(true)}
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Image
        </ToolbarButton>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <div className="inline-flex items-center gap-2 pr-1 text-xs font-medium text-slate-600">
              <Type className="h-4 w-4 text-slate-400" />
              <span>Palette COBAM</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {ARTICLE_EDITOR_COLOR_PRESETS.map((preset) => {
                const isActive =
                  normalizeArticleEditorColor(editorState.currentColor) ===
                  normalizeArticleEditorColor(preset.value);

                return (
                  <button
                    key={preset.value}
                    type="button"
                    title={`${preset.name} - ${preset.description}`}
                    aria-label={`Appliquer ${preset.name}`}
                    onClick={() =>
                      editor?.chain().focus().setColor(preset.value).run()
                    }
                    disabled={isReadOnly}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition-transform duration-200 hover:scale-105",
                      isActive
                        ? "border-slate-900 ring-2 ring-slate-200"
                        : "border-white shadow-sm",
                    )}
                    style={{ backgroundColor: preset.value }}
                  />
                );
              })}
            </div>

            <label className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600">
              <span>Libre</span>
              <Input
                type="color"
                value={editorState.currentColor}
                onChange={(event) =>
                  editor?.chain().focus().setColor(event.target.value).run()
                }
                disabled={isReadOnly}
                className="h-6 w-8 cursor-pointer rounded-md border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </label>
          </div>

          <ToolbarButton
            disabled={!editor}
            onClick={() => editor?.chain().focus().unsetColor().run()}
          >
            <Eraser className="mr-2 h-4 w-4" />
            Retirer la couleur
          </ToolbarButton>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ToolbarButton
          active={editorState.isHeadingOne}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="mr-2 h-4 w-4" />
          Titre rapide
        </ToolbarButton>

        <ToolbarButton
          active={editorState.isInTable}
          disabled={!editor}
          onClick={() =>
            editor
              ?.chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          Tableau
        </ToolbarButton>

        {editorState.isInTable ? (
          <>
            <ToolbarButton
              disabled={!editor}
              onClick={() => editor?.chain().focus().addRowAfter().run()}
            >
              <Rows3 className="mr-2 h-4 w-4" />
              Ligne +
            </ToolbarButton>

            <ToolbarButton
              disabled={!editor}
              onClick={() => editor?.chain().focus().addColumnAfter().run()}
            >
              <Columns3 className="mr-2 h-4 w-4" />
              Colonne +
            </ToolbarButton>

            <ToolbarButton
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
            >
              Entete
            </ToolbarButton>

            <ToolbarButton
              disabled={!editor}
              onClick={() => editor?.chain().focus().deleteRow().run()}
            >
              Supprimer ligne
            </ToolbarButton>

            <ToolbarButton
              disabled={!editor}
              onClick={() => editor?.chain().focus().deleteColumn().run()}
            >
              Supprimer colonne
            </ToolbarButton>

            <ToolbarButton
              disabled={!editor}
              onClick={() => editor?.chain().focus().deleteTable().run()}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer tableau
            </ToolbarButton>
          </>
        ) : null}
      </div>

      <ImagePickerDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        title="Inserer une image dans l'article"
        description="Choisissez une image depuis la mediatheque ou importez-en une nouvelle."
        selectedMediaId={null}
        onSelect={(media) => {
          handleInsertImage(media);
          setIsImageDialogOpen(false);
        }}
      />
    </>
  );
}
