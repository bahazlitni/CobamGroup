"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import MediaGrid from "@/components/staff/media/media-grid";
import MediaInspectorDialog from "@/components/staff/media/media-inspector-dialog";
import MediaSelectionBar from "@/components/staff/media/media-selection-bar";
import MediaStats from "@/components/staff/media/media-stats";
import MediaToolbar from "@/components/staff/media/media-toolbar";
import MediaUploadDialog from "@/components/staff/media/media-upload-dialog";
import { StaffNotice, StaffPageHeader, StaffStateCard } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canAccessMediaLibrary, canUploadMedia } from "@/features/media/access";
import { MediaClientError } from "@/features/media/client";
import { useMediaLibrary } from "@/features/media/hooks/use-media-library";
import type {
  MediaDeleteOptions,
  MediaUploadBatchCallbacks,
  MediaUploadBatchResult,
} from "@/features/media/types";

export default function MediaLibraryPage() {
  const { user: authUser, isLoading: isAuthLoading } = useStaffSessionContext();
  const canAccess = authUser ? canAccessMediaLibrary(authUser) : false;
  const canImport = authUser ? canUploadMedia(authUser) : false;
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const {
    groups,
    stats,
    storage,
    search,
    setSearch,
    activeView,
    setActiveView,
    sortBy,
    setSortBy,
    sortDirection,
    toggleSortDirection,
    selectedIds,
    selectedTotalSize,
    selectionRequiresForceDelete,
    canDeleteSelection,
    toggleSelected,
    toggleManySelected,
    clearSelection,
    selectedMedia,
    openMedia,
    closeMedia,
    openedMediaId,
    hasMore,
    isLoadingInitial,
    isLoadingMore,
    isUploading,
    deletingMediaId,
    isDeletingSelection,
    error,
    uploadMany,
    remove,
    removeSelected,
    updateMedia,
    sentinelRef,
  } = useMediaLibrary();

  const handleUploadMany = async (
    inputs: Parameters<typeof uploadMany>[0],
    callbacks?: MediaUploadBatchCallbacks,
  ): Promise<MediaUploadBatchResult> => {
    try {
      const result = await uploadMany(inputs, callbacks);

      if (result.errorCount > 0) {
        toast.error(
          result.successCount > 0
            ? `${result.successCount} fichier(s) importe(s), ${result.errorCount} en erreur.`
            : `${result.errorCount} fichier(s) n'ont pas pu etre importes.`,
        );
      } else if (result.successCount > 0) {
        toast.success(
          result.successCount > 1
            ? `${result.successCount} fichiers importes avec succes.`
            : "Media importe avec succes.",
        );
      }

      return result;
    } catch (error: unknown) {
      const message =
        error instanceof MediaClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Erreur lors de l'import du media.";
      toast.error(message);

      return {
        total: inputs.length,
        successCount: 0,
        errorCount: inputs.length,
        items: inputs.map((input) => ({
          ok: false as const,
          input,
          errorMessage: message,
        })),
      };
    }
  };

  const handleDelete = async (
    mediaId: number,
    options: MediaDeleteOptions = {},
  ): Promise<boolean> => {
    try {
      const deleted = await remove(mediaId, options);

      if (deleted) {
        toast.success(
          options.force
            ? "Media dereference puis supprime."
            : "Media supprime.",
        );
      }

      return deleted;
    } catch (error: unknown) {
      const message =
        error instanceof MediaClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Erreur lors de la suppression du media.";
      toast.error(message);
      return false;
    }
  };

  const handleDeleteSelection = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      selectionRequiresForceDelete
        ? `Forcer la suppression de ${selectedIds.length} fichier(s) selectionne(s) ? Les fichiers encore references seront dereferences avant suppression definitive.`
        : `Supprimer ${selectedIds.length} fichier(s) selectionne(s) ?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const deletedCount = await removeSelected({
        force: selectionRequiresForceDelete,
      });

      toast.success(
        selectionRequiresForceDelete
          ? `${deletedCount} media(s) dereference(s) puis supprime(s).`
          : `${deletedCount} media(s) supprime(s).`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof MediaClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Erreur lors de la suppression de la selection.";
      toast.error(message);
    }
  };

  const handleUpdateVisibility = async (
    mediaId: number,
    visibility: "PRIVATE" | "PUBLIC",
  ) => {
    try {
      return await updateMedia(mediaId, { visibility });
    } catch (error: unknown) {
      const message =
        error instanceof MediaClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Erreur lors de la mise a jour du media.";
      toast.error(message);
      throw error;
    }
  };

  if (isAuthLoading && !authUser) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <StaffStateCard
        variant="forbidden"
        title="Acces refuse"
        description="Vous n'avez pas l'autorisation d'acceder a la mediatheque."
        actionHref="/espace/staff"
        actionLabel="Retour au tableau de bord"
      />
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <StaffPageHeader
        eyebrow="Medias"
        title="Bibliotheque de fichiers"
        icon={ImageIcon}
        actions={
          canImport ? (
            <AnimatedUIButton
              type="button"
              variant="secondary"
              icon="plus"
              iconPosition="left"
              onClick={() => setIsUploadOpen(true)}
            >
              Importer des fichiers
            </AnimatedUIButton>
          ) : (
            <div className="flex h-12 items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 text-sm text-slate-400">
              Import indisponible
            </div>
          )
        }
      />

      <MediaStats stats={stats} storage={storage} />

      <MediaToolbar
        search={search}
        onSearchChange={setSearch}
        activeView={activeView}
        onActiveViewChange={setActiveView}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDirection={sortDirection}
        onToggleSortDirection={toggleSortDirection}
      />

      {error ? (
        <StaffNotice variant="error" title="Chargement impossible">
          {error}
        </StaffNotice>
      ) : null}

      {selectedIds.length > 0 ? (
        <MediaSelectionBar
          count={selectedIds.length}
          totalSize={selectedTotalSize}
          canDelete={canDeleteSelection}
          isForceDeleteMode={selectionRequiresForceDelete}
          isDeleting={isDeletingSelection}
          onClear={clearSelection}
          onDelete={() => void handleDeleteSelection()}
        />
      ) : null}

      <MediaGrid
        groups={groups}
        selectedIds={selectedIds}
        onToggleSelected={toggleSelected}
        onToggleGroupSelected={toggleManySelected}
        onOpen={openMedia}
        isLoadingInitial={isLoadingInitial}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        sentinelRef={sentinelRef}
      />

      <MediaUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        isUploading={isUploading}
        storage={storage}
        onUploadMany={handleUploadMany}
      />

      <MediaInspectorDialog
        media={selectedMedia}
        open={openedMediaId != null}
        onOpenChange={(open) => {
          if (!open) {
            closeMedia();
          }
        }}
        isDeleting={deletingMediaId === selectedMedia?.id}
        onDelete={handleDelete}
        onUpdateVisibility={handleUpdateVisibility}
      />
    </div>
  );
}
