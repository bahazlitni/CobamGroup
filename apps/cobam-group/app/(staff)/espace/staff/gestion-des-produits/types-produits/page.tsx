"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { type StockUnit } from "@prisma/client";
import { GripVertical, Layers3, Shapes, Tags } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ProductSubcategoriesField from "@/components/staff/products/ProductSubcategoriesField";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import {
  StaffNotice,
  StaffPageHeader,
  StaffSearchSelect,
  StaffSelect,
  StaffTagInput,
} from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  createProductTaxonomyEntityClient,
  deleteProductTaxonomyEntityClient,
  getProductTypesAdminClient,
  ProductTaxonomyClientError,
  reorderProductTypeGroupsClient,
  reorderProductTypesClient,
  updateProductTaxonomyEntityClient,
} from "@/features/product-taxonomy/client";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canManageProductTemplates } from "@/features/product-taxonomy/access";
import type {
  ProductTaxonomyAttributeDto,
  ProductTaxonomyAttributeGroupDto,
  ProductTaxonomyGroupDto,
  ProductTaxonomyTypeDto,
  ProductTypesAdminDto,
} from "@/features/product-taxonomy/types";
import { STOCK_UNIT_VALUES } from "@/features/products/product-edit-fields";
import formatEnumLabel from "@/lib/formatEnumLabel";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";

type GroupFormState = {
  name: string;
  slug: string;
};

type ProductTypeFormState = {
  groupId: string;
  name: string;
  slug: string;
  description: string;
  presetTags: string;
  presetSubcategoryIds: string[];
  presetStockUnit: string;
  presetVatRate: string;
  presetGuaranteeMonths: string;
  hasColor: boolean;
  hasFinish: boolean;
};

type AttributeGroupFormState = {
  name: string;
  slug: string;
  sortOrder: string;
};

type AttributeFormState = {
  attributeGroupId: string;
  attributeDefinitionId: string;
  label: string;
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: string;
};

function emptyGroupForm(): GroupFormState {
  return {
    name: "",
    slug: "",
  };
}

function emptyProductTypeForm(): ProductTypeFormState {
  return {
    groupId: "",
    name: "",
    slug: "",
    description: "",
    presetTags: "",
    presetSubcategoryIds: [],
    presetStockUnit: "",
    presetVatRate: "",
    presetGuaranteeMonths: "",
    hasColor: false,
    hasFinish: false,
  };
}

function emptyAttributeGroupForm(): AttributeGroupFormState {
  return {
    name: "",
    slug: "",
    sortOrder: "0",
  };
}

function emptyAttributeForm(): AttributeFormState {
  return {
    attributeGroupId: "",
    attributeDefinitionId: "",
    label: "",
    isRequired: false,
    isFilterable: false,
    sortOrder: "0",
  };
}

function numberFromForm(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : 0;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ProductTaxonomyClientError || error instanceof Error
    ? error.message
    : fallback;
}

type DropPosition = "before" | "after";
type DropTarget = { id: number; position: DropPosition } | null;

function splitTags(value: string) {
  return value.split(" ").filter((tag) => tag.trim() !== "");
}

function isSpecialTemplateAttribute(attribute: ProductTaxonomyAttributeDto) {
  const key = attribute.name.trim().toLowerCase();
  return key === "color" || key === "finish";
}

function isAutomaticTemplateAttributeDefinitionKey(key: string) {
  const normalizedKey = key.trim().toLowerCase();
  return normalizedKey === "color" || normalizedKey === "finish";
}

function moveItemById<T extends { id: number }>(
  items: T[],
  draggedId: number,
  targetId: number,
  position: DropPosition,
) {
  const draggedIndex = items.findIndex((item) => item.id === draggedId);
  const targetIndex = items.findIndex((item) => item.id === targetId);

  if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
    return items;
  }

  const nextItems = [...items];
  const [draggedItem] = nextItems.splice(draggedIndex, 1);
  const baseTargetIndex = nextItems.findIndex((item) => item.id === targetId);
  const insertIndex = position === "after" ? baseTargetIndex + 1 : Math.max(0, baseTargetIndex);

  nextItems.splice(insertIndex, 0, draggedItem);
  return nextItems;
}

