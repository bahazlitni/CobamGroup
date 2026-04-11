"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimelineView from "./TimelineView";
import GridView from "./GridView";
import { LayoutGrid, GitCommit } from "lucide-react";
import type { Brand as PublicBrand } from "@/lib/static_tables/brands";

export default function BrandsViews({ brands }: { brands: PublicBrand[] }) {
  const [view, setView] = useState("timeline");

  if (brands.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-cobam-quill-grey/60 bg-white/80 px-6 py-12 text-center text-cobam-carbon-grey">
        Aucune marque n'est disponible pour le moment.
      </div>
    );
  }

  return (
    <Tabs value={view} onValueChange={setView} className="w-full flex-col">
      <div className="mb-10 flex justify-center lg:justify-start">
        <TabsList className="h-auto rounded-2xl border border-cobam-quill-grey/50 bg-white p-1 shadow-sm">

          <TabsTrigger
            value="timeline"
            className="
              rounded-xl px-5 py-2.5 text-sm font-semibold transition
              data-[state=active]:bg-cobam-water-blue
              data-[state=active]:text-white
            "
          >
            <GitCommit />
          </TabsTrigger>

          <TabsTrigger
            value="grid"
            className="
              rounded-xl px-5 py-2.5 text-sm font-semibold transition
              data-[state=active]:bg-cobam-water-blue
              data-[state=active]:text-white
            "
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
