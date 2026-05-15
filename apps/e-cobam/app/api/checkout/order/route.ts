import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CART_TOKEN_COOKIE } from "@/lib/cart";
import { CheckoutError, createGuestCheckoutOrder } from "@/lib/checkout";
import { getCustomerSession } from "@/lib/customer-auth";

export const runtime = "nodejs";

async function currentCartToken() {
  const cookieStore = await cookies();
  return cookieStore.get(CART_TOKEN_COOKIE)?.value ?? null;
}

function errorResponse(error: unknown) {
  if (error instanceof CheckoutError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ message: "Impossible de finaliser la commande pour le moment." }, { status: 500 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const session = await getCustomerSession();
    const result = await createGuestCheckoutOrder(await currentCartToken(), body, session);
    const response = NextResponse.json(result);

    response.cookies.set(CART_TOKEN_COOKIE, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
