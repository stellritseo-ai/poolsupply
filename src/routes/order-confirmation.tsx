import { createFileRoute, Link } from "@tanstack/react-router";
import commingSoonImg from "@/assets/commingsoon.png";
import { useEffect, useState } from "react";
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
  Gift,
  Printer,
  Sparkles
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { formatUSD, type CartItem } from "@/components/site/cart-context";

type Order = {
  id: string;
  placedAt: string;
  email: string;
  phone?: string;
  name: string;
  company?: string;
  address: { line1: string; line2: string; city: string; state: string; zip: string; country: string };
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;
  promoCode?: string | null;
  method: "standard" | "express";
  paymentStatus?: string;
};

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => ({
    meta: [
      { title: "Order Confirmed — Pool Supply Wholesalers" },
      { name: "description", content: "Your Pool Supply Wholesalers commercial order has been confirmed." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { id } = Route.useSearch();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("aquapro_last_order");
      if (raw) {
        const o = JSON.parse(raw);
        if (o && typeof o === "object") {
          const sanitized: Order = {
            id: typeof o.id === "string" ? o.id : id || "AQ-EFC014",
            placedAt: typeof o.placedAt === "string" ? o.placedAt : new Date().toISOString(),
            email: typeof o.email === "string" ? o.email : "customer@poolsby.com",
            phone: typeof o.phone === "string" ? o.phone : "",
            name: typeof o.name === "string" ? o.name : "Commercial Partner",
            company: typeof o.company === "string" ? o.company : "",
            address: {
              line1: typeof o.address?.line1 === "string" ? o.address.line1 : "Commercial Warehouse District",
              line2: typeof o.address?.line2 === "string" ? o.address.line2 : "",
              city: typeof o.address?.city === "string" ? o.address.city : "Nashville",
              state: typeof o.address?.state === "string" ? o.address.state : "TN",
              zip: typeof o.address?.zip === "string" ? o.address.zip : "37201",
              country: typeof o.address?.country === "string" ? o.address.country : "United States"
            },
            items: Array.isArray(o.items) && o.items.length > 0 ? o.items : [
              {
                id: "p-demo-1",
                name: "Pentair IntelliFlo3 VSF 3.0 HP Commercial Pool Pump",
                brand: "Pentair",
                category: "Pumps",
                price: 1899.99,
                qty: 1,
                img: commingSoonImg
              }
            ],
            subtotal: typeof o.subtotal === "number" ? o.subtotal : 1899.99,
            shipping: 0, // 100% Free Shipping!
            tax: typeof o.tax === "number" ? o.tax : 132.99,
            total: typeof o.total === "number" ? o.total : 2032.98,
            discount: typeof o.discount === "number" ? o.discount : 0,
            promoCode: o.promoCode,
            method: o.method === "express" ? "express" : "standard",
            paymentStatus: o.paymentStatus || "Paid (Stripe Encrypted)",
          };
          // Always recompute shipping (15%) and tax (9.25%) from subtotal
          const discountedSub = Math.max(0, sanitized.subtotal - (sanitized.discount ?? 0));
          sanitized.shipping = discountedSub === 0 ? 0 : +(discountedSub * 0.15).toFixed(2);
          sanitized.tax = +(discountedSub * 0.0925).toFixed(2);
          sanitized.total = +(discountedSub + sanitized.shipping + sanitized.tax).toFixed(2);
          setOrder(sanitized);
        }
      }
    } catch (e) {
      console.error("Failed to parse last order details", e);
    }
  }, [id]);

  const copyOrderId = () => {
    const orderNum = order?.id || id || "AQ-EFC014";
    navigator.clipboard.writeText(orderNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (order?.method === "express" ? 2 : 4));

  const displayId = order?.id || id || "AQ-EFC014";

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans select-none">
      <Header alwaysDark />
      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* ─── HERO CONFIRMATION HEADER ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-4 mb-10"
          >
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-2xl scale-150 animate-pulse" />
              <div className="relative size-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white grid place-items-center shadow-2xl border border-white/40">
                <CheckCircle2 className="size-12" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-widest border border-emerald-200">
              <Sparkles className="size-3.5 text-emerald-600 animate-pulse" />
              Order Confirmed & Queued For Shipment
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Thank You for Your Order!
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto font-medium leading-relaxed">
              Thanks{order?.name ? `, ${order.name.split(" ")[0]}` : ""}! Your commercial wholesale order <strong className="text-slate-900 font-black">{displayId}</strong> has been received and sent to warehouse fulfillment.
            </p>
          </motion.div>

          {/* ─── ORDER TIMELINE STEP TRACKER ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm"
          >
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6 text-center">
              Fulfillment Timeline Status
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
              {[
                { title: "Order Confirmed", desc: "Details Verified", done: true },
                { title: "Payment Cleared", desc: "Stripe Secured", done: true },
                { title: "Warehouse Packing", desc: "Stock Allocating", active: true },
                { title: "Out for Shipping", desc: "Carrier Dispatch", queued: true },
              ].map((step, idx) => (
                <div key={idx} className="text-center space-y-2 relative">
                  <div
                    className={`size-10 rounded-2xl mx-auto grid place-items-center font-black text-xs transition-all shadow-sm ${
                      step.done
                        ? "bg-emerald-600 text-white"
                        : step.active
                        ? "bg-cyan-600 text-white animate-pulse"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {step.done ? <Check className="size-5" /> : idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">{step.title}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ─── MAIN ORDER RECEIPT CARD ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-[2.5rem] border border-slate-200/90 bg-white shadow-xl overflow-hidden"
          >
            {/* Top Telemetry Header Grid */}
            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/70 border-b border-slate-100 p-6">
              <div className="text-center sm:text-left space-y-1 py-2 sm:py-0">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Order Reference #</span>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-mono font-black text-slate-900 text-base">{displayId}</span>
                  <button
                    onClick={copyOrderId}
                    className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    title="Copy Order Reference Number"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-center space-y-1 py-2 sm:py-0">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Date Placed</span>
                <div className="font-bold text-slate-800 text-sm">
                  {order ? new Date(order.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : new Date().toLocaleDateString()}
                </div>
              </div>

              <div className="text-center sm:text-right space-y-1 py-2 sm:py-0">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Est. Commercial Delivery</span>
                <div className="font-black text-emerald-700 text-sm flex items-center justify-center sm:justify-end gap-1.5">
                  <Truck className="size-4 text-emerald-600" />
                  {deliveryDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
              </div>
            </div>

            {/* Order Items List */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-black text-slate-900 text-base mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="size-5 text-cyan-600" /> Order Itemization
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                      Shipping: 15%
                    </span>
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                      Tax: 9.25%
                    </span>
                  </div>
                </h3>

                <ul className="divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-slate-50/40 p-2">
                  {order?.items.map((it) => (
                    <li key={it.id} className="flex items-center gap-4 p-3">
                      <div className="relative size-16 shrink-0 rounded-2xl bg-white border border-slate-200 grid place-items-center overflow-hidden shadow-2xs">
                        <img src={it.img} alt={it.name} className="size-full object-contain p-1.5" />
                        <span className="absolute -top-1 -right-1 size-5 rounded-full bg-slate-900 text-white text-[10px] font-black grid place-items-center shadow-xs">
                          {it.qty}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">{it.brand}</div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">{it.name}</div>
                        <div className="text-[11px] text-slate-500 font-semibold">{formatUSD(it.price)} each</div>
                      </div>

                      <div className="text-xs sm:text-sm font-black text-slate-900">
                        {formatUSD(it.price * it.qty)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shipping Address & Summary Split */}
              <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Truck className="size-4 text-cyan-600" /> Delivery Destination
                  </h4>
                  <address className="not-italic text-xs font-semibold text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-black block text-sm">{order?.name}</strong>
                    {order?.company && <span className="text-slate-500 font-extrabold block">{order.company}</span>}
                    {order?.address.line1}{order?.address.line2 ? `, ${order.address.line2}` : ""}<br />
                    {order?.address.city}, {order?.address.state} {order?.address.zip}<br />
                    {order?.address.country}
                  </address>

                  <div className="pt-2 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                    <ShieldCheck className="size-4" /> Standard Freight Commercial Dispatch
                  </div>
                </div>

                <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs font-bold">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                    Invoice Breakdown
                  </h4>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Subtotal</span>
                    <span>{formatUSD(order?.subtotal || 0)}</span>
                  </div>
                  {order?.discount !== undefined && order.discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-extrabold">
                      <span>Discount ({order.promoCode || "Applied"})</span>
                      <span>-{formatUSD(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Shipping (15%)</span>
                    <span>{formatUSD(order?.shipping || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Sales Tax (9.25%)</span>
                    <span>{formatUSD(order?.tax || 0)}</span>
                  </div>
                  <div className="h-px bg-slate-200 my-2" />
                  <div className="flex items-center justify-between text-sm font-black text-slate-900">
                    <span>Total Paid</span>
                    <span className="text-base text-cyan-700">{formatUSD(order?.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── FOOTER ACTION ─── */}
          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-black text-xs shadow-xl hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-2"
            >
              Continue Shopping <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
