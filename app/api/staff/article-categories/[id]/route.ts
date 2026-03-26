import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  ArticleCategoryValidationError,
  parseArticleCategoryDeleteOptions,
  parseArticleCategoryIdParam,
  parseArticleCategoryMutationInput,
} from "@/features/article-categories/schemas";
import {
  ArticleCategoryServiceError,
  deleteArticleCategoryService,
  getArticleCategoryByIdService,
  updateArticleCategoryService,
} from "@/features/article-categories/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const categoryId = parseArticleCategoryIdParam(idParam);

    const category = await getArticleCategoryByIdService(session, categoryId);

    return NextResponse.json({ ok: true, category }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ArticleCategoryValidationError ||
      error instanceof ArticleCategoryServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("ARTICLE_CATEGORY_GET_ERROR:", error);
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
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const categoryId = parseArticleCategoryIdParam(idParam);
    const body = await req.json();
    const input = parseArticleCategoryMutationInput(body);

    const category = await updateArticleCategoryService(
      session,
      categoryId,
      input,
    );

    return NextResponse.json({ ok: true, category }, { status: 200 });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ArticleCategoryValidationError ||
      error instanceof ArticleCategoryServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("ARTICLE_CATEGORY_UPDATE_ERROR:", error);
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
    const session = await requireStaffSession(req);
    const { id: idParam } = await params;
    const categoryId = parseArticleCategoryIdParam(idParam);
    const { searchParams } = new URL(req.url);
    const options = parseArticleCategoryDeleteOptions(searchParams);

    const result = await deleteArticleCategoryService(session, categoryId, options);

    return NextResponse.json(
      {
        ok: true,
        detachedArticlesCount: result.detachedArticlesCount,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof ArticleCategoryValidationError ||
      error instanceof ArticleCategoryServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("ARTICLE_CATEGORY_DELETE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
