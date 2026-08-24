import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  Loader2,
  ChevronRight,
  User,
  ShieldCheck,
  Building,
  Sparkles,
  RotateCcw,
  FileText,
  MapPin,
  CreditCard,
  Printer,
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { getAdminCustomers } from "@/lib/api/customers.functions";
import { formatUSD } from "@/components/site/cart-context";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customer & Trade Accounts — Admin Console | Pool Supply Wholesalers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: async () => {
    try {
      const res = await getAdminCustomers();
      return (res?.customers || []) as any[];
    } catch {
      return [];
    }
  },
  component: CustomersAdmin,
});

function CustomersAdmin() {
  const initialCustomers = Route.useLoaderData() as any[];
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "buyers" | "contractors" | "recent">("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "returns" | "quotes" | "addresses" | "info">("orders");

  const {
    data: customersData = initialCustomers,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin_customers_list"],
    queryFn: async () => {
      const res = await getAdminCustomers();
      return res.customers || [];
    },
    initialData: initialCustomers,
    refetchInterval: 10000,
  });

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customersData.filter((c: any) => {
      if (filterType === "buyers" && (c.totalOrders || 0) === 0) return false;
      if (filterType === "contractors" && !c.company && !c.contractorId) return false;
      if (filterType === "recent") {
        const joinDate = new Date(c.createdAt);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (joinDate < thirtyDaysAgo) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (c.name || "").toLowerCase().includes(q);
        const matchEmail = (c.email || "").toLowerCase().includes(q);
        const matchPhone = (c.phone || "").includes(q);
        const matchCompany = (c.company || "").toLowerCase().includes(q);
        const matchContractorId = (c.contractorId || "").toLowerCase().includes(q);
        return matchName || matchEmail || matchPhone || matchCompany || matchContractorId;
      }
      return true;
    });
  }, [customersData, filterType, search]);

  // Selected customer object
  const activeCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customersData.find((c: any) => c.id === selectedCustomerId) || null;
  }, [customersData, selectedCustomerId]);

  // Overall KPI Metrics
  const totalCustomers = customersData.length;
  const verifiedContractors = customersData.filter((c: any) => c.company || c.contractorId).length;
  const activeBuyers = customersData.filter((c: any) => (c.totalOrders || 0) > 0).length;
  const totalLifetimeRevenue = customersData.reduce((sum: number, c: any) => sum + (c.lifetimeValue || 0), 0);

  // Print Isolated Customer Order Invoice
  const handlePrintOrderInvoice = (order: any, customer: any) => {
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) {
      alert("Please allow popups to generate the official invoice.");
      return;
    }

    const itemsRows = (order.items || [])
      .map(
        (it: any, idx: number) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${idx + 1}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #0f172a; font-weight: 600;">
            ${it.name || "Equipment Unit"}
            ${it.brand ? `<div style="font-size: 10px; color: #64748b;">Brand: ${it.brand}</div>` : ""}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center; color: #0f172a; font-weight: bold;">${it.qty || 1}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; color: #0f172a;">${formatUSD(it.price || 0)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-weight: bold; color: #0f172a;">${formatUSD((it.price || 0) * (it.qty || 1))}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Commercial Wholesale Invoice #${order.id} — Pool Supply Wholesalers</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; background: #ffffff; padding: 40px; line-height: 1.4; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0891b2; padding-bottom: 20px; margin-bottom: 24px; }
          .brand-logo { display: flex; align-items: center; gap: 12px; }
          .brand-logo img { height: 48px; object-fit: contain; }
          .company-name { font-size: 20px; font-weight: 900; color: #0891b2; letter-spacing: -0.5px; }
          .company-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
          .doc-badge { text-align: right; }
          .doc-title { font-size: 20px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
          .doc-ref { font-family: monospace; font-size: 15px; font-weight: 800; color: #0891b2; margin-top: 4px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; }
          .card-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 6px; }
          .card-value { font-size: 13px; font-weight: 700; color: #0f172a; }
          .card-sub { font-size: 12px; color: #475569; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #0f172a; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; }
          th:first-child { border-radius: 8px 0 0 0; }
          th:last-child { border-radius: 0 8px 0 0; }
          .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 24px; }
          .totals-table { width: 300px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; border-bottom: 1px solid #f1f5f9; }
          .totals-row.grand-total { font-size: 16px; font-weight: 900; color: #0f172a; border-top: 2px solid #0891b2; border-bottom: none; padding-top: 10px; }
          .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center; }
          @media print {
            body { padding: 0; background: #ffffff; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand-logo">
              <img src="/logo.png" alt="Pool Supply Wholesalers" onerror="this.style.display='none'" />
              <div>
                <div class="company-name">Pool Supply Wholesalers</div>
                <div class="company-sub">Commercial & Municipal Pool Equipment Wholesalers</div>
                <div class="company-sub">Nashville, TN · (615) 477-0407 · sales@poolsupplywholesalers.com</div>
              </div>
            </div>
            <div class="doc-badge">
              <div class="doc-title">Commercial Invoice</div>
              <div class="doc-ref">#${order.id}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Date: ${new Date(order.placedAt).toLocaleDateString()}</div>
              <div style="font-size: 11px; color: #059669; font-weight: 700; margin-top: 2px;">Status: ${order.paymentStatus || "Paid"} (${order.status || "Completed"})</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="card">
              <div class="card-title">Sold To / Contractor Account</div>
              <div class="card-value">${order.name || customer.name || "Trade Customer"}</div>
              ${order.company || customer.company ? `<div class="card-sub"><strong>Company:</strong> ${order.company || customer.company}</div>` : ""}
              ${customer.contractorId ? `<div class="card-sub"><strong>Contractor ID:</strong> ${customer.contractorId}</div>` : ""}
              <div class="card-sub">${order.email || customer.email || ""}</div>
              ${order.phone || customer.phone ? `<div class="card-sub">${order.phone || customer.phone}</div>` : ""}
            </div>

            <div class="card">
              <div class="card-title">Order Logistics & Destination</div>
              <div class="card-value">${order.method === "pickup" ? "Local Wholesale Warehouse Pickup" : "Freight Commercial Delivery"}</div>
              ${order.address?.street ? `<div class="card-sub">${order.address.street}</div>` : ""}
              ${order.address?.city ? `<div class="card-sub">${order.address.city}, ${order.address.state || ""} ${order.address.zip || ""}</div>` : ""}
              <div class="card-sub"><strong>Payment:</strong> ${order.paymentType || "Trade Credit / Card"}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Item Description</th>
                <th style="width: 70px; text-align: center;">Qty</th>
                <th style="width: 120px; text-align: right;">Unit Price</th>
                <th style="width: 120px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="totals-wrap">
            <div class="totals-table">
              <div class="totals-row">
                <span>Subtotal:</span>
                <span>${formatUSD(order.subtotal || order.total || 0)}</span>
              </div>
              <div class="totals-row">
                <span>Freight Shipping:</span>
                <span>${order.shipping ? formatUSD(order.shipping) : "Included / Free"}</span>
              </div>
              <div class="totals-row">
                <span>Tax:</span>
                <span>${order.tax ? formatUSD(order.tax) : "$0.00 (Exempt)"}</span>
              </div>
              <div class="totals-row grand-total">
                <span>Total Amount:</span>
                <span style="color: #0891b2;">${formatUSD(order.total || 0)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <strong>Pool Supply Wholesalers</strong> · Nashville, Tennessee · sales@poolsupplywholesalers.com · (615) 477-0407<br/>
            Thank you for your commercial business. Genuine OEM equipment warranty applies on all items.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="space-y-6 max-w-[1360px] mx-auto w-full pb-16">
      {/* ─── TOP BAR & ACTIONS ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
            <Link to="/admin" className="hover:text-cyan-700 transition">
              Admin Console
            </Link>
            <span>/</span>
            <span className="text-cyan-700">Customer 360</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white grid place-items-center shadow-md">
              <Users className="size-5" />
            </div>
            <span>Customer & Trade Accounts</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <Loader2 className={`size-3.5 ${isRefetching ? "animate-spin text-cyan-600" : ""}`} />
            <span>{isRefetching ? "Syncing..." : "Refresh Feed"}</span>
          </button>

          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 font-extrabold text-xs border border-cyan-200 transition cursor-pointer"
          >
            <ShoppingBag className="size-3.5" />
            <span>Orders Log</span>
          </Link>
        </div>
      </div>

      {/* ─── 4-PILLAR METRIC HUD ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Registered</span>
            <div className="size-8 rounded-xl bg-slate-100 text-slate-700 grid place-items-center">
              <Users className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalCustomers}</div>
          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Customer & contractor accounts</div>
        </div>

        <div className="bg-white border border-cyan-200/90 rounded-2xl p-5 shadow-2xs bg-gradient-to-br from-white to-cyan-50/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-900">Trade Contractors</span>
            <div className="size-8 rounded-xl bg-cyan-100 text-cyan-800 grid place-items-center">
              <Building className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-950 tracking-tight">{verifiedContractors}</div>
          <div className="text-[11px] font-semibold text-cyan-800/80 mt-0.5">Verified commercial accounts</div>
        </div>

        <div className="bg-white border border-emerald-200/90 rounded-2xl p-5 shadow-2xs bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">Active Buyers</span>
            <div className="size-8 rounded-xl bg-emerald-100 text-emerald-800 grid place-items-center">
              <ShoppingBag className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950 tracking-tight">{activeBuyers}</div>
          <div className="text-[11px] font-semibold text-emerald-800/80 mt-0.5">Accounts with order history</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Client Spend</span>
            <div className="size-8 rounded-xl bg-cyan-50 text-cyan-700 grid place-items-center">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatUSD(totalLifetimeRevenue)}</div>
          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Cumulative customer volume</div>
        </div>
      </div>

      {/* ─── LIVE SEARCH & FILTER BAR ─── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, company, email, phone, or license #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition shadow-2xs"
            />
          </div>
          {search && (
            <button onClick={() => setSearch("")} className="text-xs font-bold text-slate-400 hover:text-slate-700">
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterType === "all" ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Accounts ({totalCustomers})
          </button>
          <button
            onClick={() => setFilterType("buyers")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterType === "buyers" ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Active Buyers ({activeBuyers})
          </button>
          <button
            onClick={() => setFilterType("contractors")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterType === "contractors" ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Contractors ({verifiedContractors})
          </button>
          <button
            onClick={() => setFilterType("recent")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterType === "recent" ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Newest (30d)
          </button>
        </div>
      </div>

      {/* ─── MAIN TABLE CONTAINER ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-cyan-600 mb-3" />
            <p className="text-xs font-bold text-slate-400">Loading verified customer accounts...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100 text-slate-300">
              <Users className="size-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">No customers found</h3>
            <p className="text-xs text-slate-400">No accounts match your current filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-4 sm:px-6">Customer & Contractor Profile</th>
                  <th className="p-4 sm:px-6">Direct Contact</th>
                  <th className="p-4 sm:px-6 text-center">Orders Placed</th>
                  <th className="p-4 sm:px-6 text-center">RMA Claims</th>
                  <th className="p-4 sm:px-6 text-center">Quotes & Bids</th>
                  <th className="p-4 sm:px-6 text-right">Lifetime Spend</th>
                  <th className="p-4 sm:px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                <AnimatePresence>
                  {filteredCustomers.map((customer: any, index: number) => {
                    const isSelected = activeCustomer?.id === customer.id;
                    const ordersCount = customer.orders?.length || customer.totalOrders || 0;
                    const returnsCount = customer.returns?.length || 0;
                    const quotesCount = customer.quotes?.length || 0;

                    return (
                      <motion.tr
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setActiveTab("orders");
                        }}
                        className={`transition-colors cursor-pointer group ${
                          isSelected ? "bg-cyan-50/80 border-l-4 border-l-cyan-600" : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Customer Info */}
                        <td className="p-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shrink-0 shadow-xs overflow-hidden">
                              {customer.avatar ? (
                                <img
                                  src={customer.avatar}
                                  alt={customer.name}
                                  className="size-full rounded-full object-cover"
                                />
                              ) : (
                                <div className="size-full bg-slate-900 rounded-full grid place-items-center text-cyan-300">
                                  <User className="size-5 text-cyan-300" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{customer.name}</span>
                                {customer.company && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900">
                                    {customer.company}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3" />
                                  Joined {new Date(customer.createdAt).toLocaleDateString()}
                                </span>
                                {customer.contractorId && (
                                  <span className="font-mono text-slate-500 font-extrabold">· Lic #{customer.contractorId}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="p-4 sm:px-6">
                          <div className="space-y-1">
                            {customer.email && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                <Mail className="size-3.5 text-slate-400 shrink-0" />
                                <span className="font-bold text-slate-800">{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                <Phone className="size-3.5 text-slate-400 shrink-0" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            {!customer.email && !customer.phone && (
                              <span className="text-[11px] text-slate-400 italic">No direct contact</span>
                            )}
                          </div>
                        </td>

                        {/* Orders */}
                        <td className="p-4 sm:px-6 text-center">
                          <span className="inline-flex items-center justify-center gap-1 bg-cyan-50 text-cyan-800 border border-cyan-200/60 px-3 py-1 rounded-full text-xs font-black">
                            <ShoppingBag className="size-3" />
                            {ordersCount} Orders
                          </span>
                        </td>

                        {/* Returns */}
                        <td className="p-4 sm:px-6 text-center">
                          {returnsCount > 0 ? (
                            <span className="inline-flex items-center justify-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                              <RotateCcw className="size-3" />
                              {returnsCount} RMA
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">—</span>
                          )}
                        </td>

                        {/* Quotes */}
                        <td className="p-4 sm:px-6 text-center">
                          {quotesCount > 0 ? (
                            <span className="inline-flex items-center justify-center gap-1 bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                              <FileText className="size-3" />
                              {quotesCount} Quotes
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">—</span>
                          )}
                        </td>

                        {/* Lifetime Value */}
                        <td className="p-4 sm:px-6 text-right">
                          <div className="font-black text-sm text-slate-900">
                            {formatUSD(customer.lifetimeValue || customer.totalSpent || 0)}
                          </div>
                          <div className="text-[10px] font-extrabold text-emerald-600">Verified Spend</div>
                        </td>

                        {/* View Button */}
                        <td className="p-4 sm:px-6 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomerId(customer.id);
                              setActiveTab("orders");
                            }}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-cyan-50 text-slate-500 hover:text-cyan-700 border border-slate-200 transition cursor-pointer"
                          >
                            <ChevronRight className="size-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── CUSTOMER 360 DETAIL SLIDE-OVER INSPECTOR ─── */}
      <AnimatePresence>
        {activeCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="bg-white w-full max-w-2xl h-full sm:h-[94vh] sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            >
              {/* Drawer Top Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-900 text-white shrink-0 relative">
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="absolute top-5 right-5 size-8 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center transition cursor-pointer"
                >
                  <X className="size-4" />
                </button>

                <div className="flex items-start gap-4 pr-10">
                  <div className="size-14 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shrink-0 shadow-lg overflow-hidden">
                    {activeCustomer.avatar ? (
                      <img
                        src={activeCustomer.avatar}
                        alt={activeCustomer.name}
                        className="size-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-full bg-slate-800 rounded-full grid place-items-center text-cyan-300">
                        <User className="size-7 text-cyan-300" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-black text-white tracking-tight">{activeCustomer.name}</h2>
                      <ShieldCheck className="size-5 text-cyan-400" />
                    </div>
                    {activeCustomer.company && (
                      <div className="text-xs font-bold text-cyan-300 mt-0.5 flex items-center gap-1.5">
                        <Building className="size-3.5" />
                        <span>{activeCustomer.company}</span>
                        {activeCustomer.contractorId && (
                          <span className="text-white/60">· License #{activeCustomer.contractorId}</span>
                        )}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                      {activeCustomer.email && (
                        <a href={`mailto:${activeCustomer.email}`} className="hover:text-cyan-300 flex items-center gap-1">
                          <Mail className="size-3" />
                          <span>{activeCustomer.email}</span>
                        </a>
                      )}
                      {activeCustomer.phone && (
                        <a href={`tel:${activeCustomer.phone}`} className="hover:text-cyan-300 flex items-center gap-1">
                          <Phone className="size-3" />
                          <span>{activeCustomer.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* KPI Bar */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/10 text-center">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-black uppercase text-slate-400">Lifetime Spend</div>
                    <div className="text-base font-black text-cyan-300 mt-0.5">
                      {formatUSD(activeCustomer.lifetimeValue || activeCustomer.totalSpent || 0)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-black uppercase text-slate-400">Total Orders</div>
                    <div className="text-base font-black text-white mt-0.5">{activeCustomer.orders?.length || 0}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-black uppercase text-slate-400">RMA Claims</div>
                    <div className="text-base font-black text-amber-400 mt-0.5">{activeCustomer.returns?.length || 0}</div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-2 ${
                    activeTab === "orders"
                      ? "border-cyan-600 text-cyan-900 bg-white shadow-2xs font-black"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ShoppingBag className="size-3.5" />
                  <span>Orders ({activeCustomer.orders?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab("returns")}
                  className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-2 ${
                    activeTab === "returns"
                      ? "border-cyan-600 text-cyan-900 bg-white shadow-2xs font-black"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <RotateCcw className="size-3.5" />
                  <span>Returns & RMA ({activeCustomer.returns?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab("quotes")}
                  className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-2 ${
                    activeTab === "quotes"
                      ? "border-cyan-600 text-cyan-900 bg-white shadow-2xs font-black"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="size-3.5" />
                  <span>Quotes ({activeCustomer.quotes?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-2 ${
                    activeTab === "addresses"
                      ? "border-cyan-600 text-cyan-900 bg-white shadow-2xs font-black"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MapPin className="size-3.5" />
                  <span>Addresses ({activeCustomer.addresses?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-2 ${
                    activeTab === "info"
                      ? "border-cyan-600 text-cyan-900 bg-white shadow-2xs font-black"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <User className="size-3.5" />
                  <span>Account Info</span>
                </button>
              </div>

              {/* Scrollable Tab Body Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* ─── 1. ORDERS TAB ─── */}
                {activeTab === "orders" && (
                  <div className="space-y-4">
                    {activeCustomer.orders && activeCustomer.orders.length > 0 ? (
                      activeCustomer.orders.map((order: any) => (
                        <div key={order.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-cyan-800">#{order.id}</span>
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  {order.paymentStatus || "Paid"}
                                </span>
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                                  {order.status || "Pending"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-1">
                                Placed {new Date(order.placedAt).toLocaleDateString()} · Method: {order.method || "standard"} · {order.paymentType || "Card"}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-black text-base text-slate-900">{formatUSD(order.total || 0)}</div>
                                <div className="text-[10px] text-slate-400">{(order.items || []).length} Item(s)</div>
                              </div>

                              <button
                                onClick={() => handlePrintOrderInvoice(order, activeCustomer)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs shadow-2xs transition cursor-pointer"
                              >
                                <Printer className="size-3.5 text-cyan-600" />
                                <span>Invoice</span>
                              </button>
                            </div>
                          </div>

                          {/* Itemized list */}
                          <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden divide-y divide-slate-100 text-xs">
                            {(order.items || []).map((it: any, idx: number) => (
                              <div key={idx} className="p-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="size-8 rounded-lg bg-slate-50 border border-slate-100 p-1 shrink-0 grid place-items-center">
                                    <img
                                      src={it.img || "/assets/commingsoon.png"}
                                      alt={it.name}
                                      className="size-full object-contain mix-blend-multiply"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900">{it.name}</div>
                                    <div className="text-[10px] text-slate-400">{it.brand || "Pool Supply Wholesalers"}</div>
                                  </div>
                                </div>
                                <div className="text-right font-black text-slate-900">
                                  <div>Qty: {it.qty || 1}</div>
                                  <div className="text-[10px] text-slate-500 font-semibold">{formatUSD(it.price || 0)} ea</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-16 text-center text-slate-400 space-y-2">
                        <ShoppingBag className="size-10 mx-auto text-slate-300 stroke-1" />
                        <p className="text-xs font-bold text-slate-700">No orders placed yet</p>
                        <p className="text-[11px] text-slate-400">
                          When this customer completes checkout, their order logs will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── 2. RETURNS & RMA TAB ─── */}
                {activeTab === "returns" && (
                  <div className="space-y-4">
                    {activeCustomer.returns && activeCustomer.returns.length > 0 ? (
                      activeCustomer.returns.map((ret: any) => {
                        const isResolved = ret.isResolved || ret.status === "Resolved";
                        return (
                          <div key={ret.id || ret.rmaId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-cyan-800">{ret.rmaId}</span>
                                <span className="text-xs font-bold text-slate-500">· Order #{ret.orderId}</span>
                              </div>
                              {isResolved ? (
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Resolved
                                </span>
                              ) : (
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                  {ret.status || "Under Review"}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="font-bold text-slate-700">Reason:</span>{" "}
                                <span className="text-slate-900">{ret.reason}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-700">Action:</span>{" "}
                                <span className="text-slate-900">{ret.preferredResolution || "Replacement Unit"}</span>
                              </div>
                            </div>

                            {ret.notes && (
                              <div className="p-3 rounded-xl bg-white border border-slate-100 text-xs text-slate-600">
                                <strong>Customer Notes:</strong> "{ret.notes}"
                              </div>
                            )}

                            {ret.adminResolution && (
                              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                                <strong>Wholesale Resolution:</strong> {ret.adminResolution}
                              </div>
                            )}

                            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
                              <span>Submitted {new Date(ret.createdAt).toLocaleDateString()}</span>
                              <Link
                                to="/admin/returns"
                                className="text-cyan-700 font-extrabold hover:underline flex items-center gap-1"
                              >
                                <span>Open in RMA Console</span>
                                <ArrowRight className="size-3" />
                              </Link>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-16 text-center text-slate-400 space-y-2">
                        <RotateCcw className="size-10 mx-auto text-slate-300 stroke-1" />
                        <p className="text-xs font-bold text-slate-700">No return requests filed</p>
                        <p className="text-[11px] text-slate-400">This account has zero return claims.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── 3. QUOTES TAB ─── */}
                {activeTab === "quotes" && (
                  <div className="space-y-4">
                    {activeCustomer.quotes && activeCustomer.quotes.length > 0 ? (
                      activeCustomer.quotes.map((q: any) => {
                        const isResolved = q.isResolved || q.status === "Resolved" || q.status === "Accepted" || q.status === "Converted to Order";
                        return (
                          <div key={q.id || q.quoteId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-blue-800">#{q.quoteId}</span>
                                <span className="font-black text-sm text-slate-900">{q.projectName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-slate-900">
                                  {formatUSD(q.quotedAmount || q.totalAmount || q.estimatedBudget || 0)}
                                </span>
                                {isResolved ? (
                                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    {q.status || "Resolved"}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-900 border border-cyan-200">
                                    {q.status || "Engineering Review"}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                              <span>Target: <strong>{q.targetCompletionDate || "30 Days"}</strong></span>
                              {q.projectLocation && <span>· Location: <strong>{q.projectLocation}</strong></span>}
                              {q.adminLeadTime && <span>· Lead Time: <strong>{q.adminLeadTime}</strong></span>}
                            </div>

                            {q.notes && (
                              <div className="p-3 rounded-xl bg-white border border-slate-100 text-xs text-slate-600">
                                <strong>Scope:</strong> "{q.notes}"
                              </div>
                            )}

                            {q.adminProposalNotes && (
                              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950">
                                <strong>Engineering Remarks:</strong> {q.adminProposalNotes}
                              </div>
                            )}

                            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
                              <span>Submitted {new Date(q.createdAt).toLocaleDateString()}</span>
                              <Link
                                to="/admin/quotes"
                                className="text-blue-700 font-extrabold hover:underline flex items-center gap-1"
                              >
                                <span>Open in Quotes Console</span>
                                <ArrowRight className="size-3" />
                              </Link>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-16 text-center text-slate-400 space-y-2">
                        <FileText className="size-10 mx-auto text-slate-300 stroke-1" />
                        <p className="text-xs font-bold text-slate-700">No project quotes requested</p>
                        <p className="text-[11px] text-slate-400">Commercial project bids will appear here.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── 4. ADDRESSES TAB ─── */}
                {activeTab === "addresses" && (
                  <div className="space-y-4">
                    {activeCustomer.addresses && activeCustomer.addresses.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {activeCustomer.addresses.map((addr: any, idx: number) => (
                          <div key={addr.id || idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-slate-900">{addr.title || `Address #${idx + 1}`}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-black text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-slate-700 font-semibold">{addr.recipientName}</div>
                            <div className="text-slate-600">{addr.line1} {addr.line2}</div>
                            <div className="text-slate-600">{addr.city}, {addr.state} {addr.zip}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{addr.country || "USA"} · {addr.type || "Shipping"}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center text-slate-400 space-y-2">
                        <MapPin className="size-10 mx-auto text-slate-300 stroke-1" />
                        <p className="text-xs font-bold text-slate-700">No saved address book entries</p>
                        <p className="text-[11px] text-slate-400">Customer has not added specific warehouse addresses.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── 5. ACCOUNT INFO TAB ─── */}
                {activeTab === "info" && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Account Credentials & Verification</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-slate-500">Account ID:</span>
                          <div className="font-mono font-bold text-slate-900">{activeCustomer.id}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Registered On:</span>
                          <div className="font-bold text-slate-900">{new Date(activeCustomer.createdAt).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Contractor License:</span>
                          <div className="font-mono font-bold text-slate-900">{activeCustomer.contractorId || "Not on file"}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Company Name:</span>
                          <div className="font-bold text-slate-900">{activeCustomer.company || "Independent Contractor"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email Notification Preferences</div>
                      <div className="grid grid-cols-2 gap-2 text-slate-700 font-semibold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`size-3.5 ${activeCustomer.emailPrefs?.orderUpdates ? "text-emerald-600" : "text-slate-300"}`} />
                          <span>Order Status Updates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`size-3.5 ${activeCustomer.emailPrefs?.freightTracking ? "text-emerald-600" : "text-slate-300"}`} />
                          <span>Freight Tracking Feed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`size-3.5 ${activeCustomer.emailPrefs?.invoiceReceipts ? "text-emerald-600" : "text-slate-300"}`} />
                          <span>Direct PDF Invoices</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`size-3.5 ${activeCustomer.emailPrefs?.promoAlerts ? "text-emerald-600" : "text-slate-300"}`} />
                          <span>Wholesale Rebate Alerts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="text-[11px] text-slate-400">
                  Customer ID: <span className="font-mono font-bold text-slate-700">{activeCustomer.id}</span>
                </div>

                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
