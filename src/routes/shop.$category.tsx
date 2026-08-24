import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getShopProductsPagedDb, getShopCategoryBrandsDb } from "@/lib/api/products.functions";
import { Product } from "@/lib/products";
import { useCart } from "@/components/site/cart-context";
import {
  Star, ShoppingBag, Eye, Filter, ArrowUpDown, Search,
  ChevronLeft, ChevronRight, Loader2, SlidersHorizontal, Check, X
} from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/shop/$category")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || "",
    };
  },
  head: ({ params }) => {
    const name = getCategoryName(params.category);
    const title = `${name} Wholesale to Retail | Commercial Pool Supplies`;
    const description = `Shop wholesale to retail commercial-grade ${name} at direct trade pricing. Buy ${name} from Pentair, Hayward, Jandy & Raypak with fast shipping from Nashville TN, LA, Dallas & Orlando.`;
    const categoryUrl = `https://poolsupplywholesalers.com/shop/${params.category}`;

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://poolsupplywholesalers.com" },
        { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://poolsupplywholesalers.com/shop/all" },
        { "@type": "ListItem", "position": 3, "name": name, "item": categoryUrl }
      ]
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: `wholesale to retail ${name}, buy wholesale ${name} at retail, ${name} wholesale supplier, ${name} Nashville TN, pentair ${name}, hayward ${name}, trade price pool equipment` },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: categoryUrl },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: categoryUrl }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(breadcrumbLd) }]
    };
  },
  component: CategoryPage,
});

