import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useProductsByCategory, useProductsQuery, products as defaultProducts, getProductImage, Product } from "@/lib/products";
import { useCart, formatUSD } from "@/components/site/cart-context";
import { Star, ShoppingBag, Eye, Filter, ArrowUpDown, Search } from "lucide-react";
import { motion } from "framer-motion";
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
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://poolsupplywholesalers.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Shop",
          "item": "https://poolsupplywholesalers.com/shop/all"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": name,
          "item": categoryUrl
        }
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
      links: [
        { rel: "canonical", href: categoryUrl }
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbLd)
        }
      ]
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
    case "pool-pumps": return "Pool Pumps";
    case "pool-lights": return "Pool Lights";
    case "pool-cleaners": return "Pool Cleaners";
    case "pool-heaters": return "Pool Heaters";
    case "electric-heat-pumps": return "Electric Heat Pumps";
    case "automation": return "Automation";
    case "blowers": return "Blowers";
    case "chlorine-feeders": return "Chlorine Feeders";
    case "cleaners": return "Cleaners";
    case "filters": return "Filters";
    case "heaters": return "Heaters";
    case "lights": return "Lights";
    case "pumps": return "Pumps";
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

function CategoryPage() {
  const { category } = useParams({ from: "/shop/$category" });
  const { q: urlSearch } = Route.useSearch();
  const categoryName = getCategoryName(category);
  const { add } = useCart();

  const categoryQuery = useProductsByCategory(category);
  const allProductsQuery = useProductsQuery();

  const dbProducts = useMemo(() => {
    // Combine default products catalog with any DB fetched products so all items are accessible
    const fetched = categoryQuery.data || allProductsQuery.data || [];
    const map = new Map<string, Product>();

    // 1. Add static default products first
    defaultProducts.forEach(p => {
      if (p.id) map.set(p.id.toLowerCase(), p);
    });

    // 2. Add or override with DB fetched products
    fetched.forEach(p => {
      if (p.id) map.set(p.id.toLowerCase(), p);
    });

    return Array.from(map.values());
  }, [categoryQuery.data, allProductsQuery.data]);

  // Filters & Sorting State
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "rating-desc">("rating-desc");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(urlSearch || "");

  useEffect(() => {
    if (urlSearch !== undefined) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  // Get products matching this category
  const filteredProducts = useMemo(() => {
    // Filter matching category
    let items = dbProducts.filter(p => {
      if (category.toLowerCase() === "all") return true;
      const pCat = (p.category || "").toLowerCase().trim();
      const pParent = (p.parentCategory || "").toLowerCase().trim();
      const pSub = (p.subCategory || "").toLowerCase().trim();
      const cName = categoryName.toLowerCase().trim();
      
      // Build slug variants: "ladders-and-rails" → "ladders and rails" and "ladders & rails"
      const slug = category.toLowerCase();
      const slugSpaced = slug.replace(/-/g, " ");                           // "ladders and rails"
      const slugAmp   = slug.replace(/-and-/g, " & ").replace(/-/g, " ");  // "ladders & rails"
      const slugSlash = slug.replace(/-or-/g, " / ").replace(/-/g, " ");   // slash variant

      const matchesAny = (field: string) => {
        if (!field || field.length === 0) return false;
        return (
          field === cName ||
          field === slugSpaced ||
          field === slugAmp ||
          field === slugSlash ||
          field === slug ||
          field.includes(cName) ||
          field.includes(slugAmp) ||
          (cName.length > 3 && cName.includes(field)) ||
          (slugAmp.length > 3 && slugAmp.includes(field))
        );
      };

      return matchesAny(pCat) || matchesAny(pParent) || matchesAny(pSub);
    });

    // Multi-field Search query filter (Name, SKU, Brand, Category, Description, Details, Specs)
    if (searchQuery.trim() !== "") {
      const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      items = items.filter(p => {
        const name = (p.name || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const parentCategory = (p.parentCategory || "").toLowerCase();
        const description = (p.description || "").toLowerCase();
        const details = (p.details || "").toLowerCase();
        const seoKeywords = (p.seoKeywords || "").toLowerCase();
        const specsStr = p.specs ? Object.values(p.specs).filter(Boolean).join(" ").toLowerCase() : "";

        const fullText = `${name} ${brand} ${sku} ${category} ${parentCategory} ${description} ${details} ${seoKeywords} ${specsStr}`;

        return terms.every(term => fullText.includes(term));
      });
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
      .map(p => p.brand)
      .filter(Boolean);
    return Array.from(new Set(all));
  }, [dbProducts]);

  const toggleBrand = (brand: string) => {
    const lower = brand.toLowerCase();
    setSelectedBrands(prev =>
      prev.includes(lower) ? prev.filter(b => b !== lower) : [...prev, lower]
    );
  };

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1 pt-28 pb-20">
        {/* Category Hero */}
        <section className="bg-gradient-to-b from-surface to-background border-b border-border/50 py-8 md:py-12 mb-6 md:mb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-bold">Wholesale Catalog</span>
            <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">{categoryName}</h1>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Premium commercial-grade {categoryName.toLowerCase()} engineered for high reliability, performance, and efficiency. Enjoy exclusive bulk wholesale rates.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Mobile Filter Toggle Button (< lg) */}
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
            <span className="text-xs font-bold text-slate-500">{filteredProducts.length} items</span>
          </div>

          <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
            {/* Sidebar Filters */}
            <aside className={`space-y-6 lg:sticky lg:top-28 p-5 lg:p-0 rounded-2xl lg:rounded-none bg-white lg:bg-transparent border lg:border-none border-slate-200 shadow-sm lg:shadow-none ${mobileFiltersOpen ? "block mb-6 lg:mb-0" : "hidden lg:block"}`}>
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
                  Showing {filteredProducts.length} of {dbProducts.length} products
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
                  {filteredProducts.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
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
