import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Package,
  Mail,
  ArrowRight,
  Truck,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Clock,
  Printer,
  Sparkles,
  Phone,
  HelpCircle,
  ChevronRight,
  CreditCard,
  MapPin,
  Calendar,
  FileText,
  BadgeCheck,
  ExternalLink
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { formatUSD, type CartItem } from "@/components/site/cart-context";
import { getProductImage, products as catalogProducts } from "@/lib/products";
import { getOrderByIdDb } from "@/lib/api/orders.functions";

type Order = {
  id: string;
  placedAt: string;
  email: string;
  phone?: string;
  name: string;
  company?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;
  promoCode?: string | null;
  method?: "standard" | "express" | string;
  paymentType?: string;
  paymentStatus?: string;
};

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  head: () => {
    return {
      meta: [
        { title: `Order Confirmed — Pool Supply Wholesalers` },
        { name: "description", content: "Your commercial pool equipment order has been confirmed and queued for fulfillment." },
        { name: "robots", content: "noindex, nofollow" },
      ],
    };
  },
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { id: searchId } = Route.useSearch();
  const orderId = searchId || "AQ-TZRW4H";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      setLoading(true);

      // 1. Try loading from MongoDB via server function
      if (orderId) {
        try {
          const res = await getOrderByIdDb({ data: { id: orderId } }) as any;
          if (isMounted && res.success && res.order) {
            setOrder(res.order as any);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Could not fetch order from DB, falling back to local:", e);
        }
      }

      // 2. Check localStorage for last placed order
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("aquapro_last_order");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
              const matchedOrder: Order = {
                id: parsed.id || orderId,
                placedAt: parsed.placedAt || new Date().toISOString(),
                email: parsed.email || "commercial.buyer@poolpros.com",
                phone: parsed.phone || "+1 (615) 477-0407",
                name: parsed.name || "Alex Harrison",
                company: parsed.company || "Harrison Pool & Aquatic Systems LLC",
                address: {
                  line1: parsed.address?.line1 || "410 Scott Pike, Hub #B",
                  line2: parsed.address?.line2 || "Loading Dock 4",
                  city: parsed.address?.city || "Nashville",
                  state: parsed.address?.state || "TN",
                  zip: parsed.address?.zip || "37207",
                  country: parsed.address?.country || "United States",
                },
                items: Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed.items : [
                  {
                    id: "p-pentair-intelliflo3",
                    name: "Pentair IntelliFlo3 VSF 3.0 HP Variable Speed Commercial Pool Pump",
                    brand: "Pentair",
                    price: 1899.99,
                    qty: 1,
                    img: getProductImage(""),
                  },
                  {
                    id: "p-hayward-heatpro",
                    name: "Hayward HeatPro 140,000 BTU Commercial High-Efficiency Heat Pump",
                    brand: "Hayward",
                    price: 3499.00,
                    qty: 1,
                    img: getProductImage(""),
                  }
                ],
                subtotal: typeof parsed.subtotal === "number" ? parsed.subtotal : 5398.99,
                discount: typeof parsed.discount === "number" ? parsed.discount : 0,
                promoCode: parsed.promoCode || null,
                shipping: typeof parsed.shipping === "number" ? parsed.shipping : +(5398.99 * 0.15).toFixed(2),
                tax: typeof parsed.tax === "number" ? parsed.tax : +(5398.99 * 0.0925).toFixed(2),
                total: typeof parsed.total === "number" ? parsed.total : 0,
                method: parsed.method || "standard",
                paymentType: parsed.paymentType || "Stripe Live (256-bit SSL)",
                paymentStatus: parsed.paymentStatus || "Authorized & Cleared",
              };

              const subAfterDisc = Math.max(0, matchedOrder.subtotal - (matchedOrder.discount || 0));
              matchedOrder.shipping = matchedOrder.shipping || +(subAfterDisc * 0.15).toFixed(2);
              matchedOrder.tax = matchedOrder.tax || +(subAfterDisc * 0.0925).toFixed(2);
              matchedOrder.total = +(subAfterDisc + matchedOrder.shipping + matchedOrder.tax).toFixed(2);

              if (isMounted) {
                setOrder(matchedOrder);
                setLoading(false);
                return;
              }
            }
          }
        } catch (err) {
          console.error("Failed to parse localStorage order:", err);
        }
      }

      // 3. Realistic Demo Fallback for Direct Links
      if (isMounted) {
        const fallbackItems: CartItem[] = [
          {
            id: "p-pentair-intelliflo3",
            name: "Pentair IntelliFlo3 VSF 3.0 HP Variable Speed Commercial Pool Pump",
            brand: "Pentair",
            price: 1899.99,
            qty: 1,
            img: getProductImage(""),
          },
          {
            id: "p-raypak-avalanche",
            name: "Raypak Digital Electronic 406,000 BTU Commercial Gas Pool Heater",
            brand: "Raypak",
            price: 2795.00,
            qty: 1,
            img: getProductImage(""),
          }
        ];

        const sub = 4694.99;
        const shp = +(sub * 0.15).toFixed(2);
        const tx = +(sub * 0.0925).toFixed(2);

        setOrder({
          id: orderId,
          placedAt: new Date().toISOString(),
          email: "alex.harrison@harrisonaquatics.com",
          phone: "+1 (615) 477-0407",
          name: "Alex Harrison",
          company: "Harrison Aquatic Systems LLC",
          address: {
            line1: "410 Scott Pike, Suite 102",
            line2: "Commercial Receiving Bay",
            city: "Nashville",
            state: "TN",
            zip: "37207",
            country: "United States",
          },
          items: fallbackItems,
          subtotal: sub,
          shipping: shp,
          tax: tx,
          total: +(sub + shp + tx).toFixed(2),
          discount: 0,
          promoCode: null,
          method: "standard",
          paymentType: "Stripe Live Production Card",
          paymentStatus: "Paid & Secured",
        });
        setLoading(false);
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const copyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Calculate delivery date estimates
  const estDeliveryStart = useMemo(() => {
    const d = order?.placedAt ? new Date(order.placedAt) : new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }, [order?.placedAt]);

  const estDeliveryEnd = useMemo(() => {
    const d = order?.placedAt ? new Date(order.placedAt) : new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }, [order?.placedAt]);

  const formattedDate = useMemo(() => {
    if (!order?.placedAt) return new Date().toLocaleDateString();
    return new Date(order.placedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [order?.placedAt]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-cyan-500/20 flex flex-col print:bg-white">
      {/* Header hidden on print */}
      <div className="print:hidden">
        <Header alwaysDark />
      </div>

      <main className="flex-1 pt-28 sm:pt-32 pb-24 print:pt-4 print:pb-0">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          {/* ─── HERO CONFIRMATION BANNER ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-cyan-50/40 to-blue-50/50 p-8 sm:p-12 border border-slate-200/80 shadow-[0_12px_40px_-15px_rgba(0,137,201,0.08)] print:border-none print:shadow-none print:p-2 text-center"
          >
            {/* Background Decorative Rings */}
            <div className="absolute -top-24 -right-24 size-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-4 sm:space-y-5">
              {/* Pulsing Success Badge Icon */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl scale-125 animate-pulse" />
                <div className="relative size-20 sm:size-24 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white grid place-items-center shadow-xl shadow-emerald-500/25 border-4 border-white">
                  <CheckCircle2 className="size-10 sm:size-12 stroke-[2.5]" />
                </div>
              </div>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] sm:text-xs font-black uppercase tracking-widest border border-emerald-200/80 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Payment Cleared & Order Queued
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                  Thank You For Your Order!
                </h1>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  We've received your commercial equipment order and sent a confirmation invoice to{" "}
                  <strong className="text-slate-900 font-bold underline decoration-cyan-500/40">{order?.email}</strong>.
                </p>
              </div>

              {/* Order Reference Pill & Quick Action Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-700">
                  <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">Reference #</span>
                  <span className="font-mono font-black text-slate-900 text-sm tracking-wide">{order?.id}</span>
                  <button
                    onClick={copyOrderId}
                    className="p-1 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-slate-100 transition cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  </button>
                </div>

                <button
                  onClick={handlePrint}
                  className="print:hidden inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer active:scale-95"
                >
                  <Printer className="size-3.5 text-slate-500" /> Print Tax Receipt
                </button>
              </div>
            </div>
          </motion.div>

          {/* ─── FULFILLMENT TIMELINE TRACKER ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] print:border print:border-slate-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600">Real-Time Logistics Status</span>
                <h2 className="text-lg font-black text-slate-900">Commercial Fulfillment Progress</h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100 w-fit">
                <Truck className="size-4 text-cyan-600" />
                Est. Freight Delivery: <span className="text-slate-900 font-extrabold">{estDeliveryStart} – {estDeliveryEnd}</span>
              </div>
            </div>

            <div className="pt-8 pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
                {[
                  { title: "Order Verified", desc: "Order details confirmed", date: "Today", done: true, icon: BadgeCheck },
                  { title: "Payment Cleared", desc: "Stripe Live 256-bit", date: "Completed", done: true, icon: CreditCard },
                  { title: "Warehouse Packing", desc: "Allocating from TN hub", date: "In Progress", active: true, icon: Package },
                  { title: "Freight Dispatch", desc: "Commercial liftgate delivery", date: "Upcoming", pending: true, icon: Truck },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="relative flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2.5">
                      {/* Step Circle */}
                      <div
                        className={`size-12 rounded-2xl grid place-items-center font-black text-sm shrink-0 transition-all shadow-sm ${step.done
                            ? "bg-emerald-600 text-white shadow-emerald-500/20"
                            : step.active
                              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/25 ring-4 ring-cyan-100"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                      >
                        {step.done ? <Check className="size-6 stroke-[3]" /> : <Icon className="size-5" />}
                      </div>

                      {/* Step Labels */}
                      <div className="space-y-0.5 min-w-0 flex-1 sm:flex-initial">
                        <div className="flex items-center justify-between sm:justify-center gap-2">
                          <div className="text-xs font-extrabold text-slate-900">{step.title}</div>
                          {step.active && (
                            <span className="sm:hidden text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-tight">{step.desc}</p>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{step.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ─── MAIN TWO-COLUMN RECEIPT & ITEMIZATION ─── */}
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
            {/* LEFT COLUMN: Itemization & Warehouse Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Itemized Order List Card */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 font-black text-slate-900 text-base">
                    <Package className="size-5 text-cyan-600" />
                    <span>Commercial Items Ordered ({order?.items.reduce((acc, it) => acc + it.qty, 0) || 0})</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {order?.placedAt ? new Date(order.placedAt).toLocaleDateString() : ""}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {order?.items.map((item, idx) => (
                    <div key={item.id || idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 sm:gap-5">
                      {/* Thumbnail */}
                      <div className="size-18 sm:size-20 rounded-2xl bg-slate-50 border border-slate-200/80 p-2 shrink-0 grid place-items-center overflow-hidden shadow-2xs relative">
                        <img
                          src={item.img || getProductImage("")}
                          alt={item.name}
                          className="size-full object-contain mix-blend-multiply"
                        />
                        <span className="absolute -top-1 -right-1 size-5 rounded-full bg-slate-900 text-white text-[10px] font-black grid place-items-center shadow-xs">
                          {item.qty}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700 bg-cyan-50/80 px-2 py-0.5 rounded-md border border-cyan-100/80">
                          {item.brand || "Pool Supply Wholesalers"}
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                          {item.name}
                        </h4>
                        <div className="text-xs font-semibold text-slate-500">
                          Unit Wholesale: <span className="font-bold text-slate-700">{formatUSD(item.price)}</span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="text-right shrink-0">
                        <div className="text-sm sm:text-base font-black text-slate-900">
                          {formatUSD(item.price * item.qty)}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 block">In Stock · Ready</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Freight Packaging Callout */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50/60 to-blue-50/60 border border-cyan-100 flex items-center gap-3.5">
                  <ShieldCheck className="size-6 text-cyan-600 shrink-0" />
                  <div className="text-xs">
                    <strong className="font-bold text-slate-900 block">Commercial Freight Guarantee & Liftgate Service</strong>
                    <span className="text-slate-600">All heavy machinery and pool equipment are palletized, stretch-wrapped, and fully insured.</span>
                  </div>
                </div>
              </div>

              {/* Warehouse Dispatch Origin Card */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="size-11 rounded-2xl bg-slate-100 text-slate-700 grid place-items-center shrink-0">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Primary Dispatch Facility</h4>
                    <p className="text-sm font-extrabold text-slate-900">PSW Central Logistics Hub · Nashville, TN</p>
                    <span className="text-xs text-slate-500 font-medium">Standard Ground & LTL Freight Network</span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <BadgeCheck className="size-3.5" /> 100% Authorized Distributor
                  </span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Financial Summary & Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Financial Breakdown Card */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <FileText className="size-4.5 text-cyan-600" /> Invoice Breakdown
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                    {order?.paymentStatus || "Paid in Full"}
                  </span>
                </div>

                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Wholesale Subtotal</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{formatUSD(order?.subtotal || 0)}</span>
                  </div>

                  {order?.discount !== undefined && order.discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-bold">
                      <span>Trade Discount ({order.promoCode || "Applied"})</span>
                      <span className="font-mono text-sm">-{formatUSD(order.discount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>Freight & Logistics</span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-500">15%</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono text-sm">{formatUSD(order?.shipping || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>Commercial Sales Tax</span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-500">9.25%</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono text-sm">{formatUSD(order?.tax || 0)}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900 block">Total Charged</span>
                      <span className="text-[10px] font-bold text-slate-400">Includes all taxes & freight charges</span>
                    </div>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-700 font-mono">
                      {formatUSD(order?.total || 0)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Badge */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <CreditCard className="size-4 text-slate-400" />
                    <span>Payment Method:</span>
                  </div>
                  <span className="font-bold text-slate-800 text-[11px] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    {order?.paymentType || "Stripe Live Production Card"}
                  </span>
                </div>
              </div>

              {/* Delivery Destination Card */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] space-y-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <MapPin className="size-4.5 text-cyan-600" /> Delivery Address
                </h3>

                <div className="text-xs space-y-1.5 text-slate-600 font-medium leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                  <div className="font-bold text-slate-900 text-sm">{order?.name}</div>
                  {order?.company && (
                    <div className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-slate-400" /> {order.company}
                    </div>
                  )}
                  <div>
                    {order?.address.line1}
                    {order?.address.line2 ? `, ${order.address.line2}` : ""}
                  </div>
                  <div>
                    {order?.address.city}, {order?.address.state} {order?.address.zip}
                  </div>
                  <div className="font-semibold text-slate-700">{order?.address.country}</div>
                  {order?.phone && (
                    <div className="pt-1 text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="size-3 text-slate-400" /> {order.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Commercial Support Quick Help Card */}
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-7 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white/10 text-cyan-400 grid place-items-center shrink-0">
                    <HelpCircle className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Commercial Contractor Support</h4>
                    <p className="text-sm font-black text-white">Need to adjust this order?</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Our Nashville fulfillment engineers are on standby for dock scheduling, liftgate additions, or item adjustments before final dispatch.
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <a
                    href="tel:6154770407"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                  >
                    <Phone className="size-3.5" /> (615) 477-0407
                  </a>
                  <a
                    href="mailto:sales@poolsupplywholesalers.com"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition border border-white/10"
                  >
                    <Mail className="size-3.5" /> Email Support
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── NEXT ACTIONS BOTTOM BAR ─── */}
          <div className="print:hidden pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
            <Link
              to="/account"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-extrabold text-xs shadow-2xs transition"
            >
              <Package className="size-4 text-cyan-600" /> View in Account Orders
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/shop/$category"
                params={{ category: "all" }}
                search={{ q: "" }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-cyan-600/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                Continue Wholesale Shopping <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
