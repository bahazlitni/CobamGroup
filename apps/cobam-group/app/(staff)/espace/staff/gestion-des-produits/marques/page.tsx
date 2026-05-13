"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ImagePreview from "@/components/staff/media/importers/ImagePreview";
import MediaImageField from "@/components/staff/media/importers/media-image-field";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { StaffNotice, StaffPageHeader } from "@/components/staff/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import {
  createOrganizationClient,
  deleteOrganizationClient,
  listOrganizationsClient,
  OrganizationClientError,
  updateOrganizationClient,
} from "@/features/organizations/client";
import type { OrganizationDto, OrganizationInput } from "@/features/organizations/types";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slugify";

type OrganizationFormState = {
  slug: string;
  name: string;
  description: string;
  logoMediaId: string;
  isProductBrand: boolean;
  isReference: boolean;
  isPartner: boolean;
};

function emptyOrganizationForm(): OrganizationFormState {
  return {
    slug: "",
    name: "",
    description: "",
    logoMediaId: "",
    isProductBrand: true,
    isReference: false,
    isPartner: false,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof OrganizationClientError || error instanceof Error
    ? error.message
    : fallback;
}

function toInput(form: OrganizationFormState): OrganizationInput {
  return {
    slug: form.slug,
    name: form.name,
    description: form.description.trim() || null,
    logoMediaId: form.logoMediaId ? Number(form.logoMediaId) : null,
    isProductBrand: form.isProductBrand,
    isReference: form.isReference,
    isPartner: form.isPartner,
  };
}

function FlagCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
      <span>{label}</span>
    </label>
  );
}

function FlagPill({ children, enabled }: { children: string; enabled: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        enabled
          ? "border-cobam-water-blue/30 bg-cobam-water-blue/10 text-cobam-dark-blue"
          : "border-slate-200 bg-slate-50 text-slate-400",
      )}
    >
      {children}
    </span>
  );
}

export default function ProductBrandsAdminPage() {
  const [items, setItems] = useState<OrganizationDto[]>([]);
  const [form, setForm] = useState<OrganizationFormState>(emptyOrganizationForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    setError(null);
    try {
      setItems(await listOrganizationsClient());
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, "Impossible de charger les marques."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyOrganizationForm());
  };

  const editItem = (item: OrganizationDto) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      name: item.name,
      description: item.description ?? "",
      logoMediaId: item.logoMediaId == null ? "" : String(item.logoMediaId),
      isProductBrand: item.isProductBrand,
      isReference: item.isReference,
      isPartner: item.isPartner,
    });
  };

  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const payload = toInput(form);

      if (editingId == null) {
        await createOrganizationClient(payload);
      } else {
        await updateOrganizationClient(editingId, payload);
      }

      toast.success("Marque enregistree.");
      resetForm();
      await loadItems();
    } catch (saveError: unknown) {
      toast.error(getErrorMessage(saveError, "Impossible d'enregistrer la marque."));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (item: OrganizationDto) => {
    if (isSaving || !window.confirm(`Supprimer "${item.name}" ?`)) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteOrganizationClient(item.id);
      toast.success("Marque supprimee.");
      await loadItems();
    } catch (deleteError: unknown) {
      toast.error(getErrorMessage(deleteError, "Impossible de supprimer la marque."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Catalogue" title="Marques" icon={Building2} />

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
        <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
          <Panel pretitle={editingId == null ? "Nouvelle marque" : "Modification"} title="Details">
            <form onSubmit={saveItem} className="grid gap-4">
              <PanelField id="organization-name" label="Nom">
                <PanelInput
                  id="organization-name"
                  fullWidth
                  value={form.name}
                  disabled={isSaving}
                  onChange={(event) => {
                    const name = event.target.value;
                    setForm((current) => ({
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

              <PanelField id="organization-slug" label="Slug">
                <PanelInput
                  id="organization-slug"
                  fullWidth
                  value={form.slug}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: slugify(event.target.value) }))
                  }
                />
              </PanelField>

              <PanelField id="organization-description" label="Description">
                <Textarea
                  id="organization-description"
                  value={form.description}
                  disabled={isSaving}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </PanelField>

              <MediaImageField
                label="Logo"
                description="Choisissez le logo depuis la mediatheque."
                dialogTitle="Choisir un logo"
                dialogDescription="Selectionnez ou importez une image de logo."
                mediaId={form.logoMediaId ? Number(form.logoMediaId) : null}
                disabled={isSaving}
                onChange={(mediaId) =>
                  setForm((current) => ({
                    ...current,
                    logoMediaId: mediaId == null ? "" : String(mediaId),
                  }))
                }
                emptyLabel="Aucun logo sélectionné."
                previewClassName="h-24 w-24 rounded-lg"
                previewImageClassName="object-contain bg-white"
              />

              <div className="grid gap-2 sm:grid-cols-3">
                <FlagCheckbox
                  id="organization-is-product-brand"
                  label="Marque produit"
                  checked={form.isProductBrand}
                  onChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      isProductBrand: checked,
                    }))
                  }
                />
                <FlagCheckbox
                  id="organization-is-reference"
                  label="Reference"
                  checked={form.isReference}
                  onChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      isReference: checked,
                    }))
                  }
                />
                <FlagCheckbox
                  id="organization-is-partner"
                  label="Partenaire"
                  checked={form.isPartner}
                  onChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      isPartner: checked,
                    }))
                  }
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <AnimatedUIButton type="submit" icon="save" loading={isSaving} disabled={isSaving}>
                  {editingId == null ? "Ajouter" : "Enregistrer"}
                </AnimatedUIButton>
                {editingId != null ? (
                  <AnimatedUIButton
                    type="button"
                    variant="ghost"
                    icon="close"
                    onClick={resetForm}
                    disabled={isSaving}
                  >
                    Annuler
                  </AnimatedUIButton>
                ) : null}
              </div>
            </form>
          </Panel>

          <Panel pretitle={`${items.length} entrees`} title="Marques disponibles">
            <div className="grid gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ImagePreview
                      alt={item.name}
                      mediaId={item.logoMediaId}
                      className="h-10 w-10 rounded-md"
                      imageClassName="object-contain bg-white"
                    />
                    <div className="min-w-0">
                      <p className="text-cobam-dark-blue truncate font-semibold">{item.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {item.slug}
                        {item.logoMediaId ? ` - media #${item.logoMediaId}` : ""}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <FlagPill enabled={item.isProductBrand}>Marque produit</FlagPill>
                        <FlagPill enabled={item.isReference}>Reference</FlagPill>
                        <FlagPill enabled={item.isPartner}>Partenaire</FlagPill>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AnimatedUIButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      icon="modify"
                      aria-label={`Modifier ${item.name}`}
                      onClick={() => editItem(item)}
                      disabled={isSaving}
                    />
                    <AnimatedUIButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      color="red"
                      icon="trash"
                      aria-label={`Supprimer ${item.name}`}
                      onClick={() => void deleteItem(item)}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
