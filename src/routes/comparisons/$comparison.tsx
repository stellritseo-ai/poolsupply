import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getComparisonBySlug, ComparisonContent } from "@/lib/comparisons-content";
import { ChevronRight, ArrowLeft, Scale, ShoppingBag, ArrowRight, BookOpen } from "lucide-react";
import { useProducts, Product } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";

function getComparisonSiloLinks(comp: ComparisonContent) {
  const slug = comp.slug.toLowerCase();
  const cat = comp.category.toLowerCase();

  let catSlug = "pool-pumps";
  let catName = "Pool Pumps";
  if (cat.includes("heat")) {
    catSlug = "pool-heaters";
    catName = "Pool Heaters";
  } else if (cat.includes("filter")) {
    catSlug = "pool-filters";
    catName = "Pool Filters";
  }

  let brand1 = "pentair";
  let brand2 = "hayward";

  if (slug.includes("pentair-vs-hayward")) {
    brand1 = "pentair";
    brand2 = "hayward";
  } else if (slug.includes("jandy-vs-pentair")) {
    brand1 = "jandy";
    brand2 = "pentair";
  } else if (slug.includes("gas-vs-electric")) {
    brand1 = "raypak";
    brand2 = "pentair";
  } else if (slug.includes("cartridge-vs-sand")) {
    brand1 = "hayward";
    brand2 = "pentair";
  }

  const brand1Name = brand1.charAt(0).toUpperCase() + brand1.slice(1);
  const brand2Name = brand2.charAt(0).toUpperCase() + brand2.slice(1);

  return {
    catSlug,
    catName,
    brand1,
    brand2,
    brand1Name,
    brand2Name,
    guideUrl: `/guides/${catSlug.replace(/s$/, "")}-buying-guide`,
    brand1Hub: `/brands/${brand1}/${catSlug}`,
    brand2Hub: `/brands/${brand2}/${catSlug}`,
    catUrl: `/shop/${catSlug}`,
  };
}

export const Route = createFileRoute("/comparisons/$comparison")({
  loader: ({ params }) => {
    const comp = getComparisonBySlug(params.comparison);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ loaderData }) => {
    const comp = loaderData?.comp;
    if (!comp) return {};

    const pageUrl = `https://poolsupplywholesalers.com/comparisons/${comp.slug}`;

    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: comp.metaTitle,
      description: comp.metaDescription,
      image: comp.image,
      url: pageUrl,
      datePublished: comp.date,
      dateModified: comp.dateModified,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "header p", "table"],
      },
      author: {
        "@type": "Person",
        name: comp.author,
        jobTitle: "Master Pool Contractor & Commercial Hydraulics Specialist",
        description:
          "Licensed commercial pool contractor and equipment engineer at Pools By Elio and Pool Supply Wholesalers.",
        url: "https://poolsupplywholesalers.com/about",
        worksFor: {
          "@type": "Organization",
          name: "Pool Supply Wholesalers",
          url: "https://poolsupplywholesalers.com",
        },
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
          name: "Comparisons",
          item: "https://poolsupplywholesalers.com/comparisons",
        },
        { "@type": "ListItem", position: 3, name: comp.title, item: pageUrl },
      ],
    };

    return {
      meta: [
        { title: comp.metaTitle },
        { name: "description", content: comp.metaDescription },
        { name: "keywords", content: comp.keywords.join(", ") },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:title", content: comp.metaTitle },
        { property: "og:description", content: comp.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "Pool Supply Wholesalers" },
        { property: "og:image", content: comp.image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: comp.metaTitle },
        { property: "og:locale", content: "en_US" },
        { property: "article:published_time", content: comp.date },
        { property: "article:modified_time", content: comp.dateModified },
        { property: "article:author", content: comp.author },
        { property: "article:section", content: comp.category },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@poolsupplywholesalers" },
        { name: "twitter:creator", content: "@poolsupplywholesalers" },
        { name: "twitter:title", content: comp.metaTitle },
        { name: "twitter:description", content: comp.metaDescription },
        { name: "twitter:image", content: comp.image },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(articleLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
      ],
    };
  },
  component: ComparisonDetailPage,
});

