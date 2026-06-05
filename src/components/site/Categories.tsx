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
    <section id="categories" className="py-[60px] bg-surface">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Shop by Category</span>
            <h2 className="mt-3 text-3xl md:text-[35px] font-extrabold tracking-tight">
              Everything your pool needs, <span className="text-gradient">expertly curated.</span>
            </h2>
          </div>
          <a href="#" className="hidden md:inline-flex group items-center gap-2 px-6 py-3 text-sm rounded-full bg-white text-[oklch(0.50_0.14_232)] font-semibold shadow-[var(--shadow-soft)] hover:shadow-[0_20px_40px_-15px_oklch(0.50_0.14_232/0.3)] transition-all hover:-translate-y-0.5 border border-border/50">
            View all categories <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map((c, i) => (
            <motion.a
              href="#"
              key={c.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-[2rem] bg-white border border-border/80 p-5 hover:shadow-[0_30px_60px_-15px_oklch(0.50_0.14_232/0.12)] hover:border-primary/30 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] w-full mb-5 grid place-items-center overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-surface to-muted/40 border border-border/40">
                {/* Subtle overlay reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Floating Image */}
                <img
                  src={c.img}
                  alt={c.name}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="w-[82%] h-[82%] object-contain mix-blend-multiply group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-700 ease-out"
                />
                
                {/* Floating pill badge */}
                <span className="absolute top-4 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-white/90 backdrop-blur border border-white/50 rounded-full shadow-sm">
                  {c.count}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1 px-1">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">{c.name}</h3>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-all duration-300 mt-1">
                    Explore Equipment <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
                
                <span className="size-10 rounded-full bg-muted group-hover:bg-primary group-hover:text-white text-foreground/80 grid place-items-center transition-all duration-300 shadow-sm active:scale-90 shrink-0">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
