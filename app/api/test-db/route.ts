import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db/prisma";

export async function GET() {
  try {
    const usersCount = await prisma.user.count();

    return NextResponse.json({
      ok: true,
      message: "Database connection works",
      usersCount,
    });
  } catch (error) {
    console.error("TEST_DB_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
