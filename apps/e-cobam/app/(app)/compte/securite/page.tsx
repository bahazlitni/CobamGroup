import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";

import { changeCustomerPasswordAction, updateCustomerTwoFactorAction } from "@/app/(app)/compte/actions";
import { PasswordInput } from "@/components/auth/password-input";
import { AccountPageHeader, AccountPageShell } from "@/components/account/account-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getCustomerAccount } from "@/lib/customer-account";
import { getCustomerSession } from "@/lib/customer-auth";
import { normalizeSearchParam } from "@/lib/format";

type SecurityPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    updated?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Sécurité du compte",
  description: "Gerez le mot de passe et la double verification de votre compte e-cobam.",
};

function statusCopy(updated: string | null) {
  if (updated === "password") {
    return "Mot de passe modifié.";
  }
  if (updated === "2fa-on") {
    return "Double vérification activée.";
  }
  if (updated === "2fa-off") {
    return "Double vérification désactivée.";
  }
  return null;
}

export default async function CustomerSecurityPage({ searchParams }: SecurityPageProps) {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/connexion?next=/compte/securite");
  }

  const account = await getCustomerAccount(session);
  if (!account) {
    redirect("/connexion?next=/compte/securite");
  }

  const params = await searchParams;
  const error = normalizeSearchParam(params.error);
  const status = statusCopy(normalizeSearchParam(params.updated));

  return (
    <main className="commerce-container py-8 sm:py-12">
      <AccountPageHeader
        title="Sécurité"
      />

      <AccountPageShell active="/compte/securite">
        <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <Card className="p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="bg-ec-stone text-ec-blue flex size-12 items-center justify-center rounded-full">
                <KeyRound className="size-5" />
              </span>
              <div>
                <p className="text-ec-ink text-xl font-black">Changer le mot de passe</p>
                <p className="text-ec-muted mt-2 text-sm leading-6">
                  Choisissez un mot de passe unique, long et difficile à deviner.
                </p>
              </div>
            </div>

            {error === "password" ? (
              <p className="mt-5 border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Vérifiez le mot de passe actuel et la confirmation.
              </p>
            ) : null}
            {status ? (
              <p className="mt-5 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                {status}
              </p>
            ) : null}

            <form action={changeCustomerPasswordAction} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmation">Confirmation</Label>
                  <PasswordInput
                    id="confirmation"
                    name="confirmation"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </div>
              <Button type="submit" icon={<KeyRound className="size-4" />}>
                Mettre à jour
              </Button>
            </form>
          </Card>

          <Card className="p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="bg-ec-stone text-ec-blue flex size-12 items-center justify-center rounded-full">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-ec-ink text-xl font-black">Double vérification</p>
                <p className="text-ec-muted mt-2 text-sm leading-6">
                  À la connexion, un code à 6 chiffres est envoyé par email avant d’ouvrir la session.
                </p>
              </div>
            </div>

            <form action={updateCustomerTwoFactorAction} className="mt-8 space-y-6">
              <label className="border-ec-line flex cursor-pointer items-center justify-between gap-5 border bg-white p-5">
                <span>
                  <span className="text-ec-ink block text-sm font-black">Activer la double vérification</span>
                  <span className="text-ec-muted mt-1 block text-xs font-semibold">
                    Recommandé pour protéger l’accès à vos commandes.
                  </span>
                </span>
                <input
                  name="twoFactorEnabled"
                  type="checkbox"
                  defaultChecked={account.user.twoStepVerificationEnabled}
                  className="border-ec-line accent-ec-ink size-5"
                />
              </label>
              <Button type="submit" variant="secondary" icon={<ShieldCheck className="size-4" />}>
                Enregistrer
              </Button>
            </form>
          </Card>
        </div>
      </AccountPageShell>
    </main>
  );
}
