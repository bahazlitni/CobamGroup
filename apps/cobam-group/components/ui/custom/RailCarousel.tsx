"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/lib/utils";
import { AnimatedUIButton } from "./AnimatedUIButton";

// ─── Public API ───────────────────────────────────────────────────────────────

export type RailCarouselProps = {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
  trackClassName?: string;
  itemClassName?: string;
  buttonClassName?: string;

  /** px/s for auto-scroll */
  autoScrollSpeed?: number;
  autoScroll?: boolean;
  autoScrollDirection?: "ltr" | "rtl";

  showButtons?: "on-hover" | "always" | "never";
  allowDrag?: boolean;

  /**
   * Enable spring physics on drag release and button clicks.
   * When false the scroll snaps immediately.
   */
  applyPhysics?: boolean;

  /**
   * Triple-clone children and loop infinitely.
   * Works best when total content width > viewport width.
   */
  modularScroll?: boolean;

  /** Override the button step (defaults to 82% of viewport width). */
  scrollStep?: number;

  previousButtonLabel?: string;
  nextButtonLabel?: string;

  /** Spring stiffness — higher = snappier (default 260). */
  stiffness?: number;
  /** Spring damping — higher = less oscillation (default 30). */
  damping?: number;
  /** Spring mass — higher = heavier feel (default 1). */
  mass?: number;

  viewportRef?: Ref<HTMLDivElement>;
};

// ─── Spring physics ───────────────────────────────────────────────────────────

interface SpringState {
  position: number;
  velocity: number;
  target: number;
}

/**
 * Integrate one spring step using semi-implicit Euler with fixed 8 ms sub-steps.
 * Spring equation: F = -k·(pos - target) - c·v
 */
function integrateSpring(
  state: SpringState,
  dtMs: number,
  stiffness: number,
  damping: number,
  mass: number,
): SpringState {
  const SUB_STEP = 8;
  let { position, velocity } = state;
  let remaining = Math.min(dtMs, 64); // cap to survive tab-switch spikes

  while (remaining > 0) {
    const step = Math.min(remaining, SUB_STEP);
    const dt = step / 1000;
    const displacement = position - state.target;
    const acceleration = (-stiffness * displacement - damping * velocity) / mass;
    velocity += acceleration * dt;
    position += velocity * dt;
    remaining -= step;
  }

  return { position, velocity, target: state.target };
}

const REST_VELOCITY = 0.5;  // px/s
const REST_DELTA    = 0.25; // px

// ─── Rolling velocity sampler ─────────────────────────────────────────────────

const VELOCITY_WINDOW_MS = 80;

interface VelocitySample { t: number; x: number; }

class VelocitySampler {
  private samples: VelocitySample[] = [];

  record(x: number) {
    const t = performance.now();
    this.samples.push({ t, x });
    const cutoff = t - VELOCITY_WINDOW_MS;
    while (this.samples.length > 1 && this.samples[0].t < cutoff) this.samples.shift();
  }

  /** Returns velocity in px/s */
  compute(): number {
    if (this.samples.length < 2) return 0;
    const b = this.samples[this.samples.length - 1];
    if (performance.now() - b.t > VELOCITY_WINDOW_MS) return 0;
    const a = this.samples[0];
    const dt = b.t - a.t;
    if (dt < 4) return 0;
    return ((b.x - a.x) / dt) * 1000;
  }

  reset() { this.samples = []; }
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

function setRefValue<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") { ref(value as T); return; }
  (ref as React.MutableRefObject<T | null>).current = value;
}

const DRAG_THRESHOLD_PX   = 5;
const RUBBER_BAND_FACTOR  = 0.18;

// ─── Component ────────────────────────────────────────────────────────────────

