import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Headphones,
  Layers3,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { formatCompactNumber, formatPriceTnd } from "@/lib/format";
import type {
  LandingBrand,
  LandingCategory,
  LandingHomeData,
  LandingProduct,
  LandingProductsState,
} from "@/lib/home-data";

function firstReadyItems(primary: LandingProductsState, fallback: LandingProductsState) {
  if (primary.status === "ready" && primary.items.length > 0) {
    return primary.items;
  }

  return fallback.status === "ready" ? fallback.items : [];
}

function productCountLabel(value: number | null) {
  if (value == null) {
    return "Catalogue";
  }

  if (value === 0) {
    return "Catégorie";
  }

  return `${formatCompactNumber(value)} produits`;
}

function findCategory(categories: LandingCategory[], patterns: string[]) {
  return (
    categories.find((category) =>
      patterns.some((pattern) =>
        `${category.name} ${category.subtitle ?? ""} ${category.description ?? ""}`
          .toLocaleLowerCase("fr")
          .includes(pattern),
      ),
    ) ?? categories[0]
  );
}

function StockPill({ stock }: { stock: LandingProduct["stock"] }) {
  const tone =
    stock.tone === "available"
      ? "bg-emerald-50 text-emerald-700"
      : stock.tone === "warning"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-black ${tone}`}>
      <PackageCheck className="size-3" aria-hidden="true" />
      {stock.label}
    </span>
  );
}

function SearchPanel({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action="/catalogue"
      className={`ecom-search-panel grid gap-2 border border-ec-line bg-white p-2 sm:grid-cols-[1fr_auto] ${
        compact ? "" : "mt-6"
      }`}
    >
      <label className="flex h-12 items-center gap-3 px-3">
        <Search className="size-5 shrink-0 text-ec-blue" aria-hidden="true" />
        <span className="sr-only">Rechercher dans le catalogue</span>
        <input
          name="search"
          type="search"
          placeholder="Produit, marque, SKU, matière..."
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ec-ink outline-none placeholder:text-ec-muted/68"
        />
      </label>
      <button className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ec-blue px-5 text-sm font-black text-white transition hover:bg-ec-ink">
        Rechercher
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}

function CommerceProductCard({
  product,
  priority = false,
  compact = false,
}: {
  product: LandingProduct;
  priority?: boolean;
  compact?: boolean;
}) {
  const price = formatPriceTnd(product.price);
  const image = product.image?.thumbnailUrl ?? product.image?.url ?? null;

  return (
    <Link
      href={product.href}
      className="group flex h-full min-w-[14rem] flex-col overflow-hidden rounded-lg border border-ec-line bg-white shadow-[0_14px_40px_rgba(20,32,46,0.055)] transition duration-300 hover:-translate-y-1 hover:border-ec-blue/40 hover:shadow-[0_28px_70px_rgba(20,32,46,0.13)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ec-blue sm:min-w-0"
    >
      <span className={`relative block overflow-hidden bg-ec-stone ${compact ? "aspect-[4/3]" : "aspect-[4/3.15]"}`}>
        {image ? (
          <Image
            src={image}
            alt={product.image?.altText ?? product.name}
            fill
            sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 72vw"
            priority={priority}
            className="object-contain p-4 transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="grid h-full place-items-center text-xs font-black uppercase tracking-[0.22em] text-ec-muted/45">
            COBAM
          </span>
        )}
        {product.badges.length > 0 ? (
          <span className="absolute left-3 top-3 rounded-md bg-white/92 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-ec-blue shadow-sm">
            {product.badges[0]}
          </span>
        ) : null}
      </span>

      <span className="flex flex-1 flex-col p-4">
        {product.brandName ? (
          <span className="mb-2 line-clamp-1 text-[11px] font-black uppercase tracking-[0.14em] text-ec-blue">
            {product.brandName}
          </span>
        ) : null}
        <span className="line-clamp-2 min-h-11 text-sm font-black leading-snug text-ec-ink">
          {product.name}
        </span>
        <span className="mt-2 line-clamp-1 text-xs font-semibold text-ec-muted">
          {product.categoryName ?? product.sku}
        </span>

        <span className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="text-base font-black text-ec-ink">{price ?? "Sur devis"}</span>
          <StockPill stock={product.stock} />
        </span>
      </span>
    </Link>
  );
}

function HeroShopPanel({ categories }: { categories: LandingCategory[] }) {
  const visibleCategories = categories.slice(0, 5);

  if (visibleCategories.length === 0) {
    return null;
  }

  return (
    <aside className="rounded-lg border border-ec-line bg-white p-4 shadow-[0_22px_64px_rgba(20,32,46,0.1)]">
      <div className="flex items-center justify-between gap-3 border-b border-ec-line pb-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ec-blue">
            Entrée boutique
          </p>
          <p className="mt-1 text-lg font-black text-ec-ink">Rayons populaires</p>
        </div>
        <Link
          href="/panier"
          className="inline-flex size-10 items-center justify-center rounded-md bg-ec-ink text-white transition hover:bg-ec-blue"
          aria-label="Ouvrir le panier"
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4 divide-y divide-ec-line">
        {visibleCategories.map((category) => (
          <Link
            key={category.slug}
            href={category.href}
            className="group flex items-center justify-between gap-4 py-3 transition hover:text-ec-blue"
          >
            <span className="min-w-0">
              <span className="block truncate text-base font-black text-ec-ink group-hover:text-ec-blue">
                {category.name}
              </span>
              <span className="mt-1 block text-xs font-bold text-ec-muted">
                {productCountLabel(category.productCount)}
              </span>
            </span>
            <ArrowRight
              className="size-4 shrink-0 text-ec-muted transition group-hover:translate-x-1 group-hover:text-ec-blue"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </aside>
  );
}

function StorefrontHero({ data }: { data: LandingHomeData }) {
  return (
    <section className="ecom-hero relative isolate overflow-hidden border-b border-ec-line bg-ec-paper text-ec-ink">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#fafaf7_0%,#fafaf7_58%,rgba(10,141,193,0.07)_58.1%,rgba(10,141,193,0.07)_100%)]" />

      <div className="commerce-container relative z-10 grid gap-8 py-8 sm:py-10 md:grid-cols-[0.86fr_1.14fr] md:items-center lg:grid-cols-[0.82fr_1.18fr] lg:py-12">
        <div className="max-w-3xl">

          <h1 className="mt-4 max-w-2xl text-[clamp(2.35rem,4vw,4.4rem)] font-black leading-[0.96] tracking-tight text-ec-ink">
            Achetez COBAM en ligne.
          </h1>

          <SearchPanel />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/catalogue" size="lg" icon={<ShoppingBag className="size-5" />}>
              Tous les produits
            </ButtonLink>
            <ButtonLink
              href="/suivi-commande"
              variant="secondary"
              size="lg"
              className="border-ec-line bg-white text-ec-ink [color:#14202e] hover:border-ec-blue hover:bg-ec-blue hover:text-white hover:[color:#fff]"
              icon={<Truck className="size-5" />}
            >
              Suivre une commande
            </ButtonLink>
          </div>
        </div>

        <HeroShopPanel categories={data.categories} />
      </div>
    </section>
  );
}

function QuickAction({
  href,
  icon,
  title,
  text,
  action,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  text: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-ec-line bg-white p-5 shadow-[0_14px_38px_rgba(20,32,46,0.05)] transition hover:-translate-y-1 hover:border-ec-blue/40 hover:shadow-[0_22px_60px_rgba(20,32,46,0.1)]"
    >
      <span className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-md bg-ec-blue/10 text-ec-blue">
          {icon}
        </span>
        <ArrowRight className="size-4 text-ec-muted transition group-hover:translate-x-1 group-hover:text-ec-blue" />
      </span>
      <span className="mt-5 block text-lg font-black text-ec-ink">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-ec-muted">{text}</span>
      <span className="mt-4 block text-sm font-black text-ec-blue">{action}</span>
    </Link>
  );
}

function CommerceCommandBar() {
  return (
    <section className="border-b border-ec-line bg-white">
      <div className="commerce-container grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/catalogue"
          icon={<Boxes className="size-5" aria-hidden="true" />}
          title="Catalogue complet"
          text="Tous les produits e-commerce avec filtres, prix, stock et marques."
          action="Ouvrir le catalogue"
        />
        <QuickAction
          href="/types-produits"
          icon={<Layers3 className="size-5" aria-hidden="true" />}
          title="Types de produits"
          text="Commencez par usage: salle de bain, revêtements, chantier, piscine."
          action="Explorer par type"
        />
        <QuickAction
          href="/compte"
          icon={<UserRound className="size-5" aria-hidden="true" />}
          title="Espace client"
          text="Retrouvez profils, adresses, commandes et notifications."
          action="Se connecter"
        />
        <QuickAction
          href="mailto:contact@cobamgroup.com?subject=Demande%20de%20devis%20e-cobam"
          icon={<ClipboardList className="size-5" aria-hidden="true" />}
          title="Devis accompagné"
          text="Préparez le panier et confirmez les quantités avec COBAM."
          action="Demander un devis"
        />
      </div>
    </section>
  );
}

function CategoryNavigator({ categories }: { categories: LandingCategory[] }) {
  return (
    <section className="bg-ec-paper py-14 sm:py-18" aria-labelledby="category-navigator-title">
      <div className="commerce-container grid gap-8 lg:grid-cols-[0.64fr_1.36fr] lg:items-start">
        <div className="lg:sticky lg:top-36">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-ec-blue">
            Acheter par univers
          </p>
          <h2 id="category-navigator-title" className="mt-4 max-w-xl text-4xl font-black leading-none tracking-tight text-ec-ink sm:text-6xl">
            Un catalogue dense, lisible par projet.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-ec-muted">
            Les rayons ne sont pas de simples blocs: ils orientent vers les sous-familles,
            les produits disponibles et les références à comparer.
          </p>
          <Link
            href="/catalogue"
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ec-ink px-5 text-sm font-black text-white transition hover:bg-ec-blue"
          >
            Tous les produits
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-4">
          {categories.slice(0, 8).map((category, index) => (
            <Link
              key={category.slug}
              href={category.href}
              className="group grid overflow-hidden rounded-lg border border-ec-line bg-white shadow-[0_18px_52px_rgba(20,32,46,0.055)] transition hover:-translate-y-1 hover:border-ec-blue/38 hover:shadow-[0_28px_70px_rgba(20,32,46,0.12)] md:grid-cols-[0.72fr_1.28fr]"
            >
              <span className={index % 2 === 1 ? "relative min-h-64 bg-ec-stone md:order-2" : "relative min-h-64 bg-ec-stone"}>
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 34vw, 92vw"
                    priority={index < 2}
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <span className="grid h-full place-items-center bg-[linear-gradient(135deg,var(--ec-stone),#fff)] text-xs font-black uppercase tracking-[0.22em] text-ec-muted/45">
                    COBAM
                  </span>
                )}
                <span className="absolute bottom-4 left-4 rounded-md bg-ec-ink px-3 py-2 text-sm font-black text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="flex min-h-64 flex-col justify-center p-5 sm:p-7">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-ec-blue">
                  {productCountLabel(category.productCount)}
                </span>
                <span className="mt-3 block text-3xl font-black leading-tight text-ec-ink">
                  {category.name}
                </span>
                <span className="mt-4 block max-w-xl text-sm leading-6 text-ec-muted">
                  {category.subtitle ?? category.description ?? "Produits COBAM GROUP disponibles au catalogue."}
                </span>
                <span className="mt-5 flex flex-wrap gap-2">
                  {category.subcategories.slice(0, 5).map((subcategory) => (
                    <span key={subcategory.slug} className="rounded-md bg-ec-stone px-3 py-2 text-xs font-bold text-ec-muted">
                      {subcategory.name}
                    </span>
                  ))}
                </span>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-ec-blue">
                  Voir les produits
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectShortcuts({ categories }: { categories: LandingCategory[] }) {
  const bathroom = findCategory(categories, ["bain", "cuisine", "robinet"]);
  const surface = findCategory(categories, ["revêtement", "revetement", "carrelage", "surface"]);
  const chantier = findCategory(categories, ["construction", "ciment", "matériaux", "materiaux"]);
  const shortcuts = [
    {
      eyebrow: "Salle de bain",
      title: "Vasques, robinetterie, douche et accessoires.",
      category: bathroom,
    },
    {
      eyebrow: "Surfaces",
      title: "Carrelage, faïence, mosaïque et grands formats.",
      category: surface,
    },
    {
      eyebrow: "Chantier",
      title: "Ciments, briques, sables, graviers et armatures.",
      category: chantier,
    },
  ];

  return (
    <section className="bg-white py-14" aria-labelledby="project-shortcuts-title">
      <div className="commerce-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-ec-blue">
              Parcours rapides
            </p>
            <h2 id="project-shortcuts-title" className="mt-3 text-4xl font-black leading-tight tracking-tight text-ec-ink sm:text-5xl">
              Commencer par le besoin réel.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ec-muted">
            Une entrée plus concrète pour les clients qui ne connaissent pas encore le nom exact de
            la référence.
          </p>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {shortcuts.map((item) => (
            <Link
              key={item.eyebrow}
              href={item.category?.href ?? "/catalogue"}
              className="group relative min-h-80 overflow-hidden rounded-lg bg-ec-ink p-6 text-white shadow-[0_24px_70px_rgba(20,32,46,0.16)]"
            >
              {item.category?.imageUrl ? (
                <Image
                  src={item.category.imageUrl}
                  alt={item.category.name}
                  fill
                  sizes="(min-width: 1024px) 31vw, 92vw"
                  className="object-cover opacity-45 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-58"
                />
              ) : null}
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,32,46,0.18),rgba(20,32,46,0.92))]" />
              <span className="relative z-10 flex min-h-68 flex-col justify-between">
                <span>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-ec-blue">
                    {item.eyebrow}
                  </span>
                  <span className="mt-4 block max-w-sm text-3xl font-black leading-tight">
                    {item.title}
                  </span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-black">
                  Voir la catégorie
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductShelf({
  eyebrow,
  title,
  description,
  products,
  emptyText,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description: string;
  products: LandingProduct[];
  emptyText: string;
  tone?: "light" | "paper" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <section className={`${isDark ? "bg-ec-ink text-white" : tone === "paper" ? "bg-ec-paper text-ec-ink" : "bg-white text-ec-ink"} py-14 sm:py-18`}>
      <div className="commerce-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-ec-blue">{eyebrow}</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              {title}
            </h2>
            <p className={`mt-3 max-w-2xl text-sm leading-6 ${isDark ? "text-white/64" : "text-ec-muted"}`}>
              {description}
            </p>
          </div>
          <Link
            href="/catalogue"
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-black transition ${
              isDark
                ? "border border-white/18 bg-white/10 text-white hover:bg-white/18"
                : "border border-ec-line bg-white text-ec-ink hover:border-ec-blue/35 hover:bg-ec-blue/5"
            }`}
          >
            Voir tout
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="commerce-thin-scrollbar mt-7 grid auto-cols-[14rem] grid-flow-col gap-4 overflow-x-auto pb-3 sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {products.slice(0, 8).map((product, index) => (
              <CommerceProductCard key={product.id} product={product} priority={index < 4} compact />
            ))}
          </div>
        ) : (
          <div className={`mt-7 rounded-lg border border-dashed p-8 text-center ${isDark ? "border-white/18 bg-white/8" : "border-ec-line bg-white"}`}>
            <Search className="mx-auto size-9 text-ec-blue" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-black">{emptyText}</h3>
            <p className={`mx-auto mt-2 max-w-xl text-sm leading-6 ${isDark ? "text-white/62" : "text-ec-muted"}`}>
              Le catalogue reste disponible. Vous pouvez rechercher une référence ou contacter
              l&apos;équipe COBAM.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function BrandRunway({ brands }: { brands: LandingBrand[] }) {
  if (brands.length === 0) {
    return null;
  }

  const runwayBrands = brands.slice(0, 14);

  return (
    <section className="overflow-hidden border-y border-ec-line bg-white py-14 text-ec-ink sm:py-18" aria-labelledby="brands-title">
      <div className="commerce-container flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-ec-blue">Marques</p>
          <h2 id="brands-title" className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Des marques reconnues, prêtes à commander.
          </h2>
        </div>
        <Link
          href="/catalogue"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ec-ink px-5 text-sm font-black text-white transition hover:bg-ec-blue"
        >
          Explorer par marque
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="ecom-brand-marquee mt-9">
        <div className="ecom-brand-marquee-track">
          {[...runwayBrands, ...runwayBrands].map((brand, index) => (
            <Link
              key={`${brand.slug}-${index}`}
              href={brand.href}
              className="group flex h-28 min-w-64 flex-col justify-between rounded-lg border border-ec-line bg-white p-5 shadow-sm transition hover:border-ec-blue/40 hover:shadow-[0_16px_45px_rgba(20,32,46,0.09)]"
            >
              <span className="relative block h-11">
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    fill
                    sizes="14rem"
                    className="object-contain object-left grayscale transition duration-300 group-hover:grayscale-0"
                  />
                ) : (
                  <span className="line-clamp-1 text-lg font-black text-ec-ink">{brand.name}</span>
                )}
              </span>
              <span className="text-xs font-bold text-ec-muted">
                {formatCompactNumber(brand.productCount)} produits
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const serviceItems = [
  {
    icon: Truck,
    title: "Retrait & livraison",
    text: "Préparez le panier, COBAM confirme les modalités adaptées au chantier.",
  },
  {
    icon: CreditCard,
    title: "Paiement maîtrisé",
    text: "Prix visibles quand ils existent, devis clair lorsque le projet demande validation.",
  },
  {
    icon: ShieldCheck,
    title: "Catalogue fiable",
    text: "Les produits visibles respectent les règles e-commerce et les stocks déclarés.",
  },
  {
    icon: Headphones,
    title: "Conseil projet",
    text: "Une équipe peut accompagner les quantités, usages, délais et alternatives.",
  },
];

function TrustSection() {
  return (
    <section className="bg-ec-paper py-14 sm:py-18" aria-labelledby="trust-title">
      <div className="commerce-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-ec-blue">
            Service commerce
          </p>
          <h2 id="trust-title" className="mt-3 max-w-2xl text-4xl font-black leading-tight tracking-tight text-ec-ink sm:text-5xl">
            Une boutique pensée pour les vrais achats de construction.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-ec-muted">
            e-cobam n&apos;est pas une vitrine décorative: c&apos;est une interface pour trouver, comparer,
            préparer, commander et suivre les produits COBAM.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {serviceItems.map((item) => (
            <article key={item.title} className="rounded-lg border border-ec-line bg-white p-5 shadow-sm">
              <span className="grid size-12 place-items-center rounded-md bg-ec-blue/10 text-ec-blue">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-black text-ec-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ec-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalHelpSection() {
  return (
    <section className="relative overflow-hidden bg-ec-ink py-16 text-white sm:py-20">
      <div className="ecom-technical-grid absolute inset-0 opacity-55" aria-hidden="true" />
      <div className="commerce-container relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-ec-blue">
            Achat accompagné
          </p>
          <h2 className="mt-3 max-w-4xl text-5xl font-black leading-none tracking-tight sm:text-6xl">
            Construisez votre panier, COBAM confirme le projet.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68">
            Ajoutez vos références, comparez les disponibilités, puis validez les quantités et
            modalités avec l&apos;équipe commerciale.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <ButtonLink href="/catalogue" size="lg" className="bg-white text-ec-ink [color:#14202e] hover:bg-ec-blue hover:text-white hover:[color:#fff]" icon={<ShoppingBag className="size-5" />}>
            Explorer le catalogue
          </ButtonLink>
          <ButtonLink href="/suivi-commande" variant="secondary" size="lg" className="border-white/20 bg-white/10 text-white [color:#fff] hover:bg-white/20" icon={<Truck className="size-5" />}>
            Suivre une commande
          </ButtonLink>
          <ButtonLink href="mailto:contact@cobamgroup.com?subject=Demande%20de%20devis%20e-cobam" variant="secondary" size="lg" className="border-white/20 bg-white/10 text-white [color:#fff] hover:bg-white/20" icon={<ClipboardList className="size-5" />}>
            Demander un devis
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function DiagnosticsNotice({ data }: { data: LandingHomeData }) {
  if (data.products.status !== "error") {
    return null;
  }

  return (
    <section className="bg-amber-50 py-4 text-amber-900">
      <div className="commerce-container flex items-center gap-3 text-sm font-semibold">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        {data.products.message}
      </div>
    </section>
  );
}

export function StorefrontHome({ data }: { data: LandingHomeData }) {
  const promotedProducts = firstReadyItems(data.promotedProducts, data.products);
  const latestProducts = firstReadyItems(data.latestProducts, data.products);

  return (
    <main>
      <StorefrontHero data={data} />
      <DiagnosticsNotice data={data} />
      <CommerceCommandBar />
      <CategoryNavigator categories={data.categories} />
      <ProductShelf
        eyebrow="Sélections"
        title="Les références à vérifier en premier."
        description="Une vitrine courte avec prix, stock, marque et accès direct aux fiches produits."
        products={promotedProducts}
        emptyText="Aucune sélection n'est publiée pour le moment."
      />
      <ProjectShortcuts categories={data.categories} />
      <ProductShelf
        eyebrow="Nouveautés"
        title="Les dernières références ajoutées au catalogue."
        description="Gardez les arrivages et mises à jour à portée de main pour préparer vos demandes."
        products={latestProducts}
        emptyText="Aucune nouveauté n'est publiée pour le moment."
        tone="paper"
      />
      <BrandRunway brands={data.brands} />
      <TrustSection />
      <FinalHelpSection />
    </main>
  );
}