function ComparisonDetailPage() {
  const { comp } = Route.useLoaderData();
  const { products: allProducts } = useProducts();
  const silo = useMemo(() => getComparisonSiloLinks(comp), [comp]);

  const brand1Products = useMemo(() => {
    return allProducts
      .filter((p) => {
        const brand = (p.brand || "").toLowerCase();
        const pCat = (p.category || "").toLowerCase();
        return brand.includes(silo.brand1) && (pCat.includes(silo.catSlug.replace("pool-", "")) || pCat.includes(silo.catSlug));
      })
      .slice(0, 2);
  }, [allProducts, silo]);

  const brand2Products = useMemo(() => {
    return allProducts
      .filter((p) => {
        const brand = (p.brand || "").toLowerCase();
        const pCat = (p.category || "").toLowerCase();
        return brand.includes(silo.brand2) && (pCat.includes(silo.catSlug.replace("pool-", "")) || pCat.includes(silo.catSlug));
      })
      .slice(0, 2);
  }, [allProducts, silo]);

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
            <Link to="/comparisons" className="hover:text-cyan-600 transition-colors">
              Comparisons
            </Link>
            <ChevronRight className="size-4 mx-2 text-slate-400" />
            <span className="text-slate-900 truncate">{comp.title}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 py-12">
        <article className="container mx-auto px-4 max-w-4xl">
          <Link
            to="/comparisons"
            className="inline-flex items-center text-sm font-bold text-cyan-600 hover:text-cyan-700 mb-8 transition-colors"
          >
            <ArrowLeft className="size-4 mr-2" /> Back to all comparisons
          </Link>

          <header className="mb-12 border-b border-slate-200 pb-8">
            <div className="text-cyan-600 font-bold uppercase tracking-wider text-sm mb-4">
              {comp.category} Comparison
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              {comp.title}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">{comp.description}</p>
            <div className="mt-6 flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2">
                Written by <strong className="text-slate-700">{comp.author}</strong>
              </span>
              <span>•</span>
              <span>
                Updated{" "}
                {new Date(comp.dateModified).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </header>

          <div
            className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-extrabold prose-headings:tracking-tight 
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-slate-900 
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-slate-800
            prose-p:leading-relaxed prose-p:text-slate-600 prose-p:mb-6
            prose-li:text-slate-600 prose-li:my-2
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
            marker:text-cyan-500"
          >
            {comp.content.map((block, index) => {
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
              if (block.type === "vs-table" && block.tableData) {
                return (
                  <div
                    key={index}
                    className="not-prose my-10 overflow-x-auto rounded-xl border border-slate-200 shadow-sm"
                  >
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="p-4 border-b border-slate-200 font-bold text-slate-900">
                            Feature
                          </th>
                          <th className="p-4 border-b border-slate-200 border-l font-bold text-cyan-700 bg-cyan-50/50 w-2/5">
                            {block.item1Name}
                          </th>
                          <th className="p-4 border-b border-slate-200 border-l font-bold text-blue-700 bg-blue-50/50 w-2/5">
                            {block.item2Name}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {block.tableData.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-semibold text-slate-700">{row.feature}</td>
                            <td className="p-4 border-l border-slate-200 text-slate-600">
                              {row.item1}
                            </td>
                            <td className="p-4 border-l border-slate-200 text-slate-600">
                              {row.item2}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Side-by-Side Equipment Comparison Products */}
          {(brand1Products.length > 0 || brand2Products.length > 0) && (
            <div className="mt-16 pt-10 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-2">
                    <ShoppingBag className="size-3 text-cyan-600" /> Factory-Direct Equipment
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Shop Compared {silo.catName} at Wholesale
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                    Compare in-stock commercial and residential models from {silo.brand1Name} and {silo.brand2Name} with trade pricing and factory warranty.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={silo.brand1Hub}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-cyan-700 hover:border-cyan-300 transition shadow-2xs"
                  >
                    All {silo.brand1Name} {silo.catName}
                    <ArrowRight className="size-3" />
                  </Link>
                  <Link
                    to={silo.brand2Hub}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-cyan-700 hover:border-cyan-300 transition shadow-2xs"
                  >
                    All {silo.brand2Name} {silo.catName}
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {brand1Products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
                {brand2Products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i + 2} />
                ))}
              </div>
            </div>
          )}

          {/* Sizing & Hub Silo Links */}
          <div className="mt-14 bg-gradient-to-r from-slate-900 to-cyan-950 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3">
              Need Sizing Assistance for Your Pool?
            </h3>
            <p className="text-slate-300 text-sm max-w-xl mx-auto mb-6">
              Our master pool contractor team can review your equipment pad specs, calculate turnover rates, and ensure warranty compliance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to={silo.guideUrl}
                className="inline-flex items-center justify-center rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 text-sm font-extrabold shadow-lg shadow-cyan-500/30 transition-all"
              >
                Read {silo.catName} Sizing Guide
                <BookOpen className="size-4 ml-2" />
              </Link>
              <Link
                to={silo.catUrl}
                className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 text-sm font-extrabold transition-all"
              >
                Browse All {silo.catName}
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
