import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart, formatUSD } from "@/components/site/cart-context";
import { searchProductsDb } from "@/lib/api/products.functions";
import { Product } from "@/lib/products";
import {
  Calculator,
  Sparkles,
  Star,
  ShoppingBag,
  Eye,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Waves,
  Thermometer,
  Filter,
  Zap,
  Droplets,
  Sun,
  Snowflake,
  Wind,
  ChevronRight,
  Package,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/finder")({
  head: () => ({
    meta: [
      { title: "Product Finder — Pool Supply Wholesalers" },
      {
        name: "description",
        content:
          "Use our intelligent pool equipment wizard to find the perfectly sized pumps, heaters, filters, and automation systems for your pool — sized to your exact specifications.",
      },
    ],
  }),
  component: FinderPage,
});

// ─── Types ───────────────────────────────────────────────────────────────────
type PoolType = "residential" | "commercial" | "spa" | "indoor";
type ClimateZone = "tropical" | "warm" | "moderate" | "cold" | "arctic";
type PoolShape = "rectangular" | "freeform" | "lap" | "infinity";
type UsageFreq = "daily" | "weekly" | "occasional";

interface PoolConfig {
  type: PoolType;
  shape: PoolShape;
  gallons: number;
  climate: ClimateZone;
  usage: UsageFreq;
  features: string[];
}

// ─── Sizing engine ────────────────────────────────────────────────────────────
function computeRecommendations(cfg: PoolConfig) {
  const { gallons, climate, usage, features } = cfg;

  // Pump HP sizing
  const turnoverHours = usage === "daily" ? 6 : 8;
  const gpm = gallons / (turnoverHours * 60);
  let hp = gpm < 40 ? "1.0 HP" : gpm < 60 ? "1.5 HP" : gpm < 90 ? "2.0 HP" : "3.0 HP";

  // Heater BTU
  const btuMap: Record<ClimateZone, string> = {
    tropical: "100,000 BTU",
    warm: "150,000 BTU",
    moderate: "300,000 BTU",
    cold: "400,000 BTU",
    arctic: "500,000 BTU",
  };
  const heaterBtu = btuMap[climate];

  // Filter area
  const filterArea = gallons < 15000 ? "200 Sq. Ft." : gallons < 25000 ? "320 Sq. Ft." : gallons < 40000 ? "420 Sq. Ft." : "520 Sq. Ft.";

  // Salt system
  const saltCapacity = gallons < 20000 ? "20,000 gal" : gallons < 40000 ? "40,000 gal" : "60,000 gal";

  // Energy savings estimate
  const savingsPerYear = Math.round((gallons / 1000) * 28);

  return { hp, heaterBtu, filterArea, saltCapacity, savingsPerYear };
}

// ─── Step config ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Pool Type", icon: Waves },
  { id: 2, label: "Pool Size", icon: Calculator },
  { id: 3, label: "Climate", icon: Thermometer },
  { id: 4, label: "Features", icon: Sparkles },
  { id: 5, label: "Results", icon: CheckCircle2 },
];

const POOL_TYPES: { value: PoolType; label: string; emoji: string; desc: string }[] = [
  { value: "residential", label: "Residential", emoji: "🏡", desc: "In-ground or above-ground home pool" },
  { value: "commercial", label: "Commercial", emoji: "🏊", desc: "Hotel, resort, or community pool" },
  { value: "spa", label: "Spa / Hot Tub", emoji: "♨️", desc: "Standalone or attached spa unit" },
  { value: "indoor", label: "Indoor Pool", emoji: "🏛️", desc: "Enclosed natatorium or facility" },
];

const POOL_SHAPES: { value: PoolShape; label: string; emoji: string }[] = [
  { value: "rectangular", label: "Rectangular", emoji: "⬜" },
  { value: "freeform", label: "Freeform", emoji: "🫧" },
  { value: "lap", label: "Lap Pool", emoji: "📏" },
  { value: "infinity", label: "Infinity Edge", emoji: "🌊" },
];

