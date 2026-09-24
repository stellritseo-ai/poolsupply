import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getGuideBySlug } from "@/lib/guides-content";
import { ChevronRight, ArrowLeft, ShoppingBag, ArrowRight, Scale, BookOpen } from "lucide-react";
import { useProducts, Product } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";

function getGuideRelatedResources(category: string) {
  const cat = (category || "").toLowerCase();

  if (cat.includes("pump")) {
    return {
      comparisons: [
        {
          title: "Pentair vs. Hayward Pool Pumps",
          url: "/comparisons/pentair-vs-hayward-pool-pumps",
          desc: "Compare hydraulic curves, sound decibels, and DOE efficiency standards.",
        },
        {
          title: "Variable Speed vs. Single Speed Pumps",
          url: "/comparisons/variable-speed-vs-single-speed-pool-pumps",
          desc: "Calculate 80% electricity savings and commercial payback periods.",
        },
      ],
      brandHubs: [
        { name: "Pentair Pumps", url: "/brands/pentair/pool-pumps" },
        { name: "Hayward Pumps", url: "/brands/hayward/pool-pumps" },
        { name: "Jandy Pumps", url: "/brands/jandy/pool-pumps" },
      ],
    };
  }
  if (cat.includes("heat")) {
    return {
      comparisons: [
        {
          title: "Gas Heaters vs. Electric Heat Pumps",
          url: "/comparisons/gas-vs-electric-pool-heaters",
          desc: "Operating cost models and rapid heating vs steady seasonal efficiency.",
        },
        {
          title: "Jandy vs. Pentair Pool Heaters",
          url: "/comparisons/jandy-vs-pentair-pool-heaters",
          desc: "Cupro-nickel heat exchanger longevity and digital controls.",
        },
      ],
      brandHubs: [
        { name: "Pentair Heaters", url: "/brands/pentair/pool-heaters" },
        { name: "Hayward Heaters", url: "/brands/hayward/pool-heaters" },
        { name: "Raypak Heaters", url: "/brands/raypak/pool-heaters" },
      ],
    };
  }
  if (cat.includes("filter")) {
    return {
      comparisons: [
        {
          title: "Cartridge vs. Sand Pool Filters",
          url: "/comparisons/cartridge-vs-sand-pool-filters",
          desc: "Micron filtration ratings, backwash water conservation, and maintenance labor.",
        },
      ],
      brandHubs: [
        { name: "Pentair Filters", url: "/brands/pentair/pool-filters" },
        { name: "Hayward Filters", url: "/brands/hayward/pool-filters" },
        { name: "Jandy Filters", url: "/brands/jandy/pool-filters" },
      ],
    };
  }
  return {
    comparisons: [
      {
        title: "Pentair vs. Hayward Pool Pumps",
        url: "/comparisons/pentair-vs-hayward-pool-pumps",
        desc: "Compare hydraulic curves, sound decibels, and DOE efficiency standards.",
      },
      {
        title: "Gas Heaters vs. Electric Heat Pumps",
        url: "/comparisons/gas-vs-electric-pool-heaters",
        desc: "Operating cost models and rapid heating vs steady seasonal efficiency.",
      },
    ],
    brandHubs: [
      { name: "Pentair Equipment Hub", url: "/brands/pentair" },
      { name: "Hayward Equipment Hub", url: "/brands/hayward" },
      { name: "Jandy Equipment Hub", url: "/brands/jandy" },
    ],
  };
}

export const Route = createFileRoute("/guides/$guide")({
  loader: ({ params }) => {
    const guide = getGuideBySlug(params.guide);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ loaderData }) => {
    const guide = loaderData?.guide;
    if (!guide) return {};

    const pageUrl = `https://poolsupplywholesalers.com/guides/${guide.slug}`;

    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.metaTitle,
      description: guide.metaDescription,
      image: guide.image,
      url: pageUrl,
      datePublished: guide.date,
      dateModified: guide.dateModified,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".guide-intro", ".guide-content h2", ".guide-content p"],
      },
      author: {
        "@type": "Person",
        name: guide.author,
        jobTitle: "Master Pool Contractor & Commercial Equipment Specialist",
        description:
          "Certified commercial aquatic specialist with Pools By Elio and Pool Supply Wholesalers, specializing in DOE-compliant pump hydraulics, heating efficiency, and automation systems.",
        url: "https://poolsupplywholesalers.com/about",
        worksFor: {
          "@type": "Organization",
          name: "Pool Supply Wholesalers",
          url: "https://poolsupplywholesalers.com",
        },
        knowsAbout: [
          "Commercial Pool Hydraulics",
          "Variable Speed Pump DOE Compliance",
          "Pool Heater Sizing & Thermal Dynamics",
          "Automated Chemical Dosing & Salt Systems",
        ],
      },
      publisher: {
        "@type": "Organization",
        name: "Pool Supply Wholesalers",
        url: "https://poolsupplywholesalers.com",
        logo: {
          "@type": "ImageObject",
          url: "https://poolsupplywholesalers.com/logo.png",
        },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    };

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
          name: "Guides",
          item: "https://poolsupplywholesalers.com/guides",
        },
        { "@type": "ListItem", position: 3, name: guide.title, item: pageUrl },
      ],
    };

    return {
      meta: [
        { title: guide.metaTitle },
        { name: "description", content: guide.metaDescription },
        { name: "keywords", content: guide.keywords.join(", ") },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:title", content: guide.metaTitle },
        { property: "og:description", content: guide.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "Pool Supply Wholesalers" },
        { property: "og:image", content: guide.image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: guide.metaTitle },
        { property: "og:locale", content: "en_US" },
        { property: "article:published_time", content: guide.date },
        { property: "article:modified_time", content: guide.dateModified },
        { property: "article:author", content: guide.author },
        { property: "article:section", content: guide.category },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@poolsupplywholesalers" },
        { name: "twitter:creator", content: "@poolsupplywholesalers" },
        { name: "twitter:title", content: guide.metaTitle },
        { name: "twitter:description", content: guide.metaDescription },
        { name: "twitter:image", content: guide.image },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(articleLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
      ],
    };
  },
  component: GuideDetailPage,
});

