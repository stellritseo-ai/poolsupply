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
  Zap,
  Clock,
  Package,
  HeartHandshake,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  PhoneCall,
  Sparkles,
  Building2,
  Lock,
  Boxes,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/why-us")({
  head: () => ({
    meta: [
      { title: "Why Choose Us — Pool Supply Wholesalers | Wholesale Pool Equipment Distributor" },
      {
        name: "description",
        content:
          "Discover why 5,000+ pool contractors and service companies trust Pool Supply Wholesalers for genuine OEM equipment, factory warranties, same-day shipping, and certified technical support.",
      },
      { property: "og:title", content: "Why Pool Professionals Choose Pool Supply Wholesalers" },
      {
        property: "og:description",
        content:
          "Authorized distributor for Pentair, Hayward, Jandy & Raypak. Up to 40% off retail MSRP. 4 US logistics hubs.",
      },
    ],
  }),
  component: WhyUsPage,
});

const STATS = [
  { value: "5,000+", label: "Active Trade Accounts", icon: Users },
  { value: "Up to 40%", label: "Below Retail MSRP", icon: Percent },
  { value: "< 24 hrs", label: "Average Dispatch Time", icon: Clock },
  { value: "100%", label: "Genuine OEM Stock", icon: ShieldCheck },
  { value: "4 Hubs", label: "National Distribution", icon: Truck },
  { value: "100%", label: "Factory Warranty Backed", icon: Award },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    number: "01",
    title: "100% Authorized OEM Distributor",
    headline: "Direct manufacturer agreements. Full factory warranty.",
    desc: "We maintain direct factory purchasing agreements with Pentair, Hayward, Jandy, and Raypak. Every SKU ships from factory-sealed stock — no gray-market units, no liquidation lots, and zero warranty risk.",
    bullets: [
      "Direct factory purchasing pipelines",
      "Serial numbers registered with manufacturer records",
      "100% full factory warranty backing on every SKU",
      "Zero gray-market or liquidation items",
    ],
  },
  {
    icon: Percent,
    number: "02",
    title: "Wholesale-Only Trade Pricing",
    headline: "Protect your commercial margins on every bid.",
    desc: "Our pricing structure is reserved strictly for registered trade professionals. Save up to 40% off standard retail MSRP across pumps, heaters, filters, and automation systems with locked pricing for accurate bids.",
    bullets: [
      "Up to 40% below retail MSRP across full catalog",
      "Trade-only accounts — zero public retail markups",
      "Volume rebate tiers for high-volume commercial builders",
      "Locked contractor price protection on active bids",
    ],
  },
  {
    icon: Truck,
    number: "03",
    title: "4-Hub Rapid Freight Network",
    headline: "Same-day dispatch. 24-48 hour delivery nationwide.",
    desc: "Our four regional distribution centers in Nashville TN, Los Angeles CA, Dallas TX, and Orlando FL allow same-day freight dispatch on orders placed before 2:00 PM EST, reaching job sites across the U.S. in 1–2 business days.",
    bullets: [
      "Same-day dispatch cutoff: 2:00 PM EST",
      "4 strategic hubs: TN, CA, TX, and FL",
      "1–2 business day transit to 90% of US zip codes",
      "Freight liftgate delivery directly to job sites",
    ],
  },
  {
    icon: Wrench,
    number: "04",
    title: "CPO-Certified Technical Advisory",
    headline: "Hydraulic engineering specs before you purchase.",
    desc: "Our technical desk is staffed by former CPO-certified pool technicians and master hydraulic specifiers. We assist you with total dynamic head calculations, heater BTU sizing, and electrical specs at no additional charge.",
    bullets: [
      "In-house former CPO-certified pool technicians",
      "Complimentary hydraulic and heater load reviews",
      "Direct phone and chat access to engineering experts",
      "Available Monday–Friday, 8:00 AM – 6:00 PM EST",
    ],
  },
  {
    icon: HeartHandshake,
    number: "05",
    title: "Dedicated Trade Account Representative",
    headline: "Your dedicated partner — never an automated queue.",
    desc: "Registered contractors receive a named trade account manager who understands your order patterns, preferred equipment brands, and project timelines. Direct phone and email access whenever you need it.",
    bullets: [
      "Named account specialist assigned to your company",
      "Priority order routing and expedited handling",
      "Proactive warehouse inventory alerts on high-demand SKUs",
      "Quarterly account volume rebate reviews",
    ],
  },
  {
    icon: BarChart3,
    number: "06",
    title: "Real-Time Warehouse Portal",
    headline: "Live multi-hub inventory. 1-click reorders.",
    desc: "Our digital wholesale platform provides live stock availability across all 4 fulfillment hubs, volume discount tiers, and tracking feeds. Generate project quotes and reorder past BOMs with zero friction.",
    bullets: [
      "Real-time stock feeds across all 4 distribution centers",
      "Instant electronic order confirmations and freight tracking",
      "Saved equipment bills of materials for rapid reorders",
      "Seamless invoice downloads and tax exemption management",
    ],
  },
];

