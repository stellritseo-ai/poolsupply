import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { submitContactFormDb } from "@/lib/api/emails.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  ArrowRight,
  Wrench,
  ShoppingBag,
  Truck,
  RotateCcw,
  Users,
  MessageSquare,
  Zap,
  ChevronRight,
  Building2,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Pool Supply Wholesalers" },
      {
        name: "description",
        content:
          "Contact Pool Supply Wholesalers for technical support, dealer account setup, shipping inquiries, or RMA requests. Response within 2 business hours.",
      },
      { property: "og:title", content: "Contact Pool Supply Wholesalers" },
      {
        property: "og:description",
        content:
          "Reach our certified technical advisors, sales desk, or logistics team. Dedicated support for registered pool builders and service professionals.",
      },
    ],
  }),
  component: ContactPage,
});

// ─── Data ─────────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  {
    val: "dealer",
    label: "Open Dealer Account",
    icon: Users,
    desc: "Register for wholesale trade pricing",
    gradientFrom: "#2563eb",
    gradientTo: "#06b6d4",
  },
  {
    val: "support",
    label: "Technical Support",
    icon: Wrench,
    desc: "Equipment sizing & spec consulting",
    gradientFrom: "#7c3aed",
    gradientTo: "#6366f1",
  },
  {
    val: "sales",
    label: "Sales & Pricing",
    icon: ShoppingBag,
    desc: "Quotes, volume pricing & product info",
    gradientFrom: "#10b981",
    gradientTo: "#2dd4bf",
  },
  {
    val: "logistics",
    label: "Shipping & Logistics",
    icon: Truck,
    desc: "Order status, tracking & freight",
    gradientFrom: "#f59e0b",
    gradientTo: "#fb923c",
  },
  {
    val: "rma",
    label: "Returns & RMA",
    icon: RotateCcw,
    desc: "Initiate a product return or warranty claim",
    gradientFrom: "#f43f5e",
    gradientTo: "#ec4899",
  },
  {
    val: "general",
    label: "General Inquiry",
    icon: MessageSquare,
    desc: "Any other questions or feedback",
    gradientFrom: "#64748b",
    gradientTo: "#94a3b8",
  },
];

const CONTACT_CHANNELS = [
  {
    icon: Phone,
    title: "Direct Support Hotline",
    value: "(615) 477-0407",
    sub: "Dealer direct line — trade accounts only",
    href: "tel:6154770407",
    gradient: "from-blue-600 to-cyan-500",
  },
  {
    icon: Mail,
    title: "Email Support",
    value: "sales@poolsupplywholesalers.com",
    sub: "Attach specs, blueprints, or POs",
    href: "mailto:sales@poolsupplywholesalers.com",
    gradient: "from-violet-600 to-indigo-500",
  },
  {
    icon: Clock,
    title: "Business Hours",
    value: "Mon – Fri, 8:00 AM – 6:00 PM EST",
    sub: "Same-day ship cutoff at 2:00 PM EST",
    href: null,
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    icon: MapPin,
    title: "Main Logistics Hub",
    value: "410 Scott Pike, Nashville, TN",
    sub: "Will-call pickup available upon request",
    href: "https://maps.google.com/?q=410+Scott+Pike+Nashville+TN",
    gradient: "from-amber-500 to-orange-400",
  },
];

const RESPONSE_STATS = [
  { value: "< 2 hrs", label: "Response Time" },
  { value: "98%", label: "First-Call Resolution" },
  { value: "Mon–Fri", label: "Availability" },
  { value: "4 Hubs", label: "Nationwide Support" },
];

