import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Clock,
  LogOut,
  ChevronRight,
  ShoppingBag,
  User,
  Heart,
  CreditCard,
  Settings,
  Receipt,
  FileText,
  RotateCcw,
  Repeat,
  ListPlus,
  ShieldCheck,
  MapPin,
  Mail,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Download,
  Building,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Eye,
  Search,
  Filter,
  Check,
  AlertCircle,
  Truck,
  DollarSign,
  Briefcase,
  Layers,
  Phone,
  Bookmark,
  Calendar,
  Zap,
  Camera,
  Upload,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/components/site/auth-context";
import { useCart, formatUSD } from "@/components/site/cart-context";
import { useProducts, Product, getProductImage, products as catalogProducts } from "@/lib/products";
import {
  getCustomerAccountDataDb,
  updateCustomerProfileDb,
  uploadCustomerAvatarDb,
  updateCustomerPasswordDb,
  saveCustomerAddressDb,
  deleteCustomerAddressDb,
  saveCustomerCardDb,
  deleteCustomerCardDb,
  updateCustomerEmailPrefsDb,
  createReturnRequestDb,
  updateCustomerWishlistsDb,
} from "@/lib/api/customers.functions";
import { createQuoteRequestDb } from "@/lib/api/quotes.functions";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Commercial Account — Pool Supply Wholesalers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountPage,
});

type TabType =
  | "overview"
  | "purchases-history"
  | "purchases-returns"
  | "purchases-reorder"
  | "purchases-quotes"
  | "wishlist-all"
  | "wishlist-my"
  | "billing-invoices"
  | "billing-history"
  | "billing-statement"
  | "settings-profile"
  | "settings-email"
  | "settings-address"
  | "settings-cards"
  | "settings-password";