const COMPARISON = [
  { feature: "100% Authorized OEM Manufacturer Direct", us: true, them: false },
  { feature: "Wholesale Trade-Only Pricing (No Public Retail)", us: true, them: false },
  { feature: "Same-Day Freight Dispatch (2:00 PM EST Cutoff)", us: true, them: false },
  { feature: "CPO-Certified Hydraulic Technical Advisors", us: true, them: false },
  { feature: "100% Valid Factory Serial Warranty Registration", us: true, them: "Varies" },
  { feature: "Dedicated Named Trade Account Manager", us: true, them: false },
  { feature: "4 Regional National Distribution Hubs", us: true, them: false },
  { feature: "Live Multi-Warehouse Inventory Stock Feed", us: true, them: false },
  { feature: "Volume Contractor Rebate Tiers", us: true, them: false },
];

const FAQS = [
  {
    q: "Who is eligible for a wholesale contractor account?",
    a: "Our wholesale pricing is exclusively reserved for pool builders, service companies, CPO-certified technicians, general contractors, commercial natatorium operators, and licensed trade businesses. Registration requires your business tax ID (EIN) or contractor license number. Account verification typically completes in under 2 hours.",
  },
  {
    q: "How fast do freight and parcel orders ship?",
    a: "Orders placed before 2:00 PM EST ship the same business day from our nearest distribution hub (Nashville, Los Angeles, Dallas, or Orlando). Most standard parcel shipments arrive within 1–2 business days. Heavy freight items (tank filters, commercial gas heaters) typically arrive within 2–4 business days with liftgate delivery.",
  },
  {
    q: "Are all products covered by full factory warranties?",
    a: "Yes. Because we are an authorized master distributor for Pentair, Hayward, Jandy, and Raypak, every item you purchase is factory-sealed and carries the full manufacturer warranty. Serial numbers are officially validated at the time of dispatch.",
  },
  {
    q: "Can I receive technical assistance sizing equipment before ordering?",
    a: "Yes. Our technical team of certified pool technicians is available to review your pool dimensions, hydraulic flow rates, and heater BTU requirements. Sizing consultations are complimentary and ensure you install the exact equipment needed for peak efficiency.",
  },
  {
    q: "What is your commercial return policy?",
    a: "We offer a 30-day return window for unopened, uninstalled equipment in original factory packaging. Contact your dedicated account manager to generate a return merchandise authorization (RMA) label.",
  },
  {
    q: "Do you provide volume discount tiers for commercial contractors?",
    a: "Yes. In addition to our baseline wholesale trade pricing, contractors with high-volume monthly or quarterly purchasing volume automatically unlock tier-2 and tier-3 distributor rebates.",
  },
];

function WhyUsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header alwaysDark />

      <main className="flex-1">
        {/* ─── LUXURY HERO SECTION ─── */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#040d1a] text-white border-b border-cyan-500/10">
          {/* Background Hero Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-100 opacity-65"
            style={{ backgroundImage: "url('/about-hero.png')" }}
          />

          {/* Deep Gradient Overlays for High Legibility */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#040d1a]/80 via-[#040d1a]/60 to-background" />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#040d1a]/80 via-transparent to-[#040d1a]/80" />

          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-[1]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-[1]" />

          <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-widest shadow-lg"
              >
                <Award className="size-3.5" />
                The Professional Contractor Choice · Est. 2008
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white"
              >
                Why 5,000+ Pool Pros{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                  Choose Us
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium"
              >
                We built Pool Supply Wholesalers to give pool builders and service companies a reliable wholesale supply chain — factory-authorized equipment, true trade margins, and same-day freight logistics.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3"
              >
                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <span>Open Commercial Account</span>
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  to="/shop/$category"
                  params={{ category: "all" }}
                  search={{ q: "" }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <Package className="size-4 text-cyan-400" />
                  <span>Browse 8,000+ SKUs</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── LIVE STATS HUD ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-cyan-500/30 hover:shadow-md transition-all text-center flex flex-col justify-center items-center group"
                  >
                    <Icon className="size-5 text-cyan-600 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-[11px] font-extrabold text-slate-500 mt-1 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── SIX CORE COMMITMENT PILLARS ─── */}
        <section className="py-[50px] bg-slate-50/70 border-y border-slate-200/80">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-500/10 border border-cyan-500/20">
                Core Standards
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Our Six Wholesale Commitments
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Operational standards engineered into every order, invoice, and technical consultation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PILLARS.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.number}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-cyan-500/40 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="size-11 rounded-2xl bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 grid place-items-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                          <Icon className="size-5" />
                        </div>
                        <span className="text-xs font-black text-slate-400">
                          {pillar.number}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-cyan-700 transition-colors">
                          {pillar.title}
                        </h3>
                        <div className="text-xs font-bold text-cyan-700 mt-0.5">
                          {pillar.headline}
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {pillar.desc}
                      </p>

                      <ul className="space-y-2 pt-2 border-t border-slate-100">
                        {pillar.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-[11.5px] font-semibold text-slate-700">
                            <CheckCircle2 className="size-3.5 text-cyan-600 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── SIDE BY SIDE BENCHMARK TABLE ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-500/10 border border-cyan-500/20">
                Direct Comparison
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Wholesale Distributor vs. Typical Alternatives
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                See how our dedicated commercial B2B supply chain outperforms retail channels and middlemen.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-sm"
            >
              {/* Header row */}
              <div className="grid grid-cols-12 text-center border-b border-slate-200">
                <div className="col-span-6 p-4 sm:p-5 border-r border-slate-200 text-left">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-wider">Operational Feature</div>
                </div>
                <div className="col-span-3 p-4 sm:p-5 bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-r border-slate-200">
                  <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider">Pool Supply Wholesalers</div>
                </div>
                <div className="col-span-3 p-4 sm:p-5 bg-slate-50">
                  <div className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Typical Retailers</div>
                </div>
              </div>

              {/* Data rows */}
              {COMPARISON.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-12 text-center items-center ${i !== COMPARISON.length - 1 ? "border-b border-slate-100" : ""
                    }`}
                >
                  <div className="col-span-6 p-3.5 sm:p-4 border-r border-slate-100 text-xs font-bold text-slate-800 text-left px-5 flex items-center">
                    {row.feature}
                  </div>
                  <div className="col-span-3 p-3.5 sm:p-4 border-r border-slate-100 flex items-center justify-center bg-cyan-50/40">
                    <CheckCircle2 className="size-4 sm:size-5 text-cyan-600" />
                  </div>
                  <div className="col-span-3 p-3.5 sm:p-4 flex items-center justify-center bg-slate-50/60">
                    {row.them === true ? (
                      <CheckCircle2 className="size-4 sm:size-5 text-emerald-500" />
                    ) : row.them === false ? (
                      <span className="size-5 rounded-full bg-rose-100 text-rose-600 grid place-items-center font-black text-[10px]">
                        ✕
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200">
                        {row.them}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── CONTRACTOR FAQS ─── */}
        <section className="py-[50px] bg-slate-50/70 border-t border-slate-200/80">
          <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-500/10 border border-cyan-500/20">
                Dealer Answers
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Frequently Asked Contractor Questions
              </h2>
            </div>

            <div className="rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-xs divide-y divide-slate-100">
              {FAQS.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50/60 transition cursor-pointer"
                  >
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 pr-4 leading-snug">
                      {faq.q}
                    </span>
                    <span
                      className={`size-7 rounded-xl flex items-center justify-center shrink-0 border transition-all ${openFaq === i
                          ? "bg-cyan-600 text-white border-cyan-600"
                          : "border-slate-200 text-slate-400"
                        }`}
                    >
                      <ChevronDown
                        className={`size-3.5 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRADE CTA BANNER ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#061220] via-[#091f38] to-[#040d1a] border border-cyan-500/20 p-6 sm:p-12 text-white shadow-[0_25px_70px_-20px_rgba(0,109,171,0.35)] text-center"
            >
              {/* Top Accent Gradient Line */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-widest shadow-lg">
                  <Sparkles className="size-3.5" />
                  Instant Trade Access
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Ready to Experience the Direct Wholesale Advantage?
                </h2>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  Join 5,000+ pool contractors and service companies. Open your commercial account in minutes with zero setup fees.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-[0_8px_25px_rgba(6,182,212,0.35)] hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    <span>Open Commercial Account</span>
                    <ArrowRight className="size-4" />
                  </Link>

                  <Link
                    to="/shop/$category"
                    params={{ category: "all" }}
                    search={{ q: "" }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <span>Browse 8,000+ SKUs</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
