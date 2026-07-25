import { motion } from "framer-motion";
import { ArrowRight, Check, Truck, Award, Tag, Headphones, Sparkles, Clock, PackageCheck, Users } from "lucide-react";
import heroVideo from "@/assets/video/herovideo.mp4";
import { Link } from "@tanstack/react-router";

const features = [
  { icon: Truck, label: "Same Day Shipping" },
  { icon: Award, label: "100% Genuine Brands" },
  { icon: Tag, label: "Wholesale Trade Pricing" },
  { icon: Headphones, label: "Pro Tech Support" },
];

const stats = [
  { value: "20+", label: "Years Industry Leadership", icon: Clock, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  { value: "8,000+", label: "Commercial Products", icon: PackageCheck, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  { value: "50+", label: "Authorized Brands", icon: Award, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { value: "5,000+", label: "Verified Trade Buyers", icon: Users, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
];

const duplicatedStats = [...stats, ...stats, ...stats, ...stats];

export function Hero() {
  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex items-center pt-32 pb-20 overflow-hidden isolate bg-slate-950 font-sans">
      {/* Background Video & Overlays */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 filter brightness-100 contrast-105"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Slightly Lighter Layered Background Overlays */}
        <div className="absolute inset-0 bg-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-transparent" />

        {/* Radial Ambient Glows */}
        <div className="absolute top-1/4 left-10 w-[600px] h-[600px] bg-cyan-500/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/12 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full">
        {/* Hero Top Text Content Container */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-4xl space-y-8">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-6 sm:mt-16 lg:mt-24"
            >
              <span className="inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-xl">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span className="truncate">Trusted by 5,000+ Certified Pool Professionals</span>
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="space-y-3 sm:space-y-4"
            >
              <h1 className="text-white tracking-tight leading-tight font-extrabold text-3xl sm:text-4xl lg:text-[42px]">
                Premium Pool Equipment. Wholesale{" "}
                <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                  Direct Pricing.
                </span>
              </h1>

              <p className="max-w-2xl leading-relaxed font-medium text-sm sm:text-base lg:text-lg text-white/90">
                America's leading wholesale catalog for commercial pumps, heaters, filters, salt systems, and smart automation — engineered for trade pros and pool owners alike.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
            >
              <Link
                to="/shop/$category"
                params={{ category: "all" }}
                search={{ q: "" }}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-[0_8px_20px_rgba(6,182,212,0.3)] hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                Shop Equipment Catalog
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/finder"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-xl text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              >
                <Sparkles className="size-4 text-cyan-400" />
                Sizing Wizard
              </Link>
            </motion.div>

            {/* Features Pills */}
            <motion.ul
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-2 pt-2"
            >
              {features.map((f) => (
                <li
                  key={f.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] sm:text-xs font-bold text-white shadow-sm"
                >
                  <Check className="size-3 text-cyan-400 shrink-0" />
                  {f.label}
                </li>
              ))}
            </motion.ul>
          </div>
        </div>

        {/* Infinite Sliding Stats Marquee Track (Width 100% No Side Gaps) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 relative w-full overflow-hidden py-3"
        >
          <div className="flex w-max animate-marquee gap-4">
            {duplicatedStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={`${s.label}-${i}`}
                  className="w-[220px] sm:w-[240px] shrink-0 group rounded-[1.6rem] p-4 sm:p-5 bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-2xl shadow-xl hover:border-cyan-300 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Glowing Line on Hover */}
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                      {s.value}
                    </div>
                    <div className={`size-8 rounded-xl ${s.color} border grid place-items-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="size-4" />
                    </div>
                  </div>

                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors truncate">
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
