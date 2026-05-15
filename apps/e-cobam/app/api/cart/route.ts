import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  addGuestCartItem,
  CART_COOKIE_MAX_AGE_SECONDS,
  CART_TOKEN_COOKIE,
  CartError,
  clearGuestCart,
  readGuestCart,
} from "@/lib/cart";

export const runtime = "nodejs";

async function currentCartToken() {
  const cookieStore = await cookies();
  return cookieStore.get(CART_TOKEN_COOKIE)?.value ?? null;
}

function cartResponse(payload: Awaited<ReturnType<typeof readGuestCart>>) {
  const response = NextResponse.json(payload.cart);

  response.cookies.set(CART_TOKEN_COOKIE, payload.token, {
    httpOnly: true,
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function errorResponse(error: unknown) {
  if (error instanceof CartError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ message: "Le panier n'est pas disponible pour le moment." }, { status: 500 });
}

function parseProductId(value: unknown) {
  const productId = Number(value);

  return Number.isInteger(productId) && productId > 0 ? productId : null;
}

export async function GET() {
  try {
    return cartResponse(await readGuestCart(await currentCartToken()));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { productId?: unknown; quantity?: unknown } | null;
    const productId = parseProductId(body?.productId);

    if (!productId) {
      return NextResponse.json({ message: "Produit invalide." }, { status: 400 });
    }

    return cartResponse(await addGuestCartItem(await currentCartToken(), productId, body?.quantity ?? 1));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE() {
  try {
    return cartResponse(await clearGuestCart(await currentCartToken()));
  } catch (error) {
    return errorResponse(error);
  }
}
