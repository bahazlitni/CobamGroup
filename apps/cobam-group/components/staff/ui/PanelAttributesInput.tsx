"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { StaffField, StaffSearchSelect, StaffSelect } from ".";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import PanelInput from "./PanelInput";
import {
  listProductAttributeDefinitionsClient,
  listProductColorsClient,
  listProductFinishesClient,
} from "@/features/product-taxonomy/client";
import type {
  ProductAttributeDefinitionDto,
  ProductColorDto,
  ProductFinishDto,
} from "@/features/product-taxonomy/types";
import type { ProductAttributeInputDto } from "@/features/products/types";

interface AttributeCardProps {
  index: number;
  attribute: ProductAttributeInputDto;
  onChange: (attribute: ProductAttributeInputDto) => void;
  onRemove: (index: number) => void;
  lockKinds?: boolean;
  canRemove?: boolean;
  colorOptions?: ProductColorDto[];
  finishOptions?: ProductFinishDto[];
  attributeDefinitions?: ProductAttributeDefinitionDto[];
  selectedAttributeDefIds?: Set<number>;
  isLoadingAttributeDefinitions?: boolean;
  isLoadingSpecialOptions?: boolean;
}

type AttributeWithIndex = {
  attribute: ProductAttributeInputDto;
  index: number;
};

type AttributeGroup = {
  key: string;
  name: string;
  sortOrder: number;
  items: AttributeWithIndex[];
};

function getAttributeName(attribute: ProductAttributeInputDto) {
  return attribute.name ?? attribute.kind;
}

function isColorAttribute(attribute: ProductAttributeInputDto) {
  return (
    getAttributeName(attribute).trim().toLowerCase() === "color" || attribute.inputType === "COLOR"
  );
}

function isFinishAttribute(attribute: ProductAttributeInputDto) {
  return (
    getAttributeName(attribute).trim().toLowerCase() === "finish" ||
    attribute.inputType === "FINISH"
  );
}

function normalizeSpecialValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function findSelectedColor(colors: ProductColorDto[], value: string) {
  const normalizedValue = normalizeSpecialValue(value);
  return (
    colors.find(
      (color) =>
        normalizeSpecialValue(color.label) === normalizedValue ||
        normalizeSpecialValue(color.key) === normalizedValue,
    ) ?? null
  );
}

function findSelectedFinish(finishes: ProductFinishDto[], value: string) {
  const normalizedValue = normalizeSpecialValue(value);
  return (
    finishes.find(
      (finish) =>
        normalizeSpecialValue(finish.label) === normalizedValue ||
        normalizeSpecialValue(finish.key) === normalizedValue,
    ) ?? null
  );
}

function buildFinishImageUrl(finish: ProductFinishDto | null) {
  if (!finish?.imageMediaId) {
    return null;
  }

  return `/api/media/${finish.imageMediaId}/file?variant=thumbnail`;
}

function getDisplayLabel(attribute: ProductAttributeInputDto) {
  const name = getAttributeName(attribute);
  return attribute.label || name;
}

