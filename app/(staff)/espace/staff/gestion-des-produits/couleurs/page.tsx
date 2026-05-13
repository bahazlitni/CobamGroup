"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Palette } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ColorHexField, { normalizeHexInput } from "@/components/staff/ui/ColorHexField";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { StaffNotice, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canManageProductColors } from "@/features/product-taxonomy/access";
import {
  createProductColorClient,
  deleteProductColorClient,
  listProductColorsClient,
  ProductTaxonomyClientError,
  updateProductColorClient,
} from "@/features/product-taxonomy/client";
import type { ProductColorDto } from "@/features/product-taxonomy/types";
import { slugify } from "@/lib/slugify";

type ColorFormState = {
  key: string;
  label: string;
  value: string;
};

function emptyColorForm(): ColorFormState {
  return {
    key: "",
    label: "",
    value: "#000000",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ProductTaxonomyClientError || error instanceof Error
    ? error.message
    : fallback;
}

export default function ProductColorsAdminPage() {
  const { user } = useStaffSessionContext();
  const [items, setItems] = useState<ProductColorDto[]>([]);
  const [form, setForm] = useState<ColorFormState>(emptyColorForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canManageColors = user ? canManageProductColors(user) : false;

  const loadItems = async () => {
    setError(null);
    try {
      setItems(await listProductColorsClient());
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, "Impossible de charger les couleurs."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyColorForm());
  };

  const editItem = (item: ProductColorDto) => {
    setEditingId(item.id);
    setForm({
      key: item.key,
      label: item.label,
      value: item.value,
    });
  };

  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageColors) {
      toast.error("Vous n'avez pas la permission de modifier les couleurs.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        value: normalizeHexInput(form.value),
      };

      if (editingId == null) {
        await createProductColorClient(payload);
      } else {
        await updateProductColorClient(editingId, payload);
      }

      toast.success("Couleur enregistrée.");
      resetForm();
      await loadItems();
    } catch (saveError: unknown) {
      toast.error(getErrorMessage(saveError, "Impossible d'enregistrer la couleur."));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (item: ProductColorDto) => {
    if (!canManageColors) {
      toast.error("Vous n'avez pas la permission de supprimer les couleurs.");
      return;
    }

    if (!window.confirm(`Supprimer "${item.label}" ?`)) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteProductColorClient(item.id);
      toast.success("Couleur supprimée.");
      await loadItems();
    } catch (deleteError: unknown) {
      toast.error(getErrorMessage(deleteError, "Impossible de supprimer la couleur."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Catalogue" title="Couleurs" icon={Palette} />

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
            canManageColors ? "grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]" : "grid gap-6"
          }
        >
          {canManageColors ? (
            <Panel
              pretitle={editingId == null ? "Nouvelle couleur" : "Modification"}
              title="Détails"
            >
              <form onSubmit={saveItem} className="grid gap-4">
                <PanelField id="product-color-label" label="Libellé">
                  <PanelInput
                    id="product-color-label"
                    fullWidth
                    value={form.label}
                    onChange={(event) => {
                      const label = event.target.value;
                      setForm((current) => ({
                        ...current,
                        label,
                        key:
                          current.key === "" || current.key === slugify(current.label)
                            ? slugify(label)
                            : current.key,
                      }));
                    }}
                  />
                </PanelField>
                <PanelField id="product-color-key" label="Clé">
                  <PanelInput
                    id="product-color-key"
                    fullWidth
                    value={form.key}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, key: event.target.value }))
                    }
                  />
                </PanelField>
                <PanelField id="product-color-value" label="Valeur">
                  <ColorHexField
                    id="product-color-value"
                    value={form.value}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        value,
                      }))
                    }
                  />
                </PanelField>
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

          <Panel pretitle={`${items.length} entrées`} title="Couleurs disponibles">
            <div className="grid gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-9 w-9 rounded-md border border-slate-300"
                      style={{ background: normalizeHexInput(item.value) }}
                    />
                    <div>
                      <p className="text-cobam-dark-blue font-semibold">{item.label}</p>
                      <p className="text-xs text-slate-500">
                        {item.key} · {item.value}
                      </p>
                    </div>
                  </div>
                  {canManageColors ? (
                    <div className="flex items-center gap-2">
                      <AnimatedUIButton
                        type="button"
                        size="sm"
                        variant="ghost"
                        icon="modify"
                        onClick={() => editItem(item)}
                      />
                      <AnimatedUIButton
                        type="button"
                        size="sm"
                        variant="ghost"
                        color="red"
                        icon="trash"
                        onClick={() => void deleteItem(item)}
                      />
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
