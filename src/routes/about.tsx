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
  Sparkles,
  Building2,
  PhoneCall,
  Lock,
  PackageCheck,
  Wrench,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about")({
  head: () => {
    const pageUrl = "https://poolsupplywholesalers.com/about";
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://poolsupplywholesalers.com" },
        { "@type": "ListItem", "position": 2, "name": "About Us", "item": pageUrl }
      ]
    };

    const aboutLd = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Pool Supply Wholesalers",
      "url": pageUrl,
      "description": "America's trusted distributor of commercial pool equipment, variable speed pumps, heaters, filters, and automation systems."
    };

    return {
      meta: [
        { title: "About Us — Pool Supply Wholesalers | Commercial Pool Equipment Distributor" },
        {
          name: "description",
          content:
            "Since 2008, Pool Supply Wholesalers has been America's trusted B2B distributor of commercial pool equipment. Serving 5,000+ pool builders and technicians with authorized Pentair, Hayward, Jandy & Raypak systems.",
        },
        { name: "keywords", content: "about pool supply wholesalers, commercial pool distributor, pool equipment distributor Nashville TN, wholesale pool supplies history" },
        { property: "og:title", content: "About Pool Supply Wholesalers — Commercial Pool Distributor" },
        {
          property: "og:description",
          content:
            "The trusted wholesale partner for 5,000+ pool builders and service professionals nationwide. Fast shipping from Nashville, LA, Dallas, and Orlando.",
        },
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "About Pool Supply Wholesalers" },
        { name: "twitter:description", content: "America's leading commercial pool equipment distributor." },
        { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        { type: "application/ld+json", children: JSON.stringify(aboutLd) }
      ]
    };
  },
  component: AboutPage,
});

const STATS = [
  { value: "2008", label: "Founded in Nashville", suffix: "" },
  { value: "5,000", label: "Active Contractor Accounts", suffix: "+" },
  { value: "40", label: "Direct Wholesale Savings", suffix: "%" },
  { value: "4", label: "National Fulfillment Hubs", suffix: "" },
  { value: "24", label: "Avg. Dispatch Time", suffix: "hrs" },
  { value: "100", label: "Factory-Sealed OEM Stock", suffix: "%" },
];

const TIMELINE = [
  {
    year: "2008",
    title: "Founded in Nashville, TN",
    desc: "Established by certified pool contractors to supply regional commercial builders with tier-1 Pentair equipment at direct wholesale pricing.",
  },
  {
    year: "2012",
    title: "Hayward & Jandy OEM Authorization",
    desc: "Secured direct authorized distribution rights with Hayward and Jandy, expanding the catalog to over 3,000 commercial SKUs.",
  },
  {
    year: "2016",
    title: "West Coast Fulfillment Hub (Los Angeles)",
    desc: "Launched our California logistics center to cut transit times for west coast pool contractors to 24–48 hours.",
  },
  {
    year: "2019",
    title: "5,000 Contractor Milestone",
    desc: "Crossed 5,000 active trade partners and introduced our contractor digital ordering portal with real-time stock feeds.",
  },
  {
    year: "2022",
    title: "Dallas & Orlando Strategic Expansion",
    desc: "Opened state-of-the-art logistics hubs in Texas and Florida to support the booming sunbelt pool construction industry.",
  },
  {
    year: "2026",
    title: "Enterprise Digital Wholesale Platform",
    desc: "Deployed our next-generation wholesale architecture with live hydraulic sizing, volume tier pricing, and direct technical advisory.",
  },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "100% Genuine OEM Equipment",
    desc: "Every pump, heater, and automation unit is sourced directly from manufacturer production lines. Zero liquidation, zero gray-market units, and full factory warranty protection.",
    tag: "Factory Direct",
  },
  {
    icon: Award,
    title: "Commercial & Pro-Tier Focus",
    desc: "We curate industrial-grade variable speed pumps, commercial ASME gas heaters, and multi-element filtration systems engineered for high-duty cycles.",
    tag: "Pro Spec",
  },
  {
    icon: Truck,
    title: "4-Hub Rapid Freight Logistics",
    desc: "Four strategically positioned fulfillment centers in TN, CA, TX, and FL guarantee same-day freight dispatch on orders placed before 2:00 PM EST.",
    tag: "Same-Day Dispatch",
  },
  {
    icon: Zap,
    title: "CPO-Certified Technical Engineering",
    desc: "Our in-house advisory staff consists of former pool technicians and master hydraulic specifiers ready to verify flow calculations and BTU requirements.",
    tag: "Master Techs",
  },
];

