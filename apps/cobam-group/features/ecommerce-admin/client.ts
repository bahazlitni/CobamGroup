"use client";

import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  EcommerceCustomersAdminDto,
  EcommerceCouponInput,
  EcommerceFulfillmentStatusInput,
  EcommerceFulfillmentsAdminDto,
  EcommerceOrderStatusInput,
  EcommerceOrdersAdminDto,
  EcommercePaymentStatusInput,
  EcommercePaymentsAdminDto,
  EcommercePromotionInput,
  EcommercePromotionsAdminDto,
} from "./types";

type ApiFail = { ok: false; message?: string };
type ApiOk<T> = { ok: true } & T;

export class EcommerceAdminClientError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function getErrorMessage(data: ApiFail | ApiOk<unknown> | null | undefined) {
  return data && "message" in data ? data.message : undefined;
}

async function unwrapResponse<T>(res: Response, fallback: string): Promise<T> {
  const data = await parseJsonSafe<ApiOk<T> | ApiFail>(res);

  if (!res.ok || !data?.ok) {
    throw new EcommerceAdminClientError(getErrorMessage(data) || fallback, res.status);
  }

  return data;
}

export async function listEcommerceOrdersAdminClient(): Promise<EcommerceOrdersAdminDto> {
  const res = await staffApiFetch("/api/staff/ecommerce/orders", {
    method: "GET",
    auth: true,
  });

  return unwrapResponse<EcommerceOrdersAdminDto>(
    res,
    "Impossible de charger les commandes e-commerce.",
  );
}

export async function updateEcommerceOrderStatusAdminClient(
  id: string,
  input: EcommerceOrderStatusInput,
) {
  const res = await staffApiFetch("/api/staff/ecommerce/orders", {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data: input }),
  });

  await unwrapResponse<Record<string, never>>(res, "Impossible de mettre a jour la commande.");
}

export async function listEcommerceCustomersAdminClient(): Promise<EcommerceCustomersAdminDto> {
  const res = await staffApiFetch("/api/staff/ecommerce/customers", {
    method: "GET",
    auth: true,
  });

  return unwrapResponse<EcommerceCustomersAdminDto>(
    res,
    "Impossible de charger les comptes clients e-commerce.",
  );
}

export async function listEcommercePromotionsAdminClient(): Promise<EcommercePromotionsAdminDto> {
  const res = await staffApiFetch("/api/staff/ecommerce/promotions", {
    method: "GET",
    auth: true,
  });

  return unwrapResponse<EcommercePromotionsAdminDto>(
    res,
    "Impossible de charger les promotions e-commerce.",
  );
}

export async function createEcommercePromotionAdminClient(input: EcommercePromotionInput) {
  const res = await staffApiFetch("/api/staff/ecommerce/promotions", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await unwrapResponse<{ item: { id: string } }>(
    res,
    "Impossible de creer la promotion.",
  );

  return data.item;
}

export async function updateEcommercePromotionAdminClient(
  id: string,
  input: EcommercePromotionInput,
) {
  const res = await staffApiFetch("/api/staff/ecommerce/promotions", {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data: input }),
  });

  const data = await unwrapResponse<{ item: { id: string } }>(
    res,
    "Impossible de mettre a jour la promotion.",
  );

  return data.item;
}

export async function deleteEcommercePromotionAdminClient(id: string) {
  const res = await staffApiFetch(`/api/staff/ecommerce/promotions?id=${id}`, {
    method: "DELETE",
    auth: true,
  });

  await unwrapResponse<Record<string, never>>(
    res,
    "Impossible de supprimer ou archiver la promotion.",
  );
}

export async function createEcommerceCouponAdminClient(
  promotionId: string,
  input: EcommerceCouponInput,
) {
  const res = await staffApiFetch(`/api/staff/ecommerce/promotions/${promotionId}/coupons`, {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await unwrapResponse<{ item: { id: string } }>(
    res,
    "Impossible de creer le coupon.",
  );

  return data.item;
}

export async function updateEcommerceCouponAdminClient(
  promotionId: string,
  couponId: string,
  input: EcommerceCouponInput,
) {
  const res = await staffApiFetch(`/api/staff/ecommerce/promotions/${promotionId}/coupons`, {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: couponId, data: input }),
  });

  const data = await unwrapResponse<{ item: { id: string } }>(
    res,
    "Impossible de mettre a jour le coupon.",
  );

  return data.item;
}

export async function deleteEcommerceCouponAdminClient(promotionId: string, couponId: string) {
  const res = await staffApiFetch(
    `/api/staff/ecommerce/promotions/${promotionId}/coupons?couponId=${couponId}`,
    {
      method: "DELETE",
      auth: true,
    },
  );

  await unwrapResponse<Record<string, never>>(
    res,
    "Impossible de supprimer ou desactiver le coupon.",
  );
}

export async function listEcommercePaymentsAdminClient(): Promise<EcommercePaymentsAdminDto> {
  const res = await staffApiFetch("/api/staff/ecommerce/payments", {
    method: "GET",
    auth: true,
  });

  return unwrapResponse<EcommercePaymentsAdminDto>(
    res,
    "Impossible de charger les paiements e-commerce.",
  );
}

export async function updateEcommercePaymentStatusAdminClient(
  id: string,
  input: EcommercePaymentStatusInput,
) {
  const res = await staffApiFetch("/api/staff/ecommerce/payments", {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data: input }),
  });

  await unwrapResponse<Record<string, never>>(res, "Impossible de mettre a jour le paiement.");
}

export async function listEcommerceFulfillmentsAdminClient(): Promise<EcommerceFulfillmentsAdminDto> {
  const res = await staffApiFetch("/api/staff/ecommerce/fulfillments", {
    method: "GET",
    auth: true,
  });

  return unwrapResponse<EcommerceFulfillmentsAdminDto>(
    res,
    "Impossible de charger les livraisons e-commerce.",
  );
}

export async function updateEcommerceFulfillmentStatusAdminClient(
  id: string,
  input: EcommerceFulfillmentStatusInput,
) {
  const res = await staffApiFetch("/api/staff/ecommerce/fulfillments", {
    method: "PUT",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data: input }),
  });

  await unwrapResponse<Record<string, never>>(res, "Impossible de mettre a jour la livraison.");
}
