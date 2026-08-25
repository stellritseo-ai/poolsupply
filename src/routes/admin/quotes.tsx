import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Search,
  Check,
  Clock,
  Printer,
  ChevronRight,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  AlertCircle,
  Trash2,
  RefreshCw,
  Sparkles,
  MapPin,
  Send,
  Layers,
  ArrowLeft,
} from "lucide-react";
import {
  getAdminQuotesDb,
  updateQuoteStatusDb,
  toggleQuoteResolvedDb,
  deleteQuoteDb,
  QuoteRequest,
} from "@/lib/api/quotes.functions";

export const Route = createFileRoute("/admin/quotes")({
  loader: async () => {
    try {
      const res = await getAdminQuotesDb();
      return (res?.quotes || []) as QuoteRequest[];
    } catch {
      return [];
    }
  },
  component: AdminQuotesPage,
});

function formatUSD(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(val || 0);
}

function AdminQuotesPage() {
  const initialQuotes = Route.useLoaderData() as QuoteRequest[];
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlyUnresolved, setOnlyUnresolved] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  // Edit / update state for the selected quote
  const [editStatus, setEditStatus] = useState<string>("");
  const [editQuotedAmount, setEditQuotedAmount] = useState<string>("");
  const [editLeadTime, setEditLeadTime] = useState<string>("");
  const [editFreightTerms, setEditFreightTerms] = useState<string>("");
  const [editAdminNotes, setEditAdminNotes] = useState<string>("");
  const [editProposalNotes, setEditProposalNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const {
    data: quotesData = initialQuotes,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin_quotes"],
    queryFn: async () => {
      const res = await getAdminQuotesDb();
      return res.quotes || [];
    },
    initialData: initialQuotes,
    refetchInterval: 12000,
  });

  const quotesList: QuoteRequest[] = quotesData || [];

  // Filtered quotes list
  const filteredQuotes = useMemo(() => {
    return quotesList.filter((q) => {
      if (onlyUnresolved && q.isResolved) return false;
      if (statusFilter !== "all" && q.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchId = (q.quoteId || "").toLowerCase().includes(query);
        const matchProject = (q.projectName || "").toLowerCase().includes(query);
        const matchCust = (q.customerName || "").toLowerCase().includes(query);
        const matchEmail = (q.customerEmail || "").toLowerCase().includes(query);
        const matchCompany = (q.customerCompany || "").toLowerCase().includes(query);
        const matchLocation = (q.projectLocation || "").toLowerCase().includes(query);
        return matchId || matchProject || matchCust || matchEmail || matchCompany || matchLocation;
      }
      return true;
    });
  }, [quotesList, statusFilter, onlyUnresolved, searchQuery]);

  // Selected quote object
  const activeQuote = useMemo(() => {
    if (!quotesList.length) return null;
    if (!selectedQuoteId) return filteredQuotes[0] || quotesList[0];
    return quotesList.find((q) => q.id === selectedQuoteId || q.quoteId === selectedQuoteId) || filteredQuotes[0] || quotesList[0];
  }, [quotesList, selectedQuoteId, filteredQuotes]);

  // Sync edit form fields when active quote changes
  const handleSelectQuote = (q: QuoteRequest) => {
    setSelectedQuoteId(q.id || q.quoteId);
    setEditStatus(q.status || "Engineering Review");
    setEditQuotedAmount(q.quotedAmount ? String(q.quotedAmount) : "");
    setEditLeadTime(q.adminLeadTime || "3-5 Business Days");
    setEditFreightTerms(q.adminFreightTerms || "FOB Nashville / Wholesale Freight");
    setEditAdminNotes(q.adminNotes || "");
    setEditProposalNotes(q.adminProposalNotes || "");
  };

  // KPI Calculations
  const totalQuotesCount = quotesList.length;
  const underReviewCount = quotesList.filter((q) => !q.isResolved && (q.status === "Under Review" || q.status === "Engineering Review")).length;
  const pricingReadyCount = quotesList.filter((q) => q.status === "Pricing Ready" || q.status === "Approved").length;
  const acceptedCount = quotesList.filter((q) => q.status === "Accepted" || q.status === "Converted to Order" || q.isResolved).length;
  const totalPipelineValue = quotesList.reduce((sum, q) => sum + (q.quotedAmount || q.estimatedBudget || 0), 0);

  // Save changes handler
  const handleSaveChanges = async () => {
    if (!activeQuote) return;
    setIsUpdating(true);
    try {
      const amountNum = editQuotedAmount.trim() ? parseFloat(editQuotedAmount) : undefined;
      const res = await updateQuoteStatusDb({
        data: {
          id: activeQuote.id || activeQuote.quoteId,
          status: editStatus as any,
          quotedAmount: amountNum,
          adminLeadTime: editLeadTime,
          adminFreightTerms: editFreightTerms,
          adminNotes: editAdminNotes,
          adminProposalNotes: editProposalNotes,
        },
      });

      if (res.success) {
        showToast(`Quote #${activeQuote.quoteId} updated successfully.`);
        await refetch();
      } else {
        showToast(res.error || "Failed to update quote.");
      }
    } catch {
      showToast("Error updating quote record.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle Resolved Quick Button
  const handleToggleResolved = async (quote: QuoteRequest) => {
    const nextResolvedState = !quote.isResolved;
    try {
      const res = await toggleQuoteResolvedDb({
        data: {
          id: quote.id || quote.quoteId,
          resolved: nextResolvedState,
        },
      });
      if (res.success) {
        showToast(`Quote #${quote.quoteId} marked as ${nextResolvedState ? "Resolved / Completed" : "Open / Active"}.`);
        await refetch();
      }
    } catch {
      showToast("Could not toggle resolution status.");
    }
  };

  // Delete Quote Handler
  const handleDeleteQuote = async (id: string) => {
    try {
      const res = await deleteQuoteDb({ data: { id } });
      if (res.success) {
        showToast("Quote record deleted.");
        setDeleteConfirmId(null);
        setSelectedQuoteId(null);
        await refetch();
      } else {
        showToast(res.error || "Failed to delete quote.");
      }
    } catch {
      showToast("Error deleting quote record.");
    }
  };

  // Print Official Proposal / Quote Slip
  const handlePrintProposal = (q: QuoteRequest) => {
    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (!printWindow) {
      alert("Please allow popups to generate the printable Proposal.");
      return;
    }

    const itemsHtml = (q.items && q.items.length > 0)
      ? q.items
          .map(
            (it, idx) => `
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${idx + 1}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #0f172a; font-weight: 600;">
                ${it.name || "Commercial Equipment"}
                ${it.brand ? `<div style="font-size: 10px; color: #64748b;">Brand: ${it.brand}</div>` : ""}
                ${it.sku ? `<div style="font-size: 10px; font-family: monospace; color: #94a3b8;">SKU: ${it.sku}</div>` : ""}
              </td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center; color: #0f172a; font-weight: bold;">${it.qty || 1}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; color: #0f172a;">${it.price ? formatUSD(it.price) : "Quoted in Package"}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-weight: bold; color: #0f172a;">${it.price ? formatUSD((it.price || 0) * (it.qty || 1)) : "—"}</td>
            </tr>
          `
          )
          .join("")
      : `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">1</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #0f172a; font-weight: 600;">
            ${q.projectName} — Full Commercial Equipment Package
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Target Completion: ${q.targetCompletionDate}</div>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center; color: #0f172a; font-weight: bold;">1</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; color: #0f172a;">${formatUSD(q.quotedAmount || q.estimatedBudget || 0)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-weight: bold; color: #0f172a;">${formatUSD(q.quotedAmount || q.estimatedBudget || 0)}</td>
        </tr>
      `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Commercial Quote Proposal #${q.quoteId} — Pool Supply Wholesalers</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; background: #ffffff; padding: 36px; line-height: 1.4; }
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
          .totals-table { width: 320px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; border-bottom: 1px solid #f1f5f9; }
          .totals-row.grand-total { font-size: 16px; font-weight: 900; color: #0f172a; border-top: 2px solid #0891b2; border-bottom: none; padding-top: 10px; }
          .proposal-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; }
          .proposal-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1e40af; margin-bottom: 4px; }
          .proposal-text { font-size: 12px; color: #1e3a8a; line-height: 1.5; white-space: pre-wrap; }
          .terms-box { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-bottom: 30px; font-size: 11px; color: #64748b; line-height: 1.6; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 36px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
          .sig-line { border-bottom: 1px solid #0f172a; height: 36px; margin-bottom: 6px; }
          .sig-label { font-size: 11px; font-weight: 700; color: #475569; }
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
              <div class="doc-title">Project Quote Proposal</div>
              <div class="doc-ref">#${q.quoteId}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Date: ${new Date(q.createdAt).toLocaleDateString()}</div>
              <div style="font-size: 11px; color: #0891b2; font-weight: 700; margin-top: 2px;">Valid for 30 Days</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="card">
              <div class="card-title">Commercial Contractor / Client</div>
              <div class="card-value">${q.customerName || "Trade Client"}</div>
              ${q.customerCompany ? `<div class="card-sub"><strong>Company:</strong> ${q.customerCompany}</div>` : ""}
              ${q.customerContractorId ? `<div class="card-sub"><strong>License #:</strong> ${q.customerContractorId}</div>` : ""}
              <div class="card-sub">${q.customerEmail || q.customerIdentifier}</div>
              ${q.customerPhone ? `<div class="card-sub">${q.customerPhone}</div>` : ""}
            </div>

            <div class="card">
              <div class="card-title">Project & Job Site Specifications</div>
              <div class="card-value">${q.projectName}</div>
              ${q.projectLocation ? `<div class="card-sub"><strong>Job Site:</strong> ${q.projectLocation}</div>` : ""}
              <div class="card-sub"><strong>Target Completion:</strong> ${q.targetCompletionDate}</div>
              <div class="card-sub"><strong>Lead Time:</strong> ${q.adminLeadTime || "3-5 Business Days"}</div>
              <div class="card-sub"><strong>Freight:</strong> ${q.adminFreightTerms || "FOB Nashville"}</div>
            </div>
          </div>

          ${q.adminProposalNotes ? `
            <div class="proposal-box">
              <div class="proposal-title">Wholesale Engineering Scope & Proposal Terms</div>
              <div class="proposal-text">${q.adminProposalNotes}</div>
            </div>
          ` : ""}

          ${q.notes ? `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;">
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 3px;">Client Project Scope & Notes</div>
              <div style="font-size: 12px; color: #334155;">"${q.notes}"</div>
            </div>
          ` : ""}

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
                <span>Equipment Subtotal:</span>
                <span>${formatUSD(q.quotedAmount || q.estimatedBudget || 0)}</span>
              </div>
              <div class="totals-row">
                <span>Wholesale Commercial Freight:</span>
                <span>Included / FOB</span>
              </div>
              <div class="totals-row">
                <span>Estimated Sales Tax:</span>
                <span>Exempt / Resale</span>
              </div>
              <div class="totals-row grand-total">
                <span>Total Quoted Proposal:</span>
                <span style="color: #0891b2;">${formatUSD(q.quotedAmount || q.estimatedBudget || 0)}</span>
              </div>
            </div>
          </div>

          <div class="terms-box">
            <strong>Commercial Terms & Conditions:</strong><br/>
            1. All quotations are valid for 30 calendar days from the date issued.<br/>
            2. Factory warranties apply on all genuine OEM parts & commercial systems. Wholesaler guarantees all items are factory direct.<br/>
            3. Delivery timelines are subject to manufacturer lead times. Standard terms net 30 upon trade credit approval.
          </div>

          <div class="signatures">
            <div>
              <div class="sig-line"></div>
              <div class="sig-label">Authorized Wholesaler Representative (Pool Supply Wholesalers)</div>
            </div>
            <div>
              <div class="sig-line"></div>
              <div class="sig-label">Client Acceptance Signature & Date</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 w-full min-w-0 max-w-full overflow-hidden">
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-2xl border border-cyan-500/40 text-xs font-bold flex items-center gap-2 animate-bounce max-w-[90vw]">
          <Sparkles className="size-4 text-cyan-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* ─── TOP BAR BREADCRUMBS & ACTIONS ─── */}
      <div className={`flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200/80 pb-4 sm:pb-5 ${selectedQuoteId ? "hidden lg:flex" : "flex"}`}>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
            <Link to="/admin" className="hover:text-cyan-700 transition">
              Admin Console
            </Link>
            <span>/</span>
            <span className="text-cyan-700">Project Quotes & Bids</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 sm:gap-3">
            <div className="size-8 sm:size-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white grid place-items-center shadow-md shrink-0">
              <FileText className="size-4 sm:size-5" />
            </div>
            <span>Quotes & Bidding Console</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin text-cyan-600" : ""}`} />
            <span>{isRefetching ? "Syncing..." : "Refresh Feed"}</span>
          </button>

          <Link
            to="/admin/returns"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition cursor-pointer"
          >
            <span>Returns & RMA</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── 5-PILLAR METRIC HUD ─── */}
      <div className={`grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 ${selectedQuoteId ? "hidden lg:grid" : "grid"}`}>
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Total Quotes</span>
            <div className="size-6 sm:size-8 rounded-xl bg-slate-100 text-slate-700 grid place-items-center">
              <Layers className="size-3 sm:size-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">{totalQuotesCount}</div>
          <div className="text-[9px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">All project requests</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-amber-200/90 rounded-2xl p-3 sm:p-5 shadow-2xs bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-900">Under Review</span>
            <div className="size-6 sm:size-8 rounded-xl bg-amber-100 text-amber-800 grid place-items-center">
              <Clock className="size-3 sm:size-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-950 tracking-tight">{underReviewCount}</div>
          <div className="text-[9px] sm:text-[11px] font-semibold text-amber-800/80 mt-0.5 truncate">Engineering review</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-cyan-200/90 rounded-2xl p-3 sm:p-5 shadow-2xs bg-gradient-to-br from-white to-cyan-50/40">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-cyan-900">Pricing Ready</span>
            <div className="size-6 sm:size-8 rounded-xl bg-cyan-100 text-cyan-800 grid place-items-center">
              <Send className="size-3 sm:size-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-cyan-950 tracking-tight">{pricingReadyCount}</div>
          <div className="text-[9px] sm:text-[11px] font-semibold text-cyan-800/80 mt-0.5 truncate">Proposals ready</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-emerald-200/90 rounded-2xl p-3 sm:p-5 shadow-2xs bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-900">Accepted</span>
            <div className="size-6 sm:size-8 rounded-xl bg-emerald-100 text-emerald-800 grid place-items-center">
              <Check className="size-3 sm:size-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-950 tracking-tight">{acceptedCount}</div>
          <div className="text-[9px] sm:text-[11px] font-semibold text-emerald-800/80 mt-0.5 truncate">Converted to jobs</div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-5 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Pipeline Value</span>
            <div className="size-6 sm:size-8 rounded-xl bg-cyan-50 text-cyan-700 grid place-items-center">
              <DollarSign className="size-3 sm:size-4" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-black text-slate-900 tracking-tight truncate">{formatUSD(totalPipelineValue)}</div>
          <div className="text-[9px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Cumulative volume</div>
        </div>
      </div>

      {/* ─── LIVE SEARCH & MULTI-FILTER BAR ─── */}
      <div className={`border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 bg-white ${selectedQuoteId ? "hidden lg:flex" : "flex"}`}>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="relative flex-1">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Quote ID, Project, Contractor..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition shadow-2xs"
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 shrink-0 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition cursor-pointer truncate"
            >
              <option value="all">All Statuses ({quotesList.length})</option>
              <option value="Engineering Review">Engineering Review</option>
              <option value="Under Review">Under Review</option>
              <option value="Pricing Ready">Pricing Ready</option>
              <option value="Approved">Approved</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Resolved">Resolved</option>
              <option value="Converted to Order">Converted to Order</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Unresolved only toggle */}
          <button
            onClick={() => setOnlyUnresolved(!onlyUnresolved)}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border shrink-0 ${
              onlyUnresolved
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Clock className="size-3.5" />
            <span>Open Only</span>
          </button>
        </div>
      </div>

      {/* ─── 2-COLUMN MASTER-DETAIL VIEW (Fluid on Mobile) ─── */}
      <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 items-start w-full min-w-0">
        {/* Left Column (5 cols): List of Quotes */}
        <div className={`lg:col-span-5 space-y-3 w-full min-w-0 ${selectedQuoteId ? "hidden lg:block" : "block"}`}>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-400 px-1">
            <span>SHOWING {filteredQuotes.length} PROPOSALS</span>
            <span>SORTED BY DATE</span>
          </div>

          {isLoading ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-8 text-center space-y-3">
              <RefreshCw className="size-6 text-cyan-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading quote proposals...</p>
            </div>
          ) : filteredQuotes.length > 0 ? (
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredQuotes.map((q) => {
                const isSelected = activeQuote && (activeQuote.id === q.id || activeQuote.quoteId === q.quoteId);
                const isResolved = q.isResolved || q.status === "Resolved" || q.status === "Accepted" || q.status === "Converted to Order";

                return (
                  <div
                    key={q.id || q.quoteId}
                    onClick={() => handleSelectQuote(q)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2 active:bg-slate-100 ${
                      isSelected
                        ? "bg-cyan-50/80 border-cyan-500 shadow-sm"
                        : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-mono font-black text-xs text-cyan-800">#{q.quoteId}</span>
                        {isResolved ? (
                          <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Resolved
                          </span>
                        ) : (
                          <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                            {q.status || "Under Review"}
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-black text-slate-900">
                        {formatUSD(q.quotedAmount || q.estimatedBudget || 0)}
                      </span>
                    </div>

                    <div>
                      <div className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">{q.projectName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                        <User className="size-3 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">{q.customerName || "Customer"}</span>
                        {q.customerCompany && <span className="truncate">· {q.customerCompany}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                      <span>Target: {q.targetCompletionDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-slate-400 space-y-3">
              <FileText className="size-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs font-bold text-slate-700">No quote requests found</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                No proposals match your search or filter settings. Clear filters to see all quotes.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Selected Quote Details & Controls */}
        <div className={`lg:col-span-7 w-full min-w-0 max-w-full ${selectedQuoteId ? "block" : "hidden lg:block"}`}>
          {activeQuote ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-7 shadow-2xs space-y-4 sm:space-y-6 w-full min-w-0 max-w-full overflow-hidden">
              {/* Header HUD with Status & Actions + Mobile Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-3.5 sm:pb-5">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setSelectedQuoteId(null)}
                    className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shrink-0 mt-0.5 cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Back</span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs sm:text-base text-cyan-800">#{activeQuote.quoteId}</span>
                      {activeQuote.isResolved ? (
                        <span className="text-[10px] sm:text-xs font-extrabold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                          <Check className="size-3 sm:size-3.5" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs font-extrabold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0">
                          <Clock className="size-3 sm:size-3.5" />
                          <span>{activeQuote.status || "Under Review"}</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight mt-1 truncate">{activeQuote.projectName}</h2>
                    <p className="text-[10px] sm:text-xs text-slate-400">Submitted {new Date(activeQuote.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => handleToggleResolved(activeQuote)}
                    className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                      activeQuote.isResolved
                        ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200"
                    }`}
                  >
                    {activeQuote.isResolved ? (
                      <>
                        <Clock className="size-3.5" />
                        <span>Re-open</span>
                      </>
                    ) : (
                      <>
                        <Check className="size-3.5" />
                        <span>Mark Resolved</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handlePrintProposal(activeQuote)}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition cursor-pointer shadow-xs"
                  >
                    <Printer className="size-3.5 text-cyan-400" />
                    <span>Print Proposal</span>
                  </button>
                </div>
              </div>

              {/* Customer & Job Site Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 sm:space-y-2 min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Client / Contractor Profile</div>
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-2 truncate">
                    <User className="size-3.5 sm:size-4 text-cyan-600 shrink-0" />
                    <span className="truncate">{activeQuote.customerName || "Trade Customer"}</span>
                  </div>
                  {activeQuote.customerCompany && (
                    <div className="text-xs text-slate-600 flex items-center gap-2 truncate">
                      <Building className="size-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{activeQuote.customerCompany}</span>
                    </div>
                  )}
                  <div className="text-xs text-slate-600 flex items-center gap-2 truncate">
                    <Mail className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{activeQuote.customerEmail || activeQuote.customerIdentifier}</span>
                  </div>
                  {activeQuote.customerPhone && (
                    <div className="text-xs text-slate-600 flex items-center gap-2 truncate">
                      <Phone className="size-3.5 text-slate-400 shrink-0" />
                      <span>{activeQuote.customerPhone}</span>
                    </div>
                  )}
                  {activeQuote.customerContractorId && (
                    <div className="text-xs font-semibold text-slate-700 truncate">
                      License #: <span className="font-mono font-bold text-slate-900">{activeQuote.customerContractorId}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 sm:space-y-2 min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Project Details</div>
                  {activeQuote.projectLocation && (
                    <div className="text-xs text-slate-700 flex items-center gap-2 truncate">
                      <MapPin className="size-3.5 text-cyan-600 shrink-0" />
                      <span className="truncate"><strong>Location:</strong> {activeQuote.projectLocation}</span>
                    </div>
                  )}
                  <div className="text-xs text-slate-700 flex items-center gap-2 truncate">
                    <Calendar className="size-3.5 text-cyan-600 shrink-0" />
                    <span className="truncate"><strong>Target:</strong> {activeQuote.targetCompletionDate}</span>
                  </div>
                  <div className="text-xs text-slate-700 flex items-center gap-2 truncate">
                    <DollarSign className="size-3.5 text-cyan-600 shrink-0" />
                    <span className="truncate"><strong>Customer Budget:</strong> {formatUSD(activeQuote.estimatedBudget || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Requested Scope & Items List */}
              <div className="space-y-2.5 sm:space-y-3 w-full min-w-0">
                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">Requested Bill of Materials (BOM)</div>
                {activeQuote.items && activeQuote.items.length > 0 ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 w-full min-w-0">
                    {activeQuote.items.map((it: any, idx: number) => (
                      <div key={idx} className="p-2.5 sm:p-3 bg-white flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs min-w-0">
                        <div className="flex items-start xs:items-center gap-2 min-w-0 flex-1">
                          <span className="size-5 sm:size-6 rounded-lg bg-slate-100 text-slate-600 font-mono font-bold grid place-items-center text-[9px] sm:text-[10px] shrink-0 mt-0.5 xs:mt-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-slate-900 text-xs leading-snug break-words">{it.name || "Equipment Unit"}</div>
                            {it.brand && <div className="text-[10px] text-slate-400 truncate">{it.brand}</div>}
                          </div>
                        </div>
                        <div className="flex xs:flex-col items-center xs:items-end justify-between xs:justify-center shrink-0 pl-7 xs:pl-0 border-t xs:border-t-0 pt-1.5 xs:pt-0 border-slate-100">
                          <div className="font-black text-slate-900 text-xs whitespace-nowrap">Qty: {it.qty || 1}</div>
                          {it.price && <div className="text-[10px] text-slate-500 whitespace-nowrap">{formatUSD(it.price)} ea</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    Package Proposal: All requested system components included under project scope.
                  </div>
                )}

                {activeQuote.notes && (
                  <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1 min-w-0 overflow-hidden">
                    <div className="font-bold text-amber-950">Contractor Project Scope & Requirements:</div>
                    <div className="text-amber-900 whitespace-pre-wrap leading-relaxed break-words">"{activeQuote.notes}"</div>
                  </div>
                )}
              </div>

              {/* Admin Quote Pricing & Scope Control Form */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-3.5 sm:space-y-4 w-full min-w-0 max-w-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 sm:gap-2">
                    <DollarSign className="size-4 text-cyan-400 shrink-0" />
                    <span>Pricing & Scope Controls</span>
                  </h3>
                  <span className="text-[9px] sm:text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Live DB Sync</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
                  {/* Quoted Amount */}
                  <div className="space-y-1 min-w-0">
                    <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-300">Quoted Package Price ($ USD)</label>
                    <div className="relative">
                      <DollarSign className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        step="0.01"
                        value={editQuotedAmount}
                        onChange={(e) => setEditQuotedAmount(e.target.value)}
                        placeholder="e.g. 14500.00"
                        className="w-full min-w-0 max-w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="space-y-1 min-w-0">
                    <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-300">Lifecycle Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full min-w-0 max-w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer truncate"
                    >
                      <option value="Engineering Review">Engineering Review</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Pricing Ready">Pricing Ready</option>
                      <option value="Approved">Approved</option>
                      <option value="Accepted">Accepted (Customer Agreed)</option>
                      <option value="Converted to Order">Converted to Order</option>
                      <option value="Resolved">Resolved / Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Lead Time */}
                  <div className="space-y-1 min-w-0">
                    <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-300">Estimated Lead Time / ETA</label>
                    <input
                      type="text"
                      value={editLeadTime}
                      onChange={(e) => setEditLeadTime(e.target.value)}
                      placeholder="e.g. 3-5 Business Days"
                      className="w-full min-w-0 max-w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Freight Terms */}
                  <div className="space-y-1 min-w-0">
                    <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-300">Freight & Logistics Terms</label>
                    <input
                      type="text"
                      value={editFreightTerms}
                      onChange={(e) => setEditFreightTerms(e.target.value)}
                      placeholder="e.g. FOB Nashville / Prepaid Freight"
                      className="w-full min-w-0 max-w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                {/* Proposal Notes (Visible on Proposal) */}
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-300">
                    Proposal Remarks (Visible on Printable Quote)
                  </label>
                  <textarea
                    rows={3}
                    value={editProposalNotes}
                    onChange={(e) => setEditProposalNotes(e.target.value)}
                    placeholder="Include detailed specifications, model numbers, pipe sizes, voltage requirements..."
                    className="w-full min-w-0 max-w-full p-2.5 sm:p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                  />
                </div>

                {/* Internal Admin Notes */}
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] sm:text-[11px] font-extrabold text-slate-300">Internal Admin Notes (Private)</label>
                  <textarea
                    rows={2}
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    placeholder="Add internal wholesale supplier notes, margin calculations..."
                    className="w-full min-w-0 max-w-full p-2.5 sm:p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                  />
                </div>

                {/* Submit & Delete actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                  <button
                    onClick={() => setDeleteConfirmId(activeQuote.id || activeQuote.quoteId)}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-extrabold text-rose-400 hover:text-rose-300 transition cursor-pointer py-1"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Quote</span>
                  </button>

                  <button
                    onClick={handleSaveChanges}
                    disabled={isUpdating}
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="size-3.5" />
                    <span>{isUpdating ? "Saving..." : "Save & Update Quote"}</span>
                  </button>
                </div>
              </div>

              {/* Delete Confirmation Modal */}
              {deleteConfirmId && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2.5">
                  <div className="flex items-center gap-2 font-black text-xs text-rose-900">
                    <AlertCircle className="size-4 text-rose-600" />
                    <span>Confirm Permanent Deletion</span>
                  </div>
                  <p className="text-xs text-rose-800">
                    Are you sure you want to permanently delete Quote #{activeQuote.quoteId}? This action cannot be undone.
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteQuote(deleteConfirmId)}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer"
                    >
                      Yes, Delete Record
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center text-slate-400 space-y-3">
              <FileText className="size-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">Select a quote to view proposal details</p>
              <p className="text-xs text-slate-400">Pick any commercial proposal from the list to review specifications and set pricing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
