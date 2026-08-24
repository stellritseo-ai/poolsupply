import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart, formatUSD } from "@/components/site/cart-context";
import { useProductsQuery, getProductImage, products as defaultProducts, Product } from "@/lib/products";
import {
  Calculator,
  Sparkles,
  Waves,
  Flame,
  Filter as FilterIcon,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShoppingBag,
  Sun,
  CloudSun,
  Snowflake,
  ShieldCheck,
  Check,
  Building2,
  Home,
  Clock,
  DollarSign,
  Gauge,
  Layers,
  Ruler,
  Droplets,
  RotateCcw,
  Star,
  Eye,
  Sliders,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/finder")({
  head: () => {
    const pageUrl = "https://poolsupplywholesalers.com/finder";
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://poolsupplywholesalers.com" },
        { "@type": "ListItem", "position": 2, "name": "Equipment Sizing Wizard", "item": pageUrl }
      ]
    };

    const toolLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Pool Equipment Sizing Wizard & Bundle Builder",
      "url": pageUrl,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };

    return {
      meta: [
        { title: "Equipment Sizing & Package Builder — Pool Supply Wholesalers" },
        {
          name: "description",
          content:
            "Calculate hydraulic flow rates (GPM), pump horsepower, heater BTUs, and filter surface area for your pool. Get instant OEM bundle recommendations with wholesale pricing.",
        },
        { name: "keywords", content: "pool equipment sizing calculator, pool pump sizing calculator, pool heater BTU calculator, commercial pool package builder, pentair bundle builder" },
        { property: "og:title", content: "Pool Equipment Sizing Wizard & Bundle Builder" },
        {
          property: "og:description",
          content:
            "Precision equipment matching for residential and commercial pools. Match Pentair, Hayward, Jandy, and Raypak equipment instantly.",
        },
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Pool Equipment Sizing Wizard" },
        { name: "twitter:description", content: "Calculate flow rates, pump HP, heater BTUs and filter sizing instantly." },
        { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        { type: "application/ld+json", children: JSON.stringify(toolLd) }
      ]
    };
  },
  component: FinderPage,
});

