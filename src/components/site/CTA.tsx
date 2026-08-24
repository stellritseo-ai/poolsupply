import { motion } from "framer-motion";
import { ArrowRight, Sparkles, PhoneCall, ShieldCheck, Truck, Tag, CheckCircle2, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CTA() {
  return (
    <section id="cta" className="py-[50px] px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden bg-background">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-[1360px] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#061220] via-[#091f38] to-[#040d1a] border border-cyan-500/20 p-6 sm:p-12 lg:p-14 text-white shadow-[0_25px_70px_-20px_rgba(0,109,171,0.35)]"
      >
        {/* Top Accent Gradient Line */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Ambient Radial Glow Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Content Area */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-widest shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              Instant Trade Access
            </span>

            <h2 className="text-white tracking-tight leading-tight text-2xl sm:text-3xl lg:text-[36px] font-black">
              Ready to Upgrade Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                Commercial Pool Equipment?
              </span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed font-medium mx-auto lg:mx-0">
              Unlock direct tier-1 wholesale pricing on Pentair, Hayward, Jandy, and Raypak. Speak with a certified pool specialist or browse 8,000+ commercial SKUs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                to="/shop/$category"
                params={{ category: "all" }}
                search={{ q: "" }}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-[0_8px_25px_rgba(6,182,212,0.35)] hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-98 transition-all duration-200 cursor-pointer"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm backdrop-blur-md hover:scale-[1.02] active:scale-98 transition-all duration-200 cursor-pointer"
              >
                <PhoneCall className="size-4 text-cyan-400" />
                <span>Talk to a Specialist</span>
              </Link>
            </div>
          </div>

          {/* Right Value Proposition Tiles */}
          <div className="lg:col-span-5 grid gap-3 pt-4 lg:pt-0">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/10 hover:border-cyan-500/40 transition-all duration-200 group">
              <div className="size-11 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 grid place-items-center shrink-0 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <Truck className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-extrabold text-white">Same-Day Freight Dispatch</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Orders placed before 2:00 PM EST ship same day</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/10 hover:border-cyan-500/40 transition-all duration-200 group">
              <div className="size-11 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 grid place-items-center shrink-0 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <Tag className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-extrabold text-white">Direct Wholesale Trade Rates</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Commercial volume margins with zero markups</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5 hover:bg-white/10 hover:border-cyan-500/40 transition-all duration-200 group">
              <div className="size-11 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 grid place-items-center shrink-0 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <ShieldCheck className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-extrabold text-white">100% Authorized OEM Distributor</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Full factory serial verification and warranty</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
