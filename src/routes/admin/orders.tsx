import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrdersDb, updateOrderStatusDb, deleteOrderDb, Order } from "@/lib/api/orders.functions";
import { formatUSD } from "@/components/site/cart-context";
import {
  Search,
  Eye,
  Trash2,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  ShoppingBag,
  Package,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Printer,
  DollarSign,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Loader2,
  Building,
  User,
  ShieldCheck,
  Download,
  Check,
  Send,
  Boxes,
  FileText,
  BadgeCheck,
  ChevronDown,
  Navigation,
  X,
  CreditCard,
  Receipt,
  Warehouse,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Customer Orders & Fulfillment — Admin Console | Pool Supply Wholesalers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: async () => {
    try {
      const res = await getOrdersDb();
      return (res?.success && res.orders ? res.orders : []) as Order[];
    } catch {
      return [];
    }
  },
  component: OrdersManager,
});

function OrdersManager() {
  const initialOrders = Route.useLoaderData() as Order[];
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live order querying with 5s background polling
  const {
    data: orders = initialOrders,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await getOrdersDb();
      if (res?.success && res.orders) {
        return res.orders as Order[];
      }
      return [];
    },
    initialData: initialOrders,
    refetchInterval: 5000,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter and Sort: Guaranteed Newest on Top by default
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const q = searchTerm.toLowerCase().trim();
        const matchSearch =
          !q ||
          (o.name || "").toLowerCase().includes(q) ||
          (o.id || "").toLowerCase().includes(q) ||
          (o.email || "").toLowerCase().includes(q) ||
          (o.company || "").toLowerCase().includes(q) ||
          (o.phone || "").includes(q) ||
          (o.items || []).some(
            (it: any) =>
              (it.name || "").toLowerCase().includes(q) ||
              (it.brand || "").toLowerCase().includes(q) ||
              (it.id || "").toLowerCase().includes(q)
          );
        const matchStatus =
          statusFilter === "all" ||
          o.status === statusFilter ||
          (!o.status && statusFilter === "Pending");
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        const timeA = new Date(a.placedAt || 0).getTime();
        const timeB = new Date(b.placedAt || 0).getTime();

        if (sortBy === "newest") return timeB - timeA;
        if (sortBy === "oldest") return timeA - timeB;
        if (sortBy === "highest") return (b.total || 0) - (a.total || 0);
        if (sortBy === "lowest") return (a.total || 0) - (b.total || 0);
        return timeB - timeA;
      });
  }, [orders, searchTerm, statusFilter, sortBy]);

  // Keep selected order in sync when open
  useEffect(() => {
    if (selectedOrder && orders.length > 0) {
      const fresh = orders.find((o) => o.id === selectedOrder.id);
      if (fresh) setSelectedOrder(fresh);
    }
  }, [orders]);

  // KPI Calculations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending" || !o.status).length;
  const shippedOrders = orders.filter((o) => o.status === "Shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const updateStatus = async (id: string, nextStatus: Order["status"]) => {
    setIsUpdatingStatus(true);
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }
    await updateOrderStatusDb({ data: { id, status: nextStatus! } });
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
    setIsUpdatingStatus(false);
    showToast(`Order #${id} updated to ${nextStatus}`);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const orderToDelete = deleteConfirmId;
    if (selectedOrder?.id === deleteConfirmId) {
      setSelectedOrder(null);
    }
    await deleteOrderDb({ data: { id: deleteConfirmId } });
    setDeleteConfirmId(null);
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
    showToast(`Order #${orderToDelete} removed permanently.`);
  };

  const getStatusStyle = (status?: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-900 border-amber-200/90 shadow-2xs";
      case "Shipped":
        return "bg-cyan-50 text-cyan-900 border-cyan-200/90 shadow-2xs";
      case "Delivered":
        return "bg-emerald-50 text-emerald-900 border-emerald-200/90 shadow-2xs";
      case "Cancelled":
        return "bg-rose-50 text-rose-800 border-rose-200/90 shadow-2xs";
      default:
        return "bg-amber-50 text-amber-900 border-amber-200/90 shadow-2xs";
    }
  };

  const getStatusIcon = (status?: Order["status"]) => {
    switch (status) {
      case "Pending":
        return Clock;
      case "Shipped":
        return Truck;
      case "Delivered":
        return CheckCircle2;
      case "Cancelled":
        return XCircle;
      default:
        return Clock;
    }
  };

  const isRecentOrder = (placedAt: string) => {
    const time = new Date(placedAt).getTime();
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
    return time > fortyEightHoursAgo;
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Export Orders CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("No orders available to export.");
      return;
    }
    const headers = [
      "Order ID",
      "Date Placed",
      "Customer Name",
      "Company",
      "Email",
      "Phone",
      "Status",
      "Payment",
      "Items Count",
      "Total USD",
    ];
    const rows = orders.map((o) => [
      o.id,
      new Date(o.placedAt).toISOString(),
      `"${o.name.replace(/"/g, '""')}"`,
      `"${(o.company || "").replace(/"/g, '""')}"`,
      o.email,
      o.phone || "",
      o.status || "Pending",
      o.paymentType || "Card",
      (o.items || []).length,
      (o.total || 0).toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Wholesale_Orders_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported Orders CSV file successfully.");
  };

  // Print Isolated Commercial Invoice Popup
  const printInvoice = (order: Order) => {
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) {
      alert("Please allow popups to print official invoices.");
      return;
    }

    const itemsHtml = (order.items || [])
      .map(
        (it, idx) => `
        <tr>
          <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${idx + 1}</td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #0f172a; font-weight: 600;">
            ${it.name}
            ${it.brand ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Manufacturer: ${it.brand}</div>` : ""}
          </td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center; color: #0f172a; font-weight: bold;">${it.qty || 1}</td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; color: #0f172a;">${formatUSD(it.price || 0)}</td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-weight: bold; color: #0f172a;">${formatUSD((it.price || 0) * (it.qty || 1))}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Commercial Invoice #${order.id} — Pool Supply Wholesalers</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; background: #ffffff; padding: 40px; line-height: 1.45; }
          .container { max-width: 820px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0891b2; padding-bottom: 24px; margin-bottom: 24px; }
          .brand-logo { display: flex; align-items: center; gap: 14px; }
          .brand-logo img { height: 50px; object-fit: contain; }
          .company-name { font-size: 22px; font-weight: 900; color: #0891b2; letter-spacing: -0.5px; }
          .company-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
          .doc-badge { text-align: right; }
          .doc-title { font-size: 22px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
          .doc-ref { font-family: monospace; font-size: 16px; font-weight: 800; color: #0891b2; margin-top: 4px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
          .card-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 8px; }
          .card-value { font-size: 14px; font-weight: 800; color: #0f172a; }
          .card-sub { font-size: 12px; color: #475569; margin-top: 3px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #0f172a; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px 14px; text-align: left; }
          th:first-child { border-radius: 8px 0 0 0; }
          th:last-child { border-radius: 0 8px 0 0; }
          .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 28px; }
          .totals-table { width: 320px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #475569; border-bottom: 1px solid #f1f5f9; }
          .totals-row.grand-total { font-size: 16px; font-weight: 900; color: #0f172a; border-top: 2px solid #0891b2; border-bottom: none; padding-top: 12px; }
          .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #64748b; text-align: center; }
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
              <div style="font-size: 11px; color: #059669; font-weight: 700; margin-top: 2px;">Status: ${order.status || "Pending"} (${order.paymentStatus || "Paid"})</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="card">
              <div class="card-title">Sold To / Contractor Account</div>
              <div class="card-value">${order.name}</div>
              ${order.company ? `<div class="card-sub"><strong>Company:</strong> ${order.company}</div>` : ""}
              <div class="card-sub">${order.email}</div>
              ${order.phone ? `<div class="card-sub">${order.phone}</div>` : ""}
            </div>

            <div class="card">
              <div class="card-title">Shipping & Logistics Destination</div>
              <div class="card-value">${order.method === "pickup" ? "Wholesale Hub Pickup" : "Freight Delivery"}</div>
              ${order.address?.line1 ? `<div class="card-sub">${order.address.line1} ${order.address.line2 || ""}</div>` : ""}
              ${order.address?.city ? `<div class="card-sub">${order.address.city}, ${order.address.state} ${order.address.zip}</div>` : ""}
              <div class="card-sub"><strong>Payment:</strong> ${order.paymentType || "Card / Commercial Credit"}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Item Description / Equipment Package</th>
                <th style="width: 70px; text-align: center;">Qty</th>
                <th style="width: 120px; text-align: right;">Unit Price</th>
                <th style="width: 120px; text-align: right;">Ext. Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
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
                <span>${order.shipping ? formatUSD(order.shipping) : "Free / Included"}</span>
              </div>
              <div class="totals-row">
                <span>Estimated Sales Tax:</span>
                <span>${order.tax ? formatUSD(order.tax) : "$0.00 (Exempt)"}</span>
              </div>
              <div class="totals-row grand-total">
                <span>Total Billed:</span>
                <span style="color: #0891b2;">${formatUSD(order.total || 0)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <strong>Pool Supply Wholesalers</strong> · 410 Scott Pike, Nashville, TN 37207 · (615) 477-0407<br/>
            Authorized wholesale distributor. Genuine OEM warranty applies on all serialized components.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="space-y-6 max-w-[1380px] mx-auto pb-20">
      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 text-xs font-black flex items-center gap-2"
          >
            <Check className="size-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TOP COMMAND HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
            <Link to="/admin" className="hover:text-cyan-700 transition">
              Admin Console
            </Link>
            <span>/</span>
            <span className="text-cyan-700">Orders Center</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white grid place-items-center shadow-md">
              <ShoppingBag className="size-5.5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>Customer Orders</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium mt-0.5">
                Real-time commercial purchase logs, carrier fulfillment, and contractor invoice telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs shadow-2xs transition cursor-pointer"
          >
            <Download className="size-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <Loader2 className={`size-3.5 ${isRefetching ? "animate-spin text-cyan-600" : ""}`} />
            <span>{isRefetching ? "Updating..." : "Refresh"}</span>
          </button>

          <Link
            to="/admin/customers"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
          >
            <User className="size-3.5" />
            <span>Customer 360</span>
          </Link>
        </div>
      </div>

      {/* ─── 4-PILLAR EXECUTIVE METRIC HUD ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Orders */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="size-8 sm:size-9 rounded-xl bg-slate-100 text-slate-700 grid place-items-center">
              <ShoppingBag className="size-4 sm:size-4.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{totalOrders}</div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 sm:mt-1 flex items-center gap-1 truncate">
            <span className="text-emerald-600 font-bold">100% verified</span> in Atlas
          </div>
        </div>

        {/* Metric 2: Pending Fulfillment */}
        <div className="bg-white border border-amber-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs bg-gradient-to-br from-white to-amber-50/40 hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">Pending Dispatch</span>
            <div className="size-8 sm:size-9 rounded-xl bg-amber-100 text-amber-800 grid place-items-center">
              <Clock className="size-4 sm:size-4.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-950 tracking-tight">{pendingOrders}</div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-amber-800/80 mt-0.5 sm:mt-1 truncate">
            Awaiting dock
          </div>
        </div>

        {/* Metric 3: In Transit */}
        <div className="bg-white border border-cyan-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs bg-gradient-to-br from-white to-cyan-50/40 hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-900">Freight In-Transit</span>
            <div className="size-8 sm:size-9 rounded-xl bg-cyan-100 text-cyan-800 grid place-items-center">
              <Truck className="size-4 sm:size-4.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-950 tracking-tight">{shippedOrders}</div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-cyan-800/80 mt-0.5 sm:mt-1 truncate">
            Dispatched routes
          </div>
        </div>

        {/* Metric 4: Gross Revenue */}
        <div className="bg-white border border-emerald-200/90 rounded-2xl p-3.5 sm:p-5 shadow-2xs bg-gradient-to-br from-white to-emerald-50/40 hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">Settled Revenue</span>
            <div className="size-8 sm:size-9 rounded-xl bg-emerald-100 text-emerald-800 grid place-items-center">
              <DollarSign className="size-4 sm:size-4.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl lg:text-3xl font-black text-emerald-950 tracking-tight truncate">{formatUSD(totalRevenue)}</div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-800/80 mt-0.5 sm:mt-1 truncate">
            Gross wholesale sales
          </div>
        </div>
      </div>

      {/* ─── TOOLBAR & SEGMENTED STATUS CONTROLS ─── */}
      <div className="bg-white border border-slate-200/90 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order #, customer, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 h-10 sm:h-11 border border-slate-200 bg-slate-50/80 rounded-xl sm:rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/10 transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 grid place-items-center text-[10px] font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl sm:rounded-2xl text-xs font-bold shrink-0 overflow-x-auto">
            <button
              onClick={() => setSortBy("newest")}
              className={`px-3 py-1.5 rounded-lg sm:rounded-xl transition cursor-pointer flex items-center gap-1 text-[11px] sm:text-xs shrink-0 ${
                sortBy === "newest"
                  ? "bg-white text-slate-900 shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="size-3 text-cyan-600" />
              <span>Newest</span>
            </button>
            <button
              onClick={() => setSortBy("oldest")}
              className={`px-3 py-1.5 rounded-lg sm:rounded-xl transition cursor-pointer text-[11px] sm:text-xs shrink-0 ${
                sortBy === "oldest"
                  ? "bg-white text-slate-900 shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Oldest
            </button>
            <button
              onClick={() => setSortBy("highest")}
              className={`px-3 py-1.5 rounded-lg sm:rounded-xl transition cursor-pointer text-[11px] sm:text-xs shrink-0 ${
                sortBy === "highest"
                  ? "bg-white text-slate-900 shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Highest $
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 text-[11px] sm:text-xs ${
              statusFilter === "all"
                ? "bg-slate-900 text-white font-black shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <span>All Orders</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {totalOrders}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Pending")}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 text-[11px] sm:text-xs ${
              statusFilter === "Pending"
                ? "bg-amber-600 text-white font-black shadow-sm"
                : "bg-amber-50 text-amber-900 border border-amber-200/70 hover:bg-amber-100"
            }`}
          >
            <Clock className="size-3" />
            <span>Pending</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === "Pending"
                  ? "bg-white/20 text-white"
                  : "bg-amber-200 text-amber-950"
              }`}
            >
              {pendingOrders}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Shipped")}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 text-[11px] sm:text-xs ${
              statusFilter === "Shipped"
                ? "bg-cyan-700 text-white font-black shadow-sm"
                : "bg-cyan-50 text-cyan-900 border border-cyan-200/70 hover:bg-cyan-100"
            }`}
          >
            <Truck className="size-3" />
            <span>Shipped</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === "Shipped"
                  ? "bg-white/20 text-white"
                  : "bg-cyan-200 text-cyan-950"
              }`}
            >
              {shippedOrders}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Delivered")}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 text-[11px] sm:text-xs ${
              statusFilter === "Delivered"
                ? "bg-emerald-700 text-white font-black shadow-sm"
                : "bg-emerald-50 text-emerald-900 border border-emerald-200/70 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 className="size-3" />
            <span>Delivered</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === "Delivered"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-200 text-emerald-950"
              }`}
            >
              {deliveredOrders}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Cancelled")}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 text-[11px] sm:text-xs ${
              statusFilter === "Cancelled"
                ? "bg-rose-700 text-white font-black shadow-sm"
                : "bg-rose-50 text-rose-900 border border-rose-200/70 hover:bg-rose-100"
            }`}
          >
            <XCircle className="size-3" />
            <span>Cancelled</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === "Cancelled"
                  ? "bg-white/20 text-white"
                  : "bg-rose-200 text-rose-950"
              }`}
            >
              {cancelledOrders}
            </span>
          </button>
        </div>
      </div>

      {/* ─── MASTER ORDERS TABLE & MOBILE CARD VIEW ─── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="size-9 animate-spin text-cyan-600 mb-3" />
            <p className="text-xs font-bold text-slate-400">Loading wholesale orders database...</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List (< md screens) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => {
                  const StatusIcon = getStatusIcon(o.status);
                  const isNew = isRecentOrder(o.placedAt);
                  const items = o.items || [];

                  return (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      className="p-4 hover:bg-cyan-50/40 transition-colors cursor-pointer space-y-2.5 active:bg-slate-100"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 font-mono text-sm">
                            #{o.id}
                          </span>
                          {isNew && (
                            <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-[9px] font-black uppercase tracking-wider">
                              NEW
                            </span>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusStyle(
                            o.status
                          )}`}
                        >
                          <StatusIcon className="size-3" />
                          {o.status || "Pending"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-black text-slate-900">{o.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">{o.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-slate-900 text-sm">{formatUSD(o.total || 0)}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{items.length} item(s)</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
                        <span>{formatRelativeTime(o.placedAt)}</span>
                        <span className="text-cyan-700 font-bold flex items-center gap-0.5">
                          View details <ChevronRight className="size-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-slate-400 font-bold text-xs space-y-2 p-4">
                  <ShoppingBag className="size-10 mx-auto text-slate-300 stroke-1" />
                  <div className="text-slate-700 font-black text-sm">No wholesale customer orders found</div>
                  <div className="text-slate-400 text-xs">Try adjusting your search query or status filter.</div>
                </div>
              )}
            </div>

            {/* Desktop Table (>= md screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/90 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="p-4 sm:px-6 font-black">Order ID</th>
                    <th className="p-4 sm:px-6 font-black">Contractor Customer</th>
                    <th className="p-4 sm:px-6 font-black">Date Placed</th>
                    <th className="p-4 sm:px-6 font-black">Logistics & Pay</th>
                    <th className="p-4 sm:px-6 font-black text-right">Total Amount</th>
                    <th className="p-4 sm:px-6 font-black text-center">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((o) => {
                      const StatusIcon = getStatusIcon(o.status);
                      const isNew = isRecentOrder(o.placedAt);
                      const items = o.items || [];

                      return (
                        <tr
                          key={o.id}
                          className="hover:bg-cyan-50/40 transition-colors cursor-pointer group"
                          onClick={() => setSelectedOrder(o)}
                        >
                          {/* Col 1: Order ID + NEW Pill */}
                          <td className="p-4 sm:px-6">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 font-mono text-sm group-hover:text-cyan-700 transition-colors">
                                #{o.id}
                              </span>
                              {isNew && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-[9px] font-black uppercase tracking-wider shadow-xs animate-pulse">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                              <Boxes className="size-3 text-slate-400" />
                              <span>{items.length} line item(s)</span>
                            </div>
                          </td>

                          {/* Col 2: Customer Profile */}
                          <td className="p-4 sm:px-6">
                            <div className="space-y-0.5">
                              <div className="font-black text-slate-900 text-sm">
                                {o.name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                <Mail className="size-3 text-slate-400 shrink-0" />
                                <span>{o.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Col 3: Placed Date */}
                          <td className="p-4 sm:px-6 text-slate-700 font-medium">
                            <div className="font-bold text-slate-900 text-xs">
                              {formatRelativeTime(o.placedAt)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              {new Date(o.placedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </td>

                          {/* Col 4: Logistics & Payment Method */}
                          <td className="p-4 sm:px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                <Truck className="size-3 text-slate-400" />
                                <span>{o.method === "pickup" ? "Hub Pickup" : "Freight Delivery"}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <CreditCard className="size-3 text-slate-400" />
                                <span>{o.paymentType || "Card"}</span>
                              </div>
                            </div>
                          </td>

                          {/* Col 5: Total Amount */}
                          <td className="p-4 sm:px-6 text-right">
                            <div className="font-black text-slate-900 text-sm">{formatUSD(o.total || 0)}</div>
                            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                              {o.paymentStatus || "Paid"}
                            </div>
                          </td>

                          {/* Col 6: Fulfillment Status Pill */}
                          <td className="p-4 sm:px-6 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${getStatusStyle(
                                o.status
                              )}`}
                            >
                              <StatusIcon className="size-3" />
                              {o.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-24 text-slate-400 font-bold text-xs space-y-2">
                        <ShoppingBag className="size-12 mx-auto text-slate-300 stroke-1" />
                        <div className="text-slate-700 font-black text-sm">No wholesale customer orders found</div>
                        <div className="text-slate-400 text-xs">Try adjusting your search query or status filter above.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ─── ORDER DETAILS DRAWER / MODAL (OPENED ON ORDER CLICK) ─── */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white w-full max-w-2xl h-full sm:h-[94vh] sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            >
              {/* Drawer Top Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-900 text-white shrink-0 relative">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-4 sm:top-5 right-4 sm:right-5 size-8 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center transition cursor-pointer"
                >
                  <X className="size-4" />
                </button>

                <div className="flex items-start gap-3 sm:gap-4 pr-8 sm:pr-10">
                  <div className="size-10 sm:size-13 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-lg sm:text-xl grid place-items-center shrink-0 shadow-lg">
                    <ShoppingBag className="size-5 sm:size-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-xl font-black text-white tracking-tight font-mono truncate">
                        Order #{selectedOrder.id}
                      </h2>
                      {isRecentOrder(selectedOrder.placedAt) && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 shadow-xs">
                          NEW
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          selectedOrder.status === "Delivered"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : selectedOrder.status === "Shipped"
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                            : selectedOrder.status === "Cancelled"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}
                      >
                        {selectedOrder.status || "Pending"}
                      </span>
                    </div>

                    <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>Placed on {new Date(selectedOrder.placedAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-bold">{selectedOrder.paymentStatus || "Paid"}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons in Header */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/10">
                  <button
                    onClick={() => printInvoice(selectedOrder)}
                    className="py-2 sm:py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Printer className="size-3.5 sm:size-4" />
                    <span>Print Commercial Invoice</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(selectedOrder.id)}
                    className="py-2 sm:py-2.5 px-3 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                  >
                    <Trash2 className="size-3.5 sm:size-4" />
                    <span>Delete Record</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Drawer Content */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
                {/* 1. Fulfillment Lifecycle Progress */}
                <div className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <span>Fulfillment Progress</span>
                    <span className="text-cyan-700 font-extrabold">{selectedOrder.status || "Pending Fulfillment"}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 relative">
                    <div className="h-2.5 rounded-full bg-cyan-600 shadow-xs" />
                    <div
                      className={`h-2.5 rounded-full ${
                        selectedOrder.status === "Shipped" || selectedOrder.status === "Delivered"
                          ? "bg-cyan-600 shadow-xs"
                          : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-2.5 rounded-full ${
                        selectedOrder.status === "Shipped" || selectedOrder.status === "Delivered"
                          ? "bg-cyan-600 shadow-xs"
                          : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-2.5 rounded-full ${
                        selectedOrder.status === "Delivered"
                          ? "bg-emerald-600 shadow-xs"
                          : "bg-slate-200"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-4 text-[10px] font-black text-slate-400 text-center pt-0.5">
                    <span className="text-cyan-800">1. Received</span>
                    <span className={selectedOrder.status !== "Pending" ? "text-cyan-800" : ""}>2. Packed</span>
                    <span className={selectedOrder.status === "Shipped" || selectedOrder.status === "Delivered" ? "text-cyan-800" : ""}>
                      3. In Transit
                    </span>
                    <span className={selectedOrder.status === "Delivered" ? "text-emerald-700" : ""}>4. Delivered</span>
                  </div>
                </div>

                {/* 2. Update Lifecycle Status Action */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Update Order Lifecycle</span>
                    {isUpdatingStatus && <span className="text-cyan-600 font-bold">Saving changes...</span>}
                  </label>
                  <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 sm:gap-2">
                    {(["Pending", "Shipped", "Delivered", "Cancelled"] as Order["status"][]).map((st) => (
                      <button
                        key={st}
                        onClick={() => updateStatus(selectedOrder.id, st)}
                        className={`py-2 sm:py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border text-center ${
                          selectedOrder.status === st || (!selectedOrder.status && st === "Pending")
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Customer Profile & Address */}
                <div className="space-y-3 p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Customer & Destination
                  </div>
                  <div>
                    <div className="font-black text-sm text-slate-900">
                      {selectedOrder.name}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{selectedOrder.email}</div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/80 text-xs">
                    {selectedOrder.phone && (
                      <div className="text-slate-600 flex items-center gap-2">
                        <Phone className="size-3.5 text-cyan-600 shrink-0" />
                        <a href={`tel:${selectedOrder.phone}`} className="hover:underline font-bold text-slate-800">
                          {selectedOrder.phone}
                        </a>
                      </div>
                    )}
                    <div className="text-slate-600 flex items-center gap-2">
                      <Mail className="size-3.5 text-cyan-600 shrink-0" />
                      <a href={`mailto:${selectedOrder.email}`} className="hover:underline text-cyan-800 font-bold">
                        {selectedOrder.email}
                      </a>
                    </div>
                    {selectedOrder.address && (
                      <div className="text-slate-600 flex items-start gap-2 pt-0.5">
                        <MapPin className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {selectedOrder.address.line1} {selectedOrder.address.line2 || ""},{" "}
                          {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zip}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/80 flex justify-between">
                    <span>Logistics: <strong>{selectedOrder.method === "pickup" ? "Hub Pickup" : "Freight Delivery"}</strong></span>
                    <span>Payment: <strong>{selectedOrder.paymentType || "Commercial Card"}</strong></span>
                  </div>
                </div>

                {/* 4. Itemized Bill of Materials (BOM) */}
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Itemized Equipment SKUs ({selectedOrder.items?.length || 0})</span>
                    <span>Subtotal: {formatUSD(selectedOrder.subtotal || selectedOrder.total || 0)}</span>
                  </div>
                  <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden divide-y divide-slate-100 text-xs">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 grid place-items-center">
                            <img
                              src={item.img || "/assets/commingsoon.png"}
                              alt={item.name}
                              className="size-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <div>
                            {item.id ? (
                              <Link
                                to="/products/$productId"
                                params={{ productId: item.id }}
                                target="_blank"
                                className="font-black text-slate-900 hover:text-cyan-600 transition-colors inline-flex items-center gap-1 group cursor-pointer"
                              >
                                <span>{item.name}</span>
                                <ExternalLink className="size-3 text-slate-400 group-hover:text-cyan-600 shrink-0" />
                              </Link>
                            ) : (
                              <div className="font-black text-slate-900">{item.name}</div>
                            )}
                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              {item.brand || "Pool Supply Wholesalers"} · Qty: {item.qty} · {formatUSD(item.price)} ea
                            </div>
                          </div>
                        </div>
                        <div className="font-black text-slate-900 text-sm shrink-0">
                          {formatUSD(item.price * item.qty)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Financial Summary Breakdown */}
                <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Equipment Subtotal</span>
                    <span>{formatUSD(selectedOrder.subtotal || selectedOrder.total || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Freight Commercial Delivery</span>
                    <span>{selectedOrder.shipping ? formatUSD(selectedOrder.shipping) : "FREE / Included"}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Estimated Sales Tax</span>
                    <span>{selectedOrder.tax ? formatUSD(selectedOrder.tax) : "$0.00 (Exempt)"}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Billed Amount</span>
                    <span className="text-cyan-700 font-black">{formatUSD(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="text-[11px] text-slate-400 font-mono">
                  ID: <span className="font-bold text-slate-700">#{selectedOrder.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => printInvoice(selectedOrder)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="size-3.5 text-cyan-700" />
                    <span>Print Slip</span>
                  </button>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition cursor-pointer shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="size-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 grid place-items-center mx-auto">
                <Trash2 className="size-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-black text-base text-slate-900">Delete Order #{deleteConfirmId}?</h3>
                <p className="text-xs text-slate-500">
                  This will permanently remove this customer order record from the database. This action cannot be undone.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="py-2.5 rounded-xl border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
