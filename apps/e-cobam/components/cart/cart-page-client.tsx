"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import {
  CART_UPDATED_EVENT,
  clearCart,
  readCart,
  updateCartLine,
  type CartLine,
} from "@/lib/cart-store";
import { formatPriceTnd } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/button";

function lineTotal(line: CartLine) {
  if (!line.price) {
    return null;
  }

  const price = Number(line.price);
  if (!Number.isFinite(price)) {
    return null;
  }

  return price * line.quantity;
}

export function CartPageClient() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    const refresh = () => setLines(readCart());

    refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const total = lineTotal(line);
        return total == null ? sum : sum + total;
      }, 0),
    [lines],
  );

  if (lines.length === 0) {
    return (
      <div className="commerce-container py-14">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-dashed border-ec-line bg-white p-10 text-center">
          <h1 className="text-4xl font-black tracking-tight text-ec-ink">Votre panier est vide</h1>
          <p className="mt-4 text-sm leading-7 text-ec-muted">
            Ajoutez des produits depuis le catalogue. Le panier est déjà prêt côté UX et sera
            branché aux commandes dès que les modèles checkout seront ajoutés.
          </p>
          <ButtonLink href="/catalogue" className="mt-7" icon={<ArrowRight className="size-4" />}>
            Explorer le catalogue
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <main className="commerce-container py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">Panier</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ec-ink sm:text-6xl">
            Préparer la demande
          </h1>
        </div>
        <Button
          type="button"
          variant="secondary"
          icon={<Trash2 className="size-4" />}
          onClick={() => {
            clearCart();
            setLines([]);
          }}
        >
          Vider
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <section className="space-y-4">
          {lines.map((line) => (
            <article key={line.id} className="grid gap-4 rounded-[1.5rem] border border-ec-line bg-white p-4 sm:grid-cols-[120px_1fr_auto]">
              <div className="relative aspect-square overflow-hidden rounded-[1.2rem] bg-ec-stone">
                {line.imageUrl ? (
                  <Image
                    src={line.imageUrl}
                    alt={line.name}
                    fill
                    sizes="120px"
                    className="object-contain p-2"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ec-muted">
                  SKU {line.sku}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ec-ink">{line.name}</h2>
                <p className="mt-3 text-sm font-semibold text-ec-muted">
                  {formatPriceTnd(line.price) ?? "Sur devis"}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:justify-between">
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  aria-label={`Quantité ${line.name}`}
                  onChange={(event) => {
                    const next = updateCartLine(line.id, Number(event.target.value));
                    setLines(next);
                  }}
                  className="h-11 w-24 rounded-full border border-ec-line px-4 text-center font-semibold outline-none focus:border-ec-blue"
                />
                <button
                  type="button"
                  className="rounded-full px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  onClick={() => setLines(updateCartLine(line.id, 0))}
                >
                  Retirer
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-[1.5rem] border border-ec-line bg-white p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-black text-ec-ink">Résumé</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between text-ec-muted">
              <span>Articles</span>
              <span>{lines.reduce((sum, line) => sum + line.quantity, 0)}</span>
            </div>
            <div className="flex justify-between text-ec-muted">
              <span>Total estimatif</span>
              <span className="font-semibold text-ec-ink">
                {subtotal > 0 ? formatPriceTnd(subtotal) : "Sur devis"}
              </span>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-ec-paper p-4 text-sm leading-7 text-ec-muted">
            Le panier est local pour le moment. La prochaine étape backend sera de le convertir en
            demande de devis, commande ou session checkout.
          </div>
          <a
            href={`mailto:contact@cobamgroup.com?subject=${encodeURIComponent("Demande e-cobam")}&body=${encodeURIComponent(
              lines.map((line) => `${line.quantity} x ${line.name} (${line.sku})`).join("\n"),
            )}`}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-ec-ink px-5 text-sm font-semibold text-white transition hover:bg-ec-blue"
          >
            Envoyer la demande
          </a>
          <Link href="/catalogue" className="mt-4 block text-center text-sm font-semibold text-ec-muted hover:text-ec-ink">
            Continuer vos achats
          </Link>
        </aside>
      </div>
    </main>
  );
}
