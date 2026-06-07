import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { products, syncLocalProducts, useProducts } from "@/lib/products";
import { useOrders } from "@/lib/orders";
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
  Zap
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
  Cell,
  ComposedChart
} from "recharts";
import { motion } from "framer-motion";

export const Route = createFileRoute("/admin/")({
  component: DashboardIndex,
});

type Order = {
  id: string;
  placedAt: string;
  email: string;
  name: string;
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  method: string;
};

const MOCK_ORDERS: Order[] = [
  {
    id: "AQ-748B",
    placedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    email: "james.t@gmail.com",
    name: "James Thompson",
    items: [{ id: "p-intelliflo", name: "Variable-Speed IntelliFlo Pump", price: 1289, qty: 1, brand: "Pentair", img: "" }],
    subtotal: 1289, shipping: 0, tax: 112.78, total: 1401.78, method: "standard"
  },
  {
    id: "AQ-923D",
    placedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    email: "d.miller@millerpools.com",
    name: "David Miller",
    items: [{ id: "p-raypak-400k", name: "Digital Pool Heater Pro 400K", price: 2499, qty: 1, brand: "Raypak", img: "" }],
    subtotal: 2499, shipping: 0, tax: 218.66, total: 2717.66, method: "standard"
  },
  {
    id: "AQ-551E",
    placedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    email: "s.jenkins@gmail.com",
    name: "Sarah Jenkins",
    items: [{ id: "p-colorlogic", name: "ColorLogic LED Pool Light", price: 349, qty: 2, brand: "Hayward", img: "" }],
    subtotal: 698, shipping: 0, tax: 61.07, total: 759.07, method: "standard"
  },
  {
    id: "AQ-120A",
    placedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    email: "robert@bluewave.com",
    name: "Robert P.",
    items: [
      { id: "p-cx3", name: "Robotic Pool Cleaner CX-3", price: 899, qty: 1, brand: "Jandy", img: "" },
      { id: "p-cv340", name: "CV Series Cartridge Filter 340 sq ft", price: 1149, qty: 1, brand: "Jandy", img: "" }
    ],
    subtotal: 2048, shipping: 0, tax: 179.20, total: 2227.20, method: "standard"
  }
];


const CATEGORY_DATA = [
  { name: "Pumps", sales: 42, color: "#0089C9" },
  { name: "Heaters", sales: 28, color: "#59D2F3" },
  { name: "Lights", sales: 35, color: "#006DAB" },
  { name: "Filters", sales: 21, color: "#004A7C" },
  { name: "Cleaners", sales: 31, color: "#00B4D8" },
  { name: "Auto", sales: 15, color: "#48CAE4" }
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
};

function GlassCard({ children, className = "", gradient = false }: { children: React.ReactNode; className?: string; gradient?: boolean }) {
  return (
    <div
      className={`relative rounded-[1.75rem] overflow-hidden ${className}`}
      style={gradient ? {
        background: "linear-gradient(135deg, #0089C9, #59D2F3)",
        boxShadow: "0 20px 60px rgba(0,137,201,0.35)"
      } : {
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)"
      }}
    >
      {children}
    </div>
  );
}

