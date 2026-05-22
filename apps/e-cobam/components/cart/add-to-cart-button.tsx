"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { addCartItem, type CartItemSnapshot } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function AddToCartButton({
  item,
  quantity,
  size = "lg",
  className,
}: {
  item: CartItemSnapshot;
  quantity: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [added, setAdded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddToCart() {
    setPending(true);
    setError(null);

    try {
      await addCartItem(item, quantity);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d'ajouter ce produit.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cn("w-full space-y-2 sm:w-auto", className)}>
      <Button
        type="button"
        size={size}
        className="w-full sm:w-auto"
        icon={added ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
        disabled={pending}
        onClick={handleAddToCart}
      >
        {pending ? "Ajout..." : added ? "Dans le panier" : "Ajouter au panier"}
      </Button>
      {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
    </div>
  );
}