function AccountPage() {
  const { user, login, logout, updateUser, openAuthModal } = useAuth();
  const { products } = useProducts();
  const cart = useCart();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Avatar Upload State
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Account Data
  const [profile, setProfile] = useState<any>({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    company: "",
    contractorId: "",
    addresses: [],
    cards: [],
    emailPrefs: {
      orderUpdates: true,
      freightTracking: true,
      promoAlerts: true,
      catalogDigest: false,
      invoiceReceipts: true,
    },
    wishlists: {
      "Default Wishlist": [],
    },
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);

  // Filter State
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [searchOrderQuery, setSearchOrderQuery] = useState("");

  // Modals & Sub-states
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [statementPeriod, setStatementPeriod] = useState<"1m"|"2m"|"3m"|"6m"|"ytd"|"all"|"custom">("3m");
  const [statementFrom, setStatementFrom] = useState("");
  const [statementTo, setStatementTo] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeWishlistName, setActiveWishlistName] = useState<string>("Default Wishlist");
  const [newListName, setNewListName] = useState("");
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);

  // Form States
  const [profileForm, setProfileForm] = useState({ name: "", company: "", phone: "", email: "", contractorId: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [addressForm, setAddressForm] = useState({
    title: "Primary Commercial Warehouse",
    recipientName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    type: "shipping" as "shipping" | "billing" | "both",
    isDefault: true,
  });
  const [cardForm, setCardForm] = useState({
    cardholderName: "",
    brand: "Visa Commercial",
    cardNumber: "",
    expMonth: "08",
    expYear: "28",
    isDefault: true,
  });
  const [returnForm, setReturnForm] = useState({
    orderId: "",
    reason: "Damaged in Freight Transit",
    notes: "",
    preferredResolution: "Replacement Unit",
  });
  const [quoteForm, setQuoteForm] = useState({
    projectName: "",
    projectLocation: "",
    targetCompletionDate: "Next 30 Days",
    estimatedBudget: "",
    notes: "",
  });

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch account data
  const loadAccountData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const identifier = user.email || user.phone || "";
      const res = await getCustomerAccountDataDb({ data: { identifier } });
      if (res.success && res.profile) {
        setProfile(res.profile);
        if (res.profile.avatar && res.profile.avatar !== user.avatar) {
          updateUser({ avatar: res.profile.avatar });
        }
        setOrders(res.orders || []);
        setReturns(res.returns || []);
        setQuotes(res.quotes || []);
        setProfileForm({
          name: res.profile.name || user.name || "",
          company: res.profile.company || "",
          phone: res.profile.phone || user.phone || "",
          email: res.profile.email || user.email || "",
          contractorId: res.profile.contractorId || "",
        });

        // Ensure active wishlist exists
        const listKeys = Object.keys(res.profile.wishlists || {});
        if (listKeys.length > 0 && !listKeys.includes(activeWishlistName)) {
          setActiveWishlistName(listKeys[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load account data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, [user]);

  // Derived Metrics
  const lifetimeSpent = useMemo(() => orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);

  const statementOrders = useMemo(() => {
    const now = new Date();
    let from: Date | null = null;
    let to: Date | null = null;

    if (statementPeriod === "1m") {
      from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else if (statementPeriod === "2m") {
      from = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    } else if (statementPeriod === "3m") {
      from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    } else if (statementPeriod === "6m") {
      from = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    } else if (statementPeriod === "ytd") {
      from = new Date(now.getFullYear(), 0, 1);
    } else if (statementPeriod === "custom") {
      from = statementFrom ? new Date(statementFrom) : null;
      to   = statementTo   ? new Date(statementTo)   : null;
    }

    return orders.filter((o) => {
      const d = new Date(o.placedAt);
      if (from && d < from) return false;
      if (to   && d > to)   return false;
      return true;
    });
  }, [orders, statementPeriod, statementFrom, statementTo]);

  const statementTotal = useMemo(
    () => statementOrders.reduce((sum, o) => sum + (o.total || 0), 0),
    [statementOrders]
  );

  const allOrderedItems = useMemo(() => {
    const map = new Map<string, any>();
    orders.forEach((o) => {
      (o.items || []).forEach((it: any) => {
        const key = it.id || it.name;
        if (!map.has(key)) {
          const matched = products.find((p) => p.id === it.id);
          map.set(key, {
            ...it,
            img: it.img || matched?.img || "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&q=80",
            brand: it.brand || matched?.brand || "Pool Supply Wholesalers",
            lastOrdered: o.placedAt,
          });
        }
      });
    });

    // If customer has no purchase history yet, show top catalog products for reordering convenience
    if (map.size === 0) {
      products.slice(0, 6).forEach((p) => {
        map.set(p.id, {
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          img: p.img,
          qty: 1,
          lastOrdered: new Date().toISOString(),
        });
      });
    }

    return Array.from(map.values());
  }, [orders, products]);

  // ── Print Statement in isolated new window ──────────────────────────────
  const printStatement = () => {
    const periodLabel =
      statementPeriod === "1m" ? "Last 30 Days" :
      statementPeriod === "2m" ? "Last 2 Months" :
      statementPeriod === "3m" ? "Last 3 Months" :
      statementPeriod === "6m" ? "Last 6 Months" :
      statementPeriod === "ytd" ? "Year to Date" :
      statementPeriod === "all" ? "All Time" :
      `${statementFrom || "—"} to ${statementTo || "—"}`;

    const rows = statementOrders.map((o, idx) => `
      <tr style="background:${idx % 2 === 0 ? "#ffffff" : "#f8fafc"}">
        <td style="padding:9px 12px;color:#475569;font-size:12px;">${new Date(o.placedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</td>
        <td style="padding:9px 12px;font-family:monospace;font-weight:700;font-size:12px;">#${o.id}</td>
        <td style="padding:9px 12px;color:#475569;font-size:11px;max-width:200px;">${(o.items||[]).slice(0,2).map((it:any)=>it.name).join(", ")}${(o.items||[]).length > 2 ? ` +${(o.items||[]).length-2} more` : ""}</td>
        <td style="padding:9px 12px;text-align:center;font-size:12px;color:#475569;">${(o.items||[]).length}</td>
        <td style="padding:9px 12px;text-align:center;font-size:11px;font-weight:700;color:#059669;">${o.status||"Paid"}</td>
        <td style="padding:9px 12px;text-align:right;font-weight:700;font-size:13px;">$${(o.total||0).toFixed(2)}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Account Statement — Pool Supply Wholesalers</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0f172a; background: white; padding: 48px 56px; }
    @media print { body { padding: 24px 36px; } }
    h1 { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 28px; border-bottom: 2px solid #e2e8f0; margin-bottom: 28px; }
    .logo { height: 64px; width: auto; object-fit: contain; }
    .header-right { text-align: right; }
    .header-right h1 { color: #0f172a; }
    .header-right .sub { color: #64748b; font-size: 13px; margin-top: 4px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 24px 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 24px; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 6px; }
    .val { font-weight: 700; font-size: 14px; color: #0f172a; }
    .val-sm { font-size: 13px; color: #475569; margin-top: 2px; }
    .summary { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 28px; }
    .summary-box { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; text-align: center; }
    .summary-box .num { font-size: 22px; font-weight: 900; margin-top: 4px; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 2px solid #0f172a; }
    thead th { padding: 8px 12px; font-weight: 700; font-size: 11px; text-align: left; }
    tfoot tr { border-top: 2px solid #0f172a; }
    tfoot td { padding: 12px 12px; font-weight: 900; font-size: 14px; }
    .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    <img class="logo" src="${window.location.origin}/logo.png" alt="Pool Supply Wholesalers"/>
    <div class="header-right">
      <h1>Account Statement</h1>
      <div class="sub">Generated ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
      <div class="sub">Period: <strong>${periodLabel}</strong></div>
    </div>
  </div>

  <div class="grid2">
    <div>
      <div class="label">From</div>
      <div class="val">Pool Supply Wholesalers</div>
      <div class="val-sm">Commercial Accounts &amp; Wholesale Distribution</div>
      <div class="val-sm">Nashville, Tennessee 37201</div>
      <div class="val-sm">+1 (615) 477-0407</div>
      <div class="val-sm">sales@poolsupplywholesalers.com</div>
    </div>
    <div>
      <div class="label">Prepared For</div>
      <div class="val">${user?.name || ""}</div>
      ${profile?.company ? `<div class="val-sm">${profile.company}</div>` : ""}
      <div class="val-sm">${user?.email || user?.phone || ""}</div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-box">
      <div class="label">Total Orders</div>
      <div class="num" style="color:#0f172a;">${statementOrders.length}</div>
    </div>
    <div class="summary-box" style="background:#eff6ff;border-color:#bfdbfe;">
      <div class="label" style="color:#3b82f6;">Total Spent</div>
      <div class="num" style="color:#1e40af;">$${statementTotal.toFixed(2)}</div>
    </div>
    <div class="summary-box" style="background:#f0fdf4;border-color:#bbf7d0;">
      <div class="label" style="color:#22c55e;">Avg Order</div>
      <div class="num" style="color:#166534;">${statementOrders.length > 0 ? "$" + (statementTotal / statementOrders.length).toFixed(2) : "$0.00"}</div>
    </div>
  </div>

  <div class="section-title">Order Detail</div>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Order #</th><th>Description</th>
        <th style="text-align:center;">Items</th><th style="text-align:center;">Status</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5" style="text-align:right;padding-right:12px;">Statement Total</td>
        <td style="text-align:right;">$${statementTotal.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <div><strong>Pool Supply Wholesalers</strong><br/>sales@poolsupplywholesalers.com · (615) 477-0407</div>
    <div style="text-align:right;">This statement is for reference only and does not constitute an invoice.<br/>Page 1 of 1</div>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  // ── Print Official Quote Proposal in isolated new window ─────────────────
  const printQuote = (q: any) => {
    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (!printWindow) {
      alert("Please allow popups to print your Quote Proposal.");
      return;
    }

    const itemsHtml = (q.items && q.items.length > 0)
      ? q.items
          .map(
            (it: any, idx: number) => `
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${idx + 1}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #0f172a; font-weight: 600;">
                ${it.name || "Commercial Equipment"}
                ${it.brand ? `<div style="font-size: 10px; color: #64748b;">Brand: ${it.brand}</div>` : ""}
              </td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center; color: #0f172a; font-weight: bold;">${it.qty || 1}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; color: #0f172a;">${it.price ? "$" + Number(it.price).toFixed(2) : "Quoted in Package"}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-weight: bold; color: #0f172a;">${it.price ? "$" + (Number(it.price) * (it.qty || 1)).toFixed(2) : "—"}</td>
            </tr>
          `
          )
          .join("")
      : `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">1</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #0f172a; font-weight: 600;">
            ${q.projectName} — Full Commercial Equipment Package
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Target Completion: ${q.targetCompletionDate || "30 Days"}</div>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center; color: #0f172a; font-weight: bold;">1</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; color: #0f172a;">$${Number(q.quotedAmount || q.totalAmount || q.estimatedBudget || 0).toFixed(2)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-weight: bold; color: #0f172a;">$${Number(q.quotedAmount || q.totalAmount || q.estimatedBudget || 0).toFixed(2)}</td>
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
              <div class="card-value">${user?.name || profile?.name || "Trade Client"}</div>
              ${profile?.company ? `<div class="card-sub"><strong>Company:</strong> ${profile.company}</div>` : ""}
              ${profile?.contractorId ? `<div class="card-sub"><strong>License #:</strong> ${profile.contractorId}</div>` : ""}
              <div class="card-sub">${user?.email || user?.phone || ""}</div>
              ${user?.phone ? `<div class="card-sub">${user.phone}</div>` : ""}
            </div>

            <div class="card">
              <div class="card-title">Project & Job Site Specifications</div>
              <div class="card-value">${q.projectName}</div>
              ${q.projectLocation ? `<div class="card-sub"><strong>Job Site:</strong> ${q.projectLocation}</div>` : ""}
              <div class="card-sub"><strong>Target Completion:</strong> ${q.targetCompletionDate || "30 Days"}</div>
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
                <span>$${Number(q.quotedAmount || q.totalAmount || q.estimatedBudget || 0).toFixed(2)}</span>
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
                <span style="color: #0891b2;">$${Number(q.quotedAmount || q.totalAmount || q.estimatedBudget || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="terms-box">
            <strong>Commercial Terms & Conditions:</strong><br/>
            1. All quotations are valid for 30 calendar days from the date issued.<br/>
            2. Factory warranties apply on all genuine OEM parts & commercial systems.<br/>
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

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== "all" && o.status?.toLowerCase() !== orderStatusFilter.toLowerCase()) {
        return false;
      }
      if (searchOrderQuery.trim()) {
        const q = searchOrderQuery.toLowerCase();
        const idMatch = (o.id || "").toLowerCase().includes(q);
        const itemMatch = (o.items || []).some((it: any) => (it.name || "").toLowerCase().includes(q));
        return idMatch || itemMatch;
      }
      return true;
    });
  }, [orders, orderStatusFilter, searchOrderQuery]);

  // Active Wishlist Items
  const activeWishlistItems = useMemo(() => {
    const list = profile.wishlists?.[activeWishlistName] || [];
    if (list.length > 0) return list;
    return products.slice(0, 3).map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      img: p.img,
    }));
  }, [profile.wishlists, activeWishlistName, products]);

  const handleQuickDemoLogin = () => {
    login(
      {
        name: "Michael Miller",
        email: "michael.miller@aquapoolpros.com",
        phone: "+1 (615) 555-0199",
      },
      "demo-token-" + Date.now()
    );
    triggerToast("Logged in as Michael Miller (Commercial Contractor)");
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      triggerToast("Please select a valid image file (PNG, JPG, WebP, GIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      triggerToast("Image file size must be under 10MB.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // 1. Read file as base64 data URL
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // 2. Upload to Cloudinary via server function
      const identifier = user.email || user.phone || "";
      const res = await uploadCustomerAvatarDb({
        data: {
          identifier,
          fileData: base64Data,
        },
      });

      if (res.success && res.avatarUrl) {
        setProfile((prev: any) => ({ ...prev, avatar: res.avatarUrl }));
        updateUser({ avatar: res.avatarUrl });
        triggerToast("Profile photo updated and synced with Cloudinary!");
      } else {
        triggerToast(res.error || "Failed to upload profile photo.");
      }
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      triggerToast("Failed to upload profile image. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setIsUploadingAvatar(true);
    try {
      const identifier = user.email || user.phone || "";
      const res = await updateCustomerProfileDb({
        data: {
          identifier,
          avatar: "",
        },
      });
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, avatar: "" }));
        updateUser({ avatar: "" });
        triggerToast("Profile photo removed.");
      } else {
        triggerToast("Failed to remove profile photo.");
      }
    } catch {
      triggerToast("Failed to remove profile photo.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await updateCustomerProfileDb({
        data: {
          identifier: user.email || user.phone || "",
          ...profileForm,
        },
      });
      if (res.success) {
        if (profileForm.name && profileForm.name !== user.name) {
          updateUser({ name: profileForm.name });
        }
        triggerToast("Profile information updated successfully.");
        loadAccountData();
      }
    } catch {
      triggerToast("Error updating profile.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerToast("New passwords do not match.");
      return;
    }
    try {
      const res = await updateCustomerPasswordDb({
        data: {
          identifier: user?.email || user?.phone || "",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      if (res.success) {
        triggerToast("Password updated successfully.");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        triggerToast(res.error || "Failed to update password.");
      }
    } catch {
      triggerToast("Error updating password.");
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await saveCustomerAddressDb({
        data: {
          identifier: user?.email || user?.phone || "",
          address: {
            ...addressForm,
            recipientName: addressForm.recipientName || profile.name || user?.name || "Contractor",
          },
        },
      });
      if (res.success) {
        triggerToast("Address saved to address book.");
        setIsAddressModalOpen(false);
        setAddressForm({
          title: "Primary Commercial Warehouse",
          recipientName: "",
          line1: "",
          line2: "",
          city: "",
          state: "",
          zip: "",
          country: "United States",
          type: "shipping",
          isDefault: true,
        });
        loadAccountData();
      }
    } catch {
      triggerToast("Error saving address.");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteCustomerAddressDb({
        data: { identifier: user?.email || user?.phone || "", addressId },
      });
      triggerToast("Address removed.");
      loadAccountData();
    } catch {
      triggerToast("Error removing address.");
    }
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = cardForm.cardNumber.replace(/\s+/g, "");
    const last4 = cleanNum.slice(-4) || "8824";
    try {
      const res = await saveCustomerCardDb({
        data: {
          identifier: user?.email || user?.phone || "",
          card: {
            cardholderName: cardForm.cardholderName || profile.name || user?.name || "Contractor",
            brand: cardForm.brand,
            last4,
            expMonth: cardForm.expMonth,
            expYear: cardForm.expYear,
            isDefault: cardForm.isDefault,
          },
        },
      });
      if (res.success) {
        triggerToast("Payment card saved securely.");
        setIsCardModalOpen(false);
        setCardForm({
          cardholderName: "",
          brand: "Visa Commercial",
          cardNumber: "",
          expMonth: "08",
          expYear: "28",
          isDefault: true,
        });
        loadAccountData();
      }
    } catch {
      triggerToast("Error saving payment method.");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCustomerCardDb({
        data: { identifier: user?.email || user?.phone || "", cardId },
      });
      triggerToast("Payment card removed.");
      loadAccountData();
    } catch {
      triggerToast("Error deleting card.");
    }
  };

  const handleToggleEmailPref = async (key: string) => {
    const nextPrefs = { ...profile.emailPrefs, [key]: !profile.emailPrefs[key] };
    setProfile({ ...profile, emailPrefs: nextPrefs });
    await updateCustomerEmailPrefsDb({
      data: { identifier: user?.email || user?.phone || "", prefs: nextPrefs },
    });
    triggerToast("Email preference updated.");
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnForm.orderId) {
      triggerToast("Please select an order ID for return.");
      return;
    }
    const orderObj = orders.find((o) => o.id === returnForm.orderId);
    const returnItems = orderObj ? orderObj.items : [{ id: "item-1", name: "Commercial Equipment Unit", qty: 1 }];

    try {
      const res = await createReturnRequestDb({
        data: {
          customerIdentifier: user?.email || user?.phone || "",
          customerName: user?.name || profile?.name || "Trade Customer",
          customerEmail: user?.email || profile?.email || "",
          customerPhone: user?.phone || profile?.phone || "",
          customerCompany: profile?.company || "",
          orderId: returnForm.orderId,
          orderTotal: orderObj?.total || 0,
          orderPlacedAt: orderObj?.placedAt,
          reason: returnForm.reason,
          notes: returnForm.notes,
          items: returnItems,
          preferredResolution: returnForm.preferredResolution || "Replacement Unit",
        },
      });
      if (res.success) {
        triggerToast(`RMA Request ${res.rmaId} submitted successfully.`);
        setIsReturnModalOpen(false);
        setReturnForm({
          orderId: "",
          reason: "Damaged in Freight Transit",
          notes: "",
          preferredResolution: "Replacement Unit",
        });
        loadAccountData();
      }
    } catch {
      triggerToast("Error submitting RMA return.");
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const budgetNum = quoteForm.estimatedBudget.trim() ? parseFloat(quoteForm.estimatedBudget) : undefined;
      const sampleItems = products.slice(0, 2).map((p) => ({ id: p.id, name: p.name, price: p.price, qty: 1 }));
      const res = await createQuoteRequestDb({
        data: {
          customerIdentifier: user?.email || user?.phone || "",
          customerName: user?.name || profile?.name || "Trade Client",
          customerEmail: user?.email || profile?.email || "",
          customerPhone: user?.phone || profile?.phone || "",
          customerCompany: profile?.company || "",
          customerContractorId: profile?.contractorId || "",
          projectName: quoteForm.projectName || "Commercial Pool Facility Retrofit",
          projectLocation: quoteForm.projectLocation,
          targetCompletionDate: quoteForm.targetCompletionDate || "Next 30 Days",
          estimatedBudget: budgetNum,
          notes: quoteForm.notes,
          items: sampleItems,
        },
      });
      if (res.success) {
        triggerToast(`Quote request #${res.quoteId} submitted for engineering review.`);
        setIsQuoteModalOpen(false);
        setQuoteForm({
          projectName: "",
          projectLocation: "",
          targetCompletionDate: "Next 30 Days",
          estimatedBudget: "",
          notes: "",
        });
        loadAccountData();
      }
    } catch {
      triggerToast("Error submitting quote.");
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const currentLists = profile.wishlists || {};
    const updatedLists = { ...currentLists, [newListName.trim()]: [] };
    setProfile({ ...profile, wishlists: updatedLists });
    setActiveWishlistName(newListName.trim());
    setIsCreateListModalOpen(false);
    setNewListName("");
    await updateCustomerWishlistsDb({
      data: { identifier: user?.email || user?.phone || "", wishlists: updatedLists },
    });
    triggerToast(`Created list "${newListName.trim()}".`);
  };

  const handleDeleteWishlistItem = async (itemId: string) => {
    const currentLists = profile.wishlists || {};
    const currentItems = currentLists[activeWishlistName] || [];
    const updatedItems = currentItems.filter((it: any) => it.id !== itemId);
    const updatedLists = { ...currentLists, [activeWishlistName]: updatedItems };
    setProfile({ ...profile, wishlists: updatedLists });
    await updateCustomerWishlistsDb({
      data: { identifier: user?.email || user?.phone || "", wishlists: updatedLists },
    });
    triggerToast("Item removed from list.");
  };

  const handleReorder = (item: any) => {
    const matchedProduct = products.find((p) => p.id === item.id);
    if (matchedProduct) {
      cart.add(matchedProduct, item.qty || 1);
    } else {
      cart.add(
        {
          id: item.id || `reorder-${Date.now()}`,
          name: item.name,
          brand: item.brand || "Pool Supply Wholesalers",
          price: item.price || 999,
          img: item.img || "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&q=80",
        },
        item.qty || 1
      );
    }
    triggerToast(`Added ${item.name} (x${item.qty || 1}) to wholesale cart.`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-cyan-500/20">
        <Header alwaysDark />
        <main className="flex-1 pt-28 sm:pt-36 pb-16 sm:pb-24 flex items-center justify-center px-4 sm:px-6">
          <div className="max-w-md w-full rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-cyan-500/20 bg-gradient-to-br from-[#061220] via-[#091f38] to-[#040d1a] text-white text-center shadow-2xl space-y-5 sm:space-y-6">
            <div className="size-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 grid place-items-center mx-auto shadow-inner">
              <ShieldCheck className="size-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Wholesale Account Portal</h1>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Sign in to manage commercial equipment purchases, track freight logistics, view tax invoices, and manage contractor quotes.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => openAuthModal("login")}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-900/30 transition cursor-pointer"
              >
                Sign In to Account
              </button>

              <button
                onClick={handleQuickDemoLogin}
                className="w-full py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="size-3.5" />
                <span>Quick Sign-In (Michael Miller)</span>
              </button>

              <button
                onClick={() => openAuthModal("register")}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Create Contractor Account
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-cyan-500/20">
      <Header alwaysDark />

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 bg-[#061220] text-white px-5 py-3 rounded-2xl flex items-center gap-2.5 shadow-2xl text-xs font-bold border border-cyan-500/30 backdrop-blur-md"
          >
            <CheckCircle2 className="size-4 text-cyan-400" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 space-y-8">
          {/* ─── EXECUTIVE ACCOUNT HERO BANNER ─── */}
          <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-cyan-500/20 bg-gradient-to-br from-[#061220] via-[#091f38] to-[#040d1a] text-white shadow-xl">
            <div
              className="absolute top-0 right-1/4 w-[450px] h-[450px] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
                filter: "blur(50px)",
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group shrink-0">
                  <div className="size-18 sm:size-20 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 p-0.5 shadow-lg overflow-hidden">
                    <div className="size-full bg-[#061220] rounded-full grid place-items-center relative overflow-hidden">
                      {isUploadingAvatar ? (
                        <div className="size-full flex flex-col items-center justify-center gap-1 bg-[#061220]/90">
                          <Loader2 className="size-6 text-cyan-400 animate-spin" />
                          <span className="text-[8.5px] font-bold text-cyan-300 uppercase">Saving</span>
                        </div>
                      ) : profile.avatar || user.avatar ? (
                        <img
                          src={profile.avatar || user.avatar}
                          alt={user.name}
                          className="size-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="size-8 sm:size-9 text-cyan-300" />
                      )}
                    </div>
                  </div>

                  {/* Camera overlay button to trigger file picker */}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-0.5 -right-0.5 size-7 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-90 text-white shadow-md grid place-items-center transition cursor-pointer border-2 border-[#061220] disabled:opacity-50"
                    title="Upload profile picture"
                    aria-label="Upload profile picture"
                  >
                    <Camera className="size-3.5" />
                  </button>

                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    className="hidden"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{user.name}</h1>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {user.email || user.phone} {profile.company ? `· ${profile.company}` : ""}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <ShieldCheck className="size-3.5 text-cyan-400" />
                    <span>Tier-1 Wholesale Pricing Active · Multi-Hub Freight Enabled</span>
                  </p>
                </div>
              </div>

              {/* Quick HUD Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
                <div className="p-3 px-3.5 sm:px-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</div>
                  <div className="text-base sm:text-lg font-black text-white mt-0.5">{orders.length}</div>
                </div>

                <div className="p-3 px-3.5 sm:px-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Lifetime Volume</div>
                  <div className="text-base sm:text-lg font-black text-cyan-300 mt-0.5 truncate">{formatUSD(lifetimeSpent)}</div>
                </div>

                <div className="p-3 px-3.5 sm:px-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Active Quotes</div>
                  <div className="text-base sm:text-lg font-black text-emerald-300 mt-0.5">{quotes.length}</div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    window.location.href = "/";
                  }}
                  className="p-3 px-3.5 sm:px-4 rounded-2xl bg-white/10 hover:bg-rose-500/20 hover:border-rose-500/40 border border-white/15 text-white transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer col-span-2 sm:col-span-1"
                  title="Sign Out"
                >
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── MOBILE / TABLET HORIZONTAL TAB NAVIGATION (VISIBLE ON < LG) ─── */}
          <div className="lg:hidden space-y-3">
            {/* Mobile Category Dropdown Selector */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white grid place-items-center shrink-0 shadow-xs">
                  {activeTab === "overview" && <Layers className="size-4" />}
                  {activeTab.startsWith("purchases") && <Package className="size-4" />}
                  {activeTab.startsWith("wishlist") && <Heart className="size-4" />}
                  {activeTab.startsWith("billing") && <Receipt className="size-4" />}
                  {activeTab.startsWith("settings") && <Settings className="size-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Section</div>
                  <div className="text-xs font-extrabold text-slate-900 truncate capitalize">
                    {activeTab.replace("-", " › ")}
                  </div>
                </div>
              </div>

              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabType)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition cursor-pointer"
              >
                <optgroup label="Overview">
                  <option value="overview">Account Dashboard</option>
                </optgroup>
                <optgroup label="Purchases">
                  <option value="purchases-history">Purchase History ({orders.length})</option>
                  <option value="purchases-returns">Returns ({returns.length})</option>
                  <option value="purchases-reorder">Reorder Items ({allOrderedItems.length})</option>
                  <option value="purchases-quotes">Quotes ({quotes.length})</option>
                </optgroup>
                <optgroup label="Wishlists">
                  <option value="wishlist-all">All Lists ({Object.keys(profile.wishlists || {}).length})</option>
                  <option value="wishlist-my">My List ({activeWishlistItems.length})</option>
                </optgroup>
                <optgroup label="Billing">
                  <option value="billing-invoices">Invoices ({orders.length})</option>
                  <option value="billing-history">Transaction History</option>
                  <option value="billing-statement">Print Statement</option>
                </optgroup>
                <optgroup label="Settings">
                  <option value="settings-profile">Profile Information</option>
                  <option value="settings-email">Email Preferences</option>
                  <option value="settings-address">Address Book ({(profile.addresses || []).length})</option>
                  <option value="settings-cards">Credit Cards ({(profile.cards || []).length})</option>
                  <option value="settings-password">Update Password</option>
                </optgroup>
              </select>
            </div>

            {/* Mobile Scrollable Horizontal Pill Strip */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
              {[
                { id: "overview", label: "Dashboard", icon: Layers },
                { id: "purchases-history", label: "Orders", icon: Package, count: orders.length },
                { id: "purchases-quotes", label: "Quotes", icon: FileText, count: quotes.length },
                { id: "purchases-returns", label: "Returns", icon: RotateCcw, count: returns.length },
                { id: "purchases-reorder", label: "Reorder", icon: Repeat },
                { id: "wishlist-all", label: "Lists", icon: ListPlus },
                { id: "billing-invoices", label: "Invoices", icon: Receipt },
                { id: "billing-statement", label: "Statement", icon: Printer },
                { id: "settings-profile", label: "Profile", icon: User },
                { id: "settings-address", label: "Addresses", icon: MapPin },
                { id: "settings-cards", label: "Cards", icon: CreditCard },
                { id: "settings-password", label: "Password", icon: Lock },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-2xs ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80"
                    }`}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── MAIN PORTAL CONTENT WITH STRUCTURED SIDEBAR ─── */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* LEFT 3.5 COLS: Categorized Navigation Sidebar (Desktop Only) */}
            <aside className="hidden lg:block lg:col-span-4 space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-6">
                {/* 1. Overview */}
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                    Overview
                  </div>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "overview"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="size-4" />
                      <span>Account Dashboard</span>
                    </div>
                    <ChevronRight className="size-3.5 opacity-60" />
                  </button>
                </div>

                {/* 2. Purchases */}
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                    Purchases
                  </div>
                  <button
                    onClick={() => setActiveTab("purchases-history")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "purchases-history"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="size-4" />
                      <span>Purchase History</span>
                    </div>
                    <span className="text-[11px] opacity-75">{orders.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("purchases-returns")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "purchases-returns"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <RotateCcw className="size-4" />
                      <span>Returns</span>
                    </div>
                    <span className="text-[11px] opacity-75">{returns.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("purchases-reorder")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "purchases-reorder"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Repeat className="size-4" />
                      <span>Reorder Items</span>
                    </div>
                    <span className="text-[11px] opacity-75">{allOrderedItems.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("purchases-quotes")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "purchases-quotes"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="size-4" />
                      <span>Quotes</span>
                    </div>
                    <span className="text-[11px] opacity-75">{quotes.length}</span>
                  </button>
                </div>

                {/* 3. Wishlist */}
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                    Wishlist
                  </div>
                  <button
                    onClick={() => setActiveTab("wishlist-all")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "wishlist-all"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ListPlus className="size-4" />
                      <span>All My Lists</span>
                    </div>
                    <span className="text-[11px] opacity-75">
                      {Object.keys(profile.wishlists || {}).length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("wishlist-my")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "wishlist-my"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="size-4" />
                      <span>My List</span>
                    </div>
                    <span className="text-[11px] opacity-75">
                      {activeWishlistItems.length}
                    </span>
                  </button>
                </div>

                {/* 4. Billing */}
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                    Billing
                  </div>
                  <button
                    onClick={() => setActiveTab("billing-invoices")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "billing-invoices"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="size-4" />
                      <span>Invoices</span>
                    </div>
                    <span className="text-[11px] opacity-75">{orders.length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("billing-history")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "billing-history"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <DollarSign className="size-4" />
                      <span>Transaction History</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("billing-statement")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "billing-statement"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Printer className="size-4" />
                      <span>Print a Statement</span>
                    </div>
                  </button>
                </div>

                {/* 5. Settings */}
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                    Settings
                  </div>
                  <button
                    onClick={() => setActiveTab("settings-profile")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "settings-profile"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="size-4" />
                      <span>Profile Information</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("settings-email")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "settings-email"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Mail className="size-4" />
                      <span>Email Preferences</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("settings-address")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "settings-address"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="size-4" />
                      <span>Address Book</span>
                    </div>
                    <span className="text-[11px] opacity-75">{(profile.addresses || []).length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("settings-cards")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "settings-cards"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="size-4" />
                      <span>Credit Cards</span>
                    </div>
                    <span className="text-[11px] opacity-75">{(profile.cards || []).length}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("settings-password")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "settings-password"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Lock className="size-4" />
                      <span>Update Your Password</span>
                    </div>
                  </button>
                </div>
              </div>
            </aside>

            {/* RIGHT 8 COLS: Active Tab View Container */}
            <div className="w-full lg:col-span-8 space-y-6">
              {/* ─── TAB 1: OVERVIEW ─── */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Recent Purchases Card */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <Package className="size-5 text-cyan-600" />
                          <span>Recent Purchases</span>
                        </h2>
                        <p className="text-xs text-slate-400 font-medium">Your latest commercial shipments and orders</p>
                      </div>

                      <button
                        onClick={() => setActiveTab("purchases-history")}
                        className="inline-flex items-center gap-1 text-xs font-black text-cyan-700 hover:text-cyan-800 transition cursor-pointer"
                      >
                        <span>View Purchase History</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>

                    {orders.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-black text-sm text-slate-900">#{order.id}</span>
                                <span className="text-[11px] font-bold text-slate-400">
                                  · {new Date(order.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                  order.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                  order.status === "Shipped" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                  "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                  {order.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right font-black text-sm text-slate-900">{formatUSD(order.total)}</div>
                                <button
                                  onClick={() => setSelectedInvoice(order)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer shadow-2xs"
                                >
                                  Invoice
                                </button>
                              </div>
                            </div>

                            {/* Item previews with images */}
                            <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                              {(order.items || []).slice(0, 2).map((it: any, i: number) => {
                                const fallbackImg = catalogProducts.find(p => p.id === it.id || (p.name && it.name && p.name.toLowerCase() === it.name.toLowerCase()))?.img;
                                const itemImg = getProductImage(it.img || fallbackImg);
                                return (
                                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="size-12 rounded-lg bg-white p-1 border border-slate-200/60 shrink-0 grid place-items-center overflow-hidden">
                                      <img src={itemImg} alt={it.name} className="size-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-extrabold text-xs text-slate-900 truncate">{it.name}</div>
                                      <div className="text-[10px] text-slate-400 font-semibold">Qty: {it.qty} · {formatUSD(it.price)}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400 space-y-3">
                        <ShoppingBag className="size-10 mx-auto text-slate-300 stroke-1" />
                        <p className="text-xs font-bold text-slate-700">No recent purchases recorded</p>
                        <Link
                          to="/"
                          className="inline-flex px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md"
                        >
                          Browse Commercial Catalog
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Active Returns & RMA Claims Shelf */}
                  {returns.length > 0 && (
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <RotateCcw className="size-4.5 text-cyan-600" />
                            <span>Active Returns & RMA Claims</span>
                            <span className="text-[10px] font-extrabold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full">
                              {returns.length}
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400">Track current return and warranty statuses</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("purchases-returns")}
                          className="text-xs font-bold text-cyan-700 hover:underline cursor-pointer"
                        >
                          View All Returns
                        </button>
                      </div>

                      <div className="space-y-3">
                        {returns.slice(0, 3).map((ret: any) => {
                          const isResolved = ret.isResolved || ret.status === "Resolved";
                          return (
                            <div key={ret.rmaId} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-cyan-100 text-cyan-800 font-mono font-bold text-xs grid place-items-center">
                                  RMA
                                </div>
                                <div>
                                  <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                                    <span className="font-mono text-cyan-800">{ret.rmaId}</span>
                                    <span>·</span>
                                    <span>Order #{ret.orderId}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {ret.reason} · Requested: {ret.preferredResolution || "Replacement"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Active Project Quotes Shelf */}
                  {quotes.length > 0 && (
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <FileText className="size-4.5 text-blue-600" />
                            <span>Active Commercial Quotes & Proposals</span>
                            <span className="text-[10px] font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full">
                              {quotes.length}
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400">Track bespoke equipment bids & engineering proposals</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("purchases-quotes")}
                          className="text-xs font-bold text-cyan-700 hover:underline cursor-pointer"
                        >
                          View All Quotes
                        </button>
                      </div>

                      <div className="space-y-3">
                        {quotes.slice(0, 3).map((q: any) => {
                          const isResolved = q.isResolved || q.status === "Resolved" || q.status === "Accepted" || q.status === "Converted to Order";
                          return (
                            <div key={q.quoteId} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-3">
                                <div className="size-9 rounded-xl bg-blue-100 text-blue-800 font-mono font-bold text-xs grid place-items-center">
                                  Q
                                </div>
                                <div>
                                  <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                                    <span>{q.projectName}</span>
                                    <span className="font-mono text-slate-400">#{q.quoteId}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    Target: {q.targetCompletionDate || "30 Days"} · Quoted: <strong className="text-slate-900">{formatUSD(q.quotedAmount || q.totalAmount || q.estimatedBudget || 0)}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isResolved ? (
                                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    {q.status || "Resolved"}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                                    {q.status || "Engineering Review"}
                                  </span>
                                )}
                                <button
                                  onClick={() => printQuote(q)}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-extrabold hover:bg-slate-50 transition cursor-pointer"
                                >
                                  Print
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Frequently Ordered Reorder Shelf */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <Repeat className="size-4.5 text-cyan-600" />
                          <span>Quick Reorder Shelf</span>
                        </h3>
                        <p className="text-xs text-slate-400">Instantly replenish popular consumables and OEM components</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("purchases-reorder")}
                        className="text-xs font-bold text-cyan-700 hover:underline cursor-pointer"
                      >
                        All Reorders
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {products.slice(0, 4).map((prod) => (
                        <div key={prod.id} className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Link to="/products/$productId" params={{ productId: prod.id }} className="size-12 rounded-xl bg-white p-1 border border-slate-200/60 shrink-0 grid place-items-center">
                              <img src={prod.img} alt={prod.name} className="size-full object-contain mix-blend-multiply" />
                            </Link>
                            <div>
                              <Link to="/products/$productId" params={{ productId: prod.id }} className="font-extrabold text-xs text-slate-900 line-clamp-1 hover:text-cyan-700 transition">
                                {prod.name}
                              </Link>
                              <div className="text-[11px] text-slate-400">{prod.brand} · {formatUSD(prod.price)}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleReorder(prod)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200/80 font-black text-xs shrink-0 transition cursor-pointer"
                          >
                            + Reorder
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 2: PURCHASES -> PURCHASE HISTORY ─── */}
              {activeTab === "purchases-history" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Package className="size-5.5 text-cyan-600" />
                        <span>Purchase History</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">Complete record of your wholesale orders & shipments</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                      {["all", "Pending", "Shipped", "Delivered"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setOrderStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-xl transition capitalize cursor-pointer ${
                            orderStatusFilter.toLowerCase() === st.toLowerCase()
                              ? "bg-white text-slate-900 shadow-2xs font-black"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs bg-white">
                          {/* Order Card Header */}
                          <div className="p-3.5 sm:p-4 sm:px-5 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="grid grid-cols-3 sm:flex sm:items-center gap-3 sm:gap-6 text-xs">
                              <div>
                                <div className="text-[9.5px] sm:text-[10px] uppercase font-bold text-slate-400">Order ID</div>
                                <div className="font-mono font-black text-xs sm:text-sm text-slate-900 truncate">#{order.id}</div>
                              </div>
                              <div>
                                <div className="text-[9.5px] sm:text-[10px] uppercase font-bold text-slate-400">Date Placed</div>
                                <div className="font-bold text-slate-700 text-[11px] sm:text-xs">
                                  {new Date(order.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </div>
                              </div>
                              <div>
                                <div className="text-[9.5px] sm:text-[10px] uppercase font-bold text-slate-400">Total</div>
                                <div className="font-black text-xs sm:text-sm text-slate-900">{formatUSD(order.total)}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                              <span className={`text-[9.5px] sm:text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                                order.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                order.status === "Shipped" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {order.status}
                              </span>
                              <button
                                onClick={() => setSelectedInvoice(order)}
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer shadow-2xs"
                              >
                                View Invoice
                              </button>
                              <button
                                onClick={() => {
                                  setReturnForm((prev) => ({ ...prev, orderId: order.id }));
                                  setIsReturnModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer shadow-2xs flex items-center gap-1"
                              >
                                <RotateCcw className="size-3 text-amber-600" />
                                <span>Request Return</span>
                              </button>
                            </div>
                          </div>

                          {/* Line Items with Images */}
                          <div className="p-3.5 sm:p-4 sm:p-5 divide-y divide-slate-100">
                            {(order.items || []).map((it: any, idx: number) => {
                              const fallbackImg = catalogProducts.find(p => p.id === it.id || (p.name && it.name && p.name.toLowerCase() === it.name.toLowerCase()))?.img;
                              const itemImg = getProductImage(it.img || fallbackImg);
                              return (
                                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col xs:flex-row xs:items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                    <Link
                                      to="/products/$productId"
                                      params={{ productId: it.id || "sample" }}
                                      className="size-12 xs:size-14 sm:size-16 rounded-xl bg-slate-50 border border-slate-200/80 p-1.5 shrink-0 grid place-items-center overflow-hidden hover:border-cyan-500 transition group shadow-2xs"
                                    >
                                      <img
                                        src={itemImg}
                                        alt={it.name}
                                        className="size-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                                        onError={(e) => {
                                          if (!e.currentTarget.src.includes("/assets/commingsoon.png")) {
                                            e.currentTarget.src = "/assets/commingsoon.png";
                                          }
                                        }}
                                      />
                                    </Link>

                                    <div className="space-y-1 min-w-0">
                                      <Link
                                        to="/products/$productId"
                                        params={{ productId: it.id || "sample" }}
                                        className="font-extrabold text-xs sm:text-sm text-slate-900 hover:text-cyan-700 transition block truncate"
                                      >
                                        {it.name}
                                      </Link>
                                      <div className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-slate-700 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded text-[9.5px] sm:text-[10px] uppercase">
                                          {it.brand || "PSW"}
                                        </span>
                                        <span>Qty: <strong className="text-slate-900">{it.qty}</strong></span>
                                        <span>·</span>
                                        <span>{formatUSD(it.price)} each</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between xs:justify-end gap-3 shrink-0 pt-2 xs:pt-0 border-t xs:border-t-0 border-slate-100">
                                    <div className="text-left xs:text-right">
                                      <div className="font-black text-xs sm:text-sm text-slate-900">{formatUSD((it.price || 0) * (it.qty || 1))}</div>
                                      <span className="text-[9.5px] sm:text-[10px] font-bold text-emerald-600">In Stock</span>
                                    </div>
                                    <button
                                      onClick={() => handleReorder(it)}
                                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 font-extrabold text-xs border border-slate-200 hover:border-cyan-200 transition cursor-pointer shadow-2xs"
                                    >
                                      Reorder
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                      <Package className="size-12 mx-auto text-slate-300 stroke-1" />
                      <p className="text-xs font-bold text-slate-700">No purchase history found</p>
                      <p className="text-xs text-slate-400">When you complete wholesale checkouts, your order records will appear here.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 3: PURCHASES -> RETURNS ─── */}
              {activeTab === "purchases-returns" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <RotateCcw className="size-5.5 text-cyan-600" />
                        <span>Returns & RMA Claims</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">Submit return requests (RMA) and track warranty replacements</p>
                    </div>

                    <button
                      onClick={() => setIsReturnModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Start Return Request</span>
                    </button>
                  </div>

                  {returns.length > 0 ? (
                    <div className="space-y-4">
                      {returns.map((ret: any) => {
                        const isResolved = ret.isResolved || ret.status === "Resolved";
                        return (
                          <div key={ret.rmaId} className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-black text-sm text-cyan-800">{ret.rmaId}</span>
                                <span className="text-xs font-bold text-slate-500">Order #{ret.orderId}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {isResolved ? (
                                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                    <Check className="size-3" />
                                    <span>Resolved</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                    <Clock className="size-3" />
                                    <span>{ret.status || "Under Review"}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="font-bold text-slate-700">Reason:</span>{" "}
                                <span className="text-slate-900 font-semibold">{ret.reason}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-700">Requested Action:</span>{" "}
                                <span className="text-slate-900 font-semibold">{ret.preferredResolution || "Replacement Unit"}</span>
                              </div>
                            </div>

                            {ret.notes && (
                              <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                                <span className="font-bold text-slate-700">Your notes:</span> "{ret.notes}"
                              </div>
                            )}

                            {ret.adminResolution && (
                              <div className="text-xs text-emerald-950 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                                <span className="font-bold text-emerald-850">Wholesale Resolution:</span> {ret.adminResolution}
                              </div>
                            )}

                            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 flex justify-between items-center">
                              <span>Submitted {new Date(ret.createdAt).toLocaleDateString()}</span>
                              <span className="font-medium text-slate-600">RMA Status: {ret.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                      <RotateCcw className="size-12 mx-auto text-slate-300 stroke-1" />
                      <p className="text-xs font-bold text-slate-700">No active return requests</p>
                      <p className="text-xs text-slate-400">All equipment shipments carry 100% genuine OEM manufacturer warranties.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 4: PURCHASES -> REORDER ITEMS ─── */}
              {activeTab === "purchases-reorder" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Repeat className="size-5.5 text-cyan-600" />
                      <span>Reorder Items</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">Frequently purchased equipment and components with 1-click reorder</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {allOrderedItems.map((prod) => (
                      <div key={prod.id} className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs flex flex-col justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Link to="/products/$productId" params={{ productId: prod.id }} className="size-16 rounded-xl bg-slate-50 p-2 border border-slate-200/60 shrink-0 grid place-items-center">
                            <img src={prod.img} alt={prod.name} className="size-full object-contain mix-blend-multiply" />
                          </Link>
                          <div className="space-y-1">
                            <Link to="/products/$productId" params={{ productId: prod.id }} className="font-extrabold text-xs text-slate-900 line-clamp-2 hover:text-cyan-700 transition">
                              {prod.name}
                            </Link>
                            <div className="text-[11px] text-slate-400">{prod.brand} · In Stock</div>
                            <div className="text-sm font-black text-cyan-700">{formatUSD(prod.price)}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleReorder(prod)}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
                        >
                          + Add to Cart & Reorder
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── TAB 5: PURCHASES -> QUOTES ─── */}
              {activeTab === "purchases-quotes" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <FileText className="size-5.5 text-cyan-600" />
                        <span>Quotes & Engineering Proposals</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">Bespoke contractor project quotes, BOM estimates, and engineering proposals</p>
                    </div>

                    <button
                      onClick={() => setIsQuoteModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Request Project Quote</span>
                    </button>
                  </div>

                  {quotes.length > 0 ? (
                    <div className="space-y-4">
                      {quotes.map((q: any) => {
                        const isResolved = q.isResolved || q.status === "Resolved" || q.status === "Accepted" || q.status === "Converted to Order";
                        return (
                          <div key={q.quoteId} className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-sm text-cyan-800">#{q.quoteId}</span>
                                  <span className="font-extrabold text-sm text-slate-900">{q.projectName}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  Submitted {new Date(q.createdAt).toLocaleDateString()} · Target: {q.targetCompletionDate || "30 Days"}
                                  {q.projectLocation && ` · Location: ${q.projectLocation}`}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-sm font-black text-slate-900">
                                    {formatUSD(q.quotedAmount || q.totalAmount || q.estimatedBudget || 0)}
                                  </div>
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                    isResolved
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                      : "bg-cyan-50 text-cyan-800 border-cyan-200"
                                  }`}>
                                    {q.status || "Under Review"}
                                  </span>
                                </div>

                                <button
                                  onClick={() => printQuote(q)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs shadow-2xs transition cursor-pointer"
                                >
                                  <Printer className="size-3.5 text-cyan-600" />
                                  <span>Print Proposal</span>
                                </button>
                              </div>
                            </div>

                            {/* Client Scope Notes */}
                            {q.notes && (
                              <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                                <span className="font-bold text-slate-700">Project Scope:</span> "{q.notes}"
                              </div>
                            )}

                            {/* Wholesale Engineering Remarks */}
                            {q.adminProposalNotes && (
                              <div className="text-xs text-blue-950 bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 space-y-1">
                                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                                  <Sparkles className="size-3.5 text-blue-600" />
                                  <span>Wholesale Engineering Scope & Quotation Terms:</span>
                                </div>
                                <div className="text-blue-900 whitespace-pre-wrap">{q.adminProposalNotes}</div>
                                {q.adminLeadTime && (
                                  <div className="text-[11px] text-blue-800 pt-1">
                                    <strong>Lead Time:</strong> {q.adminLeadTime} {q.adminFreightTerms && `· Freight: ${q.adminFreightTerms}`}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                      <FileText className="size-12 mx-auto text-slate-300 stroke-1" />
                      <p className="text-xs font-bold text-slate-700">No active quotes</p>
                      <p className="text-xs text-slate-400">Request formal contractor quotes for major resort or municipal installations.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 6: WISHLIST -> ALL MY LISTS ─── */}
              {activeTab === "wishlist-all" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <ListPlus className="size-5.5 text-cyan-600" />
                        <span>All My Lists</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">Organized project lists for multiple build jobs</p>
                    </div>

                    <button
                      onClick={() => setIsCreateListModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Create New List</span>
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {Object.keys(profile.wishlists || { "Default Wishlist": [] }).map((listName) => (
                      <div
                        key={listName}
                        onClick={() => {
                          setActiveWishlistName(listName);
                          setActiveTab("wishlist-my");
                        }}
                        className="p-5 rounded-2xl border border-slate-200/90 hover:border-cyan-500 bg-white hover:bg-cyan-50/30 transition-all cursor-pointer shadow-2xs space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-900 group-hover:text-cyan-900">{listName}</span>
                          <Bookmark className="size-4 text-slate-400 group-hover:text-cyan-600" />
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {(profile.wishlists?.[listName] || []).length} Saved Items
                        </div>
                        <div className="text-[11px] font-bold text-cyan-700 pt-1 flex items-center gap-1">
                          <span>Open List</span>
                          <ArrowRight className="size-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── TAB 7: WISHLIST -> MY LIST ─── */}
              {activeTab === "wishlist-my" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Heart className="size-5.5 text-rose-500 fill-rose-50" />
                        <span>My List: {activeWishlistName}</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">Curated equipment SKUs for your current job</p>
                    </div>

                    <button
                      onClick={() => {
                        activeWishlistItems.forEach((p: any) => handleReorder(p));
                        triggerToast("Added all list items to cart!");
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-black text-xs border border-cyan-200/80 transition cursor-pointer"
                    >
                      Add All to Cart
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {activeWishlistItems.map((prod: any) => (
                      <div key={prod.id} className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-2xs flex flex-col justify-between gap-3 relative">
                        <button
                          onClick={() => handleDeleteWishlistItem(prod.id)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="size-3.5" />
                        </button>

                        <div className="flex items-start gap-3 pr-6">
                          <Link to="/products/$productId" params={{ productId: prod.id }} className="size-16 rounded-xl bg-slate-50 p-2 border border-slate-200/60 shrink-0 grid place-items-center">
                            <img src={prod.img} alt={prod.name} className="size-full object-contain mix-blend-multiply" />
                          </Link>
                          <div className="space-y-1">
                            <Link to="/products/$productId" params={{ productId: prod.id }} className="font-extrabold text-xs text-slate-900 line-clamp-2 hover:text-cyan-700 transition">
                              {prod.name}
                            </Link>
                            <div className="text-[11px] text-slate-400">{prod.brand} · In Stock</div>
                            <div className="text-sm font-black text-cyan-700">{formatUSD(prod.price)}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleReorder(prod)}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── TAB 8: BILLING -> INVOICES ─── */}
              {activeTab === "billing-invoices" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Receipt className="size-5.5 text-cyan-600" />
                      <span>Invoices</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">Download and print formal accounting tax invoices</p>
                  </div>

                  {orders.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {orders.map((order) => (
                        <div key={order.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <div className="font-mono font-black text-sm text-slate-900">Invoice #{order.id}</div>
                            <div className="text-xs text-slate-400">
                              Issued {new Date(order.placedAt).toLocaleDateString()} · Paid via Stripe
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-black text-sm text-slate-900">{formatUSD(order.total)}</span>
                            <button
                              onClick={() => setSelectedInvoice(order)}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Eye className="size-3.5" />
                              <span>View / Print</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                      <Receipt className="size-12 mx-auto text-slate-300 stroke-1" />
                      <p className="text-xs font-bold text-slate-700">No invoices available</p>
                      <p className="text-xs text-slate-400">Invoices are automatically generated upon order completion.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 9: BILLING -> TRANSACTION HISTORY ─── */}
              {activeTab === "billing-history" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <DollarSign className="size-5.5 text-cyan-600" />
                      <span>Transaction History</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">Audit trail of all wholesale charges and settlements</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[10px]">
                          <th className="pb-3">Transaction Date</th>
                          <th className="pb-3">Reference</th>
                          <th className="pb-3">Payment Method</th>
                          <th className="pb-3 text-right">Amount</th>
                          <th className="pb-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((o) => (
                          <tr key={o.id} className="py-3">
                            <td className="py-3 text-slate-700 font-medium">{new Date(o.placedAt).toLocaleDateString()}</td>
                            <td className="py-3 font-mono font-bold text-slate-900">TXN-{o.id}</td>
                            <td className="py-3 text-slate-600">Encrypted Credit Card</td>
                            <td className="py-3 text-right font-black text-slate-900">{formatUSD(o.total)}</td>
                            <td className="py-3 text-center">
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Settled
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─── TAB 10: BILLING -> PRINT A STATEMENT ─── */}
              {activeTab === "billing-statement" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">

                  {/* Header */}
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Printer className="size-5.5 text-cyan-600" />
                      <span>Print a Statement</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Select a period, preview your orders, then print a branded statement for tax or expense filing</p>
                  </div>

                  {/* ── Period Filter Chips ── */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Statement Period</div>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { key: "1m",  label: "Last 30 Days" },
                        { key: "2m",  label: "Last 2 Months" },
                        { key: "3m",  label: "Last 3 Months" },
                        { key: "6m",  label: "Last 6 Months" },
                        { key: "ytd", label: "Year to Date" },
                        { key: "all", label: "All Time" },
                        { key: "custom", label: "Custom Range" },
                      ] as const).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setStatementPeriod(key)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            statementPeriod === key
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Custom date inputs */}
                    {statementPeriod === "custom" && (
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">From</label>
                          <input
                            type="date"
                            value={statementFrom}
                            onChange={(e) => setStatementFrom(e.target.value)}
                            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">To</label>
                          <input
                            type="date"
                            value={statementTo}
                            onChange={(e) => setStatementTo(e.target.value)}
                            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Summary Preview Bar ── */}
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Orders</div>
                      <div className="text-base sm:text-lg font-black text-slate-900">{statementOrders.length}</div>
                    </div>
                    <div className="text-center xs:border-x border-y xs:border-y-0 py-2.5 xs:py-0 border-slate-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Spent</div>
                      <div className="text-base sm:text-lg font-black text-cyan-700">{formatUSD(statementTotal)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Avg Order</div>
                      <div className="text-base sm:text-lg font-black text-slate-900">
                        {statementOrders.length > 0 ? formatUSD(statementTotal / statementOrders.length) : "$0.00"}
                      </div>
                    </div>
                  </div>

                  {/* ── Order Preview Table ── */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wide text-[10px]">Date</th>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wide text-[10px]">Order #</th>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wide text-[10px]">Items</th>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wide text-[10px] text-right">Amount</th>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wide text-[10px] text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {statementOrders.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-medium">
                              No orders in this period
                            </td>
                          </tr>
                        ) : (
                          statementOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50/70 transition">
                              <td className="px-4 py-3 font-medium text-slate-600">
                                {new Date(o.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-slate-900">#{o.id}</td>
                              <td className="px-4 py-3 text-slate-500">{(o.items || []).length} item{(o.items || []).length !== 1 ? "s" : ""}</td>
                              <td className="px-4 py-3 text-right font-bold text-slate-900">{formatUSD(o.total)}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {o.status || "Paid"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Print Button ── */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsStatementOpen(true)}
                      disabled={statementOrders.length === 0}
                      className="w-full xs:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition cursor-pointer shadow-md"
                    >
                      <Printer className="size-3.5" />
                      <span>Print Statement ({statementOrders.length} orders)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════
                  STATEMENT PRINT MODAL
              ═══════════════════════════════════════════════════════════════ */}
              <AnimatePresence>
                {isStatementOpen && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
                    >
                      {/* Top bar — hidden on print */}
                      <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold truncate pr-2">
                          <FileText className="size-4 text-cyan-400 shrink-0" />
                          <span className="truncate">Statement — {statementOrders.length} orders · {formatUSD(statementTotal)}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <button
                            onClick={() => printStatement()}
                            className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                          >
                            <Printer className="size-3.5" />
                            <span>Print</span>
                          </button>
                          <button
                            onClick={() => setIsStatementOpen(false)}
                            className="size-7 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center text-xs font-bold transition cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* ── Printable Statement Sheet ── */}
                      <div id="psw-statement-printable" className="p-5 sm:p-10 md:p-14 bg-white text-black font-sans overflow-y-auto">

                        {/* Header row: logo + title */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b-2 border-slate-200">
                          <div className="shrink-0">
                            <img src="/logo.png" alt="Pool Supply Wholesalers" className="h-16 w-auto object-contain" />
                          </div>
                          <div className="sm:text-right space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Statement</h1>
                            <div className="text-sm text-slate-500">Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                            <div className="text-sm text-slate-500">
                              Period:{" "}
                              <span className="font-bold text-slate-800">
                                {statementPeriod === "1m" && "Last 30 Days"}
                                {statementPeriod === "2m" && "Last 2 Months"}
                                {statementPeriod === "3m" && "Last 3 Months"}
                                {statementPeriod === "6m" && "Last 6 Months"}
                                {statementPeriod === "ytd" && "Year to Date"}
                                {statementPeriod === "all" && "All Time"}
                                {statementPeriod === "custom" && `${statementFrom || "—"} to ${statementTo || "—"}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* From / Bill To grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-200">
                          <div className="space-y-0.5 text-sm leading-relaxed">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">From</div>
                            <div className="font-bold text-black text-base">Pool Supply Wholesalers</div>
                            <div className="text-slate-600">Commercial Accounts & Wholesale Distribution</div>
                            <div className="text-slate-600">Nashville, Tennessee 37201</div>
                            <div className="text-slate-600">United States</div>
                            <div className="text-slate-600">+1 (615) 477-0407</div>
                            <div className="text-slate-600">sales@poolsupplywholesalers.com</div>
                          </div>
                          <div className="space-y-0.5 text-sm leading-relaxed">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Prepared For</div>
                            <div className="font-bold text-black text-base">{user?.name}</div>
                            {profile?.company && <div className="text-slate-600 font-medium">{profile.company}</div>}
                            <div className="text-slate-600">{user?.email || user?.phone}</div>
                          </div>
                        </div>

                        {/* Summary boxes */}
                        <div className="grid grid-cols-3 gap-4 py-6 border-b border-slate-200">
                          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Orders</div>
                            <div className="text-2xl font-black text-slate-900">{statementOrders.length}</div>
                          </div>
                          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Total Spent</div>
                            <div className="text-2xl font-black text-blue-800">{formatUSD(statementTotal)}</div>
                          </div>
                          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Avg Order</div>
                            <div className="text-2xl font-black text-emerald-800">
                              {statementOrders.length > 0 ? formatUSD(statementTotal / statementOrders.length) : "$0.00"}
                            </div>
                          </div>
                        </div>

                        {/* Orders table */}
                        <div className="pt-6">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Order Detail</div>
                          <table className="w-full text-left text-sm text-black border-collapse">
                            <thead>
                              <tr className="border-b-2 border-slate-900">
                                <th className="pb-3 font-bold text-left">Date</th>
                                <th className="pb-3 font-bold text-left">Order #</th>
                                <th className="pb-3 font-bold text-left">Description</th>
                                <th className="pb-3 font-bold text-center">Items</th>
                                <th className="pb-3 font-bold text-center">Status</th>
                                <th className="pb-3 font-bold text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {statementOrders.map((o, idx) => (
                                <tr key={o.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                                  <td className="py-2.5 pr-3 text-slate-600 text-xs">
                                    {new Date(o.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </td>
                                  <td className="py-2.5 pr-3 font-mono font-bold text-xs">#{o.id}</td>
                                  <td className="py-2.5 pr-3 text-slate-600 text-xs max-w-[180px]">
                                    {(o.items || []).slice(0, 2).map((it: any) => it.name).join(", ")}
                                    {(o.items || []).length > 2 && ` +${(o.items || []).length - 2} more`}
                                  </td>
                                  <td className="py-2.5 text-center text-xs text-slate-600">{(o.items || []).length}</td>
                                  <td className="py-2.5 text-center text-xs font-bold text-emerald-700">{o.status || "Paid"}</td>
                                  <td className="py-2.5 text-right font-bold text-sm">{formatUSD(o.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 border-slate-900">
                                <td colSpan={5} className="pt-3 font-black text-sm text-right pr-4">Statement Total</td>
                                <td className="pt-3 font-black text-base text-right">{formatUSD(statementTotal)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>

                        {/* Footer */}
                        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-400">
                          <div>
                            <div className="font-bold text-slate-600">Pool Supply Wholesalers</div>
                            <div>sales@poolsupplywholesalers.com · (615) 477-0407</div>
                          </div>
                          <div className="text-right">
                            <div>This statement is for reference only and does not constitute an invoice.</div>
                            <div>Page 1 of 1</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* ─── TAB 11: SETTINGS -> PROFILE INFORMATION ─── */}
              {activeTab === "settings-profile" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <User className="size-5.5 text-cyan-600" />
                      <span>Profile Information</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">Update your trade credentials and primary contact details</p>
                  </div>

                  {/* Avatar Upload Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="size-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-sm shrink-0 overflow-hidden">
                        <div className="size-full bg-[#061220] rounded-full grid place-items-center overflow-hidden">
                          {isUploadingAvatar ? (
                            <Loader2 className="size-5 text-cyan-400 animate-spin" />
                          ) : profile.avatar || user.avatar ? (
                            <img
                              src={profile.avatar || user.avatar}
                              alt={user.name}
                              className="size-full object-cover rounded-full"
                            />
                          ) : (
                            <User className="size-7 text-cyan-300" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-slate-900">Profile Photo</h3>
                        <p className="text-xs text-slate-500">
                          JPG, PNG, WebP or GIF up to 10MB. Synced with Cloudinary.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-cyan-600 active:scale-95 text-white font-bold text-xs shadow-xs hover:shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingAvatar ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="size-3.5" />
                            <span>{profile.avatar || user.avatar ? "Change Photo" : "Upload Photo"}</span>
                          </>
                        )}
                      </button>

                      {(profile.avatar || user.avatar) && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={isUploadingAvatar}
                          className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 active:scale-95 text-rose-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Full Name / Principal
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Company / Business Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.company}
                          onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                          placeholder="e.g. BlueWave Aquatic Pros"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Contractor / Trade ID
                        </label>
                        <input
                          type="text"
                          value={profileForm.contractorId}
                          onChange={(e) => setProfileForm({ ...profileForm, contractorId: e.target.value })}
                          placeholder="e.g. LIC-948291"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Mobile / Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer active:scale-95"
                      >
                        Save Profile Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ─── TAB 12: SETTINGS -> EMAIL PREFERENCES ─── */}
              {activeTab === "settings-email" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Mail className="size-5.5 text-cyan-600" />
                      <span>Email Preferences</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">Control which automated wholesale alerts you receive</p>
                  </div>

                  <div className="divide-y divide-slate-100 max-w-xl">
                    {[
                      { key: "orderUpdates", title: "Order Confirmations & Receipts", desc: "Instant invoice receipt and order placement summary" },
                      { key: "freightTracking", title: "Freight & Carrier Tracking", desc: "Real-time dispatch alerts with live carrier tracking links" },
                      { key: "promoAlerts", title: "Commercial Trade Rebates", desc: "Special pricing promos on pumps, heaters, and filters" },
                      { key: "invoiceReceipts", title: "Monthly Statements", desc: "Consolidated monthly billing statement at end of month" },
                      { key: "catalogDigest", title: "Quarterly New Product Digest", desc: "Early access notifications for new OEM product releases" },
                    ].map((item) => (
                      <div key={item.key} className="py-4 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-xs text-slate-900">{item.title}</div>
                          <p className="text-[11px] text-slate-400">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => handleToggleEmailPref(item.key)}
                          className={`size-6 rounded-lg transition grid place-items-center cursor-pointer ${
                            profile.emailPrefs?.[item.key]
                              ? "bg-cyan-600 text-white shadow-2xs"
                              : "bg-slate-100 border border-slate-300 text-transparent"
                          }`}
                        >
                          <Check className="size-3.5 stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── TAB 13: SETTINGS -> ADDRESS BOOK ─── */}
              {activeTab === "settings-address" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <MapPin className="size-5.5 text-cyan-600" />
                        <span>Address Book</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">Manage warehouse delivery locations and job site addresses</p>
                    </div>

                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Address</span>
                    </button>
                  </div>

                  {(profile.addresses || []).length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {profile.addresses.map((addr: any) => (
                        <div key={addr.id} className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 flex flex-col justify-between gap-4 shadow-2xs">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-slate-900">{addr.title}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600 font-medium leading-relaxed">
                              {addr.recipientName}<br />
                              {addr.line1} {addr.line2 && `· ${addr.line2}`}<br />
                              {addr.city}, {addr.state} {addr.zip}<br />
                              {addr.country}
                            </div>
                          </div>

                          <div className="flex items-center justify-end border-t border-slate-200/60 pt-3">
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-xs text-rose-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                      <MapPin className="size-12 mx-auto text-slate-300 stroke-1" />
                      <p className="text-xs font-bold text-slate-700">No saved addresses yet</p>
                      <p className="text-xs text-slate-400">Add commercial delivery addresses for expedited checkout.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 14: SETTINGS -> CREDIT CARDS ─── */}
              {activeTab === "settings-cards" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <CreditCard className="size-5.5 text-cyan-600" />
                        <span>Credit Cards</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-medium">Encrypted card tokens for instant trade procurement</p>
                    </div>

                    <button
                      onClick={() => setIsCardModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Card</span>
                    </button>
                  </div>

                  {(profile.cards || []).length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {profile.cards.map((card: any) => (
                        <div key={card.id} className="p-5 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-900 to-[#07192f] text-white flex flex-col justify-between gap-6 shadow-md">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-cyan-300 uppercase tracking-widest">{card.brand}</span>
                            {card.isDefault && (
                              <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/20">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="font-mono text-base font-black tracking-wider">
                              •••• •••• •••• {card.last4}
                            </div>
                            <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1">
                              <span>{card.cardholderName}</span>
                              <span>Exp: {card.expMonth}/{card.expYear}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end border-t border-white/10 pt-2">
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="text-xs text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Delete Card</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                      <CreditCard className="size-12 mx-auto text-slate-300 stroke-1" />
                      <p className="text-xs font-bold text-slate-700">No saved payment cards</p>
                      <p className="text-xs text-slate-400">Save cards securely for automated single-click checkout.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 15: SETTINGS -> UPDATE YOUR PASSWORD ─── */}
              {activeTab === "settings-password" && (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Lock className="size-5.5 text-cyan-600" />
                      <span>Update Your Password</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">Protect your commercial trade account credentials</p>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        New Password (Min 6 Characters)
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-cyan-500 focus:outline-none transition"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer active:scale-95"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ─── INVOICE MODAL (PIXEL-PERFECT STELLR INVOICE) ─── */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
            >
              {/* Modal Top Bar (Hidden on Print) */}
              <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold truncate pr-2">
                  <FileText className="size-4 text-cyan-400 shrink-0" />
                  <span className="truncate">PSW Invoice #{selectedInvoice.id}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Printer className="size-3.5" />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="size-7 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center text-xs font-bold transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Printable Invoice Sheet */}
              <div
                id="stellr-invoice-printable"
                className="p-4 sm:p-8 md:p-12 lg:p-14 bg-white text-black font-sans select-text space-y-6 min-h-[600px] flex flex-col justify-between overflow-y-auto"
              >
                {/* 1. Header: Title & Logo */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  {/* Left: Invoice Title & Meta */}
                  <div className="space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight">Invoice</h1>

                    <div className="space-y-1.5 text-sm">
                      <div className="grid grid-cols-[130px_1fr] gap-2">
                        <span className="text-slate-500 font-medium">Invoice number</span>
                        <span className="font-bold text-black font-mono">{selectedInvoice.id || "PSW-0001"}</span>
                      </div>
                      <div className="grid grid-cols-[130px_1fr] gap-2">
                        <span className="text-slate-500 font-medium">Date of issue</span>
                        <span className="font-semibold text-black">
                          {new Date(selectedInvoice.placedAt || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div className="grid grid-cols-[130px_1fr] gap-2">
                        <span className="text-slate-500 font-medium">Date due</span>
                        <span className="font-semibold text-black">
                          {new Date(selectedInvoice.placedAt || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div className="grid grid-cols-[130px_1fr] gap-2">
                        <span className="text-slate-500 font-medium">Payment</span>
                        <span className="font-semibold text-emerald-700">{selectedInvoice.paymentStatus || "Paid in Full"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pool Supply Wholesalers Logo */}
                  <div className="flex sm:justify-end items-start shrink-0">
                    <img
                      src="/logo.png"
                      alt="Pool Supply Wholesalers"
                      className="h-14 sm:h-20 w-auto object-contain"
                    />
                  </div>
                </div>

                {/* 2. From & Bill To Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 text-sm text-black pt-2">
                  {/* Left Column: Our Business */}
                  <div className="space-y-0.5 leading-relaxed">
                    <div className="font-bold text-black text-base mb-1">Pool Supply Wholesalers</div>
                    <div className="text-slate-600">Commercial Accounts & Wholesale Distribution</div>
                    <div className="text-slate-600">Nashville, Tennessee 37201</div>
                    <div className="text-slate-600">United States</div>
                    <div className="text-slate-600">+1 (615) 477-0407</div>
                    <div className="text-slate-600">sales@poolsupplywholesalers.com</div>
                    <div className="text-slate-600">www.poolsupplywholesalers.com</div>
                  </div>

                  {/* Right Column: Bill To (real order data) */}
                  <div className="space-y-0.5 leading-relaxed">
                    <div className="font-bold text-black text-base mb-1">Bill to</div>
                    <div className="font-semibold text-black">{selectedInvoice.name}</div>
                    {selectedInvoice.company && (
                      <div className="text-slate-700 font-medium">{selectedInvoice.company}</div>
                    )}
                    {selectedInvoice.address?.line1 && (
                      <div className="text-slate-600">{selectedInvoice.address.line1}</div>
                    )}
                    {selectedInvoice.address?.line2 && (
                      <div className="text-slate-600">{selectedInvoice.address.line2}</div>
                    )}
                    {selectedInvoice.address?.city && (
                      <div className="text-slate-600">
                        {selectedInvoice.address.city}, {selectedInvoice.address.state} {selectedInvoice.address.zip}
                      </div>
                    )}
                    <div className="text-slate-600">{selectedInvoice.address?.country || "United States"}</div>
                    {selectedInvoice.email && (
                      <div className="text-slate-600">{selectedInvoice.email}</div>
                    )}
                    {selectedInvoice.phone && (
                      <div className="text-slate-600">{selectedInvoice.phone}</div>
                    )}
                  </div>
                </div>

                {/* 3. Amount Due Headline */}
                <div className="pt-2 space-y-1 border-t border-slate-100">
                  <div className="text-2xl sm:text-[28px] font-bold text-black tracking-tight pt-4">
                    {formatUSD(selectedInvoice.total || 0)} USD due {new Date(selectedInvoice.placedAt || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    Order #{selectedInvoice.id} · {selectedInvoice.method === "express" ? "Express Freight" : "Standard Commercial Freight"}
                  </div>
                </div>

                {/* 4. Itemized Products Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-black border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-800 text-black">
                        <th className="pb-2.5 font-semibold text-left">Description</th>
                        <th className="pb-2.5 font-semibold text-center w-16">Qty</th>
                        <th className="pb-2.5 font-semibold text-right w-28">Unit price</th>
                        <th className="pb-2.5 font-semibold text-right w-28">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items : []).map((it: any, i: number) => (
                        <tr key={i}>
                          <td className="py-3 font-normal text-black pr-4">{it.name}</td>
                          <td className="py-3 text-center text-black font-normal">{it.qty || 1}</td>
                          <td className="py-3 text-right text-black font-normal">{formatUSD(it.price)}</td>
                          <td className="py-3 text-right text-black font-normal">{formatUSD((it.price || 0) * (it.qty || 1))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. Financial Summary Breakdown (Aligned Right) */}
                <div className="pt-2 flex justify-end">
                  <div className="w-full sm:w-72 space-y-1.5 text-sm text-black">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="font-normal text-black">Subtotal</span>
                      <span className="font-normal text-black">{formatUSD(selectedInvoice.subtotal || selectedInvoice.total || 50)}</span>
                    </div>

                    {selectedInvoice.discount !== undefined && selectedInvoice.discount > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="font-normal text-black">Discount</span>
                        <span className="font-normal text-black">-{formatUSD(selectedInvoice.discount)}</span>
                      </div>
                    )}

                    {selectedInvoice.shipping !== undefined && selectedInvoice.shipping > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="font-normal text-black">Shipping</span>
                        <span className="font-normal text-black">{formatUSD(selectedInvoice.shipping)}</span>
                      </div>
                    )}

                    {selectedInvoice.tax !== undefined && selectedInvoice.tax > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="font-normal text-black">Tax</span>
                        <span className="font-normal text-black">{formatUSD(selectedInvoice.tax)}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="font-normal text-black">Total</span>
                      <span className="font-normal text-black">{formatUSD(selectedInvoice.total || 50)}</span>
                    </div>

                    <div className="flex justify-between py-1.5 text-base font-bold text-black">
                      <span>Amount due</span>
                      <span>{formatUSD(selectedInvoice.total || 50)} USD</span>
                    </div>
                  </div>
                </div>

                {/* 6. Page Footer (Page 1 of 1) */}
                <div className="pt-16 mt-auto">
                  <div className="border-t border-slate-200 pt-3 flex justify-end">
                    <span className="text-xs text-slate-500 font-medium">Page 1 of 1</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ADD GLOBAL PRINT STYLE ─── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #stellr-invoice-printable, #stellr-invoice-printable * {
            visibility: visible !important;
          }
          #stellr-invoice-printable {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 36px 48px !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ─── ADD ADDRESS MODAL ─── */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm sm:text-base text-slate-900">Add New Commercial Address</h3>
                <button onClick={() => setIsAddressModalOpen(false)} className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-xs font-bold transition cursor-pointer">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Address Label</label>
                  <input
                    type="text"
                    value={addressForm.title}
                    onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                    required
                    placeholder="e.g. Main Warehouse / Job Site #4"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                    required
                    placeholder="123 Industrial Parkway"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">State</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                      placeholder="TN"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={addressForm.zip}
                      onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                      required
                      placeholder="37064"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer mt-2 transition"
                >
                  Save Address
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ADD CARD MODAL ─── */}
      <AnimatePresence>
        {isCardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm sm:text-base text-slate-900">Add Payment Card</h3>
                <button onClick={() => setIsCardModalOpen(false)} className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-xs font-bold transition cursor-pointer">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCard} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardForm.cardholderName}
                    onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value })}
                    required
                    placeholder="Name as printed on card"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    required
                    maxLength={19}
                    placeholder="4000 1234 5678 9010"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Expiration Month</label>
                    <input
                      type="text"
                      value={cardForm.expMonth}
                      onChange={(e) => setCardForm({ ...cardForm, expMonth: e.target.value })}
                      placeholder="MM"
                      maxLength={2}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Expiration Year</label>
                    <input
                      type="text"
                      value={cardForm.expYear}
                      onChange={(e) => setCardForm({ ...cardForm, expYear: e.target.value })}
                      placeholder="YY"
                      maxLength={2}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none text-center"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer mt-2 transition"
                >
                  Save Encrypted Card
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── RETURN RMA MODAL ─── */}
      <AnimatePresence>
        {isReturnModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <RotateCcw className="size-4 text-cyan-600" />
                    <span>Submit Return (RMA) Request</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">Our commercial RMA desk will process replacement or credit within 24 hours</p>
                </div>
                <button
                  onClick={() => setIsReturnModalOpen(false)}
                  className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-xs font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReturn} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Select Completed Order</label>
                  <select
                    value={returnForm.orderId}
                    onChange={(e) => setReturnForm({ ...returnForm, orderId: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Select order from history...</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        Order #{o.id} — {formatUSD(o.total)} ({new Date(o.placedAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Reason for Return</label>
                  <select
                    value={returnForm.reason}
                    onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option>Damaged in Freight Transit</option>
                    <option>Wrong Equipment Model Ordered</option>
                    <option>Defective Unit / Factory Fault</option>
                    <option>Missing Accessories / Parts</option>
                    <option>Job Site Cancellation / Excess Material</option>
                    <option>Warranty Claim / Mechanical Failure</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Preferred Resolution</label>
                  <select
                    value={returnForm.preferredResolution}
                    onChange={(e) => setReturnForm({ ...returnForm, preferredResolution: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Replacement Unit">Replacement Unit (Dispatch expedited replacement)</option>
                    <option value="Refund to Original Payment">Refund to Original Payment Method</option>
                    <option value="Store Credit / Account Memo">Commercial Account Credit / Memo</option>
                    <option value="Warranty Repair / Inspection">Factory Warranty Repair / Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Problem Description & Details</label>
                  <textarea
                    rows={3}
                    value={returnForm.notes}
                    onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                    placeholder="Provide serial numbers, damage details, or freight carrier notes..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer mt-2 transition"
                >
                  Submit Return Request
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── REQUEST QUOTE MODAL ─── */}
      <AnimatePresence>
        {isQuoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm sm:text-base text-slate-900">Request Commercial Project Quote</h3>
                <button onClick={() => setIsQuoteModalOpen(false)} className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-xs font-bold transition cursor-pointer">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitQuote} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={quoteForm.projectName}
                    onChange={(e) => setQuoteForm({ ...quoteForm, projectName: e.target.value })}
                    required
                    placeholder="e.g. Grand Resort Pool Filtration Overhaul"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Job Site Location</label>
                    <input
                      type="text"
                      value={quoteForm.projectLocation}
                      onChange={(e) => setQuoteForm({ ...quoteForm, projectLocation: e.target.value })}
                      placeholder="e.g. Nashville, TN"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Completion Date</label>
                    <input
                      type="text"
                      value={quoteForm.targetCompletionDate}
                      onChange={(e) => setQuoteForm({ ...quoteForm, targetCompletionDate: e.target.value })}
                      placeholder="e.g. Next 30 Days"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Project Budget ($ USD, optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={quoteForm.estimatedBudget}
                    onChange={(e) => setQuoteForm({ ...quoteForm, estimatedBudget: e.target.value })}
                    placeholder="e.g. 15000"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Scope & Required Equipment Specs</label>
                  <textarea
                    rows={3}
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    placeholder="Describe equipment quantity, pump horsepower, pipe sizes, or heater BTU requirements..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer mt-2 transition"
                >
                  Submit Quote for Engineering Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CREATE NEW LIST MODAL ─── */}
      <AnimatePresence>
        {isCreateListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm sm:text-base text-slate-900">Create New Project List</h3>
                <button onClick={() => setIsCreateListModalOpen(false)} className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-xs font-bold transition cursor-pointer">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateList} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">List Name</label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    required
                    placeholder="e.g. Summer Resort Build Job #104"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer mt-2 transition"
                >
                  Create List
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
