import { motion } from "framer-motion";
import { Star, ShoppingBag, Eye } from "lucide-react";
import pump from "@/assets/cat-pump.jpg";
import heater from "@/assets/cat-heater.jpg";
import light from "@/assets/cat-light.jpg";
import cleaner from "@/assets/cat-cleaner.jpg";
import { useCart } from "./cart-context";

const products = [
  { id: "p-intelliflo", name: "Variable-Speed IntelliFlo Pump", brand: "Pentair", price: 1289, rating: 4.9, img: pump },
  { id: "p-raypak-400k", name: "Digital Pool Heater Pro 400K", brand: "Raypak", price: 2499, rating: 4.8, img: heater },
  { id: "p-colorlogic", name: "ColorLogic LED Pool Light", brand: "Hayward", price: 349, rating: 4.9, img: light },
  { id: "p-cx3", name: "Robotic Pool Cleaner CX-3", brand: "Jandy", price: 899, rating: 4.7, img: cleaner },
];


export function BestSellers() {
  return (
    <section className="py-24 lg:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Best Sellers</span>
            <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold tracking-tight">Pro favorites this season.</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p, i) => (
            <motion.article
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-white rounded-3xl p-5 border border-border hover:shadow-[var(--shadow-float)] hover:-translate-y-1 transition-all"
            >
              <div className="relative aspect-square rounded-2xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] overflow-hidden grid place-items-center">
                <img src={p.img} alt={p.name} loading="lazy" width={400} height={400} className="size-full object-contain p-6 group-hover:scale-110 transition-transform duration-700" />
                <button aria-label="Quick view" className="absolute top-3 right-3 size-10 grid place-items-center rounded-full bg-white/80 backdrop-blur opacity-0 group-hover:opacity-100 transition shadow-[var(--shadow-soft)]">
                  <Eye className="size-4" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{p.brand}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold">
                  <Star className="size-3.5 fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" />
                  {p.rating}
                </span>
              </div>
              <h3 className="mt-1.5 font-semibold text-foreground leading-snug min-h-[3rem]">{p.name}</h3>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-2xl font-extrabold tracking-tight">${p.price.toLocaleString()}</div>
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:bg-[oklch(0.50_0.14_232)] transition">
                  <ShoppingBag className="size-3.5" /> Add
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
