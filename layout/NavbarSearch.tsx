"use client";

import { useEffect, useRef, useState } from "react";
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


const POPULAR_SUGGESTIONS = ["Brique", "Ciment colle", "SikaCeram"]

export default function NavbarSearch({ isOpen, onClose }: NavbarSearchProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<PublicProductIndexItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

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
    setSearchError(null);
    searchControllerRef.current?.abort();
    searchControllerRef.current = null;
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetSearchState();
      return;
    }

    const normalized = searchInput.trim().replace(/\s+/g, " ");
    if (!normalized) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    searchControllerRef.current?.abort();
    searchControllerRef.current = null;
    setIsSearching(true);
    setSearchError(null);

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
            search: normalized,
          });
          const response = await fetch(
            `/api/public/all-products?${params.toString()}`,
            { signal: controller.signal }
          );
          const payload = await response.json();

          if (!response.ok || !payload.ok) {
            throw new Error(payload.message || "Erreur lors de la recherche.");
          }

          setSearchResults(payload.items ?? []);
        } catch (error: unknown) {
          if (controller.signal.aborted) return;
          setSearchResults([]);
          setSearchError(error instanceof Error ? error.message : "Erreur inconnue.");
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

  const goToProduct = (product: PublicProductIndexItem["product"]) => {
    const href =
      product.entityType === "SINGLE"
        ? `/produits/${product.slug}`
        : product.entityType === "PACK"
          ? `/produits/packs/${product.slug}`
          : `/produits/familles/${product.slug}`;

    router.push(href);
    onClose();
  };

  const goToSearchPage = () => {
    const normalized = searchInput.trim();
    if (!normalized) return;
    router.push(`/produits?search=${encodeURIComponent(normalized)}`);
    onClose();
  };

  const results = searchResults.map(r => r.product);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-white/95 backdrop-blur-xl"
        >
          {/* Header Area */}
          <div className="flex items-center justify-between px-6 py-8 md:px-12">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-cobam-water-blue/10 rounded-full">
                  <Search size={22} className="text-cobam-water-blue" />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cobam-carbon-grey">
                  Recherche Intelligente
               </span>
            </div>

            <button
              onClick={onClose}
              className="group flex items-center gap-2 p-2 text-cobam-carbon-grey hover:text-cobam-dark-blue transition-colors"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                Fermer (Esc)
              </span>
              <X size={24} />
            </button>
          </div>

          {/* Main Search Input Section */}
          <div className="max-w-5xl w-full mx-auto">
            <div className="max-w-5xl w-full mx-auto">
              <div className="relative group">
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
                      setTargetIndex(prev => (prev === null ? 0 : Math.min(prev + 1, results.length - 1)));
                    }
                    if (e.key === "ArrowUp") {
                      setTargetIndex(prev => (prev === null ? results.length - 1 : Math.max(prev - 1, 0)));
                    }
                  }}
                  placeholder="Que recherchez-vous ?"
                  className="focus:outline-none w-full bg-transparent text-4xl md:text-5xl font-light text-cobam-dark-blue placeholder:text-cobam-quill-grey/40 py-4 transition-all"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="h-[2px] bg-cobam-water-blue origin-left"
                />
                
                {isSearching && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-cobam-water-blue h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Results Area */}
              <div className="mt-12 overflow-y-auto max-h-[50vh] pr-4 custom-scrollbar" ref={scrollRef}>
                <AnimatePresence mode="popLayout">
                  {!searchInput.trim() ? (
                    <motion.div
                      key="trends"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-cobam-quill-grey">
                        Suggestions populaires
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {POPULAR_SUGGESTIONS.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchInput(tag)}
                            className="px-5 py-2.5 rounded-full border border-cobam-quill-grey/20 text-sm text-cobam-dark-blue hover:border-cobam-water-blue hover:text-cobam-water-blue transition-all"
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
                      className="grid grid-cols-1 h-full md:grid-cols-2 gap-4 p-12"
                    >
                      {results.map((product, idx) => (
                        <motion.button
                          key={`${product.entityType}-${product.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onMouseEnter={() => setTargetIndex(idx)}
                          onClick={() => goToProduct(product)}
                          className={cn(
                            "flex items-center gap-5 p-4 rounded-2xl border text-left transition-all duration-300",
                            targetIndex === idx 
                              ? "bg-white border-cobam-water-blue shadow-xl shadow-cobam-water-blue/5 -translate-y-1" 
                              : "bg-transparent border-transparent hover:bg-white/40"
                          )}
                        >
                          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-cobam-light-bg border border-cobam-quill-grey/10">
                            {product.imageThumbnailUrl ? (
                              <Image
                                src={product.imageThumbnailUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full bg-cobam-quill-grey/5">
                                <Search className="text-cobam-quill-grey/20" size={24} />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cobam-water-blue mb-1 block">
                              {product.entityType === "FAMILY" ? "Famille" : product.entityType === "PACK" ? "Pack" : "Produit"}
                            </span>
                            <h4 className="text-lg font-medium text-cobam-dark-blue truncate leading-tight mb-1">
                              {product.name}
                            </h4>
                            <p className="text-sm text-cobam-carbon-grey truncate mb-2">
                              {product.brandName || "Cobam Collection"}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cobam-water-blue opacity-0 group-hover:opacity-100 transition-opacity">
                              Voir Détails <ArrowRight size={12} />
                            </div>
                          </div>
                        </motion.button>
                      ))}

                      {results.length >= 6 && (
                        <button
                          onClick={goToSearchPage}
                          className="md:col-span-2 flex items-center justify-center gap-3 py-6 rounded-2xl border border-dashed border-cobam-quill-grey/30 text-cobam-carbon-grey hover:text-cobam-water-blue hover:border-cobam-water-blue hover:bg-cobam-water-blue/5 transition-all"
                        >
                           <span className="text-sm font-semibold tracking-widest uppercase">Voir tous les résultats</span>
                           <ArrowRight size={18} />
                        </button>
                      )}
                    </motion.div>
                  ) : !isSearching ? (
                    <motion.div
                      key="no-results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center"
                    >
                      <p className="text-cobam-quill-grey text-lg">
                        Aucun résultat pour <span className="text-cobam-dark-blue font-medium italic">"{searchInput}"</span>
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer Decor */}
          <div className="p-12 text-center hidden md:block">
             <Image 
                src="/images/logos/cobam-group/logo-vector.svg" 
                alt="Logo" 
                width={150} 
                height={50} 
                className="mx-auto opacity-5 grayscale"
             />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
