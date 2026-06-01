import type { Prisma } from "@prisma/client";
import { makeMediaPublicMany } from "@/features/media/repository";
import { prisma } from "@/lib/server/db/prisma";

export type PublicOrganizationBrand = {
  value: string;
  label: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  logoUrl: string | null;
  isProductBrand: boolean;
};

const PUBLIC_ORGANIZATION_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  isProductBrand: true,
  logoMedia: {
    select: {
      id: true,
      kind: true,
      isActive: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.OrganizationSelect;

type PublicOrganizationRecord = Prisma.OrganizationGetPayload<{
  select: typeof PUBLIC_ORGANIZATION_SELECT;
}>;

function buildPublicMediaUrl(mediaId: bigint | number) {
  return `/api/media/${mediaId.toString()}/file?variant=thumbnail`;
}

function getRenderableLogoMediaId(record: PublicOrganizationRecord) {
  const logoMedia = record.logoMedia;

  if (!logoMedia || logoMedia.kind !== "IMAGE" || !logoMedia.isActive || logoMedia.deletedAt) {
    return null;
  }

  return Number(logoMedia.id);
}

function mapPublicOrganization(record: PublicOrganizationRecord): PublicOrganizationBrand {
  const logoMediaId = getRenderableLogoMediaId(record);
  const logoUrl = logoMediaId == null ? null : buildPublicMediaUrl(logoMediaId);

  return {
    value: record.name,
    label: record.name,
    name: record.name,
    slug: record.slug,
    description: record.description ?? "",
    imageUrl: logoUrl,
    logoUrl,
    isProductBrand: record.isProductBrand,
  };
}

function isPublicOrganizationReadUnavailable(error: unknown) {
  const record = error as { code?: string; message?: string } | null;
  const message = record?.message ?? "";

  return (
    record?.code === "P1010" ||
    record?.code === "P2021" ||
    message.includes("denied access") ||
    message.includes("does not exist")
  );
}

async function listPublicOrganizations(where: Prisma.OrganizationWhereInput) {
  let organizations: PublicOrganizationRecord[];

  try {
    organizations = await prisma.organization.findMany({
      where,
      orderBy: [{ name: "asc" }],
      select: PUBLIC_ORGANIZATION_SELECT,
    });
  } catch (error) {
    if (isPublicOrganizationReadUnavailable(error)) {
      console.warn(
        "[organizations] Organisations publiques indisponibles: la section est masquee pour cette requete.",
        error,
      );
      return [];
    }

    throw error;
  }

  await makeMediaPublicMany(
    organizations
      .map(getRenderableLogoMediaId)
      .filter((mediaId): mediaId is number => mediaId != null),
  );

  return organizations.map(mapPublicOrganization);
}

export function listPublicPartnerOrganizations() {
  return listPublicOrganizations({ isPartner: true });
}

export function listPublicProductBrandOrganizations() {
  return listPublicOrganizations({ isProductBrand: true });
}

export function listPublicReferenceOrganizations() {
  return listPublicOrganizations({ isReference: true });
}
