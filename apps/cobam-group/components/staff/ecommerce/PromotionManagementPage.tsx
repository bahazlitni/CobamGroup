"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgePercent } from "lucide-react";
import PanelInput from "@/components/staff/ui/PanelInput";
import PanelTable from "@/components/staff/ui/PanelTable";
import {
  StaffBadge,
  StaffNotice,
  StaffPageHeader,
  StaffSelect,
  type StaffSelectOption,
} from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { listEcommercePromotionsAdminClient } from "@/features/ecommerce-admin/client";
import type {
  EcommercePromotionAdminItem,
  EcommercePromotionsAdminDto,
} from "@/features/ecommerce-admin/types";

const promotionsBasePath = "/espace/staff/e-commerce/promotions";
const ALL_FILTER_VALUE = "__all__";

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  ARCHIVED: "Archivee",
  DRAFT: "Brouillon",
  EXPIRED: "Expiree",
  FIXED_AMOUNT: "Montant fixe",
  FREE_SHIPPING: "Livraison offerte",
  PAUSED: "En pause",
  PERCENT: "Pourcentage",
};

const statusColors: Record<string, string> = {
  ACTIVE: "#0a8dc1",
  ARCHIVED: "#64748b",
  DRAFT: "#94a3b8",
  EXPIRED: "#64748b",
  PAUSED: "#d97706",
};

function formatStatus(value: string | null | undefined) {
  if (!value) return "-";
  return statusLabels[value] ?? value.toLowerCase().replace(/_/g, " ");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ value }: { value: string }) {
  return (
    <StaffBadge color={statusColors[value] ?? "#64748b"} size="sm">
      {formatStatus(value)}
    </StaffBadge>
  );
}

function discountLabel(promotion: EcommercePromotionAdminItem) {
  if (promotion.discountType === "PERCENT") {
    return `${promotion.discountValue}%`;
  }

  if (promotion.discountType === "FREE_SHIPPING") {
    return "Livraison offerte";
  }

  return `${promotion.discountValue} TND`;
}

function scopeLabel(promotion: EcommercePromotionAdminItem) {
  const total =
    promotion.productScopeCount + promotion.categoryScopeCount + promotion.brandScopeCount;

  if (total === 0) {
    return "Tout le catalogue";
  }

  return `${promotion.productScopeCount} produits, ${promotion.categoryScopeCount} categories, ${promotion.brandScopeCount} marques`;
}

