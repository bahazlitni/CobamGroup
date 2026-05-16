"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { JourneyCategory } from "@/components/public/home/catalog-journey";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CategoryJourneyParallax({ categories }: { categories: JourneyCategory[] }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || categories.length <= 1) return;

    let frame = 0;
    const sync = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      const nextProgress = clamp(-rect.top / scrollable, 0, 1);
      const nextIndex = clamp(Math.round(nextProgress * (categories.length - 1)), 0, categories.length - 1);

      setProgress(nextProgress);
      setActiveIndex(nextIndex);
    };

    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [categories.length]);

  const active = categories[activeIndex] ?? categories[0];
  const imageShift = (progress * (categories.length - 1) - activeIndex) * 32;

  return (
    <section
      ref={sectionRef}
      id="parcours"
      className="relative bg-[#14202e] text-white"
      style={{ minHeight: `${Math.max(categories.length * 82, 360)}vh` }}
    >
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          {categories.map((category, index) => (
            <Image
              key={category.id}
              src={category.image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover transition duration-700 ease-out"
              style={{
                opacity: index === activeIndex ? 0.42 : 0,
                transform: `scale(${index === activeIndex ? 1.04 : 1.1}) translate3d(0, ${index === activeIndex ? imageShift : 0}px, 0)`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,29,0.96),rgba(7,17,29,0.76)_44%,rgba(7,17,29,0.46)),radial-gradient(circle_at_80%_20%,rgba(10,141,193,0.24),transparent_36%)]" />
          <div className="cobam-static-grid absolute inset-0 opacity-25" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-[1500px] gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[0.42fr_0.58fr] lg:px-12">
          <div className="hidden lg:block">
            <p className="cobam-section-kicker text-[#8fdcff]">Parcours catalogue</p>
            <div className="mt-10 space-y-2">
              {categories.map((category, index) => {
                const isActive = index === activeIndex;

                return (
                  <Link
                    key={category.id}
                    href={category.href}
                    className={`group grid grid-cols-[3.5rem_1fr] items-center gap-4 border-b border-white/10 py-4 transition ${
                      isActive ? "text-white" : "text-white/42 hover:text-white/72"
                    }`}
                  >
                    <span className="text-xs font-black tracking-[0.22em] text-[#8fdcff]">
                      {category.number}
                    </span>
                    <span className="text-2xl font-semibold leading-none">{category.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <article className="max-w-4xl">
            <p className="cobam-section-kicker text-[#8fdcff]">
              {active.number} / Catégorie
            </p>
            <h2
              className="mt-5 max-w-4xl text-balance text-6xl font-normal leading-[0.88] md:text-8xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {active.name}
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72 md:text-xl">
              {active.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {active.subcategories.slice(0, 8).map((subcategory, index) => (
                <Link
                  key={`${active.id}-${subcategory.label}`}
                  href={subcategory.href}
                  className="rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/72 transition hover:border-[#8fdcff]/60 hover:text-white"
                >
                  {String(index + 1).padStart(2, "0")} {subcategory.label}
                </Link>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href={active.href} className="cobam-premium-button cobam-premium-button-light">
                Découvrir la catégorie
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/produits" className="cobam-premium-button cobam-premium-button-ghost">
                Voir tout le catalogue
              </Link>
            </div>
          </article>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="mx-auto grid max-w-[1500px] gap-4 px-5 pb-14 sm:px-8">
          {categories.map((category) => (
            <Link key={category.id} href={category.href} className="rounded-2xl border border-white/12 bg-white/[0.06] p-5">
              <span className="text-xs font-black tracking-[0.22em] text-[#8fdcff]">{category.number}</span>
              <h3 className="mt-3 text-2xl font-semibold">{category.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/62">{category.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
