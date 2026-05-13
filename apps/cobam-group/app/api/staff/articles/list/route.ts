import { NextResponse } from "next/server";
import { AuthError } from "@/features/auth/server/session";
import { requireArticleEditorSession } from "@/features/auth/server/guards";
import {
  ArticleValidationError,
  parseArticleListQuery,
} from "@/features/articles/schemas";
import {
  ArticleServiceError,
  listArticlesService,
} from "@/features/articles/service";

export async function GET(req: Request) {
  try {
    const session = await requireArticleEditorSession(req);
    const searchParams = new URL(req.url).searchParams;
    const query = parseArticleListQuery(searchParams);

    const result = await listArticlesService(session, query);

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

    console.error("ARTICLE_LIST_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
