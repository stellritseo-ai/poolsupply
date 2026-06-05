import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
import { S as ShoppingBag, X, M as Minus, P as Plus, T as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const appCss = "/assets/styles-CqpOCDJ2.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const Ctx = reactExports.createContext(null);
const KEY = "aquapro_cart_v1";
function CartProvider({ children }) {
  const [items, setItems] = reactExports.useState([]);
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [hydrated, setHydrated] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {
    }
    setHydrated(true);
  }, []);
  reactExports.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
    }
  }, [items, hydrated]);
  const value = reactExports.useMemo(() => ({
    items,
    add: (item, qty = 1) => {
      setItems((prev) => {
        const ex = prev.find((p) => p.id === item.id);
        if (ex) return prev.map((p) => p.id === item.id ? { ...p, qty: p.qty + qty } : p);
        return [...prev, { ...item, qty }];
      });
      setIsOpen(true);
    },
    remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
    setQty: (id, qty) => setItems(
      (prev) => qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => p.id === id ? { ...p, qty } : p)
    ),
    clear: () => setItems([]),
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }), [items, isOpen]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value, children });
}
function useCart() {
  const c = reactExports.useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
const SHIPPING_FLAT = 19.99;
const SHIPPING_FREE_OVER = 500;
const TAX_RATE = 0.0875;
function computeTotals(subtotal) {
  const shipping = subtotal === 0 ? 0 : subtotal >= SHIPPING_FREE_OVER ? 0 : SHIPPING_FLAT;
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);
  return { shipping, tax, total };
}
function formatUSD(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function CartDrawer() {
  const { items, isOpen, close, setQty, remove, subtotal } = useCart();
  const { shipping, tax, total } = computeTotals(subtotal);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: close,
        className: "fixed inset-0 z-[60] bg-[oklch(0.18_0.02_256/0.45)] backdrop-blur-sm"
      },
      "overlay"
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.aside,
      {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { type: "spring", stiffness: 320, damping: 36 },
        className: "fixed top-0 right-0 bottom-0 z-[61] w-full sm:w-[440px] bg-white shadow-[var(--shadow-float)] flex flex-col",
        role: "dialog",
        "aria-label": "Shopping cart",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between px-6 py-5 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "size-5 text-[oklch(0.50_0.14_232)]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold tracking-tight text-lg", children: "Your Cart" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
                "(",
                items.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Close cart", onClick: close, className: "size-9 grid place-items-center rounded-full hover:bg-muted transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-6 py-4", children: items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center py-20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-16 rounded-full bg-muted grid place-items-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "size-7 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Your cart is empty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-[260px]", children: "Browse our pumps, heaters and automation to get started." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: close, className: "mt-6 px-5 py-2.5 rounded-full bg-gradient-ocean text-white text-sm font-semibold", children: "Continue Shopping" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3 p-3 rounded-2xl border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-20 shrink-0 rounded-xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] grid place-items-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: it.img, alt: it.name, className: "size-full object-contain p-2 mix-blend-multiply" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold", children: it.brand }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm leading-snug line-clamp-2", children: it.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center bg-muted/60 rounded-full p-0.5 border border-border/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "aria-label": "Decrease quantity",
                      onClick: () => setQty(it.id, it.qty - 1),
                      className: "size-7 grid place-items-center hover:bg-white hover:shadow-sm rounded-full text-foreground/80 hover:text-foreground transition-all active:scale-90",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "size-3" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-center text-sm font-bold text-foreground tabular-nums select-none", children: it.qty }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "aria-label": "Increase quantity",
                      onClick: () => setQty(it.id, it.qty + 1),
                      className: "size-7 grid place-items-center hover:bg-white hover:shadow-sm rounded-full text-foreground/80 hover:text-foreground transition-all active:scale-90",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold tracking-tight", children: formatUSD(it.price * it.qty) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Remove", onClick: () => remove(it.id), className: "size-8 self-start grid place-items-center text-muted-foreground hover:text-destructive transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
          ] }, it.id)) }) }),
          items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "border-t border-border px-6 py-5 space-y-3 bg-surface", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Subtotal", value: formatUSD(subtotal) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Shipping", value: shipping === 0 ? "Free" : formatUSD(shipping), muted: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: `Estimated tax (${(0.0875 * 100).toFixed(2)}%)`, value: formatUSD(tax), muted: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border my-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Total", value: formatUSD(total), bold: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/checkout",
                onClick: close,
                className: "mt-2 block text-center py-4 rounded-full bg-gradient-ocean text-white font-semibold shadow-[var(--shadow-soft)] hover:opacity-95 transition",
                children: [
                  "Checkout · ",
                  formatUSD(total)
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: close, className: "w-full text-center py-2 text-sm text-muted-foreground hover:text-foreground transition", children: "Continue shopping" })
          ] })
        ]
      },
      "drawer"
    )
  ] }) });
}
function Row({ label, value, muted, bold }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center justify-between text-sm ${muted ? "text-muted-foreground" : ""} ${bold ? "text-base font-bold text-foreground" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: bold ? "tracking-tight" : "", children: value })
  ] });
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$3 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pool Supply Wholesalers — Premium Pool Equipment at Wholesale Prices" },
      { name: "description", content: "Trusted wholesale supplier of premium pool pumps, heaters, filters, cleaners, lights and automation from Pentair, Hayward, Jandy and more." },
      { name: "author", content: "Pool Supply Wholesalers" },
      { property: "og:title", content: "Pool Supply Wholesalers — Premium Pool Equipment Wholesale" },
      { property: "og:description", content: "Pool pumps, heaters, filters, cleaners and automation systems from the industry's leading brands at wholesale pricing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$3.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CartProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CartDrawer, {})
  ] }) });
}
const $$splitComponentImporter$2 = () => import("./order-confirmation-BDhsBoym.mjs");
const Route$2 = createFileRoute("/order-confirmation")({
  validateSearch: (s) => ({
    id: typeof s.id === "string" ? s.id : void 0
  }),
  head: () => ({
    meta: [{
      title: "Order Confirmed — Pool Supply Wholesalers"
    }, {
      name: "description",
      content: "Your Pool Supply Wholesalers order has been confirmed."
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./checkout-C4jwWyox.mjs");
const Route$1 = createFileRoute("/checkout")({
  head: () => ({
    meta: [{
      title: "Checkout — Pool Supply Wholesalers"
    }, {
      name: "description",
      content: "Securely complete your Pool Supply Wholesalers pool equipment order."
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-DeJpp2gk.mjs");
const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Pool Supply Wholesalers — Premium Pool Equipment at Wholesale Prices"
    }, {
      name: "description",
      content: "Wholesale pool pumps, heaters, filters, cleaners, lights and automation from Pentair, Hayward, Jandy, Raypak and more. Trusted by 5,000+ pool professionals."
    }, {
      property: "og:title",
      content: "Pool Supply Wholesalers — Premium Pool Equipment Wholesale"
    }, {
      property: "og:description",
      content: "Wholesale pool equipment from the industry's leading brands. Fast shipping, expert support, professional pricing."
    }],
    links: [{
      rel: "canonical",
      href: "/"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const OrderConfirmationRoute = Route$2.update({
  id: "/order-confirmation",
  path: "/order-confirmation",
  getParentRoute: () => Route$3
});
const CheckoutRoute = Route$1.update({
  id: "/checkout",
  path: "/checkout",
  getParentRoute: () => Route$3
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$3
});
const rootRouteChildren = {
  IndexRoute,
  CheckoutRoute,
  OrderConfirmationRoute
};
const routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$2 as R,
  SHIPPING_FREE_OVER as S,
  formatUSD as f,
  router as r,
  useCart as u
};
