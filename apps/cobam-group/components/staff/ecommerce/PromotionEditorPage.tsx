"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgePercent, TicketPercent } from "lucide-react";
import ProductMediaGrid from "@/components/staff/products/ProductMediaGrid";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { StaffBadge, StaffNotice, StaffPageHeader, StaffSelect } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import {
  createEcommerceCouponAdminClient,
  createEcommercePromotionAdminClient,
  deleteEcommerceCouponAdminClient,
  deleteEcommercePromotionAdminClient,
  listEcommercePromotionsAdminClient,
  updateEcommerceCouponAdminClient,
  updateEcommercePromotionAdminClient,
} from "@/features/ecommerce-admin/client";
import type { ProductMediaDto } from "@/features/products/types";
import type {
  EcommerceCouponAdminItem,
  EcommerceCouponInput,
  EcommercePromotionAdminItem,
  EcommercePromotionInput,
  EcommercePromotionScopeOption,
  EcommercePromotionsAdminDto,
} from "@/features/ecommerce-admin/types";
import { slugify } from "@/lib/slugify";

type PromotionFormState = {
  name: string;
  displayName: string;
  slug: string;
  description: string;
  bannerMedia: ProductMediaDto | null;
  status: string;
  discountType: string;
  discountValue: string;
  minimumSubtotalTtc: string;
  usageLimit: string;
  startsAt: string;
  endsAt: string;
  productIds: string[];
  categoryIds: string[];
  brandIds: string[];
};

type CouponFormState = {
  id: string | null;
  code: string;
  isActive: boolean;
  usageLimit: string;
  usageLimitPerCustomer: string;
  startsAt: string;
  endsAt: string;
  customerIds: string[];
};

const promotionsBasePath = "/espace/staff/e-commerce/promotions";

const emptyPromotionForm: PromotionFormState = {
  name: "",
  displayName: "",
  slug: "",
  description: "",
  bannerMedia: null,
  status: "DRAFT",
  discountType: "PERCENT",
  discountValue: "10",
  minimumSubtotalTtc: "",
  usageLimit: "",
  startsAt: "",
  endsAt: "",
  productIds: [],
  categoryIds: [],
  brandIds: [],
};

const emptyCouponForm: CouponFormState = {
  id: null,
  code: "",
  isActive: true,
  usageLimit: "",
  usageLimitPerCustomer: "",
  startsAt: "",
  endsAt: "",
  customerIds: [],
};

