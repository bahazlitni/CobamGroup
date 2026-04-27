"use client";

import { useState } from "react";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";

function buildDownloadUrl(url: string) {
  const downloadUrl = new URL(url, window.location.origin);
  downloadUrl.searchParams.set("download", "1");
  return downloadUrl.toString();
}

function getFilenameFromDisposition(value: string | null) {
  if (!value) {
    return null;
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const filenameMatch = value.match(/filename="?([^"]+)"?/i);
  if (!filenameMatch?.[1]) {
    return null;
  }

  return decodeURIComponent(filenameMatch[1]);
}

function getFallbackFilename(url: string) {
  const pathname = new URL(url, window.location.origin).pathname;
  return pathname.split("/").filter(Boolean).pop() ?? "fiche-technique.pdf";
}

export default function DatasheetLink({ url }: { url: string }) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenDatasheet = async () => {
    if (isOpening) {
      return;
    }

    const previewWindow = window.open("about:blank", "_blank");
    setIsOpening(true);

    try {
      const response = await fetch(buildDownloadUrl(url));

      if (!response.ok) {
        throw new Error("Impossible de telecharger la fiche technique.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const filename =
        getFilenameFromDisposition(response.headers.get("Content-Disposition")) ??
        getFallbackFilename(url);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      if (previewWindow) {
        previewWindow.location.href = objectUrl;
      } else {
        window.open(objectUrl, "_blank");
      }

      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 60_000);
    } catch (error) {
      previewWindow?.close();
      console.error("DATASHEET_DOWNLOAD_ERROR:", error);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className="w-fit">
      <AnimatedUIButton
        type="button"
        onClick={() => void handleOpenDatasheet()}
        loading={isOpening}
        loadingText="Ouverture..."
        size="sm"
        variant="secondary"
        icon="download"
        iconPosition="right"
      >
        Fiche technique
      </AnimatedUIButton>
    </div>
  );
}
