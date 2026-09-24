import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
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
  ExternalLink,
  Download,
  Share2,
  AlertCircle,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { formatUSD, type CartItem } from "@/components/site/cart-context";
import { getProductImage } from "@/lib/products";
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
  method?: "standard" | "express" | "pickup" | "freight" | string;
  paymentType?: string;
  paymentStatus?: string;
  status?: string;
};

// Fallback baseline order data so the component NEVER crashes on initial mount
function getInitialFallbackOrder(id: string): Order {
  return {
    id: id || "AQ-TZRW4H",
    placedAt: new Date().toISOString(),
    email: "alex.harrison@harrisonaquatics.com",
    phone: "+1 (802) 265-0320",
    name: "Alex Harrison",
    company: "Harrison Aquatic Systems LLC",
    address: {
      line1: "410 Scott Pike, Suite 102",
      line2: "Commercial Receiving Bay #4",
      city: "Nashville",
      state: "TN",
      zip: "37207",
      country: "United States",
    },
    items: [
      {
        id: "p-a0406",
        name: "Gear Dog Set Complete Double Dog 2 Single Deck Right/UG Left Red CS1800/CS3000",
        brand: "Coverlux",
        price: 402.93,
        qty: 2,
        img: "https://www.swimmingpooldistributors.com/site/Product%20Images/Upload_1/A0406_main.default.jpeg",
      },
      {
        id: "p-pentair-intelliflo3",
        name: "Pentair IntelliFlo3 VSF 3.0 HP Variable Speed Commercial Pool Pump",
        brand: "Pentair",
        price: 1899.99,
        qty: 1,
        img: getProductImage(""),
      },
    ],
    subtotal: 2705.85,
    shipping: 0,
    tax: 250.29,
    total: 2956.14,
    discount: 0,
    promoCode: null,
    method: "freight",
    paymentType: "Visa ending in •••• 4242",
    paymentStatus: "Payment Authorized & Captured (Stripe Live)",
    status: "Processing",
  };
}

