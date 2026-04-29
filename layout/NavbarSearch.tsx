"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    return parts.join('');
  }, [advBrandValue, advBrandOp, advBindBrandName, advNameValue, advNameOp, advBindNameSku, advSkuValue, advSkuOp]);

  useEffect(() => {
    if (isOpen) {
      setIsAdvancedSearchOpen(false);
      setAdvBrandValue(""); setAdvBrandOp("1"); setAdvBindBrandName("&");
      setAdvNameValue(""); setAdvNameOp("1"); setAdvBindNameSku("&");
      setAdvSkuValue(""); setAdvSkuOp("1");
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
          className="fixed inset-0 z-[100] flex flex-col w-full h-full bg-white/95 backdrop-blur-2xl text-cobam-dark-blue overflow-hidden"
        >
          {/* Header Area */}
          <div className="flex items-center justify-between px-8 py-10 md:px-16 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="p-3 bg-cobam-water-blue/10 rounded-full border border-cobam-water-blue/20 backdrop-blur-md">
                <Search size={22} className="text-cobam-water-blue" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-cobam-carbon-grey/60">
                Commande Globale
              </span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="group flex items-center gap-3 p-3 rounded-full hover:bg-black/5 transition-all outline-none"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cobam-carbon-grey/60 opacity-0 group-hover:opacity-100 transition-opacity">
                Fermer (Esc)
              </span>
              <div className="bg-black/5 rounded-full p-2 group-hover:bg-cobam-water-blue group-hover:text-white transition-colors">
                 <X size={20} className="text-cobam-carbon-grey group-hover:text-white transition-colors" />
              </div>
            </motion.button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative z-0">
            <div className="max-w-6xl w-full mx-auto px-8 md:px-16 pt-[10vh] pb-24">
              
              {/* Input Area */}
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
                  className="focus:outline-none w-full bg-transparent text-5xl md:text-7xl lg:text-[5rem] font-light text-cobam-dark-blue placeholder:text-cobam-carbon-grey/20 py-6 transition-all tracking-tight"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-6">
                  {/* Note: In a real implementation we would render Settings2 here if isAdvancedSearch was requested, but right now we focus on the majestic styling first without cluttering the clean state */}
                  {isSearching && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                       <Loader2 className="animate-spin text-cobam-water-blue h-10 w-10" />
                    </motion.div>
                  )}
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className="h-[2px] bg-gradient-to-r from-cobam-water-blue/80 via-cobam-water-blue/20 to-transparent origin-left relative"
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-cobam-water-blue/10 blur-[50px] rounded-full pointer-events-none" />
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
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-cobam-carbon-grey/60 flex items-center gap-4">
                        <span className="w-8 h-px bg-cobam-carbon-grey/20" />
                        Suggestions populaires
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {POPULAR_SUGGESTIONS.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchInput(tag)}
                            className="px-6 py-3 rounded-full border border-cobam-quill-grey/40 bg-cobam-light-bg text-sm font-medium text-cobam-dark-blue hover:border-cobam-water-blue hover:text-cobam-water-blue hover:bg-cobam-water-blue/5 hover:shadow-[0_0_20px_rgba(0,174,239,0.05)] transition-all duration-300"
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
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
                             "group flex items-center gap-6 p-5 rounded-lg border text-left transition-all duration-500 overflow-hidden relative",
                             targetIndex === idx
                               ? "bg-white border-cobam-water-blue -translate-y-1 shadow-[0_10px_40px_rgba(0,174,239,0.08)]"
                               : "bg-transparent border-transparent hover:bg-white/60"
                          )}
                        >
                          <div className={cn("absolute inset-0 bg-gradient-to-tr from-cobam-water-blue/5 to-transparent opacity-0 transition-opacity duration-500", targetIndex === idx ? "opacity-100" : "")} />
                          
                          <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-white border border-cobam-quill-grey/20 shadow-sm z-10 flex items-center justify-center p-2">
                            {product.product.imageThumbnailUrl ? (
                              <Image
                                src={product.product.imageThumbnailUrl}
                                alt={product.product.name}
                                fill
                                className="object-contain p-2 group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <Search className="text-cobam-carbon-grey/20" size={32} />
                            )}
                          </div>

                          <div className="flex-1 min-w-0 z-10">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cobam-water-blue mb-2 block">
                              {product.product.entityType === "FAMILY" ? "Famille" : product.product.entityType === "PACK" ? "Pack" : product.product.entityType === "VARIANT" ? "Variante" : "Produit"}
                            </span>
                            <h4 className="text-xl font-light text-cobam-dark-blue truncate leading-tight mb-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
                              {product.product.name}
                            </h4>
                            <p className="text-sm font-medium text-cobam-carbon-grey truncate mb-4">
                              {product.product.brandName || product.subcategory.name}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-cobam-carbon-grey/60 group-hover:text-cobam-water-blue transition-colors">
                              Voir Détails <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
                            </div>
                          </div>
                        </motion.button>
                      ))}

                      {results.length >= 6 && (
                        <button
                          onClick={goToSearchPage}
                          className="md:col-span-2 flex items-center justify-center gap-4 py-8 rounded-lg border border-dashed border-cobam-quill-grey/50 bg-white/40 text-cobam-carbon-grey hover:text-cobam-water-blue hover:border-cobam-water-blue hover:bg-cobam-water-blue/5 hover:shadow-[0_0_30px_rgba(0,174,239,0.05)] transition-all duration-300 group"
                        >
                          <span className="text-sm font-bold tracking-[0.2em] uppercase">Voir tous les résultats</span>
                          <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform duration-500 text-cobam-water-blue" />
                        </button>
                      )}
                    </motion.div>
                  ) : !isSearching ? (
                    <motion.div
                      key="no-results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-24 text-center flex flex-col items-center"
                    >
                      <div className="w-20 h-20 bg-cobam-quill-grey/10 rounded-full flex items-center justify-center mb-6">
                         <Search size={32} className="text-cobam-carbon-grey/30" />
                      </div>
                      <p className="text-cobam-carbon-grey text-xl font-light">
                        Aucun résultat pour <span className="text-cobam-dark-blue font-medium italic">"{searchInput}"</span>
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Footer Decor */}
          <div className="absolute bottom-12 w-full text-center pointer-events-none opacity-20 hidden md:block">
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
