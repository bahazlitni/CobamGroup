import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import {
  listCustomerNotifications,
  markCustomerNotificationsRead,
  markCustomerNotificationsUnread,
} from "@/lib/customer-notifications";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ message: "Connexion requise." }, { status: 401 });
}

export async function GET() {
  const session = await getCustomerSession();

  if (!session) {
    return unauthorized();
  }

  const data = await listCustomerNotifications(session);

  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const session = await getCustomerSession();

  if (!session) {
    return unauthorized();
  }

  const body = (await req.json().catch(() => ({}))) as {
    all?: boolean;
    ids?: unknown;
    unreadIds?: unknown;
  };

  if (body.unreadIds) {
    const changedIds = await markCustomerNotificationsUnread(session, { ids: body.unreadIds });
    return NextResponse.json({ ok: true, changedIds });
  }

  const changedIds = await markCustomerNotificationsRead(session, body);

  return NextResponse.json({ ok: true, changedIds });
}
