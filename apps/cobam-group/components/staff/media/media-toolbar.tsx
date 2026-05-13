"use client";

import { AArrowDown, AArrowUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import PanelSelect from "@/components/staff/ui/PanelSelect";
import type { MediaSortBy, MediaView } from "@/features/media/types";
import SearchInput from "@/components/staff/ui/SearchInput";

const viewOptions: Array<{ value: MediaView; label: string }> = [
  { value: "all", label: "Tout" },
  { value: "images", label: "Images" },
  { value: "videos", label: "Videos" },
  { value: "pdf", label: "PDF" },
  { value: "audio", label: "Audio" },
  { value: "other", label: "Autres" },
];

export default function MediaToolbar({
  search,
  onSearchChange,
  activeView,
  onActiveViewChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onToggleSortDirection,
  canCreateFolder,
  onCreateFolder,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  activeView: MediaView;
  onActiveViewChange: (value: MediaView) => void;
  sortBy: MediaSortBy;
  onSortByChange: (value: MediaSortBy) => void;
  sortDirection: "asc" | "desc";
  onToggleSortDirection: () => void;
  canCreateFolder?: boolean;
  onCreateFolder?: () => void;
}) {
  return (
    <Card className="overflow-hidden rounded-[2rem] border border-slate-300 shadow-sm">
      <CardContent className="space-y-5 px-5 py-5 md:px-6">
        <div className="flex flex-wrap items-center justify-end gap-3">
          {canCreateFolder && onCreateFolder ? (
            <AnimatedUIButton
              type="button"
              variant="light"
              icon="plus"
              iconPosition="left"
              onClick={onCreateFolder}
            >
              Nouveau dossier
            </AnimatedUIButton>
          ) : null}
        </div>

        <Tabs value={activeView} onValueChange={(value) => onActiveViewChange(value as MediaView)}>
          <TabsList variant="line" className="w-full flex-wrap justify-start gap-2 rounded-none p-0">
            {viewOptions.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="max-w-fit rounded-full border border-slate-300 bg-white px-4 py-2 text-sm data-[state=active]:border-cobam-dark-blue data-[state=active]:bg-cobam-dark-blue data-[state=active]:text-white data-[state=active]:after:hidden"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-3">
          <SearchInput
            onChange={onSearchChange}
            value={search}
            placeholder="Rechercher un nom, un chemin ou un mime..."
          />

          <PanelSelect
            value={sortBy}
            onValueChange={(value) => onSortByChange(value as MediaSortBy)}
            options={[
              { value: "date", label: "Tri par date" },
              { value: "name", label: "Tri par nom" },
              { value: "size", label: "Tri par taille" },
            ]}
          />

          <AnimatedUIButton type="button" variant="ghost" onClick={onToggleSortDirection}>
            {sortDirection === "asc" ? <AArrowDown /> : <AArrowUp />}
          </AnimatedUIButton>
        </div>
      </CardContent>
    </Card>
  );
}
