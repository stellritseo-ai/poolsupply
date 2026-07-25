import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  ShieldCheck,
  Truck,
  Percent,
  Wrench,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Star,
  BadgeCheck,
  Zap,
  Clock,
  Package,
  HeartHandshake,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  PhoneCall,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/why-us")({
  head: () => ({
    meta: [
      { title: "Why Choose Us — Pool Supply Wholesalers" },
      {
        name: "description",
        content:
          "Discover why 5,000+ pool builders and service professionals trust Pool Supply Wholesalers for wholesale equipment, factory warranties, same-day shipping, and certified technical support.",
      },
      { property: "og:title", content: "Why Pool Professionals Choose Us" },
      {
        property: "og:description",
        content:
          "Authorized distributor for Pentair, Hayward, Jandy & Raypak. Up to 40% off MSRP. Same-day shipping from 4 US hubs. Expert tech support from former CPOs.",
      },
    ],
  }),
  component: WhyUsPage,
});

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "5,000+", label: "Registered Pro Accounts", icon: Users },
  { value: "40%", label: "Off Retail MSRP", icon: Percent },
  { value: "24 hrs", label: "Average Fulfillment", icon: Clock },
  { value: "100%", label: "Genuine OEM Parts", icon: BadgeCheck },
  { value: "4", label: "Distribution Hubs", icon: Truck },
  { value: "$15M+", label: "Client Energy Saved/yr", icon: TrendingUp },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    number: "01",
    title: "100% Authorized Distributor",
    headline: "Every part. Every brand. Fully backed.",
    desc: "We maintain direct purchasing agreements with Pentair, Hayward, Jandy, and Raypak. Every SKU ships from factory-authorized stock — no liquidation units, no gray-market hardware, no voided warranties. Your customers get genuine equipment backed by full manufacturer coverage.",
    bullets: [
      "Direct factory purchasing relationships",
      "Serial numbers verified against manufacturer records",
      "Full warranty support on every item sold",
      "No liquidation or overstock product lines",
    ],
    gradient: "from-blue-600 to-cyan-500",
    bgAccent: "from-blue-50 to-cyan-50",
  },
  {
    icon: Percent,
    number: "02",
    title: "Wholesale-Only Pricing",
    headline: "Protect your margins. Grow your business.",
    desc: "Our pricing structure is exclusively for registered trade professionals. Save up to 40% off standard MSRP retail pricing across our entire catalog — from variable speed pumps to commercial heat pumps. Your pricing is locked and consistent, so your project bids stay accurate.",
    bullets: [
      "Up to 40% below MSRP on all catalog items",
      "Trade-only access — no retail customers",
      "Volume discount tiers for high-frequency buyers",
      "Consistent pricing for accurate project quoting",
    ],
    gradient: "from-emerald-500 to-teal-400",
    bgAccent: "from-emerald-50 to-teal-50",
  },
  {
    icon: Truck,
    number: "03",
    title: "Lightning-Fast Logistics",
    headline: "Four hubs. Same-day dispatch. On-time delivery.",
    desc: "Our four regional fulfillment centers in Nashville TN, Los Angeles CA, Dallas TX, and Orlando FL are strategically positioned to reach every zip code in the continental US within 1–3 business days. Orders placed before 2 PM EST ship the same day. Free standard shipping on orders over $500.",
    bullets: [
      "Same-day dispatch before 2 PM EST",
      "Four US distribution hubs — TN, CA, TX, FL",
      "1–3 business day delivery nationwide",
      "Free shipping on orders over $500",
    ],
    gradient: "from-ocean to-aqua",
    bgAccent: "from-sky-50 to-blue-50",
  },
  {
    icon: Wrench,
    number: "04",
    title: "Certified Technical Advisors",
    headline: "Real experts. Real answers. Before you order.",
    desc: "Our technical support team isn't a call center — it's staffed by former CPO-certified pool technicians and licensed contractors who've installed this equipment in the field. We help you spec the right pump HP, heater BTU, and filter area before you commit to a purchase.",
    bullets: [
      "In-house former CPO-certified technicians",
      "Pre-purchase equipment sizing consultations",
      "Hydraulic design and heater load reviews",
      "Available Mon–Fri, 8 AM–6 PM EST",
    ],
    gradient: "from-violet-600 to-indigo-500",
    bgAccent: "from-violet-50 to-indigo-50",
  },
  {
    icon: HeartHandshake,
    number: "05",
    title: "Dedicated Account Management",
    headline: "Your partner — not just a vendor.",
    desc: "Registered dealers get a dedicated account manager who knows your business, your typical order patterns, and your preferred brands. No hold times, no ticket queues — direct contact with someone invested in your success.",
    bullets: [
      "Named account manager for every dealer",
      "Priority order support and escalation",
      "Proactive stock alerts on your key SKUs",
      "Quarterly account review & pricing analysis",
    ],
    gradient: "from-rose-500 to-pink-500",
    bgAccent: "from-rose-50 to-pink-50",
  },
  {
    icon: BarChart3,
    number: "06",
    title: "Live Inventory & Ordering Portal",
    headline: "Real-time stock. Instant ordering. Zero phone tags.",
    desc: "Our online platform shows real-time inventory across all four hubs, with live pricing and one-click ordering. Check availability, place an order, and get a shipment confirmation — all without making a phone call. Built specifically for trade professionals who value their time.",
    bullets: [
      "Live inventory across all 4 warehouses",
      "Instant order confirmation and tracking",
      "Bulk order CSV import for high-volume buyers",
      "Order history and reorder with one click",
    ],
    gradient: "from-amber-500 to-orange-400",
    bgAccent: "from-amber-50 to-orange-50",
  },
];

