import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { H as Header, F as Footer } from "./Footer-ByV1nwUH.mjs";
import { R as Route$2, f as formatUSD } from "./router-DePSa50g.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { C as CircleCheck, a as Package, b as Mail, A as ArrowRight } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function ConfirmationPage() {
  const {
    id
  } = Route$2.useSearch();
  const [order, setOrder] = reactExports.useState(null);
  reactExports.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("aquapro_last_order");
      if (raw) {
        const o = JSON.parse(raw);
        if (!id || o.id === id) setOrder(o);
      }
    } catch {
    }
  }, [id]);
  const deliveryDate = /* @__PURE__ */ new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (order?.method === "express" ? 2 : 5));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { alwaysDark: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "pt-28 pb-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        scale: 0.9
      }, animate: {
        opacity: 1,
        scale: 1
      }, transition: {
        duration: 0.5,
        ease: "easeOut"
      }, className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-grid place-items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full bg-gradient-ocean opacity-20 blur-2xl scale-150" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-20 rounded-full bg-gradient-ocean text-white grid place-items-center shadow-[var(--shadow-float)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-10" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-6 text-4xl lg:text-5xl font-extrabold tracking-tight", children: "Order confirmed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-muted-foreground max-w-md mx-auto", children: [
          "Thanks",
          order?.name ? `, ${order.name.split(" ")[0]}` : "",
          "! Your order has been received and a confirmation has been sent to your email."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 20
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        duration: 0.5,
        delay: 0.15
      }, className: "mt-10 rounded-3xl border border-border bg-white shadow-[var(--shadow-soft)] overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Order #", value: order?.id ?? id ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Placed", value: order ? new Date(order.placedAt).toLocaleDateString() : (/* @__PURE__ */ new Date()).toLocaleDateString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Estimated delivery", value: deliveryDate.toLocaleDateString(void 0, {
            month: "short",
            day: "numeric"
          }) })
        ] }),
        order && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 lg:p-8 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 font-bold tracking-tight text-lg mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "size-5 text-[oklch(0.50_0.14_232)]" }),
            " Items"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: order.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-16 rounded-xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] grid place-items-center overflow-hidden shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: it.img, alt: it.name, className: "size-full object-contain p-2" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold", children: it.brand }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold leading-snug", children: it.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                "Qty: ",
                it.qty
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold tracking-tight", children: formatUSD(it.price * it.qty) })
          ] }, it.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid sm:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2", children: "Shipping to" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("address", { className: "not-italic text-sm leading-relaxed", children: [
                order.name,
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                order.address.line1,
                order.address.line2 ? `, ${order.address.line2}` : "",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                order.address.city,
                ", ",
                order.address.state,
                " ",
                order.address.zip,
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                order.address.country
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2", children: "Summary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Subtotal", value: formatUSD(order.subtotal) }),
                order.discount !== void 0 && order.discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: `Discount (${order.promoCode || "Applied"})`, value: `-${formatUSD(order.discount)}`, className: "text-green-600 font-medium" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Shipping", value: order.shipping === 0 ? "Free" : formatUSD(order.shipping), muted: true }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Tax", value: formatUSD(order.tax), muted: true }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border my-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Total", value: formatUSD(order.total), bold: true })
              ] })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-3 items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground inline-flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "size-4" }),
          " ",
          order?.email ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "Receipt sent to ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: order.email })
          ] }) : "A receipt has been sent to your email."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-ocean text-white font-semibold shadow-[var(--shadow-soft)] hover:opacity-95 transition", children: [
          "Continue shopping ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-widest text-muted-foreground font-semibold", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-bold tracking-tight", children: value })
  ] });
}
function Row({
  label,
  value,
  muted,
  bold,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center justify-between ${muted ? "text-muted-foreground" : ""} ${bold ? "text-base font-bold text-foreground" : ""} ${className || ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: bold ? "tracking-tight" : "", children: value })
  ] });
}
export {
  ConfirmationPage as component
};
