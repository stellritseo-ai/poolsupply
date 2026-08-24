import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Lock,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  AlertCircle,
  Check,
  Gift,
  HelpCircle,
  Loader2
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { computeTotals, formatUSD, useCart } from "@/components/site/cart-context";
import { useAuth } from "@/components/site/auth-context";
import { createOrderDb } from "@/lib/api/orders.functions";
import { createStripePaymentIntentDb } from "@/lib/api/stripe.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — Pool Supply Wholesalers" },
      { name: "description", content: "Complete your Pool Supply Wholesalers wholesale order with 100% Free Shipping and Stripe 256-bit encrypted checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

type PaymentType = "stripe" | "net30";

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
  paymentType: PaymentType;
  cardName: string;
  method: "standard" | "express";
};

const INITIAL: FormState = {
  email: "", firstName: "", lastName: "", company: "",
  address1: "", address2: "", city: "", state: "", zip: "", country: "United States",
  phone: "", paymentType: "stripe", cardName: "",
  method: "standard",
};

// Lazy stripe promise — only created in browser, avoids SSR null resolution
let _stripePromise: Promise<any> | null = null;
function getStripePromise() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!_stripePromise) {
    _stripePromise = loadStripe(
      "pk_live_51TxoN3LlienmBCcZCAlvmfLnIsLe0BaWwIaBTSm8CrVBjuh7dPLzpHbe9QXiWKR9zxPYdBqJNbEoPNDCSGWcL5C900sY0uRiB2"
    );
  }
  return _stripePromise;
}

