import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="px-6 py-[60px]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-ocean p-12 lg:p-20 text-white"
      >
        <div className="absolute -top-20 -left-20 size-80 rounded-full border border-white/20 animate-ripple" />
        <div className="absolute -bottom-32 -right-20 size-96 rounded-full border border-white/10 animate-ripple [animation-delay:1.5s]" />
        <div className="relative max-w-4xl">
          <h2 className="text-[26px] md:text-[45px] text-center md:text-left font-extrabold tracking-tight leading-[36px] md:leading-[1]">
            Ready to upgrade your pool equipment?
          </h2>
          <p className="mt-5 text-lg text-white/85 max-w-xl">
            Get wholesale pricing on every major brand. Talk to a specialist or browse 5,000+ products today.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#categories" className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white text-[oklch(0.50_0.14_232)] font-semibold shadow-[var(--shadow-float)] hover:-translate-y-0.5 transition">
              Shop Products <ArrowRight className="size-4" />
            </a>
            <a href="#" className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition">
              Contact Sales
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
