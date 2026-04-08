"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { AnimatedUIButton } from "../components/ui/custom/Buttons";

const slides = [
  {
    id: 1,
    preTitle: "Depuis 1994",
    title: "Votre partenaire de confiance en Tunisie",
    subtitle:
      "Plus de 30 ans d'expertise au service de vos projets de construction et de rénovation à travers toute la Tunisie.",
    cta: "Notre histoire",
    ctaHref: "#societe",
    image: "/images/hero-section/1.jpg",
  },

  {
    id: 2,
    preTitle: "Sanitaire & Bain",
    title: "L'élégance au service de votre salle de bain",
    subtitle:
      "Meubles, vasques, douches et baignoires haut de gamme pour créer votre espace bien-être idéal.",
    cta: "Découvrir",
    ctaHref: "#sanitaires",
    image: "/images/hero-section/2.jpg",
  },
  {
    id: 3,
    preTitle: "Carrelage & Revêtements",
    title: "Créez des espaces uniques",
    subtitle:
      "Découvrez notre collection exclusive de carrelage, faïence et revêtements muraux pour sublimer vos intérieurs.",
    cta: "Voir les produits",
    ctaHref: "#produits",
    image: "/images/hero-section/1.jpg",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent((index + slides.length) % slides.length);
        setAnimating(false);
      }, 300);
    },
    [animating]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 10000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative w-full h-[85vh] min-h-[560px] overflow-hidden bg-cobam-dark-blue">

      {/* Background image */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          animating ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          className="object-cover object-center z-0"
          priority
          quality={100}
        />
        
      </div>


      {/* Content */}
      <div className="relative z-10 h-full">
        <div className="rounded-4xl absolute left-1/2 rounded-t-full w-164 h-164 p-20 bg-cobam-dark-blue grid place-items-center -translate-x-1/2 bottom-0">
          <div
            className={`text-center flex flex-col items-center justify-center max-w-2xl transition-all duration-500 ${
              animating
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            <span className="inline-block text-cobam-water-blue text-sm font-bold tracking-[0.3em] uppercase mb-4">
              {slide.preTitle}
            </span>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {slide.title}
            </h1>
            <p className="text-cobam-quill-grey text-lg leading-relaxed mb-8 max-w-xl">
              {slide.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-fit">
              <AnimatedUIButton
                size="lg"
                variant="primary"
                href={slide.ctaHref}
                icon="arrow-right"
              >
                {slide.cta}
              </AnimatedUIButton>
              <AnimatedUIButton
                size="lg"
                variant="secondary"
                href="/contact"

              >
                Nous Contacter
              </AnimatedUIButton>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 bottom-1/8 -translate-y-1/2 z-20 bg-white/10 hover:bg-cobam-water-blue text-white rounded-full p-3 transition-all backdrop-blur-sm"
        aria-label="Précédent"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 bottom-1/8 -translate-y-1/2 z-20 bg-white/10 hover:bg-cobam-water-blue text-white rounded-full p-3 transition-all backdrop-blur-sm"
        aria-label="Suivant"
      >
        <ChevronRight size={20} />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-8 h-2 bg-cobam-water-blue"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="right-1/12 translate-x-1/2 bottom-12 absolute z-20 text-white text-sm tracking-widest">
        0{current + 1} / 0{slides.length}
      </div>
    </section>
  );
}
