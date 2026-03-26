"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicBrand } from "@/features/brands/public";

interface BrandSliderProps {
  brands: PublicBrand[];
  href: string;
}

export default function BrandSlider({ href, brands }: BrandSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Triple the content for truly seamless infinite scroll
  const tripleContent = [...brands, ...brands, ...brands];

  // Auto-scroll animation loop
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    const animate = () => {
      if (!isPaused && !isDragging) {
        scroll.scrollLeft += 0.5;

        // Reset to middle third when reaching end of second third
        const maxScroll = scroll.scrollWidth / 3;
        if (scroll.scrollLeft >= maxScroll * 2) {
          scroll.scrollLeft = maxScroll;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, isDragging]);

  // Initialize scroll position to middle third
  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) {
      scroll.scrollLeft = scroll.scrollWidth / 3;
    }
  }, []);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollStart(scrollRef.current?.scrollLeft || 0);
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = "auto";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5; // Drag velocity multiplier
    scrollRef.current.scrollLeft = scrollStart - walk;

    // Loop boundaries during drag
    const maxScroll = scrollRef.current.scrollWidth / 3;
    if (scrollRef.current.scrollLeft >= maxScroll * 2) {
      scrollRef.current.scrollLeft = maxScroll;
      setScrollStart(maxScroll);
    } else if (scrollRef.current.scrollLeft <= 0) {
      scrollRef.current.scrollLeft = maxScroll;
      setScrollStart(maxScroll);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = "smooth";
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollRef.current) {
        scrollRef.current.style.scrollBehavior = "smooth";
      }
    }
  };

  if (brands.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cobam-quill-grey/60 bg-white px-6 py-10 text-center text-sm text-cobam-carbon-grey">
        Aucune marque n&apos;est disponible pour le moment.
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        handleMouseLeave();
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`flex gap-6 overflow-x-scroll scrollbar-hide ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        scrollBehavior: "smooth",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {tripleContent.map((brand, i) => (
        <Link
          href={`${href}#${brand.slug}`}
          draggable={false}
          className="overflow-hidden flex-shrink-0 w-32 h-24 flex items-center justify-center bg-white border border-gray-100 rounded-xl hover:border-cobam-water-blue transition-all duration-300"
          key={`${brand.name}-${i}`}
        >
          {brand.imageUrl ? (
            <Image
              src={brand.imageUrl}
              alt={brand.name}
              width={480}
              height={240}
              className="object-contain h-full w-auto pointer-events-none"
              draggable={false}
            />
          ) : (
            <span className="px-4 text-center text-sm font-semibold text-cobam-dark-blue">
              {brand.name}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
