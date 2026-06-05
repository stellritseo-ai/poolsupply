import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Sparkles } from "lucide-react";

export function Finder() {
  const [gallons, setGallons] = useState(20000);
  const [climate, setClimate] = useState<"warm" | "moderate" | "cold">("moderate");

  const rec = useMemo(() => {
    const hp = gallons < 15000 ? "1.0 HP Variable-Speed" : gallons < 30000 ? "1.5 HP Variable-Speed" : "2.0 HP Variable-Speed";
    const btu = climate === "cold" ? "400K BTU Gas Heater" : climate === "moderate" ? "300K BTU Heat Pump" : "200K BTU Heat Pump";
    const filterSize = gallons < 20000 ? "100 sq ft Cartridge" : gallons < 35000 ? "150 sq ft Cartridge" : "200 sq ft Cartridge";
    return { hp, btu, filterSize };
  }, [gallons, climate]);

  return (
    <section id="finder" className="py-[60px] bg-surface">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] bg-white border border-border p-8 lg:p-14 shadow-[var(--shadow-soft)]"
        >
          <div className="absolute -top-32 -right-32 size-96 rounded-full bg-gradient-ocean opacity-20 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">
                <Calculator className="size-4" /> Product Finder
              </span>
              <h2 className="mt-3 text-[25px] md:text-[40px] leading-tight md:leading-[45px] font-extrabold tracking-tight">
                Find the right equipment for your pool.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Tell us about your pool. We'll generate equipment recommendations sized for performance and efficiency.
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium mb-3">
                    <span>Pool Volume</span>
                    <span className="text-[oklch(0.50_0.14_232)] font-bold">{gallons.toLocaleString()} gal</span>
                  </label>
                  <input
                    type="range" min={5000} max={50000} step={1000}
                    value={gallons} onChange={(e) => setGallons(Number(e.target.value))}
                    className="w-full accent-[oklch(0.50_0.14_232)]"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium mb-3">Climate</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["warm", "moderate", "cold"] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setClimate(c)}
                        className={`py-3 rounded-xl text-sm font-semibold capitalize transition-all duration-200 active:scale-[0.97] ${
                          climate === c
                            ? "bg-gradient-ocean text-white shadow-[var(--shadow-soft)] animate-shimmer"
                            : "bg-muted hover:bg-muted/85 text-foreground/70 hover:text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass rounded-3xl p-7 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[oklch(0.50_0.14_232)]">
                  <Sparkles className="size-4" /> Recommended for you
                </div>
                {[
                  { label: "Pool Pump", value: rec.hp },
                  { label: "Heater", value: rec.btu },
                  { label: "Filter", value: rec.filterSize },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between p-4 rounded-xl bg-white border border-border">
                    <span className="text-sm text-muted-foreground">{r.label}</span>
                    <span className="font-bold text-foreground">{r.value}</span>
                  </div>
                ))}
                <button className="w-full py-4 rounded-xl bg-gradient-ocean text-white font-semibold shadow-[var(--shadow-soft)] hover:opacity-95 transition">
                  See Matching Products
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
