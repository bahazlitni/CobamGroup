import { NextResponse } from "next/server";
import { requireArticleEditorSession } from "@/features/auth/server/guards";
import { AuthError } from "@/features/auth/server/session";
import {
  ArticleValidationError,
  parseArticleIdParam,
  parseArticleScheduleInput,
} from "@/features/articles/schemas";
import {
  ArticleServiceError,
  cancelArticlePublicationScheduleService,
  scheduleArticlePublicationService,
} from "@/features/articles/service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireArticleEditorSession(req);
    const { id: idParam } = await params;
    const articleId = parseArticleIdParam(idParam);
    const body = await req.json();
    const input = parseArticleScheduleInput(body);

    const article = await scheduleArticlePublicationService(
      session,
      articleId,
      input.scheduledPublishAt,
    );

    return NextResponse.json({ ok: true, article }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ArticleValidationError ||
      error instanceof ArticleServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("ARTICLE_SCHEDULE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireArticleEditorSession(req);
    const { id: idParam } = await params;
    const articleId = parseArticleIdParam(idParam);

    const article = await cancelArticlePublicationScheduleService(
      session,
      articleId,
    );

    return NextResponse.json({ ok: true, article }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ArticleValidationError ||
      error instanceof ArticleServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("ARTICLE_SCHEDULE_CANCEL_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
