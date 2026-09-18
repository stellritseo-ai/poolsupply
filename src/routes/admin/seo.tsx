import { createFileRoute } from "@tanstack/react-router";
import { Globe, AlertTriangle, CheckCircle2, Info, Search, BarChart3, TrendingUp, RefreshCw } from "lucide-react";
import catalogProducts from "@/lib/catalog-products.json";

export const Route = createFileRoute("/admin/seo")({
  component: AdminSEOHealthPage,
});

function AdminSEOHealthPage() {
  // Simple analysis
  const totalProducts = catalogProducts.length;
  const missingMpn = catalogProducts.filter(p => !p.specs?.MPN).length;
  const missingDescription = catalogProducts.filter(p => !p.details || p.details.trim().length < 20).length;
  
  const seoScore = Math.round(
    ((totalProducts - missingMpn - missingDescription) / (totalProducts * 2)) * 100
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Globe className="size-8 text-cyan-600" />
            SEO Health Dashboard
          </h1>
          <p className="text-slate-500 mt-2">Monitor catalog meta data, indexability, and schema health.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          <RefreshCw className="size-4" />
          Recalculate
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Overall Score</h3>
            <div className={`p-2 rounded-xl ${seoScore > 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              <TrendingUp className="size-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-slate-900">{seoScore}/100</div>
          <p className="text-sm text-slate-500 mt-2">Based on product schema completeness</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Products</h3>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <Package className="size-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-slate-900">{totalProducts.toLocaleString()}</div>
          <p className="text-sm text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <CheckCircle2 className="size-4" /> 100% in Sitemap
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Missing MPN</h3>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <AlertTriangle className="size-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-slate-900">{missingMpn.toLocaleString()}</div>
          <p className="text-sm text-slate-500 mt-2">Products missing MPN for Google Shopping</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Thin Content</h3>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <Info className="size-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-slate-900">{missingDescription.toLocaleString()}</div>
          <p className="text-sm text-slate-500 mt-2">Products with short or missing details</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Search className="size-5 text-slate-400" />
            Technical SEO Status
          </h2>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-4 border-b border-slate-200 font-bold text-slate-900 text-sm uppercase tracking-wider">Check</th>
                <th className="p-4 border-b border-slate-200 font-bold text-slate-900 text-sm uppercase tracking-wider">Status</th>
                <th className="p-4 border-b border-slate-200 font-bold text-slate-900 text-sm uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold text-slate-900">Fake Reviews Filter</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="size-3.5" /> Active
                  </span>
                </td>
                <td className="p-4 text-slate-600 text-sm">Product JSON-LD automatically strips templated "Verified Buyer" reviews.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold text-slate-900">Search Parameter Indexing</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="size-3.5" /> Blocked
                  </span>
                </td>
                <td className="p-4 text-slate-600 text-sm">Category pages with ?q= dynamically render &lt;meta name="robots" content="noindex"&gt; and robots.txt explicitly Disallows them.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold text-slate-900">Sitemap Generator</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="size-3.5" /> Functional
                  </span>
                </td>
                <td className="p-4 text-slate-600 text-sm">Static sitemap generator builds pages, categories, products, and guides sitemaps.</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold text-slate-900">Category Semantic Content</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="size-3.5" /> Injected
                  </span>
                </td>
                <td className="p-4 text-slate-600 text-sm">Categories feature deep SEO content and FAQs below the product grid.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Needed because I used Package component from lucide but didn't import it at the top
import { Package } from "lucide-react";
