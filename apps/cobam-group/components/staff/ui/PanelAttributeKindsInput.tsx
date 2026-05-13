"use client";

import { useEffect, useMemo, useState } from "react";
import { StaffField, StaffSearchSelect } from ".";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { listProductAttributeDefinitionsClient } from "@/features/product-taxonomy/client";
import type { ProductAttributeDefinitionDto } from "@/features/product-taxonomy/types";
import type { ProductAttributeInputDto } from "@/features/products/types";

type PanelAttributeKindsInputProps = {
  attributeKinds: string[];
  onAttributeKindsChange: (
    attributeKinds: string[],
    attributeTemplates: ProductAttributeInputDto[],
  ) => void;
};

type AttributeKindCardProps = {
  index: number;
  kind: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  isLoading: boolean;
  onKindChange: (value: string) => void;
  onRemove: (index: number) => void;
};

function describeAttributeDefinition(definition: ProductAttributeDefinitionDto) {
  return [
    definition.key,
    definition.inputType === "TEXT" ? null : definition.inputType,
    definition.unit ? `Unite: ${definition.unit}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function definitionToAttributeTemplate(
  definition: ProductAttributeDefinitionDto | null,
  kind: string,
  index: number,
): ProductAttributeInputDto {
  if (!definition) {
    return {
      attributeDefId: null,
      kind,
      name: kind,
      label: kind,
      value: "",
      unit: null,
      inputType: "TEXT",
      selectOptions: [],
      isRequired: false,
      isFilterable: false,
      sortOrder: index,
    };
  }

  return {
    attributeDefId: definition.id,
    kind: definition.key,
    name: definition.key,
    label: definition.label,
    value: "",
    unit: definition.unit,
    inputType: definition.inputType,
    selectOptions: definition.selectOptions,
    isRequired: false,
    isFilterable: definition.inputType === "COLOR" || definition.inputType === "FINISH",
    sortOrder: index,
  };
}

function AttributeKindCard({
  index,
  kind,
  options,
  isLoading,
  onKindChange,
  onRemove,
}: AttributeKindCardProps) {
  return (
    <div className="relative rounded-lg border border-slate-300 bg-slate-50 p-4">
      <StaffField id={`family-attribute-kind-${index}`} label="Attribut">
        <StaffSearchSelect
          id={`family-attribute-kind-${index}`}
          fullWidth
          value={kind}
          options={options}
          emptyLabel="Choisir un attribut"
          placeholder="Choisir un attribut"
          searchPlaceholder="Rechercher un attribut..."
          noResultsLabel="Aucune definition disponible"
          disabled={isLoading}
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
  );
}

export default function PanelAttributeKindsInput({
  attributeKinds,
  onAttributeKindsChange,
}: PanelAttributeKindsInputProps) {
  const [attributeDefinitions, setAttributeDefinitions] = useState<ProductAttributeDefinitionDto[]>(
    [],
  );
  const [hasLoadedAttributeDefinitions, setHasLoadedAttributeDefinitions] = useState(false);

  useEffect(() => {
    if (hasLoadedAttributeDefinitions) {
      return;
    }

    let cancelled = false;

    void listProductAttributeDefinitionsClient()
      .then((items) => {
        if (!cancelled) {
          setAttributeDefinitions(items);
        }
      })
      .catch((error: unknown) => {
        console.error("Unable to load product attribute definitions.", error);
      })
      .finally(() => {
        if (!cancelled) {
          setHasLoadedAttributeDefinitions(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasLoadedAttributeDefinitions]);

  const definitionByKey = useMemo(
    () => new Map(attributeDefinitions.map((definition) => [definition.key, definition])),
    [attributeDefinitions],
  );
  const selectedKinds = useMemo(
    () => new Set(attributeKinds.filter((kind) => kind.trim() !== "")),
    [attributeKinds],
  );

  const emitChange = (nextKinds: string[]) => {
    onAttributeKindsChange(
      nextKinds,
      nextKinds
        .filter((kind) => kind.trim() !== "")
        .map((kind, index) =>
          definitionToAttributeTemplate(definitionByKey.get(kind) ?? null, kind, index),
        ),
    );
  };

  const canAddAttribute =
    hasLoadedAttributeDefinitions &&
    !attributeKinds.some((kind) => kind.trim() === "") &&
    attributeKinds.length < attributeDefinitions.length;

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      {attributeKinds.map((kind, index) => {
        const options = attributeDefinitions.map((definition) => ({
          value: definition.key,
          label: definition.label,
          description: describeAttributeDefinition(definition),
          disabled: selectedKinds.has(definition.key) && definition.key !== kind,
        }));

        return (
          <AttributeKindCard
            key={`family-attribute-kind-${index}`}
            index={index}
            kind={kind}
            options={options}
            isLoading={!hasLoadedAttributeDefinitions}
            onKindChange={(value) =>
              emitChange(attributeKinds.map((item, itemIndex) => (itemIndex === index ? value : item)))
            }
            onRemove={(itemIndex) =>
              emitChange(attributeKinds.filter((_, currentIndex) => currentIndex !== itemIndex))
            }
          />
        );
      })}

      <AnimatedUIButton
        type="button"
        variant="outline"
        icon="plus"
        iconPosition="left"
        disabled={!canAddAttribute}
        onClick={() => emitChange([...attributeKinds, ""])}
      >
        Ajouter un attribut
      </AnimatedUIButton>
    </div>
  );
}
