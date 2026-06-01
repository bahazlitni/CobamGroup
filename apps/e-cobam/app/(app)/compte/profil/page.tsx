import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountPageHeader, AccountPageShell } from "@/components/account/account-shell";
import { CustomerProfileForm } from "@/components/account/profile-form";
import { getCustomerAccount } from "@/lib/customer-account";
import { getCustomerSession } from "@/lib/customer-auth";
import { updateCustomerProfileAction } from "../actions";

export const metadata: Metadata = {
  title: "Profil client",
  description: "Gerez votre profil e-cobam.",
};

export default async function CustomerProfilePage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/connexion?next=/compte/profil");
  }

  const account = await getCustomerAccount(session);
  if (!account) {
    redirect("/connexion?next=/compte/profil");
  }

  return (
    <main className="commerce-container py-8 sm:py-12">
      <AccountPageHeader eyebrow="Espace client" title="Profil" />

      <AccountPageShell active="/compte/profil">
        <CustomerProfileForm action={updateCustomerProfileAction} account={account} />
      </AccountPageShell>
    </main>
  );
}
