import Link from "next/link";
import { COBAM_SOCIAL_LINKS } from "@cobam/shared";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  PackageCheck,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { FavoriteToggleButton } from "@/components/favorites/favorite-toggle-button";
import { SafeMediaImage } from "@/components/home/safe-media-image";
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
  if (value == null) return "Catalogue";
  if (value <= 0) return "Voir le rayon";
  return `${formatCompactNumber(value)} produits`;
}

function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-ec-blue text-xs font-black tracking-[0.2em] uppercase">{eyebrow}</p>
        ) : null}
        <h2 className="text-ec-ink mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-ec-ink hover:text-ec-blue inline-flex items-center gap-2 text-sm font-black transition"
        >
          {action.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

function SearchBar({ large = false }: { large?: boolean }) {
  return (
    <form
      action="/catalogue"
      className="border-ec-line focus-within:border-ec-blue/45 mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border bg-white p-2 shadow-[0_18px_55px_rgba(20,32,46,0.08)] transition focus-within:shadow-[0_0_0_4px_rgba(10,141,193,0.08)]"
    >
      <Search className="text-ec-blue ml-2 size-5 shrink-0" aria-hidden="true" />
      <label className="sr-only" htmlFor={large ? "home-search" : "section-search"}>
        Rechercher un produit
      </label>
      <input
        id={large ? "home-search" : "section-search"}
        name="search"
        type="search"
        placeholder="Rechercher un produit, une marque, une référence..."
        className="text-ec-ink placeholder:text-ec-muted/70 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none sm:text-base"
      />
      <button
        type="submit"
        className="bg-ec-ink hover:bg-ec-blue inline-flex h-11 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-black [color:#fff] text-white transition sm:px-5"
      >
        <span className="hidden sm:inline">Rechercher</span>
        <Search className="size-4 sm:hidden" aria-hidden="true" />
      </button>
    </form>
  );
}

function StockBadge({ stock }: { stock: LandingProduct["stock"] }) {
  const tone =
    stock.tone === "available"
      ? "bg-emerald-50 text-emerald-700"
      : stock.tone === "warning"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ${tone}`}
    >
      <PackageCheck className="size-3" aria-hidden="true" />
      {stock.label}
    </span>
  );
}

function ProductCard({ product }: { product: LandingProduct }) {
  const image = product.image?.thumbnailUrl ?? product.image?.url ?? null;
  const price = formatPriceTnd(product.price) ?? "Prix sur demande";
  const favoriteItem = {
    id: product.id,
    entityType: "PRODUCT",
    sku: product.sku,
    name: product.name,
    href: product.href,
    price: product.price,
    imageUrl: image,
    brandName: product.brandName,
    categoryName: product.categoryName ?? product.subcategoryName,
  } as const;

  return (
    <article className="group border-ec-line hover:border-ec-blue/35 relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_12px_34px_rgba(20,32,46,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(20,32,46,0.1)]">
      <Link
        href={product.href}
        className="focus-visible:outline-ec-blue relative block aspect-[4/3] overflow-hidden bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {image ? (
          <SafeMediaImage
            src={image}
            alt={product.image?.altText ?? product.name}
            className="object-contain p-6 transition duration-300 group-hover:scale-[1.025]"
            fallback="COBAM"
          />
        ) : (
          <span className="text-ec-muted/45 grid h-full place-items-center text-xs font-black tracking-[0.2em] uppercase">
            COBAM
          </span>
        )}
        {product.badges[0] ? (
          <span className="text-ec-blue absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black tracking-[0.12em] uppercase shadow-sm">
            {product.badges[0]}
          </span>
        ) : null}
      </Link>
      <FavoriteToggleButton item={favoriteItem} className="absolute top-3 right-3 z-10" />

      <div className="flex flex-1 flex-col p-5">
        <div className="min-h-[5.5rem]">
          <p className="text-ec-blue line-clamp-1 text-[11px] font-black tracking-[0.18em] uppercase">
            {product.brandName ?? product.categoryName ?? "COBAM"}
          </p>
          <Link
            href={product.href}
            className="text-ec-ink hover:text-ec-blue mt-2 line-clamp-2 text-sm leading-5 font-black transition"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-ec-ink text-lg font-black">{price}</p>
          <StockBadge stock={product.stock} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <AddToCartButton
            item={{
              id: product.id,
              sku: product.sku,
              name: product.name,
              price: product.price,
              imageUrl: image,
            }}
            quantity={1}
            size="sm"
            className="sm:w-full"
          />
          <Link
            href={product.href}
            className="border-ec-line text-ec-ink hover:border-ec-blue/40 hover:text-ec-blue inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-black transition"
          >
            Détails
          </Link>
        </div>
      </div>
    </article>
  );
}

function CategoryCard({ category }: { category: LandingCategory }) {
  return (
    <Link
      href={category.href}
      className="group border-ec-line hover:border-ec-blue/35 overflow-hidden rounded-2xl border bg-white shadow-[0_12px_34px_rgba(20,32,46,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(20,32,46,0.09)]"
    >
      <span className="bg-ec-stone relative block aspect-[4/2.45] overflow-hidden">
        {category.imageUrl ? (
          <SafeMediaImage
            src={category.imageUrl}
            alt=""
            className="object-cover transition duration-300 group-hover:scale-[1.035]"
            fallback={category.name}
          />
        ) : (
          <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,141,193,0.10),rgba(176,138,90,0.12))]" />
        )}
      </span>
      <span className="flex items-center justify-between gap-4 p-5">
        <span>
          <span className="text-ec-ink block text-base font-black">{category.name}</span>
          <span className="text-ec-muted mt-1 block text-xs font-semibold">
            {productCountLabel(category.productCount)}
          </span>
        </span>
        <ChevronRight className="text-ec-muted group-hover:text-ec-blue size-5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function Hero() {
  return (
    <section className="border-ec-line bg-ec-paper border-b">
      <div className="commerce-container py-18 text-center sm:py-24">
        <Link
          href="/catalogue?sélection=promotion"
          className="border-ec-line text-ec-blue hover:border-ec-blue/35 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs font-black tracking-[0.16em] uppercase shadow-sm transition"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          Offres du moment
        </Link>
        <h1 className="text-ec-ink mx-auto mt-6 max-w-4xl text-4xl leading-tight font-black tracking-tight sm:text-6xl">
          Tous vos matériaux, prêts à commander.
        </h1>
        <p className="text-ec-muted mx-auto mt-4 max-w-2xl text-base leading-7 font-semibold">
          Recherchez, ajoutez au panier et suivez vos commandes en quelques clics.
        </p>
        <div className="mt-8">
          <SearchBar large />
        </div>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <ButtonLink href="/catalogue" size="lg" icon={<ShoppingBag className="size-5" />}>
            Voir tous les produits
          </ButtonLink>
          <ButtonLink
            href="/suivi-commande"
            variant="ghost"
            size="lg"
            className="border-ec-line border bg-white"
            icon={<Truck className="size-5" />}
          >
            Suivre une commande
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function CategoryShortcuts({ categories }: { categories: LandingCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-white py-18 sm:py-24">
      <div className="commerce-container">
        <SectionHeader
          title="Acheter par catégorie"
          action={{ href: "/catalogue", label: "Tout voir" }}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductShelf({
  title,
  products,
  actionHref = "/catalogue",
}: {
  title: string;
  products: LandingProduct[];
  actionHref?: string;
}) {
  return (
    <section className="bg-white py-18 sm:py-24">
      <div className="commerce-container">
        <SectionHeader title={title} action={{ href: actionHref, label: "Voir tout" }} />
        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyProducts />
        )}
      </div>
    </section>
  );
}

function EmptyProducts() {
  return (
    <div className="border-ec-line bg-ec-paper rounded-2xl border border-dashed p-8 text-center">
      <Search className="text-ec-blue mx-auto size-8" aria-hidden="true" />
      <p className="text-ec-ink mt-3 font-black">Produits indisponibles pour le moment.</p>
      <Link href="/catalogue" className="text-ec-blue mt-2 inline-flex text-sm font-black">
        Ouvrir le catalogue
      </Link>
    </div>
  );
}

const promos = [
  {
    title: "Sélection carrelage",
    text: "Formats, décors et finitions à commander.",
    href: "/catalogue?search=carrelage",
  },
  {
    title: "Packs salle de bain",
    text: "Sanitaires, robinetterie et accessoires.",
    href: "/catalogue?search=salle%20de%20bain",
  },
  {
    title: "Nouveaux arrivages piscine",
    text: "Mosaïques et finitions extérieures.",
    href: "/catalogue?search=piscine",
  },
];

function PromotionsSection() {
  return (
    <section id="promotions" className="bg-ec-paper py-18 sm:py-24">
      <div className="commerce-container">
        <SectionHeader
          title="Offres du moment"
          action={{ href: "/catalogue?sélection=promotion", label: "Voir les offres" }}
        />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Link
            href="/catalogue?sélection=promotion"
            className="bg-ec-ink group relative overflow-hidden rounded-3xl p-7 text-white shadow-[0_24px_70px_rgba(20,32,46,0.16)] sm:p-9"
          >
            <span className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(10,141,193,0.45),transparent_45%),radial-gradient(circle_at_40%_80%,rgba(176,138,90,0.25),transparent_42%)]" />
            <span className="text-ec-blue relative block text-xs font-black tracking-[0.2em] uppercase">
              Offre boutique
            </span>
            <span className="relative mt-4 block max-w-xl text-3xl leading-tight font-black sm:text-4xl">
              Livraison offerte dès X TND
            </span>
            <span className="relative mt-4 block max-w-lg text-sm leading-6 text-white/70">
              Préparez votre panier et validez les modalités avec l’équipe commerciale.
            </span>
            <span className="text-ec-ink group-hover:bg-ec-blue relative mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-black transition group-hover:text-white">
              En profiter
              <ArrowRight className="size-4" />
            </span>
          </Link>
          <div className="grid gap-5">
            {promos.map((promo) => (
              <PromoCard key={promo.title} {...promo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PromoCard({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <Link
      href={href}
      className="border-ec-line hover:border-ec-blue/35 group rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-[0_18px_42px_rgba(20,32,46,0.08)]"
    >
      <span className="text-ec-ink block text-lg font-black">{title}</span>
      <span className="text-ec-muted mt-2 block text-sm font-semibold">{text}</span>
      <span className="text-ec-blue mt-4 inline-flex items-center gap-2 text-sm font-black">
        Voir la sélection
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

const needCards = [
  ["Je rénove ma salle de bain", "/catalogue?search=salle%20de%20bain"],
  ["Je cherche du carrelage extérieur", "/catalogue?search=carrelage%20extérieur"],
  ["Je prépare une piscine", "/catalogue?search=piscine"],
  ["Je peins une maison", "/catalogue?search=peinture"],
  ["Je construis un mur", "/catalogue?search=brique"],
  ["Je cherche des produits d’étanchéité", "/catalogue?search=étanchéité"],
] as const;

function ShopByNeed() {
  return (
    <section className="bg-ec-paper py-18 sm:py-24">
      <div className="commerce-container">
        <SectionHeader title="Acheter selon votre besoin" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {needCards.map(([title, href]) => (
            <Link
              key={title}
              href={href}
              className="border-ec-line text-ec-ink hover:border-ec-blue/35 hover:text-ec-blue flex items-center justify-between rounded-2xl border bg-white p-5 text-sm font-black transition"
            >
              {title}
              <ChevronRight className="size-5 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const accountCards = [
  {
    icon: ShoppingBag,
    title: "Panier rapide",
    text: "Ajoutez vos produits, ajustez les quantités et commandez plus vite.",
  },
  {
    icon: Clock3,
    title: "Suivi de commande",
    text: "Consultez l’état de vos commandes à tout moment.",
  },
  {
    icon: RotateCcw,
    title: "Réachat facile",
    text: "Retrouvez vos anciens achats et recommandez en quelques clics.",
  },
];

function AccountSection() {
  return (
    <section className="bg-white py-18 sm:py-24">
      <div className="commerce-container">
        <SectionHeader title="Votre espace d’achat simplifié" />
        <div className="grid gap-6 md:grid-cols-3">
          {accountCards.map((card) => (
            <article
              key={card.title}
              className="border-ec-line rounded-2xl border bg-white p-6 shadow-sm"
            >
              <span className="bg-ec-blue/10 text-ec-blue grid size-11 place-items-center rounded-xl">
                <card.icon className="size-5" />
              </span>
              <h3 className="text-ec-ink mt-5 text-lg font-black">{card.title}</h3>
              <p className="text-ec-muted mt-2 text-sm leading-6 font-semibold">{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const reasons = [
  ["Large choix", "Des références pour chaque projet."],
  ["Commande rapide", "Panier simple et clair."],
  ["Suivi clair", "Vos commandes restent visibles."],
  ["Support disponible", "Une équipe peut vous aider."],
] as const;

function WhySection() {
  return (
    <section className="border-ec-line border-y bg-white py-16">
      <div className="commerce-container">
        <SectionHeader title="Pourquoi acheter ici ?" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(([title, text]) => (
            <article key={title} className="bg-ec-paper rounded-2xl p-6">
              <CheckCircle2 className="text-ec-blue size-5" />
              <h3 className="text-ec-ink mt-3 font-black">{title}</h3>
              <p className="text-ec-muted mt-1 text-sm font-semibold">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandGrid({ brands }: { brands: LandingBrand[] }) {
  if (brands.length === 0) return null;

  return (
    <section className="bg-white py-18 sm:py-24">
      <div className="commerce-container">
        <SectionHeader
          title="Marques disponibles"
          action={{ href: "/catalogue", label: "Voir toutes les marques" }}
        />
        <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {brands.slice(0, 12).map((brand) => (
            <Link
              key={brand.slug}
              href={brand.href}
              className="border-ec-line hover:border-ec-blue/35 flex min-h-28 flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-[0_16px_38px_rgba(20,32,46,0.08)]"
            >
              {brand.logoUrl ? (
                <span className="relative block h-10">
                  <SafeMediaImage
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="object-contain object-left grayscale transition hover:grayscale-0"
                    fallback={brand.name}
                  />
                </span>
              ) : (
                <span className="text-ec-ink line-clamp-1 text-sm font-black">{brand.name}</span>
              )}
              <span className="text-ec-muted mt-4 text-xs font-bold">
                {formatCompactNumber(brand.productCount)} produits
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialMiniSection() {
  const socialLinks = COBAM_SOCIAL_LINKS.filter((social) =>
    ["Facebook", "Instagram", "LinkedIn"].includes(social.label),
  );

  return (
    <section className="bg-ec-paper py-16">
      <div className="commerce-container flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-ec-ink text-xl font-black">Suivez nos nouveautés</h2>
        <div className="flex flex-wrap gap-2">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border-ec-line text-ec-ink hover:border-ec-blue/35 hover:text-ec-blue rounded-full border bg-white px-4 py-2 text-sm font-black transition"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-ec-ink py-18 text-white sm:py-24">
      <div className="commerce-container flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-ec-blue text-xs font-black tracking-[0.2em] uppercase">Commande</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Prêt à commander ?</h2>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <ButtonLink
            href="/catalogue"
            className="text-ec-ink hover:bg-ec-blue bg-white [color:#14202e] hover:[color:#fff] hover:text-white"
          >
            Voir tous les produits
          </ButtonLink>
          <ButtonLink href="/panier" variant="secondary">
            Voir mon panier
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function DiagnosticsNotice({ data }: { data: LandingHomeData }) {
  if (data.products.status !== "error") return null;

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
  const bestSellers = firstReadyItems(data.promotedProducts, data.products);
  const latestProducts = firstReadyItems(data.latestProducts, data.products);
  const recommendedProducts =
    data.products.status === "ready" ? data.products.items : latestProducts;

  return (
    <main>
      <Hero />
      <DiagnosticsNotice data={data} />
      <CategoryShortcuts categories={data.categories} />
      <div id="best-sellers">
        <ProductShelf
          title="Les produits les plus demandés"
          products={bestSellers}
          actionHref="/catalogue?sélection=promotion"
        />
      </div>
      <PromotionsSection />
      <div id="new-arrivals">
        <ProductShelf
          title="Nouveautés"
          products={latestProducts}
          actionHref="/catalogue?tri=latest"
        />
      </div>
      <ShopByNeed />
      <AccountSection />
      <WhySection />
      <BrandGrid brands={data.brands} />
      <ProductShelf title="Recommandé pour vous" products={recommendedProducts} />
      <SocialMiniSection />
      <FinalCta />
    </main>
  );
}
