import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useProducts, Product } from "@/lib/products";
import { useCart, formatUSD } from "@/components/site/cart-context";
import { Star, ShoppingBag, Eye, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/brands/$brand")({
  head: ({ params }) => {
    const brandName = getBrandName(params.brand);
    return {
      meta: [
        { title: `${brandName} Pool Equipment Wholesale` },
        { name: "description", content: `Browse wholesale pricing on authorized ${brandName} pool pumps, heaters, filters, automation, and lights.` }
      ],
    };
  },
  component: BrandPage,
});

function getBrandName(slug: string): string {
  switch (slug.toLowerCase()) {
    case "pentair": return "Pentair";
    case "hayward": return "Hayward";
    case "jandy": return "Jandy";
    default: return slug.charAt(0).toUpperCase() + slug.slice(1);
  }
}

function getBrandOverview(brand: string): string {
  switch (brand.toLowerCase()) {
    case "pentair":
      return "Pentair is an industry leader in smart, sustainable water solutions. Known for the high efficiency of their IntelliFlo variable speed pumps and advanced IntelliCenter automation, Pentair equipment is the choice of pool professionals worldwide.";
    case "hayward":
      return "For over 80 years, Hayward has been helping pool owners enjoy the pleasures of pool ownership by manufacturing cutting-edge, technologically advanced pool equipment, including Universal H-Series heaters and ColorLogic LED lights.";
    case "jandy":
      return "Jandy professional-grade equipment is engineered to exceed expectations. With a full line of pumps, filters, heaters, lights, and heat pumps, Jandy products offer superior durability and are built to withstand the toughest pool environments.";
    default:
      return "Authorized dealer of high-performance pool equipment. Engineered for long-term durability and efficiency.";
  }
}

function BrandPage() {
  const { brand } = useParams({ from: "/brands/$brand" });
  const brandName = getBrandName(brand);
  const overview = getBrandOverview(brand);
  const { add } = useCart();
  const { products: dbProducts } = useProducts();

  // Filters, Sorting & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "rating-desc">("rating-desc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 35;

  useEffect(() => {
    setSelectedCategories([]);
    setSearchQuery("");
    setPage(1);
  }, [brand]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategories, inStockOnly, sortBy, searchQuery]);

  // Get products matching this brand
  const filteredProducts = useMemo(() => {
    // Filter matching brand
    let items = dbProducts.filter(p => p.brand.toLowerCase() === brandName.toLowerCase());

    // Search query filter
    if (searchQuery.trim() !== "") {
      const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      items = items.filter(p => {
        const name = (p.name || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const description = (p.description || "").toLowerCase();
        const fullText = `${name} ${sku} ${category} ${description}`;
        return terms.every(term => fullText.includes(term));
      });
    }

    // Category filter
    if (selectedCategories.length > 0) {
      items = items.filter(p => selectedCategories.includes(p.category.toLowerCase()));
    }

    // Availability filter
    if (inStockOnly) {
      items = items.filter(p => p.stock > 0);
    }

    // Sorting
    return [...items].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return b.rating - a.rating; // default or rating-desc
    });
  }, [dbProducts, brandName, sortBy, selectedCategories, inStockOnly, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page, PAGE_SIZE]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 140, behavior: "smooth" });
    }
  };

  // Extract all categories in this brand for filtering options
  const brandCategories = useMemo(() => {
    const all = dbProducts
      .filter(p => p.brand.toLowerCase() === brandName.toLowerCase())
      .map(p => p.category);
    return Array.from(new Set(all));
  }, [dbProducts, brandName]);

  const toggleCategory = (cat: string) => {
    const lower = cat.toLowerCase();
    setSelectedCategories(prev =>
      prev.includes(lower) ? prev.filter(c => c !== lower) : [...prev, lower]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1 pt-28 pb-20">
        {/* Brand Hero */}
        <section className="bg-gradient-to-b from-surface to-background border-b border-border/50 py-8 md:py-10 mb-6 md:mb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-bold">Authorized Brand Dealer</span>
              <h1 className="mt-1.5 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">{brandName} Equipment</h1>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed font-medium">
                {overview}
              </p>
            </div>

            {/* Top Right Search Bar */}
            <div className="w-full md:w-[440px] lg:w-[480px] shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${brandName} products...`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-9 h-11 border border-slate-200 bg-white shadow-2xs rounded-2xl text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                    }}
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
          <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
            {/* Sidebar Filters */}
            <aside className="space-y-6 lg:sticky lg:top-28">
              <div className="flex items-center gap-2 pb-4 border-b border-border font-bold text-sm text-foreground">
                <Filter className="size-4" /> Filters & Controls
              </div>

              {/* Search Filter */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Search {brandName}</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-3 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in brand..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 h-10 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Category Filter */}
              {brandCategories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Filter by Category</h3>
                  <div className="space-y-2">
                    {brandCategories.map(cat => (
                      <label key={cat} className="flex items-center gap-2.5 text-sm font-medium text-foreground/80 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.toLowerCase())}
                          onChange={() => toggleCategory(cat)}
                          className="rounded border-border text-primary focus:ring-primary size-4"
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Filter */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Availability</h3>
                <label className="flex items-center gap-2.5 text-sm font-medium text-foreground/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary size-4"
                  />
                  Show In Stock Only
                </label>
              </div>
            </aside>

            {/* Products Layout */}
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border/50">
                <div className="text-xs font-semibold text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{filteredProducts.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span> to <span className="font-bold text-foreground">{Math.min(page * PAGE_SIZE, filteredProducts.length)}</span> of <span className="font-bold text-foreground">{filteredProducts.length}</span> products
                </div>

                {/* Right Controls: Quick Search + Sort selector */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative hidden sm:block w-56 sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Quick filter items..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-8 pr-3 h-8.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                    <ArrowUpDown className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground hidden sm:inline">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 font-bold text-slate-800 cursor-pointer focus:ring-0 text-xs shadow-2xs"
                    >
                      <option value="rating-desc">Best Sellers</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid */}
              {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border p-6">
                  <p className="text-sm font-semibold text-muted-foreground">No products found matching filters</p>
                  <p className="text-xs text-muted-foreground/75 mt-1">Try clearing selected filters or check another brand.</p>
                </div>
              )}

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80">
                  <div className="text-xs font-bold text-slate-500">
                    Page <span className="text-slate-900 font-extrabold">{page}</span> of <span className="text-slate-900 font-extrabold">{totalPages}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Prev Button */}
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="size-9 rounded-xl border border-slate-200 bg-white grid place-items-center text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="size-4" />
                    </button>

                    {/* Page Numbers */}
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
                              className={`size-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs ${
                                page === pNum
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/25"
                                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {pNum}
                            </button>
                          </div>
                        );
                      })}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
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
