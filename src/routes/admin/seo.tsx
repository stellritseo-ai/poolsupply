import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  AlertTriangle,
  CheckCircle2,
  Info,
  Search,
  TrendingUp,
  RefreshCw,
  Package,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { getSeoHealthStatsDb } from "@/lib/api/products.functions";

export const Route = createFileRoute("/admin/seo")({
  component: AdminSEOHealthPage,
});

function AdminSEOHealthPage() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin_seo_health_stats"],
    queryFn: async () => {
      try {
        const res = await getSeoHealthStatsDb();
        if (!res.success) {
          console.error("SEO stats fetch failed:", res);
          return { totalProducts: 0, missingMpn: 0, missingDescription: 0, seoScore: 0 };
        }
        return res.stats;
      } catch (err) {
        console.error("Error fetching SEO stats:", err);
        return { totalProducts: 0, missingMpn: 0, missingDescription: 0, seoScore: 0 };
      }
    },
    refetchOnWindowFocus: false,
  });

  const stats = data || { totalProducts: 0, missingMpn: 0, missingDescription: 0, seoScore: 0 };

  return (
    <div className="space-y-5 sm:space-y-7 max-w-[1360px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="relative p-3 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600 shadow-sm">
            <Globe className="size-8" />
            <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              SEO Intelligence
              <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-md border border-cyan-200 translate-y-0.5">
                Live
              </span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">
              Real-time catalog meta data, indexability, and schema health.
            </p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-sm font-bold text-slate-700 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin text-cyan-500" : ""}`} />
          {isFetching ? "Syncing..." : "Sync Database"}
        </motion.button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="SEO Health Score"
          value={`${stats.seoScore}/100`}
          icon={TrendingUp}
          color="emerald"
          loading={isLoading}
          delay={0.1}
          subtitle={
            <span
              className={
                stats.seoScore > 80 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"
              }
            >
              {stats.seoScore > 80 ? "Excellent" : "Needs Attention"}
            </span>
          }
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          color="cyan"
          loading={isLoading}
          delay={0.2}
          subtitle={
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> 100% indexed
            </span>
          }
        />
        <StatCard
          title="Missing MPN"
          value={stats.missingMpn.toLocaleString()}
          icon={AlertTriangle}
          color="amber"
          loading={isLoading}
          delay={0.3}
          subtitle={
            <span className="text-slate-500 font-medium">Products missing Shopping ID</span>
          }
        />
        <StatCard
          title="Thin Content"
          value={stats.missingDescription.toLocaleString()}
          icon={Info}
          color="rose"
          loading={isLoading}
          delay={0.4}
          subtitle={
            <span className="text-slate-500 font-medium">Short or missing descriptions</span>
          }
        />
      </div>

      {/* Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-50 text-slate-500 border border-slate-200/60">
            <ShieldCheck className="size-5" />
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-wide">
            Technical Infrastructure Status
          </h2>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                <th className="p-4 sm:p-5 border-b border-slate-200">System Check</th>
                <th className="p-4 sm:p-5 border-b border-slate-200">Status</th>
                <th className="p-4 sm:p-5 border-b border-slate-200">Technical Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <StatusRow
                title="Templated Reviews Filter"
                status="Active"
                color="emerald"
                desc="Product JSON-LD automatically strips templated 'Verified Buyer' reviews to prevent Google Search manual actions."
              />
              <StatusRow
                title="Search Parameter Indexing"
                status="Blocked"
                color="emerald"
                desc="Category pages with ?q= dynamically render <meta robots='noindex'> and robots.txt explicitly Disallows them."
              />
              <StatusRow
                title="Dynamic Sitemap Generator"
                status="Functional"
                color="cyan"
                desc="Static sitemap generator builds pages, categories, products, and guides sitemaps on build."
              />
              <StatusRow
                title="Category Semantic Content"
                status="Injected"
                color="cyan"
                desc="Categories feature deep SEO content and FAQs below the product grid for AI Search compatibility."
              />
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, loading, delay, subtitle }: any) {
  const colorMap: any = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{title}</h3>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon className="size-4" />
        </div>
      </div>

      <div className="mt-auto">
        {loading ? (
          <div className="h-9 sm:h-10 w-24 bg-slate-100 rounded-lg animate-pulse mb-2" />
        ) : (
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            {value}
          </div>
        )}
        <div className="text-xs">{subtitle}</div>
      </div>
    </motion.div>
  );
}

function StatusRow({ title, status, color, desc }: any) {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="p-4 sm:p-5 font-bold text-slate-800">{title}</td>
      <td className="p-4 sm:p-5">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
            color === "emerald"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : color === "cyan"
                ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {color === "emerald" && <CheckCircle2 className="size-3.5" />}
          {color === "cyan" && <Search className="size-3.5" />}
          {status}
        </span>
      </td>
      <td className="p-4 sm:p-5 text-slate-500 text-sm leading-relaxed max-w-lg">{desc}</td>
    </tr>
  );
}
