"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import MediaImageField from "@/components/staff/media/importers/media-image-field";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import PanelSelect from "@/components/staff/ui/PanelSelect";
import {
  StaffBadge,
  StaffNotice,
  StaffPageHeader,
  StaffStateCard,
} from "@/components/staff/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { Textarea } from "@/components/ui/textarea";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateBrands, canManageAnyBrands } from "@/features/brands/access";
import { useBrandEditor } from "@/features/brands/hooks/use-brand-editor";
import { slugifyBrandName } from "@/features/brands/slug";
import {
  BRAND_SHOWCASE_PLACEMENT_OPTIONS,
  getBrandShowcasePlacementLabel,
  type BrandShowcasePlacement,
} from "@/features/brands/types";

function getShowcaseBadge(placement: BrandShowcasePlacement) {
  switch (placement) {
    case "PARTNER":
      return {
        label: "Partenaire",
        color: "blue" as const,
        icon: "users" as const,
      };
    case "REFERENCE":
      return {
        label: "Reference",
        color: "indigo" as const,
        icon: "badge-check" as const,
      };
    case "NONE":
    default:
      return {
        label: "Aucune diffusion",
        color: "default" as const,
        icon: "close" as const,
      };
  }
}

function getProductUsageBadge(enabled: boolean) {
  return enabled
    ? {
        label: "Utilisable",
        color: "green" as const,
        icon: "check-circle" as const,
      }
    : {
        label: "Desactivee",
        color: "default" as const,
        icon: "pause" as const,
      };
}

export default function BrandEditPage() {
  return (
    <Suspense fallback={<BrandEditorLoading />}>
      <BrandEditPageContent />
    </Suspense>
  );
}

function BrandEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, isLoading: isAuthLoading } = useStaffSessionContext();

  const brandId = useMemo(() => {
    const raw = searchParams.get("id");
    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const mode = brandId ? "edit" : "create";
  const canCreateBrand = authUser ? canCreateBrands(authUser) : false;

  const {
    brand,
    form,
    isLoading,
    isSaving,
    isDeleting,
    error,
    notice,
    setField,
    save,
    remove,
  } = useBrandEditor(brandId);

  const previewSlug = useMemo(
    () => form.slug.trim() || slugifyBrandName(form.name),
    [form.name, form.slug],
  );
  const showcaseBadge = getShowcaseBadge(form.showcasePlacement);
  const productUsageBadge = getProductUsageBadge(form.isProductBrand);

  const canDelete =
    !!authUser &&
    !!brand &&
    (canManageAnyBrands(authUser) || brand.ownerUserId === authUser.id);

  useEffect(() => {
    if (notice) {
      toast.success(notice);
    }
  }, [notice]);

  useEffect(() => {
    if (error && brand) {
      toast.error(error);
    }
  }, [brand, error]);

  const handleNameChange = (value: string) => {
    const nextName = value;
    const shouldRegenerateSlug =
      form.slug === "" || form.slug === slugifyBrandName(form.name);

    setField("name", nextName);

    if (shouldRegenerateSlug) {
      setField("slug", slugifyBrandName(nextName));
    }
  };

  const handleSave = async () => {
    if (mode === "create" && !canCreateBrand) {
      toast.error("Acces refuse");
      return;
    }

    if (!form.name.trim() || !previewSlug) {
      toast.error("Nom et slug requis");
      return;
    }

    const saved = await save();

    if (saved && mode === "create") {
      router.replace(`/espace/staff/gestion/marques/edit?id=${saved.id}`);
    }
  };

  const handleDelete = async () => {
    if (!brand) {
      return;
    }

    const confirmed = window.confirm(`Supprimer la marque ${brand.name} ?`);
    if (!confirmed) {
      return;
    }

    const deleted = await remove();
    if (deleted) {
      toast.success("Marque supprimee.");
      router.replace("/espace/staff/gestion/marques");
    }
  };

  if (isAuthLoading && !authUser) {
    return <BrandEditorLoading />;
  }

  if (mode === "create" && !canCreateBrand) {
    return (
      <StaffStateCard
        variant="forbidden"
        title="Acces refuse"
        description="Vous n'avez pas l'autorisation de creer une marque."
        actionHref="/espace/staff/gestion/marques"
        actionLabel="Retour aux marques"
      />
    );
  }

  if (isLoading) {
    return <BrandEditorLoading />;
  }

  if (error && mode === "edit" && !brand) {
    return (
      <StaffStateCard
        title="Erreur"
        description={error}
        actionHref="/espace/staff/gestion/marques"
        actionLabel="Retour aux marques"
      />
    );
  }

  if (mode === "edit" && !brand) {
    return null;
  }

  return (
    <div className="space-y-6">
      <StaffPageHeader
        backHref="/espace/staff/gestion/marques"
        eyebrow="Marques"
        title={mode === "edit" && brand ? brand.name : "Creation d'une marque"}
        icon={BadgeCheck}
      />

      {error ? (
        <StaffNotice
          variant="error"
          title={
            mode === "edit" ? "Modification impossible" : "Creation impossible"
          }
        >
          {error}
        </StaffNotice>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel
          pretitle="Edition"
          title="Informations de la marque"
          description={
            mode === "edit"
              ? "Le slug est utilise pour les futures integrations publiques et internes."
              : "Renseignez les informations principales de cette marque."
          }
        >
          <div className="grid gap-6">
            <PanelField id="brand-name" label="Nom">
              <PanelInput
                id="brand-name"
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Geberit"
                fullWidth
              />
            </PanelField>

            <PanelField id="brand-description" label="Description">
              <Textarea
                id="brand-description"
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                rows={mode === "edit" ? 8 : 7}
                placeholder="Quelques lignes pour presenter la marque..."
                className="min-h-[180px] rounded-2xl border-slate-300 px-4 py-3 text-base"
              />
            </PanelField>

            <div className="grid gap-6 lg:grid-cols-2">
              <PanelField
                id="brand-showcase-placement"
                label="Diffusion publique"
                hint="Prepare si la marque doit plus tard remonter comme partenaire, comme reference, ou rester interne."
              >
                <PanelSelect
                  value={form.showcasePlacement}
                  onValueChange={(value) =>
                    setField("showcasePlacement", value as BrandShowcasePlacement)
                  }
                  options={BRAND_SHOWCASE_PLACEMENT_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  fullWidth
                />
              </PanelField>

              <PanelField
                id="brand-is-product-brand"
                label="Usage dans les produits"
                hint="Quand cette option est active, la marque peut etre choisie dans les formulaires produit."
              >
                <label
                  htmlFor="brand-is-product-brand"
                  className="flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-3"
                >
                  <Checkbox
                    id="brand-is-product-brand"
                    checked={form.isProductBrand}
                    onCheckedChange={(checked) =>
                      setField("isProductBrand", checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-cobam-dark-blue">
                      Autoriser cette marque pour le catalogue produit
                    </p>
                    <p className="text-sm leading-6 text-slate-500">
                      Desactivez-la pour garder la marque dans le back-office sans
                      la proposer dans les produits.
                    </p>
                  </div>
                </label>
              </PanelField>
            </div>

            <div className="flex justify-end">
              <AnimatedUIButton
                type="button"
                onClick={() => void handleSave()}
                loading={isSaving}
                loadingText={mode === "edit" ? "Enregistrement..." : "Creation..."}
                variant="primary"
                icon={mode === "edit" ? "save" : "plus"}
              >
                {mode === "edit" ? "Enregistrer" : "Creer la marque"}
              </AnimatedUIButton>
            </div>
          </div>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel
            pretitle="Resume"
            title="Resume"
            description={
              mode === "edit"
                ? "Vue rapide de quelques metadonnees utiles."
                : "Verifiez rapidement le rendu des informations."
            }
          >
            <div className="space-y-4">
              <MediaImageField
                aspectRatio="4:3"
                requireAspectRatio
                label="Logo"
                mediaId={form.logoMediaId}
                onChange={(value) => setField("logoMediaId", value)}
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Nom
                </p>
                <p className="mt-1 text-lg font-semibold text-cobam-dark-blue">
                  {form.name.trim() || "Nom de la marque"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Slug
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {previewSlug || "slug-de-la-marque"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Diffusion publique
                </p>
                <div className="mt-2">
                  <StaffBadge
                    size="md"
                    color={showcaseBadge.color}
                    icon={showcaseBadge.icon}
                  >
                    {showcaseBadge.label}
                  </StaffBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {getBrandShowcasePlacementLabel(form.showcasePlacement)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Catalogue produit
                </p>
                <div className="mt-2">
                  <StaffBadge
                    size="md"
                    color={productUsageBadge.color}
                    icon={productUsageBadge.icon}
                  >
                    {productUsageBadge.label}
                  </StaffBadge>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {form.isProductBrand
                    ? "La marque peut etre utilisee dans les produits."
                    : "La marque reste interne et n'est plus proposee dans les produits."}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Description
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {form.description.trim() || "Aucune description pour le moment."}
                </p>
              </div>

              {mode === "edit" && brand ? (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Creee le
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(brand.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Derniere mise a jour
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(brand.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </Panel>

          {mode === "edit" && canDelete ? (
            <Panel
              pretitle="Danger"
              title="Suppression"
              description="La suppression retire la marque de la liste staff."
            >
              <p className="text-sm leading-6 text-slate-500">
                Cette action marque la ressource comme supprimee pour les futurs
                ecrans du back-office.
              </p>
              <AnimatedUIButton
                type="button"
                onClick={() => void handleDelete()}
                loading={isDeleting}
                loadingText="Suppression..."
                variant="light"
                icon="delete"
                iconPosition="left"
                className="w-full border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100"
                textClassName="text-red-700"
                iconClassName="text-red-700"
              >
                Supprimer la marque
              </AnimatedUIButton>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BrandEditorLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <Loading />
      </div>
    </div>
  );
}
