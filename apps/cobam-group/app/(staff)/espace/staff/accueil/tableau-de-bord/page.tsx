"use client";

import { ExternalLink } from "lucide-react";
import Loading from "@/components/staff/Loading";
import Panel from "@/components/staff/ui/Panel";
import { StaffBadge } from "@/components/staff/ui";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";


export default function EspaceStaffPage() {
  const { user, isLoading, error } = useStaffSessionContext();

  if (isLoading) {
    return <Loading />;
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-red-100 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-cobam-dark-blue">
          Session invalide
        </h1>
        <p className="mb-4 text-sm text-slate-600">
          {error || "Votre session a expiré. Veuillez vous reconnecter."}
        </p>
        <a
          href="/login/staff"
          className="inline-flex items-center justify-center rounded-xl bg-cobam-dark-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cobam-water-blue"
        >
          Retour à la connexion
        </a>
      </div>
    );
  }

  if (user.status === "BANNED") {
    return (
      <Panel
        pretitle="Compte"
        title="Accès restreint"
        description="Votre compte est actuellement banni. Vous pouvez encore consulter et mettre à jour vos informations personnelles."
      >
        <StaffBadge size="lg" color="amber" icon="warning">
          Statut : banni
        </StaffBadge>
        {user.banDetails?.summary ? (
          <p className="text-sm leading-6 text-slate-600">
            Motif :{" "}
            <span className="font-semibold text-slate-700">
              {user.banDetails.summary}
            </span>
          </p>
        ) : null}
      </Panel>
    );
  }

  const accessColor =
    user.powerType === "ROOT"
      ? "rose"
      : user.powerType === "ADMIN"
        ? "violet"
        : "blue";
  const accessIcon =
    user.powerType === "STAFF" ? "user" : "shield";

  return (
    <>
      <section className="grid items-start gap-6 lg:grid-cols-[1.4fr_1.3fr]">
        <Panel
          pretitle={`Bonjour, ${
            user.profile?.firstName || user.profile?.lastName || user.email
          }`}
          title="Bienvenue dans l'espace professionnel"
          description="Gérez les contenus et les opérations autorisées selon votre niveau d'accès."
        >
          <StaffBadge size="lg" color={accessColor} icon={accessIcon}>
            Accès : {user.roleLabel}
          </StaffBadge>
        </Panel>
      </section>
    </>
  );
}
