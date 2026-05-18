"use client";

import { useEffect } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LandingEffects() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      document.querySelectorAll<HTMLElement>("[data-landing-reveal]").forEach((element) => {
        element.dataset.visible = "true";
      });
      return;
    }

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-landing-reveal]"));
    const parallaxItems = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax-speed]"));
    const magneticItems = Array.from(document.querySelectorAll<HTMLElement>(".cobam-premium-button, [data-magnetic]"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -14% 0px", threshold: 0.12 },
    );

    revealItems.forEach((element) => observer.observe(element));

    let frame = 0;
    const syncParallax = () => {
      frame = 0;
      const viewportCenter = window.innerHeight / 2;

      for (const element of parallaxItems) {
        const speed = Number(element.dataset.parallaxSpeed ?? "0");
        const rect = element.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const shift = (viewportCenter - elementCenter) * speed;
        element.style.setProperty("--parallax-y", `${Math.max(-70, Math.min(70, shift))}px`);
      }
    };

    const requestParallax = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(syncParallax);
    };

    const cleanups = magneticItems.map((element) => {
      const handleMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        const rect = element.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
        element.style.setProperty("--magnet-x", `${x}px`);
        element.style.setProperty("--magnet-y", `${y}px`);
      };

      const handleLeave = () => {
        element.style.setProperty("--magnet-x", "0px");
        element.style.setProperty("--magnet-y", "0px");
      };

      element.addEventListener("pointermove", handleMove);
      element.addEventListener("pointerleave", handleLeave);

      return () => {
        element.removeEventListener("pointermove", handleMove);
        element.removeEventListener("pointerleave", handleLeave);
      };
    });

    syncParallax();
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestParallax);
      window.removeEventListener("resize", requestParallax);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
