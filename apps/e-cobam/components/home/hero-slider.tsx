"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, animate, type PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SlideData {
  brand: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  primaryCta: string;
  secondaryCta: string;
}

const slides: SlideData[] = [
  {
    brand: "DEUTSCH COLOR",
    title: "L'art de la couleur et des finitions.",
    subtitle: "Peintures et enduits décoratifs haut de gamme formulés pour la haute architecture et le design contemporain.",
    image: "/images/hero-banners/deutsch-color-banner.png",
    href: "/catalogue?marque=deutsch-color",
    primaryCta: "Collection Deutsch Color",
    secondaryCta: "Voir le catalogue",
  },
  {
    brand: "GROHE",
    title: "La pureté de l'eau, réinventée.",
    subtitle: "Robinetterie et systèmes sanitaires d'exception alliant excellence technologique allemande et design d'avant-garde.",
    image: "/images/hero-banners/grohe-banner.png",
    href: "/catalogue?marque=grohe",
    primaryCta: "Gamme Grohe",
    secondaryCta: "Voir le catalogue",
  },
  {
    brand: "JAQUAR",
    title: "L'expérience du bien-être absolu.",
    subtitle: "Sanctuaires de salle de bain d'élite et solutions de bien-être haut de gamme conçues pour le confort moderne.",
    image: "/images/hero-banners/jaquar-banner.png",
    href: "/catalogue?marque=jaquar",
    primaryCta: "Gamme Jaquar",
    secondaryCta: "Voir le catalogue",
  },
  {
    brand: "SIKA",
    title: "L'excellence technique invisible.",
    subtitle: "Systèmes d'étanchéité, de collage et de protection structurelle de pointe pour la pérennité de vos ouvrages.",
    image: "/images/hero-banners/sika-banner.png",
    href: "/catalogue?marque=sika",
    primaryCta: "Collection Sika",
    secondaryCta: "Voir le catalogue",
  },
  {
    brand: "SOPAL",
    title: "La haute facture du design tunisien.",
    subtitle: "Rigueur industrielle et esthétique intemporelle : robinetterie d'excellence conçue avec le savoir-faire leader national.",
    image: "/images/hero-banners/sopal-banner.png",
    href: "/catalogue?marque=sopal",
    primaryCta: "Gamme SOPAL",
    secondaryCta: "Voir le catalogue",
  },
  {
    brand: "ALAPLANA CERAMICA",
    title: "Céramiques d'exception pour des espaces uniques",
    subtitle: "Céramiques d'exception alliant savoir-faire artisanal tunisien et design contemporain pour des espaces uniques.",
    image: "/images/hero-banners/alaplana-ceramica-banner.png",
    href: "/catalogue?marque=alaplana%20ceramica",
    primaryCta: "Gamme ALAPLANA CERAMICA",
    secondaryCta: "Voir le catalogue",
  },
];

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1920);

  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidthRef = useRef(0);
  const slideStartTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const x = useMotionValue(0);

  // Sync width on resize
  useEffect(() => {
    if (containerRef.current) {
      containerWidthRef.current = containerRef.current.offsetWidth;
      setContainerWidth(containerRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        containerWidthRef.current = containerRef.current.offsetWidth;
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update position on index change
  useEffect(() => {
    const width = containerWidthRef.current || (typeof window !== "undefined" ? window.innerWidth : 1920);
    const targetX = -currentIndex * width;

    animate(x, targetX, {
      type: "spring",
      stiffness: 240,
      damping: 28,
      mass: 1,
    });
  }, [currentIndex, x]);

  // Autoplay Logic
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
    elapsedRef.current = 0;
    slideStartTimeRef.current = Date.now();
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
    elapsedRef.current = 0;
    slideStartTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (paused) return;

    slideStartTimeRef.current = Date.now() - elapsedRef.current;

    const interval = setInterval(() => {
      const elapsed = Date.now() - slideStartTimeRef.current;
      const currentProgress = Math.min((elapsed / 6000) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        handleNext();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [paused, handleNext]);

  const handleHoverStart = () => {
    setPaused(true);
    const elapsed = Date.now() - slideStartTimeRef.current;
    elapsedRef.current = elapsed;
    setProgress(Math.min((elapsed / 6000) * 100, 100));
  };

  const handleHoverEnd = () => {
    setPaused(false);
    slideStartTimeRef.current = Date.now() - elapsedRef.current;
  };

  const onDragStart = () => {
    setIsDragging(true);
    setPaused(true);
    const elapsed = Date.now() - slideStartTimeRef.current;
    elapsedRef.current = elapsed;
    setProgress(Math.min((elapsed / 6000) * 100, 100));
  };

  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragOffset = info.offset.x;
    const dragVelocity = info.velocity.x;
    const width = containerWidthRef.current || window.innerWidth;

    let nextIndex = currentIndex;
    const threshold = 120;
    const velocityThreshold = 400;

    if (dragOffset < -threshold || dragVelocity < -velocityThreshold) {
      nextIndex = Math.min(currentIndex + 1, slides.length - 1);
    } else if (dragOffset > threshold || dragVelocity > velocityThreshold) {
      nextIndex = Math.max(currentIndex - 1, 0);
    }

    setCurrentIndex(nextIndex);
    setProgress(0);
    elapsedRef.current = 0;
    slideStartTimeRef.current = Date.now();
    setPaused(false);

    animate(x, -nextIndex * width, {
      type: "spring",
      stiffness: 240,
      damping: 28,
      mass: 1,
      velocity: info.velocity.x,
    });

    setTimeout(() => setIsDragging(false), 50);
  };

  return (
    <section
      className="relative w-full h-[620px] md:h-[720px] lg:h-[800px] overflow-hidden bg-ec-paper border-b border-ec-line"
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      {/* Slider Track */}
      <motion.div
        ref={containerRef}
        className="flex h-full w-full touch-pan-y cursor-grab active:cursor-grabbing"
        drag="x"
        dragElastic={0.15}
        dragConstraints={{
          left: -((slides.length - 1) * containerWidth),
          right: 0,
        }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        style={{ x }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative w-full h-full shrink-0 overflow-hidden"
            style={{ width: "100%" }}
          >
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 select-none pointer-events-none">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-[80%_center] md:object-right-center select-none"
                sizes="100vw"
                unoptimized
              />
              {/* Subtle visual gradient that masks left side for contrast but fades to transparent */}
              <div className="absolute inset-y-0 left-0 w-full md:w-[65%] bg-gradient-to-r from-ec-paper/98 via-ec-paper/90 to-ec-paper/0 pointer-events-none" />
              {/* Extra shading for extreme readibility on small mobiles */}
              <div className="absolute inset-0 bg-ec-paper/35 md:hidden pointer-events-none" />
            </div>

            {/* Content Align Left */}
            <div className="commerce-container relative h-full flex items-center z-10">
              <div className="max-w-2xl text-left px-4 md:px-0">
                <AnimatePresence mode="wait">
                  {index === currentIndex && (
                    <motion.div
                      key={currentIndex}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.08 } },
                        exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
                      }}
                      className="flex flex-col gap-4 md:gap-5"
                    >
                      {/* Eyebrow */}
                      <div className="overflow-hidden">
                        <motion.span
                          variants={{
                            hidden: { y: "100%" },
                            visible: { y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
                          }}
                          className="inline-block text-ec-brass font-sans text-[0.7rem] sm:text-xs font-black tracking-[0.25em]"
                        >
                          {slide.brand}
                        </motion.span>
                      </div>

                      {/* Headline (vertical translate + blur reveal) */}
                      <div className="overflow-hidden py-1">
                        <motion.h1
                          variants={{
                            hidden: { y: "115%", filter: "blur(5px)" },
                            visible: { y: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
                          }}
                          className="text-ec-ink font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.06] font-semibold tracking-tight"
                        >
                          {slide.title}
                        </motion.h1>
                      </div>

                      {/* Subtitle */}
                      <div className="overflow-hidden">
                        <motion.p
                          variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
                          }}
                          className="text-ec-muted text-sm sm:text-base md:text-[1.08rem] leading-relaxed max-w-xl font-medium"
                        >
                          {slide.subtitle}
                        </motion.p>
                      </div>

                      {/* CTAs */}
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
                        }}
                        className="mt-3 flex flex-wrap gap-3 sm:gap-4"
                      >
                        <Link
                          href={slide.href}
                          onClick={(e) => isDragging && e.preventDefault()}
                          className="inline-flex h-12 sm:h-13 items-center justify-center bg-ec-ink hover:bg-ec-blue border border-transparent px-5 sm:px-6 font-sans text-xs font-bold tracking-[0.1em] uppercase text-white transition-all duration-300"
                        >
                          {slide.primaryCta}
                        </Link>
                        <Link
                          href="/catalogue"
                          onClick={(e) => isDragging && e.preventDefault()}
                          className="inline-flex h-12 sm:h-13 items-center justify-center border border-ec-border bg-white/70 backdrop-blur-sm hover:border-ec-ink hover:bg-ec-ink hover:text-white px-5 sm:px-6 font-sans text-xs font-bold tracking-[0.1em] uppercase text-ec-ink transition-all duration-300"
                        >
                          {slide.secondaryCta}
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Pagination Timeline and Navigation Controls */}
      <div className="absolute bottom-8 inset-x-0 z-20 pointer-events-none">
        <div className="commerce-container flex items-center justify-between pointer-events-auto px-4 md:px-0">
          <div className="flex items-center gap-6 md:gap-8">
            {/* Timeline Progress */}
            <div className="font-sans text-[0.7rem] font-black tracking-[0.15em] text-ec-primary flex items-center gap-3">
              <span>0{currentIndex + 1}</span>
              <span className="w-16 h-[1.5px] bg-ec-border relative overflow-hidden inline-block">
                <motion.span
                  key={currentIndex + (paused ? "-paused" : "-active")}
                  initial={{ scaleX: paused ? progress / 100 : 0 }}
                  animate={paused ? {} : { scaleX: 1 }}
                  transition={{
                    duration: paused ? 0 : 6 * (1 - progress / 100),
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-ec-primary origin-left"
                />
              </span>
              <span className="text-ec-muted">0{slides.length}</span>
            </div>

            {/* Bullets (Tablet/Desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setProgress(0);
                    elapsedRef.current = 0;
                    slideStartTimeRef.current = Date.now();
                  }}
                  className={`h-[2px] transition-all duration-300 ${
                    idx === currentIndex ? "w-6 bg-ec-primary" : "w-2 bg-ec-border hover:bg-ec-muted"
                  }`}
                  aria-label={`Aller au slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Minimal Luxury Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-10 h-10 border border-ec-border bg-white/70 backdrop-blur-sm flex items-center justify-center hover:border-ec-primary hover:bg-ec-ink hover:text-white transition-all duration-300"
              aria-label="Slide précédent"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 border border-ec-border bg-white/70 backdrop-blur-sm flex items-center justify-center hover:border-ec-primary hover:bg-ec-ink hover:text-white transition-all duration-300"
              aria-label="Slide suivant"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
