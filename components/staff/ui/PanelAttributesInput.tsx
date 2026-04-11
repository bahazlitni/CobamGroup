"use client"

import { useMemo } from "react"
import { PanelAutoCompleteInput, StaffField } from "."
import { AnimatedUIButton } from "@/components/ui/custom/Buttons"
import PanelInput from "./PanelInput"
import {
  formatProductAttributeKind,
  getAttributeNameSuggestions,
  normalizeProductAttributeKind,
} from "@/lib/static_tables/attributes"
import { getColorNameSuggestions } from "@/lib/static_tables/colors"
import { getFinishNameSuggestions } from "@/lib/static_tables/finishes"
import { getSizeNameSuggestions } from "@/lib/static_tables/sizes"
import { ProductAttributeInputDto } from "@/features/products/types"
import { getNextAvailableAttributeKind } from "@/features/products/attribute-kinds"

interface AttributeCardProps {
  index: number
  kind: string
  onKindChange: (value: string) => void
  onValueChange: (value: string) => void
  onRemove: (index: number) => void
  value: string
  lockKinds?: boolean
  canRemove?: boolean
}

function getAttributeSuggestions(kind: string, value: string): string[] {
  switch (kind) {
    case "FINISH":
      return getFinishNameSuggestions(value)
    case "COLOR":
      return getColorNameSuggestions(value)
    case "SIZE":
      return getSizeNameSuggestions(value).map(String)
    default:
      return []
  }
}

function isSpecialAttributeKind(kind: string) {
  const normalizedKind = normalizeProductAttributeKind(kind)
  return normalizedKind === "FINISH" || normalizedKind === "COLOR" || normalizedKind === "SIZE"
}

function AttributeCard({
  index,
  kind,
  value,
  onValueChange,
  onKindChange,
  onRemove,
  lockKinds = false,
  canRemove = true,
}: AttributeCardProps) {
  const suggestions = useMemo(
    () =>
      getAttributeSuggestions(kind, value.trim())
        .filter((suggestion) => suggestion !== value)
        .slice(0, 8),
    [kind, value],
  )
  const shouldAutocompleteValue = isSpecialAttributeKind(kind)

  return (
    <div className="relative flex items-end gap-4 rounded-lg border border-slate-300 bg-slate-50 p-4">
      <StaffField className="flex-1" id={`attribute-type-${index}`} label="Type">
        {lockKinds ? (
          <PanelInput
            id={`attribute-type-${index}`}
            value={formatProductAttributeKind(kind) || kind}
            fullWidth
            readOnly
          />
        ) : (
          <PanelAutoCompleteInput
            id={`attribute-type-${index}`}
            value={kind}
            displayValue={formatProductAttributeKind(kind) || kind}
            suggestions={getAttributeNameSuggestions(
              formatProductAttributeKind(kind) || kind,
            )}
            emitSuggestionValue
            onValueChange={onKindChange}
            fullWidth
          />
        )}
      </StaffField>

      <StaffField className="flex-2" id={`attribute-value-${index}`} label="Valeur">
        {shouldAutocompleteValue ? (
          <PanelAutoCompleteInput
            id={`attribute-value-${index}`}
            fullWidth
            value={value}
            suggestions={suggestions}
            onValueChange={onValueChange}
          />
        ) : (
          <PanelInput
            id={`attribute-value-${index}`}
            fullWidth
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
          />
        )}
      </StaffField>

      {canRemove ? (
        <AnimatedUIButton
          type="button"
          variant="ghost"
          color="error"
          onClick={() => onRemove(index)}
          icon="close"
          className="absolute top-2 right-2"
          size="sm"
        />
      ) : null}
    </div>
  )
}

interface PanelAttributesInputProps {
  attributes: ProductAttributeInputDto[]
  onAttributesChange: (attributes: ProductAttributeInputDto[]) => void
  lockKinds?: boolean
  canAddAttributes?: boolean
  canRemoveAttributes?: boolean
}

export default function PanelAttributesInput({
  attributes,
  onAttributesChange,
  lockKinds = false,
  canAddAttributes = true,
  canRemoveAttributes = true,
}: PanelAttributesInputProps) {
  const nextAvailableKind = useMemo(
    () => getNextAvailableAttributeKind(attributes),
    [attributes],
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      {attributes.map((attribute: ProductAttributeInputDto, index: number) => (
        <AttributeCard
          key={`product-attribute-${index}`}
          index={index}
          kind={attribute.kind}
          value={attribute.value}
          onKindChange={(value: string) => {
            const normalizedNextKind = normalizeProductAttributeKind(value)
            const hasDuplicateKind = attributes.some(
              (item: ProductAttributeInputDto, itemIndex: number) =>
                itemIndex !== index &&
                normalizeProductAttributeKind(item.kind) === normalizedNextKind,
            )

            if (normalizedNextKind && hasDuplicateKind) {
              return
            }

            onAttributesChange(
              attributes.map((item: ProductAttributeInputDto, itemIndex: number) =>
                itemIndex === index
                  ? {
                      ...item,
                      kind: normalizeProductAttributeKind(value) || value,
                    }
                  : item
              )
            )
          }}
          onValueChange={(nextValue) =>
            onAttributesChange(
              attributes.map((item, itemIndex) =>
                itemIndex === index ? { ...item, value: nextValue } : item
              )
            )
          }
          onRemove={(i: number) =>
            onAttributesChange(attributes.filter((_, itemIndex) => itemIndex !== i))
          }
          lockKinds={lockKinds}
          canRemove={canRemoveAttributes}
        />
      ))}

      {canAddAttributes && nextAvailableKind ? (
        <AnimatedUIButton
          type="button"
          variant="outline"
          icon="plus"
          iconPosition="left"
          onClick={() => {
            if (!nextAvailableKind) {
              return
            }

            onAttributesChange([
              ...attributes,
              { kind: nextAvailableKind, value: "" },
            ])
          }}
        >
          Ajouter un attribut
        </AnimatedUIButton>
      ) : null}
    </div>
  )
}