const BRANDS = [
  { name: "Pentair", role: "Variable Speed Pumps, Filters & IntelliCenter", spec: "Authorized Master Distributor" },
  { name: "Hayward", role: "Universal H-Series, TriStar & Salt Systems", spec: "Direct OEM Partner" },
  { name: "Jandy", role: "JXi Heaters, TruClear & AquaLink Automation", spec: "Authorized Wholesale Partner" },
  { name: "Raypak", role: "Commercial ASME & Digital Gas Heaters", spec: "Authorized Master Distributor" },
  { name: "Zodiac", role: "Robotic Commercial Cleaners & Valves", spec: "Authorized Partner" },
  { name: "Waterway", role: "Commercial Filters, Manifolds & Plastics", spec: "Authorized OEM Supplier" },
];

const HUBS = [
  {
    city: "Nashville, TN",
    region: "Corporate HQ & Southeast Hub",
    address: "412 Ezell Pike, Nashville, TN 37217",
    coverage: "Midwest, East Coast & Mid-Atlantic",
    leadTime: "1-2 Business Days",
  },
  {
    city: "Los Angeles, CA",
    region: "West Coast Logistics Center",
    address: "Fulfillment Center West",
    coverage: "California, Nevada, Arizona & Pacific NW",
    leadTime: "1-2 Business Days",
  },
  {
    city: "Dallas, TX",
    region: "Southwest Distribution Hub",
    address: "Fulfillment Center Central",
    coverage: "Texas, Oklahoma, Louisiana & Central Plains",
    leadTime: "1-2 Business Days",
  },
  {
    city: "Orlando, FL",
    region: "Florida & Gulf Coast Hub",
    address: "Fulfillment Center Southeast",
    coverage: "Florida, Georgia & Coastal Southeast",
    leadTime: "1-2 Business Days",
  },
];

