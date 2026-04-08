"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import type { Brand as PublicBrand } from "@/lib/static_tables/brands";
import { cn } from "@/lib/utils";

interface BrandSliderProps {
  brands: PublicBrand[];
  href: string;
  speed?: number; // px/s at base speed (default: 80)
}

const CARD_WIDTH = 128; // w-32
const CARD_GAP = 24;   // gap-6
const CARD_STEP = CARD_WIDTH + CARD_GAP;

export default function BrandSlider({
  brands,
  href,
  speed = 80,
}: BrandSliderProps) {
  // Triple for seamless loop
  const tripledBrands = [...brands, ...brands, ...brands];

  // The x offset we drive directly
  const x = useMotionValue(0);

  // Spring-smoothed x for actual rendering (makes drag release & hover feel buttery)
  const smoothX = useSpring(x, {
    stiffness: 60,
    damping: 20,
    mass: 0.8,
    restDelta: 0.001,
  });

  const totalWidth = brands.length * CARD_STEP;

  // Clamp x into the middle third so we can wrap seamlessly
  const wrapX = useCallback(
    (raw: number) => {
      // Keep x in [-2*totalWidth, 0] range; loop every totalWidth
      let v = raw % -totalWidth;
      if (v > 0) v -= totalWidth;
      return v;
    },
    [totalWidth]
  );

  // Refs for the auto-scroll animation and hover state
  const autoAnimRef = useRef<ReturnType<typeof animate> | null>(null);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);

  // Start or restart the infinite auto-scroll
  const startAutoScroll = useCallback(() => {
    if (autoAnimRef.current) autoAnimRef.current.stop();

    const current = x.get();
    // Distance to scroll one full loop (negative = left)
    const remaining = -totalWidth - (current % -totalWidth || 0);
    const duration = Math.abs(remaining) / speed;

    autoAnimRef.current = animate(x, current + remaining, {
      duration,
      ease: "linear",
      onComplete: () => {
        // Snap back by one unit silently, then restart
        x.set(wrapX(x.get()));
        startAutoScroll();
      },
    });
  }, [x, totalWidth, speed, wrapX]);

  const stopAutoScroll = useCallback(() => {
    autoAnimRef.current?.stop();
  }, []);

  // Boot
  useEffect(() => {
    if (brands.length === 0) return;
    x.set(-totalWidth); // start in the middle third
    startAutoScroll();
    return () => stopAutoScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brands.length, totalWidth]);

  // Hover: decelerate → stop
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    stopAutoScroll();
    // Animate to a gentle stop using spring decay on the smoothX
    animate(x, x.get(), { duration: 0.6, ease: "easeOut" });
  };

  // Unhover: re-engage auto-scroll from current position
  const handleMouseLeave = () => {
    if (isDraggingRef.current) return;
    isHoveredRef.current = false;
    startAutoScroll();
  };

  // Drag
  const handleDragStart = () => {
    isDraggingRef.current = true;
    stopAutoScroll();
  };

  const handleDragEnd = (_: unknown, info: { velocity: { x: number } }) => {
    isDraggingRef.current = false;

    // Wrap position silently
    x.set(wrapX(x.get()));

    if (!isHoveredRef.current) {
      // Throw with velocity then resume auto-scroll
      const throwDist = info.velocity.x * 0.3;
      animate(x, x.get() + throwDist, {
        duration: 0.5,
        ease: "easeOut",
        onComplete: () => {
          x.set(wrapX(x.get()));
          startAutoScroll();
        },
      });
    }
  };

  // Left / Right nav buttons
  const nudge = (direction: "left" | "right") => {
    stopAutoScroll();
    const delta = direction === "left" ? CARD_STEP * 3 : -CARD_STEP * 3;
    const target = wrapX(x.get() + delta);
    animate(x, target, {
      duration: 0.5,
      ease: [0.32, 0.72, 0, 1],
      onComplete: () => {
        if (!isHoveredRef.current) startAutoScroll();
      },
    });
  };

  if (brands.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cobam-quill-grey/60 bg-white/30 backdrop-blur-sm px-6 py-10 text-center text-sm text-cobam-carbon-grey">
        Aucune marque disponible.
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* ← Button */}
      <NavButton direction="left" onClick={() => nudge("left")} />

      {/* Slider viewport */}
      <div
        className="overflow-hidden flex-1 pb-3 pt-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="flex gap-6 cursor-grab active:cursor-grabbing select-none"
          style={{ x: smoothX, width: tripledBrands.length * CARD_STEP }}
          drag="x"
          dragConstraints={{ left: -Infinity, right: Infinity }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          // Override spring during drag for instant feel
          onPointerDown={() => {
            isDraggingRef.current = true;
          }}
        >
          {tripledBrands.map((brand, idx) => (
            <Link
              href={`${href}#${brand.slug}`}
              key={`${brand.name}-${idx}`}
              draggable={false}
              onClick={(e) => {
                // Prevent navigation when user was dragging
                if (isDraggingRef.current) e.preventDefault();
              }}
              className="group flex h-24 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-cobam-water-blue/50 hover:shadow-md"
            >
              {brand.imageUrl ? (
                <Image
                  src={brand.imageUrl}
                  alt={brand.name}
                  width={480}
                  height={240}
                  className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-110"
                  draggable={false}
                />
              ) : (
                <span className="px-2 text-center text-sm font-semibold text-cobam-dark-blue">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </motion.div>
      </div>

      {/* → Button */}
      <NavButton direction="right" onClick={() => nudge("right")} />
    </div>
  );
}

// ─── Nav Button ───────────────────────────────────────────────────────────────

function NavButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
      className={cn(
        "flex h-10 w-10 flex-shrink-0 items-center", 
        "justify-center rounded-full transition-colors", 
        "hover:border-cobam-water-blue/50 hover:bg-white",
        direction === "left" ? "mr-2" : "ml-2"
      )}
      aria-label={direction === "left" ? "Précédent" : "Suivant"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-cobam-dark-blue"
        style={{ transform: direction === "right" ? "rotate(180deg)" : undefined }}
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </motion.button>
  );
}
