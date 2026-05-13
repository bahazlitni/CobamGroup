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

  return (
    <Button
      type="button"
      size="lg"
      className="w-full sm:w-auto"
      icon={added ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
      onClick={() => {
        addCartItem(item, quantity);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? "Ajouté au panier" : "Ajouter au panier"}
    </Button>
  );
}