const CLIMATE_ZONES: { value: ClimateZone; label: string; icon: any; desc: string; color: string }[] = [
  { value: "tropical", label: "Tropical", icon: Sun, desc: "Florida, Hawaii, Puerto Rico (avg 80°F+)", color: "from-orange-400 to-yellow-400" },
  { value: "warm", label: "Warm", icon: Sun, desc: "California, Texas, Arizona (avg 70–80°F)", color: "from-yellow-400 to-amber-400" },
  { value: "moderate", label: "Moderate", icon: Wind, desc: "Mid-Atlantic, Midwest (avg 55–70°F)", color: "from-cyan-400 to-blue-400" },
  { value: "cold", label: "Cold", icon: Snowflake, desc: "Northeast, Pacific NW (avg 40–55°F)", color: "from-blue-400 to-indigo-500" },
  { value: "arctic", label: "Arctic", icon: Snowflake, desc: "Alaska, Canada (avg below 40°F)", color: "from-indigo-500 to-violet-600" },
];

const FEATURE_OPTIONS = [
  { id: "saltwater", label: "Salt Chlorination", icon: Droplets, desc: "Automated salt-to-chlorine system" },
  { id: "automation", label: "Smart Automation", icon: Zap, desc: "Remote control & scheduling" },
  { id: "lighting", label: "LED Lighting", icon: Sparkles, desc: "Color-changing underwater lighting" },
  { id: "cleaner", label: "Robotic Cleaner", icon: RefreshCw, desc: "Automated pool floor & wall cleaning" },
  { id: "heatpump", label: "Heat Pump", icon: Thermometer, desc: "Energy-efficient electric heating" },
];

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

