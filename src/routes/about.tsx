import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  ShieldCheck,
  Truck,
  Award,
  Users,
  TrendingUp,
  Zap,
  MapPin,
  ArrowRight,
  Quote,
  CheckCircle2,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Pool Supply Wholesalers" },
      {
        name: "description",
        content:
          "Since 2008, Pool Supply Wholesalers has been the premier B2B distributor of professional-grade pool equipment. Learn our story, mission, and commitment to pool professionals nationwide.",
      },
      { property: "og:title", content: "About Pool Supply Wholesalers" },
      {
        property: "og:description",
        content:
          "The trusted wholesale partner for 5,000+ pool builders and service professionals. Authorized distributor for Pentair, Hayward, Jandy, and Raypak.",
      },
    ],
  }),
  component: AboutPage,
});

const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  }),
};

const STATS = [
  { value: "2008", label: "Founded", suffix: "" },
  { value: "5,000", label: "Active Pro Accounts", suffix: "+" },
  { value: "40", label: "Off Retail MSRP", suffix: "%" },
  { value: "4", label: "Distribution Hubs", suffix: "" },
  { value: "24", label: "Avg. Ship Time", suffix: "hrs" },
  { value: "100", label: "Genuine OEM Parts", suffix: "%" },
];

const TIMELINE = [
  {
    year: "2008",
    title: "Founded in Nashville, TN",
    desc: "Started as a single-location distributor supplying regional pool builders with Pentair equipment at wholesale trade pricing.",
  },
  {
    year: "2012",
    title: "Expanded to Three Brands",
    desc: "Secured authorized distributor agreements with Hayward and Jandy, tripling our product catalog and doubling our installer base.",
  },
  {
    year: "2016",
    title: "Opened West Coast Hub",
    desc: "Launched our California distribution center to cut transit times for west coast pool professionals to under 24 hours.",
  },
  {
    year: "2019",
    title: "5,000 Dealer Milestone",
    desc: "Crossed the 5,000 active registered dealer milestone. Launched online ordering portal and real-time inventory management.",
  },
  {
    year: "2022",
    title: "Florida & Texas Hubs",
    desc: "Opened two additional fulfillment centers to serve the booming sunbelt pool market and reduce freight costs further.",
  },
  {
    year: "2024",
    title: "Digital Platform Launch",
    desc: "Launched our full e-commerce wholesale platform with dynamic pricing, live stock levels, and certified technical advisory chat.",
  },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Authorized & Genuine",
    desc: "Every SKU we carry is sourced directly from manufacturers. No liquidation stock, no gray-market units — just factory-fresh equipment with complete warranty coverage.",
    color: "from-blue-600 to-cyan-500",
  },
  {
    icon: Award,
    title: "Professional-Grade Only",
    desc: "We exclusively supply commercial and professional-tier equipment. Our catalog is curated for durability, energy efficiency, and longevity in demanding environments.",
    color: "from-ocean to-aqua",
  },
  {
    icon: Truck,
    title: "Logistics Built for Pros",
    desc: "Four strategically positioned fulfillment centers mean most orders arrive within 24 hours. Same-day dispatch for orders placed before 2 PM EST.",
    color: "from-cyan-500 to-teal-500",
  },
  {
    icon: Zap,
    title: "Technical Expertise",
    desc: "Our in-house support team includes former CPO-certified pool technicians. We help you spec the right equipment before you ever place an order.",
    color: "from-indigo-600 to-blue-500",
  },
];

const BRANDS = [
  { name: "Pentair", role: "Pool Pumps, Filters & Automation" },
  { name: "Hayward", role: "Pumps, Heaters & Salt Systems" },
  { name: "Jandy", role: "Heaters, Controls & Sanitization" },
  { name: "Raypak", role: "Gas & Heat Pump Heaters" },
  { name: "Zodiac", role: "Robotic Cleaners & Systems" },
  { name: "Fluidra", role: "Commercial Pool Equipment" },
];

const TEAM_QUOTES = [
  {
    quote:
      "We built this company because we were pool builders ourselves. We know what it means when the wrong part shows up — or doesn't show up at all. That's why we obsess over stock reliability and logistics.",
    name: "Michael R.",
    title: "Co-Founder & CEO",
    initials: "MR",
  },
  {
    quote:
      "Our technical support isn't a call center — it's former professionals who've installed this equipment in the field. When a dealer calls in a heater sizing question, we've done that calculation hundreds of times.",
    name: "Sarah T.",
    title: "VP of Technical Operations",
    initials: "ST",
  },
];