function getCategoryName(slug: string): string {
  switch (slug.toLowerCase()) {
    case "all": return "All Products";
    case "pool-and-spa":
    case "pool-spa": return "Pool & Spa";
    case "parts-and-hardware":
    case "parts-hardware": return "Parts & Hardware";
    case "chemicals": return "Chemicals";
    case "maintenance-and-cleaning":
    case "maintenance-cleaning": return "Maintenance & Cleaning";
    case "safety-and-accessibility":
    case "safety-accessibility": return "Safety & Accessibility";
    case "pool-pumps":
    case "pumps": return "Pool Pumps";
    case "pool-lights":
    case "lights": return "Pool Lights";
    case "pool-cleaners":
    case "cleaners": return "Pool Cleaners";
    case "pool-heaters":
    case "heaters": return "Pool Heaters";
    case "pool-filters":
    case "filters": return "Pool Filters";
    case "electric-heat-pumps": return "Electric Heat Pumps";
    case "automation-systems":
    case "automation": return "Automation Systems";
    case "blowers": return "Blowers";
    case "chlorine-feeders": return "Chlorine Feeders";
    case "salt-systems": return "Salt Systems";
    case "skid-systems": return "Skid Systems";
    case "bulk": return "Bulk";
    case "motors": return "Motors";
    case "plumbing": return "Plumbing";
    case "pool-kits": return "Pool Kits";
    case "algaecides": return "Algaecides";
    case "balancers": return "Balancers";
    case "cal-hypo": return "Cal-Hypo";
    case "dichlor": return "Dichlor";
    case "deck-products": return "Deck Products";
    case "maintenance": return "Maintenance";
    case "plaster": return "Plaster";
    case "ladders-and-rails": return "Ladders & Rails";
    default: return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
}

const PAGE_SIZE = 35;

function CategoryPage() {
  const { category } = useParams({ from: "/shop/$category" });
  const { q: urlSearch } = Route.useSearch();
  const categoryName = getCategoryName(category);

  // State: filters & pagination
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(urlSearch || "");
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch || "");
  const [sortBy, setSortBy] = useState<"rating-desc" | "price-asc" | "price-desc" | "name-asc">("rating-desc");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce search input (500ms)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((val: string) => {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 500);
  }, []);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [category, debouncedSearch, sortBy, selectedBrands, inStockOnly]);

  // Sync URL search param
  useEffect(() => {
    if (urlSearch !== undefined) {
      setSearchQuery(urlSearch);
      setDebouncedSearch(urlSearch);
    }
  }, [urlSearch]);

  // Reset brand selection when category route changes
  useEffect(() => {
    setSelectedBrands([]);
    setBrandSearch("");
  }, [category]);

  // ── Category Brands Query for Sidebar ─────────────────────────────────────
  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ["shop-category-brands", category],
    queryFn: async () => {
      const res = await getShopCategoryBrandsDb({
        data: {
          category: category || "all",
        }
      });
      return res?.brands || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const availableBrands = useMemo(() => {
    return brandsData || [];
  }, [brandsData]);

  const filteredBrandsList = useMemo(() => {
    if (!brandSearch.trim()) return availableBrands;
    const term = brandSearch.toLowerCase().trim();
    return availableBrands.filter(b => b.toLowerCase().includes(term));
  }, [availableBrands, brandSearch]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setPage(1);
  };

  // ── Server-Side Products Query ────────────────────────────────────────────
  const { data: result, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["shop-products", category, page, debouncedSearch, sortBy, selectedBrands, inStockOnly],
    queryFn: async () => {
      const res = await getShopProductsPagedDb({
        data: {
          page,
          limit: PAGE_SIZE,
          category: category || "all",
          search: debouncedSearch || undefined,
          sort: sortBy,
          brands: selectedBrands.length > 0 ? selectedBrands : undefined,
          inStockOnly: inStockOnly || undefined,
        }
      });
      return res;
    },
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });

  const products: Product[] = result?.products || [];
  const total: number = result?.total || 0;
  const totalPages: number = result?.pages || 1;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 140, behavior: "smooth" });
    }
  };

  const startItem = total > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endItem = Math.min(page * PAGE_SIZE, total);

  // Reusable Brand Filter Component for Desktop and Mobile
  const BrandFilterSection = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          Filter by Brand
          {availableBrands.length > 0 && (
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
              {availableBrands.length}
            </span>
          )}
        </h3>
        {selectedBrands.length > 0 && (
          <button
            type="button"
            onClick={() => setSelectedBrands([])}
            className="text-[11px] font-bold text-cyan-600 hover:text-cyan-700 cursor-pointer"
          >
            Clear ({selectedBrands.length})
          </button>
        )}
      </div>

      {availableBrands.length > 6 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full pl-8 pr-6 h-8 text-[11px] border border-slate-200 bg-slate-50/70 rounded-lg focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
          />
          {brandSearch && (
            <button
              onClick={() => setBrandSearch("")}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {isLoadingBrands ? (
        <div className="space-y-2 py-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
          ))}
        </div>
      ) : filteredBrandsList.length > 0 ? (
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          {filteredBrandsList.map((brand) => {
            const isChecked = selectedBrands.includes(brand);
            return (
              <label
                key={brand}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer select-none transition-colors ${
                  isChecked ? "bg-cyan-50 text-cyan-900 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleBrand(brand)}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 size-3.5"
                />
                <span className="truncate">{brand}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 italic py-1">
          {brandSearch ? "No matching brands" : "No brands found"}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1 pt-28 pb-20">
        {/* Category Hero */}
        <section className="bg-gradient-to-b from-surface to-background border-b border-border/50 py-8 md:py-10 mb-6 md:mb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-bold">Wholesale Catalog</span>
              <h1 className="mt-1.5 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">{categoryName}</h1>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed font-medium">
                Premium commercial-grade {categoryName.toLowerCase()} engineered for high reliability, performance, and efficiency. Enjoy exclusive bulk wholesale rates.
              </p>
            </div>

            {/* Top Right Search Bar */}
            <div className="w-full md:w-[440px] lg:w-[480px] shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${categoryName}...`}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-9 h-11 border border-slate-200 bg-white shadow-2xs rounded-2xl text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setDebouncedSearch(""); setPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6 flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer"
            >
              <Filter className="size-4 text-cyan-600" />
              {mobileFiltersOpen ? "Hide Filters" : "Filter Products"}
              {(selectedBrands.length > 0 || inStockOnly) && (
                <span className="size-5 rounded-full bg-cyan-600 text-white text-[10px] grid place-items-center font-bold">
                  {selectedBrands.length + (inStockOnly ? 1 : 0)}
                </span>
              )}
            </button>
            <span className="text-xs font-bold text-slate-500">{total.toLocaleString()} items</span>
          </div>

          <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
            {/* Sidebar Filters */}
            <aside className={`space-y-6 lg:sticky lg:top-28 p-5 lg:p-0 rounded-2xl lg:rounded-none bg-white lg:bg-transparent border lg:border-none border-slate-200 shadow-sm lg:shadow-none ${mobileFiltersOpen ? "block mb-6 lg:mb-0" : "hidden lg:block"}`}>
              <div className="flex items-center justify-between pb-4 border-b border-border font-bold text-sm text-foreground">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-cyan-600" /> Filters
                </span>
                {(selectedBrands.length > 0 || inStockOnly || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrands([]);
                      setInStockOnly(false);
                      setSearchQuery("");
                      setDebouncedSearch("");
                      setPage(1);
                    }}
                    className="text-xs text-cyan-600 hover:text-cyan-700 font-bold cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
                  className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-bold text-slate-800 text-xs cursor-pointer focus:ring-0 shadow-2xs"
                >
                  <option value="rating-desc">Best Sellers</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="name-asc">Name: A → Z</option>
                </select>
              </div>

              {/* Brands Filter */}
              <BrandFilterSection />

              {/* Stock Filter */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Availability</h3>
                <label className="flex items-center gap-2.5 text-sm font-medium text-foreground/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                    className="rounded border-border text-primary focus:ring-primary size-4"
                  />
                  In Stock Only
                </label>
              </div>
            </aside>

            {/* Products Area */}
            <div className="space-y-6">
              {/* Active Filter Chips */}
              {selectedBrands.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pb-2">
                  <span className="text-xs font-semibold text-slate-500">Active Brands:</span>
                  {selectedBrands.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold"
                    >
                      {b}
                      <button
                        type="button"
                        onClick={() => toggleBrand(b)}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedBrands([])}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer ml-1"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border/50">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  {isFetching && <Loader2 className="size-3.5 animate-spin text-cyan-500" />}
                  {isLoading ? (
                    <span>Loading products…</span>
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-bold text-foreground">{startItem}</span>
                      {" "}to{" "}
                      <span className="font-bold text-foreground">{endItem}</span>
                      {" "}of{" "}
                      <span className="font-bold text-foreground">{total.toLocaleString()}</span>
                      {" "}products
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Quick search bar */}
                  <div className="relative hidden sm:block w-56 sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Quick filter items..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-8 pr-3 h-8.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                    <ArrowUpDown className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground hidden sm:inline">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 font-bold text-slate-800 cursor-pointer focus:ring-0 text-xs shadow-2xs"
                    >
                      <option value="rating-desc">Best Sellers</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name-asc">Name: A → Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="rounded-2xl sm:rounded-3xl bg-slate-100 animate-pulse" style={{ height: 320 }} />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6 transition-opacity duration-200 ${isPlaceholderData ? "opacity-60" : "opacity-100"}`}>
                  {products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border p-6">
                  <p className="text-sm font-semibold text-muted-foreground">No products found matching filters</p>
                  <p className="text-xs text-muted-foreground/75 mt-1">Try clearing selected filters or check another category.</p>
                  <button
                    onClick={() => { setSearchQuery(""); setDebouncedSearch(""); setSelectedBrands([]); setInStockOnly(false); setPage(1); }}
                    className="mt-4 px-5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80">
                  <div className="text-xs font-bold text-slate-500">
                    Page <span className="text-slate-900 font-extrabold">{page}</span> of{" "}
                    <span className="text-slate-900 font-extrabold">{totalPages.toLocaleString()}</span>
                    {" "}· {total.toLocaleString()} total products
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1 || isFetching}
                      className="size-9 rounded-xl border border-slate-200 bg-white grid place-items-center text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="size-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(pNum => pNum === 1 || pNum === totalPages || Math.abs(pNum - page) <= 2)
                      .map((pNum, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <div key={pNum} className="flex items-center gap-1.5">
                            {prev && pNum - prev > 1 && (
                              <span className="px-1 text-slate-400 text-xs font-bold select-none">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(pNum)}
                              disabled={isFetching}
                              className={`size-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs ${page === pNum
                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/25"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                              {pNum}
                            </button>
                          </div>
                        );
                      })}

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages || isFetching}
                      className="size-9 rounded-xl border border-slate-200 bg-white grid place-items-center text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                      aria-label="Next page"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
