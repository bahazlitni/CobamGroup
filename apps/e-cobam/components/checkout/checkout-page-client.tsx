"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import {
  CART_UPDATED_EVENT,
  EMPTY_CART,
  clearStoredCouponCode,
  readCart,
  readStoredCouponCode,
  storeCouponCode,
  validatePromotionCode,
  type CartState,
} from "@/lib/cart-store";
import { formatPriceTnd } from "@/lib/format";
import type { PromotionQuote } from "@/lib/promotion-types";
import { Button, ButtonLink } from "@/components/ui/button";

type FulfillmentMethod = "DELIVERY" | "PICKUP";
type PaymentMethod = "BANK_TRANSFER" | "CASH_ON_DELIVERY" | "PAY_IN_STORE";

const inputClass =
  "h-12 w-full rounded-2xl border border-ec-line bg-white px-4 text-sm font-semibold text-ec-ink outline-none transition focus:border-ec-blue";
const textareaClass =
  "min-h-28 w-full rounded-2xl border border-ec-line bg-white px-4 py-3 text-sm font-semibold text-ec-ink outline-none transition focus:border-ec-blue";
const labelClass = "text-xs font-bold uppercase tracking-[0.18em] text-ec-muted";

function totalLabel(value: string, fallback = "Sur devis") {
  const amount = Number(value);
  return amount > 0 ? formatPriceTnd(value) : fallback;
}

