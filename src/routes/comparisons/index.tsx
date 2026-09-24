import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COMPARISONS } from "@/lib/comparisons-content";
import { ArrowLeftRight, ChevronRight, Scale } from "lucide-react";

export const Route = createFileRoute("/comparisons/")({
  head: () => {
    const pageUrl = "https://poolsupplywholesalers.com/comparisons";

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
          name: "Pool Equipment Comparisons",
          item: pageUrl,
        },
      ],
    };

    const itemListLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Head-to-Head Pool Equipment Comparisons",
      description:
        "Side-by-side technical comparisons of commercial pool equipment brands and technologies: Pentair vs Hayward, Raypak vs Jandy, Gas vs Heat Pumps, and Cartridge vs Sand.",
      url: pageUrl,
      numberOfItems: COMPARISONS.length,
      itemListElement: COMPARISONS.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.title,
        url: `https://poolsupplywholesalers.com/comparisons/${c.slug}`,
      })),
    };

    return {
      meta: [
        { title: "Pool Equipment Comparisons & Reviews | Pool Supply Wholesalers" },
        {
          name: "description",
          content:
            "Compare top pool equipment brands and models. Pentair vs Hayward, Cartridge vs Sand filters, Gas vs Electric heaters. Make the right choice for your pool.",
        },
        {
          name: "keywords",
          content:
            "pool equipment comparison, pentair vs hayward, jandy vs pentair, pool heater comparison, pool pump reviews",
        },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:title", content: "Pool Equipment Comparisons & Reviews | Pool Supply Wholesalers" },
        {
          property: "og:description",
          content: "Detailed head-to-head comparisons of the industry's top pool equipment. Pentair vs Hayward, Gas vs Electric, Cartridge vs Sand.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "Pool Supply Wholesalers" },
        { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: "Pool Equipment Comparisons — Pool Supply Wholesalers" },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@poolsupplywholesalers" },
        { name: "twitter:creator", content: "@poolsupplywholesalers" },
        { name: "twitter:title", content: "Pool Equipment Comparisons & Reviews | Pool Supply Wholesalers" },
        {
          name: "twitter:description",
          content: "Detailed head-to-head comparisons of the industry's top pool equipment. Make the right choice for your pool.",
        },
        { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        { type: "application/ld+json", children: JSON.stringify(itemListLd) },
      ],
    };
  },
  component: ComparisonsIndexPage,
});

function ComparisonsIndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <div className="bg-slate-900 pt-32 pb-20 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-slate-900 to-slate-900"></div>
          <div className="container relative mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Head-to-Head Comparisons
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We put the top brands and technologies to the test so you can choose the best
              equipment for your pool.
            </p>
          </div>
        </div>

        {/* Comparisons Grid */}
        <div className="container mx-auto px-4 max-w-5xl mt-12">
          <div className="flex flex-col gap-6">
            {COMPARISONS.map((comp) => (
              <Link
                key={comp.slug}
                to={`/comparisons/${comp.slug}`}
                className="group flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:-translate-y-1"
              >
                <div className="p-8 flex flex-col justify-center flex-1">
                  <div className="flex items-center gap-2 mb-3 text-cyan-600 text-sm font-bold tracking-wide uppercase">
                    <Scale className="size-4" />
                    {comp.category}
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors">
                    {comp.title}
                  </h2>
                  <p className="text-slate-600 mb-6 leading-relaxed max-w-2xl">
                    {comp.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 group-hover:bg-cyan-50 group-hover:text-cyan-700 transition-colors">
                      Read Comparison <ArrowLeftRight className="size-4 ml-2" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
