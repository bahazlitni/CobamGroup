import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/cart-page-client";

export const metadata: Metadata = {
  title: "Panier",
  description: "Préparez votre panier e-cobam.",
};

export default function CartPage() {
  return <CartPageClient />;
}
