import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CreditCard, MapPin, PackageCheck, UserRound } from "lucide-react";
import { AccountNav } from "@/components/account/account-nav";
import { getCustomerAccount } from "@/lib/customer-account";
import { getCustomerSession } from "@/lib/customer-auth";
import { formatPriceTnd } from "@/lib/format";
import { orderStatusLabels, orderStatusTone } from "@/lib/order-labels";

export const metadata: Metadata = {
  title: "Espace client",
  description: "Tableau de bord prive e-cobam.",
};

function fullName(account: NonNullable<Awaited<ReturnType<typeof getCustomerAccount>>>) {
  const name = [account.firstName, account.lastName].filter(Boolean).join(" ");
  return name || account.companyName || account.user.email;
}

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/connexion?next=/compte");
  }

  const account = await getCustomerAccount(session);
  if (!account) {
    redirect("/connexion?next=/compte");
  }

  const latestOrders = account.orders.slice(0, 3);

  return (
    <main className="commerce-container py-8 sm:py-12">
      <section className="rounded-[2rem] bg-ec-ink p-6 text-white sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">
              Espace client
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
              Bonjour, {fullName(account)}
            </h1>

          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <AccountNav active="/compte" />

        <div className="space-y-8">
          <section className="grid gap-4 md:grid-cols-4">
            <Link href="/compte/profil" className="rounded-[1.5rem] border border-ec-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ec-ink/5">
              <UserRound className="size-5 text-ec-blue" />
              <p className="mt-4 text-2xl font-black text-ec-ink">{account.type === "COMPANY" ? "Pro" : "Client"}</p>
              <p className="mt-1 text-sm font-semibold text-ec-muted">Profil</p>
            </Link>
            <Link href="/compte/adresses" className="rounded-[1.5rem] border border-ec-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ec-ink/5">
              <MapPin className="size-5 text-ec-blue" />
              <p className="mt-4 text-2xl font-black text-ec-ink">{account.addresses.length}</p>
              <p className="mt-1 text-sm font-semibold text-ec-muted">Adresses</p>
            </Link>
            <Link href="/compte/commandes" className="rounded-[1.5rem] border border-ec-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ec-ink/5">
              <PackageCheck className="size-5 text-ec-blue" />
              <p className="mt-4 text-2xl font-black text-ec-ink">{account.orderCount}</p>
              <p className="mt-1 text-sm font-semibold text-ec-muted">Commandes</p>
            </Link>
            <Link href="/compte/paiements" className="rounded-[1.5rem] border border-ec-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ec-ink/5">
              <CreditCard className="size-5 text-ec-blue" />
              <p className="mt-4 text-2xl font-black text-ec-ink">{account.paymentMethods.length}</p>
              <p className="mt-1 text-sm font-semibold text-ec-muted">Paiements</p>
            </Link>
          </section>

          <section className="rounded-[1.5rem] border border-ec-line bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-ec-ink">Dernieres commandes</h2>
                <p className="mt-1 text-sm text-ec-muted">Historique lie a votre compte client.</p>
              </div>
              <Link href="/compte/commandes" className="text-sm font-black text-ec-blue hover:text-ec-ink">
                Tout voir
              </Link>
            </div>

            {latestOrders.length > 0 ? (
              <div className="mt-5 divide-y divide-ec-line">
                {latestOrders.map((order) => (
                  <Link
                    key={order.orderNumber}
                    href={`/commande/${encodeURIComponent(order.orderNumber)}`}
                    className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-black text-ec-ink">{order.orderNumber}</p>
                      <p className="mt-1 text-xs font-semibold text-ec-muted">
                        {new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium" }).format(new Date(order.placedAt))}
                      </p>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${orderStatusTone(order.status)}`}>
                      {orderStatusLabels[order.status]}
                    </span>
                    <span className="text-sm font-black text-ec-ink">
                      {formatPriceTnd(order.totalTtc) ?? "Sur devis"}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-ec-paper p-5 text-sm font-semibold text-ec-muted">
                Aucune commande rattachee a votre compte pour le moment.
              </div>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-ec-line bg-white p-5 sm:p-6">
            <h2 className="text-xl font-black text-ec-ink">Actions rapides</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Link href="/catalogue" className="rounded-2xl bg-ec-paper p-4 text-sm font-black text-ec-ink hover:bg-ec-stone">
                Explorer le catalogue <ArrowRight className="mt-3 size-4 text-ec-blue" />
              </Link>
              <Link href="/compte/adresses" className="rounded-2xl bg-ec-paper p-4 text-sm font-black text-ec-ink hover:bg-ec-stone">
                Ajouter une adresse <ArrowRight className="mt-3 size-4 text-ec-blue" />
              </Link>
              <Link href="/compte/paiements" className="rounded-2xl bg-ec-paper p-4 text-sm font-black text-ec-ink hover:bg-ec-stone">
                Choisir un paiement <ArrowRight className="mt-3 size-4 text-ec-blue" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