export default function ProductTypesAdminPage() {
  const { user } = useStaffSessionContext();
  const [data, setData] = useState<ProductTypesAdminDto>({
    groups: [],
    productTypes: [],
    attributeDefinitions: [],
    productSubcategories: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<number | null>(null);

  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [groupForm, setGroupForm] = useState<GroupFormState>(emptyGroupForm);
  const [editingProductTypeId, setEditingProductTypeId] = useState<number | null>(null);
  const [productTypeForm, setProductTypeForm] =
    useState<ProductTypeFormState>(emptyProductTypeForm);
  const [editingAttributeGroupId, setEditingAttributeGroupId] = useState<number | null>(null);
  const [attributeGroupForm, setAttributeGroupForm] =
    useState<AttributeGroupFormState>(emptyAttributeGroupForm);
  const [editingAttributeId, setEditingAttributeId] = useState<number | null>(null);
  const [attributeForm, setAttributeForm] = useState<AttributeFormState>(emptyAttributeForm);
  const [draggedGroupId, setDraggedGroupId] = useState<number | null>(null);
  const [groupDropTarget, setGroupDropTarget] = useState<DropTarget>(null);
  const [draggedProductTypeId, setDraggedProductTypeId] = useState<number | null>(null);
  const [productTypeDropTarget, setProductTypeDropTarget] = useState<DropTarget>(null);
  const [isReordering, setIsReordering] = useState(false);
  const canManageTemplates = user ? canManageProductTemplates(user) : false;

  const selectedProductType = useMemo(
    () =>
      selectedProductTypeId == null
        ? null
        : (data.productTypes.find((item) => item.id === selectedProductTypeId) ?? null),
    [data.productTypes, selectedProductTypeId],
  );
  const selectedAttributeDefinition = useMemo(
    () =>
      attributeForm.attributeDefinitionId
        ? (data.attributeDefinitions.find(
            (definition) => String(definition.id) === attributeForm.attributeDefinitionId,
          ) ?? null)
        : null,
    [attributeForm.attributeDefinitionId, data.attributeDefinitions],
  );
  const isEditingSpecialAttribute =
    editingAttributeId != null &&
    selectedAttributeDefinition != null &&
    isAutomaticTemplateAttributeDefinitionKey(selectedAttributeDefinition.key);
  const attributeDefinitionOptions = useMemo(() => {
    const usedDefinitionIds = new Set(
      selectedProductType?.attributes
        .filter((attribute) => attribute.id !== editingAttributeId)
        .map((attribute) => attribute.attributeDefinitionId) ?? [],
    );

    return data.attributeDefinitions.map((definition) => ({
      value: String(definition.id),
      label: definition.label,
      description: [
        definition.key,
        definition.unit,
        definition.inputType === "TEXT" ? null : definition.inputType,
        isAutomaticTemplateAttributeDefinitionKey(definition.key)
          ? "Gere par les options Couleur/Finition"
          : null,
      ]
        .filter(Boolean)
        .join(" · "),
      disabled:
        usedDefinitionIds.has(definition.id) ||
        isAutomaticTemplateAttributeDefinitionKey(definition.key),
    }));
  }, [data.attributeDefinitions, editingAttributeId, selectedProductType]);
  const selectedAttributeSections = useMemo(() => {
    if (!selectedProductType) {
      return [];
    }

    const sections: Array<{
      key: string;
      id: number | null;
      name: string;
      slug: string;
      attributes: ProductTaxonomyAttributeDto[];
    }> = selectedProductType.attributeGroups.map((group) => ({
      key: `group:${group.id}`,
      id: group.id,
      name: group.name,
      slug: group.slug,
      attributes: selectedProductType.attributes.filter(
        (attribute) => attribute.attributeGroupId === group.id,
      ),
    }));
    const ungroupedAttributes = selectedProductType.attributes.filter(
      (attribute) => attribute.attributeGroupId == null,
    );

    if (ungroupedAttributes.length > 0) {
      sections.push({
        key: "ungrouped",
        id: null,
        name: "Sans groupe",
        slug: "",
        attributes: ungroupedAttributes,
      });
    }

    return sections;
  }, [selectedProductType]);

  const groupedProductTypes = useMemo(() => {
    const groupOrder = new Map(
      data.groups.map((group, index) => [group.id, group.sortOrder * 1000 + index]),
    );
    const groups = new Map<
      string,
      {
        key: string;
        name: string;
        productTypes: ProductTaxonomyTypeDto[];
      }
    >();
    const sortedProductTypes = [...data.productTypes].sort((left, right) => {
      const leftGroupOrder =
        left.groupId == null ? 999999 : (groupOrder.get(left.groupId) ?? 999999);
      const rightGroupOrder =
        right.groupId == null ? 999999 : (groupOrder.get(right.groupId) ?? 999999);

      return (
        leftGroupOrder - rightGroupOrder ||
        left.sortOrder - right.sortOrder ||
        left.name.localeCompare(right.name, "fr-FR")
      );
    });

    for (const productType of sortedProductTypes) {
      const key = productType.groupId == null ? "ungrouped" : String(productType.groupId);
      const group = groups.get(key) ?? {
        key,
        name: productType.groupName ?? "Sans groupe",
        productTypes: [],
      };
      group.productTypes.push(productType);
      groups.set(key, group);
    }

    return [...groups.values()];
  }, [data.groups, data.productTypes]);

  const loadData = async () => {
    setError(null);
    try {
      const nextData = await getProductTypesAdminClient();
      setData(nextData);
      setSelectedProductTypeId((current) => {
        if (current && nextData.productTypes.some((item) => item.id === current)) {
          return current;
        }
        return nextData.productTypes[0]?.id ?? null;
      });
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, "Impossible de charger les modèles de produits."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const resetGroupForm = () => {
    setEditingGroupId(null);
    setGroupForm(emptyGroupForm());
  };

  const editGroup = (group: ProductTaxonomyGroupDto) => {
    setEditingGroupId(group.id);
    setGroupForm({
      name: group.name,
      slug: group.slug,
    });
  };

  const resetProductTypeForm = () => {
    setEditingProductTypeId(null);
    setProductTypeForm(emptyProductTypeForm());
  };

  const editProductType = (productType: ProductTaxonomyTypeDto) => {
    setEditingProductTypeId(productType.id);
    setSelectedProductTypeId(productType.id);
    setProductTypeForm({
      groupId: productType.groupId == null ? "" : String(productType.groupId),
      name: productType.name,
      slug: productType.slug,
      description: productType.description ?? "",
      presetTags: productType.presetTags,
      presetSubcategoryIds: productType.presetSubcategoryIds.map(String),
      presetStockUnit: productType.presetStockUnit ?? "",
      presetVatRate: productType.presetVatRate ?? "",
      presetGuaranteeMonths:
        productType.presetGuaranteeMonths == null ? "" : String(productType.presetGuaranteeMonths),
      hasColor: productType.hasColor,
      hasFinish: productType.hasFinish,
    });
  };

  const resetAttributeGroupForm = () => {
    setEditingAttributeGroupId(null);
    setAttributeGroupForm(emptyAttributeGroupForm());
  };

  const editAttributeGroup = (group: ProductTaxonomyAttributeGroupDto) => {
    setEditingAttributeGroupId(group.id);
    setAttributeGroupForm({
      name: group.name,
      slug: group.slug,
      sortOrder: String(group.sortOrder),
    });
  };

  const resetAttributeForm = () => {
    setEditingAttributeId(null);
    setAttributeForm(emptyAttributeForm());
  };

  const editAttribute = (attribute: ProductTaxonomyAttributeDto) => {
    setEditingAttributeId(attribute.id);
    setAttributeForm({
      attributeGroupId:
        attribute.attributeGroupId == null ? "" : String(attribute.attributeGroupId),
      attributeDefinitionId: String(attribute.attributeDefinitionId),
      label: attribute.labelOverride,
      isRequired: attribute.isRequired,
      isFilterable: attribute.isFilterable,
      sortOrder: String(attribute.sortOrder),
    });
  };

  const saveGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageTemplates) {
      toast.error("Vous n'avez pas la permission de modifier les modèles de produits.");
      return;
    }

    setSavingKey("group");
    try {
      const existingGroup = data.groups.find((group) => group.id === editingGroupId);
      const payload = {
        name: groupForm.name,
        slug: groupForm.slug,
        sortOrder: existingGroup?.sortOrder ?? data.groups.length,
      };

      if (editingGroupId == null) {
        await createProductTaxonomyEntityClient("group", payload);
      } else {
        await updateProductTaxonomyEntityClient("group", editingGroupId, payload);
      }

      toast.success("Groupe enregistré.");
      resetGroupForm();
      await loadData();
    } catch (saveError: unknown) {
      toast.error(getErrorMessage(saveError, "Impossible d'enregistrer le groupe."));
    } finally {
      setSavingKey(null);
    }
  };

  const saveProductType = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageTemplates) {
      toast.error("Vous n'avez pas la permission de modifier les modèles de produits.");
      return;
    }

    setSavingKey("productType");
    try {
      const existingProductType = data.productTypes.find(
        (productType) => productType.id === editingProductTypeId,
      );
      const newGroupId = productTypeForm.groupId ? Number(productTypeForm.groupId) : null;
      const groupProductTypes = data.productTypes.filter(
        (productType) => productType.groupId === newGroupId,
      );
      const payload = {
        groupId: newGroupId,
        name: productTypeForm.name,
        slug: productTypeForm.slug,
        description: productTypeForm.description || null,
        sortOrder: existingProductType?.sortOrder ?? groupProductTypes.length,
        hasColor: productTypeForm.hasColor,
        hasFinish: productTypeForm.hasFinish,
        presetTags: productTypeForm.presetTags,
        presetSubcategoryIds: productTypeForm.presetSubcategoryIds.map(Number),
        presetStockUnit: productTypeForm.presetStockUnit
          ? (productTypeForm.presetStockUnit as StockUnit)
          : null,
        presetVatRate: productTypeForm.presetVatRate || null,
        presetGuaranteeMonths: productTypeForm.presetGuaranteeMonths
          ? numberFromForm(productTypeForm.presetGuaranteeMonths)
          : null,
      };

      if (editingProductTypeId == null) {
        await createProductTaxonomyEntityClient("productType", payload);
      } else {
        await updateProductTaxonomyEntityClient("productType", editingProductTypeId, payload);
      }

      toast.success("Modèle de produit enregistré.");
      resetProductTypeForm();
      await loadData();
    } catch (saveError: unknown) {
      toast.error(getErrorMessage(saveError, "Impossible d'enregistrer le modèle de produit."));
    } finally {
      setSavingKey(null);
    }
  };

  const saveAttributeGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageTemplates) {
      toast.error("Vous n'avez pas la permission de modifier les modèles de produits.");
      return;
    }

    if (!selectedProductType) {
      return;
    }

    setSavingKey("attributeGroup");
    try {
      const payload = {
        productTypeId: selectedProductType.id,
        name: attributeGroupForm.name,
        slug: attributeGroupForm.slug,
        sortOrder:
          selectedProductType.attributeGroups.find((group) => group.id === editingAttributeGroupId)
            ?.sortOrder ?? selectedProductType.attributeGroups.length,
      };

      if (editingAttributeGroupId == null) {
        await createProductTaxonomyEntityClient("attributeGroup", payload);
      } else {
        await updateProductTaxonomyEntityClient("attributeGroup", editingAttributeGroupId, payload);
      }

      toast.success("Groupe d'attributs enregistré.");
      resetAttributeGroupForm();
      await loadData();
    } catch (saveError: unknown) {
      toast.error(getErrorMessage(saveError, "Impossible d'enregistrer le groupe d'attributs."));
    } finally {
      setSavingKey(null);
    }
  };

  const saveAttribute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageTemplates) {
      toast.error("Vous n'avez pas la permission de modifier les modèles de produits.");
      return;
    }

    if (!selectedProductType) {
      return;
    }

    setSavingKey("attribute");
    try {
      const payload = {
        productTypeId: selectedProductType.id,
        attributeGroupId: attributeForm.attributeGroupId
          ? Number(attributeForm.attributeGroupId)
          : null,
        attributeDefinitionId: Number(attributeForm.attributeDefinitionId),
        label: attributeForm.label,
        isRequired: attributeForm.isRequired,
        isFilterable: attributeForm.isFilterable,
        sortOrder: numberFromForm(attributeForm.sortOrder),
      };

      if (editingAttributeId == null) {
        await createProductTaxonomyEntityClient("attribute", payload);
      } else {
        await updateProductTaxonomyEntityClient("attribute", editingAttributeId, payload);
      }

      toast.success("Attribut enregistré.");
      resetAttributeForm();
      await loadData();
    } catch (saveError: unknown) {
      toast.error(getErrorMessage(saveError, "Impossible d'enregistrer l'attribut."));
    } finally {
      setSavingKey(null);
    }
  };

  const deleteEntity = async (
    entity: "group" | "productType" | "attributeGroup" | "attribute",
    id: number,
    label: string,
  ) => {
    if (!canManageTemplates) {
      toast.error("Vous n'avez pas la permission de supprimer les modèles de produits.");
      return;
    }

    if (!window.confirm(`Supprimer "${label}" ?`)) {
      return;
    }

    setSavingKey(`${entity}:${id}`);
    try {
      await deleteProductTaxonomyEntityClient(entity, id);
      toast.success("Suppression effectuée.");
      await loadData();
    } catch (deleteError: unknown) {
      toast.error(getErrorMessage(deleteError, "Impossible de supprimer cette ressource."));
    } finally {
      setSavingKey(null);
    }
  };

  const handleGroupDrop = async (targetGroupId: number) => {
    if (!canManageTemplates) {
      return;
    }

    if (!draggedGroupId || !groupDropTarget) {
      return;
    }

    const nextGroups = moveItemById(
      data.groups,
      draggedGroupId,
      targetGroupId,
      groupDropTarget.position,
    );

    if (
      nextGroups.map((group) => group.id).join("|") ===
      data.groups.map((group) => group.id).join("|")
    ) {
      setDraggedGroupId(null);
      setGroupDropTarget(null);
      return;
    }

    setData((current) => ({
      ...current,
      groups: nextGroups.map((group, index) => ({ ...group, sortOrder: index })),
    }));
    setDraggedGroupId(null);
    setGroupDropTarget(null);
    setIsReordering(true);

    try {
      const nextData = await reorderProductTypeGroupsClient(nextGroups.map((group) => group.id));
      setData(nextData);
      toast.success("Ordre des groupes mis a jour.");
    } catch (reorderError: unknown) {
      await loadData();
      toast.error(getErrorMessage(reorderError, "Impossible de reordonner les groupes."));
    } finally {
      setIsReordering(false);
    }
  };

  const handleProductTypeDrop = async (
    targetProductTypeId: number,
    productTypes: ProductTaxonomyTypeDto[],
  ) => {
    if (!canManageTemplates) {
      return;
    }

    if (!draggedProductTypeId || !productTypeDropTarget) {
      return;
    }

    const nextProductTypes = moveItemById(
      productTypes,
      draggedProductTypeId,
      targetProductTypeId,
      productTypeDropTarget.position,
    );

    if (
      nextProductTypes.map((item) => item.id).join("|") ===
      productTypes.map((item) => item.id).join("|")
    ) {
      setDraggedProductTypeId(null);
      setProductTypeDropTarget(null);
      return;
    }

    const nextOrderById = new Map(
      nextProductTypes.map((productType, index) => [productType.id, index]),
    );
    setData((current) => ({
      ...current,
      productTypes: current.productTypes.map((productType) =>
        nextOrderById.has(productType.id)
          ? {
              ...productType,
              sortOrder: nextOrderById.get(productType.id) ?? productType.sortOrder,
            }
          : productType,
      ),
    }));
    setDraggedProductTypeId(null);
    setProductTypeDropTarget(null);
    setIsReordering(true);

    try {
      const nextData = await reorderProductTypesClient(
        nextProductTypes.map((productType) => productType.id),
      );
      setData(nextData);
      toast.success("Ordre des modèles de produits mis a jour.");
    } catch (reorderError: unknown) {
      await loadData();
      toast.error(
        getErrorMessage(reorderError, "Impossible de reordonner les modèles de produits."),
      );
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Catalogue" title="Modèles de produits" icon={Shapes} />

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8">
          <Loading />
        </div>
      ) : null}

      {!isLoading && error ? (
        <StaffNotice variant="error" title="Chargement impossible">
          {error}
        </StaffNotice>
      ) : null}

      {!isLoading && !error ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
          <div className="space-y-6">
            <Panel pretitle="Groupes" title="Groupes de modèles de produits">
              <form
                onSubmit={saveGroup}
                className={cn(
                  "grid gap-4 lg:grid-cols-[1fr_1fr_auto]",
                  !canManageTemplates && "hidden",
                )}
              >
                <PanelField id="product-type-group-name" label="Nom">
                  <PanelInput
                    id="product-type-group-name"
                    fullWidth
                    value={groupForm.name}
                    onChange={(event) => {
                      const name = event.target.value;
                      setGroupForm((current) => ({
                        ...current,
                        name,
                        slug:
                          current.slug === "" || current.slug === slugify(current.name)
                            ? slugify(name)
                            : current.slug,
                      }));
                    }}
                  />
                </PanelField>
                <PanelField id="product-type-group-slug" label="Slug">
                  <PanelInput
                    id="product-type-group-slug"
                    fullWidth
                    value={groupForm.slug}
                    onChange={(event) =>
                      setGroupForm((current) => ({
                        ...current,
                        slug: event.target.value,
                      }))
                    }
                  />
                </PanelField>
                <div className="flex items-end gap-3">
                  <AnimatedUIButton type="submit" icon="save" loading={savingKey === "group"}>
                    {editingGroupId == null ? "Ajouter" : "Enregistrer"}
                  </AnimatedUIButton>
                  {editingGroupId != null ? (
                    <AnimatedUIButton
                      type="button"
                      variant="ghost"
                      icon="close"
                      onClick={resetGroupForm}
                    />
                  ) : null}
                </div>
              </form>

              <div className="grid gap-2">
                {data.groups.map((group, index) => (
                  <div
                    key={group.id}
                    draggable={canManageTemplates && !isReordering}
                    onDragStart={(event) => {
                      setDraggedGroupId(group.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      setDraggedGroupId(null);
                      setGroupDropTarget(null);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      const bounds = event.currentTarget.getBoundingClientRect();
                      const position =
                        event.clientY - bounds.top > bounds.height / 2 ? "after" : "before";
                      setGroupDropTarget({ id: group.id, position });
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      void handleGroupDrop(group.id);
                    }}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2",
                      groupDropTarget?.id === group.id
                        ? "border-cobam-water-blue bg-cobam-water-blue/5"
                        : "border-slate-200",
                      draggedGroupId === group.id ? "opacity-60" : "",
                    )}
                  >
                    <div>
                      <p className="text-cobam-dark-blue flex items-center gap-2 font-semibold">
                        <GripVertical className="h-4 w-4 text-slate-400" />
                        <span>{group.name}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {group.slug} · #{index + 1}
                      </p>
                    </div>
                    {canManageTemplates ? (
                      <div className="flex items-center gap-2">
                        <AnimatedUIButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          icon="modify"
                          onClick={() => editGroup(group)}
                        />
                        <AnimatedUIButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          color="red"
                          icon="trash"
                          onClick={() => void deleteEntity("group", group.id, group.name)}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel pretitle="Modèles" title="Modèles de produits">
              <form
                onSubmit={saveProductType}
                className={cn("grid gap-4 lg:grid-cols-2", !canManageTemplates && "hidden")}
              >
                <PanelField id="product-type-name" label="Nom">
                  <PanelInput
                    id="product-type-name"
                    fullWidth
                    value={productTypeForm.name}
                    onChange={(event) => {
                      const name = event.target.value;
                      setProductTypeForm((current) => ({
                        ...current,
                        name,
                        slug:
                          current.slug === "" || current.slug === slugify(current.name)
                            ? slugify(name)
                            : current.slug,
                      }));
                    }}
                  />
                </PanelField>
                <PanelField id="product-type-slug" label="Slug">
                  <PanelInput
                    id="product-type-slug"
                    fullWidth
                    value={productTypeForm.slug}
                    onChange={(event) =>
                      setProductTypeForm((current) => ({
                        ...current,
                        slug: event.target.value,
                      }))
                    }
                  />
                </PanelField>
                <PanelField id="product-type-group" label="Groupe UI">
                  <StaffSelect
                    id="product-type-group"
                    fullWidth
                    value={productTypeForm.groupId}
                    emptyLabel="Sans groupe"
                    options={data.groups.map((group) => ({
                      value: String(group.id),
                      label: group.name,
                    }))}
                    onValueChange={(value) =>
                      setProductTypeForm((current) => ({
                        ...current,
                        groupId: value,
                      }))
                    }
                  />
                </PanelField>
                <PanelField
                  id="product-type-description"
                  label="Description"
                  className="lg:col-span-2"
                >
                  <Textarea
                    id="product-type-description"
                    value={productTypeForm.description}
                    onChange={(event) =>
                      setProductTypeForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="rounded-md border-slate-300 bg-white"
                  />
                </PanelField>
                <PanelField
                  id="product-type-preset-tags"
                  label="Tags préconfigurés"
                  className="lg:col-span-2"
                >
                  <StaffTagInput
                    id="product-type-preset-tags"
                    value={splitTags(productTypeForm.presetTags)}
                    onChange={(tags) =>
                      setProductTypeForm((current) => ({
                        ...current,
                        presetTags: tags.join(" "),
                      }))
                    }
                  />
                </PanelField>
                <ProductSubcategoriesField
                  id="product-type-preset-subcategories"
                  label="Sous-categories préconfigurées"
                  className="lg:col-span-2"
                  value={productTypeForm.presetSubcategoryIds}
                  options={data.productSubcategories ?? []}
                  onChange={(value) =>
                    setProductTypeForm((current) => ({
                      ...current,
                      presetSubcategoryIds: value,
                    }))
                  }
                />
                <PanelField id="product-type-preset-stock-unit" label="Unité stock">
                  <StaffSelect
                    id="product-type-preset-stock-unit"
                    fullWidth
                    value={productTypeForm.presetStockUnit}
                    emptyLabel="Ne pas préconfigurer"
                    options={STOCK_UNIT_VALUES.map((value) => ({
                      value,
                      label: formatEnumLabel(value),
                    }))}
                    onValueChange={(value) =>
                      setProductTypeForm((current) => ({
                        ...current,
                        presetStockUnit: value,
                      }))
                    }
                  />
                </PanelField>
                <PanelField id="product-type-preset-vat-rate" label="TVA">
                  <PanelInput
                    id="product-type-preset-vat-rate"
                    fullWidth
                    inputMode="decimal"
                    placeholder="19.000"
                    value={productTypeForm.presetVatRate}
                    onChange={(event) =>
                      setProductTypeForm((current) => ({
                        ...current,
                        presetVatRate: event.target.value,
                      }))
                    }
                  />
                </PanelField>
                <PanelField id="product-type-preset-guarantee" label="Garantie (mois)">
                  <PanelInput
                    id="product-type-preset-guarantee"
                    fullWidth
                    type="number"
                    min={0}
                    value={productTypeForm.presetGuaranteeMonths}
                    onChange={(event) =>
                      setProductTypeForm((current) => ({
                        ...current,
                        presetGuaranteeMonths: event.target.value,
                      }))
                    }
                  />
                </PanelField>
                <div className="flex flex-wrap gap-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 lg:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Checkbox
                      checked={productTypeForm.hasColor}
                      onCheckedChange={(checked) =>
                        setProductTypeForm((current) => ({
                          ...current,
                          hasColor: checked === true,
                        }))
                      }
                    />
                    A une couleur
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Checkbox
                      checked={productTypeForm.hasFinish}
                      onCheckedChange={(checked) =>
                        setProductTypeForm((current) => ({
                          ...current,
                          hasFinish: checked === true,
                        }))
                      }
                    />
                    A une finition
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
                  <AnimatedUIButton type="submit" icon="save" loading={savingKey === "productType"}>
                    {editingProductTypeId == null ? "Ajouter" : "Enregistrer"}
                  </AnimatedUIButton>
                  {editingProductTypeId != null ? (
                    <AnimatedUIButton
                      type="button"
                      variant="ghost"
                      icon="close"
                      onClick={resetProductTypeForm}
                    />
                  ) : null}
                </div>
              </form>

              <div className="space-y-4">
                {groupedProductTypes.map(({ key, name: groupName, productTypes }) => (
                  <section key={key} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                      <Layers3 className="h-4 w-4" />
                      {groupName}
                    </div>
                    <div className="grid gap-2">
                      {productTypes.map((productType, index) => (
                        <div
                          key={productType.id}
                          role="button"
                          tabIndex={0}
                          draggable={canManageTemplates && !isReordering}
                          onClick={() => setSelectedProductTypeId(productType.id)}
                          onDragStart={(event) => {
                            setDraggedProductTypeId(productType.id);
                            event.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => {
                            setDraggedProductTypeId(null);
                            setProductTypeDropTarget(null);
                          }}
                          onDragOver={(event) => {
                            event.preventDefault();
                            const bounds = event.currentTarget.getBoundingClientRect();
                            const position =
                              event.clientY - bounds.top > bounds.height / 2 ? "after" : "before";
                            setProductTypeDropTarget({
                              id: productType.id,
                              position,
                            });
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            void handleProductTypeDrop(productType.id, productTypes);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedProductTypeId(productType.id);
                            }
                          }}
                          className={cn(
                            "cursor-pointer rounded-md border px-3 py-3 text-left transition",
                            selectedProductTypeId === productType.id
                              ? "border-cobam-water-blue bg-cobam-water-blue/5"
                              : "border-slate-200 bg-white hover:border-slate-300",
                            productTypeDropTarget?.id === productType.id
                              ? "ring-cobam-water-blue/40 ring-2"
                              : "",
                            draggedProductTypeId === productType.id ? "opacity-60" : "",
                          )}
                        >
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2">
                              <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
                              <span className="text-cobam-dark-blue font-semibold">
                                {productType.name}
                              </span>
                              <span className="ml-2 text-xs text-slate-400">
                                {productType.slug} · #{index + 1}
                              </span>
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                {productType.attributes.length} attributs
                              </span>
                            </span>
                          </span>
                          {canManageTemplates ? (
                            <span className="mt-3 flex flex-wrap gap-2">
                              <AnimatedUIButton
                                type="button"
                                size="sm"
                                variant="outline"
                                icon="modify"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  editProductType(productType);
                                }}
                              >
                                Modifier
                              </AnimatedUIButton>
                              <AnimatedUIButton
                                type="button"
                                size="sm"
                                variant="ghost"
                                color="red"
                                icon="trash"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void deleteEntity(
                                    "productType",
                                    productType.id,
                                    productType.name,
                                  );
                                }}
                              >
                                Supprimer
                              </AnimatedUIButton>
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </Panel>
          </div>

          <Panel
            pretitle={selectedProductType?.name ?? "Attributs"}
            title="Attributs préconfigurés"
            allowOverflow
          >
            {selectedProductType ? (
              <div className="space-y-6">
                <form
                  onSubmit={saveAttributeGroup}
                  className={cn(
                    "grid gap-3 md:grid-cols-[1fr_1fr_auto]",
                    !canManageTemplates && "hidden",
                  )}
                >
                  <PanelField id="attribute-group-name" label="Groupe">
                    <PanelInput
                      id="attribute-group-name"
                      fullWidth
                      value={attributeGroupForm.name}
                      onChange={(event) => {
                        const name = event.target.value;
                        setAttributeGroupForm((current) => ({
                          ...current,
                          name,
                          slug:
                            current.slug === "" || current.slug === slugify(current.name)
                              ? slugify(name)
                              : current.slug,
                        }));
                      }}
                    />
                  </PanelField>
                  <PanelField id="attribute-group-slug" label="Slug">
                    <PanelInput
                      id="attribute-group-slug"
                      fullWidth
                      value={attributeGroupForm.slug}
                      onChange={(event) =>
                        setAttributeGroupForm((current) => ({
                          ...current,
                          slug: event.target.value,
                        }))
                      }
                    />
                  </PanelField>
                  <div className="flex items-end gap-2">
                    <AnimatedUIButton
                      type="submit"
                      icon="save"
                      loading={savingKey === "attributeGroup"}
                    >
                      {editingAttributeGroupId == null ? "Ajouter" : "Enregistrer"}
                    </AnimatedUIButton>
                    {editingAttributeGroupId != null ? (
                      <AnimatedUIButton
                        type="button"
                        variant="ghost"
                        icon="close"
                        onClick={resetAttributeGroupForm}
                      />
                    ) : null}
                  </div>
                </form>

                <div className="grid gap-2">
                  {selectedProductType.attributeGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2"
                    >
                      <span>
                        <span className="text-cobam-dark-blue font-semibold">{group.name}</span>
                        <span className="ml-2 text-xs text-slate-400">{group.slug}</span>
                      </span>
                      {canManageTemplates ? (
                        <span className="flex gap-2">
                          <AnimatedUIButton
                            type="button"
                            size="sm"
                            variant="outline"
                            icon="plus"
                            onClick={() => {
                              const groupAttributeCount = selectedProductType.attributes.filter(
                                (attribute) => attribute.attributeGroupId === group.id,
                              ).length;
                              setEditingAttributeId(null);
                              setAttributeForm({
                                ...emptyAttributeForm(),
                                attributeGroupId: String(group.id),
                                sortOrder: String(groupAttributeCount),
                              });
                            }}
                          >
                            Attribut
                          </AnimatedUIButton>
                          <AnimatedUIButton
                            type="button"
                            size="sm"
                            variant="ghost"
                            icon="modify"
                            onClick={() => editAttributeGroup(group)}
                          />
                          <AnimatedUIButton
                            type="button"
                            size="sm"
                            variant="ghost"
                            color="red"
                            icon="trash"
                            onClick={() =>
                              void deleteEntity("attributeGroup", group.id, group.name)
                            }
                          />
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={saveAttribute}
                  className={cn(
                    "grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-2",
                    !canManageTemplates && "hidden",
                  )}
                >
                  <PanelField id="attribute-definition" label="Definition">
                    <StaffSearchSelect
                      id="attribute-definition"
                      fullWidth
                      value={attributeForm.attributeDefinitionId}
                      options={attributeDefinitionOptions}
                      emptyLabel="Choisir une definition"
                      placeholder="Choisir une definition"
                      searchPlaceholder="Rechercher une definition..."
                      noResultsLabel="Aucune definition disponible"
                      disabled={isEditingSpecialAttribute}
                      onValueChange={(value) =>
                        setAttributeForm((current) => ({
                          ...current,
                          attributeDefinitionId: value,
                        }))
                      }
                    />
                  </PanelField>
                  <PanelField id="attribute-label" label="Libellé">
                    <PanelInput
                      id="attribute-label"
                      fullWidth
                      value={attributeForm.label}
                      placeholder={selectedAttributeDefinition?.label ?? "Libelle de la definition"}
                      onChange={(event) =>
                        setAttributeForm((current) => ({
                          ...current,
                          label: event.target.value,
                        }))
                      }
                    />
                  </PanelField>
                  <PanelField id="attribute-group" label="Groupe">
                    <StaffSelect
                      id="attribute-group"
                      fullWidth
                      value={attributeForm.attributeGroupId}
                      emptyLabel="Sans groupe"
                      options={selectedProductType.attributeGroups.map((group) => ({
                        value: String(group.id),
                        label: group.name,
                      }))}
                      onValueChange={(value) =>
                        setAttributeForm((current) => ({
                          ...current,
                          attributeGroupId: value,
                        }))
                      }
                    />
                  </PanelField>
                  <PanelField id="attribute-sort" label="Ordre">
                    <PanelInput
                      id="attribute-sort"
                      fullWidth
                      type="number"
                      value={attributeForm.sortOrder}
                      onChange={(event) =>
                        setAttributeForm((current) => ({
                          ...current,
                          sortOrder: event.target.value,
                        }))
                      }
                    />
                  </PanelField>
                  <div className="grid gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 md:col-span-2">
                    <span>
                      Clé:{" "}
                      <strong className="text-cobam-dark-blue">
                        {selectedAttributeDefinition?.key ?? "-"}
                      </strong>
                    </span>
                    <span>
                      Type: {selectedAttributeDefinition?.inputType ?? "-"}
                      {selectedAttributeDefinition?.unit
                        ? ` · Unite: ${selectedAttributeDefinition.unit}`
                        : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Checkbox
                        checked={attributeForm.isRequired}
                        onCheckedChange={(checked) =>
                          setAttributeForm((current) => ({
                            ...current,
                            isRequired: checked === true,
                          }))
                        }
                      />
                      Requis
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Checkbox
                        checked={attributeForm.isFilterable}
                        onCheckedChange={(checked) =>
                          setAttributeForm((current) => ({
                            ...current,
                            isFilterable: checked === true,
                          }))
                        }
                      />
                      Filtrable
                    </label>
                    <AnimatedUIButton type="submit" icon="save" loading={savingKey === "attribute"}>
                      {editingAttributeId == null ? "Ajouter" : "Enregistrer"}
                    </AnimatedUIButton>
                    {editingAttributeId != null ? (
                      <AnimatedUIButton
                        type="button"
                        variant="ghost"
                        icon="close"
                        onClick={resetAttributeForm}
                      />
                    ) : null}
                  </div>
                </form>

                <div className="grid gap-2">
                  {selectedAttributeSections.flatMap((section) => [
                    <div
                      key={`${section.key}:header`}
                      className="mt-2 flex items-center justify-between rounded-md bg-slate-100 px-3 py-2"
                    >
                      <span>
                        <span className="text-cobam-dark-blue font-semibold">{section.name}</span>
                        {section.slug ? (
                          <span className="ml-2 text-xs text-slate-400">{section.slug}</span>
                        ) : null}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {section.attributes.length} attributs
                      </span>
                    </div>,
                    ...section.attributes.map((attribute) => (
                      <div
                        key={attribute.id}
                        className="rounded-md border border-slate-200 px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span>
                            <span className="text-cobam-dark-blue font-semibold">
                              {attribute.label}
                            </span>
                            <span className="ml-2 text-xs text-slate-400">{attribute.name}</span>
                          </span>
                          <span className="flex items-center gap-2 text-xs text-slate-500">
                            <Tags className="h-3.5 w-3.5" />
                            {attribute.attributeGroupName ?? "Sans groupe"}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-slate-500">
                            {attribute.inputType}
                            {attribute.unit ? ` · ${attribute.unit}` : ""}
                            {attribute.isRequired ? " · requis" : ""}
                            {attribute.isFilterable ? " · filtrable" : ""}
                            {isSpecialTemplateAttribute(attribute) ? " · automatique" : ""}
                          </span>
                          {canManageTemplates ? (
                            <span className="flex gap-2">
                              <AnimatedUIButton
                                type="button"
                                size="sm"
                                variant="ghost"
                                icon="modify"
                                onClick={() => editAttribute(attribute)}
                              />
                              {isSpecialTemplateAttribute(attribute) ? null : (
                                <AnimatedUIButton
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  color="red"
                                  icon="trash"
                                  onClick={() =>
                                    void deleteEntity("attribute", attribute.id, attribute.label)
                                  }
                                />
                              )}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )),
                  ])}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                Sélectionnez ou créez un modèle de produit pour configurer ses attributs.
              </div>
            )}
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
