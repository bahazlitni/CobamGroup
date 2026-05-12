"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimelineView from "./TimelineView";
import GridView from "./GridView";
import { LayoutGrid, GitCommit } from "lucide-react";
import type { PublicBrandViewItem } from "./types";

export default function BrandsViews({ brands }: { brands: PublicBrandViewItem[] }) {
  const [view, setView] = useState("timeline");

  if (brands.length === 0) {
    return (
      <div className="border-cobam-quill-grey/60 text-cobam-carbon-grey rounded-3xl border border-dashed bg-white/80 px-6 py-12 text-center">
        Aucune marque n&apos;est disponible pour le moment.
      </div>
    );
  }

  return (
    <Tabs value={view} onValueChange={setView} className="w-full flex-col">
      <div className="mb-10 flex justify-center lg:justify-start">
        <TabsList className="border-cobam-quill-grey/50 h-auto rounded-lg border bg-white p-1 shadow-sm">
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-cobam-water-blue rounded-xl px-5 py-2.5 text-sm font-semibold transition data-[state=active]:text-white"
          >
            <GitCommit />
          </TabsTrigger>

          <TabsTrigger
            value="grid"
            className="data-[state=active]:bg-cobam-water-blue rounded-xl px-5 py-2.5 text-sm font-semibold transition data-[state=active]:text-white"
          >
            <LayoutGrid />
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="timeline">
        <TimelineView brands={brands} />
      </TabsContent>

      <TabsContent value="grid">
        <GridView brands={brands} />
      </TabsContent>
    </Tabs>
  );
}
