"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AlertCircle, File, Headphones, Package } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StaffBadge, StaffSearchSelect, StaffSelect } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { fetchMediaBlobClient } from "@/features/media/client";
import type {
  MediaDeleteOptions,
  MediaListItemDto,
  MediaListResult,
  MediaUpdateInput,
} from "@/features/media/types";
import DynamicSuppressionButton from "./dynamic-suppression-button";
import MediaKindBadge from "./media-kind-badge";
import MediaVisibilityBadge from "./media-visibility-badge";
import {
  formatBytes,
  formatMediaDateTime,
  getMediaDisplayAltText,
  getMediaDisplayTitle,
  getMediaViewForItem,
} from "./utils";

function MediaInspectorPreview({
  media,
}: {
  media: MediaListItemDto;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let nextUrl: string | null = null;

    void fetchMediaBlobClient(media.id)
      .then((blob) => {
        nextUrl = URL.createObjectURL(blob);
        if (isMounted) {
          setObjectUrl(nextUrl);
        }
      })
      .catch(() => {
        if (isMounted) {
          setObjectUrl(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (nextUrl) {
        URL.revokeObjectURL(nextUrl);
      }
    };
  }, [media.id]);

  if (isLoading) {
    return (
      <div className="aspect-video w-full animate-pulse rounded-[2.5rem] bg-slate-100/50 flex items-center justify-center">
        <Package className="w-12 h-12 text-slate-200 animate-bounce" />
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 bg-slate-50/50 text-sm text-slate-400">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-20" />
          <p>Aperçu indisponible</p>
        </div>
      </div>
    );
  }

  const view = getMediaViewForItem(media);

  const containerClasses = "relative aspect-video w-full overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-slate-200/60 shadow-sm transition-all duration-500 hover:shadow-md";

  if (view === "images") {
    return (
      <div className={containerClasses}>
        <Image
          src={objectUrl}
          alt={getMediaDisplayAltText(media)}
          fill
          unoptimized
          className="object-contain p-4 select-none"
          sizes="(max-width: 1200px) 100vw, 80vw"
        />
      </div>
    );
  }

  if (view === "videos") {
    return (
      <div className={containerClasses}>
        <video
          src={objectUrl}
          controls
          className="h-full w-full object-contain bg-slate-950"
        />
      </div>
    );
  }

  if (view === "audio") {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-6 rounded-[2.5rem] border border-slate-200 bg-slate-50/50 px-8 ring-1 ring-slate-200/60">
        <div className="p-6 rounded-full bg-white shadow-sm ring-1 ring-slate-200/50">
          <Headphones className="h-10 w-10 text-cobam-dark-blue" />
        </div>
        <audio src={objectUrl} controls className="w-full max-w-md" />
      </div>
    );
  }

  if (view === "pdf") {
    return (
      <div className={containerClasses}>
        <iframe
          src={objectUrl}
          title={getMediaDisplayTitle(media)}
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
      <File className="h-10 w-10 opacity-30" />
      <p className="text-sm font-medium">Fichier non visualisable directement</p>
    </div>
  );
}

export default function MediaInspectorDialog({
  media,
  folderOptions,
  open,
  onOpenChange,
  isDeleting,
  onDelete,
  onUpdateMedia,
}: {
  media: MediaListItemDto | null;
  folderOptions: MediaListResult["folderOptions"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  onDelete: (mediaId: number, options?: MediaDeleteOptions) => Promise<boolean>;
  onUpdateMedia: (
    mediaId: number,
    input: MediaUpdateInput,
  ) => Promise<MediaListItemDto>;
}) {
  const isForceDeleteMode =
    media != null && media.usage.total > 0 && media.canForceRemove;
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState(false);
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");

  useEffect(() => {
    setTitle(media?.title ?? "");
    setAltText(media?.altText ?? "");
  }, [media?.id, media?.title, media?.altText]);

  const handleCopyPath = async () => {
    if (!media) return;

    try {
      await navigator.clipboard.writeText(media.storagePath);
      toast.success("Chemin de stockage copie.");
    } catch {
      toast.error("Impossible de copier le chemin.");
    }
  };

  const handleCopyPublicUrl = async () => {
    if (!media || media.visibility !== "PUBLIC") {
      return;
    }

    try {
      const publicUrl = `${window.location.origin}${media.publicFileEndpoint}`;
      await navigator.clipboard.writeText(publicUrl);
      toast.success("URL publique copiee.");
    } catch {
      toast.error("Impossible de copier l'URL publique.");
    }
  };

  const handleVisibilityChange = async (value: string) => {
    if (!media || value === media.visibility) {
      return;
    }

    setIsUpdatingVisibility(true);

    try {
      await onUpdateMedia(media.id, {
        visibility: value as "PRIVATE" | "PUBLIC",
      });
      toast.success(
        value === "PUBLIC"
          ? "Le media est maintenant public."
          : "Le media est maintenant prive.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de mettre a jour la visibilite.",
      );
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleFolderChange = async (value: string) => {
    if (!media) {
      return;
    }

    const nextFolderId = value ? Number(value) : null;

    if (media.folderId === nextFolderId) {
      return;
    }

    setIsUpdatingVisibility(true);

    try {
      await onUpdateMedia(media.id, {
        folderId: nextFolderId,
      });
      toast.success(
        nextFolderId == null
          ? "Le media a ete deplace vers la racine."
          : "Le media a ete deplace dans le dossier selectionne.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de deplacer le media.",
      );
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleMetadataSave = async () => {
    if (!media) {
      return;
    }

    const nextTitle = title.trim() || null;
    const nextAltText = altText.trim() || null;

    if (nextTitle === media.title && nextAltText === media.altText) {
      return;
    }

    setIsUpdatingMetadata(true);

    try {
      await onUpdateMedia(media.id, {
        title: nextTitle,
        altText: nextAltText,
      });
      toast.success("Metadonnees du media mises a jour.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de mettre a jour les metadonnees.",
      );
    } finally {
      setIsUpdatingMetadata(false);
    }
  };

  const handleDownload = async () => {
    if (!media) return;

    try {
      const blob = await fetchMediaBlobClient(media.id);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = media.originalFilename || `media-${media.id}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Impossible de telecharger le media.");
    }
  };

  const handleDelete = async () => {
    if (!media) return;

    const confirmed = window.confirm(
      isForceDeleteMode
        ? `Forcer la suppression de ${getMediaDisplayTitle(media)} ? Cette action va retirer toutes ses references avant suppression definitive.`
        : `Supprimer definitivement ${getMediaDisplayTitle(media)} ?`,
    );

    if (!confirmed) {
      return;
    }

    const didDelete = await onDelete(media.id, {
      force: isForceDeleteMode,
    });
    if (didDelete) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] w-full overflow-hidden p-0 sm:max-w-[75rem] rounded-[3rem] border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
        {media ? (
          <div className="flex h-[95vh] flex-col overflow-hidden">
            {/* Header: More elegant and integrated */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-8 py-5">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold text-cobam-dark-blue">
                  {getMediaDisplayTitle(media)}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-slate-400 transition-colors hover:text-slate-600 truncate max-w-md">
                  {media.originalFilename || media.storagePath}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-3">
                <MediaKindBadge kind={media.kind} />
                <MediaVisibilityBadge visibility={media.visibility} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_400px]">
                {/* Left Side: Preview & Usage Alerts */}
                <div className="flex flex-col gap-8 p-8 border-r border-slate-50 lg:p-10">
                  <section>
                    <MediaInspectorPreview key={media.id} media={media} />
                    
                    {media.usage.total > 0 && (
                      <div className="mt-8 rounded-3xl border border-amber-100 bg-amber-50/50 p-5 text-amber-900/80 backdrop-blur-sm transition-all hover:bg-amber-50">
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 rounded-full bg-amber-200/50 p-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-amber-800">Media en cours d&apos;utilisation</p>
                            <p className="text-xs leading-relaxed opacity-80">
                              {media.canForceRemove
                                ? `Ce fichier est reference ${media.usage.total} fois. La suppression forcera le retrait de ces references.`
                                : `Ce fichier est reference ${media.usage.total} fois. Supprimez les references avant de pouvoir le retirer.`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Metadata Editing Section */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-semibold text-cobam-dark-blue">Metadonnees</h3>
                        <p className="text-xs text-slate-400">Informations affichees sur le site public.</p>
                      </div>
                      <AnimatedUIButton
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={() => void handleMetadataSave()}
                        disabled={isUpdatingMetadata || !media.canUpdate}
                        loading={isUpdatingMetadata}
                        className="rounded-full px-6"
                      >
                        Enregistrer
                      </AnimatedUIButton>
                    </div>

                    <div className="space-y-5 rounded-[2.5rem] border border-slate-100 bg-slate-50/30 p-8 shadow-sm">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                          Titre du media
                        </label>
                        <Input
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          placeholder={media.originalFilename || "Titre du media"}
                          disabled={isUpdatingMetadata || !media.canUpdate}
                          className="h-12 rounded-2xl border-slate-200/60 bg-white ring-0 transition-all focus:ring-2 focus:ring-cobam-dark-blue/5"
                        />
                        <p className="text-[10px] text-slate-400 ml-1 italic font-medium">
                          Resolut: {media.resolvedTitle}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                          Texte alternatif (SEO)
                        </label>
                        <Textarea
                          value={altText}
                          onChange={(event) => setAltText(event.target.value)}
                          placeholder={media.resolvedTitle}
                          disabled={isUpdatingMetadata || !media.canUpdate}
                          className="min-h-[100px] resize-none rounded-2xl border-slate-200/60 bg-white ring-0 transition-all focus:ring-2 focus:ring-cobam-dark-blue/5"
                        />
                        <p className="text-[10px] text-slate-400 ml-1 italic font-medium">
                          Actuel: {media.resolvedAltText}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Side: Configuration & Actions */}
                <aside className="flex flex-col h-full bg-slate-50/30">
                  <div className="flex-1 space-y-8 p-8">
                    {/* Organization Section */}
                    <div className="space-y-6">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Organisation</h3>
                      <div className="space-y-5">
                        <div className="space-y-2.5">
                          <p className="text-xs font-semibold text-cobam-dark-blue ml-0.5">Visibilite</p>
                          <StaffSelect
                            value={media.visibility}
                            onValueChange={(value) => void handleVisibilityChange(value)}
                            options={[
                              { value: "PRIVATE", label: "Prive" },
                              { value: "PUBLIC", label: "Public" },
                            ]}
                            disabled={isUpdatingVisibility || !media.canUpdate}
                            fullWidth
                            triggerClassName="bg-white rounded-xl h-11 border-slate-200/60"
                          />
                        </div>
                        <div className="space-y-2.5">
                          <p className="text-xs font-semibold text-cobam-dark-blue ml-0.5">Dossier de rangement</p>
                          <StaffSearchSelect
                            value={media.folderId != null ? String(media.folderId) : ""}
                            onValueChange={(value) => void handleFolderChange(value)}
                            options={folderOptions.map((option) => ({
                              value: String(option.id),
                              label: option.pathLabel,
                            }))}
                            emptyLabel="Racine"
                            placeholder="Choisir un dossier"
                            searchPlaceholder="Rechercher un dossier..."
                            noResultsLabel="Aucun dossier"
                            disabled={isUpdatingVisibility || !media.canUpdate}
                            fullWidth
                            triggerClassName="bg-white rounded-xl h-11 border-slate-200/60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Technical Specs Section */}
                    <div className="space-y-6">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Details Techniques</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Poids", value: formatBytes(media.sizeBytes) },
                          { label: "MIME", value: media.mimeType || "-" },
                          { label: "Par", value: media.uploadedByLabel || "Systeme" },
                          { label: "Status", value: media.isActive ? "Actif" : "Inactif" },
                        ].map((spec) => (
                          <div key={spec.label} className="group rounded-2xl border border-slate-100 bg-white p-3.5 transition-all hover:border-slate-200 hover:shadow-sm">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-cobam-dark-blue/40 transition-colors">{spec.label}</p>
                            <p className="mt-1 truncate text-xs font-semibold text-cobam-dark-blue">
                              {spec.value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                         <div className="space-y-1">
                           <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                             <Package className="h-2.5 w-2.5" />
                             Usages Referencies
                           </p>
                           <p className="text-xs font-semibold text-cobam-dark-blue">{media.usage.total} references</p>
                         </div>
                         <div className="h-px bg-slate-50" />
                         <div className="space-y-1">
                           <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Cree le</p>
                           <p className="text-xs font-semibold text-cobam-dark-blue">{formatMediaDateTime(media.createdAt)}</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Bottom Actions */}
                  <div className="mt-auto border-t border-slate-100 bg-white/50 p-6 backdrop-blur-sm space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                       <AnimatedUIButton
                        type="button"
                        variant="primary"
                        className="w-full justify-start rounded-xl py-6 px-5"
                        icon="external-link"
                        iconPosition="right"
                        onClick={() => void handleDownload()}
                      >
                        Telecharger le fichier
                      </AnimatedUIButton>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <AnimatedUIButton
                          type="button"
                          variant="ghost"
                          className="w-full text-xs h-10 rounded-lg bg-white border border-slate-100"
                          icon="modify"
                          iconPosition="left"
                          onClick={() => void handleCopyPath()}
                        >
                          Chemin
                        </AnimatedUIButton>
                        <AnimatedUIButton
                          type="button"
                          variant="ghost"
                          className="w-full text-xs h-10 rounded-lg bg-white border border-slate-100"
                          disabled={media.visibility !== "PUBLIC"}
                          icon="globe"
                          iconPosition="left"
                          onClick={() => void handleCopyPublicUrl()}
                        >
                          URL Public
                        </AnimatedUIButton>
                      </div>
                    </div>

                    <DynamicSuppressionButton
                      buttonText={{
                        default: "Supprimer le media",
                        force: "Forcer la suppression",
                      }}
                      isForceMode={isForceDeleteMode}
                      onClick={() => void handleDelete()}
                      disabled={
                        isDeleting ||
                        (!media.canDelete && !isForceDeleteMode) ||
                        (media.usage.total > 0 && !media.canForceRemove)
                      }
                      loading={isDeleting}
                      className="w-full rounded-xl"
                    />
                  </div>
                </aside>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 px-6 text-slate-500">
            <Package className="h-12 w-12 opacity-10" />
            <p className="font-medium">Aucun media selectionne</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
