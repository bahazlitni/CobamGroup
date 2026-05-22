"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PublicProductIndexItem } from "@/features/products/public";

interface NavbarSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SUGGESTIONS = ["Brique", "Ciment colle", "SikaCeram"];

export default function NavbarSearch({ isOpen, onClose }: NavbarSearchProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<PublicProductIndexItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchControllerRef = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<number | null>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "auto";
      };
    }
  }, [isOpen]);

  // Command + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose(); // This should actually be a toggle, but for now we trust the parent
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const resetSearchState = () => {
    setSearchInput("");
    setSearchResults([]);
    setIsSearching(false);
    setTargetIndex(null);
    searchControllerRef.current?.abort();
    searchControllerRef.current = null;
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
  };

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [advBrandValue, setAdvBrandValue] = useState("");
  const [advBrandOp, setAdvBrandOp] = useState("1");
  const [advBindBrandName, setAdvBindBrandName] = useState("&");
  const [advNameValue, setAdvNameValue] = useState("");
  const [advNameOp, setAdvNameOp] = useState("1");
  const [advBindNameSku, setAdvBindNameSku] = useState("&");
  const [advSkuValue, setAdvSkuValue] = useState("");
  const [advSkuOp, setAdvSkuOp] = useState("1");

  const compileAdvancedSearch = useCallback(() => {
    const parts = [];
    if (advBrandValue.trim()) parts.push(`brand:${advBrandOp}=${advBrandValue.trim()}`);
    if (advNameValue.trim()) {
      if (parts.length > 0) parts.push(advBindBrandName);
      parts.push(`name:${advNameOp}=${advNameValue.trim()}`);
    }
    if (advSkuValue.trim()) {
      if (parts.length > 0) parts.push(advBindNameSku);
      parts.push(`sku:${advSkuOp}=${advSkuValue.trim()}`);
    }
    return parts.join("");
  }, [
    advBrandValue,
    advBrandOp,
    advBindBrandName,
    advNameValue,
    advNameOp,
    advBindNameSku,
    advSkuValue,
    advSkuOp,
  ]);

  useEffect(() => {
    if (isOpen) {
      setIsAdvancedSearchOpen(false);
      setAdvBrandValue("");
      setAdvBrandOp("1");
      setAdvBindBrandName("&");
      setAdvNameValue("");
      setAdvNameOp("1");
      setAdvBindNameSku("&");
      setAdvSkuValue("");
      setAdvSkuOp("1");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAdvancedSearchOpen) {
      setSearchInput(compileAdvancedSearch());
    }
  }, [compileAdvancedSearch, isAdvancedSearchOpen]);

  useEffect(() => {
    if (!isOpen) {
      resetSearchState();
      return;
    }

    const normalized = searchInput.trim().replace(/\s+/g, " ");
    if (!normalized) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    searchControllerRef.current?.abort();
    searchControllerRef.current = null;
    setIsSearching(true);

    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(() => {
      const controller = new AbortController();
      searchControllerRef.current = controller;

      void (async () => {
        try {
          const params = new URLSearchParams({
            page: "1",
            pageSize: "6",
            cap: "6",
            search: normalized,
          });
          const response = await fetch(`/api/public/all-products?${params.toString()}`, {
            signal: controller.signal,
          });
          const payload = await response.json();

          if (!response.ok || !payload.ok) {
            throw new Error(payload.message || "Erreur lors de la recherche.");
          }

          setSearchResults(payload.items ?? []);
        } catch {
          if (controller.signal.aborted) return;
          setSearchResults([]);
        } finally {
          if (searchControllerRef.current === controller) {
            searchControllerRef.current = null;
          }
          if (!controller.signal.aborted) {
            setIsSearching(false);
          }
        }
      })();
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchInput, isOpen]);

  const goToProduct = (item: PublicProductIndexItem) => {
    const href =
      item.product.entityType === "FAMILY"
        ? `/produits/${item.category.slug}/${item.subcategory.slug}/famille/${item.product.slug}`
        : `/produits/${item.category.slug}/${item.subcategory.slug}/${item.product.slug}`;

    router.push(href);
    onClose();
  };

  const goToSearchPage = () => {
    const normalized = searchInput.trim();
    if (!normalized) return;
    router.push(`/produits?search=${encodeURIComponent(normalized)}`);
    onClose();
  };

  const results = searchResults;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-cobam-dark-blue fixed inset-0 z-[100] flex h-full w-full flex-col overflow-hidden bg-white/95 backdrop-blur-2xl"
        >
          {/* Header Area */}
          <div className="relative z-10 flex items-center justify-between px-8 py-10 md:px-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="bg-cobam-water-blue/10 border-cobam-water-blue/20 rounded-full border p-3 backdrop-blur-md">
                <Search size={22} className="text-cobam-water-blue" />
              </div>
              <span className="text-cobam-carbon-grey/60 text-xs font-bold tracking-[0.4em] uppercase">
                Commande Globale
              </span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="group flex items-center gap-3 rounded-full p-3 transition-all outline-none hover:bg-black/5"
            >
              <span className="text-cobam-carbon-grey/60 text-[10px] font-bold tracking-[0.2em] uppercase opacity-0 transition-opacity group-hover:opacity-100">
                Fermer (Esc)
              </span>
              <div className="group-hover:bg-cobam-water-blue rounded-full bg-black/5 p-2 transition-colors group-hover:text-white">
                <X
                  size={20}
                  className="text-cobam-carbon-grey transition-colors group-hover:text-white"
                />
              </div>
            </motion.button>
          </div>

          {/* Main Content Area */}
          <div className="custom-scrollbar relative z-0 flex flex-1 flex-col overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl px-8 pt-[10vh] pb-24 md:px-16">
              {/* Input Area */}
              <div className="group relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") onClose();
                    if (e.key === "Enter") {
                      if (targetIndex !== null && results[targetIndex]) {
                        goToProduct(results[targetIndex]);
                      } else {
                        goToSearchPage();
                      }
                    }
                    if (e.key === "ArrowDown") {
                      setTargetIndex((prev) =>
                        prev === null ? 0 : Math.min(prev + 1, results.length - 1),
                      );
                    }
                    if (e.key === "ArrowUp") {
                      setTargetIndex((prev) =>
                        prev === null ? results.length - 1 : Math.max(prev - 1, 0),
                      );
                    }
                  }}
                  placeholder="Que recherchez-vous ?"
                  className="text-cobam-dark-blue placeholder:text-cobam-carbon-grey/20 w-full bg-transparent py-6 text-5xl font-light tracking-tight transition-all focus:outline-none md:text-7xl lg:text-[5rem]"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                />
                <div className="absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-6">
                  {/* Advanced search keeps the clean default state uncluttered. */}
                  {isSearching && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Loader2 className="text-cobam-water-blue h-10 w-10 animate-spin" />
                    </motion.div>
                  )}
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className="from-cobam-water-blue/80 via-cobam-water-blue/20 relative h-[2px] origin-left bg-gradient-to-r to-transparent"
                >
                  <div className="bg-cobam-water-blue/10 pointer-events-none absolute top-1/2 left-0 h-32 w-32 -translate-y-1/2 rounded-full blur-[50px]" />
                </motion.div>
              </div>

              {/* Results Area */}
              <div className="mt-16" ref={scrollRef}>
                <AnimatePresence mode="popLayout">
                  {!searchInput.trim() ? (
                    <motion.div
                      key="trends"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-8"
                    >
                      <p className="text-cobam-carbon-grey/60 flex items-center gap-4 text-[10px] font-bold tracking-[0.4em] uppercase">
                        <span className="bg-cobam-carbon-grey/20 h-px w-8" />
                        Suggestions populaires
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {POPULAR_SUGGESTIONS.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchInput(tag)}
                            className="border-cobam-quill-grey/40 bg-cobam-light-bg text-cobam-dark-blue hover:border-cobam-water-blue hover:text-cobam-water-blue hover:bg-cobam-water-blue/5 rounded-full border px-6 py-3 text-sm font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,174,239,0.05)]"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : results.length > 0 ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 gap-6 md:grid-cols-2"
                    >
                      {results.map((product, idx) => (
                        <motion.button
                          key={`${product.product.entityType}-${product.product.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onMouseEnter={() => setTargetIndex(idx)}
                          onClick={() => goToProduct(product)}
                          className={cn(
                            "group relative flex items-center gap-6 overflow-hidden rounded-lg border p-5 text-left transition-all duration-500",
                            targetIndex === idx
                              ? "border-cobam-water-blue -translate-y-1 bg-white shadow-[0_10px_40px_rgba(0,174,239,0.08)]"
                              : "border-transparent bg-transparent hover:bg-white/60",
                          )}
                        >
                          <div
                            className={cn(
                              "from-cobam-water-blue/5 absolute inset-0 bg-gradient-to-tr to-transparent opacity-0 transition-opacity duration-500",
                              targetIndex === idx ? "opacity-100" : "",
                            )}
                          />

                          <div className="border-cobam-quill-grey/20 relative z-10 flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white p-2 shadow-sm">
                            {product.product.imageThumbnailUrl ? (
                              <Image
                                src={product.product.imageThumbnailUrl}
                                alt={product.product.name}
                                fill
                                className="object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <Search className="text-cobam-carbon-grey/20" size={32} />
                            )}
                          </div>

                          <div className="z-10 min-w-0 flex-1">
                            <span className="text-cobam-water-blue mb-2 block text-[10px] font-bold tracking-[0.3em] uppercase">
                              {product.product.entityType === "FAMILY"
                                ? "Famille"
                                : product.product.entityType === "VARIANT"
                                  ? "Variante"
                                  : "Produit"}
                            </span>
                            <h4
                              className="text-cobam-dark-blue mb-2 truncate text-xl leading-tight font-light"
                              style={{ fontFamily: "var(--font-playfair), serif" }}
                            >
                              {product.product.name}
                            </h4>
                            <p className="text-cobam-carbon-grey mb-4 truncate text-sm font-medium">
                              {product.product.brandName || product.subcategory.name}
                            </p>
                            <div className="text-cobam-carbon-grey/60 group-hover:text-cobam-water-blue flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase transition-colors">
                              Voir Détails{" "}
                              <ArrowRight
                                size={14}
                                className="transition-transform duration-500 group-hover:translate-x-2"
                              />
                            </div>
                          </div>
                        </motion.button>
                      ))}

                      {results.length >= 6 && (
                        <button
                          onClick={goToSearchPage}
                          className="border-cobam-quill-grey/50 text-cobam-carbon-grey hover:text-cobam-water-blue hover:border-cobam-water-blue hover:bg-cobam-water-blue/5 group flex items-center justify-center gap-4 rounded-lg border border-dashed bg-white/40 py-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,174,239,0.05)] md:col-span-2"
                        >
                          <span className="text-sm font-bold tracking-[0.2em] uppercase">
                            Voir tous les résultats
                          </span>
                          <ArrowRight
                            size={20}
                            className="text-cobam-water-blue transition-transform duration-500 group-hover:translate-x-3"
                          />
                        </button>
                      )}
                    </motion.div>
                  ) : !isSearching ? (
                    <motion.div
                      key="no-results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center py-24 text-center"
                    >
                      <div className="bg-cobam-quill-grey/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                        <Search size={32} className="text-cobam-carbon-grey/30" />
                      </div>
                      <p className="text-cobam-carbon-grey text-xl font-light">
                        Aucun résultat pour{" "}
                        <span className="text-cobam-dark-blue font-medium italic">
                          &quot;{searchInput}&quot;
                        </span>
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer Decor */}
          <div className="pointer-events-none absolute bottom-12 hidden w-full text-center opacity-20 md:block">
            <Image
              src="/images/logos/cobam-group/logo-vector.svg"
              alt="Logo"
              width={200}
              height={60}
              className="mx-auto block opacity-10 grayscale"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
