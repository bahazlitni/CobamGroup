"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function SafeMediaImage({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-ec-muted/45 grid h-full w-full place-items-center px-6 text-center text-xs font-black tracking-[0.2em] uppercase">
        {fallback}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="(min-width: 1280px) 22vw, (min-width: 768px) 34vw, 92vw"
      className={cn("h-full w-full", className)}
      onError={() => setFailed(true)}
    />
  );
}