function FinderPage() {
  const [activeTab, setActiveTab] = useState<"instant" | "dimension">("instant");
  const [gallons, setGallons] = useState(20000);
  const [poolType, setPoolType] = useState<"residential" | "commercial" | "spa">("residential");
  const [climate, setClimate] = useState<"warm" | "moderate" | "cold">("moderate");
  const [bundleAdded, setBundleAdded] = useState(false);

  // Dimension calculator state
  const [length, setLength] = useState(32);
  const [width, setWidth] = useState(16);
  const [shallowDepth, setShallowDepth] = useState(3.5);
  const [deepDepth, setDeepDepth] = useState(8);
  const [poolShape, setPoolShape] = useState<"rectangle" | "oval" | "freeform" | "circle">("rectangle");

  // Calculate Gallons from Dimensions
  const calculatedGallons = useMemo(() => {
    const avgDepth = (shallowDepth + deepDepth) / 2;
    let multiplier = 7.5; // Gallons per cu. ft. for rectangle
    if (poolShape === "oval") multiplier = 5.9;
    if (poolShape === "freeform") multiplier = 6.5;
    if (poolShape === "circle") multiplier = 5.9;

    const cuFt = length * width * avgDepth;
    return Math.round((cuFt * multiplier) / 500) * 500;
  }, [length, width, shallowDepth, deepDepth, poolShape]);

  const { data: allProducts = [] } = useProductsQuery();
  const productsList = allProducts.length > 0 ? allProducts : defaultProducts;
  const { add } = useCart();

  // Dynamic Hydraulic Calculations
  const turnoverHours = poolType === "commercial" ? 6 : poolType === "spa" ? 2 : 8;
  const gpm = Math.max(15, Math.round(gallons / (turnoverHours * 60)));
  const hpSpec = gpm < 45 ? "1.5 HP Variable-Speed" : gpm < 75 ? "2.0 HP Variable-Speed" : "3.0 HP Commercial VS";
  const btuSpec =
    climate === "cold"
      ? "400,000 BTU High-Output Gas"
      : climate === "moderate"
        ? "250,000 - 300,000 BTU Hybrid"
        : "140,000 - 200,000 BTU Heat Pump";
  const filterSpec =
    gallons < 18000
      ? "150 - 200 Sq. Ft. Cartridge"
      : gallons < 32000
        ? "320 - 420 Sq. Ft. Quad-Cartridge"
        : "520 Sq. Ft. Commercial Grid";
  const annualSavings = Math.round((gallons / 1000) * 32 + 350);

  // Match real products from catalog
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
            p.name.toLowerCase().includes("electric") ||
            p.name.toLowerCase().includes("140")
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
      return (
        filters.find((p) => p.name.toLowerCase().includes("200") || p.name.toLowerCase().includes("clean & clear")) ||
        filters[0]
      );
    } else if (gallons < 32000) {
      return (
        filters.find(
          (p) =>
            p.name.toLowerCase().includes("420") ||
            p.name.toLowerCase().includes("swimclear") ||
            p.name.toLowerCase().includes("quad")
        ) ||
        filters[1] ||
        filters[0]
      );
    } else {
      return (
        filters.find(
          (p) =>
            p.name.toLowerCase().includes("520") ||
            p.name.toLowerCase().includes("commercial") ||
            p.name.toLowerCase().includes("grid")
        ) ||
        filters[2] ||
        filters[0]
      );
    }
  }, [productsList, gallons]);

  const bundleProducts = useMemo(() => {
    return [matchedPump, matchedHeater, matchedFilter].filter(Boolean) as Product[];
  }, [matchedPump, matchedHeater, matchedFilter]);

  const bundleTotal = bundleProducts.reduce((acc, p) => acc + p.price, 0);
  const bundleMsrpTotal = bundleProducts.reduce((acc, p) => acc + (p.msrp || p.price * 1.25), 0);
  const bundleSavings = Math.max(0, Math.round(bundleMsrpTotal - bundleTotal));

  const handleAddBundle = () => {
    bundleProducts.forEach((p) => add(p, 1));
    setBundleAdded(true);
    toast.success("Complete 3-Piece OEM Package added to your cart!");
    setTimeout(() => setBundleAdded(false), 3000);
  };

  const applyDimensions = () => {
    setGallons(calculatedGallons);
    setActiveTab("instant");
    toast.success(`Applied ${calculatedGallons.toLocaleString()} Gallons to the sizing engine!`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header alwaysDark />

      <main className="flex-1">
        {/* ─── LUXURY HERO SECTION ─── */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#040d1a] text-white border-b border-cyan-500/10">
          {/* Background Hero Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-65"
            style={{ backgroundImage: "url('/about-hero.png')" }}
          />

          {/* Deep Gradient Overlays for High Legibility */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#040d1a]/80 via-[#040d1a]/60 to-background" />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#040d1a]/80 via-transparent to-[#040d1a]/80" />

          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-[1]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-[1]" />

          <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-widest shadow-lg"
              >
                <Calculator className="size-3.5" />
                Intelligent Hydraulic & Equipment Sizing Engine
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white"
              >
                Precision Pool Equipment{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                  Sizing & Package Builder
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium"
              >
                Calculate flow dynamics (GPM), pump horsepower, heater BTUs, and filter square footage calibrated to ANSI/APSP/ICC-15 commercial turnover standards.
              </motion.p>
            </div>
          </div>
        </section>

        {/* ─── MAIN FINDER CONSOLE ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-center mb-8">
              <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-2xs flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("instant")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${activeTab === "instant"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Sliders className="size-4 text-cyan-600" />
                  <span>Live Sizing Console</span>
                </button>
                <button
                  onClick={() => setActiveTab("dimension")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${activeTab === "dimension"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Ruler className="size-4 text-cyan-600" />
                  <span>Dimension Volume Calculator</span>
                </button>
              </div>
            </div>

            {/* TAB 1: INSTANT SIZING ENGINE */}
            {activeTab === "instant" ? (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Left Parameter Controls Panel */}
                <div className="lg:col-span-5 space-y-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
                  {/* Parameter Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider">
                      <Gauge className="size-4 text-cyan-600" /> Hydraulic Parameters
                    </div>
                    <button
                      onClick={() => {
                        setGallons(20000);
                        setPoolType("residential");
                        setClimate("moderate");
                      }}
                      className="text-[11px] font-bold text-slate-400 hover:text-cyan-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="size-3" /> Reset
                    </button>
                  </div>

                  {/* 1. Pool Water Volume Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                        Pool Capacity (Gallons)
                      </label>
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-950 tracking-tight">
                          {gallons.toLocaleString()}
                        </span>
                        <span className="text-[10.5px] text-cyan-700 font-extrabold ml-1">GAL</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={3000}
                      max={80000}
                      step={1000}
                      value={gallons}
                      onChange={(e) => setGallons(Number(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[10000, 20000, 35000, 50000].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setGallons(preset)}
                          className={`py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${gallons === preset
                            ? "bg-cyan-600 text-white shadow-2xs"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                            }`}
                        >
                          {preset / 1000}k Gal
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Duty Cycle / Pool Type */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Duty Cycle & Application
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "residential", label: "Residential", icon: Home, turnover: "8-hr cycle" },
                        { id: "commercial", label: "Commercial", icon: Building2, turnover: "6-hr cycle" },
                        { id: "spa", label: "Spa / Hydro", icon: Waves, turnover: "2-hr cycle" },
                      ].map((item) => {
                        const Icon = item.icon;
                        const active = poolType === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setPoolType(item.id as any)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${active
                              ? "bg-cyan-50/70 border-cyan-500 text-cyan-950 shadow-2xs"
                              : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50"
                              }`}
                          >
                            <Icon className={`size-4 mb-2 ${active ? "text-cyan-600" : "text-slate-400"}`} />
                            <div>
                              <div className="text-xs font-extrabold leading-tight">{item.label}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{item.turnover}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Regional Climate Zone */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Climate & Ambient Zone
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "warm", label: "Warm Sunbelt", icon: Sun, btu: "140k BTU" },
                        { id: "moderate", label: "Moderate", icon: CloudSun, btu: "250k BTU" },
                        { id: "cold", label: "Cold North", icon: Snowflake, btu: "400k BTU" },
                      ].map((item) => {
                        const Icon = item.icon;
                        const active = climate === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setClimate(item.id as any)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${active
                              ? "bg-cyan-50/70 border-cyan-500 text-cyan-950 shadow-2xs"
                              : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50"
                              }`}
                          >
                            <Icon className={`size-4 mb-2 ${active ? "text-cyan-600" : "text-slate-400"}`} />
                            <div>
                              <div className="text-xs font-extrabold leading-tight">{item.label}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{item.btu}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Real-time Engineering HUD Summary Box */}
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400">
                        Calculated Engineering Specs
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        ANSI Compliant
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Required Flow Rate</div>
                        <div className="font-black text-cyan-300 text-sm">{gpm} GPM</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Turnover Cycle</div>
                        <div className="font-black text-white text-sm">{turnoverHours} Hours</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Hydraulic Pump Spec</div>
                        <div className="font-extrabold text-white text-[11px] truncate">{hpSpec}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Thermal Output</div>
                        <div className="font-extrabold text-white text-[11px] truncate">{btuSpec.split(" ")[0]} BTU</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-300 font-bold">Estimated Annual Energy Savings:</span>
                      <span className="text-xs font-black text-emerald-400">~${annualSavings}/yr</span>
                    </div>
                  </div>
                </div>

                {/* Right Matched Equipment Bundle Showcase */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Matched 3-Piece OEM Equipment Package
                      </h2>
                      <p className="text-xs text-slate-500">
                        Factory authorized Pentair, Hayward, Jandy, and Raypak components matching your hydraulic specs.
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-extrabold">
                      <ShieldCheck className="size-3.5" /> Full Factory Warranty
                    </span>
                  </div>

                  {/* 3 Matched Product Cards */}
                  <div className="grid gap-3">
                    {/* Pump Card */}
                    {matchedPump && (
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-center gap-4">
                        <div className="size-20 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 grid place-items-center">
                          <img
                            src={getProductImage(matchedPump.img)}
                            alt={matchedPump.name}
                            className="size-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-cyan-100/70 text-cyan-800 font-extrabold text-[10px] uppercase tracking-wider">
                              Pump · {hpSpec.split(" ")[0]} HP
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {matchedPump.brand}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                            {matchedPump.name}
                          </h3>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                            Variable speed hydraulics calibrated for {gpm} GPM peak flow.
                          </div>
                        </div>
                        <div className="text-center sm:text-right shrink-0">
                          <div className="text-base font-black text-slate-900">{formatUSD(matchedPump.price)}</div>
                          <button
                            onClick={() => {
                              add(matchedPump, 1);
                              toast.success(`Added ${matchedPump.name} to cart!`);
                            }}
                            className="mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-600 active:scale-95 text-white font-extrabold text-xs transition-all cursor-pointer shadow-2xs"
                          >
                            <ShoppingBag className="size-3" /> Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Heater Card */}
                    {matchedHeater && (
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-center gap-4">
                        <div className="size-20 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 grid place-items-center">
                          <img
                            src={getProductImage(matchedHeater.img)}
                            alt={matchedHeater.name}
                            className="size-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider">
                              Thermal · {btuSpec.split(" ")[0]} BTU
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {matchedHeater.brand}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                            {matchedHeater.name}
                          </h3>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                            Engineered for {climate} climate temperature rise.
                          </div>
                        </div>
                        <div className="text-center sm:text-right shrink-0">
                          <div className="text-base font-black text-slate-900">{formatUSD(matchedHeater.price)}</div>
                          <button
                            onClick={() => {
                              add(matchedHeater, 1);
                              toast.success(`Added ${matchedHeater.name} to cart!`);
                            }}
                            className="mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-600 active:scale-95 text-white font-extrabold text-xs transition-all cursor-pointer shadow-2xs"
                          >
                            <ShoppingBag className="size-3" /> Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Filter Card */}
                    {matchedFilter && (
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-center gap-4">
                        <div className="size-20 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 grid place-items-center">
                          <img
                            src={getProductImage(matchedFilter.img)}
                            alt={matchedFilter.name}
                            className="size-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-900 font-extrabold text-[10px] uppercase tracking-wider">
                              Filter · {filterSpec.split(" ")[0]} Sq Ft
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {matchedFilter.brand}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                            {matchedFilter.name}
                          </h3>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                            Multi-element media for crystal clear water purity.
                          </div>
                        </div>
                        <div className="text-center sm:text-right shrink-0">
                          <div className="text-base font-black text-slate-900">{formatUSD(matchedFilter.price)}</div>
                          <button
                            onClick={() => {
                              add(matchedFilter, 1);
                              toast.success(`Added ${matchedFilter.name} to cart!`);
                            }}
                            className="mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-600 active:scale-95 text-white font-extrabold text-xs transition-all cursor-pointer shadow-2xs"
                          >
                            <ShoppingBag className="size-3" /> Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 1-Click Complete Bundle Checkout Card */}
                  <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-[#061220] via-[#091f38] to-[#040d1a] text-white border border-cyan-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                        Complete OEM 3-Piece Package
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-black text-white">{formatUSD(bundleTotal)}</span>
                        {bundleSavings > 0 && (
                          <span className="text-xs text-slate-400 line-through font-medium">
                            {formatUSD(bundleMsrpTotal)}
                          </span>
                        )}
                        {bundleSavings > 0 && (
                          <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                            Save {formatUSD(bundleSavings)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleAddBundle}
                      disabled={bundleProducts.length === 0}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-black text-xs sm:text-sm shadow-[0_8px_25px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
                    >
                      <ShoppingBag className="size-4" />
                      <span>{bundleAdded ? "Bundle Added to Cart!" : "Add Complete Package to Cart"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: DIMENSION-BASED VOLUME CALCULATOR */
              <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-md space-y-6">
                <div className="text-center space-y-1.5 border-b border-slate-100 pb-5">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Pool Dimension & Volume Calculator
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Input your pool's physical dimensions to determine accurate water volume in US Gallons.
                  </p>
                </div>

                {/* Pool Shape Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Select Pool Geometry
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "rectangle", label: "Rectangular", desc: "Standard 7.5x" },
                      { id: "oval", label: "Oval Shape", desc: "Curved 5.9x" },
                      { id: "freeform", label: "Freeform / Kidney", desc: "Contoured 6.5x" },
                      { id: "circle", label: "Round / Circular", desc: "Radial 5.9x" },
                    ].map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => setPoolShape(shape.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${poolShape === shape.id
                          ? "bg-cyan-50/80 border-cyan-500 text-cyan-950 shadow-2xs font-bold"
                          : "bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                          }`}
                      >
                        <div className="text-xs font-extrabold">{shape.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{shape.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimensions Grid Inputs */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Length (Feet)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Width (Feet)
                    </label>
                    <input
                      type="number"
                      min={6}
                      max={60}
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Shallow End Depth (Feet)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={2}
                      max={6}
                      value={shallowDepth}
                      onChange={(e) => setShallowDepth(Number(e.target.value))}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Deep End Depth (Feet)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={4}
                      max={16}
                      value={deepDepth}
                      onChange={(e) => setDeepDepth(Number(e.target.value))}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Calculation Result Callout */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-md">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                      Calculated Volume
                    </span>
                    <div className="text-3xl font-black text-white mt-0.5">
                      {calculatedGallons.toLocaleString()}{" "}
                      <span className="text-sm font-extrabold text-cyan-400">Gallons</span>
                    </div>
                  </div>

                  <button
                    onClick={applyDimensions}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>Apply to Equipment Sizer</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── ENGINEERING FORMULA & SPEC STANDARDS ─── */}
        <section className="py-[50px] bg-slate-50/80 border-t border-slate-200/80">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-500/10 border border-cyan-500/20">
                Hydraulic Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Engineering Calibrations & Sizing Formulas
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="size-9 rounded-xl bg-cyan-50 text-cyan-700 grid place-items-center font-black text-xs">
                  GPM
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Flow Rate Formula</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  <strong>GPM = Gallons ÷ (Turnover Hours × 60)</strong>. Sized to maintain minimum velocity without exceeding maximum pipe friction head loss.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="size-9 rounded-xl bg-amber-50 text-amber-700 grid place-items-center font-black text-xs">
                  BTU
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Thermal Output Calcs</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  <strong>BTU/hr = Gallons × 8.33 × Desired Temp Rise ÷ Hours</strong>. Ensures rapid recovery during cold nighttime ambient temperature drops.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center font-black text-xs">
                  SQ FT
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Filtration Surface Area</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Calculated at 0.375 GPM/sq. ft. commercial design rate to minimize operating PSI, extend cartridge lifespan, and reduce backwashing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
