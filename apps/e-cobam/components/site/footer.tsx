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
    <footer className="border-ec-line text-ec-ink border-t bg-white">
      <div className="mx-auto max-w-[92rem] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr]">
          <div>
            <p className="text-xl font-black tracking-[0.18em]">ECOMMERCE</p>
            <p className="text-ec-muted mt-4 max-w-sm text-sm leading-6 font-semibold">
              Produits, panier, commandes et suivi client.
            </p>
            <div className="text-ec-muted mt-5 space-y-3 text-sm font-semibold">
              <a
                href={getPhoneHref(COBAM_CONTACT_DETAILS.phoneFixed)}
                className="hover:text-ec-ink flex gap-3 transition"
              >
                <Phone className="text-ec-blue mt-0.5 size-4 shrink-0" />
                {COBAM_CONTACT_DETAILS.phoneFixed}
              </a>
              <a
                href={`mailto:${COBAM_CONTACT_DETAILS.email}`}
                className="hover:text-ec-ink flex gap-3 transition"
              >
                <Mail className="text-ec-blue mt-0.5 size-4 shrink-0" />
                {COBAM_CONTACT_DETAILS.email}
              </a>
              <p className="flex gap-3">
                <MapPin className="text-ec-blue mt-0.5 size-4 shrink-0" />
                {COBAM_BRAND.baseLocation}
              </p>
            </div>
          </div>

          <FooterColumn title="Service client" links={serviceLinks} />
          <FooterColumn title="Aide" links={helpLinks} />

          <div>
            <h2 className="text-ec-ink text-sm font-black tracking-[0.18em] uppercase">
              Catégories
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.slug}
                  href={category.href}
                  className="text-ec-muted hover:text-ec-ink text-sm font-semibold transition"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-ec-line text-ec-muted mt-10 flex flex-col gap-4 border-t pt-6 text-xs font-semibold sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COBAM_BRAND.legalName}. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            {footerSocialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ec-ink transition"
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
      <h2 className="text-ec-ink text-sm font-black tracking-[0.18em] uppercase">{title}</h2>
      <div className="mt-5 flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="text-ec-muted hover:text-ec-ink text-sm font-semibold transition"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
