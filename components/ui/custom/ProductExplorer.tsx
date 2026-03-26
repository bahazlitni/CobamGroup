"use client";

import { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ArrowLeft,
  Search,
  FileSearch2,
  LayoutGrid,
  Rows3,
  LayoutPanelTop,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------------ */
/* Types                                                                    */
/* ------------------------------------------------------------------------ */

export interface Category {
  href: string;
  title: string;
  subtitle: string;
  descriptionSEO: string;
  imageUrl: string;
  imageUrlHD: string;
  slug: string;
  parent: string | null;
}

export interface Product {
  title: string;
  subtitle: string;
  descriptionSEO: string;
  imageUrl: string;
  imageUrlHD: string;
  slug: string;
}

export type ProductCategoryLink = {
  prodslug: string;
  catslug: string;
};

interface ProductExplorerProps {
  categories: Category[];
  products: Product[];
  links: ProductCategoryLink[];
  hasTopBar?: boolean;
  hasCloseButton?: boolean;
  hasResizeButton?: boolean;
}

function getFirstSentence(text: string): string {
  if (!text) return "";
  const match = text.match(/[^.!?]+[.!?]/);
  return (match ? match[0] : text).trim();
}

type PreviewEntity =
  | { kind: "category"; data: Category }
  | { kind: "product"; data: Product };

type ProductWithCatPath = {
  product: Product;
  path: Category[];
};

type ViewMode = "flex" | "grid" | "list";

/* ------------------------------------------------------------------------ */
/* Main Component                                                           */
/* ------------------------------------------------------------------------ */

export default function ProductExplorer({
  categories,
  products,
  links,
  hasTopBar = true,
  hasCloseButton = true,
  hasResizeButton = true,
}: ProductExplorerProps) {
  const [currentCategorySlug, setCurrentCategorySlug] = useState<string | null>(
    null
  );
  const [hoveredCategorySlug, setHoveredCategorySlug] =
    useState<string | null>(null);
  const [hoveredProductSlug, setHoveredProductSlug] =
    useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("flex");
  const [gridCols, setGridCols] = useState<number>(3);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  if (!categories.length) return null;

  /* -------------------- Precompute maps for fast lookup ------------------ */

  const {
    categoryBySlug,
    categoryChildrenMap,
    categoryProductsMap,
    rootCategories,
    productBySlug,
    productCategoriesMap,
  } = useMemo(() => {
    const catBySlug = new Map<string, Category>();
    const childrenMap = new Map<string | null, Category[]>();
    const catProductsMap = new Map<string, Product[]>();
    const prodBySlug = new Map<string, Product>();
    const prodCatsMap = new Map<string, Category[]>();

    for (const c of categories) {
      catBySlug.set(c.slug, c);
      const key = c.parent ?? null;
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)!.push(c);
    }

    for (const p of products) {
      prodBySlug.set(p.slug, p);
      prodCatsMap.set(p.slug, []);
    }

    for (const link of links) {
      const product = prodBySlug.get(link.prodslug);
      const category = catBySlug.get(link.catslug);
      if (!product || !category) continue;

      const arr = catProductsMap.get(category.slug) ?? [];
      if (!arr.includes(product)) arr.push(product);
      catProductsMap.set(category.slug, arr);

      const pcats = prodCatsMap.get(product.slug) ?? [];
      if (!pcats.includes(category)) pcats.push(category);
      prodCatsMap.set(product.slug, pcats);
    }

    const roots = childrenMap.get(null) ?? [];

    return {
      categoryBySlug: catBySlug,
      categoryChildrenMap: childrenMap,
      categoryProductsMap: catProductsMap,
      rootCategories: roots,
      productBySlug: prodBySlug,
      productCategoriesMap: prodCatsMap,
    };
  }, [categories, products, links]);

  if (!rootCategories.length) return null;

  const isTopLevel = currentCategorySlug === null;

  const getCategoryPathArr = useCallback(
    (categorySlug: string | null): Category[] => {
      if (!categorySlug) return [];
      const path: Category[] = [];
      let slug: string | null = categorySlug;

      while (slug) {
        const cat = categoryBySlug.get(slug);
        if (!cat) break;
        path.unshift(cat);
        slug = cat.parent;
      }

      return path;
    },
    [categoryBySlug]
  );

  const getCategoryPath = useCallback(
    (slug: string | null): string => {
      if (!slug) return "#";
      const cat = categoryBySlug.get(slug);
      if (!cat) return "#";
      if (cat.parent) {
        return `${getCategoryPath(cat.parent)}/${cat.slug}`;
      }
      return `/produits/${cat.slug}`;
    },
    [categoryBySlug]
  );

  const getSubcategories = (parentSlug: string | null): Category[] =>
    categoryChildrenMap.get(parentSlug) ?? [];

  const getProductsForCategory = (categorySlug: string | null): Product[] => {
    if (!categorySlug) {
      // top level: no products
      return [];
    }
    return categoryProductsMap.get(categorySlug) ?? [];
  };

  const currentCategory =
    (currentCategorySlug && categoryBySlug.get(currentCategorySlug)) || null;

  const breadcrumbPath = getCategoryPathArr(currentCategorySlug);
  const subcategories = getSubcategories(currentCategorySlug);
  const productsInCurrent = getProductsForCategory(currentCategorySlug);

  const hoveredCategory =
    (hoveredCategorySlug && categoryBySlug.get(hoveredCategorySlug)) || null;
  const hoveredProduct =
    (hoveredProductSlug && productBySlug.get(hoveredProductSlug)) || null;

  const basePreviewCategory: Category = currentCategory ?? rootCategories[0];

  const previewEntity: PreviewEntity = hoveredProduct
    ? { kind: "product", data: hoveredProduct }
    : hoveredCategory
    ? { kind: "category", data: hoveredCategory }
    : { kind: "category", data: basePreviewCategory };

  /* ----------------------- Search results building ----------------------- */

  const normalizedSearch = search.trim().toLowerCase();

  const filteredResults = useMemo(() => {
    if (!normalizedSearch) return null as null | {
      primaryProducts: Product[];
      secondary: ProductWithCatPath[];
      hasAny: boolean;
    };

    const matches: ProductWithCatPath[] = [];

    for (const [slug, product] of productBySlug.entries()) {
      const haystack =
        `${product.title} ${product.subtitle} ${product.descriptionSEO}`.toLowerCase();
      if (!haystack.includes(normalizedSearch)) continue;

      const cats = productCategoriesMap.get(slug) ?? [];
      const cat = cats[0] ?? null;
      const path = cat ? getCategoryPathArr(cat.slug) : [];
      matches.push({ product, path });
    }

    const primary: ProductWithCatPath[] = [];
    const secondary: ProductWithCatPath[] = [];

    for (const item of matches) {
      if (
        currentCategorySlug &&
        item.path.some((c) => c.slug === currentCategorySlug)
      ) {
        primary.push(item);
      } else {
        secondary.push(item);
      }
    }

    const primaryProducts = primary.map((m) => m.product);
    const hasAny = primaryProducts.length > 0 || secondary.length > 0;

    return {
      primaryProducts,
      secondary,
      hasAny,
    };
  }, [
    normalizedSearch,
    productBySlug,
    productCategoriesMap,
    getCategoryPathArr,
    currentCategorySlug,
  ]);

  /* ----------------------------- Handlers -------------------------------- */

  const handleCategoryClick = (slug: string | null) => {
    setCurrentCategorySlug(slug);
    setHoveredCategorySlug(null);
    setHoveredProductSlug(null);
    setSearch("");
  };

  const handleProductClick = (slug: string) => {
    window.location.href = `/produits/detail/${slug}`;
  };

  const handleClose = () => {
    if (hasCloseButton) {
      setIsClosed(true);
    }
  };

  const handleExpand = () => {
    if (hasResizeButton) {
      setIsExpanded(true);
    }
  };

  const handleReduce = () => {
    if (hasResizeButton) {
      setIsExpanded(false);
    }
  };

  /* ----------------------------- Rendering -------------------------------- */

  const bodyHidden = isClosed;

  const innerExplorer = (
  <motion.div
    layout
    transition={{ duration: 0.22, ease: "easeOut" }}
    className={`relative w-full overflow-auto rounded-2xl border border-black/5 bg-white shadow-[0_8px_10px_rgba(0,0,0,0.1)] ${
    isExpanded ? "max-w-6xl h-auto max-h-80vh shadow-[0_8px_10px_rgba(0,0,0,0.08)]" : "max-w-6xl 2xl:max-w-7xl h-auto"
    }`}
  >
      {/* Mac-style top bar */}
      {hasTopBar && (
        <div className="w-full flex items-center justify-between px-10 py-3 border-b border-cobam-quill-grey bg-gray-100/80">
            <div className="flex-1 flex gap-3 items-center pointer-events-none">
                    <div className="relative w-6 h-6 rounded-md overflow-hidden bg-white">
                        <Image
                        src="/images/logos/cobam-group/logo-vector-square.svg"
                        alt="Cobam Group"
                        fill
                        className="object-contain"
                        />
                    </div>
                    <span className="text-xs font-semibold text-cobam-dark-blue">
                        Explorateur de produits – Cobam Group
                    </span>
            </div>
            <div className="flex gap-2">
                {/* Minimize / Reduce (amber) – only when expanded & resize is enabled */}
                {hasResizeButton && isExpanded && (
                <button
                    type="button"
                    onClick={handleReduce}
                    className="h-3.5 w-3.5 rounded-full bg-amber-400 border border-black/10 hover:bg-amber-300 transition-colors"
                    aria-label="Réduire"
                />
                )}
                {/* Zoom / Expand (green) – only when not expanded & resize is enabled */}
                {hasResizeButton && !isExpanded && (
                <button
                    type="button"
                    onClick={handleExpand}
                    className="h-3.5 w-3.5 rounded-full bg-green-500 border border-black/10 hover:bg-green-400 transition-colors"
                    aria-label="Agrandir"
                />
                )}
                            {/* Close (red) */}
                {hasCloseButton && (
                <button
                    type="button"
                    onClick={handleClose}
                    className="h-3.5 w-3.5 rounded-full bg-red-500 border border-black/10 hover:bg-red-400 transition-colors"
                    aria-label="Fermer la fenêtre"
                />
                )}
            </div>

        </div>
      )}

      {!bodyHidden && (
        <div className="flex flex-col lg:flex-row p-4 lg:p-6 gap-6 lg:gap-8">
          {/* LEFT: Banner */}
          <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0">
            <ExplorerBanner
              entity={previewEntity}
              getCategoryPath={getCategoryPath}
            />
          </div>

          {/* RIGHT: Explorer with controls & search */}
          <div className="relative flex-1 min-w-[320px] flex flex-col gap-3 h-[460px]">
            <ExplorerHeader
              currentCategorySlug={currentCategorySlug}
              breadcrumbPath={breadcrumbPath}
              search={search}
              isSearchOpen={isSearchOpen}
              onBack={() => {
                if (breadcrumbPath.length >= 2) {
                  handleCategoryClick(
                    breadcrumbPath[breadcrumbPath.length - 2].slug
                  );
                } else {
                  handleCategoryClick(null);
                }
              }}
              onRootClick={() => handleCategoryClick(null)}
              onCrumbClick={(slug) => handleCategoryClick(slug)}
              onSearchChange={setSearch}
              onToggleSearch={() => setIsSearchOpen((o) => !o)}
            />

            {!isTopLevel && (
              <UnifiedViewControls
                viewMode={viewMode}
                gridCols={gridCols}
                onViewModeChange={setViewMode}
                onGridColsChange={setGridCols}
              />
            )}

            <UnifiedExplorerBody
              isTopLevel={isTopLevel}
              rootCategories={rootCategories}
              subcategories={subcategories}
              productsInCurrent={productsInCurrent}
              searchResults={filteredResults}
              getCategoryPathArr={getCategoryPathArr}
              onCategoryHover={(slug) => {
                setHoveredCategorySlug(slug);
                setHoveredProductSlug(null);
              }}
              onCategoryClick={handleCategoryClick}
              onProductHover={(slug) => {
                setHoveredProductSlug(slug);
                setHoveredCategorySlug(null);
              }}
              onProductLeave={() => setHoveredProductSlug(null)}
              onProductClick={handleProductClick}
              hasSearch={!!filteredResults}
              searchHasAny={filteredResults?.hasAny ?? true}
              viewMode={viewMode}
              gridCols={gridCols}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
    if(isClosed) return null;

  if (isExpanded) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
        >
          {innerExplorer}
        </motion.div>
      </AnimatePresence>
    );
  }



    return (
        <section className="w-full max-w-6xl 2xl:max-w-7xl mx-auto my-8">
        {innerExplorer}
        </section>
    );
}

/* ------------------------------------------------------------------------ */
/* Subcomponents                                                            */
/* ------------------------------------------------------------------------ */

interface ExplorerBannerProps {
  entity: PreviewEntity;
  getCategoryPath: (slug: string | null) => string;
}

function ExplorerBanner({ entity, getCategoryPath }: ExplorerBannerProps) {
  const isProduct = entity.kind === "product";
  const data = entity.data;
  const title = data.title;
  const subtitle = (data as any).subtitle as string | undefined;
  const description = data.descriptionSEO;
  const imageUrl = data.imageUrl;

  const href =
    entity.kind === "category"
      ? getCategoryPath((data as Category).slug)
      : `/produits/detail/${(data as Product).slug}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${entity.kind}-${data.slug}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="h-full"
      >
        <Link
          href={href}
          className="group relative flex flex-col h-full overflow-hidden rounded-[24px] border border-cobam-water-blue/15 bg-white transition-all duration-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.10)] hover:border-cobam-water-blue/30"
        >
          <div className="relative h-56 w-full shrink-0 overflow-hidden bg-gray-50/50">
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt={title || "Preview image"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 380px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-cobam-water-blue/5 to-gray-100" />
            )}

            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white drop-shadow-md">
                {isProduct ? "Produit" : "Catégorie"}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-6 flex-grow bg-gradient-to-br from-white to-gray-50/30">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-xl font-bold leading-tight text-cobam-dark-blue">
                {title || "En savoir plus"}
              </h3>
              <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-cobam-water-blue opacity-0 -translate-x-2 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
            </div>

            {subtitle && (
              <span className="text-xs font-semibold uppercase tracking-wider text-cobam-water-blue mb-3 block">
                {subtitle}
              </span>
            )}

            <p className="text-sm leading-relaxed text-cobam-carbon-grey line-clamp-[7] mt-1">
              {description || "Découvrez notre sélection exclusive."}
            </p>
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------------------- Header + animated search box --------------------- */

interface ExplorerHeaderProps {
  currentCategorySlug: string | null;
  breadcrumbPath: Category[];
  search: string;
  isSearchOpen: boolean;
  onBack: () => void;
  onRootClick: () => void;
  onCrumbClick: (slug: string | null) => void;
  onSearchChange: (val: string) => void;
  onToggleSearch: () => void;
}

function ExplorerHeader({
  currentCategorySlug,
  breadcrumbPath,
  search,
  isSearchOpen,
  onBack,
  onRootClick,
  onCrumbClick,
  onSearchChange,
  onToggleSearch,
}: ExplorerHeaderProps) {
  return (
    <div className="overflow-hidden flex items-center gap-3 border border-black/5 rounded-2xl bg-gray-50/60">
      <button
        type="button"
        onClick={onBack}
        disabled={!currentCategorySlug}
        className={`flex items-center justify-center h-full pl-4 pr-3 py-2 text-xs transition-all ${
          currentCategorySlug
            ? "border-transparent bg-white hover:bg-cobam-water-blue/5 text-cobam-dark-blue"
            : "border-transparent bg-gray-100 text-gray-300 cursor-default"
        }`}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="flex-1 flex items-center gap-1 text-xs text-cobam-carbon-grey min-w-0">
        <button
          type="button"
          onClick={onRootClick}
          className="shrink-0 font-semibold text-cobam-dark-blue hover:text-cobam-water-blue transition-colors"
        >
          Produits
        </button>
        {breadcrumbPath.map((cat, index) => (
          <span key={cat.slug} className="flex items-center gap-1 shrink-0">
            <span className="text-[11px]">/</span>
            <button
              type="button"
              onClick={() => onCrumbClick(cat.slug)}
              className={`hover:text-cobam-water-blue transition-colors ${
                index === breadcrumbPath.length - 1
                  ? "font-semibold text-cobam-dark-blue"
                  : "text-cobam-carbon-grey"
              }`}
            >
              {cat.title}
            </button>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSearch}
          className={`flex items-center justify-center text-xs transition-all ${
            isSearchOpen
              ? "px-2 py-2 border-cobam-water-blue bg-cobam-water-blue/10 hover:bg-cobam-water-blue/20 rounded-xl py-1 text-cobam-water-blue"
              : "pr-4 pl-3 py-3 border-black/10 bg-white text-cobam-carbon-grey hover:bg-cobam-water-blue/5"
          }`}
        >
          {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </button>

        <AnimatePresence initial={false}>
          {isSearchOpen && (
            <motion.div
              key="search-input"
              initial={{ opacity: 0, x: 40, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 280 }}
              exit={{ opacity: 0, x: 40, width: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="pr-4 pl-3 py-2.5 hidden sm:flex items-center gap-2 overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(15,23,42,0.12)]"
            >
              <Search className="h-4 w-4 text-cobam-carbon-grey flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher un produit..."
                className="bg-transparent text-xs md:text-sm text-cobam-dark-blue placeholder:text-cobam-carbon-grey flex-1 focus:outline-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ----------------- Unified view controls (sublevels only) ---------------- */

interface UnifiedViewControlsProps {
  viewMode: ViewMode;
  gridCols: number;
  onViewModeChange: (v: ViewMode) => void;
  onGridColsChange: (n: number) => void;
}

function UnifiedViewControls({
  viewMode,
  gridCols,
  onViewModeChange,
  onGridColsChange,
}: UnifiedViewControlsProps) {
  const buttonClasses = (active: boolean) =>
    `inline-flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-[11px] gap-1 transition-all ${
      active
        ? "border-cobam-water-blue bg-cobam-water-blue/5 text-cobam-water-blue"
        : "border-black/5 bg-white text-cobam-carbon-grey hover:border-cobam-water-blue/40 hover:text-cobam-dark-blue"
    }`;

  return (
    <div className="flex items-center justify-between gap-3 text-[11px] text-cobam-carbon-grey">
      <div className="flex items-center gap-1.5">
        <span className="uppercase tracking-[0.16em]">
          Vue catégories & produits
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={buttonClasses(viewMode === "flex")}
            onClick={() => onViewModeChange("flex")}
          >
            <LayoutPanelTop className="h-3 w-3" />
          </button>
          <button
            type="button"
            className={buttonClasses(viewMode === "grid")}
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="h-3 w-3" />
          </button>
          <button
            type="button"
            className={buttonClasses(viewMode === "list")}
            onClick={() => onViewModeChange("list")}
          >
            <Rows3 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {viewMode === "grid" && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.16em]">
            Colonnes
          </span>
          <select
            value={gridCols}
            onChange={(e) =>
              onGridColsChange(Math.min(4, Math.max(1, Number(e.target.value))))
            }
            className="border border-black/10 bg-white rounded-md px-1.5 py-0.5 text-[11px] text-cobam-dark-blue focus:outline-none"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

/* ---------------------- Unified body with view modes --------------------- */

interface UnifiedExplorerBodyProps {
  isTopLevel: boolean;
  rootCategories: Category[];
  subcategories: Category[];
  productsInCurrent: Product[];
  searchResults: {
    primaryProducts: Product[];
    secondary: ProductWithCatPath[];
    hasAny: boolean;
  } | null;
  getCategoryPathArr: (slug: string | null) => Category[];
  onCategoryHover: (slug: string | null) => void;
  onCategoryClick: (slug: string | null) => void;
  onProductHover: (slug: string) => void;
  onProductLeave: () => void;
  onProductClick: (slug: string) => void;
  hasSearch: boolean;
  searchHasAny: boolean;
  viewMode: ViewMode;
  gridCols: number;
}

function UnifiedExplorerBody({
  isTopLevel,
  rootCategories,
  subcategories,
  productsInCurrent,
  searchResults,
  onCategoryHover,
  onCategoryClick,
  onProductHover,
  onProductLeave,
  onProductClick,
  hasSearch,
  searchHasAny,
  viewMode,
  gridCols,
}: UnifiedExplorerBodyProps) {
  return (
    <div className="flex-1 overflow-hidden rounded-2xl border border-black/5 bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-3 space-y-4">
        {isTopLevel && !hasSearch && (
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cobam-carbon-grey mb-2">
              Univers de produits
            </h3>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rootCategories.map((cat) => (
                <motion.button
                  key={cat.slug}
                  type="button"
                  whileHover={{ translateY: -2 }}
                  transition={{ duration: 0.16 }}
                  onClick={() => onCategoryClick(cat.slug)}
                  onMouseEnter={() => onCategoryHover(cat.slug)}
                  onMouseLeave={() => onCategoryHover(null)}
                  className="group rounded-2xl border border-black/5 bg-gray-50/80 px-3 py-3 text-left hover:border-cobam-water-blue/40 hover:bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.02)] hover:shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition-all"
                >
                  <div className="text-[11px] uppercase tracking-[0.16em] text-cobam-carbon-grey mb-1">
                    Catégorie
                  </div>
                  <div className="text-sm font-semibold text-cobam-dark-blue mb-1.5 line-clamp-2">
                    {cat.title}
                  </div>
                  <div className="text-[11px] text-cobam-carbon-grey line-clamp-3">
                    {getFirstSentence(cat.descriptionSEO)}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {!isTopLevel && !hasSearch && (
          <>
            {subcategories.length > 0 && (
              <SubcategorySection
                view={viewMode}
                subcategories={subcategories}
                onCategoryClick={onCategoryClick}
                onCategoryHover={onCategoryHover}
                gridCols={gridCols}
              />
            )}

            {productsInCurrent.length > 0 && (
              <ProductSection
                title="Produits"
                products={productsInCurrent}
                view={viewMode}
                cols={gridCols}
                onProductHover={onProductHover}
                onProductLeave={onProductLeave}
                onProductClick={onProductClick}
              />
            )}

            {subcategories.length === 0 && productsInCurrent.length === 0 && (
              <EmptyState />
            )}
          </>
        )}

        {hasSearch && searchResults && (
          <>
            {!searchHasAny && <EmptyState />}

            {searchResults.primaryProducts.length > 0 && (
              <ProductSection
                title="Résultats dans cette section"
                products={searchResults.primaryProducts}
                view={viewMode}
                cols={gridCols}
                onProductHover={onProductHover}
                onProductLeave={onProductLeave}
                onProductClick={onProductClick}
              />
            )}

            {searchResults.secondary.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cobam-carbon-grey mb-2">
                  Autres résultats
                </h3>
                <div className="space-y-3">
                  {searchResults.secondary.map(({ product, path }) => {
                    const pathLabel =
                      path.length === 0
                        ? "Produits"
                        : path.map((c) => c.title).join(" / ");
                    return (
                      <div
                        key={`${product.slug}-${path
                          .map((c) => c.slug)
                          .join("/")}`}
                        className="rounded-xl border border-black/5 bg-gray-50/60 px-3 py-2.5"
                      >
                        <div className="text-[10px] uppercase tracking-[0.16em] text-cobam-carbon-grey mb-1">
                          {pathLabel}
                        </div>
                        <ProductCard
                          product={product}
                          compact
                          onHover={onProductHover}
                          onLeave={onProductLeave}
                          onClick={onProductClick}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------- Subcategory section -------------------------- */

interface SubcategorySectionProps {
  view: ViewMode;
  subcategories: Category[];
  onCategoryClick: (slug: string | null) => void;
  onCategoryHover: (slug: string | null) => void;
  gridCols: number;
}

function SubcategorySection({
  view,
  subcategories,
  onCategoryClick,
  onCategoryHover,
  gridCols,
}: SubcategorySectionProps) {
  if (subcategories.length === 0) return null;

  const gridColsClass =
    view === "grid"
      ? gridCols === 1
        ? "grid-cols-1"
        : gridCols === 2
        ? "grid-cols-2"
        : gridCols === 3
        ? "grid-cols-3"
        : "grid-cols-4"
      : "";

  if (view === "list") {
    return (
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cobam-carbon-grey mb-2">
          Sous-catégories
        </h3>
        <div className="flex flex-col divide-y divide-black/5 rounded-xl border border-black/5 bg-gray-50/80">
          {subcategories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onCategoryClick(cat.slug)}
              onMouseEnter={() => onCategoryHover(cat.slug)}
              onMouseLeave={() => onCategoryHover(null)}
              className="flex items-center justify-between px-3 py-2.5 text-sm text-cobam-dark-blue hover:bg-white transition-colors"
            >
              <span className="font-medium">{cat.title}</span>
              <ChevronRight className="h-3 w-3 text-cobam-carbon-grey" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === "grid") {
    return (
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cobam-carbon-grey mb-2">
          Sous-catégories
        </h3>
        <div className={`grid gap-3 ${gridColsClass}`}>
          {subcategories.map((cat) => (
            <motion.button
              key={cat.slug}
              type="button"
              whileHover={{ translateY: -2 }}
              transition={{ duration: 0.16 }}
              onClick={() => onCategoryClick(cat.slug)}
              onMouseEnter={() => onCategoryHover(cat.slug)}
              onMouseLeave={() => onCategoryHover(null)}
              className="group rounded-xl border border-black/5 bg-gray-50/80 px-3 py-3 text-left hover:border-cobam-water-blue/40 hover:bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.02)] hover:shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition-all"
            >
              <div className="text-[11px] uppercase tracking-[0.16em] text-cobam-carbon-grey mb-1">
                Sous-catégorie
              </div>
              <div className="text-sm font-semibold text-cobam-dark-blue mb-1.5 line-clamp-2">
                {cat.title}
              </div>
              <div className="text-[11px] text-cobam-carbon-grey line-clamp-3">
                {getFirstSentence(cat.descriptionSEO)}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // flex mode
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cobam-carbon-grey mb-2">
        Sous-catégories
      </h3>
      <div className="flex flex-wrap gap-2">
        {subcategories.map((cat) => (
          <motion.button
            key={cat.slug}
            type="button"
            whileHover={{ y: -1 }}
            transition={{ duration: 0.12 }}
            onClick={() => onCategoryClick(cat.slug)}
            onMouseEnter={() => onCategoryHover(cat.slug)}
            onMouseLeave={() => onCategoryHover(null)}
            className="rounded-xl border border-black/5 bg-gray-50 px-3 py-2 text-xs md:text-sm text-cobam-dark-blue hover:border-cobam-water-blue/40 hover:bg-white transition-all flex items-center gap-1.5"
          >
            <span className="font-semibold">{cat.title}</span>
            <ChevronRight className="h-3 w-3 text-cobam-carbon-grey" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Product section ----------------------------- */

interface ProductSectionProps {
  title: string;
  products: Product[];
  view: ViewMode;
  cols: number;
  onProductHover: (slug: string) => void;
  onProductLeave: () => void;
  onProductClick: (slug: string) => void;
}

function ProductSection({
  title,
  products,
  view,
  cols,
  onProductHover,
  onProductLeave,
  onProductClick,
}: ProductSectionProps) {
  if (products.length === 0) return null;

  const gridColsClass =
    view === "grid"
      ? cols === 1
        ? "grid-cols-1"
        : cols === 2
        ? "grid-cols-2"
        : cols === 3
        ? "grid-cols-3"
        : "grid-cols-4"
      : "";

  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cobam-carbon-grey mb-2">
        {title}
      </h3>

      {view === "list" && (
        <div className="flex flex-col divide-y divide-black/5 rounded-xl border border-black/5 bg-gray-50/80">
          {products.map((prod) => (
            <button
              key={prod.slug}
              type="button"
              onMouseEnter={() => onProductHover(prod.slug)}
              onMouseLeave={onProductLeave}
              onClick={() => onProductClick(prod.slug)}
              className="flex items-start justify-between px-3 py-2.5 text-left hover:bg-white transition-colors"
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-cobam-carbon-grey mb-0.5">
                  {prod.subtitle || "Produit"}
                </div>
                <div className="text-sm font-semibold text-cobam-dark-blue line-clamp-2">
                  {prod.title}
                </div>
              </div>
              <ChevronRight className="h-3 w-3 text-cobam-carbon-grey" />
            </button>
          ))}
        </div>
      )}

      {view === "grid" && (
        <div className={`grid gap-3 ${gridColsClass}`}>
          {products.map((prod) => (
            <ProductCard
              key={prod.slug}
              product={prod}
              onHover={onProductHover}
              onLeave={onProductLeave}
              onClick={onProductClick}
            />
          ))}
        </div>
      )}

      {view === "flex" && (
        <div className="flex flex-wrap gap-3">
          {products.map((prod) => (
            <div
              key={prod.slug}
              className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)]"
            >
              <ProductCard
                product={prod}
                onHover={onProductHover}
                onLeave={onProductLeave}
                onClick={onProductClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Misc pieces ------------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3 text-cobam-carbon-grey">
      <FileSearch2 className="h-8 w-8 text-cobam-carbon-grey/70" />
      <div className="text-sm font-semibold text-cobam-dark-blue">
        Aucun résultat trouvé
      </div>
      <p className="text-xs max-w-xs">
        Essayez de modifier votre recherche ou de naviguer dans une autre
        catégorie.
      </p>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  onHover: (slug: string) => void;
  onLeave: () => void;
  onClick: (slug: string) => void;
}

function ProductCard({
  product,
  compact = false,
  onHover,
  onLeave,
  onClick,
}: ProductCardProps) {
  return (
    <motion.button
      type="button"
      onMouseEnter={() => onHover(product.slug)}
      onMouseLeave={onLeave}
      onClick={() => onClick(product.slug)}
      whileHover={{ translateY: -2 }}
      transition={{ duration: 0.16 }}
      className={`group h-full rounded-xl border border-transparent bg-gray-50/70 px-3 py-3 text-left shadow-[0_0_0_1px_rgba(15,23,42,0.02)] hover:bg-white hover:border-cobam-water-blue/30 hover:shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition-all ${
        compact ? "w-full" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-cobam-carbon-grey mb-1 line-clamp-1">
            {product.subtitle || "Produit"}
          </div>
          <div className="text-sm font-semibold text-cobam-dark-blue mb-1.5 line-clamp-2">
            {product.title}
          </div>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-cobam-carbon-grey/80 mt-0.5" />
      </div>
      <div className="text-[11px] text-cobam-carbon-grey line-clamp-3">
        {getFirstSentence(product.descriptionSEO) ||
          "Voir la fiche produit détaillée."}
      </div>
    </motion.button>
  );
}
