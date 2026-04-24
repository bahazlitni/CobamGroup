import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import {
  hashPassword,
  verifyPassword,
} from "@/lib/api/auth/shared/password";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import { STAFF_PORTAL } from "@/features/auth/types";

function parsePassword(value: unknown) {
  return String(value ?? "");
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();

    const currentPassword = parsePassword(body.currentPassword);
    const newPassword = parsePassword(body.newPassword);

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { ok: false, message: "Les deux mots de passe sont requis." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          ok: false,
          message: "Le nouveau mot de passe doit contenir au moins 8 caracteres.",
        },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          ok: false,
          message: "Le nouveau mot de passe doit etre different de l'ancien.",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        portal: true,
        passwordHash: true,
      },
    });

    if (!user || user.portal !== STAFF_PORTAL) {
      return NextResponse.json(
        { ok: false, message: "Utilisateur introuvable." },
        { status: 404 },
      );
    }

    const matches = await verifyPassword(currentPassword, user.passwordHash);

    if (!matches) {
      return NextResponse.json(
        { ok: false, message: "Mot de passe actuel incorrect." },
        { status: 401 },
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("STAFF_PASSWORD_CHANGE_ERROR:", error);

    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
