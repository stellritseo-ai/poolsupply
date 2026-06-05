import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { H as Header, F as Footer } from "./Footer-ByV1nwUH.mjs";
import { u as useCart, S as SHIPPING_FREE_OVER, f as formatUSD } from "./router-DePSa50g.mjs";
import { c as ChevronLeft, L as Lock, d as Truck, e as CreditCard, f as ShieldCheck } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
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
const INITIAL = {
  email: "",
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  phone: "",
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  method: "standard"
};
function CheckoutPage() {
  const {
    items,
    subtotal,
    clear
  } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = reactExports.useState(INITIAL);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [promoInput, setPromoInput] = reactExports.useState("");
  const [appliedPromo, setAppliedPromo] = reactExports.useState(null);
  const [promoError, setPromoError] = reactExports.useState(null);
  const expressFee = 39.99;
  let discount = 0;
  let isFreeShipping = false;
  if (appliedPromo) {
    const promoUpper = appliedPromo.toUpperCase();
    if (promoUpper === "PROMO10" || promoUpper === "POOL10") {
      discount = +(subtotal * 0.1).toFixed(2);
    } else if (promoUpper === "SAVE20") {
      discount = Math.min(20, subtotal);
    } else if (promoUpper === "FREESHIP") {
      isFreeShipping = true;
    }
  }
  const stateUpper = form.state.trim().toUpperCase();
  let taxRate = 0.07;
  if (stateUpper === "TN" || stateUpper === "TENNESSEE") {
    taxRate = 0.0925;
  } else if (stateUpper === "CA" || stateUpper === "CALIFORNIA") {
    taxRate = 0.0825;
  } else if (stateUpper === "NY" || stateUpper === "NEW YORK") {
    taxRate = 0.08875;
  } else if (stateUpper === "TX" || stateUpper === "TEXAS") {
    taxRate = 0.0625;
  } else if (stateUpper === "FL" || stateUpper === "FLORIDA") {
    taxRate = 0.06;
  } else if (!form.state) {
    taxRate = 0;
  }
  let shipping = 0;
  let stdShipping = 19.99;
  if (subtotal > 0 && !isFreeShipping) {
    const isOutlying = stateUpper === "HI" || stateUpper === "HAWAII" || stateUpper === "AK" || stateUpper === "ALASKA";
    const isLocal = stateUpper === "TN" || stateUpper === "TENNESSEE";
    if (isLocal) stdShipping = 9.99;
    else if (isOutlying) stdShipping = 49.99;
    if (form.method === "express") {
      if (isLocal) shipping = 19.99;
      else if (isOutlying) shipping = 79.99;
      else shipping = 39.99;
    } else {
      if (subtotal >= SHIPPING_FREE_OVER) {
        shipping = 0;
      } else {
        shipping = stdShipping;
      }
    }
  }
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = +(discountedSubtotal * taxRate).toFixed(2);
  const total = +(discountedSubtotal + shipping + tax).toFixed(2);
  const taxLabel = form.state ? `Tax (${stateUpper} ${(taxRate * 100).toFixed(2)}%)` : "Tax (est.)";
  const set = (k, v) => setForm((f) => ({
    ...f,
    [k]: v
  }));
  function onSubmit(e) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    const orderId = "AQ-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const order = {
      id: orderId,
      placedAt: (/* @__PURE__ */ new Date()).toISOString(),
      email: form.email,
      name: `${form.firstName} ${form.lastName}`.trim(),
      address: {
        line1: form.address1,
        line2: form.address2,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country
      },
      items,
      subtotal,
      shipping,
      tax,
      total,
      discount,
      promoCode: appliedPromo,
      method: form.method
    };
    try {
      window.localStorage.setItem("aquapro_last_order", JSON.stringify(order));
    } catch {
    }
    setTimeout(() => {
      clear();
      navigate({
        to: "/order-confirmation",
        search: {
          id: orderId
        }
      });
    }, 700);
  }
  if (items.length === 0 && !submitting) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { alwaysDark: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 grid place-items-center px-6 pt-32 pb-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-extrabold tracking-tight", children: "Your cart is empty" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Add a few products before heading to checkout." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-ocean text-white font-semibold", children: "Continue shopping" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { alwaysDark: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "pt-28 pb-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "size-4" }),
        " Back to store"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between flex-wrap gap-3 mb-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl lg:text-5xl font-extrabold tracking-tight", children: "Checkout" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-4" }),
          " Secure SSL · Test environment"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "grid lg:grid-cols-[1fr_420px] gap-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: Truck, title: "Contact & Shipping", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Email", type: "email", required: true, value: form.email, onChange: (v) => set("email", v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "First name", required: true, value: form.firstName, onChange: (v) => set("firstName", v) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Last name", required: true, value: form.lastName, onChange: (v) => set("lastName", v) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Company (optional)", value: form.company, onChange: (v) => set("company", v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Street address", required: true, value: form.address1, onChange: (v) => set("address1", v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Apt, suite, etc. (optional)", value: form.address2, onChange: (v) => set("address2", v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "City", required: true, value: form.city, onChange: (v) => set("city", v) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "State", required: true, value: form.state, onChange: (v) => set("state", v) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "ZIP", required: true, value: form.zip, onChange: (v) => set("zip", v) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Country", required: true, value: form.country, onChange: (v) => set("country", v) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Phone", type: "tel", required: true, value: form.phone, onChange: (v) => set("phone", v) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: Truck, title: "Shipping Method", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { selected: form.method === "standard", onClick: () => set("method", "standard"), title: "Standard Shipping", desc: "3–5 business days", price: subtotal >= SHIPPING_FREE_OVER ? "Free" : formatUSD(stdShipping) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { selected: form.method === "express", onClick: () => set("method", "express"), title: "Express Shipping", desc: "1–2 business days", price: formatUSD(expressFee) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { icon: CreditCard, title: "Payment Details", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Name on card", required: true, value: form.cardName, onChange: (v) => set("cardName", v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Card number", required: true, placeholder: "4242 4242 4242 4242", value: form.cardNumber, onChange: (v) => set("cardNumber", v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "Expiry (MM/YY)", required: true, placeholder: "12/28", value: form.expiry, onChange: (v) => set("expiry", v) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { label: "CVC", required: true, placeholder: "123", value: form.cvc, onChange: (v) => set("cvc", v) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-3.5" }),
              " Payment is a placeholder — no card is charged in this demo."
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "lg:sticky lg:top-28 h-fit", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 20
        }, animate: {
          opacity: 1,
          y: 0
        }, className: "rounded-3xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold tracking-tight text-lg mb-4", children: "Order Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border max-h-72 overflow-y-auto -mx-2 px-2", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-14 shrink-0 rounded-xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] grid place-items-center overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: it.img, alt: it.name, className: "size-full object-contain p-1.5 mix-blend-multiply" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-foreground text-background text-[10px] font-bold grid place-items-center", children: it.qty })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold", children: it.brand }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium leading-snug line-clamp-2", children: it.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold whitespace-nowrap", children: formatUSD(it.price * it.qty) })
          ] }, it.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Promo code (POOL10, SAVE20)", value: promoInput, onChange: (e) => {
                setPromoInput(e.target.value);
                setPromoError(null);
              }, className: "flex-1 h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all uppercase" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
                const code = promoInput.trim().toUpperCase();
                if (!code) return;
                if (code === "PROMO10" || code === "POOL10" || code === "SAVE20" || code === "FREESHIP") {
                  setAppliedPromo(code);
                  setPromoError(null);
                  setPromoInput("");
                } else {
                  setPromoError("Invalid code");
                }
              }, className: "px-4 h-10 rounded-xl bg-muted text-xs font-semibold hover:bg-muted/80 hover:text-foreground active:scale-95 transition-all animate-shimmer", children: "Apply" })
            ] }),
            promoError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-xs text-destructive font-medium", children: promoError }),
            appliedPromo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between bg-green-50 border border-green-100 text-green-800 px-3 py-1.5 rounded-xl text-xs font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Applied: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: appliedPromo })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAppliedPromo(null), className: "text-green-600 hover:text-green-800 underline font-semibold ml-2", children: "Remove" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-2.5 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Subtotal", value: formatUSD(subtotal) }),
            discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: `Discount (${appliedPromo})`, value: `-${formatUSD(discount)}`, className: "text-green-600 font-medium" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Shipping", value: shipping === 0 ? "Free" : formatUSD(shipping), muted: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: taxLabel, value: formatUSD(tax), muted: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border my-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Total", value: formatUSD(total), bold: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: submitting, className: "mt-6 w-full py-4 rounded-full bg-gradient-ocean text-white font-semibold shadow-[var(--shadow-float)] hover:shadow-[0_20px_40px_-15px_rgba(0,109,171,0.35)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.99] disabled:opacity-60 disabled:transform-none disabled:shadow-none", children: submitting ? "Placing order…" : `Place Order · ${formatUSD(total)}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[11px] text-muted-foreground text-center", children: "By placing your order you agree to Pool Supply Wholesalers' Terms & Privacy Policy." })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function Section({
  icon: Icon,
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl border border-border bg-white p-6 lg:p-8 shadow-[var(--shadow-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 font-bold tracking-tight text-lg mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-9 rounded-xl bg-gradient-ocean text-white grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }) }),
      title
    ] }),
    children
  ] });
}
function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, required, placeholder, value, onChange: (e) => onChange(e.target.value), className: "w-full h-12 px-4 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200" })
  ] });
}
function Radio({
  selected,
  onClick,
  title,
  desc,
  price
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick, className: `flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.99] ${selected ? "border-primary bg-accent/40 shadow-[var(--shadow-soft)]" : "border-border hover:border-foreground/20 hover:bg-surface/50"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `size-5 rounded-full border-2 grid place-items-center transition-all ${selected ? "border-primary" : "border-border"}`, children: selected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2.5 rounded-full bg-gradient-ocean" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: desc })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold tracking-tight text-sm", children: price })
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
  CheckoutPage as component
};
