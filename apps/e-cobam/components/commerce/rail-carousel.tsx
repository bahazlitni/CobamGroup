"use client";

import { Children, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion, useMotionValue, animate } from "framer-motion";
import { cn } from "@/lib/cn";

type RailCarouselProps = {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
  trackClassName?: string;
  itemClassName?: string;
  scrollStep?: number;
  previousLabel?: string;
  nextLabel?: string;
  draggable?: boolean;
};

function getScrollStep(element: HTMLElement, explicitStep?: number) {
  if (explicitStep) {
    return explicitStep;
  }

  return Math.max(280, Math.round(element.clientWidth * 0.78));
}

export function RailCarousel({
  children,
  className,
  viewportClassName,
  trackClassName,
  itemClassName,
  scrollStep,
  previousLabel = "Element precedent",
  nextLabel = "Element suivant",
  draggable = true,
}: RailCarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const items = Children.toArray(children);

  const x = useMotionValue(0);
  const isDraggingRef = useRef(false);

  const getMaxScroll = useCallback(() => {
    if (!viewportRef.current || !trackRef.current) return 0;
    return Math.max(0, trackRef.current.offsetWidth - viewportRef.current.offsetWidth);
  }, []);

  const updateButtons = useCallback((latestX: number) => {
    const maxScroll = getMaxScroll();
    setCanScrollLeft(latestX < -2);
    setCanScrollRight(latestX > -maxScroll + 2);
  }, [getMaxScroll]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => updateButtons(x.get()));

    const unsubscribe = x.on("change", (latestX) => {
      updateButtons(latestX);
    });

    const handleResize = () => {
      updateButtons(x.get());
      const maxScroll = getMaxScroll();
      if (x.get() < -maxScroll) {
        animate(x, -maxScroll, {
          type: "spring",
          stiffness: 180,
          damping: 24,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [x, updateButtons, getMaxScroll]);

  const scrollByDirection = useCallback(
    (direction: -1 | 1) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const step = getScrollStep(viewport, scrollStep);
      const maxScroll = getMaxScroll();
      
      const currentX = x.get();
      let targetX = currentX - direction * step;
      targetX = Math.max(-maxScroll, Math.min(0, targetX));

      animate(x, targetX, {
        type: "spring",
        stiffness: 180,
        damping: 24,
      });
    },
    [scrollStep, getMaxScroll, x],
  );

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (draggable && isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      className={cn("group/rail relative", className)}
      onPointerEnter={() => setIsInteracting(true)}
      onPointerLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsInteracting(false);
        }
      }}
    >
      <div
        ref={viewportRef}
        data-rail-carousel="viewport"
        className={cn(
          "overflow-hidden select-none",
          viewportClassName,
        )}
      >
        <motion.div
          ref={trackRef}
          drag={draggable ? "x" : false}
          dragConstraints={viewportRef}
          dragElastic={0.15}
          dragMomentum={true}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClickCapture={handleClickCapture}
          style={{ x }}
          className={cn(
            "flex w-max items-stretch gap-5",
            draggable && "cursor-grab active:cursor-grabbing",
            trackClassName
          )}
        >
          {items.map((item, index) => (
            <div key={index} className={cn("shrink-0", itemClassName)}>
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      <motion.button
        type="button"
        aria-label={previousLabel}
        onClick={() => scrollByDirection(-1)}
        initial={false}
        animate={{
          opacity: canScrollLeft && isInteracting ? 1 : 0,
          x: canScrollLeft && isInteracting ? 0 : -8,
          pointerEvents: canScrollLeft && isInteracting ? "auto" : "none",
        }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        className={cn(
          "absolute left-0 top-1/2 z-10 grid size-12 -translate-x-3 -translate-y-1/2 place-items-center",
          "border border-ec-line bg-white text-ec-ink shadow-[0_16px_42px_rgba(20,32,46,0.14)] transition",
          "hover:border-ec-ink hover:bg-ec-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-blue",
          "opacity-0",
        )}
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </motion.button>

      <motion.button
        type="button"
        aria-label={nextLabel}
        onClick={() => scrollByDirection(1)}
        initial={false}
        animate={{
          opacity: canScrollRight && isInteracting ? 1 : 0,
          x: canScrollRight && isInteracting ? 0 : 8,
          pointerEvents: canScrollRight && isInteracting ? "auto" : "none",
        }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        className={cn(
          "absolute right-0 top-1/2 z-10 grid size-12 -translate-y-1/2 translate-x-3 place-items-center",
          "border border-ec-line bg-white text-ec-ink shadow-[0_16px_42px_rgba(20,32,46,0.14)] transition",
          "hover:border-ec-ink hover:bg-ec-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-blue",
          "opacity-0",
        )}
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </motion.button>
    </div>
  );
}

type InfinityRailCarouselProps = {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  itemClassName?: string;
  duration?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  repeat?: number;
  draggable?: boolean;
};

export function InfinityRailCarousel({
  children,
  className,
  trackClassName,
  itemClassName,
  duration = 34,
  direction = "left",
  pauseOnHover = true,
  repeat = 3,
  draggable = true,
}: InfinityRailCarouselProps) {
  const shouldReduceMotion = useReducedMotion();
  const items = Children.toArray(children);
  const groupCount = Math.max(2, repeat);
  const groups = Array.from({ length: groupCount });
  const loopOffset = `${-100 / groupCount}%`;

  const dragX = useMotionValue(0);
  const isDraggingRef = useRef(false);

  if (items.length === 0) {
    return null;
  }

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = () => {
    animate(dragX, 0, {
      type: "spring",
      stiffness: 80,
      damping: 18,
      mass: 1,
    });

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (draggable && isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        drag={draggable ? "x" : false}
        dragConstraints={{ left: -400, right: 400 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClickCapture={handleClickCapture}
        style={{ x: dragX }}
        className={cn("w-full select-none", draggable && "cursor-grab active:cursor-grabbing")}
      >
        <motion.div
          className={cn(
            "flex w-max items-stretch gap-4",
            pauseOnHover && "hover:[animation-play-state:paused]",
            trackClassName,
          )}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: direction === "left" ? ["0%", loopOffset] : [loopOffset, "0%"],
                }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration,
                  ease: "linear",
                  repeat: Infinity,
                }
          }
        >
          {groups.map((_, groupIndex) => (
            <div key={groupIndex} className="flex items-stretch gap-4" aria-hidden={groupIndex > 0}>
              {items.map((item, itemIndex) => (
                <div key={`${groupIndex}-${itemIndex}`} className={cn("shrink-0", itemClassName)}>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
