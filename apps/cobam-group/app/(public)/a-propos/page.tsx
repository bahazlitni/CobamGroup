"use client"

import Timeline from "@/components/public/a-propos/Timeline";
import TeamCarousel, { TeamMemberCard } from "@/components/public/a-propos/TeamCarousel";
import AntigravityVideo from "@/components/ui/custom/AntigravityVideo";
import PageHeader from "@/components/ui/custom/PageHeader";
import { PremiumReveal } from "@/components/ui/custom/PremiumReveal";
import SectionHeader from "@/components/ui/custom/SectionHeader";
import { Target, Eye, ShieldCheck, Zap, Trophy, Heart } from "lucide-react";
import { notreEquipe, getTeamMemberFullname } from "@/data/notre-equipe";

const values = [
  {
    title: "Fiabilité",
    description: "Des matériaux qui répondent aux normes les plus strictes pour des solutions durables et sûres.",
    icon: ShieldCheck,
  },
  {
    title: "Engagement",
    description: "Des décennies d'engagement à accompagner nos clients de la sélection à la mise en œuvre.",
    icon: Heart,
  },
  {
    title: "Qualité",
    description: "Des contrôles rigoureux conformes aux certifications internationales les plus exigeantes.",
    icon: Trophy,
  },
  {
    title: "Innovation",
    description: "Investissement continu en R&D pour des matériaux innovants qui allient efficacité et esthétique.",
    icon: Zap,
  },
];

const stats = [
  { value: "31+", label: "Ans d'expertise" },
  { value: "97%", label: "Satisfaction client" },
  { value: "ISO 9001", label: "Certifié Qualité" },
  { value: "5000+", label: "Produits référencés" },
];