function DashboardIndex() {
  const { orders } = useOrders();
  const { products: adminProducts } = useProducts();

  const metrics = useMemo(() => {
    const totalRev = orders.reduce((acc, o) => acc + o.total, 0);
    const avgOrderVal = orders.length > 0 ? totalRev / orders.length : 0;
    const lowStockCount = adminProducts.filter(p => p.stock < 10).length;
    const totalReviews = adminProducts.reduce((acc, p) => acc + (p.reviews?.length || 0), 0);
    return { revenue: totalRev, ordersCount: orders.length, avgOrder: avgOrderVal, lowStock: lowStockCount, reviews: totalReviews };
  }, [orders, adminProducts]);

  const dynamicSalesData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Generate last 6 months buckets
    const buckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      buckets.push({
        name: months[d.getMonth()],
        month: d.getMonth(),
        year: d.getFullYear(),
        revenue: 0,
        ordersCount: 0
      });
    }

    // Populate buckets
    orders.forEach(order => {
      const d = new Date(order.placedAt);
      const m = d.getMonth();
      const y = d.getFullYear();
      const bucket = buckets.find(b => b.month === m && b.year === y);
      if (bucket) {
        bucket.revenue += order.total;
        bucket.ordersCount += 1;
      }
    });

    return buckets;
  }, [orders]);

  const dynamicCategoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = adminProducts.find(p => p.id === item.id);
        // If product isn't found or has no category, default to "Other"
        const catName = product?.category || "Other";
        categories[catName] = (categories[catName] || 0) + item.qty;
      });
    });

    const colors = ["#0089C9", "#59D2F3", "#006DAB", "#48CAE4", "#8b5cf6", "#10b981"];
    const data = Object.keys(categories).map((cat, idx) => ({
      name: cat,
      sales: categories[cat],
      color: colors[idx % colors.length]
    })).sort((a, b) => b.sales - a.sales);

    return data.length > 0 ? data : CATEGORY_DATA;
  }, [orders, adminProducts]);

  const kpis = [
    {
      title: "Total Revenue",
      value: formatUSD(metrics.revenue),
      change: "+12.4%",
      up: true,
      icon: DollarSign,
      accent: "#10b981",
      bg: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.2)"
    },
    {
      title: "Total Orders",
      value: metrics.ordersCount.toString(),
      change: "+8.2%",
      up: true,
      icon: ShoppingBag,
      accent: "#0089C9",
      bg: "rgba(0,137,201,0.1)",
      border: "rgba(0,137,201,0.2)"
    },
    {
      title: "Avg. Order Value",
      value: formatUSD(metrics.avgOrder),
      change: "-2.1%",
      up: false,
      icon: TrendingUp,
      accent: "#8b5cf6",
      bg: "rgba(139,92,246,0.1)",
      border: "rgba(139,92,246,0.2)"
    },
    {
      title: "Low Stock Alerts",
      value: metrics.lowStock.toString(),
      change: metrics.lowStock > 0 ? "Needs Attention" : "All Good",
      up: metrics.lowStock === 0,
      icon: AlertTriangle,
      accent: metrics.lowStock > 0 ? "#f43f5e" : "#10b981",
      bg: metrics.lowStock > 0 ? "rgba(244,63,94,0.1)" : "rgba(16,185,129,0.1)",
      border: metrics.lowStock > 0 ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)"
    }
  ];

  return (
    <div className="space-y-7 pb-10">

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-[2rem] overflow-hidden p-8"
        style={{
          background: "linear-gradient(135deg, #0089C9 0%, #006DAB 50%, #004A7C 100%)",
          boxShadow: "0 20px 60px rgba(0,137,201,0.4)"
        }}
      >
        {/* bg orbs */}
        <div className="absolute top-[-40%] right-[-5%] w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(89,210,243,0.3) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-60%] left-[20%] w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-3">
              <Activity className="size-3" />
              Live Dashboard
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-white/60 text-sm mt-1.5 font-medium">Real-time telemetry, order logs, and catalog metrics.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/admin/products"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs text-[#0089C9] bg-white hover:bg-white/90 transition-all shadow-lg"
            >
              <Package className="size-4" /> Add Product
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs text-white bg-white/15 border border-white/20 hover:bg-white/20 transition-all"
            >
              <ShoppingBag className="size-4" /> View Orders
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
      >
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.title} variants={cardVariants}>
              <GlassCard className="p-6 hover:-translate-y-1 transition-transform duration-300 cursor-default">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="size-11 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: kpi.bg, border: `1px solid ${kpi.border}` }}
                  >
                    <Icon className="size-5" style={{ color: kpi.accent }} />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full" style={{ background: kpi.bg, color: kpi.accent }}>
                    {kpi.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {kpi.change}
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{kpi.value}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.title}</div>
                {/* accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[1.75rem]" style={{ background: `linear-gradient(to right, ${kpi.accent}50, ${kpi.accent})` }} />
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid xl:grid-cols-[1fr_380px] gap-5"
      >
        {/* Revenue Chart */}
        <motion.div variants={cardVariants}>
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base tracking-tight">Revenue Pipeline</h3>
                <p className="text-xs text-slate-400 mt-0.5">Monthly performance for {new Date().getFullYear()}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-[#0089C9]" />
                <span className="text-[11px] font-bold text-slate-400">Revenue</span>
              </div>
            </div>

            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dynamicSalesData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0089C9" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#59D2F3" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#59D2F3" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#0089C9" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} dx={-10} />
                  <Tooltip
                    formatter={(v) => [formatUSD(v as number), "Revenue"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "1rem", border: "none", color: "#fff", fontSize: "12px", padding: "10px 14px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)" }}
                    cursor={{ fill: "rgba(0,137,201,0.05)" }}
                  />
                  <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={24} />
                  <Area type="monotone" dataKey="revenue" stroke="#0089C9" strokeWidth={3} fill="url(#revGrad)" dot={{ r: 4, fill: "#fff", stroke: "#0089C9", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#0089C9", stroke: "#fff", strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Category Chart */}
        <motion.div variants={cardVariants}>
          <GlassCard className="p-6 flex flex-col space-y-5 h-full">
            <div>
              <h3 className="font-black text-slate-900 text-base tracking-tight">Sales by Category</h3>
              <p className="text-xs text-slate-400 mt-0.5">Units sold by equipment segment</p>
            </div>
            <div className="flex-1 min-h-[220px] -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicCategoryData} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }} barSize={16}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={70} />
                  <Tooltip
                    formatter={(v) => [v, "Units"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "1rem", border: "none", color: "#fff", fontSize: "12px", padding: "10px 14px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)" }}
                    cursor={{ fill: "rgba(0,137,201,0.05)" }}
                  />
                  <Bar dataKey="sales" radius={[0, 8, 8, 0]}>
                    {dynamicCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Bottom Grid: Orders + Shortcuts */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid xl:grid-cols-[2fr_1fr] gap-5"
      >
        {/* Recent Orders */}
        <motion.div variants={cardVariants}>
          <GlassCard className="overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-black/[0.04]">
              <div>
                <h3 className="font-black text-slate-900 text-base tracking-tight">Recent Orders</h3>
                <p className="text-xs text-slate-400 mt-0.5">Last 72 hours of transactions</p>
              </div>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1.5 text-xs font-bold text-[#0089C9] hover:gap-2.5 transition-all group"
              >
                View All <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-3 font-bold bg-slate-50/60">Order</th>
                    <th className="px-6 py-3 font-bold bg-slate-50/60">Customer</th>
                    <th className="px-6 py-3 font-bold bg-slate-50/60">Items</th>
                    <th className="px-6 py-3 font-bold bg-slate-50/60 text-right">Amount</th>
                    <th className="px-6 py-3 font-bold bg-slate-50/60">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {orders.slice(0, 4).map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="hover:bg-[#0089C9]/[0.03] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-black text-[#0089C9] text-[11px] bg-[#0089C9]/10 px-2 py-0.5 rounded-md">
                          {order.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{order.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{order.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{order.items?.length || 1} item(s)</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">{formatUSD(order.total)}</td>
                      <td className="px-6 py-4 text-slate-400">{new Date(order.placedAt).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>

        {/* Shortcuts + Promo */}
        <motion.div variants={cardVariants} className="flex flex-col gap-5">
          {/* Quick Actions */}
          <GlassCard className="p-6 flex-1">
            <h3 className="font-black text-slate-900 text-base tracking-tight mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-400 mb-5">Fast access to key admin tasks</p>
            <div className="space-y-2.5">
              {[
                { label: "Add New Product", to: "/admin/products", icon: Package, color: "#0089C9" },
                { label: "Fulfill Orders", to: "/admin/orders", icon: ShoppingBag, color: "#10b981" },
                { label: "Moderate Reviews", to: "/admin/reviews", icon: Star, color: "#f59e0b" }
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex items-center justify-between p-3.5 rounded-2xl hover:-translate-y-0.5 transition-all group border border-transparent hover:border-black/5"
                    style={{ background: "rgba(0,0,0,0.025)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl flex items-center justify-center" style={{ background: `${action.color}18`, color: action.color }}>
                        <Icon className="size-4" />
                      </div>
                      <span className="text-[13px] font-bold text-slate-800">{action.label}</span>
                    </div>
                    <ArrowRight className="size-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </GlassCard>

          {/* Promo Banner */}
          <GlassCard gradient className="p-6 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
            <div className="relative z-10 flex items-start gap-3">
              <div className="size-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <Zap className="size-5 text-white" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm mb-1">Wholesale Advisory</h4>
                <p className="text-white/75 text-[11px] leading-relaxed">
                  Wholesale pricing structures are secured. Dealer discounts are configurable via the database settings panel.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
