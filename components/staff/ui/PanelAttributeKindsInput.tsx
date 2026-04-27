"use client"

import { useMemo } from "react"
import { PanelAutoCompleteInput, StaffField } from "."
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton"
import {
  getAttributeNameSuggestions,
  normalizeProductAttributeKind,
} from "@/lib/static_tables/attributes"
import { getNextAvailableAttributeKind } from "@/features/products/attribute-kinds"

type PanelAttributeKindsInputProps = {
  attributeKinds: string[]
  onAttributeKindsChange: (attributeKinds: string[]) => void
}

type AttributeKindCardProps = {
  index: number
  kind: string
  onKindChange: (value: string) => void
  onRemove: (index: number) => void
}

function AttributeKindCard({
  index,
  kind,
  onKindChange,
  onRemove,
}: AttributeKindCardProps) {
  return (
    <div className="relative rounded-lg border border-slate-300 bg-slate-50 p-4">
      <StaffField id={`family-attribute-kind-${index}`} label="Type">
        <PanelAutoCompleteInput
          id={`family-attribute-kind-${index}`}
          fullWidth
          value={kind}
          suggestions={getAttributeNameSuggestions(
            kind,
          )}
          emitSuggestionValue
          onValueChange={onKindChange}
        />
      </StaffField>

      <AnimatedUIButton
        type="button"
        variant="ghost"
        color="error"
        onClick={() => onRemove(index)}
        icon="close"
        className="absolute top-2 right-2"
        size="sm"
      />
    </div>
  )
}

export default function PanelAttributeKindsInput({
  attributeKinds,
  onAttributeKindsChange,
}: PanelAttributeKindsInputProps) {
  const nextAvailableKind = useMemo(
    () =>
      getNextAvailableAttributeKind(
        attributeKinds.map((kind) => ({ kind, value: "" })),
      ),
    [attributeKinds],
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      {attributeKinds.map((kind, index) => (
        <AttributeKindCard
          key={`family-attribute-kind-${index}`}
          index={index}
          kind={kind}
          onKindChange={(value) => {
            const normalizedNextKind = normalizeProductAttributeKind(value)
            const hasDuplicateKind = attributeKinds.some(
              (item, itemIndex) =>
                itemIndex !== index &&
                normalizeProductAttributeKind(item) === normalizedNextKind,
            )

            if (normalizedNextKind && hasDuplicateKind) {
              return
            }

            onAttributeKindsChange(
              attributeKinds.map((item, itemIndex) =>
                itemIndex === index
                  ? normalizeProductAttributeKind(value) || value
                  : item,
              ),
            )
          }}
          onRemove={(itemIndex) =>
            onAttributeKindsChange(
              attributeKinds.filter((_, currentIndex) => currentIndex !== itemIndex),
            )
          }
        />
      ))}

      {nextAvailableKind ? (
        <AnimatedUIButton
          type="button"
          variant="outline"
          icon="plus"
          iconPosition="left"
          onClick={() =>
            onAttributeKindsChange([
              ...attributeKinds,
              nextAvailableKind,
            ])
          }
        >
          Ajouter un type d&apos;attribut
        </AnimatedUIButton>
      ) : null}
    </div>
  )
}
