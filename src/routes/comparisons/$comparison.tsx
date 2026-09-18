import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getComparisonBySlug } from "@/lib/comparisons-content";
import { ChevronRight, ArrowLeft } from "lucide-react";

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
      author: {
        "@type": "Person",
        name: comp.author,
        url: "https://poolsupplywholesalers.com/about",
      },
      publisher: {
        "@type": "Organization",
        name: "Pool Supply Wholesalers",
        logo: {
          "@type": "ImageObject",
          url: "https://poolsupplywholesalers.com/logo.png"
        }
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl }
    };

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://poolsupplywholesalers.com" },
        { "@type": "ListItem", "position": 2, "name": "Comparisons", "item": "https://poolsupplywholesalers.com/comparisons" },
        { "@type": "ListItem", "position": 3, "name": comp.title, "item": pageUrl }
      ]
    };

    return {
      meta: [
        { title: comp.metaTitle },
        { name: "description", content: comp.metaDescription },
        { name: "keywords", content: comp.keywords.join(", ") },
        { property: "og:title", content: comp.metaTitle },
        { property: "og:description", content: comp.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: pageUrl },
        { property: "og:image", content: comp.image },
        { property: "article:published_time", content: comp.date },
        { property: "article:modified_time", content: comp.dateModified },
        { property: "article:author", content: comp.author },
        { property: "article:section", content: comp.category },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: comp.metaTitle },
        { name: "twitter:description", content: comp.metaDescription },
        { name: "twitter:image", content: comp.image },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(articleLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) }
      ]
    };
  },
  component: ComparisonDetailPage,
});

function ComparisonDetailPage() {
  const { comp } = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-200 py-4">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav className="flex items-center text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-cyan-600 transition-colors">Home</Link>
            <ChevronRight className="size-4 mx-2 text-slate-400" />
            <Link to="/comparisons" className="hover:text-cyan-600 transition-colors">Comparisons</Link>
            <ChevronRight className="size-4 mx-2 text-slate-400" />
            <span className="text-slate-900 truncate">{comp.title}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 py-12">
        <article className="container mx-auto px-4 max-w-4xl">
          
          <Link to="/comparisons" className="inline-flex items-center text-sm font-bold text-cyan-600 hover:text-cyan-700 mb-8 transition-colors">
            <ArrowLeft className="size-4 mr-2" /> Back to all comparisons
          </Link>

          <header className="mb-12 border-b border-slate-200 pb-8">
            <div className="text-cyan-600 font-bold uppercase tracking-wider text-sm mb-4">
              {comp.category} Comparison
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              {comp.title}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
              {comp.description}
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2">
                Written by <strong className="text-slate-700">{comp.author}</strong>
              </span>
              <span>•</span>
              <span>Updated {new Date(comp.dateModified).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </header>

          <div className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-extrabold prose-headings:tracking-tight 
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-slate-900 
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-slate-800
            prose-p:leading-relaxed prose-p:text-slate-600 prose-p:mb-6
            prose-li:text-slate-600 prose-li:my-2
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
            marker:text-cyan-500">
            
            {comp.content.map((block, index) => {
              if (block.type === 'h2') return <h2 key={index}>{block.text}</h2>;
              if (block.type === 'h3') return <h3 key={index}>{block.text}</h3>;
              if (block.type === 'p') return <p key={index}>{block.text}</p>;
              if (block.type === 'list' && block.items) {
                return (
                  <ul key={index}>
                    {block.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                );
              }
              if (block.type === 'vs-table' && block.tableData) {
                return (
                  <div key={index} className="not-prose my-10 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="p-4 border-b border-slate-200 font-bold text-slate-900">Feature</th>
                          <th className="p-4 border-b border-slate-200 border-l font-bold text-cyan-700 bg-cyan-50/50 w-2/5">{block.item1Name}</th>
                          <th className="p-4 border-b border-slate-200 border-l font-bold text-blue-700 bg-blue-50/50 w-2/5">{block.item2Name}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {block.tableData.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-semibold text-slate-700">{row.feature}</td>
                            <td className="p-4 border-l border-slate-200 text-slate-600">{row.item1}</td>
                            <td className="p-4 border-l border-slate-200 text-slate-600">{row.item2}</td>
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
          
          <div className="mt-16 bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Find {comp.category} at Wholesale Prices</h3>
            <p className="text-slate-600 mb-6">Ready to make a choice? Browse our full selection.</p>
            <Link 
              to={`/shop/${comp.category.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`}
              className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-700 hover:-translate-y-0.5 transition-all"
            >
              Shop {comp.category}
            </Link>
          </div>

        </article>
      </main>
      <Footer />
    </div>
  );
}
