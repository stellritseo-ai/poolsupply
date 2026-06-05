import { motion } from "framer-motion";

const brands = ["Pentair", "Hayward", "Jandy", "Raypak", "Zodiac", "Waterway"];

export function Brands() {
  return (
    <section id="brands" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Featured Brands</span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold tracking-tight">
            Built with the world's most trusted manufacturers.
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {brands.map((b, i) => (
            <motion.div
              key={b}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group h-24 rounded-2xl border border-border bg-white grid place-items-center text-xl font-extrabold tracking-tight text-muted-foreground hover:text-[oklch(0.50_0.14_232)] hover:border-[oklch(0.50_0.14_232)] hover:shadow-[var(--shadow-soft)] transition-all"
            >
              <span className="group-hover:scale-110 transition-transform">{b}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
