import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Sparkles, Waves, Flame, Filter as FilterIcon, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

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
    <section id="finder" className="py-20 bg-slate-50/70 font-sans">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[1.8rem] sm:rounded-[2.5rem] bg-white border border-slate-200/90 p-5 sm:p-8 lg:p-14 shadow-xl"
        >
          {/* Subtle Light Ambient Glow */}
          <div className="absolute -top-32 -right-32 size-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Controls Column */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/60 text-cyan-700 text-xs font-bold uppercase tracking-widest shadow-2xs">
                <Calculator className="size-4 text-cyan-600" /> Equipment Sizing Calculator
              </span>

              <h2 className="text-slate-900 tracking-tight leading-tight text-2xl sm:text-3xl font-extrabold">
                Find Perfectly Sized Pool Equipment
              </h2>
              
              <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
                Input your pool capacity and climate zone. Our algorithm instantly calculates optimum pump horsepower, heating BTU, and filtration area.
              </p>

              {/* Input Controls */}
              <div className="space-y-6 pt-2">
                {/* Volume Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Pool Volume
                    </label>
                    <span className="px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 font-black text-sm">
                      {gallons.toLocaleString()} US Gallons
                    </span>
                  </div>

                  <input
                    type="range"
                    min={5000}
                    max={50000}
                    step={1000}
                    value={gallons}
                    onChange={(e) => setGallons(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-600 transition-all"
                  />

                  {/* Volume Presets */}
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-400">
                    {[10000, 20000, 35000, 50000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setGallons(preset)}
                        className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          gallons === preset
                            ? "bg-slate-900 text-white border-slate-900 font-extrabold"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        {preset.toLocaleString()} gal
                      </button>
                    ))}
                  </div>
                </div>

                {/* Climate Buttons */}
                <div className="space-y-3">
                  <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Climate Zone
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "warm", label: "Warm (80°F+)", desc: "Southern States" },
                      { id: "moderate", label: "Moderate (60-80°F)", desc: "Midwest & Coastal" },
                      { id: "cold", label: "Cold (<60°F)", desc: "Northern & Canada" },
                    ].map((c) => {
                      const isActive = climate === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setClimate(c.id as any)}
                          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer active:scale-95 ${
                            isActive
                              ? "bg-cyan-600 text-white border-cyan-600 shadow-md font-bold"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-semibold"
                          }`}
                        >
                          <div className="text-xs font-extrabold truncate">{c.label}</div>
                          <div className={`text-[10px] mt-0.5 truncate ${isActive ? "text-cyan-100" : "text-slate-400"}`}>
                            {c.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Recommended Bundle Card */}
            <div className="lg:col-span-5">
              <div className="rounded-[2rem] bg-gradient-to-b from-slate-50/90 to-white border border-slate-200/90 p-7 lg:p-8 shadow-xl space-y-5 relative">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-cyan-800 bg-cyan-100/70 px-3 py-1 rounded-full border border-cyan-200">
                    <Sparkles className="size-3.5 text-cyan-600" /> Sizing Match
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-600" /> Optimum Flow
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Pump Spec */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-cyan-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-cyan-50 border border-cyan-200/60 text-cyan-700 grid place-items-center shrink-0">
                        <Waves className="size-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Pump</span>
                        <span className="text-xs font-black text-slate-900">{rec.hp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Heater Spec */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-cyan-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-700 grid place-items-center shrink-0">
                        <Flame className="size-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Heater</span>
                        <span className="text-xs font-black text-slate-900">{rec.btu}</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter Spec */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-cyan-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700 grid place-items-center shrink-0">
                        <FilterIcon className="size-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Filter</span>
                        <span className="text-xs font-black text-slate-900">{rec.filterSize}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    to="/finder"
                    className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    Launch Full Sizing Wizard <ArrowRight className="size-4" />
                  </Link>

                  <p className="text-[10px] text-center text-slate-400 font-semibold">
                    Calculated for optimal energy star turnover & lower electricity costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
