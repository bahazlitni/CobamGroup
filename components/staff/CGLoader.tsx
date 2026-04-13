"use client";

import { useEffect, useMemo, useState } from "react";

type LoaderVariant = "waterBlue" | "white" | "darkBlue";

interface BrandLoaderProps {
  variant?: LoaderVariant;
  size?: number;
  className?: string;
  fps?: number;
  frameCount?: number;
  alt?: string;
}

const FRAME_COUNT = 46;
const DEFAULT_FPS = 30;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}


export default function CGLoader({
  variant = "waterBlue",
  size = 72,
  className,
  fps = DEFAULT_FPS,
  frameCount = FRAME_COUNT,
  alt = "Loading",
}: BrandLoaderProps) {
  const [frame, setFrame] = useState(1);
  const [isReady, setIsReady] = useState(false);

  const basePath = useMemo(
    () => `/images/loading-animation/`,
    [variant]
  );

  useEffect(() => {
    let cancelled = false;
    setIsReady(false);
    setFrame(1);

    const preloadFrames = async () => {
      const promises = Array.from({ length: frameCount }, (_, index) => {
        const img = new window.Image();
        img.src = `${basePath}/${index + 1}.svg`;

        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      });

      await Promise.all(promises);

      if (!cancelled) {
        setIsReady(true);
      }
    };

    preloadFrames();

    return () => {
      cancelled = true;
    };
  }, [basePath, frameCount]);

  useEffect(() => {
    if (!isReady || fps <= 0) return;

    const intervalMs = 1000 / fps;

    const interval = window.setInterval(() => {
      setFrame((prev) => (prev >= frameCount ? 1 : prev + 1));
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [isReady, fps, frameCount]);

  return (
    <div
      className={cn(
        "relative aspect-square flex flex-col items-center justify-center gap-4 shrink-0 select-none items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={alt}
      aria-busy="true"
    >
      {isReady ? (
        <img
          src={`${basePath}/${frame}.svg`}
          alt={alt}
          width={209}
          height={112}
          draggable={false}
          className="block h-full w-full object-contain"
        />
      ) : (
        <div className="h-full w-full animate-pulse rounded-full bg-white/10" />
      )}

      <p className="text-cobam-water-blue text-xs">Loading</p>
    </div>
    
  );
}