import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";
import { findImageMediaById } from "@/features/media/repository";
import {
  AuthError,
  getStaffSessionByUserId,
  requireStaffSession,
} from "@/features/auth/server/session";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);

    return NextResponse.json(
      {
        ok: true,
        user: session,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("STAFF_ME_GET_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();

    const {
      firstName,
      lastName,
      jobTitle,
      phone,
      birthDate,
      avatarMediaId,
      bio,
    }: {
      firstName?: string | null;
      lastName?: string | null;
      jobTitle?: string | null;
      phone?: string | null;
      birthDate?: string | null;
      avatarMediaId?: number | null;
      bio?: string | null;
    } = body;

    let parsedBirthDate: Date | null = null;
    if (birthDate) {
      const d = new Date(birthDate);
      if (!Number.isNaN(d.getTime())) {
        parsedBirthDate = d;
      }
    }

    if (avatarMediaId != null) {
      const media = await findImageMediaById(avatarMediaId);
      if (!media) {
        return NextResponse.json(
          { ok: false, message: "Avatar invalide" },
          { status: 400 },
        );
      }
    }

    await prisma.staffProfile.upsert({
      where: { userId: session.id },
      update: {
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        jobTitle: jobTitle ?? null,
        phone: phone ?? null,
        birthDate: parsedBirthDate,
        avatarMediaId:
          avatarMediaId != null ? BigInt(avatarMediaId) : null,
        bio: bio ?? null,
      },
      create: {
        userId: session.id,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        jobTitle: jobTitle ?? null,
        phone: phone ?? null,
        birthDate: parsedBirthDate,
        avatarMediaId:
          avatarMediaId != null ? BigInt(avatarMediaId) : null,
        bio: bio ?? null,
      },
    });

    const updatedSession = await getStaffSessionByUserId(session.id);

    if (!updatedSession) {
      return NextResponse.json(
        { ok: false, message: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { ok: true, user: updatedSession },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("STAFF_ME_PUT_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