const discountTypeOptions = [
  { value: "PERCENT", label: "Pourcentage" },
  { value: "FIXED_AMOUNT", label: "Montant fixe" },
  { value: "FREE_SHIPPING", label: "Livraison offerte" },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function nullableNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numberValue = Number(trimmed);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function promotionToForm(promotion: EcommercePromotionAdminItem): PromotionFormState {
  return {
    name: promotion.name,
    displayName: promotion.displayName,
    slug: promotion.slug,
    description: promotion.description ?? "",
    bannerMedia: promotion.bannerMedia,
    status: promotion.status,
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    minimumSubtotalTtc: promotion.minimumSubtotalTtc ?? "",
    usageLimit: promotion.usageLimit == null ? "" : String(promotion.usageLimit),
    startsAt: toDateInputValue(promotion.startsAt),
    endsAt: toDateInputValue(promotion.endsAt),
    productIds: promotion.productScopeIds,
    categoryIds: promotion.categoryScopeIds,
    brandIds: promotion.brandScopeIds,
  };
}

function formToPromotionInput(form: PromotionFormState): EcommercePromotionInput {
  return {
    name: form.name,
    displayName: form.displayName || form.name,
    slug: form.slug || slugify(form.displayName || form.name),
    description: form.description || null,
    bannerMediaId: form.bannerMedia?.id ?? null,
    status: form.status,
    discountType: form.discountType,
    discountValue: form.discountType === "FREE_SHIPPING" ? "0" : form.discountValue,
    minimumSubtotalTtc: form.minimumSubtotalTtc || null,
    usageLimit: nullableNumber(form.usageLimit),
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
    productIds: form.productIds,
    categoryIds: form.categoryIds,
    brandIds: form.brandIds,
  };
}

function couponToForm(coupon: EcommerceCouponAdminItem): CouponFormState {
  return {
    id: coupon.id,
    code: coupon.code,
    isActive: coupon.isActive,
    usageLimit: coupon.usageLimit == null ? "" : String(coupon.usageLimit),
    usageLimitPerCustomer:
      coupon.usageLimitPerCustomer == null ? "" : String(coupon.usageLimitPerCustomer),
    startsAt: toDateInputValue(coupon.startsAt),
    endsAt: toDateInputValue(coupon.endsAt),
    customerIds: coupon.customerIds ?? [],
  };
}

function formToCouponInput(form: CouponFormState): EcommerceCouponInput {
  return {
    code: form.code,
    isActive: form.isActive,
    usageLimit: nullableNumber(form.usageLimit),
    usageLimitPerCustomer: nullableNumber(form.usageLimitPerCustomer),
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
    customerIds: form.customerIds,
  };
}

function ScopeSelector({
  title,
  hint,
  options,
  selectedIds,
  onChange,
}: {
  title: string;
  hint: string;
  options: EcommercePromotionScopeOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return options;

    return options.filter((option) =>
      `${option.label} ${option.detail ?? ""}`.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }

    onChange([...selectedIds, id]);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-cobam-dark-blue text-sm font-semibold">{title}</p>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
        <StaffBadge color="#14202e" size="sm">
          {selectedIds.length} sélection
        </StaffBadge>
      </div>
      <PanelInput
        fullWidth
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filtrer..."
        className="mt-3"
      />
      <div className="mt-3 max-h-52 space-y-2 overflow-auto pr-1">
        {filteredOptions.map((option) => (
          <label
            key={option.id}
            className="hover:border-cobam-water-blue/40 flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm transition-colors"
          >
            <input
              type="checkbox"
              className="accent-cobam-water-blue mt-1 h-4 w-4 rounded border-slate-300"
              checked={selectedSet.has(option.id)}
              onChange={() => toggle(option.id)}
            />
            <span>
              <span className="block font-medium text-slate-800">{option.label}</span>
              {option.detail ? (
                <span className="block text-xs text-slate-500">{option.detail}</span>
              ) : null}
            </span>
          </label>
        ))}
        {filteredOptions.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-center text-sm text-slate-500">
            Aucun resultat.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function PromotionEditorPage({ promotionId }: { promotionId?: string }) {
  const router = useRouter();
  const [data, setData] = useState<EcommercePromotionsAdminDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [promotionForm, setPromotionForm] = useState<PromotionFormState>(emptyPromotionForm);
  const [couponForm, setCouponForm] = useState<CouponFormState>(emptyCouponForm);
  const [isSavingPromotion, setIsSavingPromotion] = useState(false);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const selectedPromotion = useMemo(
    () => data?.items.find((promotion) => promotion.id === promotionId) ?? null,
    [data?.items, promotionId],
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      setData(await listEcommercePromotionsAdminClient());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!promotionId) {
      setPromotionForm(emptyPromotionForm);
      setCouponForm(emptyCouponForm);
      return;
    }

    if (selectedPromotion) {
      setPromotionForm(promotionToForm(selectedPromotion));
      setCouponForm(emptyCouponForm);
    }
  }, [promotionId, selectedPromotion]);

  const handleSavePromotion = async () => {
    setIsSavingPromotion(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const input = formToPromotionInput(promotionForm);

      if (selectedPromotion) {
        await updateEcommercePromotionAdminClient(selectedPromotion.id, input);
        setActionMessage("Promotion mise à jour.");
        await load();
      } else {
        const created = await createEcommercePromotionAdminClient(input);
        setActionMessage("Promotion creee.");
        router.replace(`${promotionsBasePath}/${created.id}`);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setIsSavingPromotion(false);
    }
  };

  const handleDeletePromotion = async () => {
    if (!selectedPromotion) return;

    setIsSavingPromotion(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await deleteEcommercePromotionAdminClient(selectedPromotion.id);
      router.replace(promotionsBasePath);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Operation impossible.");
      setIsSavingPromotion(false);
    }
  };

  const handleSaveCoupon = async () => {
    if (!selectedPromotion) return;

    setIsSavingCoupon(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const input = formToCouponInput(couponForm);

      if (couponForm.id) {
        await updateEcommerceCouponAdminClient(selectedPromotion.id, couponForm.id, input);
        setActionMessage("Coupon mis a jour.");
      } else {
        await createEcommerceCouponAdminClient(selectedPromotion.id, input);
        setActionMessage("Coupon cree.");
      }

      setCouponForm(emptyCouponForm);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Coupon impossible a enregistrer.");
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!selectedPromotion) return;

    setIsSavingCoupon(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await deleteEcommerceCouponAdminClient(selectedPromotion.id, couponId);
      setCouponForm(emptyCouponForm);
      setActionMessage("Coupon supprime ou desactive.");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Operation coupon impossible.");
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const options = data?.options ?? { categories: [], brands: [], products: [], customers: [] };
  const isNew = !promotionId;
  const notFound = !isNew && !isLoading && !loadError && !selectedPromotion;

  const updatePromotionName = (name: string) => {
    setPromotionForm((current) => {
      const shouldSyncDisplayName =
        current.displayName === "" || current.displayName === current.name;
      const previousSlugBase = current.displayName || current.name;
      const shouldSyncSlug =
        current.slug === "" || current.slug === slugify(previousSlugBase);
      const displayName = shouldSyncDisplayName ? name : current.displayName;

      return {
        ...current,
        name,
        displayName,
        slug: shouldSyncSlug ? slugify(displayName || name) : current.slug,
      };
    });
  };

  const updatePromotionDisplayName = (displayName: string) => {
    setPromotionForm((current) => {
      const previousSlugBase = current.displayName || current.name;
      const shouldSyncSlug =
        current.slug === "" || current.slug === slugify(previousSlugBase);

      return {
        ...current,
        displayName,
        slug: shouldSyncSlug ? slugify(displayName || current.name) : current.slug,
      };
    });
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="E-commerce"
        title={isNew ? "Nouvelle promotion" : (selectedPromotion?.name ?? "Promotion")}
        icon={BadgePercent}
        status={
          selectedPromotion ? (
            <StaffBadge color="#0a8dc1">{selectedPromotion.status}</StaffBadge>
          ) : (
            <StaffBadge color="#14202e">Brouillon</StaffBadge>
          )
        }
        actions={
          <AnimatedUIButton
            href={promotionsBasePath}
            variant="outline"
            icon="arrow-left"
            iconPosition="left"
          >
            Liste des promotions
          </AnimatedUIButton>
        }
      />

      {loadError ? (
        <StaffNotice variant="error" title="Erreur de chargement">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{loadError}</span>
            <AnimatedUIButton
              type="button"
              size="sm"
              variant="outline"
              icon="restart"
              iconPosition="left"
              onClick={() => void load()}
            >
              Réessayer
            </AnimatedUIButton>
          </div>
        </StaffNotice>
      ) : null}

      {notFound ? (
        <StaffNotice variant="warning" title="Promotion introuvable">
          Cette promotion est introuvable ou votre compte ne dispose pas de cet acces.
        </StaffNotice>
      ) : null}

      {actionError ? (
        <StaffNotice variant="error" title="Action impossible">
          {actionError}
        </StaffNotice>
      ) : null}
      {actionMessage ? (
        <StaffNotice variant="success" title="Operation effectuee">
          {actionMessage}
        </StaffNotice>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
        <Panel
          pretitle={isNew ? "Creation" : "Edition"}
          title={isNew ? "Creer une promotion" : "Parametres de promotion"}
          description="Definissez la remise, les dates et la portee. Une portee vide signifie tout le catalogue."
          className="max-w-none"
          allowOverflow
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <PanelField id="promotion-name" label="Nom">
              <PanelInput
                id="promotion-name"
                fullWidth
                value={promotionForm.name}
                onChange={(event) => updatePromotionName(event.target.value)}
                placeholder="Promo showroom ete"
              />
            </PanelField>
            <PanelField id="promotion-display-name" label="Nom public">
              <PanelInput
                id="promotion-display-name"
                fullWidth
                value={promotionForm.displayName}
                onChange={(event) => updatePromotionDisplayName(event.target.value)}
                placeholder="Offres showroom ete"
              />
            </PanelField>
            <PanelField id="promotion-slug" label="Slug public">
              <div className="flex gap-2">
                <PanelInput
                  id="promotion-slug"
                  fullWidth
                  value={promotionForm.slug}
                  onChange={(event) =>
                    setPromotionForm((current) => ({
                      ...current,
                      slug: slugify(event.target.value),
                    }))
                  }
                  placeholder="offres-showroom-ete"
                />
                <AnimatedUIButton
                  type="button"
                  variant="outline"
                  icon="restart"
                  className="shrink-0"
                  onClick={() =>
                    setPromotionForm((current) => ({
                      ...current,
                      slug: slugify(current.displayName || current.name),
                    }))
                  }
                >
                  Générer
                </AnimatedUIButton>
              </div>
            </PanelField>
            <PanelField id="promotion-status" label="Statut">
              <StaffSelect
                id="promotion-status"
                value={promotionForm.status}
                onValueChange={(status) => setPromotionForm((current) => ({ ...current, status }))}
                options={[
                  { value: "DRAFT", label: "Brouillon" },
                  { value: "ACTIVE", label: "Active" },
                  { value: "PAUSED", label: "En pause" },
                  { value: "EXPIRED", label: "Expiree" },
                  { value: "ARCHIVED", label: "Archivee" },
                ]}
                fullWidth
              />
            </PanelField>
            <PanelField id="promotion-discount-type" label="Type de remise">
              <StaffSelect
                id="promotion-discount-type"
                value={promotionForm.discountType}
                onValueChange={(discountType) =>
                  setPromotionForm((current) => ({
                    ...current,
                    discountType,
                    discountValue: discountType === "FREE_SHIPPING" ? "0" : current.discountValue,
                  }))
                }
                options={discountTypeOptions}
                fullWidth
              />
            </PanelField>
            <PanelField id="promotion-discount-value" label="Valeur">
              <PanelInput
                id="promotion-discount-value"
                fullWidth
                type="number"
                min="0"
                step="0.001"
                value={promotionForm.discountValue}
                disabled={promotionForm.discountType === "FREE_SHIPPING"}
                onChange={(event) =>
                  setPromotionForm((current) => ({
                    ...current,
                    discountValue: event.target.value,
                  }))
                }
              />
            </PanelField>
            <PanelField id="promotion-minimum" label="Sous-total minimum">
              <PanelInput
                id="promotion-minimum"
                fullWidth
                type="number"
                min="0"
                step="0.001"
                value={promotionForm.minimumSubtotalTtc}
                onChange={(event) =>
                  setPromotionForm((current) => ({
                    ...current,
                    minimumSubtotalTtc: event.target.value,
                  }))
                }
                placeholder="Optionnel"
              />
            </PanelField>
            <PanelField id="promotion-usage-limit" label="Limite globale">
              <PanelInput
                id="promotion-usage-limit"
                fullWidth
                type="number"
                min="0"
                step="1"
                value={promotionForm.usageLimit}
                onChange={(event) =>
                  setPromotionForm((current) => ({
                    ...current,
                    usageLimit: event.target.value,
                  }))
                }
                placeholder="Illimitée"
              />
            </PanelField>
            <PanelField id="promotion-starts-at" label="Début">
              <PanelInput
                id="promotion-starts-at"
                fullWidth
                type="datetime-local"
                value={promotionForm.startsAt}
                onChange={(event) =>
                  setPromotionForm((current) => ({
                    ...current,
                    startsAt: event.target.value,
                  }))
                }
              />
            </PanelField>
            <PanelField id="promotion-ends-at" label="Fin">
              <PanelInput
                id="promotion-ends-at"
                fullWidth
                type="datetime-local"
                value={promotionForm.endsAt}
                onChange={(event) =>
                  setPromotionForm((current) => ({
                    ...current,
                    endsAt: event.target.value,
                  }))
                }
              />
            </PanelField>
          </div>

          <PanelField id="promotion-description" label="Description publique">
            <textarea
              id="promotion-description"
              value={promotionForm.description}
              onChange={(event) =>
                setPromotionForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
              className="focus:border-cobam-water-blue focus:ring-cobam-water-blue/20 min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-4"
              placeholder="Texte court pour la page promotions et les bannieres publiques."
            />
          </PanelField>

          <ProductMediaGrid
            title="Banniere publique"
            description="Optionnel : si une image est ajoutee, cette promotion apparait dans le carousel des bannieres publiques."
            pickerTitle="Choisir une banniere de promotion"
            pickerDescription="Choisissez une image existante ou importez une nouvelle banniere."
            addButtonLabel="Ajouter une banniere"
            addButtonHint="Image uniquement"
            mediaKind="IMAGE"
            maxItems={1}
            items={promotionForm.bannerMedia ? [promotionForm.bannerMedia] : []}
            onChange={(items) =>
              setPromotionForm((current) => ({ ...current, bannerMedia: items[0] ?? null }))
            }
          />

          <div className="grid gap-4">
            <ScopeSelector
              title="Categories"
              hint="Vide = toutes les categories restent eligibles."
              options={options.categories}
              selectedIds={promotionForm.categoryIds}
              onChange={(categoryIds) =>
                setPromotionForm((current) => ({ ...current, categoryIds }))
              }
            />
            <ScopeSelector
              title="Marques"
              hint="Ciblez une ou plusieurs marques partenaires."
              options={options.brands}
              selectedIds={promotionForm.brandIds}
              onChange={(brandIds) => setPromotionForm((current) => ({ ...current, brandIds }))}
            />
            <ScopeSelector
              title="Produits"
              hint="Optionnel, pour une sélection très précise."
              options={options.products}
              selectedIds={promotionForm.productIds}
              onChange={(productIds) => setPromotionForm((current) => ({ ...current, productIds }))}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            {selectedPromotion ? (
              <AnimatedUIButton
                type="button"
                variant="outline"
                icon="delete"
                iconPosition="left"
                disabled={isSavingPromotion}
                onClick={() => void handleDeletePromotion()}
              >
                Supprimer / archiver
              </AnimatedUIButton>
            ) : null}
            <AnimatedUIButton
              type="button"
              icon="save"
              iconPosition="left"
              disabled={isSavingPromotion || notFound}
              onClick={() => void handleSavePromotion()}
            >
              {isSavingPromotion ? "Enregistrement..." : "Enregistrer"}
            </AnimatedUIButton>
          </div>
        </Panel>

        <Panel
          pretitle="Coupons"
          title="Codes promo"
          description="Les clients saisissent ces codes dans le panier ou le checkout. Laissez la cible client vide pour un coupon public."
          className="max-w-none"
          allowOverflow
        >
          {!selectedPromotion ? (
            <StaffNotice variant="info" title="Enregistrez avant">
              Creez la promotion avant de creer des coupons.
            </StaffNotice>
          ) : (
            <>
              <div className="space-y-2">
                {selectedPromotion.coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <TicketPercent className="text-cobam-water-blue h-4 w-4" />
                        <p className="text-cobam-dark-blue font-semibold">{coupon.code}</p>
                        <StaffBadge color={coupon.isActive ? "#16a34a" : "#64748b"} size="sm">
                          {coupon.isActive ? "Actif" : "Inactif"}
                        </StaffBadge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Usage {coupon.usageCount} / {coupon.usageLimit ?? "illimité"} - Par client{" "}
                        {coupon.usageLimitPerCustomer ?? "illimité"} - {formatDate(coupon.startsAt)}{" "}
                        au {formatDate(coupon.endsAt)}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {coupon.customerCount > 0
                          ? `${coupon.customerCount} client(s) autorisé(s)`
                          : "Coupon public"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AnimatedUIButton
                        type="button"
                        size="sm"
                        variant="outline"
                        icon="modify"
                        iconPosition="left"
                        onClick={() => setCouponForm(couponToForm(coupon))}
                      >
                        Modifier
                      </AnimatedUIButton>
                      <AnimatedUIButton
                        type="button"
                        size="sm"
                        variant="outline"
                        icon="delete"
                        iconPosition="left"
                        disabled={isSavingCoupon}
                        onClick={() => void handleDeleteCoupon(coupon.id)}
                      >
                        Supprimer
                      </AnimatedUIButton>
                    </div>
                  </div>
                ))}
                {selectedPromotion.coupons.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">
                    Aucun coupon pour cette promotion.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 border-t border-slate-100 pt-4">
                <PanelField id="coupon-code" label="Code">
                  <PanelInput
                    id="coupon-code"
                    fullWidth
                    value={couponForm.code}
                    onChange={(event) =>
                      setCouponForm((current) => ({
                        ...current,
                        code: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="COBAM10"
                  />
                </PanelField>
                <PanelField id="coupon-active" label="Etat">
                  <label className="flex h-10 items-center gap-3 rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={couponForm.isActive}
                      onChange={(event) =>
                        setCouponForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                      className="accent-cobam-water-blue h-4 w-4"
                    />
                    Coupon actif
                  </label>
                </PanelField>
                <PanelField id="coupon-usage-limit" label="Limite coupon">
                  <PanelInput
                    id="coupon-usage-limit"
                    fullWidth
                    type="number"
                    min="0"
                    step="1"
                    value={couponForm.usageLimit}
                    onChange={(event) =>
                      setCouponForm((current) => ({
                        ...current,
                        usageLimit: event.target.value,
                      }))
                    }
                    placeholder="Illimitée"
                  />
                </PanelField>
                <PanelField id="coupon-per-customer" label="Limite par client">
                  <PanelInput
                    id="coupon-per-customer"
                    fullWidth
                    type="number"
                    min="0"
                    step="1"
                    value={couponForm.usageLimitPerCustomer}
                    onChange={(event) =>
                      setCouponForm((current) => ({
                        ...current,
                        usageLimitPerCustomer: event.target.value,
                      }))
                    }
                    placeholder="Illimitée"
                  />
                </PanelField>
                <PanelField id="coupon-starts-at" label="Début">
                  <PanelInput
                    id="coupon-starts-at"
                    fullWidth
                    type="datetime-local"
                    value={couponForm.startsAt}
                    onChange={(event) =>
                      setCouponForm((current) => ({
                        ...current,
                        startsAt: event.target.value,
                      }))
                    }
                  />
                </PanelField>
                <PanelField id="coupon-ends-at" label="Fin">
                  <PanelInput
                    id="coupon-ends-at"
                    fullWidth
                    type="datetime-local"
                    value={couponForm.endsAt}
                    onChange={(event) =>
                      setCouponForm((current) => ({
                        ...current,
                        endsAt: event.target.value,
                      }))
                    }
                  />
                </PanelField>
                <ScopeSelector
                  title="Clients autorisés"
                  hint="Vide = coupon public. Avec une selection, le client doit etre connecte avec un compte autorisé."
                  options={options.customers}
                  selectedIds={couponForm.customerIds}
                  onChange={(customerIds) =>
                    setCouponForm((current) => ({ ...current, customerIds }))
                  }
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <AnimatedUIButton
                  type="button"
                  variant="outline"
                  icon="close"
                  iconPosition="left"
                  disabled={isSavingCoupon}
                  onClick={() => setCouponForm(emptyCouponForm)}
                >
                  Nouveau coupon
                </AnimatedUIButton>
                <AnimatedUIButton
                  type="button"
                  icon="save"
                  iconPosition="left"
                  disabled={isSavingCoupon}
                  onClick={() => void handleSaveCoupon()}
                >
                  {isSavingCoupon ? "Enregistrement..." : "Enregistrer le coupon"}
                </AnimatedUIButton>
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
