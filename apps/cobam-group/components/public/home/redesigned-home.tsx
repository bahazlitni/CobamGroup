"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Compass,
  MapPin,
  Phone,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { COBAM_SOCIAL_LINKS } from "@/data/contact-details";
import { cn } from "@/lib/utils";
import type { PublicArticleSummary } from "@/features/articles/public";
import type { BrandLogo, JourneyCategory, ShowroomLocation } from "./catalog-journey";

interface RedesignedHomeProps {
  categories: JourneyCategory[];
  brands: BrandLogo[];
  articles: PublicArticleSummary[];
  showrooms: ShowroomLocation[];
}

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  href: string;
};

const fallbackCategories: JourneyCategory[] = [
  {
    id: "surfaces",
    number: "01",
    name: "Revêtements de sols et murs",
    subtitle: "Grands formats, textures, faïences et surfaces techniques.",
    href: "/produits",
    image: "/images/collections/faedo-marbre-blanc-353x353.jpg",
    imageAlt: "Surface minérale claire",
    subcategories: [
      { label: "Carrelage intérieur", href: "/produits" },
      { label: "Grandes dalles", href: "/produits" },
      { label: "Mosaïque", href: "/produits" },
    ],
  },
  {
    id: "eau",
    number: "02",
    name: "Salle de bain et cuisine",
    subtitle: "Robinetterie, vasques, douches et équipements d'eau.",
    href: "/produits",
    image: "/images/collections/mitigeur-cascade-353x353.jpg",
    imageAlt: "Robinetterie premium",
    subcategories: [
      { label: "Robinetterie", href: "/produits" },
      { label: "Vasques", href: "/produits" },
      { label: "Espace douche", href: "/produits" },
    ],
  },
  {
    id: "exterieur",
    number: "03",
    name: "Piscine et extérieur",
    subtitle: "Mosaïques, pierres et finitions pour espaces extérieurs.",
    href: "/produits",
    image: "/images/collections/carrelage-piscine-353x353.jpg",
    imageAlt: "Carrelage piscine",
    subcategories: [
      { label: "Piscine", href: "/produits" },
      { label: "Margelles", href: "/produits" },
      { label: "Pierres", href: "/produits" },
    ],
  },
];

const companyRecognition = [
  {
    value: "30+",
    label: "années d'expertise",
  },
  {
    value: "5,000+",
    label: "références produits",
  },
  {
    value: "4",
    label: "showrooms en Tunisie",
  },
  {
    value: "1994",
    label: "année de création",
  },
];

function revealDelay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Tunis",
  }).format(new Date(value));
}

function SignalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;

    const particles = Array.from({ length: 78 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      phase: index * 0.33,
      size: 0.8 + Math.random() * 1.9,
      alpha: 0.18 + Math.random() * 0.5,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(20, 32, 46, 0.96)");
      gradient.addColorStop(0.46, "rgba(10, 141, 193, 0.92)");
      gradient.addColorStop(1, "rgba(20, 32, 46, 0.96)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      for (let line = 0; line < 7; line += 1) {
        context.beginPath();
        for (let x = -40; x <= width + 40; x += 18) {
          const progress = x / Math.max(width, 1);
          const drift = reducedMotion ? 0 : time * 0.00022;
          const y =
            height * (0.2 + line * 0.1) +
            Math.sin(progress * 8 + line + drift * (2 + line)) * (16 + line * 4);

          if (x === -40) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.strokeStyle = `rgba(10, 141, 193, ${0.05 + line * 0.012})`;
        context.lineWidth = 1;
        context.stroke();
      }

      for (const particle of particles) {
        const drift = reducedMotion ? 0 : time * 0.00007;
        const x = ((particle.x + drift) % 1) * width;
        const wave = Math.sin(time * 0.001 + particle.phase) * 24;
        const y = particle.y * height + wave;
        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(250, 250, 249, ${particle.alpha})`;
        context.fill();
      }

      if (!reducedMotion) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw(0);
    window.addEventListener("resize", resize);

    if (!reducedMotion) {
      frame = window.requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

function MetricDial() {
  return (
    <div className="relative mx-auto grid size-64 place-items-center sm:size-80" aria-hidden="true">
      <div className="absolute inset-8 rounded-full border border-[#fafaf9]/12" />
      {Array.from({ length: 36 }, (_, index) => (
        <span
          key={index}
          className={cn(
            "absolute left-1/2 top-1/2 size-1 rounded-full bg-[#fafaf9]",
            index % 6 === 0 ? "opacity-95" : "opacity-35",
            index % 9 === 0 ? "bg-[#0a8dc1]" : "",
          )}
          style={{
            transform: `rotate(${index * 10}deg) translateY(-8rem)`,
            transformOrigin: "0 0",
          }}
        />
      ))}
      <div className="absolute left-1/2 top-4 h-28 w-px -translate-x-1/2 bg-[#fafaf9]/24 sm:h-36" />
      <div className="relative text-center">
        <p className="text-7xl font-semibold text-[#fafaf9] sm:text-8xl">30</p>
        <p className="mt-2 text-sm text-[#fafaf9]/62">ans de matière et chantier</p>
      </div>
    </div>
  );
}

export function RedesignedHome({ categories, brands, articles, showrooms }: RedesignedHomeProps) {
  const displayCategories = useMemo(
    () => (categories.length > 0 ? categories : fallbackCategories),
    [categories],
  );
  const heroSlides = useMemo<HeroSlide[]>(
    () => [
      {
        id: "cobam",
        eyebrow: "Maison de matières",
        title: "Matières, bains et chantiers en scène",
        text: "Un parcours plus clair pour choisir les surfaces, les équipements et les finitions qui donnent forme au projet.",
        image: displayCategories[0]?.image ?? "/images/collections/faedo-marbre-blanc-353x353.jpg",
        href: "/produits",
      },
      {
        id: "showrooms",
        eyebrow: "Validation terrain",
        title: "Voir, toucher, décider",
        text: "Des showrooms pour comparer les matières, confirmer les détails et avancer avec une équipe qui connaît le chantier.",
        image: showrooms[0]?.image ?? "/images/showrooms/siege.png",
        href: "/contact",
      },
      {
        id: "exterieur",
        eyebrow: "Projet complet",
        title: "Du sol au dernier détail",
        text: "Carrelage, salle de bain, piscine, peinture, portes et construction: le catalogue reste lisible même quand le projet grandit.",
        image: displayCategories[1]?.image ?? "/images/collections/carrelage-piscine-353x353.jpg",
        href: "/produits",
      },
    ],
    [displayCategories, showrooms],
  );

  const [heroIndex, setHeroIndex] = useState(0);
  const [activeShowroomName, setActiveShowroomName] = useState(showrooms[0]?.name ?? "");
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 6200);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const activeHero = heroSlides[heroIndex] ?? heroSlides[0];
  const activeShowroom =
    showrooms.find((showroom) => showroom.name === activeShowroomName) ?? showrooms[0] ?? null;
  const visibleBrands = brands.slice(0, 12);
  const latestArticles = articles.slice(0, 3);

  const handleHeroMove = (event: ReactPointerEvent<HTMLElement>) => {
    const section = heroRef.current;
    if (!section || event.pointerType === "touch") {
      return;
    }

    const rect = section.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    section.style.setProperty("--hero-x", `${x * 22}px`);
    section.style.setProperty("--hero-y", `${y * 18}px`);
    section.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    section.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  const resetHeroMove = () => {
    const section = heroRef.current;
    if (!section) {
      return;
    }

    section.style.setProperty("--hero-x", "0px");
    section.style.setProperty("--hero-y", "0px");
  };

  return (
    <div className="cobam-cinematic-landing bg-[#fafaf9] text-[#14202e]">
      <section
        ref={heroRef}
        onPointerMove={handleHeroMove}
        onPointerLeave={resetHeroMove}
        className="cobam-cinematic-hero cobam-atlas-hero relative isolate min-h-[calc(94svh-5rem)] overflow-hidden bg-[#14202e] text-[#fafaf9]"
        style={{ "--atlas-title-image": `url("${activeHero.image}")` } as CSSProperties}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-y-0 right-0 w-full lg:w-[68%]">
            {heroSlides.map((slide, index) => (
              <Image
                key={slide.id}
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 70vw, 100vw"
                data-parallax-speed="-0.032"
                className={cn(
                  "cobam-cinematic-hero-image object-cover opacity-0 transition duration-1000",
                  index === heroIndex ? "opacity-100" : "",
                )}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-[#14202e]/50" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,32,46,0.98),rgba(20,32,46,0.88)_38%,rgba(20,32,46,0.2)_100%)]" />
          <div className="cobam-atlas-grid absolute inset-0" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,transparent,rgba(20,32,46,0.92))]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(94svh-5rem)] max-w-[1500px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.54fr_0.46fr] lg:px-12">
          <div className="flex flex-col justify-center py-14 lg:py-20" data-landing-reveal>
            <div className="flex items-center gap-4">
              <span className="h-px w-14 bg-[#0a8dc1]" aria-hidden="true" />
              <p className="text-sm font-semibold text-[#0a8dc1]">Atlas des matières</p>
            </div>

            <h1 className="mt-7 max-w-4xl text-6xl font-semibold leading-none sm:text-7xl lg:text-8xl">
              <span className="cobam-atlas-title-fill block">Matières</span>
              {" "}
              <span className="block text-[#fafaf9]">d&apos;architecture</span>
            </h1>

            <p className="mt-7 max-w-2xl text-2xl font-medium leading-tight text-[#fafaf9] sm:text-3xl lg:text-4xl">
              {activeHero.title}
            </p>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#fafaf9]/72 sm:text-lg sm:leading-8">
              {activeHero.text}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={activeHero.href}
                className="cobam-cinematic-action bg-[#fafaf9] text-[#14202e] hover:bg-[#0a8dc1]"
              >
                Explorer le catalogue
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="cobam-cinematic-action border border-[#fafaf9]/20 text-[#fafaf9] hover:border-[#0a8dc1]/70 hover:text-[#0a8dc1]"
              >
                Trouver un showroom
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div
            className="relative hidden h-[42rem] lg:block"
            data-landing-reveal
            style={revealDelay(120)}
          >
            <div className="cobam-atlas-orbit absolute inset-0" aria-hidden="true" />
            <div className="cobam-atlas-plane absolute right-0 top-10 h-[30rem] w-[min(44rem,100%)] overflow-hidden border border-[#fafaf9]/18 bg-[#fafaf9]/8">
              {heroSlides.map((slide, index) => (
                <Image
                  key={slide.id}
                  src={slide.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className={cn(
                    "object-cover opacity-0 transition duration-1000",
                    index === heroIndex ? "opacity-100" : "",
                  )}
                />
              ))}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,32,46,0.02),rgba(20,32,46,0.72))]" />
            </div>

            <div className="absolute bottom-0 left-0 w-[24rem] border border-[#fafaf9]/14 bg-[#14202e]/76 p-5 backdrop-blur-xl">
              <p className="text-sm font-semibold text-[#0a8dc1]">Séquence active</p>
              <div className="mt-5 flex items-end gap-4">
                <span className="text-7xl font-semibold leading-none text-[#fafaf9]">
                  {String(heroIndex + 1).padStart(2, "0")}
                </span>
                <span className="pb-2 text-sm font-semibold text-[#fafaf9]/50">
                  / {String(heroSlides.length).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#fafaf9]/66">{activeHero.eyebrow}</p>
            </div>
          </div>

          <div className="self-end border-t border-[#fafaf9]/14 pt-5 lg:col-span-2">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="flex flex-wrap items-center gap-3" aria-label="Sélection du visuel">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setHeroIndex(index)}
                    className={cn(
                      "group flex min-h-11 items-center gap-3 rounded-md border px-3 text-left transition",
                      index === heroIndex
                        ? "border-[#0a8dc1]/70 bg-[#0a8dc1]/14 text-[#fafaf9]"
                        : "border-[#fafaf9]/14 bg-[#fafaf9]/6 text-[#fafaf9]/54 hover:border-[#fafaf9]/38 hover:text-[#fafaf9]",
                    )}
                    aria-label={`Afficher ${slide.eyebrow}`}
                  >
                    <span className="text-sm font-semibold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="hidden text-sm font-semibold sm:inline">{slide.title}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#fafaf9]/64 lg:justify-end">
                <span>Depuis 1994</span>
                <span className="hidden text-[#0a8dc1] sm:inline">/</span>
                <span>4 showrooms en Tunisie</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fafaf9] py-16 text-[#14202e] sm:py-20">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:px-12">
          <div data-landing-reveal>
            <p className="text-sm font-semibold text-[#0a8dc1]">COBAM en chiffres</p>
            <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-none sm:text-5xl">
              Une présence reconnue, construite dans la durée.
            </h2>
          </div>

          <div className="grid border-l border-t border-[#14202e]/12 sm:grid-cols-2 lg:grid-cols-4">
            {companyRecognition.map((metric, index) => (
              <div
                key={metric.label}
                className="min-h-44 border-b border-r border-[#14202e]/12 bg-[#fafaf9] p-5 transition hover:bg-[#0a8dc1]/8"
                data-landing-reveal
                style={revealDelay(index * 60)}
              >
                <p className="text-5xl font-semibold leading-none text-[#14202e] sm:text-6xl">
                  {metric.value}
                </p>
                <p className="mt-4 max-w-40 text-sm font-semibold leading-6 text-[#5e5e5e]">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#14202e] py-24 text-[#fafaf9] sm:py-32">
        <SignalCanvas />
        <div className="relative z-10 mx-auto grid max-w-[1500px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-12">
          <div data-landing-reveal>
            <p className="text-sm font-semibold text-[#0a8dc1]">Méthode COBAM</p>
            <h2 className="mt-5 max-w-3xl text-5xl font-semibold leading-none sm:text-6xl">
              La matière devient lisible avant le chantier.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#fafaf9]/66">
              La page d&apos;accueil doit agir comme un showroom digital: elle montre les choix,
              compare les familles et donne un chemin net vers les produits.
            </p>
          </div>
          <div data-landing-reveal style={revealDelay(100)}>
            <div className="cobam-cinematic-parallax" data-parallax-speed="-0.04">
              <MetricDial />
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative isolate bg-[#14202e] py-20 text-[#fafaf9] sm:py-28"
        data-choice-sequence
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-28 [background-image:linear-gradient(90deg,rgba(250,250,249,0.1)_1px,transparent_1px),linear-gradient(180deg,rgba(250,250,249,0.08)_1px,transparent_1px)] [background-size:9rem_9rem]" />
        <div className="relative mx-auto grid max-w-[1500px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:px-12">
          <div className="lg:sticky lg:top-28 lg:self-start" data-choice-sticky>
            <div data-landing-reveal>
              <p className="text-sm font-semibold text-[#0a8dc1]">Catalogue COBAM</p>
              <h2 className="mt-5 text-5xl font-semibold leading-none sm:text-6xl">
                Les familles produits, comme une visite guidée.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#fafaf9]/66">
                Chaque univers garde son image, ses usages et ses entrées rapides. Le visiteur peut
                parcourir le catalogue sans perdre le fil du projet.
              </p>

              <div className="mt-9 grid grid-cols-2 border-y border-[#fafaf9]/14">
                {["Explorer", "Comparer", "Choisir", "Visiter"].map((step) => (
                  <div key={step} className="border-[#fafaf9]/14 py-4 odd:border-r">
                    <p className="text-3xl font-semibold text-[#fafaf9]">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            {displayCategories.map((category, index) => (
              <article
                key={category.id}
                className={cn(
                  "group grid overflow-hidden rounded-lg border border-[#fafaf9]/12 bg-[#fafaf9]/6 transition hover:border-[#0a8dc1]/55 hover:bg-[#fafaf9]/8 hover:shadow-[0_30px_90px_rgba(0,0,0,0.22)] lg:grid-cols-[0.92fr_1.08fr]",
                  index % 2 === 0 ? "lg:mr-12" : "lg:ml-12",
                )}
                data-landing-reveal
                style={revealDelay(index * 75)}
                >
                <div
                  className={cn(
                    "cobam-cinematic-parallax relative min-h-[18rem] overflow-hidden bg-[#14202e]",
                    index % 2 === 1 ? "lg:order-2" : "",
                  )}
                  data-parallax-speed={index % 2 === 0 ? "-0.034" : "0.042"}
                >
                  <Image
                    src={category.image}
                    alt={category.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,32,46,0.02),rgba(20,32,46,0.62))]" />
                  <p className="absolute bottom-4 left-4 rounded-md border border-[#fafaf9]/18 bg-[#14202e]/72 px-3 py-2 text-sm font-semibold text-[#fafaf9]">
                    {category.number}
                  </p>
                </div>

                <div className="flex min-h-[18rem] flex-col justify-center p-6 sm:p-8">
                  <div className="grid size-12 place-items-center rounded-md border border-[#fafaf9]/16 bg-[#fafaf9]/8">
                    <span className="text-sm font-semibold text-[#0a8dc1]">{category.number}</span>
                  </div>
                  <p className="mt-6 text-sm font-semibold text-[#0a8dc1]">Catégorie</p>
                  <h3 className="mt-3 text-3xl font-semibold leading-tight text-[#fafaf9] sm:text-4xl">
                    {category.name}
                  </h3>
                  <p className="mt-5 max-w-xl text-base leading-7 text-[#fafaf9]/64">
                    {category.subtitle}
                  </p>
                  {category.subcategories.length > 0 ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {category.subcategories.slice(0, 4).map((subcategory) => (
                        <Link
                          key={subcategory.label}
                          href={subcategory.href}
                          className="rounded-md border border-[#fafaf9]/12 bg-[#fafaf9]/7 px-3 py-2 text-sm font-semibold text-[#fafaf9]/74 transition hover:border-[#0a8dc1]/70 hover:text-[#0a8dc1]"
                        >
                          {subcategory.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  <Link
                    href={category.href}
                    className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#0a8dc1] transition hover:text-[#fafaf9]"
                  >
                    Voir la catégorie
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fafaf9] py-20 sm:py-28" id="nos-agences">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
            <div data-landing-reveal>
              <p className="text-sm font-semibold text-[#0a8dc1]">Showrooms</p>
              <h2 className="mt-5 text-5xl font-semibold leading-none sm:text-6xl">
                Le digital mène à la matière réelle.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5e5e5e]">
                Les points de vente deviennent une suite logique de la page: voir une famille,
                comprendre son usage, puis savoir où la confirmer.
              </p>
              <div className="mt-8 grid gap-2">
                {showrooms.map((showroom) => {
                  const active = showroom.name === activeShowroom?.name;

                  return (
                    <button
                      key={showroom.name}
                      type="button"
                      onClick={() => setActiveShowroomName(showroom.name)}
                      className={cn(
                        "flex min-h-16 items-center justify-between rounded-lg border px-4 text-left transition",
                        active
                          ? "border-[#0a8dc1] bg-[#fafaf9] text-[#14202e] shadow-sm"
                          : "border-[#14202e]/10 bg-transparent text-[#5e5e5e] hover:border-[#0a8dc1]/50",
                      )}
                    >
                      <span>
                        <span className="block font-semibold">{showroom.name}</span>
                        <span className="mt-1 block text-sm">{showroom.address}</span>
                      </span>
                      <MapPin className="size-5 text-[#0a8dc1]" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="cobam-cinematic-parallax relative min-h-[38rem] overflow-hidden rounded-lg bg-[#14202e] text-[#fafaf9] shadow-[0_32px_90px_rgba(20,32,46,0.16)]"
              data-parallax-speed="0.028"
            >
              {activeShowroom ? (
                <>
                  <Image
                    src={activeShowroom.image}
                    alt={activeShowroom.name}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,32,46,0.02),rgba(20,32,46,0.76))]" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <p className="text-sm font-semibold text-[#0a8dc1]">{activeShowroom.label}</p>
                    <h3 className="mt-3 text-5xl font-semibold leading-none">
                      {activeShowroom.name}
                    </h3>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <a
                        href={activeShowroom.map}
                        target="_blank"
                        rel="noreferrer"
                        className="cobam-cinematic-action bg-[#fafaf9] text-[#14202e]"
                      >
                        Itinéraire
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </a>
                      <a
                        href={`tel:${activeShowroom.phone.replace(/\s/g, "")}`}
                        className="cobam-cinematic-action border border-[#fafaf9]/24 text-[#fafaf9]"
                      >
                        <Phone className="size-4" aria-hidden="true" />
                        {activeShowroom.phone}
                      </a>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {visibleBrands.length > 0 ? (
        <section className="overflow-hidden bg-[#fafaf9] py-16">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12" data-landing-reveal>
            <p className="text-sm font-semibold text-[#0a8dc1]">Marques et références</p>
          </div>
          <div className="cobam-cinematic-marquee mt-8">
            <div className="cobam-cinematic-marquee-track">
              {[...visibleBrands, ...visibleBrands].map((brand, index) => (
                <Link
                  key={`${brand.id}-${index}`}
                  href={brand.href}
                  className="inline-flex h-24 min-w-56 items-center justify-center rounded-lg border border-[#14202e]/10 bg-[#fafaf9] px-8 transition hover:border-[#0a8dc1]/50"
                >
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    width={150}
                    height={72}
                    className="max-h-14 w-auto object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {latestArticles.length > 0 ? (
        <section className="bg-[#fafaf9] pb-24 sm:pb-32">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr] lg:items-end">
              <div data-landing-reveal>
                <p className="text-sm font-semibold text-[#0a8dc1]">Actualités</p>
                <h2 className="mt-5 text-5xl font-semibold leading-none sm:text-6xl">
                  Des idées à garder sous la main.
                </h2>
              </div>
              <div className="lg:text-right" data-landing-reveal>
                <Link href="/actualites" className="cobam-cinematic-action border border-[#14202e]/18">
                  Toutes les actualités
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {latestArticles.map((article, index) => {
                const imageUrl =
                  article.coverImageThumbnailUrl ??
                  article.coverImageUrl ??
                  "/images/collections/tessino-gris-353x353.jpg";

                return (
                  <Link
                    key={article.id}
                    href={`/actualites/${article.slug}`}
                    className="group overflow-hidden rounded-lg border border-[#14202e]/10 bg-[#fafaf9] transition hover:-translate-y-1 hover:border-[#0a8dc1]/40 hover:shadow-[0_24px_80px_rgba(20,32,46,0.13)]"
                    data-landing-reveal
                    style={revealDelay(index * 80)}
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden bg-[#14202e]">
                      <Image
                        src={imageUrl}
                        alt={article.coverImageAlt ?? article.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </span>
                    <span className="block p-5">
                      <span className="text-sm font-semibold text-[#0a8dc1]">
                        {formatArticleDate(article.publishedAt ?? article.updatedAt)}
                      </span>
                      <span className="mt-3 block text-2xl font-semibold leading-tight text-[#14202e]">
                        {article.title}
                      </span>
                      <span className="mt-4 block text-sm leading-6 text-[#5e5e5e]">
                        {article.excerpt}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="relative overflow-hidden bg-[#fafaf9] py-20 text-[#14202e] sm:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:px-12">
          <div data-landing-reveal>
            <p className="text-sm font-semibold text-[#0a8dc1]">Réseaux sociaux</p>
            <h2 className="mt-5 text-5xl font-semibold leading-none sm:text-6xl">
              Suivez nous
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5e5e5e]">
              Suivez les matières, les projets et les nouveautés.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {COBAM_SOCIAL_LINKS.map((social, index) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-28 items-center justify-between rounded-lg border border-[#14202e]/10 bg-[#fafaf9] p-5 text-[#14202e] transition hover:-translate-y-1 hover:border-[#0a8dc1]/50 hover:shadow-[0_24px_70px_rgba(20,32,46,0.12)]"
                data-landing-reveal
                style={revealDelay(index * 45)}
                aria-label={`Suivre COBAM sur ${social.label}`}
              >
                <span>
                  <span className="block text-lg font-semibold">{social.label}</span>
                  <span className="mt-2 block text-sm text-[#5e5e5e]">{social.handle}</span>
                </span>
                <span className="grid size-12 place-items-center rounded-md border border-[#0a8dc1]/24 bg-[#0a8dc1]/10 text-[#0a8dc1] transition group-hover:bg-[#0a8dc1] group-hover:text-[#14202e]">
                  <social.Icon className="size-5" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#14202e] py-20 text-[#fafaf9] sm:py-28">
        <div className="absolute inset-0 opacity-45">
          <Image
            src="/images/random-images/bathroom-blue-tiles-texture-background.jpg"
            alt=""
            fill
            sizes="100vw"
            data-parallax-speed="-0.025"
            className="cobam-cinematic-parallax-scale object-cover"
          />
          <div className="absolute inset-0 bg-[#14202e]/74" />
        </div>
        <div className="relative z-10 mx-auto grid max-w-[1500px] gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12">
          <div data-landing-reveal>
            <p className="text-sm font-semibold text-[#0a8dc1]">Prochaine étape</p>
            <h2 className="mt-5 max-w-4xl text-5xl font-semibold leading-none sm:text-7xl">
              Construire le bon choix commence ici.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end" data-landing-reveal>
            <Link href="/produits" className="cobam-cinematic-action bg-[#0a8dc1] text-[#14202e]">
              Ouvrir le catalogue
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="cobam-cinematic-action border border-[#fafaf9]/24 text-[#fafaf9]">
              Nous contacter
              <Compass className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
