"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AddToCartButton as AnimatedAddToCartButton,
  emitCartActionAnimation,
  type ProductActionSize,
} from "@/components/commerce/product-action-buttons";
import { addCartItem, readCart, updateCartLine, type CartItemSnapshot } from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import { pushUndoToast } from "@/lib/undo-actions";

export function AddToCartButton({
  item,
  quantity,
  size = "lg",
  iconOnly = false,
  className,
  buttonClassName,
  onAddedToCartAnimation,
  onRemovedFromCartAnimation,
}: {
  item: CartItemSnapshot;
  quantity: number;
  size?: ProductActionSize;
  iconOnly?: boolean;
  className?: string;
  buttonClassName?: string;
  onAddedToCartAnimation?: () => void;
  onRemovedFromCartAnimation?: () => void;
}) {
  const [added, setAdded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddToCart() {
    setPending(true);
    setError(null);

    try {
      const previousCart = await readCart();
      const previousLine = previousCart.lines.find((line) => line.id === item.id);
      await addCartItem(item, quantity);
      setAdded(true);
      pushUndoToast({
        title: "Ajouté au panier",
        description: quantity > 1 ? `${quantity} x ${item.name}` : item.name,
        onUndo: async () => {
          await updateCartLine(item.id, previousLine?.quantity ?? 0);
        },
      });
      window.setTimeout(() => setAdded(false), 1600);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Impossible d'ajouter ce produit.";
      setError(message);
      toast.error("Panier non mis à jour", {
        description: message,
      });
      throw cause;
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cn("w-full space-y-2 sm:w-auto", className)}>
      <AnimatedAddToCartButton
        isInCart={added}
        onToggle={handleAddToCart}
        size={size}
        iconOnly={iconOnly}
        disabled={pending}
        className={cn("w-full sm:w-auto", buttonClassName)}
        onAddedToCartAnimation={() => {
          emitCartActionAnimation("added");
          onAddedToCartAnimation?.();
        }}
        onRemovedFromCartAnimation={() => {
          emitCartActionAnimation("removed");
          onRemovedFromCartAnimation?.();
        }}
      />
      {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
    </div>
  );
}
