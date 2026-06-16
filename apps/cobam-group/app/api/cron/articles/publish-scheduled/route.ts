import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { isCronExecutionMinuteAligned } from "@/features/articles/scheduling";
import { publishDueScheduledArticlesService } from "@/features/articles/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getConfiguredSecret() {
  return (
    process.env.ARTICLE_PUBLISH_CRON_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    ""
  );
}

function getProvidedSecret(req: Request) {
  const authorization = req.headers.get("authorization")?.trim();

  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  return req.headers.get("x-cron-secret")?.trim() || "";
}

function secretsMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function POST(req: Request) {
  const configuredSecret = getConfiguredSecret();

  if (!configuredSecret) {
    return NextResponse.json(
      { ok: false, message: "Cron secret is not configured." },
      { status: 503 },
    );
  }

  const providedSecret = getProvidedSecret(req);

  if (!providedSecret || !secretsMatch(providedSecret, configuredSecret)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const now = new Date();

  if (!isCronExecutionMinuteAligned(now)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Cron execution must happen on a 5-minute boundary.",
        now: now.toISOString(),
      },
      { status: 409 },
    );
  }

  try {
    const result = await publishDueScheduledArticlesService(now);

    return NextResponse.json(
      {
        ok: true,
        now: now.toISOString(),
        ...result,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("ARTICLE_SCHEDULED_PUBLISH_CRON_ERROR:", error);

    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
