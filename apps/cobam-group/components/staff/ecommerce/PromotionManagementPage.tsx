"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgePercent } from "lucide-react";
import Panel from "@/components/staff/ui/Panel";
import PanelTable from "@/components/staff/ui/PanelTable";
import { StaffBadge, StaffNotice, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { listEcommercePromotionsAdminClient } from "@/features/ecommerce-admin/client";
import type {
  EcommercePromotionAdminItem,
  EcommercePromotionsAdminDto,
} from "@/features/ecommerce-admin/types";

const promotionsBasePath = "/espace/staff/e-commerce/promotions";

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
    promotion.productScopeCount +
    promotion.categoryScopeCount +
    promotion.brandScopeCount;

  if (total === 0) {
    return "Tout le catalogue";
  }

  return `${promotion.productScopeCount} produits, ${promotion.categoryScopeCount} categories, ${promotion.brandScopeCount} marques`;
}

export default function PromotionManagementPage() {
  const [data, setData] = useState<EcommercePromotionsAdminDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="E-commerce"
        title="Promotions"
        icon={BadgePercent}
        status={<StaffBadge color="#0a8dc1">{data?.stats.active ?? 0} actives</StaffBadge>}
        actions={
          <AnimatedUIButton
            href={`${promotionsBasePath}/new`}
            icon="plus"
            iconPosition="left"
          >
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
          <div
            key={label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-cobam-dark-blue">
              {value}
            </p>
          </div>
        ))}
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
                  <p className="font-semibold text-cobam-dark-blue">{promotion.name}</p>
                  <p className="text-xs text-slate-500">
                    Minimum {promotion.minimumSubtotalTtc ?? "-"} TND
                  </p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge value={promotion.status} />
                </td>
                <td className="px-4 py-4 text-slate-700">
                  <p className="font-medium">{discountLabel(promotion)}</p>
                  <p className="text-xs text-slate-500">
                    {formatStatus(promotion.discountType)}
                  </p>
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