const LEADERSHIP = [
  {
    quote:
      "We built this company because we spent years working on equipment pads ourselves. We know the cost of a delayed freight truck or a mismatched pump flange. We engineered our supply chain to never let a contractor down.",
    name: "Michael Reynolds",
    title: "Co-Founder & Chief Executive Officer",
    role: "20+ Years Commercial Pool Construction",
  },
  {
    quote:
      "Our technical support desk is staffed by experienced technicians who understand total dynamic head, electrical draw, and heater sizing. When you call us, you speak directly with an expert.",
    name: "Sarah Thornton, CPO",
    title: "VP of Technical Engineering & Operations",
    role: "Certified Pool Operator & Hydraulic Specialist",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header alwaysDark />

      <main className="flex-1">
        {/* ─── LUXURY HERO SECTION ─── */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#040d1a] text-white border-b border-cyan-500/10">
          {/* Background Hero Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-100 opacity-70"
            style={{ backgroundImage: "url('/about-hero.png')" }}
          />

          {/* Targeted Gradient Scrim for crisp text contrast & vibrant visuals */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#040d1a]/75 via-[#040d1a]/55 to-[#040d1a]/95" />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#040d1a]/70 via-transparent to-[#040d1a]/70" />

          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-[1]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-[1]" />

          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none z-[1]" />

          <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-widest shadow-lg"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
                Wholesale Pool Equipment Distributor · Est. 2008
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white"
              >
                The Supply Chain Backbone for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                  Pool Professionals
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium"
              >
                Since 2008, Pool Supply Wholesalers has supplied over 5,000 commercial pool builders, service companies, and municipality facilities with authorized OEM equipment, nationwide 24-hour freight, and dedicated wholesale pricing.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3"
              >
                <Link
                  to="/shop/$category"
                  params={{ category: "all" }}
                  search={{ q: "" }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <span>Explore Wholesale Catalog</span>
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <PhoneCall className="size-4 text-cyan-400" />
                  <span>Contact Wholesale Desk</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── LIVE STATS HUD ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-cyan-500/30 hover:shadow-md transition-all text-center flex flex-col justify-center"
                >
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {stat.value}
                    <span className="text-cyan-600 text-lg font-black">{stat.suffix}</span>
                  </div>
                  <div className="text-[11px] font-extrabold text-slate-500 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── OUR STORY (EDITORIAL SPLIT) ─── */}
        <section className="py-[50px] bg-slate-50/60 border-y border-slate-200/80">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Narrative */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-6 space-y-5"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-500/10 border border-cyan-500/20">
                  <Sparkles className="size-3 text-cyan-600" /> Authorized Distributor Story
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Built by Licensed Contractors,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-700">
                    Engineered for the Trade
                  </span>
                </h2>

                <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  <p>
                    Pool Supply Wholesalers was founded in 2008 by commercial pool builders who experienced the daily friction of fragmented supply chains, inflated equipment markups, and uncertain lead times.
                  </p>
                  <p>
                    Starting with our primary distribution facility in Nashville, Tennessee, we forged direct manufacturer relationships with the premier names in aquatic engineering: <strong>Pentair, Hayward, Jandy, and Raypak</strong>.
                  </p>
                  <p>
                    Today, we operate four nationwide logistics centers spanning over 250,000 square feet of fulfillment space, stocking over 8,000 commercial SKUs and providing pool professionals with uninterrupted access to essential equipment.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-2 text-cyan-700 font-extrabold text-xs">
                      <CheckCircle2 className="size-4" /> Direct OEM Warranty
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Full factory warranty registration support</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-2 text-cyan-700 font-extrabold text-xs">
                      <Truck className="size-4" /> Liftgate Freight Delivery
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Commercial job site & warehouse drop-off</div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Visual Showcase */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-6 relative"
              >
                <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl aspect-[4/3] bg-slate-900">
                  <img
                    src="/about-hero.png"
                    alt="Commercial pool equipment installation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Floating Verified Badge */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md flex items-center justify-between text-white shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 grid place-items-center shrink-0">
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">Nashville Central Distribution Hub</div>
                        <div className="text-[10px] text-slate-400">412 Ezell Pike, Nashville, TN 37217</div>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-[10px] font-bold">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Hub
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── FOUR CORE VALUES ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-500/10 border border-cyan-500/20">
                Core Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Our Operational Commitments
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Standards engineered directly into every quote, order fulfillment, and technical delivery.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.div
                    key={v.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-cyan-500/40 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="size-10 rounded-xl bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 grid place-items-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                          <Icon className="size-5" />
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                          {v.tag}
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-cyan-700 transition-colors">
                        {v.title}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {v.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── NATIONAL DISTRIBUTION HUBS ─── */}
        <section className="py-[50px] bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800/60">
                Logistics Infrastructure
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Four Strategic National Fulfillment Hubs
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Positioned to deliver commercial freight and parcel shipments nationwide within 24 to 48 hours.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HUBS.map((hub, i) => (
                <motion.div
                  key={hub.city}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between hover:bg-white/10 hover:border-cyan-500/40 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="size-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 grid place-items-center font-bold text-xs">
                        <MapPin className="size-4" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {hub.leadTime}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-white">{hub.city}</h3>
                      <div className="text-[11px] text-cyan-400 font-semibold">{hub.region}</div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                      {hub.coverage}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Freight Dispatch</span>
                    <span className="text-emerald-400 font-bold">Same Day</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── AUTHORIZED BRAND PARTNERS ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-500/10 border border-cyan-500/20">
                Direct Partnerships
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Authorized Master Distribution
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Direct manufacturer agreements guaranteeing genuine equipment and complete warranty validity.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BRANDS.map((b, i) => (
                <motion.div
                  key={b.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-cyan-500/30 hover:shadow-md transition-all flex items-start gap-3.5"
                >
                  <div className="size-11 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-black text-base grid place-items-center shrink-0 shadow-xs">
                    {b.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-extrabold text-slate-900">{b.name}</h3>
                      <span className="text-[10px] font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200/60">
                        {b.spec}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{b.role}</p>
                    <Link
                      to="/brands/$brand"
                      params={{ brand: b.name.toLowerCase() }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:text-cyan-800 hover:underline mt-2"
                    >
                      <span>View {b.name} Catalog</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 16-YEAR JOURNEY TIMELINE ─── */}
        <section className="py-[50px] bg-slate-50/70 border-y border-slate-200/80">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-500/10 border border-cyan-500/20">
                Milestones
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                18 Years of Continuous Growth
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                From a single regional warehouse in Tennessee to a nationwide commercial distribution network.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-cyan-500/30 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="inline-block text-xs font-black px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-2xs">
                      {item.year}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── LEADERSHIP & PERSPECTIVE ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-500/10 border border-cyan-500/20">
                Executive Leadership
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Our Trade Leadership
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {LEADERSHIP.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-2xl p-6 bg-slate-900 text-white border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <Quote className="size-7 text-cyan-400/40" />
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic font-medium">
                      "{item.quote}"
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-white">{item.name}</div>
                      <div className="text-[11px] text-cyan-400 font-semibold">{item.title}</div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                      {item.role}
                    </span>
                  </div>
                </motion.div>
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
                  <Users className="size-3.5" />
                  Contractor Direct Accounts
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Ready to Partner with America's Premier{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                    Pool Equipment Distributor?
                  </span>
                </h2>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  Open a free commercial account today for immediate access to wholesale pricing tiers, live warehouse stock levels, and certified technical support.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-[0_8px_25px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
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

                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4 text-[11px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-cyan-400" />
                    Zero Account Setup Fees
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-cyan-400" />
                    Same-Day Freight Dispatch
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-cyan-400" />
                    100% Genuine OEM Warranty
                  </span>
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