const COMPARISON = [
  { feature: "Authorized Factory Distributor", us: true, them: false },
  { feature: "Wholesale Trade-Only Pricing", us: true, them: false },
  { feature: "Same-Day Shipping Cutoff", us: true, them: false },
  { feature: "CPO-Certified Tech Support", us: true, them: false },
  { feature: "Full Manufacturer Warranty", us: true, them: "Varies" },
  { feature: "Dedicated Account Manager", us: true, them: false },
  { feature: "Live Inventory Portal", us: true, them: false },
  { feature: "Volume Discount Tiers", us: true, them: false },
  { feature: "Free Shipping Over $500", us: true, them: false },
];

const TESTIMONIALS = [
  {
    quote:
      "Switched from our old distributor 3 years ago and never looked back. Pricing is consistently 30–35% better and I've never had a shipment go wrong.",
    name: "James K.",
    title: "Owner, Blue Horizon Pool Service",
    location: "Tampa, FL",
    rating: 5,
    initials: "JK",
  },
  {
    quote:
      "The tech support team saved me from over-sizing a heater on a $45K job. Their advisor caught a sizing error in my hydraulic spec before I ordered. That's priceless.",
    name: "Maria S.",
    title: "Lead Technician, AquaTech Builders",
    location: "Phoenix, AZ",
    rating: 5,
    initials: "MS",
  },
  {
    quote:
      "I run a 12-truck service operation. Having a dedicated account manager who knows my SKUs and sends me stock alerts is a legitimate operational advantage.",
    name: "Robert D.",
    title: "Director, Crystal Clear Commercial",
    location: "Nashville, TN",
    rating: 5,
    initials: "RD",
  },
];

