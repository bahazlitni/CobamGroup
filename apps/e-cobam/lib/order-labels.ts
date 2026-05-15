import type {
  CommerceFulfillmentMethod,
  CommerceFulfillmentStatus,
  CommerceOrderStatus,
  CommercePaymentMethod,
  CommercePaymentStatus,
} from "@prisma/client";

export const orderStatusLabels: Record<CommerceOrderStatus, string> = {
  DRAFT: "Brouillon",
  PENDING: "Recue",
  CONFIRMED: "Confirmee",
  PREPARING: "Preparation",
  READY_FOR_PICKUP: "Prete au retrait",
  SHIPPED: "Expediee",
  DELIVERED: "Livree",
  CANCELLED: "Annulee",
  REFUNDED: "Remboursee",
};

export const paymentStatusLabels: Record<CommercePaymentStatus, string> = {
  PENDING: "A confirmer",
  AUTHORIZED: "Autorise",
  PAID: "Paye",
  FAILED: "Echoue",
  CANCELLED: "Annule",
  REFUNDED: "Rembourse",
  PARTIALLY_REFUNDED: "Partiellement rembourse",
};

export const fulfillmentStatusLabels: Record<CommerceFulfillmentStatus, string> = {
  PENDING: "A planifier",
  SCHEDULED: "Planifie",
  PREPARING: "En preparation",
  READY: "Pret",
  IN_TRANSIT: "En transit",
  DELIVERED: "Livre",
  FAILED: "Echec",
  CANCELLED: "Annule",
};

export const paymentMethodLabels: Record<CommercePaymentMethod, string> = {
  BANK_TRANSFER: "Virement bancaire",
  CASH_ON_DELIVERY: "Paiement a la livraison",
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
