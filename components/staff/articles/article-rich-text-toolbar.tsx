"use client";

import { useState, type ReactNode } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Eraser,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Unlink2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  label: string;
  iconOnly?: boolean;
  children: ReactNode;
};

function ToolbarButton({
  active = false,
  disabled = false,
  onClick,
  className,
  label,
  iconOnly = false,
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "outline"}
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "h-9 rounded-xl border-slate-300",
        iconOnly ? "w-9 px-0" : "px-3",
        className,
      )}
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

function normalizeLinkUrl(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return "";
  }

  if (
    /^(https?:\/\/|mailto:|tel:)/i.test(normalized) ||
    normalized.startsWith("/") ||
    normalized.startsWith("#")
  ) {
    return normalized;
  }

  return `https://${normalized}`;
}

export default function ArticleRichTextToolbar({
  editor,
}: ArticleRichTextToolbarProps) {
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkTextValue, setLinkTextValue] = useState("");
  const isReadOnly = !editor?.isEditable;
  const editorState =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => {
        const nextColor = currentEditor?.getAttributes("textStyle").color;
        const nextLinkHref = currentEditor?.getAttributes("link").href;

        return {
          activeBlock: getActiveBlockValue(currentEditor),
          currentColor:
            typeof nextColor === "string" && nextColor.startsWith("#")
              ? nextColor
              : "#14202e",
          isTable: currentEditor?.isActive("table") ?? false,
          isBold: currentEditor?.isActive("bold") ?? false,
          isItalic: currentEditor?.isActive("italic") ?? false,
          isUnderline: currentEditor?.isActive("underline") ?? false,
          isStrike: currentEditor?.isActive("strike") ?? false,
          isLink: currentEditor?.isActive("link") ?? false,
          currentLinkHref:
            typeof nextLinkHref === "string" ? nextLinkHref : "",
          isBlockquote: currentEditor?.isActive("blockquote") ?? false,
          isBulletList: currentEditor?.isActive("bulletList") ?? false,
          isOrderedList: currentEditor?.isActive("orderedList") ?? false,
        };
      },
    }) ?? {
      activeBlock: "paragraph",
      currentColor: "#14202e",
      isTable: false,
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrike: false,
      isLink: false,
      currentLinkHref: "",
      isBlockquote: false,
      isBulletList: false,
      isOrderedList: false,
    };

  const applyLink = () => {
    if (!editor) {
      return;
    }

    const href = normalizeLinkUrl(linkValue);
    const text = linkTextValue.trim();

    if (!href || !text) {
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .insertContent({
        type: "text",
        text,
        marks: [{ type: "link", attrs: { href } }],
      })
      .run();

    setIsLinkPopoverOpen(false);
  };

  const removeLink = () => {
    if (!editor) {
      return;
    }

    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsLinkPopoverOpen(false);
  };

  return (
    <div className="sticky top-0 z-2 flex w-full flex-col gap-3 border-b border-slate-300 p-4 pt-6 backdrop-blur supports-[backdrop-filter]:bg-slate-50/85">
      <div className="flex min-w-max items-center justify-center gap-2">
        <Select
          value={editorState.activeBlock}
          onValueChange={(value) => applyBlockType(editor, value)}
          disabled={isReadOnly}
        >
          <SelectTrigger className="h-9 min-w-40 rounded-xl border-slate-300 bg-white">
            <div className="flex items-center gap-2">
              <SelectValue placeholder="Titre rapide" />
            </div>
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
          label="Gras"
          iconOnly
          active={editorState.isBold}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Italique"
          iconOnly
          active={editorState.isItalic}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Souligne"
          iconOnly
          active={editorState.isUnderline}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Barre"
          iconOnly
          active={editorState.isStrike}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <Popover
          open={isLinkPopoverOpen}
          onOpenChange={(nextOpen) => {
            setIsLinkPopoverOpen(nextOpen);
            if (nextOpen) {
              const selectedText = editor
                ?.state.doc.textBetween(
                  editor.state.selection.from,
                  editor.state.selection.to,
                  " ",
                )
                .trim();

              setLinkValue(editorState.currentLinkHref);
              setLinkTextValue(selectedText || "");
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant={editorState.isLink ? "secondary" : "outline"}
              disabled={isReadOnly}
              title="Lien"
              aria-label="Lien"
              className="h-9 rounded-xl border-slate-300 px-3"
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="center"
            side="bottom"
            sideOffset={8}
            onOpenAutoFocus={(event) => event.preventDefault()}
            className="w-[22rem] rounded-lg border border-slate-300 bg-white p-3"
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-cobam-dark-blue">
                  Ajouter un lien
                </p>
                <p className="text-xs text-slate-500">
                  Renseignez le texte visible et l&apos;URL du lien.
                </p>
              </div>

              <Input
                value={linkTextValue}
                onChange={(event) => setLinkTextValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyLink();
                  }
                }}
                placeholder="Texte du lien"
                className="h-10 border-slate-300"
              />

              <Input
                value={linkValue}
                onChange={(event) => setLinkValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyLink();
                  }
                }}
                placeholder="https://exemple.com"
                className="h-10 border-slate-300"
              />

              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeLink}
                  disabled={!editorState.isLink && !editorState.currentLinkHref}
                  className="rounded-xl border-slate-300"
                >
                  <Unlink2 className="mr-2 h-4 w-4" />
                  Retirer
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={applyLink}
                  disabled={!linkTextValue.trim() || !linkValue.trim()}
                  className="rounded-xl"
                >
                  Appliquer
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarButton
          label="Citation"
          active={editorState.isBlockquote}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Liste"
          active={editorState.isBulletList}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="mr-2 h-4 w-4" />
          Liste
        </ToolbarButton>

        <ToolbarButton
          label="Liste ordonnée"
          active={editorState.isOrderedList}
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="mr-2 h-4 w-4" />
          123
        </ToolbarButton>

        <ToolbarButton
          label="Tableau"
          disabled={isReadOnly}
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

        <ToolbarButton
          label="Horizontal"
          disabled={isReadOnly}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="mr-2 h-4 w-4" />
          Ligne
        </ToolbarButton>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
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

          <label className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-600">
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
          label="Retirer la couleur"
          iconOnly
          disabled={!editor}
          onClick={() => editor?.chain().focus().unsetColor().run()}
        >
          <Eraser className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {editorState.isTable ? (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white p-3">
          <ToolbarButton
            label="Ajouter une ligne avant"
            disabled={isReadOnly}
            onClick={() => editor?.chain().focus().addRowBefore().run()}
          >
            Ligne avant
          </ToolbarButton>

          <ToolbarButton
            label="Ajouter une ligne après"
            disabled={isReadOnly}
            onClick={() => editor?.chain().focus().addRowAfter().run()}
          >
            Ligne après
          </ToolbarButton>

          <ToolbarButton
            label="Supprimer la ligne"
            disabled={isReadOnly}
            onClick={() => editor?.chain().focus().deleteRow().run()}
          >
            Supprimer ligne
          </ToolbarButton>

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          <ToolbarButton
            label="Ajouter une colonne avant"
            disabled={isReadOnly}
            onClick={() => editor?.chain().focus().addColumnBefore().run()}
          >
            Colonne avant
          </ToolbarButton>

          <ToolbarButton
            label="Ajouter une colonne après"
            disabled={isReadOnly}
            onClick={() => editor?.chain().focus().addColumnAfter().run()}
          >
            Colonne après
          </ToolbarButton>

          <ToolbarButton
            label="Supprimer la colonne"
            disabled={isReadOnly}
            onClick={() => editor?.chain().focus().deleteColumn().run()}
          >
            Supprimer colonne
          </ToolbarButton>

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          <ToolbarButton
            label="Supprimer le tableau"
            disabled={isReadOnly}
            onClick={() => editor?.chain().focus().deleteTable().run()}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            Supprimer tableau
          </ToolbarButton>
        </div>
      ) : null}
    </div>
  );
}
