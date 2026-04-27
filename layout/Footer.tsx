"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  COBAM_CONTACT_DETAILS,
  COBAM_SOCIAL_LINKS,
  getPhoneHref,
} from "@/data/contact-details";
import type { PublicMegaMenuProductCategory } from "@/features/product-categories/public-types";
import Magnetic from "@/components/ui/custom/Magnetic";

const discoverLinks = [
  { label: "À propos de nous", href: "/a-propos" },
  { label: "Nos agences", href: "/#nos-agences" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Références", href: "/references" },
  { label: "Actualités", href: "/actualites" },
];

const legalLinks = [
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Conditions générales", href: "/conditions-generales" },
];

const slogans = ["Depuis 1994", "Maisons de rêve"];

export default function Footer({
  productCategories,
}: {
  productCategories: PublicMegaMenuProductCategory[];
}) {
  const [sloganIndex, setSloganIndex] = useState(0);
  const [sloganVisible, setSloganVisible] = useState(true);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSloganVisible(false);
      window.setTimeout(() => {
        setSloganIndex((current) => (current + 1) % slogans.length);
        setSloganVisible(true);
      }, 400);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  const categoryLinks = productCategories
    .filter((category) => category.parent === null)
    .map((category) => ({
      label: category.title,
      href: category.href,
    }));

  return (
    <footer id="contact" className="relative overflow-hidden bg-cobam-dark-blue pt-20 sm:pt-28 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Brand & Intro */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" aria-label="Cobam Group - Accueil" className="inline-block">
              <Image
                src="/images/logos/cobam-group/logo-vector-sinceless-white.svg"
                alt="COBAM GROUP"
                width={843}
                height={289}
                className="h-10 sm:h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            
            <div className="h-7 overflow-hidden -mt-2">
              <p
                className="text-md font-semibold text-cobam-water-blue"
                style={{
                  opacity: sloganVisible ? 1 : 0,
                  transform: sloganVisible ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
              >
                {slogans[sloganIndex]}
              </p>
            </div>

            <p className="text-white/60 font-light leading-relaxed max-w-sm">
              Matériaux de construction haut de gamme alliant innovation, qualité et durabilité. Depuis 1994, Cobam Group est le partenaire privilégié des projets résidentiels et professionnels les plus ambitieux en Tunisie.
            </p>
            
            {/* Socials */}
            <div className="flex gap-3 mt-2">
              {COBAM_SOCIAL_LINKS.map((social) => (
                <Magnetic key={social.label} strength={10}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:scale-110 hover:border-cobam-water-blue hover:bg-cobam-water-blue hover:text-white"
                  >
                    <social.Icon size={18} strokeWidth={1.5} />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-3 lg:col-start-5">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white mb-8">
              Catalogue
            </h4>
            <ul className="flex flex-col gap-4">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/60 font-light transition-colors hover:text-cobam-water-blue inline-flex items-center group">
                    <span className="relative overflow-hidden">
                      <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">{link.label}</span>
                      <span className="inline-block absolute left-0 top-full transition-transform duration-300 group-hover:-translate-y-full text-cobam-water-blue">{link.label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white mb-8">
              Découvrir
            </h4>
            <ul className="flex flex-col gap-4">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/60 font-light transition-colors hover:text-cobam-water-blue inline-flex items-center group">
                    <span className="relative overflow-hidden">
                      <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">{link.label}</span>
                      <span className="inline-block absolute left-0 top-full transition-transform duration-300 group-hover:-translate-y-full text-cobam-water-blue">{link.label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white mb-8">
              Contact
            </h4>
            <ul className="flex flex-col gap-6 text-white/60 font-light">
              <li>
                <a href={getPhoneHref(COBAM_CONTACT_DETAILS.phoneFixed)} className="group flex items-start gap-4 transition-colors hover:text-white">
                  <div className="mt-1 rounded-full bg-white/5 p-2 transition-colors group-hover:bg-cobam-water-blue/20 group-hover:text-cobam-water-blue">
                    <Phone size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Téléphone</span>
                    <span className="text-sm">{COBAM_CONTACT_DETAILS.phoneFixed}</span>
                  </div>
                </a>
              </li>
              <li>
                <a href={`mailto:${COBAM_CONTACT_DETAILS.email}`} className="group flex items-start gap-4 transition-colors hover:text-white">
                  <div className="mt-1 rounded-full bg-white/5 p-2 transition-colors group-hover:bg-cobam-water-blue/20 group-hover:text-cobam-water-blue">
                    <Mail size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 mb-1">E-mail</span>
                    <span className="text-sm">{COBAM_CONTACT_DETAILS.email}</span>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 rounded-full bg-white/5 p-2 text-white/60">
                  <MapPin size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Siège Social</span>
                  <span className="text-sm leading-relaxed max-w-[200px]">Houmt Souk, Djerba<br />Tunisie</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Massive Typography Bottom */}
      <div className="w-full overflow-hidden flex justify-center items-end mt-12 mb-8 select-none pointer-events-none opacity-5">
        <h2 className="text-[18vw] leading-none font-bold tracking-tighter" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
          COBAM
        </h2>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-white/40 font-light">
            <p>© {new Date().getFullYear()} Cobam Group. Tous droits réservés.</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {legalLinks.map((legalLink) => (
                <Link 
                  key={legalLink.label} 
                  href={legalLink.href} 
                  className="transition-colors hover:text-white"
                >
                  {legalLink.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
