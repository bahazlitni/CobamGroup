"use client";

import { useEffect, useRef } from "react";
import { useNavbarVisibility } from "@/layout/navbar-visibility";

export interface AntigravityVideoProps {
  className?: string;
  src: string;
  width?: number;
  muted?: boolean;
  description: string;
}

export default function AntigravityVideo({
  src,
  description,
  muted = true,
}: AntigravityVideoProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const { hideNavbar, showNavbar } = useNavbarVisibility();

  useEffect(() => {
    const section = sectionRef.current;
    const outer = outerRef.current;
    const video = videoRef.current;
    const caption = captionRef.current;
    if (!section || !outer || !video) return;

    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const scrollY = window.scrollY;
        const winH = window.innerHeight;
        const rect = section.getBoundingClientRect();
        const secTop = scrollY + rect.top;
        const progress = clamp(
          (scrollY - secTop + winH) / (winH * 1.4),
          0,
          1
        );

        const scale = lerp(0.72, 1.0, easeOutCubic(progress));
        const translateY = lerp(40, 0, easeOutCubic(progress));
        const opacity = lerp(0, 1, easeOutCubic(Math.min(progress * 1.5, 1)));

        outer.style.transform = `scale(${scale}) translateY(${translateY}px)`;
        outer.style.opacity = String(opacity);

        const sp = clamp((progress - 0.3) / 0.7, 0, 1);
        outer.style.boxShadow = `0 ${lerp(0, 60, sp)}px ${lerp(0, 80, sp)}px ${lerp(0, -20, sp)}px rgba(0,0,0,${lerp(0, 0.7, sp)})`;

        if (caption) {
          caption.style.opacity = progress > 0.5 ? "1" : "0";
          caption.style.transform = `translateY(${progress > 0.5 ? 0 : 12}px)`;
        }

        const parallaxY = -(progress - 0.5) * 30;
        video.style.transform = `scale(1.08) translateY(${parallaxY}px)`;
      });
    };

    const hideSourceId = `antigravity-video:${src}`;

    const handlePlay = () => {
      hideNavbar(hideSourceId);
    };

    const handlePause = () => {
      showNavbar(hideSourceId);
    };

    // Play/pause based on 50% visibility of the video element.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          void video.play().catch(() => {
            showNavbar(hideSourceId);
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handlePause);
    observer.observe(video);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      showNavbar(hideSourceId);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handlePause);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [hideNavbar, showNavbar, src]);

  return (
    <div
      ref={sectionRef}
      className="relative px-4 py-8"
    >
        <div
          ref={outerRef}
          className="w-full rounded-4xl overflow-hidden opacity-0"
          style={{ transformOrigin: "center top", willChange: "transform" }}
        >
          <div className="relative w-full aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover block"
              style={{ willChange: "transform" }}
              loop
              controls={false}
              muted={muted}
              src={src}
              autoPlay={false}
              aria-label={description}
              playsInline
            />
          </div>
        </div>
    </div>
  );
}