export default function RailCarousel({
  children,
  className,
  viewportClassName,
  trackClassName,
  itemClassName,
  buttonClassName,
  autoScrollSpeed = 40,
  autoScroll = false,
  autoScrollDirection = "rtl",
  showButtons = "on-hover",
  allowDrag = true,
  applyPhysics = true,
  modularScroll = false,
  scrollStep,
  previousButtonLabel = "Précédent",
  nextButtonLabel = "Suivant",
  stiffness = 260,
  damping = 30,
  mass = 1,
  viewportRef,
}: RailCarouselProps) {

  // ── DOM ─────────────────────────────────────────────────────────────────────
  const viewportEl = useRef<HTMLDivElement | null>(null);

  // ── Render-triggering state ─────────────────────────────────────────────────
  const [hasOverflow,    setHasOverflow]    = useState(false);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered,      setIsHovered]      = useState(false);

  // ── Physics state (all in refs — never cause re-renders) ────────────────────
  const spring        = useRef<SpringState>({ position: 0, velocity: 0, target: 0 });
  const rafRef        = useRef<number | null>(null);
  const lastTickRef   = useRef<number | null>(null);
  const isDragging    = useRef(false);
  const autoScrollOn  = useRef(false); // live mirror of whether auto-scroll is active

  // ── Drag state ──────────────────────────────────────────────────────────────
  const capturedPointer   = useRef<number | null>(null);
  const dragStartX        = useRef(0);
  const dragStartScroll   = useRef(0);
  const sampler           = useRef(new VelocitySampler());

  // ── Children / loop ─────────────────────────────────────────────────────────
  const childArray  = useMemo(() => Children.toArray(children), [children]);
  const shouldLoop  = modularScroll && childArray.length > 1;
  const cloneCount  = shouldLoop ? 3 : 1;

  const renderedChildren = useMemo(() => {
    if (!shouldLoop) return childArray;
    return [...childArray, ...childArray, ...childArray];
  }, [childArray, shouldLoop]);

  // ── Geometry helpers ────────────────────────────────────────────────────────

  const getLoopWidth = (): number => {
    const el = viewportEl.current;
    if (!el || !shouldLoop) return 0;
    return el.scrollWidth / cloneCount;
  };

  const getMaxScroll = (): number => {
    const el = viewportEl.current;
    if (!el) return 0;
    return Math.max(0, el.scrollWidth - el.clientWidth);
  };

  const wrapPosition = (x: number): number => {
    if (!shouldLoop) return x;
    const lw = getLoopWidth();
    if (lw <= 0) return x;
    let v = x;
    while (v < lw * 0.5) v += lw;
    while (v >= lw * 1.5) v -= lw;
    return v;
  };

  const commitScroll = (x: number) => {
    const el = viewportEl.current;
    if (!el) return;
    el.scrollLeft = shouldLoop
      ? wrapPosition(x)
      : Math.max(0, Math.min(getMaxScroll(), x));
  };

  // ── Scroll-state readout ────────────────────────────────────────────────────

  const readScrollState = () => {
    const el = viewportEl.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth > 2;
    setHasOverflow(overflow);
    if (!overflow) { setCanScrollLeft(false); setCanScrollRight(false); return; }
    if (shouldLoop) { setCanScrollLeft(true);  setCanScrollRight(true);  return; }
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  // ── RAF loop ─────────────────────────────────────────────────────────────────

  const startLoop = () => {
    if (rafRef.current !== null) return;
    lastTickRef.current = null;

    const tick = (now: number) => {
      const el = viewportEl.current;
      if (!el) { rafRef.current = null; return; }

      const dt = lastTickRef.current === null ? 16 : now - lastTickRef.current;
      lastTickRef.current = now;

      // During drag: keep spring synced to DOM (pointer handlers drive the DOM).
      if (isDragging.current) {
        spring.current.position = el.scrollLeft;
        spring.current.velocity = 0;
        spring.current.target   = el.scrollLeft;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Auto-scroll: nudge target each frame.
      if (autoScrollOn.current) {
        const dir   = autoScrollDirection === "rtl" ? 1 : -1;
        const nudge = (autoScrollSpeed * dt) / 1000 * dir;
        spring.current.target += nudge;
        spring.current.target  = shouldLoop
          ? wrapPosition(spring.current.target)
          : Math.max(0, Math.min(getMaxScroll(), spring.current.target));
      }

      // Integrate.
      const next = integrateSpring(spring.current, dt, stiffness, damping, mass);
      spring.current = next;
      commitScroll(next.position);

      // Rest check.
      const atRest =
        !autoScrollOn.current &&
        Math.abs(next.velocity) < REST_VELOCITY &&
        Math.abs(next.position - next.target) < REST_DELTA;

      if (atRest) {
        commitScroll(next.target);
        spring.current = { position: next.target, velocity: 0, target: next.target };
        readScrollState();
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  };

  // ── Seed on mount / content change ──────────────────────────────────────────

  useLayoutEffect(() => {
    const el = viewportEl.current;
    if (!el) return;
    if (shouldLoop) {
      const lw = getLoopWidth();
      if (lw > 0) {
        el.scrollLeft = lw;
        spring.current = { position: lw, velocity: 0, target: lw };
      }
    } else {
      spring.current = { position: el.scrollLeft, velocity: 0, target: el.scrollLeft };
    }
    readScrollState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderedChildren.length, shouldLoop]);

  // ── ResizeObserver ──────────────────────────────────────────────────────────

  useEffect(() => {
    const el = viewportEl.current;
    if (!el) return;
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (shouldLoop && el.scrollLeft === 0) {
          const lw = getLoopWidth();
          if (lw > 0) {
            el.scrollLeft = lw;
            spring.current.position = lw;
            spring.current.target   = lw;
          }
        }
        readScrollState();
      });
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    if (el.firstElementChild instanceof HTMLElement) ro.observe(el.firstElementChild);
    return () => { cancelAnimationFrame(frame); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLoop]);

  // ── Auto-scroll effect ───────────────────────────────────────────────────────

  useEffect(() => {
    const shouldRun = autoScroll && hasOverflow && !isHovered && !isDragging.current;
    autoScrollOn.current = shouldRun;
    if (shouldRun) {
      const el = viewportEl.current;
      if (el) {
        spring.current.position = el.scrollLeft;
        spring.current.target   = el.scrollLeft;
        spring.current.velocity = 0;
      }
      startLoop();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoScroll, hasOverflow, isHovered]);

  // ── Cleanup ─────────────────────────────────────────────────────────────────

  useEffect(() => () => stopLoop(), []);

  // ── Pointer handlers ─────────────────────────────────────────────────────────
  //
  // We deliberately do NOT use setPointerCapture. When pointer capture is active
  // the browser redirects all events — including the synthetic "click" — to the
  // capturing element (the viewport div). That means the click never hits the
  // card underneath, regardless of any suppression logic.
  //
  // Instead we attach pointermove / pointerup directly on window so we track the
  // pointer across the whole document without capture, then clean up on release.

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!allowDrag || !hasOverflow || e.button !== 0) return;
    const el = viewportEl.current;
    if (!el) return;

    autoScrollOn.current    = false;
    isDragging.current      = true;
    dragStartX.current      = e.clientX;
    dragStartScroll.current = el.scrollLeft;
    capturedPointer.current = e.pointerId;

    sampler.current.reset();
    sampler.current.record(el.scrollLeft);

    el.style.cursor = "grabbing";
    startLoop();

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== capturedPointer.current) return;
      const viewport = viewportEl.current;
      if (!viewport) return;

      const deltaX   = ev.clientX - dragStartX.current;
      let rawTarget  = dragStartScroll.current - deltaX;

      if (!shouldLoop && applyPhysics) {
        const max = getMaxScroll();
        if (rawTarget < 0)        rawTarget = rawTarget * RUBBER_BAND_FACTOR;
        else if (rawTarget > max) rawTarget = max + (rawTarget - max) * RUBBER_BAND_FACTOR;
      }

      const next = shouldLoop ? wrapPosition(rawTarget) : rawTarget;
      viewport.scrollLeft          = next;
      spring.current.position      = next;
      spring.current.target        = next;

      sampler.current.record(next);
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== capturedPointer.current) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
      window.removeEventListener("pointercancel", onUp);

      const viewport = viewportEl.current;
      isDragging.current      = false;
      capturedPointer.current = null;
      if (viewport) viewport.style.cursor = "";

      // Suppress the click that immediately follows pointerup only when the
      // user actually scrolled. The listener is on window (capture) so it
      // intercepts before React, and `once` removes it automatically.
      const scrollDelta = Math.abs(
        (viewport?.scrollLeft ?? spring.current.position) - dragStartScroll.current,
      );
      if (scrollDelta > DRAG_THRESHOLD_PX) {
        window.addEventListener(
          "click",
          (clickEv) => { clickEv.stopPropagation(); clickEv.preventDefault(); },
          { capture: true, once: true },
        );
      }

      if (!applyPhysics) {
        stopLoop();
        readScrollState();
        return;
      }

      const velocityPxPerSec = sampler.current.compute();
      const currentScroll    = viewport?.scrollLeft ?? spring.current.position;
      const decay            = damping / mass;
      const projected        = currentScroll + velocityPxPerSec / decay;
      const target           = shouldLoop
        ? wrapPosition(projected)
        : Math.max(0, Math.min(getMaxScroll(), projected));

      spring.current = { position: currentScroll, velocity: velocityPxPerSec, target };
      autoScrollOn.current = autoScroll && hasOverflow && !isHovered;
      startLoop();
    };

    window.addEventListener("pointermove",   onMove);
    window.addEventListener("pointerup",     onUp);
    window.addEventListener("pointercancel", onUp);
  };

  // ── Button scroll ────────────────────────────────────────────────────────────

  const scrollByAmount = (direction: "left" | "right") => {
    const el = viewportEl.current;
    if (!el || !hasOverflow) return;

    const step   = scrollStep ?? el.clientWidth * 0.82;
    const mult   = direction === "left" ? -1 : 1;
    const target = shouldLoop
      ? wrapPosition(el.scrollLeft + step * mult)
      : Math.max(0, Math.min(getMaxScroll(), el.scrollLeft + step * mult));

    if (!applyPhysics) {
      commitScroll(target);
      spring.current = { position: el.scrollLeft, velocity: 0, target: el.scrollLeft };
      readScrollState();
      return;
    }

    spring.current.position = el.scrollLeft;
    spring.current.velocity = 0;
    spring.current.target   = target;
    startLoop();
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const showPrev      = shouldLoop || canScrollLeft;
  const showNext      = shouldLoop || canScrollRight;
  const showAnyButton = hasOverflow && showButtons !== "never" && (showPrev || showNext);
  const trackStyle: CSSProperties | undefined = shouldLoop ? { width: "max-content" } : undefined;

  return (
    <div
      className={cn("group/rail relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showAnyButton && (
        <>
          <AnimatedUIButton
            type="button"
            variant="light"
            size="sm"
            icon="chevron-left"
            aria-label={previousButtonLabel}
            onClick={() => scrollByAmount("left")}
            className={cn(
              "absolute left-0 top-1/2 z-10 h-10 w-10 min-h-0 -translate-y-1/2 rounded-full",
              "border-slate-200 bg-white/95 px-0 py-0 shadow-sm transition-opacity duration-150",
              showButtons === "always" ? "opacity-100" : "opacity-0 group-hover/rail:opacity-100",
              !showPrev && "pointer-events-none !opacity-0",
              buttonClassName,
            )}
            textClassName="inline-flex items-center justify-center p-0"
          />
          <AnimatedUIButton
            type="button"
            variant="light"
            size="sm"
            icon="chevron-right"
            aria-label={nextButtonLabel}
            onClick={() => scrollByAmount("right")}
            className={cn(
              "absolute right-0 top-1/2 z-10 h-10 w-10 min-h-0 -translate-y-1/2 rounded-full",
              "border-slate-200 bg-white/95 px-0 py-0 shadow-sm transition-opacity duration-150",
              showButtons === "always" ? "opacity-100" : "opacity-0 group-hover/rail:opacity-100",
              !showNext && "pointer-events-none !opacity-0",
              buttonClassName,
            )}
            textClassName="inline-flex items-center justify-center p-0"
          />
        </>
      )}

      <div
        ref={(node) => {
          viewportEl.current = node;
          setRefValue(viewportRef, node);
        }}
        className={cn(
          "overflow-x-hidden overflow-y-hidden",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          allowDrag && hasOverflow && "cursor-grab select-none touch-pan-y",
          viewportClassName,
        )}
        onPointerDown={handlePointerDown}
      >
        <div className={cn("flex items-stretch gap-4", trackClassName)} style={trackStyle}>
          {renderedChildren.map((child, index) => {
            const key =
              isValidElement(child) && child.key != null
                ? `${String(child.key)}-${Math.floor(index / Math.max(1, childArray.length))}`
                : `rail-${index}`;
            return (
              <div key={key} className={cn("shrink-0", itemClassName)}>
                {child}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
