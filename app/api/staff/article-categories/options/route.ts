import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import { ArticleCategoryValidationError } from "@/features/article-categories/schemas";
import {
  ArticleCategoryServiceError,
  listArticleCategoryOptionsService,
} from "@/features/article-categories/service";

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const items = await listArticleCategoryOptionsService(session);

    return NextResponse.json({ ok: true, items }, { status: 200 });
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

    console.error("ARTICLE_CATEGORY_OPTIONS_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
