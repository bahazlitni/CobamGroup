"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getMailtoHref } from "@cobam/shared";
import { ArrowRight, CreditCard, Loader2, Trash2, X } from "lucide-react";
import {
  CART_UPDATED_EVENT,
  EMPTY_CART,
  clearCart,
  clearStoredCouponCode,
  readCart,
  readStoredCouponCode,
  restoreCartState,
  storeCouponCode,
  updateCartLine,
  validatePromotionCode,
  type CartLine,
  type CartState,
} from "@/lib/cart-store";
import { formatPriceTnd } from "@/lib/format";
import type { PromotionQuote } from "@/lib/promotion-types";
import { QuantityStepper } from "@/components/commerce/quantity-stepper";
import { Button, ButtonLink } from "@/components/ui/button";
import { pushUndoToast } from "@/lib/undo-actions";

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

function CartLineQuantity({
  line,
  disabled,
  onChange,
}: {
  line: CartLine;
  disabled: boolean;
  onChange: (productId: number, quantity: number) => void;
}) {
  function handleChange(nextValue: number) {
    onChange(line.id, nextValue);
  }

  return (
    <QuantityStepper
      value={line.quantity}
      onChange={handleChange}
      min={0}
      disabled={disabled}
      className="h-12 w-36 shadow-none [&_button]:size-12"
    />
  );
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
    const previousLine = cart.lines.find((line) => line.id === productId) ?? null;

    try {
      const nextCart = await updateCartLine(productId, quantity);
      setCart(nextCart);

      if (quantity <= 0 && previousLine) {
        pushUndoToast({
          title: "Produit retire du panier",
          description: previousLine.name,
          onUndo: async () => {
            setCart(await updateCartLine(previousLine.id, previousLine.quantity));
          },
        });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de modifier la quantite.");
    } finally {
      setPendingProductId(null);
    }
  }

  async function handleClearCart() {
    setClearing(true);
    setError(null);
    const previousCart = cart;

    try {
      const nextCart = await clearCart();
      setCart(nextCart);

      pushUndoToast({
        title: "Panier vide",
        description: `${previousCart.summary.itemCount} article(s) retires`,
        onUndo: async () => {
          setCart(await restoreCartState(previousCart));
        },
      });
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
        <div className="border-ec-line mx-auto grid max-w-2xl place-items-center rounded-[2rem] border bg-white p-10 text-center">
          <Loader2 className="text-ec-blue size-8 animate-spin" />
          <p className="text-ec-muted mt-4 text-sm font-semibold">Chargement du panier</p>
        </div>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="commerce-container py-14">
        <div className="border-ec-line mx-auto max-w-2xl rounded-[2rem] border border-dashed bg-white p-10 text-center">
          <h1 className="text-ec-ink text-4xl font-black tracking-tight">Votre panier est vide</h1>
          <p className="text-ec-muted mt-4 text-sm leading-7">
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
          <p className="text-ec-blue text-sm font-semibold tracking-[0.24em] uppercase">Panier</p>
          <h1 className="text-ec-ink mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Préparer la demande
          </h1>
        </div>
        <Button
          type="button"
          variant="secondary"
          icon={
            clearing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />
          }
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
              className="border-ec-line relative grid gap-4 rounded-[1.5rem] border bg-white p-4 pr-14 sm:grid-cols-[120px_1fr_auto]"
            >
              <button
                type="button"
                aria-label="Retirer du panier"
                title="Retirer du panier"
                className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-ec-line bg-white text-ec-muted transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-50"
                disabled={pendingProductId === line.id}
                onClick={() => void handleQuantity(line.id, 0)}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
              <div className="relative aspect-square overflow-hidden rounded-[1.2rem] bg-white">
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
                <p className="text-ec-muted text-xs font-semibold tracking-[0.2em] uppercase">
                  SKU {line.sku}
                </p>
                <h2 className="text-ec-ink mt-2 text-xl font-semibold">{line.name}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                  <span className="text-ec-muted">{formatPriceTnd(line.price) ?? "Sur devis"}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${stockToneClass(line.stock.tone)}`}
                  >
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
                <CartLineQuantity
                  line={line}
                  disabled={pendingProductId === line.id}
                  onChange={(productId, nextQuantity) => void handleQuantity(productId, nextQuantity)}
                />
                <div className="text-right">
                  <p className="text-ec-ink text-sm font-black">
                    {formatPriceTnd(line.lineTotalTtc) ?? "Sur devis"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="border-ec-line h-fit rounded-[1.5rem] border bg-white p-6 lg:sticky lg:top-28">
          <h2 className="text-ec-ink text-xl font-black">Résumé</h2>
          <form onSubmit={handleApplyCoupon} className="bg-ec-paper mt-5 rounded-2xl p-3">
            <label className="text-ec-muted text-xs font-bold tracking-[0.18em] uppercase">
              Code promo
            </label>
            <div className="mt-2 flex gap-2">
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                placeholder="COBAM"
                className="border-ec-line text-ec-ink focus:border-ec-blue min-w-0 flex-1 rounded-full border bg-white px-4 py-2 text-sm font-semibold outline-none"
              />
              <button
                type="submit"
                disabled={couponPending}
                className="bg-ec-ink rounded-full px-4 py-2 text-sm font-black [color:#fff] text-white disabled:opacity-60"
              >
                {couponPending ? "..." : "OK"}
              </button>
            </div>
            {couponMessage ? (
              <p
                className={`mt-2 text-xs font-semibold ${promotion ? "text-emerald-700" : "text-rose-700"}`}
              >
                {couponMessage}
              </p>
            ) : null}
            {promotion ? (
              <button
                type="button"
                className="text-ec-muted hover:text-ec-ink mt-2 text-xs font-black"
                onClick={handleRemoveCoupon}
              >
                Retirer le code
              </button>
            ) : null}
          </form>
          <div className="mt-5 space-y-4 text-sm">
            <div className="text-ec-muted flex justify-between">
              <span>Articles</span>
              <span>{cart.summary.itemCount}</span>
            </div>
            <div className="text-ec-muted flex justify-between">
              <span>Sous-total TTC</span>
              <span className="text-ec-ink font-semibold">
                {cartTotalLabel(cart.summary.subtotalTtc)}
              </span>
            </div>
            <div className="text-ec-muted flex justify-between">
              <span>TVA incluse</span>
              <span className="text-ec-ink font-semibold">
                {cartTotalLabel(cart.summary.taxTtc, formatPriceTnd(0) ?? "0 TND")}
              </span>
            </div>
            {promotion && Number(promotion.discountTtc) > 0 ? (
              <div className="text-ec-muted flex justify-between">
                <span>Réduction</span>
                <span className="font-semibold text-emerald-700">
                  -{formatPriceTnd(promotion.discountTtc) ?? formatPriceTnd(0)}
                </span>
              </div>
            ) : null}
            <div className="text-ec-muted flex justify-between">
              <span>Livraison</span>
              <span className="text-ec-ink font-semibold">
                {formatPriceTnd(cart.summary.deliveryEstimateTtc) ?? "Etape suivante"}
              </span>
            </div>
          </div>
          <div className="border-ec-line text-ec-ink mt-5 flex justify-between border-t pt-5 text-base font-black">
            <span>Total</span>
            <span>{cartTotalLabel(promotion?.totalTtc ?? cart.summary.totalTtc)}</span>
          </div>

          <ButtonLink
            href="/checkout"
            className="mt-6 w-full"
            icon={<CreditCard className="size-4" />}
          >
            Passer au checkout
          </ButtonLink>
          <a
            href={getMailtoHref({ subject: "Demande e-cobam", body: mailBody })}
            className="text-ec-muted hover:text-ec-ink mt-3 block text-center text-sm font-semibold"
          >
            Envoyer par email
          </a>
          <Link
            href="/catalogue"
            className="text-ec-muted hover:text-ec-ink mt-4 block text-center text-sm font-semibold"
          >
            Continuer vos achats
          </Link>
        </aside>
      </div>
    </main>
  );
}
