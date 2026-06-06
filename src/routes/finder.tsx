import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { products, Product } from "@/lib/products";
import { useCart, formatUSD } from "@/components/site/cart-context";
import { Calculator, Sparkles, Star, ShoppingBag, Eye, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/finder")({
  head: () => ({
    meta: [
      { title: "Product Finder — Pool Supply Wholesalers" },
      { name: "description", content: "Use our intelligent pool equipment calculator to find the perfect pumps, heaters, and filters sized for your pool." }
    ],
  }),
  component: FinderPage,
});

function FinderPage() {
  const [gallons, setGallons] = useState(20000);
  const [climate, setClimate] = useState<"warm" | "moderate" | "cold">("moderate");
  const { add } = useCart();

  // Recommendations logic
  const rec = useMemo(() => {
    const hp = gallons < 15000 ? "1.0 HP" : gallons < 30000 ? "1.5 HP" : "3.0 HP";
    const heaterBtu = climate === "cold" ? "400,000 BTU" : climate === "moderate" ? "300,000 BTU" : "120,000 BTU";
    const filterArea = gallons < 20000 ? "320 Sq. Ft." : "340 Sq. Ft.";
    return { hp, heaterBtu, filterArea };
  }, [gallons, climate]);

  // Find exact or closest matching products in our database
  const matchingProducts = useMemo(() => {
    const matched: Product[] = [];
    
    // Find matching pump
    const pumpMatch = products.find(p => 
      p.category === "Pool Pumps" && p.specs["Horsepower"]?.includes(rec.hp)
    ) || products.find(p => p.category === "Pool Pumps"); // fallback
    if (pumpMatch) matched.push(pumpMatch);

    // Find matching heater
    const heaterMatch = products.find(p => 
      (p.category === "Pool Heaters" || p.category === "Electric Heat Pumps") && 
      (p.specs["Capacity (BTU)"]?.includes(rec.heaterBtu.split(",")[0]) || 
       p.specs["Capacity"]?.includes(rec.heaterBtu.split(",")[0]))
    ) || products.find(p => p.category === "Pool Heaters"); // fallback
    if (heaterMatch) matched.push(heaterMatch);

    // Find matching filter
    const filterMatch = products.find(p => 
      p.category === "Pool Filters" && p.specs["Filter Area"]?.includes(rec.filterArea)
    ) || products.find(p => p.category === "Pool Filters"); // fallback
    if (filterMatch) matched.push(filterMatch);

    return matched;
  }, [rec]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1 pt-28 pb-20">
        <section className="bg-gradient-to-b from-surface to-background border-b border-border/50 py-12 mb-10">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">
              <Calculator className="size-4" /> Intelligent Sizing
            </span>
            <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">Pool Equipment Finder</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Input your pool details below. Our advanced algorithm sizes and recommends the optimal pump horsepower, heater capacity, and filter area for peak performance.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-start">
            {/* Calculator Inputs */}
            <div className="space-y-8 rounded-3xl bg-white border border-border p-8 shadow-[var(--shadow-soft)]">
              <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <Calculator className="size-5 text-[oklch(0.50_0.14_232)]" /> Step 1: Tell Us About Your Pool
              </h2>
              
              <div className="space-y-6">
                {/* Gallons Slider */}
                <div>
                  <label className="flex items-center justify-between text-sm font-bold mb-3">
                    <span>Pool Volume (Gallons)</span>
                    <span className="text-[oklch(0.50_0.14_232)] text-base font-black">{gallons.toLocaleString()} gal</span>
                  </label>
                  <input
                    type="range" min={5000} max={50000} step={1000}
                    value={gallons} onChange={(e) => setGallons(Number(e.target.value))}
                    className="w-full accent-[oklch(0.50_0.14_232)]"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-2">
                    <span>5,000 gal (Small Spa/Pool)</span>
                    <span>50,000 gal (Large Residential)</span>
                  </div>
                </div>

                {/* Climate Selector */}
                <div>
                  <div className="text-sm font-bold mb-3">Your Climate Zone</div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["warm", "moderate", "cold"] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setClimate(c)}
                        className={`py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.97] border ${
                          climate === c
                            ? "bg-gradient-ocean border-primary text-white shadow-[var(--shadow-soft)] animate-shimmer"
                            : "bg-surface border-border hover:bg-muted text-foreground/75 hover:text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3">
                    Climate affects heating loss. Colder zones require higher BTU capacities to maintain pool temperatures.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Recommendation Output */}
            <div className="rounded-3xl bg-surface border border-border/80 p-8 space-y-6 lg:sticky lg:top-28">
              <div className="flex items-center gap-2 text-sm font-bold text-[oklch(0.50_0.14_232)]">
                <Sparkles className="size-4 animate-pulse" /> Sizing Recommendations
              </div>
              
              <div className="space-y-4">
                {[
                  { label: "Optimal Pump Power", value: rec.hp, desc: "Provides full turn-over without overloading pipes" },
                  { label: "Required Heater Capacity", value: rec.heaterBtu, desc: "Sized to heat pool in under 12 hours" },
                  { label: "Minimum Filter Area", value: rec.filterArea, desc: "Maintains optimal cartridge filtration rates" },
                ].map((r, i) => (
                  <motion.div 
                    key={r.label} 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="p-4 rounded-2xl bg-white border border-border/80"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{r.label}</span>
                    <div className="font-extrabold text-lg text-foreground mt-0.5">{r.value}</div>
                    <span className="text-[10px] text-muted-foreground/80 mt-1 block">{r.desc}</span>
                  </motion.div>
                ))}
              </div>

              <div className="text-center pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  ⚡ Sized for 90% Energy Efficiency
                </span>
              </div>
            </div>
          </div>

          {/* Matched Products Grid */}
          <section className="mt-16 pt-12 border-t border-border">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Matched Hardware</span>
                <h2 className="mt-1 text-2xl md:text-3xl font-black tracking-tight">Your Recommended Pool Bundle</h2>
              </div>
              <button 
                onClick={() => { setGallons(20000); setClimate("moderate"); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border border-border hover:bg-surface transition active:scale-95"
              >
                <RefreshCw className="size-3" /> Reset Calculator
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {matchingProducts.map((p) => {
                const savings = p.msrp - p.price;
                return (
                  <article
                    key={p.id}
                    className="group bg-white rounded-3xl p-5 border border-border hover:shadow-[var(--shadow-float)] hover:-translate-y-1 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <Link to="/products/$productId" params={{ productId: p.id }} className="block">
                        <div className="relative aspect-square rounded-2xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] overflow-hidden grid place-items-center">
                          <img src={p.img} alt={p.name} loading="lazy" className="size-[80%] object-contain p-4 group-hover:scale-105 transition-transform duration-700 mix-blend-multiply" />
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
                        <h3 className="mt-1.5 font-bold text-foreground leading-snug min-h-[3rem] group-hover:text-primary transition-colors">{p.name}</h3>
                      </Link>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground/80 line-through">MSRP {formatUSD(p.msrp)}</div>
                        <div className="text-xl font-black tracking-tight text-[oklch(0.50_0.14_232)]">{formatUSD(p.price)}</div>
                        <div className="text-[9px] font-bold text-emerald-600 mt-0.5">Save {formatUSD(savings)}</div>
                      </div>
                      
                      <button
                        onClick={() => add(p, 1)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:bg-[oklch(0.50_0.14_232)] hover:text-white transition"
                      >
                        <ShoppingBag className="size-3.5" /> Add
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
