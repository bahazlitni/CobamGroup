import { NextResponse } from "next/server";
import { requireArticleEditorSession } from "@/features/auth/server/guards";
import { AuthError } from "@/features/auth/server/session";
import {
  ArticleValidationError,
  parseArticleIdParam,
  parseArticleUpdateInput,
} from "@/features/articles/schemas";
import {
  ArticleServiceError,
  deleteArticleService,
  getArticleByIdService,
  updateArticleService,
} from "@/features/articles/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireArticleEditorSession(req);
    const { id: idParam } = await params;
    const articleId = parseArticleIdParam(idParam);

    const article = await getArticleByIdService(session, articleId);

    return NextResponse.json(
      { ok: true, article },
      { status: 200 },
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

    console.error("ARTICLE_GET_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireArticleEditorSession(req);
    const { id: idParam } = await params;
    const articleId = parseArticleIdParam(idParam);

    const body = await req.json();
    const input = parseArticleUpdateInput(body);

    const article = await updateArticleService(session, articleId, input);

    return NextResponse.json(
      { ok: true, article },
      { status: 200 },
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

    console.error("ARTICLE_UPDATE_ERROR:", error);
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

    await deleteArticleService(session, articleId);

    return NextResponse.json(
      { ok: true },
      { status: 200 },
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

    console.error("ARTICLE_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
