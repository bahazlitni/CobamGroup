"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CreditCard, Loader2, Trash2 } from "lucide-react";
import {
  CART_UPDATED_EVENT,
  EMPTY_CART,
  clearCart,
  readCart,
  updateCartLine,
  type CartLine,
  type CartState,
} from "@/lib/cart-store";
import { formatPriceTnd } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/button";

function cartTotalLabel(value: string, fallback = "Sur devis") {
  const amount = Number(value);
  return amount > 0 ? formatPriceTnd(value) : fallback;
}

function stockToneClass(tone: CartLine["stock"]["tone"]) {
  if (tone === "available") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (tone === "warning") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-rose-50 text-rose-700";
}

export function CartPageClient() {
  const [cart, setCart] = useState<CartState>(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function refresh(showLoading = false) {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const next = await readCart();
        if (mounted) {
          setCart(next);
          setError(null);
        }
      } catch (cause) {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : "Impossible de charger le panier.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    function handleCartUpdated(event: Event) {
      const detail = (event as CustomEvent<CartState>).detail;

      if (detail?.lines) {
        setCart(detail);
        setLoading(false);
        return;
      }

      void refresh();
    }

    void refresh(true);
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      mounted = false;
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, []);

  const mailBody = useMemo(
    () => cart.lines.map((line) => `${line.quantity} x ${line.name} (${line.sku})`).join("\n"),
    [cart.lines],
  );

  async function handleQuantity(productId: number, quantity: number) {
    setPendingProductId(productId);
    setError(null);

    try {
      setCart(await updateCartLine(productId, quantity));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de modifier la quantite.");
    } finally {
      setPendingProductId(null);
    }
  }

  async function handleClearCart() {
    setClearing(true);
    setError(null);

    try {
      setCart(await clearCart());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de vider le panier.");
    } finally {
      setClearing(false);
    }
  }

  if (loading && cart.lines.length === 0) {
    return (
      <div className="commerce-container py-14">
        <div className="mx-auto grid max-w-2xl place-items-center rounded-[2rem] border border-ec-line bg-white p-10 text-center">
          <Loader2 className="size-8 animate-spin text-ec-blue" />
          <p className="mt-4 text-sm font-semibold text-ec-muted">Chargement du panier</p>
        </div>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="commerce-container py-14">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-dashed border-ec-line bg-white p-10 text-center">
          <h1 className="text-4xl font-black tracking-tight text-ec-ink">Votre panier est vide</h1>
          <p className="mt-4 text-sm leading-7 text-ec-muted">
            Ajoutez des produits depuis le catalogue. Le panier est maintenant conserve entre les
            visites et pret a devenir une session checkout.
          </p>
          {error ? <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p> : null}
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
          icon={clearing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          disabled={clearing}
          onClick={handleClearCart}
        >
          Vider
        </Button>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <section className="space-y-4">
          {cart.lines.map((line) => (
            <article
              key={line.id}
              className="grid gap-4 rounded-[1.5rem] border border-ec-line bg-white p-4 sm:grid-cols-[120px_1fr_auto]"
            >
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
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                  <span className="text-ec-muted">{formatPriceTnd(line.price) ?? "Sur devis"}</span>
                  <span className={`rounded-full px-3 py-1 text-xs ${stockToneClass(line.stock.tone)}`}>
                    {line.stock.label}
                  </span>
                </div>
                {line.priceChanged ? (
                  <p className="mt-3 text-sm font-semibold text-amber-700">
                    Prix mis a jour depuis l&apos;ajout au panier.
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:justify-between">
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  aria-label={`Quantite ${line.name}`}
                  disabled={pendingProductId === line.id}
                  onChange={(event) => {
                    if (event.target.value === "") {
                      return;
                    }

                    void handleQuantity(line.id, Number(event.target.value));
                  }}
                  className="h-11 w-24 rounded-full border border-ec-line px-4 text-center font-semibold outline-none focus:border-ec-blue disabled:opacity-60"
                />
                <div className="text-right">
                  <p className="text-sm font-black text-ec-ink">
                    {formatPriceTnd(line.lineTotalTtc) ?? "Sur devis"}
                  </p>
                  <button
                    type="button"
                    className="mt-2 rounded-full px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                    disabled={pendingProductId === line.id}
                    onClick={() => void handleQuantity(line.id, 0)}
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-[1.5rem] border border-ec-line bg-white p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-black text-ec-ink">Résumé</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between text-ec-muted">
              <span>Articles</span>
              <span>{cart.summary.itemCount}</span>
            </div>
            <div className="flex justify-between text-ec-muted">
              <span>Sous-total TTC</span>
              <span className="font-semibold text-ec-ink">
                {cartTotalLabel(cart.summary.subtotalTtc)}
              </span>
            </div>
            <div className="flex justify-between text-ec-muted">
              <span>TVA incluse</span>
              <span className="font-semibold text-ec-ink">
                {cartTotalLabel(cart.summary.taxTtc, formatPriceTnd(0) ?? "0 TND")}
              </span>
            </div>
            <div className="flex justify-between text-ec-muted">
              <span>Livraison</span>
              <span className="font-semibold text-ec-ink">
                {formatPriceTnd(cart.summary.deliveryEstimateTtc) ?? "Etape suivante"}
              </span>
            </div>
          </div>
          <div className="mt-5 flex justify-between border-t border-ec-line pt-5 text-base font-black text-ec-ink">
            <span>Total</span>
            <span>{cartTotalLabel(cart.summary.totalTtc)}</span>
          </div>
          {cart.summary.hasQuoteLines ? (
            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-800">
              Certaines lignes restent sur devis. Elles seront confirmees pendant le checkout.
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-ec-paper p-4 text-sm leading-7 text-ec-muted">
              Les prix sont captures dans le panier et revalides a chaque modification de quantite.
            </div>
          )}
          <ButtonLink
            href="/checkout"
            className="mt-6 w-full"
            icon={<CreditCard className="size-4" />}
          >
            Passer au checkout
          </ButtonLink>
          <a
            href={`mailto:contact@cobamgroup.com?subject=${encodeURIComponent("Demande e-cobam")}&body=${encodeURIComponent(mailBody)}`}
            className="mt-3 block text-center text-sm font-semibold text-ec-muted hover:text-ec-ink"
          >
            Envoyer par email
          </a>
          <Link
            href="/catalogue"
            className="mt-4 block text-center text-sm font-semibold text-ec-muted hover:text-ec-ink"
          >
            Continuer vos achats
          </Link>
        </aside>
      </div>
    </main>
  );
}