const TRUST_QUOTES = [
  {
    quote: "Called in with a heater sizing question at 10 AM — had a detailed answer by 10:45 AM. Nobody else does that.",
    name: "James K.",
    role: "Blue Horizon Pool Service",
  },
  {
    quote: "The sales desk knew our account history immediately. It felt like calling a colleague, not a support line.",
    name: "Sarah N.",
    role: "Blue Horizons Commercial",
  },
];

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: d, ease: "easeOut" },
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────
function ContactPage() {
  const [subject, setSubject] = useState("dealer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeDept = DEPARTMENTS.find((d) => d.val === subject)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !msg.trim()) return;
    setIsSubmitting(true);
    try {
      const activeDeptObj = DEPARTMENTS.find((d) => d.val === subject);
      const res = await submitContactFormDb({
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: activeDeptObj ? activeDeptObj.label : "Dealer Inquiry",
          message: `${business ? `[Business: ${business.trim()}]\n` : ""}${msg.trim()}`
        }
      });
      if (res.success) {
        setSent(true);
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName(""); setEmail(""); setBusiness(""); setPhone(""); setMsg("");
    setSubject("dealer"); setSent(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header alwaysDark />

      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section
          className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden"
          style={{ background: "linear-gradient(160deg, #001a3a 0%, #003a7a 55%, #0055aa 100%)" }}
        >
          {/* Glow orbs */}
          <div className="absolute top-10 right-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(89,210,243,0.16) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,137,201,0.18) 0%, transparent 70%)", filter: "blur(50px)" }} />
          {/* Decorative rings */}
          <div className="absolute -right-16 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none">
            {[280, 200, 130].map((s) => (
              <div key={s} className="absolute rounded-full border border-cyan-400/12"
                style={{ width: s, height: s, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
            ))}
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span
                  className="inline-flex items-center gap-2 mb-4 sm:mb-5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] border border-white/20 text-white/80"
                  style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}
                >
                  <Zap className="size-3.5 text-cyan-400" />
                  Response within 2 Business Hours
                </span>

                <h1 className="text-white tracking-tight leading-tight mb-4 sm:mb-5 text-3xl sm:text-4xl lg:text-[50px] font-extrabold">
                  Talk to a{" "}
                  <span
                    className="text-transparent"
                    style={{
                      backgroundImage: "linear-gradient(90deg, #59D2F3 0%, #00B4D8 50%, #48CAE4 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                    }}
                  >
                    Pool Expert
                  </span>
                </h1>

                <p className="text-white/65 text-base leading-relaxed mb-8 max-w-lg">
                  Whether you're opening a dealer account, speccing equipment for a build, tracking a shipment, or processing a warranty claim — our team has you covered.
                </p>

                {/* Response stat chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RESPONSE_STATS.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl p-3 text-center"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <div className="font-black text-white text-lg leading-none">{s.value}</div>
                      <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Hero trust quotes */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="hidden lg:flex flex-col gap-4"
              >
                {TRUST_QUOTES.map((q) => (
                  <div
                    key={q.name}
                    className="rounded-[1.75rem] p-6"
                    style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <div className="flex gap-0.5 mb-3">
                      {[1,2,3,4,5].map((i) => <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-white/80 text-sm italic leading-relaxed mb-3">"{q.quote}"</p>
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full flex items-center justify-center font-black text-[10px] text-white"
                        style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)" }}>
                        {q.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-white font-bold text-xs">{q.name}</div>
                        <div className="text-white/50 text-[10px]">{q.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, var(--background))" }} />
        </section>

        {/* ─── CONTACT CHANNELS ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-2 mb-10 sm:mb-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {CONTACT_CHANNELS.map((ch, i) => {
              const Icon = ch.icon;
              const content = (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="group bg-white rounded-2xl sm:rounded-[1.75rem] p-4 sm:p-6 border border-border hover:shadow-[var(--shadow-float)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-2.5 sm:gap-3"
                >
                  <div className={`size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-gradient-to-br ${ch.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="size-4 sm:size-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">{ch.title}</div>
                    <div className="font-extrabold text-xs sm:text-sm text-foreground leading-snug truncate">{ch.value}</div>
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">{ch.sub}</div>
                  </div>
                  {ch.href && (
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold mt-auto" style={{ color: "oklch(0.50 0.14 232)" }}>
                      Contact <ChevronRight className="size-3" />
                    </div>
                  )}
                </motion.div>
              );
              return ch.href ? (
                <a key={ch.title} href={ch.href} target={ch.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {content}
                </a>
              ) : (
                <div key={ch.title}>{content}</div>
              );
            })}
          </div>
        </section>

        {/* ─── MAIN FORM + SIDEBAR ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
            {/* ── FORM ── */}
            <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-border shadow-[var(--shadow-soft)] overflow-hidden">
              {/* Form header */}
              <div
                className="px-5 sm:px-8 py-5 sm:py-6 border-b border-border"
                style={{ background: "linear-gradient(to right, oklch(0.97 0.02 220), oklch(0.95 0.04 215))" }}
              >
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">Send Us a Message</h2>
                <p className="text-xs text-muted-foreground mt-1">Fill in the form below — our team responds within 2 business hours.</p>
              </div>

              <AnimatePresence mode="wait">
                {!sent ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="p-5 sm:p-8 space-y-5 sm:space-y-6"
                  >
                    {/* Department selector */}
                    <div>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2.5">
                        What can we help with?
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                        {DEPARTMENTS.map((d) => {
                          const Icon = d.icon;
                          const active = subject === d.val;
                          return (
                            <button
                              key={d.val}
                              type="button"
                              id={`dept-${d.val}`}
                              onClick={() => setSubject(d.val)}
                              className={`group flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 hover:scale-[1.01] ${
                                active ? "border-transparent text-white shadow-md" : "border-border bg-white hover:bg-surface text-foreground/80"
                              }`}
                              style={active ? { background: `linear-gradient(135deg, ${d.gradientFrom}, ${d.gradientTo})` } : {}}
                            >
                              <div
                                className={`size-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${active ? "bg-white/20" : "bg-surface"}`}
                              >
                                <Icon className={`size-3.5 ${active ? "text-white" : "text-muted-foreground"}`} />
                              </div>
                              <span className={`text-[11px] font-bold leading-tight ${active ? "text-white" : "text-foreground"}`}>
                                {d.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {/* Active dept description */}
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={subject}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-[11px] text-muted-foreground mt-2.5 flex items-center gap-1.5"
                        >
                          <span
                            className="inline-block size-1.5 rounded-full"
                            style={{ background: "oklch(0.50 0.14 232)" }}
                          />
                          {activeDept.desc}
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    {/* Name + Business */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Your Name <span className="text-rose-400">*</span>
                        </span>
                        <input
                          type="text" required value={name} onChange={(e) => setName(e.target.value)}
                          placeholder="First & Last Name"
                          className="w-full h-11 px-4 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition placeholder:text-muted-foreground/40"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Business / Company
                        </span>
                        <input
                          type="text" value={business} onChange={(e) => setBusiness(e.target.value)}
                          placeholder="e.g. Apex Pool Builders"
                          className="w-full h-11 px-4 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition placeholder:text-muted-foreground/40"
                        />
                      </label>
                    </div>

                    {/* Email + Phone */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Email Address <span className="text-rose-400">*</span>
                        </span>
                        <input
                          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="w-full h-11 px-4 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition placeholder:text-muted-foreground/40"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Phone Number
                        </span>
                        <input
                          type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                          placeholder="(615) 000-0000"
                          className="w-full h-11 px-4 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition placeholder:text-muted-foreground/40"
                        />
                      </label>
                    </div>

                    {/* Message */}
                    <label className="block">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Message <span className="text-rose-400">*</span>
                      </span>
                      <textarea
                        required rows={5} value={msg} onChange={(e) => setMsg(e.target.value)}
                        placeholder={
                          subject === "support"
                            ? "Describe your pool specs, equipment question, or sizing request..."
                            : subject === "dealer"
                            ? "Tell us about your business, license type, and typical order volume..."
                            : subject === "logistics"
                            ? "Include your order number and tracking details..."
                            : "Detail your request or question..."
                        }
                        className="w-full p-4 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition resize-none placeholder:text-muted-foreground/40"
                      />
                      <div className="text-[10px] text-muted-foreground mt-1 text-right">{msg.length} characters</div>
                    </label>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)", boxShadow: "0 10px 30px rgba(0,137,201,0.35)" }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="size-4" /> Send Message
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] text-muted-foreground">
                      We respond within 2 business hours · Mon–Fri 8 AM–6 PM EST
                    </p>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="p-12 text-center space-y-5"
                  >
                    <div
                      className="size-20 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                      style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)", boxShadow: "0 16px 40px rgba(0,137,201,0.35)" }}
                    >
                      <CheckCircle2 className="size-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground tracking-tight">Message Sent!</h2>
                      <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                        Thank you, <strong>{name}</strong>. One of our {activeDept.label.toLowerCase()} specialists will reach out to{" "}
                        <strong>{email}</strong> within 2 business hours.
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-3 pt-2">
                      <div className="flex flex-wrap justify-center gap-2 text-[11px] text-muted-foreground">
                        {["Response in 2 hrs", "Dealer support", "Expert advisors"].map((t) => (
                          <span key={t} className="flex items-center gap-1">
                            <CheckCircle2 className="size-3 text-emerald-500" /> {t}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={resetForm}
                        className="px-6 py-2.5 rounded-full border border-border hover:bg-surface text-xs font-bold transition"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="space-y-5 lg:sticky lg:top-28">
              {/* Quick links */}
              <div className="bg-white rounded-[2rem] border border-border p-6 shadow-[var(--shadow-soft)] space-y-4">
                <h3 className="font-extrabold text-base tracking-tight">Quick Access</h3>
                <div className="space-y-2">
                  {[
                    { label: "Browse Our Catalog", desc: "8,000+ SKUs at wholesale pricing", to: "/shop/all", icon: ShoppingBag },
                    { label: "Why Choose Us", desc: "Our 6 wholesale commitments", to: "/why-us", icon: Star },
                    { label: "About Our Company", desc: "Our story, team & 4 hubs", to: "/about", icon: Building2 },
                    { label: "Product Finder", desc: "Get equipment sized for your pool", to: "/finder", icon: Wrench },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.to as any}
                        className="group flex items-center gap-3 p-3.5 rounded-2xl hover:bg-surface border border-transparent hover:border-border transition-all"
                      >
                        <div className="size-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "oklch(0.95 0.04 220)" }}>
                          <Icon className="size-4" style={{ color: "oklch(0.50 0.14 232)" }} />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{item.label}</div>
                          <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Distribution hubs */}
              <div className="bg-white rounded-[2rem] border border-border p-6 shadow-[var(--shadow-soft)] space-y-4">
                <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                  <Truck className="size-4" style={{ color: "oklch(0.50 0.14 232)" }} />
                  Distribution Hubs
                </h3>
                <div className="space-y-2.5">
                  {[
                    { city: "Nashville, TN", role: "HQ & Southeast Hub", flag: "🏠", tag: "Primary" },
                    { city: "Los Angeles, CA", role: "West Coast Hub", flag: "🌊", tag: "" },
                    { city: "Dallas, TX", role: "Southwest Hub", flag: "☀️", tag: "" },
                    { city: "Orlando, FL", role: "Florida Hub", flag: "🌴", tag: "" },
                  ].map((hub) => (
                    <div key={hub.city} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface transition">
                      <span className="text-xl">{hub.flag}</span>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-foreground">{hub.city}</div>
                        <div className="text-[11px] text-muted-foreground">{hub.role}</div>
                      </div>
                      {hub.tag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "oklch(0.95 0.04 220)", color: "oklch(0.50 0.14 232)" }}>
                          {hub.tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground border-t border-border pt-3">
                  Same-day dispatch before 2 PM EST · Free shipping on orders over $500
                </p>
              </div>

              {/* Guarantee badge */}
              <div
                className="rounded-[2rem] p-6 text-center"
                style={{ background: "linear-gradient(135deg, #001a3a, #003a7a)" }}
              >
                <div className="size-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <Zap className="size-6 text-cyan-400" />
                </div>
                <h4 className="font-extrabold text-white text-sm mb-1">2-Hour Response Guarantee</h4>
                <p className="text-white/55 text-[11px] leading-relaxed">
                  All inquiries submitted during business hours receive a response from a real team member within 2 hours — not a bot, not a ticket queue.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
