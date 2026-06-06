"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ImagePreview from "@/components/staff/media/importers/ImagePreview";
import MediaImageField from "@/components/staff/media/importers/media-image-field";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { StaffNotice, StaffPageHeader } from "@/components/staff/ui";
import TwoColumnsLayout from "@/components/staff/ui/TwoColumnsLayout";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { ProductCertificatesClientError } from "@/features/product-certificates/client";
import {
  createProductCertificateClient,
  deleteProductCertificateClient,
  listProductCertificatesClient,
  updateProductCertificateClient,
} from "@/features/product-certificates/client";
import type { ProductCertificateDto } from "@/features/product-certificates/types";
import { canManageProducts } from "@/features/products/access";
import { slugify } from "@/lib/slugify";

type CertificateFormState = {
  name: string;
  slug: string;
  description: string;
  imageMediaId: string;
};

function emptyCertificateForm(): CertificateFormState {
  return {
    name: "",
    slug: "",
    description: "",
    imageMediaId: "",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ProductCertificatesClientError || error instanceof Error
    ? error.message
    : fallback;
}

export default function ProductCertificatesAdminPage() {
  const { user } = useStaffSessionContext();
  const [items, setItems] = useState<ProductCertificateDto[]>([]);
  const [form, setForm] = useState<CertificateFormState>(emptyCertificateForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canManageCertificates = user ? canManageProducts(user) : false;

  const loadItems = async () => {
    setError(null);
    try {
      setItems(await listProductCertificatesClient());
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, "Impossible de charger les certificats."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyCertificateForm());
  };

  const editItem = (item: ProductCertificateDto) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
      imageMediaId: String(item.imageMediaId),
    });
  };

  const saveItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageCertificates) {
      toast.error("Vous n'avez pas la permission de modifier les certificats.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description.trim() ? form.description.trim() : null,
        imageMediaId: Number(form.imageMediaId),
      };

      if (editingId == null) {
        await createProductCertificateClient(payload);
      } else {
        await updateProductCertificateClient(editingId, payload);
      }

      toast.success("Certificat enregistre.");
      resetForm();
      await loadItems();
    } catch (saveError: unknown) {
      toast.error(getErrorMessage(saveError, "Impossible d'enregistrer le certificat."));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (item: ProductCertificateDto) => {
    if (!canManageCertificates) {
      toast.error("Vous n'avez pas la permission de supprimer les certificats.");
      return;
    }

    if (!window.confirm(`Supprimer "${item.name}" ?`)) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteProductCertificateClient(item.id);
      toast.success("Certificat supprime.");
      if (editingId === item.id) {
        resetForm();
      }
      await loadItems();
    } catch (deleteError: unknown) {
      toast.error(getErrorMessage(deleteError, "Impossible de supprimer le certificat."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Catalogue" title="Certificats" icon={BadgeCheck} />

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
        <TwoColumnsLayout>
          <Panel
            className="max-w-none"
            pretitle={editingId == null ? "Nouveau certificat" : "Modification"}
            title="Details"
          >
            {canManageCertificates ? (
              <form onSubmit={saveItem} className="grid gap-4">
                <PanelField id="product-certificate-name" label="Nom">
                  <PanelInput
                    id="product-certificate-name"
                    fullWidth
                    value={form.name}
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
                <PanelField id="product-certificate-slug" label="Slug">
                  <PanelInput
                    id="product-certificate-slug"
                    fullWidth
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, slug: slugify(event.target.value) }))
                    }
                  />
                </PanelField>
                <PanelField id="product-certificate-description" label="Description">
                  <textarea
                    id="product-certificate-description"
                    className="text-cobam-dark-blue focus:border-cobam-water-blue focus:ring-cobam-water-blue/15 min-h-28 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm leading-6 transition outline-none focus:ring-2"
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </PanelField>
                <MediaImageField
                  label="Image"
                  description="Choisissez le visuel du certificat dans la mediatheque."
                  dialogTitle="Choisir une image de certificat"
                  dialogDescription="Selectionnez ou importez une image depuis la mediatheque."
                  mediaId={form.imageMediaId ? Number(form.imageMediaId) : null}
                  onChange={(mediaId) =>
                    setForm((current) => ({
                      ...current,
                      imageMediaId: mediaId == null ? "" : String(mediaId),
                    }))
                  }
                  emptyLabel="Aucune image de certificat selectionnee."
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
            ) : (
              <StaffNotice variant="warning" title="Lecture seule">
                Vous pouvez consulter les certificats, mais pas les modifier.
              </StaffNotice>
            )}
          </Panel>

          <Panel
            className="max-w-none min-w-0"
            pretitle={`${items.length} entrees`}
            title="Certificats disponibles"
          >
            {items.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500">
                Aucun certificat ajoute pour le moment.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"
                  >
                    <div className="relative aspect-[4/3] bg-slate-50">
                      <ImagePreview
                        alt={item.imageAltText ?? item.name}
                        mediaId={item.imageMediaId}
                        className="h-full w-full rounded-none"
                        imageClassName="object-contain p-5"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-4">
                      <div className="min-w-0">
                        <p className="text-cobam-dark-blue truncate font-semibold">{item.name}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.slug} - {item.productCount} produit
                          {item.productCount > 1 ? "s" : ""}
                        </p>
                        {item.description ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      {canManageCertificates ? (
                        <div className="mt-auto flex items-center justify-end gap-2">
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
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </TwoColumnsLayout>
      ) : null}
    </div>
  );
}
