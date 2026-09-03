import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BLOG_ARTICLES, type BlogArticle } from "@/lib/blog-content";
import {
  BookOpen,
  ArrowRight,
  Clock,
  ChevronRight,
  Tag,
  Calendar,
  User,
  TrendingUp,
  Zap,
  Shield,
  Wrench,
  Layers,
  BarChart3,
  Star,
  Search,
  Lightbulb,
  CheckCircle2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/blog/")({
  head: () => {
    const pageUrl = "https://poolsupplywholesalers.com/blog";

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://poolsupplywholesalers.com" },
        { "@type": "ListItem", position: 2, name: "Pool Equipment Blog", item: pageUrl },
      ],
    };

    const blogLd = {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Pool Supply Wholesalers — Pool Equipment Blog",
      url: pageUrl,
      description:
        "Expert pool equipment guides, buying comparisons, contractor tips, and commercial pool supply industry insights from Pool Supply Wholesalers.",
      publisher: {
        "@type": "Organization",
        name: "Pool Supply Wholesalers",
        url: "https://poolsupplywholesalers.com",
        logo: { "@type": "ImageObject", url: "https://poolsupplywholesalers.com/assets/logo.png" },
      },
      blogPost: BLOG_ARTICLES.map((a) => ({
        "@type": "BlogPosting",
        headline: a.title,
        description: a.excerpt,
        url: `https://poolsupplywholesalers.com/blog/${a.slug}`,
        datePublished: a.date,
        author: { "@type": "Person", name: a.author },
        image: a.image,
        keywords: a.tags.join(", "),
      })),
    };

    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I choose the right variable speed pool pump for a commercial pool?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "For commercial pools, calculate Total Dynamic Head (TDH) and required turnover rate first. Select a DOE-compliant variable speed pump like Pentair IntelliFloXF or Hayward TriStar VS rated for your required GPM at peak head. Commercial installations require 4-to-6-hour turnover compliance.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between a cartridge filter and a sand filter?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Cartridge filters offer superior filtration down to 10-15 microns with zero backwash water loss — ideal for drought-prone regions and commercial compliance. Sand filters capture particles down to 20-40 microns, cost less upfront, and use simple multi-port backwashing.",
          },
        },
        {
          "@type": "Question",
          name: "How long does a commercial pool pump motor last?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Commercial pool pump motors typically last 8-12 years under continuous operation when properly sized and ventilated. Early replacement warning signs include humming without starting, bearing scream/screech, high amperage draw, capacitor failure, and thermal trip errors.",
          },
        },
        {
          "@type": "Question",
          name: "What is the best pool automation system for commercial pools?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Top commercial pool automation systems include Pentair IntelliConnect & EasyTouch (supporting up to 40 auxiliary circuits), Hayward OmniLogic (advanced mobile app control and multi-body support), and Jandy AquaLink RS (proven commercial multi-pool control).",
          },
        },
        {
          "@type": "Question",
          name: "How do I size a salt chlorinator for a commercial pool?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Multiply pool volume in gallons by 1.5 to calculate minimum required chlorine cell output in grams/hour. For a 50,000-gallon pool, you need at least 75g/hr output (e.g. dual Pentair IntelliChlor IC60 or Hayward T-CELL-15 systems). Upsize by 25-50% for high bather loads.",
          },
        },
      ],
    };

    const articleListLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Pool Equipment Guides & Articles",
      url: pageUrl,
      numberOfItems: BLOG_ARTICLES.length,
      itemListElement: BLOG_ARTICLES.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://poolsupplywholesalers.com/blog/${a.slug}`,
        name: a.title,
      })),
    };

    return {
      meta: [
        { title: "Pool Equipment Blog — Buying Guides, Comparisons & Contractor Tips | Pool Supply Wholesalers" },
        {
          name: "description",
          content:
            "Expert pool equipment guides: variable speed pump selection, Pentair vs Hayward comparisons, cartridge vs sand filters, pool automation setup, salt chlorinator sizing, and commercial pool supply checklists.",
        },
        {
          name: "keywords",
          content:
            "pool equipment blog, pool pump buying guide, Pentair vs Hayward comparison, cartridge filter vs sand filter, pool automation system guide, salt chlorinator sizing, commercial pool supply list, pool contractor tips, variable speed pool pump guide, pool heater comparison 2026",
        },
        { property: "og:title", content: "Pool Equipment Blog — Expert Guides & Contractor Tips | Pool Supply Wholesalers" },
        {
          property: "og:description",
          content:
            "Authoritative pool equipment guides from America's leading wholesale distributor. Pump selection, filter comparisons, automation setup, and commercial pool supply insights.",
        },
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Pool Equipment Blog — Buying Guides & Contractor Tips" },
        {
          name: "twitter:description",
          content:
            "Expert guides on pool pumps, heaters, filters, automation, and salt chlorinators from Pool Supply Wholesalers.",
        },
        { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
        { name: "article:publisher", content: "https://poolsupplywholesalers.com" },
      ],
      links: [
        { rel: "canonical", href: pageUrl },
        { rel: "alternate", type: "application/rss+xml", title: "Pool Supply Wholesalers Blog", href: `${pageUrl}/feed.xml` },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        { type: "application/ld+json", children: JSON.stringify(blogLd) },
        { type: "application/ld+json", children: JSON.stringify(faqLd) },
        { type: "application/ld+json", children: JSON.stringify(articleListLd) },
      ],
    };
  },
  component: BlogPage,
});

