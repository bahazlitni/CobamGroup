import { NextResponse } from "next/server";
import { AuthError } from "@/features/auth/server/session";
import { requireArticleEditorSession } from "@/features/auth/server/guards";
import {
  ArticleValidationError,
  parseArticleIdParam,
} from "@/features/articles/schemas";
import {
  ArticleServiceError,
  publishArticleService,
} from "@/features/articles/service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireArticleEditorSession(req);
    const { id: idParam } = await params;
    const articleId = parseArticleIdParam(idParam);

    await publishArticleService(session, articleId);

    return NextResponse.json({ ok: true }, { status: 200 });
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

    console.error("ARTICLE_PUBLISH_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
