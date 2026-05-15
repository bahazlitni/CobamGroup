"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { addCartItem, type CartItemSnapshot } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  item,
  quantity,
}: {
  item: CartItemSnapshot;
  quantity: number;
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
    <div className="w-full space-y-2 sm:w-auto">
      <Button
        type="button"
        size="lg"
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
