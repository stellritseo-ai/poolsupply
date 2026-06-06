import { motion } from "framer-motion";
import { Star, ShoppingBag, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "./cart-context";
import { getProductsList } from "@/lib/products";
import { useEffect, useState } from "react";

export function BestSellers() {
  const { add } = useCart();
  const [bestSellers, setBestSellers] = useState<any[]>([]);

  useEffect(() => {
    setBestSellers(getProductsList().slice(0, 4));
  }, []);

  return (
    <section className="py-[60px] bg-surface">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Best Sellers</span>
            <h2 className="mt-3 -mb-[30px] text-3xl md:text-[40px] font-extrabold tracking-tight">Pro Favorites This Season.</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bestSellers.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-white rounded-3xl p-5 border border-border hover:shadow-[var(--shadow-float)] hover:-translate-y-1 transition-all"
            >
              <Link to="/products/$productId" params={{ productId: p.id }} className="block">
                <div className="relative aspect-square rounded-2xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] overflow-hidden grid place-items-center">
                  <img src={p.img} alt={p.name} loading="lazy" width={400} height={400} className="size-full object-contain p-6 group-hover:scale-110 transition-transform duration-700 mix-blend-multiply" />
                  <span aria-label="Quick view" className="absolute top-3 right-3 size-10 grid place-items-center rounded-full bg-white/80 backdrop-blur opacity-0 group-hover:opacity-100 transition shadow-[var(--shadow-soft)]">
                    <Eye className="size-4" />
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{p.brand}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold">
                    <Star className="size-3.5 fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" />
                    {p.rating}
                  </span>
                </div>
                <h3 className="mt-1.5 font-semibold text-foreground leading-snug min-h-[3rem] group-hover:text-primary transition-colors">{p.name}</h3>
              </Link>
              <div className="-mt-[10px] flex items-center justify-between">
                <div className="text-2xl font-extrabold tracking-tight">${p.price.toLocaleString()}</div>
                <button
                  onClick={() => add({ id: p.id, name: p.name, brand: p.brand, price: p.price, img: p.img })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:bg-[oklch(0.50_0.14_232)] transition"
                >
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
