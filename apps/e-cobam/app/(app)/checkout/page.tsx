import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalisez votre demande e-cobam.",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
