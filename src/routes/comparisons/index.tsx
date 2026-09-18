import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COMPARISONS } from "@/lib/comparisons-content";
import { ArrowLeftRight, ChevronRight, Scale } from "lucide-react";

export const Route = createFileRoute("/comparisons/")({
  head: () => ({
    meta: [
      { title: "Pool Equipment Comparisons & Reviews | Pool Supply Wholesalers" },
      { name: "description", content: "Compare top pool equipment brands and models. Pentair vs Hayward, Cartridge vs Sand filters, Gas vs Electric heaters. Make the right choice for your pool." },
      { name: "keywords", content: "pool equipment comparison, pentair vs hayward, jandy vs pentair, pool heater comparison, pool pump reviews" },
      { property: "og:title", content: "Pool Equipment Comparisons" },
      { property: "og:description", content: "Detailed head-to-head comparisons of the industry's top pool equipment." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://poolsupplywholesalers.com/comparisons" }
    ],
    links: [{ rel: "canonical", href: "https://poolsupplywholesalers.com/comparisons" }]
  }),
  component: ComparisonsIndexPage,
});

function ComparisonsIndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <div className="bg-slate-900 py-20 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-slate-900 to-slate-900"></div>
          <div className="container relative mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">Head-to-Head Comparisons</h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We put the top brands and technologies to the test so you can choose the best equipment for your pool.
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