const CATEGORIES = [
  { label: "All Articles", value: "all", icon: BookOpen },
  { label: "Pool Pumps", value: "pumps", icon: Zap },
  { label: "Heaters", value: "heaters", icon: Lightbulb },
  { label: "Filters", value: "filters", icon: Shield },
  { label: "Automation", value: "automation", icon: Layers },
  { label: "Salt Systems", value: "salt", icon: Wrench },
  { label: "Commercial", value: "commercial", icon: BarChart3 },
];

const POPULAR_TOPICS = [
  "Variable Speed Pumps",
  "Pentair vs Hayward",
  "Commercial Pool Equipment",
  "Salt Chlorinators",
  "Pool Automation",
  "Filter Sizing",
  "Pool Heater BTU",
  "OEM Replacement Parts",
];

function ArticleCard({ article, index }: { article: BlogArticle; index: number }) {
  const CategoryIcon = CATEGORIES.find((c) => c.value === article.category)?.icon || BookOpen;

  return (
    <motion.article
      id={article.slug}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-cyan-400/60 transition-all duration-300 overflow-hidden flex flex-col"
      aria-label={article.title}
    >
      {/* Card Image Strip */}
      <Link
        to="/blog/$slug"
        params={{ slug: article.slug }}
        className="relative h-48 bg-slate-900 overflow-hidden shrink-0 block group/img"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider">
          <CategoryIcon className="size-3 text-cyan-300" />
          <span>{article.categoryLabel}</span>
        </div>

        {/* Highlight Tag */}
        {article.highlight && (
          <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
            {article.highlight}
          </div>
        )}

        {/* Date and Read Time in preview */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/90 drop-shadow-sm">
            <Clock className="size-3 text-cyan-300" />
            <span>{article.readTime}</span>
            <span className="mx-1 opacity-50">·</span>
            <Calendar className="size-3 text-cyan-300" />
            <span>
              {new Date(article.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug group-hover:text-cyan-700 transition-colors line-clamp-2">
          <Link to="/blog/$slug" params={{ slug: article.slug }} className="hover:underline">
            {article.title}
          </Link>
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed flex-1 line-clamp-3">
          {article.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {article.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200"
            >
              <Tag className="size-2.5 text-slate-400" />
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <User className="size-3 text-cyan-600" />
            <span>{article.author}</span>
          </div>
          <Link
            to="/blog/$slug"
            params={{ slug: article.slug }}
            className="text-[11px] font-extrabold text-cyan-700 hover:text-cyan-800 flex items-center gap-1.5 group-hover:gap-2 transition-all"
          >
            Read Guide <ArrowRight className="size-3.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function FeaturedCard({ article }: { article: BlogArticle }) {
  const CategoryIcon = CATEGORIES.find((c) => c.value === article.category)?.icon || BookOpen;

  return (
    <motion.article
      id={article.slug}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-cyan-400/60 transition-all duration-300 overflow-hidden"
      aria-label={`Featured: ${article.title}`}
    >
      <div className="grid lg:grid-cols-[1.2fr_1fr]">
        {/* Image Side */}
        <Link
          to="/blog/$slug"
          params={{ slug: article.slug }}
          className="relative min-h-64 lg:min-h-72 bg-slate-900 overflow-hidden block group/img"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {/* Featured badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
            <Star className="size-3.5 fill-white" />
            Featured Article
          </div>

          {/* Category */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider">
            <CategoryIcon className="size-3 text-cyan-300" />
            <span>{article.categoryLabel}</span>
          </div>

          {/* Read time top right */}
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-[10px] font-bold text-white/90">
            {article.readTime}
          </div>
        </Link>

        {/* Content Side */}
        <div className="p-7 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-[11px] font-extrabold uppercase tracking-wider">
              <TrendingUp className="size-3.5" />
              Most Popular This Month
            </div>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 leading-snug group-hover:text-cyan-700 transition-colors">
              <Link to="/blog/$slug" params={{ slug: article.slug }} className="hover:underline">
                {article.title}
              </Link>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200"
                >
                  <Tag className="size-2.5 text-slate-400" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Calendar className="size-3.5 text-cyan-600" />
              <span>
                {new Date(article.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <Link
              to="/blog/$slug"
              params={{ slug: article.slug }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold transition-all shadow-md shadow-cyan-600/20 active:scale-95 group-hover:gap-2.5"
            >
              Read Full Guide
              <ArrowRight className="size-3.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter((a) => {
      const matchesCat = selectedCategory === "all" || a.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.categoryLabel.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Featured article: pick first featured match or first in filtered list
  const featured = useMemo(() => {
    if (searchQuery || selectedCategory !== "all") {
      return null;
    }
    return BLOG_ARTICLES.find((a) => a.featured) || BLOG_ARTICLES[0];
  }, [searchQuery, selectedCategory]);

  const gridArticles = useMemo(() => {
    if (featured) {
      return filteredArticles.filter((a) => a.slug !== featured.slug);
    }
    return filteredArticles;
  }, [filteredArticles, featured]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Header alwaysDark />

      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24 bg-gradient-to-b from-cyan-50/60 via-white to-slate-50 border-b border-slate-200/80 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[380px] bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
              <Link to="/" className="hover:text-cyan-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="size-3 text-slate-300" />
              <span className="text-slate-800 font-bold">Pool Equipment Blog</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-cyan-700 bg-cyan-100/70 border border-cyan-300">
                  <BookOpen className="size-3.5 text-cyan-600" />
                  Pool Equipment Resource Hub
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Expert{" "}
                  <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 bg-clip-text text-transparent">
                    Pool Equipment
                  </span>{" "}
                  Guides
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-medium max-w-xl">
                  Authoritative buying guides, brand comparisons, and contractor technical resources from America's leading commercial pool equipment distributor.
                </p>

                {/* Search Bar */}
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pool equipment guides, pumps, heaters…"
                    aria-label="Search blog articles"
                    className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Clear search"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Block */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: `${BLOG_ARTICLES.length} Guides`, label: "In-Depth Guides", icon: BookOpen },
                  { value: "5,000+", label: "Contractors Served", icon: User },
                  { value: "40%", label: "Below Retail Prices", icon: TrendingUp },
                  { value: "18+", label: "Years in Industry", icon: Star },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 + 0.2, duration: 0.4 }}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-1 hover:border-cyan-300 transition-colors"
                    >
                      <Icon className="size-5 text-cyan-600 mx-auto" />
                      <div className="text-xl font-black text-slate-900">{stat.value}</div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="mt-10 flex items-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-cyan-400 hover:text-cyan-700"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <Icon className="size-3.5" />
                    {cat.label}
                  </button>
                );
              })}
              {(selectedCategory !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 px-2 py-1 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X className="size-3" /> Reset Filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ─── MAIN CONTENT ─── */}
        <section className="py-12 sm:py-16 bg-slate-50/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
              {/* Articles Column */}
              <div className="space-y-8">
                {/* Featured Post (shown if no active search or category filter) */}
                {featured && (
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <Star className="size-3.5 text-cyan-600" /> Featured Guide
                    </h2>
                    <FeaturedCard article={featured} />
                  </div>
                )}

                {/* Article Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <BookOpen className="size-3.5 text-cyan-600" />
                      {featured ? "All Equipment Guides" : `Matching Guides (${filteredArticles.length})`}
                    </h2>
                    {searchQuery && (
                      <span className="text-xs font-medium text-slate-500">
                        Results for "{searchQuery}"
                      </span>
                    )}
                  </div>

                  {gridArticles.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                      <Search className="size-8 text-slate-300 mx-auto" />
                      <h3 className="text-base font-black text-slate-800">No matching articles found</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Try clearing your search term or selecting another category to see our complete guides.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedCategory("all");
                          setSearchQuery("");
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 transition-all cursor-pointer"
                      >
                        Show All Articles
                      </button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {gridArticles.map((article, i) => (
                        <ArticleCard key={article.slug} article={article} index={i} />
                      ))}
                    </div>
                  )}
                </div>

                {/* FAQ Section — AEO targeted */}
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Lightbulb className="size-5 text-cyan-600" />
                    Pool Equipment FAQ — Answered by Wholesale Experts
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        q: "How do I choose the right variable speed pool pump for a commercial pool?",
                        a: "For commercial pools, calculate Total Dynamic Head (TDH) and required turnover rate first. Select a DOE-compliant variable speed pump like Pentair IntelliFloXF or Hayward TriStar VS rated for your required GPM at peak head. Commercial installations require 4-to-6-hour turnover compliance.",
                      },
                      {
                        q: "What is the difference between a cartridge filter and a sand filter?",
                        a: "Cartridge filters offer superior filtration down to 10-15 microns with zero backwash water loss — ideal for drought-prone regions and commercial compliance. Sand filters capture particles down to 20-40 microns, cost less upfront, and use simple multi-port backwashing.",
                      },
                      {
                        q: "How long does a commercial pool pump motor last?",
                        a: "A commercial pool pump motor typically lasts 8-12 years with proper maintenance. Signs it needs replacement include humming without starting, bearing scream, high amperage draw, capacitor failure, or thermal cutout tripping. Variable speed motors generally outlast single-speed motors.",
                      },
                      {
                        q: "What is the best pool automation system for commercial pools?",
                        a: "Top commercial pool automation systems include Pentair IntelliConnect and EasyTouch (up to 40 circuits), Hayward OmniLogic (best mobile app integration), and Jandy AquaLink RS (commercial multi-pool control). For large installations with multiple bodies of water, Hayward OmniLogic and Pentair EasyTouch offer scalable architectures.",
                      },
                      {
                        q: "How do I size a salt chlorinator for a commercial pool?",
                        a: "Multiply your pool volume in gallons by 1.5 to get the minimum required cell output in grams/hour. For a 50,000-gallon commercial pool, you need at least 75g/hr output. Pentair IntelliChlor IC60 (60g/hr) or Hayward T-CELL-15 (40g/hr) are popular commercial options. In high-use facilities, upsize by 25-50% to account for heavy bather load.",
                      },
                    ].map((faq, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-cyan-300 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="size-7 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="size-4 text-cyan-600" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-black text-slate-900 leading-snug">{faq.q}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="space-y-5 lg:sticky lg:top-28">
                {/* Popular Topics */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <TrendingUp className="size-4 text-cyan-600" />
                    Popular Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setSearchQuery(topic)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:border-cyan-400 hover:text-cyan-700 hover:bg-cyan-50/50 transition-all cursor-pointer"
                      >
                        <Tag className="size-2.5 text-cyan-600" />
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <Layers className="size-4 text-cyan-600" />
                    Browse by Category
                  </h3>
                  <nav className="space-y-1" aria-label="Blog categories">
                    {CATEGORIES.filter((c) => c.value !== "all").map((cat) => {
                      const Icon = cat.icon;
                      const count = BLOG_ARTICLES.filter((a) => a.category === cat.value).length;
                      const isSelected = selectedCategory === cat.value;
                      return (
                        <button
                          key={cat.value}
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-cyan-50 text-cyan-700 font-bold border border-cyan-200"
                              : "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50/60"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="size-3.5 text-cyan-600 shrink-0" />
                            {cat.label}
                          </span>
                          <span
                            className={`size-5 rounded-full text-[10px] font-black flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-cyan-600 text-white"
                                : "bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-cyan-700"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* CTA Widget */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white space-y-3 shadow-md shadow-cyan-600/20">
                  <h3 className="text-sm font-black leading-tight">
                    Need equipment advice for your project?
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Our factory-certified technicians help contractors select the right equipment. Get a free commercial account and wholesale pricing.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-cyan-700 font-extrabold text-xs transition-all hover:bg-cyan-50 active:scale-95 shadow-sm w-full justify-center"
                  >
                    Talk to a Specialist
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                {/* Trusted Brands */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <Shield className="size-4 text-cyan-600" />
                    Authorized Brands
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
                    {["Pentair", "Hayward", "Jandy", "Raypak", "Zodiac", "Waterway"].map((brand) => (
                      <Link
                        key={brand}
                        to={`/brands/${brand.toLowerCase()}` as any}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-cyan-300 hover:text-cyan-700 transition-all"
                      >
                        <CheckCircle2 className="size-3 text-cyan-500" />
                        {brand}
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <section className="py-12 sm:py-16 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-cyan-700 bg-cyan-100/70 border border-cyan-300">
              <Star className="size-3.5 text-cyan-600" />
              Ready to order? 5,000+ contractors trust us
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shop Our Full Wholesale{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Equipment Catalog
              </span>
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Everything you read about — Pentair, Hayward, Jandy, Raypak equipment — available at up to 40% below retail MSRP, shipped same day from Nashville, LA, Dallas, and Orlando hubs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="/shop/all"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm transition-all shadow-md shadow-cyan-600/20 active:scale-95 flex items-center gap-2"
              >
                Browse All Equipment
                <ArrowRight className="size-4" />
              </a>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-800 font-extrabold text-sm transition-all active:scale-95 flex items-center gap-2"
              >
                Open Trade Account
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
