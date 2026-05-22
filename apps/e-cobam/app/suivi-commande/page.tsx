import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  HelpCircle,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { lookupAccountOrder, type AccountOrderLookupResult } from "@/lib/account";
import { formatPriceTnd, normalizeSearchParam } from "@/lib/format";
import {
  fulfillmentMethodLabels,
  fulfillmentStatusLabels,
  orderStatusLabels,
  orderStatusTone,
  paymentMethodLabels,
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
  "border-ec-line text-ec-ink placeholder:text-ec-muted/60 h-13 w-full rounded-2xl border bg-white px-4 text-sm font-semibold outline-none transition focus:border-ec-blue focus:shadow-[0_0_0_4px_rgba(10,141,193,0.08)]";
const labelClass = "text-ec-muted text-xs font-black tracking-[0.18em] uppercase";

const trackingSteps = [
  {
    key: "received",
    title: "Commande reçue",
    text: "Votre demande est enregistrée.",
    statuses: ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERED"],
  },
  {
    key: "confirmed",
    title: "Validation",
    text: "Prix, stock et contact vérifiés.",
    statuses: ["CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERED"],
  },
  {
    key: "preparing",
    title: "Préparation",
    text: "Les produits sont regroupés.",
    statuses: ["PREPARING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERED"],
  },
  {
    key: "ready",
    title: "Retrait ou livraison",
    text: "La commande est en sortie.",
    statuses: ["READY_FOR_PICKUP", "SHIPPED", "DELIVERED"],
  },
  {
    key: "delivered",
    title: "Terminée",
    text: "Commande livrée ou retirée.",
    statuses: ["DELIVERED"],
  },
] as const;

const helpCards = [
  {
    icon: ClipboardList,
    title: "Numéro de commande",
    text: "Il se trouve sur la confirmation reçue après validation du checkout.",
  },
  {
    icon: ShieldCheck,
    title: "Accès sécurisé",
    text: "Le suivi demande aussi l'email ou le téléphone utilisé à la commande.",
  },
  {
    icon: HelpCircle,
    title: "Besoin d'aide ?",
    text: "Connectez-vous ou contactez l'équipe si les informations ne correspondent pas.",
  },
];

function lookupMessage(lookupAttempted: boolean, incomplete: boolean, found: boolean) {
  if (!lookupAttempted) {
    return null;
  }

  if (incomplete) {
    return "Entrez le numéro de commande et l'email ou le téléphone utilisé au checkout.";
  }

  if (!found) {
    return "Aucune commande ne correspond à ces informations.";
  }

  return null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-TN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Clock3;
}) {
  return (
    <div className="border-ec-line rounded-2xl border bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="bg-ec-blue/10 text-ec-blue grid size-10 place-items-center rounded-xl">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className={labelClass}>{label}</p>
          <p className="text-ec-ink mt-1 truncate text-sm font-black">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TrackingTimeline({ order }: { order: NonNullable<AccountOrderLookupResult> }) {
  const isClosed = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div className="border-ec-line rounded-3xl border bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-ec-blue text-xs font-black tracking-[0.2em] uppercase">Progression</p>
          <h2 className="text-ec-ink mt-2 text-2xl font-black">Où en est votre commande ?</h2>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-black ${orderStatusTone(order.status)}`}
        >
          {orderStatusLabels[order.status]}
        </span>
      </div>

      {isClosed ? (
        <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm leading-6 font-semibold text-rose-700">
          Cette commande est {orderStatusLabels[order.status].toLowerCase()}. Contactez le support
          si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
        </div>
      ) : (
        <div className="mt-7 grid gap-3 lg:grid-cols-5">
          {trackingSteps.map((step, index) => {
            const complete = (step.statuses as readonly string[]).includes(order.status);

            return (
              <div
                key={step.key}
                className={`relative rounded-2xl border p-4 ${
                  complete
                    ? "border-ec-blue/30 bg-ec-blue/5 text-ec-ink"
                    : "border-ec-line bg-ec-paper text-ec-muted"
                }`}
              >
                <div
                  className={`grid size-9 place-items-center rounded-full text-sm font-black ${
                    complete ? "bg-ec-blue text-white" : "text-ec-muted bg-white"
                  }`}
                >
                  {complete ? <CheckCircle2 className="size-5" /> : index + 1}
                </div>
                <h3 className="mt-4 text-sm font-black">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 font-semibold">{step.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OrderResult({ order }: { order: NonNullable<AccountOrderLookupResult> }) {
  const paymentMethod = order.paymentMethod
    ? paymentMethodLabels[order.paymentMethod]
    : "À confirmer";
  const fulfillmentMethod = order.fulfillmentMethod
    ? fulfillmentMethodLabels[order.fulfillmentMethod]
    : "À confirmer";

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <TrackingTimeline order={order} />

        <div className="border-ec-line overflow-hidden rounded-3xl border bg-white">
          <div className="border-ec-line flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div>
              <p className="text-ec-blue text-xs font-black tracking-[0.2em] uppercase">Commande</p>
              <h2 className="text-ec-ink mt-2 text-3xl font-black">{order.orderNumber}</h2>
              <p className="text-ec-muted mt-2 text-sm font-semibold">
                Passée le {formatDate(order.placedAt)}
              </p>
            </div>
            <p className="text-ec-ink text-3xl font-black">
              {formatPriceTnd(order.totalTtc) ?? "Sur devis"}
            </p>
          </div>

          <div className="divide-ec-line divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-ec-ink text-sm font-black">{item.name}</p>
                  <p className="text-ec-muted mt-1 text-xs font-semibold">
                    SKU {item.sku} · Quantité {Number(item.quantity).toLocaleString("fr-TN")}
                  </p>
                </div>
                <p className="text-ec-ink text-sm font-black">
                  {formatPriceTnd(item.lineTotalTtc) ?? "Sur devis"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <StatCard
          label="Paiement"
          value={paymentStatusLabels[order.paymentStatus]}
          icon={CreditCard}
        />
        <StatCard label="Mode paiement" value={paymentMethod} icon={ShieldCheck} />
        <StatCard
          label="Livraison"
          value={fulfillmentStatusLabels[order.fulfillmentStatus]}
          icon={Truck}
        />
        <StatCard label="Mode retrait" value={fulfillmentMethod} icon={MapPin} />

        <div className="bg-ec-ink rounded-3xl p-5 text-white">
          <h2 className="mt-3 text-xl font-black">Retrouvez toutes vos commandes.</h2>

          <Link
            href="/connexion"
            className="text-ec-ink hover:bg-ec-blue mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black transition hover:text-white"
          >
            Se connecter
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </aside>
    </section>
  );
}

export default async function OrderTrackingPage({ searchParams }: OrderTrackingPageProps) {
  const params = await searchParams;
  const orderNumber = normalizeSearchParam(params.commande);
  const contact = normalizeSearchParam(params.contact);
  const lookupAttempted = Boolean(orderNumber || contact);
  const incomplete = lookupAttempted && (!orderNumber || !contact);
  const order =
    !incomplete && orderNumber && contact ? await lookupAccountOrder(orderNumber, contact) : null;
  const message = lookupMessage(lookupAttempted, incomplete, Boolean(order));

  return (
    <main className="bg-ec-paper">
      <section className="commerce-container py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_27rem] lg:items-stretch">
          <div className="border-ec-line relative overflow-hidden rounded-3xl border bg-white p-6 sm:p-8 lg:p-10">
            <div className="bg-ec-blue/10 absolute top-0 right-0 h-48 w-48 rounded-bl-full" />
            <div className="relative max-w-3xl">
              <p className="text-ec-blue inline-flex items-center gap-2 text-xs font-black tracking-[0.22em] uppercase">
                <PackageCheck className="size-4" />
                Suivi de commande
              </p>
              <h1 className="text-ec-ink mt-5 text-4xl leading-tight font-black tracking-tight sm:text-6xl">
                Retrouvez l&apos;état de votre commande.
              </h1>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {helpCards.map((card) => (
                  <div key={card.title} className="bg-ec-paper rounded-2xl p-4">
                    <card.icon className="text-ec-blue size-5" />
                    <h2 className="text-ec-ink mt-3 text-sm font-black">{card.title}</h2>
                    <p className="text-ec-muted mt-2 text-xs leading-5 font-semibold">
                      {card.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form
            action="/suivi-commande"
            className="border-ec-line rounded-3xl border bg-white p-5 shadow-[0_18px_50px_rgba(20,32,46,0.07)] sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="bg-ec-blue/10 text-ec-blue grid size-11 place-items-center rounded-2xl">
                <Search className="size-5" />
              </span>
              <div>
                <p className="text-ec-ink font-black">Recherche express</p>
                <p className="text-ec-muted mt-1 text-xs font-semibold">Résultat immédiat</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block space-y-2">
                <span className={labelClass}>Numéro de commande</span>
                <input
                  name="commande"
                  defaultValue={orderNumber ?? ""}
                  className={inputClass}
                  placeholder="Ex: ECO-2026-0001"
                  autoComplete="off"
                />
              </label>
              <label className="block space-y-2">
                <span className={labelClass}>Email ou téléphone</span>
                <input
                  name="contact"
                  defaultValue={contact ?? ""}
                  className={inputClass}
                  placeholder="Email ou numéro utilisé"
                />
              </label>
            </div>

            {message ? (
              <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 font-semibold text-amber-800">
                {message}
              </p>
            ) : null}

            <Button type="submit" className="mt-6 w-full" icon={<ArrowRight className="size-4" />}>
              Consulter le statut
            </Button>
            <Link
              href="/connexion"
              className="text-ec-muted hover:text-ec-blue mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-black transition"
            >
              Suivre depuis mon compte
              <ArrowRight className="size-4" />
            </Link>
          </form>
        </div>

        {order ? <OrderResult order={order} /> : null}
      </section>
    </main>
  );
}