function normalizeText(value: string | number | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchesSearch(fields: Array<string | number | null | undefined>, query: string) {
  const normalizedQuery = normalizeText(query.trim());

  if (!normalizedQuery) {
    return true;
  }

  return fields.some((field) => normalizeText(field).includes(normalizedQuery));
}

function allOption(label = "Tous"): StaffSelectOption {
  return { value: ALL_FILTER_VALUE, label };
}

export default function PromotionManagementPage() {
  const [data, setData] = useState<EcommercePromotionsAdminDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL_FILTER_VALUE);
  const [discountType, setDiscountType] = useState(ALL_FILTER_VALUE);
  const [couponFilter, setCouponFilter] = useState(ALL_FILTER_VALUE);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setData(await listEcommercePromotionsAdminClient());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rawItems = useMemo(() => data?.items ?? [], [data?.items]);
  const items = useMemo(
    () =>
      rawItems.filter((promotion) => {
        const couponCodes = promotion.coupons.map((coupon) => coupon.code).join(" ");
        const hasPrivateCoupon = promotion.coupons.some((coupon) => coupon.customerCount > 0);
        const hasPublicCoupon = promotion.coupons.some((coupon) => coupon.customerCount === 0);

        return (
          matchesSearch(
            [
              promotion.name,
              promotion.displayName,
              promotion.slug,
              promotion.description,
              promotion.status,
              promotion.discountType,
              promotion.discountValue,
              promotion.minimumSubtotalTtc,
              couponCodes,
              scopeLabel(promotion),
            ],
            search,
          ) &&
          (status === ALL_FILTER_VALUE || promotion.status === status) &&
          (discountType === ALL_FILTER_VALUE || promotion.discountType === discountType) &&
          (couponFilter === ALL_FILTER_VALUE ||
            (couponFilter === "HAS_COUPONS" && promotion.couponCount > 0) ||
            (couponFilter === "NO_COUPONS" && promotion.couponCount === 0) ||
            (couponFilter === "PRIVATE_COUPONS" && hasPrivateCoupon) ||
            (couponFilter === "PUBLIC_COUPONS" && hasPublicCoupon))
        );
      }),
    [couponFilter, discountType, rawItems, search, status],
  );

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="E-commerce"
        title="Promotions"
        icon={BadgePercent}
        status={<StaffBadge color="#0a8dc1">{data?.stats.active ?? 0} actives</StaffBadge>}
        actions={
          <AnimatedUIButton href={`${promotionsBasePath}/new`} icon="plus" iconPosition="left">
            Nouvelle promotion
          </AnimatedUIButton>
        }
      />

      {error ? (
        <StaffNotice variant="error" title="Erreur de chargement">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Promotions", data?.stats.total ?? 0],
          ["Actives", data?.stats.active ?? 0],
          ["En pause", data?.stats.paused ?? 0],
          ["Brouillons", data?.stats.draft ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              {label}
            </p>
            <p className="text-cobam-dark-blue mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1">
            <label className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
              Recherche
            </label>
            <PanelInput
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Promotion, coupon, remise, portee..."
              className="mt-2"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:items-end">
            <div>
              <label className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                Statut
              </label>
              <StaffSelect
                value={status}
                options={[
                  allOption("Tous les statuts"),
                  ...["ACTIVE", "PAUSED", "DRAFT", "EXPIRED", "ARCHIVED"].map((value) => ({
                    value,
                    label: formatStatus(value),
                  })),
                ]}
                onValueChange={setStatus}
                triggerClassName="mt-2 min-w-44"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                Remise
              </label>
              <StaffSelect
                value={discountType}
                options={[
                  allOption("Toutes les remises"),
                  ...["PERCENT", "FIXED_AMOUNT", "FREE_SHIPPING"].map((value) => ({
                    value,
                    label: formatStatus(value),
                  })),
                ]}
                onValueChange={setDiscountType}
                triggerClassName="mt-2 min-w-44"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                Coupons
              </label>
              <StaffSelect
                value={couponFilter}
                options={[
                  allOption("Tous les coupons"),
                  { value: "HAS_COUPONS", label: "Avec coupons" },
                  { value: "NO_COUPONS", label: "Sans coupon" },
                  { value: "PUBLIC_COUPONS", label: "Coupons publics" },
                  { value: "PRIVATE_COUPONS", label: "Coupons cibles" },
                ]}
                onValueChange={setCouponFilter}
                triggerClassName="mt-2 min-w-44"
              />
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-500">
          {items.length} resultat(s) sur {rawItems.length}
        </p>
      </div>

      <div className="overflow-x-auto">
        <PanelTable
          columns={["Promotion", "Statut", "Remise", "Fenetre", "Usage", "Coupons", "Portee", ""]}
          isLoading={isLoading}
          isEmpty={items.length === 0}
          error={error}
        >
          {items.map((promotion) => (
            <tr key={promotion.id} className="align-top">
              <td className="px-4 py-4">
                <p className="text-cobam-dark-blue font-semibold">{promotion.displayName}</p>
                <p className="text-xs text-slate-500">{promotion.slug}</p>
                <p className="text-xs text-slate-500">
                  Minimum {promotion.minimumSubtotalTtc ?? "-"} TND
                  {promotion.bannerMedia ? " - banniere active" : ""}
                </p>
              </td>
              <td className="px-4 py-4">
                <StatusBadge value={promotion.status} />
              </td>
              <td className="px-4 py-4 text-slate-700">
                <p className="font-medium">{discountLabel(promotion)}</p>
                <p className="text-xs text-slate-500">{formatStatus(promotion.discountType)}</p>
              </td>
              <td className="px-4 py-4 text-slate-600">
                <p>{formatDate(promotion.startsAt)}</p>
                <p className="text-xs text-slate-500">au {formatDate(promotion.endsAt)}</p>
              </td>
              <td className="px-4 py-4 text-slate-600">
                {promotion.usageCount} / {promotion.usageLimit ?? "illimité"}
              </td>
              <td className="px-4 py-4 text-slate-600">{promotion.couponCount}</td>
              <td className="px-4 py-4 text-slate-600">{scopeLabel(promotion)}</td>
              <td className="px-4 py-4 text-right">
                <AnimatedUIButton
                  href={`${promotionsBasePath}/${promotion.id}`}
                  size="sm"
                  variant="outline"
                  icon="modify"
                  iconPosition="left"
                >
                  Modifier
                </AnimatedUIButton>
              </td>
            </tr>
          ))}
        </PanelTable>
      </div>
    </div>
  );
}
