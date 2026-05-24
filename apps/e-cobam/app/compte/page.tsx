import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CreditCard, MapPin, PackageCheck, UserRound } from "lucide-react";
import { AccountPageHeader, AccountPageShell } from "@/components/account/account-shell";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  const summaryCards = [
    {
      href: "/compte/profil",
      icon: UserRound,
      value: account.type === "COMPANY" ? "Pro" : "Client",
      label: "Profil",
    },
    {
      href: "/compte/adresses",
      icon: MapPin,
      value: account.addresses.length,
      label: "Adresses",
    },
    {
      href: "/compte/commandes",
      icon: PackageCheck,
      value: account.orderCount,
      label: "Commandes",
    },
    {
      href: "/compte/paiements",
      icon: CreditCard,
      value: account.paymentMethods.length,
      label: "Paiements",
    },
  ];

  return (
    <main className="commerce-container py-8 sm:py-12">
      <AccountPageHeader
        eyebrow="Espace client"
        title={<>Bonjour, {fullName(account)}</>}
        description="Pilotez vos informations, vos adresses, vos commandes et vos préférences de paiement depuis un espace privé."
        actions={
          <ButtonLink
            href="/catalogue"
            variant="secondary"
            icon={<ArrowRight className="size-4" />}
          >
            Explorer le catalogue
          </ButtonLink>
        }
      />

      <AccountPageShell active="/compte">
        <div className="space-y-8">
          <section className="grid gap-4 md:grid-cols-4">
            {summaryCards.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.href}
                  className="hover:shadow-ec-ink/5 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <Link href={item.href} className="block p-5">
                    <Icon className="text-ec-blue size-5" />
                    <p className="text-ec-ink mt-4 text-2xl font-black">{item.value}</p>
                    <p className="text-ec-muted mt-1 text-sm font-semibold">{item.label}</p>
                  </Link>
                </Card>
              );
            })}
          </section>

          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Dernieres commandes</CardTitle>
                <CardDescription>Historique lie a votre compte client.</CardDescription>
              </div>
              <ButtonLink href="/compte/commandes" variant="ghost" size="sm">
                Tout voir
              </ButtonLink>
            </CardHeader>
            <Separator />

            {latestOrders.length > 0 ? (
              <CardContent className="divide-ec-line divide-y px-0 pb-0 sm:px-0 sm:pb-0">
                {latestOrders.map((order) => (
                  <Link
                    key={order.orderNumber}
                    href={`/commande/${encodeURIComponent(order.orderNumber)}`}
                    className="hover:bg-ec-paper/70 grid gap-3 px-5 py-4 transition sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-6"
                  >
                    <div>
                      <p className="text-ec-ink text-sm font-black">{order.orderNumber}</p>
                      <p className="text-ec-muted mt-1 text-xs font-semibold">
                        {new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium" }).format(
                          new Date(order.placedAt),
                        )}
                      </p>
                    </div>
                    <Badge className={orderStatusTone(order.status)}>
                      {orderStatusLabels[order.status]}
                    </Badge>
                    <span className="text-ec-ink text-sm font-black">
                      {formatPriceTnd(order.totalTtc) ?? "Sur devis"}
                    </span>
                  </Link>
                ))}
              </CardContent>
            ) : (
              <CardContent>
                <div className="bg-ec-paper text-ec-muted rounded-2xl p-5 text-sm font-semibold">
                  Aucune commande rattachee a votre compte pour le moment.
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/catalogue"
                className="bg-ec-paper text-ec-ink hover:bg-ec-stone rounded-2xl p-4 text-sm font-black"
              >
                Explorer le catalogue <ArrowRight className="text-ec-blue mt-3 size-4" />
              </Link>
              <Link
                href="/compte/adresses"
                className="bg-ec-paper text-ec-ink hover:bg-ec-stone rounded-2xl p-4 text-sm font-black"
              >
                Ajouter une adresse <ArrowRight className="text-ec-blue mt-3 size-4" />
              </Link>
              <Link
                href="/compte/paiements"
                className="bg-ec-paper text-ec-ink hover:bg-ec-stone rounded-2xl p-4 text-sm font-black"
              >
                Choisir un paiement <ArrowRight className="text-ec-blue mt-3 size-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </AccountPageShell>
    </main>
  );
}
