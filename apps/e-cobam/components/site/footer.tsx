import Link from "next/link";
import {
  COBAM_BRAND,
  COBAM_CONTACT_DETAILS,
  COBAM_SOCIAL_LINKS,
  getPhoneHref,
} from "@cobam/shared";
import { Mail, MapPin, Phone } from "lucide-react";
import type { LandingCategory } from "@/lib/home-data";

const serviceLinks = [
  { href: "/suivi-commande", label: "Suivre une commande" },
  { href: "/panier", label: "Panier" },
  { href: "/compte", label: "Compte client" },
  { href: "/checkout", label: "Commander" },
];

const helpLinks = [
  { href: "/suivi-commande", label: "Livraison" },
  { href: "/suivi-commande", label: "Retours" },
  { href: "/conditions-generales", label: "Conditions" },
  { href: "/politique-de-confidentialite", label: "Confidentialité" },
];

const footerSocialLinks = COBAM_SOCIAL_LINKS.filter((social) =>
  ["Facebook", "Instagram", "LinkedIn"].includes(social.label),
);

export function SiteFooter({ categories }: { categories: LandingCategory[] }) {
  return (
    <footer className="border-t border-ec-line bg-white py-16 sm:py-24 text-ec-ink">
      <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-6">
            <span className="font-sans text-sm font-black tracking-[0.25em] uppercase text-ec-ink">
              COBAM GROUP
            </span>
            <p className="text-ec-muted text-xs font-semibold leading-relaxed max-w-sm">
              Sélection d&apos;excellence de matériaux de second œuvre, revêtements, sanitaires et finitions premium pour projets résidentiels et commerciaux.
            </p>
            <div className="space-y-3.5 text-xs font-semibold text-ec-muted">
              <a
                href={getPhoneHref(COBAM_CONTACT_DETAILS.phoneFixed)}
                className="hover:text-ec-ink flex items-center gap-2.5 transition duration-300"
              >
                <Phone className="text-ec-brass size-3.5 shrink-0 stroke-[1.5]" />
                {COBAM_CONTACT_DETAILS.phoneFixed}
              </a>
              <a
                href={`mailto:${COBAM_CONTACT_DETAILS.email}`}
                className="hover:text-ec-ink flex items-center gap-2.5 transition duration-300"
              >
                <Mail className="text-ec-brass size-3.5 shrink-0 stroke-[1.5]" />
                {COBAM_CONTACT_DETAILS.email}
              </a>
              <p className="flex items-center gap-2.5">
                <MapPin className="text-ec-brass size-3.5 shrink-0 stroke-[1.5]" />
                {COBAM_BRAND.baseLocation}
              </p>
            </div>
          </div>

          <FooterColumn title="Boutique" links={serviceLinks} />
          <FooterColumn title="Assistance" links={helpLinks} />

          <div>
            <span className="text-ec-ink text-xs font-black tracking-[0.2em] uppercase block mb-6">
              Collections
            </span>
            <div className="flex flex-col gap-3.5">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.slug}
                  href={category.href}
                  className="text-ec-muted hover:text-ec-ink text-xs font-semibold tracking-wide transition duration-300"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-ec-line text-ec-muted mt-16 pt-8 flex flex-col gap-4 text-[0.7rem] font-bold tracking-wider sm:flex-row sm:items-center sm:justify-between uppercase">
          <p>© {new Date().getFullYear()} {COBAM_BRAND.legalName}. Tous droits réservés.</p>
          <div className="flex gap-6">
            {footerSocialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ec-ink transition duration-300"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <span className="text-ec-ink text-xs font-black tracking-[0.2em] uppercase block mb-6">
        {title}
      </span>
      <div className="flex flex-col gap-3.5">
        {links.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="text-ec-muted hover:text-ec-ink text-xs font-semibold tracking-wide transition duration-300"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
