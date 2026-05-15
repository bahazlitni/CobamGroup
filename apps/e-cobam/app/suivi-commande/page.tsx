import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lookupAccountOrder } from "@/lib/account";
import { formatPriceTnd, normalizeSearchParam } from "@/lib/format";
import {
  fulfillmentStatusLabels,
  orderStatusLabels,
  orderStatusTone,
  paymentStatusLabels,
} from "@/lib/order-labels";

type OrderTrackingSearchParams = {
  commande?: string | string[];
  contact?: string | string[];
};

type OrderTrackingPageProps = {
  searchParams: Promise<OrderTrackingSearchParams>;
};

export const metadata: Metadata = {
  title: "Suivi de commande",
  description: "Suivez une commande e-cobam sans connexion.",
};

const inputClass =
  "h-12 w-full rounded-2xl border border-ec-line bg-white px-4 text-sm font-semibold text-ec-ink outline-none transition focus:border-ec-blue";
const labelClass = "text-xs font-bold uppercase tracking-[0.18em] text-ec-muted";

function lookupMessage(lookupAttempted: boolean, incomplete: boolean, found: boolean) {
  if (!lookupAttempted) {
    return null;
  }

  if (incomplete) {
    return "Entrez le numero de commande et l'email ou telephone utilise au checkout.";
  }

  if (!found) {
    return "Aucune commande ne correspond a ces informations.";
  }

  return null;
}

export default async function OrderTrackingPage({ searchParams }: OrderTrackingPageProps) {
  const params = await searchParams;
  const orderNumber = normalizeSearchParam(params.commande);
  const contact = normalizeSearchParam(params.contact);
  const lookupAttempted = Boolean(orderNumber || contact);
  const incomplete = lookupAttempted && (!orderNumber || !contact);
  const order = !incomplete && orderNumber && contact ? await lookupAccountOrder(orderNumber, contact) : null;
  const message = lookupMessage(lookupAttempted, incomplete, Boolean(order));

  return (
    <main className="commerce-container py-8 sm:py-12">
      <section className="grid gap-8 rounded-[2rem] bg-ec-ink p-6 text-white sm:p-8 lg:grid-cols-[1fr_440px] lg:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">
            Suivi de commande
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            Suivre une commande sans connexion.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">
            Utilisez le numero de commande et le contact du checkout pour consulter le statut.
          </p>
          <Link
            href="/connexion"
            className="mt-6 inline-flex items-center gap-2 text-sm font-black text-ec-blue hover:text-white"
          >
            Creer un espace client <ArrowRight className="size-4" />
          </Link>
        </div>

        <form action="/suivi-commande" className="rounded-[1.5rem] bg-white p-5 text-ec-ink">
          <p className="flex items-center gap-2 text-sm font-black">
            <Search className="size-4 text-ec-blue" />
            Recherche express
          </p>
          <div className="mt-5 space-y-4">
            <label className="block space-y-2">
              <span className={labelClass}>Numero de commande</span>
              <input name="commande" defaultValue={orderNumber ?? ""} className={inputClass} />
            </label>
            <label className="block space-y-2">
              <span className={labelClass}>Email ou telephone</span>
              <input name="contact" defaultValue={contact ?? ""} className={inputClass} />
            </label>
          </div>
          {message ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {message}
            </p>
          ) : null}
          <Button type="submit" className="mt-5 w-full" icon={<ArrowRight className="size-4" />}>
            Consulter le statut
          </Button>
        </form>
      </section>

      {order ? (
        <section className="mt-8 rounded-[1.5rem] border border-ec-line bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${orderStatusTone(order.status)}`}>
                {orderStatusLabels[order.status]}
              </span>
              <h2 className="mt-4 text-3xl font-black text-ec-ink">{order.orderNumber}</h2>
              <p className="mt-2 text-sm font-semibold text-ec-muted">
                Paiement: {paymentStatusLabels[order.paymentStatus]} - Livraison:{" "}
                {fulfillmentStatusLabels[order.fulfillmentStatus]}
              </p>
            </div>
            <p className="text-2xl font-black text-ec-ink">{formatPriceTnd(order.totalTtc) ?? "Sur devis"}</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