function describeAttributeDefinition(definition: ProductAttributeDefinitionDto) {
  return [
    definition.key,
    definition.inputType === "TEXT" ? null : definition.inputType,
    definition.unit ? `Unite: ${definition.unit}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function applyAttributeDefinition(
  attribute: ProductAttributeInputDto,
  definition: ProductAttributeDefinitionDto,
): ProductAttributeInputDto {
  const isSameDefinition = attribute.attributeDefId === definition.id;

  return {
    ...attribute,
    attributeDefId: definition.id,
    kind: definition.key,
    name: definition.key,
    label: definition.label,
    value: isSameDefinition ? attribute.value : "",
    unit: definition.unit,
    inputType: definition.inputType,
    selectOptions: definition.selectOptions,
  };
}

function clearAttributeDefinition(attribute: ProductAttributeInputDto): ProductAttributeInputDto {
  return {
    ...attribute,
    attributeDefId: null,
    kind: "",
    name: "",
    label: "",
    value: "",
    unit: null,
    inputType: "TEXT",
    selectOptions: [],
  };
}

function findAttributeDefinitionForAttribute(
  attribute: ProductAttributeInputDto,
  attributeDefinitions: ProductAttributeDefinitionDto[],
) {
  if (attribute.attributeDefId != null) {
    return (
      attributeDefinitions.find((definition) => definition.id === attribute.attributeDefId) ?? null
    );
  }

  const normalizedName = getAttributeName(attribute).trim().toLowerCase();
  if (!normalizedName) {
    return null;
  }

  return (
    attributeDefinitions.find(
      (definition) => definition.key.trim().toLowerCase() === normalizedName,
    ) ?? null
  );
}

function getAttributeGroupName(attribute: ProductAttributeInputDto) {
  return attribute.groupName?.trim() || "Sans groupe";
}

function groupAttributes(attributes: ProductAttributeInputDto[]): AttributeGroup[] {
  const groups = new Map<string, AttributeGroup>();

  attributes.forEach((attribute, index) => {
    const groupName = getAttributeGroupName(attribute);
    const groupKey =
      attribute.attributeGroupId == null
        ? `custom:${groupName}`
        : `group:${attribute.attributeGroupId}`;
    const group = groups.get(groupKey) ?? {
      key: groupKey,
      name: groupName,
      sortOrder: attribute.groupSortOrder ?? 0,
      items: [],
    };

    group.items.push({ attribute, index });
    groups.set(groupKey, group);
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort(
        (left, right) =>
          (left.attribute.sortOrder ?? left.index) - (right.attribute.sortOrder ?? right.index) ||
          getDisplayLabel(left.attribute).localeCompare(getDisplayLabel(right.attribute), "fr-FR"),
      ),
    }))
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, "fr-FR"),
    );
}

function AttributeValueInput({
  id,
  attribute,
  onChange,
  colorOptions,
  finishOptions,
  isLoadingSpecialOptions,
}: {
  id: string;
  attribute: ProductAttributeInputDto;
  onChange: (attribute: ProductAttributeInputDto) => void;
  colorOptions: ProductColorDto[];
  finishOptions: ProductFinishDto[];
  isLoadingSpecialOptions: boolean;
}) {
  const value = attribute.value ?? "";
  const selectedColor = findSelectedColor(colorOptions, value);
  const selectedFinish = findSelectedFinish(finishOptions, value);

  if (isColorAttribute(attribute)) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="h-10 w-10 shrink-0 rounded-md border border-slate-300 bg-white"
          style={{ backgroundColor: selectedColor?.value ?? "transparent" }}
          aria-hidden="true"
        />
        <StaffSearchSelect
          id={id}
          fullWidth
          value={value}
          onValueChange={(nextValue) =>
            onChange({
              ...attribute,
              value: nextValue,
            })
          }
          emptyLabel="Aucune couleur"
          placeholder="Choisir une couleur"
          searchPlaceholder="Rechercher une couleur..."
          noResultsLabel="Aucune couleur disponible"
          disabled={isLoadingSpecialOptions}
          options={colorOptions.map((color) => ({
            value: color.label,
            label: color.label,
            description: color.key,
          }))}
        />
      </div>
    );
  }

  if (isFinishAttribute(attribute)) {
    const finishImageUrl = buildFinishImageUrl(selectedFinish);

    return (
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-white">
          {finishImageUrl ? (
            <Image
              src={finishImageUrl}
              alt={selectedFinish?.label ?? "Finition"}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="h-full w-full"
              style={{ backgroundColor: selectedFinish?.color ?? "transparent" }}
              aria-hidden="true"
            />
          )}
        </span>
        <StaffSearchSelect
          id={id}
          fullWidth
          value={value}
          onValueChange={(nextValue) =>
            onChange({
              ...attribute,
              value: nextValue,
            })
          }
          emptyLabel="Aucune finition"
          placeholder="Choisir une finition"
          searchPlaceholder="Rechercher une finition..."
          noResultsLabel="Aucune finition disponible"
          disabled={isLoadingSpecialOptions}
          options={finishOptions.map((finish) => ({
            value: finish.label,
            label: finish.label,
            description: finish.key,
          }))}
        />
      </div>
    );
  }

  if (attribute.inputType === "BOOLEAN") {
    return (
      <StaffSelect
        id={id}
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
    );
  }

  if (attribute.inputType === "SELECT" && attribute.selectOptions?.length) {
    return (
      <StaffSelect
        id={id}
        fullWidth
        value={value}
        emptyLabel="Aucune valeur"
        onValueChange={(nextValue) =>
          onChange({
            ...attribute,
            value: nextValue,
          })
        }
        options={attribute.selectOptions.map((option) => ({
          value: option,
          label: option,
        }))}
      />
    );
  }

  return (
    <PanelInput
      id={id}
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
  );
}

function AttributeCard({
  index,
  attribute,
  onChange,
  onRemove,
  lockKinds = false,
  canRemove = true,
  colorOptions = [],
  finishOptions = [],
  attributeDefinitions = [],
  selectedAttributeDefIds = new Set<number>(),
  isLoadingAttributeDefinitions = false,
  isLoadingSpecialOptions = false,
}: AttributeCardProps) {
  const attributeDefinitionOptions = useMemo(
    () =>
      attributeDefinitions.map((definition) => ({
        value: String(definition.id),
        label: definition.label,
        description: describeAttributeDefinition(definition),
        disabled:
          selectedAttributeDefIds.has(definition.id) && definition.id !== attribute.attributeDefId,
      })),
    [attribute.attributeDefId, attributeDefinitions, selectedAttributeDefIds],
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
          <StaffSearchSelect
            id={`attribute-name-${index}`}
            fullWidth
            value={attribute.attributeDefId == null ? "" : String(attribute.attributeDefId)}
            options={attributeDefinitionOptions}
            emptyLabel="Choisir un attribut"
            placeholder="Choisir un attribut"
            searchPlaceholder="Rechercher un attribut..."
            noResultsLabel="Aucune definition disponible"
            disabled={isLoadingAttributeDefinitions}
            onValueChange={(nextValue) => {
              const definition =
                attributeDefinitions.find((item) => String(item.id) === nextValue) ?? null;
              onChange(
                definition
                  ? applyAttributeDefinition(attribute, definition)
                  : clearAttributeDefinition(attribute),
              );
            }}
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
        <AttributeValueInput
          id={`attribute-value-${index}`}
          attribute={attribute}
          onChange={onChange}
          colorOptions={colorOptions}
          finishOptions={finishOptions}
          isLoadingSpecialOptions={isLoadingSpecialOptions}
        />
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
  );
}

function GroupedAttributeSections({
  attributes,
  onAttributesChange,
  colorOptions,
  finishOptions,
  isLoadingSpecialOptions,
}: {
  attributes: ProductAttributeInputDto[];
  onAttributesChange: (attributes: ProductAttributeInputDto[]) => void;
  colorOptions: ProductColorDto[];
  finishOptions: ProductFinishDto[];
  isLoadingSpecialOptions: boolean;
}) {
  const groups = useMemo(() => groupAttributes(attributes), [attributes]);

  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <section key={group.key} className="rounded-lg border border-slate-300 bg-slate-50 p-4">
          <h3 className="text-cobam-dark-blue text-sm font-semibold">{group.name}</h3>
          <div className="mt-4 hidden gap-4 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.55fr)]">
            <span className="text-cobam-dark-blue text-sm font-semibold">Attribut</span>
            <span className="text-cobam-dark-blue text-sm font-semibold">Valeur</span>
            <span className="text-cobam-dark-blue text-sm font-semibold">Unité</span>
          </div>
          <div className="mt-3 grid gap-3 md:gap-4">
            {group.items.map(({ attribute, index }) => (
              <div
                key={`grouped-product-attribute-${
                  attribute.attributeDefId ?? attribute.id ?? index
                }`}
                className="grid items-center gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.55fr)] md:gap-4"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor={`grouped-attribute-name-${index}`}
                    className="text-cobam-dark-blue text-sm font-semibold md:sr-only"
                  >
                    Attribut
                  </label>
                  <p
                    id={`grouped-attribute-name-${index}`}
                    className="flex min-h-10 items-center text-sm font-medium text-slate-600"
                  >
                    {getDisplayLabel(attribute)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor={`grouped-attribute-value-${index}`}
                    className="text-cobam-dark-blue text-sm font-semibold md:sr-only"
                  >
                    Valeur
                  </label>
                  <AttributeValueInput
                    id={`grouped-attribute-value-${index}`}
                    attribute={attribute}
                    colorOptions={colorOptions}
                    finishOptions={finishOptions}
                    isLoadingSpecialOptions={isLoadingSpecialOptions}
                    onChange={(nextAttribute) =>
                      onAttributesChange(
                        attributes.map((item, itemIndex) =>
                          itemIndex === index ? nextAttribute : item,
                        ),
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor={`grouped-attribute-unit-${index}`}
                    className="text-cobam-dark-blue text-sm font-semibold md:sr-only"
                  >
                    Unité
                  </label>
                  <p
                    id={`grouped-attribute-unit-${index}`}
                    className="flex min-h-10 items-center text-sm font-semibold text-slate-600"
                  >
                    {attribute.unit ?? ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
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
  const [colorOptions, setColorOptions] = useState<ProductColorDto[]>([]);
  const [finishOptions, setFinishOptions] = useState<ProductFinishDto[]>([]);
  const [attributeDefinitions, setAttributeDefinitions] = useState<ProductAttributeDefinitionDto[]>(
    [],
  );
  const [hasLoadedColors, setHasLoadedColors] = useState(false);
  const [hasLoadedFinishes, setHasLoadedFinishes] = useState(false);
  const [hasLoadedAttributeDefinitions, setHasLoadedAttributeDefinitions] = useState(false);
  const needsColors = useMemo(() => attributes.some(isColorAttribute), [attributes]);
  const needsFinishes = useMemo(() => attributes.some(isFinishAttribute), [attributes]);
  const needsAttributeDefinitions = !lockKinds;
  const selectedAttributeDefIds = useMemo(
    () =>
      new Set(
        attributes
          .map((attribute) => attribute.attributeDefId)
          .filter((id): id is number => typeof id === "number"),
      ),
    [attributes],
  );
  const isLoadingAttributeDefinitions =
    needsAttributeDefinitions && !hasLoadedAttributeDefinitions;
  const isLoadingSpecialOptions =
    (needsColors && !hasLoadedColors) || (needsFinishes && !hasLoadedFinishes);

  useEffect(() => {
    if (!needsAttributeDefinitions || hasLoadedAttributeDefinitions) {
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
  }, [hasLoadedAttributeDefinitions, needsAttributeDefinitions]);

  useEffect(() => {
    if (lockKinds || !hasLoadedAttributeDefinitions || attributeDefinitions.length === 0) {
      return;
    }

    let changed = false;
    const nextAttributes = attributes.map((attribute) => {
      if (attribute.attributeDefId != null) {
        return attribute;
      }

      const definition = findAttributeDefinitionForAttribute(attribute, attributeDefinitions);
      if (!definition) {
        return attribute;
      }

      changed = true;
      return {
        ...attribute,
        attributeDefId: definition.id,
        kind: definition.key,
        name: definition.key,
        label: attribute.label || definition.label,
        unit: definition.unit,
        inputType: definition.inputType,
        selectOptions: attribute.selectOptions?.length
          ? attribute.selectOptions
          : definition.selectOptions,
      };
    });

    if (changed) {
      onAttributesChange(nextAttributes);
    }
  }, [
    attributeDefinitions,
    attributes,
    hasLoadedAttributeDefinitions,
    lockKinds,
    onAttributesChange,
  ]);

  useEffect(() => {
    const shouldLoadColors = needsColors && !hasLoadedColors;
    const shouldLoadFinishes = needsFinishes && !hasLoadedFinishes;

    if (!shouldLoadColors && !shouldLoadFinishes) {
      return;
    }

    let cancelled = false;

    void Promise.all([
      shouldLoadColors
        ? listProductColorsClient()
            .then((items) => {
              if (!cancelled) {
                setColorOptions(items);
              }
            })
            .finally(() => {
              if (!cancelled) {
                setHasLoadedColors(true);
              }
            })
        : Promise.resolve(),
      shouldLoadFinishes
        ? listProductFinishesClient()
            .then((items) => {
              if (!cancelled) {
                setFinishOptions(items);
              }
            })
            .finally(() => {
              if (!cancelled) {
                setHasLoadedFinishes(true);
              }
            })
        : Promise.resolve(),
    ]).catch((error: unknown) => {
      console.error("Unable to load product color or finish options.", error);
    });
    return () => {
      cancelled = true;
    };
  }, [hasLoadedColors, hasLoadedFinishes, needsColors, needsFinishes]);

  if (lockKinds) {
    return (
      <GroupedAttributeSections
        attributes={attributes}
        onAttributesChange={onAttributesChange}
        colorOptions={colorOptions}
        finishOptions={finishOptions}
        isLoadingSpecialOptions={isLoadingSpecialOptions}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {attributes.map((attribute: ProductAttributeInputDto, index: number) => (
        <AttributeCard
          key={`product-attribute-${attribute.attributeDefId ?? attribute.id ?? index}`}
          index={index}
          attribute={attribute}
          onChange={(nextAttribute) =>
            onAttributesChange(
              attributes.map((item, itemIndex) => (itemIndex === index ? nextAttribute : item)),
            )
          }
          onRemove={(i: number) =>
            onAttributesChange(attributes.filter((_, itemIndex) => itemIndex !== i))
          }
          lockKinds={lockKinds}
          canRemove={canRemoveAttributes}
          colorOptions={colorOptions}
          finishOptions={finishOptions}
          attributeDefinitions={attributeDefinitions}
          selectedAttributeDefIds={selectedAttributeDefIds}
          isLoadingAttributeDefinitions={isLoadingAttributeDefinitions}
          isLoadingSpecialOptions={isLoadingSpecialOptions}
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
                attributeDefId: null,
                kind: "",
                name: "",
                label: "",
                value: "",
                unit: null,
                groupName: null,
                inputType: "TEXT",
                selectOptions: [],
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
