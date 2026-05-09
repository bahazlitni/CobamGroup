"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ProductTypeAttributeInputType } from "@prisma/client";
import { Layers3, Shapes, Tags } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { StaffNotice, StaffPageHeader, StaffSelect } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  createProductTaxonomyEntityClient,
  deleteProductTaxonomyEntityClient,
  getProductTypesAdminClient,
  ProductTaxonomyClientError,
  updateProductTaxonomyEntityClient,
} from "@/features/product-taxonomy/client";
import type {
  ProductTaxonomyAttributeDto,
  ProductTaxonomyAttributeGroupDto,
  ProductTaxonomyGroupDto,
  ProductTaxonomyTypeDto,
  ProductTypesAdminDto,
} from "@/features/product-taxonomy/types";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";

const ATTRIBUTE_INPUT_TYPES = Object.values(ProductTypeAttributeInputType).map(
  (value) => ({ value, label: value }),
);

type GroupFormState = {
  name: string;
  slug: string;
  sortOrder: string;
  isActive: boolean;
};

type ProductTypeFormState = {
  groupId: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
};

type AttributeGroupFormState = {
  name: string;
  slug: string;
  sortOrder: string;
};

type AttributeFormState = {
  attributeGroupId: string;
  name: string;
  label: string;
  unit: string;
  inputType: ProductTypeAttributeInputType;
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: string;
};

function emptyGroupForm(): GroupFormState {
  return {
    name: "",
    slug: "",
    sortOrder: "0",
    isActive: true,
  };
}

function emptyProductTypeForm(): ProductTypeFormState {
  return {
    groupId: "",
    name: "",
    slug: "",
    description: "",
    sortOrder: "0",
    isActive: true,
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
    name: "",
    label: "",
    unit: "",
    inputType: "TEXT",
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

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500",
      )}
    >
      {active ? "Actif" : "Inactif"}
    </span>
  );
}

