"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FooterColumn from "@/components/ui/custom/FooterColumn";
import { Mail, MapPin, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { PublicMegaMenuProductCategory } from "@/features/product-categories/public-types";
import {
  COBAM_CONTACT_DETAILS,
  COBAM_OPENING_HOURS,
  COBAM_SOCIAL_LINKS,
  getPhoneHref,
  getWhatsAppHref,
} from "@/data/contact-details";
import FooterLink from "@/components/ui/custom/FooterLink";

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
    <footer id="contact" className="bg-cobam-dark-blue pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1.5fr_1fr_1fr]">
          <div className="flex flex-col gap-5 items-center">
            <Link href="/" aria-label="Cobam Group - Accueil">
              <Image
                src="/images/logos/cobam-group/logo-vector-sinceless-white.svg"
                alt="COBAM GROUP"
                width={843}
                height={289}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <div className="h-7 overflow-hidden">
              <p
                className="text-center text-md font-semibold text-cobam-water-blue"
                style={{
                  opacity: sloganVisible ? 1 : 0,
                  transform: sloganVisible ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
              >
                {slogans[sloganIndex]}
              </p>
            </div>

            <p className="max-w-xs text-sm leading-6 text-white/60 text-center">
              Matériaux de construction haut de gamme alliant innovation, qualité et durabilité.
            </p>

            <div className="max-w-fit grid grid-cols-6 gap-3">
              {COBAM_SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="grid size-9 place-items-center rounded-full border border-white/10 text-white/55 transition-colors hover:border-cobam-water-blue hover:text-cobam-water-blue"
                >
                  <social.Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Catalogue" links={categoryLinks} />
          <FooterColumn title="Decouvrir" links={discoverLinks} />

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white">
              Contact
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-cobam-water-blue" />
                <span>Siege social, Houmt Souk, Djerba, Tunisie</span>
              </li>
              <li>
                <a
                  href={getPhoneHref(COBAM_CONTACT_DETAILS.phoneFixed)}
                  className="flex items-center gap-2 transition-colors hover:text-cobam-water-blue"
                >
                  <Phone size={14} className="shrink-0 text-cobam-water-blue" />
                  Tel : {COBAM_CONTACT_DETAILS.phoneFixed}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${COBAM_CONTACT_DETAILS.email}`}
                  className="flex items-center gap-2 transition-colors hover:text-cobam-water-blue"
                >
                  <Mail size={14} className="shrink-0 text-cobam-water-blue" />
                  {COBAM_CONTACT_DETAILS.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Cobam Group. Tous droits réservés.</p>
          <div className="inline-flex flex-wrap gap-4">
            {legalLinks.map((legalLink, i: number) => 
            <FooterLink key={i} label={legalLink.label} href={legalLink.href}/>
          )}
          </div>
        </div>
      </div>
    </footer>
  );
}
