"use client";

import { ArrowRight, Boxes, Lock, Package, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { StaffPageHeader, StaffStateCard } from "@/components/staff/ui";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProducts, canManageProducts } from "@/features/products/access";
import clsx from "clsx";

type ActionCardProps = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
};

function ActionCard({
  title,
  icon: Icon,
  onClick,
  disabled = false,
  primary = false,
}: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={clsx(
        "group relative flex min-h-[280px] w-full flex-col justify-between rounded-2xl border p-8 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobam-water-blue/30",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
          : primary
            ? "border-cobam-water-blue/20 bg-cobam-water-blue/[0.06] text-cobam-dark-blue hover:-translate-y-0.5 hover:border-cobam-water-blue/40 hover:shadow-md"
            : "border-slate-200 bg-white text-cobam-dark-blue hover:-translate-y-0.5 hover:border-cobam-water-blue/30 hover:shadow-md"
      )}
    >
      {disabled ? (
        <span className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
          <Lock className="h-4 w-4" />
        </span>
      ) : null}

      <span
        className={clsx(
          "inline-flex h-16 w-16 items-center justify-center rounded-2xl border",
          disabled
            ? "border-slate-200 bg-white text-slate-300"
            : primary
              ? "border-cobam-water-blue/15 bg-cobam-water-blue/10 text-cobam-water-blue"
              : "border-slate-200 bg-slate-50 text-cobam-dark-blue"
        )}
      >
        <Icon className="h-8 w-8" />
      </span>

      <div className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight leading-tight">
          {title}
        </h2>

        <span
          className={clsx(
            "inline-flex items-center gap-2 text-base font-semibold",
            disabled ? "text-slate-400" : "text-cobam-dark-blue"
          )}
        >
          <ArrowRight
            className={clsx(
              "h-5 w-5 transition",
              !disabled && "group-hover:translate-x-0.5"
            )}
          />
        </span>
      </div>
    </button>
  );
}

export default function NewProductFamilyPage() {
  const router = useRouter();
  const { user } = useStaffSessionContext();

  const canCreate = user ? canCreateProducts(user) : false;
  const canGroup = canCreate && (user ? canManageProducts(user) : false);

  if (!canCreate) {
    return (
      <StaffStateCard
        title="Accès refusé"
        description="Vous ne pouvez pas créer de famille produit."
      />
    );
  }

  return (
    <div className="space-y-6">
      <StaffPageHeader
        backHref="/espace/staff/gestion-des-produits/familles"
        eyebrow="Produits"
        title="Créer une famille"
        icon={Package}
      />

      <section className="grid gap-5 2xl:grid-cols-2">
        <ActionCard
          title="Créer une famille vide"
          icon={PlusCircle}
          primary
          onClick={() =>
            router.push("/espace/staff/gestion-des-produits/familles/edit")
          }
        />

        <ActionCard
          title={
            canGroup
              ? "Créer depuis des produits existants"
              : "Regrouper des produits existants"
          }
          icon={Boxes}
          disabled={!canGroup}
          onClick={() =>
            router.push("/espace/staff/gestion-des-produits/familles/new/grouping")
          }
        />
      </section>
    </div>
  );
}