const FAQS = [
  {
    q: "Who is eligible for wholesale dealer pricing?",
    a: "Our pricing is available for pool builders, service professionals, CPO-certified technicians, general contractors, commercial facility operators, and licensed trade companies. You can register using your business tax ID, contractor license number, or trade association credentials. Approval typically takes under 2 business hours.",
  },
  {
    q: "How fast do orders ship?",
    a: "Orders placed before 2 PM EST ship the same business day from our nearest regional fulfillment center. Average transit time is 1–3 business days for parcel freight. Large freight shipments (tank filters, commercial heaters) take 3–5 days. We'll notify you of the carrier and tracking number via email as soon as the order leaves the warehouse.",
  },
  {
    q: "Are products covered by factory warranties?",
    a: "Yes — fully. Because we are an authorized distributor for Pentair, Hayward, Jandy, and Raypak, every item carries the complete manufacturer's warranty. Serial numbers are registered at point of sale. Professional installation is generally required by manufacturers to maintain full warranty coverage; we can advise on documentation requirements per brand.",
  },
  {
    q: "What is your return and RMA policy?",
    a: "We offer a 30-day return window for unused, uninstalled equipment in original factory packaging. Contact our support team to request an RMA number before returning any items. Defective items under warranty are handled directly with the manufacturer with our team acting as your advocate to expedite resolution.",
  },
  {
    q: "Do you offer volume or tiered pricing?",
    a: "Yes. Dealers who consistently order above certain monthly volume thresholds qualify for additional tiered discount levels beyond our standard wholesale pricing. Your account manager will review your order history quarterly and automatically apply any earned discount tier upgrades.",
  },
  {
    q: "Can I get help sizing equipment before I order?",
    a: "Absolutely — this is one of our most-used services. Our in-house technical advisors (former CPO-certified pool techs) will review your pool specifications, flow requirements, and site conditions to recommend the precise pump HP, heater BTU, and filter sizing. This consultation is free and takes 15–30 minutes. Call us or submit a sizing request via the contact form.",
  },
];

const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: "easeOut" },
  }),
};

