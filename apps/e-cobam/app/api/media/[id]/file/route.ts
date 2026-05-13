import path from "path";
import { getMediaStorageDriver } from "@cobam/media-storage";

export const runtime = "nodejs";

type MediaVariant = "original" | "thumbnail";

async function getPrisma() {
  const { prisma } = await import("@cobam/db");
  return prisma;
}

function parseMediaId(value: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function mediaVariantStoragePath(storagePath: string, variant: MediaVariant) {
  if (variant === "original") {
    return storagePath;
  }

  const normalizedStoragePath = storagePath.replace(/\\/g, "/");
  const parsedPath = path.posix.parse(normalizedStoragePath);

  return path.posix.join(parsedPath.dir, `${parsedPath.name}.thumbnail.webp`);
}

function mediaVariantFilename(filename: string | null, variant: MediaVariant) {
  if (variant === "original") {
    return filename ?? "media";
  }

  const baseName = filename
    ? path.basename(filename, path.extname(filename))
    : "media";

  return `${baseName}-thumbnail.webp`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const mediaId = parseMediaId(id);

  if (!mediaId) {
    return new Response("Media id invalide", { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const variant: MediaVariant = searchParams.get("variant") === "thumbnail" ? "thumbnail" : "original";
  const shouldDownload =
    searchParams.get("download") === "1" || searchParams.get("download") === "true";

  const db = await getPrisma();
  const media = await db.media.findFirst({
    where: {
      id: BigInt(mediaId),
      deletedAt: null,
      isActive: true,
      OR: [
        { visibility: "PUBLIC" },
        {
          productLinks: {
            some: {
              product: {
                visibleEcommerce: true,
              },
            },
          },
        },
        {
          productFamilyMainImageFor: {
            some: {
              members: {
                some: {
                  product: {
                    visibleEcommerce: true,
                  },
                },
              },
            },
          },
        },
        {
          productCategoryImageFor: {
            some: {
              isActive: true,
            },
          },
        },
        { productSubcategoryImageFor: { some: { isActive: true } } },
        { organizationLogoFor: { some: { isProductBrand: true } } },
        { productFinishImageFor: { some: {} } },
      ],
    },
    select: {
      id: true,
      kind: true,
      storagePath: true,
      originalFilename: true,
      mimeType: true,
      extension: true,
    },
  });

  if (!media) {
    return new Response("Media introuvable", { status: 404 });
  }

  const storage = getMediaStorageDriver();
  const preferredPath =
    variant === "thumbnail" && media.kind === "IMAGE"
      ? mediaVariantStoragePath(media.storagePath, "thumbnail")
      : media.storagePath;
  const object =
    (await storage.readObject(preferredPath)) ??
    (preferredPath !== media.storagePath ? await storage.readObject(media.storagePath) : null);

  if (!object) {
    return new Response("Fichier media introuvable", { status: 404 });
  }

  const contentType =
    preferredPath !== media.storagePath && object.contentType
      ? object.contentType
      : media.mimeType ?? object.contentType ?? "application/octet-stream";
  const filename =
    mediaVariantFilename(media.originalFilename, preferredPath !== media.storagePath ? "thumbnail" : "original") ??
    `media-${media.id}${media.extension ? `.${media.extension}` : ""}`;
  const bytes = new Uint8Array(object.body.byteLength);
  bytes.set(object.body);

  return new Response(new Blob([bytes.buffer], { type: contentType }), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
