import HeroSlider from "@/layout/HeroSlider";
import SectionHeader from "@/components/ui/custom/SectionHeader";
import ProductCard from "@/components/ui/custom/ProductCard";
import StatBadge from "@/components/ui/custom/StatBadge";
import TestimonialCard from "@/components/ui/custom/TestimonialCard";
import ShowroomCard from "@/components/ui/custom/ShowroomCard";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import BrandSlider from "@/components/ui/custom/BrandSlider";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { listPublicBrandShowcaseData } from "@/features/brands/public";
import SuivezNousSection from "@/layout/SuivezNousSection";
import { PatternLosangeOnWhiteVerticalBottomless } from "@/components/ui/custom/PatternLosange";

const newProducts = [
  { name: "AMB ARENISCA PERLA", category: "Sol Intérieur", imageUrl: "/images/collections/amb-arenisca-perla-353x353.jpg", href: "#" },
  { name: "FAEDO MARBRE BLANC", category: "Faïence Murale", imageUrl: "/images/collections/faedo-marbre-blanc-353x353.jpg", href: "#" },
  { name: "DÉCOR BOIS NATUREL", category: "Revêtements", imageUrl: "/images/collections/decor-bois-naturel-353x353.jpg", href: "#"},
  { name: "TESSINO GRIS CLAIR", category: "Sol Extérieur", imageUrl: "/images/collections/tessino-gris-353x353.jpg", href: "#" },
  { name: "VASQUE OVALE PREMIUM", category: "Sanitaire & Bain", imageUrl: "/images/collections/vasque-ovale-premium-353x353.jpg", href: "#" },
  { name: "MITIGEUR CASCADE", category: "Robinetterie", imageUrl: "/images/collections/mitigeur-cascade-353x353.jpg", href: "#" },
  { name: "CARRELAGE PISCINE", category: "Piscine & Mosaïque", imageUrl: "/images/collections/carrelage-piscine-353x353.jpg", href: "#" },
  { name: "COLONNE DOUCHE THERMOSTAT", category: "Robinetterie", imageUrl: "/images/collections/colonne-douche-thermostat-353x353.jpg", href: "#" },
];

const stats = [
  { value: "+30", label: "Ans d'expérience" },
  { value: "+5K", label: "Références produits" },
  { value: "4", label: "Showrooms à Djerba" },
  { value: "+1K", label: "Clients satisfaits" },
];

const testimonials = [
  {
    text: "Une équipe solide avec une grande confiance et professionnalisme au niveau du service.",
    author: "Lassad Ben Mimoun",
    rating: 5,
  },
  {
    text: "Un accueil très chaleureux et une équipe à l'écoute et très serviable. Je recommande vivement.",
    author: "Cyrine Dridi Ep Essid",
    rating: 5,
  },
  {
    text: "Excellent team and service. Very professional and high quality products.",
    author: "Bm Mouheb",
    rating: 5,
  },
  {
    text: "مشاء الله كل شيء رفيع .... بالتوفيق دائماً لهذا الفريق المتميز",
    author: "Sabra Bho",
    rating: 5,
  },
];

const showrooms = ["houmt-souk", "midoun", "centrale", "ceram"];

export const dynamic = "force-dynamic";

export default async function Home() {
  const { partners, references } = await listPublicBrandShowcaseData();

  return (
    <main className="bg-white text-cobam-dark-blue">
      <HeroSlider />

      {/* Stats Bar */}
      <section className="bg-cobam-dark-blue h-64 flex items-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat) => (
              <StatBadge key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>



      {/* New Collection */}
      <section className="relative py-24 bg-white">
          <PatternLosangeOnWhiteVerticalBottomless />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <SectionHeader
              preTitle="Nouveautés"
              title="Dernières Collections"
              description="Découvrez nos dernières arrivées et produits en promotion."
            />
            <AnimatedUIButton
              size="md"
              variant="ghost"
              href="#"
              icon="arrow-right"
            >
              Voir tout le catalogue
            </AnimatedUIButton>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((p) => (
              <ProductCard key={p.name} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* About Banner */}
      <section
        id="societe"
        className="py-24 bg-cobam-dark-blue relative overflow-hidden"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader
                preTitle="Notre Histoire"
                title="Depuis 1994, bâtissons ensemble"
                description="COBAM GROUP est un acteur clé dans la vente de matériaux de construction, carrelage, faïence, revêtements muraux, sanitaires et robinetterie, avec plusieurs implantations à travers la Tunisie. Notre mission est d'accompagner chaque projet avec des produits de qualité et un service irréprochable."
                titleTextColor="text-white"
                descriptionTextColor="text-cobam-quill-grey"
              />
              <AnimatedUIButton icon="plus" variant="primary" href="/notre-histoire">
                En savoir
              </AnimatedUIButton>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/logos/cobam-group/logo-vector-white.svg"
                alt="COBAM GROUP Histoire"
                width={843}
                height={289}
                className="object-cover w-full p-16"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-20 bg-cobam-light-bg">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <SectionHeader
            preTitle="Nos Partenaires"
            title="de Confiance"
            description="COBAM GROUP distribue les plus grandes marques internationales en Tunisie."
            centered
            voirPlusLink="/partenaires"
          />
          <BrandSlider href="/partenaires" brands={partners} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            preTitle="Nos Clients"
            title="de Prestige"
            description="Nous sommes fiers de collaborer avec des clients prestigieux qui font confiance à COBAM GROUP pour leurs projets de construction et de rénovation."
            centered
            voirPlusLink="/references"
          />
          <BrandSlider href="/references" brands={references} />
        </div>
      </section>


      <Separator />


      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            preTitle="Témoignages"
            title="Ce que disent nos clients"
            description="La satisfaction de nos clients est notre plus grande fierté."
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.author} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* Showrooms */}
      <section id="nos-agences" className="py-24 bg-cobam-light-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            preTitle="Nos Agences"
            title="Visitez nous"
            description="Venez découvrir nos espaces d'exposition et laissez-vous inspirer."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {showrooms.map((location) => (
              <ShowroomCard key={location} location={location} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="devis"
        className="py-24 bg-cobam-water-blue relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="w-96 h-96 rounded-full bg-white absolute -top-20 -right-20" />
          <div className="w-64 h-64 rounded-full bg-white absolute bottom-0 left-10" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/80 text-xs font-bold tracking-[0.3em] uppercase mb-4">
            Depuis 1994
          </p>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Réalisez votre projet avec nous
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Contactez nos experts pour une consultation gratuite et un devis personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AnimatedUIButton size="xl" icon="arrow-right" variant="dark" href="/notre-histoire">
                Demande de devis
              </AnimatedUIButton>
              <AnimatedUIButton size="xl" icon="arrow-right" variant="outline-dark" href="/notre-histoire">
                Voir tout le catalogue
              </AnimatedUIButton>
          </div>
        </div>
      </section>

      <SuivezNousSection />

    </main>
  );
}