export default function AboutUsPage() {
  const vipMembers = notreEquipe.filter(m => m.isVIP);

  return (
    <main className="bg-cobam-light-bg text-cobam-dark-blue min-h-screen">
      {/* 1. Header */}
      <PageHeader 
        subtitle="Notre Histoire" 
        title="Depuis 1994, bâtissons ensemble" 
        description="COBAM GROUP est un acteur clé dans la vente de matériaux de construction, carrelage, faïence, revêtements muraux, sanitaires et robinetterie, avec plusieurs implantations à travers la Tunisie. Notre mission est d'accompagner chaque projet avec des produits de qualité et un service irréprochable." 
      />

      {/* 2. Cinematic Video and Timeline */}
      <section className="bg-white flex flex-col pt-0">
        <AntigravityVideo src="/videos/notre-histoire/index.mp4" width={1920} description="Cette vidéo de plus d'une minute décrit l'histoire de Cobam Group." />
        <div className="container mx-auto mt-24 mb-24 px-6 lg:px-8">
            <Timeline />
        </div>
      </section>

      {/* 3. Identity Section (Manifesto Style) */}
      <section className="py-24 sm:py-32 overflow-hidden bg-white border-y border-cobam-quill-grey/10">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2">
              <PremiumReveal blur direction="right">
                <p className="text-cobam-water-blue text-xs uppercase tracking-[0.4em] font-semibold mb-6">Manifeste</p>
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-playfair leading-tight mb-8">L&apos;excellence comme seule norme.</h2>
                <div className="h-px w-24 bg-cobam-water-blue/40 mb-12" />
              </PremiumReveal>
            </div>
            <div className="lg:w-1/2 lg:pt-20">
              <PremiumReveal blur delay={0.2}>
                <p className="text-xl sm:text-2xl leading-relaxed text-cobam-carbon-grey font-light">
                  Chez Cobam Group, nous ne distribuons pas seulement des matériaux. Nous façonnons des environnements. 
                  Notre identité s&apos;est forgée sur la conviction que chaque détail, de la plus petite robinetterie au 
                  plus grand carreau de céramique, participe à l&apos;âme d&apos;un bâtiment.
                </p>
                <p className="mt-8 text-lg leading-relaxed text-cobam-carbon-grey/80 font-light">
                  Nous sélectionnons nos partenaires avec une rigueur absolue, privilégiant l&apos;innovation technique 
                  et le raffinement esthétique pour offrir à nos clients tunisiens le meilleur du design mondial.
                </p>
              </PremiumReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Purpose Section (Mission & Vision) */}
      <section className="py-24 sm:py-32 bg-cobam-light-bg">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <PremiumReveal blur direction="up">
              <div className="group bg-white p-12 rounded-[2.5rem] shadow-sm border border-cobam-quill-grey/20 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-8 p-4 bg-cobam-water-blue/5 rounded-lg w-fit group-hover:bg-cobam-water-blue group-hover:text-white transition-colors">
                  <Target size={32} />
                </div>
                <h3 className="text-3xl font-playfair mb-6">Notre Mission</h3>
                <p className="text-lg leading-relaxed text-cobam-carbon-grey font-light">
                  Proposer des matériaux de construction haut de gamme alliant innovation, qualité et durabilité, 
                  tout en accompagnant chaque projet par un service d&apos;exception où chaque détail compte.
                </p>
              </div>
            </PremiumReveal>

            <PremiumReveal blur direction="up" delay={0.2}>
              <div className="group bg-white p-12 rounded-[2.5rem] shadow-sm border border-cobam-quill-grey/20 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="mb-8 p-4 bg-cobam-water-blue/5 rounded-lg w-fit group-hover:bg-cobam-water-blue group-hover:text-white transition-colors">
                  <Eye size={32} />
                </div>
                <h3 className="text-3xl font-playfair mb-6">Notre Vision</h3>
                <p className="text-lg leading-relaxed text-cobam-carbon-grey font-light">
                  Devenir le leader incontesté des matériaux premium en Tunisie, en créant des espaces où design, 
                  performance et intemporalité se rencontrent pour inspirer les générations futures.
                </p>
              </div>
            </PremiumReveal>
          </div>
        </div>
      </section>

      {/* 5. Values Section */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <PremiumReveal blur>
            <SectionHeader 
              preTitle="Nos Piliers"
              title="Les Valeurs qui nous Animent"
              description="Quatre principes fondamentaux qui guident chacune de nos décisions et garantissent la pérennité de notre excellence."
              centered
            />
          </PremiumReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            {values.map((val, idx) => (
              <PremiumReveal key={val.title} delay={idx * 0.1} blur direction="up">
                <div className="flex flex-col items-center text-center p-8 bg-cobam-light-bg rounded-[2rem] border border-cobam-quill-grey/10 group hover:bg-cobam-dark-blue transition-colors duration-500">
                  <div className="mb-6 p-4 bg-white rounded-full text-cobam-water-blue group-hover:scale-110 transition-transform duration-500">
                    <val.icon size={28} />
                  </div>
                  <h4 className="text-xl font-bold mb-4 group-hover:text-white transition-colors">{val.title}</h4>
                  <p className="text-sm leading-relaxed text-cobam-carbon-grey group-hover:text-white/70 transition-colors">
                    {val.description}
                  </p>
                </div>
              </PremiumReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Stats Section */}
      <section className="py-24 bg-cobam-dark-blue text-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-[0.03] pointer-events-none text-[12rem] font-playfair whitespace-nowrap">
          COBAM GROUP EST.1994
        </div>
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <PremiumReveal key={stat.label} delay={idx * 0.1} blur>
                <div className="text-center group">
                  <p className="text-5xl lg:text-7xl font-light mb-4 text-cobam-water-blue group-hover:scale-110 transition-transform duration-500">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/50">{stat.label}</p>
                </div>
              </PremiumReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Team/Leadership Section */}
      <section className="py-24 sm:py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8">
          <PremiumReveal blur>
            <SectionHeader 
              preTitle="Notre Capital Humain"
              title="Direction & Équipes"
              description="Une synergie d&apos;expertises au service de vos projets les plus ambitieux."
              centered
            />
          </PremiumReveal>

          {/* VIP Section (Static Cards) */}
          {vipMembers.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8 mt-16 mb-24">
              {vipMembers.map((vip, idx) => (
                <PremiumReveal
                  key={getTeamMemberFullname(vip)}
                  delay={idx * 0.1}
                  blur
                  direction="up"
                  className="w-full max-w-[300px] sm:w-[300px]"
                >
                   <TeamMemberCard member={vip} isStatic={true} />
                </PremiumReveal>
              ))}
            </div>
          )}

          <TeamCarousel />
        </div>
      </section>
    </main>
  );
}
