import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Boxes,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Headphones,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
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

function promotionHref() {
  return "/catalogue?s%C3%A9lection=promotion";
}

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
    return "Rayon";
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
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>
      <PackageCheck className="size-3" />
      {stock.label}
    </span>
  );
}

function MiniProductCard({ product, priority = false }: { product: LandingProduct; priority?: boolean }) {
  const price = formatPriceTnd(product.price);
  const image = product.image?.thumbnailUrl ?? product.image?.url ?? null;
  const kicker = product.brandName ?? product.subcategoryName ?? product.categoryName ?? "COBAM";

  return (
    <Link
      href={product.href}
      className="group flex h-full min-w-[15.5rem] flex-col overflow-hidden rounded-2xl border border-ec-line bg-white shadow-[0_14px_38px_rgba(16,32,47,0.06)] transition duration-200 hover:-translate-y-1 hover:border-ec-blue/35 hover:shadow-[0_24px_58px_rgba(16,32,47,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ec-blue sm:min-w-0"
    >
      <div className="relative aspect-[4/3.25] overflow-hidden bg-[#f3f5f6]">
        {image ? (
          <Image
            src={image}
            alt={product.image?.altText ?? product.name}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 72vw"
            priority={priority}
            className="object-contain p-4 transition duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center bg-[linear-gradient(135deg,#f8f7f2,#e7edf2)] text-xs font-black uppercase tracking-[0.22em] text-ec-muted/45">
            COBAM
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.badges.slice(0, 2).map((badge) => (
            <span key={badge} className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-black text-ec-ink shadow-sm">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-1 text-[11px] font-bold uppercase tracking-[0.16em] text-ec-blue">
          {kicker}
        </p>
        <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm font-black leading-snug text-ec-ink">
          {product.name}
        </h3>
        {product.summary ? (
          <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-ec-muted">{product.summary}</p>
        ) : (
          <p className="mt-2 min-h-[2.5rem] text-xs leading-5 text-ec-muted">
            Fiche produit disponible dans le catalogue.
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[11px] text-ec-muted">Prix TTC</p>
            <p className="mt-1 text-base font-black text-ec-ink">{price ?? "Sur devis"}</p>
          </div>
          <StockPill stock={product.stock} />
        </div>
      </div>
    </Link>
  );
}

function HeroSlider({ products }: { products: LandingProduct[] }) {
  const slides = products.filter((product) => product.image?.url || product.image?.thumbnailUrl).slice(0, 3);

  if (slides.length === 0) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_22%,rgba(10,141,193,0.38),transparent_28%),linear-gradient(135deg,#14202e,#203247_48%,#f1eee8_49%,#d7dce0)]" />
    );
  }

  return (
    <div className="absolute inset-0">
      {slides.map((product, index) => (
        <div
          key={product.id}
          className="storefront-hero-slide absolute inset-0"
          style={{ animationDelay: `${index * 4.5}s` }}
        >
          <Image
            src={product.image?.url ?? product.image?.thumbnailUrl ?? ""}
            alt={product.image?.altText ?? product.name}
            fill
            sizes="(min-width: 1024px) 52vw, 96vw"
            priority={index === 0}
            className="object-cover"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,32,46,0.94),rgba(20,32,46,0.76)_42%,rgba(20,32,46,0.2)),linear-gradient(0deg,rgba(20,32,46,0.76),transparent_50%)]" />
    </div>
  );
}

function CategoryMenu({ categories }: { categories: LandingCategory[] }) {
  return (
    <aside className="rounded-3xl border border-ec-line bg-white p-3 shadow-[0_18px_50px_rgba(16,32,47,0.07)]">
      <div className="flex items-center justify-between gap-3 border-b border-ec-line px-2 pb-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ec-blue">Rayons</p>
          <h2 className="text-lg font-black text-ec-ink">Toutes les catégories</h2>
        </div>
        <Boxes className="size-5 text-ec-muted" />
      </div>

      <div className="mt-2 grid gap-1">
        {categories.slice(0, 7).map((category) => (
          <Link
            key={category.slug}
            href={category.href}
            className="group rounded-2xl px-3 py-3 transition hover:bg-ec-stone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-blue"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-black text-ec-ink group-hover:text-ec-blue">
                  {category.name}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-ec-muted">
                  {category.subcategories.slice(0, 2).map((item) => item.name).join(" · ") ||
                    productCountLabel(category.productCount)}
                </p>
              </div>
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-ec-muted transition group-hover:translate-x-0.5 group-hover:text-ec-blue" />
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

function StorefrontHero({ data }: { data: LandingHomeData }) {
  const readyProducts = data.products.status === "ready" ? data.products.items : [];
  const heroProducts = [data.heroProduct, ...readyProducts].filter((product): product is LandingProduct => Boolean(product));
  const heroProduct = data.heroProduct ?? readyProducts[0] ?? null;
  const heroPrice = formatPriceTnd(heroProduct?.price);

  return (
    <section className="border-b border-ec-line bg-[#f6f4ef] py-5 sm:py-7">
      <div className="commerce-container">
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-ec-line bg-white px-4 py-3 text-sm shadow-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-rose-700">
            <BadgePercent className="size-3.5" />
            Offres
          </span>
          <span className="font-semibold text-ec-ink">Produits chantier, revêtements, sanitaires et piscine disponibles dans le catalogue e-cobam.</span>
          <Link href={promotionHref()} className="ml-auto inline-flex items-center gap-1 text-sm font-black text-ec-blue">
            Voir les sélections
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[18rem_1fr_18rem]">
          <CategoryMenu categories={data.categories} />

          <div className="relative min-h-[30rem] overflow-hidden rounded-3xl bg-ec-ink text-white shadow-[0_22px_70px_rgba(16,32,47,0.18)]">
            <HeroSlider products={heroProducts} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,rgba(10,141,193,0.26),transparent_28%)]" />

            <div className="relative z-10 flex min-h-[30rem] flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/85">
                  <Sparkles className="size-3.5 text-ec-blue" />
                  Boutique officielle COBAM Group
                </p>
                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.96] tracking-tight sm:text-5xl lg:text-6xl">
                  Achetez vos matériaux comme dans un vrai magasin.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/76">
                  Parcourez les rayons, comparez les références, préparez votre panier et demandez un devis pour vos projets de construction, rénovation et finition.
                </p>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-2xl font-black">{data.diagnostics.productCount == null ? "400+" : formatCompactNumber(data.diagnostics.productCount)}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/58">Références</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-2xl font-black">{formatCompactNumber(data.categories.length)}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/58">Rayons</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-2xl font-black">4</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/58">Showrooms</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <ButtonLink href="/catalogue" size="lg" className="bg-white text-ec-ink [color:#14202e] hover:bg-ec-blue hover:text-white hover:[color:#fff]" icon={<ShoppingBag className="size-5" />}>
                    Explorer le catalogue
                  </ButtonLink>
                  <ButtonLink href="mailto:contact@cobamgroup.com?subject=Demande%20de%20devis%20e-cobam" variant="secondary" size="lg" className="border-white/20 bg-white/10 text-white [color:#fff] hover:bg-white/20" icon={<ClipboardList className="size-5" />}>
                    Demander un devis
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Link href="/compte" className="group rounded-3xl border border-ec-line bg-white p-5 shadow-sm transition hover:border-ec-blue/35 hover:shadow-[0_18px_46px_rgba(16,32,47,0.08)]">
              <UserRound className="size-6 text-ec-blue" />
              <h2 className="mt-5 text-lg font-black text-ec-ink">Espace client</h2>
              <p className="mt-2 text-sm leading-6 text-ec-muted">Commandes, adresses, paiements et historique.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-ec-blue">
                Se connecter
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link href="/suivi-commande" className="group rounded-3xl border border-ec-line bg-white p-5 shadow-sm transition hover:border-ec-blue/35 hover:shadow-[0_18px_46px_rgba(16,32,47,0.08)]">
              <Truck className="size-6 text-ec-blue" />
              <h2 className="mt-5 text-lg font-black text-ec-ink">Suivi commande</h2>
              <p className="mt-2 text-sm leading-6 text-ec-muted">Consultez l’état de votre commande en quelques secondes.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-ec-blue">
                Suivre
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </Link>

            <Link href={heroProduct?.href ?? "/catalogue"} className="group overflow-hidden rounded-3xl border border-ec-line bg-white shadow-sm transition hover:border-ec-blue/35 hover:shadow-[0_18px_46px_rgba(16,32,47,0.08)]">
              <div className="relative aspect-[16/10] bg-ec-stone">
                {heroProduct?.image?.thumbnailUrl || heroProduct?.image?.url ? (
                  <Image
                    src={heroProduct.image.thumbnailUrl ?? heroProduct.image.url}
                    alt={heroProduct.image.altText}
                    fill
                    sizes="(min-width: 1024px) 18rem, 33vw"
                    className="object-contain p-4 transition group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs font-black uppercase tracking-[0.2em] text-ec-muted/45">Produit</div>
                )}
              </div>
              <div className="p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ec-blue">À la une</p>
                <h2 className="mt-2 line-clamp-2 text-base font-black text-ec-ink">{heroProduct?.name ?? "Sélection catalogue"}</h2>
                <p className="mt-2 text-sm font-black text-ec-ink">{heroPrice ?? "Prix sur devis"}</p>
              </div>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

const serviceItems = [
  {
    icon: Truck,
    title: "Retrait & livraison",
    text: "Préparez vos achats en ligne puis confirmez la disponibilité avec l’équipe COBAM.",
  },
  {
    icon: CreditCard,
    title: "Paiement maîtrisé",
    text: "Modes de paiement suivis depuis l’espace client et adaptés aux commandes validées.",
  },
  {
    icon: ShieldCheck,
    title: "Références vérifiées",
    text: "Seuls les produits publiés pour l’e-commerce apparaissent dans les rayons.",
  },
  {
    icon: Headphones,
    title: "Conseil projet",
    text: "Pour les quantités techniques, demandez un devis avant validation finale.",
  },
];

function ServiceStrip() {
  return (
    <section className="border-b border-ec-line bg-white">
      <div className="commerce-container grid gap-3 py-5 sm:grid-cols-2 lg:grid-cols-4">
        {serviceItems.map((item) => (
          <div key={item.title} className="flex gap-3 rounded-2xl border border-ec-line bg-[#fbfaf7] p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ec-blue/10 text-ec-blue">
              <item.icon className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-black text-ec-ink">{item.title}</h2>
              <p className="mt-1 text-xs leading-5 text-ec-muted">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryDepartments({ categories }: { categories: LandingCategory[] }) {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="commerce-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ec-blue">Acheter par rayon</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ec-ink sm:text-4xl">
              Les univers COBAM, faciles à parcourir.
            </h2>
          </div>
          <Link href="/catalogue" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-ec-line bg-white px-5 text-sm font-black text-ec-ink transition hover:border-ec-blue/35 hover:bg-ec-blue/5">
            Tous les rayons
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category, index) => (
            <Link
              key={category.slug}
              href={category.href}
              className={`group overflow-hidden rounded-3xl border border-ec-line bg-white shadow-[0_14px_38px_rgba(16,32,47,0.05)] transition hover:-translate-y-1 hover:border-ec-blue/35 hover:shadow-[0_22px_58px_rgba(16,32,47,0.1)] ${
                index === 0 ? "lg:col-span-2" : ""
              }`}
            >
              <div className="relative aspect-[16/8.5] bg-ec-stone">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes={index === 0 ? "(min-width: 1024px) 46vw, 92vw" : "(min-width: 1024px) 22vw, 92vw"}
                    priority={index < 2}
                    className="object-cover transition duration-300 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-[linear-gradient(135deg,#f4f1eb,#e5edf2)] text-xs font-black uppercase tracking-[0.22em] text-ec-muted/45">
                    COBAM
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ec-blue">
                      {productCountLabel(category.productCount)}
                    </p>
                    <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight text-ec-ink">
                      {category.name}
                    </h3>
                  </div>
                  <ArrowRight className="size-5 shrink-0 text-ec-muted transition group-hover:translate-x-1 group-hover:text-ec-blue" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {category.subcategories.slice(0, 4).map((subcategory) => (
                    <span key={subcategory.slug} className="rounded-full bg-ec-stone px-3 py-1 text-xs font-bold text-ec-muted">
                      {subcategory.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromoBand({ categories }: { categories: LandingCategory[] }) {
  const bathroom = findCategory(categories, ["bain", "cuisine", "robinet"]);
  const surface = findCategory(categories, ["revêtement", "carrelage", "surface"]);
  const chantier = findCategory(categories, ["construction", "ciment", "matériaux"]);
  const promos = [
    {
      label: "Projet salle de bain",
      title: "Robinetterie, vasques, douches et équipements.",
      category: bathroom,
    },
    {
      label: "Revêtements",
      title: "Carrelage, faïence, mosaïque et grandes dalles.",
      category: surface,
    },
    {
      label: "Chantier",
      title: "Briques, ciments, sables, graviers et armatures.",
      category: chantier,
    },
  ];

  return (
    <section className="bg-[#f6f4ef] py-10">
      <div className="commerce-container grid gap-4 lg:grid-cols-3">
        {promos.map((promo) => (
          <Link
            key={promo.label}
            href={promo.category?.href ?? "/catalogue"}
            className="group relative min-h-52 overflow-hidden rounded-3xl bg-ec-ink p-6 text-white shadow-[0_18px_52px_rgba(16,32,47,0.16)]"
          >
            {promo.category?.imageUrl ? (
              <Image
                src={promo.category.imageUrl}
                alt={promo.category.name}
                fill
                sizes="(min-width: 1024px) 31vw, 92vw"
                className="object-cover opacity-42 transition duration-300 group-hover:scale-[1.04] group-hover:opacity-55"
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,32,46,0.92),rgba(20,32,46,0.42))]" />
            <div className="relative z-10 flex min-h-40 flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-ec-blue">{promo.label}</p>
                <h2 className="mt-3 max-w-sm text-2xl font-black leading-tight">{promo.title}</h2>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black">
                Voir le rayon
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductRail({
  eyebrow,
  title,
  description,
  products,
  emptyText,
}: {
  eyebrow: string;
  title: string;
  description: string;
  products: LandingProduct[];
  emptyText: string;
}) {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="commerce-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ec-blue">{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ec-ink sm:text-4xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ec-muted">{description}</p>
          </div>
          <Link href="/catalogue" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-ec-line bg-white px-5 text-sm font-black text-ec-ink transition hover:border-ec-blue/35 hover:bg-ec-blue/5">
            Voir tout
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="mt-6 grid auto-cols-[15.5rem] grid-flow-col gap-4 overflow-x-auto pb-3 sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {products.slice(0, 8).map((product, index) => (
              <MiniProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-ec-line bg-[#fbfaf7] p-8 text-center">
            <Search className="mx-auto size-9 text-ec-blue" />
            <h3 className="mt-4 text-lg font-black text-ec-ink">{emptyText}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ec-muted">
              Le catalogue reste disponible. Vous pouvez rechercher une référence ou contacter l’équipe COBAM.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function BrandSection({ brands }: { brands: LandingBrand[] }) {
  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-ec-line bg-[#f6f4ef] py-10 sm:py-12">
      <div className="commerce-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ec-blue">Marques</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ec-ink sm:text-4xl">
              Les marques que vos clients demandent.
            </h2>
          </div>
          <Link href="/catalogue" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ec-ink px-5 text-sm font-black text-white [color:#fff] transition hover:bg-ec-blue">
            Explorer par marque
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {brands.slice(0, 12).map((brand) => (
            <Link
              key={brand.slug}
              href={brand.href}
              className="group flex min-h-28 flex-col justify-between rounded-2xl border border-ec-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-ec-blue/35 hover:shadow-[0_14px_38px_rgba(16,32,47,0.08)]"
            >
              <div className="relative h-10">
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    fill
                    sizes="12rem"
                    className="object-contain object-left grayscale transition group-hover:grayscale-0"
                  />
                ) : (
                  <p className="line-clamp-1 text-lg font-black text-ec-ink">{brand.name}</p>
                )}
              </div>
              <p className="mt-4 text-xs font-bold text-ec-muted">{formatCompactNumber(brand.productCount)} produits</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalHelpSection() {
  return (
    <section className="bg-ec-ink py-12 text-white sm:py-16">
      <div className="commerce-container grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-ec-blue">Achat accompagné</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
            Un panier technique mérite une validation claire.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
            Commencez par le catalogue, ajoutez vos références, puis confirmez les quantités, disponibilités et modalités avec COBAM Group.
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

export function StorefrontHome({ data }: { data: LandingHomeData }) {
  const promotedProducts = firstReadyItems(data.promotedProducts, data.products);
  const latestProducts = firstReadyItems(data.latestProducts, data.products);

  return (
    <main>
      <StorefrontHero data={data} />
      <ServiceStrip />
      <CategoryDepartments categories={data.categories} />
      <ProductRail
        eyebrow="Sélections"
        title="Offres et produits à ne pas manquer."
        description="Une vitrine courte, pensée comme une vraie page boutique : prix, stock, marques et accès direct aux fiches."
        products={promotedProducts}
        emptyText="Aucune sélection n’est publiée pour le moment."
      />
      <PromoBand categories={data.categories} />
      <ProductRail
        eyebrow="Nouveautés"
        title="Les dernières références du catalogue."
        description="Gardez les références récentes à portée de main pour préparer vos achats et demandes de devis."
        products={latestProducts}
        emptyText="Aucune nouveauté n’est publiée pour le moment."
      />
      <BrandSection brands={data.brands} />
      <FinalHelpSection />
    </main>
  );
}
