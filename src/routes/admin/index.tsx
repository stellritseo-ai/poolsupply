import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatUSD } from "@/components/site/cart-context";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Package,
  Star,
  Activity,
  Zap,
  Mail,
  Users,
  Eye,
  Globe,
  MessageCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Monitor,
  Laptop,
  Layers,
  RefreshCw
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { motion } from "framer-motion";
import { getFullDashboardMetricsDb, getQuickDashboardStatsDb, DashboardMetrics } from "@/lib/api/analytics.functions";

export const Route = createFileRoute("/admin/")({
  component: DashboardIndex,
});

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } }
};

function DashboardIndex() {
  // Fast 4-card KPI stats (refreshes every 5s)
  const { data: quickStats, isLoading: quickLoading, refetch: refetchQuick } = useQuery({
    queryKey: ["quick_dashboard_stats"],
    queryFn: async () => {
      const res = await getQuickDashboardStatsDb();
      return res.stats;
    },
    refetchInterval: 5000
  });

  // Full metrics for charts & tables (refreshes every 10s)
  const { data: dbMetricsRes, isLoading, refetch } = useQuery({
    queryKey: ["full_dashboard_metrics"],
    queryFn: async () => {
      const res = await getFullDashboardMetricsDb();
      return res.metrics;
    },
    refetchInterval: 10000
  });

  const refetchAll = () => { refetch(); refetchQuick(); };

  // 4 KPI cards use quickStats, rest uses full metrics
  const qs = quickStats || {
    totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0,
    avgOrderValue: 0, revenueMoMChange: 0, revenueMoMDelta: 0,
    totalPageHits: 0, todayHits: 0, liveVisitors: 0, lowStockCount: 0, unreadEmails: 0
  };

  const m: DashboardMetrics = dbMetricsRes || {
    totalRevenue: qs.totalRevenue,
    revenueMoMChange: qs.revenueMoMChange,
    revenueMoMDelta: qs.revenueMoMDelta,
    totalOrders: qs.totalOrders,
    ordersMoMChange: 0,
    avgOrderValue: qs.avgOrderValue,
    totalProducts: qs.totalProducts,
    lowStockCount: qs.lowStockCount,
    totalCustomers: qs.totalCustomers,
    totalPageHits: qs.totalPageHits,
    todayHits: qs.todayHits,
    liveVisitors: 0,
    unreadEmails: qs.unreadEmails,
    activeChats: 0,
    categoryDistribution: [],
    monthlyRevenueChart: [
      { name: "Feb", revenue: 0, ordersCount: 0, target: 30000 },
      { name: "Mar", revenue: 0, ordersCount: 0, target: 35000 },
      { name: "Apr", revenue: 0, ordersCount: 0, target: 40000 },
      { name: "May", revenue: 0, ordersCount: 0, target: 42000 },
      { name: "Jun", revenue: 0, ordersCount: 0, target: 48000 },
      { name: "Jul", revenue: 0, ordersCount: 0, target: 55000 }
    ],
    recentOrders: [],
    topProducts: []
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* ─── BILLION-DOLLAR ENTERPRISE HERO HEADER ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[2.5rem] overflow-hidden p-8 sm:p-10 border border-cyan-500/20"
        style={{
          background: "linear-gradient(135deg, #001228 0%, #002855 40%, #004080 75%, #0066cc 100%)",
          boxShadow: "0 25px 70px -15px rgba(0, 102, 204, 0.4)"
        }}
      >
        {/* Glow ambient background elements */}
        <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(89,210,243,0.25) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-[-40%] left-[15%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)", filter: "blur(50px)" }} />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-cyan-300 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="size-3.5 text-cyan-400 animate-pulse" />
              Live Database Telemetry Control Panel
            </div>
            <h1 className="text-[30px] font-black text-white tracking-tight leading-tight">
              Poolsby <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">Global Command</span>
            </h1>
            <p className="text-sky-100/75 text-sm max-w-xl font-medium leading-relaxed">
              Real-time database metrics, MoM revenue growth engine, live active visitor hit counters, and catalog telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={refetchAll}
              className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition backdrop-blur-md cursor-pointer"
              title="Refresh DB Telemetry"
            >
              <RefreshCw className={`size-3.5 ${(isLoading || quickLoading) ? "animate-spin text-cyan-300" : ""}`} />
            </button>

            <Link
              to="/admin/emails"
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-[11px] text-slate-900 bg-white hover:bg-cyan-50 transition-all shadow-md cursor-pointer"
            >
              <Mail className="size-3.5 text-indigo-600" /> Web Email
              {m.unreadEmails > 0 && (
                <span className="size-4 rounded-full bg-rose-500 text-white text-[9px] font-black grid place-items-center animate-bounce">
                  {m.unreadEmails}
                </span>
              )}
            </Link>

            <Link
              to="/admin/chat"
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-[11px] text-white bg-white/15 border border-white/25 hover:bg-white/25 transition-all backdrop-blur-md cursor-pointer"
            >
              <MessageCircle className="size-3.5 text-cyan-300" /> Live Chat
              {m.activeChats > 0 && (
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-[11px] text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md cursor-pointer"
            >
              <ShoppingBag className="size-3.5" /> View Orders
            </Link>

            <Link
              to="/admin/products"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-[11px] text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md cursor-pointer"
            >
              <Package className="size-3.5" /> Manage Catalog
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ─── 5-PILLAR DYNAMIC METRIC CARDS ─── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5"
      >
        {/* Card 1: Total Revenue — LIVE DB */}
        <motion.div variants={cardVariants} className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="size-10 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center group-hover:scale-110 transition-transform">
              <DollarSign className="size-5" />
            </div>
          </div>
          {quickLoading && !quickStats ? (
            <div className="h-8 w-32 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-slate-900 tracking-tight">{formatUSD(qs.totalRevenue)}</div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs">
            {qs.revenueMoMChange !== 0 ? (
              <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                <TrendingUp className="size-3" /> +{qs.revenueMoMChange}% MoM
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-bold">Live from Database</span>
            )}
          </div>
        </motion.div>

        {/* Card 2: Total Orders — LIVE DB */}
        <motion.div variants={cardVariants} className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-[2rem] p-6 text-white shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">Total Orders</span>
            <div className="size-10 rounded-2xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 grid place-items-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="size-5" />
            </div>
          </div>
          {quickLoading && !quickStats ? (
            <div className="h-8 w-16 bg-slate-700 rounded-xl animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-2">
              {qs.totalOrders}
              <span className="text-xs font-bold text-cyan-300">Orders</span>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-extrabold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/40">
              <Sparkles className="size-3" /> Avg {formatUSD(qs.avgOrderValue)}
            </span>
          </div>
        </motion.div>

        {/* Card 3: Total Products — LIVE DB */}
        <motion.div variants={cardVariants} className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Products</span>
            <div className="size-10 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center group-hover:scale-110 transition-transform relative">
              <Package className="size-5" />
            </div>
          </div>
          {quickLoading && !quickStats ? (
            <div className="h-8 w-16 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {qs.totalProducts}
              {qs.lowStockCount > 0 && (
                <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="size-3" /> {qs.lowStockCount} Low Stock
                </span>
              )}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Globe className="size-3.5 text-slate-400" /> Active in Catalog
          </div>
        </motion.div>

        {/* Card 4: Total Customers — LIVE DB */}
        <motion.div variants={cardVariants} className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Customers</span>
            <div className="size-10 rounded-2xl bg-sky-50 text-sky-600 grid place-items-center group-hover:scale-110 transition-transform">
              <Users className="size-5" />
            </div>
          </div>
          {quickLoading && !quickStats ? (
            <div className="h-8 w-20 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {qs.totalCustomers.toLocaleString()}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              Registered Accounts
            </span>
          </div>
        </motion.div>

        {/* Card 5: Page Hits — LIVE DB */}
        <motion.div variants={cardVariants} className="bg-white border border-slate-200/90 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Page Hits</span>
            <div className="size-10 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center group-hover:scale-110 transition-transform">
              <Eye className="size-5" />
            </div>
          </div>
          {quickLoading && !quickStats ? (
            <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <div className="text-2xl font-black text-slate-900 tracking-tight">{qs.totalPageHits.toLocaleString()}</div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              +{qs.todayHits.toLocaleString()} Today
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── MAIN ANALYTICS & TELEMETRY DASHBOARD GRID ─── */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Revenue & MoM Growth Chart */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-7 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Revenue Growth vs Target Telemetry
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    Database Live
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Monthly performance compared against $50k monthly target milestone</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-cyan-500" />
                  <span className="text-slate-600">Actual Revenue</span>
                </div>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={m.monthlyRevenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0089C9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0089C9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 space-y-1.5">
                            <div className="text-xs font-bold text-slate-400">{label} Performance</div>
                            <div className="text-base font-black text-cyan-300">{formatUSD(data.revenue)}</div>
                            <div className="text-[11px] text-slate-300 font-semibold">{data.ordersCount} Total Orders</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0089C9" strokeWidth={3.5} fillOpacity={1} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Revenue Distribution Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-7 shadow-sm">
              <h4 className="text-base font-extrabold text-slate-900 mb-4 flex items-center justify-between">
                Category Sales Breakdown
                <span className="text-[10px] font-bold text-slate-400">{m.categoryDistribution.length} Departments</span>
              </h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={m.categoryDistribution}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl text-xs">
                              <span className="font-bold">{d.name}: </span>
                              <span className="text-cyan-300 font-black">{formatUSD(d.revenue)}</span> ({d.sales} units)
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                      {m.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Device & Traffic Demographics Widget */}
            <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-7 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center justify-between">
                Catalog Statistics
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  DB Live
                </span>
              </h4>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Package className="size-4 text-indigo-600" /> Total Active Products
                  </span>
                  <span className="text-sm font-black text-slate-900">{m.totalProducts}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Users className="size-4 text-cyan-600" /> Registered Customers
                  </span>
                  <span className="text-sm font-black text-slate-900">{m.totalCustomers}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="size-4 text-rose-600" /> Low Stock Items (&lt;10)
                  </span>
                  <span className="text-sm font-black text-rose-700">{m.lowStockCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Customer Orders Live Table Widget */}
          <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-7 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <ShoppingBag className="size-5 text-emerald-600" />
                  Recent Customer Orders
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Live completed customer order activity</p>
              </div>

              <Link
                to="/admin/orders"
                className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-emerald-200"
              >
                View All Orders <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 overflow-hidden">
              {m.recentOrders.length > 0 ? (
                m.recentOrders.map((order: any) => (
                  <div key={order._id || order.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-slate-100 grid place-items-center text-slate-700 font-black text-xs">
                        {order.name ? order.name.charAt(0).toUpperCase() : "O"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{order.name || "Customer"}</div>
                        <div className="text-[11px] text-slate-400">{order.email || order.id}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">{formatUSD(order.total || 0)}</div>
                      <span className="inline-block text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {order.status || "Completed"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-bold">Orders synchronized with database</p>
                  <p className="text-[11px] text-slate-400">Click View All Orders to manage order log history.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Live Communication Hub */}
        <div className="lg:col-span-4 space-y-8">
          {/* Live Global Visitor Telemetry Card */}
          <div className="bg-slate-950 text-white border border-slate-800 rounded-[2.5rem] p-7 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Globe className="size-4.5 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
                  Global Visitor Telemetry
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Real-time DB Hit Counter</p>
              </div>
              <span className="size-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Website Hits</div>
                  <div className="text-xl font-black text-cyan-300 mt-0.5">{m.totalPageHits.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Hits</div>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">+{m.todayHits.toLocaleString()}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Visitors</div>
                  <div className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
                    {m.liveVisitors}
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1">Live Online</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Security & DDOS Guard</span>
              <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck className="size-3.5" /> Active</span>
            </div>
          </div>

          {/* Communication Hub Card */}
          <div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-7 shadow-sm space-y-5">
            <h4 className="text-base font-extrabold text-slate-900 flex items-center justify-between">
              Communication Hub
              <span className="text-[10px] font-bold text-slate-400">Live Channels</span>
            </h4>

            <div className="space-y-3">
              <Link
                to="/admin/emails"
                className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 transition group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-indigo-600 text-white grid place-items-center">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Web Email Inbox</div>
                    <div className="text-[11px] text-slate-500">Contact form submissions</div>
                  </div>
                </div>
                {m.unreadEmails > 0 ? (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black">
                    {m.unreadEmails} New
                  </span>
                ) : (
                  <ArrowUpRight className="size-4 text-slate-400 group-hover:text-indigo-600 transition" />
                )}
              </Link>

              <Link
                to="/admin/chat"
                className="flex items-center justify-between p-4 rounded-2xl bg-cyan-50/60 hover:bg-cyan-50 border border-cyan-100 transition group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-cyan-500 text-white grid place-items-center">
                    <MessageCircle className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Live Customer Chat</div>
                    <div className="text-[11px] text-slate-500">Instant customer messaging</div>
                  </div>
                </div>
                {m.activeChats > 0 ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black animate-pulse">
                    {m.activeChats} Active
                  </span>
                ) : (
                  <ArrowUpRight className="size-4 text-slate-400 group-hover:text-cyan-600 transition" />
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
