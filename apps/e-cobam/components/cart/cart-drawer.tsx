"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, Loader2, ShoppingBag, X } from "lucide-react";
import { CartBadge } from "@/components/cart/cart-badge";
import { QuantityStepper } from "@/components/commerce/quantity-stepper";
import {
  CART_UPDATED_EVENT,
  EMPTY_CART,
  readCart,
  updateCartLine,
  type CartLine,
  type CartState,
} from "@/lib/cart-store";
import { formatPriceTnd } from "@/lib/format";
import { pushUndoToast } from "@/lib/undo-actions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function totalLabel(value: string | null | undefined, fallback = "Sur devis") {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? formatPriceTnd(value ?? null) : fallback;
}

function DrawerLineQuantity({
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
      className="h-11 w-32 shadow-none [&_button]:size-11"
    />
  );
}

export function CartDrawer({
  active = false,
  open,
  onOpenChange,
}: {
  active?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;
  const [cart, setCart] = useState<CartState>(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const itemCount = cart.summary.itemCount;

  useEffect(() => {
    let mounted = true;

    async function refresh(showLoading = false) {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const nextCart = await readCart();
        if (mounted) {
          setCart(nextCart);
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

  const summaryLines = useMemo(
    () => [
      ["Sous-total TTC", totalLabel(cart.summary.subtotalTtc)],
      ["Total", totalLabel(cart.summary.totalTtc)],
    ],
    [cart.summary.subtotalTtc, cart.summary.totalTtc],
  );

  async function handleQuantity(productId: number, quantity: number) {
    const previousLine = cart.lines.find((line) => line.id === productId) ?? null;
    setPendingProductId(productId);

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
    } finally {
      setPendingProductId(null);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button type="button" aria-label="Ouvrir le panier">
          <CartBadge active={active || isOpen} />
        </button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader className="border-b border-ec-line">
          <SheetTitle>Panier</SheetTitle>
          <SheetDescription>
            {itemCount > 0 ? `${itemCount} article${itemCount > 1 ? "s" : ""} dans votre panier.` : "Votre panier est vide."}
          </SheetDescription>
        </SheetHeader>

        <div className="commerce-thin-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="grid h-48 place-items-center">
              <Loader2 className="size-7 animate-spin text-ec-blue" />
            </div>
          ) : cart.lines.length > 0 ? (
            <div className="space-y-3">
              {cart.lines.map((line) => (
                <article
                  key={line.id}
                  className="grid grid-cols-[5rem_1fr] gap-3 rounded-2xl border border-ec-line bg-white p-3"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
                    {line.imageUrl ? (
                      <Image
                        src={line.imageUrl}
                        alt={line.name}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-ec-muted/45">
                        <ShoppingBag className="size-7" />
                      </div>
                    )}
                  </div>
                  <div className="relative min-w-0 pr-9">
                    <button
                      type="button"
                      aria-label="Retirer du panier"
                      title="Retirer du panier"
                      disabled={pendingProductId === line.id}
                      onClick={() => void handleQuantity(line.id, 0)}
                      className="absolute right-0 top-0 grid size-8 place-items-center rounded-full border border-ec-line bg-white text-ec-muted transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-50"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-mono text-[10px] font-black tracking-[0.18em] text-ec-muted">
                        {line.sku}
                      </p>
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-sm font-black text-ec-ink">{line.name}</h3>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <DrawerLineQuantity
                        line={line}
                        disabled={pendingProductId === line.id}
                        onChange={(productId, nextQuantity) =>
                          void handleQuantity(productId, nextQuantity)
                        }
                      />
                      <p className="shrink-0 text-sm font-black text-ec-ink">
                        {formatPriceTnd(line.lineTotalTtc) ?? "Sur devis"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-ec-line bg-ec-paper/70 px-6 py-12 text-center">
              <ShoppingBag className="mx-auto size-9 text-ec-blue" />
              <h3 className="mt-4 text-xl font-black text-ec-ink">Panier vide</h3>
              <p className="mt-2 text-sm font-semibold text-ec-muted">
                Ajoutez des produits depuis le catalogue.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-ec-line bg-white p-5">
          <div className="space-y-3 text-sm">
            {summaryLines.map(([label, value], index) => (
              <div
                key={label}
                className={index === summaryLines.length - 1 ? "flex justify-between text-base font-black" : "flex justify-between text-ec-muted"}
              >
                <span>{label}</span>
                <span className="font-black text-ec-ink">{value}</span>
              </div>
            ))}
          </div>
          <Link
            href="/checkout"
            onClick={() => handleOpenChange(false)}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ec-ink px-5 text-sm font-black text-white transition hover:bg-ec-blue"
          >
            <CreditCard className="size-4" />
            Passer au checkout
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
