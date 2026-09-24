import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useProducts, Product } from "@/lib/products";
import { useCart, formatUSD } from "@/components/site/cart-context";
import {
  Star,
  ShoppingBag,
  Eye,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
} from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/brands/$brand")({
  head: ({ params } = {} as any) => {
    if (!params?.brand) return { meta: [], links: [], scripts: [] };
    const brandName = getBrandName(params.brand);
    const title = `${brandName} Pool Equipment Wholesale | Authorized Distributor`;
    const description = `Shop authentic ${brandName} pool pumps, gas heaters, cartridge filters, and automation systems at direct contractor wholesale pricing. Fast shipping nationwide from Pool Supply Wholesalers.`;
    const brandUrl = `https://poolsupplywholesalers.com/brands/${params.brand}`;

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://poolsupplywholesalers.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Brands",
          item: "https://poolsupplywholesalers.com/#brands",
        },
        { "@type": "ListItem", position: 3, name: brandName, item: brandUrl },
      ],
    };

    const brandLd = {
      "@context": "https://schema.org",
      "@type": "Brand",
      name: brandName,
      url: brandUrl,
      description: `Authorized commercial distributor of genuine ${brandName} pool equipment and replacement parts.`,
    };

    const faqs = getBrandFaqs(brandName);

    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    };

    const collectionLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description: description,
      url: brandUrl,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".brand-overview", ".faq-answer"],
      },
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: `${brandName} pool equipment USA, buy ${brandName} wholesale USA, ${brandName} pool supplies United States, authorized ${brandName} distributor USA, commercial pool equipment trade pricing`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: brandUrl },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content: `${brandName} Pool Equipment — Pool Supply Wholesalers`,
        },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@poolsupplywholesalers" },
        { name: "twitter:creator", content: "@poolsupplywholesalers" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
      ],
      links: [{ rel: "canonical", href: brandUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        { type: "application/ld+json", children: JSON.stringify(brandLd) },
        { type: "application/ld+json", children: JSON.stringify(faqLd) },
        { type: "application/ld+json", children: JSON.stringify(collectionLd) },
      ],
    };
  },
  component: BrandPage,
});

