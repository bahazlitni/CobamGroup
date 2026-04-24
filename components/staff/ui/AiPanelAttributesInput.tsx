"use client";

import type { KeyboardEvent } from "react";
import type { ProductAttributeInputDto } from "@/features/products/types";
import PanelAttributesInput from "./PanelAttributesInput";
import {
  AiSuggestionActionsRow,
  AI_SUGGESTION_TOKEN_CLASS,
  handleAiTabAccept,
} from "./ai-suggestion";
import { normalizeProductAttributeKind } from "@/lib/static_tables/attributes";
import { cn } from "@/lib/utils";

export default function AiPanelAttributesInput({
  attributes,
  onAttributesChange,
  aiSuggestion,
  onAcceptAiSuggestion,
  onRejectAiSuggestion,
  lockKinds = false,
  canAddAttributes = true,
  canRemoveAttributes = true,
}: {
  attributes: ProductAttributeInputDto[];
  onAttributesChange: (attributes: ProductAttributeInputDto[]) => void;
  aiSuggestion?: ProductAttributeInputDto[] | null;
  onAcceptAiSuggestion?: (attributes: ProductAttributeInputDto[]) => void;
  onRejectAiSuggestion?: () => void;
  lockKinds?: boolean;
  canAddAttributes?: boolean;
  canRemoveAttributes?: boolean;
}) {
  const acceptSuggestion = (suggestion: ProductAttributeInputDto[]) => {
    onAcceptAiSuggestion?.(suggestion);
  };

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    handleAiTabAccept(event, aiSuggestion, acceptSuggestion);
  };

  return (
    <div onKeyDownCapture={handleKeyDownCapture}>
      <PanelAttributesInput
        attributes={attributes}
        onAttributesChange={onAttributesChange}
        lockKinds={lockKinds}
        canAddAttributes={canAddAttributes}
        canRemoveAttributes={canRemoveAttributes}
      />

      {aiSuggestion?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {aiSuggestion.map((attribute) => (
            <span
              key={`${attribute.kind}-${attribute.value}`}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
                AI_SUGGESTION_TOKEN_CLASS,
              )}
            >
              {normalizeProductAttributeKind(attribute.kind)}: {attribute.value}
            </span>
          ))}
        </div>
      ) : null}

      <AiSuggestionActionsRow
        suggestion={aiSuggestion}
        onAcceptSuggestion={acceptSuggestion}
        onRejectSuggestion={onRejectAiSuggestion}
      />
    </div>
  );
}
