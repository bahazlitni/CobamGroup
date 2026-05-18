import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
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
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black ${tone}`}>
      <PackageCheck className="size-3" />
      {stock.label}
    </span>
  );
}

function StoreProductCard({
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
      className="group flex h-full min-w-[13rem] flex-col overflow-hidden rounded-[1.25rem] border border-ec-line bg-white shadow-[0_10px_30px_rgba(20,32,46,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-ec-blue/35 hover:shadow-[0_18px_46px_rgba(20,32,46,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ec-blue sm:min-w-0"
    >
      <div className={`relative overflow-hidden bg-ec-stone ${compact ? "aspect-[4/3]" : "aspect-[4/3.08]"}`}>
        {image ? (
          <Image
            src={image}
            alt={product.image?.altText ?? product.name}
            fill
            sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 72vw"
            priority={priority}
            className="object-contain p-4 transition duration-300 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs font-black uppercase tracking-[0.2em] text-ec-muted/45">
            COBAM
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        {product.brandName ? (
          <p className="mb-2 line-clamp-1 text-[11px] font-black uppercase tracking-[0.14em] text-ec-blue">
            {product.brandName}
          </p>
        ) : null}
        <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-snug text-ec-ink">
          {product.name}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="text-base font-black text-ec-ink">{price ?? "Sur devis"}</p>
          <StockPill stock={product.stock} />
        </div>
      </div>
    </Link>
  );
}

function DepartmentRail({ categories }: { categories: LandingCategory[] }) {
  return (
    <aside className="overflow-hidden rounded-[1.5rem] border border-ec-line bg-white shadow-[0_18px_46px_rgba(20,32,46,0.055)]">
      <div className="border-b border-ec-line bg-ec-ink px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ec-blue">Catalogue</p>
            <h2 className="mt-1 text-lg font-black">Catégories</h2>
          </div>
          <Boxes className="size-5 text-white/70" />
        </div>
      </div>

      <div className="grid gap-1 p-2">
        {categories.slice(0, 8).map((category) => (
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
                <p className="mt-1 line-clamp-1 text-xs font-semibold text-ec-muted">
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

function HeroVisual({ products }: { products: LandingProduct[] }) {
  const slides = products.filter((product) => product.image?.url || product.image?.thumbnailUrl).slice(0, 3);

  if (slides.length === 0) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(10,141,193,0.38),transparent_28%),linear-gradient(135deg,#14202e,#203247_48%,var(--ec-background)_49%,var(--ec-paper))]" />
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
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,32,46,0.96),rgba(20,32,46,0.78)_44%,rgba(20,32,46,0.28)),linear-gradient(0deg,rgba(20,32,46,0.72),transparent_50%)]" />
    </div>
  );
}

function SearchPanel() {
  return (
    <form
      action="/catalogue"
      className="mt-7 grid gap-2 rounded-[1.35rem] border border-white/12 bg-white p-2 shadow-[0_18px_60px_rgba(0,0,0,0.18)] sm:grid-cols-[1fr_auto]"
    >
      <label className="flex h-13 items-center gap-3 px-3">
        <Search className="size-5 shrink-0 text-ec-muted" />
        <input
          name="search"
          type="search"
          placeholder="Rechercher un produit, une marque, une référence..."
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ec-ink outline-none placeholder:text-ec-muted/70"
        />
      </label>
      <button className="inline-flex h-13 items-center justify-center gap-2 rounded-[1.05rem] bg-ec-blue px-5 text-sm font-black text-white transition hover:bg-ec-ink">
        Rechercher
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}

function ActionCard({
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
      className="group rounded-[1.5rem] border border-ec-line bg-white p-5 shadow-sm transition hover:border-ec-blue/35 hover:shadow-[0_18px_46px_rgba(20,32,46,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-full bg-ec-blue/10 text-ec-blue">
          {icon}
        </span>
        <ArrowRight className="size-4 text-ec-muted transition group-hover:translate-x-1 group-hover:text-ec-blue" />
      </div>
      <h2 className="mt-5 text-lg font-black text-ec-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ec-muted">{text}</p>
      <p className="mt-4 text-sm font-black text-ec-blue">{action}</p>
    </Link>
  );
}

function FeaturedProduct({ product }: { product: LandingProduct | null }) {
  const price = formatPriceTnd(product?.price);

  return (
    <Link
      href={product?.href ?? "/catalogue"}
      className="group overflow-hidden rounded-[1.5rem] border border-ec-line bg-white shadow-sm transition hover:border-ec-blue/35 hover:shadow-[0_18px_46px_rgba(20,32,46,0.08)]"
    >
      <div className="relative aspect-[16/10] bg-ec-stone">
        {product?.image?.thumbnailUrl || product?.image?.url ? (
          <Image
            src={product.image.thumbnailUrl ?? product.image.url}
            alt={product.image.altText}
            fill
            sizes="(min-width: 1024px) 20rem, 92vw"
            className="object-contain p-4 transition duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs font-black uppercase tracking-[0.2em] text-ec-muted/45">
            Produit
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ec-blue">À la une</p>
          {product ? <StockPill stock={product.stock} /> : null}
        </div>
        <h2 className="mt-3 line-clamp-2 text-base font-black leading-snug text-ec-ink">
          {product?.name ?? "Sélection catalogue"}
        </h2>
        <p className="mt-3 text-lg font-black text-ec-ink">{price ?? "Prix sur devis"}</p>
      </div>
    </Link>
  );
}

function StorefrontHero({ data }: { data: LandingHomeData }) {
  const readyProducts = data.products.status === "ready" ? data.products.items : [];
  const heroProducts = [data.heroProduct, ...readyProducts].filter((product): product is LandingProduct => Boolean(product));
  const heroProduct = data.heroProduct ?? readyProducts[0] ?? null;

  return (
    <section className="border-b border-ec-line bg-ec-paper py-5 sm:py-7">
      <div className="commerce-container">
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[1.35rem] border border-ec-line bg-white px-4 py-3 text-sm shadow-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-rose-700">
            <BadgePercent className="size-3.5" />
            Offres
          </span>
          <span className="font-semibold text-ec-ink">
            Prix, stock, marques et fiches produits réunis dans le catalogue e-cobam.
          </span>
          <Link href={promotionHref()} className="ml-auto inline-flex items-center gap-1 text-sm font-black text-ec-blue">
            Voir les sélections
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_19rem]">
          <DepartmentRail categories={data.categories} />

          <div className="relative min-h-[34rem] overflow-hidden rounded-[2rem] bg-ec-ink text-white shadow-[0_24px_80px_rgba(20,32,46,0.18)]">
            <HeroVisual products={heroProducts} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(10,141,193,0.28),transparent_28%)]" />
            <div className="relative z-10 flex min-h-[34rem] flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/85">
                  <Sparkles className="size-3.5 text-ec-blue" />
                  Boutique officielle COBAM Group
                </p>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
                  Le magasin COBAM, prêt pour vos achats techniques.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/76">
                  Recherchez une référence, comparez les prix et stocks, ajoutez au panier et préparez vos commandes matériaux, sanitaires, revêtements et finitions.
                </p>
                <SearchPanel />
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-black">
                    {data.diagnostics.productCount == null
                      ? "400+"
                      : formatCompactNumber(data.diagnostics.productCount)}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/58">Références</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-black">{formatCompactNumber(data.categories.length)}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/58">Catégories</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-black">4</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/58">Showrooms</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <ActionCard
              href="/compte"
              icon={<UserRound className="size-5" />}
              title="Espace client"
              text="Profil, adresses, commandes, paiements et notifications."
              action="Se connecter"
            />
            <ActionCard
              href="/suivi-commande"
              icon={<Truck className="size-5" />}
              title="Suivi commande"
              text="Consultez l'avancement d'une commande sans perdre de temps."
              action="Suivre"
            />
            <FeaturedProduct product={heroProduct} />
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
    text: "Préparez votre panier puis confirmez les modalités avec l'équipe.",
  },
  {
    icon: CreditCard,
    title: "Paiement maîtrisé",
    text: "Vos préférences de règlement restent visibles dans l'espace client.",
  },
  {
    icon: ShieldCheck,
    title: "Catalogue fiable",
    text: "Chaque produit visible respecte les règles e-commerce COBAM.",
  },
  {
    icon: Headphones,
    title: "Conseil projet",
    text: "Demandez un devis pour les quantités techniques et chantiers.",
  },
];

function ServiceStrip() {
  return (
    <section className="border-b border-ec-line bg-white">
      <div className="commerce-container grid gap-3 py-5 sm:grid-cols-2 lg:grid-cols-4">
        {serviceItems.map((item) => (
          <div key={item.title} className="flex gap-3 rounded-2xl border border-ec-line bg-white p-4 shadow-sm">
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
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ec-blue">Acheter par catégorie</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ec-ink sm:text-4xl">
              Les rayons les plus utiles, dès l&apos;accueil.
            </h2>
          </div>
          <Link href="/catalogue" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-ec-line bg-white px-5 text-sm font-black text-ec-ink transition hover:border-ec-blue/35 hover:bg-ec-blue/5">
            Toutes les catégories
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category, index) => (
            <Link
              key={category.slug}
              href={category.href}
              className={`group overflow-hidden rounded-[1.5rem] border border-ec-line bg-white shadow-[0_14px_38px_rgba(20,32,46,0.05)] transition hover:-translate-y-1 hover:border-ec-blue/35 hover:shadow-[0_22px_58px_rgba(20,32,46,0.1)] ${
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
                  <div className="grid h-full place-items-center bg-[linear-gradient(135deg,var(--ec-stone),var(--ec-paper))] text-xs font-black uppercase tracking-[0.22em] text-ec-muted/45">
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

function ProjectShortcuts({ categories }: { categories: LandingCategory[] }) {
  const bathroom = findCategory(categories, ["bain", "cuisine", "robinet"]);
  const surface = findCategory(categories, ["revêtement", "revetement", "carrelage", "surface"]);
  const chantier = findCategory(categories, ["construction", "ciment", "matériaux", "materiaux"]);
  const shortcuts = [
    {
      eyebrow: "Projet salle de bain",
      title: "Robinetterie, vasques, douches et équipements.",
      category: bathroom,
    },
    {
      eyebrow: "Revêtements",
      title: "Carrelage, faïence, mosaïque et grandes dalles.",
      category: surface,
    },
    {
      eyebrow: "Chantier",
      title: "Briques, ciments, sables, graviers et armatures.",
      category: chantier,
    },
  ];

  return (
    <section className="bg-ec-paper py-10">
      <div className="commerce-container grid gap-4 lg:grid-cols-3">
        {shortcuts.map((item) => (
          <Link
            key={item.eyebrow}
            href={item.category?.href ?? "/catalogue"}
            className="group relative min-h-56 overflow-hidden rounded-[1.65rem] bg-ec-ink p-6 text-white shadow-[0_18px_52px_rgba(20,32,46,0.16)]"
          >
            {item.category?.imageUrl ? (
              <Image
                src={item.category.imageUrl}
                alt={item.category.name}
                fill
                sizes="(min-width: 1024px) 31vw, 92vw"
                className="object-cover opacity-42 transition duration-300 group-hover:scale-[1.04] group-hover:opacity-55"
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,32,46,0.94),rgba(20,32,46,0.48))]" />
            <div className="relative z-10 flex min-h-44 flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-ec-blue">{item.eyebrow}</p>
                <h2 className="mt-3 max-w-sm text-2xl font-black leading-tight">{item.title}</h2>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black">
                Voir la catégorie
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
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
  tone?: "light" | "paper";
}) {
  return (
    <section className={`${tone === "paper" ? "bg-ec-paper" : "bg-white"} py-10 sm:py-12`}>
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
          <div className="commerce-thin-scrollbar mt-6 grid auto-cols-[13.5rem] grid-flow-col gap-4 overflow-x-auto pb-3 sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {products.slice(0, 8).map((product, index) => (
              <StoreProductCard key={product.id} product={product} priority={index < 4} compact />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-ec-line bg-white p-8 text-center">
            <Search className="mx-auto size-9 text-ec-blue" />
            <h3 className="mt-4 text-lg font-black text-ec-ink">{emptyText}</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ec-muted">
              Le catalogue reste disponible. Vous pouvez rechercher une référence ou contacter l&apos;équipe COBAM.
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
    <section className="border-y border-ec-line bg-white py-10 sm:py-12">
      <div className="commerce-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ec-blue">Marques</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ec-ink sm:text-4xl">
              Des marques reconnues, prêtes à commander.
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
              className="group flex min-h-28 flex-col justify-between rounded-2xl border border-ec-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-ec-blue/35 hover:shadow-[0_14px_38px_rgba(20,32,46,0.08)]"
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
            Construisez votre panier, COBAM confirme le projet.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
            Ajoutez vos références, comparez les disponibilités, puis validez les quantités et modalités avec l&apos;équipe commerciale.
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
      <BrandSection brands={data.brands} />
      <FinalHelpSection />
    </main>
  );
}