function getBrandName(slug: string): string {
  switch (slug.toLowerCase()) {
    case "pentair":
      return "Pentair";
    case "hayward":
      return "Hayward";
    case "jandy":
      return "Jandy";
    default:
      return slug.charAt(0).toUpperCase() + slug.slice(1);
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

function getBrandFaqs(brandName: string) {
  return [
    {
      q: `Is Pool Supply Wholesalers an authorized distributor for ${brandName}?`,
      a: `Yes. Pool Supply Wholesalers is a direct commercial wholesale distributor supplying authentic, factory-sealed ${brandName} pool equipment, replacement parts, and accessories with full manufacturer warranty authorization.`
    },
    {
      q: `Does ${brandName} pool equipment come with factory warranty coverage?`,
      a: `All new ${brandName} products purchased through Pool Supply Wholesalers are 100% genuine and qualify for complete factory warranty coverage when installed in accordance with manufacturer specifications and local codes.`
    },
    {
      q: `How fast does ${brandName} equipment ship?`,
      a: `Most in-stock ${brandName} pumps, filters, heaters, and accessories ship same-day or within 24 business hours from our strategically located US distribution hubs in Tennessee, Florida, Texas, and California.`
    },
    {
      q: `Do you offer trade and contractor discounts on ${brandName} products?`,
      a: `Yes. Licensed pool contractors, builders, service professionals, and commercial facility operators qualify for direct wholesale trade pricing, tier discounts, and dedicated account support.`
    }
  ];
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
    let items = dbProducts.filter((p) => p.brand.toLowerCase() === brandName.toLowerCase());

    // Search query filter
    if (searchQuery.trim() !== "") {
      const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      items = items.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const description = (p.description || "").toLowerCase();
        const fullText = `${name} ${sku} ${category} ${description}`;
        return terms.every((term) => fullText.includes(term));
      });
    }

    // Category filter
    if (selectedCategories.length > 0) {
      items = items.filter((p) => selectedCategories.includes(p.category.toLowerCase()));
    }

    // Availability filter
    if (inStockOnly) {
      items = items.filter((p) => p.stock > 0);
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
      .filter((p) => p.brand.toLowerCase() === brandName.toLowerCase())
      .map((p) => p.category);
    return Array.from(new Set(all));
  }, [dbProducts, brandName]);

  const toggleCategory = (cat: string) => {
    const lower = cat.toLowerCase();
    setSelectedCategories((prev) =>
      prev.includes(lower) ? prev.filter((c) => c !== lower) : [...prev, lower],
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1 pt-28 pb-20">
        {/* Brand Hero */}
        <section className="bg-gradient-to-b from-surface to-background border-b border-border/50 py-8 md:py-10 mb-6 md:mb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-xs sm:text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-bold">
                Authorized Brand Dealer
              </span>
              <h1 className="mt-1.5 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                {brandName} Equipment
              </h1>
              <p className="brand-overview mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed font-medium">
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

            {/* Category Quick Browse Links (SEO Silo) */}
            {brandCategories.length > 0 && (
              <div className="w-full mt-6 pt-6 border-t border-slate-200/80">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Browse {brandName} Equipment Lines:
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {brandCategories.map((cat) => {
                    const catSlug = cat
                      .toLowerCase()
                      .replace(/\s+&\s+/g, "-and-")
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "");
                    const count = dbProducts.filter(
                      (p) =>
                        p.brand.toLowerCase() === brandName.toLowerCase() &&
                        p.category.toLowerCase() === cat.toLowerCase(),
                    ).length;

                    return (
                      <Link
                        key={cat}
                        to="/brands/$brand/$category"
                        params={{ brand, category: catSlug }}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-cyan-500 hover:text-cyan-700 text-slate-700 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs group"
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 group-hover:bg-cyan-50 group-hover:text-cyan-700">
                          {count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
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
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Search {brandName}
                </h3>
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
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                    Filter by Category
                  </h3>
                  <div className="space-y-2">
                    {brandCategories.map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-2.5 text-sm font-medium text-foreground/80 cursor-pointer select-none"
                      >
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
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  Availability
                </h3>
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
                  Showing{" "}
                  <span className="font-bold text-foreground">
                    {filteredProducts.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-foreground">
                    {Math.min(page * PAGE_SIZE, filteredProducts.length)}
                  </span>{" "}
                  of <span className="font-bold text-foreground">{filteredProducts.length}</span>{" "}
                  products
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
                  <p className="text-sm font-semibold text-muted-foreground">
                    No products found matching filters
                  </p>
                  <p className="text-xs text-muted-foreground/75 mt-1">
                    Try clearing selected filters or check another brand.
                  </p>
                </div>
              )}

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80">
                  <div className="text-xs font-bold text-slate-500">
                    Page <span className="text-slate-900 font-extrabold">{page}</span> of{" "}
                    <span className="text-slate-900 font-extrabold">{totalPages}</span>
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
                      .filter(
                        (pNum) => pNum === 1 || pNum === totalPages || Math.abs(pNum - page) <= 2,
                      )
                      .map((pNum, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <div key={pNum} className="flex items-center gap-1.5">
                            {prev && pNum - prev > 1 && (
                              <span className="px-1 text-slate-400 text-xs font-bold select-none">
                                ...
                              </span>
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

      {/* Brand FAQs & Authorized Dealer Section */}
      <section className="border-t border-slate-200 bg-slate-50/70 py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="size-3.5 text-cyan-600" /> Authorized Commercial Distributor
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions About {brandName}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Everything you need to know about purchasing genuine {brandName} pool supplies with factory warranty protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getBrandFaqs(brandName).map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-sm transition"
              >
                <h3 className="font-bold text-slate-900 text-base mb-2">{faq.q}</h3>
                <p className="faq-answer text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
