import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageCheck } from "lucide-react";
import { AccountNav } from "@/components/account/account-nav";
import { ButtonLink } from "@/components/ui/button";
import { getCustomerAccount } from "@/lib/customer-account";
import { getCustomerSession } from "@/lib/customer-auth";
import { formatPriceTnd } from "@/lib/format";
import {
  fulfillmentStatusLabels,
  orderStatusLabels,
  orderStatusTone,
  paymentStatusLabels,
} from "@/lib/order-labels";

export const metadata: Metadata = {
  title: "Mes commandes",
  description: "Historique des commandes e-cobam.",
};

export default async function CustomerOrdersPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/connexion?next=/compte/commandes");
  }

  const account = await getCustomerAccount(session);
  if (!account) {
    redirect("/connexion?next=/compte/commandes");
  }

  return (
    <main className="commerce-container py-8 sm:py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">Commandes</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ec-ink sm:text-6xl">
          Historique et statuts.
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <AccountNav active="/compte/commandes" />

        <section className="rounded-[1.5rem] border border-ec-line bg-white">
          {account.orders.length > 0 ? (
            <div className="divide-y divide-ec-line">
              {account.orders.map((order) => (
                <Link
                  key={order.orderNumber}
                  href={`/commande/${encodeURIComponent(order.orderNumber)}`}
                  className="grid gap-4 p-5 transition hover:bg-ec-paper/70 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${orderStatusTone(order.status)}`}>
                        {orderStatusLabels[order.status]}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-ec-muted">
                        {new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium" }).format(new Date(order.placedAt))}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-black text-ec-ink">{order.orderNumber}</h2>
                    <p className="mt-2 text-sm font-semibold text-ec-muted">
                      Paiement: {paymentStatusLabels[order.paymentStatus]} · Livraison:{" "}
                      {fulfillmentStatusLabels[order.fulfillmentStatus]} · {order.itemCount} article(s)
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-lg font-black text-ec-ink">
                      {formatPriceTnd(order.totalTtc) ?? "Sur devis"}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm font-black text-ec-blue">
                      Detail <ArrowRight className="size-4" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <PackageCheck className="mx-auto size-10 text-ec-blue" />
              <h2 className="mt-4 text-2xl font-black text-ec-ink">Aucune commande</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-ec-muted">
                Vos futures commandes apparaitront ici des que vous finalisez un checkout connecte.
              </p>
              <ButtonLink href="/catalogue" className="mt-6" icon={<ArrowRight className="size-4" />}>
                Explorer le catalogue
              </ButtonLink>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
