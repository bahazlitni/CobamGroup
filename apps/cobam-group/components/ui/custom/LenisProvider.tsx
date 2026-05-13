"use client";

import Lenis from "lenis";
import { useEffect } from "react";

function isScrollableOverflow(value: string) {
  return value === "auto" || value === "scroll" || value === "overlay";
}

function shouldUseNativeNestedScroll(node: HTMLElement | null) {
  let current: HTMLElement | null = node;

  while (current && current !== document.body && current !== document.documentElement) {
    if (
      current.hasAttribute("data-lenis-prevent") ||
      current.hasAttribute("data-lenis-prevent-wheel") ||
      current.hasAttribute("data-lenis-prevent-vertical")
    ) {
      return true;
    }

    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY.toLowerCase();

    if (
      isScrollableOverflow(overflowY) &&
      current.scrollHeight > current.clientHeight + 1
    ) {
      return true;
    }

    current = current.parentElement;
  }

  return false;
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      allowNestedScroll: true,
      prevent: (node) => shouldUseNativeNestedScroll(node),
    });

    let rafId = 0;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
