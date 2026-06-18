"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { Textarea } from "@/components/ui/textarea";
import type { ArticleEditorFaqQuestion } from "@/features/articles/hooks/use-article-editor";
import { cn } from "@/lib/utils";
import ArticleEditorCardHeader from "./article-editor-card-header";

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
    content: "",
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

  const duplicateQuestion = (item: ArticleEditorFaqQuestion) => {
    const sourceIndex = value.findIndex((candidate) => candidate.rowId === item.rowId);
    const insertIndex = sourceIndex >= 0 ? sourceIndex + 1 : value.length;
    const next = [...value];

    next.splice(insertIndex, 0, {
      ...item,
      rowId: createRowId(),
      id: null,
      question: item.question ? `${item.question} copie` : "",
    });

    onChange(normalizeSortOrder(next));
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
              className={cn(
                "overflow-hidden rounded-2xl border border-slate-200 bg-white transition",
                dragOverRowId === item.rowId && "border-sky-300 bg-sky-50/60",
                draggedRowId === item.rowId && "opacity-60",
              )}
            >
              <ArticleEditorCardHeader
                value={item.question}
                onChange={(question) =>
                  updateQuestion(item.rowId, (current) => ({
                    ...current,
                    question,
                  }))
                }
                placeholder="Question"
                disabled={disabled}
                dragHandleLabel={`Déplacer la question ${index + 1}`}
                draggable
                onDragStart={(event) => {
                  if (disabled) {
                    return;
                  }

                  setDraggedRowId(item.rowId);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", item.rowId);
                }}
                onDragEnd={() => {
                  setDraggedRowId(null);
                  setDragOverRowId(null);
                }}
                actions={[
                  {
                    key: "duplicate",
                    label: "Dupliquer",
                    icon: "copy",
                    onClick: () => duplicateQuestion(item),
                    disabled,
                  },
                  {
                    key: "remove",
                    label: "Retirer",
                    icon: "trash",
                    tone: "danger",
                    onClick: () => removeQuestion(item.rowId),
                    disabled,
                  },
                ]}
              />

              <div className="p-4 sm:p-5">
                <Textarea
                  value={item.content}
                  onChange={(event) =>
                    updateQuestion(item.rowId, (current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  placeholder="Réponse..."
                  disabled={disabled}
                  rows={4}
                  className="min-h-28 resize-y rounded-xl border-slate-300 bg-white text-sm leading-6 text-slate-700"
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
