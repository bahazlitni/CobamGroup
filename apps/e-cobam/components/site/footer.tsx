import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import type { LandingCategory } from "@/lib/home-data";

export function SiteFooter({ categories }: { categories: LandingCategory[] }) {
  return (
    <footer className="border-t border-ec-line bg-white text-ec-ink">
      <div className="mx-auto max-w-[92rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div>
            <p className="text-2xl font-black tracking-[0.18em]">COBAM</p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.26em] text-ec-blue">
              e-commerce
            </p>
            <p className="mt-5 max-w-sm text-sm leading-7 text-ec-muted">
              Une boutique reliée au catalogue COBAM GROUP pour sélectionner matériaux,
              sanitaires, revêtements, peintures, finitions et produits techniques.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-ec-ink">
              Catalogue
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {categories.slice(0, 7).map((category) => (
                <Link
                  key={category.slug}
                  href={category.href}
                  className="text-sm text-ec-muted transition hover:text-ec-ink"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-ec-ink">
              Service
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              <Link href="/panier" className="text-sm text-ec-muted transition hover:text-ec-ink">
                Panier
              </Link>
              <Link href="/catalogue" className="text-sm text-ec-muted transition hover:text-ec-ink">
                Tous les produits
              </Link>
              <Link href="/compte" className="text-sm text-ec-muted transition hover:text-ec-ink">
                Compte client
              </Link>
              <a href="mailto:contact@cobamgroup.com" className="text-sm text-ec-muted transition hover:text-ec-ink">
                Demander un devis
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-ec-ink">
              Contact
            </h2>
            <div className="mt-5 space-y-4 text-sm text-ec-muted">
              <p className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-ec-blue" />
                Djerba, Tunisie
              </p>
              <a href="mailto:contact@cobamgroup.com" className="flex gap-3 transition hover:text-ec-ink">
                <Mail className="mt-0.5 size-4 shrink-0 text-ec-blue" />
                contact@cobamgroup.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ec-line pt-6 text-xs text-ec-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} COBAM GROUP. Tous droits réservés.</p>
          <p>Catalogue e-commerce connecté à la base COBAM GROUP.</p>
        </div>
      </div>
    </footer>
  );
}
