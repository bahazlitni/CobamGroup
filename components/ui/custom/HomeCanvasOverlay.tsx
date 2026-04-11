"use client";

import { useEffect, useRef } from "react";

type SectionBounds = {
  id: string;
  top: number;
  bottom: number;
  height: number;
};

export default function HomeCanvasOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = 1;
    
    // Smooth engine state
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    let scrollY = 0;
    
    // Bounds map
    let sections: Record<string, SectionBounds> = {};
    let pageHeight = 0;
    let windowWidth = 0;
    let windowHeight = 0;

    // Performance flags
    let isReducedMotion = false;
    let isMobile = false;

    const GRID_STEP = 64; 
    let marginX = 32; // Significantly reduced margin

    const updateMeasurements = () => {
      dpr = window.devicePixelRatio || 1;
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
      
      isMobile = windowWidth < 768;
      isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      marginX = isMobile ? 16 : 32;

      canvas.width = windowWidth * dpr;
      canvas.height = windowHeight * dpr;
      canvas.style.width = `${windowWidth}px`;
      canvas.style.height = `${windowHeight}px`;
      
      scrollY = window.scrollY;
      pageHeight = document.documentElement.scrollHeight;

      const ids = [
        "section-hero",
        "section-manifesto",
        "section-universes",
        "section-about",
        "section-nos-collections",
        "section-actualites",
        "section-suivez-nous",
        "section-partners",
      ];
      
      const newSections: Record<string, SectionBounds> = {};
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          newSections[id] = {
            id,
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            height: rect.height,
          };
        }
      });
      sections = newSections;
    };

    updateMeasurements();
    window.addEventListener("resize", updateMeasurements, { passive: true });
    
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Render loop
    const render = () => {
      if (!isMobile) {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isMobile && isReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Disable background radial halo, we will illuminate the lines themselves natively
      // --- Enable World Space Translation ---
      ctx.translate(0, -scrollY);

      // --- 1. Draw Segmented Tracking Highway ---
      const rightMargin = windowWidth - marginX;
      
      const drawSegment = (x: number, startY: number, endY: number) => {
        // Draw the faint background track vertically
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.strokeStyle = "rgba(10, 141, 193, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Calculate visual progress dot position
        // Center the physical read-zone roughly 60% down the screen
        const readerLineY = scrollY + (windowHeight * 0.6);
        let progressY = readerLineY;
        
        // Clamp the dot specifically within this section's track
        if (progressY < startY) progressY = startY;
        if (progressY > endY) progressY = endY;

        // Draw active highlighted path up to the progress dot
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, progressY);
        ctx.strokeStyle = "rgba(10, 141, 193, 0.6)"; 
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw the elegant scrolling indicator dot
        ctx.beginPath();
        ctx.arc(x, progressY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(10, 141, 193, 0.8)";
        ctx.fill();
        ctx.strokeStyle = "rgba(10, 141, 193, 0.3)";
        ctx.lineWidth = 4; // Add a halo
        ctx.stroke();

        // Draw structural origin/end notches
        ctx.beginPath();
        ctx.moveTo(x - 4, startY); ctx.lineTo(x + 4, startY);
        ctx.moveTo(x - 4, endY); ctx.lineTo(x + 4, endY);
        ctx.strokeStyle = "rgba(10, 141, 193, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      };

      if (sections["section-hero"]) {
        drawSegment(marginX, sections["section-hero"].top + windowHeight * 0.5, sections["section-hero"].bottom);
      }
      if (sections["section-manifesto"]) {
        drawSegment(marginX, sections["section-manifesto"].top, sections["section-manifesto"].bottom);
      }
      if (sections["section-universes"]) {
        drawSegment(rightMargin, sections["section-universes"].top, sections["section-universes"].bottom);
      }
      if (sections["section-featured"]) {
        drawSegment(marginX, sections["section-featured"].top, sections["section-featured"].bottom);
      }
      if (sections["section-about"]) {
        drawSegment(rightMargin, sections["section-about"].top, sections["section-about"].bottom);
      }
      if (sections["section-nos-collections"]) {
        drawSegment(marginX, sections["section-nos-collections"].top, sections["section-nos-collections"].bottom);
      }
      if (sections["section-actualites"]) {
        drawSegment(rightMargin, sections["section-actualites"].top, sections["section-actualites"].bottom);
      }
      if (sections["section-suivez-nous"]) {
        drawSegment(marginX, sections["section-suivez-nous"].top, sections["section-suivez-nous"].bottom);
      }
      if (sections["section-partners"]) {
        drawSegment(rightMargin, sections["section-partners"].top, sections["section-partners"].bottom);
      }

      ctx.restore(); 
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", updateMeasurements);
      window.addEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-30 h-screen w-screen"
      aria-hidden="true"
    />
  );
}
