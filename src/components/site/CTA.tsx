import { motion } from "framer-motion";
import { ArrowRight, Sparkles, PhoneCall, ShieldCheck, Truck, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CTA() {
  return (
    <section id="cta" className="px-4 sm:px-6 py-16 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-8 sm:p-14 lg:p-20 text-white shadow-2xl"
      >
        {/* Top Accent Gradient Line */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-bold uppercase tracking-widest shadow-xl">
              <Sparkles className="size-3.5" /> Instant Trade Access
            </span>

            <h2
              className="text-white tracking-tight leading-tight"
              style={{ fontSize: "40px", fontWeight: 800, marginTop: "-12px", marginBottom: "13px" }}
            >
              Ready to Upgrade Your Commercial{" "}
              <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                Pool Equipment?
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed font-medium mx-auto lg:mx-0">
              Unlock direct wholesale pricing on Pentair, Hayward, Jandy, and Raypak. Speak with a certified pool specialist or browse 8,000+ commercial SKUs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/shop/$category"
                params={{ category: "all" }}
                search={{ q: "" }}
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm shadow-[0_10px_30px_rgba(6,182,212,0.35)] hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                Browse Full Catalog
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <PhoneCall className="size-4 text-cyan-400" />
                Talk to a Specialist
              </Link>
            </div>
          </div>

          {/* Right Value Propositions Box */}
          <div className="lg:col-span-4 grid gap-3 pt-6 lg:pt-0">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center gap-3">
              <div className="size-10 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 grid place-items-center shrink-0">
                <Truck className="size-5" />
              </div>
              <div>
                <div className="text-xs font-black text-white">Same Day Shipping</div>
                <div className="text-[10px] text-slate-400">Orders placed before 2 PM EST</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center gap-3">
              <div className="size-10 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 grid place-items-center shrink-0">
                <Tag className="size-5" />
              </div>
              <div>
                <div className="text-xs font-black text-white">Direct Wholesale Rates</div>
                <div className="text-[10px] text-slate-400">No middleman price markups</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center gap-3">
              <div className="size-10 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 grid place-items-center shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <div className="text-xs font-black text-white">100% Authorized Distributor</div>
                <div className="text-[10px] text-slate-400">Full factory warranty coverage</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
