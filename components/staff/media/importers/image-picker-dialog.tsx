"use client";

import type { ReactNode } from "react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Check, ImagePlus, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import {
  findMediaFolderIdByPathClient,
  listMediaClient,
  uploadMediaClient,
} from "@/features/media/client";
import type { MediaListItemDto } from "@/features/media/types";
import { cn } from "@/lib/utils";
import MediaThumbnail from "../media-thumbnail";
import { formatBytes, getMediaDisplayTitle } from "../utils";
import ImagePreview from "./ImagePreview";
import SearchInput from "../../ui/SearchInput";
import { getAspectRatioCssValue, matchesAspectRatio, parseAspectRatio } from "./aspect-ratio";

type ImagePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  selectedMediaId: number | null;
  onSelect: (media: MediaListItemDto) => void;
  aspectRatio?: string;
  requireAspectRatio?: boolean;
  folderPath?: string;
};

type PickerTab = "library" | "upload";

const PAGE_SIZE = 18;

function PickerSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden py-0 shadow-none ring-1 ring-slate-200", className)}>
      <CardHeader className="border-b border-slate-100 px-5 py-4">
        <CardTitle className="text-cobam-dark-blue text-sm font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm leading-6 text-slate-500">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 py-5">{children}</CardContent>
    </Card>
  );
}

function PickerEmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center",
        className,
      )}
    >
      <ImagePlus className="h-8 w-8 text-slate-300" />
      <p className="text-cobam-dark-blue mt-4 text-sm font-semibold">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function PickerLoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-3xl border border-slate-300 bg-white">
          <div className="aspect-square animate-pulse bg-slate-200/70" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200/70" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LibraryImageCard({
  item,
  isSelected,
  onSelect,
  isBlocked = false,
  blockedReason,
}: {
  item: MediaListItemDto;
  isSelected: boolean;
  onSelect: (mediaId: number) => void;
  isBlocked?: boolean;
  blockedReason?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      disabled={isBlocked}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border bg-white text-left transition",
        isSelected
          ? "border-cobam-water-blue"
          : "border-slate-300 hover:border-slate-300 hover:shadow-sm",
        isBlocked && "cursor-not-allowed opacity-55 hover:border-slate-300 hover:shadow-none",
      )}
    >
      <div className="relative">
        <MediaThumbnail media={item} className="aspect-square rounded-none" />
        {isSelected ? (
          <span className="bg-cobam-water-blue absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm">
            <Check className="h-4 w-4" />
          </span>
        ) : null}
      </div>

      <div className="space-y-1 p-4">
        <p className="text-cobam-dark-blue truncate text-sm font-semibold">
          {getMediaDisplayTitle(item)}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>{formatBytes(item.sizeBytes)}</span>
          {item.originalFilename ? <span className="truncate">{item.originalFilename}</span> : null}
        </div>
        {isBlocked && blockedReason ? (
          <p className="text-xs font-medium text-amber-700">{blockedReason}</p>
        ) : null}
      </div>
    </button>
  );
}

