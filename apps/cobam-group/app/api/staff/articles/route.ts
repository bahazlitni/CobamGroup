import { NextResponse } from "next/server";
import { AuthError } from "@/features/auth/server/session";
import { requireArticleEditorSession } from "@/features/auth/server/guards";
import {
  ArticleValidationError,
  parseArticleCreateInput,
} from "@/features/articles/schemas";
import {
  ArticleServiceError,
  createArticleService,
} from "@/features/articles/service";

export async function POST(req: Request) {
  try {
    const session = await requireArticleEditorSession(req);
    const body = await req.json();
    const input = parseArticleCreateInput(body);

    const article = await createArticleService(session, input);

    return NextResponse.json(
      { ok: true, article },
      { status: 201 },
    );
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

    console.error("ARTICLE_CREATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
