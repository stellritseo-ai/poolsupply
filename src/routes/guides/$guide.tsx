import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getGuideBySlug } from "@/lib/guides-content";
import { ChevronRight, ArrowLeft } from "lucide-react";

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
      author: {
        "@type": "Person",
        name: guide.author,
        url: "https://poolsupplywholesalers.com/about",
      },
      publisher: {
        "@type": "Organization",
        name: "Pool Supply Wholesalers",
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
        { property: "og:title", content: guide.metaTitle },
        { property: "og:description", content: guide.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: pageUrl },
        { property: "og:image", content: guide.image },
        { property: "article:published_time", content: guide.date },
        { property: "article:modified_time", content: guide.dateModified },
        { property: "article:author", content: guide.author },
        { property: "article:section", content: guide.category },
        { name: "twitter:card", content: "summary_large_image" },
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-200 py-4">
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
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">{guide.description}</p>
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
            className="prose prose-slate prose-lg max-w-none 
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

          <div className="mt-16 bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Ready to find your equipment?
            </h3>
            <p className="text-slate-600 mb-6">
              Browse our complete wholesale catalog of {guide.category.toLowerCase()}.
            </p>
            <Link
              to={`/shop/${guide.category.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`}
              className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-700 hover:-translate-y-0.5 transition-all"
            >
              Shop {guide.category}
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
