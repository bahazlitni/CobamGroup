import { NextResponse } from "next/server";
import { AuthError, requireStaffSession } from "@/features/auth/server/session";
import {
  createProductCertificateService,
  deleteProductCertificateService,
  listProductCertificatesService,
  parseProductCertificateId,
  parseProductCertificateInput,
  ProductCertificatesServiceError,
  updateProductCertificateService,
} from "@/features/product-certificates/service";

function jsonError(error: unknown, fallback: string) {
  if (error instanceof AuthError || error instanceof ProductCertificatesServiceError) {
    return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
  }

  console.error(fallback, error);
  return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
}

export async function GET(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const items = await listProductCertificatesService(session);

    return NextResponse.json({ ok: true, items });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_CERTIFICATES_LIST_ERROR:");
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const input = parseProductCertificateInput(await req.json());
    const item = await createProductCertificateService(session, input);

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_CERTIFICATE_CREATE_ERROR:");
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const body = await req.json();
    const id = parseProductCertificateId(body.id);
    const input = parseProductCertificateInput(body.data);
    const item = await updateProductCertificateService(session, id, input);

    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_CERTIFICATE_UPDATE_ERROR:");
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireStaffSession(req);
    const { searchParams } = new URL(req.url);
    const id = parseProductCertificateId(searchParams.get("id"));

    await deleteProductCertificateService(session, id);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return jsonError(error, "PRODUCT_CERTIFICATE_DELETE_ERROR:");
  }
}