// ─── Component ───────────────────────────────────────────────────────────────
function FinderPage() {
  const [step, setStep] = useState(1);
  const [cfg, setCfg] = useState<PoolConfig>({
    type: "residential",
    shape: "rectangular",
    gallons: 20000,
    climate: "moderate",
    usage: "daily",
    features: [],
  });
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { add } = useCart();

  const rec = useMemo(() => computeRecommendations(cfg), [cfg]);

  const toggleFeature = (id: string) => {
    setCfg((prev) => ({
      ...prev,
      features: prev.features.includes(id)
        ? prev.features.filter((f) => f !== id)
        : [...prev.features, id],
    }));
  };

  // Fetch products when reaching results step
  useEffect(() => {
    if (step !== 5) return;
    setIsSearching(true);

    const queries = ["pool pump", "pool heater", "pool filter"];
    Promise.all(
      queries.map((q) => searchProductsDb({ data: { query: q } }).then((r) => (r.success ? r.products || [] : [])))
    )
      .then((results) => {
        // Take 1 of each category
        const flat = results.map((arr) => arr[0]).filter(Boolean) as Product[];
        setSearchResults(flat);
      })
      .catch(() => setSearchResults([]))
      .finally(() => setIsSearching(false));
  }, [step]);

  const reset = () => {
    setStep(1);
    setCfg({ type: "residential", shape: "rectangular", gallons: 20000, climate: "moderate", usage: "daily", features: [] });
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1 pt-24 pb-20">
        {/* ─── HERO HEADER ─── */}
        <section
          className="relative py-16 mb-12 overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #001a3a 0%, #003a7a 55%, #0055aa 100%)",
          }}
        >
          {/* Glow orbs */}
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(89,210,243,0.18) 0%, transparent 70%)", filter: "blur(50px)" }} />
          <div className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,137,201,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />
          {/* Animated rings */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none opacity-20">
            {[160, 120, 80].map((size, i) => (
              <div key={size} className="absolute rounded-full border border-cyan-400/60"
                style={{ width: size, height: size, top: "50%", left: "50%", transform: "translate(-50%,-50%)", animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span
                className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] border border-white/20 text-white/80"
                style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}
              >
                <Calculator className="size-3.5" />
                Intelligent Equipment Sizing Wizard
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4">
                Find Your Perfect{" "}
                <span
                  className="text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #59D2F3 0%, #00B4D8 60%, #48CAE4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }}
                >
                  Pool Equipment
                </span>
              </h1>
              <p className="text-white/65 max-w-xl mx-auto text-sm leading-relaxed">
                Answer 4 quick questions about your pool. Our sizing engine — built by certified pool technicians — will calculate the exact equipment specifications you need.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6">
          {/* ─── STEP PROGRESS BAR ─── */}
          <div className="mb-10">
            <div className="flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-5 h-px bg-border mx-8 z-0" />
              <div
                className="absolute left-8 top-5 h-px z-0 transition-all duration-700"
                style={{
                  width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - 4rem + ${step === STEPS.length ? "4rem" : "0px"})`,
                  background: "linear-gradient(to right, #0089C9, #59D2F3)",
                }}
              />

              {STEPS.map((s) => {
                const Icon = s.icon;
                const done = step > s.id;
                const active = step === s.id;
                return (
                  <div key={s.id} className="flex flex-col items-center gap-2 z-10">
                    <button
                      onClick={() => done && setStep(s.id)}
                      className={`size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-black text-xs
                        ${active ? "border-transparent text-white scale-110 shadow-lg" : ""}
                        ${done ? "border-transparent text-white cursor-pointer" : ""}
                        ${!active && !done ? "border-border bg-background text-muted-foreground" : ""}
                      `}
                      style={
                        active
                          ? { background: "linear-gradient(135deg, #0089C9, #59D2F3)", boxShadow: "0 0 0 4px rgba(0,137,201,0.2), 0 4px 16px rgba(0,137,201,0.3)" }
                          : done
                          ? { background: "linear-gradient(135deg, #0089C9, #59D2F3)" }
                          : {}
                      }
                    >
                      {done ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                    </button>
                    <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${active ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── STEP CONTENT ─── */}
          <AnimatePresence mode="wait">
            {/* STEP 1: Pool Type */}
            {step === 1 && (
              <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <StepCard
                  title="What type of pool do you have?"
                  subtitle="This helps us select the right equipment grade and capacity range."
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {POOL_TYPES.map((t) => (
                      <button
                        key={t.value}
                        id={`pool-type-${t.value}`}
                        onClick={() => setCfg((p) => ({ ...p, type: t.value }))}
                        className={`group p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                          cfg.type === t.value
                            ? "border-transparent text-foreground shadow-lg"
                            : "border-border hover:border-muted-foreground/30 bg-white"
                        }`}
                        style={
                          cfg.type === t.value
                            ? { background: "linear-gradient(135deg, rgba(0,137,201,0.08), rgba(89,210,243,0.05))", borderColor: "oklch(0.50 0.14 232)" }
                            : {}
                        }
                      >
                        <div className="text-3xl mb-3">{t.emoji}</div>
                        <div className="font-extrabold text-sm text-foreground">{t.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{t.desc}</div>
                        {cfg.type === t.value && (
                          <div className="mt-2">
                            <CheckCircle2 className="size-4" style={{ color: "oklch(0.50 0.14 232)" }} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Pool Shape */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="text-sm font-bold text-foreground mb-4">Pool Shape</div>
                    <div className="grid grid-cols-4 gap-3">
                      {POOL_SHAPES.map((s) => (
                        <button
                          key={s.value}
                          id={`pool-shape-${s.value}`}
                          onClick={() => setCfg((p) => ({ ...p, shape: s.value }))}
                          className={`py-3.5 rounded-xl border text-xs font-bold transition-all ${
                            cfg.shape === s.value
                              ? "text-white border-transparent"
                              : "border-border bg-white hover:bg-surface text-foreground/80"
                          }`}
                          style={cfg.shape === s.value ? { background: "linear-gradient(135deg, #0089C9, #59D2F3)" } : {}}
                        >
                          <div className="text-lg mb-1">{s.emoji}</div>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <StepNav step={step} setStep={setStep} />
                </StepCard>
              </motion.div>
            )}

            {/* STEP 2: Pool Size */}
            {step === 2 && (
              <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <StepCard
                  title="How large is your pool?"
                  subtitle="Pool volume drives pump flow rate, filtration sizing, and chemical demand."
                >
                  <div className="space-y-8">
                    {/* Volume slider */}
                    <div>
                      <div className="flex items-end justify-between mb-4">
                        <label className="text-sm font-bold text-foreground">Pool Volume</label>
                        <div className="text-right">
                          <div className="text-3xl font-black" style={{ color: "oklch(0.50 0.14 232)" }}>
                            {cfg.gallons.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground font-semibold">US Gallons</div>
                        </div>
                      </div>
                      <input
                        id="pool-volume-slider"
                        type="range"
                        min={3000}
                        max={100000}
                        step={1000}
                        value={cfg.gallons}
                        onChange={(e) => setCfg((p) => ({ ...p, gallons: Number(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-3">
                        <span>3,000 gal<br /><span className="normal-case font-normal">Small Spa</span></span>
                        <span className="text-center">20,000 gal<br /><span className="normal-case font-normal">Standard Residential</span></span>
                        <span className="text-right">100,000 gal<br /><span className="normal-case font-normal">Large Commercial</span></span>
                      </div>
                    </div>

                    {/* Quick select presets */}
                    <div>
                      <div className="text-sm font-bold text-foreground mb-3">Quick Presets</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: "Spa / Hot Tub", gal: 500 },
                          { label: "Small Pool", gal: 10000 },
                          { label: "Standard Pool", gal: 20000 },
                          { label: "Large Pool", gal: 40000 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => setCfg((p) => ({ ...p, gallons: preset.gal }))}
                            className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                              cfg.gallons === preset.gal
                                ? "text-white border-transparent"
                                : "border-border bg-white hover:bg-surface text-foreground/80"
                            }`}
                            style={cfg.gallons === preset.gal ? { background: "linear-gradient(135deg, #0089C9, #59D2F3)" } : {}}
                          >
                            <div className="font-black text-sm mb-0.5">{preset.gal >= 1000 ? `${preset.gal / 1000}K` : preset.gal}</div>
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Usage frequency */}
                    <div className="pt-4 border-t border-border">
                      <div className="text-sm font-bold text-foreground mb-3">How often is the pool used?</div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "daily" as UsageFreq, label: "Daily", desc: "6-hr turnover target" },
                          { value: "weekly" as UsageFreq, label: "Weekly", desc: "8-hr turnover target" },
                          { value: "occasional" as UsageFreq, label: "Occasional", desc: "10-hr turnover target" },
                        ].map((u) => (
                          <button
                            key={u.value}
                            onClick={() => setCfg((p) => ({ ...p, usage: u.value }))}
                            className={`py-4 rounded-xl border text-xs font-bold transition-all ${
                              cfg.usage === u.value
                                ? "text-white border-transparent"
                                : "border-border bg-white hover:bg-surface text-foreground/80"
                            }`}
                            style={cfg.usage === u.value ? { background: "linear-gradient(135deg, #0089C9, #59D2F3)" } : {}}
                          >
                            <div className="font-black text-sm mb-1">{u.label}</div>
                            <div className="opacity-80 text-[10px]">{u.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <StepNav step={step} setStep={setStep} />
                </StepCard>
              </motion.div>
            )}

            {/* STEP 3: Climate */}
            {step === 3 && (
              <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <StepCard
                  title="What's your climate zone?"
                  subtitle="Ambient temperature directly determines the heater BTU capacity required to maintain comfortable pool temperatures year-round."
                >
                  <div className="space-y-3">
                    {CLIMATE_ZONES.map((c) => {
                      const Icon = c.icon;
                      const active = cfg.climate === c.value;
                      return (
                        <button
                          key={c.value}
                          id={`climate-${c.value}`}
                          onClick={() => setCfg((p) => ({ ...p, climate: c.value }))}
                          className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.005] ${
                            active ? "border-transparent shadow-lg" : "border-border bg-white hover:border-muted-foreground/30"
                          }`}
                          style={active ? { background: "linear-gradient(135deg, rgba(0,137,201,0.08), rgba(89,210,243,0.05))", borderColor: "oklch(0.50 0.14 232)" } : {}}
                        >
                          <div className={`size-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0 shadow-md`}>
                            <Icon className="size-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-extrabold text-foreground">{c.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{c.desc}</div>
                          </div>
                          {active && <CheckCircle2 className="size-5 shrink-0" style={{ color: "oklch(0.50 0.14 232)" }} />}
                        </button>
                      );
                    })}
                  </div>

                  <StepNav step={step} setStep={setStep} />
                </StepCard>
              </motion.div>
            )}

            {/* STEP 4: Features */}
            {step === 4 && (
              <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <StepCard
                  title="Which features do you need?"
                  subtitle="Select all that apply. We'll include the right add-on equipment in your recommended bundle."
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    {FEATURE_OPTIONS.map((f) => {
                      const Icon = f.icon;
                      const active = cfg.features.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          id={`feature-${f.id}`}
                          onClick={() => toggleFeature(f.id)}
                          className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01] ${
                            active ? "border-transparent shadow-md" : "border-border bg-white hover:border-muted-foreground/30"
                          }`}
                          style={active ? { background: "linear-gradient(135deg, rgba(0,137,201,0.08), rgba(89,210,243,0.05))", borderColor: "oklch(0.50 0.14 232)" } : {}}
                        >
                          <div
                            className="size-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
                            style={active ? { background: "linear-gradient(135deg, #0089C9, #59D2F3)" } : { background: "oklch(0.96 0.02 220)" }}
                          >
                            <Icon className={`size-5 ${active ? "text-white" : "text-foreground/60"}`} />
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-foreground">{f.label}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</div>
                          </div>
                          <div className="ml-auto shrink-0">
                            <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? "border-transparent" : "border-border"}`}
                              style={active ? { background: "linear-gradient(135deg, #0089C9, #59D2F3)" } : {}}>
                              {active && <CheckCircle2 className="size-3 text-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 p-4 rounded-2xl bg-surface border border-border flex items-start gap-3">
                    <ShieldCheck className="size-5 shrink-0 mt-0.5" style={{ color: "oklch(0.50 0.14 232)" }} />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Not sure?</strong> No problem — you can skip optional features and add them later. Our advisors can also help you spec a complete system bundle.
                    </p>
                  </div>

                  <StepNav step={step} setStep={setStep} isLast />
                </StepCard>
              </motion.div>
            )}

            {/* STEP 5: Results */}
            {step === 5 && (
              <motion.div key="step5" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                {/* Summary ribbon */}
                <div
                  className="rounded-[2rem] p-6 text-white"
                  style={{ background: "linear-gradient(135deg, #001a3a 0%, #003a7a 100%)" }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Sizing Complete</span>
                      <h2 className="text-2xl font-black mt-1">Your Pool Profile</h2>
                    </div>
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/25 text-white/80 text-xs font-bold hover:bg-white/10 transition"
                    >
                      <RefreshCw className="size-3.5" /> Start Over
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Pool Type", value: POOL_TYPES.find((t) => t.value === cfg.type)?.label || cfg.type },
                      { label: "Volume", value: `${cfg.gallons.toLocaleString()} gal` },
                      { label: "Climate", value: CLIMATE_ZONES.find((c) => c.value === cfg.climate)?.label || cfg.climate },
                      { label: "Features", value: cfg.features.length ? `${cfg.features.length} selected` : "None" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl p-3 border border-white/15" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{item.label}</div>
                        <div className="font-extrabold text-white mt-0.5">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizing specs */}
                <div>
                  <h3 className="text-xl font-black tracking-tight mb-5 flex items-center gap-2">
                    <Sparkles className="size-5" style={{ color: "oklch(0.50 0.14 232)" }} />
                    Calculated Specifications
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Waves, label: "Pump Power", value: rec.hp, desc: "Variable speed recommended", gradient: "from-blue-600 to-cyan-500" },
                      { icon: Thermometer, label: "Heater Capacity", value: rec.heaterBtu, desc: `${cfg.climate} climate zone`, gradient: "from-orange-500 to-amber-400" },
                      { icon: Filter, label: "Filter Area", value: rec.filterArea, desc: "Cartridge filtration", gradient: "from-emerald-500 to-teal-400" },
                      { icon: Zap, label: "Annual Savings", value: `~$${rec.savingsPerYear}`, desc: "vs. single-speed pump", gradient: "from-violet-600 to-indigo-500" },
                    ].map((spec) => {
                      const Icon = spec.icon;
                      return (
                        <motion.div
                          key={spec.label}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className="bg-white rounded-2xl p-5 border border-border hover:shadow-[var(--shadow-soft)] transition-all"
                        >
                          <div className={`size-10 rounded-xl bg-gradient-to-br ${spec.gradient} flex items-center justify-center mb-3`}>
                            <Icon className="size-5 text-white" />
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{spec.label}</div>
                          <div className="text-xl font-black text-foreground mt-0.5">{spec.value}</div>
                          <div className="text-[10px] text-muted-foreground/80 mt-1">{spec.desc}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Matched Products */}
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                      <Package className="size-5" style={{ color: "oklch(0.50 0.14 232)" }} />
                      Recommended Equipment Bundle
                    </h3>
                    <Link
                      to="/shop/$category"
                      params={{ category: "all" }}
                      search={{ q: "" }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold transition hover:underline"
                      style={{ color: "oklch(0.50 0.14 232)" }}
                    >
                      Browse Full Catalog <ChevronRight className="size-3.5" />
                    </Link>
                  </div>

                  {isSearching ? (
                    <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                      <Loader2 className="size-6 animate-spin" style={{ color: "oklch(0.50 0.14 232)" }} />
                      <span className="text-sm font-semibold">Finding your best matches...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {searchResults.map((p, i) => {
                        const savings = (p.msrp || p.price + 50) - p.price;
                        const categoryLabels = ["Recommended Pump", "Recommended Heater", "Recommended Filter"];
                        return (
                          <motion.article
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: i * 0.08 }}
                            className="group bg-white rounded-3xl p-5 border border-border hover:shadow-[var(--shadow-float)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                          >
                            {/* Category badge */}
                            <div className="mb-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                                style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)" }}>
                                <Sparkles className="size-2.5" />
                                {categoryLabels[i] || "Recommended"}
                              </span>
                            </div>

                            <Link to="/products/$productId" params={{ productId: p.id }} className="block flex-1">
                              <div className="relative aspect-square rounded-2xl overflow-hidden grid place-items-center mb-4"
                                style={{ background: "linear-gradient(to bottom, oklch(0.97 0.01 240), oklch(0.92 0.04 220))" }}>
                                <img
                                  src={p.img}
                                  alt={p.name}
                                  loading="lazy"
                                  className="size-[75%] object-contain group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                                  onError={(e) => { if (!e.currentTarget.src.includes("commingsoon")) e.currentTarget.src = "/assets/commingsoon.png"; }}
                                />
                                <span className="absolute top-3 right-3 size-9 grid place-items-center rounded-full bg-white/80 backdrop-blur opacity-0 group-hover:opacity-100 transition shadow-md">
                                  <Eye className="size-4" />
                                </span>
                              </div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{p.brand}</span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                                  <Star className="size-3 fill-amber-400 text-amber-400" />
                                  {p.rating || "5.0"}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 capitalize">
                                {p.name}
                              </h4>
                            </Link>

                            <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                              <div>
                                <div className="text-lg font-black" style={{ color: "oklch(0.50 0.14 232)" }}>{formatUSD(p.price)}</div>
                              </div>
                              <button
                                onClick={() => add(p, 1)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-white text-xs font-bold hover:opacity-90 transition shadow-md"
                                style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)" }}
                              >
                                <ShoppingBag className="size-3.5" /> Add
                              </button>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>
                  ) : (
                    /* Empty state when DB has no products */
                    <div className="rounded-[2rem] border border-dashed border-border p-12 text-center space-y-4">
                      <Package className="size-12 mx-auto text-muted-foreground/40" />
                      <div>
                        <p className="font-bold text-foreground">No products in catalog yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Import your product catalog from the admin dashboard to see matching equipment here.</p>
                      </div>
                      <Link
                        to="/admin/products"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)" }}
                      >
                        Import Products <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* CTA Strip */}
                <div
                  className="rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
                  style={{ background: "linear-gradient(135deg, oklch(0.97 0.02 220), oklch(0.95 0.04 215))", border: "1px solid oklch(0.90 0.04 220)" }}
                >
                  <div>
                    <h3 className="font-extrabold text-lg text-foreground">Need expert advice?</h3>
                    <p className="text-sm text-muted-foreground mt-1">Our certified pool technicians can review your configuration and confirm exact specifications.</p>
                  </div>
                  <Link
                    to="/contact"
                    className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white text-sm font-bold shadow-lg hover:opacity-95 transition"
                    style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)" }}
                  >
                    Talk to an Advisor <ArrowRight className="size-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[2rem] border border-border p-8 shadow-[var(--shadow-soft)] space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function StepNav({
  step,
  setStep,
  isLast = false,
}: {
  step: number;
  setStep: (s: number) => void;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
      {step > 1 ? (
        <button
          onClick={() => setStep(step - 1)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border text-sm font-bold hover:bg-surface transition"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={() => setStep(step + 1)}
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-bold shadow-lg hover:opacity-95 transition hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, #0089C9, #59D2F3)", boxShadow: "0 8px 24px rgba(0,137,201,0.3)" }}
      >
        {isLast ? (
          <>
            See My Results <Sparkles className="size-4" />
          </>
        ) : (
          <>
            Continue <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </div>
  );
}
