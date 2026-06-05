import { motion } from "framer-motion";
import { ArrowRight, Check, Truck, Award, Tag, Headphones } from "lucide-react";
import heroVideo from "@/assets/video/herovideo.mp4";

const features = [
  { icon: Truck, label: "Fast Shipping" },
  { icon: Award, label: "Top Manufacturers" },
  { icon: Tag, label: "Wholesale Pricing" },
  { icon: Headphones, label: "Expert Support" },
];

const stats = [
  { value: "20+", label: "Years Experience" },
  { value: "5,000+", label: "Products" },
  { value: "50+", label: "Top Brands" },
  { value: "USA", label: "Nationwide Shipping" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-end pt-28 pb-16 overflow-hidden isolate">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 animate-float"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.50_0.14_232/0.55)] via-[oklch(0.50_0.14_232/0.25)] to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.18_0.02_256/0.45)] to-transparent" />
      </div>

      {/* Ripple decorations */}
      <div className="pointer-events-none absolute top-1/3 right-10 size-40 rounded-full border border-white/30 animate-ripple" />
      <div className="pointer-events-none absolute top-1/2 right-32 size-60 rounded-full border border-white/20 animate-ripple [animation-delay:1s]" />

      <div className="relative mx-auto max-w-7xl px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl"
        >
          <span className="mt-[100px] md:mt-[150px] inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-white text-xs font-medium tracking-wide uppercase">
            <span className="size-1.5 rounded-full bg-[oklch(0.82_0.10_215)]" /> Trusted by 5,000+ pool professionals
          </span>

          <h1 className="mt-6 text-white font-extrabold tracking-tight text-[40px] md:text-[55px] leading-[1.05]">
            Premium Pool Equipment.
            <span className="block mt-2 bg-gradient-to-r from-white via-[oklch(0.92_0.06_215)] to-[oklch(0.82_0.10_215)] bg-clip-text text-transparent">
              Wholesale Pricing.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/85 leading-relaxed">
            Trusted supplier of pumps, heaters, filters, cleaners, automation systems and pool accessories <br className="hidden sm:block" /> from the industry's leading brands — built for professionals and homeowners alike.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#categories" className="group inline-flex items-center gap-2 px-6 py-3 text-sm rounded-full bg-white text-[oklch(0.50_0.14_232)] font-semibold shadow-[var(--shadow-float)] hover:shadow-[0_40px_80px_-30px_oklch(0.50_0.14_232/0.55)] transition-all hover:-translate-y-0.5">
              Shop Equipment
              <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
            </a>
            <a href="#brands" className="inline-flex items-center gap-2 px-6 py-3 text-sm rounded-full glass text-white font-semibold hover:bg-white/20 transition">
              View Brands
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {features.map((f) => (
              <li key={f.label} className="flex items-center gap-2 text-white/90 text-sm">
                <span className="grid place-items-center size-6 rounded-full bg-white/15 backdrop-blur">
                  <Check className="size-3.5" />
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl p-5 text-white bg-black/40 backdrop-blur-md border border-white/10 shadow-[var(--shadow-float)]">
              <div className="text-3xl lg:text-4xl font-extrabold tracking-tight">{s.value}</div>
              <div className="text-xs uppercase tracking-widest text-white/75 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
