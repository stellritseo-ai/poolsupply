import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/components/site/cart-context";
import { getShopProductsPagedDb, getShopCategoryBrandsDb } from "@/lib/api/products.functions";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Star,
  ShoppingBag,
  Eye,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/brands/$brand/$category")({
  head: ({ params } = {} as any) => {
    if (!params?.brand || !params?.category) return { meta: [], links: [], scripts: [] };
    const brandName = getBrandName(params.brand);
    const categoryName = getCategoryName(params.category);
    const title = `${brandName} ${categoryName} Wholesale | Authorized Distributor Trade Pricing`;
    const description = `Shop authentic commercial & residential ${brandName} ${categoryName.toLowerCase()} at direct contractor wholesale pricing. Fast nationwide shipping on ${brandName} from US distribution hubs.`;
    const pageUrl = `https://poolsupplywholesalers.com/brands/${params.brand}/${params.category}`;

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
        {
          "@type": "ListItem",
          position: 3,
          name: brandName,
          item: `https://poolsupplywholesalers.com/brands/${params.brand}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: categoryName,
          item: pageUrl,
        },
      ],
    };

    const faqs = getBrandCategoryFaqs(brandName, categoryName);

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
      name: `${brandName} ${categoryName}`,
      description,
      url: pageUrl,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".brand-cat-intro", ".faq-answer"],
      },
      isPartOf: {
        "@type": "WebSite",
        name: "Pool Supply Wholesalers",
        url: "https://poolsupplywholesalers.com",
      },
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: `${brandName} ${categoryName}, buy ${brandName} ${categoryName} wholesale, ${brandName} commercial pool equipment, authorized ${brandName} dealer`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Pool Supply Wholesalers" },
        { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: `${brandName} ${categoryName} — Pool Supply Wholesalers` },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@poolsupplywholesalers" },
        { name: "twitter:creator", content: "@poolsupplywholesalers" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        { type: "application/ld+json", children: JSON.stringify(collectionLd) },
        { type: "application/ld+json", children: JSON.stringify(faqLd) },
      ],
    };
  },
  component: BrandCategoryPage,
});

function getBrandCategoryFaqs(brandName: string, categoryName: string) {
  return [
    {
      q: `Are these genuine ${brandName} ${categoryName.toLowerCase()} covered by factory warranty?`,
      a: `Yes. Every ${brandName} ${categoryName.toLowerCase()} unit supplied by Pool Supply Wholesalers is 100% authentic, brand-new, and factory-sealed. All products qualify for the full manufacturer warranty when installed according to manufacturer guidelines.`
    },
    {
      q: `How do I know which ${brandName} ${categoryName.toLowerCase()} model fits my pool setup?`,
      a: `Model selection depends on pool volume, plumbing diameter (1.5", 2", or 2.5"), electrical service (115V vs 230V), and turnover requirements. Our commercial pool technical specialists can verify hydraulic specs and model compatibility prior to purchase.`
    },
    {
      q: `Do you offer trade wholesale pricing on ${brandName} ${categoryName.toLowerCase()}?`,
      a: `Yes. Commercial pool contractors, builders, service professionals, and institutional facility managers receive tiered wholesale pricing and volume discounts on all ${brandName} equipment.`
    },
    {
      q: `How fast does ${brandName} ${categoryName.toLowerCase()} equipment ship?`,
      a: `Orders placed before 2:00 PM EST for in-stock ${brandName} ${categoryName.toLowerCase()} ship same-day or within 24 business hours via expedited ground or dedicated freight carrier with live tracking.`
    }
  ];
}

