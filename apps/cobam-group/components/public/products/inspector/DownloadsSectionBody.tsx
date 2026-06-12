import type { PublicProductInspectorMedia } from "@/features/products/types";
import { ArrowDownToLine, FileText } from "lucide-react";

const FILE_SIZE_UNITS = ["o", "Ko", "Mo", "Go", "To"] as const;

function formatFileSize(sizeBytes: string | null) {
  if (!sizeBytes) {
    return null;
  }

  const parsedSize = Number(sizeBytes);
  if (!Number.isFinite(parsedSize) || parsedSize <= 0) {
    return null;
  }

  let value = parsedSize;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formatter = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  });

  return `${formatter.format(value)} ${FILE_SIZE_UNITS[unitIndex]}`;
}

function extractExtension(value: string | null | undefined) {
  const match = value?.trim().match(/\.([a-z0-9]{1,12})$/i);
  return match?.[1] ?? null;
}

function inferExtensionFromMime(mimeType: string | null) {
  if (!mimeType) {
    return null;
  }

  const normalized = mimeType.toLowerCase();
  if (normalized === "application/pdf") {
    return "pdf";
  }

  const [, subtype] = normalized.split("/");
  return subtype?.split("+")[0] ?? null;
}

function getFileExtension(download: PublicProductInspectorMedia) {
  return (
    download.extension ??
    extractExtension(download.originalFilename) ??
    extractExtension(download.title) ??
    inferExtensionFromMime(download.mimeType)
  )?.toUpperCase() ?? "DOC";
}

function getFileTitle(download: PublicProductInspectorMedia) {
  return download.title?.trim() || download.originalFilename?.trim() || "Document";
}

function DownloadFileCard({ download }: { download: PublicProductInspectorMedia }) {
  const extension = getFileExtension(download);
  const size = formatFileSize(download.sizeBytes);
  const title = getFileTitle(download);

  return (
    <a
      href={download.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group border-cobam-quill-grey/70 focus-visible:ring-cobam-water-blue/35 grid gap-4 rounded-lg border bg-white p-4 text-left transition-colors duration-200 hover:border-cobam-water-blue/70 hover:bg-cobam-light-grey/35 focus-visible:ring-2 focus-visible:outline-none sm:grid-cols-[auto_1fr_auto] sm:items-center"
    >
      <div className="border-cobam-quill-grey/70 text-cobam-dark-blue flex size-12 shrink-0 items-center justify-center rounded-md border bg-white">
        <FileText className="size-5" aria-hidden="true" />
      </div>

      <div className="min-w-0 space-y-2">
        <h3 className="text-cobam-dark-blue line-clamp-2 text-base font-semibold leading-6">
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
          <span className="uppercase">{extension}</span>
          <span>{size ?? "Taille non précisée"}</span>
        </div>
      </div>

      <span className="border-cobam-dark-blue text-cobam-dark-blue inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-white px-4 text-sm font-semibold transition-colors duration-200 group-hover:bg-cobam-dark-blue group-hover:text-white">
        <span>Télécharger</span>
        <ArrowDownToLine className="size-4" aria-hidden="true" />
      </span>
    </a>
  );
}

export default function DownloadsSectionBody({
  datasheets,
  certificates,
}: {
  datasheets: PublicProductInspectorMedia[];
  certificates: PublicProductInspectorMedia[];
}) {
  const downloads = [...datasheets, ...certificates];

  if (downloads.length === 0) {
    return null;
  }

  return (
    <ul className="grid w-full gap-3 lg:grid-cols-2">
      {downloads.map((download) => (
        <li key={download.id}>
          <DownloadFileCard download={download} />
        </li>
      ))}
    </ul>
  );
}
