import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/account-nav";
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
      <div className="mb-8">
        <p className="text-ec-blue text-sm font-semibold tracking-[0.24em] uppercase">
          Notifications
        </p>
        <h1 className="text-ec-ink mt-3 text-4xl font-black tracking-tight sm:text-6xl">
          Suivi de vos commandes.
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <AccountNav active="/compte/notifications" />
        <NotificationsPanel initialData={notifications} />
      </div>
    </main>
  );
}
