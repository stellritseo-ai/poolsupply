import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Waves,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Sun,
  CloudSun,
  Snowflake,
  Check,
  Building2,
  Home,
  Clock,
  DollarSign,
  Gauge,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useProductsQuery, getProductImage, products as defaultProducts } from "@/lib/products";
import { useCart, formatUSD } from "./cart-context";

export function Finder() {
  const [gallons, setGallons] = useState(20000);
  const [poolType, setPoolType] = useState<"residential" | "commercial" | "spa">("residential");
  const [climate, setClimate] = useState<"warm" | "moderate" | "cold">("moderate");
  const [bundleAdded, setBundleAdded] = useState(false);

  const { data: allProducts = [] } = useProductsQuery();
  const productsList = allProducts.length > 0 ? allProducts : defaultProducts;
  const { add } = useCart();

  // Dynamic Hydraulic Calculations
  const turnoverHours = poolType === "commercial" ? 6 : poolType === "spa" ? 2 : 8;
  const gpm = Math.round(gallons / (turnoverHours * 60));
  const hpSpec = gpm < 45 ? "1.5 HP Variable-Speed" : gpm < 75 ? "2.0 HP Variable-Speed" : "3.0 HP Commercial VS";
  const btuSpec =
    climate === "cold"
      ? "400k BTU Gas"
      : climate === "moderate"
      ? "250k - 300k Hybrid"
      : "140k - 200k Heat Pump";
  const filterSpec =
    gallons < 18000
      ? "150 - 200 Sq. Ft."
      : gallons < 32000
      ? "320 - 420 Sq. Ft."
      : "520 Sq. Ft. Commercial";
  const annualSavings = Math.round((gallons / 1000) * 32 + 350);

  // Match real real-time products from the database
  const matchedPump = useMemo(() => {
    const pumps = productsList.filter((p) => {
      const cat = (p.category || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      return (cat.includes("pump") || name.includes("pump")) && p.img && !p.img.includes("commingsoon");
    });
    if (pumps.length === 0) return null;
    if (gallons < 15000) {
      return pumps.find((p) => p.name.toLowerCase().includes("1.5") || p.name.toLowerCase().includes("super")) || pumps[0];
    } else if (gallons < 32000) {
      return (
        pumps.find(
          (p) =>
            p.name.toLowerCase().includes("intelliflo") ||
            p.name.toLowerCase().includes("vsf") ||
            p.name.toLowerCase().includes("tristar")
        ) ||
        pumps[1] ||
        pumps[0]
      );
    } else {
      return (
        pumps.find(
          (p) =>
            p.name.toLowerCase().includes("3.0") ||
            p.name.toLowerCase().includes("intelliflo3") ||
            p.name.toLowerCase().includes("commercial")
        ) ||
        pumps[2] ||
        pumps[0]
      );
    }
  }, [productsList, gallons]);

  const matchedHeater = useMemo(() => {
    const heaters = productsList.filter((p) => {
      const cat = (p.category || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      return (
        (cat.includes("heater") || name.includes("heater") || name.includes("heat pump")) &&
        p.img &&
        !p.img.includes("commingsoon")
      );
    });
    if (heaters.length === 0) return null;
    if (climate === "cold") {
      return (
        heaters.find(
          (p) =>
            p.name.toLowerCase().includes("400") ||
            p.name.toLowerCase().includes("mastertemp") ||
            p.name.toLowerCase().includes("gas")
        ) || heaters[0]
      );
    } else if (climate === "moderate") {
      return (
        heaters.find(
          (p) =>
            p.name.toLowerCase().includes("250") ||
            p.name.toLowerCase().includes("300") ||
            p.name.toLowerCase().includes("raypak") ||
            p.name.toLowerCase().includes("universal")
        ) ||
        heaters[1] ||
        heaters[0]
      );
    } else {
      return (
        heaters.find(
          (p) =>
            p.name.toLowerCase().includes("heat pump") ||
            p.name.toLowerCase().includes("150") ||
            p.name.toLowerCase().includes("200")
        ) ||
        heaters[2] ||
        heaters[0]
      );
    }
  }, [productsList, climate]);

  const matchedFilter = useMemo(() => {
    const filters = productsList.filter((p) => {
      const cat = (p.category || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      return (cat.includes("filter") || name.includes("filter")) && p.img && !p.img.includes("commingsoon");
    });
    if (filters.length === 0) return null;
    if (gallons < 18000) {
      return filters.find((p) => p.name.toLowerCase().includes("150") || p.name.toLowerCase().includes("clean & clear")) || filters[0];
    } else if (gallons < 32000) {
      return (
        filters.find(
          (p) =>
            p.name.toLowerCase().includes("320") ||
            p.name.toLowerCase().includes("420") ||
            p.name.toLowerCase().includes("plus") ||
            p.name.toLowerCase().includes("swimclear")
        ) ||
        filters[1] ||
        filters[0]
      );
    } else {
      return (
        filters.find(
          (p) =>
            p.name.toLowerCase().includes("520") ||
            p.name.toLowerCase().includes("quad") ||
            p.name.toLowerCase().includes("commercial")
        ) ||
        filters[2] ||
        filters[0]
      );
    }
  }, [productsList, gallons]);

  const bundleTotal = (matchedPump?.price || 0) + (matchedHeater?.price || 0) + (matchedFilter?.price || 0);

  const handleAddBundle = () => {
    if (matchedPump) add(matchedPump, 1);
    if (matchedHeater) add(matchedHeater, 1);
    if (matchedFilter) add(matchedFilter, 1);
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 3000);
  };

  return (
    <section id="finder" className="py-10 sm:py-14 md:py-18 lg:py-22 bg-gradient-to-b from-white via-surface to-white relative overflow-hidden font-sans border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] bg-white border border-slate-200/90 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 shadow-[0_20px_50px_-15px_rgba(0,109,171,0.08)]"
        >
          {/* Subtle Ambient Mesh Glows */}
          <div className="absolute -top-32 -right-32 size-72 sm:size-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 size-72 sm:size-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 items-start">
            {/* Left Controls Column */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-800 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest shadow-2xs mb-2.5 sm:mb-3">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600" />
                  </span>
                  Hydraulic Sizing Engine
                </span>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Interactive Pool Equipment Sizing & Package Builder
                </h2>

                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
                  Customize your pool specifications. Our engine calculates flow dynamics, heating BTUs, and matches authentic commercial equipment.
                </p>
              </div>

              {/* Controls Form */}
              <div className="space-y-4 sm:space-y-5 pt-1">
                {/* 1. Pool Volume Slider */}
                <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="finder-volume-slider" className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Waves className="size-4 text-cyan-600 shrink-0" />
                      <span>Pool Water Volume</span>
                    </label>
                    <span className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-cyan-600 text-white font-black text-xs sm:text-sm shadow-xs shrink-0">
                      {gallons.toLocaleString()} Gal
                    </span>
                  </div>

                  <input
                    id="finder-volume-slider"
                    type="range"
                    min={5000}
                    max={55000}
                    step={1000}
                    value={gallons}
                    onChange={(e) => setGallons(Number(e.target.value))}
                    aria-label="Pool Water Volume in Gallons"
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600 transition-all"
                  />

                  {/* Volume Presets */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-1">
                    {[
                      { val: 10000, label: "10k", sub: "Plunge" },
                      { val: 20000, label: "20k", sub: "Standard" },
                      { val: 35000, label: "35k", sub: "Large" },
                      { val: 50000, label: "50k", sub: "Estate" },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setGallons(p.val)}
                        className={`py-2 px-1.5 text-center rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[40px] flex flex-col items-center justify-center ${
                          gallons === p.val
                            ? "bg-slate-900 text-white shadow-xs scale-[1.02]"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="leading-none">{p.label}</span>
                        <span className={`text-[9.5px] mt-0.5 font-medium leading-none ${gallons === p.val ? "text-cyan-300" : "text-slate-400"}`}>
                          {p.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Application Type */}
                <div className="space-y-2">
                  <span className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    Application / Duty Cycle
                  </span>
                  <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-2">
                    {[
                      { id: "residential", label: "Residential", desc: "8h Turnover", icon: Home },
                      { id: "commercial", label: "Commercial", desc: "6h Rapid Flow", icon: Building2 },
                      { id: "spa", label: "Spa / Plunge", desc: "2h Ultra Fast", icon: Sparkles },
                    ].map((t) => {
                      const isActive = poolType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPoolType(t.id as any)}
                          className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer active:scale-95 flex sm:flex-col justify-between sm:justify-start items-center sm:items-start gap-1 sm:gap-0 min-h-[44px] ${
                            isActive
                              ? "bg-slate-900 text-white border-slate-900 shadow-md font-bold"
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-semibold"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-extrabold">
                            <t.icon className={`size-3.5 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                            <span className="truncate">{t.label}</span>
                          </div>
                          <div className={`text-[10px] sm:mt-1 font-medium ${isActive ? "text-cyan-300" : "text-slate-400"}`}>
                            {t.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Climate Zone */}
                <div className="space-y-2">
                  <span className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    Regional Climate Zone
                  </span>
                  <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-2">
                    {[
                      { id: "warm", label: "Warm (80°F+)", desc: "Southern Sunbelt", icon: Sun },
                      { id: "moderate", label: "Moderate (60-80°)", desc: "Coastal / Midwest", icon: CloudSun },
                      { id: "cold", label: "Cold (<60°F)", desc: "North / Cold Zone", icon: Snowflake },
                    ].map((c) => {
                      const isActive = climate === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setClimate(c.id as any)}
                          className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer active:scale-95 flex sm:flex-col justify-between sm:justify-start items-center sm:items-start gap-1 sm:gap-0 min-h-[44px] ${
                            isActive
                              ? "bg-cyan-600 text-white border-cyan-600 shadow-md font-bold"
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-semibold"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-extrabold">
                            <c.icon className={`size-3.5 shrink-0 ${isActive ? "text-white" : "text-cyan-600"}`} />
                            <span className="truncate">{c.label}</span>
                          </div>
                          <div className={`text-[10px] sm:mt-1 font-medium ${isActive ? "text-cyan-100" : "text-slate-400"}`}>
                            {c.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Engineering Metrics Gauge HUD */}
                <div className="grid grid-cols-3 gap-2 p-2.5 sm:p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200/60 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Gauge className="size-3 text-cyan-600 shrink-0" />
                      <span className="truncate">Min. Flow</span>
                    </span>
                    <span className="text-xs sm:text-sm font-black text-cyan-900 mt-0.5">{gpm} GPM</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-cyan-200/50 px-1">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="size-3 text-cyan-600 shrink-0" />
                      <span className="truncate">Turnover</span>
                    </span>
                    <span className="text-xs sm:text-sm font-black text-cyan-900 mt-0.5">{turnoverHours} Hours</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8.5px] sm:text-[9.5px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <DollarSign className="size-3 text-emerald-600 shrink-0" />
                      <span className="truncate">Est. Savings</span>
                    </span>
                    <span className="text-xs sm:text-sm font-black text-emerald-700 mt-0.5">${annualSavings}/yr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Matched Equipment Bundle Column */}
            <div className="lg:col-span-6 w-full">
              <div className="rounded-2xl sm:rounded-[2rem] bg-gradient-to-b from-[#f8fbfe] via-white to-white border border-slate-200/90 p-4 sm:p-6 lg:p-7 shadow-lg space-y-3.5 sm:space-y-4 relative">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-cyan-800 bg-cyan-100/80 px-2.5 sm:px-3 py-1 rounded-full border border-cyan-200">
                    <Sparkles className="size-3.5 text-cyan-600 shrink-0" />
                    <span>Live System Match</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                    <span>Hydraulic Certified</span>
                  </span>
                </div>

                {/* 3 Matched Product Cards */}
                <div className="space-y-2 sm:space-y-2.5">
                  {/* Matched Pump */}
                  {matchedPump && (
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400/80 shadow-2xs hover:shadow-sm transition-all flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 min-w-0 w-full xs:w-auto">
                        <Link
                          to="/products/$productId"
                          params={{ productId: matchedPump.id }}
                          className="relative size-12 sm:size-14 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-100 overflow-hidden shrink-0 grid place-items-center cursor-pointer"
                        >
                          <img
                            src={getProductImage(matchedPump.img)}
                            alt={matchedPump.name}
                            loading="lazy"
                            className="size-9 sm:size-11 object-contain group-hover:scale-108 transition-transform"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-[9px] uppercase font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200/50">
                              Pump • {hpSpec}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{matchedPump.brand}</span>
                          </div>
                          <Link to="/products/$productId" params={{ productId: matchedPump.id }} className="block">
                            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-1 hover:text-cyan-700 transition-colors">
                              {matchedPump.name}
                            </h4>
                          </Link>
                          <span className="text-xs sm:text-sm font-black text-slate-900">{formatUSD(matchedPump.price)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => add(matchedPump, 1)}
                        className="w-full xs:w-auto px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition shrink-0 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5 min-h-[36px]"
                      >
                        <ShoppingBag className="size-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  )}

                  {/* Matched Heater */}
                  {matchedHeater && (
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400/80 shadow-2xs hover:shadow-sm transition-all flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 min-w-0 w-full xs:w-auto">
                        <Link
                          to="/products/$productId"
                          params={{ productId: matchedHeater.id }}
                          className="relative size-12 sm:size-14 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-100 overflow-hidden shrink-0 grid place-items-center cursor-pointer"
                        >
                          <img
                            src={getProductImage(matchedHeater.img)}
                            alt={matchedHeater.name}
                            loading="lazy"
                            className="size-9 sm:size-11 object-contain group-hover:scale-108 transition-transform"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-[9px] uppercase font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                              Heating • {btuSpec}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{matchedHeater.brand}</span>
                          </div>
                          <Link to="/products/$productId" params={{ productId: matchedHeater.id }} className="block">
                            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-1 hover:text-cyan-700 transition-colors">
                              {matchedHeater.name}
                            </h4>
                          </Link>
                          <span className="text-xs sm:text-sm font-black text-slate-900">{formatUSD(matchedHeater.price)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => add(matchedHeater, 1)}
                        className="w-full xs:w-auto px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition shrink-0 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5 min-h-[36px]"
                      >
                        <ShoppingBag className="size-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  )}

                  {/* Matched Filter */}
                  {matchedFilter && (
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400/80 shadow-2xs hover:shadow-sm transition-all flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 min-w-0 w-full xs:w-auto">
                        <Link
                          to="/products/$productId"
                          params={{ productId: matchedFilter.id }}
                          className="relative size-12 sm:size-14 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-100 overflow-hidden shrink-0 grid place-items-center cursor-pointer"
                        >
                          <img
                            src={getProductImage(matchedFilter.img)}
                            alt={matchedFilter.name}
                            loading="lazy"
                            className="size-9 sm:size-11 object-contain group-hover:scale-108 transition-transform"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-[9px] uppercase font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/50">
                              Filter • {filterSpec}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{matchedFilter.brand}</span>
                          </div>
                          <Link to="/products/$productId" params={{ productId: matchedFilter.id }} className="block">
                            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-1 hover:text-cyan-700 transition-colors">
                              {matchedFilter.name}
                            </h4>
                          </Link>
                          <span className="text-xs sm:text-sm font-black text-slate-900">{formatUSD(matchedFilter.price)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => add(matchedFilter, 1)}
                        className="w-full xs:w-auto px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition shrink-0 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5 min-h-[36px]"
                      >
                        <ShoppingBag className="size-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bundle Summary & Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/70 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-slate-500 block">3-Piece Package Total</span>
                      <span className="text-sm sm:text-base font-black text-slate-900">{formatUSD(bundleTotal)}</span>
                    </div>
                    <span className="text-[10px] sm:text-[10.5px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60 flex items-center gap-1 shrink-0">
                      <Check className="size-3 text-emerald-600" />
                      <span>Wholesale Tier Unlocked</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBundle}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer min-h-[44px]"
                  >
                    <ShoppingBag className="size-4 shrink-0" />
                    <span className="truncate">{bundleAdded ? "✓ Added Complete Package to Cart!" : "Add Complete 3-Piece System to Cart"}</span>
                  </button>

                  <Link
                    to="/finder"
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 hover:text-cyan-700 min-h-[40px]"
                  >
                    <span>Launch Full 5-Step Sizing Wizard</span>
                    <ArrowRight className="size-3.5 text-slate-400 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
