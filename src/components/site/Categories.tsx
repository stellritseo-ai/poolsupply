import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import pump from "@/assets/cat-pump.jpg";
import heater from "@/assets/cat-heater.jpg";
import light from "@/assets/cat-light.jpg";
import filter from "@/assets/cat-filter.jpg";
import cleaner from "@/assets/cat-cleaner.jpg";
import automation from "@/assets/cat-automation.jpg";

const cats = [
  { name: "Pool Pumps", count: "120+ products", img: pump },
  { name: "Pool Heaters", count: "85+ products", img: heater },
  { name: "Pool Lights", count: "60+ products", img: light },
  { name: "Pool Filters", count: "95+ products", img: filter },
  { name: "Pool Cleaners", count: "70+ products", img: cleaner },
  { name: "Automation Systems", count: "40+ products", img: automation },
];

export function Categories() {
  return (
    <section id="categories" className="py-24 lg:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Shop by Category</span>
            <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold tracking-tight">
              Everything your pool needs,
              <span className="block text-gradient">expertly curated.</span>
            </h2>
          </div>
          <a href="#" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 hover:text-foreground">
            View all categories <ArrowUpRight className="size-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cats.map((c, i) => (
            <motion.a
              href="#"
              key={c.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-3xl bg-white border border-border p-6 hover:shadow-[var(--shadow-float)] transition-all hover:-translate-y-1"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[oklch(0.92_0.06_215/0.4)] to-transparent" />
              <div className="relative aspect-[4/3] mb-5 grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)]">
                <img
                  src={c.img}
                  alt={c.name}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="size-full object-contain p-6 group-hover:scale-110 transition-transform duration-700 drop-shadow-xl"
                />
              </div>
              <div className="relative flex items-end justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{c.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{c.count}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[oklch(0.50_0.14_232)] group-hover:gap-2 transition-all">
                  Quick Shop <ArrowUpRight className="size-4" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
