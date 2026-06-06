import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useProducts, Product } from "@/lib/products";
import { useCart, formatUSD } from "@/components/site/cart-context";
import { Star, ShoppingBag, Eye, Filter, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

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
  const dbProducts = useProducts();

  // Filters & Sorting State
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "rating-desc">("rating-desc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Get products matching this brand
  const filteredProducts = useMemo(() => {
    // Filter matching brand
    let items = dbProducts.filter(p => p.brand.toLowerCase() === brandName.toLowerCase());
    
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
  }, [dbProducts, brandName, sortBy, selectedCategories, inStockOnly]);

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
        <section className="bg-gradient-to-b from-surface to-background border-b border-border/50 py-12 mb-10">
          <div className="mx-auto max-w-7xl px-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Authorized Brand Dealer</span>
            <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight">{brandName} Equipment</h1>
            <p className="mt-4 text-muted-foreground max-w-3xl leading-relaxed">
              {overview}
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
                  Showing {filteredProducts.length} of {dbProducts.filter(p => p.brand.toLowerCase() === brandName.toLowerCase()).length} products
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
                              <img src={p.img} alt={p.name} loading="lazy" className="size-[80%] object-contain p-4 group-hover:scale-105 transition-transform duration-700 mix-blend-multiply" />
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
                  <p className="text-xs text-muted-foreground/75 mt-1">Try clearing selected filters or check another brand.</p>
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
