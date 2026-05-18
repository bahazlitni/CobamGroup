import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountPageHeader, AccountPageShell } from "@/components/account/account-shell";
import { NotificationsPanel } from "@/components/account/notifications-panel";
import { getCustomerSession } from "@/lib/customer-auth";
import { listCustomerNotifications } from "@/lib/customer-notifications";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Notifications de votre espace client e-cobam.",
};

export default async function CustomerNotificationsPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/connexion?next=/compte/notifications");
  }

  const notifications = await listCustomerNotifications(session, { take: 50 });

  return (
    <main className="commerce-container py-8 sm:py-12">
      <AccountPageHeader
        eyebrow="Notifications"
        title="Suivi de vos commandes."
        description="Retrouvez les changements de statut et les messages importants lies a votre compte."
      />

      <AccountPageShell active="/compte/notifications">
        <NotificationsPanel initialData={notifications} />
      </AccountPageShell>
    </main>
  );
}
