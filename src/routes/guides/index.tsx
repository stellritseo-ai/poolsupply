import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BUYING_GUIDES } from "@/lib/guides-content";
import { BookOpen, ChevronRight, Clock } from "lucide-react";

export const Route = createFileRoute("/guides/")({
  head: () => {
    const pageUrl = "https://poolsupplywholesalers.com/guides";

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
          name: "Pool Equipment Buying Guides",
          item: pageUrl,
        },
      ],
    };

    const itemListLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Pool Equipment Buying & Sizing Guides",
      description:
        "Comprehensive commercial and residential pool equipment buying guides. Sizing calculators and selection rules for pumps, heaters, filters, chlorinators, and automation.",
      url: pageUrl,
      numberOfItems: BUYING_GUIDES.length,
      itemListElement: BUYING_GUIDES.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: g.title,
        url: `https://poolsupplywholesalers.com/guides/${g.slug}`,
      })),
    };

    return {
      meta: [
        { title: "Pool Equipment Buying Guides | Pool Supply Wholesalers" },
        {
          name: "description",
          content:
            "Read our comprehensive pool equipment buying guides. Learn how to size pumps, heaters, and filters for your commercial or residential pool.",
        },
        {
          name: "keywords",
          content:
            "pool equipment buying guide, pool pump sizing, pool heater sizing, pool filter comparison, pool automation guide",
        },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:title", content: "Pool Equipment Buying Guides | Pool Supply Wholesalers" },
        {
          property: "og:description",
          content:
            "Expert guides for sizing and selecting commercial and residential pool equipment. Pump sizing, heater BTUs, filter selection, and automation setup.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "Pool Supply Wholesalers" },
        { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: "Pool Equipment Buying Guides — Pool Supply Wholesalers" },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@poolsupplywholesalers" },
        { name: "twitter:creator", content: "@poolsupplywholesalers" },
        { name: "twitter:title", content: "Pool Equipment Buying Guides | Pool Supply Wholesalers" },
        {
          name: "twitter:description",
          content:
            "Expert guides for sizing and selecting commercial and residential pool equipment from Pool Supply Wholesalers.",
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
  component: GuidesIndexPage,
});

function GuidesIndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <div className="bg-slate-900 pt-32 pb-20 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
          <div className="container relative mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Expert Buying Guides
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Make informed decisions. Learn how to properly size, select, and maintain your pool
              equipment.
            </p>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="container mx-auto px-4 max-w-6xl mt-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {BUYING_GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                to={`/guides/${guide.slug}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:-translate-y-1"
              >
                <div className="p-8 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 text-cyan-600 text-sm font-bold tracking-wide uppercase">
                    <BookOpen className="size-4" />
                    {guide.category}
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                    {guide.title}
                  </h2>
                  <p className="text-slate-600 mb-8 line-clamp-3 leading-relaxed flex-1">
                    {guide.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <Clock className="size-3.5" />5 min read
                    </div>
                    <span className="flex items-center text-sm font-bold text-cyan-600 group-hover:translate-x-1 transition-transform">
                      Read Guide <ChevronRight className="size-4 ml-1" />
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
