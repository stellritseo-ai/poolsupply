import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminReturnsDb,
  updateReturnStatusDb,
  toggleReturnResolvedDb,
  deleteReturnDb,
  ReturnRequest,
} from "@/lib/api/returns.functions";
import { formatUSD } from "@/components/site/cart-context";
import { getProductImage } from "@/lib/products";
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Printer,
  ChevronRight,
  User,
  ShoppingBag,
  Package,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Filter,
  Check,
  X,
  FileText,
  Mail,
  Phone,
  Building,
  RefreshCw,
  HelpCircle,
  Tag,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/returns")({
  head: () => ({
    meta: [
      { title: "Returns & RMA Management — Admin Dashboard | Pool Supply Wholesalers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: async () => {
    try {
      const res = await getAdminReturnsDb();
      return (res?.returns || []) as ReturnRequest[];
    } catch {
      return [];
    }
  },
  component: ReturnsManagerPage,
});

function ReturnsManagerPage() {
  const initialReturns = Route.useLoaderData() as ReturnRequest[];
  const queryClient = useQueryClient();
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [resolutionFilter, setResolutionFilter] = useState<string>("all");
  const [adminNotesDraft, setAdminNotesDraft] = useState("");
  const [adminResolutionDraft, setAdminResolutionDraft] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Returns data
  const {
    data: returnsData = initialReturns,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin_returns"],
    queryFn: async () => {
      const res = await getAdminReturnsDb();
      return res.returns || [];
    },
    initialData: initialReturns,
    refetchInterval: 10000,
  });

  const returnsList: ReturnRequest[] = returnsData || [];

  // Keep selected return in sync when data refreshes
  useEffect(() => {
    if (returnsList.length > 0) {
      if (!selectedReturn || !returnsList.some((r) => r.id === selectedReturn.id)) {
        setSelectedReturn(returnsList[0]);
        setAdminNotesDraft(returnsList[0].adminNotes || "");
        setAdminResolutionDraft(returnsList[0].adminResolution || "");
      } else {
        const updated = returnsList.find((r) => r.id === selectedReturn.id);
        if (updated) {
          setSelectedReturn(updated);
        }
      }
    } else {
      setSelectedReturn(null);
    }
  }, [returnsList]);

  // When selected return changes, update draft inputs
  const handleSelectReturn = (ret: ReturnRequest) => {
    setSelectedReturn(ret);
    setAdminNotesDraft(ret.adminNotes || "");
    setAdminResolutionDraft(ret.adminResolution || "");
  };

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      isResolved,
    }: {
      id: string;
      status?: ReturnRequest["status"];
      isResolved?: boolean;
    }) => {
      return await updateReturnStatusDb({
        data: { id, status, isResolved },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_returns"] });
      showToast("Return request status updated.");
    },
  });

  // Toggle Resolved mutation
  const toggleResolvedMutation = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      return await toggleReturnResolvedDb({
        data: { id, resolved },
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin_returns"] });
      showToast(vars.resolved ? "Request marked as Resolved." : "Request marked as Unresolved / Reopened.");
    },
  });

  // Save Admin Notes mutation
  const handleSaveNotes = async () => {
    if (!selectedReturn) return;
    setIsSavingNotes(true);
    try {
      await updateReturnStatusDb({
        data: {
          id: selectedReturn.id,
          adminNotes: adminNotesDraft,
          adminResolution: adminResolutionDraft,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["admin_returns"] });
      showToast("Resolution notes saved successfully.");
    } catch {
      showToast("Failed to save notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete Return mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteReturnDb({ data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_returns"] });
      showToast("Return record removed.");
    },
  });

  const handleDeleteReturn = (id: string, rmaId: string) => {
    if (window.confirm(`Are you sure you want to permanently delete return request ${rmaId}?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Print RMA Packing Slip
  const handlePrintRmaSlip = (ret: ReturnRequest) => {
    const itemRows = (ret.items || [])
      .map(
        (it, idx) => `
      <tr style="background:${idx % 2 === 0 ? "#ffffff" : "#f8fafc"}">
        <td style="padding:10px 12px;font-weight:600;font-size:12px;">${it.name || "Equipment Unit"}</td>
        <td style="padding:10px 12px;color:#64748b;font-size:12px;">${it.brand || "OEM Wholesaler"}</td>
        <td style="padding:10px 12px;text-align:center;font-weight:700;font-size:12px;">${it.qty || 1}</td>
        <td style="padding:10px 12px;text-align:right;font-weight:700;font-size:12px;">$${(it.price || 0).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>RMA Authorization Slip - ${ret.rmaId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0f172a; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 24px; }
    .rma-box { background: #0f172a; color: white; padding: 12px 20px; border-radius: 8px; text-align: right; }
    .rma-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
    .rma-code { font-size: 22px; font-weight: 900; font-family: monospace; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.6; }
    .card-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th { background: #f1f5f9; padding: 10px 12px; font-weight: 700; text-align: left; border-bottom: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; }
    td { border-bottom: 1px solid #e2e8f0; }
    .instructions { margin-top: 32px; padding: 16px; border: 1px dashed #0284c7; background: #f0f9ff; border-radius: 8px; font-size: 12px; line-height: 1.6; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <img src="${window.location.origin}/logo.png" alt="Logo" style="height: 56px; margin-bottom: 8px;"/>
      <div style="font-size: 14px; font-weight: 700;">Pool Supply Wholesalers</div>
      <div style="font-size: 12px; color: #64748b;">Warehouse RMA Receiving & Processing Center</div>
    </div>
    <div class="rma-box">
      <div class="rma-title">Return Merchandise Auth</div>
      <div class="rma-code">${ret.rmaId}</div>
      <div style="font-size: 11px; margin-top: 4px; opacity: 0.8;">Status: ${ret.status}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Customer & Trade Details</div>
      <div><strong>${ret.customerName || "Trade Customer"}</strong></div>
      ${ret.customerCompany ? `<div>${ret.customerCompany}</div>` : ""}
      <div>Email: ${ret.customerEmail || "N/A"}</div>
      <div>Phone: ${ret.customerPhone || "N/A"}</div>
    </div>
    <div class="card">
      <div class="card-title">Order Reference</div>
      <div><strong>Order #${ret.orderId}</strong></div>
      <div>Placed: ${new Date(ret.orderPlacedAt || ret.createdAt).toLocaleDateString()}</div>
      <div>Reason: <strong>${ret.reason}</strong></div>
      <div>Preferred: ${ret.preferredResolution || "Replacement Unit"}</div>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 8px;">Authorized Return Items</div>
    <table>
      <thead>
        <tr>
          <th>Product / Description</th>
          <th>Brand</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Unit Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows || `<tr><td colspan="4" style="padding:16px;text-align:center;color:#94a3b8;">Full order return: #${ret.orderId}</td></tr>`}
      </tbody>
    </table>
  </div>

  ${
    ret.notes
      ? `
  <div class="card" style="margin-bottom: 24px; background: #fffbeb; border-color: #fde68a;">
    <div class="card-title" style="color: #92400e;">Customer Problem Statement</div>
    <div style="color: #78350f;">"${ret.notes}"</div>
  </div>`
      : ""
  }

  <div class="instructions">
    <strong>Warehouse Receiving Instructions:</strong>
    <ol style="margin-left: 20px; margin-top: 6px;">
      <li>Inspect incoming shipment packaging for transit carrier damage.</li>
      <li>Verify serial number match and included OEM component accessories.</li>
      <li>Scan or reference RMA <strong>${ret.rmaId}</strong> into inventory control system.</li>
      <li>Route to Testing & Inspection Bay B or stage for manufacturer credit return.</li>
    </ol>
  </div>

  <div class="footer">
    <div>Pool Supply Wholesalers · RMA Support: sales@poolsupplywholesalers.com</div>
    <div>Printed: ${new Date().toLocaleString()}</div>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

    const printWin = window.open("", "_blank", "width=850,height=750");
    if (printWin) {
      printWin.document.write(printHtml);
      printWin.document.close();
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = returnsList.length;
    const underReview = returnsList.filter(
      (r) => r.status === "Under Review" || r.status === "Processing Return"
    ).length;
    const resolved = returnsList.filter((r) => r.isResolved || r.status === "Resolved").length;
    const unresolved = returnsList.filter((r) => !r.isResolved && r.status !== "Resolved").length;
    const approved = returnsList.filter((r) => r.status === "Approved").length;
    const totalValue = returnsList.reduce((acc, r) => acc + (r.orderTotal || 0), 0);

    return { total, underReview, resolved, unresolved, approved, totalValue };
  }, [returnsList]);

  // Filtered returns
  const filteredReturns = useMemo(() => {
    return returnsList.filter((r) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "under_review" && r.status !== "Under Review" && r.status !== "Processing Return") return false;
        if (statusFilter === "approved" && r.status !== "Approved") return false;
        if (statusFilter === "resolved" && (!r.isResolved && r.status !== "Resolved")) return false;
        if (statusFilter === "unresolved" && (r.isResolved || r.status === "Resolved")) return false;
        if (statusFilter === "refund" && r.status !== "Refund Issued") return false;
        if (statusFilter === "rejected" && r.status !== "Rejected") return false;
      }

      // Resolution filter
      if (resolutionFilter === "resolved" && !r.isResolved) return false;
      if (resolutionFilter === "unresolved" && r.isResolved) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const rmaMatch = r.rmaId?.toLowerCase().includes(q);
        const orderMatch = r.orderId?.toLowerCase().includes(q);
        const nameMatch = r.customerName?.toLowerCase().includes(q);
        const emailMatch = r.customerEmail?.toLowerCase().includes(q);
        const phoneMatch = r.customerPhone?.toLowerCase().includes(q);
        const reasonMatch = r.reason?.toLowerCase().includes(q);
        const notesMatch = r.notes?.toLowerCase().includes(q);
        const itemMatch = (r.items || []).some((it) => it.name?.toLowerCase().includes(q));

        if (!rmaMatch && !orderMatch && !nameMatch && !emailMatch && !phoneMatch && !reasonMatch && !notesMatch && !itemMatch) {
          return false;
        }
      }

      return true;
    });
  }, [returnsList, statusFilter, resolutionFilter, searchTerm]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5"
          >
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white grid place-items-center shadow-md shrink-0">
            <RotateCcw className="size-5 sm:size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Returns & RMA Management</h1>
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                {metrics.total} Requests
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Review warranty claims, approve RMA slips, and manage resolution lifecycles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Refresh returns data"
          >
            <RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin text-cyan-600" : ""}`} />
            <span>{isRefetching ? "Syncing..." : "Refresh Feed"}</span>
          </button>
        </div>
      </div>

      {/* ── Metric KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Returns</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{metrics.total}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">All time claims</div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1">
            <Clock className="size-3" />
            <span>Under Review</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-900">{metrics.underReview}</div>
          <div className="text-[10px] sm:text-[11px] text-amber-700 font-medium mt-0.5 truncate">Needs action</div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
            <CheckCircle2 className="size-3" />
            <span>Resolved</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900">{metrics.resolved}</div>
          <div className="text-[10px] sm:text-[11px] text-emerald-700 font-medium mt-0.5 truncate">Case closed</div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-700 mb-1 flex items-center gap-1">
            <AlertTriangle className="size-3" />
            <span>Unresolved</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-900">{metrics.unresolved}</div>
          <div className="text-[10px] sm:text-[11px] text-rose-700 font-medium mt-0.5 truncate">Open cases</div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-2xs">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1">RMA Total Value</div>
          <div className="text-lg sm:text-2xl font-black text-blue-950 truncate">{formatUSD(metrics.totalValue)}</div>
          <div className="text-[10px] sm:text-[11px] text-blue-700 font-medium mt-0.5 truncate">Claim volume</div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search RMA #, Order ID, customer, email, product..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-cyan-500 focus:outline-none transition shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Resolution Filter */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-none">
            <button
              onClick={() => setResolutionFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                resolutionFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setResolutionFilter("unresolved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
                resolutionFilter === "unresolved"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-rose-700"
              }`}
            >
              <AlertCircle className="size-3" />
              <span>Unresolved</span>
            </button>
            <button
              onClick={() => setResolutionFilter("resolved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
                resolutionFilter === "resolved"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              <Check className="size-3" />
              <span>Resolved</span>
            </button>
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-xs overflow-x-auto scrollbar-none pb-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mr-1 flex items-center gap-1 shrink-0">
            <Filter className="size-3" />
            <span>Filter:</span>
          </span>
          {[
            { id: "all", label: "All Returns" },
            { id: "under_review", label: "Under Review" },
            { id: "approved", label: "Approved" },
            { id: "resolved", label: "Resolved" },
            { id: "unresolved", label: "Unresolved" },
            { id: "refund", label: "Refund Issued" },
            { id: "rejected", label: "Rejected" },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setStatusFilter(chip.id)}
              className={`px-2.5 sm:px-3 py-1 rounded-xl font-bold transition cursor-pointer text-[11px] sm:text-xs shrink-0 ${
                statusFilter === chip.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Master-Detail 2-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Returns List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="font-bold text-xs text-slate-700">
              Showing {filteredReturns.length} of {returnsList.length} Returns
            </div>
            {isRefetching && <span className="text-[11px] text-cyan-600 font-bold">Refreshing...</span>}
          </div>

          <div className="divide-y divide-slate-100 max-h-[720px] overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="size-6 animate-spin mx-auto text-cyan-600" />
                <p className="text-xs font-semibold">Loading return requests...</p>
              </div>
            ) : filteredReturns.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <RotateCcw className="size-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-bold text-slate-700">No returns found</p>
                <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              filteredReturns.map((ret) => {
                const isSelected = selectedReturn?.id === ret.id;
                const isResolved = ret.isResolved || ret.status === "Resolved";

                return (
                  <button
                    key={ret.id}
                    onClick={() => handleSelectReturn(ret)}
                    className={`w-full p-3.5 sm:p-4 text-left transition cursor-pointer flex flex-col gap-2.5 relative active:bg-slate-100 ${
                      isSelected
                        ? "bg-cyan-50/60 border-l-4 border-l-cyan-600"
                        : "hover:bg-slate-50/80 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Top row: RMA ID + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-mono font-black text-xs text-slate-900">{ret.rmaId}</span>
                        <span className="text-[11px] font-semibold text-slate-500">Order #{ret.orderId}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isResolved ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="size-2.5" />
                            <span>Resolved</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <Clock className="size-2.5" />
                            <span>{ret.status || "Under Review"}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Customer & Reason */}
                    <div>
                      <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5 truncate">
                        <User className="size-3 text-slate-400 shrink-0" />
                        <span className="truncate">{ret.customerName || "Trade Customer"}</span>
                        {ret.customerCompany && (
                          <span className="text-slate-400 font-normal text-[11px] truncate">({ret.customerCompany})</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                        <span className="font-semibold text-slate-700">Reason:</span> {ret.reason}
                      </div>
                    </div>

                    {/* Footer row: Date + Amount */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100/60">
                      <span>{new Date(ret.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span className="font-bold text-slate-700">{formatUSD(ret.orderTotal || 0)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Return Full Details (7 cols) */}
        <div className="lg:col-span-7">
          {selectedReturn ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-6">
              {/* ── Detail Header ── */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">{selectedReturn.rmaId}</h2>
                    {selectedReturn.isResolved || selectedReturn.status === "Resolved" ? (
                      <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="size-3.5" />
                        <span>RESOLVED</span>
                      </span>
                    ) : (
                      <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                        <Clock className="size-3.5" />
                        <span>IN PROGRESS</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1">
                    Submitted on{" "}
                    {new Date(selectedReturn.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>

                {/* Quick Print & Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePrintRmaSlip(selectedReturn)}
                    className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Printer className="size-3.5" />
                    <span>Print RMA Slip</span>
                  </button>

                  <button
                    onClick={() => handleDeleteReturn(selectedReturn.id, selectedReturn.rmaId)}
                    className="size-8 sm:size-9 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 grid place-items-center transition cursor-pointer"
                    title="Delete RMA record"
                  >
                    <Trash2 className="size-3.5 sm:size-4" />
                  </button>
                </div>
              </div>

              {/* ── Resolution Toggle Banner ── */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  selectedReturn.isResolved || selectedReturn.status === "Resolved"
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                    : "bg-amber-50/80 border-amber-200 text-amber-950"
                }`}
              >
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-2">
                    {selectedReturn.isResolved || selectedReturn.status === "Resolved" ? (
                      <>
                        <CheckCircle2 className="size-4 text-emerald-700" />
                        <span>This Return Request is Marked as Resolved</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-4 text-amber-700" />
                        <span>This Return Request Needs Resolution</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs opacity-80 mt-0.5">
                    {selectedReturn.isResolved || selectedReturn.status === "Resolved"
                      ? "Customer has been credited, replacement dispatched, or warranty resolved."
                      : "Case is pending warehouse receipt, supplier approval, or refund confirmation."}
                  </p>
                </div>

                <div className="shrink-0">
                  {selectedReturn.isResolved || selectedReturn.status === "Resolved" ? (
                    <button
                      onClick={() => toggleResolvedMutation.mutate({ id: selectedReturn.id, resolved: false })}
                      disabled={toggleResolvedMutation.isPending}
                      className="px-4 py-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 font-black text-xs transition cursor-pointer shadow-xs"
                    >
                      Mark as Unresolved / Reopen
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleResolvedMutation.mutate({ id: selectedReturn.id, resolved: true })}
                      disabled={toggleResolvedMutation.isPending}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <Check className="size-3.5" />
                      <span>Mark Request Resolved</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ── Status Lifecycle Selector ── */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Lifecycle Status Stage
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Under Review",
                    "Approved",
                    "Processing Return",
                    "Item Received",
                    "Replacement Shipped",
                    "Refund Issued",
                    "Resolved",
                    "Rejected",
                  ].map((st) => {
                    const isCurrent = selectedReturn.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() =>
                          statusMutation.mutate({
                            id: selectedReturn.id,
                            status: st as any,
                            isResolved: st === "Resolved" ? true : undefined,
                          })
                        }
                        disabled={statusMutation.isPending}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          isCurrent
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-white"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Customer & Order Grid ── */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Customer Information */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="size-3.5 text-slate-500" />
                    <span>Customer Details</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-900 text-sm">{selectedReturn.customerName || "Trade Client"}</div>
                    {selectedReturn.customerCompany && (
                      <div className="text-slate-600 font-medium flex items-center gap-1">
                        <Building className="size-3 text-slate-400" />
                        <span>{selectedReturn.customerCompany}</span>
                      </div>
                    )}
                    {selectedReturn.customerEmail && (
                      <div className="text-slate-600 flex items-center gap-1">
                        <Mail className="size-3 text-slate-400" />
                        <a href={`mailto:${selectedReturn.customerEmail}`} className="hover:underline text-cyan-700">
                          {selectedReturn.customerEmail}
                        </a>
                      </div>
                    )}
                    {selectedReturn.customerPhone && (
                      <div className="text-slate-600 flex items-center gap-1">
                        <Phone className="size-3 text-slate-400" />
                        <a href={`tel:${selectedReturn.customerPhone}`} className="hover:underline text-cyan-700">
                          {selectedReturn.customerPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Information */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShoppingBag className="size-3.5 text-slate-500" />
                    <span>Order Reference</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-mono font-black text-slate-900 text-sm">#{selectedReturn.orderId}</div>
                    <div className="text-slate-600">
                      Placed:{" "}
                      <span className="font-semibold text-slate-800">
                        {new Date(selectedReturn.orderPlacedAt || selectedReturn.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Total:{" "}
                      <span className="font-black text-cyan-700">{formatUSD(selectedReturn.orderTotal || 0)}</span>
                    </div>
                    <div className="pt-1">
                      <Link
                        to="/admin/orders"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:underline"
                      >
                        <span>View in Orders Manager</span>
                        <ArrowUpRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Return Reason & Statement ── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Return Reason & Preferred Resolution
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    {selectedReturn.preferredResolution || "Replacement Unit"}
                  </span>
                </div>
                <div className="font-black text-sm text-slate-900">{selectedReturn.reason}</div>
                {selectedReturn.notes && (
                  <p className="text-xs text-slate-700 italic bg-white p-3.5 rounded-xl border border-amber-100 leading-relaxed">
                    "{selectedReturn.notes}"
                  </p>
                )}
              </div>

              {/* ── Returned Items List ── */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Package className="size-3.5 text-slate-500" />
                  <span>Authorized Return Line Items</span>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                        <th className="px-4 py-2.5 font-bold">Item / Equipment</th>
                        <th className="px-4 py-2.5 font-bold text-center">Qty</th>
                        <th className="px-4 py-2.5 font-bold text-right">Unit Price</th>
                        <th className="px-4 py-2.5 font-bold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedReturn.items || []).length > 0 ? (
                        selectedReturn.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition">
                            <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-3">
                              {it.img && (
                                <img
                                  src={getProductImage(it.img)}
                                  alt={it.name}
                                  className="size-9 rounded-lg object-contain bg-slate-50 border border-slate-100 p-1 shrink-0"
                                />
                              )}
                              <div>
                                <div>{it.name || "Commercial Equipment Unit"}</div>
                                {it.brand && <div className="text-[10px] text-slate-400 font-normal">{it.brand}</div>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-800">{it.qty || 1}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{formatUSD(it.price || 0)}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                              {formatUSD((it.price || 0) * (it.qty || 1))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                            Entire Order #{selectedReturn.orderId} returned ({formatUSD(selectedReturn.orderTotal || 0)})
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Admin Resolution & Notes Panel ── */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-sm flex items-center gap-2">
                    <ShieldCheck className="size-4 text-cyan-400" />
                    <span>Admin Resolution & Internal Remarks</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Internal Audit Log</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Resolution Summary (e.g. Issued 100% refund / Shipped replacement UPS 1Z999)
                    </label>
                    <input
                      type="text"
                      value={adminResolutionDraft}
                      onChange={(e) => setAdminResolutionDraft(e.target.value)}
                      placeholder="e.g. Approved RMA. Replacement Pentair pump dispatched via Freight Express."
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Internal Admin Notes
                    </label>
                    <textarea
                      rows={3}
                      value={adminNotesDraft}
                      onChange={(e) => setAdminNotesDraft(e.target.value)}
                      placeholder="Add notes for warehouse team, credit memos, or manufacturer warranty tracking..."
                      className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <Check className="size-3.5" />
                      <span>{isSavingNotes ? "Saving..." : "Save Resolution Notes"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-16 text-center text-slate-400 space-y-3">
              <RotateCcw className="size-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">Select a Return Request</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Choose an RMA case from the left list to review customer claims, update resolution state, or print packing slips.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
