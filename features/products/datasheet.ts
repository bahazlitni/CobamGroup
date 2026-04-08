import type { Prisma } from "@prisma/client";

export async function assertProductDatasheetMedia(
  tx: Prisma.TransactionClient,
  datasheetMediaId: number | null | undefined,
) {
  if (datasheetMediaId == null) {
    return;
  }

  const media = await tx.media.findUnique({
    where: {
      id: BigInt(datasheetMediaId),
    },
    select: {
      id: true,
      kind: true,
    },
  });

  if (!media) {
    throw new Error("Fiche technique introuvable.");
  }

  if (media.kind !== "DOCUMENT") {
    throw new Error("La fiche technique doit être un document.");
  }
}
