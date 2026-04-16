import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/ui/custom/SectionHeader";
import BrandSlider from "@/components/ui/custom/BrandSlider";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { PARTNER_BRANDS, REFERENCE_BRANDS } from "@/lib/static_tables/brands";
import { cn } from "@/lib/utils";
import { PremiumReveal } from "@/components/ui/custom/PremiumReveal";
import { PremiumImageWrapper } from "@/components/ui/custom/PremiumImageWrapper";
import HomeCanvasOverlay from "@/components/ui/custom/HomeCanvasOverlay";
import Magnetic from "@/components/ui/custom/Magnetic";
import ParallaxImage from "@/components/ui/custom/ParallaxImage";
import ScrollRevealText from "@/components/ui/custom/ScrollRevealText";
import VelocityMarquee from "@/components/ui/custom/VelocityMarquee";
import { listPublicArticles } from "@/features/articles/public";
import { listPublicMegaMenuProductCategories } from "@/features/product-categories/public";
import { listPublicCollections } from "@/features/product-packs/public";
import { Instagram, Facebook, Linkedin, ArrowRight, Twitter, Youtube } from "lucide-react";
import { FaPinterest, FaTiktok } from "react-icons/fa";
import ShowroomCard from "@/components/ui/custom/ShowroomCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "COBAM GROUP | Revêtements et Carrelage, Matériaux de construction, sanitaires et finitions premium en Tunisie",
  description: "Cobam Group propose des revêtements, sanitaires, matériaux de construction et finitions premium pour les projets résidentiels et professionnels en Tunisie.",
};



