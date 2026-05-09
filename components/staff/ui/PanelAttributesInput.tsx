"use client";

import { useMemo } from "react";
import { PanelAutoCompleteInput, StaffField, StaffSelect } from ".";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import PanelInput from "./PanelInput";
import {
  formatProductAttributeKind,
  getAttributeNameSuggestions,
  normalizeProductAttributeKind,
} from "@/lib/static_tables/attributes";
import { getColorNameSuggestions } from "@/lib/static_tables/colors";
import { getFinishNameSuggestions } from "@/lib/static_tables/finishes";
import { getSizeNameSuggestions } from "@/lib/static_tables/sizes";
import type { ProductAttributeInputDto } from "@/features/products/types";

interface AttributeCardProps {
  index: number;
  attribute: ProductAttributeInputDto;
  onChange: (attribute: ProductAttributeInputDto) => void;
  onRemove: (index: number) => void;
  lockKinds?: boolean;
  canRemove?: boolean;
}

function getAttributeName(attribute: ProductAttributeInputDto) {
  return attribute.name ?? attribute.kind;
}

function getAttributeSuggestions(name: string, value: string): string[] {
  switch (name.trim().toLowerCase()) {
    case "finish":
      return getFinishNameSuggestions(value);
    case "color":
      return getColorNameSuggestions(value);
    case "size":
      return getSizeNameSuggestions(value).map(String);
    default:
      return [];
  }
}

function shouldAutocompleteValue(attribute: ProductAttributeInputDto) {
  const name = getAttributeName(attribute).trim().toLowerCase();
  return (
    name === "finish" ||
    name === "color" ||
    name === "size" ||
    attribute.inputType === "FINISH" ||
    attribute.inputType === "COLOR"
  );
}

function getDisplayLabel(attribute: ProductAttributeInputDto) {
  const name = getAttributeName(attribute);
  return attribute.label || formatProductAttributeKind(name) || name;
}

function AttributeCard({
  index,
  attribute,
  onChange,
  onRemove,
  lockKinds = false,
  canRemove = true,
}: AttributeCardProps) {
  const name = getAttributeName(attribute);
  const value = attribute.value ?? "";
  const suggestions = useMemo(
    () =>
      getAttributeSuggestions(name, value.trim())
        .filter((suggestion) => suggestion !== value)
        .slice(0, 8),
    [name, value],
  );

  return (
    <div className="relative grid gap-4 rounded-lg border border-slate-300 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_1.4fr]">
      <StaffField id={`attribute-name-${index}`} label="Attribut">
        {lockKinds ? (
          <PanelInput
            id={`attribute-name-${index}`}
            value={getDisplayLabel(attribute)}
            fullWidth
            readOnly
          />
        ) : (
          <PanelAutoCompleteInput
            id={`attribute-name-${index}`}
            value={name}
            suggestions={getAttributeNameSuggestions(name)}
            emitSuggestionValue
            onValueChange={(nextName) => {
              const normalizedKind = normalizeProductAttributeKind(nextName) || nextName;
              const normalizedName =
                normalizedKind.toLowerCase() === "color" ||
                normalizedKind.toLowerCase() === "finish"
                  ? normalizedKind.toLowerCase()
                  : normalizedKind;
              onChange({
                ...attribute,
                kind: normalizedName,
                name: normalizedName,
                label:
                  attribute.label ||
                  formatProductAttributeKind(normalizedName) ||
                  normalizedName,
              });
            }}
            fullWidth
          />
        )}
      </StaffField>

      <StaffField id={`attribute-group-${index}`} label="Groupe">
        <PanelInput
          id={`attribute-group-${index}`}
          fullWidth
          value={attribute.groupName ?? ""}
          readOnly={lockKinds}
          onChange={(event) =>
            onChange({
              ...attribute,
              groupName: event.target.value || null,
            })
          }
        />
      </StaffField>

      <StaffField id={`attribute-value-${index}`} label="Valeur">
        {attribute.inputType === "BOOLEAN" ? (
          <StaffSelect
            id={`attribute-value-${index}`}
            fullWidth
            value={value}
            onValueChange={(nextValue) =>
              onChange({
                ...attribute,
                value: nextValue,
              })
            }
            options={[
              { value: "true", label: "Oui" },
              { value: "false", label: "Non" },
            ]}
          />
        ) : shouldAutocompleteValue(attribute) ? (
          <PanelAutoCompleteInput
            id={`attribute-value-${index}`}
            fullWidth
            value={value}
            suggestions={suggestions}
            onValueChange={(nextValue) =>
              onChange({
                ...attribute,
                value: nextValue,
              })
            }
          />
        ) : (
          <PanelInput
            id={`attribute-value-${index}`}
            fullWidth
            type={attribute.inputType === "NUMBER" ? "number" : "text"}
            value={value}
            onChange={(event) =>
              onChange({
                ...attribute,
                value: event.target.value,
              })
            }
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
          className="absolute right-2 top-2"
          size="sm"
        />
      ) : null}
    </div>
  );
}

interface PanelAttributesInputProps {
  attributes: ProductAttributeInputDto[];
  onAttributesChange: (attributes: ProductAttributeInputDto[]) => void;
  lockKinds?: boolean;
  canAddAttributes?: boolean;
  canRemoveAttributes?: boolean;
}

export default function PanelAttributesInput({
  attributes,
  onAttributesChange,
  lockKinds = false,
  canAddAttributes = true,
  canRemoveAttributes = true,
}: PanelAttributesInputProps) {
  return (
    <div className="grid gap-4">
      {attributes.map((attribute: ProductAttributeInputDto, index: number) => (
        <AttributeCard
          key={`product-attribute-${attribute.attributeDefId ?? attribute.id ?? index}`}
          index={index}
          attribute={attribute}
          onChange={(nextAttribute) =>
            onAttributesChange(
              attributes.map((item, itemIndex) =>
                itemIndex === index ? nextAttribute : item,
              ),
            )
          }
          onRemove={(i: number) =>
            onAttributesChange(attributes.filter((_, itemIndex) => itemIndex !== i))
          }
          lockKinds={lockKinds}
          canRemove={canRemoveAttributes}
        />
      ))}

      {canAddAttributes ? (
        <AnimatedUIButton
          type="button"
          variant="outline"
          icon="plus"
          iconPosition="left"
          onClick={() => {
            onAttributesChange([
              ...attributes,
              {
                kind: "",
                name: "",
                label: "",
                value: "",
                groupName: null,
                inputType: "TEXT",
                isRequired: false,
                isFilterable: false,
              },
            ]);
          }}
        >
          Ajouter un attribut
        </AnimatedUIButton>
      ) : null}
    </div>
  );
}
