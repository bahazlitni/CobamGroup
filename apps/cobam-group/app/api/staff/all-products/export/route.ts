import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  AllProductsValidationError,
  parseAllProductsExportQuery,
} from "@/features/all-products/schemas";
import {
  AllProductsServiceError,
  exportAllProductsService,
} from "@/features/all-products/service";

function toResponseBody(content: string | Uint8Array): BodyInit {
  if (typeof content === "string") {
    return content;
  }

  return content.buffer.slice(
    content.byteOffset,
    content.byteOffset + content.byteLength,
  ) as ArrayBuffer;
}

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const query = parseAllProductsExportQuery(searchParams);
    const exportFile = await exportAllProductsService(
      session,
      query.mode,
      query.format,
    );

    return new Response(toResponseBody(exportFile.content), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${exportFile.filename}"`,
        "Content-Type": exportFile.contentType,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof AuthError ||
      error instanceof AllProductsValidationError ||
      error instanceof AllProductsServiceError
    ) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("ALL_PRODUCTS_EXPORT_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
