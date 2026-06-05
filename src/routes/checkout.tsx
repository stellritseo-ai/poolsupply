import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Lock, CreditCard, Truck, ShieldCheck } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { computeTotals, formatUSD, useCart, SHIPPING_FREE_OVER } from "@/components/site/cart-context";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Pool Supply Wholesalers" },
      { name: "description", content: "Securely complete your Pool Supply Wholesalers pool equipment order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

type FormState = {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  method: "standard" | "express";
};

const INITIAL: FormState = {
  email: "", firstName: "", lastName: "", company: "",
  address1: "", address2: "", city: "", state: "", zip: "", country: "United States",
  phone: "", cardName: "", cardNumber: "", expiry: "", cvc: "",
  method: "standard",
};

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

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

  // Determine state-based tax rate
  const stateUpper = form.state.trim().toUpperCase();
  let taxRate = 0.07; // Default 7% tax rate
  if (stateUpper === "TN" || stateUpper === "TENNESSEE") {
    taxRate = 0.0925; // 9.25% TN local rate
  } else if (stateUpper === "CA" || stateUpper === "CALIFORNIA") {
    taxRate = 0.0825; // 8.25% CA rate
  } else if (stateUpper === "NY" || stateUpper === "NEW YORK") {
    taxRate = 0.08875; // 8.875% NY rate
  } else if (stateUpper === "TX" || stateUpper === "TEXAS") {
    taxRate = 0.0625; // 6.25% TX rate
  } else if (stateUpper === "FL" || stateUpper === "FLORIDA") {
    taxRate = 0.06; // 6.0% FL rate
  } else if (!form.state) {
    taxRate = 0; // No tax if state is empty
  }

  // Determine shipping cost based on state and method
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
      // Standard shipping
      if (subtotal >= SHIPPING_FREE_OVER) {
        shipping = 0; // Free over $500
      } else {
        shipping = stdShipping;
      }
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = +(discountedSubtotal * taxRate).toFixed(2);
  const total = +(discountedSubtotal + shipping + tax).toFixed(2);

  const taxLabel = form.state 
    ? `Tax (${stateUpper} ${(taxRate * 100).toFixed(2)}%)` 
    : "Tax (est.)";

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    const orderId = "AQ-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const order = {
      id: orderId,
      placedAt: new Date().toISOString(),
      email: form.email,
      name: `${form.firstName} ${form.lastName}`.trim(),
      address: { line1: form.address1, line2: form.address2, city: form.city, state: form.state, zip: form.zip, country: form.country },
      items,
      subtotal, shipping, tax, total,
      discount,
      promoCode: appliedPromo,
      method: form.method,
    };
    try { window.localStorage.setItem("aquapro_last_order", JSON.stringify(order)); } catch {}
    setTimeout(() => {
      clear();
      navigate({ to: "/order-confirmation", search: { id: orderId } });
    }, 700);
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header alwaysDark />
        <main className="flex-1 grid place-items-center px-6 pt-32 pb-20">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-extrabold tracking-tight">Your cart is empty</h1>
            <p className="mt-3 text-muted-foreground">Add a few products before heading to checkout.</p>
            <Link to="/" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-ocean text-white font-semibold">
              Continue shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header alwaysDark />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-6">
            <ChevronLeft className="size-4" /> Back to store
          </Link>

          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Checkout</h1>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="size-4" /> Secure SSL · Test environment
            </div>
          </div>

          <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_420px] gap-10">
            {/* LEFT: Forms */}
            <div className="space-y-8">
              <Section icon={Truck} title="Contact & Shipping">
                <div className="grid gap-4">
                  <Input label="Email" type="email" required value={form.email} onChange={(v) => set("email", v)} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="First name" required value={form.firstName} onChange={(v) => set("firstName", v)} />
                    <Input label="Last name" required value={form.lastName} onChange={(v) => set("lastName", v)} />
                  </div>
                  <Input label="Company (optional)" value={form.company} onChange={(v) => set("company", v)} />
                  <Input label="Street address" required value={form.address1} onChange={(v) => set("address1", v)} />
                  <Input label="Apt, suite, etc. (optional)" value={form.address2} onChange={(v) => set("address2", v)} />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Input label="City" required value={form.city} onChange={(v) => set("city", v)} />
                    <Input label="State" required value={form.state} onChange={(v) => set("state", v)} />
                    <Input label="ZIP" required value={form.zip} onChange={(v) => set("zip", v)} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Country" required value={form.country} onChange={(v) => set("country", v)} />
                    <Input label="Phone" type="tel" required value={form.phone} onChange={(v) => set("phone", v)} />
                  </div>
                </div>
              </Section>

              <Section icon={Truck} title="Shipping Method">
                <div className="grid gap-3">
                  <Radio
                    selected={form.method === "standard"}
                    onClick={() => set("method", "standard")}
                    title="Standard Shipping"
                    desc="3–5 business days"
                    price={subtotal >= SHIPPING_FREE_OVER ? "Free" : formatUSD(stdShipping)}
                  />
                  <Radio
                    selected={form.method === "express"}
                    onClick={() => set("method", "express")}
                    title="Express Shipping"
                    desc="1–2 business days"
                    price={formatUSD(expressFee)}
                  />
                </div>
              </Section>

              <Section icon={CreditCard} title="Payment Details">
                <div className="grid gap-4">
                  <Input label="Name on card" required value={form.cardName} onChange={(v) => set("cardName", v)} />
                  <Input label="Card number" required placeholder="4242 4242 4242 4242" value={form.cardNumber} onChange={(v) => set("cardNumber", v)} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Expiry (MM/YY)" required placeholder="12/28" value={form.expiry} onChange={(v) => set("expiry", v)} />
                    <Input label="CVC" required placeholder="123" value={form.cvc} onChange={(v) => set("cvc", v)} />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" /> Payment is a placeholder — no card is charged in this demo.
                  </p>
                </div>
              </Section>
            </div>

            {/* RIGHT: Summary */}
            <aside className="lg:sticky lg:top-28 h-fit">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-border bg-white p-6 shadow-[var(--shadow-soft)]"
              >
                <h2 className="font-bold tracking-tight text-lg mb-4">Order Summary</h2>
                <ul className="divide-y divide-border max-h-72 overflow-y-auto -mx-2 px-2">
                  {items.map((it) => (
                    <li key={it.id} className="flex gap-3 py-3">
                      <div className="relative size-14 shrink-0 rounded-xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] grid place-items-center overflow-hidden">
                        <img src={it.img} alt={it.name} className="size-full object-contain p-1.5 mix-blend-multiply" />
                        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-foreground text-background text-[10px] font-bold grid place-items-center">
                          {it.qty}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{it.brand}</div>
                        <div className="text-sm font-medium leading-snug line-clamp-2">{it.name}</div>
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap">{formatUSD(it.price * it.qty)}</div>
                    </li>
                  ))}
                </ul>

                {/* Promo Code Field */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (POOL10, SAVE20)"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError(null);
                      }}
                      className="flex-1 h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const code = promoInput.trim().toUpperCase();
                        if (!code) return;
                        if (code === "PROMO10" || code === "POOL10" || code === "SAVE20" || code === "FREESHIP") {
                          setAppliedPromo(code);
                          setPromoError(null);
                          setPromoInput("");
                        } else {
                          setPromoError("Invalid code");
                        }
                      }}
                      className="px-4 h-10 rounded-xl bg-muted text-xs font-semibold hover:bg-muted/80 hover:text-foreground active:scale-95 transition-all animate-shimmer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="mt-1.5 text-xs text-destructive font-medium">{promoError}</p>
                  )}
                  {appliedPromo && (
                    <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-100 text-green-800 px-3 py-1.5 rounded-xl text-xs font-medium">
                      <span>Applied: <strong>{appliedPromo}</strong></span>
                      <button
                        type="button"
                        onClick={() => setAppliedPromo(null)}
                        className="text-green-600 hover:text-green-800 underline font-semibold ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-2.5 text-sm">
                  <Row label="Subtotal" value={formatUSD(subtotal)} />
                  {discount > 0 && (
                    <Row label={`Discount (${appliedPromo})`} value={`-${formatUSD(discount)}`} className="text-green-600 font-medium" />
                  )}
                  <Row label="Shipping" value={shipping === 0 ? "Free" : formatUSD(shipping)} muted />
                  <Row label={taxLabel} value={formatUSD(tax)} muted />
                  <div className="h-px bg-border my-1" />
                  <Row label="Total" value={formatUSD(total)} bold />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full py-4 rounded-full bg-gradient-ocean text-white font-semibold shadow-[var(--shadow-float)] hover:shadow-[0_20px_40px_-15px_rgba(0,109,171,0.35)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.99] disabled:opacity-60 disabled:transform-none disabled:shadow-none"
                >
                  {submitting ? "Placing order…" : `Place Order · ${formatUSD(total)}`}
                </button>
                <p className="mt-3 text-[11px] text-muted-foreground text-center">
                  By placing your order you agree to Pool Supply Wholesalers' Terms & Privacy Policy.
                </p>
              </motion.div>
            </aside>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Truck; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 lg:p-8 shadow-[var(--shadow-soft)]">
      <h2 className="flex items-center gap-2 font-bold tracking-tight text-lg mb-5">
        <span className="size-9 rounded-xl bg-gradient-ocean text-white grid place-items-center">
          <Icon className="size-4" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
      />
    </label>
  );
}

function Radio({ selected, onClick, title, desc, price }: { selected: boolean; onClick: () => void; title: string; desc: string; price: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.99] ${
        selected ? "border-primary bg-accent/40 shadow-[var(--shadow-soft)]" : "border-border hover:border-foreground/20 hover:bg-surface/50"
      }`}
    >
      <span className={`size-5 rounded-full border-2 grid place-items-center transition-all ${selected ? "border-primary" : "border-border"}`}>
        {selected && <span className="size-2.5 rounded-full bg-gradient-ocean" />}
      </span>
      <div className="flex-1">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <div className="font-bold tracking-tight text-sm">{price}</div>
    </button>
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