function GuideDetailPage() {
  const { guide } = Route.useLoaderData();
  const { products: allProducts } = useProducts();

  const recommendedProducts = useMemo(() => {
    const cat = (guide.category || "").toLowerCase();
    const matched = allProducts.filter((p) => {
      const pCat = (p.category || "").toLowerCase();
      const pName = (p.name || "").toLowerCase();
      if (cat.includes("pump")) return pCat.includes("pump") || pName.includes("pump");
      if (cat.includes("heat")) return pCat.includes("heat") || pName.includes("heater");
      if (cat.includes("filter")) return pCat.includes("filter") || pName.includes("filter");
      if (cat.includes("auto")) return pCat.includes("auto") || pName.includes("automation");
      if (cat.includes("salt") || cat.includes("chlorin")) return pCat.includes("salt") || pCat.includes("chlorin") || pName.includes("salt");
      return true;
    });
    return matched
      .sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0) || b.rating - a.rating)
      .slice(0, 4);
  }, [guide.category, allProducts]);

  const resources = useMemo(() => getGuideRelatedResources(guide.category), [guide.category]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header alwaysDark />

      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-200 py-4 pt-28">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="flex items-center text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-cyan-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="size-4 mx-2 text-slate-400" />
            <Link to="/guides" className="hover:text-cyan-600 transition-colors">
              Guides
            </Link>
            <ChevronRight className="size-4 mx-2 text-slate-400" />
            <span className="text-slate-900 truncate">{guide.title}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 py-12">
        <article className="container mx-auto px-4 max-w-4xl">
          <Link
            to="/guides"
            className="inline-flex items-center text-sm font-bold text-cyan-600 hover:text-cyan-700 mb-8 transition-colors"
          >
            <ArrowLeft className="size-4 mr-2" /> Back to all guides
          </Link>

          <header className="mb-12 border-b border-slate-200 pb-8">
            <div className="text-cyan-600 font-bold uppercase tracking-wider text-sm mb-4">
              {guide.category} Guide
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              {guide.title}
            </h1>
            <p className="guide-intro text-xl text-slate-600 leading-relaxed max-w-3xl">{guide.description}</p>
            <div className="mt-6 flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2">
                Written by <strong className="text-slate-700">{guide.author}</strong>
              </span>
              <span>•</span>
              <span>
                Updated{" "}
                {new Date(guide.dateModified).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </header>

          <div
            className="guide-content prose prose-slate prose-lg max-w-none 
            prose-headings:font-extrabold prose-headings:tracking-tight 
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-slate-900 
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-slate-800
            prose-p:leading-relaxed prose-p:text-slate-600 prose-p:mb-6
            prose-li:text-slate-600 prose-li:my-2
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
            marker:text-cyan-500"
          >
            {guide.content.map((block, index) => {
              if (block.type === "h2") return <h2 key={index}>{block.text}</h2>;
              if (block.type === "h3") return <h3 key={index}>{block.text}</h3>;
              if (block.type === "p") return <p key={index}>{block.text}</p>;
              if (block.type === "list" && block.items) {
                return (
                  <ul key={index}>
                    {block.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return null;
            })}
          </div>

          {/* Recommended Equipment Section */}
          {recommendedProducts.length > 0 && (
            <div className="mt-16 pt-10 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-2">
                    <ShoppingBag className="size-3 text-cyan-600" /> Recommended Equipment
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Top Recommended {guide.category}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                    Commercial-grade models engineered to meet the sizing and efficiency standards outlined in this guide.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {resources.brandHubs.map((b, idx) => (
                    <Link
                      key={idx}
                      to={b.url}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-cyan-700 hover:border-cyan-300 transition shadow-2xs"
                    >
                      {b.name}
                      <ArrowRight className="size-3" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendedProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Related Comparisons & Silos */}
          {resources.comparisons.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Scale className="size-4 text-cyan-600" /> Related Head-to-Head Comparisons
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {resources.comparisons.map((comp, idx) => (
                  <Link
                    key={idx}
                    to={comp.url}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-400 hover:shadow-xs transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-cyan-700 uppercase tracking-wider mb-1.5">
                        Comparison Analysis
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-cyan-700 transition">
                        {comp.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{comp.desc}</p>
                    </div>
                    <div className="mt-3 text-xs font-bold text-cyan-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Read Comparison <ArrowRight className="size-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-14 bg-gradient-to-r from-slate-900 to-cyan-950 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3">
              Ready to Order Wholesale {guide.category}?
            </h3>
            <p className="text-slate-300 text-sm max-w-xl mx-auto mb-6">
              Contractor and volume wholesale pricing available with same-day dispatch from TN, FL, TX, and CA hubs.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/shop/${guide.category.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`}
                className="inline-flex items-center justify-center rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 text-sm font-extrabold shadow-lg shadow-cyan-500/30 transition-all"
              >
                Browse All {guide.category} Catalog
                <ArrowRight className="size-4 ml-2" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 text-sm font-extrabold transition-all"
              >
                Request Commercial Quote
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
