import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageCheck } from "lucide-react";

import { AccountPageHeader, AccountPageShell } from "@/components/account/account-shell";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <AccountPageHeader
        title="Commandes"
      />

      <AccountPageShell active="/compte/commandes">
        <Card>
          {account.orders.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Commande</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Paiement</TableHead>

                      <TableHead>Livraison</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.orders.map((order) => (
                      <TableRow key={order.orderNumber}>
                        <TableCell>
                          <Link
                            href={`/commande/${encodeURIComponent(order.orderNumber)}`}
                            className="text-ec-ink hover:text-ec-blue font-black"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="text-ec-muted mt-1 text-xs font-semibold">
                            {new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium" }).format(
                              new Date(order.placedAt),
                            )}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={orderStatusTone(order.status)}>
                            {orderStatusLabels[order.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-ec-muted font-semibold">
                          {paymentStatusLabels[order.paymentStatus]}
                        </TableCell>
                        <TableCell className="text-ec-muted font-semibold">
                          {fulfillmentStatusLabels[order.fulfillmentStatus]}
                        </TableCell>
                        <TableCell className="text-ec-ink text-right font-black">
                          {formatPriceTnd(order.totalTtc) ?? "Sur devis"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="divide-ec-line divide-y md:hidden">
                {account.orders.map((order) => (
                  <Link
                    key={order.orderNumber}
                    href={`/commande/${encodeURIComponent(order.orderNumber)}`}
                    className="hover:bg-ec-paper/70 block p-5 transition"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className={orderStatusTone(order.status)}>
                        {orderStatusLabels[order.status]}
                      </Badge>
                      <span className="text-ec-muted text-xs font-bold tracking-[0.18em] uppercase">
                        {new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium" }).format(
                          new Date(order.placedAt),
                        )}
                      </span>
                    </div>
                    <h2 className="text-ec-ink mt-3 text-xl font-black">{order.orderNumber}</h2>
                    <p className="text-ec-muted mt-2 text-sm font-semibold">
                      Paiement: {paymentStatusLabels[order.paymentStatus]} - Livraison:{" "}
                      {fulfillmentStatusLabels[order.fulfillmentStatus]} - {order.itemCount}{" "}
                      article(s)
                    </p>
                    <p className="text-ec-ink mt-3 text-lg font-black">
                      {formatPriceTnd(order.totalTtc) ?? "Sur devis"}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <CardContent className="p-10 text-center sm:p-10">
              <PackageCheck className="text-ec-blue mx-auto size-10" />
              <h2 className="text-ec-ink mt-4 text-2xl font-black">Aucune commande</h2>
              <p className="text-ec-muted mx-auto mt-2 max-w-lg text-sm leading-7">
                Vos futures commandes apparaitront ici des que vous finalisez un checkout connecte.
              </p>
              <ButtonLink
                href="/catalogue"
                className="mt-6"
                icon={<ArrowRight className="size-4" />}
              >
                Explorer le catalogue
              </ButtonLink>
            </CardContent>
          )}
        </Card>
      </AccountPageShell>
    </main>
  );
}
