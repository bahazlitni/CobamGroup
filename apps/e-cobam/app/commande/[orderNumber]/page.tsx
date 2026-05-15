import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatPriceTnd } from "@/lib/format";
import { getPublicOrderSummary, type PublicOrderSummary } from "@/lib/checkout";
import {
  fulfillmentMethodLabels,
  fulfillmentStatusLabels,
  paymentMethodLabels,
  paymentStatusLabels,
} from "@/lib/order-labels";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-TN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function addressLine(address: PublicOrderSummary["shippingAddress"]) {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return null;
  }

  const snapshot = address as Record<string, unknown>;
  const parts = [
    snapshot.addressLine1,
    snapshot.addressLine2,
    snapshot.city,
    snapshot.governorate,
  ].filter((part): part is string => typeof part === "string" && part.length > 0);

  return parts.join(", ") || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Commande ${orderNumber}`,
    description: "Confirmation de commande e-cobam.",
  };
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const order = await getPublicOrderSummary(orderNumber);

  if (!order) {
    notFound();
  }

  const deliveryAddress = addressLine(order.shippingAddress);

  return (
    <main className="commerce-container py-8 sm:py-12">
      <section className="rounded-[2rem] border border-ec-line bg-white p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="size-4" />
              Commande reçue
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-ec-ink sm:text-6xl">
              {order.orderNumber}
            </h1>
            <p className="mt-4 text-sm font-semibold text-ec-muted">
              Creee le {formatDate(order.placedAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href={`/compte?commande=${encodeURIComponent(order.orderNumber)}`}
              variant="secondary"
              icon={<UserRound className="size-4" />}
            >
              Suivre dans le compte
            </ButtonLink>
            <ButtonLink href="/catalogue" variant="secondary" icon={<ArrowRight className="size-4" />}>
              Continuer vos achats
            </ButtonLink>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.25rem] bg-ec-paper p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ec-muted">Paiement</p>
            <p className="mt-2 text-sm font-black text-ec-ink">
              {order.paymentMethod ? paymentMethodLabels[order.paymentMethod] : "A confirmer"}
            </p>
            <p className="mt-1 text-xs font-semibold text-ec-muted">
              {paymentStatusLabels[order.paymentStatus]}
            </p>
          </div>
          <div className="rounded-[1.25rem] bg-ec-paper p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ec-muted">Livraison</p>
            <p className="mt-2 text-sm font-black text-ec-ink">
              {order.fulfillmentMethod ? fulfillmentMethodLabels[order.fulfillmentMethod] : "A confirmer"}
            </p>
            <p className="mt-1 text-xs font-semibold text-ec-muted">
              {fulfillmentStatusLabels[order.fulfillmentStatus]}
            </p>
          </div>
          <div className="rounded-[1.25rem] bg-ec-paper p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ec-muted">Contact</p>
            <p className="mt-2 text-sm font-black text-ec-ink">{order.guestEmail}</p>
            <p className="mt-1 text-xs font-semibold text-ec-muted">{order.guestPhone}</p>
          </div>
        </div>

        {deliveryAddress ? (
          <div className="mt-5 rounded-[1.25rem] border border-ec-line p-4 text-sm font-semibold text-ec-muted">
            {deliveryAddress}
          </div>
        ) : null}
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px]">
        <section className="space-y-4">
          {order.items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-[1.5rem] border border-ec-line bg-white p-4 sm:grid-cols-[96px_1fr_auto]"
            >
              <div className="relative aspect-square overflow-hidden rounded-[1rem] bg-ec-stone">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ec-muted">
                  SKU {item.sku}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-ec-ink">{item.name}</h2>
                <p className="mt-2 text-sm font-semibold text-ec-muted">
                  {item.quantity} {item.stockUnit}
                </p>
              </div>
              <div className="text-right text-sm font-black text-ec-ink">
                {formatPriceTnd(item.lineTotalTtc) ?? "Sur devis"}
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-[1.5rem] border border-ec-line bg-white p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-black text-ec-ink">Total</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between text-ec-muted">
              <span>Sous-total TTC</span>
              <span className="font-semibold text-ec-ink">
                {formatPriceTnd(order.subtotalTtc) ?? "Sur devis"}
              </span>
            </div>
            <div className="flex justify-between text-ec-muted">
              <span>TVA incluse</span>
              <span className="font-semibold text-ec-ink">
                {formatPriceTnd(order.taxTtc) ?? formatPriceTnd(0)}
              </span>
            </div>
            {Number(order.discountTtc) > 0 ? (
              <div className="flex justify-between text-ec-muted">
                <span>Réduction</span>
                <span className="font-semibold text-emerald-700">
                  -{formatPriceTnd(order.discountTtc) ?? formatPriceTnd(0)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between text-ec-muted">
              <span>Livraison</span>
              <span className="font-semibold text-ec-ink">
                {formatPriceTnd(order.shippingTtc) ?? formatPriceTnd(0)}
              </span>
            </div>
          </div>
          <div className="mt-5 flex justify-between border-t border-ec-line pt-5 text-base font-black text-ec-ink">
            <span>Total</span>
            <span>{formatPriceTnd(order.totalTtc) ?? "Sur devis"}</span>
          </div>
          <div className="mt-6 rounded-2xl bg-ec-paper p-4 text-sm leading-7 text-ec-muted">
            COBAM confirmera la disponibilite, la livraison et les details de paiement.
          </div>
        </aside>
      </div>
    </main>
  );
}
