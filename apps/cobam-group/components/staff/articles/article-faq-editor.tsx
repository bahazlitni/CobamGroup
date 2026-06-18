"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import PanelInput from "@/components/staff/ui/PanelInput";
import type { ArticleEditorFaqQuestion } from "@/features/articles/hooks/use-article-editor";
import { normalizeArticleContent } from "@/features/articles/document";
import ArticleRichTextEditor from "./article-rich-text-editor";
import { cn } from "@/lib/utils";

type ArticleFaqEditorProps = {
  value: ArticleEditorFaqQuestion[];
  onChange: (value: ArticleEditorFaqQuestion[]) => void;
  disabled?: boolean;
};

function createRowId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `article-faq-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeSortOrder(items: ArticleEditorFaqQuestion[]) {
  return items.map((item, index) => ({
    ...item,
    sortOrder: index,
  }));
}

function createQuestion(index: number): ArticleEditorFaqQuestion {
  return {
    rowId: createRowId(),
    id: null,
    question: "",
    content: normalizeArticleContent(""),
    sortOrder: index,
  };
}

export default function ArticleFaqEditor({
  value,
  onChange,
  disabled = false,
}: ArticleFaqEditorProps) {
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);

  const addQuestion = () => {
    onChange(normalizeSortOrder([...value, createQuestion(value.length)]));
  };

  const updateQuestion = (
    rowId: string,
    updater: (item: ArticleEditorFaqQuestion) => ArticleEditorFaqQuestion,
  ) => {
    onChange(value.map((item) => (item.rowId === rowId ? updater(item) : item)));
  };

  const removeQuestion = (rowId: string) => {
    onChange(normalizeSortOrder(value.filter((item) => item.rowId !== rowId)));
  };

  const moveQuestion = (sourceRowId: string, targetRowId: string) => {
    if (sourceRowId === targetRowId) {
      return;
    }

    const sourceIndex = value.findIndex((item) => item.rowId === sourceRowId);
    const targetIndex = value.findIndex((item) => item.rowId === targetRowId);

    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const next = [...value];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    onChange(normalizeSortOrder(next));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Questions fréquentes</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Elles seront affichées après la conclusion.
          </p>
        </div>
        <AnimatedUIButton
          type="button"
          variant="outline"
          icon="plus"
          iconPosition="left"
          onClick={addQuestion}
          disabled={disabled}
        >
          Ajouter une question
        </AnimatedUIButton>
      </div>

      {value.length === 0 ? (
        <button
          type="button"
          onClick={addQuestion}
          disabled={disabled}
          className="flex min-h-32 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="mr-2 size-4" />
          Ajouter la première question
        </button>
      ) : (
        <div className="space-y-4">
          {value.map((item, index) => (
            <section
              key={item.rowId}
              draggable={!disabled}
              onDragStart={(event) => {
                setDraggedRowId(item.rowId);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", item.rowId);
              }}
              onDragOver={(event) => {
                if (!disabled) {
                  event.preventDefault();
                  setDragOverRowId(item.rowId);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                const sourceRowId = draggedRowId ?? event.dataTransfer.getData("text/plain");
                if (sourceRowId) {
                  moveQuestion(sourceRowId, item.rowId);
                }
                setDraggedRowId(null);
                setDragOverRowId(null);
              }}
              onDragEnd={() => {
                setDraggedRowId(null);
                setDragOverRowId(null);
              }}
              className={cn(
                "rounded-2xl border border-slate-200 bg-white p-4 transition",
                dragOverRowId === item.rowId && "border-sky-300 bg-sky-50/60",
                draggedRowId === item.rowId && "opacity-60",
              )}
            >
              <div className="mb-4 flex items-start gap-3">
                <button
                  type="button"
                  className="mt-2 inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400"
                  aria-label={`Déplacer la question ${index + 1}`}
                  disabled={disabled}
                >
                  <GripVertical className="size-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <PanelInput
                    value={item.question}
                    onChange={(event) =>
                      updateQuestion(item.rowId, (current) => ({
                        ...current,
                        question: event.target.value,
                      }))
                    }
                    placeholder="Question"
                    disabled={disabled}
                    fullWidth
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(item.rowId)}
                  disabled={disabled}
                  className="mt-2 inline-flex size-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Supprimer la question ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <ArticleRichTextEditor
                editorId={`article-faq-${item.rowId}`}
                value={item.content}
                onChange={(content) =>
                  updateQuestion(item.rowId, (current) => ({
                    ...current,
                    content,
                  }))
                }
                placeholder="Réponse..."
                editable={!disabled}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
