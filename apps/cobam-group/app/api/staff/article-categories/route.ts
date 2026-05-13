import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  ArticleCategoryValidationError,
  parseArticleCategoryListQuery,
  parseArticleCategoryMutationInput,
} from "@/features/article-categories/schemas";
import {
  ArticleCategoryServiceError,
  createArticleCategoryService,
  listArticleCategoriesService,
} from "@/features/article-categories/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseArticleCategoryListQuery(searchParams);

    const result = await listArticleCategoriesService(session, query);

    return NextResponse.json({
      ok: true,
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
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

    console.error("ARTICLE_CATEGORIES_LIST_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const input = parseArticleCategoryMutationInput(body);

    const category = await createArticleCategoryService(session, input);

    return NextResponse.json({ ok: true, category }, { status: 201 });
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

    console.error("ARTICLE_CATEGORY_CREATE_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
