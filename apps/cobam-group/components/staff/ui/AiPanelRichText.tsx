"use client";

import type { ComponentProps, KeyboardEvent } from "react";
import ArticleRichTextEditor from "@/components/staff/articles/article-rich-text-editor";
import {
  AiSuggestionActionsRow,
  AiSuggestionBlock,
  handleAiTabAccept,
  type AiSuggestionActions,
} from "./ai-suggestion";

type RichTextProps = ComponentProps<typeof ArticleRichTextEditor>;

export type AiPanelRichTextProps = Omit<
  RichTextProps,
  "value" | "onChange"
> &
  AiSuggestionActions<string> & {
    value: string;
    onChange: (value: string) => void;
    aiSuggestionPreview?: string | null;
  };

export default function AiPanelRichText({
  value,
  onChange,
  aiSuggestion,
  aiSuggestionPreview,
  onAcceptAiSuggestion,
  onRejectAiSuggestion,
  ...props
}: AiPanelRichTextProps) {
  const preview = aiSuggestionPreview ?? aiSuggestion ?? "";

  const handleChange = (nextValue: string) => {
    onChange(nextValue);
  };

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    handleAiTabAccept(event, aiSuggestion, onAcceptAiSuggestion);
  };

  return (
    <div onKeyDownCapture={handleKeyDownCapture}>
      <ArticleRichTextEditor
        {...props}
        value={value}
        onChange={handleChange}
      />

      {aiSuggestion && preview ? (
        <AiSuggestionBlock>{preview}</AiSuggestionBlock>
      ) : null}

      <AiSuggestionActionsRow
        suggestion={aiSuggestion}
        onAcceptSuggestion={onAcceptAiSuggestion}
        onRejectSuggestion={onRejectAiSuggestion}
      />
    </div>
  );
}