function AboutPage() {
  const timelineRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section className="relative min-h-[92vh] flex items-end overflow-hidden pt-24">
          {/* Hero Background Image */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: "url('/about-hero.png')",
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
            }}
          />
          {/* Deep gradient overlay */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "linear-gradient(to top, rgba(0,10,30,0.97) 0%, rgba(0,30,70,0.82) 45%, rgba(0,60,120,0.35) 75%, rgba(0,80,150,0.15) 100%)",
            }}
          />

          {/* Decorative shimmer orbs */}
          <div
            className="absolute top-24 right-[12%] w-80 h-80 rounded-full z-[1] pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(0,180,216,0.22) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute bottom-1/3 left-[8%] w-64 h-64 rounded-full z-[1] pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(0,109,171,0.18) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20">
            <motion.div
              initial="hidden"
              animate="visible"
              className="max-w-3xl"
            >
              <motion.div
                custom={0}
                variants={fadeUp}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border border-white/20 text-white/80"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Wholesale Pool Equipment — Est. 2008
              </motion.div>

              <motion.h1
                custom={0.1}
                variants={fadeUp}
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-6"
              >
                The Backbone of
                <br />
                <span
                  className="text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #59D2F3 0%, #00B4D8 50%, #0089C9 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }}
                >
                  Pool Professionals
                </span>
              </motion.h1>

              <motion.p
                custom={0.2}
                variants={fadeUp}
                className="text-white/70 text-lg leading-relaxed max-w-xl mb-10"
              >
                Since 2008, we've been the wholesale partner that 5,000+ pool
                builders, service technicians, and commercial operators trust
                for premium equipment, reliable logistics, and expert technical
                support.
              </motion.p>

              <motion.div
                custom={0.3}
                variants={fadeUp}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-sm text-white shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(to right, #0089C9, #59D2F3)",
                    boxShadow:
                      "0 20px 40px rgba(0,137,201,0.4), 0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  Open a Dealer Account
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/why-us"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-sm text-white/90 border border-white/25 hover:bg-white/10 transition-all"
                  style={{ backdropFilter: "blur(8px)" }}
                >
                  Why Choose Us
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom fade into page */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 z-[2] pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--background))",
            }}
          />
        </section>

        {/* ─── STATS STRIP ─── */}
        <section className="max-w-7xl mx-auto px-6 -mt-2 mb-24">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-px rounded-[2rem] overflow-hidden border border-border shadow-[var(--shadow-soft)]">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="bg-white p-6 text-center flex flex-col items-center justify-center group hover:bg-gradient-to-b hover:from-surface hover:to-white transition-all"
              >
                <div
                  className="text-3xl sm:text-4xl font-black tracking-tight leading-none"
                  style={{ color: "oklch(0.50 0.14 232)" }}
                >
                  {stat.value}
                  <span className="text-xl">{stat.suffix}</span>
                </div>
                <div className="text-[10px] font-bold text-muted-foreground/80 mt-2 uppercase tracking-wider text-center">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── OUR STORY ─── */}
        <section className="max-w-7xl mx-auto px-6 mb-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span
                className="text-xs font-bold uppercase tracking-[0.25em] mb-4 block"
                style={{ color: "oklch(0.50 0.14 232)" }}
              >
                Our Story
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                Built by Pool Pros,{" "}
                <span
                  className="text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #0089C9, #59D2F3)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }}
                >
                  For Pool Pros
                </span>
              </h2>
              <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                <p>
                  Pool Supply Wholesalers was founded in 2008 by a team of
                  former pool builders and technicians who were frustrated by
                  unreliable distributors, inflated pricing, and slow freight.
                  They knew there was a better way.
                </p>
                <p>
                  Starting with a single warehouse in Nashville, Tennessee, and
                  a direct relationship with Pentair, we've grown into a
                  nationwide wholesale platform serving over 5,000 registered
                  trade professionals — from independent service techs to
                  large-scale commercial pool contractors.
                </p>
                <p>
                  Today, we operate four regional distribution hubs across the
                  United States, carry a catalog of 8,000+ SKUs from the
                  industry's top brands, and maintain same-day shipping on
                  thousands of in-stock items. Our mission remains unchanged:
                  give pool professionals the supply chain reliability they
                  deserve.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Pentair Authorized",
                  "Hayward Authorized",
                  "Jandy Authorized",
                  "Raypak Authorized",
                ].map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold border border-border bg-surface text-foreground/80"
                  >
                    <CheckCircle2
                      className="size-3.5"
                      style={{ color: "oklch(0.50 0.14 232)" }}
                    />
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Image collage / visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/3] shadow-[var(--shadow-float)]">
                <img
                  src="/about-hero.png"
                  alt="Premium pool installation by a Pool Supply Wholesalers dealer"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,137,201,0.15) 0%, transparent 60%)",
                  }}
                />
              </div>

              {/* Floating badge */}
              <div
                className="absolute -bottom-5 -left-5 rounded-[1.5rem] px-5 py-4 border border-white/20 shadow-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,137,201,0.95), rgba(0,30,80,0.9))",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center">
                    <Star className="size-5 text-yellow-300 fill-yellow-300" />
                  </div>
                  <div>
                    <div className="text-white font-black text-lg leading-none">
                      #1 Rated
                    </div>
                    <div className="text-white/70 text-[11px] font-semibold">
                      Wholesale Distributor
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stat card */}
              <div
                className="absolute -top-4 -right-4 rounded-2xl px-4 py-3 shadow-2xl border border-white/15"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="flex items-center gap-2">
                  <MapPin
                    className="size-4"
                    style={{ color: "oklch(0.50 0.14 232)" }}
                  />
                  <div>
                    <div className="font-black text-sm text-foreground">
                      4 Hubs
                    </div>
                    <div className="text-[10px] text-muted-foreground font-semibold">
                      TN · CA · TX · FL
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── CORE VALUES ─── */}
        <section
          className="py-24 mb-0"
          style={{
            background:
              "linear-gradient(180deg, var(--background) 0%, oklch(0.97 0.01 230) 50%, var(--background) 100%)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6">
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
                Our Principles
              </span>
              <h2 className="text-4xl font-black tracking-tight">
                What We Stand For
              </h2>
              <p className="text-muted-foreground text-sm mt-3 max-w-xl mx-auto leading-relaxed">
                These aren't mission-statement buzzwords. They're operational
                commitments baked into every order, every shipment, every
                support call.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.div
                    key={v.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: i * 0.08 }}
                    className="group bg-white rounded-[2rem] p-8 border border-border hover:border-transparent hover:shadow-[var(--shadow-float)] transition-all duration-500 relative overflow-hidden"
                  >
                    {/* Subtle hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2rem]"
                      style={{
                        background: `radial-gradient(ellipse at 30% 30%, rgba(0,137,201,0.06) 0%, transparent 70%)`,
                      }}
                    />

                    <div className="relative flex gap-5">
                      <div
                        className={`size-14 rounded-2xl bg-gradient-to-br ${v.color} text-white grid place-items-center shrink-0 shadow-lg`}
                      >
                        <Icon className="size-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                          {v.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {v.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── TIMELINE ─── */}
        <section className="max-w-5xl mx-auto px-6 py-28" ref={timelineRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span
              className="text-xs font-bold uppercase tracking-[0.25em] mb-3 block"
              style={{ color: "oklch(0.50 0.14 232)" }}
            >
              Our Journey
            </span>
            <h2 className="text-4xl font-black tracking-tight">
              16 Years of Growth
            </h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, oklch(0.50 0.14 232 / 0.3) 15%, oklch(0.50 0.14 232 / 0.3) 85%, transparent)",
              }}
            />

            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.06 }}
                  className={`relative grid md:grid-cols-2 gap-6 md:gap-12 items-center ${
                    i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"
                  }`}
                >
                  {/* Year bubble - centered on line */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full items-center justify-center z-10 font-black text-xs text-white shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #0089C9, #59D2F3)",
                      boxShadow: "0 0 0 4px rgba(0,137,201,0.15), 0 4px 20px rgba(0,137,201,0.3)",
                    }}
                  >
                    {item.year}
                  </div>

                  {/* Content card */}
                  <div
                    className={`${i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12 md:col-start-2"}`}
                  >
                    <div
                      className="inline-block md:hidden text-xs font-black px-3 py-1 rounded-full mb-2 text-white"
                      style={{
                        background: "linear-gradient(90deg, #0089C9, #59D2F3)",
                      }}
                    >
                      {item.year}
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-border hover:shadow-[var(--shadow-soft)] transition-all">
                      <h3 className="font-extrabold text-base text-foreground mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Empty cell to maintain grid */}
                  {i % 2 === 0 && <div className="hidden md:block" />}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TEAM QUOTES ─── */}
        <section
          className="py-24"
          style={{
            background: "linear-gradient(135deg, #001a3a 0%, #003a7a 100%)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="text-xs font-bold uppercase tracking-[0.25em] mb-3 block text-cyan-400">
                Leadership
              </span>
              <h2 className="text-4xl font-black text-white tracking-tight">
                Straight from the Team
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {TEAM_QUOTES.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="rounded-[2rem] p-8 relative overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <Quote className="size-8 text-cyan-400/40 mb-4" />
                  <p className="text-white/80 text-sm leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #0089C9, #59D2F3)",
                      }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">
                        {t.name}
                      </div>
                      <div className="text-white/50 text-xs font-semibold">
                        {t.title}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BRAND PARTNERS ─── */}
        <section className="max-w-7xl mx-auto px-6 py-24">
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
              Authorized For
            </span>
            <h2 className="text-4xl font-black tracking-tight">
              Industry-Leading Brands
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-xl mx-auto">
              We hold direct authorized distributor agreements with the top pool
              equipment manufacturers — no middlemen, no gray-market risk.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BRANDS.map((b, i) => (
              <motion.div
                key={b.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group bg-white rounded-2xl p-6 border border-border hover:border-transparent hover:shadow-[var(--shadow-soft)] transition-all flex flex-col items-center text-center gap-2"
              >
                <div
                  className="size-12 rounded-2xl flex items-center justify-center mb-1 font-black text-sm text-white"
                  style={{
                    background: "linear-gradient(135deg, #0089C9, #59D2F3)",
                  }}
                >
                  {b.name[0]}
                </div>
                <div className="font-extrabold text-base text-foreground">
                  {b.name}
                </div>
                <div className="text-[11px] text-muted-foreground font-semibold">
                  {b.role}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2
                    className="size-3"
                    style={{ color: "oklch(0.50 0.14 232)" }}
                  />
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: "oklch(0.50 0.14 232)" }}
                  >
                    Authorized Distributor
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── LOCATIONS ─── */}
        <section className="bg-surface border-y border-border py-20">
          <div className="max-w-7xl mx-auto px-6">
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
                Where We Operate
              </span>
              <h2 className="text-4xl font-black tracking-tight">
                Four Distribution Hubs
              </h2>
              <p className="text-muted-foreground text-sm mt-3">
                Strategically positioned to reach every corner of the U.S.
                within 1–3 business days.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  city: "Nashville, TN",
                  region: "Southeast & Midwest",
                  flag: "🏠",
                  note: "HQ & Primary Hub",
                },
                {
                  city: "Los Angeles, CA",
                  region: "West Coast",
                  flag: "🌊",
                  note: "West Coast Distribution",
                },
                {
                  city: "Dallas, TX",
                  region: "Southwest & Central",
                  flag: "☀️",
                  note: "Southwest Distribution",
                },
                {
                  city: "Orlando, FL",
                  region: "Southeast & Southeast",
                  flag: "🌴",
                  note: "Florida Distribution",
                },
              ].map((loc, i) => (
                <motion.div
                  key={loc.city}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-6 border border-border text-center hover:shadow-[var(--shadow-soft)] transition-all"
                >
                  <div className="text-3xl mb-3">{loc.flag}</div>
                  <div className="font-extrabold text-foreground text-base">
                    {loc.city}
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold mt-1">
                    {loc.region}
                  </div>
                  <div
                    className="text-[10px] font-bold mt-2 px-2.5 py-1 rounded-full inline-block"
                    style={{
                      background: "oklch(0.95 0.04 220)",
                      color: "oklch(0.50 0.14 232)",
                    }}
                  >
                    {loc.note}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[3rem] overflow-hidden px-8 sm:px-16 py-16 text-center"
            style={{
              background: "linear-gradient(135deg, #001f4d 0%, #003a7a 50%, #0055aa 100%)",
            }}
          >
            {/* Background glow orbs */}
            <div
              className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none -translate-y-1/2"
              style={{
                background: "radial-gradient(circle, rgba(0,180,216,0.2) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <div
              className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full pointer-events-none translate-y-1/2"
              style={{
                background: "radial-gradient(circle, rgba(89,210,243,0.15) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />

            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border border-white/20 text-white/80"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                <Users className="size-3.5" />
                Exclusive Trade Accounts
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Ready to Join
                <br />
                5,000+ Pool Professionals?
              </h2>
              <p className="text-white/65 max-w-xl mx-auto text-sm leading-relaxed mb-10">
                Open a free dealer account today and get immediate access to
                wholesale pricing, live inventory, fast fulfillment, and
                certified technical support.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm bg-white text-foreground hover:bg-white/90 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Open Dealer Account
                  <ArrowRight className="size-4" />
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

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/50 text-xs font-semibold">
                {["No Setup Fees", "Instant Approval", "Same-Day Shipping", "Factory Warranties"].map((item) => (
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
