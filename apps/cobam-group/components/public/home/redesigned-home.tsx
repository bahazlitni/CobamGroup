"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Compass,
  Layers,
  MapPin,
  Newspaper,
  Phone,
  Sparkles,
  Store,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

type HeroPanel = {
  id: string;
  label: string;
  title: string;
  text: string;
  image: string;
  href: string;
};

type Metric = {
  value: number;
  suffix?: string;
  label: string;
  note: string;
  format?: "standard" | "comma";
};

type ValuePillar = {
  title: string;
  text: string;
  Icon: LucideIcon;
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
    image: "/images/collections/vasque-ovale-premium-353x353.jpg",
    imageAlt: "Vasque premium",
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

const companyMetrics: Metric[] = [
  {
    value: 30,
    suffix: "+",
    label: "années d'expertise",
    note: "Une présence installée dans les projets tunisiens depuis 1994.",
  },
  {
    value: 5000,
    suffix: "+",
    label: "références produits",
    note: "Des familles de produits pensées pour comparer vite et juste.",
    format: "comma",
  },
  {
    value: 4,
    label: "showrooms en Tunisie",
    note: "Des lieux physiques pour voir, toucher et confirmer les choix.",
  },
  {
    value: 1994,
    label: "année de création",
    note: "Une culture du chantier, du conseil et de la matière durable.",
  },
];

const valuePillars: ValuePillar[] = [
  {
    title: "Sélection",
    text: "Des marques, formats et finitions organisés pour passer de l'idée au produit.",
    Icon: Layers,
  },
  {
    title: "Validation",
    text: "Des showrooms qui replacent la matière dans la lumière, le toucher et l'usage.",
    Icon: Store,
  },
  {
    title: "Accompagnement",
    text: "Une équipe habituée aux contraintes réelles: pose, délais, entretien et cohérence.",
    Icon: BadgeCheck,
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

function formatMetricValue(value: number, format: Metric["format"]) {
  if (format === "comma") {
    return new Intl.NumberFormat("en-US").format(value);
  }

  return new Intl.NumberFormat("fr-FR").format(value);
}

function AnimatedMetricValue({ metric }: { metric: Metric }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;

    if (reducedMotion) {
      animationFrame = window.requestAnimationFrame(() => setValue(metric.value));
      return () => {
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
        }
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        const start = performance.now();
        const duration = metric.value > 1000 ? 1850 : 1350;

        const tick = (time: number) => {
          const progress = Math.min(1, (time - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(metric.value * eased));

          if (progress < 1) {
            animationFrame = window.requestAnimationFrame(tick);
          }
        };

        animationFrame = window.requestAnimationFrame(tick);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.2 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [metric]);

  return (
    <span ref={ref}>
      {formatMetricValue(value, metric.format)}
      {metric.suffix}
    </span>
  );
}

function HeroAtmosphereCanvas() {
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

    const particles = Array.from({ length: 68 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.8 + Math.random() * 2.2,
      alpha: 0.18 + Math.random() * 0.38,
      phase: index * 0.37,
      speed: 0.000035 + Math.random() * 0.00005,
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

      const field = context.createLinearGradient(0, 0, width, height);
      field.addColorStop(0, "rgba(20, 32, 46, 0.2)");
      field.addColorStop(0.45, "rgba(10, 141, 193, 0.18)");
      field.addColorStop(1, "rgba(250, 250, 249, 0.04)");
      context.fillStyle = field;
      context.fillRect(0, 0, width, height);

      for (let line = 0; line < 9; line += 1) {
        context.beginPath();
        for (let x = -60; x <= width + 60; x += 20) {
          const progress = x / Math.max(width, 1);
          const drift = reducedMotion ? 0 : time * 0.00014;
          const y =
            height * (0.14 + line * 0.09) +
            Math.sin(progress * 10 + line * 0.8 + drift * (2.2 + line)) * (14 + line * 4);

          if (x === -60) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }

        context.strokeStyle = `rgba(250, 250, 249, ${0.026 + line * 0.006})`;
        context.lineWidth = line % 3 === 0 ? 1.2 : 0.8;
        context.stroke();
      }

      for (const particle of particles) {
        const drift = reducedMotion ? 0 : time * particle.speed;
        const x = ((particle.x + drift) % 1) * width;
        const y = particle.y * height + Math.sin(time * 0.001 + particle.phase) * 18;

        context.beginPath();
        context.arc(x, y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(250, 250, 249, ${particle.alpha})`;
        context.fill();
      }

      const light = context.createRadialGradient(width * 0.66, height * 0.34, 0, width * 0.66, height * 0.34, width * 0.5);
      light.addColorStop(0, "rgba(10, 141, 193, 0.22)");
      light.addColorStop(0.5, "rgba(10, 141, 193, 0.06)");
      light.addColorStop(1, "rgba(10, 141, 193, 0)");
      context.fillStyle = light;
      context.fillRect(0, 0, width, height);

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

  return <canvas ref={canvasRef} className="cobam-material-canvas absolute inset-0 h-full w-full" aria-hidden="true" />;
}

export function RedesignedHome({ categories, brands, articles, showrooms }: RedesignedHomeProps) {
  const displayCategories = useMemo(
    () => (categories.length > 0 ? categories : fallbackCategories),
    [categories],
  );

  const heroPanels = useMemo<HeroPanel[]>(
    () => [
      {
        id: "catalogue",
        label: "Catalogue",
        title: "Surfaces, bains et finitions",
        text: "Des familles lisibles pour choisir vite sans perdre la qualité du détail.",
        image: displayCategories[0]?.image ?? "/images/collections/faedo-marbre-blanc-353x353.jpg",
        href: "/produits",
      },
      {
        id: "showrooms",
        label: "Showrooms",
        title: "Voir la matière en vrai",
        text: "Quatre lieux pour comparer les textures, la lumière et les usages.",
        image: showrooms[0]?.image ?? "/images/showrooms/houmt-souk.png",
        href: "/contact",
      },
      {
        id: "expertise",
        label: "Depuis 1994",
        title: "Le bon choix avant chantier",
        text: "Une culture du produit et du terrain pour sécuriser chaque projet.",
        image: displayCategories[1]?.image ?? "/images/collections/vasque-ovale-premium-353x353.jpg",
        href: "/a-propos",
      },
    ],
    [displayCategories, showrooms],
  );

  const [heroIndex, setHeroIndex] = useState(0);
  const [focusedCategoryId, setFocusedCategoryId] = useState<string | null>(null);
  const [activeShowroomName, setActiveShowroomName] = useState(showrooms[0]?.name ?? "");
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (heroPanels.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroPanels.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [heroPanels.length]);

  const activeHero = heroPanels[heroIndex] ?? heroPanels[0];
  const focusedCategory =
    displayCategories.find((category) => category.id === focusedCategoryId) ?? displayCategories[0];
  const activeShowroom =
    showrooms.find((showroom) => showroom.name === activeShowroomName) ?? showrooms[0] ?? null;
  const visibleBrands = brands.slice(0, 14);
  const latestArticles = articles.slice(0, 3);

  const handleHeroMove = (event: ReactPointerEvent<HTMLElement>) => {
    const section = heroRef.current;
    if (!section || event.pointerType === "touch") {
      return;
    }

    const rect = section.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    section.style.setProperty("--hero-x", `${x * 26}px`);
    section.style.setProperty("--hero-y", `${y * 22}px`);
    section.style.setProperty("--hero-tilt", `${x * 3.8}deg`);
    section.style.setProperty("--hero-light-x", `${event.clientX - rect.left}px`);
    section.style.setProperty("--hero-light-y", `${event.clientY - rect.top}px`);
  };

  const resetHeroMove = () => {
    const section = heroRef.current;
    if (!section) {
      return;
    }

    section.style.setProperty("--hero-x", "0px");
    section.style.setProperty("--hero-y", "0px");
    section.style.setProperty("--hero-tilt", "0deg");
  };

  return (
    <div className="cobam-cinematic-landing bg-[#fafaf9] text-[#14202e]">
      <section
        ref={heroRef}
        onPointerMove={handleHeroMove}
        onPointerLeave={resetHeroMove}
        className="cobam-cinematic-hero relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-[#14202e] text-[#fafaf9]"
        data-hero-section
      >
        <HeroAtmosphereCanvas />
        <div className="absolute inset-0">
          {heroPanels.map((panel, index) => (
            <Image
              key={panel.id}
              src={panel.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className={cn(
                "cobam-hero-wash object-cover opacity-0 transition duration-1000",
                index === heroIndex ? "opacity-100" : "",
              )}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,32,46,0.98),rgba(20,32,46,0.86)_42%,rgba(20,32,46,0.42)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-5rem)] max-w-[1500px] gap-10 px-5 pb-32 pt-10 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-12 lg:pb-24 lg:pt-12">
          <div className="flex flex-col justify-center py-10 lg:py-16" data-landing-reveal>

            <h1 className="cobam-display mt-8 max-w-5xl text-[clamp(2.6rem,8vw,8.5rem)] font-semibold leading-[0.82] text-[#fafaf9]">
              L'architecture des matières
            </h1>

            <p className="mt-8 max-w-2xl text-2xl leading-tight text-[#fafaf9] sm:text-3xl lg:text-4xl">
              L&apos;expérience showroom transformée en parcours digital premium.
            </p>

            <div className="mt-9 flex max-w-[calc(100%-4.75rem)] flex-col gap-3 sm:max-w-none sm:flex-row">
              <Link
                href="/produits"
                className="cobam-cinematic-action bg-[#0a8dc1] text-[#fafaf9] hover:bg-[#fafaf9] hover:text-[#14202e]"
                data-magnetic
              >
                Explorer le catalogue
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="cobam-cinematic-action border border-[#fafaf9]/22 text-[#fafaf9] hover:border-[#0a8dc1] hover:text-[#0a8dc1]"
                data-magnetic
              >
                Contacter nous
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      <section className="relative bg-[#fafaf9] py-16 text-[#14202e] sm:py-20" aria-labelledby="numbers-title">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-end lg:px-12">
          <div data-landing-reveal>
            <p className="cobam-section-kicker text-[#0a8dc1]">COBAM en chiffres</p>
            <h2 id="numbers-title" className="cobam-display mt-5 max-w-xl text-5xl font-semibold leading-none sm:text-6xl">
              Une présence reconnue, construite dans la durée.
            </h2>
          </div>

          <div className="grid border-l border-t border-[#14202e]/12 sm:grid-cols-2 lg:grid-cols-4">
            {companyMetrics.map((metric, index) => (
              <article
                key={metric.label}
                className="cobam-metric-card min-h-56 border-b border-r border-[#14202e]/12 bg-[#fafaf9] p-5 transition"
                data-landing-reveal
                style={revealDelay(index * 60)}
              >
                <p className="text-5xl font-semibold leading-none text-[#14202e] sm:text-6xl">
                  <AnimatedMetricValue metric={metric} />
                </p>
                <h3 className="mt-4 max-w-40 text-sm font-semibold leading-6 text-[#14202e]">
                  {metric.label}
                </h3>
                <p className="mt-5 text-sm leading-6 text-[#5e5e5e]">{metric.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#f2f4f5] py-20 text-[#14202e] sm:py-28" aria-labelledby="about-title">
        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(20,32,46,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(20,32,46,0.06)_1px,transparent_1px)] [background-size:8rem_8rem]" />
        <div className="relative mx-auto grid max-w-[1500px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-12">
          <div data-landing-reveal>
            <p className="cobam-section-kicker text-[#0a8dc1]">À propos</p>
            <h2 id="about-title" className="cobam-display mt-5 max-w-3xl text-5xl font-semibold leading-none sm:text-7xl">
              Un groupe de matières, de lieux et de conseils.
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5e5e5e]">
              COBAM Group accompagne les professionnels et les particuliers dans le choix de
              matériaux, revêtements, équipements et finitions capables de transformer un projet en
              espace durable, précis et élégant.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/a-propos" className="cobam-cinematic-action bg-[#14202e] text-[#fafaf9]" data-magnetic>
                Découvrir le groupe
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="cobam-cinematic-action border border-[#14202e]/18 text-[#14202e] hover:border-[#0a8dc1] hover:text-[#0a8dc1]"
                data-magnetic
              >
                Parler à l&apos;équipe
                <Phone className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4" data-landing-reveal style={revealDelay(120)}>
            {valuePillars.map(({ title, text, Icon }, index) => (
              <article
                key={title}
                className="group grid gap-5 border border-[#14202e]/10 bg-[#fafaf9]/78 p-5 shadow-[0_20px_70px_rgba(20,32,46,0.07)] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#0a8dc1]/40 sm:grid-cols-[3.5rem_1fr]"
                style={revealDelay(index * 70)}
                data-landing-reveal
              >
                <span className="grid size-14 place-items-center border border-[#0a8dc1]/24 bg-[#0a8dc1]/10 text-[#0a8dc1] transition group-hover:bg-[#0a8dc1] group-hover:text-[#fafaf9]">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-2xl font-semibold text-[#14202e]">{title}</span>
                  <span className="mt-3 block text-sm leading-6 text-[#5e5e5e]">{text}</span>
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate bg-[#14202e] py-20 text-[#fafaf9] sm:py-28" aria-labelledby="categories-title">
        <div className="pointer-events-none absolute inset-0 opacity-24 [background-image:linear-gradient(90deg,rgba(250,250,249,0.11)_1px,transparent_1px),linear-gradient(180deg,rgba(250,250,249,0.08)_1px,transparent_1px)] [background-size:9rem_9rem]" />
        <div className="relative mx-auto grid max-w-[1500px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:px-12">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div data-landing-reveal>
              <p className="cobam-section-kicker text-[#0a8dc1]">Catalogue COBAM</p>
              <h2 id="categories-title" className="cobam-display mt-5 text-5xl font-semibold leading-none sm:text-7xl">
                Les familles produits, comme une visite guidée.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#fafaf9]/68">
                Chaque univers garde son image, ses usages et ses entrées rapides. Le visiteur
                parcourt le catalogue sans perdre le fil du projet.
              </p>

              {focusedCategory ? (
                <div className="cobam-category-preview mt-9 overflow-hidden border border-[#fafaf9]/14 bg-[#fafaf9]/7">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={focusedCategory.image}
                      alt={focusedCategory.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 34vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(20,32,46,0.74))]" />
                    <p className="absolute bottom-4 left-4 text-sm font-semibold text-[#0a8dc1]">
                      {focusedCategory.number} / {focusedCategory.name}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 grid grid-cols-2 border-y border-[#fafaf9]/14">
                {["Voir", "Comparer", "Valider", "Situer"].map((step) => (
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
                  "group grid overflow-hidden border border-[#fafaf9]/12 bg-[#fafaf9]/6 transition hover:border-[#0a8dc1]/55 hover:bg-[#fafaf9]/8 hover:shadow-[0_30px_90px_rgba(0,0,0,0.24)] lg:grid-cols-[0.92fr_1.08fr]",
                  index % 2 === 0 ? "lg:mr-12" : "lg:ml-12",
                )}
                onMouseEnter={() => setFocusedCategoryId(category.id)}
                onFocus={() => setFocusedCategoryId(category.id)}
                data-landing-reveal
                style={revealDelay(index * 65)}
              >
                <div
                  className={cn(
                    "cobam-cinematic-parallax relative min-h-[18rem] overflow-hidden bg-[#14202e]",
                    index % 2 === 1 ? "lg:order-2" : "",
                  )}
                  data-parallax-speed={index % 2 === 0 ? "-0.03" : "0.034"}
                >
                  <Image
                    src={category.image}
                    alt={category.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,32,46,0.02),rgba(20,32,46,0.68))]" />
                  <p className="absolute bottom-4 left-4 border border-[#fafaf9]/18 bg-[#14202e]/72 px-3 py-2 text-sm font-semibold text-[#fafaf9]">
                    {category.number}
                  </p>
                </div>

                <div className="flex min-h-[18rem] flex-col justify-center p-6 sm:p-8">
                  <div className="grid size-12 place-items-center border border-[#fafaf9]/16 bg-[#fafaf9]/8">
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
                          className="border border-[#fafaf9]/12 bg-[#fafaf9]/7 px-3 py-2 text-sm font-semibold text-[#fafaf9]/74 transition hover:border-[#0a8dc1]/70 hover:text-[#0a8dc1]"
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

      <section className="bg-[#fafaf9] py-20 text-[#14202e] sm:py-28" id="nos-agences" aria-labelledby="showrooms-title">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
            <div data-landing-reveal>
              <p className="cobam-section-kicker text-[#0a8dc1]">Showrooms</p>
              <h2 id="showrooms-title" className="cobam-display mt-5 text-5xl font-semibold leading-none sm:text-7xl">
                Le digital mène à la matière réelle.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#5e5e5e]">
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
                        "group flex min-h-16 items-center justify-between border px-4 text-left transition",
                        active
                          ? "border-[#0a8dc1] bg-[#14202e] text-[#fafaf9] shadow-sm"
                          : "border-[#14202e]/10 bg-transparent text-[#5e5e5e] hover:border-[#0a8dc1]/50 hover:text-[#14202e]",
                      )}
                    >
                      <span>
                        <span className="block font-semibold">{showroom.name}</span>
                        <span className={cn("mt-1 block text-sm", active ? "text-[#fafaf9]/62" : "")}>
                          {showroom.address}
                        </span>
                      </span>
                      <MapPin className="size-5 text-[#0a8dc1]" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="cobam-cinematic-parallax relative min-h-[38rem] overflow-hidden bg-[#14202e] text-[#fafaf9] shadow-[0_32px_90px_rgba(20,32,46,0.16)]"
              data-parallax-speed="0.028"
              data-landing-reveal
              style={revealDelay(100)}
            >
              {activeShowroom ? (
                <>
                  <Image
                    src={activeShowroom.image}
                    alt={activeShowroom.name}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover transition duration-700"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,32,46,0.02),rgba(20,32,46,0.78))]" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <p className="text-sm font-semibold text-[#0a8dc1]">{activeShowroom.label}</p>
                    <h3 className="cobam-display mt-3 text-5xl font-semibold leading-none sm:text-7xl">
                      {activeShowroom.name}
                    </h3>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[#fafaf9]/70">
                      {activeShowroom.address}
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <a
                        href={activeShowroom.map}
                        target="_blank"
                        rel="noreferrer"
                        className="cobam-cinematic-action bg-[#fafaf9] text-[#14202e]"
                        data-magnetic
                      >
                        Itinéraire
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </a>
                      <a
                        href={`tel:${activeShowroom.phone.replace(/\s/g, "")}`}
                        className="cobam-cinematic-action border border-[#fafaf9]/24 text-[#fafaf9]"
                        data-magnetic
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
        <section className="overflow-hidden bg-[#f2f4f5] py-16 text-[#14202e]" aria-labelledby="brands-title">
          <div className="mx-auto grid max-w-[1500px] gap-5 px-5 sm:px-8 lg:grid-cols-[0.65fr_1fr] lg:items-end lg:px-12" data-landing-reveal>
            <div>
              <p className="cobam-section-kicker text-[#0a8dc1]">Marques et références</p>
              <h2 id="brands-title" className="cobam-display mt-4 text-4xl font-semibold leading-none sm:text-5xl">
                Des partenaires visibles, des choix vérifiables.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-[#5e5e5e] lg:justify-self-end">
              Les logos gardent leur présence sans surcharger la page; le mouvement reste fluide et
              s&apos;arrête au survol.
            </p>
          </div>
          <div className="cobam-cinematic-marquee mt-10">
            <div className="cobam-cinematic-marquee-track">
              {[...visibleBrands, ...visibleBrands].map((brand, index) => (
                <Link
                  key={`${brand.id}-${index}`}
                  href={brand.href}
                  className="group inline-flex h-24 min-w-56 items-center justify-center border border-[#14202e]/10 bg-[#fafaf9] px-8 transition hover:border-[#0a8dc1]/50 hover:shadow-[0_18px_50px_rgba(20,32,46,0.1)]"
                >
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    width={150}
                    height={72}
                    className="max-h-14 w-auto object-contain grayscale transition duration-300 group-hover:grayscale-0"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {latestArticles.length > 0 ? (
        <section className="bg-[#fafaf9] py-20 text-[#14202e] sm:py-28" aria-labelledby="articles-title">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr] lg:items-end">
              <div data-landing-reveal>
                <p className="cobam-section-kicker text-[#0a8dc1]">Actualités</p>
                <h2 id="articles-title" className="cobam-display mt-5 text-5xl font-semibold leading-none sm:text-7xl">
                  Des idées à garder sous la main.
                </h2>
              </div>
              <div className="lg:text-right" data-landing-reveal>
                <Link href="/actualites" className="cobam-cinematic-action border border-[#14202e]/18 text-[#14202e] hover:border-[#0a8dc1] hover:text-[#0a8dc1]" data-magnetic>
                  Toutes les actualités
                  <Newspaper className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {latestArticles.map((article, index) => {
                const imageUrl =
                  article.coverImageUrl ??
                  article.coverImageThumbnailUrl ??
                  "/images/collections/tessino-gris-353x353.jpg";

                return (
                  <Link
                    key={article.id}
                    href={`/actualites/${article.slug}`}
                    className="group overflow-hidden border border-[#14202e]/10 bg-[#fafaf9] transition hover:-translate-y-1 hover:border-[#0a8dc1]/40 hover:shadow-[0_24px_80px_rgba(20,32,46,0.13)]"
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

      <section className="relative overflow-hidden bg-[#14202e] py-20 text-[#fafaf9] sm:py-28" aria-labelledby="social-title">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,rgba(250,250,249,0.12)_1px,transparent_1px),linear-gradient(180deg,rgba(250,250,249,0.08)_1px,transparent_1px)] [background-size:8rem_8rem]" />
        <div className="relative mx-auto grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:px-12">
          <div data-landing-reveal>
            <p className="cobam-section-kicker text-[#0a8dc1]">Réseaux sociaux</p>
            <h2 id="social-title" className="cobam-display mt-5 text-5xl font-semibold leading-none sm:text-7xl">
              Suivez nous
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#fafaf9]/68">
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
                className="cobam-social-card group flex min-h-28 items-center justify-between border border-[#fafaf9]/12 bg-[#fafaf9]/7 p-5 text-[#fafaf9] transition hover:-translate-y-1 hover:border-[#0a8dc1]/60"
                data-landing-reveal
                style={revealDelay(index * 45)}
                aria-label={`Suivre COBAM sur ${social.label}`}
              >
                <span>
                  <span className="block text-lg font-semibold">{social.label}</span>
                  <span className="mt-2 block text-sm text-[#fafaf9]/54">{social.handle}</span>
                </span>
                <span className="grid size-12 place-items-center border border-[#0a8dc1]/28 bg-[#0a8dc1]/12 text-[#0a8dc1] transition group-hover:bg-[#0a8dc1] group-hover:text-[#fafaf9]">
                  <social.Icon className="size-5" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#14202e] py-20 text-[#fafaf9] sm:py-32" aria-labelledby="final-cta-title">
        <div className="absolute inset-0 opacity-52">
          <Image
            src="/images/random-images/bathroom-blue-tiles-texture-background.jpg"
            alt=""
            fill
            sizes="100vw"
            data-parallax-speed="-0.025"
            className="cobam-cinematic-parallax-scale object-cover"
          />
          <div className="absolute inset-0 bg-[#14202e]/76" />
        </div>
        <div className="relative z-10 mx-auto grid max-w-[1500px] gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12">
          <div data-landing-reveal>
            <p className="cobam-section-kicker text-[#0a8dc1]">Prochaine étape</p>
            <h2 id="final-cta-title" className="cobam-display mt-5 max-w-4xl text-5xl font-semibold leading-none sm:text-7xl">
              Construire le bon choix commence ici.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#fafaf9]/66">
              Ouvrez le catalogue, préparez votre visite ou contactez l&apos;équipe pour donner un cadre
              clair à votre projet.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end" data-landing-reveal>
            <Link href="/produits" className="cobam-cinematic-action bg-[#0a8dc1] text-[#fafaf9]" data-magnetic>
              Ouvrir le catalogue
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="cobam-cinematic-action border border-[#fafaf9]/24 text-[#fafaf9]" data-magnetic>
              Nous contacter
              <Compass className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