function normalizeCountryCode(country?: string): string {
  if (!country) return "US";
  const c = country.trim().toUpperCase();
  if (c.length === 2) return c;
  if (c === "UNITED STATES" || c === "USA" || c === "UNITED STATES OF AMERICA") return "US";
  if (c === "CANADA") return "CA";
  if (c === "UNITED KINGDOM" || c === "UK" || c === "GREAT BRITAIN") return "GB";
  if (c === "AUSTRALIA") return "AU";
  if (c === "MEXICO") return "MX";
  return "US";
}

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>({
    ...INITIAL,
    email: user?.email || "",
    phone: user?.phone || "",
    firstName: user?.name ? user.name.split(" ")[0] : "",
    lastName: user?.name ? user.name.split(" ").slice(1).join(" ") : "",
    cardName: user?.name || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Stripe Elements state
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(true);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Fixed rates: 9.25% sales tax, 15% shipping
  const TAX_RATE = 0.0925;
  const SHIPPING_RATE = 0.15;

  let discount = 0;
  if (appliedPromo) {
    const promoUpper = appliedPromo.toUpperCase();
    if (promoUpper === "PROMO10" || promoUpper === "POOL10") {
      discount = +(subtotal * 0.1).toFixed(2);
    } else if (promoUpper === "SAVE20") {
      discount = Math.min(20, subtotal);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = discountedSubtotal === 0 ? 0 : +(discountedSubtotal * SHIPPING_RATE).toFixed(2);
  const tax = +(discountedSubtotal * TAX_RATE).toFixed(2);
  const total = +(discountedSubtotal + shipping + tax).toFixed(2);

  const taxLabel = "Sales Tax (9.25%)";

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Initialize official Stripe Elements on Mount — lazy to avoid SSR null resolution
  useEffect(() => {
    let isMounted = true;

    getStripePromise()
      .then((stripe) => {
        if (!isMounted || !stripe || !cardContainerRef.current) return;
        setStripeInstance(stripe);

        const elements = stripe.elements();
        const card = elements.create("card", {
          hidePostalCode: true,
          style: {
            base: {
              color: "#0f172a",
              fontSize: "14px",
              fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: "600",
              "::placeholder": {
                color: "#94a3b8",
                fontWeight: "400",
              },
              iconColor: "#0284c7",
            },
            invalid: {
              color: "#e11d48",
              iconColor: "#e11d48",
            },
          },
        });

        card.mount(cardContainerRef.current);

        card.on("change", (event: any) => {
          if (event.error) {
            setStripeError(event.error.message);
          } else {
            setStripeError(null);
          }
        });

        setCardElement(card);
        setIsStripeLoading(false);
      })
      .catch((err) => {
        console.error("Stripe initialization error:", err);
        setIsStripeLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setStripeStatus(null);
    setStripeError(null);

    const orderId = "AQ-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    let paymentIntentId = "";
    const customerFullName = `${form.firstName} ${form.lastName}`.trim();
    const itemSummary = items.map((it) => `${it.name} (x${it.qty})`).join(", ");
    const stripeDescription = `Pool Supply Wholesalers Order #${orderId} - ${customerFullName} (${form.email}) - Items: ${itemSummary.slice(0, 150)}`;

    // Process Stripe Payment Intent if paymentType === 'stripe'
    if (form.paymentType === "stripe") {
      try {
        setStripeStatus("Initializing encrypted payment session...");

        // 1. Create PaymentIntent on server with Secret Key to receive client_secret
        const stripeRes = await createStripePaymentIntentDb({
          data: {
            amount: total,
            currency: "usd",
            email: form.email,
            phone: form.phone,
            description: stripeDescription,
            cardName: form.cardName || customerFullName,
            metadata: {
              order_id: orderId,
              customer_name: customerFullName,
              customer_email: form.email,
              customer_phone: form.phone,
              company: form.company || "N/A",
              order_items: itemSummary.slice(0, 450),
              delivery_address: `${form.address1}, ${form.city}, ${form.state} ${form.zip}`,
            },
            address: {
              line1: form.address1,
              line2: form.address2,
              city: form.city,
              state: form.state,
              zip: form.zip,
              country: form.country,
            },
          }
        });

        if (!stripeRes.success || !stripeRes.clientSecret) {
          setStripeError(stripeRes.error || "Failed to initialize payment session with Stripe.");
          setSubmitting(false);
          return;
        }

        // 2. Confirm card payment securely — resolve stripePromise fresh to guarantee live mode
        setStripeStatus("Authorizing card payment with your bank...");

        // Resolve the official @stripe/stripe-js instance (guaranteed live mode)
        const stripeClient = await getStripePromise();

        if (!stripeClient || !cardElement) {
          setStripeError("Payment gateway is initializing. Please wait a moment and try again.");
          setSubmitting(false);
          return;
        }

        const { paymentIntent, error } = await stripeClient.confirmCardPayment(stripeRes.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: (form.cardName || customerFullName).trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              address: {
                line1: form.address1.trim(),
                line2: form.address2 ? form.address2.trim() : undefined,
                city: form.city.trim(),
                state: form.state.trim(),
                postal_code: form.zip.trim(),
                country: normalizeCountryCode(form.country),
              },
            },
          },
        });

        if (error) {
          console.error("Stripe Card Confirmation Error:", error);
          setStripeError(error.message || "Payment authorization failed. Please check your card details and try again.");
          setSubmitting(false);
          return;
        }

        if (
          !paymentIntent ||
          (paymentIntent.status !== "succeeded" &&
            paymentIntent.status !== "processing" &&
            paymentIntent.status !== "requires_capture")
        ) {
          setStripeError(`Payment status was ${paymentIntent?.status || "incomplete"}. Please try again.`);
          setSubmitting(false);
          return;
        }


        paymentIntentId = paymentIntent.id;
        setStripeStatus(`Payment Approved · Ref: ${paymentIntentId.slice(-8)}`);
      } catch (err: any) {
        console.error("Stripe submission error:", err);
        setStripeError(err.message || "Failed to communicate with Stripe Live Payment Gateway.");
        setSubmitting(false);
        return;
      }
    }

    const order = {
      id: orderId,
      placedAt: new Date().toISOString(),
      email: form.email,
      phone: form.phone,
      name: customerFullName,
      company: form.company,
      address: { line1: form.address1, line2: form.address2, city: form.city, state: form.state, zip: form.zip, country: form.country },
      items,
      subtotal,
      shipping,
      tax,
      total,
      discount,
      promoCode: appliedPromo,
      method: form.method,
      paymentType: form.paymentType,
      paymentStatus: paymentIntentId ? `Paid via Stripe (${paymentIntentId})` : "Paid (Stripe Encrypted)",
    };

    try {
      await createOrderDb({ data: order as any });
      window.localStorage.setItem("aquapro_last_order", JSON.stringify(order));
    } catch (err) {
      console.error("Failed to save order:", err);
    }

    setTimeout(() => {
      clear();
      navigate({ to: "/order-confirmation", search: { id: orderId } });
    }, 600);
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Header alwaysDark />
        <main className="flex-1 grid place-items-center px-6 pt-32 pb-20">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-extrabold tracking-tight">Your shopping cart is empty</h1>
            <p className="mt-3 text-muted-foreground text-sm">Add a few commercial pool products before heading to checkout.</p>
            <Link to="/" className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-ocean text-white font-bold shadow-lg">
              Explore Products Catalog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans">
      <Header alwaysDark />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition mt-[20px] mb-6 font-bold">
            &lt; Back to Products Storefront
          </Link>

          {/* Transparent Wholesale Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white shadow-xl flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/10 grid place-items-center backdrop-blur-md shrink-0">
                <ShieldCheck className="size-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                  Transparent Pricing — No Hidden Fees
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  15% commercial freight shipping + 9.25% sales tax applied at checkout on all orders.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black bg-cyan-600/80 px-2.5 py-1 rounded-lg">
                Shipping: 15%
              </span>
              <span className="text-[11px] font-black bg-indigo-600/80 px-2.5 py-1 rounded-lg">
                Tax: 9.25%
              </span>
            </div>
          </motion.div>

          <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Checkout</h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">Verify your shipping address and complete secure payment.</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
              <Lock className="size-4 text-emerald-600" /> 256-Bit SSL Encrypted Checkout
            </div>
          </div>

          <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_440px] gap-8">
            {/* LEFT COLUMN: Shipping & Payment Information */}
            <div className="space-y-6">
              {/* Contact & Shipping Section */}
              <Section icon={Truck} title="Contact & Shipping Address">
                <div className="grid gap-4">
                  <Input label="Business Email Address" type="email" required value={form.email} onChange={(v) => set("email", v)} placeholder="john@poolservice.com" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="First Name" required value={form.firstName} onChange={(v) => set("firstName", v)} placeholder="John" />
                    <Input label="Last Name" required value={form.lastName} onChange={(v) => set("lastName", v)} placeholder="Smith" />
                  </div>
                  <Input label="Company / Trade Account (Optional)" value={form.company} onChange={(v) => set("company", v)} placeholder="Acuity Commercial Pools LLC" />
                  <Input label="Street Delivery Address" required value={form.address1} onChange={(v) => set("address1", v)} placeholder="1244 Commercial Way, Suite 100" />
                  <Input label="Building, Suite, Unit (Optional)" value={form.address2} onChange={(v) => set("address2", v)} placeholder="Building B" />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Input label="City" required value={form.city} onChange={(v) => set("city", v)} placeholder="Nashville" />
                    <Input label="State / Province" required value={form.state} onChange={(v) => set("state", v)} placeholder="TN" />
                    <Input label="ZIP / Postal Code" required value={form.zip} onChange={(v) => set("zip", v)} placeholder="37201" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Country" required value={form.country} onChange={(v) => set("country", v)} />
                    <Input label="Phone Number" type="tel" required value={form.phone} onChange={(v) => set("phone", v)} placeholder="(615) 555-0199" />
                  </div>
                </div>
              </Section>

              {/* Shipping Speed Option */}
              <Section icon={Truck} title="Shipping Method">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white grid place-items-center shrink-0 shadow-sm">
                    <Truck className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-xs text-slate-900">Standard Commercial Freight & Ground</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">Delivered in 3–5 business days via Commercial Freight</div>
                    <div className="mt-2 text-[11px] font-black text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg inline-block">
                      15% of order total
                    </div>
                  </div>
                  <div className="font-black text-sm text-slate-900">{formatUSD(shipping)}</div>
                </div>
              </Section>

              {/* Stripe Payment Gateway Section */}
              <Section icon={CreditCard} title="Payment Details (Stripe Official Elements)">
                <div className="space-y-4">
                  {stripeError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 shadow-sm"
                    >
                      <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-black text-rose-900">Payment Authorization Notice</div>
                        <div className="mt-0.5 text-rose-700 font-medium">{stripeError}</div>
                      </div>
                    </motion.div>
                  )}

                  {stripeStatus && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>{stripeStatus}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                    <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                      <Lock className="size-4 text-cyan-600" /> Stripe PCI Level 1 Certified 256-Bit SSL Gateway
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded">VISA</span>
                      <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded">MC</span>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">AMEX</span>
                      <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded">DISCOVER</span>
                    </div>
                  </div>

                  <Input
                    label="Cardholder Full Name"
                    required
                    value={form.cardName || `${form.firstName} ${form.lastName}`.trim()}
                    onChange={(v) => set("cardName", v)}
                    placeholder="John Smith"
                  />

                  {/* Stripe Card Element Mount Container */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="block text-xs font-black uppercase tracking-wider text-slate-600">
                        Card Number, Expiration & CVC
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        End-to-End Encrypted
                      </span>
                    </div>
                    <div className="relative">
                      <div
                        ref={cardContainerRef}
                        className="w-full min-h-[50px] px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-cyan-500 focus-within:bg-white transition-all shadow-2xs"
                      />
                      {isStripeLoading && (
                        <div className="absolute inset-0 bg-slate-50 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                          <Loader2 className="size-4 animate-spin text-cyan-600" />
                          <span>Loading Secure Stripe Gateway...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pt-1">
                    <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                    Official Stripe Live Gateway. Your card data is processed directly inside Stripe's PCI Level 1 encrypted vault.
                  </p>
                </div>
              </Section>
            </div>

            {/* RIGHT COLUMN: Order Summary & Instant Checkout */}
            <aside className="lg:sticky lg:top-28 h-fit">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl space-y-5"
              >
                <h2 className="font-black text-slate-900 tracking-tight text-lg flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-bold text-slate-500">{items.length} Items</span>
                </h2>

                {/* Items list */}
                <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto -mx-2 px-2 scrollbar-thin">
                  {items.map((it) => (
                    <li key={it.id} className="flex gap-3 py-3 items-center">
                      <div className="relative size-14 shrink-0">
                        <div className="size-full rounded-2xl bg-slate-50 border border-slate-200 grid place-items-center overflow-hidden shadow-2xs">
                          <img src={it.img} alt={it.name} className="size-full object-contain p-1" />
                        </div>
                        <span className="absolute -top-2 -right-2 size-5.5 rounded-full bg-slate-900 text-white text-[11px] font-black grid place-items-center shadow-md border-2 border-white z-10">
                          {it.qty}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">{it.brand}</div>
                        <div className="text-xs font-bold text-slate-800 truncate">{it.name}</div>
                        <div className="text-[11px] text-slate-400 font-semibold">{formatUSD(it.price)} each</div>
                      </div>
                      <div className="text-xs font-black text-slate-900">{formatUSD(it.price * it.qty)}</div>
                    </li>
                  ))}
                </ul>

                {/* Promo Code Field */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (POOL10, SAVE20)"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError(null);
                      }}
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:outline-none focus:border-cyan-500 focus:bg-white transition-all uppercase"
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
                          setPromoError("Invalid promotional code");
                        }
                      }}
                      className="px-4 h-10 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-rose-600 font-bold">{promoError}</p>
                  )}
                  {appliedPromo && (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold">
                      <span>Promo Code Applied: <strong>{appliedPromo}</strong></span>
                      <button
                        type="button"
                        onClick={() => setAppliedPromo(null)}
                        className="text-emerald-700 hover:text-emerald-900 underline font-extrabold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Cost Calculations */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs font-bold">
                  <Row label="Subtotal" value={formatUSD(subtotal)} />
                  {discount > 0 && (
                    <Row label={`Discount (${appliedPromo})`} value={`-${formatUSD(discount)}`} className="text-emerald-600 font-extrabold" />
                  )}

                  {/* SHIPPING DISPLAY — 15% of subtotal */}
                  <div className="flex items-center justify-between text-slate-700 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Truck className="size-4 text-cyan-600" /> Shipping (15% of order)
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {formatUSD(shipping)}
                    </span>
                  </div>

                  <Row label={taxLabel} value={formatUSD(tax)} muted />
                  <div className="h-px bg-slate-200 my-2" />
                  <Row label="Total Order Amount" value={formatUSD(total)} bold />
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={submitting || isStripeLoading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-black text-sm shadow-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Authorizing Live Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      <span>Complete Order · {formatUSD(total)}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center font-semibold leading-relaxed">
                  By completing order, you agree to Pool Supply Wholesalers' Terms of Commercial Wholesale & Shipping Guarantee.
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
    <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <h2 className="flex items-center gap-3 font-black text-slate-900 tracking-tight text-lg">
        <span className="size-10 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white grid place-items-center shadow-md shrink-0">
          <Icon className="size-5" />
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
    <label className="block space-y-1.5">
      <span className="block text-xs font-black uppercase tracking-wider text-slate-600">{label}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-2xs"
      />
    </label>
  );
}

function Row({ label, value, muted, bold, className }: { label: string; value: string; muted?: boolean; bold?: boolean; className?: string }) {
  return (
    <div className={`flex items-center justify-between ${muted ? "text-slate-500" : "text-slate-800"} ${bold ? "text-base font-black text-slate-900" : ""} ${className || ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
