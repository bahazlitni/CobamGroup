"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Paintbrush } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ImagePreview from "@/components/staff/media/importers/ImagePreview";
import MediaImageField from "@/components/staff/media/importers/media-image-field";
import ColorHexField, {
  normalizeHexInput,
} from "@/components/staff/ui/ColorHexField";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { StaffNotice, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import {
  createProductFinishClient,
  deleteProductFinishClient,
  listProductFinishesClient,
  ProductTaxonomyClientError,
  updateProductFinishClient,
} from "@/features/product-taxonomy/client";
import type { ProductFinishDto } from "@/features/product-taxonomy/types";
import { slugify } from "@/lib/slugify";

type FinishFormState = {
  key: string;
  label: string;
  color: string;
  imageMediaId: string;
};

function emptyFinishForm(): FinishFormState {
  return {
    key: "",
    label: "",
    color: "",
    imageMediaId: "",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ProductTaxonomyClientError || error instanceof Error
    ? error.message
    : fallback;
}

export default function ProductFinishesAdminPage() {
  const [items, setItems] = useState<ProductFinishDto[]>([]);
  const [form, setForm] = useState<FinishFormState>(emptyFinishForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    setError(null);
    try {
      setItems(await listProductFinishesClient());
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, "Impossible de charger les finitions."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyFinishForm());
  };

  const editItem = (item: ProductFinishDto) => {
    setEditingId(item.id);
    setForm({
      key: item.key,
      label: item.label,
      color: item.color ?? "",
      imageMediaId: item.imageMediaId == null ? "" : String(item.imageMediaId),
    });
  };

  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        key: form.key,
        label: form.label,
        color: form.color ? normalizeHexInput(form.color) : null,
        imageMediaId: form.imageMediaId ? Number(form.imageMediaId) : null,
      };

      if (editingId == null) {
        await createProductFinishClient(payload);
      } else {
        await updateProductFinishClient(editingId, payload);
      }

      toast.success("Finition enregistrée.");
      resetForm();
      await loadItems();
    } catch (saveError: unknown) {
      toast.error(
        getErrorMessage(saveError, "Impossible d'enregistrer la finition."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (item: ProductFinishDto) => {
    if (!window.confirm(`Supprimer "${item.label}" ?`)) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteProductFinishClient(item.id);
      toast.success("Finition supprimée.");
      await loadItems();
    } catch (deleteError: unknown) {
      toast.error(
        getErrorMessage(deleteError, "Impossible de supprimer la finition."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Catalogue" title="Finitions" icon={Paintbrush} />

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
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <Panel
            pretitle={editingId == null ? "Nouvelle finition" : "Modification"}
            title="Détails"
          >
            <form onSubmit={saveItem} className="grid gap-4">
              <PanelField id="product-finish-label" label="Libellé">
                <PanelInput
                  id="product-finish-label"
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
              <PanelField id="product-finish-key" label="Clé">
                <PanelInput
                  id="product-finish-key"
                  fullWidth
                  value={form.key}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, key: event.target.value }))
                  }
                />
              </PanelField>
              <PanelField id="product-finish-color" label="Couleur">
                <ColorHexField
                  id="product-finish-color"
                  value={form.color}
                  allowEmpty
                  onChange={(color) =>
                    setForm((current) => ({
                      ...current,
                      color,
                    }))
                  }
                />
              </PanelField>
              <MediaImageField
                label="Image de finition"
                description="Choisissez l'image qui représente cette finition dans la médiathèque."
                dialogTitle="Choisir une image de finition"
                dialogDescription="Sélectionnez ou importez une image depuis la médiathèque."
                mediaId={form.imageMediaId ? Number(form.imageMediaId) : null}
                onChange={(mediaId) =>
                  setForm((current) => ({
                    ...current,
                    imageMediaId: mediaId == null ? "" : String(mediaId),
                  }))
                }
                emptyLabel="Aucune image de finition sélectionnée."
                previewClassName="h-24 w-24 rounded-lg"
              />
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

          <Panel pretitle={`${items.length} entrées`} title="Finitions disponibles">
            <div className="grid gap-2">
              {items.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <ImagePreview
                        alt={item.label}
                        mediaId={item.imageMediaId}
                        className="h-9 w-9 rounded-md"
                        fallback={
                          <span
                            className="block h-9 w-9"
                            style={
                              item.color
                                ? { background: normalizeHexInput(item.color) }
                                : undefined
                            }
                          />
                        }
                      />
                      <div>
                        <p className="font-semibold text-cobam-dark-blue">
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.key}
                          {item.color ? ` · ${item.color}` : ""}
                          {item.imageMediaId ? ` · média #${item.imageMediaId}` : ""}
                        </p>
                      </div>
                    </div>
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
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
