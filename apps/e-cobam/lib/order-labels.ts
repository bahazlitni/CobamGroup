import type {
  CommerceFulfillmentMethod,
  CommerceFulfillmentStatus,
  CommerceOrderStatus,
  CommercePaymentMethod,
  CommercePaymentStatus,
} from "@prisma/client";

export const orderStatusLabels: Record<CommerceOrderStatus, string> = {
  DRAFT: "Brouillon",
  PENDING: "Reçue",
  CONFIRMED: "Confirmée",
  PREPARING: "Préparation",
  READY_FOR_PICKUP: "Prête au retrait",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export const paymentStatusLabels: Record<CommercePaymentStatus, string> = {
  PENDING: "A confirmer",
  AUTHORIZED: "Autorisé",
  PAID: "Payé",
  FAILED: "Echoué",
  CANCELLED: "Annulé",
  REFUNDED: "Remboursé",
  PARTIALLY_REFUNDED: "Partiellement remboursé",
};

export const fulfillmentStatusLabels: Record<CommerceFulfillmentStatus, string> = {
  PENDING: "A planifier",
  SCHEDULED: "Planifié",
  PREPARING: "En préparation",
  READY: "Prêt",
  IN_TRANSIT: "En transit",
  DELIVERED: "Livré",
  FAILED: "Echec",
  CANCELLED: "Annulé",
};

export const paymentMethodLabels: Record<CommercePaymentMethod, string> = {
  BANK_TRANSFER: "Virement bancaire",
  CASH_ON_DELIVERY: "Paiement à la livraison",
  PAY_IN_STORE: "Paiement en magasin",
  CARD: "Carte bancaire",
};

export const fulfillmentMethodLabels: Record<CommerceFulfillmentMethod, string> = {
  DELIVERY: "Livraison",
  PICKUP: "Retrait en magasin",
};

export function orderStatusTone(status: CommerceOrderStatus) {
  if (status === "CANCELLED" || status === "REFUNDED") {
    return "bg-rose-50 text-rose-700";
  }

  if (status === "DELIVERED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "CONFIRMED" || status === "PREPARING" || status === "READY_FOR_PICKUP" || status === "SHIPPED") {
    return "bg-sky-50 text-sky-700";
  }

  return "bg-amber-50 text-amber-700";
}
