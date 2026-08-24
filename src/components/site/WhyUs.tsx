import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Tag, Headphones, Truck, ShieldCheck, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const features = [
  {
    icon: Tag,
    badge: "Trade Pricing",
    title: "Direct Wholesale Rates",
    desc: "Wholesale contractor margins on leading pumps, heaters, and filters with transparent tiered volume discounts.",
    bullet1: "Instant trade price unlocks",
    bullet2: "No minimum order quantities",
  },
  {
    icon: Truck,
    badge: "Fast Dispatch",
    title: "Priority Nationwide Freight",
    desc: "Same-day warehouse dispatch with certified freight carriers and real-time tracking from dock to jobsite.",
    bullet1: "Same-day warehouse processing",
    bullet2: "Direct jobsite delivery available",
  },
  {
    icon: Headphones,
    badge: "Tech Support",
    title: "Dedicated Pool Specialists",
    desc: "Direct access to master equipment technicians for hydraulic sizing, BTU calculations, and automation specs.",
    bullet1: "Hydraulic head-loss sizing",
    bullet2: "Automation wiring assistance",
  },
  {
    icon: ShieldCheck,
    badge: "100% Genuine",
    title: "Factory OEM Warranties",
    desc: "Every item is brand-new, factory-sealed, and fully covered under authorized manufacturer warranty terms.",
    bullet1: "Direct manufacturer backing",
    bullet2: "Authentic certified serials",
  },
];

export function WhyUs() {
  return (
    <section id="why" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-surface/60 to-white relative overflow-hidden isolate">
      {/* Background Ambient Video */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 filter brightness-105 contrast-110 opacity-15"
        >
          <source src="https://res.cloudinary.com/dmanafb84/video/upload/v1787602658/pools_phemjp.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-5xl mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-cyan-700 font-extrabold bg-cyan-500/10 rounded-full mb-3 border border-cyan-500/20">
            <Sparkles className="size-3.5 text-cyan-600" />
            The Poolsby Advantage
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-extrabold tracking-tight text-slate-900 leading-tight">
            A wholesale supplier you can <span className="text-gradient">build a business on.</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed max-w-3xl">
            Engineered specifically for pool contractors, service technicians, and commercial facility managers demanding reliable supply chains and authentic equipment.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative bg-white rounded-[1.5rem] p-6 sm:p-7 border border-slate-200/85 hover:border-cyan-500/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,137,201,0.18)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Top Corner Subtle Ambient Glow */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-cyan-500/10 via-transparent to-transparent rounded-bl-full pointer-events-none group-hover:from-cyan-500/20 transition-all duration-500" />

              <div>
                {/* Icon & Badge Row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="size-12 sm:size-13 rounded-2xl bg-gradient-to-tr from-[#0089C9] to-[#59D2F3] text-white flex items-center justify-center shadow-[0_6px_18px_-2px_rgba(0,137,201,0.35)] group-hover:scale-108 group-hover:rotate-1 transition-all duration-300">
                    <it.icon className="size-5 sm:size-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-800 bg-cyan-50/90 px-2.5 py-1 rounded-full border border-cyan-200/60 shadow-2xs">
                    {it.badge}
                  </span>
                </div>

                {/* Title & Desc */}
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight group-hover:text-cyan-700 transition-colors mb-2">
                  {it.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-5">
                  {it.desc}
                </p>
              </div>

              {/* Bullet Highlights */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 text-[11.5px] font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{it.bullet1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{it.bullet2}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pro Account Callout Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10 sm:mt-12 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-slate-800"
        >
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="size-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Tag className="size-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white">Need large commercial project quotes or pallet pricing?</h4>
              <p className="text-xs text-slate-400">Our commercial desk provides custom quotes within 2 business hours.</p>
            </div>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-cyan-500/25 active:scale-95 shrink-0"
          >
            <span>Request Trade Quote</span>
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
