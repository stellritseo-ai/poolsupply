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
  Download,
  AlertCircle,
  Truck,
  Info,
} from "lucide-react";
import { getAdminCustomers } from "@/lib/api/customers.functions";
import { formatUSD } from "@/components/site/cart-context";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Total Customers Directory — Admin Console | Pool Supply Wholesalers" },
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
  const [filterType, setFilterType] = useState<
    "all" | "guest" | "portal" | "contractors" | "buyers" | "recent"
  >("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "orders" | "returns" | "quotes" | "addresses" | "info"
  >("orders");

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

  // KPI Metrics Calculation
  const totalCustomers = customersData.length;
  const guestBuyers = customersData.filter(
    (c: any) => c.isGuest || c.accountType === "guest",
  ).length;
  const portalAccounts = customersData.filter(
    (c: any) => !c.isGuest && c.accountType !== "guest",
  ).length;
  const verifiedContractors = customersData.filter((c: any) => c.company || c.contractorId).length;
  const activeBuyers = customersData.filter(
    (c: any) => (c.totalOrders || c.orders?.length || 0) > 0,
  ).length;
  const totalLifetimeRevenue = customersData.reduce(
    (sum: number, c: any) => sum + (c.lifetimeValue || c.totalSpent || 0),
    0,
  );

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customersData.filter((c: any) => {
      const isGuest = c.isGuest || c.accountType === "guest";

      if (filterType === "guest" && !isGuest) return false;
      if (filterType === "portal" && isGuest) return false;
      if (filterType === "buyers" && (c.totalOrders || c.orders?.length || 0) === 0) return false;
      if (filterType === "contractors" && !c.company && !c.contractorId) return false;
      if (filterType === "recent") {
        const joinDate = new Date(c.createdAt || c.firstOrderAt || 0);
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
        const matchOrders = (c.orders || []).some(
          (o: any) =>
            (o.id || "").toLowerCase().includes(q) ||
            (o.address?.city || "").toLowerCase().includes(q) ||
            (o.address?.state || "").toLowerCase().includes(q),
        );
        const matchAddresses = (c.addresses || []).some(
          (a: any) =>
            (a.city || "").toLowerCase().includes(q) ||
            (a.state || "").toLowerCase().includes(q) ||
            (a.line1 || "").toLowerCase().includes(q),
        );
        return (
          matchName ||
          matchEmail ||
          matchPhone ||
          matchCompany ||
          matchContractorId ||
          matchOrders ||
          matchAddresses
        );
      }
      return true;
    });
  }, [customersData, filterType, search]);

  // Selected customer object
  const activeCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customersData.find((c: any) => c.id === selectedCustomerId) || null;
  }, [customersData, selectedCustomerId]);

  const isCustomerGuest = activeCustomer
    ? activeCustomer.isGuest || activeCustomer.accountType === "guest"
    : false;

  // Export Customer Directory to CSV
  const handleExportCSV = () => {
    if (!filteredCustomers || filteredCustomers.length === 0) return;
    const headers = [
      "Customer ID",
      "Customer Name",
      "Account Type",
      "Email",
      "Phone",
      "Company",
      "Contractor License",
      "Total Orders",
      "Lifetime Spend (USD)",
      "Total Items Purchased",
      "First Order / Registered",
      "Latest Order",
      "Primary Destination City",
      "Primary Destination State",
    ];

    const rows = filteredCustomers.map((c: any) => {
      const isGuest = c.isGuest || c.accountType === "guest";
      const primaryAddr = c.addresses?.[0] || c.orders?.[0]?.address || {};
      return [
        `"${c.id || ""}"`,
        `"${(c.name || "").replace(/"/g, '""')}"`,
        `"${isGuest ? "Guest Checkout" : "Registered Portal Member"}"`,
        `"${(c.email || "").replace(/"/g, '""')}"`,
        `"${(c.phone || "").replace(/"/g, '""')}"`,
        `"${(c.company || "").replace(/"/g, '""')}"`,
        `"${(c.contractorId || "").replace(/"/g, '""')}"`,
        c.totalOrders || c.orders?.length || 0,
        (c.lifetimeValue || c.totalSpent || 0).toFixed(2),
        c.totalProductsPurchased || c.totalItems || 0,
        `"${c.createdAt || c.firstOrderAt ? new Date(c.createdAt || c.firstOrderAt).toLocaleDateString() : ""}"`,
        `"${c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : ""}"`,
        `"${(primaryAddr.city || "").replace(/"/g, '""')}"`,
        `"${(primaryAddr.state || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `total_customers_directory_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      `,
      )
      .join("");

    const isGuest = customer.isGuest || customer.accountType === "guest";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Commercial Invoice #${order.id} — Pool Supply Wholesalers</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; background: #ffffff; padding: 40px; line-height: 1.4; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0891b2; padding-bottom: 20px; margin-bottom: 24px; }
          .brand-logo { display: flex; align-items: center; gap: 12px; }
          .brand-title { font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
          .brand-sub { font-size: 11px; font-weight: 700; color: #0891b2; text-transform: uppercase; letter-spacing: 1px; }
          .invoice-meta { text-align: right; }
          .invoice-title { font-size: 24px; font-weight: 900; color: #0891b2; }
          .invoice-id { font-family: monospace; font-size: 14px; font-weight: bold; color: #334155; }
          .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
          .card-title { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px; }
          .card-value { font-size: 14px; font-weight: bold; color: #0f172a; }
          .card-sub { font-size: 12px; color: #475569; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #f1f5f9; padding: 10px 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #475569; text-align: left; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
          .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 30px; }
          .totals-table { width: 280px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #475569; }
          .totals-row.grand-total { border-top: 2px solid #0891b2; padding-top: 10px; font-size: 16px; font-weight: 900; color: #0f172a; }
          .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #64748b; text-align: center; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand-logo">
              <div>
                <div class="brand-title">POOL SUPPLY WHOLESALERS</div>
                <div class="brand-sub">Commercial & Trade Equipment Distribution</div>
              </div>
            </div>
            <div class="invoice-meta">
              <div class="invoice-title">OFFICIAL INVOICE</div>
              <div class="invoice-id">#${order.id}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Date: ${new Date(order.placedAt).toLocaleDateString()}</div>
              <div style="font-size: 11px; color: #0891b2; font-weight: bold; margin-top: 2px;">Status: ${order.paymentStatus || "Paid"}</div>
            </div>
          </div>

          <div class="grid-info">
            <div class="card">
              <div class="card-title">Customer Information</div>
              <div class="card-value">${order.name || customer.name || "Commercial Buyer"}</div>
              <div class="card-sub"><strong>Account Type:</strong> ${isGuest ? "Storefront Checkout Buyer (Direct Order)" : "Registered Client Portal Account"}</div>
              ${order.company || customer.company ? `<div class="card-sub"><strong>Company:</strong> ${order.company || customer.company}</div>` : ""}
              ${customer.contractorId ? `<div class="card-sub"><strong>Contractor ID:</strong> ${customer.contractorId}</div>` : ""}
              <div class="card-sub">${order.email || customer.email || ""}</div>
              ${order.phone || customer.phone ? `<div class="card-sub">${order.phone || customer.phone}</div>` : ""}
            </div>

            <div class="card">
              <div class="card-title">Order Logistics & Destination</div>
              <div class="card-value">${order.method === "pickup" ? "Local Wholesale Warehouse Pickup" : "Freight Commercial Delivery"}</div>
              ${order.address?.street || order.address?.line1 ? `<div class="card-sub">${order.address.street || order.address.line1}</div>` : ""}
              ${order.address?.city ? `<div class="card-sub">${order.address.city}, ${order.address.state || ""} ${order.address.zip || ""}</div>` : ""}
              <div class="card-sub"><strong>Payment:</strong> ${order.paymentType || "Card"}</div>
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
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-16">
      {/* ─── TOP BAR & ACTIONS ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
            <Link to="/admin" className="hover:text-cyan-700 transition">
              Admin Console
            </Link>
            <span>/</span>
            <span className="text-cyan-700">Total Customers</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800 text-white grid place-items-center shadow-md">
              <Users className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Total Customers
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Omnichannel customer directory — tracks registered trade portal accounts and direct
                guest checkout buyers who ordered equipment without portal authentication.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs shadow-2xs transition cursor-pointer"
            title="Download full customer directory with spend and orders as CSV"
          >
            <Download className="size-3.5 text-slate-500" />
            <span>Export Directory (CSV)</span>
          </button>

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

      {/* ─── 5-PILLAR METRIC HUD ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Pillar 1: Total Directory */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Total Directory
            </span>
            <div className="size-8 rounded-xl bg-slate-100 text-slate-700 grid place-items-center">
              <Users className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalCustomers}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
            Omnichannel database
          </div>
        </div>

        {/* Pillar 2: Guest Checkout (Without Login) */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 border border-indigo-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
              Guest Checkout
            </span>
            <div className="size-8 rounded-xl bg-indigo-100 text-indigo-700 grid place-items-center">
              <ShoppingBag className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-950 tracking-tight">{guestBuyers}</div>
          <div className="text-xs font-bold text-indigo-700 mt-0.5 truncate flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Without portal login</span>
          </div>
        </div>

        {/* Pillar 3: Registered Portal */}
        <div className="bg-white border border-emerald-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
              Portal Accounts
            </span>
            <div className="size-8 rounded-xl bg-emerald-100 text-emerald-800 grid place-items-center">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950 tracking-tight">
            {portalAccounts}
          </div>
          <div className="text-xs font-semibold text-emerald-800/80 mt-0.5 truncate">
            Client portal logins
          </div>
        </div>

        {/* Pillar 4: Trade Contractors */}
        <div className="bg-white border border-cyan-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition bg-gradient-to-br from-white to-cyan-50/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-900">
              Contractors
            </span>
            <div className="size-8 rounded-xl bg-cyan-100 text-cyan-800 grid place-items-center">
              <Building className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-950 tracking-tight">
            {verifiedContractors}
          </div>
          <div className="text-xs font-semibold text-cyan-800/80 mt-0.5 truncate">
            Licensed commercial pros
          </div>
        </div>

        {/* Pillar 5: Total Spend */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Total Customer Spend
            </span>
            <div className="size-8 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight truncate">
            {formatUSD(totalLifetimeRevenue)}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
            Cumulative transaction vol.
          </div>
        </div>
      </div>

      {/* ─── LIVE SEARCH & FILTER BAR ─── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer name, email, phone, city, order ID, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition shadow-2xs"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 shrink-0"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Badges Tabs */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs sm:text-xs shrink-0 ${
              filterType === "all"
                ? "bg-white text-slate-900 shadow-2xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({totalCustomers})
          </button>

          <button
            onClick={() => setFilterType("guest")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs sm:text-xs shrink-0 flex items-center gap-1.5 ${
              filterType === "guest"
                ? "bg-indigo-600 text-white shadow-2xs font-black"
                : "text-indigo-800 hover:bg-indigo-50/70"
            }`}
          >
            <ShoppingBag className="size-3" />
            <span>Guest Checkout ({guestBuyers})</span>
          </button>

          <button
            onClick={() => setFilterType("portal")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs sm:text-xs shrink-0 flex items-center gap-1.5 ${
              filterType === "portal"
                ? "bg-emerald-600 text-white shadow-2xs font-black"
                : "text-emerald-800 hover:bg-emerald-50/70"
            }`}
          >
            <ShieldCheck className="size-3" />
            <span>Portal Accounts ({portalAccounts})</span>
          </button>

          <button
            onClick={() => setFilterType("contractors")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs sm:text-xs shrink-0 ${
              filterType === "contractors"
                ? "bg-white text-slate-900 shadow-2xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Contractors ({verifiedContractors})
          </button>

          <button
            onClick={() => setFilterType("buyers")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs sm:text-xs shrink-0 ${
              filterType === "buyers"
                ? "bg-white text-slate-900 shadow-2xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Buyers ({activeBuyers})
          </button>

          <button
            onClick={() => setFilterType("recent")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs sm:text-xs shrink-0 ${
              filterType === "recent"
                ? "bg-white text-slate-900 shadow-2xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            New (30d)
          </button>
        </div>
      </div>

      {/* ─── MAIN TABLE & MOBILE CARD LIST CONTAINER ─── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-cyan-600 mb-3" />
            <p className="text-xs font-bold text-slate-400">Loading customer database...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center p-4">
            <div className="size-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100 text-slate-300">
              <Users className="size-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">No customers found</h3>
            <p className="text-xs text-slate-400">
              No accounts match your current filters or search query.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Customer Cards (< md screens) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredCustomers.map((customer: any) => {
                const isSelected = activeCustomer?.id === customer.id;
                const isGuest = customer.isGuest || customer.accountType === "guest";
                const ordersCount = customer.orders?.length || customer.totalOrders || 0;
                const quotesCount = customer.quotes?.length || 0;
                const primaryAddr = customer.addresses?.[0] || customer.orders?.[0]?.address;

                return (
                  <div
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomerId(customer.id);
                      setActiveTab("orders");
                    }}
                    className={`p-4 transition-colors cursor-pointer space-y-2.5 active:bg-slate-100 ${
                      isSelected ? "bg-cyan-50/80" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-10 rounded-full p-0.5 shrink-0 overflow-hidden ${
                            isGuest
                              ? "bg-gradient-to-tr from-indigo-500 to-purple-600"
                              : "bg-gradient-to-tr from-cyan-500 to-blue-600"
                          }`}
                        >
                          {customer.avatar ? (
                            <img
                              src={customer.avatar}
                              alt={customer.name}
                              className="size-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="size-full bg-slate-900 rounded-full grid place-items-center text-white text-xs font-black">
                              {customer.name?.slice(0, 2).toUpperCase() || (isGuest ? "G" : "U")}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-slate-900 text-sm truncate">
                              {customer.name}
                            </span>
                            {isGuest ? (
                              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <ShoppingBag className="size-2.5" />
                                Guest
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <ShieldCheck className="size-2.5" />
                                Portal
                              </span>
                            )}
                          </div>

                          {customer.company ? (
                            <span className="text-xs font-bold text-cyan-800 truncate block">
                              {customer.company}
                            </span>
                          ) : isGuest ? (
                            <span className="text-xs font-medium text-slate-400 truncate block">
                              Direct Storefront Buyer
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-sm text-slate-900">
                          {formatUSD(customer.lifetimeValue || customer.totalSpent || 0)}
                        </div>
                        <div className="text-xs text-emerald-600 font-bold">Total Spend</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <span>
                          <strong>{ordersCount}</strong> Order{ordersCount !== 1 ? "s" : ""}
                        </span>
                        {primaryAddr?.city && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="size-3" />
                            {primaryAddr.city}, {primaryAddr.state || ""}
                          </span>
                        )}
                      </div>
                      <span className="text-cyan-700 font-bold flex items-center gap-0.5">
                        Customer 360 <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (>= md screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-black uppercase tracking-wider text-slate-400">
                    <th className="p-4 sm:px-6">Customer & Account Type</th>
                    <th className="p-4 sm:px-6">Contact & Logistics</th>
                    <th className="p-4 sm:px-6 text-center">Orders Placed</th>
                    <th className="p-4 sm:px-6 text-center">RMA Claims</th>
                    <th className="p-4 sm:px-6 text-center">Quotes & Bids</th>
                    <th className="p-4 sm:px-6 text-right">Lifetime Spend</th>
                    <th className="p-4 sm:px-6 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  <AnimatePresence>
                    {filteredCustomers.map((customer: any, index: number) => {
                      const isSelected = activeCustomer?.id === customer.id;
                      const isGuest = customer.isGuest || customer.accountType === "guest";
                      const ordersCount = customer.orders?.length || customer.totalOrders || 0;
                      const returnsCount = customer.returns?.length || 0;
                      const quotesCount = customer.quotes?.length || 0;
                      const primaryAddr = customer.addresses?.[0] || customer.orders?.[0]?.address;

                      return (
                        <motion.tr
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.015 }}
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomerId(customer.id);
                            setActiveTab("orders");
                          }}
                          className={`transition-colors cursor-pointer group ${
                            isSelected
                              ? isGuest
                                ? "bg-indigo-50/80 border-l-4 border-l-indigo-600"
                                : "bg-cyan-50/80 border-l-4 border-l-cyan-600"
                              : "hover:bg-slate-50/80"
                          }`}
                        >
                          {/* Customer & Account Type */}
                          <td className="p-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`size-10 rounded-full p-0.5 shrink-0 shadow-xs overflow-hidden ${
                                  isGuest
                                    ? "bg-gradient-to-tr from-indigo-500 via-purple-600 to-indigo-700"
                                    : "bg-gradient-to-tr from-cyan-500 to-blue-600"
                                }`}
                              >
                                {customer.avatar ? (
                                  <img
                                    src={customer.avatar}
                                    alt={customer.name}
                                    className="size-full rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="size-full bg-slate-900 rounded-full grid place-items-center text-white text-xs font-black">
                                    {customer.name?.slice(0, 2).toUpperCase() ||
                                      (isGuest ? "G" : "U")}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                                  <span>{customer.name}</span>
                                  {isGuest ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                                      <ShoppingBag className="size-3" />
                                      Guest
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                      <ShieldCheck className="size-3" />
                                      Portal Member
                                    </span>
                                  )}
                                  {customer.company && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 shrink-0">
                                      {customer.company}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-semibold text-slate-400 flex items-center gap-2 mt-0.5">
                                  {isGuest ? (
                                    <span className="text-slate-500 flex items-center gap-1">
                                      <Clock className="size-3 text-indigo-500" />
                                      First Order:{" "}
                                      {customer.createdAt || customer.firstOrderAt
                                        ? new Date(
                                            customer.createdAt || customer.firstOrderAt,
                                          ).toLocaleDateString()
                                        : "Recent"}
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="size-3" />
                                      Joined {new Date(customer.createdAt).toLocaleDateString()}
                                    </span>
                                  )}
                                  {customer.contractorId && (
                                    <span className="font-mono text-slate-500 font-extrabold">
                                      · Lic #{customer.contractorId}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact & Logistics */}
                          <td className="p-4 sm:px-6">
                            <div className="space-y-1">
                              {customer.email && (
                                <a
                                  href={`mailto:${customer.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-slate-800 hover:text-cyan-700 flex items-center gap-1.5 text-xs font-semibold truncate max-w-[210px]"
                                >
                                  <Mail className="size-3 text-slate-400 shrink-0" />
                                  <span>{customer.email}</span>
                                </a>
                              )}
                              {customer.phone && (
                                <a
                                  href={`tel:${customer.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 text-xs font-mono"
                                >
                                  <Phone className="size-3 text-slate-400 shrink-0" />
                                  <span>{customer.phone}</span>
                                </a>
                              )}
                              {primaryAddr?.city && (
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                  <MapPin className="size-2.5 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[180px]">
                                    {primaryAddr.city}, {primaryAddr.state || ""}{" "}
                                    {primaryAddr.zip || ""}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Total Orders */}
                          <td className="p-4 sm:px-6 text-center">
                            <div className="font-black text-slate-900 text-sm">{ordersCount}</div>
                            {isGuest && (
                              <div className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                                Direct Order
                              </div>
                            )}
                          </td>

                          {/* RMA Claims */}
                          <td className="p-4 sm:px-6 text-center">
                            {returnsCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                {returnsCount} RMA
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* Quotes */}
                          <td className="p-4 sm:px-6 text-center">
                            {quotesCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-cyan-100 text-cyan-900 border border-cyan-300">
                                {quotesCount} RFQ
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* Lifetime Value */}
                          <td className="p-4 sm:px-6 text-right">
                            <div className="font-black text-sm text-slate-900">
                              {formatUSD(customer.lifetimeValue || customer.totalSpent || 0)}
                            </div>
                            <div className="text-xs font-extrabold text-emerald-600">
                              Verified Spend
                            </div>
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
                              title="Inspect Customer 360"
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
          </>
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
              <div
                className={`p-4 sm:p-6 border-b border-slate-100 text-white shrink-0 relative ${
                  isCustomerGuest
                    ? "bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900"
                    : "bg-slate-900"
                }`}
              >
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="absolute top-4 sm:top-5 right-4 sm:right-5 size-8 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center transition cursor-pointer"
                >
                  <X className="size-4" />
                </button>

                <div className="flex items-start gap-3 sm:gap-4 pr-8 sm:pr-10">
                  <div
                    className={`size-12 sm:size-14 rounded-full p-0.5 shrink-0 shadow-lg overflow-hidden ${
                      isCustomerGuest
                        ? "bg-gradient-to-tr from-indigo-400 via-purple-500 to-indigo-700"
                        : "bg-gradient-to-tr from-cyan-500 to-blue-600"
                    }`}
                  >
                    {activeCustomer.avatar ? (
                      <img
                        src={activeCustomer.avatar}
                        alt={activeCustomer.name}
                        className="size-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-full bg-slate-800 rounded-full grid place-items-center text-white text-base font-black">
                        {activeCustomer.name?.slice(0, 2).toUpperCase() ||
                          (isCustomerGuest ? "G" : "U")}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-xl font-black text-white tracking-tight truncate">
                        {activeCustomer.name}
                      </h2>
                      {isCustomerGuest ? (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                          <ShoppingBag className="size-3 text-indigo-300" />
                          Guest Checkout Buyer (No Portal Login)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                          <ShieldCheck className="size-3 text-emerald-300" />
                          Verified Client Portal Member
                        </span>
                      )}
                    </div>

                    {activeCustomer.company && (
                      <div className="text-xs font-bold text-cyan-300 mt-0.5 flex items-center gap-1.5 truncate">
                        <Building className="size-3.5 shrink-0" />
                        <span className="truncate">{activeCustomer.company}</span>
                        {activeCustomer.contractorId && (
                          <span className="text-white/60">
                            · Lic #{activeCustomer.contractorId}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-xs sm:text-xs text-slate-400 mt-1 flex items-center gap-2 sm:gap-3 flex-wrap">
                      {activeCustomer.email && (
                        <a
                          href={`mailto:${activeCustomer.email}`}
                          className="hover:text-cyan-300 flex items-center gap-1 truncate max-w-[220px]"
                        >
                          <Mail className="size-3 shrink-0" />
                          <span className="truncate">{activeCustomer.email}</span>
                        </a>
                      )}
                      {activeCustomer.phone && (
                        <a
                          href={`tel:${activeCustomer.phone}`}
                          className="hover:text-cyan-300 flex items-center gap-1"
                        >
                          <Phone className="size-3 shrink-0" />
                          <span>{activeCustomer.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* KPI Bar */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10 text-center">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs sm:text-xs font-black uppercase text-slate-400">
                      Lifetime Spend
                    </div>
                    <div className="text-xs sm:text-base font-black text-cyan-300 mt-0.5 truncate">
                      {formatUSD(activeCustomer.lifetimeValue || activeCustomer.totalSpent || 0)}
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs sm:text-xs font-black uppercase text-slate-400">
                      Total Orders
                    </div>
                    <div className="text-xs sm:text-base font-black text-white mt-0.5">
                      {activeCustomer.orders?.length || activeCustomer.totalOrders || 0}
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs sm:text-xs font-black uppercase text-slate-400">
                      RMA Claims
                    </div>
                    <div className="text-xs sm:text-base font-black text-amber-400 mt-0.5">
                      {activeCustomer.returns?.length || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto text-xs font-bold scrollbar-none">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 text-xs sm:text-xs ${
                    activeTab === "orders"
                      ? "border-cyan-600 text-cyan-900 bg-white shadow-2xs font-black"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ShoppingBag className="size-3.5" />
                  <span>Orders ({activeCustomer.orders?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 text-xs sm:text-xs ${
                    activeTab === "addresses"
                      ? "border-cyan-600 text-cyan-900 bg-white shadow-2xs font-black"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MapPin className="size-3.5" />
                  <span>Destinations ({activeCustomer.addresses?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab("returns")}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 text-xs sm:text-xs ${
                    activeTab === "returns"
                      ? "border-cyan-600 text-cyan-900 bg-white shadow-2xs font-black"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <RotateCcw className="size-3.5" />
                  <span>Returns ({activeCustomer.returns?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab("quotes")}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 text-xs sm:text-xs ${
                    activeTab === "quotes"
                      ? "border-cyan-600 text-cyan-900 bg-white shadow-2xs font-black"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="size-3.5" />
                  <span>Quotes ({activeCustomer.quotes?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab("info")}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 sm:gap-2 shrink-0 text-xs sm:text-xs ${
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
                {/* Notice Banner for Guest Checkout Customers */}
                {isCustomerGuest && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50/60 to-indigo-50/40 border border-indigo-200/80 shadow-2xs flex items-start gap-3.5">
                    <div className="size-9 rounded-xl bg-indigo-600 text-white grid place-items-center shrink-0 shadow-xs mt-0.5">
                      <ShoppingBag className="size-4" />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-black text-indigo-950 flex items-center gap-2">
                        <span>Direct Guest Checkout Customer Profile</span>
                        <span className="text-xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-indigo-200/70 text-indigo-900">
                          Without Portal Login
                        </span>
                      </div>
                      <p className="text-indigo-900/80 leading-relaxed font-medium">
                        This customer completed purchase transactions directly on the storefront
                        without authenticating into a client portal account. All order records,
                        destination addresses, and spend totals are live-synced from their order
                        transaction logs.
                      </p>
                    </div>
                  </div>
                )}

                {/* ─── 1. ORDERS TAB ─── */}
                {activeTab === "orders" && (
                  <div className="space-y-4">
                    {activeCustomer.orders && activeCustomer.orders.length > 0 ? (
                      activeCustomer.orders.map((order: any) => (
                        <div
                          key={order.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-cyan-800">
                                  #{order.id}
                                </span>
                                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  {order.paymentStatus || "Paid"}
                                </span>
                                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                                  {order.status || "Pending"}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                Placed {new Date(order.placedAt).toLocaleDateString()} · Method:{" "}
                                {order.method || "Standard Freight"} · Payment:{" "}
                                {order.paymentType || "Card"}
                              </div>
                              {order.address && (
                                <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                                  <MapPin className="size-3 text-slate-400 shrink-0" />
                                  <span>
                                    Deliver to: {order.address.street || order.address.line1 || ""},{" "}
                                    {order.address.city || ""}, {order.address.state || ""}{" "}
                                    {order.address.zip || ""}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-black text-base text-slate-900">
                                  {formatUSD(order.total || 0)}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {(order.items || []).length} Item(s)
                                </div>
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
                              <div
                                key={idx}
                                className="p-3 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="size-9 rounded-lg bg-slate-50 border border-slate-100 p-1 shrink-0 grid place-items-center">
                                    <img
                                      src={it.img || "/assets/commingsoon.png"}
                                      alt={it.name}
                                      className="size-full object-contain mix-blend-multiply"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-extrabold text-slate-900 truncate">
                                      {it.name}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {it.brand || "Commercial Equipment"}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right font-black text-slate-900 shrink-0">
                                  <div>Qty: {it.qty || 1}</div>
                                  <div className="text-xs text-slate-500 font-semibold">
                                    {formatUSD(it.price || 0)} ea
                                  </div>
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
                        <p className="text-xs text-slate-400">
                          When this customer completes checkout, their order logs will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── 2. DESTINATIONS & ADDRESSES TAB ─── */}
                {activeTab === "addresses" && (
                  <div className="space-y-4">
                    {isCustomerGuest && (
                      <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/60 text-indigo-900 text-xs font-medium flex items-center gap-2">
                        <MapPin className="size-4 text-indigo-600 shrink-0" />
                        <span>
                          Delivery freight destinations automatically captured from storefront order
                          transactions.
                        </span>
                      </div>
                    )}

                    {activeCustomer.addresses && activeCustomer.addresses.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {activeCustomer.addresses.map((addr: any, idx: number) => (
                          <div
                            key={addr.id || idx}
                            className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-slate-900">
                                {addr.title || `Destination #${idx + 1}`}
                              </span>
                              {addr.isDefault && (
                                <span className="text-xs font-black text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full">
                                  Primary
                                </span>
                              )}
                            </div>
                            <div className="text-slate-700 font-semibold">{addr.recipientName}</div>
                            <div className="text-slate-600">
                              {addr.line1 || addr.street} {addr.line2 || ""}
                            </div>
                            <div className="text-slate-600">
                              {addr.city}, {addr.state} {addr.zip}
                            </div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {addr.country || "USA"} · {addr.type || "Freight Shipping"}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center text-slate-400 space-y-2">
                        <MapPin className="size-10 mx-auto text-slate-300 stroke-1" />
                        <p className="text-xs font-bold text-slate-700">
                          No destination addresses found
                        </p>
                        <p className="text-xs text-slate-400">
                          Destination addresses will appear here once captured from checkout.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── 3. RETURNS & RMA TAB ─── */}
                {activeTab === "returns" && (
                  <div className="space-y-4">
                    {activeCustomer.returns && activeCustomer.returns.length > 0 ? (
                      activeCustomer.returns.map((ret: any) => {
                        const isResolved = ret.isResolved || ret.status === "Resolved";
                        return (
                          <div
                            key={ret.id || ret.rmaId}
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-cyan-800">
                                  {ret.rmaId}
                                </span>
                                <span className="text-xs font-bold text-slate-500">
                                  · Order #{ret.orderId}
                                </span>
                              </div>
                              {isResolved ? (
                                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Resolved
                                </span>
                              ) : (
                                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
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
                                <span className="text-slate-900">
                                  {ret.preferredResolution || "Replacement Unit"}
                                </span>
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

                            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
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
                        <p className="text-xs text-slate-400">
                          This account has zero return claims.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── 4. QUOTES TAB ─── */}
                {activeTab === "quotes" && (
                  <div className="space-y-4">
                    {activeCustomer.quotes && activeCustomer.quotes.length > 0 ? (
                      activeCustomer.quotes.map((q: any) => {
                        const isResolved =
                          q.isResolved ||
                          q.status === "Resolved" ||
                          q.status === "Accepted" ||
                          q.status === "Converted to Order";
                        return (
                          <div
                            key={q.id || q.quoteId}
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-blue-800">
                                  #{q.quoteId}
                                </span>
                                <span className="font-black text-sm text-slate-900">
                                  {q.projectName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-slate-900">
                                  {formatUSD(
                                    q.quotedAmount || q.totalAmount || q.estimatedBudget || 0,
                                  )}
                                </span>
                                {isResolved ? (
                                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    {q.status || "Resolved"}
                                  </span>
                                ) : (
                                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-900 border border-cyan-200">
                                    {q.status || "Engineering Review"}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                              <span>
                                Target: <strong>{q.targetCompletionDate || "30 Days"}</strong>
                              </span>
                              {q.projectLocation && (
                                <span>
                                  · Location: <strong>{q.projectLocation}</strong>
                                </span>
                              )}
                              {q.adminLeadTime && (
                                <span>
                                  · Lead Time: <strong>{q.adminLeadTime}</strong>
                                </span>
                              )}
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

                            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
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
                        <p className="text-xs font-bold text-slate-700">
                          No project quotes requested
                        </p>
                        <p className="text-xs text-slate-400">
                          Commercial project bids will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── 5. ACCOUNT INFO TAB ─── */}
                {activeTab === "info" && (
                  <div className="space-y-4 text-xs">
                    {isCustomerGuest ? (
                      <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-4">
                        <div className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                          <Sparkles className="size-3.5 text-indigo-600" />
                          <span>Guest Checkout Customer Profile Analytics</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-slate-500 font-semibold">Account Status:</span>
                            <div className="font-extrabold text-indigo-950 mt-0.5 flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-indigo-600"></span>
                              <span>Guest Checkout (No Portal Login)</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold">
                              Customer Reference ID:
                            </span>
                            <div className="font-mono font-bold text-slate-800 mt-0.5 truncate">
                              {activeCustomer.id}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold">
                              First Storefront Order:
                            </span>
                            <div className="font-bold text-slate-900 mt-0.5">
                              {activeCustomer.firstOrderAt || activeCustomer.createdAt
                                ? new Date(
                                    activeCustomer.firstOrderAt || activeCustomer.createdAt,
                                  ).toLocaleString()
                                : "N/A"}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold">Latest Order Date:</span>
                            <div className="font-bold text-slate-900 mt-0.5">
                              {activeCustomer.lastOrderAt
                                ? new Date(activeCustomer.lastOrderAt).toLocaleString()
                                : "N/A"}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold">
                              Average Order Value (AOV):
                            </span>
                            <div className="font-black text-emerald-700 mt-0.5">
                              {formatUSD(
                                (activeCustomer.lifetimeValue || activeCustomer.totalSpent || 0) /
                                  (activeCustomer.totalOrders ||
                                    activeCustomer.orders?.length ||
                                    1),
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-semibold">
                              Total Items Purchased:
                            </span>
                            <div className="font-black text-slate-900 mt-0.5">
                              {activeCustomer.totalProductsPurchased ||
                                activeCustomer.totalItems ||
                                0}{" "}
                              unit(s)
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-indigo-200/60 flex items-center gap-3">
                          {activeCustomer.email && (
                            <a
                              href={`mailto:${activeCustomer.email}?subject=Your Pool Supply Wholesalers Order`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition"
                            >
                              <Mail className="size-3.5" />
                              <span>Email Customer</span>
                            </a>
                          )}
                          {activeCustomer.phone && (
                            <a
                              href={`tel:${activeCustomer.phone}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                            >
                              <Phone className="size-3.5 text-slate-500" />
                              <span>Call {activeCustomer.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                          <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Account Credentials & Verification
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-slate-500">Account ID:</span>
                              <div className="font-mono font-bold text-slate-900">
                                {activeCustomer.id}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-500">Registered On:</span>
                              <div className="font-bold text-slate-900">
                                {new Date(activeCustomer.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-500">Contractor License:</span>
                              <div className="font-mono font-bold text-slate-900">
                                {activeCustomer.contractorId || "Not on file"}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-500">Company Name:</span>
                              <div className="font-bold text-slate-900">
                                {activeCustomer.company || "Independent Contractor"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                          <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Email Notification Preferences
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-slate-700 font-semibold">
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                className={`size-3.5 ${activeCustomer.emailPrefs?.orderUpdates ? "text-emerald-600" : "text-slate-300"}`}
                              />
                              <span>Order Status Updates</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                className={`size-3.5 ${activeCustomer.emailPrefs?.freightTracking ? "text-emerald-600" : "text-slate-300"}`}
                              />
                              <span>Freight Tracking Feed</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                className={`size-3.5 ${activeCustomer.emailPrefs?.invoiceReceipts ? "text-emerald-600" : "text-slate-300"}`}
                              />
                              <span>Direct PDF Invoices</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                className={`size-3.5 ${activeCustomer.emailPrefs?.promoAlerts ? "text-emerald-600" : "text-slate-300"}`}
                              />
                              <span>Wholesale Rebate Alerts</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="text-xs text-slate-400">
                  Customer Reference:{" "}
                  <span className="font-mono font-bold text-slate-700">{activeCustomer.id}</span>
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
