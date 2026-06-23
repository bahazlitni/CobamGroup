"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProductsPickerGrid from "@/components/staff/products/ProductsPickerGrid";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import {
  DescriptionSEOTextArea,
  StaffImageImporter,
  StaffPageHeader,
  StaffStateCard,
} from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { Textarea } from "@/components/ui/textarea";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProducts, canManageProducts } from "@/features/products/access";
import {
  groupExistingProductsIntoFamilyClient,
  ProductsClientError,
} from "@/features/products/client";
import type { ProductFamilyGroupingCandidateDto } from "@/features/products/types";
import { slugify } from "@/lib/slugify";

const TITLE_SEO_MAX_LENGTH = 60;

function truncateTitleSeo(value: string) {
  return value.slice(0, TITLE_SEO_MAX_LENGTH);
}

function shouldSyncFamilyTitleSeo(currentTitleSeo: string, currentName: string) {
  const title = currentTitleSeo.trim();
  return title.length === 0 || title === truncateTitleSeo(currentName);
}

type GroupingFormState = {
  name: string;
  slug: string;
  titleSeo: string;
  description: string;
  descriptionSeo: string;
  mainImageMediaId: number | null;
};

export default function ProductFamilyGroupingPage() {
  const router = useRouter();
  const { user } = useStaffSessionContext();
  const canGroup = user ? canCreateProducts(user) && canManageProducts(user) : false;
  const [form, setForm] = useState<GroupingFormState>({
    name: "",
    slug: "",
    titleSeo: "",
    description: "",
    descriptionSeo: "",
    mainImageMediaId: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductFamilyGroupingCandidateDto[]>([]);
  const canSubmit =
    form.name.trim().length > 0 &&
    form.slug.trim().length > 0 &&
    form.titleSeo.trim().length > 0 &&
    form.titleSeo.trim().length <= TITLE_SEO_MAX_LENGTH &&
    selectedProducts.length >= 2;

  const handleCreate = async () => {
    if (!canSubmit) {
      toast.error("Complétez la famille et sélectionnez au moins deux produits.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await groupExistingProductsIntoFamilyClient({
        name: form.name.trim(),
        slug: form.slug.trim(),
        titleSeo: form.titleSeo.trim(),
        description: form.description.trim() || null,
        descriptionSeo: form.descriptionSeo.trim() || null,
        mainImageMediaId: form.mainImageMediaId,
        productIds: selectedProducts.map((product) => product.id),
      });

      toast.success("Famille créée depuis les produits sélectionnés.");
      router.replace(`/espace/staff/gestion-des-produits/familles/edit?id=${result.id}`);
    } catch (err: unknown) {
      toast.error(
        err instanceof ProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de créer la famille.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!canGroup) {
    return (
      <StaffStateCard
        title="Accès refusé"
        description="Le groupement nécessite les droits de création et de modification des produits."
      />
    );
  }

  return (
    <div className="space-y-6">
      <StaffPageHeader
        backHref="/espace/staff/gestion-des-produits/familles/new"
        eyebrow="Produits"
        title="Créer depuis des produits existants"
        icon={PackagePlus}
      >
        <AnimatedUIButton
          type="button"
          variant="primary"
          icon="check"
          iconPosition="left"
          onClick={() => void handleCreate()}
          loading={isSaving}
          loadingText="Création..."
          disabled={!canSubmit}
        >
          Créer la famille
        </AnimatedUIButton>
      </StaffPageHeader>

      <div className="grid gap-6 xl:grid-cols-[minmax(340px,0.72fr)_minmax(520px,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto xl:pr-1">
          <Panel title="Métadonnées" className="!max-w-none">
            <div className="grid gap-5 lg:grid-cols-2">
              <PanelField id="group-family-name" label="Nom">
                <PanelInput
                  id="group-family-name"
                  fullWidth
                  value={form.name}
                  onChange={(event) => {
                    const nextName = event.target.value;
                    setForm((current) => ({
                      ...current,
                      name: nextName,
                      slug: slugify(nextName),
                      titleSeo: shouldSyncFamilyTitleSeo(current.titleSeo, current.name)
                        ? truncateTitleSeo(nextName)
                        : current.titleSeo,
                    }));
                  }}
                />
              </PanelField>
              <PanelField id="group-family-slug" label="Slug">
                <PanelInput
                  id="group-family-slug"
                  fullWidth
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: slugify(event.target.value),
                    }))
                  }
                />
              </PanelField>
            </div>

            <PanelField
              id="group-family-title-seo"
              label="Titre SEO"
              hint={`${form.titleSeo.length}/${TITLE_SEO_MAX_LENGTH}`}
            >
              <PanelInput
                id="group-family-title-seo"
                fullWidth
                maxLength={TITLE_SEO_MAX_LENGTH}
                value={form.titleSeo}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    titleSeo: truncateTitleSeo(event.target.value),
                  }))
                }
              />
            </PanelField>

            <PanelField id="group-family-description" label="Description">
              <Textarea
                id="group-family-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Description de la famille..."
              />
            </PanelField>

            <PanelField id="group-family-description-seo" label="Description SEO">
              <DescriptionSEOTextArea
                id="group-family-description-seo"
                value={form.descriptionSeo}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, descriptionSeo: value }))
                }
              />
            </PanelField>

            <StaffImageImporter
              label="Image principale"
              description="Optionnel : cette image représente la famille dans le catalogue."
              dialogTitle="Choisir l'image principale"
              dialogDescription="Sélectionnez une image existante ou importez-en une nouvelle pour cette famille."
              mediaId={form.mainImageMediaId}
              onChange={(mediaId) =>
                setForm((current) => ({ ...current, mainImageMediaId: mediaId }))
              }
            />
          </Panel>
        </aside>

        <section className="min-h-0 xl:h-[calc(100vh-9rem)] xl:overflow-y-auto xl:pr-2">
          <Panel
            title="Produits de la famille"
            className="!max-w-none"
            allowOverflow
          >
            <ProductsPickerGrid
              items={selectedProducts}
              onChange={setSelectedProducts}
              title=""
              pickerTitle="Ajouter des produits"
              pickerDescription="Sélectionnez un ou plusieurs produits simples non rattachés à une famille."
              addButtonLabel="Ajouter un produit"
              excludeVariants
              ungroupedOnly
            />
          </Panel>
        </section>
      </div>
    </div>
  );
}