export function CheckoutPageClient() {
  const router = useRouter();
  const [cart, setCart] = useState<CartState>(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("DELIVERY");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [promotion, setPromotion] = useState<PromotionQuote | null>(null);
  const [couponPending, setCouponPending] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
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

    void refresh();

    return () => {
      mounted = false;
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

  const itemLines = useMemo(
    () => cart.lines.map((line) => `${line.quantity} x ${line.name}`).join(", "),
    [cart.lines],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/order", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName,
            lastName,
            companyName,
            email,
            phone,
          },
          fulfillment: {
            method: fulfillmentMethod,
            address: {
              addressLine1,
              addressLine2,
              city,
              governorate,
              postalCode,
            },
          },
          payment: { method: paymentMethod },
          notes,
          couponCode: promotion?.code ?? (appliedCouponCode || undefined),
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "Impossible de finaliser la commande.");
      }

      const result = (await response.json()) as { orderNumber: string };
      clearStoredCouponCode();
      window.dispatchEvent(new CustomEvent<CartState>(CART_UPDATED_EVENT, { detail: EMPTY_CART }));
      router.push(`/commande/${encodeURIComponent(result.orderNumber)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de finaliser la commande.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApplyCoupon(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const code = couponCode.trim();

    if (!code) {
      clearStoredCouponCode();
      setAppliedCouponCode("");
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

  if (loading) {
    return (
      <main className="commerce-container py-14">
        <div className="mx-auto grid max-w-2xl place-items-center rounded-[2rem] border border-ec-line bg-white p-10 text-center">
          <Loader2 className="size-8 animate-spin text-ec-blue" />
          <p className="mt-4 text-sm font-semibold text-ec-muted">Chargement du checkout</p>
        </div>
      </main>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <main className="commerce-container py-14">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-dashed border-ec-line bg-white p-10 text-center">
          <h1 className="text-4xl font-black tracking-tight text-ec-ink">Votre panier est vide</h1>
          <p className="mt-4 text-sm leading-7 text-ec-muted">
            Ajoutez des produits avant de lancer le checkout.
          </p>
          {error ? <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p> : null}
          <ButtonLink href="/catalogue" className="mt-7" icon={<ArrowRight className="size-4" />}>
            Explorer le catalogue
          </ButtonLink>
        </div>
      </main>
    );
  }

  return (
    <main className="commerce-container py-8 sm:py-12">
      <div className="mb-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">Checkout</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ec-ink sm:text-6xl">
          Finaliser la commande
        </h1>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <section className="space-y-5">
          <div className="rounded-[1.5rem] border border-ec-line bg-white p-5 sm:p-6">
            <h2 className="text-xl font-black text-ec-ink">Contact</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={labelClass}>Prenom</span>
                <input
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Nom</span>
                <input
                  required
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className={labelClass}>Société</span>
                <input
                  autoComplete="organization"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Email</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className={labelClass}>Téléphone</span>
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-ec-line bg-white p-5 sm:p-6">
            <h2 className="text-xl font-black text-ec-ink">Livraison</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-ec-line p-4 text-sm font-semibold text-ec-ink transition has-[:checked]:border-ec-blue has-[:checked]:bg-ec-blue/5">
                <input
                  type="radio"
                  name="fulfillment"
                  value="DELIVERY"
                  checked={fulfillmentMethod === "DELIVERY"}
                  onChange={() => setFulfillmentMethod("DELIVERY")}
                />
                Livraison chantier / domicile
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-ec-line p-4 text-sm font-semibold text-ec-ink transition has-[:checked]:border-ec-blue has-[:checked]:bg-ec-blue/5">
                <input
                  type="radio"
                  name="fulfillment"
                  value="PICKUP"
                  checked={fulfillmentMethod === "PICKUP"}
                  onChange={() => setFulfillmentMethod("PICKUP")}
                />
                Retrait en magasin
              </label>
            </div>

            {fulfillmentMethod === "DELIVERY" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className={labelClass}>Adresse</span>
                  <input
                    required
                    autoComplete="address-line1"
                    value={addressLine1}
                    onChange={(event) => setAddressLine1(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <span className={labelClass}>Complément</span>
                  <input
                    autoComplete="address-line2"
                    value={addressLine2}
                    onChange={(event) => setAddressLine2(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="space-y-2">
                  <span className={labelClass}>Ville</span>
                  <input
                    required
                    autoComplete="address-level2"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="space-y-2">
                  <span className={labelClass}>Gouvernorat</span>
                  <input
                    autoComplete="address-level1"
                    value={governorate}
                    onChange={(event) => setGovernorate(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="space-y-2">
                  <span className={labelClass}>Code postal</span>
                  <input
                    autoComplete="postal-code"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-ec-paper p-4 text-sm font-semibold text-ec-muted">
                Retrait au point COBAM confirmé avec l'équipe commerciale.
              </div>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-ec-line bg-white p-5 sm:p-6">
            <h2 className="text-xl font-black text-ec-ink">Paiement</h2>
            <div className="mt-5 grid gap-3">
              {[
                ["BANK_TRANSFER", "Virement bancaire"],
                ["CASH_ON_DELIVERY", "Paiement a la livraison"],
                ["PAY_IN_STORE", "Paiement en magasin"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-ec-line p-4 text-sm font-semibold text-ec-ink transition has-[:checked]:border-ec-blue has-[:checked]:bg-ec-blue/5"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value as PaymentMethod)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <label className="block rounded-[1.5rem] border border-ec-line bg-white p-5 sm:p-6">
            <span className="text-xl font-black text-ec-ink">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={`${textareaClass} mt-5`}
              placeholder="Reference chantier, horaire souhaite, instructions de livraison..."
            />
          </label>
        </section>

        <aside className="h-fit rounded-[1.5rem] border border-ec-line bg-white p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-black text-ec-ink">Resume</h2>
          <p className="mt-2 text-sm leading-6 text-ec-muted">{itemLines}</p>
          <div className="mt-5 rounded-2xl bg-ec-paper p-3">
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
                type="button"
                disabled={couponPending}
                className="rounded-full bg-ec-ink px-4 py-2 text-sm font-black text-white [color:#fff] disabled:opacity-60"
                onClick={() => void handleApplyCoupon()}
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
          </div>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between text-ec-muted">
              <span>Articles</span>
              <span>{cart.summary.itemCount}</span>
            </div>
            <div className="flex justify-between text-ec-muted">
              <span>Sous-total TTC</span>
              <span className="font-semibold text-ec-ink">{totalLabel(cart.summary.subtotalTtc)}</span>
            </div>
            <div className="flex justify-between text-ec-muted">
              <span>TVA incluse</span>
              <span className="font-semibold text-ec-ink">
                {totalLabel(cart.summary.taxTtc, formatPriceTnd(0) ?? "0 TND")}
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
              <span className="font-semibold text-ec-ink">A confirmer</span>
            </div>
          </div>
          <div className="mt-5 flex justify-between border-t border-ec-line pt-5 text-base font-black text-ec-ink">
            <span>Total</span>
            <span>{totalLabel(promotion?.totalTtc ?? cart.summary.totalTtc)}</span>
          </div>
          {cart.summary.hasQuoteLines ? (
            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-800">
              Les lignes sur devis seront confirmees par l&apos;equipe COBAM.
            </div>
          ) : null}
          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={submitting}
            icon={submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          >
            {submitting ? "Validation..." : "Confirmer la commande"}
          </Button>
          <Link
            href="/panier"
            className="mt-4 block text-center text-sm font-semibold text-ec-muted hover:text-ec-ink"
          >
            Retour au panier
          </Link>
        </aside>
      </form>
    </main>
  );
}
