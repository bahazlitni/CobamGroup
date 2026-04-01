import type {
  MediaKind,
  MediaListItemDto,
  MediaSortBy,
  MediaView,
} from "@/features/media/types";

export function formatBytes(value: number | null) {
  if (value == null || value <= 0) {
    return "-";
  }

  const units = ["o", "Ko", "Mo", "Go", "To"];
  let currentValue = value;
  let unitIndex = 0;

  while (currentValue >= 1024 && unitIndex < units.length - 1) {
    currentValue /= 1024;
    unitIndex += 1;
  }

  return `${currentValue.toFixed(currentValue >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatMediaDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMediaDateTime(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getMediaKindLabel(kind: MediaKind) {
  switch (kind) {
    case "IMAGE":
      return "Image";
    case "VIDEO":
      return "Video";
    case "DOCUMENT":
      return "Document";
    default:
      return kind;
  }
}

export function getMediaDisplayTitle(media: MediaListItemDto) {
  return media.title?.trim() || media.originalFilename || `Media #${media.id}`;
}

export function getMediaViewForItem(media: MediaListItemDto): Exclude<MediaView, "all"> {
  const mimeType = media.mimeType?.toLowerCase() ?? "";
  const extension = media.extension?.toLowerCase() ?? "";

  if (media.kind === "IMAGE") {
    return "images";
  }

  if (media.kind === "VIDEO") {
    return "videos";
  }

  if (mimeType === "application/pdf" || extension === "pdf") {
    return "pdf";
  }

  if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  return "other";
}

export function getMediaGroupDescriptor(
  media: MediaListItemDto,
  sortBy: MediaSortBy,
) {
  if (sortBy === "name") {
    const firstCharacter = getMediaDisplayTitle(media)
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .charAt(0)
      .toUpperCase();
    const label = /^[A-Z]$/.test(firstCharacter)
      ? firstCharacter
      : /^\d$/.test(firstCharacter)
        ? "0-9"
        : "#";

    return {
      key: `name:${label}`,
      label,
    };
  }

  if (sortBy === "size") {
    const sizeInMb = (media.sizeBytes ?? 0) / (1024 * 1024);

    if (sizeInMb > 100) {
      return {
        key: "size:100+",
        label: "> 100 Mo",
      };
    }

    const upper = Math.max(10, Math.ceil(sizeInMb / 10) * 10);
    const lower = Math.max(0, upper - 10);

    return {
      key: `size:${upper}-${lower}`,
      label: `${upper}-${lower} Mo`,
    };
  }

  const date = new Date(media.createdAt);
  const label = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    key: `date:${date.toISOString().slice(0, 10)}`,
    label,
  };
}
