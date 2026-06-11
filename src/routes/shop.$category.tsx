import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useProducts, Product } from "@/lib/products";
import { useCart, formatUSD } from "@/components/site/cart-context";
import { Star, ShoppingBag, Eye, Filter, ArrowUpDown, Search } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/shop/$category")({
  head: ({ params }) => {
    const name = getCategoryName(params.category);
    return {
      meta: [
        { title: `${name} — Premium Pool Equipment Wholesale` },
        { name: "description", content: `Browse wholesale pricing on professional grade ${name} from top brands like Pentair, Hayward, and Jandy.` }
      ],
    };
  },
  component: CategoryPage,
});

function getCategoryName(slug: string): string {
  switch (slug) {
    case "pool-pumps": return "Pool Pumps";
    case "pool-lights": return "Pool Lights";
    case "pool-cleaners": return "Pool Cleaners";
    case "pool-heaters": return "Pool Heaters";
    case "electric-heat-pumps": return "Electric Heat Pumps";
    default: return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
}

function CategoryPage() {
  const { category } = useParams({ from: "/shop/$category" });
  const categoryName = getCategoryName(category);
  const { add } = useCart();
  const { products: dbProducts } = useProducts();

  // Filters & Sorting State
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "rating-desc">("rating-desc");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get products matching this category
  const filteredProducts = useMemo(() => {
    // Filter matching category
    let items = dbProducts.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());
    console.log("=== Category Page Filter Debug ===");
    console.log("Total Category Products:", items.length);
    console.log("Selected Brands:", selectedBrands);
    console.log("In Stock Only:", inStockOnly);
    console.log("Search Query:", searchQuery);

    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      items = items.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
      console.log("After Search Filter:", items.length);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      items = items.filter(p => selectedBrands.includes(p.brand.toLowerCase()));
      console.log("After Brand Filter:", items.length);
    }

    // Availability filter
    if (inStockOnly) {
      items = items.filter(p => p.stock > 0);
      console.log("After Stock Filter:", items.length);
    }

    // Sorting
    const sorted = [...items].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return b.rating - a.rating; // default or rating-desc
    });
    console.log("Final Filtered Count:", sorted.length);
    return sorted;
  }, [dbProducts, categoryName, sortBy, selectedBrands, inStockOnly, searchQuery]);

  // Extract all available brands in this category for filtering options
  const categoryBrands = useMemo(() => {
    const all = dbProducts
      .filter(p => p.category.toLowerCase() === categoryName.toLowerCase())
      .map(p => p.brand);
    return Array.from(new Set(all));
  }, [dbProducts, categoryName]);

  const toggleBrand = (brand: string) => {
    const lower = brand.toLowerCase();
    setSelectedBrands(prev =>
      prev.includes(lower) ? prev.filter(b => b !== lower) : [...prev, lower]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1 pt-28 pb-20">
        {/* Category Hero */}
        <section className="bg-gradient-to-b from-surface to-background border-b border-border/50 py-12 mb-10">
          <div className="mx-auto max-w-7xl px-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Wholesale Catalog</span>
            <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight">{categoryName}</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">
              Premium commercial-grade {categoryName.toLowerCase()} engineered for high reliability, performance, and efficiency. Enjoy exclusive bulk wholesale rates.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
            {/* Sidebar Filters */}
            <aside className="space-y-6 lg:sticky lg:top-28">
              <div className="flex items-center gap-2 pb-4 border-b border-border font-bold text-sm text-foreground">
                <Filter className="size-4" /> Filters & Controls
              </div>

              {/* Search Filter */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Search Products</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-3 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 h-10 border border-slate-200 bg-slate-50 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Brand Filter */}
              {categoryBrands.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Filter by Brand</h3>
                  <div className="space-y-2">
                    {categoryBrands.map(brand => (
                      <label key={brand} className="flex items-center gap-2.5 text-sm font-medium text-foreground/80 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.toLowerCase())}
                          onChange={() => toggleBrand(brand)}
                          className="rounded border-border text-primary focus:ring-primary size-4"
                        />
                        {brand}
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
                  Showing {filteredProducts.length} of {dbProducts.filter(p => p.category.toLowerCase() === categoryName.toLowerCase()).length} products
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                  <ArrowUpDown className="size-3.5 text-muted-foreground" /> Sort By:
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-none outline-none font-bold text-foreground cursor-pointer focus:ring-0"
                  >
                    <option value="rating-desc">Best Sellers</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((p, i) => {
                    const savings = p.msrp - p.price;
                    return (
                      <motion.article
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="group bg-white rounded-3xl p-5 border border-border hover:shadow-[var(--shadow-float)] hover:-translate-y-1 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <Link to="/products/$productId" params={{ productId: p.id }} className="block">
                            <div className="relative aspect-square rounded-2xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] overflow-hidden grid place-items-center">
                              <img 
                                src={p.img || "https://placehold.co/400x400/png?text=Image+N/A"} 
                                alt={p.name} 
                                loading="lazy" 
                                className="size-[80%] object-contain p-4 group-hover:scale-105 transition-transform duration-700 mix-blend-multiply" 
                                onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400/png?text=Image+N/A"; }}
                              />
                              <span aria-label="Quick view" className="absolute top-3 right-3 size-10 grid place-items-center rounded-full bg-white/80 backdrop-blur opacity-0 group-hover:opacity-100 transition shadow-[var(--shadow-soft)]">
                                <Eye className="size-4" />
                              </span>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{p.brand}</span>
                              <span className="inline-flex items-center gap-1 text-xs font-semibold">
                                <Star className="size-3.5 fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" />
                                {p.rating}
                              </span>
                            </div>
                            <h3 className="mt-1.5 font-bold text-foreground leading-snug min-h-[3rem] group-hover:text-primary transition-colors">{p.name}</h3>
                          </Link>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground/80 line-through">MSRP {formatUSD(p.msrp)}</div>
                            <div className="text-xl font-black tracking-tight text-[oklch(0.50_0.14_232)]">{formatUSD(p.price)}</div>
                            <div className="text-[9px] font-bold text-emerald-600 mt-0.5">Save {formatUSD(savings)}</div>
                          </div>

                          <button
                            onClick={() => add(p, 1)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:bg-[oklch(0.50_0.14_232)] hover:text-white transition"
                          >
                            <ShoppingBag className="size-3.5" /> Add
                          </button>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border p-6">
                  <p className="text-sm font-semibold text-muted-foreground">No products found matching filters</p>
                  <p className="text-xs text-muted-foreground/75 mt-1">Try clearing selected filters or check another category.</p>
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
