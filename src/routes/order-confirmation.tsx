import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Mail, ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { formatUSD, type CartItem } from "@/components/site/cart-context";

type Order = {
  id: string;
  placedAt: string;
  email: string;
  name: string;
  address: { line1: string; line2: string; city: string; state: string; zip: string; country: string };
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;
  promoCode?: string | null;
  method: "standard" | "express";
};

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => ({
    meta: [
      { title: "Order Confirmed — Pool Supply Wholesalers" },
      { name: "description", content: "Your Pool Supply Wholesalers order has been confirmed." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { id } = Route.useSearch();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("aquapro_last_order");
      if (raw) {
        const o = JSON.parse(raw);
        if (o && typeof o === "object") {
          const sanitized: Order = {
            id: typeof o.id === "string" ? o.id : id || "AQ-UNKNOWN",
            placedAt: typeof o.placedAt === "string" ? o.placedAt : new Date().toISOString(),
            email: typeof o.email === "string" ? o.email : "",
            name: typeof o.name === "string" ? o.name : "Valued Customer",
            address: {
              line1: typeof o.address?.line1 === "string" ? o.address.line1 : "No street address",
              line2: typeof o.address?.line2 === "string" ? o.address.line2 : "",
              city: typeof o.address?.city === "string" ? o.address.city : "",
              state: typeof o.address?.state === "string" ? o.address.state : "",
              zip: typeof o.address?.zip === "string" ? o.address.zip : "",
              country: typeof o.address?.country === "string" ? o.address.country : "United States"
            },
            items: Array.isArray(o.items) ? o.items : [],
            subtotal: typeof o.subtotal === "number" ? o.subtotal : 0,
            shipping: typeof o.shipping === "number" ? o.shipping : 0,
            tax: typeof o.tax === "number" ? o.tax : 0,
            total: typeof o.total === "number" ? o.total : 0,
            discount: typeof o.discount === "number" ? o.discount : 0,
            promoCode: o.promoCode,
            method: o.method === "express" ? "express" : "standard"
          };
          if (!id || sanitized.id === id) setOrder(sanitized);
        }
      }
    } catch (e) {
      console.error("Failed to parse last order details", e);
    }
  }, [id]);

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (order?.method === "express" ? 2 : 5));

  return (
    <div className="min-h-screen bg-background">
      <Header alwaysDark />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <div className="relative inline-grid place-items-center">
              <div className="absolute inset-0 rounded-full bg-gradient-ocean opacity-20 blur-2xl scale-150" />
              <div className="relative size-20 rounded-full bg-gradient-ocean text-white grid place-items-center shadow-[var(--shadow-float)]">
                <CheckCircle2 className="size-10" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl lg:text-5xl font-extrabold tracking-tight">Order confirmed</h1>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Thanks{order?.name ? `, ${order.name.split(" ")[0]}` : ""}! Your order has been received and a confirmation has been sent to your email.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 rounded-3xl border border-border bg-white shadow-[var(--shadow-soft)] overflow-hidden"
          >
            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <Stat label="Order #" value={order?.id ?? id ?? "—"} />
              <Stat label="Placed" value={order ? new Date(order.placedAt).toLocaleDateString() : new Date().toLocaleDateString()} />
              <Stat label="Estimated delivery" value={deliveryDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })} />
            </div>

            {order && (
              <>
                <div className="p-6 lg:p-8 border-t border-border">
                  <h2 className="flex items-center gap-2 font-bold tracking-tight text-lg mb-4">
                    <Package className="size-5 text-[oklch(0.50_0.14_232)]" /> Items
                  </h2>
                  <ul className="divide-y divide-border">
                    {order.items.map((it) => (
                      <li key={it.id} className="flex gap-4 py-3">
                        <div className="size-16 rounded-xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] grid place-items-center overflow-hidden shrink-0">
                          <img src={it.img} alt={it.name} className="size-full object-contain p-2" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{it.brand}</div>
                          <div className="text-sm font-semibold leading-snug">{it.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Qty: {it.qty}</div>
                        </div>
                        <div className="font-bold tracking-tight">{formatUSD(it.price * it.qty)}</div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 grid sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Shipping to</h3>
                      <address className="not-italic text-sm leading-relaxed">
                        {order.name}<br />
                        {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                        {order.address.city}, {order.address.state} {order.address.zip}<br />
                        {order.address.country}
                      </address>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</h3>
                      <div className="space-y-1.5 text-sm">
                        <Row label="Subtotal" value={formatUSD(order.subtotal)} />
                        {order.discount !== undefined && order.discount > 0 && (
                          <Row label={`Discount (${order.promoCode || "Applied"})`} value={`-${formatUSD(order.discount)}`} className="text-green-600 font-medium" />
                        )}
                        <Row label="Shipping" value={order.shipping === 0 ? "Free" : formatUSD(order.shipping)} muted />
                        <Row label="Tax" value={formatUSD(order.tax)} muted />
                        <div className="h-px bg-border my-1" />
                        <Row label="Total" value={formatUSD(order.total)} bold />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          <div className="mt-8 flex flex-wrap gap-3 items-center justify-between">
            <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
              <Mail className="size-4" /> {order?.email ? <>Receipt sent to <strong className="text-foreground">{order.email}</strong></> : "A receipt has been sent to your email."}
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-ocean text-white font-semibold shadow-[var(--shadow-soft)] hover:opacity-95 transition">
              Continue shopping <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 text-center">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
      <div className="mt-1 font-bold tracking-tight">{value}</div>
    </div>
  );
}

function Row({ label, value, muted, bold, className }: { label: string; value: string; muted?: boolean; bold?: boolean; className?: string }) {
  return (
    <div className={`flex items-center justify-between ${muted ? "text-muted-foreground" : ""} ${bold ? "text-base font-bold text-foreground" : ""} ${className || ""}`}>
      <span>{label}</span>
      <span className={bold ? "tracking-tight" : ""}>{value}</span>
    </div>
  );
}
