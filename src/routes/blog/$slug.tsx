import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  getArticleBySlug,
  getRelatedArticles,
  ContentBlock,
  BlogArticle,
} from "@/lib/blog-content";
import { BLOG_ARTICLES } from "@/lib/blog-content";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  User,
  Tag,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Info,
  Share2,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const article = getArticleBySlug(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    if (!article) return {};

    const pageUrl = `https://poolsupplywholesalers.com/blog/${article.slug}`;

    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.metaTitle,
      description: article.metaDescription,
      image: article.image,
      url: pageUrl,
      datePublished: article.date,
      dateModified: article.dateModified,
      author: {
        "@type": "Organization",
        name: article.author,
        url: "https://poolsupplywholesalers.com",
      },
      publisher: {
        "@type": "Organization",
        name: "Pool Supply Wholesalers",
        url: "https://poolsupplywholesalers.com",
        logo: {
          "@type": "ImageObject",
          url: "https://poolsupplywholesalers.com/assets/logo.png",
        },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      keywords: article.keywords.join(", "),
      articleSection: article.categoryLabel,
      wordCount: 900,
    };

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://poolsupplywholesalers.com" },
        { "@type": "ListItem", position: 2, name: "Pool Equipment Blog", item: "https://poolsupplywholesalers.com/blog" },
        { "@type": "ListItem", position: 3, name: article.title, item: pageUrl },
      ],
    };

    const faqLd = article.faqs.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faqs.map(faq => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    } : null;

    return {
      meta: [
        { title: article.metaTitle },
        { name: "description", content: article.metaDescription },
        { name: "keywords", content: article.keywords.join(", ") },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { name: "author", content: article.author },
        { property: "og:title", content: article.metaTitle },
        { property: "og:description", content: article.metaDescription },
        { property: "og:image", content: article.image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "Pool Supply Wholesalers" },
        { property: "article:published_time", content: article.date },
        { property: "article:modified_time", content: article.dateModified },
        { property: "article:author", content: article.author },
        { property: "article:section", content: article.categoryLabel },
        ...(article.tags.map(tag => ({ property: "article:tag", content: tag }))),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: article.metaTitle },
        { name: "twitter:description", content: article.metaDescription },
        { name: "twitter:image", content: article.image },
      ],
      links: [
        { rel: "canonical", href: pageUrl },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(articleLd) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        ...(faqLd ? [{ type: "application/ld+json", children: JSON.stringify(faqLd) }] : []),
      ],
    };
  },
  component: ArticlePage,
});

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={index} className="text-slate-700 leading-relaxed text-[15px] sm:text-base">
          {block.text}
        </p>
      );

    case "h2":
      return (
        <h2 key={index} className="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-3 leading-snug scroll-mt-24" id={block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
          {block.text}
        </h2>
      );

    case "h3":
      return (
        <h3 key={index} className="text-base sm:text-lg font-extrabold text-slate-800 mt-6 mb-2 leading-snug">
          {block.text}
        </h3>
      );

    case "bullets":
      return (
        <ul key={index} className="space-y-2 my-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] text-slate-700 leading-relaxed">
              <CheckCircle2 className="size-4 text-cyan-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "numbered":
      return (
        <ol key={index} className="space-y-2 my-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] text-slate-700 leading-relaxed">
              <span className="size-5 rounded-full bg-cyan-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );

    case "table":
      return (
        <div key={index} className="my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 to-slate-800">
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-white font-extrabold uppercase tracking-wide text-[11px] first:rounded-tl-xl last:rounded-tr-xl">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-3 text-slate-700 border-t border-slate-100 ${ci === 0 ? "font-bold text-slate-900" : ""}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "callout": {
      const variants = {
        tip: { bg: "bg-cyan-50 border-cyan-300", icon: <Lightbulb className="size-4 text-cyan-600" />, titleColor: "text-cyan-800", textColor: "text-cyan-700" },
        warning: { bg: "bg-amber-50 border-amber-300", icon: <AlertTriangle className="size-4 text-amber-600" />, titleColor: "text-amber-800", textColor: "text-amber-700" },
        info: { bg: "bg-blue-50 border-blue-300", icon: <Info className="size-4 text-blue-600" />, titleColor: "text-blue-800", textColor: "text-blue-700" },
      };
      const v = variants[block.variant];
      return (
        <div key={index} className={`my-5 p-4 rounded-xl border ${v.bg} flex gap-3`}>
          <div className="shrink-0 mt-0.5">{v.icon}</div>
          <div>
            <div className={`text-[11px] font-black uppercase tracking-wider mb-1 ${v.titleColor}`}>{block.title}</div>
            <p className={`text-[13px] leading-relaxed ${v.textColor}`}>{block.text}</p>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const relatedArticles = getRelatedArticles(article.relatedSlugs);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Header alwaysDark />

      <main className="flex-1">
        {/* ─── ARTICLE HERO ─── */}
        <section className="relative pt-24 pb-10 sm:pt-32 sm:pb-14 bg-gradient-to-b from-slate-900 via-cyan-950 to-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/40 pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-white/50 mb-6 flex-wrap">
              <Link to="/" className="hover:text-white/80 transition-colors">Home</Link>
              <ChevronRight className="size-3 text-white/30" />
              <Link to="/blog" className="hover:text-white/80 transition-colors">Blog</Link>
              <ChevronRight className="size-3 text-white/30" />
              <span className="text-white/70 line-clamp-1">{article.categoryLabel}</span>
            </div>

            {/* Category + highlight badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
                <BookOpen className="size-3" />
                {article.categoryLabel}
              </span>
              {article.highlight && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cyan-400/90 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  {article.highlight}
                </span>
              )}
              {article.featured && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mb-5 max-w-3xl"
            >
              {article.title}
            </motion.h1>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-[12px] text-white/60 font-medium">
              <span className="flex items-center gap-1.5">
                <User className="size-3.5 text-cyan-400" />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-cyan-400" />
                {new Date(article.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-cyan-400" />
                {article.readTime}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-5">
              {article.tags.slice(0, 4).map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white/60 bg-white/10 border border-white/15">
                  <Tag className="size-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ARTICLE BODY ─── */}
        <section className="py-10 sm:py-14 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-start">

              {/* Article Content */}
              <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Featured Article Image */}
                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[460px] overflow-hidden bg-slate-900">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Excerpt / intro highlight */}
                <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-slate-100 bg-gradient-to-br from-cyan-50/60 to-white">
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium italic border-l-4 border-cyan-500 pl-4">
                    {article.excerpt}
                  </p>
                </div>

                {/* Content blocks */}
                <div className="px-6 sm:px-8 py-8 space-y-4">
                  {article.content.map((block, i) => renderBlock(block, i))}
                </div>

                {/* FAQ Section */}
                {article.faqs.length > 0 && (
                  <div className="px-6 sm:px-8 pb-8">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-5 flex items-center gap-2">
                      <Lightbulb className="size-5 text-cyan-600" />
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                      {article.faqs.map((faq, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="p-5 rounded-2xl bg-slate-50 border border-slate-200"
                        >
                          <h3 className="text-sm font-black text-slate-900 mb-2">{faq.q}</h3>
                          <p className="text-[13px] text-slate-600 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article Footer */}
                <div className="px-6 sm:px-8 py-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-cyan-700 transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back to all guides
                  </Link>
                  <button
                    onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-cyan-700 transition-colors"
                    aria-label="Copy article link"
                  >
                    <Share2 className="size-3.5" />
                    Share article
                  </button>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="space-y-5 lg:sticky lg:top-28">
                {/* Table of Contents */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">In This Guide</h3>
                  <nav className="space-y-1" aria-label="Table of contents">
                    {article.content
                      .filter(b => b.type === "h2")
                      .map((b, i) => {
                        if (b.type !== "h2") return null;
                        const id = b.text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                        return (
                          <a
                            key={i}
                            href={`#${id}`}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 transition-all"
                          >
                            <span className="size-4 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span className="line-clamp-2 leading-snug">{b.text}</span>
                          </a>
                        );
                      })}
                  </nav>
                </div>

                {/* CTA */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white space-y-3 shadow-md shadow-cyan-600/20">
                  <h3 className="text-sm font-black leading-tight">Ready to order the equipment from this guide?</h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    All equipment mentioned — Pentair, Hayward, Jandy, Raypak — at wholesale to retail pricing. Same-day shipping nationwide.
                  </p>
                  <a
                    href="/shop/all"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-cyan-700 font-extrabold text-xs transition-all hover:bg-cyan-50 active:scale-95 shadow-sm w-full justify-center"
                  >
                    Shop Equipment Catalog
                    <ExternalLink className="size-3.5" />
                  </a>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs transition-all hover:bg-white/20 active:scale-95 w-full justify-center"
                  >
                    Talk to a Specialist
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                {/* Article Info */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs text-slate-500">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Article Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><Calendar className="size-3.5 text-cyan-600" /><span>Published {new Date(article.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span></div>
                    <div className="flex items-center gap-2"><Clock className="size-3.5 text-cyan-600" /><span>{article.readTime}</span></div>
                    <div className="flex items-center gap-2"><User className="size-3.5 text-cyan-600" /><span>{article.author}</span></div>
                    <div className="flex items-center gap-2"><BookOpen className="size-3.5 text-cyan-600" /><span>{article.categoryLabel}</span></div>
                  </div>
                </div>
              </aside>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-14">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <BookOpen className="size-5 text-cyan-600" />
                  Related Guides
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {relatedArticles.map((related, i) => (
                    <motion.div
                      key={related.slug}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        to="/blog/$slug"
                        params={{ slug: related.slug }}
                        className="group block rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-cyan-300 hover:shadow-md transition-all overflow-hidden"
                        aria-label={related.title}
                      >
                        <div className="relative h-40 bg-slate-900 overflow-hidden">
                          <img
                            src={related.image}
                            alt={related.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/60 border border-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-white">
                            <BookOpen className="size-2.5 text-cyan-300" />
                            {related.categoryLabel}
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-cyan-700 transition-colors line-clamp-2">
                            {related.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                            <Clock className="size-3" />
                            <span>{related.readTime}</span>
                            <span className="ml-auto text-cyan-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                              Read <ArrowRight className="size-3" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shop the Equipment in This Guide at{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Wholesale Prices
              </span>
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Pentair, Hayward, Jandy, and Raypak equipment shipped same-day from Nashville TN, Los Angeles CA, Dallas TX, and Orlando FL hubs.
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

// Generate static params for all blog slugs
export const generateStaticParams = () =>
  BLOG_ARTICLES.map(a => ({ slug: a.slug }));
