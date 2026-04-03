// @/components/ui/custom/TestimonialCard.tsx
"use client";

import { Star } from "lucide-react";

interface TestimonialCardProps {
  text: string;
  author: string;
  rating?: number;
}

export default function TestimonialCard({
  text,
  author,
  rating = 5,
}: TestimonialCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm p-6 shadow-sm transition-all duration-500 hover:shadow-xl hover:scale-[1.02] border border-slate-200/50">
      <div className="absolute inset-0 bg-gradient-to-br from-cobam-water-blue/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex gap-1">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-cobam-carbon-grey text-sm leading-relaxed italic">
          "{text}"
        </p>
        <div className="pt-4 border-t border-slate-200/50">
          <span className="text-cobam-dark-blue font-bold text-sm">{author}</span>
        </div>
      </div>
    </div>
  );
}