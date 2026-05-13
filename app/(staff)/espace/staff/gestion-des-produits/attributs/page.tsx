"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ProductTypeAttributeInputType } from "@prisma/client";
import { Tags } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { StaffNotice, StaffPageHeader, StaffSelect, StaffTagInput } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canManageProductAttributes } from "@/features/product-taxonomy/access";
import {
  createProductAttributeDefinitionClient,
  deleteProductAttributeDefinitionClient,
  listProductAttributeDefinitionsClient,
  ProductTaxonomyClientError,
  updateProductAttributeDefinitionClient,
} from "@/features/product-taxonomy/client";
import type { ProductAttributeDefinitionDto } from "@/features/product-taxonomy/types";
import formatEnumLabel from "@/lib/formatEnumLabel";

type AttributeDefinitionFormState = {
  key: string;
  label: string;
  unit: string;
  inputType: ProductTypeAttributeInputType;
  selectOptions: string[];
};

const INPUT_TYPE_OPTIONS = Object.values(ProductTypeAttributeInputType).map((value) => ({
  value,
  label: formatEnumLabel(value),
}));

function emptyForm(): AttributeDefinitionFormState {
  return {
    key: "",
    label: "",
    unit: "",
    inputType: "TEXT",
    selectOptions: [],
  };
}

function isProtectedAttributeDefinition(item: ProductAttributeDefinitionDto) {
  const key = item.key.trim().toLowerCase();
  return key === "color" || key === "finish";
}

function keyify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .toLowerCase();
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ProductTaxonomyClientError || error instanceof Error
    ? error.message
    : fallback;
}

export default function ProductAttributeDefinitionsAdminPage() {
  const { user } = useStaffSessionContext();
  const [items, setItems] = useState<ProductAttributeDefinitionDto[]>([]);
  const [form, setForm] = useState<AttributeDefinitionFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canManageAttributes = user ? canManageProductAttributes(user) : false;
  const editingItem = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [editingId, items],
  );
  const isEditingProtectedDefinition = editingItem
    ? isProtectedAttributeDefinition(editingItem)
    : false;

  const loadItems = async () => {
    setError(null);
    try {
      setItems(await listProductAttributeDefinitionsClient());
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, "Impossible de charger les attributs."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const editItem = (item: ProductAttributeDefinitionDto) => {
    setEditingId(item.id);
    setForm({
      key: item.key,
      label: item.label,
      unit: item.unit ?? "",
      inputType: item.inputType,
      selectOptions: item.selectOptions,
    });
  };

  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageAttributes) {
      toast.error("Vous n'avez pas la permission de modifier les attributs.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        key: form.key.trim(),
        label: form.label.trim(),
        unit: form.unit.trim() || null,
        inputType: form.inputType,
        selectOptions: form.inputType === "SELECT" ? form.selectOptions : [],
      };

      if (editingId == null) {
        await createProductAttributeDefinitionClient(payload);
      } else {
        await updateProductAttributeDefinitionClient(editingId, payload);
      }

      toast.success("Attribut enregistré.");
      resetForm();
      await loadItems();
    } catch (saveError: unknown) {
      toast.error(getErrorMessage(saveError, "Impossible d'enregistrer l'attribut."));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (item: ProductAttributeDefinitionDto) => {
    if (!canManageAttributes) {
      toast.error("Vous n'avez pas la permission de supprimer les attributs.");
      return;
    }

    if (isProtectedAttributeDefinition(item)) {
      toast.error("Les attributs Couleur et Finition ne peuvent pas être supprimés.");
      return;
    }

    if (!window.confirm(`Supprimer "${item.label}" ?`)) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteProductAttributeDefinitionClient(item.id);
      toast.success("Attribut supprimé.");
      await loadItems();
    } catch (deleteError: unknown) {
      toast.error(
        getErrorMessage(
          deleteError,
          "Impossible de supprimer cet attribut. Il est peut-être utilisé par un modèle ou un produit.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Catalogue" title="Attributs" icon={Tags} />

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
        <div
          className={
            canManageAttributes ? "grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]" : "grid gap-6"
          }
        >
          {canManageAttributes ? (
            <Panel
              pretitle={editingId == null ? "Nouvel attribut" : "Modification"}
              title="Définition"
            >
              <form onSubmit={saveItem} className="grid gap-4">
                <PanelField id="product-attribute-label" label="Libellé">
                  <PanelInput
                    id="product-attribute-label"
                    fullWidth
                    value={form.label}
                    onChange={(event) => {
                      const label = event.target.value;
                      setForm((current) => ({
                        ...current,
                        label,
                        key:
                          current.key === "" || current.key === keyify(current.label)
                            ? keyify(label)
                            : current.key,
                      }));
                    }}
                  />
                </PanelField>
                <PanelField id="product-attribute-key" label="Clé">
                  <PanelInput
                    id="product-attribute-key"
                    fullWidth
                    value={form.key}
                    readOnly={isEditingProtectedDefinition}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, key: event.target.value }))
                    }
                  />
                </PanelField>
                <PanelField id="product-attribute-unit" label="Unité">
                  <PanelInput
                    id="product-attribute-unit"
                    fullWidth
                    placeholder="mm, Kg, L..."
                    value={form.unit}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, unit: event.target.value }))
                    }
                  />
                </PanelField>
                <PanelField id="product-attribute-input-type" label="Type de champ">
                  <StaffSelect
                    id="product-attribute-input-type"
                    fullWidth
                    value={form.inputType}
                    options={INPUT_TYPE_OPTIONS}
                    disabled={isEditingProtectedDefinition}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        inputType: value as ProductTypeAttributeInputType,
                        selectOptions: value === "SELECT" ? current.selectOptions : [],
                      }))
                    }
                  />
                </PanelField>
                {form.inputType === "SELECT" ? (
                  <PanelField id="product-attribute-select-options" label="Options">
                    <StaffTagInput
                      id="product-attribute-select-options"
                      value={form.selectOptions}
                      onChange={(selectOptions) =>
                        setForm((current) => ({ ...current, selectOptions }))
                      }
                    />
                  </PanelField>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <AnimatedUIButton type="submit" icon="save" loading={isSaving}>
                    {editingId == null ? "Ajouter" : "Enregistrer"}
                  </AnimatedUIButton>
                  {editingId != null ? (
                    <AnimatedUIButton
                      type="button"
                      variant="ghost"
                      icon="close"
                      onClick={resetForm}
                    >
                      Annuler
                    </AnimatedUIButton>
                  ) : null}
                </div>
              </form>
            </Panel>
          ) : null}

          <Panel pretitle={`${items.length} entrées`} title="Définitions disponibles">
            <div className="grid gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="text-cobam-dark-blue font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-500">
                      {item.key} · {formatEnumLabel(item.inputType)}
                      {item.unit ? ` · ${item.unit}` : ""}
                    </p>
                  </div>
                  {canManageAttributes ? (
                    <div className="flex items-center gap-2">
                      <AnimatedUIButton
                        type="button"
                        size="sm"
                        variant="ghost"
                        icon="modify"
                        onClick={() => editItem(item)}
                      />
                      {isProtectedAttributeDefinition(item) ? null : (
                        <AnimatedUIButton
                          type="button"
                          size="sm"
                          variant="ghost"
                          color="red"
                          icon="trash"
                          onClick={() => void deleteItem(item)}
                        />
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