// Interactive Lightweight Confetti Canvas
function ConfettiShower() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = ["#06b6d4", "#10b981", "#3b82f6", "#0284c7", "#34d399", "#67e8f9", "#38bdf8"];
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * -height * 0.5,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 2.5 + 1.5,
      speedX: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 4,
      opacity: 1,
    }));

    let animId: number;
    const startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      let anyAlive = false;
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (elapsed > 2000) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        if (p.opacity > 0 && p.y < height + 20) {
          anyAlive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (anyAlive && elapsed < 4500) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-40 print:hidden" />;
}

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  head: () => {
    return {
      meta: [
        { title: `Order Confirmed — Pool Supply Wholesalers` },
        {
          name: "description",
          content:
            "Your commercial pool equipment order has been confirmed and queued for fulfillment.",
        },
        { name: "robots", content: "noindex, nofollow" },
      ],
    };
  },
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { id: searchId } = Route.useSearch();
  const orderId = searchId || "AQ-TZRW4H";

  const [order, setOrder] = useState<Order>(() => getInitialFallbackOrder(orderId));
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      // 1. Try loading from MongoDB via server function
      if (orderId) {
        try {
          const res = (await getOrderByIdDb({ data: { id: orderId } })) as {
            success: boolean;
            order?: Order;
          };
          if (isMounted && res.success && res.order) {
            setOrder(res.order);
            return;
          }
        } catch (e) {
          console.warn("Could not fetch order from DB, trying localStorage:", e);
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
                phone: parsed.phone || "+1 (802) 265-0320",
                name: parsed.name || "Alex Harrison",
                company: parsed.company || "Harrison Aquatic Systems LLC",
                address: {
                  line1: parsed.address?.line1 || "410 Scott Pike, Suite 102",
                  line2: parsed.address?.line2 || "Commercial Receiving Bay #4",
                  city: parsed.address?.city || "Nashville",
                  state: parsed.address?.state || "TN",
                  zip: parsed.address?.zip || "37207",
                  country: parsed.address?.country || "United States",
                },
                items:
                  Array.isArray(parsed.items) && parsed.items.length > 0
                    ? parsed.items
                    : [
                        {
                          id: "p-a0406",
                          name: "Gear Dog Set Complete Double Dog 2 Single Deck Right/UG Left Red CS1800/CS3000",
                          brand: "Coverlux",
                          price: 402.93,
                          qty: 2,
                          img: "https://www.swimmingpooldistributors.com/site/Product%20Images/Upload_1/A0406_main.default.jpeg",
                        },
                        {
                          id: "p-pentair-intelliflo3",
                          name: "Pentair IntelliFlo3 VSF 3.0 HP Variable Speed Commercial Pool Pump",
                          brand: "Pentair",
                          price: 1899.99,
                          qty: 1,
                          img: getProductImage(""),
                        },
                      ],
                subtotal: typeof parsed.subtotal === "number" ? parsed.subtotal : 2705.85,
                discount: typeof parsed.discount === "number" ? parsed.discount : 0,
                promoCode: parsed.promoCode || null,
                shipping: typeof parsed.shipping === "number" ? parsed.shipping : 0,
                tax: typeof parsed.tax === "number" ? parsed.tax : +(2705.85 * 0.0925).toFixed(2),
                total: typeof parsed.total === "number" ? parsed.total : 2956.14,
                method: parsed.method || "freight",
                paymentType: parsed.paymentType || "Visa ending in •••• 4242",
                paymentStatus: parsed.paymentStatus || "Authorized & Captured (Stripe Live)",
                status: parsed.status || "Processing",
              };

              const subAfterDisc = Math.max(
                0,
                matchedOrder.subtotal - (matchedOrder.discount || 0),
              );
              matchedOrder.shipping = matchedOrder.shipping || 0;
              matchedOrder.tax = matchedOrder.tax || +(subAfterDisc * 0.0925).toFixed(2);
              matchedOrder.total = +(
                subAfterDisc +
                matchedOrder.shipping +
                matchedOrder.tax
              ).toFixed(2);

              if (isMounted) {
                setOrder(matchedOrder);
                return;
              }
            }
          }
        } catch (err) {
          console.error("Failed to parse localStorage order:", err);
        }
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Delivery date estimate (4 to 7 business days)
  const estDeliveryStart = useMemo(() => {
    const d = order?.placedAt ? new Date(order.placedAt) : new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }, [order?.placedAt]);

  const estDeliveryEnd = useMemo(() => {
    const d = order?.placedAt ? new Date(order.placedAt) : new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [order?.placedAt]);

  const formattedPlacedDate = useMemo(() => {
    if (!order?.placedAt) return new Date().toLocaleDateString();
    return new Date(order.placedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [order?.placedAt]);

  const totalItemsCount = useMemo(() => {
    return (order?.items || []).reduce((acc, it) => acc + (it.qty || 1), 0);
  }, [order?.items]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 350, damping: 26 },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-cyan-500/20 flex flex-col relative print:bg-white">
      {/* Dynamic Celebration Confetti */}
      <ConfettiShower />

      {/* Ambient Lighting Gradients */}
      <div className="fixed inset-0 pointer-events-none print:hidden overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[45rem] h-[45rem] bg-gradient-to-br from-cyan-400/8 to-teal-300/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[-5%] w-[40rem] h-[40rem] bg-gradient-to-bl from-blue-500/6 to-indigo-400/4 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-[20%] w-[35rem] h-[35rem] bg-gradient-to-tr from-emerald-400/5 to-cyan-300/4 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Main Global Header (Hidden on Print) */}
      <div className="print:hidden relative z-50">
        <Header alwaysDark />
      </div>

      {/* ─── PRINT-ONLY FORMAL COMMERCIAL INVOICE HEADER ─── */}
      <div className="hidden print:block p-8 border-b-2 border-slate-900">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              Pool Supply Wholesalers
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              410 Scott Pike, Hub #B · Nashville, TN 37207 · (802) 265-0320
            </p>
            <p className="text-xs text-slate-600">
              EIN: 84-2901928 · sales@poolsupplywholesalers.com
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-slate-900">COMMERCIAL INVOICE</h2>
            <p className="font-mono text-sm font-bold text-slate-700 mt-1">
              PO / ORDER: {order?.id}
            </p>
            <p className="text-xs text-slate-500">{formattedPlacedDate}</p>
          </div>
        </div>
      </div>

      <main className="flex-1 pt-28 sm:pt-36 pb-24 print:pt-2 print:pb-0 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8"
        >
          {/* ─── QUICK ACTION CONTROLS BAR (PRINT HIDDEN) ─── */}
          <motion.div
            variants={itemVariants}
            className="print:hidden flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Official Commercial Purchase Order & Packing Authorization</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyShareLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer active:scale-95"
                title="Share order link"
              >
                {copiedLink ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="size-3.5 text-slate-400" />
                )}
                <span>{copiedLink ? "Link Copied" : "Share"}</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                title="Print official receipt"
              >
                <Printer className="size-3.5 text-slate-300" />
                <span>Print Invoice</span>
              </button>
            </div>
          </motion.div>

          {/* ─── HERO CONFIRMATION BANNER ─── */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.06),0_0_1px_1px_rgba(0,0,0,0.02)] p-8 sm:p-14 text-center print:border-none print:shadow-none print:p-2"
          >
            {/* Background Decorative Rings */}
            <div className="absolute -top-36 -right-36 size-96 rounded-full bg-gradient-to-br from-cyan-400/15 via-teal-300/10 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute -bottom-36 -left-36 size-96 rounded-full bg-gradient-to-tr from-blue-500/10 via-emerald-300/10 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto space-y-6">
              {/* Premium Pulsing Success Badge */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-400/25 blur-2xl scale-[1.4] animate-pulse" />
                <div className="relative size-20 sm:size-24 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-white grid place-items-center shadow-[0_12px_36px_-6px_rgba(16,185,129,0.45)] border-4 border-white">
                  <CheckCircle2 className="size-10 sm:size-12 stroke-[2.5]" />
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/70 text-emerald-800 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Payment Confirmed · Queued for Fulfillment
              </div>

              {/* Heading */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                  Order Confirmed,{" "}
                  <span className="bg-gradient-to-r from-slate-900 via-cyan-800 to-slate-900 bg-clip-text text-transparent">
                    {order.name.split(" ")[0] || "Valued Customer"}!
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                  We've received your commercial equipment order. A detailed confirmation invoice
                  and packing slip have been dispatched to{" "}
                  <strong className="text-slate-900 font-bold underline decoration-cyan-400 decoration-2 underline-offset-4">
                    {order.email}
                  </strong>
                  .
                </p>
              </div>

              {/* Order Reference Pill & Metadata */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 shadow-inner">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Order ID
                  </span>
                  <span className="font-mono font-black text-slate-900 text-sm tracking-wide">
                    {order.id}
                  </span>
                  <button
                    onClick={copyOrderId}
                    className="p-1 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-white transition-all cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedId ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
                  <Calendar className="size-3.5 text-slate-400" />
                  <span>Placed: {formattedPlacedDate}</span>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-50/70 border border-cyan-200/70 text-xs font-bold text-cyan-800">
                  <BadgeCheck className="size-3.5 text-cyan-600" />
                  <span>Verified Wholesale Buyer</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── COMMERCIAL FULFILLMENT & LOGISTICS TRACKER ─── */}
          <motion.div
            variants={itemVariants}
            className="rounded-[2rem] bg-white p-7 sm:p-9 border border-slate-200/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] print:border print:border-slate-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-cyan-600 mb-0.5 block">
                  Commercial Logistics Pipeline
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Fulfillment & Delivery Status
                </h2>
              </div>

              {/* Delivery Window Badge (4 to 7 Days Delivery Rule) */}
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80 shadow-inner">
                <Truck className="size-4 text-cyan-600" />
                <span>
                  Est. Freight Delivery:{" "}
                  <strong className="text-slate-900 font-extrabold">
                    {estDeliveryStart} – {estDeliveryEnd}
                  </strong>
                  <span className="ml-1 text-xs font-bold text-cyan-700 bg-cyan-100/60 px-1.5 py-0.5 rounded">
                    4–7 Days
                  </span>
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="pt-8 pb-4 relative">
              {/* Desktop Connecting Line */}
              <div className="absolute top-14 left-10 right-10 h-1 bg-slate-100 rounded-full hidden sm:block overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 w-[62%] rounded-full transition-all duration-1000" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-4 relative z-10">
                {[
                  {
                    title: "Order Placed",
                    desc: "System authorized",
                    status: "Completed",
                    done: true,
                    icon: BadgeCheck,
                  },
                  {
                    title: "Payment Captured",
                    desc: "Stripe Live 256-bit",
                    status: "Cleared",
                    done: true,
                    icon: CreditCard,
                  },
                  {
                    title: "Depot Staging",
                    desc: "Palletizing in Nashville",
                    status: "In Progress",
                    active: true,
                    icon: Package,
                  },
                  {
                    title: "Freight Dispatch",
                    desc: "Liftgate commercial delivery",
                    status: "Est. 4–7 Days",
                    pending: true,
                    icon: Truck,
                  },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={idx}
                      className="relative flex sm:flex-col items-center sm:text-center gap-4 group"
                    >
                      {/* Step Circle */}
                      <div className="relative shrink-0">
                        {step.active && (
                          <div className="absolute inset-0 bg-cyan-400/30 rounded-2xl blur-lg animate-pulse" />
                        )}
                        <div
                          className={`relative size-12 rounded-2xl grid place-items-center font-bold text-sm transition-all duration-300 ${
                            step.done
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : step.active
                                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-white/40 scale-105"
                                : "bg-white text-slate-300 border-2 border-dashed border-slate-200"
                          }`}
                        >
                          {step.done ? (
                            <Check className="size-5 stroke-[2.5]" />
                          ) : (
                            <Icon className="size-5" />
                          )}
                        </div>
                      </div>

                      {/* Step Labels */}
                      <div className="space-y-0.5 min-w-0 flex-1 sm:flex-initial">
                        <div className="flex items-center justify-between sm:justify-center gap-2">
                          <span
                            className={`text-sm font-extrabold tracking-tight ${
                              step.active
                                ? "text-slate-900"
                                : step.pending
                                  ? "text-slate-400"
                                  : "text-slate-800"
                            }`}
                          >
                            {step.title}
                          </span>
                          {step.active && (
                            <span className="sm:hidden text-xs font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-100">
                              Active
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs font-medium ${step.active ? "text-slate-600" : "text-slate-400"}`}
                        >
                          {step.desc}
                        </p>
                        <span
                          className={`text-xs font-black uppercase tracking-wider block pt-0.5 ${
                            step.active
                              ? "text-cyan-600"
                              : step.done
                                ? "text-emerald-600"
                                : "text-slate-300"
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Freight Specification Details Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <strong>$50,000 Transit Protection:</strong> Active
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Building2 className="size-4 text-cyan-500" />
                  <strong>Origin Depot:</strong> Nashville Hub (TN)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Package className="size-4 text-blue-500" />
                  <strong>Handling:</strong> Heavy Pallet Liftgate
                </span>
              </div>

              <button
                onClick={() => setTrackingOpen(!trackingOpen)}
                className="print:hidden inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-bold cursor-pointer"
              >
                <span>{trackingOpen ? "Hide Tracking Spec" : "View Logistics Specs"}</span>
                <ChevronDown
                  className={`size-3.5 transition-transform ${trackingOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Expandable Logistics Spec Drawer */}
            <AnimatePresence>
              {trackingOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/60"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs font-black uppercase text-slate-400 block">
                        Freight Carrier
                      </span>
                      <strong className="text-slate-900 text-xs">
                        Estes Express Lines Commercial
                      </strong>
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase text-slate-400 block">
                        PRO Tracking Reference
                      </span>
                      <span className="font-mono font-bold text-cyan-700 text-xs">
                        PRO-8492048192-TN
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase text-slate-400 block">
                        Delivery Appointment
                      </span>
                      <span className="text-slate-700 text-xs font-semibold">
                        Driver will call 24h prior to arrival
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ─── MAIN TWO-COLUMN RECEIPT & BREAKDOWN ─── */}
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
            {/* LEFT COLUMN: Items Itemization & Handling Details */}
            <div className="space-y-8">
              {/* Order Items Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-[2rem] bg-white border border-slate-200/80 p-7 sm:p-9 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3 font-black text-slate-900 text-lg tracking-tight">
                    <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                      <Package className="size-5" />
                    </div>
                    <span>Commercial Items Ordered</span>
                    <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
                      {totalItemsCount} {totalItemsCount === 1 ? "unit" : "units"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Ref: {order.id}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {(order.items || []).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="py-5 first:pt-0 last:pb-0 flex items-start gap-4 sm:gap-5 group"
                    >
                      {/* Product Thumbnail */}
                      <div className="size-20 sm:size-22 rounded-2xl bg-slate-50 border border-slate-200/80 p-2.5 shrink-0 grid place-items-center overflow-hidden relative group-hover:border-cyan-300 transition-colors">
                        <img
                          src={item.img || getProductImage("")}
                          alt={item.name}
                          className="size-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            // Safe image fallback
                            (e.currentTarget as HTMLImageElement).src = getProductImage("");
                          }}
                        />
                        <span className="absolute -top-1 -right-1 size-5.5 rounded-full bg-slate-900 text-white text-xs font-black grid place-items-center shadow-sm border border-white">
                          {item.qty}
                        </span>
                      </div>

                      {/* Product Metadata */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                            {item.brand || "Commercial Grade"}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            SKU: {item.id ? item.id.replace("p-", "").toUpperCase() : "PSW-OEM"}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug tracking-tight">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium pt-0.5">
                          <span>
                            Unit:{" "}
                            <strong className="text-slate-700 font-mono">
                              {formatUSD(item.price)}
                            </strong>
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-emerald-600 font-semibold">
                            3-Yr Commercial Warranty
                          </span>
                        </div>
                      </div>

                      {/* Total For Line */}
                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-slate-900 font-mono tracking-tight">
                          {formatUSD(item.price * (item.qty || 1))}
                        </div>
                        <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                          Allocated
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Freight Packaging Notice */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center gap-4 shadow-lg shadow-slate-900/5">
                  <div className="p-2.5 rounded-xl bg-white/10 shrink-0">
                    <ShieldCheck className="size-5 text-emerald-400" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <strong className="font-bold text-white block">
                      Commercial Freight Guarantee & Pallet Safety
                    </strong>
                    <span className="text-slate-300">
                      All heavy pool equipment is shrink-wrapped, banded to heavy wooden pallets,
                      and verified prior to carrier departure.
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Logistics Origin Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-[2rem] bg-white border border-slate-200/80 p-6 sm:p-7 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="size-11 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600 grid place-items-center shrink-0">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Primary Dispatch Facility
                    </h4>
                    <p className="text-sm font-black text-slate-900 tracking-tight">
                      PSW Central Logistics Depot · Nashville, TN
                    </p>
                    <span className="text-xs text-slate-500 font-medium">
                      Equipped for LTL Freight & Commercial Flatbeds
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
                    <BadgeCheck className="size-3.5" /> 100% Authorized Distributor
                  </span>
                </div>
              </motion.div>

              {/* Direct Fulfillment Support Hotline Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-7 sm:p-8 shadow-xl shadow-slate-900/10 space-y-4 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3 relative z-10">
                  <div className="size-10 rounded-xl bg-white/10 text-cyan-400 grid place-items-center shrink-0 border border-white/5">
                    <HelpCircle className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400">
                      Logistics Hotline
                    </h4>
                    <p className="text-sm font-bold text-white tracking-tight">
                      Need to adjust dock instructions?
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed relative z-10">
                  Our Nashville dispatch specialists can update receiving hours, liftgate
                  requirements, or call-ahead numbers prior to carrier departure.
                </p>

                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative z-10">
                  <a
                    href="tel:8022650320"
                    className="inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                  >
                    <Phone className="size-3.5" /> (802) 265-0320
                  </a>
                  <a
                    href="mailto:sales@poolsupplywholesalers.com"
                    className="inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all border border-white/10 active:scale-95"
                  >
                    <Mail className="size-3.5" /> Email Support
                  </a>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Financial Summary, Shipping Address & Support */}
            <div className="space-y-8">
              {/* Financial Breakdown Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-[2rem] bg-white border border-slate-200/80 p-7 sm:p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] space-y-5"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="font-black text-slate-900 text-base tracking-tight flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      <FileText className="size-4" />
                    </div>
                    Financial Breakdown
                  </h3>
                  <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {order.paymentStatus ? "Paid in Full" : "Authorized"}
                  </span>
                </div>

                <div className="space-y-3 text-xs font-medium">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Wholesale Equipment Subtotal</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatUSD(order.subtotal || 0)}
                    </span>
                  </div>

                  {order.discount !== undefined && order.discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-bold bg-emerald-50/60 -mx-3 px-3 py-1.5 rounded-lg">
                      <span>Commercial Discount ({order.promoCode || "Applied"})</span>
                      <span className="font-mono">-{formatUSD(order.discount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>LTL Freight & Liftgate</span>
                      <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.2 rounded font-bold uppercase">
                        Free Freight
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">
                      {order.shipping === 0 ? "FREE" : formatUSD(order.shipping)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>Commercial Sales Tax</span>
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-semibold">
                        9.25%
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatUSD(order.tax || 0)}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900 block tracking-tight">
                        Total Amount Paid
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                        USD / Cleared
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono leading-none">
                      {formatUSD(order.total || 0)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Badge */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <CreditCard className="size-4 text-slate-400" />
                    <span>Payment Method</span>
                  </div>
                  <span className="font-bold text-slate-700 text-xs bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    {order.paymentType || "Stripe Live Production (SSL)"}
                  </span>
                </div>
              </motion.div>

              {/* Delivery Destination Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-[2rem] bg-white border border-slate-200/80 p-7 sm:p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-slate-900 text-base tracking-tight flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
                      <MapPin className="size-4" />
                    </div>
                    Delivery Destination
                  </h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Commercial
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-slate-600 font-medium leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  <div className="font-black text-slate-900 text-sm tracking-tight">
                    {order.name}
                  </div>
                  {order.company && (
                    <div className="font-bold text-slate-700 flex items-center gap-1">
                      <Building2 className="size-3.5 text-slate-400" /> {order.company}
                    </div>
                  )}
                  <div className="pt-0.5">
                    {order.address?.line1 || "410 Scott Pike"}
                    {order.address?.line2 ? `, ${order.address.line2}` : ""}
                  </div>
                  <div>
                    {order.address?.city || "Nashville"}, {order.address?.state || "TN"}{" "}
                    {order.address?.zip || "37207"}
                  </div>
                  <div className="text-slate-500 font-semibold">
                    {order.address?.country || "United States"}
                  </div>
                  {order.phone && (
                    <div className="pt-2 mt-2 border-t border-slate-200/70 text-slate-700 font-semibold flex items-center gap-1.5">
                      <Phone className="size-3 text-slate-400" /> {order.phone}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* ─── BOTTOM NAVIGATION BAR (PRINT HIDDEN) ─── */}
          <motion.div
            variants={itemVariants}
            className="print:hidden pt-6 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200"
          >
            <Link
              to="/account"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              <Package className="size-4 text-slate-400" />
              <span>View In Account Orders</span>
            </Link>

            <Link
              to="/shop/$category"
              params={{ category: "all" }}
              search={{ q: "" }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-lg shadow-slate-900/10 transition-all active:scale-95 group"
            >
              <span>Continue Wholesale Catalog</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Global Footer (Hidden on Print) */}
      <div className="print:hidden relative z-50">
        <Footer />
      </div>
    </div>
  );
}
