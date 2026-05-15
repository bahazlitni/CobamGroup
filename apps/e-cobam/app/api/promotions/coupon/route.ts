import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CART_TOKEN_COOKIE } from "@/lib/cart";
import { getCustomerSession } from "@/lib/customer-auth";
import { PromotionError, quotePromotionForGuestCart } from "@/lib/promotions";
import type { AppliedPromotion } from "@/lib/promotions";
import type { PromotionQuote } from "@/lib/promotion-types";

export const runtime = "nodejs";

async function currentCartToken() {
  const cookieStore = await cookies();
  return cookieStore.get(CART_TOKEN_COOKIE)?.value ?? null;
}

function errorResponse(error: unknown) {
  if (error instanceof PromotionError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ message: "Impossible de vérifier le code promo." }, { status: 500 });
}

function promotionQuoteResponse(promotion: AppliedPromotion): PromotionQuote {
  return {
    code: promotion.code,
    name: promotion.name,
    discountType: promotion.discountType,
    subtotalTtc: promotion.subtotalTtc,
    eligibleSubtotalTtc: promotion.eligibleSubtotalTtc,
    discountTtc: promotion.discountTtc,
    totalTtc: promotion.totalTtc,
    message: promotion.message,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
    const session = await getCustomerSession();
    const promotion = await quotePromotionForGuestCart(
      await currentCartToken(),
      typeof body?.code === "string" ? body.code : null,
      session,
    );

    if (!promotion) {
      throw new PromotionError("Entrez un code promo.");
    }

    return NextResponse.json({ promotion: promotionQuoteResponse(promotion) });
  } catch (error) {
    return errorResponse(error);
  }
}
