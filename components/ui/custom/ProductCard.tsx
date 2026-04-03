// @/components/ui/custom/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ProductCardProps {
  name: string;
  category: string;
  imageUrl: string;
  href: string;
}

export default function ProductCard({ name, category, imageUrl, href }: ProductCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-cobam-water-blue/10 border border-slate-200/50"
    >
      <div className="aspect-square overflow-hidden bg-cobam-light-bg">
        <Image
          src={imageUrl}
          alt={name}
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-cobam-water-blue">
          {category}
        </p>
        <h3 className="mt-1 text-base font-semibold text-cobam-dark-blue group-hover:text-cobam-water-blue transition-colors">
          {name}
        </h3>
      </div>
      <div className="absolute bottom-4 right-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
        <ArrowUpRight className="h-5 w-5 text-cobam-water-blue" />
      </div>
    </Link>
  );
}