// ─── Component ───────────────────────────────────────────────────────────────
function WhyUsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section
          className="relative pt-32 pb-20 overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, #001a3a 0%, #003a7a 55%, #0055aa 100%)",
          }}
        >
          {/* Glow orbs */}
          <div
            className="absolute top-10 right-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(89,210,243,0.18) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(0,137,201,0.2) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
          {/* Decorative rings */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none">
            {[320, 240, 160].map((size, i) => (
              <div
                key={size}
                className="absolute rounded-full border border-cyan-400/15"
                style={{
                  width: size,
                  height: size,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span
                className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border border-white/20 text-white/80"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Award className="size-3.5 text-cyan-400" />
                The Professional Choice Since 2008
              </span>

              <h1
                className="text-white tracking-tight mb-6"
                style={{ fontSize: "50px", lineHeight: "58px", fontWeight: 800 }}
              >
                Why 5,000+ Pool Pros{" "}
                <br className="hidden sm:block" />
                <span
                  className="text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #59D2F3 0%, #00B4D8 50%, #48CAE4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }}
                >
                  Choose Us
                </span>
              </h1>

              <p className="text-white/65 max-w-2xl mx-auto text-base leading-relaxed mb-10">
                We built Pool Supply Wholesalers for one purpose: to give pool
                builders and service professionals a wholesale supply chain they
                can actually depend on — with factory-authorized products, real
                pricing, and expert support that shows up when you need it.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-sm text-white shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(to right, #0089C9, #59D2F3)",
                    boxShadow:
                      "0 20px 40px rgba(0,137,201,0.4), 0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  Open a Dealer Account
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-sm text-white/90 border border-white/25 hover:bg-white/10 transition-all"
                >
                  Our Story
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--background))",
            }}
          />
        </section>

        {/* ─── STATS GRID ─── */}
        <section className="max-w-7xl mx-auto px-6 -mt-2 mb-24">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px rounded-[2rem] overflow-hidden border border-border shadow-[var(--shadow-soft)]">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="bg-white p-6 text-center flex flex-col items-center justify-center hover:bg-surface transition-all group"
                >
                  <Icon
                    className="size-5 mb-2 group-hover:scale-110 transition-transform"
                    style={{ color: "oklch(0.50 0.14 232)" }}
                  />
                  <div
                    className="text-2xl sm:text-3xl font-black tracking-tight"
                    style={{ color: "oklch(0.50 0.14 232)" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground/80 mt-1 uppercase tracking-wider text-center leading-tight">
                    {s.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ─── SIX PILLARS ─── */}
        <section className="max-w-7xl mx-auto px-6 mb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span
              className="text-xs font-bold uppercase tracking-[0.25em] mb-3 block"
              style={{ color: "oklch(0.50 0.14 232)" }}
            >
              Six Reasons
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Our Wholesale Commitments
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-xl mx-auto leading-relaxed">
              These aren't bullet points on a brochure — they're operational
              standards we hold ourselves to on every single order.
            </p>
          </motion.div>

          <div className="space-y-6">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={pillar.number}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                  className={`group relative rounded-[2rem] overflow-hidden border border-border bg-white hover:shadow-[var(--shadow-float)] transition-all duration-500`}
                >
                  {/* Subtle background accent on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, rgba(0,137,201,0.03) 0%, transparent 60%)`,
                    }}
                  />

                  <div
                    className={`relative grid lg:grid-cols-[1fr_360px] gap-0 ${!isEven ? "lg:[&>*:first-child]:order-2" : ""}`}
                  >
                    {/* Content side */}
                    <div className="p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex items-start gap-5 mb-5">
                        <div
                          className={`size-14 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center shrink-0 shadow-lg`}
                        >
                          <Icon className="size-7 text-white" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                            {pillar.number}
                          </span>
                          <h3 className="text-2xl font-black tracking-tight text-foreground leading-tight">
                            {pillar.title}
                          </h3>
                          <p
                            className="text-sm font-bold mt-0.5"
                            style={{ color: "oklch(0.50 0.14 232)" }}
                          >
                            {pillar.headline}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {pillar.desc}
                      </p>

                      <ul className="space-y-2">
                        {pillar.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                            <CheckCircle2
                              className="size-4 shrink-0"
                              style={{ color: "oklch(0.50 0.14 232)" }}
                            />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Visual accent side */}
                    <div
                      className={`hidden lg:flex items-center justify-center p-10 bg-gradient-to-br ${pillar.bgAccent}`}
                    >
                      <div className="relative">
                        <div
                          className={`size-36 rounded-full bg-gradient-to-br ${pillar.gradient} opacity-15 blur-2xl absolute -inset-4`}
                        />
                        <div
                          className={`size-28 rounded-[2rem] bg-gradient-to-br ${pillar.gradient} flex items-center justify-center shadow-2xl relative`}
                        >
                          <Icon className="size-14 text-white opacity-90" />
                        </div>
                        <div className="absolute -bottom-4 -right-4 rounded-2xl bg-white border border-border px-4 py-2 shadow-lg">
                          <div
                            className="font-black text-2xl"
                            style={{ color: "oklch(0.50 0.14 232)" }}
                          >
                            {pillar.number}
                          </div>
                          <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                            Commitment
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ─── COMPARISON TABLE ─── */}
        <section
          className="py-24"
          style={{
            background:
              "linear-gradient(180deg, var(--background) 0%, oklch(0.97 0.01 230) 50%, var(--background) 100%)",
          }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span
                className="text-xs font-bold uppercase tracking-[0.25em] mb-3 block"
                style={{ color: "oklch(0.50 0.14 232)" }}
              >
                Side by Side
              </span>
              <h2 className="text-4xl font-black tracking-tight">
                Us vs. the Alternatives
              </h2>
              <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">
                See how we stack up against typical retail distributors and
                big-box supply chains.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-[2rem] overflow-hidden border border-border bg-white shadow-[var(--shadow-soft)]"
            >
              {/* Header row */}
              <div className="grid grid-cols-3 text-center">
                <div className="p-5 border-b border-r border-border">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Feature</div>
                </div>
                <div
                  className="p-5 border-b border-r"
                  style={{
                    background: "linear-gradient(135deg, #0089C9, #59D2F3)",
                  }}
                >
                  <div className="text-xs font-black text-white uppercase tracking-wider">Pool Supply Wholesalers</div>
                </div>
                <div className="p-5 border-b border-border bg-surface">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Typical Distributor</div>
                </div>
              </div>

              {/* Data rows */}
              {COMPARISON.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 text-center ${i !== COMPARISON.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="p-4 border-r border-border text-xs font-semibold text-foreground/80 text-left px-5 flex items-center">
                    {row.feature}
                  </div>
                  <div
                    className="p-4 border-r flex items-center justify-center"
                    style={{ background: "rgba(0,137,201,0.04)" }}
                  >
                    <CheckCircle2
                      className="size-5"
                      style={{ color: "oklch(0.50 0.14 232)" }}
                    />
                  </div>
                  <div className="p-4 flex items-center justify-center bg-surface">
                    {row.them === true ? (
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    ) : row.them === false ? (
                      <span className="size-5 rounded-full border-2 border-rose-300 flex items-center justify-center">
                        <span className="text-rose-400 font-black text-xs leading-none">✕</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {row.them}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span
              className="text-xs font-bold uppercase tracking-[0.25em] mb-3 block"
              style={{ color: "oklch(0.50 0.14 232)" }}
            >
              From the Field
            </span>
            <h2 className="text-4xl font-black tracking-tight">
              What Pros Are Saying
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="group bg-white rounded-[2rem] p-7 border border-border hover:shadow-[var(--shadow-float)] hover:-translate-y-1 transition-all duration-400 flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed italic flex-1 mb-5">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div
                    className="size-10 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #0089C9, #59D2F3)",
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">{t.title}</div>
                    <div className="text-[10px] text-muted-foreground/70 font-semibold mt-0.5">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="max-w-3xl mx-auto px-6 py-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span
              className="text-xs font-bold uppercase tracking-[0.25em] mb-3 block"
              style={{ color: "oklch(0.50 0.14 232)" }}
            >
              Got Questions?
            </span>
            <h2 className="text-4xl font-black tracking-tight">
              Frequently Asked
            </h2>
            <p className="text-muted-foreground text-sm mt-3">
              Everything dealers ask before opening an account.
            </p>
          </motion.div>

          <div className="rounded-[2rem] overflow-hidden border border-border bg-white shadow-[var(--shadow-soft)] divide-y divide-border/60">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  id={`faq-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-surface/50 transition group"
                >
                  <span className="font-bold text-sm text-foreground pr-4 leading-snug">
                    {faq.q}
                  </span>
                  <span
                    className="size-7 rounded-full flex items-center justify-center shrink-0 border border-border group-hover:border-transparent transition-all"
                    style={
                      openFaq === i
                        ? { background: "linear-gradient(135deg, #0089C9, #59D2F3)", border: "none" }
                        : {}
                    }
                  >
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${openFaq === i ? "rotate-180 text-white" : "text-muted-foreground"}`}
                    />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[3rem] overflow-hidden px-8 sm:px-16 py-16 text-center"
            style={{
              background:
                "linear-gradient(135deg, #001f4d 0%, #003a7a 50%, #0055aa 100%)",
            }}
          >
            {/* Glow orbs */}
            <div
              className="absolute top-0 left-1/4 w-80 h-80 rounded-full pointer-events-none -translate-y-1/2"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,180,216,0.2) 0%, transparent 70%)",
                filter: "blur(50px)",
              }}
            />
            <div
              className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full pointer-events-none translate-y-1/2"
              style={{
                background:
                  "radial-gradient(circle, rgba(89,210,243,0.15) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />

            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border border-white/20 text-white/80"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                <PhoneCall className="size-3.5 text-cyan-400" />
                Ready to Get Started?
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                Join 5,000+ Pool Professionals
                <br />
                Who Already Trust Us
              </h2>
              <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-10">
                Open a free dealer account today. No setup fees, instant
                approval, and immediate access to wholesale pricing across
                8,000+ SKUs from the industry's top brands.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm bg-white text-foreground hover:bg-white/90 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Open Dealer Account <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/shop/$category"
                  params={{ category: "all" }}
                  search={{ q: "" }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white border border-white/25 hover:bg-white/10 transition-all"
                >
                  Browse Catalog
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-5 text-white/50 text-xs font-semibold">
                {[
                  "No Setup Fees",
                  "Instant Approval",
                  "Same-Day Shipping",
                  "Factory Warranties",
                  "Dedicated Account Manager",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-cyan-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