export default function ImagePickerDialog({
  open,
  onOpenChange,
  title,
  description,
  selectedMediaId,
  onSelect,
  aspectRatio,
  requireAspectRatio = false,
  folderPath,
}: ImagePickerDialogProps) {
  const [activeTab, setActiveTab] = useState<PickerTab>("library");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [items, setItems] = useState<MediaListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExistingId, setSelectedExistingId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadDimensions, setUploadDimensions] = useState<{
    widthPx: number;
    heightPx: number;
  } | null>(null);
  const loadRequestIdRef = useRef(0);
  const isClosingRef = useRef(false);
  const requiredAspectRatio = useMemo(() => parseAspectRatio(aspectRatio), [aspectRatio]);
  const aspectRatioMessage = requiredAspectRatio
    ? `Format requis: ${requiredAspectRatio.label}`
    : null;
  const scopedLibraryDescription = folderPath
    ? `Cette bibliotheque affiche uniquement les images du dossier ${folderPath} et de ses sous-dossiers.`
    : "Cette bibliotheque affiche les images de tous les dossiers.";

  const resolveScopedFolderId = useCallback(async () => {
    if (!folderPath) {
      return undefined;
    }

    const folderId = await findMediaFolderIdByPathClient(folderPath);

    if (folderId == null) {
      throw new Error(`Le dossier ${folderPath} est introuvable dans la mediatheque.`);
    }

    return folderId;
  }, [folderPath]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedExistingId(selectedMediaId);
  }, [open, selectedMediaId]);

  useEffect(() => {
    if (!uploadFile) {
      setUploadPreviewUrl(null);
      setUploadDimensions(null);
      return;
    }

    const nextUrl = URL.createObjectURL(uploadFile);
    setUploadPreviewUrl(nextUrl);
    setUploadDimensions(null);

    const image = new window.Image();
    image.onload = () => {
      setUploadDimensions({
        widthPx: image.naturalWidth,
        heightPx: image.naturalHeight,
      });
    };
    image.onerror = () => {
      setUploadDimensions(null);
    };
    image.src = nextUrl;

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [uploadFile]);

  const loadImages = useCallback(
    async (nextPage: number, reset: boolean) => {
      if (!open || isClosingRef.current) {
        return;
      }

      const requestId = ++loadRequestIdRef.current;

      setError(null);

      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const folderId = await resolveScopedFolderId();
        const result = await listMediaClient({
          browseMode: "library",
          page: nextPage,
          pageSize: PAGE_SIZE,
          q: deferredSearch,
          kind: "IMAGE",
          sortBy: "date",
          sortDirection: "desc",
          folderId,
          includeDescendantFolders: folderId != null,
        });

        if (requestId !== loadRequestIdRef.current || isClosingRef.current) {
          return;
        }

        setItems((current) => (reset ? result.items : [...current, ...result.items]));
        setPage(nextPage);
        setHasMore(nextPage * PAGE_SIZE < result.total);
      } catch (err: unknown) {
        if (requestId !== loadRequestIdRef.current || isClosingRef.current) {
          return;
        }

        setError(err instanceof Error ? err.message : "Erreur lors du chargement des images.");
      } finally {
        if (requestId !== loadRequestIdRef.current) {
          return;
        }

        if (reset) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [deferredSearch, open, resolveScopedFolderId],
  );

  useEffect(() => {
    if (!open) {
      loadRequestIdRef.current += 1;
      isClosingRef.current = false;
      setActiveTab("library");
      setSearch("");
      setItems([]);
      setPage(1);
      setHasMore(true);
      setIsLoading(false);
      setIsLoadingMore(false);
      setError(null);
      setSelectedExistingId(null);
      setUploadFile(null);
      setUploadDimensions(null);
      return;
    }

    isClosingRef.current = false;
    void loadImages(1, true);
  }, [loadImages, open]);

  const selectedExistingMedia = useMemo(
    () => items.find((item) => item.id === selectedExistingId) ?? null,
    [items, selectedExistingId],
  );
  const selectedExistingAspectMismatch =
    Boolean(requireAspectRatio && requiredAspectRatio && selectedExistingMedia) &&
    !matchesAspectRatio(selectedExistingMedia, requiredAspectRatio);
  const uploadAspectPending =
    Boolean(requireAspectRatio && requiredAspectRatio && uploadFile) && uploadDimensions == null;
  const uploadAspectMismatch =
    Boolean(requireAspectRatio && requiredAspectRatio && uploadFile && uploadDimensions) &&
    !matchesAspectRatio(uploadDimensions, requiredAspectRatio);
  const selectedExistingAspectMessage =
    selectedExistingAspectMismatch && aspectRatioMessage
      ? `Cette image ne respecte pas le ${aspectRatioMessage.toLowerCase()}.`
      : null;
  const uploadAspectError =
    uploadAspectMismatch && aspectRatioMessage
      ? `Le fichier doit respecter le ${aspectRatioMessage.toLowerCase()}.`
      : null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isUploading) {
      return;
    }

    if (!nextOpen) {
      isClosingRef.current = true;
      loadRequestIdRef.current += 1;
      setIsLoading(false);
      setIsLoadingMore(false);
    }

    onOpenChange(nextOpen);
  };

  const handleChooseExisting = () => {
    if (!selectedExistingMedia || selectedExistingAspectMismatch) {
      return;
    }

    onSelect(selectedExistingMedia);
    handleOpenChange(false);
  };

  const handleUpload = async () => {
    if (!uploadFile || uploadAspectMismatch) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const folderId = await resolveScopedFolderId();
      const media = await uploadMediaClient({
        file: uploadFile,
        folderId,
      });

      onSelect(media);
      handleOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'import de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  const tabClsBase = "px-3 py-2 min-w-28";
  const activeTabCls =
    tabClsBase + " text-cobam-dark-blue font-semibold shadow-sm border-slate-300";
  const nonActiveTabCls = tabClsBase;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[80vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-300 px-6 py-5">
          <DialogTitle className="text-cobam-dark-blue flex items-center gap-2 text-base font-semibold">
            <ImagePlus className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-slate-500">
            {description}
            {aspectRatioMessage ? ` ${aspectRatioMessage}.` : ""}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PickerTab)}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6"
        >
          <TabsList variant="line" className="justify-start gap-2 rounded-none p-0">
            <TabsTrigger
              value="library"
              className={activeTab === "library" ? activeTabCls : nonActiveTabCls}
            >
              Bibliothèque
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className={activeTab === "upload" ? activeTabCls : nonActiveTabCls}
            >
              Importer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="gap-5 space-y-5">
            <SearchInput value={search} onChange={(s: string) => setSearch(s)} fullWidth />

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {isLoading && items.length === 0 ? (
              <PickerLoadingGrid />
            ) : items.length === 0 ? (
              <PickerEmptyState
                title="Aucune image disponible"
                description={
                  folderPath
                    ? `Aucune image n'est disponible dans ${folderPath} pour le moment.`
                    : "Essayez une autre recherche dans toute la mediatheque ou importez une nouvelle image depuis l'onglet Importer."
                }
              />
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">{scopedLibraryDescription}</p>
                <div className="max-h-[52vh] overflow-y-auto pr-1">
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {items.map((item) => (
                      <LibraryImageCard
                        key={item.id}
                        item={item}
                        isSelected={item.id === selectedExistingId}
                        onSelect={setSelectedExistingId}
                        isBlocked={
                          Boolean(requireAspectRatio && requiredAspectRatio) &&
                          !matchesAspectRatio(item, requiredAspectRatio)
                        }
                        blockedReason={
                          requireAspectRatio && requiredAspectRatio
                            ? (aspectRatioMessage ?? undefined)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>

                {selectedExistingAspectMessage ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    {selectedExistingAspectMessage}
                  </div>
                ) : null}

                {hasMore ? (
                  <div className="flex justify-center">
                    <AnimatedUIButton
                      type="button"
                      variant="light"
                      onClick={() => void loadImages(page + 1, false)}
                      disabled={isLoadingMore}
                      loading={isLoadingMore}
                      loadingText="Chargement..."
                    >
                      Charger plus d&apos;images
                    </AnimatedUIButton>
                  </div>
                ) : null}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-0 flex grid flex-col gap-5">
            <div className="block flex flex-col gap-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <span className="text-cobam-dark-blue inline-flex items-center gap-2 font-semibold">
                <Upload className="h-4 w-4" />
                Choisir un fichier
              </span>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
              />
            </div>

            <PickerSection
              title="Aperçu"
              description="Controlez rapidement le rendu avant l'import."
            >
              <div className="space-y-4">
                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                {uploadAspectError ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    {uploadAspectError}
                  </div>
                ) : null}

                {uploadPreviewUrl ? (
                  <ImagePreview
                    src={uploadPreviewUrl}
                    alt="Aperçu de l'image"
                    className="w-full rounded-3xl"
                    style={{
                      aspectRatio:
                        getAspectRatioCssValue(requiredAspectRatio, uploadDimensions) ?? "4 / 3",
                    }}
                  />
                ) : (
                  <PickerEmptyState
                    title="Aperçu indisponible"
                    description="Choisissez un fichier image pour afficher son aperçu ici."
                    className="min-h-[360px]"
                  />
                )}
              </div>
            </PickerSection>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t border-slate-300 px-6 py-4">
          <AnimatedUIButton
            type="button"
            variant="light"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
          >
            Annuler
          </AnimatedUIButton>

          {activeTab === "library" ? (
            <AnimatedUIButton
              type="button"
              variant="primary"
              icon="save"
              onClick={handleChooseExisting}
              disabled={!selectedExistingMedia || selectedExistingAspectMismatch}
            >
              Utiliser cette image
            </AnimatedUIButton>
          ) : (
            <AnimatedUIButton
              type="button"
              variant="primary"
              icon="plus"
              iconPosition="left"
              onClick={() => void handleUpload()}
              disabled={!uploadFile || isUploading || uploadAspectPending || uploadAspectMismatch}
              loading={isUploading}
              loadingText="Import..."
            >
              Importer et utiliser
            </AnimatedUIButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
