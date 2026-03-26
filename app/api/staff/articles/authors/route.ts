import { NextResponse } from "next/server";
import { requireArticleEditorSession } from "@/features/auth/server/guards";
import { AuthError } from "@/features/auth/server/session";
import {
  ArticleValidationError,
  parseArticleAuthorOptionsQuery,
} from "@/features/articles/schemas";
import {
  ArticleServiceError,
  listArticleAuthorOptionsService,
} from "@/features/articles/service";

export async function GET(req: Request) {
  try {
    const session = await requireArticleEditorSession(req);
    const searchParams = new URL(req.url).searchParams;
    const query = parseArticleAuthorOptionsQuery(searchParams);

    const result = await listArticleAuthorOptionsService(session, query);

    return NextResponse.json({ ok: true, ...result }, { status: 200 });
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

    console.error("ARTICLE_AUTHOR_OPTIONS_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
