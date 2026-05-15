"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type HeroSlide = {
  src: string;
  alt: string;
  label: string;
};

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroMotionShell({
  children,
  slides,
}: {
  children: ReactNode;
  slides: HeroSlide[];
}) {
  const heroRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const safeSlides = useMemo(() => slides.filter((slide) => slide.src), [slides]);

  useEffect(() => {
    if (safeSlides.length < 2 || prefersReducedMotion()) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeSlides.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [safeSlides.length]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || prefersReducedMotion()) return;

    let isVisible = true;
    let frame = 0;

    const syncScroll = () => {
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
      hero.style.setProperty("--hero-scroll-shift", `${progress * -34}px`);
      hero.style.setProperty("--hero-bg-scroll-shift", `${progress * 24}px`);
      hero.style.setProperty("--hero-copy-shift", `${progress * -18}px`);
      hero.style.setProperty("--hero-visual-shift", `${progress * 24}px`);
    };

    const onScroll = () => {
      if (!isVisible) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncScroll);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
        if (isVisible) syncScroll();
      },
      { threshold: [0, 0.25, 0.75] },
    );

    observer.observe(hero);
    syncScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion() || event.pointerType === "touch") return;

    const hero = heroRef.current;
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    hero.style.setProperty("--hero-shift-x", `${x * -18}px`);
    hero.style.setProperty("--hero-shift-y", `${y * -14}px`);
    hero.style.setProperty("--hero-bg-shift-x", `${x * 18}px`);
    hero.style.setProperty("--hero-bg-shift-y", `${y * 12}px`);
  };

  const handlePointerLeave = () => {
    const hero = heroRef.current;
    if (!hero) return;

    hero.style.setProperty("--hero-shift-x", "0px");
    hero.style.setProperty("--hero-shift-y", "0px");
    hero.style.setProperty("--hero-bg-shift-x", "0px");
    hero.style.setProperty("--hero-bg-shift-y", "0px");
  };

  return (
    <section
      ref={heroRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="cobam-catalog-hero cobam-catalog-hero-live relative overflow-hidden bg-[#14202e] text-white"
    >
      <div className="absolute inset-0" aria-hidden="true">
        {safeSlides.map((slide, index) => (
          <Image
            key={`${slide.src}-${index}`}
            src={slide.src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={cn("cobam-hero-bg-slide object-cover", index === activeIndex ? "is-active" : "")}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,29,0.94),rgba(7,17,29,0.72)_44%,rgba(7,17,29,0.46))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_22%,rgba(10,141,193,0.26),transparent_34%)]" />
      </div>

      <div className="absolute inset-0 cobam-static-grid opacity-35" aria-hidden="true" />

      {safeSlides.length > 1 ? (
        <div className="cobam-hero-slide-controls" aria-label="Images du hero">
          {safeSlides.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              aria-label={`Afficher ${slide.label}`}
              className={cn(index === activeIndex ? "is-active" : "")}
              onClick={() => setActiveIndex(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      ) : null}

      {children}
    </section>
  );
}