export default function ProductTypesAdminPage() {
  const [data, setData] = useState<ProductTypesAdminDto>({
    groups: [],
    productTypes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<number | null>(
    null,
  );

  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [groupForm, setGroupForm] = useState<GroupFormState>(emptyGroupForm);
  const [editingProductTypeId, setEditingProductTypeId] = useState<number | null>(
    null,
  );
  const [productTypeForm, setProductTypeForm] =
    useState<ProductTypeFormState>(emptyProductTypeForm);
  const [editingAttributeGroupId, setEditingAttributeGroupId] = useState<
    number | null
  >(null);
  const [attributeGroupForm, setAttributeGroupForm] =
    useState<AttributeGroupFormState>(emptyAttributeGroupForm);
  const [editingAttributeId, setEditingAttributeId] = useState<number | null>(
    null,
  );
  const [attributeForm, setAttributeForm] =
    useState<AttributeFormState>(emptyAttributeForm);

  const selectedProductType = useMemo(
    () =>
      selectedProductTypeId == null
        ? null
        : data.productTypes.find((item) => item.id === selectedProductTypeId) ??
          null,
    [data.productTypes, selectedProductTypeId],
  );

  const groupedProductTypes = useMemo(() => {
    const groups = new Map<string, ProductTaxonomyTypeDto[]>();

    for (const productType of data.productTypes) {
      const key = productType.groupName ?? "Sans groupe";
      groups.set(key, [...(groups.get(key) ?? []), productType]);
    }

    return [...groups.entries()];
  }, [data.productTypes]);

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
      setError(getErrorMessage(loadError, "Impossible de charger les types produit."));
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
      sortOrder: String(group.sortOrder),
      isActive: group.isActive,
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
      sortOrder: String(productType.sortOrder),
      isActive: productType.isActive,
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
        attribute.attributeGroupId == null
          ? ""
          : String(attribute.attributeGroupId),
      name: attribute.name,
      label: attribute.label,
      unit: attribute.unit ?? "",
      inputType: attribute.inputType,
      isRequired: attribute.isRequired,
      isFilterable: attribute.isFilterable,
      sortOrder: String(attribute.sortOrder),
    });
  };

  const saveGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingKey("group");
    try {
      const payload = {
        ...groupForm,
        sortOrder: numberFromForm(groupForm.sortOrder),
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
    setSavingKey("productType");
    try {
      const payload = {
        groupId: productTypeForm.groupId ? Number(productTypeForm.groupId) : null,
        name: productTypeForm.name,
        slug: productTypeForm.slug,
        description: productTypeForm.description || null,
        sortOrder: numberFromForm(productTypeForm.sortOrder),
        isActive: productTypeForm.isActive,
      };

      if (editingProductTypeId == null) {
        await createProductTaxonomyEntityClient("productType", payload);
      } else {
        await updateProductTaxonomyEntityClient(
          "productType",
          editingProductTypeId,
          payload,
        );
      }

      toast.success("Type produit enregistré.");
      resetProductTypeForm();
      await loadData();
    } catch (saveError: unknown) {
      toast.error(
        getErrorMessage(saveError, "Impossible d'enregistrer le type produit."),
      );
    } finally {
      setSavingKey(null);
    }
  };

  const saveAttributeGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProductType) {
      return;
    }

    setSavingKey("attributeGroup");
    try {
      const payload = {
        productTypeId: selectedProductType.id,
        name: attributeGroupForm.name,
        slug: attributeGroupForm.slug,
        sortOrder: numberFromForm(attributeGroupForm.sortOrder),
      };

      if (editingAttributeGroupId == null) {
        await createProductTaxonomyEntityClient("attributeGroup", payload);
      } else {
        await updateProductTaxonomyEntityClient(
          "attributeGroup",
          editingAttributeGroupId,
          payload,
        );
      }

      toast.success("Groupe d'attributs enregistré.");
      resetAttributeGroupForm();
      await loadData();
    } catch (saveError: unknown) {
      toast.error(
        getErrorMessage(
          saveError,
          "Impossible d'enregistrer le groupe d'attributs.",
        ),
      );
    } finally {
      setSavingKey(null);
    }
  };

  const saveAttribute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
        name: attributeForm.name,
        label: attributeForm.label,
        unit: attributeForm.unit || null,
        inputType: attributeForm.inputType,
        isRequired: attributeForm.isRequired,
        isFilterable: attributeForm.isFilterable,
        sortOrder: numberFromForm(attributeForm.sortOrder),
      };

      if (editingAttributeId == null) {
        await createProductTaxonomyEntityClient("attribute", payload);
      } else {
        await updateProductTaxonomyEntityClient(
          "attribute",
          editingAttributeId,
          payload,
        );
      }

      toast.success("Attribut enregistré.");
      resetAttributeForm();
      await loadData();
    } catch (saveError: unknown) {
      toast.error(
        getErrorMessage(saveError, "Impossible d'enregistrer l'attribut."),
      );
    } finally {
      setSavingKey(null);
    }
  };

  const deleteEntity = async (
    entity: "group" | "productType" | "attributeGroup" | "attribute",
    id: number,
    label: string,
  ) => {
    if (!window.confirm(`Supprimer "${label}" ?`)) {
      return;
    }

    setSavingKey(`${entity}:${id}`);
    try {
      await deleteProductTaxonomyEntityClient(entity, id);
      toast.success("Suppression effectuée.");
      await loadData();
    } catch (deleteError: unknown) {
      toast.error(
        getErrorMessage(deleteError, "Impossible de supprimer cette ressource."),
      );
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="Catalogue"
        title="Types produit"
        icon={Shapes}
      />

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
            <Panel pretitle="Groupes" title="Groupes de types produit">
              <form onSubmit={saveGroup} className="grid gap-4 lg:grid-cols-4">
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
                <PanelField id="product-type-group-sort" label="Ordre">
                  <PanelInput
                    id="product-type-group-sort"
                    fullWidth
                    type="number"
                    value={groupForm.sortOrder}
                    onChange={(event) =>
                      setGroupForm((current) => ({
                        ...current,
                        sortOrder: event.target.value,
                      }))
                    }
                  />
                </PanelField>
                <div className="flex items-end gap-3">
                  <label className="flex h-10 items-center gap-2 text-sm font-medium text-slate-600">
                    <Checkbox
                      checked={groupForm.isActive}
                      onCheckedChange={(checked) =>
                        setGroupForm((current) => ({
                          ...current,
                          isActive: checked === true,
                        }))
                      }
                    />
                    Actif
                  </label>
                  <AnimatedUIButton
                    type="submit"
                    icon="save"
                    loading={savingKey === "group"}
                  >
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
                {data.groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-cobam-dark-blue">
                        {group.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {group.slug} · ordre {group.sortOrder}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill active={group.isActive} />
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
                  </div>
                ))}
              </div>
            </Panel>

            <Panel pretitle="Modèles" title="Types produit">
              <form onSubmit={saveProductType} className="grid gap-4 lg:grid-cols-2">
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
                <PanelField id="product-type-sort" label="Ordre">
                  <PanelInput
                    id="product-type-sort"
                    fullWidth
                    type="number"
                    value={productTypeForm.sortOrder}
                    onChange={(event) =>
                      setProductTypeForm((current) => ({
                        ...current,
                        sortOrder: event.target.value,
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
                <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Checkbox
                      checked={productTypeForm.isActive}
                      onCheckedChange={(checked) =>
                        setProductTypeForm((current) => ({
                          ...current,
                          isActive: checked === true,
                        }))
                      }
                    />
                    Actif
                  </label>
                  <AnimatedUIButton
                    type="submit"
                    icon="save"
                    loading={savingKey === "productType"}
                  >
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
                {groupedProductTypes.map(([groupName, productTypes]) => (
                  <section key={groupName} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      <Layers3 className="h-4 w-4" />
                      {groupName}
                    </div>
                    <div className="grid gap-2">
                      {productTypes.map((productType) => (
                        <div
                          key={productType.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedProductTypeId(productType.id)}
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
                          )}
                        >
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <span>
                              <span className="font-semibold text-cobam-dark-blue">
                                {productType.name}
                              </span>
                              <span className="ml-2 text-xs text-slate-400">
                                {productType.slug}
                              </span>
                            </span>
                            <span className="flex items-center gap-2">
                              <StatusPill active={productType.isActive} />
                              <span className="text-xs text-slate-500">
                                {productType.attributes.length} attributs
                              </span>
                            </span>
                          </span>
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
                <form onSubmit={saveAttributeGroup} className="grid gap-3 md:grid-cols-3">
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
                            current.slug === "" ||
                            current.slug === slugify(current.name)
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
                  <PanelField id="attribute-group-sort" label="Ordre">
                    <PanelInput
                      id="attribute-group-sort"
                      fullWidth
                      type="number"
                      value={attributeGroupForm.sortOrder}
                      onChange={(event) =>
                        setAttributeGroupForm((current) => ({
                          ...current,
                          sortOrder: event.target.value,
                        }))
                      }
                    />
                  </PanelField>
                  <div className="flex gap-2 md:col-span-3">
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
                        <span className="font-semibold text-cobam-dark-blue">
                          {group.name}
                        </span>
                        <span className="ml-2 text-xs text-slate-400">
                          {group.slug}
                        </span>
                      </span>
                      <span className="flex gap-2">
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
                    </div>
                  ))}
                </div>

                <form onSubmit={saveAttribute} className="grid gap-3 md:grid-cols-2">
                  <PanelField id="attribute-name" label="Nom technique">
                    <PanelInput
                      id="attribute-name"
                      fullWidth
                      value={attributeForm.name}
                      onChange={(event) =>
                        setAttributeForm((current) => ({
                          ...current,
                          name: event.target.value,
                          label: current.label || event.target.value,
                        }))
                      }
                    />
                  </PanelField>
                  <PanelField id="attribute-label" label="Libellé">
                    <PanelInput
                      id="attribute-label"
                      fullWidth
                      value={attributeForm.label}
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
                  <PanelField id="attribute-input-type" label="Type de champ">
                    <StaffSelect
                      id="attribute-input-type"
                      fullWidth
                      value={attributeForm.inputType}
                      options={ATTRIBUTE_INPUT_TYPES}
                      onValueChange={(value) =>
                        setAttributeForm((current) => ({
                          ...current,
                          inputType: value as ProductTypeAttributeInputType,
                        }))
                      }
                    />
                  </PanelField>
                  <PanelField id="attribute-unit" label="Unité">
                    <PanelInput
                      id="attribute-unit"
                      fullWidth
                      value={attributeForm.unit}
                      onChange={(event) =>
                        setAttributeForm((current) => ({
                          ...current,
                          unit: event.target.value,
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
                    <AnimatedUIButton
                      type="submit"
                      icon="save"
                      loading={savingKey === "attribute"}
                    >
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
                  {selectedProductType.attributes.map((attribute) => (
                    <div
                      key={attribute.id}
                      className="rounded-md border border-slate-200 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                          <span className="font-semibold text-cobam-dark-blue">
                            {attribute.label}
                          </span>
                          <span className="ml-2 text-xs text-slate-400">
                            {attribute.name}
                          </span>
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
                        </span>
                        <span className="flex gap-2">
                          <AnimatedUIButton
                            type="button"
                            size="sm"
                            variant="ghost"
                            icon="modify"
                            onClick={() => editAttribute(attribute)}
                          />
                          <AnimatedUIButton
                            type="button"
                            size="sm"
                            variant="ghost"
                            color="red"
                            icon="trash"
                            onClick={() =>
                              void deleteEntity(
                                "attribute",
                                attribute.id,
                                attribute.label,
                              )
                            }
                          />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                Sélectionnez ou créez un type produit pour configurer ses attributs.
              </div>
            )}
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
