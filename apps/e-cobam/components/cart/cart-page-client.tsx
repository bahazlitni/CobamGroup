"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CreditCard, Loader2, Trash2 } from "lucide-react";
import {
  CART_UPDATED_EVENT,
  EMPTY_CART,
  clearCart,
  clearStoredCouponCode,
  readCart,
  readStoredCouponCode,
  storeCouponCode,
  updateCartLine,
  validatePromotionCode,
  type CartLine,
  type CartState,
} from "@/lib/cart-store";
import { formatPriceTnd } from "@/lib/format";
import type { PromotionQuote } from "@/lib/promotion-types";
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
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [promotion, setPromotion] = useState<PromotionQuote | null>(null);
  const [couponPending, setCouponPending] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

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

  useEffect(() => {
    const storedCode = readStoredCouponCode();

    if (storedCode) {
      setCouponCode(storedCode);
      setAppliedCouponCode(storedCode);
    }
  }, []);

  useEffect(() => {
    if (!appliedCouponCode.trim() || cart.lines.length === 0) {
      setPromotion(null);
      return;
    }

    let mounted = true;

    async function refreshPromotion() {
      try {
        const quote = await validatePromotionCode(appliedCouponCode);

        if (mounted) {
          setPromotion(quote);
          setCouponMessage(quote.message);
        }
      } catch (cause) {
        if (mounted) {
          setPromotion(null);
          setCouponMessage(cause instanceof Error ? cause.message : "Code promo invalide.");
        }
      }
    }

    void refreshPromotion();

    return () => {
      mounted = false;
    };
  }, [cart.lines.length, cart.summary.subtotalTtc, appliedCouponCode]);

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

  async function handleApplyCoupon(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = couponCode.trim();

    if (!code) {
      clearStoredCouponCode();
      setPromotion(null);
      setCouponMessage(null);
      return;
    }

    setCouponPending(true);
    setCouponMessage(null);

    try {
      const quote = await validatePromotionCode(code);
      setPromotion(quote);
      setCouponCode(quote.code);
      setAppliedCouponCode(quote.code);
      storeCouponCode(quote.code);
      setCouponMessage(quote.message);
    } catch (cause) {
      setPromotion(null);
      setCouponMessage(cause instanceof Error ? cause.message : "Code promo invalide.");
    } finally {
      setCouponPending(false);
    }
  }

  function handleRemoveCoupon() {
    clearStoredCouponCode();
    setCouponCode("");
    setAppliedCouponCode("");
    setPromotion(null);
    setCouponMessage(null);
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
          <form onSubmit={handleApplyCoupon} className="mt-5 rounded-2xl bg-ec-paper p-3">
            <label className="text-xs font-bold uppercase tracking-[0.18em] text-ec-muted">
              Code promo
            </label>
            <div className="mt-2 flex gap-2">
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                placeholder="COBAM"
                className="min-w-0 flex-1 rounded-full border border-ec-line bg-white px-4 py-2 text-sm font-semibold text-ec-ink outline-none focus:border-ec-blue"
              />
              <button
                type="submit"
                disabled={couponPending}
                className="rounded-full bg-ec-ink px-4 py-2 text-sm font-black text-white [color:#fff] disabled:opacity-60"
              >
                {couponPending ? "..." : "OK"}
              </button>
            </div>
            {couponMessage ? (
              <p className={`mt-2 text-xs font-semibold ${promotion ? "text-emerald-700" : "text-rose-700"}`}>
                {couponMessage}
              </p>
            ) : null}
            {promotion ? (
              <button
                type="button"
                className="mt-2 text-xs font-black text-ec-muted hover:text-ec-ink"
                onClick={handleRemoveCoupon}
              >
                Retirer le code
              </button>
            ) : null}
          </form>
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
            {promotion && Number(promotion.discountTtc) > 0 ? (
              <div className="flex justify-between text-ec-muted">
                <span>Réduction</span>
                <span className="font-semibold text-emerald-700">
                  -{formatPriceTnd(promotion.discountTtc) ?? formatPriceTnd(0)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between text-ec-muted">
              <span>Livraison</span>
              <span className="font-semibold text-ec-ink">
                {formatPriceTnd(cart.summary.deliveryEstimateTtc) ?? "Etape suivante"}
              </span>
            </div>
          </div>
          <div className="mt-5 flex justify-between border-t border-ec-line pt-5 text-base font-black text-ec-ink">
            <span>Total</span>
            <span>{cartTotalLabel(promotion?.totalTtc ?? cart.summary.totalTtc)}</span>
          </div>
          {cart.summary.hasQuoteLines ? (
            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-800">
              Certaines lignes restent sur devis. Elles seront confirmees pendant le checkout.
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-ec-paper p-4 text-sm leading-7 text-ec-muted">
              Les prix sont capturés dans le panier et revalidés à chaque modification de quantité.
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