function getBrandName(slug: string): string {
  switch (slug.toLowerCase()) {
    case "pentair":
      return "Pentair";
    case "hayward":
      return "Hayward";
    case "jandy":
      return "Jandy";
    case "raypak":
      return "Raypak";
    case "zodiac":
      return "Zodiac";
    case "waterway":
      return "Waterway";
    default:
      return slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

function getCategoryName(slug: string): string {
  switch (slug.toLowerCase()) {
    case "pumps":
    case "pool-pumps":
      return "Pool Pumps";
    case "heaters":
    case "pool-heaters":
      return "Pool Heaters";
    case "filters":
    case "pool-filters":
      return "Pool Filters";
    case "lights":
    case "pool-lights":
      return "Pool Lights";
    case "automation":
    case "automation-systems":
      return "Automation Systems";
    case "cleaners":
    case "pool-cleaners":
      return "Pool Cleaners";
    case "salt-systems":
      return "Salt Systems";
    case "motors":
      return "Motors";
    case "plumbing":
      return "Plumbing";
    case "maintenance":
      return "Maintenance";
    case "deck-products":
      return "Deck Products";
    case "ladders-and-rails":
      return "Ladders & Rails";
    case "pool-kits":
      return "Pool Kits";
    default:
      return slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

function getCategoryGuideLink(categorySlug: string) {
  const norm = categorySlug.toLowerCase();
  if (norm.includes("pump")) {
    return {
      title: "Pool Pump Sizing & Buying Guide",
      to: "/guides/pool-pump-buying-guide",
      comparisonTo: "/comparisons/pentair-vs-hayward-pool-pumps",
      comparisonTitle: "Pentair vs. Hayward Pumps",
    };
  }
  if (norm.includes("heater")) {
    return {
      title: "Pool Heater Sizing & BTU Guide",
      to: "/guides/pool-heater-buying-guide",
      comparisonTo: "/comparisons/gas-vs-electric-pool-heaters",
      comparisonTitle: "Gas vs. Heat Pump Comparison",
    };
  }
  if (norm.includes("filter")) {
    return {
      title: "Cartridge, Sand & DE Filter Guide",
      to: "/guides/pool-filter-buying-guide",
      comparisonTo: "/comparisons/cartridge-vs-sand-pool-filters",
      comparisonTitle: "Cartridge vs. Sand Filters",
    };
  }
  if (norm.includes("auto")) {
    return {
      title: "Pool Automation Systems Explained",
      to: "/guides/pool-automation-buying-guide",
    };
  }
  if (norm.includes("salt")) {
    return {
      title: "Salt Chlorine Generator Sizing Guide",
      to: "/guides/salt-chlorine-generator-buying-guide",
    };
  }
  return null;
}

function BrandCategoryPage() {
  const { brand, category } = useParams({ from: "/brands/$brand/$category" });
  const brandName = getBrandName(brand);
  const categoryName = getCategoryName(category);
  const guideInfo = getCategoryGuideLink(category);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "rating-desc">("rating-desc");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 36;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page on filters change
  useEffect(() => {
    setPage(1);
  }, [sortBy, inStockOnly]);

  // Server-Side Products Query
  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      "brand-category-products",
      brandName,
      category,
      page,
      debouncedSearch,
      sortBy,
      inStockOnly,
    ],
    queryFn: async () => {
      const res = await getShopProductsPagedDb({
        data: {
          page,
          limit: PAGE_SIZE,
          category: category,
          brand: brandName, // Filter by brand
          search: debouncedSearch || undefined,
          sort: sortBy,
          inStockOnly: inStockOnly || undefined,
        },
      });
      return res;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const paginatedProducts = productsData?.products || [];
  const totalItems = productsData?.total || 0;
  const totalPages = productsData?.pages || 1;

  // Server-Side Competitor Brands Query
  const { data: brandsData } = useQuery({
    queryKey: ["category-brands", category],
    queryFn: async () => {
      const res = await getShopCategoryBrandsDb({
        data: { category },
      });
      return res?.brands || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const competitorBrands = useMemo(() => {
    if (!brandsData) return [];
    return brandsData
      .filter((b) => b.toLowerCase() !== brandName.toLowerCase())
      .slice(0, 6)
      .map((b) => ({
        name: b,
        slug: b.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        count: 0,
      }));
  }, [brandsData, brandName]);

  // Hardcoded sibling categories for UI navigation
  const siblingCategories = useMemo(() => {
    const defaultCats = [
      "Pool Pumps",
      "Pool Heaters",
      "Pool Filters",
      "Pool Cleaners",
      "Automation Systems",
      "Salt Systems",
    ];
    return defaultCats
      .filter((c) => c.toLowerCase() !== categoryName.toLowerCase())
      .map((c) => ({
        name: c,
        slug: c.toLowerCase().replace(/\s+/g, "-"),
        count: 0,
      }));
  }, [categoryName]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 180, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header alwaysDark />

      <main className="flex-1 pt-28 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-4">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap py-1">
            <Link to="/" className="hover:text-cyan-600 transition">
              Home
            </Link>
            <span>/</span>
            <Link to="/#brands" className="hover:text-cyan-600 transition">
              Brands
            </Link>
            <span>/</span>
            <Link
              to="/brands/$brand"
              params={{ brand }}
              className="hover:text-cyan-600 transition"
            >
              {brandName}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">{categoryName}</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-surface to-background border-b border-border/50 py-8 md:py-10 mb-6 md:mb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-xs sm:text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-bold">
                  Authorized {brandName} Line
                </span>
                <h1 className="mt-1.5 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                  {brandName} {categoryName}
                </h1>
                <p className="brand-cat-intro mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed font-medium">
                  Direct commercial contractor pricing on genuine {brandName} {categoryName.toLowerCase()}.
                  Full manufacturer warranty, same-day freight dispatch, and volume trade account terms.
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-[380px] lg:w-[420px] shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search ${brandName} ${categoryName.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
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

            {/* Sibling Categories within this Brand */}
            {siblingCategories.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200/80">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Other {brandName} Equipment Categories:
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {siblingCategories.map((c) => {
                    const isCurrent =
                      c.slug.toLowerCase() === category.toLowerCase();
                    return (
                      <Link
                        key={c.slug}
                        to="/brands/$brand/$category"
                        params={{ brand, category: c.slug }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                          isCurrent
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-cyan-400/50"
                        }`}
                      >
                        <span>{c.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isCurrent
                              ? "bg-slate-800 text-slate-300"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {c.count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Content & Product Grid Container */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Guide Callout Banner if Available */}
          {guideInfo && (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 text-white border border-cyan-800/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 grid place-items-center shrink-0">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
                    Pro Sizing & Engineering Resource
                  </div>
                  <div className="text-sm font-black text-white">
                    Need help choosing the right {categoryName.toLowerCase()}?
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={guideInfo.to as any}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-extrabold text-xs transition-all shadow-sm active:scale-95"
                >
                  <span>Read {guideInfo.title}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
                {guideInfo.comparisonTo && (
                  <Link
                    to={guideInfo.comparisonTo as any}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-xs transition-all active:scale-95"
                  >
                    <span>{guideInfo.comparisonTitle}</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Controls Bar: Sorting & Quick Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
              <span>
                Showing{" "}
                <strong className="text-slate-900 font-bold">
                  {filteredProducts.length}
                </strong>{" "}
                results
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                In Stock Only
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="rating-desc">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 my-6">
              <div className="size-14 rounded-2xl bg-cyan-50 text-cyan-600 mx-auto grid place-items-center mb-3">
                <Search className="size-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                No matching {brandName} {categoryName.toLowerCase()} found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try adjusting your search keywords or removing the in-stock filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setInStockOnly(false);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-10">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="text-xs font-bold text-slate-600 px-3">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          {/* Brand + Category FAQ Section (GEO / AI Search Optimization) */}
          <div className="mt-16 pt-10 border-t border-slate-200">
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="size-3.5 text-cyan-600" /> Authorized Technical Guidance
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions About {brandName} {categoryName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Direct answers to common contractor and homeowner questions regarding genuine {brandName} {categoryName.toLowerCase()}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getBrandCategoryFaqs(brandName, categoryName).map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition"
                >
                  <h3 className="font-bold text-slate-900 text-sm mb-2">{faq.q}</h3>
                  <p className="faq-answer text-slate-600 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Brand Competitor Linking */}
          {competitorBrands.length > 0 && (
            <div className="mt-16 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                Compare Other Brands Offering {categoryName}:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {competitorBrands.map((b) => (
                  <Link
                    key={b.slug}
                    to="/brands/$brand/$category"
                    params={{ brand: b.slug, category }}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-xs transition group text-center"
                  >
                    <div className="text-xs font-black text-slate-900 group-hover:text-cyan-700 transition">
                      {b.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {b.count} {categoryName.toLowerCase()}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