const stats = [
  { value: "30+", label: "Années d’expertise" },
  { value: "5 000+", label: "Références produits" },
  { value: "4", label: "Showrooms en Tunisie" },
  { value: "1 000+", label: "Clients accompagnés" },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const [articles, allCategories, collections] = await Promise.all([
    listPublicArticles(),
    listPublicMegaMenuProductCategories(),
    listPublicCollections(),
  ]);

  // Extract a curated set of Categories for "Les Univers"
  const categories = allCategories
    .filter(cat => cat.parent === null) // Only top categories
    .map(cat => ({
      title: cat.title,
      subtitle: cat.subtitle || "Découvrez nos solutions",
      href: cat.href,
      image: cat.imageUrlHD || cat.imageUrl || "/images/placeholders/category.jpg",
      color: cat.themeColor || "#0a8dc1",
    }));

  const featuredArticles = articles.slice(0, 2);

  return (
    <main className="bg-cobam-light-bg text-cobam-dark-blue selection:bg-cobam-dark-blue selection:text-white">
      <HomeCanvasOverlay />
      {/* HERO SECTION - Cinematic Ful-Bleed */}
      <section id="section-hero" className="relative h-[95vh] min-h-[700px] w-full overflow-hidden bg-black">
        <PremiumImageWrapper className="absolute inset-0 z-0">
          <Image
            src="/images/hero-section/1.jpg"
            alt="Cobam Group premium architecture"
            fill
            priority
            className="object-cover object-center opacity-60"
            sizes="100vw"
          />
        </PremiumImageWrapper>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

        <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <PremiumReveal delay={0.2} blur>
            <p className="mb-6 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.4em] text-cobam-quill-grey">
              Cobam Group · Tunisie
            </p>
          </PremiumReveal>

          <PremiumReveal delay={0.4} blur>
            <h1
              className="max-w-5xl text-5xl font-normal leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              L’architecture des matières
            </h1>
          </PremiumReveal>

          <PremiumReveal delay={0.6} blur>
            <p className="mx-auto mt-8 max-w-2xl text-base font-light tracking-wide text-white/80 sm:text-lg">
              Revêtements, sanitaires, matériaux techniques : nous orchestrons des
              univers complets pour bâtir des espaces raffinés et inspirants.
            </p>
          </PremiumReveal>

          <PremiumReveal delay={0.8} blur>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Magnetic strength={30}>
                <Link
                  href="/produits"
                  className="group relative overflow-hidden rounded-full bg-white px-8 py-4 text-sm uppercase tracking-widest text-[#14202e] transition-transform duration-300 hover:scale-105 inline-block"
                >
                  <div className="relative z-10 font-semibold">Nos produits</div>
                </Link>
              </Magnetic>
              <Magnetic strength={15}>
                <Link
                  href="/contact"
                  className="group relative overflow-hidden rounded-full border border-white/30 bg-transparent px-8 py-4 text-sm uppercase tracking-widest text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-[#14202e] inline-block"
                >
                  <div className="relative z-10 font-semibold">Nous Contacter</div>
                </Link>
              </Magnetic>
            </div>
          </PremiumReveal>
        </div>
      </section>

      {/* MANIFESTO / STATS */}
      <section id="section-manifesto" className="relative border-b border-cobam-quill-grey/30 bg-cobam-light-bg pt-24 sm:pt-32 sm:pb-16">
        <div className="absolute top-1/4 w-full opacity-[0.03] pointer-events-none z-0">
          <VelocityMarquee baseVelocity={1.5} className="text-[12rem] uppercase font-playfair text-[#14202e]">
            L'architecture des matières — Cobam Group —
          </VelocityMarquee>
        </div>
        <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10 min-h-[140vh]">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16 relative">
            <div className="lg:w-1/2 lg:sticky lg:top-40 mb-16 lg:mb-0">
              <PremiumReveal direction="up" blur>
                <h2
                  className="text-4xl leading-tight sm:text-5xl lg:text-6xl"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Le luxe réside dans <br /> l'exigence du détail.
                </h2>
                <div className="mt-8 h-[1px] w-16 bg-cobam-water-blue" />
                <p className="mt-8 max-w-lg text-lg leading-relaxed text-cobam-carbon-grey">
                  Cobam Group est le partenaire de référence pour l'aménagement et
                  la décoration d'espaces de prestige en Tunisie. Depuis des
                  décennies, nous sélectionnons des matériaux exceptionnels.
                </p>
              </PremiumReveal>
            </div>

            <div className="lg:w-1/2 lg:pt-[50vh]">
              <PremiumReveal direction="left" delay={0.2} blur>
                <div className="grid grid-cols-2 gap-x-8 gap-y-24">
                  {stats.map((stat, i) => (
                    <div key={stat.label} className="border-l border-cobam-quill-grey pl-6 transition-colors hover:border-cobam-water-blue bg-cobam-light-bg/80 backdrop-blur-sm py-4">
                      <p className="text-4xl font-light text-cobam-dark-blue">{stat.value}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cobam-carbon-grey">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </PremiumReveal>
            </div>
          </div>
        </div>
      </section>

      {/* UNIVERSES - Asymmetric Masonry / Staggered */}
      <section id="section-universes" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <PremiumReveal direction="up">
            <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="w-1/2">
                <p className="text-[10px] uppercase tracking-[0.4em] text-cobam-carbon-grey">
                  Les Univers
                </p>
                <div className="-mt-8">
                  <ScrollRevealText
                    className="mt-4 text-4xl sm:text-5xl"
                    text="Une collection complète."
                  />
                </div>
              </div>
              <AnimatedUIButton
                size="md"
                variant="outline-dark"
                icon="arrow-right"
                href="/produits"
              >
                Voir tout le catalogue
              </AnimatedUIButton>
            </div>
          </PremiumReveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            {categories.map((world, index) => {
              const pattern = [
                { colSpan: "lg:col-span-8", height: "aspect-[16/10]" },
                { colSpan: "lg:col-span-4", height: "aspect-[4/5]" },
                { colSpan: "lg:col-span-4", height: "aspect-[4/5]" },
                { colSpan: "lg:col-span-5", height: "aspect-[5/6]" },
                { colSpan: "lg:col-span-7", height: "aspect-[21/10]" },
                { colSpan: "lg:col-span-4", height: "aspect-[4/5]" },
              ];

              const shape = pattern[index % pattern.length];
              const colSpan = shape.colSpan;
              const height = shape.height;

              return (
                <PremiumReveal
                  key={world.title}
                  delay={index * 0.1}
                  direction="up"
                  className={cn("group", colSpan)}
                >
                  <Link href={world.href} className="block h-full w-full">
                    <div className={cn("relative overflow-hidden w-full", height)}>
                      <PremiumImageWrapper className="absolute inset-0">
                        <ParallaxImage
                          src={world.image}
                          alt={world.title}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </PremiumImageWrapper>
                      <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80" />

                      <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-8 text-white">
                        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/70 transition-transform duration-500 group-hover:-translate-y-1">
                          {world.subtitle}
                        </p>
                        <h3
                          className="text-2xl font-light tracking-wide transition-transform duration-500 group-hover:-translate-y-1 sm:text-3xl"
                          style={{ fontFamily: "var(--font-playfair), serif" }}
                        >
                          {world.title}
                        </h3>
                        {/* A very sleek subtle arrow that slides in on hover, using category color */}
                        <div
                          className="mt-4 h-[1px] w-0 opacity-0 transition-all duration-500 group-hover:w-12 group-hover:opacity-100"
                          style={{ backgroundColor: world.color }}
                        />
                      </div>
                    </div>
                  </Link>
                </PremiumReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT US QUICK BANNER - Sticky Heritage */}
      <section id="section-about" className="relative border-y border-cobam-quill-grey/30 bg-white overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-0">
            
            {/* Left Side: Sticky Title */}
            <div className="py-24 lg:py-0 lg:h-screen lg:flex lg:items-center lg:sticky lg:top-0">
               <div className="w-full">
                  <PremiumReveal blur direction="right">
                    <p className="text-cobam-water-blue text-xs uppercase tracking-[0.4em] font-semibold mb-6">Notre Histoire</p>
                      <h2
                        className="text-4xl leading-tight sm:text-5xl lg:text-6xl"
                        style={{ fontFamily: "var(--font-playfair), serif" }}
                      >
                        Notre Héritage,<br /> Votre Futur.
                      </h2>
                    <div className="mt-12 h-[1px] w-24 bg-cobam-water-blue/40" />
                  </PremiumReveal>
               </div>
            </div>

            {/* Right Side: Scrolling Content */}
            <div className="pb-24 lg:py-[30vh] space-y-32 text-cobam-carbon-grey font-light">
              <PremiumReveal blur delay={0.2} direction="up">
                <div className="space-y-12">
                  <p className="text-2xl sm:text-3xl leading-relaxed text-[#14202e] font-normal">
                    Depuis 1994, Cobam Group orchestre l'excellence architecturale en Tunisie. 
                  </p>
                  <p className="text-lg leading-relaxed max-w-xl">
                    Notre mission est de transformer chaque espace en un sanctuaire de raffinement. 
                    De la céramique d'avant-garde aux systèmes de confort thermique les plus sophistiqués, 
                    notre catalogue est une invitation à la perfection technique.
                  </p>
                </div>
                <div className="pt-8">
                  <AnimatedUIButton href="/notre-histoire" variant="primary" icon="arrow-right" size="xl">
                    Explorer notre univers
                  </AnimatedUIButton>
                </div>
              </PremiumReveal>
            </div>

          </div>
        </div>
      </section>

      {/* NOS COLLECTIONS SECTION - Mosaic / Grid */}
      <section id="section-nos-collections" className="bg-[#14202e] py-32 text-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-4">Inspiration</p>
              <h2 className="font-playfair text-4xl sm:text-6xl lg:text-7xl">Nos Collections</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { img: "faedo-marbre-blanc-353x353.jpg", label: "Marbre d'Exception" },
              { img: "carrelage-piscine-353x353.jpg", label: "Univers Aquatiques" },
              { img: "decor-bois-naturel-353x353.jpg", label: "Bois Chauds" },
              { img: "tessino-gris-353x353.jpg", label: "Textures Urbaines" },
              { img: "vasque-ovale-premium-353x353.jpg", label: "Pureté Sanitaire" },
              { img: "amb-arenisca-perla-353x353.jpg", label: "Sols Techniques" },
              { img: "colonne-douche-thermostat-353x353.jpg", label: "Ingénierie de l'eau" },
              { img: "mitigeur-cascade-353x353.jpg", label: "Finitions Design" },
            ].map((item, idx) => (
              <PremiumReveal key={item.img} delay={idx * 0.05} blur>
                <div className="group relative aspect-square overflow-hidden rounded-sm">
                  <Image
                    src={`/images/collections/${item.img}`}
                    alt={item.label}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:blur-[2px]"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100 flex items-center justify-center p-4 text-center">
                    <p className="text-sm font-semibold uppercase tracking-widest translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                      {item.label}
                    </p>
                  </div>
                </div>
              </PremiumReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ACTUALITES BANNER - Quick highlights */}
      <section id="section-actualites" className="relative border-y border-cobam-quill-grey/30 bg-cobam-light-bg py-24 sm:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.4em] text-cobam-carbon-grey mb-4">Actualités</p>
              <h2 className="font-playfair text-4xl sm:text-5xl lg:text-6xl">Le Mag Cobam</h2>
            </div>
            <AnimatedUIButton href="/actualites" variant="outline" icon="arrow-right">
              Lire tout le mag
            </AnimatedUIButton>
          </div>
          <div className="grid gap-12 lg:grid-cols-2">
            {featuredArticles.length > 0 ? (
              featuredArticles.map((article, idx) => (
                <PremiumReveal key={article.id} delay={idx * 0.2} blur direction={idx % 2 === 0 ? "right" : "left"}>
                  <Link href={`/actualites/${article.slug}`} className="group relative flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-sm shadow-sm transition-all hover:shadow-xl">
                    <div className="relative aspect-square w-full sm:w-48 shrink-0 overflow-hidden">
                      <Image
                        src={article.coverImageThumbnailUrl || "/images/placeholders/article.jpg"}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-col justify-between py-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-cobam-water-blue mb-2">
                          {article.categories[0]?.name || "Article"}
                        </p>
                        <h3 className="font-playfair text-xl lg:text-2xl mb-4 group-hover:text-cobam-water-blue transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-cobam-carbon-grey line-clamp-2 font-light">
                          {article.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mt-4">
                        <span>Découvrir</span>
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </PremiumReveal>
              ))
            ) : (
              <div className="lg:col-span-2 py-20 bg-white/50 border border-dashed border-cobam-quill-grey text-center rounded-sm">
                <p className="font-playfair text-2xl text-cobam-carbon-grey italic">Coming Soon...</p>
                <p className="text-xs uppercase tracking-widest mt-2 text-cobam-carbon-grey/60">Le catalogue s'articule, nos récits arrivent.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SHOWROOMS SECTION */}
      <section id="section-showrooms" className="relative bg-white py-24 sm:py-32 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <PremiumReveal blur>
            <SectionHeader 
              preTitle="Proximité"
              title="Visitez Nos Showrooms"
              description="Venez découvrir l'excellence de nos matières et le savoir-faire de nos experts dans l'un de nos quatre points de vente en Tunisie."
              centered
            />
          </PremiumReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mt-20">
            <PremiumReveal delay={0.1} blur direction="up">
              <ShowroomCard location="houmt-souk" index={0} />
            </PremiumReveal>
            <PremiumReveal delay={0.2} blur direction="up">
              <ShowroomCard location="centrale" index={1} />
            </PremiumReveal>
            <PremiumReveal delay={0.3} blur direction="up">
              <ShowroomCard location="ceram" index={2} />
            </PremiumReveal>
            <PremiumReveal delay={0.4} blur direction="up">
              <ShowroomCard location="midoun" index={3} />
            </PremiumReveal>
          </div>
        </div>
      </section>

      {/* SUIVEZ-NOUS BANNER */}
      <section id="section-suivez-nous" className="relative bg-[#14202e] py-32 text-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <VelocityMarquee baseVelocity={1} className="text-[15rem] uppercase font-bold text-white">
            Stay Inspired — Follow @CobamGroup — Stay Inspired —
          </VelocityMarquee>
        </div>
        <div className="relative z-10 container mx-auto px-6">
          <PremiumReveal blur>
            <h2 className="font-playfair text-4xl sm:text-6xl mb-12">Suivez notre inspiration</h2>
            <div className="flex justify-center gap-8 sm:gap-16 flex-wrap">
              {[
                { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
                { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
                { icon: FaPinterest, label: "Pinterest", href: "https://pinterest.com" },
                { icon: FaTiktok, label: "TikTok", href: "https://tiktok.com" },
                { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
              ].map((social, idx) => (
                <Magnetic key={social.label} strength={20}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-4 group"
                  >
                    <div className="p-4 sm:p-6 rounded-full border border-white/10 bg-white/5 transition-all group-hover:bg-cobam-water-blue group-hover:border-cobam-water-blue">
                      <social.icon size={28} />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 group-hover:text-white">
                      {social.label}
                    </span>
                  </a>
                </Magnetic>
              ))}
            </div>
          </PremiumReveal>
        </div>
      </section>

      {/* PARTNERS & REFERENCES */}
      <section id="section-partners" className="bg-cobam-light-bg py-24 shadow-inner sm:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <PremiumReveal direction="up" blur>
            <div className="mb-16 text-center">
              <h2
                className="text-3xl sm:text-4xl"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Partenaires de prestige
              </h2>
            </div>
          </PremiumReveal>

          <PremiumReveal delay={0.2} direction="up" blur>
            <div className="opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
              <BrandSlider href="/partenaires" brands={PARTNER_BRANDS} />
            </div>
          </PremiumReveal>

          <PremiumReveal delay={0.3} direction="up" blur className="mt-24">
            <div className="mb-16 text-center">
              <h2
                className="text-3xl sm:text-4xl"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Ils nous font confiance
              </h2>
            </div>
            <div className="opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
              <BrandSlider href="/references" brands={REFERENCE_BRANDS} />
            </div>
          </PremiumReveal>
        </div>
      </section>
    </main>
  );
}
